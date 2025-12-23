import { Command } from 'commander';
import { createRequire } from 'module';
import ora from 'ora';
import path from 'path';
import { promises as fs } from 'fs';
import { AI_TOOLS } from '../core/config.js';
import { UpdateCommand } from '../core/update.js';
import { ListCommand } from '../core/list.js';
import { ArchiveCommand } from '../core/archive.js';
import { ViewCommand } from '../core/view.js';
import { registerSpecCommand } from '../commands/spec.js';
import { ChangeCommand } from '../commands/change.js';
import { ValidateCommand } from '../commands/validate.js';
import { ShowCommand } from '../commands/show.js';
import { CompletionCommand } from '../commands/completion.js';
import { registerConfigCommand } from '../commands/config.js';

const program = new Command();
const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

program
  .name('openspec-cn')
  .description('基于规范驱动开发的AI原生系统')
  .version(version, '-V, --version', '输出版本号')
  .helpOption('-h, --help', '显示命令帮助')
  .addHelpCommand('help [command]', '显示命令帮助');

// Global options
program.option('--no-color', '禁用彩色输出');

// Apply global flags before any command runs
program.hook('preAction', (thisCommand) => {
  const opts = thisCommand.opts();
  if (opts.color === false) {
    process.env.NO_COLOR = '1';
  }
});

const availableToolIds = AI_TOOLS.filter((tool) => tool.available).map((tool) => tool.value);
const toolsOptionDescription = `非交互式配置AI工具。使用 "all"、"none" 或逗号分隔的列表：${availableToolIds.join(', ')}`;

