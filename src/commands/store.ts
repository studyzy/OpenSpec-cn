import * as os from 'node:os';
import { asErrorMessage, emitFailure, printJson } from './shared-output.js';
import * as path from 'node:path';
import { Command } from 'commander';

import { COMMAND_REGISTRY } from '../core/completions/command-registry.js';

import {
  StoreError,
  doctorStores,
  listStores,
  prepareStoreSetup,
  prepareStoreCleanup,
  registerExistingStore,
  removeStore,
  resolveSetupGitEnabled,
  setupPreparedStore,
  unregisterStore,
  validateStoreId,
  type StoreCleanupResult,
  type StoreDiagnostic,
  type StoreDoctorResult,
  type StoreInfo,
  type StoreInspection,
  type StoreListResult,
  type StoreMutationResult,
  type SetupStoreInput,
} from '../core/store/index.js';
import { isInteractive } from '../utils/interactive.js';

interface StoreSetupOptions {
  path?: string;
  initGit?: boolean;
  json?: boolean;
  remote?: string;
}

interface StoreRegisterOptions {
  id?: string;
  yes?: boolean;
  json?: boolean;
}

interface StoreRemoveOptions {
  yes?: boolean;
  json?: boolean;
}

interface StoreJsonOptions {
  json?: boolean;
}

interface ResolvedStoreSetupInput extends SetupStoreInput {
  id: string;
}

interface StoreOutput {
  id: string;
  root: string;
  metadata_path?: string;
}

interface StoreMutationOutput {
  store: StoreOutput | null;
  registry: {
    path: string;
    registered: boolean;
    already_registered: boolean;
  } | null;
  git: {
    is_repository: boolean;
    initialized: boolean;
    committed: boolean;
  } | null;
  created_files: string[];
  status: StoreDiagnostic[];
}

interface StoreCleanupOutput {
  store: StoreOutput | null;
  registry: {
    path: string;
    removed: boolean;
  } | null;
  files: {
    deleted: boolean;
    deleted_path: string | null;
    left_on_disk: string | null;
  } | null;
  status: StoreDiagnostic[];
}

interface StoreListOutput {
  stores: StoreOutput[];
  status: StoreDiagnostic[];
}

type OpenSpecRootOutput = Omit<StoreInspection['openspecRoot'], 'diagnostics'> & {
  status: StoreDiagnostic[];
};

interface StoreDoctorStoreOutput extends StoreOutput {
  openspec_root: OpenSpecRootOutput;
  metadata: StoreInspection['metadata'];
  git: {
    is_repository: boolean | null;
    has_commits: boolean | null;
    has_uncommitted_changes: boolean | null;
    has_remote: boolean | null;
    origin_url: string | null;
  };
  status: StoreDiagnostic[];
}

interface StoreDoctorOutput {
  stores: StoreDoctorStoreOutput[];
  status: StoreDiagnostic[];
}





function toStoreOutput(store: StoreInfo): StoreOutput {
  return {
    id: store.id,
    root: store.root,
    ...(store.metadataPath ? { metadata_path: store.metadataPath } : {}),
  };
}

function toMutationOutput(result: StoreMutationResult): StoreMutationOutput {
  return {
    store: toStoreOutput(result.store),
    registry: {
      path: result.registryCommit.path,
      registered: result.registryCommit.registered,
      already_registered: result.registryCommit.alreadyRegistered,
    },
    git: {
      is_repository: result.git.isRepository,
      initialized: result.git.initialized,
      committed: result.git.committed,
    },
    created_files: result.createdArtifacts,
    status: result.diagnostics,
  };
}

function toCleanupOutput(result: StoreCleanupResult): StoreCleanupOutput {
  return {
    store: toStoreOutput(result.store),
    registry: {
      path: result.registryCommit.path,
      removed: result.registryCommit.removed,
    },
    files: {
      deleted: result.files.deleted,
      deleted_path: result.files.deletedPath ?? null,
      left_on_disk: result.files.leftOnDisk ?? null,
    },
    status: result.diagnostics,
  };
}

