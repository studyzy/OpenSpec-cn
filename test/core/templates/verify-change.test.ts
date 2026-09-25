import { describe, expect, it } from 'vitest';

import {
  getOpsxVerifyCommandTemplate,
  getVerifyChangeSkillTemplate,
} from '../../../src/core/templates/skill-templates.js';

const skill = getVerifyChangeSkillTemplate();
const command = getOpsxVerifyCommandTemplate();

const bodies: Array<[string, string]> = [
  ['skill', skill.instructions],
  ['command', command.content],
];

describe('verify-change templates', () => {
  it('keeps active no-task changes eligible for ambiguous selection', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('显示列表返回的所有活跃变更');
      expect(body, label).toContain('包括 `status: "no-tasks"` 的变更');
      expect(body, label).not.toContain('显示有实现任务（tasks 制品存在）的变更');
    }
  });

  it('prefers schema-aware apply task fields without assuming a tasks artifact id', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('顶层 `tasks` 和 `progress`');
      expect(body, label).toContain('schema 的 `apply.tracks` 配置');
      expect(body, label).toContain('匹配到的所有可读具体文件聚合');
      expect(body, label).toContain('与被追踪产出物的 ID 无关');
      expect(body, label).toContain('不要从 `contextFiles` 的键推断追踪情况');
    }
  });

  it('marks partial tracking evidence as not verified', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('若 `unavailableTrackingFiles` 非空');
      expect(body, label).toContain('附上每个不可用路径及原因');
      expect(body, label).toContain('不要从残缺的 `tasks` 和 `progress` 字段推断完成情况');
    }
  });


  it('does not lose incomplete checkboxes omitted from the task list', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('若 `progress.remaining` 大于 0');
      expect(body, label).toContain('没有描述的未完成复选框');
      expect(body, label).toContain('不要仅凭列出的任务推断完成情况');
    }
  });

  it('requires usable evidence rather than just existing artifact paths', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('或不含可用的需求、场景或设计决策');
      expect(body, label).toContain('继续执行其余证据支持的检查');
      expect(body, label).toContain('部分检查过的输入集不算完全验证过的检查');
      expect(body, label).toContain('若无法识别实现变更，将**代码模式一致性**标记为未验证');
    }
  });

  it('does not mistake apply readiness for verification or execute apply instructions', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('将 apply 的 `state` 和 `instruction` 视为上下文，而非验证结论');
      expect(body, label).toContain('验证过程中不要实现任务或归档变更');
    }
  });

  it('preserves optional artifacts and the existing archive workflow', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('验证是建议性的');
      expect(body, label).toContain('`skip_specs: true`');
      expect(body, label).toContain('没有任务追踪的 schema');
      expect(body, label).toContain('不要为了得到干净的报告而要求或虚构可选的、被有意省略的产出物');
      expect(body, label).toContain('将 schema 未定义的检查、或 status 报告为有意跳过的产出物，标记为**不适用**');
      expect(body, label).toContain('将它们排除在跳过检查计数和归档就绪评估之外');
      expect(body, label).toContain('若 `taskTrackingConfigured` 为 false，将**任务完成情况**报告为不适用');
      expect(body, label).toContain('若 `taskTrackingConfigured` 为 true 且 `tasks` 为空，将**任务完成情况**标记为未验证');
      expect(body, label).toContain('`未验证` 描述的是本报告的局限，不是新的归档前置条件');
      expect(body, label).toContain('归档保留其自身的检查与用户确认行为');
    }
  });

  it('preserves task-only verification without dropping checks supported by other artifacts', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('若适用检查仅有任务证据可用，只验证任务完成情况');
      expect(body, label).toContain('（包括**代码模式一致性**）标记为未验证');
      expect(body, label).toContain('有其他支撑产出物时**代码模式一致性**仍然执行');
    }
  });

  it('covers warning and suggestion outcomes without claiming all checks passed', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('若无 CRITICAL 问题、有一个或多个警告、且没有检查被跳过');
      expect(body, label).toContain('若仅有建议且没有检查被跳过');
      expect(body, label).toContain('建议数非零时都要给出');
    }
  });

  it('maps missing supporting artifacts to every check they prevent', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain(
        '将 **Spec 覆盖**、**需求实现映射**和**场景覆盖**标记为未验证'
      );
      expect(body, label).toContain('将**设计遵循**标记为未验证');
      expect(body, label).toContain('**代码模式一致性**仍然执行');
    }
  });

  it('never reports a skipped check as passing or archive-ready', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('每个跳过的检查写 `未验证（<原因>）`');
      expect(body, label).toContain('绝不把跳过的检查计为通过');
      expect(body, label).toContain('最终评估中把每个未验证或部分验证的检查视为跳过');
      expect(body, label).toContain('若有检查被跳过且没有 CRITICAL 问题');
      expect(body, label).toContain('若有检查被跳过，还要列出每个被跳过的检查及其原因');
      expect(body, label).toContain('不要声称可归档');
      expect(body, label).toContain('若无任何问题且没有检查被跳过');
    }
  });
});
