---
name: openspec-ff-change
description: 快速推进 OpenSpec 产出物创建。当用户想快速创建实现所需的所有产出物而无需逐个处理时使用。
allowed-tools: Bash(openspec-cn:*)
license: MIT
compatibility: 需要 openspec-cn CLI。
metadata:
  author: openspec
  version: "1.0"
---

快速推进产出物创建 - 一次性生成开始实现所需的所有内容。

**存储选择：** 若用户指定了一个存储（存储是注册在本机上的独立 OpenSpec 仓库）或工作位于某个存储中，请运行 `openspec-cn store list --json` 发现已注册的存储 ID，然后在读写 spec 和变更的命令上传递 `--store <id>`（`new change`、`status`、`instructions`、`list`、`show`、`validate`、`archive`、`doctor`、`context`、`schemas`、`view`）。选定后，将 `--store <id>` 视为在当前工作流其余部分中固定不变。以下每个未限定范围的命令示例均为简写形式：运行前请追加该标志。例如，运行 `openspec-cn status --change "<name>" --json --store "<id>"`，而非下面展示的未限定形式。其他命令不接受此标志。命令输出的提示已包含该标志；在后续操作中请保留它。若不指定存储，命令将对最近的本地 `openspec/` 根目录生效。

**Input**: 用户的请求应当包含变更名（kebab-case）或对想要构建内容的描述。

**步骤**

1. **如果没有提供明确的输入，询问他们想要构建什么**

   询问用户（开放式，不设预设选项）：
   > "你想做什么变更？描述一下你想构建或修复的内容。"

   根据他们的描述，推导出一个 kebab-case 名称（例如："add user authentication" → `add-user-auth`）。

   **重要提示**：在不了解用户想要构建什么的情况下，请勿继续。

2. **创建变更目录**
   ```bash
   openspec-cn new change "<name>"
   ```
   这将在 CLI 解析的规划主目录中创建一个脚手架变更。

3. **获取产出物构建顺序**
   ```bash
   openspec-cn status --change "<name>" --json
   ```
   解析 JSON 以获取：
   - `applyRequires`：实现前所需的产出物 ID 数组（例如 `["tasks"]`）
   - `artifacts`：所有产出物列表，每个包含其 `status` 和 `requires` 边（它直接依赖的产出物 ID）
   - `planningHome`、`changeRoot`、`artifactPaths` 和 `actionContext`：路径和作用域上下文。请使用这些值而非假设仓库本地路径。

