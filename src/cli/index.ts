import { Command, Option } from 'commander';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, promises as fs } from 'fs';
import { AI_TOOLS, TOOL_ID_ALIASES } from '../core/config.js';
import type { ArchiveOptions } from '../core/archive.js';
import { registerSpecCommand } from './commands/spec.js';
import { registerConfigCommand } from './commands/config.js';
import { registerSchemaCommand } from './commands/schema.js';
import { registerStoreCommand } from './commands/store.js';
import { registerDoctorCommand } from './commands/doctor.js';
import { registerContextCommand } from './commands/context.js';
import { registerWorksetCommand } from './commands/workset.js';
import { DEFAULT_SCHEMA } from '../commands/workflow/default-schema.js';
import type {
  StatusOptions,
  InstructionsOptions,
  TemplatesOptions,
  SchemasOptions,
  NewChangeOptions,
} from '../commands/workflow/index.js';
import { COMMON_FLAGS } from '../core/completions/shared-flags.js';

// Startup cost: every command's implementation, and the packages it uses,
// loads with `await import()` inside its action. This module and
// ./commands/ only define commands (names, options, help), so `--version`,
// `--help`, and each command load no other command's implementation.

const STORE_OPTION_DESCRIPTION = COMMON_FLAGS.store.description;

// Deliberate rejection path: --store-path stays registered (hidden) so the
// resolver can explain that registering the path is the supported route,
// instead of Commander emitting a generic unknown-option error (or, for
// `show`, silently ignoring it via allowUnknownOption).
function hiddenStorePathOption(): Option {
  return new Option(
    '--store-path <path>',
    '不支持；请使用 "openspec-cn store register <path>" 注册路径，并使用 --store <id>'
  ).hideHelp();
}

async function failWithError(
  error: unknown,
  json?: { enabled: boolean | undefined; payload?: Record<string, unknown>; fallbackCode?: string }
): Promise<void> {
  // The agent contract: every --json failure leaves exactly one JSON
  // document on stdout (the command's null-shape plus a status array).
  if (json?.enabled) {
    const { asStatus } = await import('../commands/shared-output.js');
    console.log(
      JSON.stringify(
        { ...(json.payload ?? {}), status: [asStatus(error, json.fallbackCode ?? 'command_error')] },
        null,
        2
      )
    );
    process.exitCode = 1;
    return;
  }
  const { default: ora } = await import('ora');
  ora().fail(`Error: ${(error as Error).message}`);
  // Resolution and store errors carry a pasteable fix - never drop it.
  const fix = (error as { diagnostic?: { fix?: string } }).diagnostic?.fix;
  if (fix) {
    console.error(`修复：${fix}`);
  }
  process.exitCode = process.exitCode ?? 1;
}

const program = new Command();
const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

/**
 * Get the full command path for nested commands.
 * For example: 'change show' -> 'change:show'
 */
export function getCommandPath(command: Command): string {
  const names: string[] = [];
  let current: Command | null = command;

  while (current) {
    // Stop at the root program (it has no parent); never include its name
    // in the telemetry/path, regardless of what the program is called.
    if (current.parent === null) {
      break;
    }
    names.unshift(current.name());
    current = current.parent;
  }

  return names.join(':') || 'openspec';
}

/**
 * True when the executing command asked for JSON output — used to suppress the
 * first-run telemetry notice so stdout stays a single valid JSON document.
 *
 * `--json` reaches commands three ways, so a single parsed option is not enough:
 * - declared on the leaf (`openspec status --json`) → `opts().json`
 * - declared on a parent group and read via globals (`openspec workset --json list`)
 *   → `optsWithGlobals().json`
 * - a residual arg on a permissive group that never declares the option
 *   (`openspec store --json`, which detects it from `command.args`) → `args`
 *
 * Suppressing is always safe: the disclosure is only deferred to the next
 * non-JSON run, never lost, whereas printing it on a JSON run corrupts stdout.
 */
export function isJsonRun(command: Command): boolean {
  return (
    command.optsWithGlobals().json === true ||
    command.args.includes('--json')
  );
}

/**
 * True for the commands that exist to serve shell completions: the user-facing
 * `openspec completion ...` group and the hidden `__complete` resolver that
 * generated completion scripts call on every Tab press. Tipping either about
 * completions is noise, and `__complete` would burn the one-shot tip invisibly.
 */
