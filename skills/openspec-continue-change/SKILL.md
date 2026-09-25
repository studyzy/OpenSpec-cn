---
name: openspec-continue-change
description: 通过创建下一个产出物来继续处理 OpenSpec 变更。当用户想推进变更、创建下一个产出物或继续工作流时使用。也在用户说 "openspec continue" 或 "opsx continue" 时使用。
allowed-tools: Bash(openspec-cn:*)
license: MIT
compatibility: 需要 openspec-cn CLI。
metadata:
  author: openspec
  version: "1.0"
---

通过创建下一个产出物来继续处理变更。

**存储选择：** 若用户指定了一个存储（存储是注册在本机上的独立 OpenSpec 仓库）或工作位于某个存储中，请运行 `openspec-cn store list --json` 发现已注册的存储 ID，然后在读写 spec 和变更的命令上传递 `--store <id>`（`new change`、`status`、`instructions`、`list`、`show`、`validate`、`archive`、`doctor`、`context`、`schemas`、`view`）。选定后，将 `--store <id>` 视为在当前工作流其余部分中固定不变。以下每个未限定范围的命令示例均为简写形式：运行前请追加该标志。例如，运行 `openspec-cn status --change "<name>" --json --store "<id>"`，而非下面展示的未限定形式。其他命令不接受此标志。命令输出的提示已包含该标志；在后续操作中请保留它。若不指定存储，命令将对最近的本地 `openspec/` 根目录生效。

**项目检查：** 以下步骤期望项目已经在使用 OpenSpec。在第一个会写入任何内容的步骤之前（`new change`、`archive`、`sync specs`，或撰写任何产出物文件），确认项目已有根目录：运行 `openspec-cn list --json`（当选择了 store 时加上 `--store <id>`，因为此时 store 就是根目录），并读取 `root`。root 是一个对象表示项目已配置好。`"root": null` 表示尚未配置 —— 这里没有 `openspec/` 目录，而像 `openspec-cn new change` 这样的写入操作会作为副作用创建它。该命令还会以非零状态退出，这是它给出的答案而不是 CLI 坏了，因此请读取 JSON，不要重试或绕过它。

有一种 `"root": null` 与配置无关：当某条 `status` 错误消息以 `中声明` 或 `中的 store 声明无效` 结尾，并指向本项目的 `openspec/config.yaml`（或 `config.yml`）时，说明本项目确实通过它声明的某个 store 在使用 OpenSpec，只是本机无法解析该 store（store 未注册，或 `store:` 行格式有误）。不要把它当作未初始化而跳过下面的分支：请在写入前停下，把该错误的 `message` 和 `fix` 展示给用户。

否则，在没有根目录的情况下，接下来怎么做取决于这个工作流是如何被触发的：

- **自动选用**：这个工作流是你自己选的，用户没有提到 OpenSpec、没有点名这个 skill，也没有运行它的斜杠命令。停止使用 OpenSpec，按平常方式回答请求，就像没安装 OpenSpec 一样。不要要求他们做任何配置，也不要提及 OpenSpec 配置。
- **明确要求 OpenSpec**：用户提到了 OpenSpec、点名了这个 skill，或运行了它的斜杠命令。在写入前停下并询问如何继续：为本项目做配置（`openspec-cn init`）、指向他们已有的某个 store（`--store <id>`），还是本次请求不使用 OpenSpec 继续。等待他们的答复。

无论走哪个分支，都绝不能把创建根目录当作副作用：在用户要求之前不要运行 `openspec-cn init`，不要手工创建 `openspec/` 文件，也不要让任何命令创建它。

**Input**: 可选地指定变更名。若省略，检查能否从对话上下文推断。若模糊或歧义，你必须提示用户从可用变更中选择。

**步骤**

1. **选择变更**

   若提供了名称，使用它。否则：
   - 从对话上下文推断（若用户提到了某个变更）
   - 若仅有一个活跃变更则自动选择
   - 若存在歧义，运行 `openspec-cn list --json` 获取按最近修改排序的可用变更，并让用户选择

   提示时，展示最近修改的前 3-4 个变更作为选项，显示：
   - 变更名称
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
   - **创建产出物文件**：
     - 读取所有已完成的依赖文件以获取上下文 - 始终从磁盘重新读取，即使在对话中之前已看到（用户可能已编辑过）
     - 若 `instruction` 字段将创建委托给特定 skill 或命令，则调用它来生成产出物，而不是自己写入文件，然后验证产出物文件是否存在于 `resolvedOutputPath`
     - 否则使用 `template` 作为结构 - 填写其各节
     - 写入时将 `context` 和 `rules` 作为约束应用 - 但不要将它们复制到文件中
     - 写入指令中指定的 `resolvedOutputPath`。若它是 glob 模式，根据 schema 指令和变更的上下文选择具体文件路径
   - 展示已创建的内容以及现在解锁了什么
   - 每次仅创建一个产出物，创建后即停止

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

**护栏**
- 每次调用仅创建一个产出物
- 始终在创建新产出物之前读取依赖产出物 - 从磁盘重新读取，而非对话记忆（文件可能自你上次看到后已变更）
- 绝不跳过产出物或乱序创建
- 若上下文不清，创建前先询问用户
- 在标记进度之前，先验证写入后产出物文件确实存在
- 使用 schema 的产出物顺序，不要假设特定的产出物名称
- **重要提示**：`context` 和 `rules` 是给你的约束，不是文件内容
  - 不要将 `<context>`、`<rules>`、`<project_context>` 块复制到产出物中
  - 这些指导你写什么，但绝不应出现在输出中
