import { describe, expect, it } from 'vitest';

import {
  getArchiveChangeSkillTemplate,
  getOpsxArchiveCommandTemplate,
} from '../../../src/core/templates/skill-templates.js';

const bodies: Array<[string, string]> = [
  ['skill', getArchiveChangeSkillTemplate().instructions],
  ['command', getOpsxArchiveCommandTemplate().content],
];

function section(body: string, start: string, end: string): string {
  return body.slice(body.indexOf(start), body.indexOf(end));
}

describe('archive target check (#2276)', () => {
  it('finds an existing archive before any main spec is written', () => {
    for (const [label, body] of bodies) {
      const step = section(body, '4. **评估 delta spec 同步状态**', '5. **执行归档**');
      const check = step.indexOf('**先检查归档目标：**');
      const stop = step.indexOf('已存在，在写入任何主 spec 之前停止');
      const firstSync = step.indexOf('"立即同步');
      const recheck = step.indexOf('现在再次检查归档目标。');
      const syncWrites = step.indexOf('在所选同步写入任何主 spec 之前');

      expect(check, label).toBeGreaterThanOrEqual(0);
      expect(stop, label).toBeGreaterThan(check);
      expect(stop, label).toBeLessThan(firstSync);
      expect(recheck, label).toBeGreaterThan(firstSync);
      expect(recheck, label).toBeLessThan(syncWrites);
      expect(step, label).toContain('列出本次运行已同步的主 spec');
    }
  });

  it('checks the same target again immediately before the move', () => {
    for (const [label, body] of bodies) {
      const step = section(body, '5. **执行归档**', '6. **展示汇总**');

      expect(step, label).toContain('使用步骤 4 中记录的 `<target-name>`');
      expect(step, label).toContain('**在移动前立即再次检查：**');
      expect(step, label).toContain('报告步骤 4 中已同步的主 spec');
      expect(step.indexOf('使用步骤 4 中记录的 `<target-name>`'), label).toBeLessThan(
        step.indexOf('**在移动前立即再次检查：**')
      );
      expect(step.indexOf('**在移动前立即再次检查：**'), label).toBeLessThan(
        step.indexOf('mv "<changeRoot>"')
      );
    }
  });

  it('does not offer a different date as a way out', () => {
    for (const [label, body] of bodies) {
      expect(body, label).not.toContain('不同的日期再归档');
      expect(body, label).not.toContain('等到不同日期再归档');
    }
  });
});
