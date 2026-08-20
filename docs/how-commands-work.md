# 命令如何运作

**唯一需要知道的事：OpenSpec 有两类命令，它们运行在两个不同的地方。**

- `openspec-cn ...` 命令运行在你的**终端**中。（例：`openspec-cn init`。）
- `/opsx:...` 命令运行在你的 **AI 助手的聊天框**中。（例：`/opsx:propose`。）

如果你曾在终端里输入 `/opsx:propose` 却毫无反应，原因就是本页所讲。你是在和 OpenSpec 的终端部分对话，而非聊天部分。斜杠命令不是终端命令。它们是你在与 AI 编程助手对话的同一个聊天框里给出的指令——通常你会在那里输入"add a login form"。

这唯一的区别是新用户最常见的绊脚石，所以我们把它讲得清清楚楚。

## 两半

OpenSpec 是一个戴了两顶帽子的项目。

**CLI（终端一半）。** 一个名叫 `openspec-cn` 的程序，你安装并从 shell 运行它。它设置你的项目、列出并验证变更、显示仪表盘，并归档已完成的工作。你把这些输入到 iTerm、VS Code 终端、PowerShell——任何你会运行 `git` 或 `npm` 的地方。

```bash
openspec-cn init        # 在本项目中设置 OpenSpec
openspec-cn list        # 查看活跃的变更
openspec-cn view        # 打开交互式仪表盘
```

**斜杠命令（聊天一半）。** 像 `/opsx:propose` 和 `/opsx:apply` 这样的短命令，你把它们输入到 AI 助手中。它们告诉 AI 遵循 OpenSpec 工作流：起草一份 proposal、编写 specs、按任务列表构建、完成后归档。你把它们输入到 Claude Code、Cursor、Devin Desktop、Copilot，或者任何你在用的助手里。

```text
/opsx:propose add-dark-mode    (输入到你的 AI 聊天中)
/opsx:apply                    (输入到你的 AI 聊天中)
/opsx:archive                  (输入到你的 AI 聊天中)
```

用一张图来表达这个思维模型：

```text
        你的终端                              你的 AI 助手的聊天
   ┌──────────────────────┐               ┌──────────────────────────────┐
   │  $ openspec-cn init  │    安装       │  /opsx:propose add-dark-mode  │
   │  $ openspec-cn list  │  ──────────►  │  /opsx:apply                  │
   │  $ openspec-cn view  │  命令与       │  /opsx:archive                │
   └──────────────────────┘   skills      └──────────────────────────────┘
      在这里运行 openspec-cn                  在这里运行 /opsx:*
```

注意那个箭头。在终端运行 `openspec-cn init`，正是把斜杠命令*安装*进你的 AI 工具。终端一半设置了聊天一半。此后，日常驱动主要发生在聊天中。

## "我如何启动交互模式？"

**没有单独的"交互模式"需要启动。** 这个问题经常出现，所以它值得一个直白的回答。

你不会进入一个特殊的 OpenSpec 模式。你只需像往常一样打开你的 AI 编程助手，并在聊天中输入一条斜杠命令。斜杠命令*就是*你"进入" OpenSpec 的方式。你的助手识别它，加载对应的 OpenSpec skill，然后开始遵循工作流。

所以真正的操作指引是：

1. 在你的项目中打开 AI 编程助手（Claude Code、Cursor、Devin Desktop 等）。
2. 在它的聊天框里输入 `/opsx:propose`，就是你输入任何其他请求的同一个地方。
3. 留意自动补全：如果 OpenSpec 已安装，你输入斜杠时就会看到 `/opsx:propose`、`/opsx:apply` 等出现。

就这些。没有要切换的模式，没有要启动的守护进程，没有单独的窗口。

终端里有一件事确实是交互式的：`openspec-cn view`。它打开一个用于浏览你的 specs 与变更的仪表盘。但那是个查看器，而非你用来提议和构建的东西。构建是通过聊天中的斜杠命令进行的。

## 为何存在这种划分

这值得理解，因为它解释了 OpenSpec 为何能适配 30+ 种不同的 AI 工具。

CLI 是**引擎**。它了解规则：一个变更文件夹长什么样、哪些制品依赖哪些、如何把增量规范合并进你的事实来源。它处处相同。

斜杠命令是**方向盘**，而每种 AI 工具的方向盘都略有不同。Claude Code 把它们叫做 commands。Cursor 和 Devin Desktop 有自己的格式。有些工具则称之为 skills。当你运行 `openspec-cn init` 时，OpenSpec 会为你选择的每种工具生成正确类型的文件，因此无论你偏好哪个助手，同样的 `/opsx:propose` 意图都能生效。

这种设计的长处：你学一次工作流，就能带到各个工具间。代价：一条命令的确切语法在不同工具间可能略有差异，这正是下一节内容。

## 各工具的斜杠命令语法

意图在各处完全一致。写法取决于你的工具加载的那个文件。

| 你的工具的命令文件 | 你如何输入它 | 示例工具 |
|--------------------------|-----------------|---------------|
| `.../commands/opsx/<id>.*` | `/opsx:propose` | Claude Code、Gemini CLI、Crush |
| `.../opsx-<id>.*` | `/opsx-propose` | Cursor、GitHub Copilot (IDE)、Devin Desktop、Trae、Oh My Pi |
| `.amazonq/prompts/opsx-<id>.md` | `@opsx-propose` | Amazon Q Developer |
| 无 — 仅 skills | `/openspec-propose` | CodeArts、ForgeCode、Hermes、Mistral Vibe、Zed Agent、共享的 `.agents` |
| 无 — Kimi Code | `/skill:openspec-propose` | Kimi Code |
| 无 — Codex CLI | `$openspec-propose` | Codex |

