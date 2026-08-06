import { describe, expect, it } from 'vitest';

import {
  getUpdateChangeSkillTemplate,
  getOpsxUpdateCommandTemplate,
} from '../../../src/core/templates/skill-templates.js';
import { STORE_SELECTION_GUIDANCE } from '../../../src/core/templates/workflows/store-selection.js';

const skill = getUpdateChangeSkillTemplate();
const command = getOpsxUpdateCommandTemplate();

// Both delivery surfaces must carry the same contract; every behavioral
// assertion below runs against each body.
const bodies: Array<[string, string]> = [
  ['skill', skill.instructions],
  ['command', command.content],
];

describe('update-change templates', () => {
  it('generates the expected skill and command shape (3.1)', () => {
    expect(skill.name).toBe('openspec-update-change');
    expect(skill.description).toContain('绝不要编辑代码');
    expect(skill.license).toBe('MIT');
    expect(skill.compatibility).toBe('Requires openspec CLI.');
    expect(skill.metadata).toEqual({ author: 'openspec', version: '1.0' });

    expect(command.name).toBe('OPSX: Update');
    expect(command.category).toBe('Workflow');
    expect(command.tags).toEqual(['workflow', 'artifacts', 'experimental']);
    expect(command.content).toContain('/opsx:update add-auth');

    for (const [label, body] of bodies) {
      expect(body, label).toContain(STORE_SELECTION_GUIDANCE);
      expect(body, label).toContain('openspec list --json');
      expect(body, label).toContain('openspec status --change "<name>" --json');
      expect(body, label).toContain('openspec instructions "<artifact-id>" --change "<name>" --json');
    }
  });

  it('reads artifact ids from status JSON and never branches on hardcoded artifact names (3.2)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('不要假设它们，且不要基于硬编码的制品名称分支');
      expect(body, label).toContain('绝不要基于硬编码的制品名称分支');
      expect(body, label).toContain('自定义 schema');
      // No literal artifact filenames anywhere: no proposal.md/design.md/tasks.md
      // branching, and no worked example that names them. The only .md literal
      // allowed is the specs/**/*.md glob illustration.
      expect(body.replace(/specs\/\*\*\/\*\.md/g, ''), label).not.toMatch(/\b[\w-]+\.md\b/);
    }
  });

  it('edits planning artifacts only, hands code off to /opsx:apply, never advances the frontier (3.3)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('绝不要编辑代码');
      expect(body, label).toContain('绝不要编辑实现代码');
      expect(body, label).toContain('停止并指向 `/opsx:apply`');
      expect(body, label).toContain('不要创建尚不存在的制品');
      expect(body, label).toContain('不要创建尚不存在的制品');
    }
  });

  it('writes to existingOutputPaths, never to a glob resolvedOutputPath (3.4)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('artifactPaths.<id>.existingOutputPaths');
      expect(body, label).toContain('不要写入 `resolvedOutputPath`');
      expect(body, label).toContain('它仍是 glob 模式，而非真实文件');
    }
  });

  it('ends with next-step guidance and never acts on it (3.5)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('仅供参考 - 绝不要执行');
      expect(body, label).toContain('建议 `/opsx:continue`');
      expect(body, label).toContain('建议 `/opsx:apply`');
      expect(body, label).toContain('建议 `/opsx:archive`');
      expect(body, label).toContain('代码可能不再匹配修订后的计划');
    }
  });

  it('explains the optional continue workflow before suggesting it', () => {
    for (const [label, body] of bodies) {
      const availabilityGuidance = body.indexOf(
        '`/opsx:continue` 是一个扩展 profile 工作流，可能未安装'
      );
      const firstSuggestion = body.indexOf(
        '`/opsx:continue`',
        availabilityGuidance + '`/opsx:continue`'.length
      );

      expect(availabilityGuidance, label).toBeGreaterThanOrEqual(0);
      expect(body.indexOf('`/opsx:continue`'), label).toBe(availabilityGuidance);
      expect(firstSuggestion, label).toBeGreaterThan(availabilityGuidance);
      expect(body, label).toContain(
        '若不可用，`openspec status --change "<name>" --json` 显示下一个制品'
      );
      expect(body, label).toContain(
        '`openspec instructions "<artifact-id>" --change "<name>" --json` 解释如何创建它'
      );
    }
  });

  it('confirms every edit and redirects intent changes to /opsx:new', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('仅在用户确认后写入');
      expect(body, label).toContain('若用户拒绝修订，不要写入');
      expect(body, label).toContain('重新开始');
      expect(body, label).toContain('更新 vs 重新开始');
      expect(body, label).toContain('请求一个不同的未使用变更名称');
      expect(body, label).toContain('openspec new change "<new-change-name>"');
      expect(body, label).not.toContain('openspec new change "<name>"');

      const newAvailabilityCheck = body.indexOf(
        '首先验证扩展 profile `/opsx:new` 工作流是否可用'
      );
      const newRecommendation = body.indexOf('建议用 `/opsx:new` 重新开始');
      expect(newAvailabilityCheck, label).toBeGreaterThanOrEqual(0);
      expect(body.slice(0, newAvailabilityCheck), label).not.toContain('`/opsx:new`');
      expect(newRecommendation, label).toBeGreaterThan(newAvailabilityCheck);
    }
  });
});
