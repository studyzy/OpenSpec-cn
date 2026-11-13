import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { claudeAdapter } from '../src/core/command-generation/adapters/claude.js';
import { AI_TOOLS, SKILL_LINKED_TOOL_IDS } from '../src/core/config.js';
import { SHARED_SKILLS_ROOT } from '../src/core/shared/skill-paths.js';
import { formatProjectMdMigrationHint } from '../src/core/legacy-cleanup.js';
import { CORE_WORKFLOWS } from '../src/core/profiles.js';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SETUP = fs.readFileSync(
  path.join(REPO_ROOT, 'docs-lab', 'start', 'setup.md'),
  'utf-8'
);
const PROFILES = fs.readFileSync(
  path.join(REPO_ROOT, 'docs-lab', 'customize', 'profiles.md'),
  'utf-8'
);
const CORE_SECTION = PROFILES.split('## 核心集合')[1].split(
  '## 扩展集合：可选工作流'
)[0];

describe('setup documentation', () => {
  it('matches the AI-assisted project.md migration guidance', () => {
    const hint = formatProjectMdMigrationHint();
    // The pasteable block shown in the docs (kept verbatim as users paste it).
    const pastedClaims = [
      'Review openspec/project.md and migrate its useful content to',
      'Keep context concise',
      'only project-wide',
      'artifact creation, apply, and archive',
      'rules for the matching artifacts',
      'matching operations entry',
      'Leave out generic',
      'outdated, or verbose material',
      'Do not delete project.md',
    ];
    // The CLI's own localized hint lines.
    const hintClaims = [
      '审查 openspec/project.md',
      'context 保持精炼',
      '制品创建',
      'apply 和归档',
      '对应制品的 rules',
      'operations 条目',
      '不要包含泛泛',
      '过时或冗长的内容',
      '不要删除 project.md',
    ];

    expect(SETUP).toContain('init 不会把旧的 `openspec/project.md` 复制进 `config.yaml`');
    for (const claim of pastedClaims) {
      expect(SETUP).toContain(claim);
    }
    for (const claim of hintClaims) {
      expect(hint).toContain(claim);
    }
    expect(hint).toContain('审查 config.yaml 后，在合适的时候删除 project.md。');
    expect(SETUP).toContain('审查 `config.yaml` 后，在合适的时候删除 `project.md`。');
  });

  it('keeps the Claude Code paths and recovery commands aligned with OpenSpec', () => {
    const claude = AI_TOOLS.find((tool) => tool.value === 'claude');
    const claudeCommandPath = claudeAdapter.getFilePath('<id>').split(path.sep).join('/');

    expect(claude?.skillsDir).toBeDefined();
    // Claude 的 skills 是指向唯一共享副本的链接，位于它自己的文件夹中。
    expect(SKILL_LINKED_TOOL_IDS.has('claude')).toBe(true);
    expect(SETUP).toContain(`\`${claude?.skillsDir}/skills/openspec-*\`、这些路径链接到 \`${SHARED_SKILLS_ROOT}/skills/openspec-*\``);
    // OpenSpec 2.0 只安装 skills：恢复方式就是普通的 update，绝不涉及命令路径或 delivery 开关。
    expect(SETUP).not.toContain(`\`${claudeCommandPath}\``);
    expect(SETUP).not.toContain('openspec config set delivery');
    expect(SETUP).toContain('openspec-cn update');
    expect(SETUP).toContain('`/openspec-propose`');
  });

  it('lists every workflow in the core profile', () => {
    for (const workflow of CORE_WORKFLOWS) {
      expect(CORE_SECTION).toContain(`\`${workflow}\``);
    }
  });
});
