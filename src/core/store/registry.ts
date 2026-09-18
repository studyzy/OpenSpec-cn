import * as fs from 'node:fs/promises';

import {
  getStoreMetadataPath,
  getStoreMetadataDir,
  listStoreRegistryEntries,
  readStoreRegistryState,
  readOptionalStoreMetadataState,
  resolveGitStoreBackendConfig,
  updateStoreRegistryState,
  validateStoreId,
  writeStoreMetadataState,
  type StoreBackendConfig,
  type StoreGitBackendConfig,
  type StorePathOptions,
  type StoreRegistryEntry,
  type StoreRegistryState,
} from './foundation.js';
import { StoreError } from './errors.js';
import * as path from 'node:path';
import { FileSystemUtils } from '../../utils/file-system.js';

export interface RegisterStoreInput extends StorePathOptions {
  id: string;
  localPath: string;
  remote?: string;
  branch?: string;
  cwd?: string;
}

export interface ResolveRegisteredStoreInput extends StorePathOptions {
  id: string;
}

export interface GetRegisteredStoreInput extends ResolveRegisteredStoreInput {
  expectedBackend?: StoreGitBackendConfig;
}

export interface UnregisterStoreInput extends StorePathOptions {
  id: string;
  expectedBackend?: StoreGitBackendConfig;
  /** Runs under the registry lock, with the registrations that will remain. */
  beforeCommit?: (
    entry: RegisteredStoreEntry,
    remaining: RegisteredStoreEntry[]
  ) => Promise<void>;
}

export type ListRegisteredStoresOptions = StorePathOptions;

export interface RegisteredStoreEntry extends StoreRegistryEntry {
  storeRoot: string;
}

export interface ResolvedStore {
  id: string;
  storeRoot: string;
  backend: StoreGitBackendConfig;
}

export interface StoreRegistrationCommit extends ResolvedStore {
  metadataCreated: boolean;
  registryUpdated: boolean;
  alreadyRegistered: boolean;
}

export interface CommitStoreRegistrationInput extends StorePathOptions {
  id: string;
  backend: StoreGitBackendConfig;
  writeMetadataIfMissing: boolean;
}

export function getStoreRootForBackend(backend: StoreBackendConfig): string {
  switch (backend.type) {
    case 'git':
      return backend.local_path;
  }
}

function normalizePathForComparison(targetPath: string): string {
  try {
    return FileSystemUtils.canonicalizeExistingPath(targetPath);
  } catch {
    // Nonexistent (e.g. stale) paths still deserve a resolved compare;
    // aligns with the operations.ts sibling fallback.
    return path.resolve(targetPath);
  }
}

export function assertNoRegisteredStoreConflict(
  registry: StoreRegistryState | null,
  id: string,
  backend: StoreGitBackendConfig
): void {
  const nextPath = normalizePathForComparison(getStoreRootForBackend(backend));

  for (const entry of listStoreRegistryEntries(registry ?? { version: 1, stores: {} })) {
    const entryPath = normalizePathForComparison(getStoreRootForBackend(entry.backend));

    if (entry.id === id && entryPath === nextPath) {
      continue;
    }

    if (entry.id === id) {
      throw new StoreError(
        `Store '${id}' 已在 ${getStoreRootForBackend(entry.backend)} 注册。此机器上每个 store id 仅支持一个检出。`,
        'store_id_conflict',
        {
          target: 'store.id',
          fix: `使用现有注册，或先运行 openspec-cn store unregister ${id} 将此 id 切换到其他检出。`,
        }
      );
    }

    if (entryPath === nextPath) {
      throw new StoreError(
        `Store 路径已注册为 '${entry.id}'。`,
        'store_path_conflict',
        {
          target: 'store.root',
          fix: `使用现有的 '${entry.id}' 注册或选择其他路径。`,
        }
      );
    }
  }
}

function withRegisteredStore(
  registry: StoreRegistryState | null,
  id: string,
  backend: StoreGitBackendConfig
): StoreRegistryState {
  assertNoRegisteredStoreConflict(registry, id, backend);

  const stores = {
    ...(registry?.stores ?? {}),
    [id]: {
      backend,
    },
  };

  return {
    version: 1,
    stores: Object.fromEntries(
      Object.entries(stores).sort(([leftId], [rightId]) => leftId.localeCompare(rightId))
    ),
  };
}

function getRegisteredStoreOrThrow(
  registry: StoreRegistryState | null,
  id: string
): StoreRegistryEntry {
  const entry = registry?.stores[id];
  if (!entry) {
    throw new StoreError(`未知的 store '${id}'`, 'store_not_found', {
      target: 'store.id',
      fix: '运行 openspec-cn store list 查看已注册的 store。',
    });
  }

  return {
    id,
    backend: entry.backend,
  };
}

