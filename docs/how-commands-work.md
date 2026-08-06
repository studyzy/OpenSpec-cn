# 命令如何运作

**唯一需要知道的事：OpenSpec 有两类命令，它们运行在两个不同的地方。**

- `openspec ...` 命令运行在你的**终端**中。（例：`openspec-cn init`。）
- `/opsx:...` 命令运行在你的 **AI 助手的聊天框**中。（例：`/opsx:propose`。）

如果你曾在终端里输入 `/opsx:propose` 却毫无反应，原因就是本页所讲。你是在和 OpenSpec 的终端部分对话，而非聊天部分。斜杠命令不是终端命令。它们是你在与 AI 编程助手对话的同一个聊天框里给出的指令——通常你会在那里输入"add a login form"。

这唯一的区别是新用户最常见的绊脚石，所以我们把它讲得清清楚楚。

## 两半

OpenSpec 是一个戴了两顶帽子的项目。

**CLI（终端一半）。** 一个名叫 `openspec` 的程序，你安装并从 shell 运行它。它设置你的项目、列出并验证变更、显示仪表盘，并归档已完成的工作。你把这些输入到 iTerm、VS Code 终端、PowerShell——任何你会运行 `git` 或 `npm` 的地方。

```bash
openspec-cn init        # set up OpenSpec in this project
openspec-cn list        # see active changes
openspec-cn view        # open the interactive dashboard
```

**The slash commands (chat half).** Short commands like `/opsx:propose` and `/opsx:apply` that you type into your AI assistant. These tell the AI to follow the OpenSpec workflow: draft a proposal, write specs, build from the task list, archive when done. You type these into Claude Code, Cursor, Devin Desktop, Copilot, or whichever assistant you use.

```text
/opsx:propose add-dark-mode    (typed in your AI chat)
/opsx:apply                    (typed in your AI chat)
/opsx:archive                  (typed in your AI chat)
```

用一张图来表达这个思维模型：

```text
        YOUR TERMINAL                         YOUR AI ASSISTANT'S CHAT
   ┌──────────────────────┐               ┌──────────────────────────────┐
   │  $ openspec-cn init     │   installs    │  /opsx:propose add-dark-mode  │
   │  $ openspec-cn list     │  ──────────►  │  /opsx:apply                  │
   │  $ openspec-cn view     │   commands    │  /opsx:archive                │
   └──────────────────────┘    & skills   └──────────────────────────────┘
        run openspec-cn here                       run /opsx:* here
```

注意那个箭头。在终端运行 `openspec-cn init`，正是把斜杠命令*安装*进你的 AI 工具。终端一半设置了聊天一半。此后，日常驱动主要发生在聊天中。

## "我如何启动交互模式？"

**没有单独的"交互模式"需要启动。** 这个问题经常出现，所以它值得一个直白的回答。

你不会进入一个特殊的 OpenSpec 模式。你只需像往常一样打开你的 AI 编程助手，并在聊天中输入一条斜杠命令。斜杠命令*就是*你"进入" OpenSpec 的方式。你的助手识别它，加载对应的 OpenSpec skill，然后开始遵循工作流。

所以真正的操作指引是：

1. Open your AI coding assistant (Claude Code, Cursor, Devin Desktop, and so on) in your project.
2. Type `/opsx:propose` in its chat, the same place you type any other request.
3. Watch the autocomplete: if OpenSpec is installed, you'll see `/opsx:propose`, `/opsx:apply`, and friends appear as you type the slash.

就这些。没有要切换的模式，没有要启动的守护进程，没有单独的窗口。

终端里有一件事确实是交互式的：`openspec-cn view`。它打开一个用于浏览你的 specs 与变更的仪表盘。但那是个查看器，而非你用来提议和构建的东西。构建是通过聊天中的斜杠命令进行的。

## 为何存在这种划分

It's worth understanding, because it explains why OpenSpec works with 30+ different AI tools.

CLI 是**引擎**。它了解规则：一个变更文件夹长什么样、哪些制品依赖哪些、如何把增量规范合并进你的事实来源。它处处相同。

The slash commands are the **steering wheel**, and every AI tool has a slightly different one. Claude Code calls them commands. Cursor and Devin Desktop have their own formats. Some tools call them skills. When you run `openspec init`, OpenSpec generates the right kind of file for each tool you selected, so the same `/opsx:propose` intent works no matter which assistant you prefer.

这种设计的长处：你学一次工作流，就能带到各个工具间。代价：一条命令的确切语法在不同工具间可能略有差异，这正是下一节内容。

## 各工具的斜杠命令语法

The intent is identical everywhere. The spelling follows the file your tool loads.

| Your tool's command file | How you type it | Example tools |
|--------------------------|-----------------|---------------|
| `.../commands/opsx/<id>.*` | `/opsx:propose` | Claude Code, Gemini CLI, Crush |
| `.../opsx-<id>.*` | `/opsx-propose` | Cursor, GitHub Copilot (IDE), Devin Desktop, Trae, Oh My Pi |
| `.amazonq/prompts/opsx-<id>.md` | `@opsx-propose` | Amazon Q Developer |
| none — skills only | `/openspec-propose` | CodeArts, ForgeCode, Hermes, Mistral Vibe, shared `.agents` |
| none — Kimi Code | `/skill:openspec-propose` | Kimi Code |
| none — Codex CLI | `$openspec-propose` | Codex |

