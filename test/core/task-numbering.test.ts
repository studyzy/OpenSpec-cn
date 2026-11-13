import { describe, expect, it } from 'vitest';
import { findTaskNumberingIssues } from '../../src/core/validation/task-numbering.js';

const findInSingleFile = (content: string) =>
  findTaskNumberingIssues([{ path: 'tasks.md', content }]).map(({ path: _path, ...issue }) => issue);

describe('findTaskNumberingIssues', () => {
  it('matches duplicate ids at full depth', () => {
    const issues = findInSingleFile(
      [
        '## 3. Work',
        '- [ ] 3.2.1 first child',
        '- [ ] 3.2.2 second child',
        '- [ ] 3.2.1 duplicate child',
        '',
      ].join('\n')
    );

    expect(issues).toEqual([
      {
        line: 4,
        message: '任务 ID "3.2.1" 重复；它首次声明于 第 2 行。',
      },
    ]);
  });

  it('checks lines written with an unrecognised marker too (#1761)', () => {
    // The numbering check shares the task parser, so a marker it used to drop
    // also escaped duplicate-ID and wrong-group detection.
    const issues = findInSingleFile(
      ['## 3. Work', '- [x] 3.1 first', '- [~] 3.1 deferred duplicate', '- [] 4.1 wrong group', ''].join(
        '\n'
      )
    );

    expect(issues).toEqual([
      {
        line: 3,
        message: '任务 ID "3.1" 重复；它首次声明于 第 2 行。',
      },
      {
        line: 4,
        message:
          '任务 "4.1" 位于分组 3 下，但其开头编号指向分组 4。请将其移入分组 4 或重新编号。',
      },
    ]);
  });

  it('accepts alphabetic suffixes and numbering gaps', () => {
    const issues = findInSingleFile(
      ['## 4. Work', '- [ ] 4.2a inserted', '- [ ] 4.2b another', '- [ ] 4.7 gap'].join(
        '\r\n'
      )
    );

    expect(issues).toEqual([]);
  });

  it('resets group context at an unnumbered level-two heading', () => {
    const issues = findInSingleFile(
      [
        '## 1. Work',
        '- [ ] 1.1 task',
        '## Notes',
        '- [ ] 9.1 external note',
        '- [ ] 9.1 repeated external note',
      ].join('\n')
    );

    expect(issues).toEqual([]);
  });

  it('skips every check in files without numbered groups', () => {
    const issues = findInSingleFile(
      [
        '# Tasks',
        '- [ ] plain task',
        '- [ ] 7.1 numbered but ungrouped',
        '- [ ] 7.1 duplicate but still ungrouped',
      ].join('\n')
    );

    expect(issues).toEqual([]);
  });

  it('compares group prefixes as integers', () => {
    const issues = findInSingleFile('## 01. Work\n- [ ] 1.1 task\n');

    expect(issues).toEqual([]);
  });

  it('detects duplicate ids across task files', () => {
    const issues = findTaskNumberingIssues([
      {
        path: 'backend/tasks.md',
        content: '## 2. Backend\n- [ ] 2.1 shared task\n',
      },
      {
        path: 'frontend/tasks.md',
        content: '## 2. Frontend\n- [ ] 2.1 duplicate task\n',
      },
    ]);

    expect(issues).toEqual([
      {
        path: 'frontend/tasks.md',
        line: 2,
        message:
          '任务 ID "2.1" 重复；它首次声明于 backend/tasks.md 第 2 行。',
      },
    ]);
  });
});