/** Same checkout: type, canonical path, and branch — remote excluded. */
function sameCheckout(
  actual: StoreGitBackendConfig,
  expected: StoreGitBackendConfig
): boolean {
  return (
    actual.type === expected.type &&
    normalizePathForComparison(actual.local_path) ===
      normalizePathForComparison(expected.local_path) &&
    actual.branch === expected.branch
  );
}

function storeBackendsMatch(
  actual: StoreGitBackendConfig,
  expected: StoreGitBackendConfig
): boolean {
  return sameCheckout(actual, expected) && actual.remote === expected.remote;
}

function assertExpectedRegisteredBackend(
  id: string,
  actual: StoreGitBackendConfig,
  expected: StoreGitBackendConfig | undefined
): void {
  if (!expected || storeBackendsMatch(actual, expected)) return;

  throw new StoreError(
      `Store '${id}' 在清理完成前已变更。`,
      'store_registry_changed',
      {
        target: 'store.registry',
        fix: '检查当前 store 注册后重试清理命令。',
    }
  );
}

function withoutRegisteredStore(
  registry: StoreRegistryState | null,
  id: string,
  expectedBackend?: StoreGitBackendConfig
): { next: StoreRegistryState; removed: StoreRegistryEntry } {
  const removed = getRegisteredStoreOrThrow(registry, id);
  assertExpectedRegisteredBackend(id, removed.backend, expectedBackend);
  const stores = { ...(registry?.stores ?? {}) };
  delete stores[id];

  return {
    removed,
    next: {
      version: 1,
      stores: Object.fromEntries(
        Object.entries(stores).sort(([leftId], [rightId]) => leftId.localeCompare(rightId))
      ),
    },
  };
}

async function ensureStoreMetadata(
  storeRoot: string,
  id: string,
  options: { writeIfMissing: boolean }
): Promise<boolean> {
  const metadata = await readOptionalStoreMetadataState(storeRoot);

  if (!metadata) {
    if (!options.writeIfMissing) {
      throw new StoreError(
        `已注册的 store '${id}' 缺少元数据，位于 ${getStoreMetadataPath(storeRoot)}`,
        'store_metadata_missing',
        {
          target: 'store.metadata',
          fix: `创建 ${getStoreMetadataPath(storeRoot)} 或重新运行 "openspec-cn store register <path>"。`,
        }
      );
    }

    await writeStoreMetadataState(storeRoot, {
      version: 1,
      id,
    });
    return true;
  }

  if (metadata.id !== id) {
    throw new StoreError(
      `Store 元数据 id '${metadata.id}' 与注册 id '${id}' 不匹配`,
      'store_metadata_id_mismatch',
      {
        target: 'store.metadata',
        fix: '修复本地注册表或 store 元数据，使 id 匹配。',
      }
    );
  }

  return false;
}

export async function commitStoreRegistration(
  input: CommitStoreRegistrationInput
): Promise<StoreRegistrationCommit> {
  const id = validateStoreId(input.id);
  const backend = input.backend;
  const storeRoot = getStoreRootForBackend(backend);

  let metadataCreated = false;
  let isRerun = false;
  let registryUpdated = false;

  try {
    metadataCreated = await ensureStoreMetadata(storeRoot, id, {
      writeIfMissing: input.writeMetadataIfMissing,
    });
    const registry = await readStoreRegistryState({
      globalDataDir: input.globalDataDir,
    });
    const existing = registry?.stores[id];
    const existingBackend = existing?.backend as StoreGitBackendConfig | undefined;
    // Same checkout = a rerun for an already-registered store (the 1.3
    // reporting contract), whether or not the observed remote changed;
    // only a remote change needs the registry write (the refresh).
    isRerun = existingBackend !== undefined && sameCheckout(existingBackend, backend);
    const upToDate =
      isRerun && existingBackend !== undefined && storeBackendsMatch(existingBackend, backend);

    if (!upToDate) {
      await updateStoreRegistryState(
        (registry) => withRegisteredStore(registry, id, backend),
        { globalDataDir: input.globalDataDir }
      );
      registryUpdated = true;
    }
  } catch (error) {
    if (metadataCreated) {
      // A concurrent registration may have read our metadata as
      // pre-existing and committed against it - never delete metadata a
      // committed registry entry depends on.
      const current = await readStoreRegistryState({
        globalDataDir: input.globalDataDir,
      }).catch(() => null);
      if (!current?.stores[id]) {
        await fs.rm(getStoreMetadataPath(storeRoot), { force: true });
        await fs.rmdir(getStoreMetadataDir(storeRoot)).catch(() => undefined);
      }
    }

    throw error;
  }

  return {
    id,
    storeRoot,
    backend,
    metadataCreated,
    registryUpdated,
    alreadyRegistered: isRerun,
  };
}

