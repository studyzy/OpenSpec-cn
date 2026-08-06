# 先探索

**`/opsx:explore` 是你的思考伙伴。每当你有问题却还没有计划时，就找它。** 它在创建任何一个制品或一行代码之前，调查你的代码库、与你权衡选项、并厘清你真正想要什么。当画面清晰时，它交接给 `/opsx:propose`。

如果说要从这些文档中取走一个习惯，就取这一个：**拿不准时，先探索，再提议。**

这背后的原因很重要。AI 编程助手很积极。你含糊地一问，它们就会自信地构建出*某种东西*，只是也许并非你所需的那个东西。Explore 就是解药。它是一场零负担的对话，你与 AI 一起弄清正确的举措，这样等到你提议时，提议的已是正确的东西。

## 何时探索

探索作为正确的第一步，出现的频率比人们预期的更高。当以下任一情况为真时，就使用它：

- 你知道*问题*但不知道*解法*。（"页面感觉很慢。""Auth 一团糟。""我们不断收到重复订单。"）
- 你在多种方案间做选择，并希望针对你的真实代码铺陈权衡。
- 你初来乍到一个代码库，需要在改动某物前先理解它如何运作。
- 需求模糊，你想在下定决心前把它磨利。
- 你怀疑工作比看上去更大或更小，并希望诚实地界定它的范畴。

只有当你已经确切知道想要什么、以及怎么做时，才跳过探索。那种情况下，直接去 [`/opsx:propose`](commands.md#opsxpropose)。

## 它做什么（以及不做什么）

Explore 是一场**对话**，而非生成器。

**它做：**
- 阅读并搜索你的代码库以回答真实问题。
- 比较选项并点明每个选项的权衡。
- 绘制图表以使设计清晰易懂。
- 帮你把一个模糊想法收窄为具体、可构建的范畴。
- 当你准备好时，过渡到 `/opsx:propose`。

**它不做：**
- 创建变更文件夹。
- 写入任何制品（没有 proposal、specs、design 或 tasks）。
- 写入或修改代码。

这正是重点所在。探索不花你任何代价，也不让你对任何东西做出承诺。你可以探索三个死胡同，从每个中都有所学，然后才提议那个幸存下来的路径。

## 它已安装

好消息：`/opsx:explore` 随默认的 **core** profile 提供，就在一旁与 `propose`、`apply`、`update`, `sync`、`archive` 并列。你无需启用任何东西。只要 OpenSpec 在项目里配置好，explore 就在你的 AI 聊天中就绪。（与所有 `/opsx:*` 命令一样，你把它输入助手的聊天框，而非终端。请参阅[命令如何运作](how-commands-work.md)。）

## 一个完整示例

看一个模糊的担忧如何变成一个清晰、可构建的变更。

```text
You: /opsx:explore

AI:  What would you like to explore?

You: Our checkout sometimes creates duplicate orders. I don't know why
     and I don't know how to fix it safely.

AI:  Let me dig into the checkout path...
     [reads the order service, the payment webhook handler, and the
      client submit logic]

     Here's what I found. There are two ways a duplicate can happen:

     1. The client can submit twice (double-click, retry on slow network).
        Nothing debounces it.
     2. The payment webhook can fire more than once, and the handler
        creates an order each time. There's no idempotency key.

     Cause #2 is the dangerous one: it can charge and fulfill twice.

     Three ways to fix it, roughly in order of robustness:
     - Idempotency key on the order-creation endpoint (handles both causes)
     - Dedup on the webhook by payment-intent id (handles #2 only)
     - Client-side debounce (handles #1 only, papers over the real bug)

     Given your code already stores the payment-intent id, the
     idempotency-key approach is a small change with the biggest payoff.
     Want me to scope that?

You: Yes, let's do the idempotency key.

You: /opsx:propose add-order-idempotency-key

AI:  Created openspec/changes/add-order-idempotency-key/, with a proposal
     and delta spec grounded in what we just found. Ready for implementation.
```

注意发生了什么。起点是"有东西出错了，而我不敢碰它"。二十秒的探索把这个变成了：一个有名字的根因、三个排好序的选项、一个贴合现有代码的建议，以及一个精确的变更。随之而来的 proposal 之所以犀利，是因为思考先行发生了。

## 交接给提议

Explore 不归档进任何东西。当你准备好时，你只需启动一个变更，AI 会把对话中的上下文带入制品。

```text
explore  ──►  propose  ──►  apply  ──►  archive
 (think)     (agree)       (build)     (record)
```

你可以用平实的语言说（"let's turn this into a change"），或直接运行 `/opsx:propose <name>`。无论哪种方式，你刚刚做的探索成为 proposal 的基础，而非被丢弃的聊天。

如果你使用扩展命令集，探索可以改为交接给 `/opsx:new`，进行逐步骤的制品创建。请参阅[工作流](workflows.md)。

## 一次好探索的诀窍

- **带来问题，而非解法。** "Logins feel slow" 给 AI 留出调查的空间。"Add a Redis cache" 则让你预先承诺了一个尚未检验过的答案。
- **大声要求权衡。** "每个选项的缺点是什么？"会换来更诚实的比较。
- **让它先读。** 最好的探索始于 AI 真正去看你的代码，而非猜测。如有帮助，把它的目光引向相关区域。
- **放弃也没关系。** 如果探索揭示这个想法不值得，那也是胜利。你以低廉的代价学到了它。
- **变更中途再探索。** 在 `/opsx:apply` 中卡住了？你可以退一步，探索一个子问题，然后回来。

## 诚实的权衡

**你得到什么：** 探索在任何制品诞生之前，以最廉价的代价拦下走错的方向。它在陌生代码中尤其强大——AI 读取并总结系统的能力，为你省下一下午的摸索。

**它花费什么：** 一点耐心。探索是一场对话，所以比甩出 `/opsx:propose` 然后碰运气要慢。对于你真正已经理解的工作，那额外的一步纯属开销，你应该跳过它。

经验法则：任务越模糊，探索回报越大。任务越清晰，你越能直接跳到提议。

## 下一步去哪

- [命令：`/opsx:explore`](commands.md#opsxexplore)：精确的参考
- [工作流](workflows.md)：作为日常循环一部分的探索
- [示例与配方](examples.md#recipe-3-exploring-before-you-commit)：在一个完整走查中的探索
- [快速上手](getting-started.md)：第一个变更指南，含探索
