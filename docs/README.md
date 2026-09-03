# OpenSpec 文档

欢迎。这里汇集了关于 OpenSpec 的一切。

OpenSpec 帮你和你的 AI 编程助手**在写任何代码之前先就“要构建什么”达成一致。** 你描述这次变更,AI 起草一份简短的 spec 和任务清单,你们双方看着同一份计划,然后才开始动手。再也不会做到一半才发现 AI 把东西做错了。

如果只能读两页,那就读这两页:

1. [快速入门](getting-started.md):安装、初始化,并完成你的第一个变更。
2. [命令是如何工作的](how-commands-work.md):你真正输入 `/opsx:propose` 的地方(提示:是在你的 AI 聊天里,不是终端里)。几乎所有人都会在这里踩一次坑。

第二页的重要性比看起来要大。OpenSpec 有两部分:一个是你在终端里运行的命令行工具,另一个是交给 AI 助手的斜杠命令。搞清楚哪个是哪个,能避免最常见的困惑时刻。

> **最值得先养成的习惯:当你不确定要构建什么时,从 `/opsx:explore` 开始。** 它是一个零风险的思考伙伴,会阅读你的代码、权衡各种方案,并在任何制品或代码产生之前,把一个模糊的想法打磨成一份具体的计划。[先探索](explore.md) 指南对此做了详细阐述。

## 选择适合你的路径

**我是全新用户。** 从 [快速入门](getting-started.md) 开始,然后浏览 [核心概念速览](overview.md)。当某处感觉费解时,[常见问题](faq.md) 和 [术语表](glossary.md) 就在手边。

**我有问题但还没有计划。** 这是最常见的情况,也有专门的答案:[先探索](explore.md)。在做出任何承诺之前,使用 `/opsx:explore` 与 AI 一起把问题想清楚。

**我有一个庞大的存量代码库。** 你不必为它编写全部文档。[在已有项目中使用 OpenSpec](existing-projects.md) 展示了如何在不“煮干整片海洋”的前提下,在真实的、棕地代码上起步。

