# 自定义

OpenSpec 提供三个级别的自定义：

| 级别 | 功能 | 最适合 |
|-------|--------------|----------|
| **项目配置** | 设置默认值，注入上下文/规则 | 大多数团队 |
| **自定义模式** | 定义自己的工作流制品 | 有独特流程的团队 |
| **全局覆盖** | 在所有项目间共享模式 | 高级用户 |

---

## 项目配置

`openspec/config.yaml` 文件是为团队自定义 OpenSpec 的最简单方法。它允许你：

- **设置默认模式** - 在每个命令上跳过 `--schema`
- **注入项目上下文** - AI 看到你的技术栈、约定等
- **添加每个制品的规则** - 特定制品的自定义规则

### 快速设置

```bash
openspec-cn init
```

这会引导你交互式创建配置。或者手动创建一个：

```yaml
# openspec/config.yaml
schema: spec-driven

context: |
  技术栈：TypeScript、React、Node.js、PostgreSQL
  API 风格：RESTful，在 docs/api.md 中记录
  测试：Jest + React Testing Library
  我们重视所有公共 API 的向后兼容性

rules:
  proposal:
    - 包含回滚计划
    - 识别受影响的团队
  specs:
    - 使用 Given/When/Then 格式
    - 在发明新模式前参考现有模式
```

### 工作原理

**默认模式：**

```bash
# 无配置
openspec-cn new change my-feature --schema spec-driven

# 有配置 - 模式自动应用
openspec-cn new change my-feature
```

**上下文和规则注入：**

当生成任何制品时，你的上下文和规则会注入到 AI 提示中：

```xml
<context>
技术栈：TypeScript、React、Node.js、PostgreSQL
...
</context>

<rules>
- 包含回滚计划
- 识别受影响的团队
</rules>

<template>
[模式的内置模板]
</template>
```

- **上下文** 出现在所有制品中
- **规则** 仅出现在匹配的制品中

### 模式解析顺序

当 OpenSpec 需要模式时，按此顺序检查：

1. CLI 标志：`--schema <name>`
2. 变更元数据（变更文件夹中的 `.openspec.yaml`）
3. 项目配置（`openspec/config.yaml`）
4. 默认（`spec-driven`）

---

## 自定义模式

当项目配置不够时，创建具有完全自定义工作流的模式。自定义模式位于项目的 `openspec/schemas/` 目录中，并与代码一起进行版本控制。

```text
your-project/
├── openspec/
│   ├── config.yaml        # 项目配置
│   ├── schemas/           # 自定义模式在此
│   │   └── my-workflow/
│   │       ├── schema.yaml
│   │       └── templates/
│   └── changes/           # 你的变更
└── src/
```

### 派生现有模式

自定义的最快方法是派生内置模式：

```bash
openspec-cn schema fork spec-driven my-workflow
```

这将整个 `spec-driven` 模式复制到 `openspec/schemas/my-workflow/`，你可以在那里自由编辑。

**你会得到：**

```text
openspec/schemas/my-workflow/
├── schema.yaml           # 工作流定义
└── templates/
    ├── proposal.md       # 提案制品的模板
    ├── spec.md           # 规范的模板
    ├── design.md         # 设计的模板
    └── tasks.md          # 任务的模板
```

现在编辑 `schema.yaml` 来更改工作流，或编辑模板来更改 AI 生成的内容。

### 从零创建模式

对于全新的工作流：

```bash
# 交互式
openspec-cn schema init research-first

# 非交互式
openspec-cn schema init rapid \
  --description "快速迭代工作流" \
  --artifacts "proposal,tasks" \
  --default
```

### 模式结构

模式定义工作流中的制品及其依赖关系：

