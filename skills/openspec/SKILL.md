---
name: openspec
description: 任何 OpenSpec 工作的起点。当用户提出 OpenSpec 相关请求却没有点名某个 skill、不确定在 OpenSpec 里该怎么做、询问某个变更的进展或下一步、或一次要求多个 OpenSpec 步骤时使用。用户只说 "openspec" 且没有更具体的 OpenSpec skill 匹配时也使用。
allowed-tools: Bash(openspec-cn:*)
license: MIT
compatibility: 需要 openspec-cn CLI。
metadata:
  author: openspec
  version: "1.0"
  references: "be5475cc5662"
---

OpenSpec 帮助人与编程 Agent 就软件该做什么达成一致，并在代码变化后保持这份共识为真。每个变更都规划为对 specs 的一次更新，在写代码前经过评审，构建完成后再合并进 specs。

你是本项目中一切 OpenSpec 工作的起点。先弄清用户需要什么，然后做三件事之一：回答他的问题、把请求交给负责该工作的 skill、或按顺序运行多个 skill。

**OpenSpec 如何组织**

- `openspec/specs/` 记录系统当下的行为。
- `openspec/changes/<name>/` 存放一个计划中的变更：proposal、spec 更新、design 和 tasks。
- 一个变更通常经历：探索（可选）、提案、实施、验证（可选）、归档。归档会更新 specs，并把变更移到 `openspec/changes/archive/`。

**当用户不确定时**

如果他问进展如何或下一步做什么，读取 `references/where-things-stand.md` 并按它操作。

如果他问 OpenSpec 如何工作或如何配置某项内容，读取 `references/answers.md` 并据此回答。

**挑选 skill**

当用户要求做事时，找到匹配的那一行，然后使用对应的 skill 并按它的步骤操作。

| 用户想要 | 使用 |
|---|---|
| 在决定构建什么之前，把一个想法或问题想清楚 | `openspec-explore` |
| 描述要构建什么，并一次拿到完整计划：proposal、specs、design、tasks | `openspec-propose` |
| 启动一个变更，逐个制品撰写计划 | `openspec-new-change` |
| 撰写变更的下一个制品 | `openspec-continue-change` |
| 一次写完所有剩余制品 | `openspec-ff-change` |
| 修订已有变更的计划 | `openspec-update-change` |
| 实施变更的任务 | `openspec-apply-change` |
| 归档前把代码与变更逐项核对 | `openspec-verify-change` |
| 从变更更新主 specs，同时保持变更开启 | `openspec-sync-specs` |
| 完成变更并归档 | `openspec-archive-change` |
| 一次归档多个已完成的变更 | `openspec-bulk-archive-change` |
| 在引导下完整走一遍 OpenSpec | `openspec-onboard` |

- 如果一个请求可能对应多行，就点名这些选项，问用户要哪一个。
- 如果该行对应的 skill 未安装，说明情况，然后读取 `references/without-skills.md` 并按对应小节操作。告诉用户可以用 `openspec-cn config profile` 安装它，再运行 `openspec-cn update`。

**一次做多步**

如果请求包含多行，例如"验证这个变更，然后归档它"，就按顺序、一次一个 skill 地完成。完成一个再开始下一个。每个 skill 自己的规则仍然适用：当某个 skill 要求停下等待用户时，就停在那里并说明接下来是什么。

**如果本项目尚未使用 OpenSpec**

如果你是自己选中了这个 skill，而 `openspec-cn list --json` 报告 `"root": null`，就先放下 OpenSpec，正常回答请求。如果用户明确要求 OpenSpec，则提议用 `openspec-cn init` 来初始化。
