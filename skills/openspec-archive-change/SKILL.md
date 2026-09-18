---
name: openspec-archive-change
description: 在实验性工作流中归档已完成的变更。当用户想在实现完成后定稿并归档变更时使用。也在用户说 "openspec archive" 或 "opsx archive" 时使用。
allowed-tools: Bash(openspec-cn:*)
license: MIT
compatibility: 需要 openspec-cn CLI。
metadata:
  author: openspec
  version: "1.0"
---

在实验性工作流中归档已完成的变更。

**存储选择：** 若用户指定了一个存储（存储是注册在本机上的独立 OpenSpec 仓库）或工作位于某个存储中，请运行 `openspec-cn store list --json` 发现已注册的存储 ID，然后在读写 spec 和变更的命令上传递 `--store <id>`（`new change`、`status`、`instructions`、`list`、`show`、`validate`、`archive`、`doctor`、`context`、`schemas`、`view`）。选定后，将 `--store <id>` 视为在当前工作流其余部分中固定不变。以下每个未限定范围的命令示例均为简写形式：运行前请追加该标志。例如，运行 `openspec-cn status --change "<name>" --json --store "<id>"`，而非下面展示的未限定形式。其他命令不接受此标志。命令输出的提示已包含该标志；在后续操作中请保留它。若不指定存储，命令将对最近的本地 `openspec/` 根目录生效。

**项目检查：** 以下步骤期望项目已经在使用 OpenSpec。在第一个会写入任何内容的步骤之前（`new change`、`archive`、`sync specs`，或撰写任何产出物文件），确认项目已有根目录：运行 `openspec-cn list --json`（当选择了 store 时加上 `--store <id>`，因为此时 store 就是根目录），并读取 `root`。root 是一个对象表示项目已配置好。`"root": null` 表示尚未配置 —— 这里没有 `openspec/` 目录，而像 `openspec-cn new change` 这样的写入操作会作为副作用创建它。该命令还会以非零状态退出，这是它给出的答案而不是 CLI 坏了，因此请读取 JSON，不要重试或绕过它。

有一种 `"root": null` 与配置无关：当某条 `status` 错误消息以 `中声明` 或 `中的 store 声明无效` 结尾，并指向本项目的 `openspec/config.yaml`（或 `config.yml`）时，说明本项目确实通过它声明的某个 store 在使用 OpenSpec，只是本机无法解析该 store（store 未注册，或 `store:` 行格式有误）。不要把它当作未初始化而跳过下面的分支：请在写入前停下，把该错误的 `message` 和 `fix` 展示给用户。

否则，在没有根目录的情况下，接下来怎么做取决于这个工作流是如何被触发的：

- **自动选用**：这个工作流是你自己选的，用户没有提到 OpenSpec、没有点名这个 skill，也没有运行它的斜杠命令。停止使用 OpenSpec，按平常方式回答请求，就像没安装 OpenSpec 一样。不要要求他们做任何配置，也不要提及 OpenSpec 配置。
- **明确要求 OpenSpec**：用户提到了 OpenSpec、点名了这个 skill，或运行了它的斜杠命令。在写入前停下并询问如何继续：为本项目做配置（`openspec-cn init`）、指向他们已有的某个 store（`--store <id>`），还是本次请求不使用 OpenSpec 继续。等待他们的答复。

无论走哪个分支，都绝不能把创建根目录当作副作用：在用户要求之前不要运行 `openspec-cn init`，不要手工创建 `openspec/` 文件，也不要让任何命令创建它。

`<capability-path>` 是相对于 `specs/` 的 spec 目录（例如 `user-auth` 或 `identity/user-auth`）。在解析主 spec 时保留每个增量 spec 的完整路径。

**Input**: 可选地指定变更名。若省略，检查能否从对话上下文推断。若模糊或歧义，必须提示用户从可用变更中选择。

**步骤**

