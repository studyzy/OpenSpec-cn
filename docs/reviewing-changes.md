# 审阅一个变更

OpenSpec 的全部承诺是：在任何代码写出来之前，你和你的 AI **就构建什么达成一致**。这个一致只有在你真正去读 AI 起草的内容时才有意义。本页讲的就是你做这件事的两分钟——该打开什么、按什么顺序、看什么。

赌注很简单：在一个段落长的 plan 里抓住一个错误方向几乎零成本；在 300 行代码里抓到同样的错误就不再是了。审阅就是你兑现这个赌注的地方。

## 你审阅的两个时刻

恰好有两个：

```
/opsx:propose ──► REVIEW THE PLAN ──► /opsx:apply ──► REVIEW THE CODE ──► /opsx:archive
                  (写代码前)                    (/opsx:verify)
```

1. **`/opsx:propose`（或 `/opsx:ff`）之后**，`/opsx:apply` 之前——在它还只是文字时读 plan。
2. **构建之后**，用 `/opsx:verify`——检查代码是否真的做了 plan 所说的事。

第一次审阅能帮你省最多，也是人们最容易跳过的。本页大部分篇幅都放在这里。

## 按这个顺序读

一个变更是 `openspec/changes/<name>/` 下的纯 Markdown 文件夹。按这个顺序读文件，能让你在出错时尽早退出：

```
openspec/changes/add-dark-mode/
├── proposal.md      1. 意图与范围   ← 如果这错了，到此为止
├── specs/…/spec.md  2. 需求       ← 审阅的核心
├── design.md        (仅较大的变更) — 技术方案
└── tasks.md         3. 工作计划
```

你不需要读每一行。你需要回答三个问题，每个文件一个。

## proposal：这是对的那个问题吗？

先打开 `proposal.md`。它捕获"为什么"和"做什么"——意图、范围、一两段话里的思路。

**好的样子：** 一个清晰的意图、一个你认得的范围、以及一个现在值得做的理由。

**危险信号：**

- 它解决了一个与你要求的*稍有不同*的问题。
- 范围膨胀了——你只要一个主题开关，proposal 却顺手也改了 auth "既然都在那儿了"。
- 它很模糊。"改进设置页"不是范围；"加一个尊重系统偏好的暗色模式开关"才是。

**要回答的问题：** *这和我实际要求的相符吗？有没有什么东西悄悄溜进来了？* 如果答案是不，停下来——别再往下读，改 proposal（见 [提出异议很便宜](#提出异议很便宜)）。

## spec 增量：对"完成"的定义正确吗？

这是审阅的核心。`specs/` 下的增量规范说明了变更交付时哪些东西会*为真*——以需求和证明它们的场景的形式：

```markdown
## ADDED Requirements

### Requirement: Dark Mode Toggle
The system SHALL let a user switch between light and dark themes.

#### Scenario: Respects the OS preference on first load
- GIVEN a user who has never set a theme
- WHEN they open the app on a device set to dark mode
- THEN the app renders in dark mode
```

**一个好的需求长什么样：** 一句清晰的、可以交给测试人员的 `SHALL`/`MUST` 陈述，以及至少一个其 GIVEN/WHEN/THEN 真正演练了该陈述的场景。

**危险信号：**

- **模糊的需求。** "系统 SHALL 要快"无法被构建或测试。多快算快？
- **没有场景的需求**，或者一个不测试它所隶属需求场景。
- **最有价值的发现：缺了什么。** AI 忠实地写下你*说的*。你的工作是注意到你*忘了*说的。如果你最在意的是系统偏好那个情况，却没有场景提到它，那正是审阅在自我回报。

读增量时问自己*如果系统精确地——且只——做了这些，我会满意吗？* 这里还没涉及代码，所以改起来仍然便宜。

## tasks：工作计划靠谱吗？

最后打开 `tasks.md`。它是 AI 会逐步执行实现的清单。

**好的样子：** 有序的步骤，每个都能追溯到某个需求，没有神秘的东西。

**危险信号：**

- 一个没有对应需求的任务（它从哪冒出来的？）。
- 一个巨大的"实现功能"任务，把所有真正的决策都藏起来了。
- 一个触及你刚批准的范围之外东西的任务。

你不是在这里估时或微观管理——你是在检查 plan 是否符合你已接受的需求。

## 提出异议很便宜

如果三个问题中任何一个答错了，说出来。没有阶段，也没有锁定的东西——你改掉它然后继续。两种方式，与 [编辑变更](editing-changes.md) 完全一样：

- **自己编辑文件。** 它是纯 Markdown；改范围那行、收紧一个需求、删一个任务。
- **告诉 AI 哪里错了** 让它改：*"去掉 auth 改动——超出范围，"* *"加一个用户已经选过主题时的场景，"* *"把任务 3 拆成 schema 和 UI。"*

然后重读你改的那部分。重新起草，直到它是一个你愿意署名的 plan。那种来回拉扯*就是*产品在起作用。

## 代码之后：验证

工作构建完成后，`/opsx:verify` 是你的第二次审阅。它重读制品和代码，并报告三个维度上的不一致：

| 维度 | 检查内容 |
|-----------|----------------|
| **完整性 (Completeness)** | 每个任务完成、每个需求实现、场景覆盖 |
| **正确性 (Correctness)** | 实现符合 spec 意图、边界情况已处理 |
| **连贯性 (Coherence)** | 设计决策确实体现在代码中 |

```
You: /opsx:verify

AI:  Verifying add-dark-mode...

     COMPLETENESS
     ✓ All 8 tasks in tasks.md are checked
     ✓ All requirements in specs have corresponding code
     ⚠ Scenario "Respects the OS preference on first load" has no test coverage
```

它把问题标记为 CRITICAL、WARNING 或 SUGGESTION，并且**不**阻塞归档——它只是暴露缺口，把决定权留给你。这就是"AI 写了代码"和"它构建了我们所同意的东西"的区别。

`/opsx:verify` 属于扩展 profile。如果你没有它，用 `openspec-cn config profile`（然后 `openspec-cn update`）开启，或者自己重读变更和 diff。

## 把审阅的规模调对

不是每个变更都值得完整过一遍。一个单文件的错别字修复值得花二十秒扫一眼。一个触及 auth、支付或无法恢复数据的变更，值得上面每一个问题都问一遍。重点从来不是仪式——而是在错误会很昂贵的地方花你的注意力，在不贵的地方略读。

## 两分钟清单

- [ ] proposal 的意图与我要求的相符。
- [ ] 没有多余的东西溜进范围。
- [ ] 每个需求都具体到可测试。
- [ ] 每个需求都有一个真正演练它的场景。
- [ ] 我最在意的那个情况被覆盖了。
- [ ] 任务映射到需求；没有神秘或超出范围的东西。
- [ ] 如果 AI 精确地构建了这些、不多不少，我会舒服。

如果七条都通过，放心运行 `/opsx:apply`。如果有任何一条没过，那不是挫折——那是那两分钟在发挥作用。

## 下一步去哪

- [编写优秀的 Specs](writing-specs.md) — 另一面：如何起草值得批准的需求和场景。
- [编辑与迭代变更](editing-changes.md) — 开始之后改 plan 的具体做法。
- [工作流](workflows.md) — 审阅在更大循环中的位置。
