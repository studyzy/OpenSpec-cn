# 示例与配方

真实的变更，从开始到结束。每个配方展示你会输入的命令以及你会看到的返回，这样你可以对照自己的情况套用模式直接复制。默认使用 **core** 命令（`propose`、`explore`、`apply`、`update`, `sync`、`archive`）；在扩展命令集更有帮助的地方会特别注明。

开始前的提醒：像 `/opsx:propose` 这样的 slash command 输入到你的 **AI 助手的聊天框**，`openspec` 命令输入到你的 **终端**。如果这是新概念，请先阅读 [How Commands Work](how-commands-work.md)。在下面的对话记录中，`You:` 和 `AI:` 是聊天内容，带 `$` 的行是终端命令。

> **还没确定要构建什么？** 大多数配方如果先从 `/opsx:explore` 开始想清楚会更好。[配方 3](#recipe-3-exploring-before-you-commit) 展示了它的实际用法，[Explore First](explore.md) 指南给出了完整论证。

## 配方 1：小功能，快速路径

**何时使用：** 你清楚想要什么，它是一个自包含的工作片段。这是最常见的配方。

整件事只需三个命令。提案、构建、归档。

```text
You: /opsx:propose add-logout-button

AI: Created openspec/changes/add-logout-button/
 ✓ proposal.md — 为什么做
 ✓ specs/ — 新的需求与场景
 ✓ design.md — 技术方案
 ✓ tasks.md — 实现清单
 Ready for implementation. Run /opsx:apply.
```

现在读一下 plan。打开 proposal 和增量规范。这正是 OpenSpec 被设计出来的时刻：在它还只是一段文字、而不是 400 行代码时，就抓住错误的假设。如果哪里不对，直接编辑任意制品，然后继续。

```text
You: /opsx:apply

AI:  Working through tasks...
     ✓ 1.1 Add logout button to header
     ✓ 1.2 Clear session on click
     ✓ 1.3 Add confirmation dialog
     All tasks complete!

You: /opsx:archive

AI:  Archiving add-logout-button...
     ✓ Merged specs into openspec/specs/auth/spec.md
     ✓ Moved to openspec/changes/archive/2026-06-22-add-logout-button/
     Done. Ready for the next change.
```

就这样。注销行为现在成了你 specs 的一部分，而这个变更带着完整上下文被归档了。

## 配方 2：缺陷修复

**何时使用：** 有东西坏了，你想让这次修复作为一次对行为的刻意变更被记录下来，而不是一个神秘提交。

缺陷修复与功能完全一样。区别在于你如何构建 proposal：描述*正确*的行为，而不只是"修复 bug"。

```text
You: /opsx:propose fix-login-redirect-loop

AI: Created openspec/changes/fix-login-redirect-loop/
 proposal captures current broken behavior
 and intended behavior. The delta spec MODIFIES the redirect
 requirement so it's now precise and testable.
 Ready for implementation.
```

因为修复落到 `MODIFIED` 需求上，并附带一个新场景，下一个人（或下一次 AI 会话）看到的不仅是你修了它，还有"正确"意味着什么。然后像往常一样 `/opsx:apply` 和 `/opsx:archive`。

提示：对于修复，用散文写一个很好的回归测试场景。"GIVEN 已登出的用户，WHEN 提交有效凭据，THEN 进入仪表盘而非再次被重定向。" 把它写出来，实现就有了清晰目标。

## 配方 3：提交前先探索

**何时使用：** 你有问题，但还没有计划。你不确定要构建什么，或者哪种方式才对。

从 `/opsx:explore` 开始。它是一个没有结构束缚、不会创建制品的思考伙伴。它阅读代码库，帮你做决定。

```text
You: /opsx:explore

AI: What would you like to explore?

You: Page loads feel slow but I don't know where the time goes.

AI: Let me look... I found three likely culprits:
 1. Large unoptimized images on product list
 2. Synchronous data fetching blocks render
 3. Re-renders from context changes
```

（探索会带着上下文继续推进。）

## 配方 4：同时处理两个变更

**何时使用：** 你正处于某个功能中途，一个紧急修复插了进来。

变更是彼此独立的文件夹，并行工作不会冲突。先启动修复、交付它，然后回到功能，从你离开的地方继续。

```text
You: I'm partway through add-dark-mode, but I need to fix a login bug now.

You: /opsx:propose fix-login-redirect

AI: Created openspec/changes/fix-login-redirect/. Ready for implementation.

You: /opsx:apply

AI: Implemented fix. All tasks complete.

You: /opsx:archive

AI: ✓ Archived fix-login-redirect.

You: Back to dark mode.

You: /opsx:apply add-dark-mode

AI: Resuming add-dark-mode. Picking up at task 2.3: Update Header...
```

在 `/opsx:apply add-dark-mode` 中命名变更，是指引 AI 指向特定变更（当有多个活跃变更时）的方式。因为任务完成度记录在 `tasks.md` 中，AI 确切知道你停在了哪里。

当多个变更同时完成时，扩展命令 `/opsx:bulk-archive` 会一起归档它们，并通过检查实际已实现的内容来解决 spec 冲突。参见 [Workflows](workflows.md#parallel-changes)。

## 配方 5：无行为变更的重构

**何时使用：** 你正在重组代码，而对外可见的行为应当保持不变。

这是个有趣的案例，因为纯重构*没有什么要添加到你的 specs*。行为契约不会变，变的只是实现。所以工作落在 design 和 tasks 里，spec 增量是空的或不存在。

```text
You: /opsx:propose refactor-payment-module

AI:  Created the change. The proposal states the goal (split the
     payment module, no behavior change) and the design captures
     the new structure. No spec changes, since behavior is identical.
     Ready for implementation.
```

Declare the empty delta explicitly by setting `skip_specs: true` in the change's `.openspec.yaml`:

```yaml
schema: spec-driven
skip_specs: true
```

Without the marker, `openspec validate` rejects a change with zero deltas (so a forgotten specs phase still gets caught); with it, validation passes and `openspec status` shows the specs stage as explicitly skipped rather than pending. If the refactor turns out to change behavior after all, remove `skip_specs` from `.openspec.yaml` and write the delta specs — validate treats the marker plus spec files as a conflict, so the stale marker can't linger silently.

Archiving a marked change needs no extra flags (there are no deltas to merge). Independently, the `--skip-specs` flag tells the terminal command to skip the spec step explicitly:

```bash
$ openspec-cn archive refactor-payment-module --skip-specs
```

同样的标志对工具链、CI 和纯文档变更也很方便。原则是：specs 描述行为，所以如果行为没变，spec 也不该变。参见 [Concepts](concepts.md#what-a-spec-is-and-is-not)。

## 配方 6：逐步控制（扩展命令）

**何时使用：** 复杂或有风险的变更，你想在继续之前先审阅每个制品。

核心的 `/opsx:propose` 一次性起草所有内容。当你想一次走一步时，开启扩展命令：

```bash
$ openspec-cn config profile      # 选择扩展工作流
$ openspec-cn update              # 应用到本项目
```

现在你可以增量地搭建和构建：

```text
You: /opsx:new add-2fa

AI:  Created openspec/changes/add-2fa/. Ready to create: proposal.

You: /opsx:continue

AI:  Created proposal.md. Now available: specs, design.

You: /opsx:continue

AI:  Created specs/auth/spec.md. Now available: design.
```

每个制品落地时审阅它，随意编辑，满意后再继续。当你想一次性起草剩余内容时，`/opsx:ff` 会快进通过剩余的规划制品。归档前，`/opsx:verify` 检查实现是否真的符合 specs。参见 [Workflows](workflows.md#opsxff-vs-opsxcontinue)。

## 配方 7：动手学习整个循环

**何时使用：** 你已经安装了 OpenSpec，想在*自己的*代码上感受工作流，而不是玩具示例。

开启扩展命令（见配方 6），然后：

```text
You: /opsx:onboard

AI:  Welcome to OpenSpec! I'll walk you through a complete change
     using your actual codebase. Let me scan for a small, safe
     improvement we can make together...
```

`/opsx:onboard` 会找到一个真实（且小）的改进，为它创建一个变更，实现它并归档它，逐步讲解每一步。它耗时 15 到 30 分钟，最后给你留下一个可以保留或丢弃的真实变更。这是最温和的学习方式。参见 [Commands](commands.md#opsxonboard)。

## 从终端检查你的工作

任何时候，你都可以在终端检查事物的状态：

```bash
$ openspec-cn list                      # 活跃变更
$ openspec-cn show add-dark-mode        # 查看单个变更详情
$ openspec-cn validate add-dark-mode    # 检查结构
$ openspec-cn view                      # 交互式仪表盘
```

这些是只读和检查工具。提案与构建仍通过聊天中的 slash command 进行。完整详情见 [CLI reference](cli.md)。

## 下一步去哪

- [Explore First](explore.md)：不确定时推荐的起步方式
- [Workflows](workflows.md)：上述模式，以及何时使用每种模式的决策指引
- [Commands](commands.md)：每个 slash command 的详细用法
- [Getting Started](getting-started.md)：规范的首个变更演练
- [Concepts](concepts.md)：为什么各部分以这种方式组合在一起
