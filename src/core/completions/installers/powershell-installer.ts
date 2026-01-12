import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { FileSystemUtils } from '../../../utils/file-system.js';
import { InstallationResult } from '../factory.js';

/**
 * Installer for PowerShell completion scripts.
 * Works with both Windows PowerShell 5.1 and PowerShell Core 7+
 */
export class PowerShellInstaller {
  private readonly homeDir: string;

  /**
   * Markers for PowerShell profile configuration management
   */
  private readonly PROFILE_MARKERS = {
    start: '# OPENSPEC:START',
    end: '# OPENSPEC:END',
  };

  constructor(homeDir: string = os.homedir()) {
    this.homeDir = homeDir;
  }

  /**
   * Get PowerShell profile path
   * Prefers $PROFILE environment variable, falls back to platform defaults
   *
   * @returns Profile path
   */
  getProfilePath(): string {
    // Check $PROFILE environment variable (set when running in PowerShell)
    if (process.env.PROFILE) {
      return process.env.PROFILE;
    }

    // Fall back to platform-specific defaults
    if (process.platform === 'win32') {
      // Windows: Documents/PowerShell/Microsoft.PowerShell_profile.ps1
      return path.join(this.homeDir, 'Documents', 'PowerShell', 'Microsoft.PowerShell_profile.ps1');
    } else {
      // macOS/Linux: .config/powershell/Microsoft.PowerShell_profile.ps1
      return path.join(this.homeDir, '.config', 'powershell', 'Microsoft.PowerShell_profile.ps1');
    }
  }

  /**
   * Get all PowerShell profile paths to configure.
   * On Windows, returns both PowerShell Core and Windows PowerShell 5.1 paths.
   * On Unix, returns PowerShell Core path only.
   */
  private getAllProfilePaths(): string[] {
    // If PROFILE env var is set, use only that path
    if (process.env.PROFILE) {
      return [process.env.PROFILE];
    }

    if (process.platform === 'win32') {
      return [
        // PowerShell Core 6+ (cross-platform)
        path.join(this.homeDir, 'Documents', 'PowerShell', 'Microsoft.PowerShell_profile.ps1'),
        // Windows PowerShell 5.1 (Windows-only)
        path.join(this.homeDir, 'Documents', 'WindowsPowerShell', 'Microsoft.PowerShell_profile.ps1'),
      ];
    } else {
      // Unix systems: PowerShell Core only
      return [path.join(this.homeDir, '.config', 'powershell', 'Microsoft.PowerShell_profile.ps1')];
    }
  }

