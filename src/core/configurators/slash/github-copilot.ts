import { SlashCommandConfigurator } from './base.js';
import { SlashCommandId } from '../../templates/index.js';

const FILE_PATHS: Record<SlashCommandId, string> = {
  proposal: '.github/prompts/openspec-proposal.prompt.md',
  apply: '.github/prompts/openspec-apply.prompt.md',
  archive: '.github/prompts/openspec-archive.prompt.md'
};

const FRONTMATTER: Record<SlashCommandId, string> = {
  proposal: `---
description: 搭建新的OpenSpec变更提案并进行严格验证。
---

$ARGUMENTS`,
  apply: `---
description: 实施已批准的OpenSpec变更并保持任务同步。
---

$ARGUMENTS`,
  archive: `---
description: 归档已部署的OpenSpec变更并更新规范。
---

$ARGUMENTS`
};

export class GitHubCopilotSlashCommandConfigurator extends SlashCommandConfigurator {
  readonly toolId = 'github-copilot';
  readonly isAvailable = true;

  protected getRelativePath(id: SlashCommandId): string {
    return FILE_PATHS[id];
  }

  protected getFrontmatter(id: SlashCommandId): string {
    return FRONTMATTER[id];
  }
}
