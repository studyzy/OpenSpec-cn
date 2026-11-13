import { Command, Option } from 'commander';
import { COMMAND_REGISTRY } from '../../core/completions/command-registry.js';
import type { StoreDiagnostic } from '../../core/store/errors.js';
import { printJson } from '../../commands/shared-output.js';
import type {
  WorksetCommand,
  WorksetCreateOptions,
  WorksetOpenOptions,
  WorksetRemoveOptions,
} from '../../commands/workset.js';

async function loadWorksetCommand(): Promise<WorksetCommand> {
  const { WorksetCommand } = await import('../../commands/workset.js');
  return new WorksetCommand();
}

function collectMember(value: string, previous: string[]): string[] {
  return [...previous, value];
}

export function registerWorksetCommand(program: Command): void {
  const groupDescription =
    COMMAND_REGISTRY.find((entry) => entry.name === 'workset')?.description ??
    '组合、保存和打开个人工作视图（纯本地）';
  const workset = program.command('workset').description(groupDescription);
  // Parsed at the group level so `openspec workset --json` keeps the
  // one-JSON-document contract instead of a raw Commander error. The
  // parent option matches anywhere; actions read optsWithGlobals().
  workset.addOption(new Option('--json', '以 JSON 格式输出').hideHelp());

  workset
    .command('create [name]')
    .description('组合并保存一个您选择的文件夹命名工作视图')
    .option(
      '--member <member>',
      '成员文件夹，格式为 <path> 或 <name>=<path>；可重复，第一个为主目录',
      collectMember,
      [] as string[]
    )
    .option('--tool <id>', '打开此 workset 的首选工具')
    .option('--json', '以 JSON 格式输出')
    .action(async (name: string | undefined, _options: WorksetCreateOptions, command: Command) => {
      const worksetCommand = await loadWorksetCommand();
      await worksetCommand.create(name, command.optsWithGlobals());
    });

  workset
    .command('list')
    .alias('ls')
    .description('显示已保存的 worksets 及其成员')
    .option('--json', '以 JSON 格式输出')
    .action(async (_options: { json?: boolean }, command: Command) => {
      const worksetCommand = await loadWorksetCommand();
      await worksetCommand.list(command.optsWithGlobals());
    });

  workset
    .command('open <name>')
    .description('在您的工具中打开已保存的 workset（编辑器窗口或代理会话）')
    .option('--tool <id>', '仅本次使用此工具打开')
    .addOption(
      // Parsed so Commander never owns the error; rejected in the
      // action with one JSON document. Hidden because help should not
      // advertise a mode that only rejects.
      new Option('--json', 'open 不支持').hideHelp()
    )
    .action(async (name: string, _options: WorksetOpenOptions, command: Command) => {
      const worksetCommand = await loadWorksetCommand();
      await worksetCommand.open(name, command.optsWithGlobals());
    });

  workset
    .command('remove <name>')
    .description('删除已保存的 workset（成员文件夹不会被触及）')
    .option('--yes', '非交互式确认删除')
    .option('--json', '以 JSON 格式输出')
    .action(async (name: string, _options: WorksetRemoveOptions, command: Command) => {
      const worksetCommand = await loadWorksetCommand();
      await worksetCommand.remove(name, command.optsWithGlobals());
    });

  const subcommandsLine = workset.commands
    .map((subcommand) => {
      const aliases = subcommand.aliases();
      return aliases.length > 0
        ? `${subcommand.name()} (${aliases.join(', ')})`
        : subcommand.name();
    })
    .join(', ');

  // One handler owns missing AND unknown subcommands: known
  // subcommands dispatch above; everything else lands in this action
  // (allowExcessArguments routes the unknown operand here), keeping
  // the one-JSON-document contract for `--json` probes.
  workset.allowExcessArguments(true);
  workset.action(() => {
    const attempted = workset.args.filter(
      (operand) => !operand.startsWith('-')
    );
    const message =
      attempted.length > 0
        ? `未知命令 '${attempted[0]}'（属于 'openspec-cn workset'）。workset 子命令：${subcommandsLine}。`
        : `缺少子命令（'openspec-cn workset'）。workset 子命令：${subcommandsLine}。`;
    if (workset.opts().json) {
      printJson({
        status: [
          {
            severity: 'error',
            code: 'unknown_workset_subcommand',
            message,
            fix: '运行某个 workset 子命令。',
          } satisfies StoreDiagnostic,
        ],
      });
    } else {
      console.error(`Error: ${message}`);
    }
    process.exitCode = 1;
  });
}
