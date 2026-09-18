import { Command } from 'commander';
import type { ChildProcess, spawn as nodeSpawn } from 'node:child_process';
import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import * as path from 'node:path';
import {
  getGlobalConfigPath,
  getGlobalConfig,
  isConfigRootObject,
  isGlobalConfigUnreadable,
  saveGlobalConfig,
  GlobalConfig,
} from '../core/global-config.js';
import type { Profile, Delivery } from '../core/global-config.js';
import {
  getNestedValue,
  setNestedValue,
  deleteNestedValue,
  coerceValue,
  formatValueYaml,
  validateConfigKeyPath,
  hasUnsafeKeySegment,
  validateConfig,
  DEFAULT_CONFIG,
} from '../core/config-schema.js';
import { CORE_WORKFLOWS, ALL_WORKFLOWS, getProfileWorkflows } from '../core/profiles.js';
import { OPENSPEC_DIR_NAME } from '../core/config.js';
import { hasProjectConfigDrift } from '../core/profile-sync-drift.js';
import { UpdateCommand } from '../core/update.js';
import { asErrorMessage, isPromptCancellationError } from './shared-output.js';

type EditorOutcome =
  | { code: number | null; signal: NodeJS.Signals | null }
  | { error: Error };

// cross-spawn finds `.cmd` shims such as `code.cmd` on Windows and escapes each
// argument for cmd.exe; elsewhere it is plain spawn. Loaded lazily so other
// commands skip its module graph.
let cachedSpawn: typeof nodeSpawn | undefined;
function loadSpawn(): typeof nodeSpawn {
  if (cachedSpawn === undefined) {
    cachedSpawn = createRequire(import.meta.url)('cross-spawn') as typeof nodeSpawn;
  }
  return cachedSpawn;
}

/**
 * Splits an EDITOR or VISUAL value into a program and its arguments without
 * running a shell, so `;`, `|`, `$VAR`, `~` and backticks are plain characters.
 * Double quotes group words. On POSIX, single quotes group words too and a
 * backslash escapes the next character (inside double quotes only `"` and `\`).
 * On Windows a backslash is a path separator and a single quote is a plain
 * character. Returns null when a quote is left open.
 */
export function splitEditorCommand(value: string, platform: NodeJS.Platform = process.platform): string[] | null {
  const posix = platform !== 'win32';
  const words: string[] = [];
  let word = '';
  let inWord = false;
  let quote: '"' | "'" | null = null;

  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (quote === "'") {
      if (ch === "'") quote = null;
      else word += ch;
      continue;
    }
    if (posix && ch === '\\' && i + 1 < value.length) {
      const next = value[i + 1];
      if (quote === '"' && next !== '"' && next !== '\\') {
        word += ch;
      } else {
        word += next;
        i++;
      }
      inWord = true;
      continue;
    }
    if (quote === '"') {
      if (ch === '"') quote = null;
      else word += ch;
      continue;
    }
    if (ch === '"' || (posix && ch === "'")) {
      quote = ch;
      inWord = true;
      continue;
    }
    if (/\s/.test(ch)) {
      if (inWord) words.push(word);
      word = '';
      inWord = false;
      continue;
    }
    word += ch;
    inWord = true;
  }

  if (quote) return null;
  if (inWord) words.push(word);
  return words;
}

/**
 * Starts the user's editor on `filePath`, never through a shell.
 *
 * EDITOR and VISUAL hold a command line, not a program name: `code --wait`
 * and `"/path with spaces/subl" -w` are both ordinary values, so the value is
 * split into words and the file path is appended as its own argument. A value
 * that is itself the absolute path of an existing file is run as-is, so an
 * unquoted editor path with spaces keeps working.
 */
function spawnEditor(editor: string, filePath: string): ChildProcess {
  const words = path.isAbsolute(editor) && fs.existsSync(editor) ? [editor] : splitEditorCommand(editor);
  if (words === null) {
    throw new Error('the value has an unterminated quote');
  }
  if (words.length === 0) {
    throw new Error('the value is blank');
  }
  const [program, ...args] = words;
  return loadSpawn()(program, [...args, filePath], { stdio: 'inherit', shell: false });
}

