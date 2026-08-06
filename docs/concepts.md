# 核心概念

本指南讲解 OpenSpec 背后的核心理念，以及它们如何组合在一起。如需实际使用说明，请参阅[快速上手](getting-started.md)与[工作流](workflows.md)。

## 设计哲学

OpenSpec 建立在四条原则之上：

```
fluid not rigid         — 不僵化分阶，按有意义的方式推进工作
iterative not waterfall — 边构建边学习，持续改进
easy not complex        — 轻量配置，最少仪式感
brownfield-first        — 既适配已有代码库，也支持全新项目
```

### 为何这些原则重要

**灵活而非僵化。** 传统的规范系统把你锁死在阶段里：先规划，再实现，然后就结束。OpenSpec 更灵活——你可以按工作所需的任意顺序创建制品。

**迭代而非瀑布。** 需求会变，理解会加深。开始时看似不错的方案，看到代码库后可能就站不住脚了。OpenSpec 拥抱这一现实。

**简单而非复杂。** 有些规范框架需要大量配置、刻板格式或沉重流程。OpenSpec 不挡你的路。几秒完成初始化，立即开工，仅在需要时再做定制。

**存量优先(brownfield-first)。** 大多数软件工作不是从零开始，而是修改既有系统。OpenSpec 基于增量的方法让你能轻松描述对既有行为的变更，而非只能描述新系统。

## 全局概览

OpenSpec 将你的工作组织为两大区域：

```
┌────────────────────────────────────────────────────────────────────┐
│                        openspec/                                   │
│                                                                    │
│   ┌─────────────────────┐      ┌───────────────────────────────┐   │
│   │       specs/        │      │         changes/              │   │
│   │                     │      │                               │   │
│   │  事实来源            │◄─────│  拟议的修改                     │   │
│   │  系统当前            │ 合并  │  每个变更 = 一个文件夹          │   │
│   │  的行为              │      │  包含制品 + 增量规范            │   │
│   │                     │      │                               │   │
│   └─────────────────────┘      └───────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Specs** 是事实来源——描述你的系统当前如何运作。

**Changes** 是拟议的修改——它们存放在独立的文件夹中，直到你准备将其合并。

这种分离是关键。你可以在并行处理多个变更而互不冲突；你可以在变更影响主 specs 之前先审查它；而当变更被归档时，它的增量会干净地合并进事实来源。

## Specs

Specs 用结构化的需求与场景来描述你的系统行为。

### 结构

```
openspec/specs/
├── auth/
│   └── spec.md           # 认证行为
├── payments/
│   └── spec.md           # 支付处理
├── notifications/
│   └── spec.md           # 通知系统
└── ui/
    └── spec.md           # UI 行为与主题
```

按领域来组织 specs——对你的系统而言有意义的逻辑分组。常见模式：

- **按功能区域**：`auth/`、`payments/`、`search/`
- **按组件**：`api/`、`frontend/`、`workers/`
- **按限界上下文**：`ordering/`、`fulfillment/`、`inventory/`

### Spec 格式

一个 spec 包含需求，而每个需求都有场景：

```markdown
# Auth Specification

## Purpose
Authentication and session management for the application.

## Requirements

### Requirement: User Authentication
The system SHALL issue a JWT token upon successful login.

#### Scenario: Valid credentials
- GIVEN a user with valid credentials
- WHEN the user submits login form
- THEN a JWT token is returned
- AND the user is redirected to dashboard

#### Scenario: Invalid credentials
- GIVEN invalid credentials
- WHEN the user submits login form
- THEN an error message is displayed
- AND no token is issued

### Requirement: Session Expiration
The system MUST expire sessions after 30 minutes of inactivity.

#### Scenario: Idle timeout
- GIVEN an authenticated session
- WHEN 30 minutes pass without activity
- THEN the session is invalidated
- AND the user must re-authenticate
```

**关键要素：**

| 要素 | 用途 |
|---------|---------|
| `## Purpose` | 对本 spec 所属领域的高层描述 |
| `### Requirement:` | 系统必须具备的具体行为 |
| `#### Scenario:` | 该需求付诸行动的具体示例 |
| SHALL/MUST/SHOULD | RFC 2119 关键词，表示需求的强度 |

