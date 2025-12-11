export const agentsRootStubTemplate = `# OpenSpec 使用说明

这些说明适用于在此项目中工作的AI助手。

当请求满足以下条件时，始终打开\`@/openspec/AGENTS.md\`：
- 提及规划或提案（如提案、规范、变更、计划等词语）
- 引入新功能、重大变更、架构变更或大型性能/安全工作时
- 听起来不明确，需要在编码前了解权威规范时

使用\`@/openspec/AGENTS.md\`了解：
- 如何创建和应用变更提案
- 规范格式和约定
- 项目结构和指南

保持此托管块，以便'openspec update'可以刷新说明。
`;