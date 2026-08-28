# 技能

> 每个 OpenSpec 技能：参数、它创建什么，以及它回复什么。

<!-- Drafted 2026-08-11 via one subagent per entry, each verifying every claim against
its workflow template in src/core/templates/workflows/; assembled and uniformity-passed
by the main session. Terminology: "change proposal", never bare "change" (user call,
2026-08-11). Shape (user-reviewed): intro bullets define Core/Optional, then ONE index
table (Skill / Job / Type) and a flat run of H2 entries matching
cli.md's shape - no group sections. Recipe per entry: one-line job sentence, then a
two-column key-value table (header row "Contract | Description", uniform across
entries) holding the pure input/output contract,
one row per fact: Arguments (what you pass; each cell self-contains its
optional/ambiguous behavior) / Creates (exact paths written; always states the code
boundary) / Response (what the agent reports back and where it stops). No judgment
rows: no when-to-use beyond the job sentence, no Not-for routing, no guide links
(guides link here, not the reverse). The ff job says "create a change proposal"
because its template unconditionally scaffolds a new one (redirects if the name
exists), contradicting the old "remaining artifacts" framing. Paths shown are the
default single-repo layout, stated without a caveat: reference pages state defaults,
and the store-moves-the-planning-home fact is multi-repo/stores.md's to teach (the
per-tool command spelling story likewise stays with setup.md and supported-tools.md;
user cut the NOTE carrying both, 2026-08-11). H2 entries double as the site's
right-rail TOC and the anchors guides deep-link. No frontmatter in source: sync-docs.mjs lifts H1 to title and the > line to
description (README pins the > line verbatim in its page index). Deliberately
excluded, each with an owner elsewhere: per-tool command spellings and syntax
(reference/supported-tools.md), example transcripts (quickstart and guides), tips and
when-to-use judgment (guides own it), troubleshooting (help/troubleshooting.md),
legacy /openspec:* commands (help/legacy/migration.md). Source: old docs/commands.md
maps here per sources.md; its unsupported claims (apply "runs tests", bulk-archive
name arguments, fixed tasks.md filename) were checked against templates and dropped.
Skill names from WORKFLOW_TO_SKILL_DIR (src/core/profile-sync-drift.ts) and the
templates in src/core/templates/workflows/; core set src/core/profiles.ts:14. "Optional"
is the docs' set label (was "Expanded"; renamed 2026-08-12: the product's only stored
profile values are core and custom, so "expanded" reads as a third profile). -->

这些技能分为两组：

- **Core**：默认安装，是主要的规划循环。
- **Optional**：只有当你通过 [Profiles](../customize/profiles.md) 添加时才安装。

