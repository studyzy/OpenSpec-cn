import { SlashCommandConfigurator } from './base.js';
import { SlashCommandId } from '../../templates/index.js';

const FILE_PATHS: Record<SlashCommandId, string> = {
  proposal: '.augment/commands/openspec-proposal.md',
  apply: '.augment/commands/openspec-apply.md',
  archive: '.augment/commands/openspec-archive.md'
};

const FRONTMATTER: Record<SlashCommandId, string> = {
  proposal: `---
description: 搭建新的OpenSpec变更提案并进行严格验证。
argument-hint: 请求或功能描述
---`,
  apply: `---
description: 实施已批准的OpenSpec变更并保持任务同步。
argument-hint: 变更ID
---`,
  archive: `---
description: 归档已部署的OpenSpec变更并更新规范。
argument-hint: 变更ID
---`
};

export class AuggieSlashCommandConfigurator extends SlashCommandConfigurator {
  readonly toolId = 'auggie';
  readonly isAvailable = true;

  protected getRelativePath(id: SlashCommandId): string {
    return FILE_PATHS[id];
  }

  protected getFrontmatter(id: SlashCommandId): string {
    return FRONTMATTER[id];
  }
}