/** Runs the editor on `filePath` and resolves once it has closed or failed to start. */
function runEditor(editor: string, filePath: string): Promise<EditorOutcome> {
  return new Promise((resolve) => {
    try {
      const child = spawnEditor(editor, filePath);
      child.once('error', (error) => resolve({ error }));
      child.once('close', (code, signal) => resolve({ code, signal }));
    } catch (error) {
      resolve({ error: error instanceof Error ? error : new Error(String(error)) });
    }
  });
}

function reportEditorFailure(editor: string, outcome: EditorOutcome): void {
  if ('error' in outcome) {
    console.error(`错误：无法启动编辑器 "${editor}"：${outcome.error.message}`);
  } else if (outcome.signal) {
    console.error(`错误：编辑器 "${editor}" 被信号 ${outcome.signal} 终止`);
  } else {
    console.error(`错误：编辑器 "${editor}" 退出，代码为 ${outcome.code}`);
  }
  // 只有程序不存在时才给出这条提示：EACCES 或 EPERM 意味着它存在。
  if ('error' in outcome && (outcome.error as NodeJS.ErrnoException).code === 'ENOENT') {
    console.error('请将 EDITOR 或 VISUAL 设置为已安装的编辑器命令，例如：export EDITOR="code --wait"');
  }
}

type ProfileAction = 'both' | 'delivery' | 'workflows' | 'keep';

/**
 * A config file that exists but cannot be parsed is still the user's file:
 * getGlobalConfig() reads it as defaults, and saving those back would erase
 * every setting in it. Reports the fix instead, and returns true when it did.
 */
function refuseUnreadableConfig(): boolean {
  if (!isGlobalConfigUnreadable()) {
    return false;
  }
  console.error(`错误：${getGlobalConfigPath()} 无法解析，因此保持原样未修改。`);
  console.error('请使用 "openspec-cn config edit" 修复，或使用 "openspec-cn config reset --all" 重置。');
  process.exitCode = 1;
  return true;
}

interface ProfileState {
  profile: Profile;
  delivery: Delivery;
  workflows: string[];
}

interface ProfileStateDiff {
  hasChanges: boolean;
  lines: string[];
}

interface WorkflowPromptMeta {
  name: string;
  description: string;
}

export const WORKFLOW_PROMPT_META: Record<string, WorkflowPromptMeta> = {
  propose: {
    name: '提议变更',
    description: '根据请求创建提议、设计和任务',
  },
  explore: {
    name: '探索想法',
    description: '在实现前调查问题',
  },
  new: {
    name: '新建变更',
    description: '快速创建新变更脚手架',
  },
  continue: {
    name: '继续变更',
    description: '恢复对现有变更的工作',
  },
  apply: {
    name: '应用任务',
    description: '实现当前变更中的任务',
  },
  update: {
    name: 'Update change',
    description: 'Revise the planning artifacts of an existing change',
  },
  ff: {
    name: '快速前进',
    description: '运行更快的实现工作流',
  },
  sync: {
    name: '同步规格',
    description: '将变更制品与规格同步',
  },
  archive: {
    name: '归档变更',
    description: '最终确定并归档已完成的变更',
  },
  'bulk-archive': {
    name: '批量归档',
    description: '一起归档多个已完成的变更',
  },
  verify: {
    name: '验证变更',
    description: '针对变更运行验证检查',
  },
  onboard: {
    name: '入门指南',
    description: 'OpenSpec 入门引导流程',
  },
};


/**
 * Resolve the effective current profile state from global config defaults.
 */
export function resolveCurrentProfileState(config: GlobalConfig): ProfileState {
  const profile = config.profile || 'core';
  const delivery = config.delivery || 'both';
  const workflows = [
    ...getProfileWorkflows(profile, config.workflows ? [...config.workflows] : undefined),
  ];
  return { profile, delivery, workflows };
}

/**
 * Derive profile type from selected workflows.
 */
export function deriveProfileFromWorkflowSelection(selectedWorkflows: string[]): Profile {
  const isCoreMatch =
    selectedWorkflows.length === CORE_WORKFLOWS.length &&
    CORE_WORKFLOWS.every((w) => selectedWorkflows.includes(w));
  return isCoreMatch ? 'core' : 'custom';
}

/**
 * Format a compact workflow summary for the profile header.
 */
