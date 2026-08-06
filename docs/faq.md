# 常见问题（FAQ）

人们最常问的问题的快速解答。如果你的问题其实是"某东西坏了"，[故障排查](troubleshooting.md)是更合适的页面。如果你想查某个术语的定义，见 [术语表](glossary.md)。

## 基础

### 用一句话说，OpenSpec 是什么？

一个轻量级层，让你在写任何代码之前，先和 AI 编程助手就"要构建什么"达成一致，并且落到纸面。

### 我为什么需要它？

因为 AI 助手即使错了也很自信。当需求只存在于聊天线程里时，AI 会用猜测填补空白，而你往往在代码已经存在之后才发现问题。OpenSpec 把达成一致的过程提前到错误代价还很低的地方。完整论证见 [核心概念速览](overview.md)。

### 我每件事都要用它吗？

不。把它用在对齐重要的地方，也就是大多数非平凡的工作中。对于一个单字符的拼写修正，这套流程可能不值得，那没关系。

### 我能用在大型既有代码库上吗，还是只能用于新项目？

既有代码库正是主战场。OpenSpec 是 brownfield-first（先适配既有项目）的：你不需要在一开始就把整个应用都文档化。你只为每个变更触及的部分写 spec，spec 会围绕你实际做的工作逐渐补全。有一份专门指南：[在既有项目中使用 OpenSpec](existing-projects.md)。

### 它绑定某一个 AI 工具吗？

不。OpenSpec 可用于 30+ 种助手，包括 Claude Code、Cursor、Devin Desktop、GitHub Copilot、Gemini CLI、Codex 等。完整列表和每种工具的细节见 [支持的工具](supported-tools.md)。

## 运行命令

### 我在哪里输入 `/opsx:propose`？

在你的 AI 助手聊天框里，不是终端。这是最常见的困惑点，因此它有专门的一页：[命令如何工作](how-commands-work.md)。简短版本：`openspec-cn ...` 在终端里运行，`/opsx:...` 在聊天里运行。

### 我该怎么"进入交互模式"？

没有单独的模式需要启动。你像平常一样打开 AI 助手，在它的聊天框里输入一条 slash command。Slash command 就是你"进入" OpenSpec 的方式。（唯一真正需要交互的终端功能是 `openspec-cn view`，用于浏览 specs 和变更的仪表盘。）完整解释见 [命令如何工作](how-commands-work.md)。

### 我输入了 slash command 但什么都没发生。为什么？

