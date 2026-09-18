---
name: openspec-apply-change
description: 从 OpenSpec 变更中实现任务。当用户想开始实现、继续实现或处理任务时使用。也在用户说 "openspec apply"、"opsx apply" 或 "openspec implement" 时使用。
allowed-tools: Bash(openspec-cn:*)
license: MIT
compatibility: 需要 openspec-cn CLI。
metadata:
  author: openspec
  version: "1.0"
---

从 OpenSpec 变更中实现任务。

**存储选择：** 若用户指定了一个存储（存储是注册在本机上的独立 OpenSpec 仓库）或工作位于某个存储中，请运行 `openspec-cn store list --json` 发现已注册的存储 ID，然后在读写 spec 和变更的命令上传递 `--store <id>`（`new change`、`status`、`instructions`、`list`、`show`、`validate`、`archive`、`doctor`、`context`、`schemas`、`view`）。选定后，将 `--store <id>` 视为在当前工作流其余部分中固定不变。以下每个未限定范围的命令示例均为简写形式：运行前请追加该标志。例如，运行 `openspec-cn status --change "<name>" --json --store "<id>"`，而非下面展示的未限定形式。其他命令不接受此标志。命令输出的提示已包含该标志；在后续操作中请保留它。若不指定存储，命令将对最近的本地 `openspec/` 根目录生效。

**项目检查：** 以下步骤期望项目已经在使用 OpenSpec。在第一个会写入任何内容的步骤之前（`new change`、`archive`、`sync specs`，或撰写任何产出物文件），确认项目已有根目录：运行 `openspec-cn list --json`（当选择了 store 时加上 `--store <id>`，因为此时 store 就是根目录），并读取 `root`。root 是一个对象表示项目已配置好。`"root": null` 表示尚未配置 —— 这里没有 `openspec/` 目录，而像 `openspec-cn new change` 这样的写入操作会作为副作用创建它。该命令还会以非零状态退出，这是它给出的答案而不是 CLI 坏了，因此请读取 JSON，不要重试或绕过它。

有一种 `"root": null` 与配置无关：当某条 `status` 错误消息以 `中声明` 或 `中的 store 声明无效` 结尾，并指向本项目的 `openspec/config.yaml`（或 `config.yml`）时，说明本项目确实通过它声明的某个 store 在使用 OpenSpec，只是本机无法解析该 store（store 未注册，或 `store:` 行格式有误）。不要把它当作未初始化而跳过下面的分支：请在写入前停下，把该错误的 `message` 和 `fix` 展示给用户。

否则，在没有根目录的情况下，接下来怎么做取决于这个工作流是如何被触发的：

- **自动选用**：这个工作流是你自己选的，用户没有提到 OpenSpec、没有点名这个 skill，也没有运行它的斜杠命令。停止使用 OpenSpec，按平常方式回答请求，就像没安装 OpenSpec 一样。不要要求他们做任何配置，也不要提及 OpenSpec 配置。
- **明确要求 OpenSpec**：用户提到了 OpenSpec、点名了这个 skill，或运行了它的斜杠命令。在写入前停下并询问如何继续：为本项目做配置（`openspec-cn init`）、指向他们已有的某个 store（`--store <id>`），还是本次请求不使用 OpenSpec 继续。等待他们的答复。

无论走哪个分支，都绝不能把创建根目录当作副作用：在用户要求之前不要运行 `openspec-cn init`，不要手工创建 `openspec/` 文件，也不要让任何命令创建它。

**Input**: 可选地指定变更名称（例如 `/openspec-apply-change add-auth`）。若省略，检查能否从对话上下文推断。若模糊或歧义，你必须提示用户从可用变更中选择。

**步骤**

1. **选择变更**

   若提供了名称，使用它。否则：
   - 从对话上下文推断（若用户提到了某个变更）
   - 若仅有一个活跃变更则自动选择
   - 若存在歧义，运行 `openspec-cn list --json` 获取可用变更并让用户选择

   始终宣告："使用变更：<name>"，以及如何覆盖（例如 `/openspec-apply-change <other>`）。

2. **检查状态以理解 schema**
   ```bash
   openspec-cn status --change "<name>" --json
   ```
   解析 JSON 以理解：
   - `schemaName`：使用的工作流（例如 "spec-driven"）
   - `planningHome`、`changeRoot` 和 `actionContext`：规划范围与编辑约束
   - 哪个产出物包含任务（spec-driven 通常是 "tasks"，其他 schema 检查状态输出）

