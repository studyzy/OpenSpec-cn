import { describe, it, expect, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { MarkdownParser } from '../../../src/core/parsers/markdown-parser.js';
import { ChangeParser } from '../../../src/core/parsers/change-parser.js';
import { extractRequirementsSection, parseDeltaSpec } from '../../../src/core/parsers/requirement-blocks.js';
import { RequirementSchema } from '../../../src/core/schemas/index.js';
import { Validator } from '../../../src/core/validation/validator.js';

/**
 * Regression tests for upstream issue studyzy/OpenSpec-cn#31:
 * merging v1.5.0 replaced the bilingual (Chinese + English) parsing/matching
 * logic that v1.4.1 had with English-only literals, so Chinese-titled specs and
 * changes could no longer be parsed, validated, or archived. These tests lock in
 * the restored bilingual behaviour while keeping English behaviour intact.
 */
describe('Chinese bilingual parsing (issue #31 regression)', () => {
  describe('MarkdownParser.parseSpec', () => {
    it('parses a spec written with Chinese section headers (目的 / 需求)', () => {
      const content = `# 用户认证规范

## 目的
本规范定义用户认证的需求。

## 需求

### 需求: 系统必须提供安全的用户认证
系统必须提供安全的用户登录能力。

#### 场景: 成功登录
- **当** 用户提供有效凭证
- **则** 用户通过认证`;

      const spec = new MarkdownParser(content).parseSpec('user-auth');

      expect(spec.overview).toContain('本规范定义用户认证的需求');
      expect(spec.requirements).toHaveLength(1);
      expect(spec.requirements[0].text).toBe('系统必须提供安全的用户登录能力。');
      expect(spec.requirements[0].scenarios).toHaveLength(1);
    });

    it('still parses English section headers', () => {
      const content = `# Spec

## Purpose
Overview here.

## Requirements

### Requirement: Auth
The system SHALL authenticate.

#### Scenario: ok
- **WHEN** valid
- **THEN** allowed`;

      const spec = new MarkdownParser(content).parseSpec('en');
      expect(spec.requirements).toHaveLength(1);
    });
  });

  describe('MarkdownParser.parseChange', () => {
    it('parses Chinese change headers (为什么 / 变更内容) and Chinese delta operations', () => {
      const content = `# 添加用户认证

## 为什么
我们需要实现用户认证来保护应用与用户数据。

## 变更内容
- **user-auth:** 新增用户认证规范
- **api:** 修改以加入认证端点
- **db:** 移除旧的会话表
- **legacy:** 重命名旧需求为新需求`;

      const change = new MarkdownParser(content).parseChange('add-auth');

      expect(change.why).toContain('保护应用');
      expect(change.deltas).toHaveLength(4);
      expect(change.deltas[0].operation).toBe('ADDED');
      expect(change.deltas[1].operation).toBe('MODIFIED');
      expect(change.deltas[2].operation).toBe('REMOVED');
      expect(change.deltas[3].operation).toBe('RENAMED');
    });

    it('does not classify 更新 (update) as ADDED — bare 新 was narrowed to 新增/新建', () => {
      const content = `# 变更

## 为什么
因为我们需要更新现有端点，理由充分且足够长以通过校验。

## 变更内容
- **api:** 更新认证端点
- **svc:** 新建服务模块`;

      const change = new MarkdownParser(content).parseChange('c');
      expect(change.deltas).toHaveLength(2);
      expect(change.deltas[0].operation).toBe('MODIFIED'); // 更新 → not ADDED
      expect(change.deltas[1].operation).toBe('ADDED'); // 新建 → ADDED
    });
  });

  describe('extractRequirementsSection', () => {
    it('parses a Chinese "## 需求" section with "### 需求:" headers', () => {
      const result = extractRequirementsSection(`## 需求\n### 需求: 登录\n系统必须允许登录。\n`);
      expect(result.bodyBlocks).toHaveLength(1);
      expect(result.bodyBlocks[0].name).toBe('登录');
    });

    it('accepts the full-width Chinese colon (：) in requirement headers', () => {
      const result = extractRequirementsSection(`## 需求\n### 需求：登出\n系统必须允许登出。\n`);
      expect(result.bodyBlocks).toHaveLength(1);
      expect(result.bodyBlocks[0].name).toBe('登出');
    });
  });

  describe('parseDeltaSpec', () => {
    it('parses Chinese delta section headers (新增/修改/移除/重命名需求)', () => {
      const content = `## 新增需求

### 需求: 新功能
系统必须提供新功能。

## 移除需求

### 需求: 旧功能

## 重命名需求

- FROM: \`### 需求: 旧名\`
- TO: \`### 需求: 新名\``;

      const plan = parseDeltaSpec(content);
      expect(plan.added.map((b) => b.name)).toEqual(['新功能']);
      expect(plan.removed).toEqual(['旧功能']);
      expect(plan.renamed).toEqual([{ from: '旧名', to: '新名' }]);
      expect(plan.sectionPresence.added).toBe(true);
      expect(plan.sectionPresence.removed).toBe(true);
      expect(plan.sectionPresence.renamed).toBe(true);
    });

    it('still parses English delta section headers', () => {
      const content = `## ADDED Requirements\n### Requirement: Foo\nThe system SHALL foo.\n`;
      const plan = parseDeltaSpec(content);
      expect(plan.added.map((b) => b.name)).toEqual(['Foo']);
    });
  });

  describe('ChangeParser.parseChangeWithDeltas', () => {
    const tmpDirs: string[] = [];

    afterEach(async () => {
      for (const dir of tmpDirs.splice(0)) {
        await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
      }
    });

    it('parses Chinese delta spec files (新增需求 / 重命名需求)', async () => {
      const changeDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-cn-change-'));
      tmpDirs.push(changeDir);
      const specsDir = path.join(changeDir, 'specs', 'auth');
      await fs.mkdir(specsDir, { recursive: true });

      const deltaSpec = `# 认证变更

## 新增需求

### 需求: 新功能
系统必须提供新功能。

#### 场景: 使用新功能
- **当** 用户触发新功能
- **则** 系统响应

## 重命名需求

- FROM: \`### 需求: 旧名\`
- TO: \`### 需求: 新名\``;

      await fs.writeFile(path.join(specsDir, 'spec.md'), deltaSpec, 'utf8');

      const changeContent = `# 认证变更\n\n## 为什么\n因为我们需要它，理由充分且足够长。\n\n## 变更内容\n- **auth:** 新增用户认证`;
      const change = await new ChangeParser(changeContent, changeDir).parseChangeWithDeltas('auth-change');

      const added = change.deltas.filter((d) => d.operation === 'ADDED');
      const renamed = change.deltas.filter((d) => d.operation === 'RENAMED');
      expect(added.length).toBeGreaterThan(0);
      expect(renamed).toHaveLength(1);
      expect(renamed[0].rename).toEqual({ from: '旧名', to: '新名' });
    });
  });

  describe('RequirementSchema', () => {
    it('accepts Chinese requirement keywords 必须 / 禁止', () => {
      for (const text of ['系统必须记录日志。', '系统禁止明文存储密码。']) {
        const result = RequirementSchema.safeParse({
          text,
          scenarios: [{ rawText: 'Given / When / Then' }],
        });
        expect(result.success).toBe(true);
      }
    });

    it('still accepts English SHALL / MUST', () => {
      const result = RequirementSchema.safeParse({
        text: 'The system SHALL log events.',
        scenarios: [{ rawText: 'Given / When / Then' }],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Validator (end-to-end, Chinese content)', () => {
    const tmpDirs: string[] = [];

    afterEach(async () => {
      for (const dir of tmpDirs.splice(0)) {
        await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
      }
    });

    it('validates a fully-Chinese spec as valid', async () => {
      const content = `# 用户认证规范

## 目的
本规范定义系统用户认证与登录相关的功能需求，涵盖凭证校验、会话管理以及登录失败处理等方面的行为约束。

## 需求

### 需求: 安全登录
系统必须提供安全的用户登录能力。

#### 场景: 成功登录
- **当** 用户提供有效凭证
- **则** 用户通过认证`;

      const report = await new Validator(true).validateSpecContent('user-auth', content);
      expect(report.valid).toBe(true);
      expect(report.summary.errors).toBe(0);
    });

    it('validates a fully-Chinese delta change spec as valid', async () => {
      const changeDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-cn-i18n-'));
      tmpDirs.push(changeDir);
      const specsDir = path.join(changeDir, 'specs', 'auth');
      await fs.mkdir(specsDir, { recursive: true });

      const deltaSpec = `# 认证变更

## 新增需求

### 需求: 记录日志
系统必须记录所有认证事件。

#### 场景: 事件发生
- **当** 发生一个认证事件
- **则** 记录该事件`;

      await fs.writeFile(path.join(specsDir, 'spec.md'), deltaSpec, 'utf8');

      const report = await new Validator(true).validateChangeDeltaSpecs(changeDir);
      expect(report.valid).toBe(true);
      expect(report.summary.errors).toBe(0);
    });
  });
});