function toListOutput(result: StoreListResult): StoreListOutput {
  return {
    stores: result.stores.map(toStoreOutput),
    status: [],
  };
}

function toOpenSpecRootOutput(root: StoreInspection['openspecRoot']): OpenSpecRootOutput {
  return {
    present: root.present,
    config: root.config,
    specs: root.specs,
    changes: root.changes,
    archive: root.archive,
    healthy: root.healthy,
    status: root.diagnostics,
  };
}

function toDoctorStoreOutput(store: StoreInspection): StoreDoctorStoreOutput {
  return {
    ...toStoreOutput(store),
    openspec_root: toOpenSpecRootOutput(store.openspecRoot),
    metadata: store.metadata,
    git: {
      is_repository: store.git.isRepository,
      has_commits: store.git.hasCommits,
      has_uncommitted_changes: store.git.hasUncommittedChanges,
      has_remote: store.git.hasRemote,
      origin_url: store.git.originUrl,
    },
    status: store.diagnostics,
  };
}

function toDoctorOutput(result: StoreDoctorResult): StoreDoctorOutput {
  return {
    stores: result.stores.map(toDoctorStoreOutput),
    status: result.diagnostics,
  };
}





function formatPathForHuman(targetPath: string): string {
  const home = os.homedir();
  const normalizedHome = path.resolve(home);
  const normalizedTarget = path.resolve(targetPath);

  if (normalizedTarget === normalizedHome) return '~';
  if (normalizedTarget.startsWith(`${normalizedHome}${path.sep}`)) {
    return `~${path.sep}${path.relative(normalizedHome, normalizedTarget)}`;
  }

  return targetPath;
}

async function promptStoreId(): Promise<string> {
  const { input } = await import('@inquirer/prompts');

  return input({
    message: 'Store 名称',
    required: true,
    validate(value: string) {
      try {
        validateStoreId(value);
        return true;
      } catch (error) {
        return asErrorMessage(error);
      }
    },
  });
}

async function promptStorePath(id: string): Promise<string> {
  const { input } = await import('@inquirer/prompts');
  // Suggest a visible, user-owned location — never the managed XDG data dir.
  const defaultPath = ['~', 'openspec', id].join('/');

  return input({
    message: '此 store 应存放在哪里？',
    default: defaultPath,
    prefill: 'editable',
    required: true,
  });
}

async function resolveSetupInput(
  id: string | undefined,
  options: StoreSetupOptions
): Promise<ResolvedStoreSetupInput> {
  const interactive = !options.json && isInteractive();

  if (!id && !interactive) {
    throw new StoreError(
      '请传入 store 名称。',
      'store_setup_id_required',
      {
        target: 'store.id',
        fix: 'openspec-cn store setup <id> --path ~/openspec/<id> --json',
      }
    );
  }

  if (options.path === undefined && !interactive) {
    throw new StoreError(
      '请传递 --path 参数指定此 store 所在的文件夹。',
      'store_setup_path_required',
      {
        target: 'store.root',
        fix: `openspec-cn store setup ${id ?? '<id>'} --path ~/openspec/${id ?? '<id>'}`,
      }
    );
  }

  const resolvedId = id ? validateStoreId(id) : await promptStoreId();
  const promptedPath = options.path === undefined
    ? await promptStorePath(resolvedId)
    : undefined;

  return {
    id: resolvedId,
    path: options.path ?? promptedPath,
    ...(options.remote !== undefined ? { remote: options.remote } : {}),
  };
}

async function prepareSetupInput(
  input: ResolvedStoreSetupInput,
  options: StoreSetupOptions
) {
  return prepareStoreSetup({
    ...input,
    ...(options.initGit !== undefined ? { initGit: options.initGit } : {}),
  });
}

