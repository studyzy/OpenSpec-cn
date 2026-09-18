import { describe, expect, it } from 'vitest';

import {
  getUpdateChangeSkillTemplate,
  getOpsxUpdateCommandTemplate,
} from '../../../src/core/templates/skill-templates.js';
import { STORE_SELECTION_GUIDANCE } from '../../../src/core/templates/workflows/store-selection.js';
import { PROJECT_ROOT_GUARD } from '../../../src/core/templates/workflows/project-root.js';
import { resolveOptionalWorkflows } from '../../../src/core/templates/optional-workflow.js';
import { ALL_WORKFLOWS, CORE_WORKFLOWS } from '../../../src/core/profiles.js';

const skill = getUpdateChangeSkillTemplate();
const command = getOpsxUpdateCommandTemplate();

const render = (workflows: readonly string[]): Array<[string, string]> => {
  const installed = new Set<string>(workflows);
  return [
    ['skill', resolveOptionalWorkflows(skill.instructions, installed)],
    ['command', resolveOptionalWorkflows(command.content, installed)],
  ];
};

// Both delivery surfaces must carry the same contract; every behavioral
// assertion below runs against each body. Templates carry optional-workflow
// conditionals, so a body is only meaningful once resolved against a workflow
// set — these are the bodies a profile with every workflow installed receives.
const bodies = render(ALL_WORKFLOWS);
const coreBodies = render(CORE_WORKFLOWS);

// The load-bearing sentence of step 4 and the whole of step 5 are pinned
// verbatim. #1836 happened because a single verb ("Apply") in step 4 silently
// re-answered a question step 5 had already answered, so any reword of either
// passage has to come back through this test and re-argue the contract rather
// than just regenerate a parity hash.
const STEP_FOUR_DRAFT_RULE =
  '   - 在对话中起草请求的编辑，而非在文件中。明确它究竟改变了什么；步骤 5 负责所有写入。';

const STEP_FIVE = `5. **确认并应用，一次一个制品**
   - 此步骤执行本工作流中的每一次制品写入；此前的步骤都不编辑制品。
   - 展示每个提议的修订及其原因 — 包括步骤 4 中起草的请求编辑。仅在用户确认后写入。
   - 若用户拒绝修订，不要写入 — 保持该制品不变。
   - 当需要重大重写时，先获取该制品的规则和模板：
     \`\`\`bash
     openspec-cn instructions "<artifact-id>" --change "<name>" --json
     \`\`\`

`;

// Every mention of writing or applying allowed to live OUTSIDE step 5. Each is
// a scope rule, a hand-off to another workflow, or the gate itself - none
// authorizes a write here. Each is spelled in full context: a bare fragment
// such as "already applied" would also erase "treat the requested edit as
// already applied" before any check could see it.
const SANCTIONED_OUTSIDE_STEP_FIVE = [
  STEP_FOUR_DRAFT_RULE,
  '那是起始编辑点。',
  '不要写入 `resolvedOutputPath`',
  '- 仅编辑 `existingOutputPaths` 中的具体文件；绝不要写入 glob `resolvedOutputPath`。',
  '- 在写入前与用户确认每个编辑。',
  '`/opsx:apply`',
  '（任务已勾选 / 已 apply）',
];

// Authorizations need not share any vocabulary with writing ("land the
// requested edit", "it goes straight into the file"), but they must name what
// they authorize. Outside the pinned draft rule and step 3's framing, nothing
// may talk about the requested edit at all.
const REQUESTED_EDIT =
  /请求的(?:编辑|修订|变更)|用户的(?:编辑|修订|变更)|起始编辑点/;

// Synonyms matter as much as the original verb: "commit the edit", "overwrite
// the artifact", "reapply it" all reintroduce #1836 while dodging a naive
// /\bwrite\b/. No leading \b, so over-/re- prefixed forms are caught too.
// The Chinese forms are the ones the translated template actually uses.
// `覆盖` is deliberately absent: this workflow only ever says `如何覆盖`
// (how to override the change selection), never "overwrite".
const WRITE_VERB =
  /(?:over|re)?writ(?:e|es|ing|ten)\b|(?:re)?appl(?:y|ies|ied|ying)\b|\b(?:commit|commits|committing|save|saves|saving|persist|persists|persisting|flush|flushes|flushing|emit|emits|emitting)\b|写入|写下|写进|保存|提交|持久化|落盘/i;

// Verb-free ways to say the same thing: "perform the edit", "put it in place",
// "carry it out", anything "to disk". Step 5 is the only passage entitled to
// this vocabulary, and it is excluded before these run.
const WRITE_PHRASE =
  /\bperform(?:s|ed|ing)?\b|\bcarr(?:y|ies|ied|ying) out\b|\bin place\b|\bto disk\b/i;

