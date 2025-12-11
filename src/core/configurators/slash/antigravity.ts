import { SlashCommandConfigurator } from './base.js';
import { SlashCommandId } from '../../templates/index.js';

const FILE_PATHS: Record<SlashCommandId, string> = {
  proposal: '.agent/workflows/openspec-proposal.md',
  apply: '.agent/workflows/openspec-apply.md',
  archive: '.agent/workflows/openspec-archive.md'
};

const DESCRIPTIONS: Record<SlashCommandId, string> = {
  proposal: '搭建新的OpenSpec变更提案并进行严格验证。',
  apply: '实施已批准的OpenSpec变更并保持任务同步。',
  archive: '归档已部署的OpenSpec变更并更新规范。'
};

export class AntigravitySlashCommandConfigurator extends SlashCommandConfigurator {
  readonly toolId = 'antigravity';
  readonly isAvailable = true;

  protected getRelativePath(id: SlashCommandId): string {
    return FILE_PATHS[id];
  }

  protected getFrontmatter(id: SlashCommandId): string | undefined {
    const description = DESCRIPTIONS[id];
    return `---\ndescription: ${description}\n---`;
  }
}
