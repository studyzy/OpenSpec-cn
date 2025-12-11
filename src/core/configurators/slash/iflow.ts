import { SlashCommandConfigurator } from './base.js';
import { SlashCommandId } from '../../templates/index.js';

const FILE_PATHS: Record<SlashCommandId, string> = {
  proposal: '.iflow/commands/openspec-proposal.md',
  apply: '.iflow/commands/openspec-apply.md',
  archive: '.iflow/commands/openspec-archive.md'
};

const FRONTMATTER: Record<SlashCommandId, string> = {
  proposal: `---
name: /openspec-proposal
id: openspec-proposal
category: OpenSpec
description: 搭建新的OpenSpec变更提案并进行严格验证。
---`,
  apply: `---
name: /openspec-apply
id: openspec-apply
category: OpenSpec
description: 实施已批准的OpenSpec变更并保持任务同步。
---`,
  archive: `---
name: /openspec-archive
id: openspec-archive
category: OpenSpec
description: 归档已部署的OpenSpec变更并更新规范。
---`
};

export class IflowSlashCommandConfigurator extends SlashCommandConfigurator {
  readonly toolId = 'iflow';
  readonly isAvailable = true;

  protected getRelativePath(id: SlashCommandId): string {
    return FILE_PATHS[id];
  }

  protected getFrontmatter(id: SlashCommandId): string {
    return FRONTMATTER[id];
  }
}