export function isCompletionRun(commandPath: string): boolean {
  return commandPath.split(':')[0] === 'completion' || commandPath === '__complete';
}

/**
 * True for the hidden `__complete` resolver alone. It runs on every Tab press,
 * so the hooks skip telemetry and the completion tip for it entirely.
 */
export function isTabCompletionRun(commandPath: string): boolean {
  return commandPath === '__complete';
}

/**
 * True when the first-run completions tip must be deferred rather than shown.
 *
 * Deferring keeps the tip unconsumed, so it still reaches the user on a later
 * run that can actually carry it. All three cases are runs nobody would read a
 * hint from: JSON output, the completion machinery itself, and a stderr that is
 * not a terminal — pipes and the agent-driven runs that dominate this CLI's
 * usage would otherwise burn the user's one-shot tip into a log nobody opens.
 */
export function shouldDeferCompletionTip(command: Command, stderrIsTty: boolean): boolean {
  return isJsonRun(command) || isCompletionRun(getCommandPath(command)) || !stderrIsTty;
}

program
  .name('openspec-cn')
  .description('基于规范驱动开发的AI原生系统')
  .version(version, '-V, --version', '输出版本号')
  .helpOption('-h, --help', '显示命令帮助')
  .addHelpCommand('help [command]', '显示命令帮助');

// Global options
program.option('--no-color', '禁用彩色输出');

program
  .command('version')
  .description('报告已安装的 OpenSpec 版本及更新可用性')
  .option('--json', '以 JSON 格式输出')
  .option('--check', '检查 registry 是否有更新版本')
  .action(async (options: { json?: boolean; check?: boolean }) => {
    const {
      getCliInstallInfo,
      checkForCliUpdate,
      getCliUpdateCommand,
      canSelfUpgrade,
      buildVersionReportLines,
    } = await import('../core/version-check.js');
    const install = getCliInstallInfo();
    const update = options.check ? await checkForCliUpdate({ requested: true }) : undefined;
    const command = update?.status === 'available' ? getCliUpdateCommand(install) : null;
    const output = {
      schemaVersion: 1,
      version,
      install,
      ...(update
        ? {
            update: {
              ...update,
              command,
              canSelfUpgrade:
                update.status === 'available'
                  ? canSelfUpgrade(install.location, process.cwd())
                  : false,
            },
          }
        : {}),
    };

    if (options.json) {
      console.log(JSON.stringify(output, null, 2));
      return;
    }

    console.log(buildVersionReportLines(version, install, update, command).join('\n'));
  });

// Apply global flags and telemetry before any command runs
// Note: preAction receives (thisCommand, actionCommand) where:
// - thisCommand: the command where hook was added (root program)
// - actionCommand: the command actually being executed (subcommand)
program.hook('preAction', async (thisCommand, actionCommand) => {
  const opts = thisCommand.opts();
  if (opts.color === false) {
    process.env.NO_COLOR = '1';
  }

  // `__complete` runs on every Tab press, with stderr sent to /dev/null by the
  // generated scripts. Tracking it would hold each press open for the request,
  // and the first-run notice would be marked seen without anyone reading it.
  if (isTabCompletionRun(getCommandPath(actionCommand))) {
    return;
  }

  // Show first-run telemetry notice (if not seen). It's written to stderr, so it
  // never pollutes stdout — but --json runs still defer it (see isJsonRun) so the
  // very first invocation stays free of any incidental output on either stream.
  const { maybeShowTelemetryNotice, trackCommand } = await import('../telemetry/index.js');
  await maybeShowTelemetryNotice({ silent: isJsonRun(actionCommand) });

  // Track command execution (use actionCommand to get the actual subcommand)
  const commandPath = getCommandPath(actionCommand);

  await trackCommand(commandPath, version);
});

