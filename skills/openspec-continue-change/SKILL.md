---
name: openspec-continue-change
description: 通过创建下一个产出物来继续处理 OpenSpec 变更。当用户想推进变更、创建下一个产出物或继续工作流时使用。
allowed-tools: Bash(openspec-cn:*)
license: MIT
compatibility: 需要 openspec-cn CLI。
metadata:
  author: openspec
  version: "1.0"
---

通过创建下一个产出物来继续处理变更。

**存储选择：** 若用户指定了一个存储（存储是注册在本机上的独立 OpenSpec 仓库）或工作位于某个存储中，请运行 `openspec store list --json` 发现已注册的存储 ID，然后在读写 spec 和变更的命令上传递 `--store <id>`（`new change`、`status`、`instructions`、`list`、`show`、`validate`、`archive`、`doctor`、`context`、`view`）。选定后，将 `--store <id>` 视为在当前工作流其余部分中固定不变。以下每个未限定范围的命令示例均为简写形式：运行前请追加该标志。例如，运行 `openspec status --change "<name>" --json --store "<id>"`，而非下面展示的未限定形式。其他命令不接受此标志。命令输出的提示已包含该标志；在后续操作中请保留它。若不指定存储，命令将对最近的本地 `openspec/` 根目录生效。

**输入**：可选地指定变更名。若省略，检查能否从对话上下文推断。若模糊或歧义，你必须提示用户从可用变更中选择。

**步骤**

1. **选择变更**

   若提供了名称，使用它。否则：
   - 从对话上下文推断（若用户提到了某个变更）
   - 若仅有一个活跃变更则自动选择
   - 若存在歧义，运行 `openspec list --json` 获取按最近修改排序的可用变更，并让用户选择

   提示时，展示最近修改的前 3-4 个变更作为选项，显示：
   - 变更名称
   - Schema（来自 `schema` 字段，若无则为 "spec-driven"）
   - 状态（例如 "0/5 tasks"、"complete"、"no tasks"）
   - 最近修改时间（来自 `lastModified` 字段）

   将最近修改的变更标记为 "(推荐)"，因为这很可能是用户想继续的。

   始终宣告："使用变更：<name>"，以及如何覆盖（例如 `/openspec-continue-change <other>`）。

2. **检查当前状态**
   ```bash
   openspec-cn status --change "<name>" --json
   ```
   解析 JSON 以理解当前状态。响应包括：
   - `schemaName`：使用的工作流 schema（例如 "spec-driven"）
   - `artifacts`：制品数组及其状态（"done"、"skipped"、"ready"、"blocked"）
   - `isPlanningComplete`：布尔值，表示所有规划制品是否已完成。较旧 CLI 版本以 `isComplete` 暴露相同值。
   - `planningHome`、`changeRoot`、`artifactPaths` 和 `actionContext`：路径和作用域上下文。请使用这些值而非假设仓库本地路径。

3. **基于状态行动**：

   ---

   **若所有规划制品已完成（`isPlanningComplete: true`，或旧版 `isComplete: true`）**：
   - 祝贺用户
   - 展示最终状态，包括使用的 schema
   - 建议："规划完成！现在可以实现此变更。实现及所有跟踪的工作完成后，归档它。"
   - 停止

   ---

   **若产出物已就绪可创建**（状态显示有 `status: "ready"` 的产出物）：
   - 从状态输出中选取第一个 `status: "ready"` 的产出物
   - 获取其指令：
     ```bash
     openspec-cn instructions <artifact-id> --change "<name>" --json
     ```
   - 解析 JSON。关键字段：
     - `context`：项目背景（给你的约束 - 不要包含在输出中）
     - `rules`：产出物特定规则（给你的约束 - 不要包含在输出中）
     - `template`：输出文件使用的结构
     - `instruction`：schema 特定指导
     - `resolvedOutputPath`：写入产出物的已解析路径或模式
     - `dependencies`：已完成的需要读取以获取上下文的产出物（带有 `skipped: true` 的条目无文件 - 不要查找它们）
     - `skipped`/`warning`：当变更声明 skip_specs 且此产出物必须不创建时出现 - 选择另一个产出物
   - **Create the artifact file**:
     - Read any completed dependency files for context - always re-read them from disk, even if you saw them earlier in the conversation (the user may have edited them)
     - 若 `instruction` 字段将创建委托给特定 skill 或命令，则调用它来生成产出物，而不是自己写入文件，然后验证产出物文件是否存在于 `resolvedOutputPath`
     - Otherwise use `template` as the structure - fill in its sections
     - Apply `context` and `rules` as constraints when writing - but do NOT copy them into the file
     - Write to the `resolvedOutputPath` specified in instructions. If it is a glob pattern, choose the concrete file path using the schema instruction and the change's context
   - Show what was created and what's now unlocked
   - STOP after creating ONE artifact

   ---

   **若没有产出物就绪（全部受阻）**：
   - 这在有效 schema 中不应发生
   - 展示状态并建议检查问题

4. **创建产出物后，展示进度**
   ```bash
   openspec-cn status --change "<name>"
   ```

**输出**

每次调用后，展示：
- 创建了哪个产出物
- 使用的 schema 工作流
- 当前进度（N/M 已完成）
- 现在解锁了哪些产出物
- 提示："想继续吗？只要让我继续或告诉我接下来做什么。"

**产出物创建指南**

产出物类型及其用途取决于 schema。指令输出中的 `instruction` 字段是每个产出物的权威指导 — 即使产出物名称熟悉（proposal.md、tasks.md 等）也应遵循它，因为自定义 schema 可能为相同文件名定义不同内容或不同流程。

若 `instruction` 字段指示你使用特定 skill 或命令创建产出物，则调用它而非直接写入产出物。

**Guardrails**
- Create ONE artifact per invocation
- Always read dependency artifacts before creating a new one - re-read from disk, not from conversation memory (files may have changed since you last saw them)
- Never skip artifacts or create out of order
- If context is unclear, ask the user before creating
- Verify the artifact file exists after writing before marking progress
- Use the schema's artifact sequence, don't assume specific artifact names
- **IMPORTANT**: `context` and `rules` are constraints for YOU, not content for the file
  - Do NOT copy `<context>`, `<rules>`, `<project_context>` blocks into the artifact
  - These guide what you write, but should never appear in the output
