import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CompletionCommand } from '../../src/commands/completion.js';
import * as shellDetection from '../../src/utils/shell-detection.js';

// Mock the shell detection module
vi.mock('../../src/utils/shell-detection.js', () => ({
  detectShell: vi.fn(),
}));

// Mock the ZshInstaller
vi.mock('../../src/core/completions/installers/zsh-installer.js', () => ({
  ZshInstaller: vi.fn().mockImplementation(() => ({
    install: vi.fn().mockResolvedValue({
      success: true,
      installedPath: '/home/user/.oh-my-zsh/completions/_openspec',
      isOhMyZsh: true,
      message: '补全脚本已成功安装至 Oh My Zsh',
      instructions: [
        '补全脚本已安装至 Oh My Zsh 补全目录。',
        '请重启 Shell 或运行：exec zsh',
        '补全脚本应会自动生效。',
      ],
    }),
    uninstall: vi.fn().mockResolvedValue({
      success: true,
      message: '已从 /home/user/.oh-my-zsh/completions/_openspec 移除补全脚本',
    }),
  })),
}));

describe('CompletionCommand', () => {
  let command: CompletionCommand;
  let consoleLogSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    command = new CompletionCommand();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    process.exitCode = 0;
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('generate subcommand', () => {
    it('should generate Zsh completion script to stdout', async () => {
      await command.generate({ shell: 'zsh' });

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('#compdef openspec');
      expect(output).toContain('_openspec() {');
    });

    it('should auto-detect Zsh shell when no shell specified', async () => {
      vi.mocked(shellDetection.detectShell).mockReturnValue({ shell: 'zsh', detected: 'zsh' });

      await command.generate({});

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('#compdef openspec');
    });

    it('should show error when shell cannot be auto-detected', async () => {
      vi.mocked(shellDetection.detectShell).mockReturnValue({ shell: undefined, detected: undefined });

      await command.generate({});

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '错误：无法自动检测 Shell。请明确指定 Shell。'
      );
      expect(process.exitCode).toBe(1);
    });

    it('should show error for unsupported shell', async () => {
      await command.generate({ shell: 'tcsh' });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "错误：Shell 'tcsh' 暂不支持。当前支持的 Shell 有：zsh, bash, fish, powershell"
      );
      expect(process.exitCode).toBe(1);
    });

    it('should handle shell parameter case-insensitively', async () => {
      await command.generate({ shell: 'ZSH' });

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('#compdef openspec');
    });
  });

  describe('install subcommand', () => {
    it('should install Zsh completion script', async () => {
      await command.install({ shell: 'zsh' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('补全脚本已成功安装')
      );
      expect(process.exitCode).toBe(0);
    });

    it('should show verbose output when --verbose flag is provided', async () => {
      await command.install({ shell: 'zsh', verbose: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('安装至：')
      );
    });

    it('should auto-detect Zsh shell when no shell specified', async () => {
      vi.mocked(shellDetection.detectShell).mockReturnValue({ shell: 'zsh', detected: 'zsh' });

      await command.install({});

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('补全脚本已成功安装')
      );
    });

    it('should show error when shell cannot be auto-detected', async () => {
      vi.mocked(shellDetection.detectShell).mockReturnValue({ shell: undefined, detected: undefined });

      await command.install({});

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '错误：无法自动检测 Shell。请明确指定 Shell。'
      );
      expect(process.exitCode).toBe(1);
    });

    it('should show error for unsupported shell', async () => {
      await command.install({ shell: 'tcsh' });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "错误：Shell 'tcsh' 暂不支持。当前支持的 Shell 有：zsh, bash, fish, powershell"
      );
      expect(process.exitCode).toBe(1);
    });

    it('should display installation instructions', async () => {
      await command.install({ shell: 'zsh' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('请重启 Shell 或运行：exec zsh')
      );
    });
  });

  describe('uninstall subcommand', () => {
    it('should uninstall Zsh completion script', async () => {
      await command.uninstall({ shell: 'zsh', yes: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('移除补全脚本')
      );
      expect(process.exitCode).toBe(0);
    });

    it('should auto-detect Zsh shell when no shell specified', async () => {
      vi.mocked(shellDetection.detectShell).mockReturnValue({ shell: 'zsh', detected: 'zsh' });

      await command.uninstall({ yes: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('移除补全脚本')
      );
    });

    it('should show error when shell cannot be auto-detected', async () => {
      vi.mocked(shellDetection.detectShell).mockReturnValue({ shell: undefined, detected: undefined });

      await command.uninstall({ yes: true });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '错误：无法自动检测 Shell。请明确指定 Shell。'
      );
      expect(process.exitCode).toBe(1);
    });

    it('should show error for unsupported shell', async () => {
      await command.uninstall({ shell: 'tcsh', yes: true });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "错误：Shell 'tcsh' 暂不支持。当前支持的 Shell 有：zsh, bash, fish, powershell"
      );
      expect(process.exitCode).toBe(1);
    });
  });

  describe('error handling', () => {
    it('should handle installation failures gracefully', async () => {
      const { ZshInstaller } = await import('../../src/core/completions/installers/zsh-installer.js');
      vi.mocked(ZshInstaller).mockImplementationOnce(() => ({
        install: vi.fn().mockResolvedValue({
          success: false,
          isOhMyZsh: false,
          message: 'Permission denied',
        }),
        uninstall: vi.fn(),
        isInstalled: vi.fn(),
        getInstallationInfo: vi.fn(),
        isOhMyZshInstalled: vi.fn(),
        getInstallationPath: vi.fn(),
        backupExistingFile: vi.fn(),
      } as any));

      const cmd = new CompletionCommand();
      await cmd.install({ shell: 'zsh' });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Permission denied')
      );
      expect(process.exitCode).toBe(1);
    });

    it('should handle uninstallation failures gracefully', async () => {
      const { ZshInstaller } = await import('../../src/core/completions/installers/zsh-installer.js');
      vi.mocked(ZshInstaller).mockImplementationOnce(() => ({
        install: vi.fn(),
        uninstall: vi.fn().mockResolvedValue({
          success: false,
          message: 'Completion script is not installed',
        }),
        isInstalled: vi.fn(),
        getInstallationInfo: vi.fn(),
        isOhMyZshInstalled: vi.fn(),
        getInstallationPath: vi.fn(),
        backupExistingFile: vi.fn(),
      } as any));

      const cmd = new CompletionCommand();
      await cmd.uninstall({ shell: 'zsh', yes: true });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Completion script is not installed')
      );
      expect(process.exitCode).toBe(1);
    });
  });

  describe('shell detection integration', () => {
    it('should show appropriate error when detected shell is unsupported', async () => {
      vi.mocked(shellDetection.detectShell).mockReturnValue({ shell: undefined, detected: 'tcsh' });

      await command.generate({});

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "错误：Shell 'tcsh' 暂不支持。当前支持的 Shell 有：zsh, bash, fish, powershell"
      );
      expect(process.exitCode).toBe(1);
    });

    it('should respect explicit shell parameter over auto-detection', async () => {
      vi.mocked(shellDetection.detectShell).mockReturnValue({ shell: undefined, detected: 'bash' });

      await command.generate({ shell: 'zsh' });

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('#compdef openspec');
    });
  });
});
