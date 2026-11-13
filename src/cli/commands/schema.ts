import { Command } from 'commander';

/**
 * Register the schema command and all its subcommands.
 */
export function registerSchemaCommand(program: Command): void {
  const schemaCmd = program
    .command('schema')
    .description('管理工作流 Schema [实验性]');

  // Experimental warning
  schemaCmd.hook('preAction', () => {
    console.error('注意：Schema 命令处于实验阶段，可能会发生变化。');
  });

  // schema which
  schemaCmd
    .command('which [name]')
    .description('显示 Schema 的解析来源')
    .option('--json', '以 JSON 格式输出')
    .option('--all', '列出所有 Schema 及其解析来源')
    .action(async (name?: string, options?: { json?: boolean; all?: boolean }) => {
      const { schemaWhichCommand } = await import('../../commands/schema.js');
      await schemaWhichCommand(name, options);
    });

  // schema validate
  schemaCmd
    .command('validate [name]')
    .description('验证 Schema 结构和模板')
    .option('--json', '以 JSON 格式输出')
    .option('--verbose', '显示详细验证步骤')
    .action(async (name?: string, options?: { json?: boolean; verbose?: boolean }) => {
      const { schemaValidateCommand } = await import('../../commands/schema.js');
      await schemaValidateCommand(name, options);
    });

  // schema fork
  schemaCmd
    .command('fork <source> [name]')
    .description('复制现有 Schema 到项目中以进行自定义')
    .option('--json', '以 JSON 格式输出')
    .option('--force', '覆盖现有目标')
    .action(async (source: string, name?: string, options?: { json?: boolean; force?: boolean }) => {
      const { schemaForkCommand } = await import('../../commands/schema.js');
      await schemaForkCommand(source, name, options);
    });

  // schema init
  schemaCmd
    .command('init <name>')
    .description('创建一个新的项目本地 Schema')
    .option('--json', '以 JSON 格式输出')
    .option('--description <text>', 'Schema 描述')
    .option('--artifacts <list>', '逗号分隔的 Artifact ID (proposal,specs,design,tasks)')
    .option('--default', '设为项目默认 Schema')
    .option('--no-default', '不提示设为默认')
    .option('--force', '覆盖现有 Schema')
    .action(async (
      name: string,
      options?: {
        json?: boolean;
        description?: string;
        artifacts?: string;
        default?: boolean;
        force?: boolean;
      }
    ) => {
      const { schemaInitCommand } = await import('../../commands/schema.js');
      await schemaInitCommand(name, options);
    });
}