// An authorization needs no write verb at all - "do it now, without asking" is
// enough. There is no legitimate use of this phrasing in this workflow.
const CONSENT_BYPASS =
  /without (?:asking|confirming|confirmation)|do not wait for confirmation|no confirmation (?:is )?(?:needed|required)|needs? no confirm|exempt from (?:the )?confirm|skip(?:s|ping)? (?:the )?confirm/i;

// Slice one region out of a workflow body so an assertion about where a rule
// lives cannot be satisfied by the same words appearing somewhere else. The
// label names the marker, so a renamed heading reports which one went missing.
function section(
  body: string,
  startMarker: string,
  endMarker: string,
  label: string
): string {
  const start = body.indexOf(startMarker);
  const end = body.indexOf(endMarker, start + startMarker.length);
  expect(start, `${label}: missing marker ${startMarker}`).toBeGreaterThanOrEqual(0);
  expect(end, `${label}: missing marker ${endMarker}`).toBeGreaterThan(start);
  return body.slice(start, end);
}

function stepFive(body: string, label: string): string {
  return section(body, '5. **确认并应用，一次一个制品**', '6. **指出下一步', `${label} step 5`);
}

// Everything the agent reads except step 5 and the shared store and project-root
// preambles (the root guard says to stop before writing; it authorizes none).
// #1836 lived in step 4, but a sentence in the intro, in step 3, in the
// Guardrails or in the Output section would govern the agent just as well
// while sitting outside any single-step slice. Returns the checks that tripped.
function writeAuthorizationsOutsideStepFive(body: string, label: string): string[] {
  let rest = body
    .split(stepFive(body, label))
    .join('\n')
    .split(STORE_SELECTION_GUIDANCE)
    .join('')
    .split(PROJECT_ROOT_GUARD)
    .join('');
  for (const sanctioned of SANCTIONED_OUTSIDE_STEP_FIVE) {
    rest = rest.split(sanctioned).join('');
  }

  const checks: Array<[string, RegExp]> = [
    ['write verb', WRITE_VERB],
    ['write phrase', WRITE_PHRASE],
    ['consent bypass', CONSENT_BYPASS],
    ['names the requested edit', REQUESTED_EDIT],
    // A leading adverb ("Immediately revise the files ...") must not disarm
    // this - the verb does not have to be the bullet's first token.
    [
      'imperative edit bullet',
      /^\s*-\s*(?:\w+ly,?\s+)?(?:Revise|Edit|Update|Rewrite|Modify|Amend|Patch|Replace)\b/im,
    ],
  ];
  return checks.filter(([, pattern]) => pattern.test(rest)).map(([name]) => name);
}

// Regression for #1836: step 4 said "Apply the requested edit" while step 5 and
// the guardrails said to write only after the user confirms. "Apply" is a write
// verb in this very document - step 5 is titled "Confirm and apply" - so the
// same `/opsx:update "the design now uses X"` either wrote immediately or
// stopped and showed the revision first, depending on which passage the agent
// weighed. Step 5 is the workflow's only gated write path, so its confirmation
// guarantee was unenforceable whenever step 4 governed.
describe('update-change write gate (#1836)', () => {
  it('pins the step 4 draft rule and the whole of step 5', () => {
    for (const [label, body] of bodies) {
      const stepFour = section(
        body,
        '4. **读取并调和**',
        '5. **确认并应用，一次一个制品**',
        `${label} step 4`
      );

      expect(stepFour, `${label} step 4`).toContain(STEP_FOUR_DRAFT_RULE);
      // Verbatim, because an exemption bolted onto the gate ("this does not
      // apply to the requested edit") is invisible to any toContain check.
      expect(stepFive(body, label), `${label} step 5`).toBe(STEP_FIVE);
    }
  });

  it('keeps the whole-body confirmation guardrail', () => {
    for (const [label, body] of bodies) {
      // Deleting this one line used to break nothing.
      expect(body, label).toContain('在写入前与用户确认每个编辑。');
    }
  });

  it('lets no passage outside step 5 authorize a write', () => {
    for (const [label, body] of bodies) {
      expect(writeAuthorizationsOutsideStepFive(body, label), label).toEqual([]);
    }
  });

  // The guard above only proves something if it trips. Each line goes into a
  // different section of each body (intro, Input, steps 1-4 and 6, Output,
  // Guardrails); every one reintroduces #1836 and must be flagged.
  const MUTATIONS: Array<[anchor: string, injected: string]> = [
    ['绝不要编辑代码。', '立即写入请求的编辑。'],
    ['**Input**: 可选地', '将请求的编辑视为已应用到制品。'],
    ['1. **选择变更**', '   - 立即将请求的编辑放入制品。'],
    ['2. **获取变更的制品**', '   请求的编辑会直接写入文件。'],
    ['3. **理解请求**', '   - 立即应用请求的编辑。'],
    ['4. **读取并调和**', '   - 立即用请求的编辑更新制品。'],
    ['6. **指出下一步', '   - 先保存修订。'],
    ['**输出**', '- 请求的编辑已在步骤 4 中应用'],
    ['**护栏**', '- 请求的编辑无需确认。'],
    ['- 在写入前与用户确认每个编辑。', '- 用户的修订无需确认。'],
  ];

  it.each(MUTATIONS)('flags a write authorization injected after %s', (anchor, injected) => {
    for (const [label, body] of bodies) {
      const at = body.indexOf('\n', body.indexOf(anchor));
      expect(body.indexOf(anchor), `${label}: missing anchor`).toBeGreaterThanOrEqual(0);
      const mutated = `${body.slice(0, at + 1)}${injected}\n${body.slice(at + 1)}`;
      // Still passes the step 5 pin, so only the outside-step-5 scan can catch it.
      expect(stepFive(mutated, label), label).toBe(STEP_FIVE);
      expect(writeAuthorizationsOutsideStepFive(mutated, label), label).not.toEqual([]);
    }
  });
});

