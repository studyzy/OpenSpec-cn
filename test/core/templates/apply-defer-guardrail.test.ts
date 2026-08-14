import { describe, it, expect } from 'vitest';
import {
  getApplyInstructions,
  getApplyChangeSkillTemplate,
  getOpsxApplyCommandTemplate,
} from '../../../src/core/templates/workflows/apply-change.js';

// #1529: agents were silently simplifying or deferring work mid-apply and
// marking tasks done anyway. The apply instructions must tell the agent to
// surface unexpected scope instead of absorbing it, on both surfaces.
describe('apply instructions surface deferred scope (#1529)', () => {
  const instructions = getApplyInstructions();

  it('tells the agent to surface added scope rather than defer or simplify', () => {
    expect(instructions).toContain('把新增的范围摆出来并询问');
    expect(instructions).toContain('超出 spec 和 tasks 描述的工作');
    expect(instructions).toMatch(/绝不默默收窄、推迟/);
  });

  it('requires pausing, not just reporting and continuing', () => {
    // The agent must hand control back, not surface the scope and press on.
    expect(instructions).toContain('摆出新增的范围并暂停');
  });

  it('forbids marking a task complete when it is only partially done', () => {
    expect(instructions).toMatch(
      /只有当任务的指定行为被完整实现时才将任务标记为 .*，而不是部分完成或推迟时/
    );
  });

  it('carries the same guidance on both the skill and command surfaces', () => {
    const needle = '把新增的范围摆出来并询问';
    expect(getApplyChangeSkillTemplate().instructions).toContain(needle);
    expect(getOpsxApplyCommandTemplate().content).toContain(needle);
  });
});
