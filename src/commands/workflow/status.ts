/**
 * Status Command
 *
 * Displays artifact completion status for a change.
 */

import ora from 'ora';
import chalk from 'chalk';
import { getChangeDir } from '../../core/planning-home.js';
import {
  resolveRootForCommand,
  toPlanningHome,
  toRootOutput,
  withStoreFlag,
  isStoreSelectedRoot,
} from '../../core/root-selection.js';
import {
  loadChangeContext,
  formatChangeStatus,
  type ChangeStatus,
} from '../../core/artifact-graph/index.js';
import {
  validateChangeExists,
  validateSchemaExists,
  getAvailableChanges,
  getStatusIndicator,
  getStatusColor,
} from './shared.js';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface StatusOptions {
  change?: string;
  schema?: string;
  store?: string;
  storePath?: string;
  json?: boolean;
}

// -----------------------------------------------------------------------------
// Command Implementation
// -----------------------------------------------------------------------------

export async function statusCommand(options: StatusOptions): Promise<void> {
  // The root resolves (and the store banner prints) before the spinner starts
  // so the two do not fight over stderr.
  const root = await resolveRootForCommand(options, { json: options.json });
  if (!root) {
    return;
  }

  const spinner = options.json ? undefined : ora('正在加载变更状态...').start();

  try {
    const planningHome = toPlanningHome(root);
    const projectRoot = root.path;
    const rootOutput = toRootOutput(root);
    const newChangeHint = withStoreFlag(root, 'openspec-cn new change <name>');

    // Handle no-changes case gracefully — status is informational,
    // so "no changes" is a valid state, not an error.
    if (!options.change) {
      const available = await getAvailableChanges(projectRoot, root.changesDir);
      if (available.length === 0) {
        spinner?.stop();
        if (options.json) {
          console.log(
            JSON.stringify(
              { changes: [], message: '没有活跃的变更。', root: rootOutput },
              null,
              2
            )
          );
          return;
        }
        console.log(`没有活跃的变更。使用以下命令创建：${newChangeHint}`);
        return;
      }
      // Changes exist but --change not provided
      spinner?.stop();
      throw new Error(
        `缺少必需选项 --change。可用的变更：\n  ${available.join('\n  ')}`
      );
    }

    const changeName = await validateChangeExists(
      options.change,
      projectRoot,
      root.changesDir,
      { newChangeHint }
    );

    // Validate schema if explicitly provided
    if (options.schema) {
      validateSchemaExists(options.schema, projectRoot);
    }

    // loadChangeContext will auto-detect schema from metadata if not provided
    const context = loadChangeContext(projectRoot, changeName, options.schema, {
      changeDir: getChangeDir(planningHome, changeName),
      planningHome,
    });
    const status = formatChangeStatus(
      context,
      isStoreSelectedRoot(root) ? { storeId: root.storeId } : {}
    );

    spinner?.stop();

    if (options.json) {
      console.log(JSON.stringify({ ...status, root: rootOutput }, null, 2));
      return;
    }

    printStatusText(status);
  } catch (error) {
    spinner?.stop();
    throw error;
  }
}

export function printStatusText(status: ChangeStatus): void {
  const doneCount = status.artifacts.filter((a) => a.status === 'done').length;
  const skippedCount = status.artifacts.filter((a) => a.status === 'skipped').length;
  const total = status.artifacts.length - skippedCount;

  console.log(`变更：${status.changeName}`);
  console.log(`Schema：${status.schemaName}`);
  if (status.changeRoot) {
    console.log(`变更根目录：${status.changeRoot}`);
  }
  const skippedSuffix = skippedCount > 0 ? ` (${skippedCount} 已跳过)` : '';
  console.log(`进度：${doneCount}/${total} 个制品已完成${skippedSuffix}`);
  console.log();

  for (const artifact of status.artifacts) {
    const indicator = getStatusIndicator(artifact.status);
    const color = getStatusColor(artifact.status);
    let line = `${indicator} ${artifact.id}`;

    if (artifact.status === 'skipped') {
      line += color(' (已跳过：变更声明了 skip_specs)');
    }

    if (artifact.status === 'blocked' && artifact.missingDeps && artifact.missingDeps.length > 0) {
      line += color(`（被阻塞：${artifact.missingDeps.join(', ')}）`);
    }

    console.log(line);
  }

  if (status.isPlanningComplete) {
    console.log();
    console.log(chalk.green('所有规划制品已完成！'));
  }
}
