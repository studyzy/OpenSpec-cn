import { describe, expect, it } from 'vitest';

import {
  getSkillReferenceTransformer,
  transformCommandInvocations,
  transformToCodexCompatibleSkillReferences,
  transformToSkillReferences,
} from '../../../src/utils/command-references.js';
import { CommandAdapterRegistry } from '../../../src/core/command-generation/registry.js';
import {
  formatCommandInvocation,
  getInvocationForAdapter,
} from '../../../src/core/command-generation/invocation.js';
import { AI_TOOLS } from '../../../src/core/config.js';
import {
  generateSkillContent,
  getCommandContents,
  getCommandTemplates,
  getSkillTemplates,
} from '../../../src/core/shared/skill-generation.js';
import { generateCommands } from '../../../src/core/command-generation/generator.js';
import { getProfileWorkflows } from '../../../src/core/profiles.js';

// Bodies as generated with every workflow installed. Profile-dependent
// handoffs are covered separately below.
const skill = getSkillTemplates().find(e => e.workflowId === 'explore')!.template;
const command = getCommandTemplates().find(e => e.id === 'explore')!.template;

// Both delivery surfaces must carry the same contract; every behavioral
// assertion below runs against each body.
const bodies: Array<[string, string]> = [
  ['skill', skill.instructions],
  ['command', command.content],
];

function newChangeTransition(body: string, label: string): string {
  const start = body.indexOf('### 当没有变更时');
  const end = body.indexOf('### 当存在变更时');

  expect(start, label).toBeGreaterThanOrEqual(0);
  expect(end, label).toBeGreaterThan(start);

  return body.slice(start, end);
}

function occurrenceCount(body: string, value: string): number {
  return body.split(value).length - 1;
}

const NON_ASCII = /[^\x00-\x7F]/;

// Diagram lines are the ones drawn with box/arrow glyphs. Prose lines in the
// worked examples (user dialog, the optional summary) are not diagrams, and the
// CN build localizes them, so only the graphic lines must stay ASCII.
const DIAGRAM_LINE = /[\|+v^=<>]/;

function fencedBlockLines(body: string): Array<[number, string]> {
  const lines: Array<[number, string]> = [];
  let inFence = false;

  body.split('\n').forEach((line, index) => {
    if (line.trimStart().startsWith('```')) {
      inFence = !inFence;
      return;
    }
    if (inFence && DIAGRAM_LINE.test(line)) {
      lines.push([index + 1, line]);
    }
  });

  return lines;
}