最可能是你在终端而不是 AI 聊天里输入的，或者你用的写法你的工具并不识别，或者命令还没安装。如果文件缺失——或者你从未配置过该工具——运行 `openspec-cn init`；`openspec-cn update` 只会刷新已经存在的文件。然后重启助手，使用 "Getting started" 下打印出的形式——参见 [如何调用](supported-tools.md#how-to-invoke)。[故障排查](troubleshooting.md#commands-dont-show-up) 有完整清单。

### 为什么一个工具里语法是 `/opsx:propose`，另一个工具里是 `/opsx-propose`？

每种 AI 工具展示自定义命令的方式略有不同，OpenSpec 会按照你的工具加载它所写文件的方式来书写命令。一个名为 `opsx-propose.md` 的命令文件输入为 `/opsx-propose`；归档在 `commands/opsx/` 下的则输入为 `/opsx:propose`。使用 skill 而非 command 的工具用 skill 名——Codex 需要 `$openspec-propose`，Kimi Code 则是 `/skill:openspec-propose`。`openspec-cn init` 的 "Getting started" 那一行已经为你选择的工具打印了正确形式；完整对照表见 [如何调用](supported-tools.md#how-to-invoke)。

### skill 和 command 有什么区别？

两者都是 OpenSpec 写入、让助手能跑工作流的文件。Skills（`.../skills/openspec-*/SKILL.md`）是较新的跨工具标准；commands（`.../commands/opsx-*`）是较旧的、按工具划分的 slash 文件。你不需要选择。你只要输入 slash command，OpenSpec 会安装该工具所用的那一种。

## 工作流

### 如果我不确定要构建什么，应该从哪里开始？

从 `/opsx:explore` 开始。它是一个零风险的思考伙伴，会阅读代码库、列出方案、把模糊的问题变成具体的计划，这一切都发生在任何变更或代码存在之前。它在默认 profile 里，随时可用。当计划清晰了，就交给 `/opsx:propose`。这是最值得养成的一个习惯，因为它能阻止一个急切的 AI 自信地构建出错误的东西。参见 [先探索](explore.md)。

### 最简单的流程是什么？

```text
/opsx:explore (可选)   然后   /opsx:propose <你想要什么>   然后   /opsx:apply   然后   /opsx:archive
```

用 explore 想清楚，用 propose 起草计划，用 apply 构建它，用 archive 归档它。当你已经确切知道想要什么时，跳过 explore。

### `/opsx:propose` 和 `/opsx:new` 有什么区别？

`/opsx:propose` 是默认的一步到位命令：一次性创建变更并起草所有规划制品。`/opsx:new` 是扩展命令集里的一部分，只搭出一个空的变更骨架，留给你用 `/opsx:continue` 逐个创建制品（或一次性用 `/opsx:ff`）。除非你想要逐步控制，否则用 propose。参见 [命令](commands.md)。

### `core` 和 `expanded` profile 是什么？

一个 profile 决定安装哪些 slash command。**Core**（默认）给你 `propose`、`explore`、`apply`、`update`、`sync`、`archive`。**expanded** 集合额外加上 `new`、`continue`、`ff`、`verify`、`bulk-archive` 和 `onboard`，以获得更细的控制。用 `openspec-cn config profile` 切换，然后执行 `openspec-cn update` 应用。

### 我需要跑 `/opsx:sync` 吗？

通常不需要。Sync 把变更的 delta spec 合并进主 specs，而 `/opsx:archive` 会主动给你提供这个选项。只有在你想在归档之前就合并 specs 时才手动运行 sync，例如对长期运行的变更。参见 [命令](commands.md#opsxsync)。

### 我开始之后怎么编辑 proposal、spec、task？

直接编辑文件。每个制品都是 `openspec/changes/<name>/` 下的纯 Markdown，没有锁定的阶段或特殊编辑模式。换一只手，让你的 AI 修订它（"把 design 改成使用队列"），然后继续。AI 始终基于文件当前的实际内容工作。完整指南：[编辑与迭代变更](editing-changes.md)。

### 我实现了一部分之后，能回头改计划吗？

可以，任何时候都行。工作流是流畅的，所以审查和编辑都不是会被锁死在某个阶段的。编辑制品，继续。如果你想确保正确，就一直构建直到代码与之一致。`/opsx:verify` 会暴露不一致之处。参见 [编辑与迭代变更](editing-changes.md)。

### 我手动改了代码。如何让它与 spec 重新一致？

判断哪一边现在是对的。如果代码是对的、spec 过时了，就更新增量规范（以及相关的 tasks）来描述实际交付的行为——在归档之前 spec 应当符合现实。如果 spec 是对的、代码跑偏了，就继续构建直到代码符合 spec。`/opsx:verify` 是快速暴露不一致的方式。参见 [编辑与迭代变更](editing-changes.md)。

### 什么时候更新一个已有变更，什么时候开一个新的？

当是同一项工作、只是被细化时，更新它。当意图从根本上变了、或范围爆炸成了另一项工作时，重新开始。在 [工作流](workflows.md#when-to-update-vs-start-fresh) 里有一个决策流程图和示例。

### 如果我的会话上下文耗尽、需求在实现中途变化了怎么办？

这正是 specs 体现价值的地方。因为计划活在文件里（不只是聊天历史中），你可以清空上下文、开一个全新的 AI 会话，然后用 `/opsx:apply` 接续；它会读取制品，从第一个未勾选的任务恢复。如果需求变了，编辑制品使之匹配新现实再继续。保持干净的上下文窗口也会产生更好的结果；在实现之前清空它。

### 我应该把 `openspec/` 文件夹提交到 git 吗？

应该。你的 specs、活跃变更、归档都是项目历史的一部分。像其他源码一样提交它们。尤其是归档，会成为"你的系统为何以这种方式运作"的持久记录。

## Specs 与变更

### 什么放进 spec，什么放进 design？

Spec 描述可观察的行为：系统做什么、输入、输出、错误条件。Design 描述你将如何构建它：技术方法、架构决策、文件改动。如果实现方式变了但对外可见的行为没变，那它就属于 design，不属于 spec。[概念](concepts.md#what-a-spec-is-and-is-not)有更深入的说明。

### 什么是 delta spec？

一种只描述正在变化之处的 spec，使用 `ADDED`、`MODIFIED`、`REMOVED` 小节，而不是重述整个 spec。这是让 OpenSpec 能干净地编辑既有系统的机制。详见 [概念](concepts.md#delta-specs)。

### 归档的变更去哪了？

去到 `openspec/changes/archive/YYYY-MM-DD-<name>/`，所有变更制品都被保留。该变更会从你的活跃列表中移出。一个显式声明了 `retire_capabilities: true` 的变更，在移除某能力的最后一条需求时，还可以删除对应的主能力 spec。

## 配置与自定义

### 我怎么告诉 AI 我的技术栈？

把它写进 `openspec/config.yaml` 的 `context:` 下。那段文字会被注入到每一次规划请求中，因此 AI 始终了解你的技术栈和约定。参见 [自定义](customization.md#project-configuration)。

### 我能用除英语之外的语言生成 spec 吗？

可以。在配置的 `context:` 里加上语言指令。[多语言](multi-language.md) 提供了可直接复制粘贴的多语言片段。

### 我能改工作流本身吗？

可以，通过自定义 schema。schema 定义了存在哪些制品、它们如何相互依赖。派生默认的：`openspec-cn schema fork spec-driven my-workflow`，然后编辑它。参见 [自定义](customization.md#custom-schemas)。

## 模型、隐私、升级

### 我应该用哪个 AI 模型？

OpenSpec 在强推理模型上效果最好。README 推荐像 Codex、5.5、Opus、4.7 这样的模型用于规划和实现。同时要保持上下文窗口干净：实现之前清空它以获得最佳结果。

### OpenSpec 收集数据吗？

它收集匿名的用量统计：仅命令名和版本。没有参数、路径、内容、个人数据，在 CI 中会自动关闭。用 `export OPENSPEC_TELEMETRY=0` 或 `export DO_NOT_TRACK=1` 退出。

### 怎么升级？

两步。升级包（`npm install -g @studyzy/openspec-cn@latest`），然后在项目内运行 `openspec-cn update` 以重新生成 skills 和 commands。

### 怎么卸载 OpenSpec？

没有卸载命令，它只是全局包加上项目里的文件。移除包（`npm uninstall -g @studyzy/openspec-cn`），可选地删除 `openspec/` 目录及生成的工具文件。逐步说明（包括哪些可以安全保留）见 [安装：卸载](installation.md#uninstalling)。

## 获取帮助

### 我在哪里提问或报告 bug？

- **Discord：** [discord.gg/YctCnvvshC](https://discord.gg/YctCnvvshC)
- **GitHub Issues：** [github.com/studyzy/OpenSpec-cn/issues](https://github.com/studyzy/OpenSpec-cn/issues)
- **从你的终端：** `openspec-cn feedback "你的消息"` 会为你开一个 GitHub issue。

### 这些文档有误或让人困惑。我该怎么办？

告诉我们，或者自己修。我们欢迎并重视文档 PR。开一个 issue 或发一个 pull request。