Devin 是唯一横跨两行的工具。Devin Desktop 读取
`.devin/workflows/`，因此 `/opsx-propose` 在那里有效；[Devin Local 则不
读取](https://docs.devin.ai/desktop/devin-local)，所以在那个 agent 上请改用
`/openspec-propose` skill。OpenSpec 写入 `.devin/skills/` 的 skills 在两者上
都有效，这也是它们彼此以 skill 名相互引用的原因。

每种工具都列在 [如何调用](supported-tools.md#how-to-invoke) 中——那张表才是
权威的。其中有两行根本不是斜杠命令：Amazon Q 把它的文件加载进一个用 `@`
调用的提示词库，而最后三行使用的是 *skill* 名，而非命令 id（`/opsx:apply`
对应的是 `openspec-apply-change` skill）。

拿不准时，读一读 `openspec-cn init` 打印出的 "Getting started" 那一行：它已经
使用了你的工具所注册的形式。对于那些确实会展示斜杠命令的工具，输入一个斜杠
并留意自动补全同样有效。

## 命令从何而来：skills 与 commands

当你运行 `openspec-cn init`（或 `openspec-cn update`）时，OpenSpec 把小文件写入你的项目，以便你的 AI 工具能找到该工作流。取决于你的工具与设置，这些文件是 **skills**、**commands**，或两者皆有。

- **Skills** 位于 `.claude/skills/openspec-*/SKILL.md` 这类位置。它们是正在形成的跨工具标准：一个你的助手会自动检测的指令文件夹。
- **Commands** 位于 `.cursor/commands/opsx-<id>.md` 或 `.claude/commands/opsx/<id>.md` 这类位置——布局由工具决定，也由它决定你如何输入该命令。它们是较旧的、按工具划分的斜杠命令文件。Codex 不会生成命令文件；请使用 `.agents/skills/openspec-*`。

你无需关心你的工具用哪一种。你只需输入斜杠命令，它就能工作。但当出问题时，知道这些文件存在是有帮助的：如果你的命令消失了，通常意味着这些文件缺失或过期，而 `openspec-cn update` 会重新生成它们。

逐工具的精确路径见[支持的工具](supported-tools.md)，skills 如何取代旧的纯命令方式见[迁移指南](migration-guide.md)。

## 确认它已安装

快速检查，按从快到慢：

1. **在你的 AI 聊天中输入一个斜杠。** 开始输入 `/opsx` 并留意自动补全建议。如果它们出现了，就说明装好了。在仅支持 skills 的工具上（Codex、Kimi Code、CodeArts、ForgeCode、Hermes、Mistral Vibe、Zed Agent，或共享的 `.agents` 目标），即使安装完好 `/opsx` 也永远不会补全——请改用上表中的 skill 名。
2. **查找那些文件。** 对于 Claude Code，检查 `.claude/skills/` 是否包含 `openspec-*` 文件夹。其他工具使用它们自己的目录（[支持的工具](supported-tools.md) 中有列出）。
3. **重新运行安装。** 在你的项目根目录运行 `openspec-cn update`。这会为你配置的所有工具重新生成 skill 和 command 文件。
4. **重启你的助手。** 许多工具在启动时扫描 skills 和 commands，因此开一个新窗口可能正是缺失的那一步。

## 我到底有哪些命令

默认情况下，OpenSpec 安装 **core** 这组斜杠命令：

- `/opsx:explore`：在下定决心前与 AI 一起想清楚一个想法（拿不准时极好的第一步）
- `/opsx:propose`：创建一个变更并一步起草它的所有规划制品
- `/opsx:apply`：通过完成其任务列表来构建变更
- `/opsx:update`：修订一个变更的规划制品并保持它们彼此连贯
- `/opsx:sync`：把变更的 spec 更新合并进你的主 specs（通常是自动的）
- `/opsx:archive`：完成一个变更并把它归档

一个不错的默认节奏：拿不准要做什么时用 `explore`，然后 `propose`、`apply`、`archive`。[先探索](explore.md)指南解释了为何这第一步值得。

还有一套**扩展**命令，给想要更细控制的人（`/opsx:new`、`/opsx:continue`、`/opsx:ff`、`/opsx:verify`、`/opsx:bulk-archive`、`/opsx:onboard`）。你用 `openspec-cn config profile` 开启它，再用 `openspec-cn update` 应用。

这一切对你而言是全新的？`/opsx:onboard`（在扩展集中）会在你自己的代码库上带你走完一个完整变更，逐步旁白。它是最友好的可能入门。

每个命令的详细功能，见[命令](commands.md)。何时该用哪个，见[工作流](workflows.md)。

## 一次干净的首跑

综合起来，这里是从头到尾的整个序列，每步标注了它发生的位置。

```text
终端      $ npm install -g @studyzy/openspec-cn@latest
终端      $ cd your-project
终端      $ openspec-cn init
              (把斜杠命令安装进你的 AI 工具)

AI 聊天     /opsx:explore
              (可选：先与 AI 一起把想法想清楚)

AI 聊天     /opsx:propose add-dark-mode
              (AI 起草 proposal、specs、design、tasks)

AI 聊天     /opsx:apply
              (AI 构建它，逐项勾选任务)

AI 聊天     /opsx:archive
              (变更被合并进你的 specs 并归档)
```

两步终端操作完成设置。然后你就在聊天里了。这就是节奏。

## 相关

- [快速上手](getting-started.md)：完整的第一个变更走查
- [命令](commands.md)：每个斜杠命令的细节
- [CLI](cli.md)：每个终端命令的细节
- [支持的工具](supported-tools.md)：逐工具的语法与文件位置
- [FAQ](faq.md)：更多快速解答
- [故障排查](troubleshooting.md)：命令不出现时的修复办法