4. **创建所需集合中的每个产出物**

   使用待办清单跟踪产出物进度。

   按依赖顺序循环遍历产出物（没有待处理依赖项的产出物优先）：

   a. **对于每个 `ready`（依赖项已满足）的产出物**：
      - 获取指令：
        ```bash
        openspec-cn instructions <artifact-id> --change "<name>" --json
        ```
      - 指令 JSON 包含：
        - `context`：项目背景（给你的约束 - 不要包含在输出中）
        - `rules`：产出物特定规则（给你的约束 - 不要包含在输出中）
        - `template`：输出文件使用的结构
        - `instruction`：此产出物类型的 schema 特定指导
        - `skipped`/`warning`：当变更声明 skip_specs 且此产出物必须不创建时出现 - 停止并选择另一个产出物
        - `resolvedOutputPath`：写入产出物的已解析路径或模式
        - `dependencies`：已完成的需要读取以获取上下文的产出物
      - 读取所有已完成的依赖文件以获取上下文 - 始终从磁盘重新读取，即使在对话中之前已看到（用户可能已编辑过）
      - **起草前先检查相关项目**：先阅读 `context` 和 `rules`，再检查 `openspec/` 之外的相关实现、邻近测试、配置和文档。检查保持只读且与变更规模相称；复用发现结果供后续产出物使用，仅在需要时做更多检查。
        - 从请求和项目上下文中识别目标项目；规划主目录可能与代码分离。若目标不明确，询问用户。对于绿地项目或非代码变更，检查现有结构和相关文档。若源码不可用，说明该局限，并在其严重影响计划时询问用户。
        - 让范围、方法和任务扎根于检查所见。区分观察到的行为与假设及建议的新增内容；与现有规范冲突时显式呈现冲突，而不是默默裁定谁对谁错。
        - 现在就做这些发现，而不是留给实现阶段泛泛的"探索代码库"或"制定计划"任务。必要的后续调查应针对未解决的具体问题。
      - 若 `instruction` 字段将创建委托给特定 skill 或命令，则调用它来生成产出物，而不是自己写入文件，然后验证产出物文件是否存在于 `resolvedOutputPath`
      - 否则，使用 `template` 作为结构创建产出物文件，并写入 `resolvedOutputPath`。若 `resolvedOutputPath` 是一个 glob，遵循 `instruction` 选择具体文件路径
      - 将 `context` 和 `rules` 作为约束应用 - 但不要将它们复制到文件中
      - 显示简要进度："✓ 已创建 <artifact-id>"

   b. **持续创建直到所需集合中的每个产出物都存在（不仅仅是 `apply.requires`）**
      - 创建每个产出物后，重新运行 `openspec-cn status --change "<name>" --json`
      - 所需集合是 `applyRequires` 加上通过跟踪 `status --json` 中的 `requires` 边从这些产出物可达的每个产出物 - 传递地遍历它们（spec-driven 涵盖 proposal、specs、design、tasks）。不要触碰此集合之外的产出物
      - `status` 仅基于文件存在性，因此一个显示 `done` 的 `applyRequires` 产出物并不意味着其依赖项存在 - 过早写入 `tasks.md` 会标记 `tasks` 为 done，但 `specs` 从未写入。使用每个产出物的 `requires` 边而非其 `status` 来构建所需集合：一个 `done` 产出物仍然列出其依赖项
      - 已显示 `status: "skipped"` 的产出物即已满足：变更在 `.openspec.yaml` 中声明了 `skip_specs`，因此其文件必须不存在。永远不要尝试创建它
      - 创建所需集合中缺失的每个产出物，然后重新检查 - 创建一个可能会解锁其他产出物
      - 仅当 `status` 已报告为 `skipped`，或其自身 `instruction` 表明是条件性的时才跳过：运行 `openspec-cn instructions <artifact-id> --change "<name>" --json`，仅当其 `instruction` 字段标记为可选时才跳过（例如 "create only if..."）。spec-driven 的 `design.md` 符合此条件；`specs` 仅通过上述 `skipped` 状态符合，绝不能凭你的判断。告知用户，且不要重新考虑
      - 依赖项是使能因素而非关卡：若一个必需产出物仍 `blocked` 仅因为你跳过了条件性依赖项，照样写入
      - 当所需集合中的每个产出物为 `done`、`skipped` 或已被有意跳过时停止

   c. **若某个产出物需要用户输入**（上下文不清）：
      - 请求用户澄清
      - 然后继续创建

5. **显示最终状态**
   ```bash
   openspec-cn status --change "<name>"
   ```

**输出**

完成所有产出物后，总结：
- 变更名称和位置
- 已创建产出物列表及简要描述，加上跳过的任何条件性产出物及原因
- 就绪状态："实现所需的所有产出物已就绪。"
- 提示："运行 `/openspec-apply-change` 或让我实现以开始处理任务。"

**产出物创建指南**

- 遵循来自 `openspec-cn instructions` 每个制品类型输出中的 `instruction` 字段 — 它是权威指导，即使产出物名称熟悉
- 若 `instruction` 字段指示你使用特定 skill 或命令创建产出物，则调用它而非直接写入产出物
- schema 定义了每个产出物应包含的内容 - 遵循它
- 在创建新产出物之前读取依赖产出物以获取上下文
- 使用 `template` 作为输出文件的结构 - 填写其各节
- **重要提示**：`context` 和 `rules` 是给你的约束，不是文件内容
  - 不要将 `<context>`、`<rules>`、`<project_context>` 块复制到产出物中
  - 这些指导你写什么，但绝不应出现在输出中

**护栏**
- 创建 apply 阶段传递依赖的每个产出物，不仅仅是 `apply.requires` 中列出的 ID
- 始终在创建新产出物之前读取依赖产出物 - 从磁盘重新读取，而非对话记忆（文件可能自你上次看到后已变更）
- 若上下文严重不清，询问用户 - 但优先做出合理决定以保持进展
- 若同名变更已存在，建议继续该变更
- 在继续下一个之前，验证每个产出物文件在写入后确实存在
