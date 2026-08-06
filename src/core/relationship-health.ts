/**
 * Relationship health composition (slice 3.6).
 *
 * One read-only answer to "are the roots this work relates to available
 * on this machine?" — pure composition over inputs the doctor command
 * gathers. The lock's four categories stay separated: root health,
 * store metadata health, and reference health. Nothing here (or
 * downstream) clones, syncs, or repairs.
 */
import { makeStoreDiagnostic, type StoreDiagnostic } from './store/errors.js';
import { sanitizeInline, type ReferenceIndexEntry } from './references.js';
import { storePointerProblem } from './project-config.js';
import { toRootOutput, type ResolvedOpenSpecRoot } from './root-selection.js';

export interface RelationshipHealth {
  root: {
    path: string;
    source: ResolvedOpenSpecRoot['source'];
    store_id?: string;
    healthy: boolean;
    status: StoreDiagnostic[];
  };
  store: {
    id: string;
    metadata: { present: boolean; valid: boolean; remote?: string };
    origin_url?: string;
    drift?: { ahead: number; behind: number };
    status: StoreDiagnostic[];
  } | null;
  references: ReferenceIndexEntry[];
  status: StoreDiagnostic[];
}

export interface InspectRelationshipsInput {
  root: ResolvedOpenSpecRoot;
  rootHealthy: boolean;
  rootStatus?: StoreDiagnostic[];
  /** Store facts for store-backed roots (explicit or declared). */
  storeFacts?: {
    id: string;
    metadataPresent: boolean;
    metadataValid: boolean;
    canonicalRemote?: string;
    originUrl?: string;
    drift?: { ahead: number; behind: number };
  };
  referenceEntries: ReferenceIndexEntry[];
  registryUnreadable: boolean;
  /** A real root whose config also declares a store: pointer (3.2). */
  bothShapesPointer?: { value: string; filePath: string };
  /** A real root whose store: pointer value is malformed (3.2). */
  malformedPointer?: { filePath: string; reason: 'unparseable' | 'non_string' };
  /** Reference declarations in a pointer directory's own config are inert. */
  inertPointerDeclarations?: { filePath: string; fields: string[] };
}

function warning(code: string, message: string, fix: string): StoreDiagnostic {
  return makeStoreDiagnostic('warning', code, message, { target: 'relationships', fix });
}

export function inspectRelationships(input: InspectRelationshipsInput): RelationshipHealth {
  const status: StoreDiagnostic[] = [];

  if (input.registryUnreadable) {
    status.push(
      warning(
        'relationship_registry_unreadable',
        'Store 注册表不可读；无法检查引用健康状况。',
        '运行: openspec-cn store doctor'
      )
    );
  }

  if (input.bothShapesPointer) {
    status.push(
      warning(
        'root_pointer_ignored',
        `${input.bothShapesPointer.filePath} 声明了 store '${input.bothShapesPointer.value}'，但此目录是真正的 OpenSpec 根目录；声明已忽略。`,
        `从 ${input.bothShapesPointer.filePath} 移除 store: 行，或将规划文件移动到 store 中。`
      )
    );
  }

  if (input.malformedPointer) {
    status.push(
      warning(
        'root_pointer_invalid',
        `${input.malformedPointer.filePath} 声明了一个无法使用的 store: 指针（${storePointerProblem(input.malformedPointer.reason)}）。`,
        `请修复或移除 ${input.malformedPointer.filePath} 中的 store: 行。`
      )
    );
  }

  if (input.inertPointerDeclarations && input.inertPointerDeclarations.fields.length > 0) {
    status.push(
      warning(
        'pointer_declarations_inert',
        `${input.inertPointerDeclarations.filePath} 声明了 ${input.inertPointerDeclarations.fields.join(' 和 ')}，但各命令读取的是解析出的 store 的配置——这些声明不会生效。`,
        `请将 ${input.inertPointerDeclarations.fields.join('/')} 声明移到该 store 的 openspec/config.yaml 中。`
      )
    );
  }

  // Store section: metadata facts + the divergence info note.
  let store: RelationshipHealth['store'] = null;
  if (input.storeFacts) {
    const storeStatus: StoreDiagnostic[] = [];
    if (
      input.storeFacts.canonicalRemote &&
      input.storeFacts.originUrl &&
      input.storeFacts.canonicalRemote !== input.storeFacts.originUrl
    ) {
      storeStatus.push(
        makeStoreDiagnostic(
          'info',
          'store_remote_divergence',
          `store.yaml 中的 remote（${sanitizeInline(input.storeFacts.canonicalRemote, 200)}）与检出目录的 origin（${sanitizeInline(input.storeFacts.originUrl, 200)}）不一致。`,
          { target: 'store.metadata' }
        )
      );
    }
    // Checkout behind its upstream tracking ref: a read-only staleness
    // signal, not a version pin — OpenSpec never syncs stores, so this
    // compares against the local upstream ref, not the live remote.
    // Behind means teammates on newer commits may resolve different specs.
    // Ahead-only is normal (OpenSpec never pushes stores), so it stays quiet.
    const drift = input.storeFacts.drift;
    if (drift && drift.behind > 0) {
      const behindCommits = `${drift.behind} 个提交`;
      storeStatus.push(
        makeStoreDiagnostic(
          'info',
          'store_checkout_drift',
          drift.ahead > 0
            ? `This store checkout has diverged from its upstream tracking branch (${drift.behind} behind, ${drift.ahead} ahead); teammates on newer commits may resolve different specs.`
            : `This store checkout is ${behindCommits} behind its upstream tracking branch; teammates on newer commits may resolve different specs.`,
          { target: 'store.git' }
        )
      );
    }
    store = {
      id: input.storeFacts.id,
      metadata: {
        present: input.storeFacts.metadataPresent,
        valid: input.storeFacts.metadataValid,
        ...(input.storeFacts.canonicalRemote
          ? { remote: input.storeFacts.canonicalRemote }
          : {}),
      },
      ...(input.storeFacts.originUrl ? { origin_url: input.storeFacts.originUrl } : {}),
      ...(drift ? { drift } : {}),
      status: storeStatus,
    };
  }

  return {
    root: {
      ...toRootOutput(input.root),
      healthy: input.rootHealthy,
      status: input.rootStatus ?? [],
    },
    store,
    references: input.referenceEntries,
    status,
  };
}
