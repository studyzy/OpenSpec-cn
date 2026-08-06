import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {
  WORKSETS_DIR_NAME,
  WORKSETS_FILE_NAME,
  buildWorksetCodeWorkspaceJson,
  getWorkset,
  getWorksetCodeWorkspacePath,
  getWorksetsDir,
  getWorksetsFilePath,
  listWorksets,
  memberLabelProblem,
  memberListProblem,
  parseWorksetsState,
  readWorksetsState,
  serializeWorksetsState,
  updateWorksetsState,
  validateWorksetName,
  withWorkset,
  withWorksetsLock,
  withoutWorkset,
  type WorksetsState,
} from '../../src/core/worksets.js';

describe('worksets core', () => {
  let tempDir: string;
  let globalDataDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-worksets-'));
    globalDataDir = path.join(tempDir, 'data');
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  const options = () => ({ globalDataDir });

  function memberA() {
    return { name: 'team-context', path: path.join(tempDir, 'team-context') };
  }

  function memberB() {
    return { name: 'web-app', path: path.join(tempDir, 'web-app') };
  }

  describe('paths', () => {
    it('locates everything under <globalDataDir>/worksets/', () => {
      expect(getWorksetsDir(options())).toBe(
        path.join(globalDataDir, WORKSETS_DIR_NAME)
      );
      expect(getWorksetsFilePath(options())).toBe(
        path.join(globalDataDir, WORKSETS_DIR_NAME, WORKSETS_FILE_NAME)
      );
      expect(getWorksetCodeWorkspacePath('platform', options())).toBe(
        path.join(globalDataDir, WORKSETS_DIR_NAME, 'platform.code-workspace')
      );
    });
  });

  describe('name and member validation', () => {
    it('accepts kebab names and rejects everything else', () => {
      expect(validateWorksetName('platform-2')).toBe('platform-2');
      expect(() => validateWorksetName('My Stuff')).toThrowError(
        /必须是 kebab-case/
      );
      try {
        validateWorksetName('My Stuff');
      } catch (error) {
        expect((error as { diagnostic: { code: string } }).diagnostic.code).toBe(
          'invalid_workset_name'
        );
      }
    });

    it('rejects empty, dotted, and separator-bearing labels', () => {
      expect(memberLabelProblem('web-app')).toBeNull();
      expect(memberLabelProblem('Web App')).toBeNull();
      expect(memberLabelProblem('')).toMatch(/不能为空/);
      expect(memberLabelProblem('.')).toMatch(/不能是 '\.'/);
      expect(memberLabelProblem('a/b')).toMatch(/路径分隔符/);
      expect(memberLabelProblem('a\\b')).toMatch(/路径分隔符/);
    });

    it('rejects empty lists, duplicate labels, and relative paths', () => {
      expect(memberListProblem([memberA(), memberB()])).toBeNull();
      expect(memberListProblem([])).toMatch(/成员不能为空/);
      expect(
        memberListProblem([memberA(), { ...memberB(), name: 'team-context' }])
      ).toMatch(/重复的成员名称 'team-context'/);
      expect(
        memberListProblem([{ name: 'web', path: 'relative/web' }])
      ).toMatch(/必须为绝对路径/);
    });
  });

  describe('parse and serialize', () => {
    it('round-trips a state with sorted names and omitted-when-absent tool', () => {
      const state: WorksetsState = {
        version: 1,
        worksets: {
          zeta: { members: [memberA()] },
          alpha: { tool: 'claude', members: [memberA(), memberB()] },
        },
      };

      const serialized = serializeWorksetsState(state, options());
      const parsed = parseWorksetsState(serialized, options());

      expect(Object.keys(parsed.worksets)).toEqual(['alpha', 'zeta']);
      expect(parsed.worksets.alpha.tool).toBe('claude');
      expect(parsed.worksets.zeta.tool).toBeUndefined();
      expect(serialized).not.toMatch(/tool: null/);
    });

    it('fails the hand-edit contract violations as invalid_workset_file', () => {
      const file = getWorksetsFilePath(options());
      const cases: Array<{ content: string; problem: RegExp }> = [
        { content: '{not yaml', problem: /无效的工作集文件/ },
        {
          content: 'version: 2\nworksets: {}\n',
          problem: /version/,
        },
        {
          content: `version: 1\nworksets:\n  Bad Name:\n    members:\n      - name: a\n        path: ${tempDir}\n`,
          problem: /必须是 kebab-case/,
        },
        {
          content: 'version: 1\nworksets:\n  empty:\n    members: []\n',
          problem: /成员不能为空/,
        },
        {
          content:
            'version: 1\nworksets:\n  rel:\n    members:\n      - name: a\n        path: relative/path\n',
          problem: /必须为绝对路径/,
        },
        {
          content: `version: 1\nworksets:\n  dup:\n    members:\n      - name: a\n        path: ${tempDir}\n      - name: a\n        path: ${globalDataDir}\n`,
          problem: /重复的成员名称/,
        },
        {
          content: `version: 1\nworksets:\n  extra:\n    unknown: true\n    members:\n      - name: a\n        path: ${tempDir}\n`,
          problem: /unknown/i,
        },
      ];

      for (const candidate of cases) {
        try {
          parseWorksetsState(candidate.content, options());
          expect.unreachable(`expected failure for: ${candidate.content}`);
        } catch (error) {
          const diagnostic = (
            error as { diagnostic: { code: string; message: string; fix?: string } }
          ).diagnostic;
          expect(diagnostic.code).toBe('invalid_workset_file');
          expect(diagnostic.message).toMatch(candidate.problem);
          expect(diagnostic.fix).toBe(`修复或删除 ${file}。`);
        }
      }
    });

    it('parses an unknown tool string without validating it', () => {
      const content = `version: 1\nworksets:\n  alpha:\n    tool: deleted-tool\n    members:\n      - name: a\n        path: ${tempDir}\n`;

      const parsed = parseWorksetsState(content, options());

      expect(parsed.worksets.alpha.tool).toBe('deleted-tool');
    });
  });

  describe('state rebuilds', () => {
    it('adds, lists, gets, and removes worksets', () => {
      const empty: WorksetsState = { version: 1, worksets: {} };
      const withOne = withWorkset(empty, {
        name: 'platform',
        tool: 'claude',
        members: [memberA(), memberB()],
      });

      expect(listWorksets(withOne).map((workset) => workset.name)).toEqual([
        'platform',
      ]);
      expect(getWorkset(withOne, 'platform')?.tool).toBe('claude');
      expect(getWorkset(withOne, 'absent')).toBeNull();

      const removed = withoutWorkset(withOne, 'platform');
      expect(listWorksets(removed)).toEqual([]);
    });

    it('rejects duplicate names with a remove fix', () => {
      const state = withWorkset(
        { version: 1, worksets: {} },
        { name: 'platform', members: [memberA()] }
      );

      try {
        withWorkset(state, { name: 'platform', members: [memberB()] });
        expect.unreachable('expected workset_exists');
      } catch (error) {
        const diagnostic = (
          error as { diagnostic: { code: string; fix?: string } }
        ).diagnostic;
        expect(diagnostic.code).toBe('workset_exists');
        expect(diagnostic.fix).toBe(
          '选择其他名称，或先删除：openspec-cn workset remove platform'
        );
      }
    });

    it('reports unknown names with saved names or the create command', () => {
      const state = withWorkset(
        { version: 1, worksets: {} },
        { name: 'platform', members: [memberA()] }
      );

      try {
        withoutWorkset(state, 'absent');
        expect.unreachable('expected workset_not_found');
      } catch (error) {
        const diagnostic = (
          error as { diagnostic: { code: string; fix?: string } }
        ).diagnostic;
        expect(diagnostic.code).toBe('workset_not_found');
        expect(diagnostic.fix).toBe(
          '已保存的 worksets：platform。使用以下命令查看：openspec-cn workset list'
        );
      }

      try {
        withoutWorkset({ version: 1, worksets: {} }, 'absent');
        expect.unreachable('expected workset_not_found');
      } catch (error) {
        const diagnostic = (
          error as { diagnostic: { fix?: string } }
        ).diagnostic;
        expect(diagnostic.fix).toBe(
          '先创建：openspec-cn workset create absent'
        );
      }
    });
  });

  describe('file IO', () => {
    it('reads the empty state when no file exists', async () => {
      expect(await readWorksetsState(options())).toEqual({
        version: 1,
        worksets: {},
      });
    });

    it('updates the state under the lock and reads it back', async () => {
      await updateWorksetsState(
        (state) =>
          withWorkset(state, {
            name: 'platform',
            tool: 'code',
            members: [memberA()],
          }),
        options()
      );

      const state = await readWorksetsState(options());
      expect(getWorkset(state, 'platform')?.members).toEqual([memberA()]);
      expect(
        fs.existsSync(`${getWorksetsFilePath(options())}.lock`)
      ).toBe(false);
    });

    it('withWorksetsLock reads without writing the file back', async () => {
      await updateWorksetsState(
        (state) => withWorkset(state, { name: 'platform', members: [memberA()] }),
        options()
      );
      const before = fs.readFileSync(getWorksetsFilePath(options()), 'utf-8');
      const beforeStat = fs.statSync(getWorksetsFilePath(options()));

      const seen = await withWorksetsLock(
        (state) => listWorksets(state).map((workset) => workset.name),
        options()
      );

      expect(seen).toEqual(['platform']);
      expect(fs.readFileSync(getWorksetsFilePath(options()), 'utf-8')).toBe(
        before
      );
      expect(fs.statSync(getWorksetsFilePath(options())).mtimeMs).toBe(
        beforeStat.mtimeMs
      );
      expect(
        fs.existsSync(`${getWorksetsFilePath(options())}.lock`)
      ).toBe(false);
    });

    it('surfaces a corrupt file from every reader', async () => {
      fs.mkdirSync(getWorksetsDir(options()), { recursive: true });
      fs.writeFileSync(getWorksetsFilePath(options()), '{broken');

      await expect(readWorksetsState(options())).rejects.toMatchObject({
        diagnostic: { code: 'invalid_workset_file' },
      });
      await expect(
        updateWorksetsState((state) => state, options())
      ).rejects.toMatchObject({
        diagnostic: { code: 'invalid_workset_file' },
      });
      // The corrupt file is never auto-deleted or rewritten.
      expect(fs.readFileSync(getWorksetsFilePath(options()), 'utf-8')).toBe(
        '{broken'
      );
    });
  });

  describe('code-workspace builder', () => {
    it('emits folders in member order with two-space JSON and a trailing newline', () => {
      const json = buildWorksetCodeWorkspaceJson([memberA(), memberB()]);

      expect(json).toBe(
        JSON.stringify(
          {
            folders: [
              { name: 'team-context', path: memberA().path },
              { name: 'web-app', path: memberB().path },
            ],
          },
          null,
          2
        ) + '\n'
      );
    });
  });
});