1. **选择变更**

   若提供了名称，使用它。否则：
   - 从对话上下文推断（若用户提到了某个变更）
   - 若仅有一个活跃变更则自动选择
   - 若存在歧义，运行 `openspec-cn list --json` 获取可用变更并让用户选择

   提示时，仅显示活跃变更（非已归档）。
   若可用，包含每个变更使用的 schema。

   始终宣告："使用变更：<name>"，以及如何覆盖（例如 `/openspec-archive-change <other>`）。

   **在执行既有归档检查之前，先加载当前归档输入：**

   解析出所选变更与规划主目录后，运行：
   ```bash
   openspec-cn instructions archive --change "<name>" --json
   ```
   在此命令上保留相同的已选根目录标志。该查询是建议性且可选的：
   它只是提供额外的提示输入，因此绝不能阻塞归档。
   若它以非零状态退出或返回无效 JSON —— 例如在尚不支持此命令的旧版 CLI 上
   —— 则在没有 context 与 operation guidance 的情况下继续归档工作流。
   不要报告错误，也不要停止。

   成功的响应可能省略这两个可选字段。将 `context` 视为必需的提示级输入：阅读并考虑它，并应用相关的项目事实、约定与约束。将 `operationGuidance` 视为可选的增量建议：阅读并考虑每一条目，遵循那些适用且与内置归档工作流兼容的条目。

   将这两个字段与内置步骤、用户的显式选择、已解析的路径、CLI 检查和命令契约分开对待。若 context 与其中某个控制输入冲突，报告冲突并保留控制值。若 guidance 不适用或与某个控制输入冲突，不要遵循它并解释原因。不要从这两个字段推断替换路径、跳过的提示或标志，也不要把它们的内容原样复制到 specs、变更制品或归档汇总中，除非用户另行要求。这些是提示级行为契约，不是可强制执行的检查。

2. **检查产出物完成状态**

   运行 `openspec-cn status --change "<name>" --json` 检查产出物完成情况。

   解析 JSON 以了解：
   - `schemaName`：正在使用的工作流
   - `planningHome`、`changeRoot`、`artifactPaths` 和 `actionContext`：路径与作用域上下文
   - `artifacts`：产出物列表及其状态（`done`、`skipped` 或其他）

   **若存在既非 `done` 也非 `skipped` 的产出物**（skipped 产出物即满足要求 - 变更声明了 skip_specs）：
   - 展示警告列出未完成的产出物
   - 请用户确认是否继续
   - 用户确认则继续

3. **检查任务完成状态**

   读取任务文件（通常 `tasks.md`）检查未完成任务。

   复选框仅当其内容为 `x` 或 `X` 时才算完成；方括号内的空格无关紧要，
   因此 `- [ x]` 也算完成。其他任何标记都是未完成 —— `- [ ]`、空的 `- []`，
   以及 OpenSpec 未赋予含义的标记如 `- [~]` 或 `- [-]`。
   绝不把不熟悉的标记读作已完成。

   **若发现未完成任务：**
   - 展示警告显示未完成任务数
   - 请用户确认是否继续
   - 用户确认则继续

   **若无任务文件：** 无任务相关警告地继续。

4. **评估 delta spec 同步状态**

   使用 status JSON 中的 `artifactPaths.specs.existingOutputPaths` 作为唯一的 delta spec 来源。若 `specs` 条目缺失或 `existingOutputPaths` 为空，则在不提示同步的情况下继续，也不要从其他产出物推断 delta specs。

   **若存在 delta specs：**
   - 将每个 delta spec 与 `<planningHome.root>/openspec/specs/<capability-path>/spec.md` 处对应的主 spec 比较（使用步骤 2 中感知 store 的 `planningHome.root`，而不是硬编码的仓库路径）
   - 主 spec 缺失**并不自动**意味着"已同步"。对于新 capability，主 spec 是同步的*输出*，而非输入：
     - 若 delta 含 MODIFIED 或 RENAMED 需求，报告只有 ADDED 需求才能创建新主 spec，并将该能力标记为同步受阻。绝不要捏造一个没有当前版本的需求。
     - 否则，若 delta 仅含 REMOVED 需求且变更的 `.openspec.yaml` 声明了 `retire_capabilities: true`，该 capability 已退役：计为已同步，警告没有可移除的内容，且不要重新创建主 spec。现在以及在验证已完成的同步时都应用此规则。
     - 否则，若 delta 没有 ADDED 需求，报告无法同步并将该能力标记为同步受阻。对于仅含 REMOVED 的 delta，警告没有可从其中移除的主 spec，并保持主 spec 树不变。`openspec-cn archive` 会以 `Spec must have at least one requirement` 拒绝未标记的仅 REMOVED 情况。
     - 否则，将该 capability 计为需要同步，并在摘要中指明它（`<capability-path>：将创建新主 spec`）。若 delta 还含 REMOVED 需求，警告它们将被忽略，因为没有可从其中移除的主 spec。同步仅依据 delta 的 ADDED 需求创建主 spec，与 `openspec-cn archive` 的行为完全一致。
   - 确定将应用哪些更改（新增、修改、移除、重命名）
   - 即使某个能力同步受阻，也继续评估其余能力。在提示前展示合并摘要。

   **提示选项：**
   - 若任何能力同步受阻：解释原因，仅提供"不同步归档"、"取消"
   - 否则，若需更改："立即同步（推荐）"、"不同步归档"
   - 否则，若已同步："立即归档"、"仍同步"、"取消"

   根据回答路由：
   - "取消" — 停止，不归档
   - "不同步归档" 或 "立即归档" — 继续归档
   - "立即同步" 或 "仍同步" — 先同步，然后（按下文）验证。在任何能力同步受阻时不要开始同步；解释阻碍并重复可用选项。
   - 其他任何回答 — 再次询问，而不是归档

   在所选同步写入任何主 spec 之前，用相同的已选根目录标志运行一次 `openspec-cn instructions specs --change "<name>" --json`。要求退出状态为零且返回有效的制品指令 JSON。若查询失败或返回无效 JSON，报告错误并在写入任何主 spec 或移动变更之前停止。省略 `rules` 的有效响应表示未配置制品规则 — 这是无规则情况。仅将返回的 `rules` 应用于此合并生成的主 spec 的内容和形式；不要将其用于归档指导、更改 CLI 行为，或将规则文本复制到任何输出文件中。

   然后为变更 '<name>' 内联运行 `openspec-sync-specs` 工作流（agent 驱动的智能合并），传入上面的 delta spec 分析和已获取的 specs 规则快照，并等待它完成。内联同步必须复用该快照，不要再次获取 `specs` 指令。不要把它委托给后台任务 —— 步骤 5 会把 `changeRoot` 从一个仍在读取它的同步下方移走，导致变更已归档而主 specs 从未更新。若你的 agent 只能通过委托运行它，请同步委托并等待结果。

   然后对本步骤开头针对 `artifactPaths.specs.existingOutputPaths` 中每个拥有 delta spec 的能力重新运行比较（包括显式退役的、主 spec 缺失的情况）—— 不仅仅是同步报告它触及的那些。成功的同步不会留下任何待应用的内容，因此每个能力现在必须显示为已同步：
   - ADDED 需求存在
   - MODIFIED 需求携带 delta 中指明的场景与描述更改，且其其他场景保持完好
   - REMOVED 需求已消失 —— 若此次同步退役了某个能力（移除了它的最后一条需求，使 `## Requirements` 为空），其主 spec 应被删除而不是留空；同步有意保留并报告过的 spec 也算匹配
   - RENAMED 需求以新名称存在且旧名称下已消失

   若同步失败，或任何能力不匹配，报告差异并停止 —— 不要归档。没有任何东西被移动且 `changeRoot` 完好无损，用户可以修复不一致或重新运行同步并再次开始归档。

