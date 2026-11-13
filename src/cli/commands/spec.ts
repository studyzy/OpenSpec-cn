import { Command } from 'commander';
import type { ShowOptions } from '../../commands/spec.js';

export function registerSpecCommand(rootProgram: Command) {
  const specCommand = rootProgram
    .command('spec')
    .description('管理和查看OpenSpec规范');

  // Deprecation notice for noun-based commands
  specCommand.hook('preAction', () => {
    console.error('警告："openspec-cn spec ..." 命令已弃用。请使用动词开头的命令（例如："openspec-cn show"、"openspec-cn validate --specs"）。');
  });

  specCommand
    .command('show [spec-id]')
    .description('显示特定规范')
    .option('--json', '以 JSON 格式输出')
    .option('--requirements', '仅 JSON：仅显示需求（排除场景）')
    .option('--no-scenarios', '仅 JSON：排除场景内容')
    .option('-r, --requirement <id>', '仅 JSON：按 ID 显示特定需求（从 1 开始）')
    .option('--no-interactive', '禁用交互式提示')
    .action(async (specId: string | undefined, options: ShowOptions & { noInteractive?: boolean }) => {
      const { specShowCommand } = await import('../../commands/spec.js');
      await specShowCommand(specId, options);
    });

  specCommand
    .command('list')
    .description('列出所有可用的规范')
    .option('--json', '以 JSON 格式输出')
    .option('--long', '显示 id 和 title 及计数')
    .action(async (options: { json?: boolean; long?: boolean }) => {
      const { specListCommand } = await import('../../commands/spec.js');
      await specListCommand(options);
    });

  specCommand
    .command('validate [spec-id]')
    .description('验证规范结构')
    .option('--strict', '启用严格验证模式')
    .option('--json', '以JSON格式输出验证报告')
    .option('--no-interactive', '禁用交互式提示')
    .action(async (specId: string | undefined, options: { strict?: boolean; json?: boolean; noInteractive?: boolean }) => {
      const { specValidateCommand } = await import('../../commands/spec.js');
      await specValidateCommand(specId, options);
    });

  return specCommand;
}