async function confirmSetup(
  prepared: Awaited<ReturnType<typeof prepareStoreSetup>>,
  initGit: boolean
): Promise<void> {
  const { confirm } = await import('@inquirer/prompts');

  console.log('');
  console.log('OpenSpec 将创建:');
  console.log('');
  console.log(`  Store: ${prepared.id}`);
  console.log(`  位置: ${formatPathForHuman(prepared.root)}`);
  console.log(`  Git: ${initGit ? '已初始化' : '未初始化'}`);
  console.log('');

  const confirmed = await confirm({
    message: '创建此 store？',
    default: true,
  });

  if (!confirmed) {
    throw new StoreError(
      'Store 设置已取消。',
      'store_setup_cancelled',
      {
        target: 'store.root',
        fix: '准备好后重新运行 setup。',
      }
    );
  }
}

async function confirmRemove(id: string, root: string, options: StoreRemoveOptions): Promise<void> {
  if (options.yes) return;

  if (options.json || !isInteractive()) {
    throw new StoreError(
      '请传递 --yes 以非交互式删除 store 文件。',
      'store_remove_confirmation_required',
      {
        target: 'store.root',
        fix: `openspec-cn store remove ${id} --yes`,
      }
    );
  }

  const { confirm } = await import('@inquirer/prompts');
  const confirmed = await confirm({
    message: `删除本地 store 文件夹 ${formatPathForHuman(root)}？`,
    default: false,
  });

  if (!confirmed) {
    throw new StoreError(
      'Store 删除已取消。',
      'store_remove_cancelled',
      {
        target: 'store.root',
        fix: '如果只想清除本地注册记录，运行 "openspec-cn store unregister <id>"。',
      }
    );
  }
}

function isRegisterIdentityConfirmationError(error: unknown): boolean {
  return (
    error instanceof StoreError &&
    error.diagnostic.code === 'store_register_identity_confirmation_required'
  );
}

async function confirmRegisterConversion(error: unknown): Promise<void> {
  const { confirm } = await import('@inquirer/prompts');
  const confirmed = await confirm({
    message: asErrorMessage(error),
    default: false,
  });

  if (!confirmed) {
    throw new StoreError(
      'Store 注册已取消。',
      'store_register_cancelled',
      {
        target: 'store.metadata',
        fix: '准备好创建 store 身份元数据后重新运行 register。',
      }
    );
  }
}

function printMutationHuman(
  title: string,
  payload: StoreMutationOutput,
  remotes?: { canonical?: string; observed?: string }
): void {
  if (!payload.store || !payload.registry || !payload.git) {
    return;
  }

  console.log(`${title}: ${payload.store.id}`);
  console.log(`位置: ${formatPathForHuman(payload.store.root)}`);
  console.log('OpenSpec 根目录: 就绪');
  console.log(`注册表: ${payload.registry.already_registered ? '已注册' : '已注册'}`);
  for (const status of payload.status) {
    console.log(`${status.severity === 'error' ? '问题' : '备注'}: ${status.message}`);
  }
  console.log('');
  console.log('下一步: 对此 store 运行常规 OpenSpec 命令，例如:');
  console.log(`  openspec-cn new change <change-id> --store ${payload.store.id}`);
  if (payload.git.is_repository) {
    const shareRemote = remotes?.canonical ?? remotes?.observed;
    console.log(
      shareRemote
        ? `分享方式: 团队成员克隆 ${shareRemote} 然后运行 openspec-cn store register <path>。`
        : '像普通 Git 仓库一样提交并推送此 store 来分享。'
    );
  }
}

function printCleanupHuman(title: string, payload: StoreCleanupOutput): void {
  if (!payload.store || !payload.registry || !payload.files) {
    return;
  }

  console.log(`${title}: ${payload.store.id}`);

  if (payload.files.deleted_path) {
    console.log(`已删除: ${formatPathForHuman(payload.files.deleted_path)}`);
  } else if (payload.files.left_on_disk) {
    console.log(`文件保留在: ${formatPathForHuman(payload.files.left_on_disk)}`);
  } else if (!payload.files.deleted) {
    console.log(`文件已不存在: ${formatPathForHuman(payload.store.root)}`);
  }

  for (const status of payload.status) {
    console.log(`${status.severity === 'error' ? '问题' : '备注'}: ${status.message}`);
  }
}

