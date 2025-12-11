import { SlashCommandConfigurator } from './base.js';
import { SlashCommandId } from '../../templates/index.js';

/**
 * File paths for Qoder slash commands
 * Maps each OpenSpec workflow stage to its command file location
 * Commands are stored in .qoder/commands/openspec/ directory
 */
const FILE_PATHS: Record<SlashCommandId, string> = {
  // Create and validate new change proposals
  proposal: '.qoder/commands/openspec/proposal.md',
  
  // Implement approved changes with task tracking
  apply: '.qoder/commands/openspec/apply.md',
  
  // Archive completed changes and update specs
  archive: '.qoder/commands/openspec/archive.md'
};

/**
 * YAML frontmatter for Qoder slash commands
 * Defines metadata displayed in Qoder's command palette
 * Each command is categorized and tagged for easy discovery
 */
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

/**
 * Qoder Slash Command Configurator
 * 
 * Manages OpenSpec slash commands for Qoder AI assistant.
 * Creates three workflow commands: proposal, apply, and archive.
 * Uses colon-separated command format (/openspec:proposal).
 * 
 * @extends {SlashCommandConfigurator}
 */
export class QoderSlashCommandConfigurator extends SlashCommandConfigurator {
  /** Unique identifier for Qoder tool */
  readonly toolId = 'qoder';
  
  /** Indicates slash commands are available for this tool */
  readonly isAvailable = true;

  /**
   * Get relative file path for a slash command
   * 
   * @param {SlashCommandId} id - Command identifier (proposal, apply, or archive)
   * @returns {string} Relative path from project root to command file
   */
  protected getRelativePath(id: SlashCommandId): string {
    return FILE_PATHS[id];
  }

  /**
   * Get YAML frontmatter for a slash command
   * 
   * Frontmatter defines how the command appears in Qoder's UI,
   * including display name, description, and categorization.
   * 
   * @param {SlashCommandId} id - Command identifier (proposal, apply, or archive)
   * @returns {string} YAML frontmatter block with command metadata
   */
  protected getFrontmatter(id: SlashCommandId): string {
    return FRONTMATTER[id];
  }
}