### 为何如此组织 Spec

**需求是"做什么"**——陈述系统应当做什么，而不指定实现。

**场景是"在何时"**——提供可验证的具体示例。好的场景：
- 可测试（你可以为它们编写自动化测试）
- 覆盖正常路径与边界情况
- 使用 Given/When/Then 或类似的结构化格式

**RFC 2119 关键词**（SHALL, MUST, SHOULD, MAY）传达意图：
- **MUST/SHALL** — 绝对要求
- **SHOULD** — 推荐，但允许例外
- **MAY** — 可选

### 什么是 Spec（以及什么不是）

Spec 是一个**行为契约**，而非实现计划。

好的 spec 内容：
- 用户或下游系统所依赖的可观察行为
- 输入、输出与错误条件
- 外部约束（安全、隐私、可靠性、兼容性）
- 可测试或明确可验证的场景

spec 中应避免：
- 内部类/函数名
- 库或框架选型
- 逐步实现细节
- 详细的执行计划（这些属于 `design.md` 或 `tasks.md`）

快速检验：
- 如果实现可以更改而不改变对外可见的行为，那它很可能不应出现在 spec 中。

### 保持轻量：渐进式严谨

OpenSpec 力求避免官僚主义。使用仍能令变更可验证的最轻量级别。

**轻量 spec（默认）：**
- 简短的、行为优先的需求
- 明确的范畴与非目标
- 少量具体的验收检查

**完整 spec（用于更高风险）：**
- 跨团队或跨仓库的变更
- API/契约变更、迁移、安全/隐私问题
- 模糊性可能导致昂贵返工重写

大多数变更应保持在轻量模式。

### 人与 Agent 协作

在许多团队中，人类负责探索，Agent 负责起草制品。预期的循环是：

1. 人类提供意图、上下文与约束。
2. Agent 将其转换为行为优先的需求与场景。
3. Agent 将实现细节保留在 `design.md` 和 `tasks.md` 中，而非 `spec.md`。
4. 验证在实现前确认结构清晰。

这让 spec 对人类可读，对 Agent 一致。

## Changes

变更是对系统的拟议修改，打包为一个文件夹，包含理解并实现它所需的一切。

### 变更结构

```
openspec/changes/add-dark-mode/
├── proposal.md           # Why and what
├── design.md             # How (technical approach)
├── tasks.md              # Implementation checklist
├── .openspec.yaml        # Change metadata (optional): schema, created, skip_specs, retire_capabilities
└── specs/                # Delta specs
    └── ui/
        └── spec.md       # ui/spec.md 中正在变化的内容
```

每个变更都是自包含的。它拥有：
- **Artifacts（制品）** — 捕获意图、设计与任务的文档
- **Delta specs（增量规范）** — 关于正在新增、修改或删除内容的规格说明
- **Metadata（元数据）** — 针对该特定变更的可选配置

### 为何变更是文件夹

将变更打包为文件夹有诸多好处：

1. **一切集中。** proposal、design、tasks 与 specs 同处一处。无需在不同位置间翻找。

2. **并行工作。** 多个变更可同时存在而互不冲突。在 `fix-auth-bug` 进行中的同时处理 `add-dark-mode`。

3. **清晰的历史。** 归档时，变更连同其完整上下文一起移入 `changes/archive/`。你可以回看，理解不仅改变了什么，还有为何改变。

4. **便于审查。** 变更文件夹易于审查——打开它，读 proposal，查 design，看 spec 增量。

## Artifacts

制品是变更内部指导工作的文档。

### 制品流转

```
proposal ──────► specs ──────► design ──────► tasks ──────► implement
    │               │             │              │
   why            what           how          steps
 + scope        changes       approach      to take
```

制品相互依托。每个制品为下一个制品提供上下文。

### 制品类型

