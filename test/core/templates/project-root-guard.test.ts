import { describe, expect, it } from 'vitest';

import { PROJECT_ROOT_GUARD } from '../../../src/core/templates/workflows/project-root.js';
import { STORE_SELECTION_GUIDANCE } from '../../../src/core/templates/workflows/store-selection.js';
import { getFeedbackSkillTemplate } from '../../../src/core/templates/skill-templates.js';
import {
  generateSkillContent,
  getCommandContents,
  getSkillTemplates,
} from '../../../src/core/shared/skill-generation.js';

/**
 * Regression coverage for #1645.
 *
 * Skills and commands are installed once per machine and offered in every
 * repository, including ones that never ran `openspec init`. Nothing in the
 * CLI stops the workflow there - `openspec new change` falls back to an
 * implicit root and creates `openspec/` wherever the agent is standing - so
 * the guard has to live in the instructions themselves, in every workflow.
 */
describe('project root guard', () => {
  /** One bullet of the no-root branch table, from its anchor to the next. */
  function branch(anchor: string): string {
    const start = PROJECT_ROOT_GUARD.indexOf(anchor);
    expect(start, `${anchor} is missing`).toBeGreaterThanOrEqual(0);
    const next = PROJECT_ROOT_GUARD.indexOf('\n- ', start);
    return PROJECT_ROOT_GUARD.slice(start, next === -1 ? undefined : next);
  }

  // Both surfaces, rendered exactly as they ship.
  function renderedBodies(): Array<[string, string]> {
    return [
      ...getSkillTemplates().map(
        ({ template, dirName }): [string, string] => [
          `skill ${dirName}`,
          generateSkillContent(template, 'PARITY-BASELINE'),
        ]
      ),
      ...getCommandContents().map(
        (entry): [string, string] => [`command ${entry.id}`, entry.body]
      ),
    ];
  }

  it('warns about an uninitialized project in every deployed skill', () => {
    for (const { template, dirName } of getSkillTemplates()) {
      const content = generateSkillContent(template, 'PARITY-BASELINE');
      expect(content, dirName).toContain(PROJECT_ROOT_GUARD);
    }
  });

  it('warns about an uninitialized project in every deployed opsx command', () => {
    for (const entry of getCommandContents()) {
      expect(entry.body, entry.id).toContain(PROJECT_ROOT_GUARD);
    }
  });

  // Feedback files a GitHub issue through `openspec feedback`; it never reads
  // or writes a root, so it ships outside both registries and carries neither
  // the store teaching nor this guard.
  it('leaves the rootless feedback skill alone', () => {
    expect(getFeedbackSkillTemplate().instructions).not.toContain('**Project check:**');
  });

  // The CLI contract behind this check - `list` reporting `root: null` instead
  // of fabricating an implicit root - is pinned in
  // test/commands/store-root-selection.test.ts.
  it('names the machine-readable signal rather than a guess', () => {
    expect(PROJECT_ROOT_GUARD).toContain('openspec-cn list --json');
    // A selected store is a root, so the check has to carry the flag or it
    // answers a question about the wrong directory.
    expect(PROJECT_ROOT_GUARD).toContain('当选择了 store 时加上 `--store <id>`');
    expect(PROJECT_ROOT_GUARD).toContain('`"root": null`');
    // An agent that reads the non-zero exit as a broken CLI is one step from
    // hand-creating `openspec/` instead, which is the failure being guarded.
    expect(PROJECT_ROOT_GUARD).toContain('这是它给出的答案而不是 CLI 坏了');
  });

  // A store-only project whose `store:` line names a store this machine has not
  // registered (a teammate's fresh clone) also reports `root: null`, with
  // `unknown_store` or `no_registered_stores`. A stale global `defaultStore`
  // reports the same codes in unrelated repositories, so only the message
  // suffix pinned in test/core/root-selection.test.ts tells them apart. Treating
  // that project as uninitialized would silently drop OpenSpec, or offer
  // `openspec init`, in a project that is already set up.
  it('does not mistake an unregistered declared store for an uninitialized project', () => {
    expect(PROJECT_ROOT_GUARD).toContain('以 `中声明` 或 `中的 store 声明无效` 结尾');
    expect(PROJECT_ROOT_GUARD).toContain('不要把它当作未初始化而跳过下面的分支');
    expect(PROJECT_ROOT_GUARD).toContain('把该错误的 `message` 和 `fix` 展示给用户');
    expect(PROJECT_ROOT_GUARD.indexOf('以 `中声明` 或 `中的 store 声明无效` 结尾')).toBeLessThan(
      PROJECT_ROOT_GUARD.indexOf('**自动选用**')
    );
  });

  // #1645 asks for the workflow to get out of the way, not to interrogate the
  // user: "if not exist it can go through the normal general propose not the
  // openspec". So the two ways of arriving here get opposite answers, and both
  // have to be pinned or the guard drifts back to one of them.
  it('gets out of the way when it selected itself', () => {
    const autoSelected = branch('**自动选用**');

    expect(autoSelected).toContain('用户没有提到 OpenSpec');
    expect(autoSelected).toContain('按平常方式回答请求');
    // The reported bug is being asked to choose a setup path for a project the
    // user never said was an OpenSpec project.
    expect(autoSelected).toContain('不要要求他们做任何配置');
    expect(autoSelected).not.toContain('openspec-cn init');
    expect(autoSelected).not.toContain('--store <id>');
  });

  it('asks when the user named OpenSpec, this skill, or its command', () => {
    const explicit = branch('**明确要求 OpenSpec**');

    expect(explicit).toContain('用户提到了 OpenSpec、点名了这个 skill，或运行了它的斜杠命令');
    expect(explicit).toContain('在写入前停下并询问如何继续');
    expect(explicit).toContain('`openspec-cn init`');
    expect(explicit).toContain('`--store <id>`');
    expect(explicit).toContain('本次请求不使用 OpenSpec 继续');
    expect(explicit).toContain('等待他们的答复');
  });

  // A slash command is an explicit invocation, so the ask branch is the one
  // that applies there. The guard ships whole into command files, which is what
  // keeps that branch reachable from a command surface.
  it('carries the explicit branch into every deployed opsx command', () => {
    for (const [label, body] of renderedBodies()) {
      if (!label.startsWith('command ')) continue;
      expect(body, label).toContain('**明确要求 OpenSpec**');
      expect(body, label).toContain('在写入前停下并询问如何继续');
    }
  });

  it('never lets any branch create the root as a side effect', () => {
    expect(PROJECT_ROOT_GUARD).toContain('无论走哪个分支，都绝不能把创建根目录当作副作用');
    expect(PROJECT_ROOT_GUARD).toContain('在用户要求之前不要运行 `openspec-cn init`');
    expect(PROJECT_ROOT_GUARD).toContain('不要手工创建 `openspec/` 文件');
    expect(PROJECT_ROOT_GUARD).toContain('也不要让任何命令创建它');
  });

  // A guard printed after the workflow has already scaffolded a change is no
  // guard at all, so nothing that runs a command or writes an artifact may
  // appear before it. Asserting on the text *preceding* the guard catches a
  // stray write wherever it sits - inside a fence or in bare prose - which
  // looking only at the first fenced block would miss.
  it('precedes every command block and write instruction it guards', () => {
    const writeMarkers = [
      '```', // any command block, whatever the language tag
      'openspec new change',
      'openspec archive',
      'openspec sync',
      'openspec instructions',
      'openspec validate',
    ];

    for (const [label, body] of renderedBodies()) {
      const guardStart = body.indexOf(PROJECT_ROOT_GUARD);
      expect(guardStart, label).toBeGreaterThanOrEqual(0);

      // A skill's YAML frontmatter is metadata a host reads to pick the skill,
      // not instructions the agent runs, so a description may quote a command
      // name without running it. Only the body after the frontmatter is guarded.
      const frontmatter = /^---\n[\s\S]*?\n---\n/.exec(body)?.[0] ?? '';
      const beforeGuard = body.slice(frontmatter.length, guardStart);
      for (const marker of writeMarkers) {
        expect(beforeGuard, `${label} runs "${marker}" before the project check`).not.toContain(
          marker
        );
      }
    }
  });

  // The guard is worthless if it sits at the end of a long workflow, so pin
  // where it lives: directly under the store-selection guidance, in the
  // header every workflow reads before it starts.
  it('sits directly under the store-selection guidance', () => {
    for (const [label, body] of renderedBodies()) {
      const storeStart = body.indexOf(STORE_SELECTION_GUIDANCE);
      expect(storeStart, label).toBeGreaterThanOrEqual(0);
      expect(body.indexOf(PROJECT_ROOT_GUARD), label).toBe(
        storeStart + STORE_SELECTION_GUIDANCE.length + '\n\n'.length
      );
    }
  });

  // The other half of #1645: a host picks skills by description, so a
  // description that never says "OpenSpec" reads as a generic offer to
  // explore or propose and wins in repositories that have no OpenSpec at all.
  it('scopes every deployed skill description to OpenSpec', () => {
    for (const { template, dirName } of getSkillTemplates()) {
      expect(template.description, dirName).toMatch(/OpenSpec|openspec/);
    }
  });
});
