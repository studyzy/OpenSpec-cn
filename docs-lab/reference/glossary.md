# 术语表

> 每个 OpenSpec 术语，各一行。

OpenSpec 复用了一些在 git、CI 和 Agent 工具中含义不同的词。每一行给出 OpenSpec 中的含义，最后一列链接到讲解该术语的页面。

| 术语 | 定义 | 更多 |
|---|---|---|
| **Apply** | 实现变更提案中的任务。Skill：`openspec-apply-change`。 | [应用变更](../guides/apply.md) |
| **Archive** | 完成一个变更提案：将其增量规范（delta specs）合并到主 spec，并把它的目录移到 `openspec/changes/archive/`。 | [快速开始](../start/quickstart.md) |
| **Artifact** | 变更提案内的规划文档：`proposal.md`、增量规范（delta specs）、`design.md`、`tasks.md`。不是构建产物。 | [核心概念](../guides/concepts.md) |
| **Capability** | 你系统的一个行为领域。每个能力在 `openspec/specs/<capability>/spec.md` 有一个 spec。 | [核心概念](../guides/concepts.md) |
| **Change proposal** | 一个工作单元：`openspec/changes/<name>/` 下的一个目录，存放其规划制品。常简称为"变更"。不是 git 提交。 | [核心概念](../guides/concepts.md) |
| **Command** | 工作流的键入式入口。各工具的拼写不同（`/opsx:propose`、`/opsx-propose`）。本文档改用技能名来称呼工作流。 | [支持的工具](supported-tools.md) |
| **Continue** | 为现有变更提案创建下一个规划制品。Skill：`openspec-continue-change`。 | [技能](skills.md) |
| **Delivery** | 工作流如何安装：作为 skills、命令，还是两者。 | [设置你的项目](../start/setup.md) |
| **Delta spec** | 变更提案中的一个 spec，只列出变化的内容，位于 `ADDED`、`MODIFIED`、`REMOVED` 和 `RENAMED` 标题之下。 | [增量规范（delta specs）](schemas/spec-driven/index.md#delta-specs-specmd) |
| **Explore** | 在提议之前，先与 Agent 一起把想法想清楚。不写代码。Skill：`openspec-explore`。 | [探索想法](../guides/explore.md) |
| **Fast-forward** | 一次性创建带有全部规划制品的变更提案，即可直接进入实现。Skill：`openspec-ff-change`。不是 git 的 fast-forward。 | [技能](skills.md) |
| **Legacy workflow** | OPSX 之前的 `/openspec:*` 命令。 | [迁移](../help/legacy/migration.md) |
| **Loop** | 变更提案经历的一个循环：explore、propose、review、apply、archive。 | [快速开始](../start/quickstart.md) |
| **Main specs** | `openspec/specs/` 目录树：你系统当前已达成一致的行为。归档会把增量规范（delta specs）合并进去。 | [核心概念](../guides/concepts.md) |
| **OpenSpec root** | 命令解析并操作的 `openspec/` 目录树：你仓库的，或某个 store 的。 | [Stores](configuration/stores.md) |
| **OPSX** | 当前的 OpenSpec 工作流系统，以及它安装的命令前缀（`/opsx:`）。 | [架构](architecture/index.md) |
| **Profile** | init 安装哪些工作流：`core` 或 `custom`。 | [Profiles](../customize/profiles.md) |
| **Propose** | 一步创建变更提案并生成其全部规划制品。Skill：`openspec-propose`。 | [快速开始](../start/quickstart.md) |
| **Registry** | 机器级已注册 store 列表，位于 `registry.yaml`。不是包注册表。 | [Stores](configuration/stores.md) |
| **Requirement** | 系统必须具备的一个行为，用 SHALL 书写：spec 中的 `### Requirement:`。 | [增量规范（delta specs）](schemas/spec-driven/index.md#delta-specs-specmd) |
| **Scenario** | 需求下一个可测试的示例，以 WHEN/THEN 形式书写。 | [增量规范（delta specs）](schemas/spec-driven/index.md#delta-specs-specmd) |
| **Schema** | 定义变更提案产生哪些制品以及按什么顺序产生。不是 JSON Schema。 | [Schemas](schemas/index.md) |
| **Skill** | 一个工作流的指令，安装到你的 AI 工具读取的位置（`.agents/skills/` 等）。 | [技能](skills.md) |
| **Spec** | 描述某个能力当前如何行为的文件，位于 `openspec/specs/<capability>/spec.md`。 | [核心概念](../guides/concepts.md) |
| **spec-driven** | 默认 schema：proposal，然后增量规范（delta specs），然后 design，然后 tasks。 | [spec-driven](schemas/spec-driven/index.md) |
| **Store** | 注册在你机器上的独立 OpenSpec 仓库，用于跨仓库规划。不是数据存储。 | [Stores（beta）](../multi-repo/stores.md) |
| **Sync** | 在不归档的情况下，将已实现的增量规范（delta specs）合并到主 spec。Skill：`openspec-sync-specs`。 | [技能](skills.md) |
| **Template** | schema 提供给每个制品的起始内容。 | [Schemas](../customize/schemas.md) |
| **Update** | 作为技能（`openspec-update-change`）：修订变更提案的规划制品。作为 CLI 命令（`openspec-cn update`）：刷新 OpenSpec 已安装的文件。 | [调整方向](../guides/change-course.md)、[CLI](cli.md) |
| **Verify** | 在归档前检查实现是否符合变更提案的制品。Skill：`openspec-verify-change`。 | [技能](skills.md) |
| **Workflow** | 一个命名的 OpenSpec 动作（propose、apply、archive 等），以 skill 或 command 形式安装到你的 AI 工具中。 | [设置你的项目](../start/setup.md) |
| **Workset** | 个人本地的一组文件夹，在同一个工具中一起打开。不是 store，也不共享任何内容。 | [Worksets（beta）](../multi-repo/worksets.md) |