  /**
   * Get the installation path for the completion script
   *
   * @returns Installation path
   */
  getInstallationPath(): string {
    const profilePath = this.getProfilePath();
    const profileDir = path.dirname(profilePath);
    return path.join(profileDir, 'OpenSpecCompletion.ps1');
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
   * Generate PowerShell profile configuration content
   *
   * @param scriptPath - Path to the completion script
   * @returns Configuration content
   */
  private generateProfileConfig(scriptPath: string): string {
    return [
      '# OpenSpec shell 补全配置',
      `if (Test-Path "${scriptPath}") {`,
      `    . "${scriptPath}"`,
      '}',
    ].join('\n');
  }

  /**
   * Configure PowerShell profile to source the completion script
   *
   * @param scriptPath - Path to the completion script
   * @returns true if configured successfully, false otherwise
   */
  async configureProfile(scriptPath: string): Promise<boolean> {
    const profilePaths = this.getAllProfilePaths();
    let anyConfigured = false;

    for (const profilePath of profilePaths) {
      try {
        // Create profile file if it doesn't exist
        const profileDir = path.dirname(profilePath);
        await fs.mkdir(profileDir, { recursive: true });

        let profileContent = '';
        try {
          profileContent = await fs.readFile(profilePath, 'utf-8');
        } catch {
          // Profile doesn't exist yet, that's fine
        }

        // Check if already configured
        const scriptLine = `. "${scriptPath}"`;
        if (profileContent.includes(scriptLine)) {
          continue; // Already configured, skip
        }

        // Add OpenSpec completion configuration with markers
        const openspecBlock = [
          '',
          '# OPENSPEC:START - OpenSpec 补全（管理块，请勿手动编辑）',
          scriptLine,
          '# OPENSPEC:END',
          '',
        ].join('\n');

        const newContent = profileContent + openspecBlock;
        await fs.writeFile(profilePath, newContent, 'utf-8');
        anyConfigured = true;
      } catch (error) {
        // Continue to next profile if this one fails
        console.warn(`Warning: Could not configure ${profilePath}: ${error}`);
      }
    }

    return anyConfigured;
  }

  /**
   * Remove PowerShell profile configuration
   * Used during uninstallation
   *
   * @returns true if removed successfully, false otherwise
   */
  async removeProfileConfig(): Promise<boolean> {
    const profilePaths = this.getAllProfilePaths();
    let anyRemoved = false;

    for (const profilePath of profilePaths) {
      try {
        // Read profile content
        let profileContent: string;
        try {
          profileContent = await fs.readFile(profilePath, 'utf-8');
        } catch {
          continue; // Profile doesn't exist, nothing to remove
        }

        // Remove OPENSPEC:START -> OPENSPEC:END block
        const startMarker = '# OPENSPEC:START';
        const endMarker = '# OPENSPEC:END';
        const startIndex = profileContent.indexOf(startMarker);

        if (startIndex === -1) {
          continue; // No OpenSpec block found
        }

        const endIndex = profileContent.indexOf(endMarker, startIndex);
        if (endIndex === -1) {
          console.warn(`Warning: Found start marker but no end marker in ${profilePath}`);
          continue;
        }

        // Remove the block (including markers and surrounding newlines)
        const beforeBlock = profileContent.substring(0, startIndex);
        const afterBlock = profileContent.substring(endIndex + endMarker.length);

        // Clean up extra newlines
        const newContent = (beforeBlock.trimEnd() + '\n' + afterBlock.trimStart()).trim() + '\n';

        await fs.writeFile(profilePath, newContent, 'utf-8');
        anyRemoved = true;
      } catch (error) {
        console.warn(`Warning: Could not clean ${profilePath}: ${error}`);
      }
    }

    return anyRemoved;
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
            message: '补全脚本已安装（已是最新版本）',
            instructions: [
              '补全脚本已安装，且已是最新版本。',
              '如果补全未生效，请尝试重启 PowerShell 或运行：. $PROFILE',
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

      // Auto-configure PowerShell profile
      const profileConfigured = await this.configureProfile(targetPath);

      // Generate instructions if profile wasn't auto-configured
      const instructions = profileConfigured ? undefined : this.generateInstructions(targetPath);

      // Determine appropriate message
      let message: string;
      if (isUpdate) {
        message = backupPath
          ? '补全脚本更新成功（已备份旧版本）'
          : '补全脚本更新成功';
      } else {
        message = profileConfigured
          ? '补全脚本安装成功，并已自动配置 PowerShell 配置文件'
          : '已成功为 PowerShell 安装补全脚本';
      }

      return {
        success: true,
        installedPath: targetPath,
        backupPath,
        profileConfigured,
        message,
        instructions,
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
    const profilePath = this.getProfilePath();

    return [
      '补全脚本安装成功。',
      '',
      `如需启用补全，请在您的 PowerShell 配置文件 (${profilePath}) 中添加以下内容：`,
      '',
      '  # 加载 OpenSpec 补全',
      `  if (Test-Path "${installedPath}") {`,
      `      . "${installedPath}"`,
      '  }',
      '',
      '然后重启 PowerShell 或运行：. $PROFILE',
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

      // Remove the completion script
      await fs.unlink(targetPath);

      // Remove profile configuration
      await this.removeProfileConfig();

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