**我只想让它先跑起来。** [安装](installation.md),运行 `openspec-cn init`,然后阅读 [命令是如何工作的](how-commands-work.md),这样你的第一条斜杠命令才会落在正确的地方。或者用 [AI 辅助安装提示词](installation.md#install-with-your-ai-assistant) 把配置工作直接交给你的助手。

**我通过示例来学习。** [示例与配方](examples.md) 页面从头到尾走完真实的变更:一个小功能、一个 bug 修复、一次重构、一次探索。

**AI 刚刚起草了一份计划——现在该怎么办?** 读它。[审查变更](reviewing-changes.md) 展示了用两分钟做一次检查,在代价还很低时就拦下走偏的方向;而 [编写优秀的 Specs](writing-specs.md) 则涵盖了“一份值得批准的计划”由什么构成。

**我是团队协作的。** [团队中的 OpenSpec](team-workflow.md) 展示了一次变更如何映射到分支和拉取请求,以及队友如何在代码之前先审查计划。

**我从旧工作流迁移而来。** [迁移指南](migration-guide.md) 解释了发生了什么变化以及为什么,并承诺你已有的工作都是安全的。

**我想把它改造得符合我的团队流程。** [定制化](customization.md) 涵盖了项目配置、自定义 schema 和共享上下文。

**出了点问题。** [故障排查](troubleshooting.md) 汇集了人们真正遇到的问题及其修复方法。

## 完整地图

### 从这里开始

| 文档 | 它能给你什么 |
|-----|-------------------|
| [快速入门](getting-started.md) | 安装、初始化,并端到端跑完你的第一个变更 |
| [先探索](explore.md) | 在做出承诺之前,用 `/opsx:explore` 把一个想法想清楚 |
| [命令是如何工作的](how-commands-work.md) | 斜杠命令在哪里运行、“交互模式”是什么意思、终端与聊天的区别 |
| [核心概念速览](overview.md) | 一页讲完整套心智模型:specs、变更、增量、归档 |
| [安装](installation.md) | npm、pnpm、yarn、bun、Nix,一段把配置交给 AI 助手的提示词,以及如何验证是否成功 |

### 日常使用

| 文档 | 它能给你什么 |
|-----|-------------------|
| [工作流](workflows.md) | 常见模式,以及何时使用哪条命令 |
| [示例与配方](examples.md) | 真实变更的完整走查,可复制粘贴 |
| [编写优秀的 Specs](writing-specs.md) | 一个扎实的需求和场景长什么样,以及如何为变更确定合适的范围 |
| [审查变更](reviewing-changes.md) | 在写任何代码之前,对草稿计划做两分钟检查 |
| [团队中的 OpenSpec](team-workflow.md) | 变更如何对应分支、拉取请求和审查 |
| [在已有项目中使用 OpenSpec](existing-projects.md) | 在大型棕地代码库上采用 OpenSpec |
| [编辑与迭代一个变更](editing-changes.md) | 更新制品、回退、调和手动修改 |
| [命令](commands.md) | 每个 `/opsx:*` 斜杠命令的参考 |
| [CLI](cli.md) | 每个 `openspec-cn` 终端命令的参考 |

### 深入理解

| 文档 | 它能给你什么 |
|-----|-------------------|
| [概念](concepts.md) | 关于 specs、变更、制品、schemas 和归档的长篇解释 |
| [OPSX 工作流](opsx.md) | 为什么工作流是流动的而非阶段锁定的,外加架构深度解析 |
| [术语表](glossary.md) | 所有术语集中一处定义 |

### 让它属于你

| 文档 | 它能给你什么 |
|-----|-------------------|
| [定制化](customization.md) | 项目配置、自定义 schema、共享上下文 |
| [多语言](multi-language.md) | 生成英语之外其他语言的制品 |
| [支持的工具](supported-tools.md) | OpenSpec 集成的 30+ 种 AI 工具,以及文件会落到哪里 |
| [社区展示](community.md) | 基于 OpenSpec 构建的项目与资源 |

### 当你需要帮助时

| 文档 | 它能给你什么 |
|-----|-------------------|
| [常见问题](faq.md) | 人们最常提问的快捷答案 |
| [故障排查](troubleshooting.md) | 针对具体故障的具体修复 |
| [迁移指南](migration-guide.md) | 从旧工作流迁移到 OPSX |

### 跨仓库协调(beta)

| 文档 | 它能给你什么 |
|-----|-------------------|
| [Stores:用户指南](stores-beta/user-guide.md) | 当你的工作跨多个仓库或团队时,在自己的仓库里做计划 |
| [Agent 契约](agent-contract.md) | Agent 驱动的机器可读 CLI 接口 |

## 三十秒速览

```text
1. 安装          npm install -g @studyzy/openspec-cn@latest
2. 初始化        cd your-project && openspec-cn init
3. 探索          (在你的 AI 聊天中)  /opsx:explore           ← 可选,但一个很好的习惯
4. 提案          (在你的 AI 聊天中)  /opsx:propose add-dark-mode
5. 构建          (在你的 AI 聊天中)  /opsx:apply
6. 归档          (在你的 AI 聊天中)  /opsx:archive
```

第 1 步和第 2 步发生在你的终端里。其余步骤发生在你的 AI 助手的聊天中。这一分工是唯一点得记住的东西,而 [命令是如何工作的](how-commands-work.md) 精确解释了原因。第 3 步是可选的,但在不确定时从 `/opsx:explore` 开始,是最值得养成的习惯。

## 还有其他获取帮助的渠道

- **Discord:** [discord.gg/YctCnvvshC](https://discord.gg/YctCnvvshC),用于提问、交流想法和获取帮助。
- **GitHub Issues:** [github.com/studyzy/OpenSpec-cn/issues](https://github.com/studyzy/OpenSpec-cn/issues),用于报告 bug 和提出功能请求。
- **`openspec-cn feedback "你的消息"`** 直接从你的终端发送反馈(它会打开一个 GitHub issue)。

在这些文档中发现有误、过时或令人困惑的内容?那就是一个 bug。请提交 issue 或 PR。文档改进是你所能做出的最有价值的贡献之一。
