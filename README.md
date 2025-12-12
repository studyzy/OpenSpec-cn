<p align="center">
  <a href="https://github.com/Fission-AI/OpenSpec">
    <picture>
      <source srcset="assets/openspec_pixel_dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="assets/openspec_pixel_light.svg" media="(prefers-color-scheme: light)">
      <img src="assets/openspec_pixel_light.svg" alt="OpenSpec logo" height="64">
    </picture>
  </a>
  
</p>
<p align="center">面向AI编程助手的规范驱动开发框架</p>
<p align="center">
  <a href="https://github.com/studyzy/OpenSpec-cn/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/studyzy/OpenSpec-cn/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/@studyzy/openspec-cn"><img alt="npm version" src="https://img.shields.io/npm/v/@studyzy/openspec-cn?style=flat-square" /></a>
  <a href="https://nodejs.org/"><img alt="node version" src="https://img.shields.io/node/v/@studyzy/openspec-cn?style=flat-square" /></a>
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" /></a>
  <a href="https://conventionalcommits.org"><img alt="Conventional Commits" src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square" /></a>
  <a href="https://discord.gg/YctCnvvshC"><img alt="Discord" src="https://img.shields.io/badge/Discord-Join%20the%20community-5865F2?logo=discord&logoColor=white&style=flat-square" /></a>
</p>

<p align="center">
  <img src="assets/openspec_dashboard.png" alt="OpenSpec dashboard preview" width="90%">
</p>

<p align="center">
  关注 <a href="https://x.com/0xTab">X平台上的@0xTab</a> 获取最新动态 · 加入 <a href="https://discord.gg/YctCnvvshC">OpenSpec Discord社区</a> 获取帮助和解答疑问
</p>

# OpenSpec 简体中文版

