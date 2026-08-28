# 设置你的项目

> 把 OpenSpec 加进一个项目：运行 init，看看它写了什么，再调整它。

## 选择 OpenSpec 的位置

- **放在你的仓库里（默认）**：specs 和 changes 与它们描述的代码放在一起，并随代码一起版本化。本页其余部分都按这条路径展开。
- **放在 store 里**：一个独立的规划仓库，由使用它的各个仓库共享，适用于多仓库场景，或者干脆不让规划留在仓库里。[Stores (beta)](../multi-repo/stores.md) 讲了什么时候值得这样做，以及如何建立一个。

## 初始化你的项目

安装好 CLI 之后（[安装](installation.md)），在你项目的根目录运行 init。在终端中执行：

```bash
cd <your-project>
openspec-cn init
```

init 会询问你使用哪些 AI 工具，为你选中的工具写入工作流文件，并报告你得到了什么：

```
OpenSpec Setup Complete

Created: Claude Code
6 skills and 6 commands in .claude/
Config: openspec/config.yaml (schema: spec-driven)
```

重启你的 IDE，让新命令生效。

重复运行 init 是安全的：

- 已经设置过的工具会打印 `Refreshed` 而不是 `Created`。
- 再次运行 init 并选中新工具，会添加该工具。
- `--tools` 标志跳过选择器（[CLI 参考](../reference/cli.md)）。

## init 会安装什么

运行 init 会在你的项目中创建两样东西：

- 仓库根目录下的 `openspec/` 文件夹
- 添加到你的 AI 工具文件夹（`.agents/`、`.claude/` 等）的工作流文件（skills 和 commands）

把所有这些像源代码一样提交（[FAQ](../help/faq.md) 说明了为什么）。init 不会改动你仓库中的任何其他东西（如果它发现旧版 OpenSpec 的遗留物，会在清理前先询问）。

### `openspec/` 文件夹

每个 OpenSpec 制品都存放在这里，位于你项目的根目录。看起来是这样：

```
openspec/
├── config.yaml     project settings and context for the AI
├── specs/          your specs (empty for now)
└── changes/        in-motion changes (empty for now)
    └── archive/    completed changes move here
```

[概念](../guides/concepts.md) 解释了这两种制品；[项目配置](../customize/project-config.md) 覆盖了 `config.yaml`。

<a id="the-workflow-files-skills-and-commands"></a>

### 工作流文件（skills 和 commands）

这些就是 OpenSpec 工作流，也就是你在工作中会用到的操作。下面是它们以已安装 skill 的形式、放在多数工具共用的 `.agents/` 文件夹里的样子：

```
.agents/skills/
├── openspec-explore/              think through an idea first
├── openspec-propose/              propose a change
├── openspec-apply-change/         implement a change's tasks
├── openspec-update-change/        revise a change's plan
├── openspec-sync-specs/           sync a change's spec updates into specs/
├── openspec-archive-change/       move a finished change to the archive
├── openspec-verify-change/        check the implementation matches the plan (not included by default)
└── openspec-bulk-archive-change/  archive several changes at once (not included by default)
```

这是默认集合加上两个可选工作流。[Profiles](../customize/profiles.md) 列出了全部十二个。

默认情况下，每个工作流以两种形式安装：

- **Skill**（`openspec-apply-change`）：当你请求某项工作时，你的 Agent 会自动捡起的指令。
- **Command**（Claude Code 中的 `/opsx:apply`）：同一个工作流的键入式入口，名字更短。

两者在功能上完全一致。一个工作流的 skill 和它的 command 携带相同的指令。

为什么是两种：command 先出现，而且每个工具对它都有自己的拼写。skill 是跨工具共享的较新标准，但不是每个工具都能直接调用 skill，所以 command 仍是那些工具的入口。

有些工具只以 skill 形式安装。当工具能直接运行 skill 时，init 会跳过 commands 并说明（`Commands skipped for: codex (uses skills)`）。

我们更偏好 skills，并预期最终会退役 commands。

#### 更改安装内容

交互式选择器可以改变交付形式和工作流集合（[Profiles](../customize/profiles.md)）。在终端中执行：

```bash
openspec-cn config profile
```

下面是从 both 切换为仅 skills 的样子：

```
Current profile settings
  Delivery: both

? What do you want to configure? Delivery only
? Delivery mode (how workflows are installed): Skills only

Config changes:
  delivery: both -> skills
? Apply changes to this project now? (Y/n) y
```

回答 yes 会立即应用到当前项目。其他项目在下次 `openspec-cn update` 时才会生效。该设置是全局的，按机器保存。

设置完成。[快速入门](quickstart.md) 从这里带你走完第一个变更。
