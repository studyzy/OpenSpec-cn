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
    try {
      const stat = await fs.stat(this.ohMyZshRoot());
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Oh My Zsh exports its root as $ZSH; honor a custom location, or the
   * completion lands in a ~/.oh-my-zsh tree that nothing ever loads.
   */
  private ohMyZshRoot(): string {
    return process.env.ZSH || path.join(this.homeDir, '.oh-my-zsh');
  }

  /**
   * The custom dir is separately relocatable via $ZSH_CUSTOM.
   */
  private ohMyZshCustomDir(): string {
    return process.env.ZSH_CUSTOM || path.join(this.ohMyZshRoot(), 'custom');
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
        path: path.join(this.ohMyZshCustomDir(), 'completions', '_openspec'),
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
      '# OpenSpec shell completions configuration',
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
      console.debug(`无法为补全配置 .zshrc：${error.message}`);
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
      console.debug(`无法移除 .zshrc 配置：${error.message}`);
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
            message: '补全脚本已安装（已是最新）',
            instructions: [
              '补全脚本已安装且是最新版本。',
              '如果补全不工作，尝试：exec zsh',
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

      // Auto-configure .zshrc for standard Zsh only.
      // Oh My Zsh loads custom/completions and runs compinit itself.
      let zshrcConfigured = false;
      if (!isOhMyZsh) {
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
          ? 'Oh My Zsh 补全脚本安装成功'
          : zshrcConfigured
            ? '补全脚本安装成功且 .zshrc 已配置'
            : 'Zsh 补全脚本安装成功';
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
        message: `安装补全脚本失败：${error instanceof Error ? error.message : String(error)}`,
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
    // One fpath entry per line, matched as a literal: a relocated $ZSH_CUSTOM
    // need not contain "custom/completions", and the path may hold characters
    // grep would otherwise read as a pattern. Single-quoted for the shell.
    const quotedDir = `'${completionsDir.replace(/'/g, `'\\''`)}'`;
    return [
      '注意：Oh My Zsh 通常会自动从 custom/completions 加载补全。',
      `通过运行以下命令验证 ${completionsDir} 是否在你的 fpath 中：`,
      `  printf '%s\\n' $fpath | grep -F ${quotedDir}`,
      '',
      '如果未找到，补全可能不工作。重启 shell 以确保更改生效。',
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
        '补全脚本已安装到 Oh My Zsh completions 目录。',
        '重启 shell 或运行：exec zsh',
        '补全应自动激活。',
      ];
    } else {
      const completionsDir = path.dirname(installedPath);
      const zshrcPath = path.join(this.homeDir, '.zshrc');

      return [
        '补全脚本已安装到 ~/.zsh/completions/',
        '',
        '要启用补全，请将以下内容添加到你的 ~/.zshrc 文件：',
        '',
        `  # Add completions directory to fpath`,
        `  fpath=(${completionsDir} $fpath)`,
        '',
        '  # Initialize completion system',
        '  autoload -Uz compinit',
        '  compinit',
        '',
        '然后重启 shell 或运行：exec zsh',
        '',
        `添加前检查这些行是否已存在于 ${zshrcPath} 中。`,
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
        messages.push(`补全脚本已从 ${targetPath} 移除`);
      }
      if (zshrcCleaned && !isOhMyZsh) {
        messages.push('已从 ~/.zshrc 移除 OpenSpec 配置');
      }

      return {
        success: true,
        message: messages.join('. '),
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