describe('update-change templates', () => {
  it('generates the expected skill and command shape (3.1)', () => {
    expect(skill.name).toBe('openspec-update-change');
    expect(skill.description).toContain('绝不要编辑代码');
    expect(skill.license).toBe('MIT');
    expect(skill.compatibility).toBe('需要 openspec-cn CLI。');
    expect(skill.metadata).toEqual({ author: 'openspec', version: '1.0' });

    expect(command.name).toBe('OPSX: Update');
    expect(command.category).toBe('Workflow');
    expect(command.tags).toEqual(['workflow', 'artifacts', 'experimental']);
    expect(command.content).toContain('/opsx:update add-auth');

    for (const [label, body] of bodies) {
      expect(body, label).toContain(STORE_SELECTION_GUIDANCE);
      expect(body, label).toContain('openspec-cn list --json');
      expect(body, label).toContain('openspec-cn status --change "<name>" --json');
      expect(body, label).toContain('openspec-cn instructions "<artifact-id>" --change "<name>" --json');
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

  it('hands off to /opsx:continue when that workflow is installed', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain(
        '`/opsx:continue` 负责创建不存在的制品'
      );
      expect(body, label).toContain('建议 `/opsx:continue` 创建它们');
      expect(body, label).toContain('那是 `/opsx:continue` 的职责');
      // The handoff is stated outright, not deferred to a runtime availability
      // check the model has to perform (#1734).
      expect(body, label).not.toContain('may not be installed');
      expect(body, label).not.toContain('verify that it is available');
    }
  });

  it('never names /opsx:continue on a profile that does not install it', () => {
    for (const [label, body] of coreBodies) {
      expect(body, label).not.toContain('/opsx:continue');
      expect(body, label).toContain('它绝不创建缺失的制品');
      expect(body, label).toContain(
        '运行 `openspec-cn status --change "<name>" --json` 获取下一个制品'
      );
      expect(body, label).toContain(
        '`openspec-cn instructions "<artifact-id>" --change "<name>" --json` 来创建它们'
      );
      expect(body, label).toContain(
        '因尚不存在而推迟的任何内容'
      );
      expect(body, label).toContain('创建它们是本工作流之外的独立步骤');
    }
  });

  it('confirms every edit and redirects intent changes to /opsx:new when installed', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('仅在用户确认后写入');
      expect(body, label).toContain('若用户拒绝修订，不要写入');
      expect(body, label).toContain('建议用 `/opsx:new` 重新开始');
      expect(body, label).toContain('更新 vs 重新开始');
      expect(body, label).not.toContain('首先验证可选');
    }
  });

  it('routes intent changes to the CLI when /opsx:new is not installed', () => {
    for (const [label, body] of coreBodies) {
      expect(body, label).not.toContain('/opsx:new');
      expect(body, label).toContain('请求一个不同的未使用变更名称');
      expect(body, label).toContain('openspec-cn new change "<new-change-name>"');
      expect(body, label).not.toContain('openspec-cn new change "<name>"');
      expect(body, label).toContain('更新 vs 重新开始');
    }
  });
});