Devin is the one tool that spans two rows. Devin Desktop reads
`.devin/workflows/`, so `/opsx-propose` works there; [Devin Local does
not](https://docs.devin.ai/desktop/devin-local), so on that agent use the
`/openspec-propose` skill instead. The skills OpenSpec writes to
`.devin/skills/` work on both, which is why they reference each other by skill
name.

Every tool is listed in [How To Invoke](supported-tools.md#how-to-invoke) — that
table is the authoritative one. Two rows are not slash commands at all: Amazon Q
loads its files into a prompt library invoked with `@`, and the last three rows
use the *skill* name, which is not the command id (`/opsx:apply` is the
`openspec-apply-change` skill).

When in doubt, read the "Getting started" line `openspec init` printed: it already
uses the form your tools registered. Typing a slash and watching the autocomplete
works too, for the tools that surface slash commands at all.

## 命令从何而来：skills 与 commands

当你运行 `openspec-cn init`（或 `openspec-cn update`）时，OpenSpec 把小文件写入你的项目，以便你的 AI 工具能找到该工作流。取决于你的工具与设置，这些文件是 **skills**、**commands**，或两者皆有。

- **Skills** live in places like `.claude/skills/openspec-*/SKILL.md`. They're the emerging cross-tool standard: a folder of instructions your assistant auto-detects.
- **Commands** live in places like `.cursor/commands/opsx-<id>.md` or `.claude/commands/opsx/<id>.md` — the layout is the tool's, and it decides how you type the command. They're the older per-tool slash command files. Codex does not get generated command files; use `.agents/skills/openspec-*`.

你无需关心你的工具用哪一种。你只需输入斜杠命令，它就能工作。但当出问题时，知道这些文件存在是有帮助的：如果你的命令消失了，通常意味着这些文件缺失或过期，而 `openspec-cn update` 会重新生成它们。

逐工具的精确路径见[支持的工具](supported-tools.md)，skills 如何取代旧的纯命令方式见[迁移指南](migration-guide.md)。

## 确认它已安装

快速检查，按从快到慢：

1. **Type a slash in your AI chat.** Start typing `/opsx` and watch for autocomplete suggestions. If they appear, you're set. On a skills-only tool (Codex, Kimi Code, CodeArts, ForgeCode, Hermes, Mistral Vibe, or the shared `.agents` target) `/opsx` never completes even on a healthy install — try the skill name from the table above instead.
2. **Look for the files.** For Claude Code, check that `.claude/skills/` contains `openspec-*` folders. Other tools use their own directories ([Supported Tools](supported-tools.md) lists them).
3. **Re-run setup.** From your project root, run `openspec update`. This regenerates the skill and command files for whatever tools you configured.
4. **Restart your assistant.** Many tools scan for skills and commands at startup, so a fresh window can be the missing step.

## 我到底有哪些命令

默认情况下，OpenSpec 安装 **core** 这组斜杠命令：

- `/opsx:explore`：在下定决心前与 AI 一起想清楚一个想法（拿不准时极好的第一步）
- `/opsx:propose`：创建一个变更并一步起草它的所有规划制品
- `/opsx:apply`：通过完成其任务列表来构建变更
- `/opsx:update`: revise a change's planning artifacts and keep them coherent
- `/opsx:sync`：把变更的 spec 更新合并进你的主 specs（通常是自动的）
- `/opsx:archive`：完成一个变更并把它归档

一个不错的默认节奏：拿不准要做什么时用 `explore`，然后 `propose`、`apply`、`archive`。[先探索](explore.md)指南解释了为何这第一步值得。

还有一套**扩展**命令，给想要更细控制的人（`/opsx:new`、`/opsx:continue`、`/opsx:ff`、`/opsx:verify`、`/opsx:bulk-archive`、`/opsx:onboard`）。你用 `openspec-cn config profile` 开启它，再用 `openspec-cn update` 应用。

这一切对你而言是全新的？`/opsx:onboard`（在扩展集中）会在你自己的代码库上带你走完一个完整变更，逐步旁白。它是最友好的可能入门。

每个命令的详细功能，见[命令](commands.md)。何时该用哪个，见[工作流](workflows.md)。

## 一次干净的首跑

综合起来，这里是从头到尾的整个序列，每步标注了它发生的位置。

```text
TERMINAL   $ npm install -g @fission-ai/openspec@latest
TERMINAL   $ cd your-project
TERMINAL   $ openspec-cn init
              (installs slash commands into your AI tool)

AI CHAT      /opsx:explore
              (optional: think the idea through with the AI first)

AI CHAT      /opsx:propose add-dark-mode
              (AI drafts proposal, specs, design, tasks)

AI CHAT      /opsx:apply
              (AI builds it, checking off tasks)

AI CHAT      /opsx:archive
              (change is merged into your specs and filed away)
```

两步终端操作完成设置。然后你就在聊天里了。这就是节奏。

## 相关

- [快速上手](getting-started.md)：完整的第一个变更走查
- [命令](commands.md)：每个斜杠命令的细节
- [CLI](cli.md)：每个终端命令的细节
- [支持的工具](supported-tools.md)：逐工具的语法与文件位置
- [FAQ](faq.md)：更多快速解答
- [故障排查](troubleshooting.md)：命令不出现时的修复办法
