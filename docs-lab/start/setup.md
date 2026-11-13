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
6 skills in .agents/skills/ (linked from .claude/skills/)
Config: openspec/config.yaml (schema: spec-driven)
```

如果你的工具运行在 IDE 中，请重启它，以便加载新的 skills。

重复运行 init 是安全的：

- 已经设置过的工具会打印 `Refreshed` 而不是 `Created`。
- 再次运行 init 并选中新工具，会添加该工具。
- `--tools` 标志跳过选择器（[CLI 参考](../reference/cli.md)）。

### 迁移已有的 `project.md`

init 不会把旧的 `openspec/project.md` 复制进 `config.yaml`。它会保留该文件，并打印一段 AI 辅助迁移请求。

在你的 AI 对话中：

```
Review openspec/project.md and migrate its useful content to openspec/config.yaml.
Keep context concise: include only project-wide facts needed during artifact creation, apply, and archive.
Move artifact-specific guidance into rules for the matching artifacts.
Move guidance for apply or archive into the matching operations entry.
Leave out generic, outdated, or verbose material. Do not delete project.md.
```

审查 `config.yaml` 后，在合适的时候删除 `project.md`。

## init 会安装什么

运行 init 会在你的项目中创建两样东西：

- 仓库根目录下的 `openspec/` 文件夹
- 工作流文件：共享 `.agents/skills/` 文件夹中的 skills，必要时从工具自己的文件夹（例如 `.claude/skills/`）链接过去

把所有这些像源代码一样提交。

Init 还会删除早期版本生成的命令文件，并保留你编辑过的那些。在 1.0 之前配置的项目还有更早的遗留物：`.claude/commands/openspec/` 之类的文件夹，以及 `CLAUDE.md` 和 `AGENTS.md` 等文件中的 OpenSpec 标记块。交互式 init 会在删除前询问。使用 `--force`、使用 `--tools`，或在非交互式运行中，init 会不经询问直接删除，包括这些块中的任何编辑内容，请先备份。

### `openspec/` 文件夹

每个 OpenSpec 制品都存放在这里，位于你项目的根目录。看起来是这样：

```
openspec/
├── config.yaml     project settings and context for the AI
├── specs/          your specs (empty for now)
└── changes/        in-motion changes (empty for now)
    └── archive/    completed changes move here
```

[项目配置](../customize/project-config.md) 覆盖了 `config.yaml`。

### 工作流文件（skills）

这些就是 OpenSpec 工作流，也就是你在工作中会用到的操作。下面是它们以已安装 skill 的形式、放在共享 `.agents/skills/` 文件夹里的样子：

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

无论你配置了多少个工具，每个 skill 只在这里写一次。不读取 `.agents/skills/` 的工具（Claude Code、Kiro 等）会在自己的文件夹中获得指向每个 skill 的链接，例如 `.claude/skills/openspec-propose`。MiniMax Code 是唯一的例外：它的 skills 放在你主目录下的 `~/.minimax/skills/`。[支持的工具](../reference/supported-tools.md#where-skills-go) 展示了目录布局以及哪些工具会获得链接。

每个工作流都是一个 **skill**：当你请求某项工作时，你的 Agent 会自动捡起的指令；你也可以按名字调用它（Claude Code 中是 `/openspec-apply-change`，Codex 中是 `$openspec-apply-change`）。[支持的工具](../reference/supported-tools.md#support-matrix) 展示了每种工具的拼写。

OpenSpec 1.x 还会为每个工作流写入一个命令文件（`/opsx:apply`）。OpenSpec 2.0 只安装 skills。[升级到 2.0](../help/upgrade-to-2.md) 说明了有哪些变化。

#### 更改安装内容

交互式选择器可以改变工作流集合（[Profiles](../customize/profiles.md)）。在终端中执行：

```bash
openspec-cn config profile
```

对 "Apply changes to this project now?" 回答 yes 会立即应用。其他项目会在下次 `openspec-cn update` 时采纳。该设置是全局的、按机器生效的。

#### Claude Code 不显示工作流

Claude Code 从 `.claude/skills/openspec-*`、这些路径链接到 `.agents/skills/openspec-*` 加载 OpenSpec skills。若文件缺失，请刷新项目。在终端中：

```bash
openspec-cn update
```

重启 Claude Code，然后在它的聊天中运行 `/openspec-propose`。若只缺少部分工作流，[更改你的 profile](../customize/profiles.md#expanding-the-set-optional-workflows)。

设置完成。[快速入门](quickstart.md) 从这里带你走完第一个变更。