describe('explore templates', () => {
  it('guides planning without forcing an interview on open-ended exploration (#1017)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('当用户在规划一个变更时');
      expect(body, label).toContain('对于开放性讨论，跟随对话走向');
      expect(body, label).toContain('当用户已有足够清晰度时停止提问');
      expect(body, label).toContain('允许他们暂停、转向或推迟决策');
      expect(body, label).not.toContain('Relentless Interview Mode');
    }
  });

  it('investigates repository facts before asking while acknowledging missing evidence (#1017)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('在提出事实性问题之前，先按下面的上下文发现步骤');
      expect(body, label).toContain('相关的 OpenSpec 制品、源码、测试、文档和配置');
      expect(body, label).toContain('不要让用户重复你能自行验证的事实');
      expect(body, label).toContain('如果证据缺失、冲突或无法访问');
      expect(body, label).toContain('只询问继续推进所必需的澄清');
    }
  });

  it('resolves blocking decisions first and revisits dependent assumptions (#1017)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('先解决下一个阻塞决策，再处理依赖它的细节');
      expect(body, label).toContain('当先前的答案变化时，重新审视下游假设');
      expect(body, label).toContain('跳过与此目标无关的分支');
    }
  });

  it('asks one focused question and recommends only when evidence supports a choice (#1017)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('每次只问一个聚焦的问题');
      expect(body, label).toContain('只有用户要求时才批量提问');
      expect(body, label).toContain('简要说明它为什么重要、能解锁哪个决策');
      expect(body, label).toContain('当证据支持某个建议时');
      expect(body, label).toContain('不要臆造意图、优先级或外部约束');
    }
  });

  it('keeps decisions in the conversation without accepting defaults or authorizing writes (#1017)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('决策记录在对话中');
      expect(body, label).toContain('区分已确认的决策、建议的默认值和未解决的问题');
      expect(body, label).toContain('沉默不等于接受');
      expect(body, label).toContain('接受某个答案或一批建议不等于授权写入');
      expect(body, label).toContain('文件写入确认要与探索性问题分开');
    }
  });

  it('delivers the same planning guidance exactly once in both templates (#1017)', () => {
    const sections = bodies.map(([label, body]) => {
      const heading = '## 规划变更';
      expect(occurrenceCount(body, heading), label).toBe(1);
      const start = body.indexOf(heading);
      const end = body.indexOf('\n---', start);
      expect(end, label).toBeGreaterThan(start);
      return body.slice(start, end);
    });

    expect(sections[0]).toBe(sections[1]);
  });

  // Regression for #696: explore never loaded the project's declared
  // context, so it reasoned without the tech stack, conventions, and
  // rules every artifact-creating workflow already receives.
  it('loads project context from the OpenSpec config at startup (#696)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('openspec/config.yaml');
      expect(body, label).toContain('`context`：项目背景');
      expect(body, label).toContain('`rules`：按制品 ID 索引');
    }
  });

  it('resolves the config through the reported root rather than assuming a repo-local path (#696)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('openspec-cn list --json');
      expect(body, label).toContain('<root.path>/openspec/config.yaml');
      expect(body, label).toContain('root.path');
    }
  });

  // resolveConfigFilePath() probes config.yaml then config.yml, and
  // `openspec init` leaves a .yml project on .yml forever - naming only
  // .yaml would silently skip context for those projects.
  it('accepts config.yml as well as config.yaml (#696)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('config.yml');
      expect(body, label).toContain('若两者均不存在则跳过');
    }
  });

  // `rules` is Record<artifactId, string[]>; explore holds no artifact at
  // startup, so the guidance must not invite blanket application.
  it('scopes rules to the artifact they are keyed to (#696)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain(
        '某个制品的条目仅在你写入该制品时适用'
      );
    }
  });

  // House style across instructions.ts and the sibling workflow templates
  // forbids leaking context/rules into the artifact, not just the chat.
  it('treats project context as constraints that must not leak into output (#696)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('给你遵循的约束');
      expect(body, label).toContain(
        '不要将它们复制到对话或你创建的任何制品中'
      );
    }
  });

  it('requires separate confirmation before any file-writing action (#1715)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain(
        '在进行第一次可写入操作之前'
      );
      expect(body, label).toContain('说明你要更改的制品或文件');
      expect(body, label).toContain('提出一个直接的"是/否"问题');
      expect(body, label).toContain('在单独的消息中等候用户的明确确认');
      expect(body, label).toContain(
        '回答设计或澄清问题绝不等于同意写入'
      );
      expect(body, label).toContain('无需确认即可运行只读命令或工具');
      expect(body, label).toContain(
        '确认仅覆盖你描述的范围；再次扩展前需重新询问'
      );
    }
  });

  it('treats workflow configuration and write-capable commands as changes (#1715)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain(
        '创建或编辑 schemas、templates 或 `openspec/config.yaml` 是变更'
      );
      expect(body, label).toContain(
        '包括 `openspec-cn new change` 或其他会写入文件的命令'
      );
      expect(body, label).toContain(
        '在已确认的范围内创建或更新 OpenSpec 变更制品没问题，写入其他任何内容则不行'
      );
    }
  });

  // Regression for #1828: the #1715 write-confirmation rule named
  // `openspec new change` as something that needs a separate yes/no, while
  // the capture branch told the agent to transition "seamlessly" into
  // running it. Both readings were defensible, so the same request either
  // wrote files immediately or stopped and asked. The rule now resolves the
  // conflict in one direction: an explicit capture request IS the
  // confirmation, for the scope that request names.
  it('treats an explicit capture request as the write confirmation (#1828)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain(
        '用户明确要求将探索内容捕获为新变更，其本身就构成该确认'
      );
      // Scoped to change artifacts, so the carve-out cannot reach the
      // workflow configuration #1715 reported an agent editing.
      expect(body, label).toContain(
        '覆盖该变更及请求中指定的变更制品'
      );
    }
  });

  it('keeps the strict rule for a capture the agent proposed itself (#1828)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain(
        '当你自己提议捕获时，该规则约束 `openspec-cn new change`'
      );
      // The guardrail points at the capture transition rather than restating
      // the contract a third time, so the three sites cannot drift apart.
      expect(body, label).toContain(
        '用户自己提出的捕获请求是例外，在上文的捕获过渡中处理'
      );
    }
  });

  it('states the carve-out at the head of the capture branch, before the scaffold step (#1828)', () => {
    for (const [label, body] of bodies) {
      const transition = newChangeTransition(body, label);
      const carveOut = transition.indexOf(
        '该请求即上文所需的确认'
      );
      const scaffold = transition.indexOf('1. 在创建任何制品之前运行 `openspec-cn new change "<name>"`');

      expect(carveOut, label).toBeGreaterThanOrEqual(0);
      expect(scaffold, label).toBeGreaterThan(carveOut);
      expect(transition, label).toContain(
        '创建请求中指定的变更制品，仅此而已'
      );
    }
  });

  // A yes to an offer the agent made looks identical to a user-initiated
  // capture request at the point the decision is made, so the discriminator
  // has to live in the branch, not only in the guardrail 190 lines below it.
  it('carries the agent-proposed discriminator in the branch itself (#1828)', () => {
    for (const [label, body] of bodies) {
      const transition = newChangeTransition(body, label);

      expect(transition, label).toContain(
        '这仅在请求出自用户时才成立'
      );
      expect(transition, label).toContain(
        '对你自己发出的提议回以一个"是"，只确认你的提议本身所指的范围'
      );
    }
  });

  // "Do not ask for a second confirmation" would have contradicted step 2,
  // nine lines below it, which requires asking before expanding the capture.
  // Narrow the licence to re-asking for what was already asked for.
  it('does not license skipping the asks the capture steps still require (#1828)', () => {
    for (const [label, body] of bodies) {
      const transition = newChangeTransition(body, label);

      expect(transition, label).toContain(
        '不要对用户已经要求过的事情重复询问；超出该范围的任何内容都要先询问'
      );
      expect(transition, label).not.toContain('Do not ask for a second confirmation');
      expect(transition, label).toContain('在扩展捕获范围前询问');
      expect(transition, label).toContain(
        '未经用户批准不要创建未请求的前置制品'
      );
    }
  });

  // The carve-out must not become a blanket write permit: #1715's guarantee
  // survives only if everything outside the requested scope still stops.
  it('keeps the carve-out scoped to what the request named (#1828, #1715)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain(
        '确认仅覆盖你描述的范围；再次扩展前需重新询问'
      );
      expect(body, label).toContain(
        '回答设计或澄清问题绝不等于同意写入'
      );
      expect(body, label).toContain(
        '接受某个答案或一批建议不等于授权写入'
      );
      expect(body, label).toContain(
        '创建或编辑 schemas、templates 或 `openspec/config.yaml` 是变更'
      );
    }
  });

  // #1828 was not a missing sentence. It was a second, contradictory sentence
  // elsewhere in the same body, and no `toContain` assertion can see one of
  // those: every pinned string stays present while the new sentence reverses
  // it. So invert the check. Collect EVERY sentence that couples consent
  // language to the capture topic and require each to be one the resolution
  // sanctions, which surfaces a gate added anywhere in the body - Guardrails,
  // "Planning a Change", either capture branch.
  //
  // Limits worth knowing: this is lexical. A sentence that reverses the
  // resolution without using any consent word - redefining what counts as
  // "requested", or suspending the carve-out on a condition - is invisible
  // here and stays a review responsibility.
  const CONSENT_WORDS =
    /\b(confirm(?:ation|s|ed)?|yes\/no|approv(?:al|es|ed)|permission|consent)\b/i;
  const CAPTURE_WORDS = /(openspec new change|scaffold|captur|write-capable|first write)/i;

  const SANCTIONED_CONSENT = [
    // The stance paragraph: the rule, then the carve-out.
    /You MAY create or update OpenSpec change artifacts .* within a confirmed scope/,
    /Before the first write-capable action, name the artifacts or files you would change/,
    /An explicit request from the user to capture the exploration as a new change is itself that confirmation/,
    // The capture branch: the carve-out and both of its fences.
    /that request is the confirmation required above/,
    /This holds only when the request is theirs/,
    /a yes to an offer you made confirms only the scope your offer itself named/,
    /Don't re-ask for what they already asked for/,
    /Do not create an unrequested prerequisite unless the user approves/,
    // The guardrail: the rule, and a pointer back to the branch.
    /Before the first write-capable action—including `openspec new change`/,
    /That rule governs `openspec new change` whenever you are the one proposing the capture/,
  ];

  // The `--store` reminder repeats on five steps and says "confirmed" only to
  // mean "the store id you already resolved", which is not a consent rule.
  const STORE_REMINDER =
    /\(append the confirmed `--store "<id>"` only for a registered standalone store\)/g;

  function consentSentences(body: string, requireCaptureTopic: boolean): string[] {
    return body
      .replace(STORE_REMINDER, '')
      .split(/(?<=[.:;])\s+/)
      .map((sentence) => sentence.replace(/\s+/g, ' ').trim())
      .filter(
        (sentence) =>
          CONSENT_WORDS.test(sentence) &&
          (!requireCaptureTopic || CAPTURE_WORDS.test(sentence))
      );
  }

  it('couples consent to capture only where the resolution sanctions it (#1828)', () => {
    for (const [label, body] of bodies) {
      const unsanctioned = consentSentences(body, true).filter(
        (sentence) => !SANCTIONED_CONSENT.some((allowed) => allowed.test(sentence))
      );

      expect(unsanctioned, `${label} must add no unsanctioned consent rule`).toEqual([]);
    }
  });

  // Inside the capture branch, drop the topic filter entirely: a gate written
  // there is about the capture whether or not it says so. Without this, a bare
  // "get a fresh yes/no before running anything" inserted above step 1 reads as
  // off-topic and reinstates #1828 with the suite green.
  it('adds no confirmation gate of its own inside the capture branch (#1828)', () => {
    for (const [label, body] of bodies) {
      const unsanctioned = consentSentences(
        newChangeTransition(body, label),
        false
      ).filter((sentence) => !SANCTIONED_CONSENT.some((allowed) => allowed.test(sentence)));

      expect(unsanctioned, `${label} capture branch must carry no gate`).toEqual([]);
    }
  });

  it('scaffolds a new change before capturing exploration artifacts (#668, #720)', () => {
    for (const [label, body] of bodies) {
      const transition = newChangeTransition(body, label);

      expect(transition, label).toContain('openspec-cn new change "<name>"');
      expect(transition, label).toContain(
        '绝不要手动在 `openspec/changes/` 下创建新变更目录'
      );
      expect(transition, label).toContain('`.openspec.yaml`');
      expect(transition, label).not.toContain(
        'Never create files or directories directly under `openspec/changes/`'
      );
    }
  });

  it('retains the selected store throughout the capture transition (#668, #720)', () => {
    for (const [label, body] of bodies) {
      const transition = newChangeTransition(body, label);
      const scaffold = transition.indexOf('在创建任何制品之前运行 `openspec-cn new change "<name>"`');
      const retainStore = transition.indexOf(
        '在后续每个适用的 `status` 和 `instructions` 命令上保留选定的 `--store <id>`'
      );
      const initialStatus = transition.indexOf(
        '2. 运行 `openspec-cn status --change "<name>" --json`'
      );

      expect(retainStore, label).toBeGreaterThan(scaffold);
      expect(initialStatus, label).toBeGreaterThan(retainStore);
      expect(
        occurrenceCount(
          transition,
          '仅对注册的独立存储追加确认的'
        ),
        label
      ).toBe(5);
    }
  });

  it('continues an accepted transition through the requested artifact (#668)', () => {
    for (const [label, body] of bodies) {
      const transition = newChangeTransition(body, label);

      expect(transition, label).toContain('openspec-cn status --change "<name>" --json');
      expect(transition, label).toContain(
        'openspec-cn instructions "<artifact-id>" --change "<name>" --json'
      );
      expect(transition, label).toMatch(/捕获用户请求的制品/);
      expect(transition, label).toContain(
        '无需让他们调用另一个工作流命令'
      );
      expect(transition, label).toMatch(/按依赖顺序处理/i);
      expect(transition, label).toMatch(
        /创建每个制品后.*重新运行.*status/
      );
      expect(transition, label).toMatch(
        /指令将创建委托给特定 skill 或命令/
      );
      expect(transition, label).toMatch(
        /验证.*具体输出/
      );
    }
  });

  it('keeps the seamless capture steps ordered (#668, #720)', () => {
    for (const [label, body] of bodies) {
      const transition = newChangeTransition(body, label);
      const scaffold = transition.indexOf('在创建任何制品之前运行 `openspec-cn new change "<name>"`');
      const initialStatus = transition.indexOf(
        '2. 运行 `openspec-cn status --change "<name>" --json`'
      );
      const readyInstructions = transition.indexOf(
        '对每个处于 `ready` 状态的请求制品，运行 `openspec-cn instructions'
      );
      const verifyOutput = transition.indexOf(
        '验证选定的具体输出存在'
      );
      const refreshStatus = transition.indexOf(
        '创建每个制品后，重新运行 `openspec-cn status'
      );

      expect(scaffold, label).toBeGreaterThanOrEqual(0);
      expect(initialStatus, label).toBeGreaterThan(scaffold);
      expect(readyInstructions, label).toBeGreaterThan(initialStatus);
      expect(verifyOutput, label).toBeGreaterThan(readyInstructions);
      expect(refreshStatus, label).toBeGreaterThan(verifyOutput);
      expect(occurrenceCount(transition, 'openspec-cn new change "<name>"'), label).toBe(1);
      expect(
        occurrenceCount(transition, 'openspec-cn status --change "<name>" --json'),
        label
      ).toBe(2);
      expect(
        occurrenceCount(transition, 'openspec-cn instructions "<artifact-id>"'),
        label
      ).toBe(2);
      expect(
        occurrenceCount(transition, 'openspec-cn instructions "<prerequisite-id>"'),
        label
      ).toBe(1);
      expect(
        occurrenceCount(transition, '验证选定的具体输出存在'),
        label
      ).toBe(1);
      expect(
        occurrenceCount(transition, '创建每个制品后，重新运行 `openspec-cn status'),
        label
      ).toBe(1);
    }
  });

  // Regression for #983: the worked examples drew boxes and tables with
  // Unicode box-drawing, arrow, and marker glyphs. Agents copy those
  // examples verbatim, and on terminals that render the glyphs
  // double-width the right border of every padded box drifted loose.
  it('draws every fenced example with plain ASCII only (#983)', () => {
    for (const [label, body] of bodies) {
      const offenders = fencedBlockLines(body)
        .filter(([, line]) => NON_ASCII.test(line))
        .map(([lineNumber, line]) => `${lineNumber}: ${line}`);

      expect(offenders, `${label} fenced examples must be pure ASCII`).toEqual([]);
    }
  });

  it('tells the agent to draw with ASCII and says why (#983)', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain('**仅使用纯 ASCII 绘制**');
      expect(body, label).toContain('渲染宽度可能不同');
      expect(body, label).toContain('让每个图形字符保持 ASCII');
    }
  });

  it('stops after scaffolding when the user requests only a new change (#668)', () => {
    for (const [label, body] of bodies) {
      const transition = newChangeTransition(body, label);
      expect(transition, label).toContain(
        '若他们只要求开始一个变更，则在搭建脚手架后停止并显示其状态'
      );
    }
  });

  it('uses dependency context and artifact constraints during capture (#668)', () => {
    for (const [label, body] of bodies) {
      const transition = newChangeTransition(body, label);

      expect(transition, label).toMatch(
        /读取.*dependencies.*列出的.*依赖文件/
      );
      expect(transition, label).toMatch(/应用.*context.*rules.*约束.*不.*复制/);
    }
  });

  it('handles conditional prerequisites without deadlocking capture (#668)', () => {
    for (const [label, body] of bodies) {
      const transition = newChangeTransition(body, label);
      const requestedInstructions = transition.indexOf(
        '对每个处于 `ready` 状态的请求制品，运行 `openspec-cn instructions'
      );
      const evaluateRequestedCondition = transition.indexOf(
        '在创建请求的制品之前，根据探索出的变更评估其自身 `instruction` 中的任何条件'
      );
      const inspectPrerequisite = transition.indexOf(
        '对该前置制品运行 `openspec-cn instructions "<prerequisite-id>"'
      );
      const evaluateCondition = transition.indexOf(
        '根据探索出的变更评估该条件'
      );
      const recordSkip = transition.indexOf(
        '仅当条件不适用时记录为有意跳过'
      );
      const requireExpansion = transition.indexOf(
        '若条件适用，或前置制品非条件性，将其视为正常前置制品'
      );
      const approvalGuard = transition.indexOf(
        '未经用户批准不要创建未请求的前置制品'
      );

      expect(transition, label).toContain(
        '对该前置制品运行 `openspec-cn instructions "<prerequisite-id>" --change "<name>" --json`（仅对注册的独立存储追加确认的 `--store "<id>"`），无论它是 `ready` 还是 `blocked`'
      );
      expect(transition, label).toContain(
        '仅当条件不适用时记录为有意跳过'
      );
      expect(transition, label).toContain(
        '仅当条件不适用时记录为有意跳过'
      );
      expect(transition, label).toContain(
        '若条件适用，或前置制品非条件性，将其视为正常前置制品'
      );
      expect(transition, label).toContain('未经用户批准不要创建未请求的前置制品');
      expect(transition, label).toMatch(
        /有意跳过/
      );
      expect(transition, label).toContain('记住它且不要重新考虑');
      expect(transition, label).toContain('依赖项是使能因素而非关卡');
      expect(transition, label).toContain(
        '尽管被阻塞也运行 `openspec-cn instructions "<artifact-id>" --change "<name>" --json`（仅对注册的独立存储追加确认的 `--store "<id>"`）'
      );
      expect(transition, label).toContain(
        '仅当这些记录的条件性跳过是其唯一缺失的依赖项时'
      );
      expect(transition, label).toContain('无法条件性跳过');
      expect(requestedInstructions, label).toBeGreaterThanOrEqual(0);
      expect(evaluateRequestedCondition, label).toBeGreaterThan(requestedInstructions);
      expect(inspectPrerequisite, label).toBeGreaterThan(evaluateRequestedCondition);
      expect(evaluateCondition, label).toBeGreaterThan(inspectPrerequisite);
      expect(recordSkip, label).toBeGreaterThan(evaluateCondition);
      expect(requireExpansion, label).toBeGreaterThan(recordSkip);
      expect(approvalGuard, label).toBeGreaterThan(requireExpansion);
    }
  });
});