// Shutdown telemetry after command completes
program.hook('postAction', async (_thisCommand, actionCommand) => {
  // Nothing to flush (preAction tracked nothing), and the tip is always
  // deferred for completion runs, so skip loading either module.
  if (isTabCompletionRun(getCommandPath(actionCommand))) {
    return;
  }

  // Show the first-run shell-completions tip (on stderr, so piped stdout stays
  // clean). postAction, not preAction: the tip trails the command's own output
  // instead of pushing an error message or `init`'s setup summary down the
  // screen. Deferred — not consumed — whenever nobody would read it: JSON runs,
  // `openspec completion ...`, and a stderr that is not a terminal (agents and
  // pipes would otherwise silently burn the user's one-shot tip).
  try {
    const { maybeShowCompletionTip } = await import('../core/completion-tip.js');
    await maybeShowCompletionTip({
      silent: shouldDeferCompletionTip(actionCommand, Boolean(process.stderr.isTTY)),
    });
  } finally {
    // The flush runs even if the hint throws: parse() is synchronous, so a
    // rejection here has no catch anywhere above it.
    const { shutdown } = await import('../telemetry/index.js');
    await shutdown();
  }
});

const availableToolIds = AI_TOOLS
  .filter((tool) => tool.skillsDir || tool.globalSkillsDir)
  .map((tool) => tool.value);
const toolAliasNote = Object.entries(TOOL_ID_ALIASES)
  .map(([retired, current]) => `${retired} (now ${current})`)
  .join(', ');
const toolsOptionDescription = `非交互式配置AI工具。使用 "all"、"none" 或逗号分隔的列表：${availableToolIds.join(', ')}。同时接受：${toolAliasNote}`;

program
  .command('init [path]')
  .description('在您的项目中初始化OpenSpec')
  .option('--tools <tools>', toolsOptionDescription)
  .option('--language <language>', '用此语言编写新的 OpenSpec 制品')
  .option('--force', '自动清理旧文件而不提示')
  .option('--profile <profile>', '覆盖全局配置档案（core 或 custom）')
  .option('--no-animation', '显示静态欢迎屏而非动画版')
  .option('--copilot-cloud', '无需提示直接配置 GitHub Copilot 云端 coding-agent 文件')
  .option('--no-copilot-cloud', '无需提示跳过 GitHub Copilot 云端 coding-agent 文件')
  .action(async (targetPath = '.', options?: { tools?: string; language?: string; force?: boolean; profile?: string; animation?: boolean; copilotCloud?: boolean }) => {
    try {
      // Validate that the path is a valid directory
      const resolvedPath = path.resolve(targetPath);

      try {
        const stats = await fs.stat(resolvedPath);
        if (!stats.isDirectory()) {
          throw new Error(`路径 "${targetPath}" 不是一个目录`);
        }
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          // Directory doesn't exist, but we can create it
          console.log(`目录 "${targetPath}" 不存在，将被创建。`);
        } else if (error.message && error.message.includes('not a directory')) {
          throw error;
        } else {
          throw new Error(`无法访问路径 "${targetPath}": ${error.message}`);
        }
      }

      const { InitCommand } = await import('../core/init.js');
      const initCommand = new InitCommand({
        tools: options?.tools,
        language: options?.language,
        force: options?.force,
        profile: options?.profile,
        animation: options?.animation,
        copilotCloud: options?.copilotCloud,
      });
      await initCommand.execute(targetPath);
    } catch (error) {
      await failWithError(error);
      process.exit(1);
    }
  });

// Hidden alias: 'experimental' -> 'init' for backwards compatibility
program
  .command('experimental', { hidden: true })
  .description('init 的别名（已弃用）')
  .option('--tool <tool-id>', '目标 AI 工具（映射到 --tools）')
  .option('--no-interactive', '禁用交互式提示')
  .action(async (options?: { tool?: string; noInteractive?: boolean }) => {
    try {
      console.log('注意："openspec-cn experimental" 已弃用。请使用 "openspec-cn init" 代替。');
      const { InitCommand } = await import('../core/init.js');
      const initCommand = new InitCommand({
        tools: options?.tool,
        interactive: options?.noInteractive === true ? false : undefined,
      });
      await initCommand.execute('.');
    } catch (error) {
      await failWithError(error);
      process.exit(1);
    }
  });

