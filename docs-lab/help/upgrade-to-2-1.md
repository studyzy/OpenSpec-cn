# 升级到 2.1

> OpenSpec 2.1 支持面向编程 Agent 的全局 skills。有哪些变化，以及该如何应对。

**简而言之：** OpenSpec 现在可以全局安装其 skills，让这台机器上的每个项目都使用同一份。升级时，先更新 CLI，再在每个仓库中运行 `openspec-cn update`。它只会问一个问题，在你作答之前不会改动任何东西。

## 有什么变化

随着越来越多的团队采用 Vercel 的 `skills` 安装器，它正成为跨各种编程工具安装 skills 的常见方式。OpenSpec 也在采用它，这样我们可以少花精力维护安装器代码，多花精力改进 skills 本身。

改用 Vercel 的安装器，让 OpenSpec 原生支持 **skills 的全局安装**。你的编程 Agent 可以在多个项目间使用同一份 OpenSpec skills。

## 你会看到什么

下次在拥有自己 OpenSpec skills 的仓库中运行 `openspec-cn update` 时，会看到这个选择：

```text
Where should OpenSpec keep this project’s skills?

❯ Keep in this project   Keep the skills in this repo.
  Switch to global       Install the skills globally, for every project on this machine.
```

在你作出选择之前，什么都不会变。在 CI 中或由 agent 调用时不会提问：update 会就地刷新 skills。

## 保留在本项目中

按 Enter。skills 会留在你的仓库里。

1. 提交 `openspec/config.yaml`。它记录了你的选择，这样你的队友就不会再被询问。

如果 GitHub 托管的 Copilot agent 从仓库读取 skills，就选这个。之后也可以用 `openspec-cn init --scope global` 切换。

## 切换到全局

我们向大多数团队推荐这一项。skills 会全局安装在你的机器上，仓库里的副本会被移除。

1. 提交被移除的文件。
2. 每位队友拉取后运行 `openspec-cn update`，并在它提议为他们的机器设置 skills 时回答 **Yes**。

在脚本中，用 `openspec-cn init --tools <ids>` 代替第 2 步。在切换某个仓库之前，先升级所有人的 CLI：较早的版本只知道项目级 skills。

## 如果有脚本负责设置仓库

在 2.0 中，在新仓库里运行 `openspec-cn init --tools claude` 会把 skills 写进那个仓库。现在它会全局安装它们。要让它们留在你的项目仓库里，加上 `--scope project`：

```bash
openspec-cn init --scope project --tools claude
```

## 更新之前

- **改过内置 skill？** update 会替换内置 skill 文件夹。先保存你的改动，以及你在其中添加过的任何文件。`openspec-cn update --dry-run` 会显示将要发生的变化。
- **已经运行过 `npx skills add`？** 保留那次安装，然后运行 `openspec-cn update`。

从 1.x 升级过来？[升级到 2.0](upgrade-to-2.md) 涵盖了其余内容。
