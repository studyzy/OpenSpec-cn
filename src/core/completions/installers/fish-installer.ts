import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { FileSystemUtils } from '../../../utils/file-system.js';
import { InstallationResult } from '../factory.js';

/**
 * Installer for Fish completion scripts.
 * Fish 会自动从 ~/.config/fish/completions/ 加载补全
 */
export class FishInstaller {
  private readonly homeDir: string;

  constructor(homeDir: string = os.homedir()) {
    this.homeDir = homeDir;
  }

  /**
   * Get the installation path for Fish completions
   *
   * @returns Installation path
   */
  getInstallationPath(): string {
    return path.join(this.homeDir, '.config', 'fish', 'completions', 'openspec.fish');
  }

  /**
   * Check if a completion script is currently installed.
   * Mirrors ZshInstaller.isInstalled so callers can ask any installer.
   *
   * @returns true if the completion script exists
   */
  async isInstalled(): Promise<boolean> {
    try {
      // stat, not access: a directory at the install path is not a script.
      return (await fs.stat(this.getInstallationPath())).isFile();
    } catch {
      return false;
    }
  }

  /**
   * Backup an existing completion file if it exists
   *
   * @param targetPath - Path to the file to backup
   * @returns Path to the backup file, or undefined if no backup was needed
   */
  async backupExistingFile(targetPath: string): Promise<string | undefined> {
    try {
      await fs.access(targetPath);
      // File exists, create a backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `${targetPath}.backup-${timestamp}`;
      await fs.copyFile(targetPath, backupPath);
      return backupPath;
    } catch {
      // File doesn't exist, no backup needed
      return undefined;
    }
  }

  /**
   * Install the completion script
   *
   * @param completionScript - The completion script content to install
   * @returns Installation result with status and instructions
   */
  async install(completionScript: string): Promise<InstallationResult> {
    try {
      const targetPath = this.getInstallationPath();

      // Check if already installed with same content
      let isUpdate = false;
      try {
        const existingContent = await fs.readFile(targetPath, 'utf-8');
        if (existingContent === completionScript) {
          // Already installed and up to date
          return {
            success: true,
            installedPath: targetPath,
            message: '补全脚本已安装（已是最新）',
            instructions: [
              '补全脚本已安装且是最新版本。',
              'Fish 会自动加载补全 - 应立即可用。',
            ],
          };
        }
        // File exists but content is different - this is an update
        isUpdate = true;
      } catch (error: any) {
        // File doesn't exist or can't be read, proceed with installation
        console.debug(`无法读取已存在的补全文件：${targetPath}: ${error.message}`);
      }

      if (!(await FileSystemUtils.canWriteFile(targetPath))) {
        throw new Error(`路径不可写：${targetPath}`);
      }

      // Ensure the directory exists
      const targetDir = path.dirname(targetPath);
      await fs.mkdir(targetDir, { recursive: true });

      // Backup existing file if updating
      const backupPath = isUpdate ? await this.backupExistingFile(targetPath) : undefined;

      // Write the completion script
      await fs.writeFile(targetPath, completionScript, 'utf-8');

      // Determine appropriate message
      let message: string;
      if (isUpdate) {
        message = backupPath
          ? '补全脚本更新成功（已备份旧版本）'
          : '补全脚本更新成功';
      } else {
        message = 'Fish 补全脚本安装成功';
      }

      return {
        success: true,
        installedPath: targetPath,
        backupPath,
        message,
        instructions: [
          'Fish 会自动从 ~/.config/fish/completions/ 加载补全',
          '补全立即可用 - 无需重启 shell。',
        ],
      };
    } catch (error) {
      return {
        success: false,
        message: `安装补全脚本失败：${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Uninstall the completion script
   *
   * @param options - Optional uninstall options
   * @param options.yes - Skip confirmation prompt (handled by command layer)
   * @returns Uninstallation result
   */
  async uninstall(options?: { yes?: boolean }): Promise<{ success: boolean; message: string }> {
    try {
      const targetPath = this.getInstallationPath();

      // Check if installed
      try {
        await fs.access(targetPath);
      } catch {
        return {
          success: false,
          message: '补全脚本未安装',
        };
      }

      const targetDir = path.dirname(targetPath);
      if (!(await FileSystemUtils.canWriteFile(targetDir))) {
        throw new Error(`路径不可写：${targetDir}`);
      }

      // Remove the completion script
      await fs.unlink(targetPath);

      return {
        success: true,
        message: '补全脚本卸载成功',
      };
    } catch (error) {
      return {
        success: false,
        message: `卸载补全脚本失败：${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}
