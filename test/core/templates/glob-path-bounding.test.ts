// Every workflow that turns a glob output into a concrete write path must keep
// that path inside `changeRoot` (#2099). update-change always did; propose,
// ff-change and continue-change chose a path with no containment rule, so a
// capability path such as `../../x`, or a symlinked directory under `specs/`,
// would be written outside the change.

import { describe, expect, it } from 'vitest';

import {
  getContinueChangeSkillTemplate,
  getExploreSkillTemplate,
  getFfChangeSkillTemplate,
  getOpsxContinueCommandTemplate,
  getOpsxExploreCommandTemplate,
  getOpsxFfCommandTemplate,
  getOpsxProposeCommandTemplate,
  getOpsxProposeSkillTemplate,
  getOpsxUpdateCommandTemplate,
  getUpdateChangeSkillTemplate,
} from '../../../src/core/templates/skill-templates.js';

/** Lines that tell the agent to pick a concrete path for a glob output. */
const PATH_CHOICE = /选择[^。]*具体路径/u;

/**
 * The containment rule for a write that may land on an existing file. A
 * destination that is itself a symlink to a file outside `changeRoot` passes a
 * parent-only check, so the file is resolved too.
 */
const BOUND =
  '在解析符号链接后仍位于 `changeRoot` 之内 —— 无论是其父目录，还是文件本身（若它已存在）';

/**
 * update-change creates its file with an operation that fails if the target
 * exists - a symlink included - so resolving the parents is enough there.
 */
const CREATE_ONLY_BOUND =
  '解析符号链接的父目录后，验证它仍在 `changeRoot` 内';

const boundFor = (label: string) => (label.startsWith('update-change') ? CREATE_ONLY_BOUND : BOUND);

/** Every surface that writes glob artifacts, skill and slash-command alike. */
const SURFACES: Array<[label: string, body: string]> = [
  ['propose skill', getOpsxProposeSkillTemplate().instructions],
  ['propose command', getOpsxProposeCommandTemplate().content],
  ['ff-change skill', getFfChangeSkillTemplate().instructions],
  ['ff-change command', getOpsxFfCommandTemplate().content],
  ['continue-change skill', getContinueChangeSkillTemplate().instructions],
  ['continue-change command', getOpsxContinueCommandTemplate().content],
  ['update-change skill', getUpdateChangeSkillTemplate().instructions],
  ['update-change command', getOpsxUpdateCommandTemplate().content],
  ['explore skill', getExploreSkillTemplate().instructions],
  ['explore command', getOpsxExploreCommandTemplate().content],
];

/** Where a line tells the agent to write. The bound must come before it. */
const WRITE = /写入/u;

/**
 * The bound has to be checked before the write, or an escaping path is already
 * written by the time it is verified. A line with no write (update-change
 * writes in a later step) only needs the bound.
 */
function expectBoundBeforeWrite(label: string, line: string): void {
  const boundAt = line.indexOf(boundFor(label));
  expect(boundAt, label).toBeGreaterThanOrEqual(0);
  const writeAt = line.search(WRITE);
  if (writeAt !== -1) {
    expect(writeAt, `${label}: writes before checking the bound`).toBeGreaterThan(boundAt);
    expect(line, `${label}: no instruction to refuse an escaping path`).toContain(
      '停止并告知用户'
    );
  }
}

/** Every place a body hands artifact creation to another skill or command. */
const DELEGATION = /(?:将|把)创建委托给/g;

/**
 * A delegated writer is a write too. It may run only after the path it writes
 * to has been chosen and checked, and only if it can write exactly there.
 * Returns each delegation as [offset, the sentence that states it].
 */
function delegations(body: string): Array<[number, string]> {
  return [...body.matchAll(DELEGATION)].map((match) => {
    const start = match.index ?? 0;
    const end = body.slice(start).search(/[。\n]/);
    return [start, body.slice(start, end === -1 ? undefined : start + end)];
  });
}