function printListHuman(payload: StoreListOutput): void {
  if (payload.stores.length === 0) {
    console.log('没有已注册的 store。');
    console.log('');
    console.log('下一步:');
    console.log('  openspec-cn store setup team-context --path ~/openspec/team-context');
    console.log('  openspec-cn store register /path/to/store');
    return;
  }

  console.log(`OpenSpec stores（共 ${payload.stores.length} 个）`);
  console.log('');
  console.log(`${'ID'.padEnd(16)}位置`);
  for (const store of payload.stores) {
    console.log(`${store.id.padEnd(16)}${store.root}`);
  }
}

function formatMetadataHuman(store: StoreDoctorOutput['stores'][number]): string {
  if (store.metadata.valid) return '正常';
  if (store.metadata.present === false) return '缺失';
  if (store.metadata.present === null) return '未知';
  return '无效';
}

function formatDoctorGitHuman(store: StoreDoctorOutput['stores'][number]): string {
  if (store.git.is_repository === null) return '未知';
  if (!store.git.is_repository) return '未检测到';

  const fact = (value: boolean | null, yes: string, no: string): string =>
    value === null ? '未知' : value ? yes : no;

  return `检测到仓库 (提交: ${fact(store.git.has_commits, '有', '无')}, 未提交更改: ${fact(store.git.has_uncommitted_changes, '有', '无')}, 远程: ${fact(store.git.has_remote, '有', '无')})`;
}

function formatOpenSpecRootHuman(store: StoreDoctorOutput['stores'][number]): string {
  if (store.openspec_root.healthy) return '正常';
  if (store.openspec_root.present === false) return '缺失';
  if (store.openspec_root.present === null) return '未知';
  return '不完整';
}

function printDoctorHuman(payload: StoreDoctorOutput): void {
  if (payload.stores.length === 0) {
    console.log('没有已注册的 store。');
    return;
  }

  console.log('Store 诊断');
  for (const store of payload.stores) {
    console.log('');
    console.log(store.id);
    console.log(`  位置: ${store.root}`);
    console.log(`  OpenSpec 根目录: ${formatOpenSpecRootHuman(store)}`);
    console.log(`  元数据: ${formatMetadataHuman(store)}`);
    const remoteLine = store.metadata.remote ?? store.git.origin_url;
    if (remoteLine) {
      console.log(`  远程: ${remoteLine}`);
    }
    console.log(`  Git: ${formatDoctorGitHuman(store)}`);

    if (store.status.length === 0) {
      console.log('  问题: 无');
      continue;
    }

    console.log('  问题:');
    for (const status of store.status) {
      console.log(`    - ${status.message}`);
      if (status.fix) {
        console.log(`      修复: ${status.fix}`);
      }
    }
  }
}

class StoreCommand {
  async setup(id: string | undefined, options: StoreSetupOptions = {}): Promise<void> {
    try {
      const setupInput = await resolveSetupInput(id, options);
      const prepared = await prepareSetupInput(setupInput, options);
      const initGit = resolveSetupGitEnabled(prepared, options.initGit);
      if (!options.json && isInteractive()) {
        await confirmSetup(prepared, initGit);
      }
      const result = await setupPreparedStore(prepared, { initGit });
      const payload = toMutationOutput(result);

      if (options.json) {
        printJson(payload);
        return;
      }

      printMutationHuman('Store 已就绪', payload, result.remotes);
    } catch (error) {
      this.handleFailure(
        options.json,
        { store: null, registry: null, git: null, created_files: [], status: [] },
        error
      );
    }
  }

