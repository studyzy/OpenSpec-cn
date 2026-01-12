import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { FileSystemUtils } from '../../../utils/file-system.js';
import { InstallationResult } from '../factory.js';

/**
 * Installer for Bash completion scripts.
 * Supports bash-completion package and standalone installations.
 */
export class BashInstaller {
  private readonly homeDir: string;

  /**
   * Markers for .bashrc configuration management
   */
  private readonly BASHRC_MARKERS = {
    start: '# OPENSPEC:START',
    end: '# OPENSPEC:END',
  };

  constructor(homeDir: string = os.homedir()) {
    this.homeDir = homeDir;
  }

  /**
   * Check if bash-completion is installed
   *
   * @returns true if bash-completion directories exist
   */
  async isBashCompletionInstalled(): Promise<boolean> {
    const paths = [
      '/usr/share/bash-completion',              // Linux system-wide
      '/usr/local/share/bash-completion',        // Homebrew Intel (main)
      '/opt/homebrew/etc/bash_completion.d',     // Homebrew Apple Silicon
      '/usr/local/etc/bash_completion.d',        // Homebrew Intel (alt path)
      '/etc/bash_completion.d',                   // Legacy fallback
    ];

    for (const p of paths) {
      try {
        const stat = await fs.stat(p);
        if (stat.isDirectory()) {
          return true;
        }
      } catch {
        // Continue checking other paths
      }
    }

    return false;
  }

