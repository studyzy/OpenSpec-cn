import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FeedbackCommand } from '../../src/commands/feedback.js';
import { execSync, execFileSync } from 'child_process';

// Mock child_process functions
vi.mock('child_process', () => ({
  execSync: vi.fn(),
  execFileSync: vi.fn(),
}));

describe('FeedbackCommand', () => {
  let feedbackCommand: FeedbackCommand;
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let processExitSpy: any;
  const mockExecSync = execSync as unknown as ReturnType<typeof vi.fn>;
  const mockExecFileSync = execFileSync as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    feedbackCommand = new FeedbackCommand();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null) => {
      throw new Error(`process.exit(${code})`);
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('gh CLI availability check', () => {
    it('should use which command on Unix/macOS platforms', async () => {
      // Mock platform as darwin
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'darwin' });

      mockExecSync.mockImplementation((cmd: string) => {
        if (cmd === 'which gh') {
          return Buffer.from('/usr/local/bin/gh');
        }
        if (cmd === 'gh auth status') {
          return Buffer.from('Logged in');
        }
        return '';
      });

      mockExecFileSync.mockReturnValue('https://github.com/studyzy/OpenSpec-cn/issues/123\n');

      await feedbackCommand.execute('Test');

      // Verify 'which gh' was called
      expect(mockExecSync).toHaveBeenCalledWith('which gh', expect.any(Object));

      // Restore original platform
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    it('should use where command on Windows platform', async () => {
      // Mock platform as win32
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });

      mockExecSync.mockImplementation((cmd: string) => {
        if (cmd === 'where gh') {
          return Buffer.from('C:\\Program Files\\GitHub CLI\\gh.exe');
        }
        if (cmd === 'gh auth status') {
          return Buffer.from('Logged in');
        }
        return '';
      });

      mockExecFileSync.mockReturnValue('https://github.com/studyzy/OpenSpec-cn/issues/123\n');

      await feedbackCommand.execute('Test');

      // Verify 'where gh' was called
      expect(mockExecSync).toHaveBeenCalledWith('where gh', expect.any(Object));

      // Restore original platform
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    it('should handle missing gh CLI with fallback', async () => {
      // Simulate gh not installed
      mockExecSync.mockImplementation((cmd: string) => {
        if (cmd === 'which gh' || cmd === 'where gh') {
          throw new Error('Command not found');
        }
      });

      try {
        await feedbackCommand.execute('Test feedback');
      } catch (error: any) {
        // Should exit with code 0 (successful fallback)
        expect(error.message).toBe('process.exit(0)');
      }

      // Should display warning
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('未找到 GitHub CLI')
      );

      // Should show formatted feedback
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('--- 格式化后的反馈内容 ---')
      );

      // Should show manual submission URL
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://github.com/studyzy/OpenSpec-cn/issues/new')
      );
    });

    it('should handle unauthenticated gh CLI with fallback', async () => {
      // Simulate gh installed but not authenticated
      mockExecSync.mockImplementation((cmd: string) => {
        if (cmd === 'which gh' || cmd === 'where gh') {
          return Buffer.from('/usr/local/bin/gh');
        }
        if (cmd === 'gh auth status') {
          throw new Error('Not authenticated');
        }
      });

      try {
        await feedbackCommand.execute('Test feedback');
      } catch (error: any) {
        // Should exit with code 0 (successful fallback)
        expect(error.message).toBe('process.exit(0)');
      }

      // Should display warning
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('GitHub 未认证')
      );

      // Should show auth instructions
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('若要将来自动提交，请运行: gh auth login')
      );

      // Should show formatted feedback
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('--- 格式化后的反馈内容 ---')
      );
    });
  });

  describe('successful feedback submission', () => {
    it('should submit feedback via gh CLI when authenticated', async () => {
      const issueUrl = 'https://github.com/studyzy/OpenSpec-cn/issues/123';

      // Simulate gh installed and authenticated
      mockExecSync.mockImplementation((cmd: string, options?: any) => {
        if (cmd === 'which gh' || cmd === 'where gh') {
          return Buffer.from('/usr/local/bin/gh');
        }
        if (cmd === 'gh auth status') {
          return Buffer.from('Logged in');
        }
        return '';
      });

      mockExecFileSync.mockReturnValue(`${issueUrl}\n`);

      await feedbackCommand.execute('Great tool!');

      // Should call gh with correct arguments using execFileSync
      expect(mockExecFileSync).toHaveBeenCalledWith(
        'gh',
        [
          'issue',
          'create',
          '--repo',
          'studyzy/OpenSpec-cn',
          '--title',
          '反馈: Great tool!',
          '--body',
          expect.stringContaining('通过 OpenSpec CLI 提交'),
          '--label',
          'feedback',
        ],
        expect.objectContaining({
          encoding: 'utf-8',
          stdio: 'pipe',
        })
      );

      // Should display success message
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('反馈提交成功')
      );

      // Should display issue URL
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(issueUrl)
      );

      // Only one attempt, and no note about a dropped label
      expect(mockExecFileSync).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("without the 'feedback' label")
      );
    });

    it('should include --body flag when body is provided', async () => {
      const issueUrl = 'https://github.com/studyzy/OpenSpec-cn/issues/124';

      mockExecSync.mockImplementation((cmd: string, options?: any) => {
        if (cmd === 'which gh' || cmd === 'where gh') {
          return Buffer.from('/usr/local/bin/gh');
        }
        if (cmd === 'gh auth status') {
          return Buffer.from('Logged in');
        }
        return '';
      });

      mockExecFileSync.mockReturnValue(`${issueUrl}\n`);

      await feedbackCommand.execute('Title here', { body: 'Detailed description' });

      // Verify body is included in the arguments
      expect(mockExecFileSync).toHaveBeenCalledWith(
        'gh',
        expect.arrayContaining([
          '--body',
          expect.stringContaining('Detailed description'),
        ]),
        expect.any(Object)
      );
    });

    it('should format title with "反馈:" prefix', async () => {
      mockExecSync.mockImplementation((cmd: string, options?: any) => {
        if (cmd === 'which gh' || cmd === 'where gh') {
          return Buffer.from('/usr/local/bin/gh');
        }
        if (cmd === 'gh auth status') {
          return Buffer.from('Logged in');
        }
        return '';
      });

      mockExecFileSync.mockReturnValue('https://github.com/studyzy/OpenSpec-cn/issues/125\n');

      await feedbackCommand.execute('Test message');

      // Verify title has "反馈:" prefix
      expect(mockExecFileSync).toHaveBeenCalledWith(
        'gh',
        expect.arrayContaining([
          '--title',
          '反馈: Test message',
        ]),
        expect.any(Object)
      );
    });

    it('should include metadata in issue body', async () => {
      mockExecSync.mockImplementation((cmd: string, options?: any) => {
        if (cmd === 'which gh' || cmd === 'where gh') {
          return Buffer.from('/usr/local/bin/gh');
        }
        if (cmd === 'gh auth status') {
          return Buffer.from('Logged in');
        }
        return '';
      });

      mockExecFileSync.mockReturnValue('https://github.com/studyzy/OpenSpec-cn/issues/126\n');

      await feedbackCommand.execute('Test', { body: 'Body text' });

      // Verify metadata is included in body
      expect(mockExecFileSync).toHaveBeenCalledWith(
        'gh',
        expect.arrayContaining([
          '--body',
          expect.stringMatching(/通过 OpenSpec CLI 提交[\s\S]*版本:[\s\S]*平台:[\s\S]*时间戳:/),
        ]),
        expect.any(Object)
      );
    });

    it('should add feedback label to the issue', async () => {
      mockExecSync.mockImplementation((cmd: string, options?: any) => {
        if (cmd === 'which gh' || cmd === 'where gh') {
          return Buffer.from('/usr/local/bin/gh');
        }
        if (cmd === 'gh auth status') {
          return Buffer.from('Logged in');
        }
        return '';
      });

      mockExecFileSync.mockReturnValue('https://github.com/studyzy/OpenSpec-cn/issues/127\n');

      await feedbackCommand.execute('Test');

      // Verify feedback label is added
      expect(mockExecFileSync).toHaveBeenCalledWith(
        'gh',
        expect.arrayContaining([
          '--label',
          'feedback',
        ]),
        expect.any(Object)
      );
    });
  });

  describe('error handling', () => {
    it('should handle gh CLI execution failure', async () => {
      mockExecSync.mockImplementation((cmd: string, options?: any) => {
        if (cmd === 'which gh' || cmd === 'where gh') {
          return Buffer.from('/usr/local/bin/gh');
        }
        if (cmd === 'gh auth status') {
          return Buffer.from('Logged in');
        }
        return '';
      });

      // Mock execFileSync to throw error
      mockExecFileSync.mockImplementation(() => {
        const error: any = new Error('Network error');
        error.status = 1;
        error.stderr = Buffer.from('Error: Network connectivity issue');
        throw error;
      });

      await expect(feedbackCommand.execute('Test')).rejects.toThrow(
        'process.exit(1)'
      );

      // Should display the error from gh CLI
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Network connectivity issue')
      );

      // A non-label failure must NOT be retried
      expect(mockExecFileSync).toHaveBeenCalledTimes(1);

      // ...and must not discard the typed feedback: the manual-submission
      // fallback (formatted text + pre-filled URL) is shown like the
      // missing-gh and unauthenticated flows.
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('请手动提交您的反馈：')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('github.com/studyzy/OpenSpec-cn/issues/new')
      );
    });

    it('should not retry when the feedback text mentions the label error', async () => {
      mockExecSync.mockImplementation((cmd: string, options?: any) => {
        if (cmd === 'which gh' || cmd === 'where gh') {
          return Buffer.from('/usr/local/bin/gh');
        }
        if (cmd === 'gh auth status') {
          return Buffer.from('Logged in');
        }
        return '';
      });

      // gh fails for an unrelated reason. Node puts the whole command line —
      // including the user's own words — into error.message, so only stderr
      // may decide whether this was a label failure.
      mockExecFileSync.mockImplementation((_cmd: string, args: string[]) => {
        const error: any = new Error(
          `Command failed: gh ${args.join(' ')}\nerror connecting to api.github.com`
        );
        error.status = 1;
        error.stderr = Buffer.from('error connecting to api.github.com');
        throw error;
      });

      await expect(
        feedbackCommand.execute('gh could not add label bug report')
      ).rejects.toThrow('process.exit(1)');

      expect(mockExecFileSync).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("without the 'feedback' label")
      );
    });

    it('should retry without the label when the repo does not define it', async () => {
      const issueUrl = 'https://github.com/Fission-AI/OpenSpec/issues/129';

      mockExecSync.mockImplementation((cmd: string, options?: any) => {
        if (cmd === 'which gh' || cmd === 'where gh') {
          return Buffer.from('/usr/local/bin/gh');
        }
        if (cmd === 'gh auth status') {
          return Buffer.from('Logged in');
        }
        return '';
      });

      // gh resolves label names before creating the issue, so a repo without
      // the label fails with no issue created
      mockExecFileSync.mockImplementation((_cmd: string, args: string[]) => {
        if (args.includes('--label')) {
          const error: any = new Error('gh failed');
          error.status = 1;
          error.stderr = Buffer.from(
            'could not add label: labels not found: feedback'
          );
          throw error;
        }
        return `${issueUrl}\n`;
      });

      await feedbackCommand.execute('Test');

      expect(mockExecFileSync).toHaveBeenCalledTimes(2);

      // First attempt asks for the label
      expect(mockExecFileSync).toHaveBeenNthCalledWith(
        1,
        'gh',
        expect.arrayContaining(['--label', 'feedback']),
        expect.any(Object)
      );

      // Retry drops it
      expect(mockExecFileSync).toHaveBeenNthCalledWith(
        2,
        'gh',
        expect.not.arrayContaining(['--label']),
        expect.any(Object)
      );

      // The feedback still lands as an issue, and the user is told the label
      // was not applied
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('反馈提交成功')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(issueUrl)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("without the 'feedback' label")
      );
    });

    it('should preserve gh exit code when the unlabeled retry also fails', async () => {
      mockExecSync.mockImplementation((cmd: string, options?: any) => {
        if (cmd === 'which gh' || cmd === 'where gh') {
          return Buffer.from('/usr/local/bin/gh');
        }
        if (cmd === 'gh auth status') {
          return Buffer.from('Logged in');
        }
        return '';
      });

      mockExecFileSync.mockImplementation((_cmd: string, args: string[]) => {
        const error: any = new Error('gh failed');

        if (args.includes('--label')) {
          error.status = 1;
          error.stderr = Buffer.from(
            'could not add label: labels not found: feedback'
          );
        } else {
          error.status = 4;
          error.stderr = Buffer.from('Error: issues are disabled');
        }

        throw error;
      });

      await expect(feedbackCommand.execute('Test')).rejects.toThrow(
        'process.exit(4)'
      );

      expect(mockExecFileSync).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('issues are disabled')
      );
    });

    it('should handle quotes in title and body without escaping (no shell injection)', async () => {
      mockExecSync.mockImplementation((cmd: string, options?: any) => {
        if (cmd === 'which gh' || cmd === 'where gh') {
          return Buffer.from('/usr/local/bin/gh');
        }
        if (cmd === 'gh auth status') {
          return Buffer.from('Logged in');
        }
        return '';
      });

      mockExecFileSync.mockReturnValue('https://github.com/studyzy/OpenSpec-cn/issues/128\n');

      await feedbackCommand.execute('Test with "quotes"', {
        body: 'Body with "quotes"',
      });

      // Verify quotes are passed as-is (no escaping needed with execFileSync)
      expect(mockExecFileSync).toHaveBeenCalledWith(
        'gh',
        expect.arrayContaining([
          '--title',
          '反馈: Test with "quotes"',
          '--body',
          expect.stringContaining('Body with "quotes"'),
        ]),
        expect.any(Object)
      );
    });
  });

  describe('formatted feedback output', () => {
    it('should display formatted feedback with proper structure', async () => {
      mockExecSync.mockImplementation((cmd: string) => {
        if (cmd === 'which gh' || cmd === 'where gh') {
          throw new Error('Command not found');
        }
      });

      try {
        await feedbackCommand.execute('Test message', { body: 'Test body' });
      } catch (error: any) {
        // Expected to exit
      }

      // Verify formatted output structure
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('--- 格式化后的反馈内容 ---')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('标题: 反馈: Test message')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('标签: feedback')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('--- 反馈结束 ---')
      );
    });

    it('should generate correct manual submission URL', async () => {
      mockExecSync.mockImplementation((cmd: string) => {
        if (cmd === 'which gh' || cmd === 'where gh') {
          throw new Error('Command not found');
        }
      });

      try {
        await feedbackCommand.execute('Test');
      } catch (error: any) {
        // Expected to exit
      }

      // Verify URL is shown. Match on the parsed origin and path rather than a
      // substring, so a lookalike host in the output cannot satisfy the check.
      const urlCall = consoleLogSpy.mock.calls.find((call: any[]) => {
        const found = /https?:\/\/\S+/.exec(String(call[0] ?? ''));
        if (!found) {
          return false;
        }
        try {
          const parsed = new URL(found[0]);
          return (
            parsed.origin === 'https://github.com' &&
            parsed.pathname === '/studyzy/OpenSpec-cn/issues/new'
          );
        } catch {
          return false;
        }
      });
      expect(urlCall).toBeDefined();

      // Verify URL has proper parameters
      const url = urlCall?.[0];
      expect(url).toContain('title=');
      expect(url).toContain('body=');
      expect(url).toContain('labels=feedback');
    });
  });
});