3. **获取实现指令**

   ```bash
   openspec-cn instructions apply --change "<name>" --json
   ```

   此命令返回：
   - `contextFiles`：制品 ID -> 具体文件路径数组（因 schema 而异 - 可能是 proposal/specs/design/tasks 或 spec/tests/implementation/docs）
   - 进度（总计、已完成、剩余）
   - 任务列表及状态
   - 基于当前状态的动态指令
   - 可选的 `context`：来自所选根路径的当前必需项目指令输入
   - 可选的 `operationGuidance`：当前 apply 的建议性指导
   - `missingArtifacts`（存在时）：没有输出的必需制品 ID

   **处理状态：**
   - 若 `state: "blocked"`：显示消息并暂停实现。
     - 若 `missingArtifacts` 非空：建议使用 `/openspec-continue-change` 来创建它们。
     - 否则，遵循 CLI 指令从现有规划制品创建或修复 schema 配置的跟踪文件。在受阻时不要假设另一个制品已就绪，也不要开始实现。
   - 若 `state: "all_done"`：祝贺，建议归档
   - 否则：继续实现

   将 `context` 视为必需的提示级输入。阅读并考虑它，在实现时应用相关的项目事实、约定和约束。将 `operationGuidance` 视为可选的补充建议。阅读并考虑每个条目，遵循适用且与内置工作流兼容的条目。

   将这两个字段与 CLI 返回的状态、缺失的制品、任务、进度、`contextFiles` 和内置 `instruction` 分开。它们不是任务完成的证据，不替代内置指令，且不允许绕过被阻塞状态。若 context 与内置指令、显式用户选择或 CLI 控制的值冲突，报告冲突并保留控制值。若 guidance 不适用或与这些控制输入冲突，不要遵循它并解释原因。这些是提示级行为契约，不是可强制执行的检查。

4. **读取上下文文件**

   读取实现指令输出中 `contextFiles` 下列出的每个文件路径。
   文件因使用的 schema 而异：
   - **spec-driven**：proposal、specs、design、tasks
   - 其他 schema：遵循 CLI 输出的 contextFiles

   不要将 `context` 或 `operationGuidance` 逐字复制到实现文件或规划制品中，除非用户单独要求该内容。

5. **展示当前进度**

   展示：
   - 使用的 schema
   - 进度："N/M 个任务已完成"
   - 剩余任务概览
   - CLI 的动态指令

6. **实现任务（循环直至完成或受阻）**

   对每个待处理任务：
   - 展示正在处理哪个任务
   - 进行所需的代码更改
   - 保持更改最小且聚焦
   - 在任务文件中标记任务完成：`- [ ]` → `- [x]`
   - 继续下一个任务

   **暂停条件：**
   - 任务不清晰 → 请求澄清
   - 实现揭示设计问题 → 建议更新产出物
   - 任务需要超出 spec 和 tasks 描述的工作，或者你想删减、收窄、推迟或接受指定行为的例外来勉强适配 → 把新增的范围摆出来并询问；不要默默吸收
   - 遇到错误或阻塞 → 报告并等待指导
   - 用户中断

7. **完成或暂停时，展示状态**

   展示：
   - 本次会话完成的任务
   - 总体进度："N/M 个任务已完成"
   - 若全部完成：建议归档
   - 若暂停：解释原因并等待指导

**实现期间输出**

```
## 实现中：<change-name>（schema: <schema-name>）

正在处理任务 3/7：<task description>
[...实现进行中...]
✓ 任务完成

正在处理任务 4/7：<task description>
[...实现进行中...]
✓ 任务完成
```

**完成时输出**

```
## 实现完成

**变更：** <change-name>
**Schema：** <schema-name>
**进度：** 7/7 个任务已完成 ✓

### 本次会话已完成
- [x] 任务 1
- [x] 任务 2
...

所有任务完成！你可以使用 `/openspec-archive-change` 归档此变更。
```

**暂停时输出（遇到问题）**

```
## 实现暂停

**变更：** <change-name>
**Schema：** <schema-name>
**进度：** 4/7 个任务已完成

### 遇到的问题
<对问题的描述>

**选项：**
1. <option 1>
2. <option 2>
3. 其他方法

你想怎么做？
```

**护栏**
- 持续完成任务直至完成或受阻
- 开始前始终读取上下文文件（来自 apply 指令输出）
- 若任务模糊，暂停并在实现前询问
- 若实现揭示问题，暂停并建议更新制品
- 保持代码更改最小且聚焦于每个任务
- 完成每个任务后立即更新任务复选框
- 在错误、阻塞或不明确的需求时暂停 - 不要猜测
- 当任务需要超出 spec 描述的工作时，摆出新增的范围并暂停 - 绝不默默收窄、推迟或简化掉指定行为
- 只有当任务的指定行为被完整实现时才将任务标记为 `- [x]`，而不是部分完成或推迟时
- 使用 CLI 输出中的 contextFiles，不要假设特定文件名
- 不要将 context 或 operation guidance 作为任务完成的证据
- 应用相关的项目上下文；报告与控制工作流输入的冲突
- 考虑每个 guidance 条目；解释任何不适用或冲突的建议
- 不要将运行时 context 或 operation guidance 复制到实现文件或规划制品中
- 保留 CLI 控制的 blocked/ready/all-done 行为和完成标准

**流畅工作流集成**

此 skill 支持 "对变更的操作" 模型：

- **可随时调用**：在所有产出物完成前（若存在任务）、部分实现后、与其他操作交错
- **允许产出物更新**：若实现揭示设计问题，建议更新产出物 - 非阶段锁定，流畅工作