export async function registerStore(
  input: RegisterStoreInput
): Promise<ResolvedStore> {
  const id = validateStoreId(input.id);
  const backend = await resolveGitStoreBackendConfig(
    {
      localPath: input.localPath,
      ...(input.remote !== undefined ? { remote: input.remote } : {}),
      ...(input.branch !== undefined ? { branch: input.branch } : {}),
    },
    input.cwd
  );
  const storeRoot = getStoreRootForBackend(backend);

  const committed = await commitStoreRegistration({
    id,
    backend,
    writeMetadataIfMissing: true,
    ...(input.globalDataDir ? { globalDataDir: input.globalDataDir } : {}),
  });
  return {
    id: committed.id,
    storeRoot: committed.storeRoot,
    backend: committed.backend,
  };
}

export interface RegistrySnapshot {
  /** null = the registry is unreadable; [] = empty or absent. */
  entries: StoreRegistryEntry[] | null;
  unreadable: boolean;
}

/**
 * One registry read serving every consumer in a command.
 */
export async function readRegistrySnapshot(
  options: { globalDataDir?: string } = {}
): Promise<RegistrySnapshot> {
  try {
    const registry = await readStoreRegistryState(options);
    return {
      entries: registry ? listStoreRegistryEntries(registry) : [],
      unreadable: false,
    };
  } catch {
    return { entries: null, unreadable: true };
  }
}

export async function listRegisteredStores(
  options: ListRegisteredStoresOptions = {}
): Promise<RegisteredStoreEntry[]> {
  const registry = await readStoreRegistryState(options);

  if (!registry) {
    return [];
  }

  return listStoreRegistryEntries(registry).map((entry) => ({
    ...entry,
    storeRoot: getStoreRootForBackend(entry.backend),
  }));
}

export async function getRegisteredStore(
  input: GetRegisteredStoreInput
): Promise<RegisteredStoreEntry> {
  const id = validateStoreId(input.id);
  const registry = await readStoreRegistryState({
    globalDataDir: input.globalDataDir,
  });
  const entry = getRegisteredStoreOrThrow(registry, id);
  assertExpectedRegisteredBackend(id, entry.backend, input.expectedBackend);

  return {
    ...entry,
    storeRoot: getStoreRootForBackend(entry.backend),
  };
}

export async function unregisterStoreRegistration(
  input: UnregisterStoreInput
): Promise<RegisteredStoreEntry> {
  const id = validateStoreId(input.id);
  let removed: StoreRegistryEntry | undefined;

  await updateStoreRegistryState(
    async (registry) => {
      const result = withoutRegisteredStore(registry, id, input.expectedBackend);
      const removedEntry = {
        ...result.removed,
        storeRoot: getStoreRootForBackend(result.removed.backend),
      };
      const remaining = listStoreRegistryEntries(result.next).map((entry) => ({
        ...entry,
        storeRoot: getStoreRootForBackend(entry.backend),
      }));
      await input.beforeCommit?.(removedEntry, remaining);
      removed = result.removed;
      return result.next;
    },
    { globalDataDir: input.globalDataDir }
  );

  if (!removed) {
    throw new StoreError(`未知的 store '${id}'`, 'store_not_found', {
      target: 'store.id',
      fix: '运行 openspec-cn store list 查看已注册的 store。',
    });
  }

  return {
    ...removed,
    storeRoot: getStoreRootForBackend(removed.backend),
  };
}

export async function resolveRegisteredStore(
  input: ResolveRegisteredStoreInput
): Promise<ResolvedStore> {
  const id = validateStoreId(input.id);
  const registry = await readStoreRegistryState({
    globalDataDir: input.globalDataDir,
  });

  if (!registry) {
    throw new StoreError('未找到 store 注册表', 'no_store_registry', {
      target: 'store.id',
      fix: '使用 openspec-cn store register <path> 注册 store，然后使用 --store <id> 选择。',
    });
  }

  const entry = getRegisteredStoreOrThrow(registry, id);
  const backend = entry.backend;
  const storeRoot = getStoreRootForBackend(backend);
  await ensureStoreMetadata(storeRoot, id, { writeIfMissing: false });

  return {
    id,
    storeRoot,
    backend,
  };
}
