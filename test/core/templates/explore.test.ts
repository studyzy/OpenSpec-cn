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
      expect(transition, label).toMatch(/Capture the artifact/i);
      expect(transition, label).toContain(
        'without asking them to invoke another workflow command'
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

  it('stops after scaffolding when the user requests only a new change (#668)', () => {
    for (const [label, body] of bodies) {
      const transition = newChangeTransition(body, label);
      expect(transition, label).toContain(
        'If they asked only to start a change, stop after scaffolding and show its status'
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