  async register(inputPath: string | undefined, options: StoreRegisterOptions = {}): Promise<void> {
    try {
      let result: StoreMutationResult;
      try {
        result = await registerExistingStore({
          path: inputPath,
          id: options.id,
          allowCreateIdentity: options.yes,
        });
      } catch (error) {
        if (!isRegisterIdentityConfirmationError(error) || options.json || !isInteractive()) {
          throw error;
        }

        await confirmRegisterConversion(error);
        result = await registerExistingStore({
          path: inputPath,
          id: options.id,
          allowCreateIdentity: true,
        });
      }

      const payload = toMutationOutput(result);

      if (options.json) {
        printJson(payload);
        return;
      }

      printMutationHuman('Store 已注册', payload, result.remotes);
    } catch (error) {
      this.handleFailure(
        options.json,
        { store: null, registry: null, git: null, created_files: [], status: [] },
        error
      );
    }
  }

  async unregister(id: string, options: StoreJsonOptions = {}): Promise<void> {
    try {
      const payload = toCleanupOutput(await unregisterStore({ id }));

      if (options.json) {
        printJson(payload);
        return;
      }

      printCleanupHuman('已注销 store', payload);
    } catch (error) {
      this.handleFailure(
        options.json,
        { store: null, registry: null, files: null, status: [] },
        error
      );
    }
  }

  async remove(id: string, options: StoreRemoveOptions = {}): Promise<void> {
    try {
      const target = await prepareStoreCleanup({ id });
      await confirmRemove(target.id, target.root, options);
      const payload = toCleanupOutput(await removeStore(target));

      if (options.json) {
        printJson(payload);
        return;
      }

      printCleanupHuman('已删除 store', payload);
    } catch (error) {
      this.handleFailure(
        options.json,
        { store: null, registry: null, files: null, status: [] },
        error
      );
    }
  }

  async list(options: StoreJsonOptions = {}): Promise<void> {
    try {
      const payload = toListOutput(await listStores());

      if (options.json) {
        printJson(payload);
        return;
      }

      printListHuman(payload);
    } catch (error) {
      this.handleFailure(options.json, { stores: [], status: [] }, error);
    }
  }

  async doctor(id: string | undefined, options: StoreJsonOptions = {}): Promise<void> {
    try {
      const payload = toDoctorOutput(await doctorStores(id));

      if (options.json) {
        printJson(payload);
        return;
      }

      printDoctorHuman(payload);
    } catch (error) {
      this.handleFailure(options.json, { stores: [], status: [] }, error);
    }
  }

  private handleFailure<T extends { status: StoreDiagnostic[] }>(
    json: boolean | undefined,
    payload: T,
    error: unknown
  ): void {
    emitFailure(json, payload, error, 'store_error');
  }
}

export function registerStoreCommand(program: Command): void {
  const storeCommand = new StoreCommand();
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
      await storeCommand.setup(id, options);
    });

  store
    .command('register [path]')
    .description('注册现有的本地 store')
    .option('--id <id>', 'Store id；默认使用元数据或文件夹名称')
    .option('--yes', '确认为健康的 OpenSpec 根目录创建 store 身份元数据')
    .option('--json', '以 JSON 格式输出')
    .action(async (inputPath: string | undefined, options: StoreRegisterOptions) => {
      await storeCommand.register(inputPath, options);
    });

  store
    .command('unregister <id>')
    .description('清除本地 store 注册记录而不删除文件')
    .option('--json', '以 JSON 格式输出')
    .action(async (id: string, options: StoreJsonOptions) => {
      await storeCommand.unregister(id, options);
    });

  store
    .command('remove <id>')
    .description('清除本地 store 注册记录并删除其本地文件夹')
    .option('--yes', '确认删除本地 store 文件夹')
    .option('--json', '以 JSON 格式输出')
    .action(async (id: string, options: StoreRemoveOptions) => {
      await storeCommand.remove(id, options);
    });

  store
    .command('list')
    .alias('ls')
    .description('列出本地已注册的 stores')
    .option('--json', '以 JSON 格式输出')
    .action(async (options: StoreJsonOptions) => {
      await storeCommand.list(options);
    });

  store
    .command('doctor [id]')
    .description('检查本地 store 注册和元数据')
    .option('--json', '以 JSON 格式输出')
    .action(async (id: string | undefined, options: StoreJsonOptions) => {
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
