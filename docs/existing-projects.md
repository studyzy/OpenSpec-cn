# 在已有项目中使用 OpenSpec

**你不需要为了开始而记录整个代码库。你只需为即将要改的部分写 specs。** 这是在已有项目上采用 OpenSpec 时最需要知道的一件事，也是 OpenSpec 以"棕地优先"（brownfield-first）为设计理念的原因。

常见的担忧听起来像这样："我的应用有 8 万行历史代码。我必须在 OpenSpec 有用之前为所有代码写 specs 吗？" 不。你讨厌那样，我们也是。OpenSpec 让你的 specs 一次一个变更地生长。你的第一个变更记录它触及的那一片，下一个变更记录它的那一片，几个月后你的 specs 会自然地填充到你所实际做的工作周围。

本指南展示如何在第一天就开始，而不必"煮沸整片海洋"。

## 三十秒版本

```bash
$ cd your-existing-project
$ openspec-cn init # 添加 openspec/ 和 AI 工具的命令
```

然后，在 AI 聊天中：

```text
/opsx:explore # 可选：让 AI 阅读你将要触及的区域
/opsx:propose <一个你真正需要的小变更>
/opsx:apply
/opsx:archive
```

你的 specs 现在精确描述了你变更所触及的那部分系统，仅此而已。这就对了。你不必再为其他 8 万行操心。

## 为什么增量优先是全部诀窍

OpenSpec 的变更以**增量（deltas）**形式书写：`ADDED`、`MODIFIED`、`REMOVED`。增量描述相对于当前行为改变了什么，而不是整个系统。

这正是棕地工作所需要的。你很少从零开始构建。你是在加一个字段、修一个重定向、收紧一个超时。增量让你精确指定一处变更，而不必先为它周围的一切写一份 40 页的 spec。

因此 `openspec/specs/` 目录并不是一开始就完整无缺的。它从几乎为空开始——随着你每次变更一个切片而生长。

## 从小处着手

挑一个真实的小东西。不是玩具，不是重写。是你这周本来就要做的变更。小的首个变更让你以低代价学习工作流。

**第 1 步：让 AI 阅读相关区域。** 这正是 `/opsx:explore` 在陌生或大型代码库上体现价值的地方。把它指向你将要触及的部分，让它在提出任何提案之前先梳理清楚运作方式。

```text
You: /opsx:explore

AI: What would you like to explore?

You: I need to add rate limiting to our public API, but I'm not sure
 how requests currently flow through the middleware.

AI: Let me trace it... [reads router, middleware stack, config]
 Requests hit Express, pass through auth middleware, then
 controllers. There's no rate-limiting layer today. The cleanest
 insertion point is middleware right after auth. Want me to scope it?
```

注意 AI 现在理解了真实结构，所以它写的 proposal 会贴合代码，而非通用模板。在大型代码库上，这一个习惯能省去最多痛苦。参见 [先探索](explore.md)。

**第 2 步：提案变更。** proposal 及其增量规范只捕获这个变更。

```text
You: /opsx:propose add-api-rate-limiting
```

**第 3 步：构建并归档** `/opsx:apply` 和 `/opsx:archive`，与任何变更一样。归档之后，你就有了一个真实的、关于限流行为的 spec，它来自你本来就需要做的那个变更。

## 更喜欢带解说的引导式游览？用 onboard

如果你宁愿在自己的代码上看着整个循环带着解说地发生，扩展命令 `/opsx:onboard` 正好做这件事：它扫描你的代码库找一个小的、安全的改进，然后引导你走完提案、构建、归档的全过程，逐步解释每一步。

先开启扩展命令：

```bash
$ openspec-cn config profile      # 选择扩展工作流
$ openspec-cn update              # 应用到本项目
```

然后在聊天中：

```text
/opsx:onboard
```

这是在真实项目上最温和的入门方式，它给你留下一个可以保留或丢弃的真实（小）变更。参见 [命令：`/opsx:onboard`](commands.md#opsxonboard)。

## "但我已经有需求文档了"

也许你有 PRD、SRS、正式 spec，甚至 TLA+ 模型。很好。你不需要整体导入它们，也不必扔掉它们。

把已有文档当作**探索的素材**，而不是要转换的 specs。当你启动一个变更时，把相关段落贴给 AI 或指向它，让它据此塑造一个聚焦的 OpenSpec 增量。增量以 OpenSpec 可测试的需求-场景形式捕获你当下正在改变的行为。你的原始文档留在原地作为背景。

原因在于：OpenSpec 的 specs 刻意是行为优先、范围受限的变更。40 页的 PRD 是不同的制品，干的是不同的活。强求一次性批量转换往往会产生庞大、过时而没人信任的 spec。让 specs 从真实变更中生长，才能保持它们准确。

```text
You: /opsx:explore
You: Here's a section of our PRD about checkout. I'm implementing
 the "guest checkout" requirement next.
 [paste relevant requirement]
AI: [reads it, asks clarifying questions, then helps scope the change]
You: /opsx:propose add-guest-checkout
```

## 在大型代码库中组织 specs

Specs 位于 `openspec/specs/` 下，按**领域（domain）**分组：一个符合你团队思考系统方式的逻辑区域。你不必一开始就设计完整的分类法。当某个领域的第一个变更需要它时，再创建领域文件夹。

切分领域的常见方式：

- **按功能区域：** `auth/`、`payments/`、`search/`
- **按组件：** `api/`、`frontend/`、`workers/`
- **按限界上下文：** `ordering/`、`fulfillment/`、`inventory/`

选一个让新人点头的方式。你可以稍后细化。参见 [概念：Specs](concepts.md#specs)。

## 单体仓库与跨仓库工作

对于单体仓库，最简单的模型是在仓库根目录放一个 `openspec/` 目录，领域映射到你的包或服务。这覆盖了大多数团队。

如果你的工作确实跨越**多个仓库**（或你当作独立对待的多个包），OpenSpec 有一个 beta 版 **stores** 功能：规划位于其自己独立的仓库中，你的任何代码仓库都可以引用，因此 plan 不必生活在某个仓库的 `openspec/` 文件夹里。它还是 beta，所以请将其命令和状态视为仍在演进。从 [Stores 用户指南](stores-beta/user-guide.md) 开始，了解心智模型和最小可用路径。

## 几点坦诚的提醒

- **抵制回填一切的冲动。** 为没有在改的代码写 specs 感觉有产出，但通常不是。那些 specs 会过时，因为没什么迫使它们跟踪现实。让真实变更驱动你的 specs。
- **保持早期变更小。** 你的前几个变更更多是关于学习节奏而非交付。紧的范围让循环更快、教训更便宜。
- **把 `openspec/` 提交到 git。** 你的 specs 和归档属于版本控制，与它们所描述的代码在一起。
- **给 AI 上下文。** 在具有强约定俗成的大型代码库上，填好 `openspec/config.yaml` 的 `context:`，让每个 proposal 都尊重你的技术栈和模式。参见 [定制化](customization.md#project-configuration)。

## 下一步去哪

- [先探索](explore.md) - 改动前理解代码的关键习惯
- [快速入门](getting-started.md) - 完整的首个变更演练
- [编辑与迭代变更](editing-changes.md) - 在学习过程中调整变更
- [概念：增量规范](concepts.md#delta-specs) - 为什么增量让棕地工作干净利落
- [定制化](customization.md) - 教会 OpenSpec 项目的约定