export function formatWorkflowSummary(workflows: readonly string[], profile: Profile): string {
  return `${workflows.length} 个已选择（${profile}）`;
}

function stableWorkflowOrder(workflows: readonly string[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const workflow of ALL_WORKFLOWS) {
    if (workflows.includes(workflow) && !seen.has(workflow)) {
      ordered.push(workflow);
      seen.add(workflow);
    }
  }

  const extras = workflows.filter((w) => !ALL_WORKFLOWS.includes(w as (typeof ALL_WORKFLOWS)[number]));
  extras.sort();
  for (const extra of extras) {
    if (!seen.has(extra)) {
      ordered.push(extra);
      seen.add(extra);
    }
  }

  return ordered;
}

/**
 * Build a user-facing diff summary between two profile states.
 */
export function diffProfileState(before: ProfileState, after: ProfileState): ProfileStateDiff {
  const lines: string[] = [];

  if (before.delivery !== after.delivery) {
    lines.push(`delivery: ${before.delivery} -> ${after.delivery}`);
  }

  if (before.profile !== after.profile) {
    lines.push(`profile: ${before.profile} -> ${after.profile}`);
  }

  const beforeOrdered = stableWorkflowOrder(before.workflows);
  const afterOrdered = stableWorkflowOrder(after.workflows);
  const beforeSet = new Set(beforeOrdered);
  const afterSet = new Set(afterOrdered);

  const added = afterOrdered.filter((w) => !beforeSet.has(w));
  const removed = beforeOrdered.filter((w) => !afterSet.has(w));

  if (added.length > 0 || removed.length > 0) {
    const tokens: string[] = [];
    if (added.length > 0) {
      tokens.push(`新增 ${added.join(', ')}`);
    }
    if (removed.length > 0) {
      tokens.push(`移除 ${removed.join(', ')}`);
    }
    lines.push(`workflows: ${tokens.join('；')}`);
  }

  return {
    hasChanges: lines.length > 0,
    lines,
  };
}

function maybeWarnProjectConfigDrift(
  projectDir: string,
  state: ProfileState,
  colorize: (message: string) => string
): void {
  const openspecDir = path.join(projectDir, OPENSPEC_DIR_NAME);
  if (!fs.existsSync(openspecDir)) {
    return;
  }
  if (!hasProjectConfigDrift(projectDir, state.workflows, state.delivery)) {
    return;
  }
  console.log(colorize('警告：全局配置未应用于此项目。请运行 `openspec-cn update` 来同步。'));
}

function printConfigProfileApplyGuidance(): void {
  console.log('配置已更新。请在您的项目中运行 `openspec-cn update` 来应用。');
}

/**
 * Register the config command and all its subcommands.
 *
 * @param program - The Commander program instance
 */
