# 编辑与迭代变更

**变更中的每个制品都只是你可以随时编辑的 Markdown 文件。** 没有锁定的"规划阶段"，没有审批关卡，没有需要进入的特殊编辑模式。想在已经开始构建后改 proposal？打开 `proposal.md` 改它。实现到一半发现 design 错了？修 `design.md` 继续。这就是完整的答案，而且这是有意为之。

本页面向的是你想到"等等，我能回头改那个吗？"的时刻。能。下面按常见情况分别说明怎么做。

## 编辑任何东西的两种方式

你始终有两种选择：

1. **直接编辑文件。** 制品是位于 `openspec/changes/<name>/` 下的纯 Markdown。在你的编辑器中打开 `proposal.md`、`design.md`、`tasks.md`，或 `specs/` 下的增量规范去改它。不需要其他操作。
2. **让 AI 帮你改。** 在聊天中直接说你想要什么："更新 proposal，去掉缓存想法，加一节限流"，或者"design 应该用队列，而不是轮询。" AI 会利用变更其余部分的上下文来编辑制品。

哪个适合当时就用哪个。小修文字？编辑文件。实质性重想？让 AI 带着完整上下文来改。

## "我已经开始后，如何更新 proposal（或 specs）？"

直接更新它。同一个变更，更精炼。

如果你在使用扩展命令，自然流程是：编辑制品，然后运行 `/opsx:continue` 从新状态继续，或者 `/opsx:apply` 对照更新后的 plan 继续实现。如果你在使用默认 `core` 命令，编辑制品并运行 `/opsx:apply`；它会读取当前文件，因此会对照制品现在所说的内容来构建。

心智模型：制品是活的 plan，而不是签了字不能动的合同。AI 始终基于它们的当前内容工作，所以编辑它们就是在引导工作。

```text
You: I want to change the approach in this change.

You: [edit design.md, or tell the AI:]
     Update design.md to use a background job instead of a synchronous call.

AI:  Updated design.md. The task list still fits; want me to continue applying?

You: /opsx:apply
```

这回答了非常常见的问题：没有单独的"更新 proposal"命令，因为你不需要一个。文件就是事实来源，编辑它（手动或通过 AI）就是更新。

## "实现后如何回头审阅？"

你不是"回头"，你从未离开。工作流是流动的：审阅、编辑、实现不是把你困在里面的顺序阶段。

具体来说，在 `/opsx:apply` 工作之后：

- 想重新审视 plan？打开制品阅读它们，或在终端运行 `openspec-cn show <change>` 获取整合视图。
- 发现要改的东西？编辑制品（或让 AI 改），然后继续。
- 想要结构化的检查，确认代码符合 plan？运行 `/opsx:verify`（扩展命令）。它报告完整性、正确性、连贯性，而不阻塞任何东西。参见 [工作流：Verify](workflows.md#verify-check-your-work)。

没有"审阅阶段"可以回去，审阅是你可以在任何时刻做的事，包括实现过程中。

## "我手动改了代码。如何调和 OpenSpec？"

这经常发生，没关系。你在编辑器里调整了什么，现在代码和制品不一致了。让它们按事实正确的方向重新同步：

- **代码现在是对的，spec 过时了。** 更新增量规范（以及相关的 tasks）以描述实际交付的行为。在归档之前，spec 应该符合现实，因为归档会把 spec 合并进事实来源。
- **spec 是对的，代码跑偏了。** 继续构建，修正代码以符合 spec。

一个快速暴露不一致的方式是 `/opsx:verify`：让 specs 如实反映代码做了什么。手动编辑受欢迎；只是别让它们悄悄地与 spec 脱节。

## 精炼你不满意的 proposal

如果生成的 proposal 没说到点子上，你有三个好办法：

- **就地迭代。** 告诉 AI 哪里不对（"范围太宽，去掉管理功能"）让它改。这最便宜通常也最对。
- **先探索，再重新提案。** 如果问题出在想法本身不清晰，退一步到 `/opsx:explore`，想清楚，让更锐利的 proposal 从中浮现。参见 [先探索](explore.md)。
- **重新开始。** 如果意图根本变了，开新变更可能比给旧的打补丁更清晰。

最后那招有它自己的决策指南，见下一段。

## 何时更新 vs. 开新变更

简短版：**当它是同一件工作被精炼时更新；当意图根本改变、范围爆炸成不同工作时开新变更。**

- 目标相同，只是方式更好？更新。
- 范围收窄（现在先交付 MVP，更多后续再做）？更新，然后归档，再开新变更做第二阶段。
- 问题本身变了（"加暗色模式"变成了"构建完整主题系统"）？新变更。

完整的流程图和工作示例见 [工作流：何时更新 vs 重新开始](workflows.md#when-to-update-vs-start-fresh)，更深入的论述见 [OPSX：何时更新 vs 重新开始](opsx.md#when-to-update-vs-start-fresh)。

## 关于 tasks 的注意点

`tasks.md` 是活的清单，不是冻结的 plan。你实现时，可以添加你发现的新任务、删掉结果证明不必要的任务，或重新排序它们。AI 在 `/opsx:apply` 期间会勾掉已完成的项，如果你稍后回来，会从第一个未勾选的任务继续。编辑 `/opsx:continue`、`/opsx:apply` 和 `/opsx:verify` 的详情见 [命令](commands.md)。

## 下一步去哪

- [工作流](workflows.md) - 更大循环中的模式与决策
- [审查变更](reviewing-changes.md) - 构建前对草案的两分钟检查
- [命令](commands.md) - `/opsx:continue`、`/opsx:apply`、`/opsx:verify` 的详细说明
- [概念：制品](concepts.md#artifacts) - 制品详解
