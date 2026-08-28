import { describe, expect, it } from 'vitest';

import {
  getExploreSkillTemplate,
  getOpsxExploreCommandTemplate,
} from '../../../src/core/templates/skill-templates.js';

const skill = getExploreSkillTemplate();
const command = getOpsxExploreCommandTemplate();

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
        '包括 `openspec new change` 或其他会写入文件的命令'
      );
      expect(body, label).toContain(
        '在已确认的范围内创建或更新 OpenSpec 变更制品没问题，写入其他任何内容则不行'
      );
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