// Regression for #869: explore refused to implement and told the agent to
// "create a change proposal" without ever naming the workflow that does it.
// With no named exit, agents answered the discovery questions and then went
// straight to writing code - the failure two reporters hit through Copilot.
describe('explore handoff to the propose workflow (#869)', () => {
  it('names the propose workflow when the user asks for implementation', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain(
        '指引他们使用 `/opsx:propose`，它会把讨论转变成一个变更'
      );
      expect(body, label).toContain('工作从那个变更出发，绝不从探索模式出发');
      expect(body, label).not.toContain(
        'remind them to exit explore mode first and create a change proposal'
      );
    }
  });

  it('names the propose workflow where discovery ends', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain(
        '**流入提案**："准备开始了吗？运行 `/opsx:propose`，它就会变成一个变更。"'
      );
      expect(body, label).not.toContain('I can create a change proposal');
    }
  });

  it('pairs the do-not-implement guardrail with the handoff', () => {
    for (const [label, body] of bodies) {
      expect(body, label).toContain(
        '当用户准备开始构建时，指明交接目标而非亲自开始：`/opsx:propose` 会把讨论转变成一个变更，工作在那个变更里进行'
      );
    }
  });

  it('offers the handoff as a next step in the closing summary', () => {
    expect(skill.instructions).toContain('- 把它变成一个变更：`/opsx:propose`');
    expect(skill.instructions).not.toContain('- Create a change proposal');
  });

  // The reference has to be the canonical `/opsx:<id>` form of a known
  // command id, or the per-tool transformers leave it as written and the
  // skill advertises an invocation no tool registers (#727, #1307).
  it('writes the reference so per-tool rendering rewrites it', () => {
    for (const [label, body] of bodies) {
      const rendered = transformToSkillReferences(body);
      expect(rendered, label).toContain('/openspec-propose');
      expect(rendered, label).not.toContain('/opsx:propose');
    }
  });
});