| Skill | 职责 | 类型 |
|---|---|---|
| [openspec-explore](#openspec-explore) | 在想法变成变更提案之前，先把它想清楚 | Core |
| [openspec-propose](#openspec-propose) | 一步创建带有全部规划制品的变更提案 | Core |
| [openspec-apply-change](#openspec-apply-change) | 实现变更提案的任务 | Core |
| [openspec-update-change](#openspec-update-change) | 修订变更提案的计划 | Core |
| [openspec-sync-specs](#openspec-sync-specs) | 把变更提案的 spec 更新合并进 `specs/` | Core |
| [openspec-archive-change](#openspec-archive-change) | 把已完成的变更提案移入归档 | Core |
| [openspec-new-change](#openspec-new-change) | 以空脚手架开始一个变更提案 | Optional |
| [openspec-continue-change](#openspec-continue-change) | 逐个创建下一个规划制品 | Optional |
| [openspec-ff-change](#openspec-ff-change) | 一次通过，创建带实现所需的每个制品的变更提案 | Optional |
| [openspec-verify-change](#openspec-verify-change) | 检查实现是否符合计划 | Optional |
| [openspec-bulk-archive-change](#openspec-bulk-archive-change) | 一次归档多个变更提案 | Optional |
| [openspec-onboard](#openspec-onboard) | 通过完整走完一个真实变更提案来学习工作流 | Optional |

## openspec-explore

在想法变成变更提案之前，先把它想清楚。

| 契约 | 说明 |
|---|---|
| **Arguments** | 一个主题：一个想法、一个问题、一个比较，或要在上下文中探索的现有变更提案的名称。什么都不给则进入探索模式。 |
| **Creates** | 默认不创建任何内容。只读取和调查。应请求时会捕捉洞察：在 `openspec/changes/<name>/` 下新建变更提案，或更新现有提案的 proposal、design、specs 或 tasks。绝不写代码。 |
| **Response** | 一段开放的对话，没有必需输出。当思考成形时，它会总结问题、方法、未决问题和下一步，并提供捕捉它们的选项。由你决定。这里绝不会开始实现。 |

## openspec-propose

一步创建变更提案并生成其全部规划制品。

| 契约 | 说明 |
|---|---|
| **Arguments** | 一个 kebab-case 名称（`add-dark-mode`）或一段简单描述。两者都不给时会询问。 |
| **Creates** | `openspec/changes/<name>/`，包含 schema 定义的每个制品，按依赖顺序（spec-driven：proposal、spec 增量、design、tasks）。绝不写代码。 |
| **Response** | 已创建的制品，可供评审，以及下一步。到此为止；实现等待 `openspec-apply-change`。 |

## openspec-apply-change

实现变更提案的任务，逐项推进直到完成或受阻。

| 契约 | 说明 |
|---|---|
| **Arguments** | 变更提案名称（`add-auth`），可选。如果目标不明确，它会列出活跃的变更提案并请你选择。 |
| **Creates** | 代码：每个任务所要求的最小改动，写入你的项目文件。在变更提案中只碰 tasks 文件，逐个勾选完成的任务（`- [ ]` 改为 `- [x]`）。 |
| **Response** | 每个任务的进度，然后是总体计数（N/M 个任务完成）。全部完成：建议 `openspec-archive-change`。因缺失制品而受阻：指向 `openspec-continue-change`。任务不清晰或出错：暂停并询问。 |

## openspec-update-change

修订变更提案现有的规划制品，并让它们彼此保持一致。

| 契约 | 说明 |
|---|---|
| **Arguments** | 变更提案名称，可选，外加你想要的修订。未说明修订时，它会做一致性评审：检查制品之间是否存在矛盾、缺口和重复。 |
| **Creates** | 不创建任何新内容。只编辑已存在的制品文件。缺失的制品是 `openspec-continue-change` 的职责。绝不写代码。 |
| **Response** | 展示每个建议的修订，并只在你确认后写入，一次一个制品。最后说明修订了什么和下一步；实现等待 `openspec-apply-change`。 |

## openspec-sync-specs

把变更提案的 spec 更新合并进 `specs/`，而不归档它。

| 契约 | 说明 |
|---|---|
| **Arguments** | 变更提案名称，可选。你也可以指定其中一部分增量规范（delta specs），只有它们会同步。 |
| **Creates** | 为每个增量规范（delta spec）编辑或创建 `openspec/specs/<capability-path>/spec.md`，把新增、修改、删除和重命名的需求合并进主 spec。绝不写代码。 |
| **Response** | 更新后的 specs 校验通过后，给出每个能力的需求新增、修改、删除或重命名的摘要。变更提案保持活跃；归档等待 `openspec-archive-change`。 |

## openspec-archive-change

把已完成的变更提案移入归档。

| 契约 | 说明 |
|---|---|
| **Arguments** | 变更提案名称，可选。 |
| **Creates** | 把变更提案目录移到 `openspec/changes/archive/YYYY-MM-DD-<name>/`（名称已以日期开头则不添加）。经你同意后，它会先通过 `openspec-sync-specs` 同步未完成的增量规范（delta specs）。绝不写代码。 |
| **Response** | 制品或任务不完整时会警告并询问是否归档，存在增量规范（delta specs）时会询问是否同步。最后给出摘要：名称、schema、归档位置、spec 同步状态，以及任何警告。 |

## openspec-new-change

以空脚手架开始一个变更提案。

| 契约 | 说明 |
|---|---|
| **Arguments** | 一个 kebab-case 名称（`add-user-auth`）或一段简单描述，只有非默认工作流才需要 schema 名称。两者都不给时会询问你想构建什么。 |
| **Creates** | `openspec/changes/<name>/` 作为空脚手架：还没有任何制品，绝不写代码。 |
| **Response** | 脚手架的名称和位置、工作流的制品顺序、状态（0/N 完成），以及第一个制品的模板。起草制品等待 `openspec-continue-change`。 |

## openspec-continue-change

在变更提案中逐个创建下一个规划制品。

| 契约 | 说明 |
|---|---|
| **Arguments** | 变更提案名称，可选。如果仍然不明确，它会请你从最近修改的中选择。 |
| **Creates** | schema 顺序中下一个已就绪的制品，写入变更提案目录。每次运行一个制品，绝不写代码。 |
| **Response** | 已创建的制品、进度（N/M 完成），以及它解锁了哪些制品。规划完成时会说明；实现进入 `openspec-apply-change`。 |

## openspec-ff-change

一次通过，创建变更提案和实现所需的每个规划制品。

| 契约 | 说明 |
|---|---|
| **Arguments** | 一个 kebab-case 名称或一段简单描述。两者都不给时会询问。如果同名变更提案已存在，它会建议改为继续它。 |
| **Creates** | `openspec/changes/<name>/` 以及实现所需的每个规划制品，按依赖顺序（spec-driven：proposal、specs、design、tasks），只省略被标记为跳过或有条件的制品。绝不写代码。 |
| **Response** | 变更提案的名称和位置、创建的每个制品，以及任何被跳过的有条件制品及其原因。到此为止；实现等待 `openspec-apply-change`。 |

## openspec-verify-change

检查实现是否符合变更提案的制品。

| 契约 | 说明 |
|---|---|
| **Arguments** | 变更提案名称，可选。不明确时会询问，列出拥有 tasks 制品的变更提案。 |
| **Creates** | 不创建任何内容。它只读取变更提案的制品和代码库。验证只出报告。 |
| **Response** | 一份报告：针对完整性、正确性和一致性给出评分卡，然后是 CRITICAL、WARNING 和 SUGGESTION 级别的问题及建议，最后是归档就绪度评估。它不改变任何内容，也不会归档。 |

## openspec-bulk-archive-change

一次归档多个变更提案。

| 契约 | 说明 |
|---|---|
| **Arguments** | 无。它会列出活跃的变更提案并请你选择任意数量，附带"全部"选项。如果没有活跃的变更提案，它会说明并停止。 |
| **Creates** | 每个归档的变更提案对应 `openspec/changes/archive/YYYY-MM-DD-<name>/`（已带日期的名称保留其前缀）。每个提案的 spec 增量会先通过 `openspec-sync-specs` 同步。绝不写代码。 |
| **Response** | 每个变更提案的状态表，以及整个批次的确认，然后是归档、跳过和失败的摘要，外加 spec 同步结果。当两个变更提案触及同一个 spec 时，它会检查代码库，并按从旧到新的顺序同步已实现的增量。 |

## openspec-onboard

通过完整走完一个真实变更提案来学习工作流。

| 契约 | 说明 |
|---|---|
| **Arguments** | 无。它会扫描你的代码库寻找小型的入门任务，并请你选择一个或描述你自己的。 |
| **Creates** | 为所选任务创建一个真实的变更提案，一次一个制品，然后在你确认实现后编写真实代码。最后归档该变更提案。 |
| **Response** | 对完整循环的引导式讲解，并在需要你输入处暂停：explore、create、构建每个制品、implement、archive。最后是回顾和指向 `openspec-propose` 的提示。大约需要 15 到 20 分钟。 |
