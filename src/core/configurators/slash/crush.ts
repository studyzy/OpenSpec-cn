import { SlashCommandConfigurator } from './base.js';
import { SlashCommandId } from '../../templates/index.js';

const FILE_PATHS: Record<SlashCommandId, string> = {
  proposal: '.crush/commands/openspec/proposal.md',
  apply: '.crush/commands/openspec/apply.md',
  archive: '.crush/commands/openspec/archive.md'
};

const FRONTMATTER: Record<SlashCommandId, string> = {
  proposal: `---
name: OpenSpec: 提案
description: 搭建新的OpenSpec变更提案并进行严格验证。
category: OpenSpec
tags: [openspec, change]
---`,
  apply: `---
name: OpenSpec: 实施
description: 实施已批准的OpenSpec变更并保持任务同步。
category: OpenSpec
tags: [openspec, apply]
---`,
  archive: `---
name: OpenSpec: 归档
description: 归档已部署的OpenSpec变更并更新规范。
category: OpenSpec
tags: [openspec, archive]
---`
};

export class CrushSlashCommandConfigurator extends SlashCommandConfigurator {
  readonly toolId = 'crush';
  readonly isAvailable = true;

  protected getRelativePath(id: SlashCommandId): string {
    return FILE_PATHS[id];
  }

  protected getFrontmatter(id: SlashCommandId): string {
    return FRONTMATTER[id];
  }
}