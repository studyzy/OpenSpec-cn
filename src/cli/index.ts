import { Command } from 'commander';
import { createRequire } from 'module';
import ora from 'ora';
import path from 'path';
import { promises as fs } from 'fs';
import { InitCommand } from '../core/init.js';
import { AI_TOOLS } from '../core/config.js';
import { UpdateCommand } from '../core/update.js';
import { ListCommand } from '../core/list.js';
import { ArchiveCommand } from '../core/archive.js';
import { ViewCommand } from '../core/view.js';
import { registerSpecCommand } from '../commands/spec.js';
import { ChangeCommand } from '../commands/change.js';
import { ValidateCommand } from '../commands/validate.js';
import { ShowCommand } from '../commands/show.js';

const program = new Command();
const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

program
  .name('openspec')
  .description('基于规范驱动开发的AI原生系统')
  .version(version);

// Global options
program.option('--no-color', '禁用彩色输出');

// Apply global flags before any command runs
program.hook('preAction', (thisCommand) => {
  const opts = thisCommand.opts();
  if (opts.noColor) {
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
          throw new Error(`Path "${targetPath}" is not a directory`);
        }
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          // Directory doesn't exist, but we can create it
          console.log(`目录 "${targetPath}" 不存在，将被创建。`);
        } else if (error.message && error.message.includes('not a directory')) {
          throw error;
        } else {
          throw new Error(`Cannot access path "${targetPath}": ${error.message}`);
        }
      }
      
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
  console.error('警告："openspec change ..." 命令已弃用。请优先使用动词开头的命令（例如 "openspec list", "openspec validate --changes"）。');
});

changeCmd
  .command('show [change-name]')
  .description('以JSON或markdown格式显示变更提案')
  .option('--json', 'Output as JSON')
  .option('--deltas-only', 'Show only deltas (JSON only)')
  .option('--requirements-only', 'Alias for --deltas-only (deprecated)')
  .option('--no-interactive', 'Disable interactive prompts')
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
  .description('列出所有活动更改（已弃用：请使用 "openspec list"）')
  .option('--json', 'Output as JSON')
  .option('--long', 'Show id and title with counts')
  .action(async (options?: { json?: boolean; long?: boolean }) => {
    try {
      console.error('警告："openspec change list" 已弃用。请使用 "openspec list"。');
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
  .option('--strict', 'Enable strict validation mode')
  .option('--json', 'Output validation report as JSON')
  .option('--no-interactive', 'Disable interactive prompts')
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

// Top-level validate command
program
  .command('validate [item-name]')
  .description('验证更改和规范')
  .option('--all', '验证所有更改和规范')
  .option('--changes', '验证所有更改')
  .option('--specs', '验证所有规范')
  .option('--type <type>', '当项目类型不明确时指定类型：change|spec')
  .option('--strict', 'Enable strict validation mode')
  .option('--json', 'Output validation results as JSON')
  .option('--concurrency <n>', 'Max concurrent validations (defaults to env OPENSPEC_CONCURRENCY or 6)')
  .option('--no-interactive', 'Disable interactive prompts')
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
  .option('--json', 'Output as JSON')
  .option('--type <type>', '当项目类型不明确时指定类型：change|spec')
  .option('--no-interactive', 'Disable interactive prompts')
  // change-only flags
  .option('--deltas-only', 'Show only deltas (JSON only, change)')
  .option('--requirements-only', 'Alias for --deltas-only (deprecated, change)')
  // spec-only flags
  .option('--requirements', 'JSON only: Show only requirements (exclude scenarios)')
  .option('--no-scenarios', 'JSON only: Exclude scenario content')
  .option('-r, --requirement <id>', 'JSON only: Show specific requirement by ID (1-based)')
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

program.parse();
