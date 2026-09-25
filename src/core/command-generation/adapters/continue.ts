/**
 * Continue Command Adapter
 *
 * Formats commands for Continue following its .prompt specification.
 */

import path from 'path';
import type { CommandContent, ToolCommandAdapter } from '../types.js';
import { escapeYamlValue } from '../yaml.js';

/**
 * Continue adapter for command generation.
 * File path: .continue/prompts/opsx-<id>.prompt
 * Frontmatter: name, description, invokable
 */
export const continueAdapter: ToolCommandAdapter = {
  toolId: 'continue',

  getFilePath(commandId: string): string {
    return path.join('.continue', 'prompts', `opsx-${commandId}.prompt`);
  },

  formatFile(content: CommandContent): string {
    // Continue injects an invoked prompt into the model context. Smaller local
    // models can otherwise mistake the workflow name for a tool to call (#925).
    return `---
name: ${escapeYamlValue(`opsx-${content.id}`)}
description: ${escapeYamlValue(content.description)}
invokable: true
---

此工作流提示已处于激活状态。请直接遵循其指令，不要调用以该工作流命名的工具。

${content.body}
`;
  },
};
