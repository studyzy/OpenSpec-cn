# 术语表

> 每个 OpenSpec 术语，各一行。

OpenSpec 复用了一些在 git、CI 和 Agent 工具中含义不同的词。每一行给出 OpenSpec 中的含义，最后一列在可用时链接到更多细节。

| 术语 | 定义 | 更多 |
|---|---|---|
| **Apply** | 实现变更提案中的任务。Skill：`openspec-apply-change`。 | [应用变更](skills.md#openspec-apply-change) |
| **Archive** | 完成一个变更提案：将其增量合并到主 spec，并把它的文件夹移到 `openspec/changes/archive/`。 | [快速开始](../start/quickstart.md) |
| **Artifact** | 变更提案内的规划文档：`proposal.md`、delta specs、`design.md`、`tasks.md`。不是构建产物。 | [制品](schemas/spec-driven/index.md#artifacts) |
| **Capability** | 你系统的一个行为领域。每个能力在 `openspec/specs/<capability>/spec.md` 有一个 spec。 | [能力](schemas/spec-driven/index.md#proposalmd) |
| **Change proposal** | 一个工作单元：`openspec/changes/<name>/` 下存放其规划制品的文件夹。常简称为 "change"。不是 git commit。 | [Propose](../start/quickstart.md#step-2-propose) |
| **Command** | OpenSpec 1.x 中工作流的键入式入口（`/opsx:propose`、`/opsx-propose`）。OpenSpec 2.0 只安装 skills。 | [支持的工具](supported-tools.md) |
| **Continue** | 为已有变更提案创建下一个规划制品。Skill：`openspec-continue-change`。 | [Skills](skills.md) |
| **Delivery** | 1.x 中工作流的安装方式：作为 skills、commands 或两者。2.0 中已弃用。 | [升级到 2.0](../help/upgrade-to-2.md) |
| **Delta spec** | 变更提案内的 spec，只列出变化的内容，位于 `ADDED`、`MODIFIED`、`REMOVED` 和 `RENAMED` 标题下。 | [Delta specs](schemas/spec-driven/index.md#delta-specs-specmd) |
| **Explore** | 在提出提案前与 Agent 一起把想法想清楚。不写代码。Skill：`openspec-explore`。 | [探索想法](skills.md#openspec-explore) |
| **Fast-forward** | 一次创建包含全部规划制品的变更提案，可直接实现。Skill：`openspec-ff-change`。不是 git fast-forward。 | [Skills](skills.md) |
| **Legacy workflow** | OPSX 之前的 `/openspec:*` 命令。 |  |
| **Loop** | 变更提案经历的循环：explore、propose、review、apply、archive。 | [快速开始](../start/quickstart.md) |
| **Main specs** | `openspec/specs/` 目录树：你系统当前已达成共识的行为。归档会把 deltas 合并进去。尚无 spec 的能力会从其 `ADDED` 需求获得一个。 | [归档](../start/quickstart.md#step-5-archive) |
| **OpenSpec root** | 命令解析并操作的 `openspec/` 目录树：你仓库中的，或某个 store 的。 | [Stores](../multi-repo/stores.md#where-artifacts-get-created-when-using-stores) |
| **OPSX** | 当前的 OpenSpec 工作流系统。其 1.x 命令使用 `/opsx:` 前缀。 |  |
| **Profile** | init 安装哪些工作流：`core` 或 `custom`。 | [Profiles](../customize/profiles.md) |
| **Propose** | 一步创建变更提案并生成其全部规划制品。Skill：`openspec-propose`。 | [快速开始](../start/quickstart.md) |
| **Registry** | 机器级注册 store 列表，位于 `registry.yaml`。不是包注册表。 | [CLI](cli.md#openspec-store) |
| **Requirement** | 系统必须具备的一个行为，用 SHALL 表述：spec 中的 `### Requirement:`。 | [Delta specs](schemas/spec-driven/index.md#delta-specs-specmd) |
| **Scenario** | 需求下可测试的示例，采用 WHEN/THEN 形式。 | [Delta specs](schemas/spec-driven/index.md#delta-specs-specmd) |
| **Schema** | 定义变更提案产出哪些制品及顺序。不是 JSON Schema。 | [Schemas](schemas/index.md) |
| **Skill** | 工作流的指令，安装在你的 AI 工具读取的位置（`.agents/skills/` 等）。 | [Skills](skills.md) |
| **Spec** | 描述某个能力当前如何行为的文件，位于 `openspec/specs/<capability>/spec.md`。 | [归档](../start/quickstart.md#step-5-archive) |
| **spec-driven** | 默认 schema：proposal，然后 delta specs，然后 design，然后 tasks。 | [spec-driven](schemas/spec-driven/index.md) |
| **Store** | 在你机器上注册的独立 OpenSpec 仓库，用于跨仓库规划。不是数据存储。 | [Stores（beta）](../multi-repo/stores.md) |
| **Sync** | 不归档而将已实现的 deltas 合并到主 specs。Skill：`openspec-sync-specs`。 | [Skills](skills.md) |
| **Template** | schema 给每个制品的起始内容。 | [Schemas](../customize/schemas.md) |
| **Update** | 作为 skill（`openspec-update-change`）：修订变更提案的规划制品。作为 CLI 命令（`openspec update`）：刷新 OpenSpec 安装的文件。 | [更新变更](skills.md#openspec-update-change), [CLI](cli.md) |
| **Verify** | 在归档前检查实现是否匹配变更提案的制品。Skill：`openspec-verify-change`。 | [Skills](skills.md) |
| **Workflow** | 一个具名的 OpenSpec 动作（propose、apply、archive 等），以 skill 形式安装到你的 AI 工具中。 | [设置你的项目](../start/setup.md) |
| **Workset** | 一组在你机器上、本地私有的文件夹，在一个工具中一起打开。不是 store，且不共享任何内容。 | [Worksets（beta）](../multi-repo/worksets.md) |
