import { SlashCommandConfigurator } from './base.js';
import { SlashCommandId } from '../../templates/index.js';

const NEW_FILE_PATHS: Record<SlashCommandId, string> = {
  proposal: '.roo/commands/openspec-proposal.md',
  apply: '.roo/commands/openspec-apply.md',
  archive: '.roo/commands/openspec-archive.md'
};

export class RooCodeSlashCommandConfigurator extends SlashCommandConfigurator {
  readonly toolId = 'roocode';
  readonly isAvailable = true;

  protected getRelativePath(id: SlashCommandId): string {
    return NEW_FILE_PATHS[id];
  }

  protected getFrontmatter(id: SlashCommandId): string | undefined {
    const descriptions: Record<SlashCommandId, string> = {
      proposal: '搭建新的OpenSpec变更提案并进行严格验证。',
      apply: '实施已批准的OpenSpec变更并保持任务同步。',
      archive: '归档已部署的OpenSpec变更并更新规范。'
    };
    const description = descriptions[id];
    return `# OpenSpec: ${id.charAt(0).toUpperCase() + id.slice(1)}\n\n${description}`;
  }
}
