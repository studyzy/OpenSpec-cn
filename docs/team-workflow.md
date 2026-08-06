# 团队中使用 OpenSpec

其他指南里的一切无论在单人还是二十人团队中都一样工作。团队中变化的是边缘处的问题：specs 放在哪、队友如何审阅 plan、这一切如何融入我们已有的 pull-request 流程？

简短答案：一个变更只是文件，而 OpenSpec 从不碰 git。所以它适配你已有的工作流，而不是替换它。本页说明行之有效的约定。

## 一条规则：OpenSpec 不碰 git

OpenSpec 在 `openspec/` 下读写纯 Markdown。它从不在你的项目里提交、分支、推送或拉取——它也从不自行克隆或同步 [store](stores-beta/user-guide.md)。这意味着：

- **你像提交任何源代码一样提交 `openspec/`。** specs、活跃变更和归档都是你项目历史的一部分。（是的，提交整个文件夹——见 [FAQ](faq.md#should-i-commit-the-openspec-folder-to-git)。）
- **一个变更是你像代码一样版本化的文件夹。** `openspec/changes/add-dark-mode/` 只是分支上的一些文件。
- **下面一切都是约定，而非强制。** OpenSpec 不会逼你这么做；它只是恰好干净地契合。

## 日常循环

行之有效的工作流把一个变更映射到一条分支和一个 pull request：

```
git switch -c add-dark-mode       像往常一样开一条分支
   │
/opsx:propose add-dark-mode       起草 plan（proposal + specs + tasks）
   │
REVIEW THE PLAN                   写任何代码之前你先读它 — 见《审查变更》
   │
/opsx:apply                       构建它；制品与代码一起变化
   │
git commit && open a PR            PR 同时包含 spec 增量和代码
   │
teammate reviews, merges           队友审阅并合并
   │
/opsx:archive                     把增量并入 specs/，把变更移到 archive/
```

plan 和代码并肩待在同一条分支里，所以你的队友一起审阅两者，六个月后归档的 spec 仍解释着代码为什么长那样。

## 在 pull request 中审阅 specs

这正是团队感受到回报的地方。当 PR 包含了变更的增量规范，审阅者得到了原始 diff 永远给不了的东西：**一句关于这个变更应该做什么的平白陈述**，在他们读任何一行代码之前。

审阅者的一个好顺序：

1. **读 `proposal.md`** —— 这是对的问题和范围吗？
2. **读 `specs/` 下的增量** —— "完成"定义正确吗？（这就是 [审查变更](reviewing-changes.md) 的两分钟检查，现在发生在 PR 里。）
3. **然后读代码 diff** —— 它是否精确地交付了那些需求？

一个对*方法*有不同意见的审阅者，可以针对 proposal 低成本地说出来，而不是在 300 行代码里重新争论。把增量规范放在 PR 描述顶部附近，或指向审阅者看变更文件夹，让他们从这里开始。

## 何时归档

归档把一个变更的增量并入你主线的 `openspec/specs/`，并把变更文件夹移到 `openspec/changes/archive/YYYY-MM-DD-<name>/`。因为 `specs/` 是**共享的事实来源**，在团队中时机很重要。两种可行的约定：

- **PR 合并后归档（推荐）。** 分支带着活跃变更；一旦合并到你的主分支，就在那儿归档（通常是一个很小的后续提交或一次计划清理）。这让共享的 `specs/` 只随真正交付的工作前进。
- **在 PR 内归档。** 对小团队更简单：添加代码的同一个 PR 也同步并归档。权衡是你的 `specs/` diff 和代码 diff 一起落地，可能让 PR 更吵。

选一种并保持一致。无论哪种，`/opsx:archive` 都会检查任务是否完成并先提供同步选项，所以不会意外合并半成品。

## 两个人，并行变更

因为变更是独立的文件夹，它们不会撞车：

- **不同的变更，不同的人——没问题。** `add-dark-mode` 和 `rate-limit-login` 是不同分支上不同的文件夹；在两者都归档之前从不相碰。
- **一个变更，一个负责人。** 两个人编辑同一个变更文件夹，冲突方式就像两个人编辑同一个文件。让一个变更只属于一个作者，或者把它拆成两个变更（这也是 [合理控制规模](writing-specs.md#right-size-the-change) 的另一个理由）。
- **唯一会出现冲突的地方是 `specs/`。** 如果两个变更都修改了*同一个*需求，归档第二个时会在 `openspec/specs/…/spec.md` 处冲突——像任何合并冲突一样解决它，保留反映现实的需求。这很少见，而且这正是一个特性：它让 git 告诉你两个变更对系统应该如何行为有分歧。

## 当规划超出一个仓库

上面一切都假设 plan 活在代码仓库自己的 `openspec/` 文件夹里，这是对的默认。当你的规划确实跨越多个仓库或团队——一个功能触及三个服务，或者一个团队拥有、其他团队消费的需求——那就是 beta 版 **stores** 功能的用武之地：规划有了自己的仓库，任何代码仓库都可以指向它。从 [Stores 用户指南](stores-beta/user-guide.md) 开始。

## 下一步去哪

- [审查变更](reviewing-changes.md) — 审阅过程，现在发生在你的 PR 里。
- [编写优秀的 Specs](writing-specs.md) — 包括如何合理控制变更规模以适配一条分支。
- [Stores 用户指南](stores-beta/user-guide.md) — 跨仓库和团队的规划。
