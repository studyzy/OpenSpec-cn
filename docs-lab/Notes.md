# 起草笔记

这些是审查 docs-lab 中不同章节/文件时记下的笔记。我写下看到这些章节时的想法，以便根据这些反馈考虑如何更新文档。

## Start > Overview

这个副标题很糟糕：

> OpenSpec gives you and your coding agent a shared, reviewable plan before code is written.

在 plan mode 的时代这不是一个有力的价值主张，而且除此之外，我觉得它没有足够有力地推销 OpenSpec。

OpenSpec 其实不是关于单次会话的共享计划，而是关于让较大功能保持在轨道上并保持一致。

我们关注的是：
- 让它对团队可用
- 原生 git / 检入 VCS 的内容
- 预期行为与已实现行为一致
- 我们帮你捕获预期行为并将其与已实现行为对齐
- 这关乎正确性、一致性

控制论启发：

讲师们会拆解一个系统如何测量其当前状态、与期望目标比较，并调整其动作以缩小差距。

## Guides > Explore and idea

我认为这一节应该提到：

这关乎探索问题空间，弄清你关心哪些问题，并深入其中。

它的设计理念截然不同，是给你探索问题空间的自由，可以在不同的想法和章节间跳转。

它与该领域较新的其他入口（如 superpowers 或 matt pocock 的 skills）目的相似。

我们经常看到人们把 explore 和 ... 结合使用

这往往是 UX 和个人偏好的问题。没有唯一的最佳 skill 或方法能达到与你的 agent 对齐。

有些人喜欢与一个深思熟虑的设计伙伴交谈，另一些人可能更喜欢被提问，直到他们对问题有充分理解。

随时按你的需要定制 explore skill。

与文档无关：

我们如何为 PM 解决这个问题？
我们如何给他们一个好的归宿？——他们的任务是什么？
我们如何高效地帮他们完成？

- 他们基本上是在把它变成工单？

这周我们想把什么推过终点线？

- spec drift agent？
- 仪表盘？

- 弄清楚我们如何更好地利用 agent 会话和追踪

## 来自 docs-lab 起草过程（2026-08-19，project-config 页面）

产品问题，不是文档问题：本仓库中已安装的 skills 落后于当前模板。`.claude/skills/openspec-archive-change/SKILL.md` 完全没有 `openspec instructions` 调用，而 `src/core/templates/workflows/archive-change.ts:40` 指示了这一点；已安装的 apply skill 也没有提到它读取的 JSON 中的 `context`/`operationGuidance` 字段。因此配置注入能到达 CLI 输出，但过时的 skill 永远不会告诉 agent 去消费它。运行 `openspec update` 应该会刷新它们。

## 来自 docs-lab 起草过程（2026-08-19，schemas 页面）

验证 schema 系统时发现的产品问题（所有文件引用均为今日最新）：

- `schema init` 的下一步输出打印了一个以那种形式不存在的命令："Use with: openspec new --schema <name>"（schema.ts:999）；真实语法是 `openspec new change <name> --schema <name>`。
- `openspec new change` 的 spinner 打印的是硬编码的默认 schema，而不是解析后的那个（new-change.ts:118）："Creating change 'x' with schema 'spec-driven'..."，然后是 "Schema: lite"。
- `schema fork` 重新序列化 schema.yaml（字面量 `instruction: |` 变成折叠的 `>`，注释被丢弃），因此将 fork 与上游做 diff 会很吵（schema.ts:706-712）。
- 所有 `openspec schema` 子命令以及 `openspec schemas`/`templates` 都使用 process.cwd() 且不接受 --store；从子目录运行时它们静默地什么都看不到，与根目录解析的命令不同（schema.ts:383/485/634/768）。
- `suggestSchemas` 模糊"你是不是想找"辅助函数存在，但没有接入任何东西（project-config.ts:420）。

文档后续事项：社区 schema 目录只存在于遗留的 docs/customization.md（#community-schemas）；customize/schemas.md 在 GitHub 上链接到它。当旧 docs 目录退役时，该目录需要一个 docs-lab 归宿。
