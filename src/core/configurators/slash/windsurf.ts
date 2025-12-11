import { SlashCommandConfigurator } from './base.js';
import { SlashCommandId } from '../../templates/index.js';

const FILE_PATHS: Record<SlashCommandId, string> = {
  proposal: '.windsurf/workflows/openspec-proposal.md',
  apply: '.windsurf/workflows/openspec-apply.md',
  archive: '.windsurf/workflows/openspec-archive.md'
};

export class WindsurfSlashCommandConfigurator extends SlashCommandConfigurator {
  readonly toolId = 'windsurf';
  readonly isAvailable = true;

  protected getRelativePath(id: SlashCommandId): string {
    return FILE_PATHS[id];
  }

  protected getFrontmatter(id: SlashCommandId): string | undefined {
    const descriptions: Record<SlashCommandId, string> = {
      proposal: '搭建新的OpenSpec变更提案并进行严格验证。',
      apply: '实施已批准的OpenSpec变更并保持任务同步。',
      archive: '归档已部署的OpenSpec变更并更新规范。'
    };
    const description = descriptions[id];
    return `---\ndescription: ${description}\nauto_execution_mode: 3\n---`;
  }
}