program
  .command('update [path]')
  .description('更新 OpenSpec 指令文件')
  .option('--force', '即使工具已是最新也强制更新')
  .option('--dry-run', '仅报告更新会做哪些改动，不写入任何内容')
  .option('--json', '配合 --dry-run，将计划改动以 JSON 输出')
  .action(
    async (
      targetPath = '.',
      options?: { force?: boolean; dryRun?: boolean; json?: boolean }
    ) => {
    try {
      if (options?.json && !options?.dryRun) {
        console.error('--json 只能与 --dry-run 一起使用。');
        process.exitCode = 1;
        return;
      }

      // A dry run reports the plan and nothing else: no network check, no
      // upgrade prompt, no output that would break --json.
      if (options?.dryRun) {
        const [{ UpdateCommand }, { formatUpdatePlan }] = await Promise.all([
          import('../core/update.js'),
          import('../core/update-plan.js'),
        ]);
        const plan = await new UpdateCommand({
          force: options?.force,
          dryRun: true,
        }).plan(targetPath);
        console.log(options?.json ? JSON.stringify(plan, null, 2) : formatUpdatePlan(plan));
        return;
      }

      const [
        {
          getInstallDir,
          isSourceCheckout,
          getAvailableCliUpdate,
          shouldOfferUpgrade,
          displayCliUpdateNote,
          offerCliUpgrade,
          rerunUpdateWithUpgradedCli,
          displayUpgradeCommand,
        },
        { isInteractive },
        { UpdateCommand },
      ] = await Promise.all([
        import('../core/version-check.js'),
        import('../utils/interactive.js'),
        import('../core/update.js'),
      ]);
      const installDir = getInstallDir();
      // Running from a clone: the version is whatever the branch says, so any
      // upgrade advice would be noise. Decided before the request, so a
      // contributor never waits on an answer that gets thrown away.
      const latestVersion = isSourceCheckout(installDir) ? null : await getAvailableCliUpdate();
      const announce = latestVersion !== null;
      // Offer to upgrade first: this process generates files from its own
      // templates, so upgrading afterwards would leave the old ones on disk.
      // Both streams must be a terminal — with stdout redirected the question
      // lands in the file and the user waits at a blank screen forever.
      const canOffer =
        announce &&
        shouldOfferUpgrade({
          installDir,
          projectPath: targetPath,
          interactive: isInteractive(),
          stdoutIsTty: Boolean(process.stdout.isTTY),
        });

      let declined = false;
      if (latestVersion && canOffer) {
        displayCliUpdateNote(latestVersion, targetPath, { withCommand: false });
        const outcome = await offerCliUpgrade(latestVersion);

        // Set the code and return rather than process.exit: exiting here would
        // skip commander's postAction hook, killing the telemetry flush
        // mid-request.
        if (outcome === 'cancelled') {
          // Ctrl-C means stop the command, not fall through to more prompts.
          process.exitCode = 130;
          return;
        }
        if (outcome === 'upgraded') {
          process.exitCode = await rerunUpdateWithUpgradedCli(targetPath, {
            force: options?.force,
          });
          return;
        }
        // Declined, failed, or upgraded-but-unreachable: fall through to the
        // update, then leave the command on screen underneath it.
        declined = true;
      }

      const updateCommand = new UpdateCommand({ force: options?.force });
      await updateCommand.execute(targetPath);

      if (declined) {
        // The headline was printed before the prompt; only the manual route is
        // still owed, and it belongs where the user is looking now.
        displayUpgradeCommand(targetPath);
      } else if (latestVersion) {
        displayCliUpdateNote(latestVersion, targetPath);
      }

      // Once per machine, a package-manager user hears the standalone install
      // exists. Offered, never pushed; deferred when stderr is not a terminal.
      const { maybeShowStandaloneTip } = await import('../core/standalone-tip.js');
      await maybeShowStandaloneTip({ silent: !process.stderr.isTTY });
    } catch (error) {
      // The --json dry run follows the agent contract: exactly one JSON
      // document on stdout, even on failure.
      // failWithError sets the exit code. Returning instead of process.exit()
      // lets piped stdout drain - an exit can cut the JSON document short where
      // pipes are asynchronous (macOS, Windows) - and keeps commander's
      // postAction telemetry flush, as the upgrade paths above already do.
      await failWithError(error, {
        enabled: options?.dryRun && options?.json,
        payload: { changes: [], notes: [], failures: [] },
        fallbackCode: 'update_error',
      });
    }
    }
  );

