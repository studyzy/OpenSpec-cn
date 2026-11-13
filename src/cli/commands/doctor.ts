import { Command, Option } from 'commander';
import { COMMAND_REGISTRY } from '../../core/completions/command-registry.js';
import { COMMON_FLAGS } from '../../core/completions/shared-flags.js';
import type { DoctorOptions } from '../../commands/doctor.js';

export function registerDoctorCommand(program: Command): void {
  const description =
    COMMAND_REGISTRY.find((entry) => entry.name === 'doctor')?.description ??
    '报告已解析的 OpenSpec 根目录的关系健康状况';

  program
    .command('doctor')
    .description(description)
    .option('--store <id>', COMMON_FLAGS.store.description)
    .addOption(
      new Option('--store-path <path>', '已移除；请注册该 store 并使用 --store').hideHelp()
    )
    .option('--json', '以 JSON 格式输出')
    .action(async (options: DoctorOptions) => {
      const { doctorCommand } = await import('../../commands/doctor.js');
      await doctorCommand(options);
    });
}
