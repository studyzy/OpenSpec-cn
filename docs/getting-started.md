# 快速上手

本指南讲解你安装并初始化 OpenSpec 之后，它如何运作。安装说明请参阅[主 README](../README.md#quick-start)或[安装指南](installation.md)。对整个文档集不熟悉？[文档主页](README.md)为你梳理一切。

> **这些命令我该在哪里输入？** 两个地方，而把两者混淆是最常见的早期绊脚石。
>
> - `openspec ...` 命令（如 `openspec-cn init`）运行在你的**终端**中。
> - `/opsx:...` 命令（如 `/opsx:propose`）运行在你的 **AI 助手的聊天框**中，也就是你让它写代码时所在的那个输入框。
>
> 没有单独的"交互模式"需要启动。你只需在聊天中输入斜杠命令，你的助手会接手。完整解释见[命令如何运作](how-commands-work.md)。

## 你的头五分钟

完整循环，每步标注了它发生在哪里：

```text
TERMINAL   $ npm install -g @fission-ai/openspec@latest
TERMINAL   $ cd your-project && openspec-cn init
AI CHAT      /opsx:explore                    (可选：先理清思路)
AI CHAT      /opsx:propose add-dark-mode      (AI 起草计划；你评审它)
AI CHAT      /opsx:apply                      (AI 构建它)
AI CHAT      /opsx:archive                    (specs 已更新，变更已归档)
```

两步终端操作完成设置，然后你就在聊天里了。本指南的其余部分将拆解每个步骤做了什么，以及你会看到什么。

**Don't want to do the terminal part yourself?** Paste the [setup prompt](installation.md#install-with-your-ai-assistant) into your assistant and it handles both lines, then reports what it created.

> **还不确定要构建什么？从 `/opsx:explore` 开始。** 它是一个零负担的思考伙伴，会阅读你的代码库、权衡选项，并在任何制品或代码诞生之前把一个模糊的想法打磨成具体计划。当画面清晰时，它交接给 `/opsx:propose`。这是与一个否则会自信地构建出错误东西的 AI 共事时，单个最佳习惯。请参阅[探索指南](explore.md)。

## 它如何运作

OpenSpec 帮助你和你的 AI 编程助手在动笔写任何代码之前，就"构建什么"达成一致。

**默认快速路径（core profile）：**

```text
/opsx:explore ──► /opsx:propose ──► /opsx:apply ──► /opsx:sync ──► /opsx:archive
   (optional)
```

当你在琢磨要做什么时，从 `/opsx:explore` 开始；当你已经知道时，直接跳到 `/opsx:propose`。Explore 包含在默认 profile 中，所以你想用时它始终在那。

**扩展路径（自定义工作流选择）：**

```text
/opsx:new ──► /opsx:ff or /opsx:continue ──► /opsx:apply ──► /opsx:verify ──► /opsx:archive
```

默认的全局 profile 是 `core`，包含 `propose`、`explore`、`apply`、`update`, `sync` 和 `archive`。你可以用 `openspec-cn config profile` 启用扩展工作流命令，然后用 `openspec-cn update` 应用。

## OpenSpec 创建了什么

运行 `openspec-cn init` 之后，你的项目拥有如下结构：

```
openspec/
├── specs/              # 事实来源（你系统的行为）
│   └── <domain>/
│       └── spec.md
├── changes/            # 拟议的更新（每个变更一个文件夹）
│   └── <change-name>/
│       ├── proposal.md
│       ├── design.md
│       ├── tasks.md
│       └── specs/      # 增量规范（正在变化的内容）
│           └── <domain>/
│               └── spec.md
└── config.yaml         # 项目配置（可选）
```

**两个关键目录：**

- **`specs/`** - 事实来源。这些 specs 描述你的系统当前如何运作。按领域组织（例如 `specs/auth/`、`specs/payments/`）。

- **`changes/`** - 拟议的修改。每个变更获得自己的文件夹，内含所有相关制品。当变更完成时，它的 specs 合并进主 `specs/` 目录。

## 理解制品

每个变更文件夹包含指导工作的制品：

| 制品 | 用途 |
|----------|---------|
| `proposal.md` | "为何做"与"做什么"——捕获意图、范畴与方案 |
| `specs/` | 显示 ADDED/MODIFIED/REMOVED 需求的增量规范 |
| `design.md` | "如何做"——技术方案与架构决策 |
| `tasks.md` | 带勾选框的实现清单 |

**制品相互依托：**

```
proposal ──► specs ──► design ──► tasks ──► implement
   ▲           ▲          ▲                    │
   └───────────┴──────────┴────────────────────┘
            update as you learn
```

你总能回到实现过程中，随着学到更多而精炼更早的制品。

## 增量规范如何运作

增量规范是 OpenSpec 中的关键概念。它们展示相对于你当前 specs 正在变化的内容。

### 格式

增量规范使用小节来表明变更类型：

```markdown
# Delta for Auth

## ADDED Requirements

### Requirement: Two-Factor Authentication
The system MUST require a second factor during login.

#### Scenario: OTP required
- GIVEN a user with 2FA enabled
- WHEN the user submits valid credentials
- THEN an OTP challenge is presented

## MODIFIED Requirements

### Requirement: Session Timeout
The system SHALL expire sessions after 30 minutes of inactivity.
(Previously: 60 minutes)

#### Scenario: Idle timeout
- GIVEN an authenticated session
- WHEN 30 minutes pass without activity
- THEN the session is invalidated

## REMOVED Requirements

### Requirement: Remember Me
(Deprecated in favor of 2FA)
```

### 归档时发生了什么

当你归档一个变更时：

1. **ADDED** 需求被追加到主 spec
2. **MODIFIED** 需求替换现有版本
3. **REMOVED** 需求从主 spec 中删除

变更文件夹移入 `openspec/changes/archive/` 以留存审计历史。

## 示例：你的第一个变更

让我们走一遍为一个应用添加暗色模式的过程。

### 1. 启动变更（默认）

```text
You: /opsx:propose add-dark-mode

AI:  Created openspec/changes/add-dark-mode/
     ✓ proposal.md — why we're doing this, what's changing
     ✓ specs/       — requirements and scenarios
     ✓ design.md    — technical approach
     ✓ tasks.md     — implementation checklist
     Ready for implementation!
```

如果你已启用扩展工作流 profile，也可以分两步完成：`/opsx:new` 然后 `/opsx:ff`（或增量式地 `/opsx:continue`）。

### 2. 会创建什么

**proposal.md** - 捕获意图：

```markdown
# Proposal: Add Dark Mode

## Intent
Users have requested a dark mode option to reduce eye strain
during nighttime usage.

## Scope
- Add theme toggle in settings
- Support system preference detection
- Persist preference in localStorage

## Approach
Use CSS custom properties for theming with a React context
for state management.
```

**specs/ui/spec.md** - 展示新需求的增量：

```markdown
# Delta for UI

## ADDED Requirements

### Requirement: Theme Selection
The system SHALL allow users to choose between light and dark themes.

#### Scenario: Manual toggle
- GIVEN a user on any page
- WHEN the user clicks the theme toggle
- THEN the theme switches immediately
- AND the preference persists across sessions

#### Scenario: System preference
- GIVEN a user with no saved preference
- WHEN the application loads
- THEN the system's preferred color scheme is used
```

**tasks.md** - 实现清单：

```markdown
# Tasks

## 1. Theme Infrastructure
- [ ] 1.1 Create ThemeContext with light/dark state
- [ ] 1.2 Add CSS custom properties for colors
- [ ] 1.3 Implement localStorage persistence

## 2. UI Components
- [ ] 2.1 Create ThemeToggle component
- [ ] 2.2 Add toggle to settings page
- [ ] 2.3 Update Header to include quick toggle

## 3. Styling
- [ ] 3.1 Define dark theme color palette
- [ ] 3.2 Update components to use CSS variables
```

### 3. 实现

```
You: /opsx:apply

AI:  Working through tasks...
     ✓ 1.1 Created ThemeContext with light/dark state
     ✓ 1.2 Added CSS custom properties to globals.css
     ✓ 1.3 Implemented localStorage persistence
     ✓ 2.1 Created ThemeToggle component
     ...
     All tasks complete!
```

实现过程中，如果你发现设计需要调整，只需更新制品并继续。

### 4. 归档

```
You: /opsx:archive

AI:  Archiving add-dark-mode...
     ✓ Merged specs into openspec/specs/ui/spec.md
     ✓ Moved to openspec/changes/archive/2025-01-24-add-dark-mode/
     Done! Ready for the next feature.
```

你的增量规范现在成为主 specs 的一部分，记录着你的系统如何运作。

## 验证与审查

使用 CLI 检查你的变更：

```bash
# List active changes
openspec-cn list

# View change details
openspec-cn show add-dark-mode

# Validate spec formatting
openspec-cn validate add-dark-mode

# Interactive dashboard
openspec-cn view
```

## 下一步

- [先探索](explore.md) - 使用 `/opsx:explore` 在下定决心前想清楚一个想法
- [审查一个变更](reviewing-changes.md) - 在写任何代码前，检查 AI 起草的计划要看什么
- [编写好的 Specs](writing-specs.md) - 一个有力的需求与场景长什么样
- [在既有项目中使用 OpenSpec](existing-projects.md) - 从大型存量代码库起步
- [编辑与迭代一个变更](editing-changes.md) - 更新制品、回溯、调和手动编辑
- [核心概念一览](overview.md) - 一页纸的完整思维模型
- [示例与配方](examples.md) - 真实的变更，从头到尾
- [工作流](workflows.md) - 常见模式及各自适用场景
- [命令](commands.md) - 所有斜杠命令的完整参考
- [核心概念](concepts.md) - 对 specs、changes 与 schemas 更深入的理解
- [自定义](customization.md) - 让 OpenSpec 按你的方式运作
- [Stores](stores-beta/user-guide.md) - 规划跨仓库或跨团队？把它放在自己的仓库中（beta）
- [FAQ](faq.md) 与[故障排查](troubleshooting.md) - 当你卡住时
