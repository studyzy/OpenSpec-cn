import { describe, it, expect } from 'vitest';
import {
  COMMAND_DEPRECATION_URL,
  formatCommandDeprecationNotice,
} from '../../src/core/command-surface.js';

describe('formatCommandDeprecationNotice', () => {
  it.each(['both', 'commands'] as const)(
    'announces the change when delivery %s still generates command files',
    (delivery) => {
      expect(formatCommandDeprecationNotice(['claude'], delivery)).toEqual([
        '命令文件已弃用，将在 OpenSpec 2.0 中移除。你的 OpenSpec skills 会保留并完成同样的工作。',
        '  现在切换：openspec-cn config set delivery skills && openspec-cn update',
        '  这只会删除 OpenSpec 生成的命令文件；你编辑过的文件会被保留并列出。',
        `  详情：${COMMAND_DEPRECATION_URL}`,
      ]);
    }
  );

  it('says nothing to a project already on skills-only delivery', () => {
    expect(formatCommandDeprecationNotice(['claude', 'cursor'], 'skills')).toEqual([]);
  });

  it('says nothing when no configured tool gets command files', () => {
    // Codex is skills-invocable and has no command adapter, so a Codex-only
    // project is unaffected by the deprecation even on the default delivery.
    expect(formatCommandDeprecationNotice(['codex'], 'both')).toEqual([]);
    expect(formatCommandDeprecationNotice([], 'both')).toEqual([]);
  });

  it('announces it once for a mixed project where one tool gets commands', () => {
    expect(formatCommandDeprecationNotice(['codex', 'claude'], 'both')).toHaveLength(4);
  });
});