#### Proposal (`proposal.md`)

proposal 在高层捕获**意图**、**范畴**与**方案**。

```markdown
# Proposal: Add Dark Mode

## Intent
Users have requested a dark mode option to reduce eye strain
during nighttime usage and match system preferences.

## Scope
In scope:
- Theme toggle in settings
- System preference detection
- Persist preference in localStorage

Out of scope:
- Custom color themes (future work)
- Per-page theme overrides

## Approach
Use CSS custom properties for theming with a React context
for state management. Detect system preference on first load,
allow manual override.
```

**何时更新 proposal：**
- 范畴变化（收窄或扩大）
- 意图澄清（对问题有了更好的理解）
- 方案发生根本性转变

#### Specs（位于 `specs/` 中的 delta specs）

增量规范描述的是**正在变化的内容**，相对于当前 specs。详见下方[增量规范](#增量规范)。

#### Design (`design.md`)

design 捕获**技术方案**与**架构决策**。

````markdown
# Design: Add Dark Mode

## Technical Approach
Theme state managed via React Context to avoid prop drilling.
CSS custom properties enable runtime switching without class toggling.

## Architecture Decisions

### Decision: Context over Redux
Using React Context for theme state because:
- Simple binary state (light/dark)
- No complex state transitions
- Avoids adding Redux dependency

### Decision: CSS Custom Properties
Using CSS variables instead of CSS-in-JS because:
- Works with existing stylesheet
- No runtime overhead
- Browser-native solution

## Data Flow
```
ThemeProvider (context)
       │
       ▼
ThemeToggle ◄──► localStorage
       │
       ▼
CSS Variables (applied to :root)
```

## File Changes
- `src/contexts/ThemeContext.tsx` (new)
- `src/components/ThemeToggle.tsx` (new)
- `src/styles/globals.css` (modified)
````

**何时更新 design：**
- 实现揭示方案行不通
- 发现了更好的解法
- 依赖或约束发生变化

#### Tasks (`tasks.md`)

tasks 是**实现清单**——带勾选框的具体步骤。

```markdown
# Tasks

## 1. Theme Infrastructure
- [ ] 1.1 Create ThemeContext with light/dark state
- [ ] 1.2 Add CSS custom properties for colors
- [ ] 1.3 Implement localStorage persistence
- [ ] 1.4 Add system preference detection

## 2. UI Components
- [ ] 2.1 Create ThemeToggle component
- [ ] 2.2 Add toggle to settings page
- [ ] 2.3 Update Header to include quick toggle

## 3. Styling
- [ ] 3.1 Define dark theme color palette
- [ ] 3.2 Update components to use CSS variables
- [ ] 3.3 Test contrast ratios for accessibility
```

**任务最佳实践：**
- 在标题下对相关任务进行分组
- 使用层级编号（1.1、1.2 等）
- 保持任务足够小，可在一次会话内完成
- 完成后勾选任务

## 增量规范 (Delta Specs)

增量规范是让 OpenSpec 适用于存量（brownfield）开发的关键概念。它们描述**正在变化的内容**，而非复述整个 spec。

### 格式

```markdown
# Delta for Auth

## ADDED Requirements

### Requirement: Two-Factor Authentication
The system MUST support TOTP-based two-factor authentication.

#### Scenario: 2FA enrollment
- GIVEN a user without 2FA enabled
- WHEN the user enables 2FA in settings
- THEN a QR code is displayed for authenticator app setup
- AND the user must verify with a code before activation

#### Scenario: 2FA login
- GIVEN a user with 2FA enabled
- WHEN the user submits valid credentials
- THEN an OTP challenge is presented
- AND login completes only after valid OTP

## MODIFIED Requirements

### Requirement: Session Expiration
The system MUST expire sessions after 15 minutes of inactivity.
(Previously: 30 minutes)

#### Scenario: Idle timeout
- GIVEN an authenticated session
- WHEN 15 minutes pass without activity
- THEN the session is invalidated

## REMOVED Requirements

### Requirement: Remember Me
(Deprecated in favor of 2FA. Users should re-authenticate each session.)
```

### 增量小节

| 小节 | 含义 | 归档时发生什么 |
|---------|---------|------------------------|
| `## ADDED Requirements` | New behavior | Appended to main spec |
| `## MODIFIED Requirements` | Changed behavior | Replaces existing requirement |
| `## REMOVED Requirements` | Deprecated behavior | Deleted from main spec; removing the last requirement retires the capability and deletes its spec file, when the change declares `retire_capabilities: true` |
| `## Purpose` | What a brand-new capability is for | Seeds the Purpose of the main spec being created; ignored when the spec already exists |

### 为何用增量而非完整 Spec

**清晰。** 增量精确展示正在改变的内容。若读一个完整 spec，你不得不在脑中把它与当前版本做 diff。

**避免冲突。** 两个变更可以触及同一个 spec 文件而互不冲突，只要它们修改的是不同需求。

**审查高效。** 审查者看到的是变更，而非未变化的上下文。聚焦于要紧之处。

**适配存量。** 大多数工作修改既有行为。增量让修改成为一等公民，而非事后补丁。

## Schemas

schemas 定义了一个工作流中的制品类型及其依赖关系。

### Schema 如何运作

```yaml
# openspec/schemas/spec-driven/schema.yaml
name: spec-driven
artifacts:
  - id: proposal
    generates: proposal.md
    requires: []              # No dependencies, can create first

  - id: specs
    generates: specs/**/*.md
    requires: [proposal]      # Needs proposal before creating

  - id: design
    generates: design.md
    requires: [proposal]      # Can create in parallel with specs

  - id: tasks
    generates: tasks.md
    requires: [specs, design] # Needs both specs and design first
```

**制品构成一个依赖图：**

```
                    proposal
                   (root node)
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
      specs                       design
   (requires:                  (requires:
    proposal)                   proposal)
         │                           │
         └─────────────┬─────────────┘
                       │
                       ▼
                    tasks
                (requires:
                specs, design)
```

**依赖是促成因素，而非关卡。** 它们展示的是可以创建什么，而非你必须接下来创建什么。如果不需要，你可以跳过 design。你可以先创建 specs 也可以后创建——两者都只依赖 proposal。

### 内置 Schemas

**spec-driven**（默认）

规范驱动开发的标准工作流：

```
proposal → specs → design → tasks → implement
```

最适合：想要在实现前先就 specs 达成一致的大多数功能开发工作。

### 自定义 Schemas

为你的团队工作流创建自定义 schemas：

```bash
# Create from scratch
openspec-cn schema init research-first

# Or fork an existing one
openspec-cn schema fork spec-driven research-first
```

**自定义 schema 示例：**

```yaml
# openspec/schemas/research-first/schema.yaml
name: research-first
artifacts:
  - id: research
    generates: research.md
    requires: []           # Do research first

  - id: proposal
    generates: proposal.md
    requires: [research]   # Proposal informed by research

  - id: tasks
    generates: tasks.md
    requires: [proposal]   # Skip specs/design, go straight to tasks
```

有关创建与使用自定义 schemas 的完整细节，请参阅[自定义](customization.md)。

## Archive

归档通过将其增量规范合并进主 specs，并保留变更以留存历史，从而完成一个变更。

### 归档时发生了什么

```
Before archive:

openspec/
├── specs/
│   └── auth/
│       └── spec.md ◄────────────────┐
└── changes/                         │
    └── add-2fa/                     │
        ├── proposal.md              │
        ├── design.md                │ merge
        ├── tasks.md                 │
        └── specs/                   │
            └── auth/                │
                └── spec.md ─────────┘


After archive:

openspec/
├── specs/
│   └── auth/
│       └── spec.md        # Now includes 2FA requirements
└── changes/
    └── archive/
        └── 2025-01-24-add-2fa/    # Preserved for history
            ├── proposal.md
            ├── design.md
            ├── tasks.md
            └── specs/
                └── auth/
                    └── spec.md
```

### 归档流程

1. **合并增量。** 每个增量规范小节（ADDED/MODIFIED/REMOVED）被应用到对应的主 spec。

2. **移入归档。** 变更文件夹移入 `changes/archive/`，并带日期前缀以便按时间排序。

3. **保留上下文。** 所有制品在归档中保持完整。你随时可以回看，理解一个变更为何被做出。

### 为何归档很重要

**干净的状态。** 活跃变更（`changes/`）只展示进行中的工作。已完成的工作被移开。

**审计追踪。** 归档保留了每个变更的完整上下文——不仅是改变了什么，还有解释为何而做的 proposal、解释如何而做的 design，以及展示已完成工作的 tasks。

**Spec 演进。** 随着变更被归档，specs 有机地增长。每次归档合并其增量，随时间积累出一份全面的规格说明。

## 它们如何融为一体

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              OPENSPEC FLOW                                   │
│                                                                              │
│   ┌────────────────┐                                                         │
│   │  1. START      │  /opsx:propose (core) or /opsx:new (expanded)           │
│   │     CHANGE     │                                                         │
│   └───────┬────────┘                                                         │
│           │                                                                  │
│           ▼                                                                  │
│   ┌────────────────┐                                                         │
│   │  2. CREATE     │  /opsx:ff or /opsx:continue (expanded workflow)         │
│   │     ARTIFACTS  │  Creates proposal → specs → design → tasks              │
│   │                │  (based on schema dependencies)                         │
│   └───────┬────────┘                                                         │
│           │                                                                  │
│           ▼                                                                  │
│   ┌────────────────┐                                                         │
│   │  3. IMPLEMENT  │  /opsx:apply                                            │
│   │     TASKS      │  Work through tasks, checking them off                  │
│   │                │◄──── Update artifacts as you learn                      │
│   └───────┬────────┘                                                         │
│           │                                                                  │
│           ▼                                                                  │
│   ┌────────────────┐                                                         │
│   │  4. VERIFY     │  /opsx:verify (optional)                                │
│   │     WORK       │  Check implementation matches specs                     │
│   └───────┬────────┘                                                         │
│           │                                                                  │
│           ▼                                                                  │
│   ┌────────────────┐     ┌──────────────────────────────────────────────┐    │
│   │  5. ARCHIVE    │────►│  Delta specs merge into main specs           │    │
│   │     CHANGE     │     │  Change folder moves to archive/             │    │
│   └────────────────┘     │  Specs are now the updated source of truth   │    │
│                          └──────────────────────────────────────────────┘    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**良性循环：**

1. Specs 描述当前行为
2. Changes 以增量形式拟议修改
3. 实现让变更成为现实
4. 归档将增量合并进 specs
5. Specs 现在描述了新行为
6. 下一个变更基于更新后的 specs 构建

## 术语表

| 术语 | 定义 |
|------|------------|
| **Artifact** | 变更内部的一个文档（proposal、design、tasks 或 delta specs） |
| **Archive** | 完成一个变更并将其增量合并进主 specs 的流程 |
| **Change** | 对系统的拟议修改，打包为一个带有制品的文件夹 |
| **Delta spec** | 描述相对于当前 specs 的变更（ADDED/MODIFIED/REMOVED）的 spec |
| **Domain** | specs 的逻辑分组（例如 `auth/`、`payments/`） |
| **Requirement** | 系统必须具备的具体行为 |
| **Scenario** | 需求的具体示例，通常采用 Given/When/Then 格式 |
| **Schema** | 制品类型及其依赖关系的定义 |
| **Spec** | 描述系统行为的规格说明，包含需求与场景 |
| **Source of truth** | `openspec/specs/` 目录，包含当前约定的行为 |

## 下一步

- [快速上手](getting-started.md) - 实操第一步
- [工作流](workflows.md) - 常见模式及各自适用场景
- [命令](commands.md) - 完整命令参考
- [自定义](customization.md) - 创建自定义 schemas 并配置你的项目
