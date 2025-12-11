import { SlashCommandConfigurator } from './base.js';
import { SlashCommandId } from '../../templates/index.js';

const FILE_PATHS: Record<SlashCommandId, string> = {
  proposal: '.amazonq/prompts/openspec-proposal.md',
  apply: '.amazonq/prompts/openspec-apply.md',
  archive: '.amazonq/prompts/openspec-archive.md'
};

const FRONTMATTER: Record<SlashCommandId, string> = {
  proposal: `---
description: 搭建新的OpenSpec变更提案并进行严格验证。
---

The user has requested the following change proposal. Use the openspec instructions to create their change proposal.

<UserRequest>
  $ARGUMENTS
</UserRequest>`,
  apply: `---
description: 实施已批准的OpenSpec变更并保持任务同步。
---

The user wants to apply the following change. Use the openspec instructions to implement the approved change.

<ChangeId>
  $ARGUMENTS
</ChangeId>`,
  archive: `---
description: 归档已部署的OpenSpec变更并更新规范。
---

The user wants to archive the following deployed change. Use the openspec instructions to archive the change and update specs.

<ChangeId>
  $ARGUMENTS
</ChangeId>`
};

export class AmazonQSlashCommandConfigurator extends SlashCommandConfigurator {
  readonly toolId = 'amazon-q';
  readonly isAvailable = true;

  protected getRelativePath(id: SlashCommandId): string {
    return FILE_PATHS[id];
  }

  protected getFrontmatter(id: SlashCommandId): string {
    return FRONTMATTER[id];
  }
}