import { describe, expect, it } from 'vitest';

import {
  getBulkArchiveChangeSkillTemplate,
  getOpsxBulkArchiveCommandTemplate,
} from '../../../src/core/templates/skill-templates.js';

const skill = getBulkArchiveChangeSkillTemplate();
const command = getOpsxBulkArchiveCommandTemplate();

// Both delivery surfaces must carry the same contract; every behavioral
// assertion below runs against each body.
const bodies: Array<[string, string]> = [
  ['skill', skill.instructions],
  ['command', command.content],
];

function archiveStep(body: string, label: string): string {
  const start = body.indexOf('   c. **执行归档**：');
  const end = body.indexOf('   d. **记录每个变更的结果**：');

  expect(start, label).toBeGreaterThanOrEqual(0);
  expect(end, label).toBeGreaterThan(start);

  return body.slice(start, end);
}

describe('bulk archive existing-target handling', () => {
  // Regression for #1827: step 8c ran `mv` with no existence check. POSIX
  // `mv` moves changeRoot *inside* an existing target directory and exits 0,
  // so a same-day name collision produced
  // archive/<target>/<target>/ and was recorded as a successful archive.
  it('checks the archive target before moving changeRoot (#1827)', () => {
    for (const [label, body] of bodies) {
      const step = archiveStep(body, label);

      expect(step, label).toContain('**检查目标是否已存在：**');
      expect(step, label).toContain('归档目录已存在');
      expect(step, label).toContain('保持 `changeRoot` 原位不动');
      expect(step, label).toContain('继续处理其余变更');
    }
  });

  it('orders the existence check between the target name and the move (#1827)', () => {
    for (const [label, body] of bodies) {
      const step = archiveStep(body, label);
      const targetName = step.indexOf('目标名称：使用步骤 3d 中为该变更记录的');
      const existenceCheck = step.indexOf('**检查目标是否已存在：**');
      const move = step.indexOf('mv "<changeRoot>"');

      expect(targetName, label).toBeGreaterThanOrEqual(0);
      expect(existenceCheck, label).toBeGreaterThan(targetName);
      expect(move, label).toBeGreaterThan(existenceCheck);
    }
  });

  // `openspec archive` settles the destination before touching any spec. A
  // collision found only at the move would leave main specs rewritten for a
  // change that stays active, so the batch must check every target first.
  it('checks every archive target before the first main-spec write (#1827)', () => {
    for (const [label, body] of bodies) {
      const preflight = body.indexOf('   d. **归档目标**');
      const conflicts = body.indexOf('4. **检测 spec 冲突**');
      const firstSync = body.indexOf('   a. **同步包含的增量 spec**');

      expect(preflight, label).toBeGreaterThanOrEqual(0);
      expect(conflicts, label).toBeGreaterThan(preflight);
      expect(firstSync, label).toBeGreaterThan(preflight);

      const step = body.slice(preflight, conflicts);
      expect(step, label).toContain('另一个所选变更解析出相同的目标名称');
      expect(step, label).toContain('受阻的变更绝不被同步或移动');
      expect(body, label).toContain(
        '"归档全部"选项 — 对每个未被 `受阻` 的已选变更继续'
      );
      expect(body, label).toContain(
        '在步骤 3 中检查每个归档目标（在第一次主 spec 写入之前）'
      );
    }
  });

  // The dated name must be computed once. Recomputing it at the move lets a
  // batch that crosses midnight check yesterday's target in step 3, sync main
  // specs, then collide at today's target with the change still active.
  it('reuses the target name recorded in step 3 for the move (#1827)', () => {
    for (const [label, body] of bodies) {
      const preflight = body.slice(
        body.indexOf('   d. **归档目标**'),
        body.indexOf('4. **检测 spec 冲突**')
      );
      const step = archiveStep(body, label);

      expect(preflight, label).toContain('记录为该变更的 `<target-name>`');
      expect(preflight, label).toContain('将当前日期前置');
      expect(step, label).toContain(
        '目标名称：使用步骤 3d 中为该变更记录的 `<target-name>`，保持不变'
      );
      expect(step, label).not.toContain('将当前日期前置');
      expect(body, label).toContain('在步骤 3d 中计算一次并在移动时复用');
    }
  });

  // The last check and the `mv` are separate steps, so a target created in
  // between still nests the change with exit 0. The workflow must detect the
  // nesting after the move and undo it instead of reporting success.
  it('detects and undoes a move that nested inside a late target (#1827)', () => {
    for (const [label, body] of bodies) {
      const step = archiveStep(body, label);
      const move = step.indexOf('mv "<changeRoot>"');
      const confirm = step.indexOf('**确认移动没有嵌套：**');

      expect(move, label).toBeGreaterThanOrEqual(0);
      expect(confirm, label).toBeGreaterThan(move);
      expect(step.slice(confirm), label).toContain(
        '将该目录移回 `changeRoot`，并把此变更记为失败'
      );
    }
  });

  // A collision is a failure in every confirmation path, including ready-only,
  // which otherwise records everything not Ready as Skipped.
  it('keeps blocked changes Failed under the ready-only option (#1827)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain(
        '但 `受阻` 的变更保持为失败并附上 `归档目录已存在`'
      );
    }
  });

  // The guardrail and both failure output templates already promised this
  // outcome while the steps never produced it; keep them in agreement.
  it('keeps the guardrail and failure output consistent with the step (#1827)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain(
        '若归档目标已存在，使该变更失败但继续处理其他变更'
      );
      expect(body, label).toContain('归档目录已存在');
    }
  });
});