program
  .command('install [version]')
  .description('安装独立版 openspec-cn，无需 Node.js（未指定 [version] 时安装最新发布版）')
  .action(async (version?: string) => {
    try {
      const { installStandalone } = await import('../commands/install-standalone.js');
      await installStandalone({ version });
    } catch (error) {
      await failWithError(error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('列出项目（默认显示更改）。使用 --specs 列出规范。')
  .option('--specs', '列出规范而非更改')
  .option('--changes', '明确列出更改（默认）')
  .option('--archived', '仅显示已归档的更改')
  .option('--all', '同时显示活跃和已归档的更改')
  .option('--sort <order>', '排序方式："recent"（默认）或 "name"', 'recent')
  .option('--json', '以 JSON 格式输出（供程序使用）')
  .option('--store <id>', STORE_OPTION_DESCRIPTION)
  .addOption(hiddenStorePathOption())
  .action(async (options?: { specs?: boolean; changes?: boolean; archived?: boolean; all?: boolean; sort?: string; json?: boolean; store?: string; storePath?: string }) => {
    try {
      if (options?.specs && (options.archived || options.all)) {
        throw new Error('--archived and --all can only be used when listing changes.');
      }
      const [{ resolveRootForCommand, toRootOutput }, { ListCommand }] = await Promise.all([
        import('../core/root-selection.js'),
        import('../core/list.js'),
      ]);
      const root = await resolveRootForCommand(options ?? {}, {
        json: options?.json,
        failurePayload: options?.specs ? { specs: [], root: null } : { changes: [], root: null },
        // Preserve the cwd fallback for pre-config.yaml projects. The resolver
        // still lets a registered/default store take precedence over it.
        allowImplicitRoot: existsSync(path.join(process.cwd(), 'openspec', 'project.md')),
      });
      if (!root) {
        return;
      }
      const listCommand = new ListCommand();
      const mode: 'changes' | 'specs' = options?.specs ? 'specs' : 'changes';
      const sort = options?.sort === 'name' ? 'name' : 'recent';
      await listCommand.execute(root.path, mode, {
        sort,
        json: options?.json,
        archived: options?.archived,
        all: options?.all,
        ...(options?.json ? { root: toRootOutput(root) } : {}),
      });
    } catch (error) {
      await failWithError(error, {
        enabled: options?.json,
        payload: options?.specs ? { specs: [], root: null } : { changes: [], root: null },
        fallbackCode: 'list_error',
      });
      process.exit(1);
    }
  });

program
  .command('view')
  .description('显示规范和更改的交互式仪表板')
  .option('--store <id>', STORE_OPTION_DESCRIPTION)
  .addOption(hiddenStorePathOption())
  .action(async (options?: { store?: string; storePath?: string }) => {
    try {
      // Implicit cwd fallback stays enabled so `view` keeps accepting the same
      // directories as `list`/`status` — notably pre-config.yaml `openspec/`
      // dirs. ViewCommand still reports a missing openspec/ directory itself.
      const [{ resolveRootForCommand }, { ViewCommand }] = await Promise.all([
        import('../core/root-selection.js'),
        import('../core/view.js'),
      ]);
      const root = await resolveRootForCommand(options ?? {});
      if (!root) {
        return;
      }
      const viewCommand = new ViewCommand();
      await viewCommand.execute(root.path);
    } catch (error) {
      await failWithError(error);
      process.exit(1);
    }
  });

// Change command with subcommands
const changeCmd = program
  .command('change')
  .description('管理OpenSpec变更提案');

// Deprecation notice for noun-based commands
changeCmd.hook('preAction', () => {
  console.error('警告："openspec-cn change ..." 命令已弃用。请优先使用动词前置命令（例如 "openspec-cn list"、"openspec-cn validate --changes"）。');
});

changeCmd
  .command('show [change-name]')
  .description('以 JSON 或 Markdown 格式显示变更提案')
  .option('--json', '以 JSON 格式输出')
  .option('--deltas-only', '仅显示 deltas（仅 JSON）')
  .option('--requirements-only', '--deltas-only 的别名（已弃用）')
  .option('--diff', '显示 delta spec 的逐需求 diff')
  .option('--no-interactive', '禁用交互式提示')
  .action(async (changeName?: string, options?: { json?: boolean; requirementsOnly?: boolean; deltasOnly?: boolean; diff?: boolean; noInteractive?: boolean }) => {
    try {
      const { ChangeCommand } = await import('../commands/change.js');
      const changeCommand = new ChangeCommand();
      await changeCommand.show(changeName, options);
    } catch (error) {
      console.error(`错误：${(error as Error).message}`);
      process.exitCode = 1;
    }
  });

changeCmd
  .command('list')
  .description('列出所有活跃变更（已弃用：请使用 "openspec-cn list"）')
  .option('--json', '以 JSON 格式输出')
  .option('--long', '显示 id 和 title 及计数')
  .action(async (options?: { json?: boolean; long?: boolean }) => {
    try {
      console.error('警告："openspec-cn change list" 已弃用。请使用 "openspec-cn list"。');
      const { ChangeCommand } = await import('../commands/change.js');
      const changeCommand = new ChangeCommand();
      await changeCommand.list(options);
    } catch (error) {
      console.error(`错误：${(error as Error).message}`);
      process.exitCode = 1;
    }
  });

changeCmd
  .command('validate [change-name]')
  .description('验证变更提案')
  .option('--strict', '启用严格验证模式')
  .option('--json', '以 JSON 格式输出验证报告')
  .option('--no-interactive', '禁用交互式提示')
  .action(async (changeName?: string, options?: { strict?: boolean; json?: boolean; noInteractive?: boolean }) => {
    try {
      const { ChangeCommand } = await import('../commands/change.js');
      const changeCommand = new ChangeCommand();
      // validate() already sets process.exitCode, and Node honours it at
      // natural exit. Calling process.exit() here would skip commander's
      // postAction hook — the same trap called out for `update` below — which
      // kills the telemetry flush and the first-run completions tip on what is
      // a routine outcome, not an error: a change that fails validation.
      await changeCommand.validate(changeName, options);
    } catch (error) {
      console.error(`错误：${(error as Error).message}`);
      process.exitCode = 1;
    }
  });

program
  .command('archive [change-name]')
  .description('归档已完成的变更并更新主规范')
  .option('-y, --yes', '跳过确认提示')
  .option('--skip-specs', '跳过规范更新操作（适用于基础设施、工具或纯文档变更）')
  .option('--no-validate', '跳过验证（不推荐，需确认）')
  .option('--json', '以 JSON 格式输出（非交互式）')
  .option('--store <id>', STORE_OPTION_DESCRIPTION)
  .addOption(hiddenStorePathOption())
  .action(async (changeName?: string, options?: ArchiveOptions) => {
    try {
      const { ArchiveCommand } = await import('../core/archive.js');
      const archiveCommand = new ArchiveCommand();
      await archiveCommand.execute(changeName, options);
    } catch (error) {
      await failWithError(error);
      process.exit(1);
    }
  });

registerSpecCommand(program);
registerConfigCommand(program);
registerSchemaCommand(program);
registerStoreCommand(program);
registerDoctorCommand(program);
registerContextCommand(program);
registerWorksetCommand(program);

// Top-level validate command
program
  .command('validate [item-name]')
  .description('验证更改和规范')
  .option('--all', '验证所有更改和规范')
  .option('--changes', '验证所有更改')
  .option('--specs', '验证所有规范')
  .option('--archived', '验证已归档的更改是否所有任务已完成（用于 pre-commit lint）')
  .option('--report <full|findings>', '选择批量报告内容：full|findings；配合 --json 输出 JSON')
  .option('--type <type>', '当项目类型不明确时指定类型：change|spec')
  .option('--strict', '启用严格验证模式')
  .option('--json', '以JSON格式输出验证报告')
  .option('--concurrency <n>', '最大并发验证数 (默认为环境变量 OPENSPEC_CONCURRENCY 或 6)')
  .option('--no-interactive', '禁用交互式提示')
  .option('--store <id>', STORE_OPTION_DESCRIPTION)
  .addOption(hiddenStorePathOption())
  .action(async (itemName?: string, options?: { all?: boolean; changes?: boolean; specs?: boolean; archived?: boolean; report?: string; type?: string; strict?: boolean; json?: boolean; noInteractive?: boolean; concurrency?: string; store?: string; storePath?: string }) => {
    try {
      const { ValidateCommand } = await import('../commands/validate.js');
      const validateCommand = new ValidateCommand();
      await validateCommand.execute(itemName, options);
    } catch (error) {
      await failWithError(error, { enabled: options?.json, fallbackCode: 'validate_error' });
      process.exit(1);
    }
  });

// Top-level show command
program
  .command('show [item-name]')
  .description('显示更改或规范')
  .option('--json', '以JSON格式输出')
  .option('--type <type>', '当项目类型不明确时指定类型：change|spec')
  .option('--no-interactive', '禁用交互式提示')
  // change-only flags
  .option('--deltas-only', '仅显示 deltas（仅 JSON，change）')
  .option('--requirements-only', '--deltas-only 的别名（已弃用，change）')
  .option('--diff', '显示 delta spec 的逐需求 diff（change）')
  // spec-only flags
  .option('--requirements', '仅 JSON：仅显示需求（排除场景）')
  .option('--no-scenarios', '仅 JSON：排除场景内容')
  .option('-r, --requirement <id>', '仅 JSON：按 ID 显示特定需求（从 1 开始）')
  .option('--store <id>', STORE_OPTION_DESCRIPTION)
  // Explicit registration required: allowUnknownOption would otherwise
  // silently swallow --store-path instead of rejecting it deliberately.
  .addOption(hiddenStorePathOption())
  // allow unknown options to pass-through to underlying command implementation
  .allowUnknownOption(true)
  .action(async (itemName?: string, options?: { json?: boolean; type?: string; noInteractive?: boolean; [k: string]: any }) => {
    try {
      const { ShowCommand } = await import('../commands/show.js');
      const showCommand = new ShowCommand();
      await showCommand.execute(itemName, options ?? {});
    } catch (error) {
      await failWithError(error, { enabled: options?.json, fallbackCode: 'show_error' });
      process.exit(1);
    }
  });

// Feedback command
program
  .command('feedback <message>')
  .description('提交关于 OpenSpec 的反馈')
  .option('--body <text>', '反馈的详细描述')
  .action(async (message: string, options?: { body?: string }) => {
    try {
      const { FeedbackCommand } = await import('../commands/feedback.js');
      const feedbackCommand = new FeedbackCommand();
      await feedbackCommand.execute(message, options);
    } catch (error) {
      await failWithError(error);
      process.exit(1);
    }
  });

// Completion command with subcommands
const completionCmd = program
  .command('completion')
  .description('管理 OpenSpec CLI 的 Shell 补全');

completionCmd
  .command('generate [shell]')
  .description('为指定 Shell 生成补全脚本（输出到 stdout）')
  .action(async (shell?: string) => {
    try {
      const { CompletionCommand } = await import('../commands/completion.js');
      const completionCommand = new CompletionCommand();
      await completionCommand.generate({ shell });
    } catch (error) {
      await failWithError(error);
      process.exit(1);
    }
  });

completionCmd
  .command('install [shell]')
  .description('为指定 Shell 安装补全脚本')
  .option('--verbose', '显示详细安装输出')
  .action(async (shell?: string, options?: { verbose?: boolean }) => {
    try {
      const { CompletionCommand } = await import('../commands/completion.js');
      const completionCommand = new CompletionCommand();
      await completionCommand.install({ shell, verbose: options?.verbose });
    } catch (error) {
      await failWithError(error);
      process.exit(1);
    }
  });

completionCmd
  .command('uninstall [shell]')
  .description('卸载指定 Shell 的补全脚本')
  .option('-y, --yes', '跳过确认提示')
  .action(async (shell?: string, options?: { yes?: boolean }) => {
    try {
      const { CompletionCommand } = await import('../commands/completion.js');
      const completionCommand = new CompletionCommand();
      await completionCommand.uninstall({ shell, yes: options?.yes });
    } catch (error) {
      await failWithError(error);
      process.exit(1);
    }
  });

// Hidden command for machine-readable completion data
program
  .command('__complete <type>', { hidden: true })
  .description('以机器可读格式输出补全数据（内部使用）')
  .action(async (type: string) => {
    try {
      const { CompletionCommand } = await import('../commands/completion.js');
      const completionCommand = new CompletionCommand();
      await completionCommand.complete({ type });
    } catch (error) {
      // Silently fail for graceful shell completion experience
      process.exitCode = 1;
    }
  });

// ═══════════════════════════════════════════════════════════
// Workflow Commands (formerly experimental)
// ═══════════════════════════════════════════════════════════

// Status command
program
  .command('status')
  .description('显示变更的产出物完成状态')
  .option('--change <id>', '要显示状态的变更名称')
  .option('--all', '显示所有活跃变更的状态')
  .option('--schema <name>', 'Schema 覆盖（从 config.yaml 自动检测）')
  .option('--json', '以 JSON 格式输出')
  .option('--store <id>', STORE_OPTION_DESCRIPTION)
  .addOption(hiddenStorePathOption())
  .action(async (options: StatusOptions) => {
    try {
      const { statusCommand } = await import('../commands/workflow/status.js');
      await statusCommand(options);
    } catch (error) {
      await failWithError(error, {
        enabled: options.json,
        // The batch null-shape; the single-change failure shape is
        // pre-existing contract and stays payload-free.
        payload: options.all
          ? (await import('../commands/workflow/status.js')).BATCH_STATUS_FAILURE_PAYLOAD
          : undefined,
        fallbackCode: 'change_error',
      });
      process.exit(1);
    }
  });

// Instructions command
program
  .command('instructions [artifact]')
  .description('输出制品、apply 或 archive 的增强指令')
  .option('--change <id>', '变更名称')
  .option('--schema <name>', 'Schema 覆盖（从 config.yaml 自动检测）')
  .option('--json', '以 JSON 格式输出')
  .option('--store <id>', STORE_OPTION_DESCRIPTION)
  .addOption(hiddenStorePathOption())
  .action(async (artifactId: string | undefined, options: InstructionsOptions) => {
    try {
      const { applyInstructionsCommand, archiveInstructionsCommand, instructionsCommand } =
        await import('../commands/workflow/instructions.js');
      // Workflow instruction surfaces are reserved command branches, not artifacts.
      if (artifactId === 'apply') {
        await applyInstructionsCommand(options);
      } else if (artifactId === 'archive') {
        await archiveInstructionsCommand(options);
      } else {
        await instructionsCommand(artifactId, options);
      }
    } catch (error) {
      await failWithError(error, { enabled: options.json, fallbackCode: 'change_error' });
      process.exit(1);
    }
  });

// Templates command
program
  .command('templates')
  .description('显示 Schema 中所有产出物的已解析模板路径')
  .option('--schema <name>', `要使用的 Schema（默认：${DEFAULT_SCHEMA}）`)
  .option('--json', '以 JSON 格式输出产出物 ID 到模板路径的映射')
  .action(async (options: TemplatesOptions) => {
    try {
      const { templatesCommand } = await import('../commands/workflow/templates.js');
      await templatesCommand(options);
    } catch (error) {
      await failWithError(error);
      process.exit(1);
    }
  });

// Schemas command
program
  .command('schemas')
  .description('列出可用的工作流 Schema 及其描述')
  .option('--json', '以 JSON 格式输出（供 Agent 使用）')
  .option('--store <id>', STORE_OPTION_DESCRIPTION)
  .addOption(hiddenStorePathOption())
  .action(async (options: SchemasOptions) => {
    try {
      const { schemasCommand } = await import('../commands/workflow/schemas.js');
      await schemasCommand(options);
    } catch (error) {
      await failWithError(error, {
        enabled: options.json,
        payload: { schemas: [], root: null },
        fallbackCode: 'schemas_error',
      });
      process.exit(1);
    }
  });

// New command group with change subcommand
const newCmd = program.command('new').description('创建新项目');

newCmd
  .command('change <name>')
  .description('创建新的变更目录')
  .option('--description <text>', '添加到 README.md 的描述')
  .option('--goal <text>', '随变更存储的可选目标元数据')
  .option('--schema <name>', `要使用的工作流 Schema（默认：${DEFAULT_SCHEMA}）`)
  .option('--json', '以 JSON 格式输出')
  .option('--store <id>', STORE_OPTION_DESCRIPTION)
  .addOption(hiddenStorePathOption())
  // Removed options kept registered (hidden) so users get a deliberate
  // explanation instead of a generic unknown-option error.
  .addOption(new Option('--initiative <id>', '不再支持').hideHelp())
  .addOption(new Option('--areas <names>', '不再支持').hideHelp())
  .action(async (name: string, options: NewChangeOptions) => {
    try {
      const { newChangeCommand } = await import('../commands/workflow/new-change.js');
      await newChangeCommand(name, options);
    } catch (error) {
      await failWithError(error);
      process.exit(1);
    }
  });

export { program };

export function runCli(argv = process.argv): void {
  program.parse(argv);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCli();
}
