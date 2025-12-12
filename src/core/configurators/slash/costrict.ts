import { SlashCommandConfigurator } from './base.js';
import { SlashCommandId } from '../../templates/index.js';

const FILE_PATHS = {
  proposal: '.cospec/openspec/commands/openspec-proposal.md',
  apply: '.cospec/openspec/commands/openspec-apply.md',
  archive: '.cospec/openspec/commands/openspec-archive.md',
} as const satisfies Record<SlashCommandId, string>;

const FRONTMATTER = {
  proposal: `---
description: "搭建新的OpenSpec变更提案并进行严格验证。"
argument-hint: 请求或功能描述
---`,
  apply: `---
description: "实施已批准的OpenSpec变更并保持任务同步。"
argument-hint: 变更ID
---`,
  archive: `---
description: "归档已部署的OpenSpec变更并更新规范。"
argument-hint: 变更ID
---`
} as const satisfies Record<SlashCommandId, string>;

export class CostrictSlashCommandConfigurator extends SlashCommandConfigurator {
  readonly toolId = 'costrict';
  readonly isAvailable = true;

  protected getRelativePath(id: SlashCommandId): string {
    return FILE_PATHS[id];
  }

  protected getFrontmatter(id: SlashCommandId): string | undefined {
    return FRONTMATTER[id];
  }
}