```yaml
# openspec/schemas/my-workflow/schema.yaml
name: my-workflow
version: 1
description: 我团队的自定义工作流

artifacts:
  - id: proposal
    generates: proposal.md
    description: 初始提案文档
    template: proposal.md
    instruction: |
      创建解释为什么需要此变更的提案。
      专注于问题，而不是解决方案。
    requires: []

  - id: design
    generates: design.md
    description: 技术设计
    template: design.md
    instruction: |
      创建解释如何实施的设计文档。
    requires:
      - proposal    # 提案存在后才能创建设计

  - id: tasks
    generates: tasks.md
    description: 实施清单
    template: tasks.md
    requires:
      - design

apply:
  requires: [tasks]
  tracks: tasks.md
```

**关键字段：**

| 字段 | 目的 |
|-------|---------|
| `id` | 唯一标识符，用于命令和规则 |
| `generates` | 输出文件名（支持通配符如 `specs/**/*.md`） |
| `template` | `templates/` 目录中的模板文件 |
| `instruction` | AI 创建此制品的指令 |
| `requires` | 依赖项 - 哪些制品必须先存在 |

### 模板

模板是指导 AI 的 Markdown 文件。在创建制品时，它们会注入到提示中。

```markdown
<!-- templates/proposal.md -->
## 为什么

<!-- 解释此变更的动机。解决了什么问题？ -->

## 改变什么

<!-- 描述将改变什么。具体说明新功能或修改。 -->

## 影响

<!-- 受影响的代码、API、依赖项、系统 -->
```

模板可以包含：
- AI 应填写的章节标题
- 为 AI 提供指导的 HTML 注释
- 显示预期结构的示例格式

### 验证你的 Schema

在使用自定义 schema 之前，先验证它：

```bash
openspec-cn schema validate my-workflow
```

这会检查：
- `schema.yaml` 语法是否正确
- 所有引用的模板是否存在
- 是否有循环依赖
- 制品 ID 是否有效

### 使用你的自定义 Schema

创建后，使用你的 schema：

```bash
# 在命令上指定
openspec-cn new change feature --schema my-workflow

# 或者在 config.yaml 中设为默认值
schema: my-workflow
```

### 调试 Schema 解析

不确定正在使用哪个 schema？检查：

```bash
# 查看特定 schema 的解析来源
openspec-cn schema which my-workflow

# 列出所有可用 schema
openspec-cn schema which --all
```

输出显示它来自你的项目、用户目录还是包：

```text
Schema: my-workflow
来源: project
路径: /path/to/project/openspec/schemas/my-workflow
```

---

> **注意：** OpenSpec 也支持用户级 schema，位于 `~/.local/share/openspec/schemas/`，用于跨项目共享，但推荐使用项目级 schema，位于 `openspec/schemas/`，因为它们与你的代码一起进行版本控制。

---

## 示例

### 快速迭代工作流

A minimal workflow for quick iterations:

```yaml
# openspec/schemas/rapid/schema.yaml
name: rapid
version: 1
description: 最小开销的快速迭代

artifacts:
  - id: proposal
    generates: proposal.md
    description: Quick proposal
    template: proposal.md
    instruction: |
      Create a brief proposal for this change.
      Focus on what and why, skip detailed specs.
    requires: []

  - id: tasks
    generates: tasks.md
    description: Implementation checklist
    template: tasks.md
    requires: [proposal]

apply:
  requires: [tasks]
  tracks: tasks.md
```

### 添加审查制品

派生默认配置并添加审查步骤：

```bash
openspec-cn schema fork spec-driven with-review
```

然后编辑 `schema.yaml` 添加：

```yaml
  - id: review
    generates: review.md
    description: Pre-implementation review checklist
    template: review.md
    instruction: |
      Create a review checklist based on the design.
      Include security, performance, and testing considerations.
    requires:
      - design

  - id: tasks
    # ... existing tasks config ...
    requires:
      - specs
      - design
      - review    # Now tasks require review too
```

---

## 另请参阅

- [CLI 参考：Schema 命令](cli.md#schema-commands) - 终端命令
