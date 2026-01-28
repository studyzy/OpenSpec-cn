<p align="center">
  <a href="https://github.com/studyzy/openspec-cn">
    <picture>
      <source srcset="assets/openspec_bg.png">
      <img src="assets/openspec_bg.png" alt="OpenSpec logo">
    </picture>
  </a>
</p>

<p align="center">
  <a href="https://github.com/Fission-AI/OpenSpec/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Fission-AI/OpenSpec/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/@studyzy/openspec-cn"><img alt="npm version" src="https://img.shields.io/npm/v/@studyzy/openspec-cn?style=flat-square" /></a>
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" /></a>
  <a href="https://discord.gg/YctCnvvshC"><img alt="Discord" src="https://img.shields.io/discord/1411657095639601154?style=flat-square&logo=discord&logoColor=white&label=Discord&suffix=%20online" /></a>
</p>

> [!NOTE]
> 本项目为中文汉化分支：**openspec-cn**（npm：`@studyzy/openspec-cn`）。
>
> 原版项目：OpenSpec（仓库：`https://github.com/Fission-AI/OpenSpec`，npm：`@fission-ai/openspec`）。

<details>
<summary><strong>最受喜爱的规范（spec）框架。</strong></summary>

[![Stars](https://img.shields.io/github/stars/studyzy/openspec-cn?style=flat-square&label=Stars)](https://github.com/studyzy/openspec-cn/stargazers)
[![Downloads](https://img.shields.io/npm/dm/@studyzy/openspec-cn?style=flat-square&label=Downloads/mo)](https://www.npmjs.com/package/@studyzy/openspec-cn)
[![Contributors](https://img.shields.io/github/contributors/studyzy/openspec-cn?style=flat-square&label=Contributors)](https://github.com/studyzy/openspec-cn/graphs/contributors)

</details>
<p></p>
我们的理念：

```text
→ 灵活，而非僵化
→ 迭代，而非瀑布式
→ 简单，而非复杂
→ 面向存量项目（brownfield），而不只是新项目（greenfield）
→ 从个人项目到企业规模都可扩展
```

> [!TIP]
> **全新工作流现已上线！** 我们用一种全新的“以制品（artifact）为导向”的工作流重构了 OpenSpec。
>
> 运行 `/opsx:onboard` 开始使用。→ [在此了解更多](docs/opsx.md)

<p align="center">
  关注 <a href="https://x.com/0xTab">X 上的 @0xTab</a> 获取更新 · 加入 <a href="https://discord.gg/YctCnvvshC">OpenSpec Discord</a> 获取帮助与答疑。
</p>

### 团队使用

团队正在使用 OpenSpec？可 [发送邮件](mailto:teams@openspec.dev) 获取我们 Slack 频道的访问权限。

<!-- TODO: 添加 /opsx:new → /opsx:archive 工作流的 GIF 演示 -->

## 看看效果

```text
你：/opsx:new add-dark-mode
AI：创建 openspec/changes/add-dark-mode/
    准备创建：proposal

你：/opsx:ff   # "fast-forward" - 生成全部规划文档
AI：✓ proposal.md — 为什么要做、会改什么
    ✓ specs/       — 需求与场景
    ✓ design.md    — 技术方案
    ✓ tasks.md     — 实现清单
    准备进入实现！

你：/opsx:apply
AI：开始实现任务...
    ✓ 1.1 添加主题上下文 Provider
    ✓ 1.2 创建切换组件
    ✓ 2.1 添加 CSS 变量
    ✓ 2.2 接入 localStorage
    所有任务已完成！

你：/opsx:archive
AI：已归档至 openspec/changes/archive/2025-01-23-add-dark-mode/
    Specs 已更新。可以开始下一个功能了。
```

<details>
<summary><strong>OpenSpec 仪表盘</strong></summary>

<p align="center">
  <img src="assets/openspec_dashboard.png" alt="OpenSpec dashboard preview" width="90%">
</p>

</details>

## 快速开始

**需要 Node.js 20.19.0 或更高版本。**

全局安装 openspec-cn：

```bash
npm install -g @studyzy/openspec-cn@latest
```

然后进入你的项目目录并初始化：

```bash
cd your-project
openspec-cn init

```

现在告诉你的 AI：`/opsx:new <你想要实现的功能>`

> [!NOTE]
> 不确定你的工具是否受支持？[查看完整列表](docs/supported-tools.md) – 我们支持 20+ 工具，并仍在持续增长。
>
> 同样支持 pnpm、yarn、bun 和 nix。可查看 [安装选项](docs/installation.md)。

## 文档

→ **[快速入门](docs/getting-started.md)**：开始使用<br>
→ **[工作流](docs/workflows.md)**：组合与模式<br>
→ **[命令](docs/commands.md)**：斜杠命令与技能<br>
→ **[CLI](docs/cli.md)**：终端参考手册<br>
→ **[支持的工具](docs/supported-tools.md)**：工具集成与安装路径<br>
→ **[概念](docs/concepts.md)**：整体如何运转<br>
→ **[多语言](docs/multi-language.md)**：多语言支持<br>
→ **[自定义](docs/customization.md)**：打造你的版本


## 为什么选择 OpenSpec？

AI 编程助手很强大，但当需求只存在于聊天记录里时，结果往往难以预测。OpenSpec 增加了一层轻量的规范（spec）机制，让你在写任何代码前先对齐要做什么。

- **先对齐，再开工** —— 人类与 AI 在写代码前先在规范上达成一致
- **保持有序** —— 每个变更都有自己的目录：proposal、specs、design、tasks
- **流式协作** —— 任意制品都可以随时更新，不设僵硬的阶段门槛
- **用你现有的工具** —— 通过斜杠命令支持 20+ AI 助手

### 我们如何对比

**对比 [Spec Kit](https://github.com/github/spec-kit)**（GitHub）—— 很全面但偏厚重：阶段门槛严格、Markdown 很多、需要 Python 环境。OpenSpec 更轻量，也更适合自由迭代。

**对比 [Kiro](https://kiro.dev)**（AWS）—— 功能强大，但会被锁定在他们的 IDE 中，并且模型选择受限（主要是 Claude）。OpenSpec 可与您已有的工具协作。

**对比“什么都不用”** —— 只靠聊天做 AI 编程容易产生模糊需求和不可预测的实现。OpenSpec 在不增加太多仪式感的前提下，带来更可预期的结果。

## 更新 OpenSpec

**升级包版本**

```bash
npm install -g @studyzy/openspec-cn@latest
```

**刷新代理指令（agent instructions）**

在每个项目里运行一次，用于重新生成 AI 指引，并确保最新斜杠命令可用：

```bash
openspec-cn update
```

## 使用注意事项

**模型选择**：OpenSpec 更适合高推理模型。我们推荐在规划与实现阶段都使用 Opus 4.5 和 GPT 5.2。

**上下文卫生**：OpenSpec 受益于更干净的上下文窗口。在开始实现前清理上下文，并在整个会话中保持良好的上下文卫生。

## 参与贡献

**小修小补** —— Bug 修复、错别字修正与小型改进可以直接提交 PR。

**较大改动** —— 对于新功能、重大重构或架构调整，请先提交一个 OpenSpec 变更提案，以便在实现前对齐意图与目标。

撰写提案时，请牢记 OpenSpec 的理念：我们服务于各种不同的编码代理、模型与使用场景。改动应对所有人都工作良好。

**欢迎 AI 生成代码** —— 只要经过测试与验证即可。包含 AI 生成代码的 PR 应注明使用的编码代理与模型（例如："Generated with Claude Code using claude-opus-4-5-20251101"）。

### 开发

- 安装依赖：`pnpm install`
- 构建：`pnpm run build`
- 测试：`pnpm test`
- 本地开发 CLI：`pnpm run dev` 或 `pnpm run dev:cli`
- 约定式提交（单行）：`type(scope): subject`

## 其他

<details>
<summary><strong>遥测（Telemetry）</strong></summary>

OpenSpec 会收集匿名使用统计。

我们只收集命令名与版本号，用于理解使用模式；不会收集参数、路径、内容或任何个人信息。CI 中会自动禁用。

**退出（Opt-out）：** `export OPENSPEC_TELEMETRY=0` 或 `export DO_NOT_TRACK=1`

</details>

<details>
<summary><strong>维护者与顾问</strong></summary>

核心维护者与顾问列表见 [MAINTAINERS.md](MAINTAINERS.md)。

</details>



## 许可证

MIT
