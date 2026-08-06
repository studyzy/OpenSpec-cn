/**
 * `openspec-cn context` (slice 4.1): the working set a root's declarations
 * describe, as an agent brief (JSON), a human listing, or an editor
 * view (`--code-workspace`). Assembly is presentation over the Phase 3
 * relationship data; doctor is the health surface. The only write this
 * command can perform is the explicitly requested workspace file.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Command, Option } from 'commander';

import {
  resolveRootForCommand,
  type ResolvedOpenSpecRoot,
} from '../core/root-selection.js';
import { inspectRelationships } from '../core/relationship-health.js';
import {
  assembleWorkingSet,
  buildCodeWorkspaceJson,
  isAvailableMember,
  type WorkingSet,
  type WorkingSetMember,
} from '../core/working-set.js';
import { StoreError } from '../core/store/errors.js';
import { COMMAND_REGISTRY } from '../core/completions/command-registry.js';
import { COMMON_FLAGS } from '../core/completions/shared-flags.js';
import { emitFailure, printJson } from './shared-output.js';
import { gatherRelationshipData } from './shared-gather.js';

const FAILURE_PAYLOAD = { root: null, members: [] };

async function gatherWorkingSet(
  root: ResolvedOpenSpecRoot
): Promise<{ workingSet: WorkingSet; declaredReferenceCount: number }> {
  const data = await gatherRelationshipData(root);

  // Reuse the 3.6 composition for member classification; the
  // doctor-only wrong-turn detections and store facts are deliberately
  // absent — doctor is the health surface.
  const health = inspectRelationships({
    root,
    rootHealthy: data.rootInspection.healthy,
    rootStatus: data.rootInspection.diagnostics,
    referenceEntries: data.referenceEntries,
    registryUnreadable: data.registrySnapshot.unreadable,
  });

  return {
    workingSet: assembleWorkingSet({
      root,
      referenceEntries: data.referenceEntries,
      topLevelStatus: health.status,
    }),
    declaredReferenceCount: data.projectConfig?.references?.length ?? 0,
  };
}

function memberLine(member: WorkingSetMember): string {
  return `  ${member.id}  ${member.path}`;
}

function printHumanWorkingSet(workingSet: WorkingSet, declaredReferenceCount: number): void {
  const rootLabel = workingSet.root.store_id ?? path.basename(workingSet.root.path);
  console.log(`${rootLabel} 的工作上下文（${workingSet.root.path}）`);
  console.log('');
  console.log('OpenSpec 根目录');
  console.log(`  ${rootLabel}  ${workingSet.root.path}`);

  const availableStores = workingSet.members.filter(
    (member) => member.role === 'referenced_store' && isAvailableMember(member)
  );
  const unavailable = workingSet.members.filter((member) => !isAvailableMember(member));

  if (availableStores.length > 0) {
    console.log('');
    console.log('引用的 stores');
    for (const member of availableStores) {
      console.log(memberLine(member));
      if (member.fetch) {
        console.log(`  获取：${member.fetch}`);
      }
    }
  }

  if (workingSet.members.length === 0) {
    console.log('');
    // Self-references are silently omitted from the index; an
    // emptied-by-omission set must not claim nothing was declared.
    console.log(
      declaredReferenceCount > 0
        ? '声明的引用全部解析到此根目录；工作集仅为此根目录。'
        : '未声明引用；工作集仅为此根目录。'
    );
  }

  if (unavailable.length > 0 || workingSet.status.length > 0) {
    console.log('');
    console.log('此机器上不可用');
    for (const member of unavailable) {
      if (member.status.length === 0) {
        console.log(`  - ${member.id}`);
        continue;
      }
      for (const diagnostic of member.status) {
        console.log(`  - ${member.id}: ${diagnostic.message}`);
        if (diagnostic.fix) {
          console.log(`    修复：${diagnostic.fix}`);
        }
      }
    }
    for (const diagnostic of workingSet.status) {
      console.log(`  备注：${diagnostic.message}`);
      if (diagnostic.fix) {
        console.log(`  修复：${diagnostic.fix}`);
      }
    }
  }
}

function writeCodeWorkspace(
  workingSet: WorkingSet,
  outputPath: string,
  force: boolean
): void {
  const resolved = path.resolve(outputPath);
  if (fs.existsSync(resolved) && !force) {
    throw new StoreError(
      `拒绝覆盖 ${resolved}。`,
      'context_file_exists',
      {
        target: 'context.output',
        fix: `传入 --force 覆盖，或选择其他路径。`,
      }
    );
  }
  const parent = path.dirname(resolved);
  if (!fs.existsSync(parent)) {
    throw new StoreError(
      `输出目录不存在：${parent}。`,
      'context_output_dir_missing',
      { target: 'context.output', fix: '先创建目录，或选择其他路径。' }
    );
  }

  const rootName = workingSet.root.store_id ?? path.basename(workingSet.root.path);
  fs.writeFileSync(resolved, buildCodeWorkspaceJson(workingSet, rootName));

  const available = workingSet.members.filter(isAvailableMember).length;
  const skipped = workingSet.members
    .filter((member) => !isAvailableMember(member))
    .map((member) => member.id);
  const summary =
    skipped.length > 0
      ? `已写入 ${resolved}（${available + 1} 个文件夹；不可用：${skipped.join(', ')}）`
      : `已写入 ${resolved}（${available + 1} 个文件夹）`;
  // stderr keeps JSON stdout pure; for humans it reads inline.
  console.error(summary);
}

export function registerContextCommand(program: Command): void {
  const description =
    COMMAND_REGISTRY.find((entry) => entry.name === 'context')?.description ??
    '打印已解析 OpenSpec 根目录的工作上下文';

  program
    .command('context')
    .description(description)
    .option('--store <id>', COMMON_FLAGS.store.description)
    .addOption(
      new Option('--store-path <path>', 'Removed; register the store and use --store').hideHelp()
    )
    .option('--json', '以 JSON 格式输出代理简报')
    .option('--code-workspace <path>', '同时为此集合写入 VS Code 工作区文件')
    .option('--force', '覆盖已有的 --code-workspace 文件')
    .action(
      async (options: {
        store?: string;
        storePath?: string;
        json?: boolean;
        codeWorkspace?: string;
        force?: boolean;
      }) => {
        try {
          const root = await resolveRootForCommand(
            { store: options.store, storePath: options.storePath },
            { json: options.json, failurePayload: FAILURE_PAYLOAD, allowImplicitRoot: false }
          );
          if (!root) {
            return;
          }

          const { workingSet, declaredReferenceCount } = await gatherWorkingSet(root);

          if (options.json) {
            // The write runs FIRST: a write failure must leave stdout
            // holding exactly one JSON document (the failure payload).
            if (options.codeWorkspace) {
              writeCodeWorkspace(workingSet, options.codeWorkspace, options.force === true);
            }
            printJson(workingSet);
          } else {
            printHumanWorkingSet(workingSet, declaredReferenceCount);
            if (options.codeWorkspace) {
              writeCodeWorkspace(workingSet, options.codeWorkspace, options.force === true);
            }
          }
        } catch (error) {
          emitFailure(options.json, FAILURE_PAYLOAD, error, 'context_failed');
        }
      }
    );
}
