# 快速上手

本指南介绍在你完成安装与初始化之后，OpenSpec 是如何工作的。安装说明请参见 [主 README](../README.md#quick-start)。

## 工作原理

OpenSpec 帮助你与 AI 编码助手在**写代码之前**就先对“要构建什么”达成一致。整体流程遵循一个简单的模式：

```
┌────────────────────┐
│ 开始变更           │  /opsx:new
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ 创建制品           │  /opsx:ff 或 /opsx:continue
│ (proposal, specs,  │
│  design, tasks)    │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ 实施任务           │  /opsx:apply
│ (AI 编写代码)      │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ 归档并合并规范     │  /opsx:archive
└────────────────────┘
```

## OpenSpec 创建的内容

在运行 `openspec-cn init` 后，你的项目会拥有如下结构：

```
openspec/
├── specs/              # 单一事实来源（系统的行为）
│   └── <domain>/
│       └── spec.md
├── changes/            # 提议的更新（每个变更一个文件夹）
│   └── <change-name>/
│       ├── proposal.md
│       ├── design.md
│       ├── tasks.md
│       └── specs/      # 增量规范（正在变更的内容）
│           └── <domain>/
│               └── spec.md
└── config.yaml         # 项目配置（可选）
```

**两个关键目录：**

- **`specs/`** - 单一事实来源。这些规范描述了你系统当前的行为。按领域组织（例如 `specs/auth/`、`specs/payments/`）。

- **`changes/`** - 提议的修改。每个变更都有自己的文件夹，包含所有相关制品。当变更完成时，其规范会合并到主 `specs/` 目录中。

## 理解制品

每个变更文件夹包含用于指导工作的制品：

| 制品 | 用途 |
|----------|---------|
| `proposal.md` | "为什么"和"做什么" - 捕获意图、范围和方法 |
| `specs/` | 增量规范，显示新增/修改/删除的需求 |
| `design.md` | "如何做" - 技术方法和架构决策 |
| `tasks.md` | 带复选框的实施清单 |

**制品相互构建：**

```
proposal ──► specs ──► design ──► tasks ──► implement
   ▲           ▲          ▲                    │
   └───────────┴──────────┴────────────────────┘
            在学习过程中更新
```

在实施过程中，你可以随时返回并完善之前的制品。

## 增量规范如何工作

增量规范是 OpenSpec 的核心概念。它们显示相对于当前规范正在变化的内容。

### 格式

增量规范使用章节来指示变更类型：

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

### 归档时会发生什么

当你归档一个变更时：

1. **ADDED** 需求被追加到主规范
2. **MODIFIED** 需求替换现有版本
3. **REMOVED** 需求从主规范中删除

变更文件夹移动到 `openspec/changes/archive/` 用于审计历史。

## 示例：你的第一个变更

让我们逐步介绍如何为应用程序添加深色模式。

### 1. 开始变更

```
你：/opsx:new add-dark-mode

AI：已创建 openspec/changes/add-dark-mode/
     准备创建：proposal
```

### 2. 创建制品

使用 `/opsx:ff`（快进）一次性创建所有规划制品：

```
你：/opsx:ff

AI：正在为 add-dark-mode 创建制品...
     ✓ proposal.md — 为什么要做这个，有什么变化
     ✓ specs/       — 需求和场景
     ✓ design.md    — 技术方法
     ✓ tasks.md     — 实施清单
     准备实施！
```

### 3. 创建的内容

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

**specs/ui/spec.md** - 显示新需求的增量规范：

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

**tasks.md** - 实施清单：

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

### 4. Implement

```
你：/opsx:apply

AI：正在处理任务...
     ✓ 1.1 创建了带浅色/深色状态的 ThemeContext
     ✓ 1.2 添加了 CSS 自定义属性到 globals.css
     ✓ 1.3 实现了 localStorage 持久化
     ✓ 2.1 创建了 ThemeToggle 组件
     ...
     所有任务完成！
```

在实施过程中，如果你发现设计需要调整，只需更新制品然后继续。

### 5. Archive

```
你：/opsx:archive

AI：正在归档 add-dark-mode...
     ✓ 已将规范合并到 openspec/specs/ui/spec.md
     ✓ 已移动到 openspec/changes/archive/2025-01-24-add-dark-mode/
     完成！准备下一个功能。
```

你的增量规范现在是主规范的一部分，记录了你系统的工作方式。

## 验证和审查

使用 CLI 检查你的变更：

```bash
# 列出活动变更
openspec-cn list

# 查看变更详情
openspec-cn show add-dark-mode

# 验证规范格式
openspec-cn validate add-dark-mode

# 交互式仪表盘
openspec-cn view
```

## 下一步

- [工作流](workflows.md) - 常见模式以及何时使用每个命令
- [命令](commands.md) - 所有斜杠命令的完整参考
- [概念](concepts.md) - 深入理解规范、变更和模式
- [自定义](customization.md) - 让 OpenSpec 按你的方式工作