  /**
   * Get the appropriate installation path for the completion script
   *
   * @returns Installation path
   */
  async getInstallationPath(): Promise<string> {
    // Try user-local bash-completion directory first
    const localCompletionDir = path.join(this.homeDir, '.local', 'share', 'bash-completion', 'completions');

    // For user installation, use local directory
    return path.join(localCompletionDir, 'openspec');
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
   * Get the path to .bashrc file
   *
   * @returns Path to .bashrc
   */
  private getBashrcPath(): string {
    return path.join(this.homeDir, '.bashrc');
  }

  /**
   * Generate .bashrc configuration content
   *
   * @param completionsDir - Directory containing completion scripts
   * @returns Configuration content
   */
  private generateBashrcConfig(completionsDir: string): string {
    return [
      '# OpenSpec shell 补全配置',
      `if [ -d "${completionsDir}" ]; then`,
      `  for f in "${completionsDir}"/*; do`,
      '    [ -f "$f" ] && . "$f"',
      '  done',
      'fi',
    ].join('\n');
  }

  /**
   * Configure .bashrc to enable completions
   *
   * @param completionsDir - Directory containing completion scripts
   * @returns true if configured successfully, false otherwise
   */
  async configureBashrc(completionsDir: string): Promise<boolean> {
    // Check if auto-configuration is disabled
    if (process.env.OPENSPEC_NO_AUTO_CONFIG === '1') {
      return false;
    }

    try {
      const bashrcPath = this.getBashrcPath();
      const config = this.generateBashrcConfig(completionsDir);

      // Check write permissions
      const canWrite = await FileSystemUtils.canWriteFile(bashrcPath);
      if (!canWrite) {
        return false;
      }

      // Use marker-based update
      await FileSystemUtils.updateFileWithMarkers(
        bashrcPath,
        config,
        this.BASHRC_MARKERS.start,
        this.BASHRC_MARKERS.end
      );

      return true;
    } catch (error: any) {
      // Fail gracefully - don't break installation
      console.debug(`Unable to configure .bashrc for completions: ${error.message}`);
      return false;
    }
  }

  /**
   * Remove .bashrc configuration
   * Used during uninstallation
   *
   * @returns true if removed successfully, false otherwise
   */
  async removeBashrcConfig(): Promise<boolean> {
    try {
      const bashrcPath = this.getBashrcPath();

      // Check if file exists
      try {
        await fs.access(bashrcPath);
      } catch {
        // File doesn't exist, nothing to remove
        return true;
      }

      // Read file content
      const content = await fs.readFile(bashrcPath, 'utf-8');

      // Check if markers exist
      if (!content.includes(this.BASHRC_MARKERS.start) || !content.includes(this.BASHRC_MARKERS.end)) {
        // Markers don't exist, nothing to remove
        return true;
      }

      // Remove content between markers (including markers)
      const lines = content.split('\n');
      const startIndex = lines.findIndex((line) => line.trim() === this.BASHRC_MARKERS.start);
      const endIndex = lines.findIndex((line) => line.trim() === this.BASHRC_MARKERS.end);

      if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        // Invalid marker placement
        return false;
      }

      // Remove lines between markers (inclusive)
      lines.splice(startIndex, endIndex - startIndex + 1);

      // Remove trailing empty lines
      while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
        lines.pop();
      }

      // Write back
      await fs.writeFile(bashrcPath, lines.join('\n'), 'utf-8');

      return true;
    } catch (error: any) {
      // Fail gracefully
      console.debug(`Unable to remove .bashrc configuration: ${error.message}`);
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
      const targetPath = await this.getInstallationPath();

      // Check for bash-completion package
      const hasBashCompletion = await this.isBashCompletionInstalled();

      // Check if already installed with same content
      let isUpdate = false;
      try {
        const existingContent = await fs.readFile(targetPath, 'utf-8');
        if (existingContent === completionScript) {
          // Already installed and up to date
          return {
            success: true,
            installedPath: targetPath,
            message: '补全脚本已安装（已是最新版本）',
            instructions: [
              '补全脚本已安装，且已是最新版本。',
              '如果补全未生效，请尝试运行：exec bash',
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

      // Auto-configure .bashrc
      const bashrcConfigured = await this.configureBashrc(targetDir);

      // Generate instructions if .bashrc wasn't auto-configured
      const instructions = bashrcConfigured ? undefined : this.generateInstructions(targetPath);

      // Collect warnings
      const warnings: string[] = [];
      if (!hasBashCompletion) {
        warnings.push(
          '⚠️  警告：未检测到 bash-completion 包',
          '',
          '补全脚本需要 bash-completion 才能运行。',
          '请使用以下命令安装：',
          '  brew install bash-completion@2',
          '',
          '然后添加以下内容到您的 ~/.bash_profile：',
          '  [[ -r "/opt/homebrew/etc/profile.d/bash_completion.sh" ]] && . "/opt/homebrew/etc/profile.d/bash_completion.sh"'
        );
      }

      // Determine appropriate message
      let message: string;
      if (isUpdate) {
        message = backupPath
          ? '补全脚本更新成功（已备份旧版本）'
          : '补全脚本更新成功';
      } else {
        message = bashrcConfigured
          ? '补全脚本安装成功，并已自动配置 .bashrc'
          : '已成功为 Bash 安装补全脚本';
      }

      return {
        success: true,
        installedPath: targetPath,
        backupPath,
        bashrcConfigured,
        message,
        instructions,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to install completion script: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Generate user instructions for enabling completions
   *
   * @param installedPath - Path where the script was installed
   * @returns Array of instruction strings
   */
  private generateInstructions(installedPath: string): string[] {
    const completionsDir = path.dirname(installedPath);

    return [
      '补全脚本安装成功。',
      '',
      '如需启用补全，请在您的 ~/.bashrc 文件中添加以下内容：',
      '',
      `  # 加载 OpenSpec 补全`,
      `  if [ -d "${completionsDir}" ]; then`,
      `    for f in "${completionsDir}"/*; do`,
      '      [ -f "$f" ] && . "$f"',
      '    done',
      '  fi',
      '',
      '然后重启 Shell 或运行：exec bash',
    ];
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
      const targetPath = await this.getInstallationPath();

      // Check if installed
      try {
        await fs.access(targetPath);
      } catch {
        return {
          success: false,
          message: '补全脚本未安装',
        };
      }

      // Remove the completion script
      await fs.unlink(targetPath);

      // Remove .bashrc configuration
      await this.removeBashrcConfig();

      return {
        success: true,
        message: '补全脚本已成功卸载',
      };
    } catch (error) {
      return {
        success: false,
        message: `卸载补全脚本失败：${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}
