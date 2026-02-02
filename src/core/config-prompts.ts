import type { ProjectConfig } from './project-config.js';

/**
 * Serialize config to YAML string with helpful comments.
 *
 * @param config - Partial config object (schema required, context/rules optional)
 * @returns YAML string ready to write to file
 */
export function serializeConfig(config: Partial<ProjectConfig>): string {
  const lines: string[] = [];

  // Schema (required)
  lines.push(`schema: ${config.schema}`);
  lines.push('');

  // Context section with comments
  lines.push('# 项目上下文（可选）');
  lines.push('# 在创建工件时向 AI 显示此信息。');
  lines.push('# 添加您的技术栈、约定、风格指南、领域知识等。');
  lines.push('# 示例：');
  lines.push('#   context: |');
  lines.push('#     技术栈：TypeScript, React, Node.js');
  lines.push('#     我们使用约定式提交');
  lines.push('#     领域：电商平台');
  lines.push('');

  // Rules section with comments
  lines.push('# 每个工件的规则（可选）');
  lines.push('# 为特定工件添加自定义规则。');
  lines.push('# 示例：');
  lines.push('#   rules:');
  lines.push('#     proposal:');
  lines.push('#       - 保持提案在500字以内');
  lines.push('#       - 始终包含"非目标"部分');
  lines.push('#     tasks:');
  lines.push('#       - 将任务分解为最多2小时的块');

  return lines.join('\n') + '\n';
}
