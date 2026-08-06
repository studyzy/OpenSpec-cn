# 术语表

把 OpenSpec 的每个术语集中在一处，用平实的语言解释。先扫一遍，读其余文档会更快。

术语按主题分组，组内再按字母排序。

## 核心名词

**Spec.** 描述系统某一部分如何运作的文档。Spec 存放在 `openspec/specs/`，按领域（domain）组织，由 requirement 和 scenario 构成。Spec 是关于"这个软件做什么"的、达成共识的答案。参见 [概念](concepts.md#specs)。

**Source of truth（事实来源）.** 整个 `openspec/specs/` 目录。它保存着你系统当前、已达成共识的行为。变更（change）提出对它的编辑；归档（archive）应用这些编辑。

**Change（变更）.** 一个工作单元，是 `openspec/changes/<name>/` 下的一个打包文件夹。变更包含了关于这项工作的所有内容：proposal、design、tasks，以及它引入的 spec 编辑。一个变更对应一个功能或修复。

**Artifact（制品）.** 变更内部的文档。标准制品是 proposal、delta spec、design、tasks。它们按依赖顺序创建，并相互衔接。

**Delta spec（增量规范）.** 变更内部的 spec，只描述正在变化的部分，使用 `ADDED`、`MODIFIED`、`REMOVED` 等小节，而不是重述整个 spec。这正是让 OpenSpec 能够干净地编辑既有系统的原因。参见 [概念](concepts.md#delta-specs)。

**Domain（领域）.** spec 的逻辑分组，例如 `auth/`、`payments/`、`ui/`。你可以选择与你思考系统的方式相匹配的领域。

## Spec 内部

**Requirement（需求）.** 系统必须具备的单一行为，通常用 RFC 2119 关键词书写："The system SHALL expire sessions after 30 minutes." 需求陈述*什么*，而非*如何*。

**Scenario（场景）.** 需求在运行中的具体、可测试示例，通常用 Given/When/Then 格式书写。场景让需求可被验证。

**Requirement 的 ADDED/MODIFIED/REMOVED 小节.** 增量规范如何记录变化的三种方式。

## 制品类型（spec-driven）

**Proposal（`proposal.md`）.** *为什么*、*什么*要变：意图、范围、高层方案。是你创建的第一个制品。

**Delta spec（增量规范，位于 `specs/` 目录下）.** spec 中的变化部分，用 `ADDED`/`MODIFIED`/`REMOVED` 小节表示。

**Design（`design.md`）.** *如何做*：技术方法、架构决策、你预计会触碰的文件。简单变更可省略。

**Tasks（`tasks.md`）.** 实现清单，带勾选框。AI 在 `/opsx:apply` 过程中逐步完成，并边做边勾掉。

## 生命周期

**Archive（归档）.** 结束一个变更的动作。delta spec 合并进主 specs，变更文件夹移动到 `openspec/changes/archive/YYYY-MM-DD-<name>/`。归档之后，specs 描述的就是新的现实。参见 [概念](concepts.md#archive)。

**Sync（同步）.** 将变更的 delta spec 合并进主 specs，而**不**归档变更。通常是自动的（归档时会提供该选项），但也可以作为 `/opsx:sync` 单独使用，用于长期运行的变更。参见 [命令](commands.md#opsxsync)。

## 工作流命令

**OPSX.** 当前标准的 OpenSpec 工作流，围绕流畅的动作而非僵化的阶段构建。所有 slash command 都以 `/opsx:` 开头。参见 [OPSX 工作流](opsx.md)。

**Slash command（斜杠命令）.** 你在 AI 助手的聊天框里输入的命令，例如 `/opsx:propose`。Slash command 驱动工作流，不是终端命令。参见 [命令如何工作](how-commands-work.md)。

**Explore（`/opsx:explore`）.** 思考伙伴式命令。它阅读代码库、比较方案、把模糊的想法澄清成具体计划，不产生任何制品也不写代码。当你有问题但还没有计划时，这是推荐的起点。参见 [先探索](explore.md)。

**CLI.** 你在终端运行的 `openspec` 程序。它用于搭建项目、列出并校验变更、打开仪表盘。

**Profile.** The set of slash commands installed in your project. **Core** (the default) is `propose`, `explore`, `apply`, `update`, `sync`, `archive`. The **expanded** set adds `new`, `continue`, `ff`, `verify`, `bulk-archive`, `onboard`. Change it with `openspec config profile`.

**Delivery（交付）.** OpenSpec 安装的是 skills、命令文件还是两者皆有。全局配置，由 `openspec-cn update` 应用。

## 自定义

**Schema.** 定义工作流中制品如何相互依赖。内置默认是 `spec-driven`（proposal → specs → design → tasks）。你可以派生它来写自己的。参见 [自定义](customization.md#custom-schemas)。

**Template（模板）.** schema 内部的一个 Markdown 文件，决定了 AI 生成给定制品的形态。编辑模板会立即改变 AI 的输出，无需重新构建。

**Project config（`openspec/config.yaml`）.** 按项目的设置：默认 schema、注入到每个规划请求的 `context:`、按制品划分的 `rules:`。这是教 OpenSpec 了解你的技术栈约定最简单的方式。参见 [自定义](customization.md#project-configuration)。

**Context injection（上下文注入）.** 把项目背景放进 `config.yaml` 的 `context:` 字段，从而自动添加到 AI 生成的制品中。这比指望 AI 去读一个单独的文件更可靠。

**Dependency graph（依赖图）.** 由制品的 `requires:` 关系构成的有向图。它是一个 DAG（有向无环图：箭头只向前指，绝不形成环），OpenSpec 用它来判断下一个可以创建什么。

**Enablers, not gates（赋能者而非关卡）.** 一个原则：制品依赖表明*下一个什么变得可能*，而非*下一个必须做什么*。你可以随时回头编辑任何制品。参见 [核心概念速览](overview.md#enablers-not-gates)。

## 跨仓库协调（beta）

这些术语只在规划跨越多个仓库时适用。它们处于 beta 阶段。大多数用户可以忽略。参见 [Stores 用户指南](stores-beta/user-guide.md)。

**Store.** 唯一职责就是做规划的独立仓库。它有着你已经熟悉的同一个 `openspec/` 形态（specs 和 changes）。详见 [Stores 用户指南](stores-beta/user-guide.md)。

**Reference（引用）.** 一个代码仓库声明它从某个 store 中"读取"规划上下文，而不移动任何工作。参见 [Stores 用户指南](stores-beta/user-guide.md)。

**Workset（工作集）.** 你显式创建、个人化、仅在本机的一组文件夹，一起打开（一个 store 加上你正在开发的代码仓库）。通过 `openspec-cn workset create` 显式创建；本地路径信息不会被提交到共享规划仓库。

## 另见

- [核心概念速览](overview.md)：五个想法，一页掌握
- [概念](concepts.md)：长篇解释
- [命令如何工作](how-commands-work.md)：slash command 与 CLI 的区别
