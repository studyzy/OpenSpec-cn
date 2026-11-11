import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  COMMAND_DEPRECATION_URL,
  formatCommandDeprecationNotice,
} from '../src/core/command-surface.js';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...segments: string[]) =>
  fs.readFileSync(path.join(REPO_ROOT, 'docs-lab', ...segments), 'utf-8');

const PROFILES = read('customize', 'profiles.md');
const DELIVERY_SECTION = PROFILES.split('## 交付方式：skills、commands 或两者')[1].split(
  '## 切换 profiles'
)[0];
const CONFIG_JSON = read('reference', 'configuration', 'config-json.md');
const DELIVERY_FIELD = CONFIG_JSON.split('### delivery')[1].split('### workflows')[0];
const SETUP = read('start', 'setup.md');

// The CLI notice and the docs announce the same deprecation. Pin them to each
// other so neither can change its advice without the other (#2022).
describe('command deprecation documentation', () => {
  const notice = formatCommandDeprecationNotice(['claude'], 'both').join('\n');

  it('names the same release in the notice and every page', () => {
    expect(notice).toContain('将在 OpenSpec 2.0 中移除');
    expect(DELIVERY_SECTION).toContain('将在 OpenSpec 2.0 中移除');
    expect(DELIVERY_FIELD).toContain('将在 OpenSpec 2.0 中移除');
    expect(SETUP).toContain('将在 OpenSpec 2.0 中移除');
  });

  it('gives the same way to switch, and the same promise about edited files', () => {
    expect(notice).toContain('openspec-cn config set delivery skills && openspec-cn update');
    expect(DELIVERY_SECTION).toContain('把 `delivery` 设为 `skills` 并运行 `openspec-cn update`');
    expect(notice).toContain('你编辑过的文件会被保留并列出');
    expect(DELIVERY_SECTION).toContain('你编辑过的会保留并列出');
  });

  it('offers no way to keep commands, since 2.0 removes them under every setting', () => {
    expect(notice).not.toMatch(/delivery (both|commands)/);
    expect(DELIVERY_SECTION).not.toMatch(/把 `delivery` 设为 `(both|commands)`/);
    expect(DELIVERY_FIELD).not.toMatch(/keeps its value/);
  });

  it('links the same tracking issue from the notice and both pages', () => {
    const issue = COMMAND_DEPRECATION_URL;
    expect(notice).toContain(issue);
    expect(DELIVERY_SECTION).toContain(issue);
    expect(DELIVERY_FIELD).toContain(issue);
  });
});
