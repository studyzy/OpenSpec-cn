import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  getVerifyChangeSkillTemplate,
  getOpsxVerifyCommandTemplate,
} from '../../../src/core/templates/skill-templates.js';

// #1959: verify treated every "### Requirement:" in a change's delta specs as
// behavior that must exist, whichever section it sat under. A REMOVED
// requirement that was removed correctly came back as CRITICAL "Requirement not
// found" with the recommendation to implement it, so an agent following the
// report restored what the change had just deleted.
const bodies: Array<[string, string]> = [
  ['skill', getVerifyChangeSkillTemplate().instructions],
  ['command', getOpsxVerifyCommandTemplate().content],
  // The committed skills.sh mirror is what `npx skills add` installs.
  [
    'committed skill file',
    readFileSync(new URL('../../../skills/openspec-verify-change/SKILL.md', import.meta.url), 'utf8'),
  ],
];

function section(body: string, start: string, end: string, label: string): string {
  const from = body.indexOf(start);
  const to = body.indexOf(end, from + start.length);
  expect(from, `${label}: "${start}" not found`).toBeGreaterThanOrEqual(0);
  expect(to, `${label}: "${end}" not found after "${start}"`).toBeGreaterThan(from);
  return body.slice(from, to);
}

describe('verify checks each requirement by its delta operation', () => {
  it.each(bodies)('%s: classifies requirements by delta section before checking them', (label, body) => {
    const coverage = section(body, '**Spec 覆盖**', '6. **验证正确性**', label);

    // RENAMED entries carry no "### Requirement:" heading, so a rename-only
    // delta must not read as empty.
    expect(coverage, label).toContain('或在 `## RENAMED Requirements` 下列为 `FROM:`/`TO:` 对');
    for (const header of ['## ADDED', '## MODIFIED', '## REMOVED', '## RENAMED Requirements']) {
      expect(coverage, label).toContain(header);
    }
    // The unscoped loop is what produced the bug.
    expect(coverage, label).not.toMatch(/^\s*- 对每条需求：$/m);
  });

  it.each(bodies)('%s: reports a missing requirement only for ADDED or MODIFIED', (label, body) => {
    const coverage = section(body, '**Spec 覆盖**', '6. **验证正确性**', label);
    const addedOrModified = section(coverage, '- 对每条 ADDED 或 MODIFIED 需求', '- 对每条 REMOVED 需求', label);

    expect(addedOrModified, label).toContain('添加 CRITICAL 问题："未找到需求：<需求名>"');
  });

  it.each(bodies)('%s: inverts the check for a REMOVED requirement', (label, body) => {
    const coverage = section(body, '**Spec 覆盖**', '6. **验证正确性**', label);
    const removed = section(coverage, '- 对每条 REMOVED 需求', '- 对每条 RENAMED 条目', label);

    expect(removed, label).toContain('找不到实现是预期结果。');
    expect(removed, label).toContain('绝不把 REMOVED 需求报告为 "未找到需求"');
    expect(removed, label).toContain('添加 CRITICAL 问题："被移除的需求仍有实现：<需求名>"');
    expect(removed, label).not.toContain('建议："实现需求 X');
  });

  it.each(bodies)('%s: does not report the old name of a RENAMED requirement as missing', (label, body) => {
    const renamed = section(body, '- 对每条 RENAMED 条目', '6. **验证正确性**', label);

    expect(renamed, label).toContain('不要把 FROM 名称报告为缺失');
    expect(renamed, label).toContain('也不要要求重命名代码符号、标识符或文件名');
  });

  // A rename keeps behavior, so a rename-only change must still prove the
  // behavior exists before verify can call it ready. Its evidence is the
  // baseline requirement in the main spec, not the RENAMED entry itself.
  it.each(bodies)('%s: verifies the unchanged behavior of a RENAMED requirement against its baseline', (label, body) => {
    const renamed = section(body, '- 对每条 RENAMED 条目', '6. **验证正确性**', label);

    expect(renamed, label).toContain('因此检查 TO 需求所保留的该行为');
    expect(renamed, label).toContain('`<planningHome.root>/openspec/specs/<capability-path>/spec.md`');
    expect(renamed, label).toContain('仅当 FROM 名称不存在（主 spec 已同步）时取 TO 名称');
    expect(renamed, label).toContain('其正文和场景就是 TO 需求所保留行为的证据。');
    expect(renamed, label).toContain('在代码库中搜索该行为并评估是否仍有实现。');
    expect(renamed, label).toContain('添加 CRITICAL 问题："未找到重命名需求：<TO 名称>"');
    expect(body, label).toContain('- 行为不再实现的重命名需求');
    expect(renamed, label).toContain('若 TO 名称也出现在 MODIFIED 下，其行为在彼处对照 MODIFIED 文本检查');
  });

  it.each(bodies)('%s: never counts an unchecked rename as passing', (label, body) => {
    const renamed = section(body, '- 对每条 RENAMED 条目', '6. **验证正确性**', label);

    expect(renamed, label).toContain('若找不到或无法读取基线需求，将该条目的 **Spec 覆盖**标记为未验证');
    expect(renamed, label).toContain('绝不把未检查的重命名计为通过。');
    expect(body, label).toContain('（每条 RENAMED 条目在那里对照其基线行为检查）');
  });

  it.each(bodies)('%s: maps implementation and scenarios only for ADDED or MODIFIED requirements', (label, body) => {
    const correctness = section(body, '6. **验证正确性**', '7. **验证连贯性**', label);

    expect(correctness, label).toContain('- 对 delta specs 中的每条 ADDED 或 MODIFIED 需求');
    expect(correctness, label).toContain('- 对 delta specs 中 ADDED 或 MODIFIED 需求下的每个场景');
    expect(correctness, label).toContain('跳过 REMOVED 需求下的场景');
    expect(correctness, label).not.toContain('- 对 delta specs 中的每条需求：');
    expect(correctness, label).not.toContain('- 对 delta specs 中的每个场景');
  });
  // With #1732's "Not verified" rule, a change with nothing to add or modify
  // left both correctness checks empty, which read as unverified and withheld
  // readiness. That is the exact case #1959 reports.
  it.each(bodies)('%s: treats the correctness checks of a removal-only change as not applicable', (label, body) => {
    const correctness = section(body, '6. **验证正确性**', '**需求实现映射**：', label);

    expect(correctness, label).toContain('若 delta specs 可读且至少包含一条 REMOVED 或 RENAMED 需求、但没有 ADDED 或 MODIFIED 需求');
    // An empty or unparseable delta must not pass as a removal-only change.
    expect(correctness, label).toContain('完全没有可解析需求的 delta spec 属于不可用证据，而非仅移除的变更：将这些检查标记为未验证。');
    expect(correctness, label).toContain('将**需求实现映射**和**场景覆盖**报告为**不适用**');
    expect(correctness, label).toContain('不要把这两项检查标记为未验证');
    expect(body, label).toContain('当变更中可读的 delta specs 只包含 REMOVED 或 RENAMED 需求而没有 ADDED 或 MODIFIED 需求时，其正确性检查同样**不适用**（见步骤 6）。');
  });

  it.each(bodies)('%s: does not treat artifacts or replacement code as the removed behavior', (label, body) => {
    const removed = section(body, '- 对每条 REMOVED 需求', '- 对每条 RENAMED 条目', label);

    expect(removed, label).toContain('`openspec/` 产出物或文档中的匹配，或仅服务于 Migration 说明或某条 ADDED 需求的代码，本身不构成证据。');
    expect(removed, label).toContain('报告任何仍在提供被移除行为的代码路径，包括与 ADDED 需求共享的路径。');
  });

  it.each(bodies)('%s: counts removals separately from covered requirements', (label, body) => {
    expect(body, label).toContain('N 只统计 ADDED 和 MODIFIED 需求，REMOVED 和 RENAMED 需求单独报告');
    expect(body, label).toContain('正确性格写 `不适用（无 ADDED 或 MODIFIED 需求）`');
  });
});
