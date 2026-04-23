import { afterAll, describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { runCLI, cliProjectRoot } from '../helpers/run-cli.js';
import { AI_TOOLS } from '../../src/core/config.js';

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

const tempRoots: string[] = [];

async function createTempGlobalConfig(baseDir: string): Promise<{ XDG_CONFIG_HOME: string }> {
  const configDir = path.join(baseDir, 'xdg-config');
  const openspecDir = path.join(configDir, 'openspec');
  await fs.mkdir(openspecDir, { recursive: true });
  await fs.writeFile(
    path.join(openspecDir, 'config.json'),
    JSON.stringify({
      profile: 'core',
      delivery: 'both',
      workflows: ['propose', 'explore', 'apply', 'archive'],
    })
  );
  return { XDG_CONFIG_HOME: configDir };
}

async function prepareFixture(fixtureName: string): Promise<string> {
  const base = await fs.mkdtemp(path.join(tmpdir(), 'openspec-cn-cli-e2e-'));
  tempRoots.push(base);
  const projectDir = path.join(base, 'project');
  await fs.mkdir(projectDir, { recursive: true });
  const fixtureDir = path.join(cliProjectRoot, 'test', 'fixtures', fixtureName);
  await fs.cp(fixtureDir, projectDir, { recursive: true });
  return projectDir;
}

function expectJsonOnlyOutput(result: Awaited<ReturnType<typeof runCLI>>) {
  expect(result.exitCode).toBe(0);
  expect(result.stderr).toBe('');
  expect(() => JSON.parse(result.stdout)).not.toThrow();
}

afterAll(async () => {
  await Promise.all(tempRoots.map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe('openspec CLI e2e basics', () => {
  it('shows help output', async () => {
    const result = await runCLI(['--help']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Usage: openspec-cn');
    expect(result.stderr).toBe('');

  });

  it('shows dynamic tool ids in init help', async () => {
    const result = await runCLI(['init', '--help']);
    expect(result.exitCode).toBe(0);

    const expectedTools = AI_TOOLS.filter((tool) => tool.available)
      .map((tool) => tool.value)
      .join(', ');
    const normalizedOutput = result.stdout.replace(/\s+/g, ' ').trim();
    expect(normalizedOutput).toContain(
      `使用 "all"、"none" 或逗号分隔的列表：${expectedTools}`
    );
  });

  it('reports the package version', async () => {
    const pkgRaw = await fs.readFile(path.join(cliProjectRoot, 'package.json'), 'utf-8');
    const pkg = JSON.parse(pkgRaw);
    const result = await runCLI(['--version']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe(pkg.version);
  });

  it('validates the tmp-init fixture with --all --json', async () => {
    const projectDir = await prepareFixture('tmp-init');
    const result = await runCLI(['validate', '--all', '--json'], { cwd: projectDir });
    expect(result.exitCode).toBe(0);
    const output = result.stdout.trim();
    expect(output).not.toBe('');
    const json = JSON.parse(output);
    expect(json.summary?.totals?.failed).toBe(0);
    expect(json.items.some((item: any) => item.id === 'c1' && item.type === 'change')).toBe(true);
  });

  it('keeps list --json free of spinner output', async () => {
    const projectDir = await prepareFixture('tmp-init');
    const result = await runCLI(['list', '--json'], { cwd: projectDir });
    expectJsonOnlyOutput(result);
  });

  it('keeps schemas --json free of spinner output', async () => {
    const projectDir = await prepareFixture('tmp-init');
    const result = await runCLI(['schemas', '--json'], { cwd: projectDir });
    expectJsonOnlyOutput(result);
  });

  it('keeps status --json free of spinner output', async () => {
    const projectDir = await prepareFixture('tmp-init');
    const result = await runCLI(['status', '--change', 'c1', '--json'], { cwd: projectDir });
    expectJsonOnlyOutput(result);
  });

  it('keeps instructions --json free of spinner output', async () => {
    const projectDir = await prepareFixture('tmp-init');
    const result = await runCLI(['instructions', 'proposal', '--change', 'c1', '--json'], {
      cwd: projectDir,
    });
    expectJsonOnlyOutput(result);
  });

  it('keeps instructions apply --json free of spinner output', async () => {
    const projectDir = await prepareFixture('tmp-init');
    const result = await runCLI(['instructions', 'apply', '--change', 'c1', '--json'], {
      cwd: projectDir,
    });
    expectJsonOnlyOutput(result);
  });

  it('keeps templates --json free of spinner output', async () => {
    const projectDir = await prepareFixture('tmp-init');
    const result = await runCLI(['templates', '--json'], { cwd: projectDir });
    expectJsonOnlyOutput(result);
  });

  it('returns an error for unknown items in the fixture', async () => {
    const projectDir = await prepareFixture('tmp-init');
    const result = await runCLI(['validate', 'does-not-exist'], { cwd: projectDir });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("未知项目");
  });

  describe('init command non-interactive options', () => {
    it('initializes with --tools all option', async () => {
      const projectDir = await prepareFixture('tmp-init');
      const emptyProjectDir = path.join(projectDir, '..', 'empty-project');
      await fs.mkdir(emptyProjectDir, { recursive: true });

      const codexHome = path.join(emptyProjectDir, '.codex');
      const result = await runCLI(['init', '--tools', 'all'], {
        cwd: emptyProjectDir,
        env: { CODEX_HOME: codexHome, ...(await createTempGlobalConfig(emptyProjectDir)) },
      });
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('OpenSpec 设置完成');

      // Check that skills were created for multiple tools
      const claudeSkillPath = path.join(emptyProjectDir, '.claude/skills/openspec-explore/SKILL.md');
      const cursorSkillPath = path.join(emptyProjectDir, '.cursor/skills/openspec-explore/SKILL.md');
      expect(await fileExists(claudeSkillPath)).toBe(true);
      expect(await fileExists(cursorSkillPath)).toBe(true);
    });

    it('initializes with --tools list option', async () => {
      const projectDir = await prepareFixture('tmp-init');
      const emptyProjectDir = path.join(projectDir, '..', 'empty-project');
      await fs.mkdir(emptyProjectDir, { recursive: true });

      const result = await runCLI(['init', '--tools', 'claude'], {
        cwd: emptyProjectDir,
        env: await createTempGlobalConfig(emptyProjectDir),
      });
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('OpenSpec 设置完成');
      expect(result.stdout).toContain('Claude Code');

      // New init creates skills, not CLAUDE.md
      const claudeSkillPath = path.join(emptyProjectDir, '.claude/skills/openspec-explore/SKILL.md');
      const cursorSkillPath = path.join(emptyProjectDir, '.cursor/skills/openspec-explore/SKILL.md');
      expect(await fileExists(claudeSkillPath)).toBe(true);
      expect(await fileExists(cursorSkillPath)).toBe(false); // Not selected
    });

    it('initializes with --tools none option', async () => {
      const projectDir = await prepareFixture('tmp-init');
      const emptyProjectDir = path.join(projectDir, '..', 'empty-project');
      await fs.mkdir(emptyProjectDir, { recursive: true });

      const result = await runCLI(['init', '--tools', 'none'], { cwd: emptyProjectDir });
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('OpenSpec 设置完成');

      // With --tools none, no tool skills should be created
      const claudeSkillPath = path.join(emptyProjectDir, '.claude/skills/openspec-explore/SKILL.md');
      const cursorSkillPath = path.join(emptyProjectDir, '.cursor/skills/openspec-explore/SKILL.md');

      expect(await fileExists(claudeSkillPath)).toBe(false);
      expect(await fileExists(cursorSkillPath)).toBe(false);
    });

    it('returns error for invalid tool names', async () => {
      const projectDir = await prepareFixture('tmp-init');
      const emptyProjectDir = path.join(projectDir, '..', 'empty-project');
      await fs.mkdir(emptyProjectDir, { recursive: true });

      const result = await runCLI(['init', '--tools', 'invalid-tool'], { cwd: emptyProjectDir });
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('无效工具: invalid-tool');
      expect(result.stderr).toContain('可用值:');
    });

    it('returns error when combining reserved keywords with explicit ids', async () => {
      const projectDir = await prepareFixture('tmp-init');
      const emptyProjectDir = path.join(projectDir, '..', 'empty-project');
      await fs.mkdir(emptyProjectDir, { recursive: true });

      const result = await runCLI(['init', '--tools', 'all,claude'], { cwd: emptyProjectDir });
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('不能同时使用保留值 "all" 或 "none" 与具体工具 ID');
    });
  });
});