5. **执行归档**

   若 `planningHome.changesDir` 下不存在 `archive` 目录则创建：
   ```bash
   mkdir -p "<planningHome.changesDir>/archive"
   ```

   生成目标名称：若变更名已以 `YYYY-MM-DD-` 前缀开头则保持原样；否则将当前日期前置为 `YYYY-MM-DD-<change-name>`。绝不叠加第二个日期（与 `openspec-cn archive` 相同的规则）。

   **检查目标是否已存在：**
   - 是：报错失败，建议重命名现有归档或使用不同日期
   - 否：移动 `changeRoot` 到归档目录

   ```bash
   mv "<changeRoot>" "<planningHome.changesDir>/archive/<target-name>"
   ```

6. **展示汇总**

   展示归档完成汇总，包括：
   - 变更名
   - 使用的 schema
   - 归档位置
   - specs 是否已同步（如适用）
   - 关于任何警告的说明（未完成产出物/任务）

**成功时输出**

```markdown
## 归档完成

**变更：** <change-name>
**Schema：** <schema-name>
**归档到：** 从 `planningHome.changesDir`/<target-name>/ 派生的归档路径
**Specs：** <仅当步骤 4 验证通过时为 "✓ 已同步到主 specs"；否则为 "无 delta specs" 或 "跳过同步">

<“所有产出物完成。所有任务完成。” —— 若带警告归档，则改为列出警告（例如“带 2 个未完成任务归档”）>
```

**护栏**
- 宣告所选变更；存在歧义时提示选择
- 使用制品图（openspec-cn status --json）检查完成状态
- 不要因警告阻塞归档 - 仅告知并确认
- 移动到归档时保留 .openspec.yaml（它随目录一起移动）
- 展示清晰的所发生事情的汇总
- 若请求同步，内联运行 `openspec-sync-specs` 工作流（agent 驱动）
- 绝不在 spec 同步仍在进行时归档 —— 内联运行同步并在移动 `changeRoot` 前验证主 specs
- 若存在 delta specs，始终运行同步评估并在提示前展示合并摘要
- 应用相关的运行时 context 并报告冲突；operation guidance 保持建议性质
- 考虑每条 guidance 条目，并解释任何不适用或冲突的建议
- 现有的 CLI 检查、已解析路径、提示与命令契约保持不变
- 制品规则仅约束正在写入的 specs，绝不是 operation guidance
- 绝不把运行时 context、operation guidance 或制品规则文本原样复制到输出文件中