export function registerConfigCommand(program: Command): void {
  const configCmd = program
    .command('config')
    .description('查看并修改全局 OpenSpec 配置')
    .option('--scope <scope>', '配置范围（目前仅支持 "global"）')
    .hook('preAction', (thisCommand) => {
      const opts = thisCommand.opts();
      if (opts.scope && opts.scope !== 'global') {
        console.error('错误：项目级配置尚未实现');
        process.exit(1);
      }
    });

  // config path
  configCmd
    .command('path')
    .description('显示配置文件位置')
    .action(() => {
      console.log(getGlobalConfigPath());
    });

  // config list
  configCmd
    .command('list')
    .description('显示当前所有设置')
    .option('--json', '以JSON格式输出')
    .action((options: { json?: boolean }) => {
      const config = getGlobalConfig();

      if (options.json) {
        console.log(JSON.stringify(config, null, 2));
      } else {
        // Read raw config to determine which values are explicit vs defaults
        const configPath = getGlobalConfigPath();
        let rawConfig: Record<string, unknown> = {};
        try {
          if (fs.existsSync(configPath)) {
            const parsed: unknown = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            // A non-object root holds no explicit settings, and reading a key
            // off `null` would crash this read-only command.
            if (isConfigRootObject(parsed)) {
              rawConfig = parsed as Record<string, unknown>;
            }
          }
        } catch {
          // If reading fails, treat all as defaults
        }

        console.log(formatValueYaml(config));

        // Annotate profile settings
        const profileSource = rawConfig.profile !== undefined ? '(显式设置)' : '(默认值)';
        const deliverySource = rawConfig.delivery !== undefined ? '(显式设置)' : '(默认值)';
        console.log(`\n档案设置：`);
        console.log(`  profile: ${config.profile} ${profileSource}`);
        console.log(`  delivery: ${config.delivery} ${deliverySource}`);
        if (config.profile === 'core') {
          console.log(`  workflows: ${CORE_WORKFLOWS.join(', ')} (来自 core 档案)`);
        } else if (config.workflows && config.workflows.length > 0) {
          console.log(`  workflows: ${config.workflows.join(', ')} (显式设置)`);
        } else {
          console.log(`  workflows: (无)`);
        }
      }
    });

  // config get
  configCmd
    .command('get <key>')
    .description('获取特定值（原始格式，可用于脚本）')
    .action((key: string) => {
      const config = getGlobalConfig();
      const value = getNestedValue(config as Record<string, unknown>, key);

      if (value === undefined) {
        process.exitCode = 1;
        return;
      }

      if (typeof value === 'object' && value !== null) {
        console.log(JSON.stringify(value));
      } else {
        console.log(String(value));
      }
    });

  // config set
  configCmd
    .command('set <key> <value>')
    .description('设置值（自动转换类型）')
    .option('--string', '强制将值存为字符串')
    .option('--allow-unknown', '允许设置未知键')
    .action((key: string, value: string, options: { string?: boolean; allowUnknown?: boolean }) => {
      const allowUnknown = Boolean(options.allowUnknown);
      const keyValidation = validateConfigKeyPath(key);
      // --allow-unknown relaxes the known-key check, but never the prototype-safety check.
      const unsafeKey = hasUnsafeKeySegment(key);
      if (!keyValidation.valid && (!allowUnknown || unsafeKey)) {
        const reason = keyValidation.reason ? ` ${keyValidation.reason}。` : '';
        console.error(`错误：无效的配置键 "${key}"。${reason}`);
        console.error('使用 "openspec-cn config list" 查看可用的键。');
        if (!allowUnknown && !unsafeKey) {
          console.error('传递 --allow-unknown 可跳过此检查。');
        }
        process.exitCode = 1;
        return;
      }

      if (refuseUnreadableConfig()) {
        return;
      }

      const config = getGlobalConfig() as Record<string, unknown>;
      const coercedValue = coerceValue(value, options.string || false);

      // Create a copy to validate before saving
      const newConfig = JSON.parse(JSON.stringify(config));
      setNestedValue(newConfig, key, coercedValue);

      // Validate the new config
      const validation = validateConfig(newConfig);
      if (!validation.success) {
        console.error(`错误：无效配置 - ${validation.error}`);
        process.exitCode = 1;
        return;
      }

      // Apply changes and save
      setNestedValue(config, key, coercedValue);
      saveGlobalConfig(config as GlobalConfig);

      const displayValue =
        typeof coercedValue === 'string' ? `"${coercedValue}"` : String(coercedValue);
      console.log(`已设置 ${key} = ${displayValue}`);
    });

  // config unset
  configCmd
    .command('unset <key>')
    .description('移除键（恢复为默认值）')
    .action((key: string) => {
      if (refuseUnreadableConfig()) {
        return;
      }

      const config = getGlobalConfig() as Record<string, unknown>;
      const existed = deleteNestedValue(config, key);

      if (existed) {
        saveGlobalConfig(config as GlobalConfig);
        console.log(`已重置 ${key}（恢复为默认值）`);
      } else {
        console.log(`键 "${key}" 未设置`);
      }
    });

  // config reset
  configCmd
    .command('reset')
    .description('将配置重置为默认值')
    .option('--all', '重置所有配置（必填）')
    .option('-y, --yes', '跳过确认提示')
    .action(async (options: { all?: boolean; yes?: boolean }) => {
      if (!options.all) {
        console.error('错误：重置时必须指定 --all 参数');
        console.error('用法：openspec-cn config reset --all [-y]');
        process.exitCode = 1;
        return;
      }

      if (!options.yes) {
        const { confirm } = await import('@inquirer/prompts');
        let confirmed: boolean;
        try {
          confirmed = await confirm({
            message: '是否将所有配置重置为默认值？',
            default: false,
          });
        } catch (error) {
          if (isPromptCancellationError(error)) {
            console.log('重置已取消。');
            process.exitCode = 130;
            return;
          }
          throw error;
        }

        if (!confirmed) {
          console.log('重置已取消。');
          return;
        }
      }

      // 重置是唯一一种有意覆盖无法解析文件的写入操作。
      saveGlobalConfig({ ...DEFAULT_CONFIG }, { replaceUnreadable: true });
      console.log('配置已重置为默认值');
    });

  // config edit
  configCmd
    .command('edit')
    .description('在 $EDITOR 中打开配置文件')
    .action(async () => {
      const editor = process.env.EDITOR || process.env.VISUAL;

      if (!editor) {
        console.error('错误：未配置编辑器');
        console.error('请将 EDITOR 或 VISUAL 环境变量设置为您偏好的编辑器');
        console.error('示例：export EDITOR=vim');
        process.exitCode = 1;
        return;
      }

      const configPath = getGlobalConfigPath();

      // Ensure config file exists with defaults
      if (!fs.existsSync(configPath)) {
        saveGlobalConfig({ ...DEFAULT_CONFIG });
      }

      // 等待编辑器关闭；失败时只报告，绝不抛出。
      const outcome = await runEditor(editor, configPath);
      if ('error' in outcome || outcome.code !== 0) {
        reportEditorFailure(editor, outcome);
        process.exitCode = 1;
        return;
      }

      try {
        const rawConfig = fs.readFileSync(configPath, 'utf-8');
        const parsedConfig = JSON.parse(rawConfig);
        const validation = validateConfig(parsedConfig);

        if (!validation.success) {
          console.error(`错误：无效配置 - ${validation.error}`);
          process.exitCode = 1;
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          console.error(`错误：在 ${configPath} 未找到配置文件`);
        } else if (error instanceof SyntaxError) {
          console.error(`错误：${configPath} 中包含无效的 JSON`);
          console.error(error.message);
        } else {
          console.error(`错误：无法验证配置 - ${error instanceof Error ? error.message : String(error)}`);
        }
        process.exitCode = 1;
      }
    });

  // config profile [preset]
  configCmd
    .command('profile [preset]')
    .description('配置工作流档案（交互式选择器或预设快捷方式）')
    .action(async (preset?: string) => {
      if (refuseUnreadableConfig()) {
        return;
      }

      // 预设快捷方式：`openspec-cn config profile core`
      if (preset === 'core') {
        const config = getGlobalConfig();
        config.profile = 'core';
        config.workflows = [...CORE_WORKFLOWS];
        // Preserve delivery setting
        saveGlobalConfig(config);
        printConfigProfileApplyGuidance();
        return;
      }

      if (preset) {
        console.error(`错误：未知的档案预设 "${preset}"。可用预设：core`);
        process.exitCode = 1;
        return;
      }

      // Non-interactive check
      if (!process.stdout.isTTY) {
        console.error('需要交互模式。使用 `openspec-cn config profile core` 或通过环境变量/标志设置配置。');
        process.exitCode = 1;
        return;
      }

      // Interactive picker
      const { select, checkbox, confirm } = await import('@inquirer/prompts');
      const chalk = (await import('chalk')).default;

      try {
        const config = getGlobalConfig();
        const currentState = resolveCurrentProfileState(config);

        console.log(chalk.bold('\n当前档案设置'));
        console.log(`  交付方式: ${currentState.delivery}`);
        console.log(`  工作流: ${formatWorkflowSummary(currentState.workflows, currentState.profile)}`);
        console.log(chalk.dim('  交付方式 = 工作流的安装位置（skills、命令或两者）'));
        console.log(chalk.dim('  工作流 = 可用的工作流动作（propose、explore、apply 等）'));
        console.log();

        const action = await select<ProfileAction>({
          message: '您想配置什么？',
          choices: [
            {
              value: 'both',
              name: '交付方式和工作流',
              description: '同时更新安装模式和可用动作',
            },
            {
              value: 'delivery',
              name: '仅交付方式',
              description: '更改工作流的安装位置',
            },
            {
              value: 'workflows',
              name: '仅工作流',
              description: '更改可用的工作流动作',
            },
            {
              value: 'keep',
              name: '保持当前设置（退出）',
              description: '不修改配置并退出',
            },
          ],
        });

        if (action === 'keep') {
          console.log('配置未变更。');
          maybeWarnProjectConfigDrift(process.cwd(), currentState, chalk.yellow);
          return;
        }

        const nextState: ProfileState = {
          profile: currentState.profile,
          delivery: currentState.delivery,
          workflows: [...currentState.workflows],
        };
        let workflowSelectionChanged = false;

        if (action === 'both' || action === 'delivery') {
          const deliveryChoices: { value: Delivery; name: string; description: string }[] = [
            {
              value: 'both' as Delivery,
              name: '两者都安装（Skills + 命令）',
              description: '同时将工作流作为技能和斜杠命令安装',
            },
            {
              value: 'skills' as Delivery,
              name: '仅 Skills',
              description: '仅将工作流作为技能安装',
            },
            {
              value: 'commands' as Delivery,
              name: '仅命令',
              description: '仅将工作流作为斜杠命令安装',
            },
          ];
          for (const choice of deliveryChoices) {
            if (choice.value === currentState.delivery) {
              choice.name += ' [当前]';
            }
          }

          nextState.delivery = await select<Delivery>({
            message: '交付方式（工作流的安装方式）：',
            choices: deliveryChoices,
            default: currentState.delivery,
          });
        }

        if (action === 'both' || action === 'workflows') {
          const formatWorkflowChoice = (workflow: string) => {
            const metadata = WORKFLOW_PROMPT_META[workflow] ?? {
              name: workflow,
              description: `工作流: ${workflow}`,
            };
            return {
              value: workflow,
              name: metadata.name,
              description: metadata.description,
              short: metadata.name,
              checked: currentState.workflows.includes(workflow),
            };
          };

          const selectedWorkflows = await checkbox<string>({
            // The `instructions` option was removed in @inquirer/checkbox v5.
            // Its replacement, the built-in keys help tip, renders
            // "↑↓ navigate • space select • ⏎ submit" by default — a superset of
            // the hint this used to pass — so no theme override is needed here.
            message: '选择要启用的工作流：',
            pageSize: ALL_WORKFLOWS.length,
            theme: {
              icon: {
                checked: '[x]',
                unchecked: '[ ]',
              },
            },
            choices: ALL_WORKFLOWS.map(formatWorkflowChoice),
          });
          nextState.workflows = selectedWorkflows;
          workflowSelectionChanged =
            selectedWorkflows.length !== currentState.workflows.length ||
            selectedWorkflows.some((workflow) => !currentState.workflows.includes(workflow));
          nextState.profile = workflowSelectionChanged
            ? deriveProfileFromWorkflowSelection(selectedWorkflows)
            : currentState.profile;
        }

        const diff = diffProfileState(currentState, nextState);
        if (!diff.hasChanges) {
          console.log('配置未变更。');
          maybeWarnProjectConfigDrift(process.cwd(), nextState, chalk.yellow);
          return;
        }

        console.log(chalk.bold('\n配置变更：'));
        for (const line of diff.lines) {
          console.log(`  ${line}`);
        }
        console.log();

        config.profile = nextState.profile;
        config.delivery = nextState.delivery;
        if (currentState.profile !== 'custom' || workflowSelectionChanged) {
          config.workflows = nextState.workflows;
        }
        saveGlobalConfig(config);

        // Check if inside an OpenSpec project
        const projectDir = process.cwd();
        const openspecDir = path.join(projectDir, OPENSPEC_DIR_NAME);
        if (fs.existsSync(openspecDir)) {
          const applyNow = await confirm({
            message: '立即将更改应用到此项目？',
            default: true,
          });

          if (applyNow) {
            try {
              await new UpdateCommand().execute(projectDir);
              console.log('请在您的其他项目中运行 `openspec-cn update` 来应用。');
            } catch (error) {
              console.error(`\`openspec-cn update\` 失败：${asErrorMessage(error)}`);
              console.error('请手动运行以应用档案变更。');
              process.exitCode = 1;
            }
            return;
          }
        }

        printConfigProfileApplyGuidance();
      } catch (error) {
        if (isPromptCancellationError(error)) {
          console.log('档案配置已取消。');
          process.exitCode = 130;
          return;
        }
        throw error;
      }
    });
}
