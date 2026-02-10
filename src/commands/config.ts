import { Command } from 'commander';
import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import {
  getGlobalConfigPath,
  getGlobalConfig,
  saveGlobalConfig,
  GlobalConfig,
} from '../core/global-config.js';
import {
  getNestedValue,
  setNestedValue,
  deleteNestedValue,
  coerceValue,
  formatValueYaml,
  validateConfigKeyPath,
  validateConfig,
  DEFAULT_CONFIG,
} from '../core/config-schema.js';

/**
 * Register the config command and all its subcommands.
 *
 * @param program - The Commander program instance
 */
export function registerConfigCommand(program: Command): void {
  const configCmd = program
    .command('config')
    .description('查看并修改全局 OpenSpec 配置')
    .option('--scope <scope>', '配置作用域（目前仅支持 "global"）')
    .hook('preAction', (thisCommand) => {
      const opts = thisCommand.opts();
      if (opts.scope && opts.scope !== 'global') {
        console.error('错误：项目级配置尚未实现');
        process.exit(1);
      }
    });

  // config path
  configCmd
    .command('path')
    .description('显示配置文件位置')
    .action(() => {
      console.log(getGlobalConfigPath());
    });

  // config list
  configCmd
    .command('list')
    .description('显示当前所有设置')
    .option('--json', '以 JSON 格式输出')
    .action((options: { json?: boolean }) => {
      const config = getGlobalConfig();

      if (options.json) {
        console.log(JSON.stringify(config, null, 2));
      } else {
        console.log(formatValueYaml(config));
      }
    });

  // config get
  configCmd
    .command('get <key>')
    .description('获取特定值（原始格式，可用于脚本）')
    .action((key: string) => {
      const config = getGlobalConfig();
      const value = getNestedValue(config as Record<string, unknown>, key);

      if (value === undefined) {
        process.exitCode = 1;
        return;
      }

      if (typeof value === 'object' && value !== null) {
        console.log(JSON.stringify(value));
      } else {
        console.log(String(value));
      }
    });

  // config set
  configCmd
    .command('set <key> <value>')
    .description('设置值（自动转换类型）')
    .option('--string', '强制将值存为字符串')
    .option('--allow-unknown', '允许设置未知的键')
    .action((key: string, value: string, options: { string?: boolean; allowUnknown?: boolean }) => {
      const allowUnknown = Boolean(options.allowUnknown);
      const keyValidation = validateConfigKeyPath(key);
      if (!keyValidation.valid && !allowUnknown) {
        const reason = keyValidation.reason ? ` ${keyValidation.reason}。` : '';
        console.error(`错误：无效的配置键 "${key}"。${reason}`);
        console.error('使用 "openspec-cn config list" 查看可用键。');
        console.error('传递 --allow-unknown 以跳过此检查。');
        process.exitCode = 1;
        return;
      }

      const config = getGlobalConfig() as Record<string, unknown>;
      const coercedValue = coerceValue(value, options.string || false);

      // Create a copy to validate before saving
      const newConfig = JSON.parse(JSON.stringify(config));
      setNestedValue(newConfig, key, coercedValue);

      // Validate the new config
      const validation = validateConfig(newConfig);
      if (!validation.success) {
        console.error(`错误：无效配置 - ${validation.error}`);
        process.exitCode = 1;
        return;
      }

      // Apply changes and save
      setNestedValue(config, key, coercedValue);
      saveGlobalConfig(config as GlobalConfig);

      const displayValue =
        typeof coercedValue === 'string' ? `"${coercedValue}"` : String(coercedValue);
      console.log(`设置 ${key} = ${displayValue}`);
    });

  // config unset
  configCmd
    .command('unset <key>')
    .description('移除键（恢复为默认值）')
    .action((key: string) => {
      const config = getGlobalConfig() as Record<string, unknown>;
      const existed = deleteNestedValue(config, key);

      if (existed) {
        saveGlobalConfig(config as GlobalConfig);
        console.log(`已重置 ${key}（恢复为默认值）`);
      } else {
        console.log(`键 "${key}" 未设置`);
      }
    });

  // config reset
  configCmd
    .command('reset')
    .description('将配置重置为默认值')
    .option('--all', '重置所有配置（必填）')
    .option('-y, --yes', '跳过确认提示')
    .action(async (options: { all?: boolean; yes?: boolean }) => {
      if (!options.all) {
        console.error('错误：重置时必须指定 --all 参数');
        console.error('用法：openspec-cn config reset --all [-y]');
        process.exitCode = 1;
        return;
      }

      if (!options.yes) {
        const { confirm } = await import('@inquirer/prompts');
        const confirmed = await confirm({
          message: '是否将所有配置重置为默认值？',
          default: false,
        });

        if (!confirmed) {
          console.log('已取消重置。');
          return;
        }
      }

      saveGlobalConfig({ ...DEFAULT_CONFIG });
      console.log('配置已重置为默认值');
    });

  // config edit
  configCmd
    .command('edit')
    .description('在 $EDITOR 中打开配置文件')
    .action(async () => {
      const editor = process.env.EDITOR || process.env.VISUAL;

      if (!editor) {
        console.error('错误：未配置编辑器');
        console.error('请将 EDITOR 或 VISUAL 环境变量设置为您首选的编辑器');
        console.error('示例：export EDITOR=vim');
        process.exitCode = 1;
        return;
      }

      const configPath = getGlobalConfigPath();

      // Ensure config file exists with defaults
      if (!fs.existsSync(configPath)) {
        saveGlobalConfig({ ...DEFAULT_CONFIG });
      }

      // Spawn editor and wait for it to close
      // Avoid shell parsing to correctly handle paths with spaces in both
      // the editor path and config path
      const child = spawn(editor, [configPath], {
        stdio: 'inherit',
        shell: false,
      });

      await new Promise<void>((resolve, reject) => {
        child.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`编辑器以状态码 ${code} 退出`));
          }
        });
        child.on('error', reject);
      });

      try {
        const rawConfig = fs.readFileSync(configPath, 'utf-8');
        const parsedConfig = JSON.parse(rawConfig);
        const validation = validateConfig(parsedConfig);

        if (!validation.success) {
          console.error(`错误：无效配置 - ${validation.error}`);
          process.exitCode = 1;
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          console.error(`错误：在 ${configPath} 未找到配置文件`);
        } else if (error instanceof SyntaxError) {
          console.error(`错误：${configPath} 中包含无效的 JSON`);
          console.error(error.message);
        } else {
          console.error(`错误：无法验证配置 - ${error instanceof Error ? error.message : String(error)}`);
        }
        process.exitCode = 1;
      }
    });
}
