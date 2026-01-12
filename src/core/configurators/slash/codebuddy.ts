import { SlashCommandConfigurator } from './base.js';
import { SlashCommandId } from '../../templates/index.js';

const FILE_PATHS: Record<SlashCommandId, string> = {
  proposal: '.codebuddy/commands/openspec/proposal.md',
  apply: '.codebuddy/commands/openspec/apply.md',
  archive: '.codebuddy/commands/openspec/archive.md'
};

const FRONTMATTER: Record<SlashCommandId, string> = {
  proposal: `---
name: OpenSpec: 提案
description: 搭建新的OpenSpec变更提案并进行严格验证。
argument-hint: "[feature description or request]"
---`,
  apply: `---
name: OpenSpec: 实施
description: 实施已批准的OpenSpec变更并保持任务同步。
argument-hint: "[change-id]"
---`,
  archive: `---
name: OpenSpec: 归档
description: 归档已部署的OpenSpec变更并更新规范。
argument-hint: "[change-id]"
---`
};

export class CodeBuddySlashCommandConfigurator extends SlashCommandConfigurator {
  readonly toolId = 'codebuddy';
  readonly isAvailable = true;

  protected getRelativePath(id: SlashCommandId): string {
    return FILE_PATHS[id];
  }

  protected getFrontmatter(id: SlashCommandId): string {
    return FRONTMATTER[id];
  }
}