program
  .command('init [path]')
  .description('在您的项目中初始化OpenSpec')
  .option('--tools <tools>', toolsOptionDescription)
  .action(async (targetPath = '.', options?: { tools?: string }) => {
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
      });
      await initCommand.execute(targetPath);
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`错误：${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('update [path]')
  .description('更新OpenSpec指令文件')
  .action(async (targetPath = '.') => {
    try {
      const resolvedPath = path.resolve(targetPath);
      const updateCommand = new UpdateCommand();
      await updateCommand.execute(resolvedPath);
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`错误：${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('列出项目（默认显示更改）。使用 --specs 列出规范。')
  .option('--specs', '列出规范而非更改')
  .option('--changes', '明确列出更改（默认）')
  .action(async (options?: { specs?: boolean; changes?: boolean }) => {
    try {
      const listCommand = new ListCommand();
      const mode: 'changes' | 'specs' = options?.specs ? 'specs' : 'changes';
      await listCommand.execute('.', mode);
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`错误：${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('view')
  .description('显示规范和更改的交互式仪表板')
  .action(async () => {
    try {
      const viewCommand = new ViewCommand();
      await viewCommand.execute('.');
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`错误：${(error as Error).message}`);
      process.exit(1);
    }
  });

// Change command with subcommands
const changeCmd = program
  .command('change')
  .description('管理OpenSpec变更提案');

// Deprecation notice for noun-based commands
changeCmd.hook('preAction', () => {
  console.error('警告："openspec-cn change ..." 命令已弃用。请优先使用动词开头的命令（例如 "openspec-cn list", "openspec-cn validate --changes"）。');
});

changeCmd
  .command('show [change-name]')
  .description('以JSON或markdown格式显示变更提案')
  .option('--json', '以JSON格式输出')
  .option('--deltas-only', '仅显示增量 (仅JSON)')
  .option('--requirements-only', 'deltas-only 的别名 (已弃用)')
  .option('--no-interactive', '禁用交互式提示')
  .action(async (changeName?: string, options?: { json?: boolean; requirementsOnly?: boolean; deltasOnly?: boolean; noInteractive?: boolean }) => {
    try {
      const changeCommand = new ChangeCommand();
      await changeCommand.show(changeName, options);
    } catch (error) {
      console.error(`错误：${(error as Error).message}`);
      process.exitCode = 1;
    }
  });

changeCmd
  .command('list')
  .description('列出所有活动更改（已弃用：请使用 "openspec-cn list"）')
  .option('--json', '以JSON格式输出')
  .option('--long', '显示ID、标题和计数')
  .action(async (options?: { json?: boolean; long?: boolean }) => {
    try {
      console.error('警告："openspec change list" 已弃用。请使用 "openspec-cn list"。');
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
  .option('--json', '以JSON格式输出验证报告')
  .option('--no-interactive', '禁用交互式提示')
  .action(async (changeName?: string, options?: { strict?: boolean; json?: boolean; noInteractive?: boolean }) => {
    try {
      const changeCommand = new ChangeCommand();
      await changeCommand.validate(changeName, options);
      if (typeof process.exitCode === 'number' && process.exitCode !== 0) {
        process.exit(process.exitCode);
      }
    } catch (error) {
      console.error(`错误：${(error as Error).message}`);
      process.exitCode = 1;
    }
  });

program
  .command('archive [change-name]')
  .description('归档已完成的更改并更新主规范')
  .option('-y, --yes', '跳过确认提示')
  .option('--skip-specs', '跳过规范更新操作（适用于基础设施、工具或仅文档更改）')
  .option('--no-validate', '跳过验证（不推荐，需要确认）')
  .action(async (changeName?: string, options?: { yes?: boolean; skipSpecs?: boolean; noValidate?: boolean; validate?: boolean }) => {
    try {
      const archiveCommand = new ArchiveCommand();
      await archiveCommand.execute(changeName, options);
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`错误：${(error as Error).message}`);
      process.exit(1);
    }
  });

registerSpecCommand(program);
registerConfigCommand(program);

// Top-level validate command
program
  .command('validate [item-name]')
  .description('验证更改和规范')
  .option('--all', '验证所有更改和规范')
  .option('--changes', '验证所有更改')
  .option('--specs', '验证所有规范')
  .option('--type <type>', '当项目类型不明确时指定类型：change|spec')
  .option('--strict', '启用严格验证模式')
  .option('--json', '以JSON格式输出验证报告')
  .option('--concurrency <n>', '最大并发验证数 (默认为环境变量 OPENSPEC_CONCURRENCY 或 6)')
  .option('--no-interactive', '禁用交互式提示')
  .action(async (itemName?: string, options?: { all?: boolean; changes?: boolean; specs?: boolean; type?: string; strict?: boolean; json?: boolean; noInteractive?: boolean; concurrency?: string }) => {
    try {
      const validateCommand = new ValidateCommand();
      await validateCommand.execute(itemName, options);
    } catch (error) {
      console.log();
      ora().fail(`错误：${(error as Error).message}`);
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
  .option('--deltas-only', '仅显示增量 (仅JSON, 更改)')
  .option('--requirements-only', 'deltas-only 的别名 (已弃用, 更改)')
  // spec-only flags
  .option('--requirements', '仅JSON: 仅显示需求 (排除场景)')
  .option('--no-scenarios', '仅JSON: 排除场景内容')
  .option('-r, --requirement <id>', '仅JSON: 按ID显示特定需求 (从1开始)')
  // allow unknown options to pass-through to underlying command implementation
  .allowUnknownOption(true)
  .action(async (itemName?: string, options?: { json?: boolean; type?: string; noInteractive?: boolean; [k: string]: any }) => {
    try {
      const showCommand = new ShowCommand();
      await showCommand.execute(itemName, options ?? {});
    } catch (error) {
      console.log();
      ora().fail(`错误：${(error as Error).message}`);
      process.exit(1);
    }
  });

// Completion command with subcommands
const completionCmd = program
  .command('completion')
  .description('Manage shell completions for OpenSpec CLI');

completionCmd
  .command('generate [shell]')
  .description('Generate completion script for a shell (outputs to stdout)')
  .action(async (shell?: string) => {
    try {
      const completionCommand = new CompletionCommand();
      await completionCommand.generate({ shell });
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

completionCmd
  .command('install [shell]')
  .description('Install completion script for a shell')
  .option('--verbose', 'Show detailed installation output')
  .action(async (shell?: string, options?: { verbose?: boolean }) => {
    try {
      const completionCommand = new CompletionCommand();
      await completionCommand.install({ shell, verbose: options?.verbose });
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

completionCmd
  .command('uninstall [shell]')
  .description('Uninstall completion script for a shell')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(async (shell?: string, options?: { yes?: boolean }) => {
    try {
      const completionCommand = new CompletionCommand();
      await completionCommand.uninstall({ shell, yes: options?.yes });
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Hidden command for machine-readable completion data
program
  .command('__complete <type>', { hidden: true })
  .description('Output completion data in machine-readable format (internal use)')
  .action(async (type: string) => {
    try {
      const completionCommand = new CompletionCommand();
      await completionCommand.complete({ type });
    } catch (error) {
      // Silently fail for graceful shell completion experience
      process.exitCode = 1;
    }
  });

program.parse();
