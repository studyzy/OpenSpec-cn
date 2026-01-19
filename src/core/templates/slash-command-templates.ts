export type SlashCommandId = 'proposal' | 'apply' | 'archive';

const baseGuardrails = `**护栏规则**
- 优先使用简单、最小的实现，仅在请求或明确需要时才添加复杂性。
- 将变更紧密限制在请求的结果范围内。
- 如果需要额外的OpenSpec约定或澄清，请参考\`openspec/AGENTS.md\`（位于\`openspec/\`目录中—如果看不到，请运行\`ls openspec\`或\`openspec-cn update\`）。`;

const proposalGuardrails = `${baseGuardrails}
- 识别任何模糊或不明确的细节，并在编辑文件前询问必要的后续问题。
- 在提案阶段不要编写任何代码。仅创建设计文档（proposal.md、tasks.md、design.md和规范增量）。实施在批准后的apply阶段进行。`;

const proposalSteps = `**步骤**
1. 查看\`openspec/project.md\`，运行\`openspec-cn list\`和\`openspec-cn list --specs\`，并检查相关代码或文档（例如通过\`rg\`/\`ls\`）以使提案基于当前行为；注意任何需要澄清的空白。
2. 选择唯一的动词开头\`change-id\`并在\`openspec/changes/<id>/\`下创建\`proposal.md\`、\`tasks.md\`和\`design.md\`（需要时）。
3. 将变更映射为具体功能或需求，将多范围工作分解为具有明确关系和顺序的独立规范增量。
4. 当解决方案跨越多个系统、引入新模式或在提交规范前需要权衡讨论时，在\`design.md\`中记录架构推理。
5. 在\`openspec/changes/<id>/specs/<capability>/spec.md\`中起草规范增量（每个功能一个文件夹），使用\`## 新增需求|修改需求|移除需求|重命名需求\`，每个需求至少有一个\`#### 场景：\`，并在相关时交叉引用相关功能。
6. 将\`tasks.md\`起草为有序的小型可验证工作项列表，这些项提供用户可见的进展，包括验证（测试、工具），并突出显示依赖关系或可并行工作。
7. 使用\`openspec-cn validate <id> --strict --no-interactive\`验证并在分享提案前解决每个问题。`;

const proposalReferences = `**参考**
- 当验证失败时，使用\`openspec-cn show <id> --json --deltas-only\`或\`openspec-cn show <spec> --type spec\`检查详情。
- 在编写新需求前，使用\`rg -n "需求：|场景：" openspec/specs\`搜索现有需求。
- 使用\`rg <keyword>\`、\`ls\`或直接文件读取探索代码库，以便提案与当前实现现实保持一致。`;

const applySteps = `**步骤**
将这些步骤作为TODO跟踪并逐一完成。
1. 阅读\`openspec/changes/<id>/proposal.md\`、\`design.md\`（如果存在）和\`tasks.md\`以确认范围和验收标准。
2. 按顺序完成任务，保持编辑最小化并专注于请求的变更。
3. 在更新状态前确认完成—确保\`tasks.md\`中的每个项目都已完成。
4. 所有工作完成后更新清单，使每个任务标记为\`- [x]\`并反映实际情况。
5. 需要额外上下文时参考\`openspec-cn list\`或\`openspec-cn show <item>\`。`;

const applyReferences = `**参考**
- 如果在实施过程中需要提案的额外上下文，请使用\`openspec-cn show <id> --json --deltas-only\`。`;

const archiveSteps = `**步骤**
1. 确定要归档的变更ID：
   - 如果此提示已包含特定变更ID（例如在由斜杠命令参数填充的\`<ChangeId>\`块内），在修剪空格后使用该值。
   - 如果对话松散地引用变更（例如通过标题或摘要），运行\`openspec-cn list\`以显示可能的ID，分享相关候选者，并确认用户意图归档哪一个。
   - 否则，查看对话，运行\`openspec-cn list\`，并询问用户要归档哪个变更；在继续前等待确认的变更ID。
   - 如果仍然无法识别单个变更ID，停止并告诉用户您还无法归档任何内容。
2. 通过运行\`openspec-cn list\`（或\`openspec-cn show <id>\`）验证变更ID，如果变更缺失、已归档或尚未准备好归档，则停止。
3. 运行\`openspec-cn archive <id> --yes\`，以便CLI在没有提示的情况下移动变更并应用规范更新（仅对仅工具工作使用\`--skip-specs\`）。
4. 查看命令输出以确认目标规范已更新且变更已放入\`openspec/changes/archive/\`。
5. 使用\`openspec-cn validate --strict\`验证，如果出现异常，使用\`openspec-cn show <id>\`检查。`;

const archiveSteps = `**Steps**
1. Determine the change ID to archive:
   - If this prompt already includes a specific change ID (for example inside a \`<ChangeId>\` block populated by slash-command arguments), use that value after trimming whitespace.
   - If the conversation references a change loosely (for example by title or summary), run \`openspec list\` to surface likely IDs, share the relevant candidates, and confirm which one the user intends.
   - Otherwise, review the conversation, run \`openspec list\`, and ask the user which change to archive; wait for a confirmed change ID before proceeding.
   - If you still cannot identify a single change ID, stop and tell the user you cannot archive anything yet.
2. Validate the change ID by running \`openspec list\` (or \`openspec show <id>\`) and stop if the change is missing, already archived, or otherwise not ready to archive.
3. Run \`openspec archive <id> --yes\` so the CLI moves the change and applies spec updates without prompts (use \`--skip-specs\` only for tooling-only work).
4. Review the command output to confirm the target specs were updated and the change landed in \`changes/archive/\`.
5. Validate with \`openspec validate --strict --no-interactive\` and inspect with \`openspec show <id>\` if anything looks off.`;

const archiveReferences = `**Reference**
- Use \`openspec list\` to confirm change IDs before archiving.
- Inspect refreshed specs with \`openspec list --specs\` and address any validation issues before handing off.`;

export const slashCommandBodies: Record<SlashCommandId, string> = {
  proposal: [proposalGuardrails, proposalSteps, proposalReferences].join('\n\n'),
  apply: [baseGuardrails, applySteps, applyReferences].join('\n\n'),
  archive: [baseGuardrails, archiveSteps, archiveReferences].join('\n\n')
};

export function getSlashCommandBody(id: SlashCommandId): string {
  return slashCommandBodies[id];
}