describe('glob output paths stay inside changeRoot (#2099)', () => {
  it.each(SURFACES)('%s bounds every concrete-path choice', (label, body) => {
    const choices = body.split('\n').filter((line) => PATH_CHOICE.test(line));

    expect(choices, `${label}: no concrete-path line found`).toHaveLength(1);
    expectBoundBeforeWrite(label, choices[0]);
  });

  it.each(SURFACES)('%s chooses and checks the path before any delegated writer runs', (label, body) => {
    const choiceAt = body.search(PATH_CHOICE);
    const found = delegations(body);
    expect(found.length, `${label}: no delegated-creation rule found`).toBeGreaterThan(0);

    for (const [at, sentence] of found) {
      // Bound to one path, and refuses rather than letting it write elsewhere.
      expect(sentence, label).toMatch(/仅当它能/);
      expect(sentence, label).toMatch(/停止/);
      // The creation step's delegation comes after the choice it depends on.
      // The only one allowed earlier is continue-change's backfill, which
      // names the path its own preceding bullet checked.
      if (at < choiceAt) {
        expect(sentence, `${label}: delegates before choosing the path`).toContain(
          '其已检查的路径'
        );
      }
    }
    expect(
      found.some(([at]) => at > choiceAt),
      `${label}: the creation step does not bound its delegated writer`
    ).toBe(true);
  });

  // A delegated writer has already created the artifact; writing the template
  // over it afterwards would replace what it made.
  it.each(SURFACES.filter(([label]) => !label.startsWith('update-change')))(
    '%s writes the template only when creation was not delegated',
    (label, body) => {
      const templateWrite = /写入该输出路径/u;
      const lines = body.split('\n');
      let writes = 0;

      lines.forEach((line, index) => {
        // Judged sentence by sentence: explore states both branches in one
        // paragraph, and the delegation sentence names the same path for the
        // delegated writer.
        for (const sentence of line.split('。')) {
          if (!templateWrite.test(sentence) || sentence.includes('将创建委托给')) continue;
          writes++;
          if (/否则|并非委托/u.test(sentence.slice(0, sentence.search(templateWrite)))) continue;
          // Otherwise nested under a bullet that opens the Otherwise branch.
          const indent = line.search(/\S/u);
          const parent = lines
            .slice(0, index)
            .reverse()
            .find((candidate) => candidate.trim() !== '' && candidate.search(/\S/u) < indent);
          expect(parent, `${label}: template write outside the Otherwise branch`).toMatch(
            /^\s*- 否则/u
          );
        }
      });
      expect(writes, `${label}: no template write found`).toBeGreaterThan(0);
    }
  );

  it.each([
    ['continue-change skill', getContinueChangeSkillTemplate().instructions],
    ['continue-change command', getOpsxContinueCommandTemplate().content],
  ])('%s verifies the output after either creation branch', (label, body) => {
    const lines = body.split('\n');
    const delegation = lines.findIndex((line) => line.includes('将创建委托给特定 skill'));
    const verify = lines.findIndex((line) =>
      line.includes('无论走哪条路径，都要验证产出物文件存在于该输出路径')
    );
    expect(verify, label).toBeGreaterThan(delegation);
    // Same depth as the two branches, so it runs after whichever was taken.
    expect(lines[verify].search(/\S/u), label).toBe(lines[delegation].search(/\S/u));
  });

  it.each(SURFACES)('%s never targets the glob itself', (label, body) => {
    // A glob is a pattern, not a file: nothing may be written to, or verified
    // at, `resolvedOutputPath` unless it is a concrete path.
    expect(body, label).not.toContain('存在于 `resolvedOutputPath`');
    // A prohibition ("不要写入 `resolvedOutputPath`") is fine; an instruction to
    // write there is not.
    expect(body, label).not.toMatch(/(?<!不要)写入 `resolvedOutputPath`/u);
  });

  it.each(SURFACES)('%s restates delegation only with the same bound', (label, body) => {
    // The artifact-creation guidelines repeat the delegation rule where agents
    // skim; a bare "invoke it instead" there would undo the ordering above.
    for (const line of body
      .split('\n')
      .filter((candidate) => candidate.includes('指示你使用特定 skill 或命令'))) {
      expect(line, label).toContain('仅在已选定并检查过输出路径之后');
    }
  });

  // continue-change alone backfills a half-written glob artifact: it compares
  // expected paths against what exists instead of choosing a new one, so the
  // bound has to sit on that bullet too.
  it.each([
    ['continue-change skill', getContinueChangeSkillTemplate().instructions],
    ['continue-change command', getOpsxContinueCommandTemplate().content],
  ])('%s bounds the partly-written-artifact check', (label, body) => {
    const bullets = body
      .split('\n')
      .filter((line) => line.includes('先将每个预期路径对 `changeRoot` 解析'));

    expect(bullets, `${label}: partial-artifact bullet missing`).toHaveLength(1);
    expect(bullets[0], label).toContain(BOUND);
    // The write is the next bullet, so the refusal has to sit there.
    const lines = body.split('\n');
    const next = lines[lines.indexOf(bullets[0]) + 1];
    expect(next, label).toContain('绝不要写入未通过该检查的预期路径');
    expect(next.indexOf('绝不要写入未通过该检查的预期路径'), label).toBeLessThan(
      next.indexOf('只写入缺失的文件')
    );
    // A delegated writer filling the gap is held to the same checked paths.
    expect(next, label).toContain('仅当它能把每个文件写入其已检查的路径时才调用它');
  });
});
