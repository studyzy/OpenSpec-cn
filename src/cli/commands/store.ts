import { Command } from 'commander';
import { COMMAND_REGISTRY } from '../../core/completions/command-registry.js';
import { printJson } from '../../commands/shared-output.js';
import type {
  StoreCommand,
  StoreJsonOptions,
  StoreRegisterOptions,
  StoreRemoveOptions,
  StoreSetupOptions,
} from '../../commands/store.js';

async function loadStoreCommand(): Promise<StoreCommand> {
  const { StoreCommand } = await import('../../commands/store.js');
  return new StoreCommand();
}

export function registerStoreCommand(program: Command): void {
  // One source for the locked group one-liner: the completions registry
  // entry, which shell completion scripts also consume.
  const storeGroupDescription =
    COMMAND_REGISTRY.find((entry) => entry.name === 'store')?.description ??
    '创建和管理 stores - 您在本机上注册的独立 OpenSpec 仓库';
  const store = program.command('store').description(storeGroupDescription);

  store
    .command('setup [id]')
    .description('创建并注册本地 store')
    .option('--path <path>', 'Store 存放的文件夹（例如 ~/openspec/<id>)')
    .option('--init-git', '初始化 Git 仓库并创建初始提交（默认）')
    .option('--no-init-git', '跳过所有 Git 操作：不初始化，不创建初始提交')
    .option('--remote <url>', '记录在 store.yaml 中的规范克隆源')
    .option('--json', '以 JSON 格式输出')
    .action(async (id: string | undefined, options: StoreSetupOptions) => {
      const storeCommand = await loadStoreCommand();
      await storeCommand.setup(id, options);
    });

  store
    .command('register [path]')
    .description('注册现有的本地 store')
    .option('--id <id>', 'Store id；默认使用元数据或文件夹名称')
    .option('--yes', '确认为健康的 OpenSpec 根目录创建 store 身份元数据')
    .option('--json', '以 JSON 格式输出')
    .action(async (inputPath: string | undefined, options: StoreRegisterOptions) => {
      const storeCommand = await loadStoreCommand();
      await storeCommand.register(inputPath, options);
    });

  store
    .command('unregister <id>')
    .description('清除本地 store 注册记录而不删除文件')
    .option('--json', '以 JSON 格式输出')
    .action(async (id: string, options: StoreJsonOptions) => {
      const storeCommand = await loadStoreCommand();
      await storeCommand.unregister(id, options);
    });

  store
    .command('remove <id>')
    .description('清除本地 store 注册记录并删除其本地文件夹')
    .option('--yes', '确认删除本地 store 文件夹')
    .option('--json', '以 JSON 格式输出')
    .action(async (id: string, options: StoreRemoveOptions) => {
      const storeCommand = await loadStoreCommand();
      await storeCommand.remove(id, options);
    });

  store
    .command('list')
    .alias('ls')
    .description('列出本地已注册的 stores')
    .option('--json', '以 JSON 格式输出')
    .action(async (options: StoreJsonOptions) => {
      const storeCommand = await loadStoreCommand();
      await storeCommand.list(options);
    });

  store
    .command('doctor [id]')
    .description('检查本地 store 注册和元数据')
    .option('--json', '以 JSON 格式输出')
    .action(async (id: string | undefined, options: StoreJsonOptions) => {
      const storeCommand = await loadStoreCommand();
      await storeCommand.doctor(id, options);
    });

  const lifecycleRedirects = new Set(
    COMMAND_REGISTRY.filter(
      (entry) =>
        entry.flags.some((flag) => flag.name === 'store') ||
        (entry.subcommands ?? []).some((subcommand) =>
          subcommand.flags.some((flag) => flag.name === 'store')
        )
    ).map((entry) => entry.name)
  );
  const storeSubcommandsLine = store.commands
    .map((subcommand) => {
      const aliases = subcommand.aliases();
      return aliases.length > 0 ? `${subcommand.name()} (${aliases.join(', ')})` : subcommand.name();
    })
    .join(', ');
  // One group action owns missing AND unknown subcommands. Known
  // subcommands dispatch above; everything else — including a bare
  // `store --json` with no operand — lands here, so the handler owns the
  // entire message and exit path (same text for human and --json). The
  // permissive flags route unknown operands/options here instead of
  // letting Commander emit a raw error before the action runs. We detect
  // `--json` in the residual args rather than declaring a group option,
  // which would otherwise shadow each subcommand's own `--json` flag.
  store.allowExcessArguments(true);
  store.allowUnknownOption(true);
  store.action(() => {
    const operands = store.args;
    // Flag values are indistinguishable from operands without a full
    // parse, so the verbatim echo only applies to plain-operand input.
    const attempted = operands.filter((operand) => !operand.startsWith('-'));
    const hasFlagLikeToken = operands.some((operand) => operand.startsWith('-'));
    // The agent contract: --json failures emit one JSON document.
    if (operands.includes('--json')) {
      const message =
        attempted.length > 0
          ? `未知命令 '${attempted[0]}'（属于 'openspec-cn store'）。store 子命令：${storeSubcommandsLine}。`
          : `缺少子命令（'openspec-cn store'）。store 子命令：${storeSubcommandsLine}。`;
      printJson({
        status: [
          {
            severity: 'error',
            code: 'unknown_store_subcommand',
            message,
            fix: '运行某个 store 子命令，或使用带 --store <id> 的生命周期命令。',
          },
        ],
      });
      process.exitCode = 1;
      return;
    }
    let example = 'openspec-cn new change <change-id> --store <id>';
    if (!hasFlagLikeToken && attempted.length > 0 && lifecycleRedirects.has(attempted[0])) {
      if (attempted[0] === 'new') {
        const changeId = attempted[1] === 'change' && attempted[2] ? attempted[2] : '<change-id>';
        example = `openspec-cn new change ${changeId} --store <id>`;
      } else {
        example = `openspec-cn ${attempted.join(' ')} --store <id>`;
      }
    }
    console.error(
      attempted.length > 0
        ? `错误: 'openspec-cn store' 的未知命令 '${attempted[0]}'。`
        : "错误: 缺少 'openspec-cn store' 的子命令。"
    );
    console.error(
      `Store 子命令用于管理 store 注册: ${storeSubcommandsLine}.`
    );
    console.error(
      '要在 store 中创建或处理变更，请使用带有 --store 的普通命令，例如:'
    );
    console.error(`  ${example}`);
    process.exitCode = 1;
  });
}
