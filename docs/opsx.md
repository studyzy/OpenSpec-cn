# OPSX 工作流

> 欢迎在 [Discord](https://discord.gg/YctCnvvshC) 上提供反馈。

## 它是什么？

OPSX 现在是 OpenSpec 的标准工作流。

它是一个用于 OpenSpec 变更的**流动、迭代式工作流**。不再有僵化的阶段——只有你可以随时随地采取的动作。

## 为何存在

遗留的 OpenSpec 工作流能用，但它是**锁死的**：

- **指令是硬编码的** — 埋在 TypeScript 中，你无法更改
- **要么全有要么全无** — 一个大命令创建一切，无法单独测试各部分
- **固定结构** — 对每个人都一样的工作流，无法定制
- **黑盒** — 当 AI 输出糟糕时，你无法微调提示

**OPSX 把它打开。** 现在任何人都可以：

1. **试验指令** — 编辑一个模板，看 AI 是否做得更好
2. **细粒度测试** — 独立验证每个制品的指令
3. **定制工作流** — 定义你自己的制品与依赖关系
4. **快速迭代** — 改一个模板，立即测试，无需重新构建

```
Legacy workflow:                      OPSX:
┌────────────────────────┐           ┌────────────────────────┐
│  Hardcoded in package  │           │  schema.yaml           │◄── You edit this
│  (can't change)        │           │  templates/*.md        │◄── Or this
│        ↓               │           │        ↓               │
│  Wait for new release  │           │  Instant effect        │
│        ↓               │           │        ↓               │
│  Hope it's better      │           │  Test it yourself      │
└────────────────────────┘           └────────────────────────┘
```

**这是给每个人的：**
- **团队** — 创建契合你们实际工作方式的工作流
- **高级用户** — 微调提示，为你的代码库获得更好的 AI 输出
- **OpenSpec 贡献者** — 无需发版就能试验新方法

我们都还在学习什么最有效。OPSX 让我们共同学习。

## 用户体验

**线性工作流的问题：**
你"处于规划阶段"，然后"处于实现阶段"，然后"完成"。但真实工作不是那样运作的。你实现某物，意识到设计错了，需要更新 specs，继续实现。线性阶段与工作的真实发生方式相抵触。

**OPSX 的做法：**
- **动作，而非阶段** — 创建、实现、更新、归档——随时可做其中任意一个
- **依赖是促成因素** — 它们展示什么是可能的，而非下一个必须做什么

```
  proposal ──→ specs ──→ design ──→ tasks ──→ implement
```

## 设置

```bash
# Make sure you have openspec-cn installed — skills are automatically generated
openspec-cn init
```

这会在 `.claude/skills/`（或等效位置）创建 skills，AI 编程助手会自动检测它们。

默认情况下，OpenSpec 使用 `core` 工作流 profile（`propose`、`explore`、`apply`、`update`, `sync`、`archive`）。如果你想要扩展工作流命令（`new`、`continue`、`ff`、`verify`、`bulk-archive`、`onboard`），用 `openspec-cn config profile` 配置它们，并用 `openspec-cn update` 应用。

在设置过程中，你会被提示创建一个**项目配置**（`openspec/config.yaml`）。这是可选的，但推荐。

## 项目配置

项目配置让你设置默认值，并将项目特定的上下文注入到所有制品中。

### 创建配置

配置在 `openspec-cn init` 期间创建，或手动创建：

```yaml
# openspec/config.yaml
schema: spec-driven

context: |
  Tech stack: TypeScript, React, Node.js
  API conventions: RESTful, JSON responses
  Testing: Vitest for unit tests, Playwright for e2e
  Style: ESLint with Prettier, strict TypeScript

rules:
  proposal:
    - Include rollback plan
    - Identify affected teams
  specs:
    - Use Given/When/Then format for scenarios
  design:
    - Include sequence diagrams for complex flows
```

### 配置字段

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| `schema` | string | 新变更的默认 schema（例如 `spec-driven`） |
| `context` | string | 注入所有制品指令的项目上下文 |
| `rules` | object | 按制品 ID 索引的、每制品规则 |

### 它如何运作

**Schema 优先级**（从高到低）：
1. CLI 标志（`--schema <name>`）
2. 变更元数据（变更目录中的 `.openspec.yaml`）
3. 项目配置（`openspec/config.yaml`）
4. 默认（`spec-driven`）

**上下文注入：**
- 上下文被前置到每个制品的指令中
- 包裹在 `<context>...</context>` 标签中
- 帮助 AI 理解你项目的约定

**规则注入：**
- 规则只注入给匹配的制品
- 包裹在 `<rules>...</rules>` 标签中
- 出现在上下文之后、模板之前

### 各 Schema 的制品 ID

**spec-driven**（默认）：
- `proposal` — 变更提案
- `specs` — 规格说明
- `design` — 技术设计
- `tasks` — 实现任务

### 配置验证

- `rules` 中未知的制品 ID 会产生警告
- schema 名称会对照可用 schemas 进行校验
- 上下文有 50KB 大小限制
- 无效的 YAML 会附带行号报告

### 故障排查

**"Unknown artifact ID in rules: X"**
- 检查制品 ID 与你的 schema 匹配（见上方列表）
- 运行 `openspec-cn schemas --json` 查看每个 schema 的制品 ID

**配置未被应用：**
- 确保文件位于 `openspec/config.yaml`（而非 `.yml`）
- 用校验器检查 YAML 语法
- 配置更改立即生效（无需重启）

**上下文过大：**
- 上下文限制为 50KB
- 改为总结或链接到外部文档

## 命令

| 命令 | 它做什么 |
|---------|--------------|
| `/opsx:propose` | 一步创建变更并生成规划制品（默认快速路径） |
| `/opsx:explore` | 想清楚想法、调查问题、厘清需求 |
| `/opsx:new` | 启动一个新的变更脚手架（扩展工作流） |
| `/opsx:continue` | 创建下一个制品（扩展工作流） |
| `/opsx:ff` | 快速推进规划制品（扩展工作流） |
| `/opsx:apply` | 实现任务，按需更新制品 |
| `/opsx:update` | 修订一个变更的规划制品并保持一致 |
| `/opsx:verify` | 对照制品验证实现（扩展工作流） |
| `/opsx:sync` | 将增量规范合并到主 specs（可选） |
| `/opsx:archive` | 完成时归档 |
| `/opsx:bulk-archive` | 归档多个已完成的变更（扩展工作流） |
| `/opsx:onboard` | 端到端变更的引导式走查（扩展工作流） |

## 用法

### 探索一个想法
```
/opsx:explore
```
想清楚想法、调查问题、比较选项。无需结构——只是一个思考伙伴。当洞见结晶时，过渡到 `/opsx:propose`（默认）或 `/opsx:new`/`/opsx:ff`（扩展）。

### 启动一个新变更
```
/opsx:propose
```
创建变更并生成实现前所需的规划制品。

如果你已启用扩展工作流，也可以改用：

```text
/opsx:new        # scaffold only
/opsx:continue   # create one artifact at a time
/opsx:ff         # create all planning artifacts at once
```

### 创建制品
```
/opsx:continue
```
根据依赖关系展示已准备好创建的内容，然后创建一个制品。重复使用以增量式构建你的变更。

```
/opsx:ff add-dark-mode
```
一次性创建所有规划制品。当你对已构建之物有清晰画面时使用。

### 实现（流动的部分）
```
/opsx:apply
```
逐步完成任务，边走边勾选。如果你在同时处理多个变更，可以运行 `/opsx:apply <name>`；否则它应根据对话推断，若无法判断则提示你选择。

### 更新一个变更
```
/opsx:update add-dark-mode - we're storing the theme in a cookie now
```
修订变更既有的规划制品并保持一致——可朝任意方向（一处 design 编辑可能回荡到 proposal）。仅限规划制品：它从不编辑代码，也从不创建缺失的制品（那是 `/opsx:continue`）。每次编辑都先与你确认。如果变更已实现，它会建议 `/opsx:apply` 以便代码追上修订后的计划。若你的修订改变了变更的*意图*，则重新开始——见[何时更新 vs. 重新开始](#何时更新-vs-重新开始)。

### 同步增量规范（sync delta specs）
```text
/opsx:sync
```
将当前变更的增量规范合并进你的主 `openspec/specs/` 而不归档——变更保持活跃。它会应用整个增量：`## REMOVED` 下的需求会从主 spec 中删除，被重命名的需求会被就地改标题，而增量未提及的内容则保持不变。同步是可选的——如果你还没同步，归档时会提示你先同步。当你希望在归档前更新主 specs、当并行变更需要建立在本次新增的 specs 之上、或当你希望在归档前审查合并后的主 spec 时，使用它。

### 收尾
```
/opsx:archive   # Move to archive when done (prompts to sync specs if needed)
```

## 何时更新 vs. 重新开始

你总能在实现前编辑你的 proposal 或 specs。但何时精炼会变成"这是不同的工作"？

### 一份 Proposal 捕获什么

一份 proposal 定义三件事：
1. **意图** — 你在解决什么问题？
2. **范畴** — 什么在边界内/外？
3. **方案** — 你将如何解决它？

问题是：哪个变了，变了多少？

### 更新既有变更当：

**意图相同，执行被精炼**
- 你发现了未曾考虑的边界情况
- 方案需要微调，但目标未变
- 实现揭示设计略有偏差

**范畴收窄**
- 你意识到完整范畴太大，想先交付 MVP
- "Add dark mode" → "Add dark mode toggle (system preference in v2)"

**学习驱动的修正**
- 代码库的结构并非如你所想
- 某个依赖未按预期工作
- "Use CSS variables" → "Use Tailwind's dark: prefix instead"

### 开始一个新变更当：

**意图根本性改变**
- 问题本身现在不同了
- "Add dark mode" → "Add comprehensive theme system with custom colors, fonts, spacing"

**范畴爆炸**
- 变更增长太多，实质上成了不同的工作
- 原 proposal 更新后将面目全非
- "Fix login bug" → "Rewrite auth system"

**原变更可完成**
- 原变更可被标记为"done"
- 新工作独立存在，而非精炼
- 完成 "Add dark mode MVP" → 归档 → 新变更 "Enhance dark mode"

### 启发式

```
                        ┌─────────────────────────────────────┐
                        │     Is this the same work?          │
                        └──────────────┬──────────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
             Same intent?      >50% overlap?      Can original
             Same problem?     Same scope?        be "done" without
                    │                  │          these changes?
                    │                  │                  │
          ┌────────┴────────┐  ┌──────┴──────┐   ┌───────┴───────┐
          │                 │  │             │   │               │
         YES               NO YES           NO  NO              YES
          │                 │  │             │   │               │
          ▼                 ▼  ▼             ▼   ▼               ▼
       UPDATE            NEW  UPDATE       NEW  UPDATE          NEW
```

| 测试 | 更新 | 新变更 |
|------|--------|------------|
| **同一性** | "Same thing, refined" | "Different work" |
| **范畴重叠** | >50% 重叠 | <50% 重叠 |
| **完成度** | 没有这些更改就无法"done" | 可完成原变更，新工作独立存在 |
| **叙事** | 更新链讲述连贯的故事 | 补丁会比澄清更令人困惑 |

### 原则

> **更新保留上下文。新变更提供清晰度。**
>
> 当你的思考历史有价值时，选择更新。
> 当重新开始会比打补丁更清晰时，选择新建。

把它想成 git 分支：
- 在同一个功能上工作时持续提交
- 当它是真正的新工作时，开一个新分支
- 有时合并一个部分功能，并为第二阶段重新开始

## 有何不同？

| | 遗留 (`/openspec:proposal`) | OPSX (`/opsx:*`) |
|---|---|---|
| **结构** | 一个大的提案文档 | 带依赖关系的离散制品 |
| **工作流** | 线性阶段：plan → implement → archive | 流动动作——随时可做任意事 |
| **迭代** | 回头很别扭 | 随学习更新制品 |
| **定制** | 固定结构 | Schema 驱动（定义你自己的制品） |

**关键洞见：** 工作不是线性的。OPSX 不再假装它是。

## 架构深入

本节解释 OPSX 在底层如何运作，以及它如何与遗留工作流比较。
本节中的示例使用扩展命令集（`new`、`continue` 等）；默认 `core` 用户可把同一流程映射到 `propose → apply → sync → archive`。

### 哲学：阶段 vs 动作

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LEGACY WORKFLOW                                      │
│                    (Phase-Locked, All-or-Nothing)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐             │
│   │   PLANNING   │ ───► │ IMPLEMENTING │ ───► │   ARCHIVING  │             │
│   │    PHASE     │      │    PHASE     │      │    PHASE     │             │
│   └──────────────┘      └──────────────┘      └──────────────┘             │
│         │                     │                     │                       │
│         ▼                     ▼                     ▼                       │
│   /openspec:proposal   /openspec:apply      /openspec:archive              │
│                                                                             │
│   • Creates ALL artifacts at once                                          │
│   • Can't go back to update specs during implementation                    │
│   • Phase gates enforce linear progression                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                            OPSX WORKFLOW                                     │
│                      (Fluid Actions, Iterative)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│              ┌────────────────────────────────────────────┐                 │
│              │           ACTIONS (not phases)             │                 │
│              │                                            │                 │
│              │   new ◄──► continue ◄──► apply ◄──► archive │                 │
│              │    │          │           │           │    │                 │
│              │    └──────────┴───────────┴───────────┘    │                 │
│              │              any order                     │                 │
│              └────────────────────────────────────────────┘                 │
│                                                                             │
│   • Create artifacts one at a time OR fast-forward                         │
│   • Update specs/design/tasks during implementation                        │
│   • Dependencies enable progress, phases don't exist                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 组件架构

**遗留工作流** 使用硬编码在 TypeScript 中的模板：

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      LEGACY WORKFLOW COMPONENTS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Hardcoded Templates (TypeScript strings)                                  │
│                    │                                                        │
│                    ▼                                                        │
│   Tool-specific configurators/adapters                                      │
│                    │                                                        │
│                    ▼                                                        │
│   Generated Command Files (.claude/commands/openspec/*.md)                  │
│                                                                             │
│   • Fixed structure, no artifact awareness                                  │
│   • Change requires code modification + rebuild                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**OPSX** 使用外部 schemas 与一个依赖图引擎：

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OPSX COMPONENTS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Schema Definitions (YAML)                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  name: spec-driven                                                  │   │
│   │  artifacts:                                                         │   │
│   │    - id: proposal                                                   │   │
│   │      generates: proposal.md                                         │   │
│   │      requires: []              ◄── Dependencies                     │   │
│   │    - id: specs                                                      │   │
│   │      generates: specs/**/*.md  ◄── Glob patterns                    │   │
│   │      requires: [proposal]      ◄── Enables after proposal           │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                    │                                                        │
│                    ▼                                                        │
│   Artifact Graph Engine                                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  • Topological sort (dependency ordering)                           │   │
│   │  • State detection (filesystem existence)                           │   │
│   │  • Rich instruction generation (templates + context)                │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                    │                                                        │
│                    ▼                                                        │
│   Skill Files (.claude/skills/openspec-*/SKILL.md)                          │
│                                                                             │
│   • Cross-editor compatible (Claude Code, Cursor, Devin)                    │
│   • Skills query CLI for structured data                                    │
│   • Fully customizable via schema files                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 依赖图模型

制品构成一个有向无环图（DAG）。依赖关系是**促成因素**，而非关卡：

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
                                  │
                                  ▼
                          ┌──────────────┐
                          │ APPLY PHASE  │
                          │ (requires:   │
                          │  tasks)      │
                          └──────────────┘
```

**状态转换：**

```
   BLOCKED ────────────────► READY ────────────────► DONE
      │                        │                       │
   Missing                  All deps               File exists
   dependencies             are DONE               on filesystem
```

### 信息流

**遗留工作流** — agent 收到静态指令：

```
  User: "/openspec:proposal"
           │
           ▼
  ┌─────────────────────────────────────────┐
  │  Static instructions:                   │
  │  • Create proposal.md                   │
  │  • Create tasks.md                      │
  │  • Create design.md                     │
  │  • Create delta spec files              │
  │                                         │
  │  No awareness of what exists or         │
  │  dependencies between artifacts         │
  └─────────────────────────────────────────┘
           │
           ▼
  Agent creates ALL artifacts in one go
```

**OPSX** — agent 查询富上下文：

```
  User: "/opsx:continue"
           │
           ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │  Step 1: Query current state                                             │
  │  ┌────────────────────────────────────────────────────────────────────┐  │
  │  │  $ openspec-cn status --change "add-auth" --json                      │  │
  │  │                                                                    │  │
  │  │  {                                                                 │  │
  │  │    "artifacts": [                                                  │  │
  │  │      {"id": "proposal", "status": "done"},                         │  │
  │  │      {"id": "specs", "status": "ready"},      ◄── First ready      │  │
  │  │      {"id": "design", "status": "ready"},                          │  │
  │  │      {"id": "tasks", "status": "blocked",                          │  │
  │  │       "missingDeps": ["specs", "design"]}                          │  │
  │  │    ]                                                               │  │
  │  │  }                                                                 │  │
  │  └────────────────────────────────────────────────────────────────────┘  │
  │                                                                          │
  │  Step 2: Get rich instructions for ready artifact                        │
  │  ┌────────────────────────────────────────────────────────────────────┐  │
  │  │  $ openspec-cn instructions specs --change "add-auth" --json          │  │
  │  │                                                                    │  │
  │  │  {                                                                 │  │
  │  │    "template": "# Specification\n\n## ADDED Requirements...",      │  │
  │  │    "dependencies": [{"id": "proposal", "path": "...", "done": true}│  │
  │  │    "unlocks": ["tasks"]                                            │  │
  │  │  }                                                                 │  │
  │  └────────────────────────────────────────────────────────────────────┘  │
  │                                                                          │
  │  Step 3: Read dependencies → Create ONE artifact → Show what's unlocked  │
  └──────────────────────────────────────────────────────────────────────────┘
```

### 迭代模型

**遗留工作流** — 迭代很别扭：

```
  ┌─────────┐     ┌─────────┐     ┌─────────┐
  │/proposal│ ──► │ /apply  │ ──► │/archive │
  └─────────┘     └─────────┘     └─────────┘
       │               │
       │               ├── "Wait, the design is wrong"
       │               │
       │               ├── Options:
       │               │   • Edit files manually (breaks context)
       │               │   • Abandon and start over
       │               │   • Push through and fix later
       │               │
       │               └── No official "go back" mechanism
       │
       └── Creates ALL artifacts at once
```

**OPSX** — 自然的迭代：

```
  /opsx:new ───► /opsx:continue ───► /opsx:apply ───► /opsx:archive
      │                │                  │
      │                │                  ├── "The design is wrong"
      │                │                  │
      │                │                  ▼
      │                │            Just edit design.md
      │                │            and continue!
      │                │                  │
      │                │                  ▼
      │                │         /opsx:apply picks up
      │                │         where you left off
      │                │
      │                └── Creates ONE artifact, shows what's unlocked
      │
      └── Scaffolds change, waits for direction
```

### 自定义 Schemas

使用 schema 管理命令创建自定义工作流：

```bash
# Create a new schema from scratch (interactive)
openspec-cn schema init my-workflow

# Or fork an existing schema as a starting point
openspec-cn schema fork spec-driven my-workflow

# Validate your schema structure
openspec-cn schema validate my-workflow

# See where a schema resolves from (useful for debugging)
openspec-cn schema which my-workflow
```

Schemas 存储在 `openspec/schemas/`（项目本地、纳入版本控制）或 `~/.local/share/openspec/schemas/`（用户全局）。

**Schema 结构：**
```
openspec/schemas/research-first/
├── schema.yaml
└── templates/
    ├── research.md
    ├── proposal.md
    └── tasks.md
```

**schema.yaml 示例：**
```yaml
name: research-first
artifacts:
  - id: research        # Added before proposal
    generates: research.md
    requires: []

  - id: proposal
    generates: proposal.md
    requires: [research]  # Now depends on research

  - id: tasks
    generates: tasks.md
    requires: [proposal]
```

**依赖图：**
```
   research ──► proposal ──► tasks
```

### 总结

| 方面 | 遗留 | OPSX |
|--------|----------|------|
| **模板** | 硬编码的 TypeScript | 外部 YAML + Markdown |
| **依赖** | 无（一次性全有） | 带拓扑排序的 DAG |
| **状态** | 基于阶段的思维模型 | 文件系统存在性 |
| **定制** | 编辑源码、重新构建 | 创建 schema.yaml |
| **迭代** | 阶段锁定 | 流动，可编辑任意内容 |
| **编辑器支持** | 工具专属的 configurator/adapters | 单一 skills 目录 |

## Schemas

Schemas 定义了存在哪些制品及其依赖关系。当前可用：

- **spec-driven**（默认）：proposal → specs → design → tasks

```bash
# List available schemas
openspec-cn schemas

# See all schemas with their resolution sources
openspec-cn schema which --all

# Create a new schema interactively
openspec-cn schema init my-workflow

# Fork an existing schema for customization
openspec-cn schema fork spec-driven my-workflow

# Validate schema structure before use
openspec-cn schema validate my-workflow
```

## 小贴士

- 用 `/opsx:explore` 在下定决心前想清楚一个想法
- 知道想要什么时用 `/opsx:ff`，探索时用 `/opsx:continue`
- 在 `/opsx:apply` 期间，如果哪里不对——修复制品，然后继续
- 任务通过 `tasks.md` 中的勾选框跟踪进度
- 随时检查状态：`openspec-cn status --change "name"`

## 反馈

这还粗糙。那是有意为之——我们正在学习什么最有效。

发现 bug？有想法？加入我们的 [Discord](https://discord.gg/YctCnvvshC)，或在 [GitHub](https://github.com/Fission-AI/openspec/issues) 上提 issue。
