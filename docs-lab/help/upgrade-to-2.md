# 升级到 2.0

> OpenSpec 2.0 有哪些变化，以及如何迁移项目。

要升级，先更新 CLI，然后在每个项目中运行 `openspec-cn update`。你的 skills 会移到一个共享文件夹，旧的命令文件会被移除。你编辑过的旧命令文件和旧 skill 副本会被保留。

> [!WARNING]
> `update` 会替换你在 OpenSpec 安装于 `.agents/skills/` 的 skill 中所做的修改，且不保留副本。请先保存这些修改：[你自定义过的 skills](#skills-you-customized)。

## 有哪些变化

| | 1.x | 2.0 |
|---|---|---|
| skills 的位置 | 每个工具自己的文件夹中各一份副本 | `.agents/skills/` 中一份共享副本，需要链接的工具通过链接访问 |
| 命令文件（`/opsx:propose`） | 与 skills 一起安装 | 已移除。使用 skills，它们做同样的工作 |
| `delivery` 设置 | skills、commands 或两者 | 已弃用：一切都是 skills |
| Amazon Q Developer | 提示词文件和 skills | 已停止支持：它无法加载 skills。`update` 会移除它的 OpenSpec 文件；请改用 Kiro |

[支持的工具](../reference/supported-tools.md#where-skills-go) 展示了新的目录布局以及哪些工具会获得链接。

## 升级项目

先提交你的工作，以便随时回退。那次提交也是你在 `.agents/skills/` 中某个 skill 内所做修改的唯一副本。`git stash` 无法容纳升级本身，因为 git 无法暂存一个变成了链接的文件夹。

**1. 更新 CLI**，方式与你当初安装时相同（[更新](../start/installation.md#updating)）。

**2. 在每个项目中运行 update。** 在终端中执行：

```bash
openspec-cn update
```

**3. 提交结果。** 链接和其他文件一样被提交。

再次运行 `update` 不会产生任何变化。

## update 会做什么

- **Skills**：写入一次到 `.agents/skills/`，并在工具需要时从工具自己的文件夹建立链接（例如 `.claude/skills/`）。
- **旧 skill 副本**：早期版本写入各工具文件夹的副本会被移除。
- **命令文件**：早期版本生成的命令文件会被移除。
- **你编辑过的旧文件**：被编辑过的命令文件，或工具自己文件夹中被编辑过的 skill 副本，会被保留并列出。后续章节说明如何处理它们。
- **OpenSpec 安装的 skills**：像每个 1.x update 一样原地刷新。其中的修改会被替换。`update` 会点名每个发生这种情况的 skill。
- **链接**：绝不会跟随到项目之外。
- **项目之外**：`update` 只改动你的全局配置、MiniMax Code 的 `~/.minimax/skills/`，以及 `~/.codex/prompts/` 中的旧 OpenSpec 提示词。它只会在使用 `--force` 或经你确认后移除这些提示词。

## 旧命令及其对应的 skills

每个 1.x 命令都有一个指令相同的 skill：

| 1.x 命令 | 2.0 skill |
|---|---|
| `/opsx:propose` | `openspec-propose` |
| `/opsx:explore` | `openspec-explore` |
| `/opsx:apply` | `openspec-apply-change` |
| `/opsx:update` | `openspec-update-change` |
| `/opsx:sync` | `openspec-sync-specs` |
| `/opsx:archive` | `openspec-archive-change` |
| `/opsx:new` | `openspec-new-change` |
| `/opsx:continue` | `openspec-continue-change` |
| `/opsx:ff` | `openspec-ff-change` |
| `/opsx:verify` | `openspec-verify-change` |
| `/opsx:bulk-archive` | `openspec-bulk-archive-change` |
| `/opsx:onboard` | `openspec-onboard` |

你也可以直接用大白话说明要做的事（“提议一个添加深色模式的变更”）。要按名字调用 skill，在 Claude Code 和大多数其他工具中输入 `/openspec-propose`，在 Codex 中输入 `$openspec-propose`。[支持的工具](../reference/supported-tools.md#support-matrix) 列出了每种工具的拼写。

## 你编辑过的命令文件

`update` 只移除与 OpenSpec 生成内容一致的命令文件。它保留你改动过的文件并列出：

```
已保留 1 个与 OpenSpec 生成内容不同的命令文件（可能被编辑过）：
  .claude/commands/opsx/apply.md
请将需要保留的内容移到 skill 中，然后手动删除。
```

你的工具可能仍会把保留下来的文件显示为命令。把需要的内容移走后，请删除它。

在 1.0 之前配置的项目还有更早的文件，例如 `.claude/commands/openspec/`。当它们与早期版本的输出一致时，`update` 会不经询问直接移除。否则它会先询问，非交互式运行则不会改动。使用 `--force` 时会不经询问直接移除，无论是否被编辑过，请先备份。

## 你编辑过的 skill 文件夹

`update` 还会保留你在工具自己文件夹中编辑过的旧 skill 副本。同时读取自己文件夹和 `.agents/skills/` 的工具可能会重复加载该 skill。把需要的内容移走后，请删除被保留的文件夹。

MiniMax Code 把 skills 保存在 `~/.minimax/skills/`。当 `update` 刷新你在那里编辑过的 skill 时，会先把你的副本另存为同目录下的 `SKILL.md.bak`。

## 你自定义过的 skills

`update` 会重写 OpenSpec 安装于 `.agents/skills/` 的每个 skill，例如 `.agents/skills/openspec-propose/SKILL.md`。1.x 中也是这样。如果你编辑过其中一个，你的修改会被替换，且不会备份。`update` 会告诉你哪些 skills 发生了这种情况：

```
已替换你对 1 个 OpenSpec 安装的 skill 所做的修改：.agents/skills/openspec-propose/SKILL.md。OpenSpec 每次更新都会刷新这些 skill，且不保留副本。请从 git 恢复你的内容，长期改动请放到另起名字的自有 skill 中。
```

若想在改动发生前了解受影响的 skills，运行 `openspec-cn update --dry-run`。它会打印一条点名这些 skills 的提示。

要让自定义内容在多次更新后保留，请把它放在 `update` 不会写入的位置：

- **项目指令**：`openspec/config.yaml` 中的 `context` 和 `rules` 可以把你给的指令交给 Agent，而无需编辑 skill（[项目配置](../customize/project-config.md)）。
- **你自己的 skill**：名称不以 `openspec-` 开头的 skill，例如 `.agents/skills/team-propose/`。`update` 绝不会改动它。

## 让 Windows 支持已提交的链接

链接和其他文件一样被提交。Windows 上的协作者需要两项设置才能把它们检出为链接：

**1. 在 git 中开启链接。** 在终端中执行：

```bash
git config --global core.symlinks true
```

或用 `git clone -c core.symlinks=true <url>` 克隆。

**2. 在 Windows 设置中开启开发者模式**，以便能够创建链接。

没有这些设置，每个链接都会检出为一个小文本文件。`openspec-cn update` 会用 skill 的普通副本替换它。

## 链接 OpenSpec 未支持的工具

大多数工具直接读取 `.agents/skills/`。如果你的工具只读取自己的文件夹，[链接其他工具](../reference/supported-tools.md#link-another-tool) 展示了把它指向共享副本的那一条命令。

## 继续使用 1.x

你不必现在升级。1.x 会照常继续工作。按你安装时的方式固定版本即可。

在 npm 中，于终端执行：

```npm
npm install -g @studyzy/openspec-cn@1
```

使用独立安装时，指定版本（[安装选项](../start/installation.md#install-options)）：

```bash
curl -fsSL https://raw.githubusercontent.com/studyzy/OpenSpec-cn/main/scripts/binary/install.sh | OPENSPEC_VERSION=v1.17.0 sh
```

Windows（PowerShell）下：

```powershell
$env:OPENSPEC_VERSION = 'v1.17.0'
irm https://raw.githubusercontent.com/studyzy/OpenSpec-cn/main/scripts/binary/install.ps1 | iex
```

当 `openspec-cn update` 提示升级 CLI 时，选择拒绝。要停止该提示，设置 `OPENSPEC_NO_UPDATE_CHECK=1`。