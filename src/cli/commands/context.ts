import { Command, Option } from 'commander';
import { COMMAND_REGISTRY } from '../../core/completions/command-registry.js';
import { COMMON_FLAGS } from '../../core/completions/shared-flags.js';
import type { ContextOptions } from '../../commands/context.js';

export function registerContextCommand(program: Command): void {
  const description =
    COMMAND_REGISTRY.find((entry) => entry.name === 'context')?.description ??
    '打印已解析 OpenSpec 根目录的工作上下文';

  program
    .command('context')
    .description(description)
    .option('--store <id>', COMMON_FLAGS.store.description)
    .addOption(
      new Option('--store-path <path>', '已移除；请注册该 store 并使用 --store').hideHelp()
    )
    .option('--json', '以 JSON 格式输出代理简报')
    .option('--code-workspace <path>', '同时为此集合写入 VS Code 工作区文件')
    .option('--force', '覆盖已有的 --code-workspace 文件')
    .action(async (options: ContextOptions) => {
      const { contextCommand } = await import('../../commands/context.js');
      await contextCommand(options);
    });
}