// The handoff is only useful if every tool renders it as an invocation that
// tool actually registers. These assertions walk the real registries rather
// than a hand-picked few, so a new adapter or a changed invocation shape
// cannot quietly leave explore advertising a command nobody answers to
// (the #727 / #1307 failure mode).
describe('explore handoff renders for every delivery surface (#869)', () => {
  // Both workflows explore hands off to. Each is a `CORE_WORKFLOWS` member,
  // so naming them does not advertise anything the default profile omits.
  const HANDOFF_IDS = ['propose', 'apply'] as const;

  function canonicalCount(body: string, commandId: string): number {
    return occurrenceCount(body, `/opsx:${commandId}`);
  }

  it('names both handoff workflows in both bodies before any rendering', () => {
    for (const [label, body] of bodies) {
      for (const commandId of HANDOFF_IDS) {
        expect(canonicalCount(body, commandId), `${label} ${commandId}`).toBeGreaterThan(0);
      }
    }
  });

  it('rewrites every reference for each registered command adapter', () => {
    const adapters = CommandAdapterRegistry.getAll();
    expect(adapters.length).toBeGreaterThan(0);

    for (const adapter of adapters) {
      const invocation = getInvocationForAdapter(adapter);

      for (const [label, body] of bodies) {
        const rendered = transformCommandInvocations(body, invocation);

        for (const commandId of HANDOFF_IDS) {
          const expected = formatCommandInvocation(invocation, commandId);
          const where = `${adapter.toolId} ${label} ${commandId}`;

          // Every canonical reference became this tool's spelling. Counting
          // rather than substring-matching catches a partial rewrite, and it
          // holds for the namespaced tools whose spelling is the canonical one.
          expect(occurrenceCount(rendered, expected), where).toBe(
            canonicalCount(body, commandId)
          );
        }
      }
    }
  });

  it('rewrites every reference for each skills-only tool', () => {
    for (const tool of AI_TOOLS) {
      const transform = getSkillReferenceTransformer(tool.value);

      for (const [label, body] of bodies) {
        const rendered = transform(body);

        expect(rendered, `${tool.value} ${label}`).not.toContain('/opsx:');
        expect(occurrenceCount(rendered, 'openspec-propose'), `${tool.value} ${label}`).toBe(
          canonicalCount(body, 'propose')
        );
        expect(
          occurrenceCount(rendered, 'openspec-apply-change'),
          `${tool.value} ${label}`
        ).toBe(canonicalCount(body, 'apply'));
      }
    }
  });

  it('keeps the handoff readable on the shared .agents tree Codex writes', () => {
    for (const [label, body] of bodies) {
      const rendered = transformToCodexCompatibleSkillReferences(body);

      expect(rendered, label).not.toContain('/opsx:');
      expect(
        occurrenceCount(rendered, '$openspec-propose (Codex) or /openspec-propose (other agents)'),
        label
      ).toBe(canonicalCount(body, 'propose'));
      expect(
        occurrenceCount(
          rendered,
          '$openspec-apply-change (Codex) or /openspec-apply-change (other agents)'
        ),
        label
      ).toBe(canonicalCount(body, 'apply'));
    }
  });
});