> **注意：** 这是 OpenSpec 的简体中文本地化版本。所有命令输出、错误信息、模板和提示均已翻译为简体中文。
> 
> - 📦 包名：`@studyzy/openspec-cn`
> - 🔧 命令：`openspec-cn` (取代原版的 `openspec`)
> - 🌐 原版英文项目：[Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)
> - 📝 本项目地址：[studyzy/OpenSpec-cn](https://github.com/studyzy/OpenSpec-cn)

OpenSpec 通过规范驱动开发，让人工智能编程助手与人类开发者在对需求达成共识后再开始编码工作。**无需API密钥即可使用。**

## 为什么选择 OpenSpec？

AI编程助手虽然功能强大，但当需求仅存在于聊天记录中时，其行为往往难以预测。OpenSpec引入了一种轻量级的规范工作流，在实现之前锁定意图，为您提供确定性和可审查的输出结果。

核心优势：
- 人类与AI利益相关方在工作开始前就规范达成共识
- 结构化的变更文件夹（提案、任务和规范更新）确保范围明确且可审计
- 共享可见性，清晰了解哪些内容处于提案、活跃或归档状态
- 兼容您已使用的AI工具：支持自定义斜杠命令，其他场景使用上下文规则

## OpenSpec 与其他方案对比 (概览)

- **轻量级**：简单的工作流程，无需API密钥，最小化设置
- **面向存量项目优先**：在0→1之外同样表现优异。OpenSpec将真实来源与提案分离：`openspec/specs/`（当前真实状态）和 `openspec/changes/`（提案更新）。这使得跨功能的差异明确且可管理
- **变更追踪**：提案、任务和规范增量共同存在；归档时将批准的更新合并回规范
- **与 spec-kit & Kiro 对比**：这些工具在全新功能（0→1）方面表现出色，而OpenSpec在修改现有行为（1→n）时同样卓越，特别是当更新涉及多个规范时

完整对比请参阅[OpenSpec与其他方案对比](#how-openspec-compares)。

## 工作原理

```
┌────────────────────────┐
│ 起草变更提案             │
└────────────┬───────────┘
             │ 与AI共享意图
             ▼
┌────────────────────────┐
│ 审查与对齐               │
│ (编辑规范/任务)          │◀──── 反馈循环 ────────────┐
└────────────┬───────────┘                          │
             │ 批准计划                              │
             ▼                                      │
┌────────────────────────┐                          │
│ 实施任务                │──────────────────────────┘
│ (AI编写代码)            │
└────────────┬───────────┘
             │ 交付变更
             ▼
┌────────────────────────┐
│ 归档与更新               │
│ 规范（真实来源）          │
└────────────────────────┘
```

1. 起草包含所需规范更新的变更提案
2. 与AI助手一起审查提案，直到各方达成共识
3. 实施引用已同意规范的任务
4. 归档变更，将批准的更新合并回真实来源规范

## 快速开始

### 支持的AI工具

<details>
<summary><strong>原生斜杠命令支持</strong> (点击展开)</summary>

这些工具内置了OpenSpec命令。出现提示时选择OpenSpec集成选项。

| 工具 | 命令 |
|------|----------|
| **Amazon Q Developer** | `@openspec-proposal`, `@openspec-apply`, `@openspec-archive` (`.amazonq/prompts/`) |
| **Antigravity** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` (`.agent/workflows/`) |
| **Auggie (Augment CLI)** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` (`.augment/commands/`) |
| **Claude Code** | `/openspec:proposal`, `/openspec:apply`, `/openspec:archive` |
| **Cline** | `.clinerules/workflows/` 目录中的工作流 (`.clinerules/workflows/openspec-*.md`) |
| **CodeBuddy Code (CLI)** | `/openspec:proposal`, `/openspec:apply`, `/openspec:archive` (`.codebuddy/commands/`) — 详见 [文档](https://www.codebuddy.ai/cli) |
| **Codex** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` (全局: `~/.codex/prompts`, 自动安装) |
| **CoStrict** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` (`.cospec/openspec/commands/`) — 详见 [文档](https://costrict.ai)|
| **Crush** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` (`.crush/commands/openspec/`) |
| **Cursor** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` |
| **Factory Droid** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` (`.factory/commands/`) |
| **Gemini CLI** | `/openspec:proposal`, `/openspec:apply`, `/openspec:archive` (`.gemini/commands/openspec/`) |
| **GitHub Copilot** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` (`.github/prompts/`) |
| **iFlow (iflow-cli)** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` (`.iflow/commands/`) |
| **Kilo Code** | `/openspec-proposal.md`, `/openspec-apply.md`, `/openspec-archive.md` (`.kilocode/workflows/`) |
| **OpenCode** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` |
| **Qoder (CLI)** | `/openspec:proposal`, `/openspec:apply`, `/openspec:archive` (`.qoder/commands/openspec/`) — 详见 [文档](https://qoder.com/cli) |
| **Qwen Code** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` (`.qwen/commands/`) |
| **RooCode** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` (`.roo/commands/`) |
| **Windsurf** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` (`.windsurf/workflows/`) |

Kilo Code会自动发现团队工作流。将生成的文件保存在 `.kilocode/workflows/` 目录下，并通过命令面板使用 `/openspec-proposal.md`、`/openspec-apply.md` 或 `/openspec-archive.md` 触发它们。

</details>

<details>
<summary><strong>AGENTS.md 兼容</strong> (点击展开)</summary>

这些工具会自动从 `openspec/AGENTS.md` 读取工作流指令。如果需要提醒，请要求它们遵循OpenSpec工作流。了解更多关于 [AGENTS.md 规范](https://agents.md/)。

| 工具 |
|-------|
| Amp • Jules • 其他 |

</details>

### 安装与初始化

#### 前置要求
- **Node.js >= 20.19.0** - 使用 `node --version` 检查您的版本

#### 步骤1：全局安装CLI

```bash
npm install -g @studyzy/openspec-cn@latest
```
或者通过源码安装
```bash
git clone https://github.com/studyzy/OpenSpec-cn.git
cd OpenSpec-cn
make install
```

验证安装：
```bash
openspec-cn --version
```

#### 步骤2：在项目中初始化OpenSpec

导航到您的项目目录：
```bash
cd my-project
```

运行初始化：
```bash
openspec-cn init
```

**初始化过程中会发生什么：**
- 系统会提示您选择任何原生支持的AI工具（Claude Code、CodeBuddy、Cursor、OpenCode、Qoder等）；其他助手始终依赖共享的 `AGENTS.md` 存根
- OpenSpec会自动为您选择的工具配置斜杠命令，并始终在项目根目录写入受管理的 `AGENTS.md` 交接文件
- 在您的项目中创建一个新的 `openspec/` 目录结构

**设置完成后：**
- 主要AI工具可以触发 `/openspec` 工作流，无需额外配置
- 运行 `openspec-cn list` 来验证设置并查看任何活跃的变更
- 如果您的编程助手没有立即显示新的斜杠命令，请重新启动它。斜杠命令在启动时加载，因此重新启动可确保它们出现

### 可选：填充项目上下文

`openspec-cn init` 完成后，您将收到一个建议提示，帮助填充项目上下文：

```text
填充您的项目上下文：
"请阅读 openspec/project.md 并帮助我填写有关项目、技术栈和约定的详细信息"
```

使用 `openspec/project.md` 来定义项目级别的约定、标准、架构模式以及其他应在所有变更中遵循的指南。

### 简体中文版特点

本中文版提供完整的简体中文体验：

**已汉化内容：**
- ✅ 所有CLI命令的输出和提示信息
- ✅ 错误消息和警告
- ✅ 所有AI工具的斜杠命令模板（proposal、apply、archive）
- ✅ AGENTS.md 和 project.md 模板
- ✅ 交互式提示和确认消息
- ✅ 帮助文档和使用说明

**命令对比：**
| 功能 | 英文版 | 中文版 |
|------|--------|--------|
| 包名 | `@fission-ai/openspec` | `@studyzy/openspec-cn` |
| 命令 | `openspec` | `openspec-cn` |
| 列出变更 | `openspec list` | `openspec-cn list` |
| 初始化 | `openspec init` | `openspec-cn init` |
| 验证 | `openspec validate` | `openspec-cn validate` |

**兼容性：**
所有生成的文件结构、规范格式和工作流程与英文版完全兼容。您可以在团队中混合使用两个版本，只需根据个人偏好选择命令即可。

### 创建您的第一个变更

这是一个展示完整OpenSpec工作流程的真实示例。这适用于任何AI工具。具有原生斜杠命令的工具会自动识别快捷键。

#### 1. 起草提案
首先要求您的AI创建变更提案：

```text
您: 创建添加按角色和团队筛选配置文件搜索功能的OpenSpec变更提案
     (斜杠命令工具的快捷方式: /openspec:proposal 添加配置文件搜索筛选器)

AI: 我将为配置文件筛选器创建OpenSpec变更提案。
     *在 openspec/changes/add-profile-filters/ 中搭建proposal.md、tasks.md和规范增量*。
```

#### 2. 验证与审查
检查变更是否正确创建并审查提案：

```bash
$ openspec-cn list                             # 确认变更文件夹存在
$ openspec-cn validate add-profile-filters     # 验证规范格式
$ openspec-cn show add-profile-filters         # 审查提案、任务和规范增量
```

#### 3. 完善规范
反复迭代规范，直到满足您的需求：

```text
您: 能否为角色和团队筛选器添加验收标准？

AI: 我将更新规范增量，添加角色和团队筛选器的场景。
     *编辑 openspec/changes/add-profile-filters/specs/profile/spec.md 和 tasks.md*。
```

#### 4. 实施变更
一旦规范看起来不错，开始实施：

```text
您: 规范看起来不错。让我们实施这个变更。
     (斜杠命令工具的快捷方式: /openspec:apply add-profile-filters)

AI: 我将处理 add-profile-filters 变更中的任务。
     *从 openspec/changes/add-profile-filters/tasks.md 实施任务*
     *标记任务完成: 任务1.1 ✓, 任务1.2 ✓, 任务2.1 ✓...*
```

#### 5. 归档已完成的变更
实施完成后，归档变更：

```text
AI:  所有任务已完成。实施已准备就绪。

您: 请归档变更
     (斜杠命令工具的快捷方式: /openspec:archive add-profile-filters)

AI: 我将归档 add-profile-filters 变更。
    *运行: openspec-cn archive add-profile-filters --yes*
     ✓ 变更成功归档。规范已更新。准备下一个功能！
```

或者在终端中自己运行命令：
```bash
$ openspec-cn archive add-profile-filters --yes  # 无提示归档已完成的变更
```

**注意：** 具有原生斜杠命令的工具（Claude Code、CodeBuddy、Cursor、Codex、Qoder、RooCode）可以使用显示的快捷方式。所有其他工具都通过自然语言请求工作，如"创建OpenSpec提案"、"应用OpenSpec变更"或"归档变更"。

## 命令参考

```bash
openspec-cn list               # 查看活跃的变更文件夹
openspec-cn view               # 规范和变更的交互式仪表板
openspec-cn show <变更名称>     # 显示变更详情（提案、任务、规范更新）
openspec-cn validate <变更名称> # 检查规范格式和结构
openspec-cn archive <变更名称> [--yes|-y]   # 将完成的变更移动到archive/（使用--yes为非交互式）
```

## 示例：AI如何创建OpenSpec文件

当您要求AI助手"添加双因素认证"时，它会创建：

```
openspec/
├── specs/
│   └── auth/
│       └── spec.md           # 当前认证规范（如果存在）
└── changes/
    └── add-2fa/              # AI创建整个结构
        ├── proposal.md       # 为什么和什么变更
        ├── tasks.md          # 实施清单
        ├── design.md         # 技术决策（可选）
        └── specs/
            └── auth/
                └── spec.md   # 显示添加内容的增量
```

### AI生成的规范（在 `openspec/specs/auth/spec.md` 中创建）：

```markdown
# 认证规范

## 目的
认证和会话管理。

## 需求
### 需求： 用户认证
系统应在成功登录时签发JWT。

#### 场景: 有效凭据
- 当用户提交有效凭据时
- 则应返回JWT
```

### AI生成的变更增量（在 `openspec/changes/add-2fa/specs/auth/spec.md` 中创建）：

```markdown
# 认证增量

## 新增需求
### 需求： 双因素认证
系统必须在登录期间要求第二个因素。

#### 场景: 需要OTP
- 当用户提交有效凭据时
- 则需要OTP挑战
```

### AI生成的任务（在 `openspec/changes/add-2fa/tasks.md` 中创建）：

```markdown
## 1. 数据库设置
- [ ] 1.1 向用户表添加OTP密钥列
- [ ] 1.2 创建OTP验证日志表

## 2. 后端实现  
- [ ] 2.1 添加OTP生成端点
- [ ] 2.2 修改登录流程以要求OTP
- [ ] 2.3 添加OTP验证端点

## 3. 前端更新
- [ ] 3.1 创建OTP输入组件
- [ ] 3.2 更新登录流程UI
```

**重要提示：** 您无需手动创建这些文件。您的AI助手会根据您的需求和现有代码库生成它们。

## 理解OpenSpec文件

### 增量格式

增量是显示规范如何变化的"补丁"：

- **`## 新增需求`** - 新功能
- **`## 修改的需求`** - 更改的行为（包含完整的更新文本）
- **`## 移除的需求`** - 弃用的功能

**格式要求：**
- 使用 `### 需求： <名称>` 作为标题
- 每个需求至少需要一个 `#### 场景:` 块
- 在需求文本中使用SHALL/MUST

## How OpenSpec Compares（OpenSpec与其他方案对比）

### 对比 spec-kit
OpenSpec的双文件夹模型（`openspec/specs/` 用于当前真实状态，`openspec/changes/` 用于提案更新）将状态和差异分开。当您修改现有功能或涉及多个规范时，这种模型具有良好的扩展性。spec-kit在全新项目/0→1方面表现出色，但在跨规范更新和演进功能方面提供的结构较少。

### 对比 Kiro.dev
OpenSpec将每个功能的变更分组到一个文件夹中（`openspec/changes/功能名称/`），便于一起跟踪相关的规范、任务和设计。Kiro将更新分散到多个规范文件夹中，这可能会使功能跟踪更加困难。

### 对比无规范
没有规范的情况下，AI编程助手会根据模糊的提示生成代码，常常遗漏需求或添加不需要的功能。OpenSpec通过在编写任何代码之前就期望行为达成共识，带来了可预测性。

## 团队采用

1. **初始化OpenSpec** – 在您的仓库中运行 `openspec-cn init`。
2. **从新功能开始** – 要求您的AI将即将进行的工作捕获为变更提案。
3. **逐步增长** – 每个变更都会归档到记录您系统的活跃规范中。
4. **保持灵活性** – 不同的团队成员可以使用Claude Code、CodeBuddy、Cursor或任何AGENTS.md兼容的工具，同时共享相同的规范。

每当有人切换工具时，运行 `openspec-cn update`，以便您的代理获取最新的指令和斜杠命令绑定。

## 更新OpenSpec

1. **升级包**
   ```bash
   npm install -g @studyzy/openspec-cn@latest
   ```
2. **刷新代理指令**
   - 在每个项目中运行 `openspec-cn update`，重新生成AI指导并确保最新的斜杠命令处于活动状态。

## 贡献

- 安装依赖：`pnpm install`
- 构建：`pnpm run build`
- 测试：`pnpm test`
- 本地开发CLI：`pnpm run dev` 或 `pnpm run dev:cli`
- 约定式提交（单行）：`type(scope): subject`

## 许可证

MIT
