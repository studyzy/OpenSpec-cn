import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { FileSystemUtils } from '../../../utils/file-system.js';
import { InstallationResult } from '../factory.js';

/**
 * Installer for Zsh completion scripts.
 * Supports both Oh My Zsh and standard Zsh configurations.
 */
export class ZshInstaller {
  private readonly homeDir: string;

  /**
   * Markers for .zshrc configuration management
   */
  private readonly ZSHRC_MARKERS = {
    start: '# OPENSPEC:START',
    end: '# OPENSPEC:END',
  };

  constructor(homeDir: string = os.homedir()) {
    this.homeDir = homeDir;
  }

  /**
   * Check if Oh My Zsh is installed
   *
   * @returns true if Oh My Zsh is detected via $ZSH env var or directory exists
   */
  async isOhMyZshInstalled(): Promise<boolean> {
    // First check for $ZSH environment variable (standard OMZ setup)
    if (process.env.ZSH) {
      return true;
    }

    // Fall back to checking for ~/.oh-my-zsh directory
    const ohMyZshPath = path.join(this.homeDir, '.oh-my-zsh');

    try {
      const stat = await fs.stat(ohMyZshPath);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Get the appropriate installation path for the completion script
   *
   * @returns Object with installation path and whether it's Oh My Zsh
   */
  async getInstallationPath(): Promise<{ path: string; isOhMyZsh: boolean }> {
    const isOhMyZsh = await this.isOhMyZshInstalled();

    if (isOhMyZsh) {
      // Oh My Zsh custom completions directory
      return {
        path: path.join(this.homeDir, '.oh-my-zsh', 'custom', 'completions', '_openspec'),
        isOhMyZsh: true,
      };
    } else {
      // Standard Zsh completions directory
      return {
        path: path.join(this.homeDir, '.zsh', 'completions', '_openspec'),
        isOhMyZsh: false,
      };
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
   * Get the path to .zshrc file
   *
   * @returns Path to .zshrc
   */
  private getZshrcPath(): string {
    return path.join(this.homeDir, '.zshrc');
  }

  /**
   * Generate .zshrc configuration content
   *
   * @param completionsDir - Directory containing completion scripts
   * @returns Configuration content
   */
  private generateZshrcConfig(completionsDir: string): string {
    return [
      '# OpenSpec shell 补全配置',
      `fpath=("${completionsDir}" $fpath)`,
      'autoload -Uz compinit',
      'compinit',
    ].join('\n');
  }

  /**
   * Configure .zshrc to enable completions
   * Only applies to standard Zsh (not Oh My Zsh)
   *
   * @param completionsDir - Directory containing completion scripts
   * @returns true if configured successfully, false otherwise
   */
  async configureZshrc(completionsDir: string): Promise<boolean> {
    // Check if auto-configuration is disabled
    if (process.env.OPENSPEC_NO_AUTO_CONFIG === '1') {
      return false;
    }

    try {
      const zshrcPath = this.getZshrcPath();
      const config = this.generateZshrcConfig(completionsDir);

      // Check write permissions
      const canWrite = await FileSystemUtils.canWriteFile(zshrcPath);
      if (!canWrite) {
        return false;
      }

      // Use marker-based update
      await FileSystemUtils.updateFileWithMarkers(
        zshrcPath,
        config,
        this.ZSHRC_MARKERS.start,
        this.ZSHRC_MARKERS.end
      );

      return true;
    } catch (error: any) {
      // Fail gracefully - don't break installation
      console.debug(`Unable to configure .zshrc for completions: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if .zshrc has OpenSpec configuration markers
   *
   * @returns true if .zshrc exists and has markers
   */
  private async hasZshrcConfig(): Promise<boolean> {
    try {
      const zshrcPath = this.getZshrcPath();
      const content = await fs.readFile(zshrcPath, 'utf-8');
      return content.includes(this.ZSHRC_MARKERS.start) && content.includes(this.ZSHRC_MARKERS.end);
    } catch {
      return false;
    }
  }

  /**
   * Check if fpath configuration is needed for a given directory
   * Used to verify if Oh My Zsh (or other) completions directory is already in fpath
   *
   * @param completionsDir - Directory to check for in fpath
   * @returns true if configuration is needed, false if directory is already referenced
   */
  private async needsFpathConfig(completionsDir: string): Promise<boolean> {
    try {
      const zshrcPath = this.getZshrcPath();
      const content = await fs.readFile(zshrcPath, 'utf-8');

      // Check if fpath already includes this directory
      return !content.includes(completionsDir);
    } catch (error) {
      // If we can't read .zshrc, assume config is needed
      console.debug(`Unable to read .zshrc to check fpath config: ${error instanceof Error ? error.message : String(error)}`);
      return true;
    }
  }

  /**
   * Remove .zshrc configuration
   * Used during uninstallation
   *
   * @returns true if removed successfully, false otherwise
   */
  async removeZshrcConfig(): Promise<boolean> {
    try {
      const zshrcPath = this.getZshrcPath();

      // Check if file exists
      try {
        await fs.access(zshrcPath);
      } catch {
        // File doesn't exist, nothing to remove
        return true;
      }

      // Read file content
      const content = await fs.readFile(zshrcPath, 'utf-8');

      // Check if markers exist
      if (!content.includes(this.ZSHRC_MARKERS.start) || !content.includes(this.ZSHRC_MARKERS.end)) {
        // Markers don't exist, nothing to remove
        return true;
      }

      // Remove content between markers (including markers)
      const lines = content.split('\n');
      const startIndex = lines.findIndex((line) => line.trim() === this.ZSHRC_MARKERS.start);
      const endIndex = lines.findIndex((line) => line.trim() === this.ZSHRC_MARKERS.end);

      if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        // Invalid marker placement
        return false;
      }

      // Remove lines between markers (inclusive)
      lines.splice(startIndex, endIndex - startIndex + 1);

      // Remove trailing empty lines at the start if the markers were at the top
      while (lines.length > 0 && lines[0].trim() === '') {
        lines.shift();
      }

      // Write back
      await fs.writeFile(zshrcPath, lines.join('\n'), 'utf-8');

      return true;
    } catch (error: any) {
      // Fail gracefully
      console.debug(`Unable to remove .zshrc configuration: ${error.message}`);
      return false;
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
      const { path: targetPath, isOhMyZsh } = await this.getInstallationPath();

      // Check if already installed with same content
      let isUpdate = false;
      try {
        const existingContent = await fs.readFile(targetPath, 'utf-8');
        if (existingContent === completionScript) {
          // Already installed and up to date
          return {
            success: true,
            installedPath: targetPath,
            isOhMyZsh,
            message: '补全脚本已安装（已是最新版本）',
            instructions: [
              '补全脚本已安装，且已是最新版本。',
              '如果补全未生效，请尝试运行：exec zsh',
            ],
          };
        }
        // File exists but content is different - this is an update
        isUpdate = true;
      } catch (error: any) {
        // File doesn't exist or can't be read, proceed with installation
        console.debug(`Unable to read existing completion file at ${targetPath}: ${error.message}`);
      }

      // Ensure the directory exists
      const targetDir = path.dirname(targetPath);
      await fs.mkdir(targetDir, { recursive: true });

      // Backup existing file if updating
      const backupPath = isUpdate ? await this.backupExistingFile(targetPath) : undefined;

      // Write the completion script
      await fs.writeFile(targetPath, completionScript, 'utf-8');

      // Auto-configure .zshrc
      let zshrcConfigured = false;
      if (isOhMyZsh) {
        // For Oh My Zsh, verify that custom/completions is in fpath
        // If not, add it to .zshrc
        const needsConfig = await this.needsFpathConfig(targetDir);
        if (needsConfig) {
          zshrcConfigured = await this.configureZshrc(targetDir);
        }
      } else {
        // Standard Zsh always needs .zshrc configuration
        zshrcConfigured = await this.configureZshrc(targetDir);
      }

      // Generate instructions (only if .zshrc wasn't auto-configured)
      let instructions = zshrcConfigured ? undefined : this.generateInstructions(isOhMyZsh, targetPath);

      // Add fpath guidance for Oh My Zsh installations
      if (isOhMyZsh) {
        const fpathGuidance = this.generateOhMyZshFpathGuidance(targetDir);
        if (fpathGuidance) {
          instructions = instructions ? [...instructions, '', ...fpathGuidance] : fpathGuidance;
        }
      }

      // Determine appropriate message based on update status
      let message: string;
      if (isUpdate) {
        message = backupPath
          ? '补全脚本更新成功（已备份旧版本）'
          : '补全脚本更新成功';
      } else {
        message = isOhMyZsh
          ? '已成功为 Oh My Zsh 安装补全脚本'
          : zshrcConfigured
            ? '补全脚本安装成功，并已自动配置 .zshrc'
            : '已成功为 Zsh 安装补全脚本';
      }

      return {
        success: true,
        installedPath: targetPath,
        backupPath,
        isOhMyZsh,
        zshrcConfigured,
        message,
        instructions,
      };
    } catch (error) {
      return {
        success: false,
        isOhMyZsh: false,
        message: `Failed to install completion script: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Generate Oh My Zsh fpath verification guidance
   *
   * @param completionsDir - Custom completions directory path
   * @returns Array of guidance strings, or undefined if not needed
   */
  private generateOhMyZshFpathGuidance(completionsDir: string): string[] | undefined {
    return [
      '注意：Oh My Zsh 通常会自动加载 custom/completions 中的补全脚本。',
      `请通过运行以下命令确认 ${completionsDir} 位于您的 fpath 中：`,
      '  echo $fpath | grep "custom/completions"',
      '',
      '如果未找到，补全功能可能无法工作。请重启 Shell 以确保更改生效。',
    ];
  }

  /**
   * Generate user instructions for enabling completions
   *
   * @param isOhMyZsh - Whether Oh My Zsh is being used
   * @param installedPath - Path where the script was installed
   * @returns Array of instruction strings
   */
  private generateInstructions(isOhMyZsh: boolean, installedPath: string): string[] {
    if (isOhMyZsh) {
      return [
        '补全脚本已安装至 Oh My Zsh 的补全目录。',
        '请重启 Shell 或运行：exec zsh',
        '补全功能应当会自动激活。',
      ];
    } else {
      const completionsDir = path.dirname(installedPath);
      const zshrcPath = path.join(this.homeDir, '.zshrc');

      return [
        '补全脚本已安装至 ~/.zsh/completions/',
        '',
        '如需启用补全，请在您的 ~/.zshrc 文件中添加以下内容：',
        '',
        `  # 将补全目录添加至 fpath`,
        `  fpath=(${completionsDir} $fpath)`,
        '',
        '  # 初始化补全系统',
        '  autoload -Uz compinit',
        '  compinit',
        '',
        '然后重启 Shell 或运行：exec zsh',
        '',
        `添加前请检查 ${zshrcPath} 中是否已存在这些行。`,
      ];
    }
  }

  /**
   * Uninstall the completion script
   *
   * @returns true if uninstalled successfully, false otherwise
   */
  async uninstall(): Promise<{ success: boolean; message: string }> {
    try {
      const { path: targetPath, isOhMyZsh } = await this.getInstallationPath();

      // Try to remove completion script
      let scriptRemoved = false;
      try {
        await fs.access(targetPath);
        await fs.unlink(targetPath);
        scriptRemoved = true;
      } catch {
        // Script not installed
      }

      // Try to remove .zshrc configuration (only for standard Zsh)
      let zshrcWasPresent = false;
      let zshrcCleaned = false;
      if (!isOhMyZsh) {
        zshrcWasPresent = await this.hasZshrcConfig();
        if (zshrcWasPresent) {
          zshrcCleaned = await this.removeZshrcConfig();
        }
      }

      if (!scriptRemoved && !zshrcWasPresent) {
        return {
          success: false,
          message: '补全脚本未安装',
        };
      }

      const messages: string[] = [];
      if (scriptRemoved) {
        messages.push(`已从 ${targetPath} 移除补全脚本`);
      }
      if (zshrcCleaned && !isOhMyZsh) {
        messages.push('已从 ~/.zshrc 移除 OpenSpec 配置');
      }

      return {
        success: true,
        message: messages.join('。'),
      };
    } catch (error) {
      return {
        success: false,
        message: `卸载补全脚本失败：${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Check if completion script is currently installed
   *
   * @returns true if the completion script exists
   */
  async isInstalled(): Promise<boolean> {
    try {
      const { path: targetPath } = await this.getInstallationPath();
      await fs.access(targetPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get information about the current installation
   *
   * @returns Installation status information
   */
  async getInstallationInfo(): Promise<{
    installed: boolean;
    path?: string;
    isOhMyZsh?: boolean;
  }> {
    const installed = await this.isInstalled();

    if (!installed) {
      return { installed: false };
    }

    const { path: targetPath, isOhMyZsh } = await this.getInstallationPath();

    return {
      installed: true,
      path: targetPath,
      isOhMyZsh,
    };
  }
}