// Regression for #869: the seamless capture path let explore scaffold a
// change and write artifacts, then said nothing about what came next. An
// agent holding a fresh proposal inside explore mode has an obvious wrong
// next move, which is the one the issue reported.
describe('explore capture path names where the work continues (#869)', () => {
  it('ends the capture by naming propose and apply', () => {
    for (const [label, body] of bodies) {
      const transition = newChangeTransition(body, label);

      expect(transition, label).toContain(
        '请求的捕获完成后就停在那里，并指明工作在哪里继续'
      );
      expect(transition, label).toContain('`/opsx:propose` 会撰写其余规划制品');
      expect(transition, label).toContain('任务就绪后由 `/opsx:apply` 实现该变更');
    }
  });

  it('says that capturing artifacts is not permission to implement them', () => {
    for (const [label, body] of bodies) {
      const transition = newChangeTransition(body, label);
      expect(transition, label).toContain(
        '捕获制品绝不等于开始实现它们'
      );
    }
  });
});

// A custom profile can install explore without propose or apply. Explore must
// then not name a handoff to a workflow that was never generated; the agent
// would be sent to a command nobody answers to. Checked through the same
// registries init and update call, on both delivery surfaces.
describe('explore handoffs follow the installed workflow set (#869)', () => {
  const PROFILES: Array<[string, string[], Array<'propose' | 'apply'>]> = [
    ['explore only', ['explore'], ['propose', 'apply']],
    ['explore + propose without apply', ['explore', 'propose'], ['apply']],
  ];

  function exploreSkillBody(workflows: string[]): string {
    const entry = getSkillTemplates(workflows).find(e => e.workflowId === 'explore');
    expect(entry).toBeDefined();
    return entry!.template.instructions;
  }

  function exploreCommandBody(workflows: string[]): string {
    const entry = getCommandContents(workflows).find(e => e.id === 'explore');
    expect(entry).toBeDefined();
    return entry!.body;
  }

  it.each(PROFILES)('%s: generated skills never name a missing workflow', (_name, workflows, missing) => {
    const body = exploreSkillBody(workflows);
    for (const tool of AI_TOOLS) {
      const content = generateSkillContent(
        getSkillTemplates(workflows).find(e => e.workflowId === 'explore')!.template,
        'TEST',
        getSkillReferenceTransformer(tool.value)
      );
      for (const id of missing) {
        const skillName = id === 'propose' ? 'openspec-propose' : 'openspec-apply-change';
        expect(content, `${tool.value} ${id}`).not.toContain(skillName);
      }
    }
    for (const id of missing) {
      expect(body).not.toContain(`/opsx:${id}`);
      expect(transformToCodexCompatibleSkillReferences(body)).not.toMatch(
        new RegExp(`openspec-${id}`)
      );
    }
    expect(body).not.toContain('[[opsx:');
  });

  it.each(PROFILES)('%s: generated commands never name a missing workflow', (_name, workflows, missing) => {
    const contents = getCommandContents(workflows);
    for (const adapter of CommandAdapterRegistry.getAll()) {
      const invocation = getInvocationForAdapter(adapter);
      const explore = generateCommands(contents, adapter).find(c =>
        c.fileContent.includes('进入探索模式')
      );
      expect(explore, adapter.toolId).toBeDefined();
      for (const id of missing) {
        expect(explore!.fileContent, `${adapter.toolId} ${id}`).not.toContain(
          formatCommandInvocation(invocation, id)
        );
        expect(explore!.fileContent, `${adapter.toolId} ${id}`).not.toContain(`/opsx:${id}`);
      }
      expect(explore!.fileContent, adapter.toolId).not.toContain('[[opsx:');
    }
    expect(exploreCommandBody(workflows)).not.toContain('[[opsx:');
  });

  it.each(PROFILES)('%s: explore still names a way forward', (_name, workflows) => {
    for (const body of [exploreSkillBody(workflows), exploreCommandBody(workflows)]) {
      expect(body).toContain('捕获制品绝不等于开始实现它们');
      expect(body).toContain('工作从那个变更出发，绝不从探索模式出发');
    }
  });

  it('keeps both named handoffs when propose and apply are installed (core profile)', () => {
    const core = getProfileWorkflows('core');
    for (const body of [exploreSkillBody([...core]), exploreCommandBody([...core])]) {
      expect(body).toContain('指引他们使用 `/opsx:propose`');
      expect(body).toContain('任务就绪后由 `/opsx:apply` 实现该变更');
    }
  });
});
