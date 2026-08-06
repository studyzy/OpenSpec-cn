# 自定义

OpenSpec 提供三个层级的自定义能力：

| 层级 | 作用 | 最适合 |
|-------|--------------|----------|
| **项目配置** | 设置默认值、注入上下文/规则 | 大多数团队 |
| **自定义 schema** | 定义自己的工作流制品 | 流程独特的团队 |
| **全局覆盖** | 跨所有项目共享 schema | 高级用户 |

---

<a id="project-configuration"></a>

## 项目配置

`openspec/config.yaml` 是定制 OpenSpec、适配团队最简单的方式。它可以让你：

- **设置默认 schema** —— 免去在每条命令上写 `--schema`
- **注入项目上下文** —— 让 AI 了解你的技术栈、约定等
- **添加按制品的规则** —— 为特定制品定制规则
- **添加按操作的指引** —— 为 apply 与 archive 工作提供建议性偏好
- **记住集成选择** —— 例如 [GitHub Copilot 云端编程 Agent](supported-tools.md#github-copilot-cloud-coding-agent) 的启用选项

### 快速设置

```bash
openspec-cn init
```

这会引导你以交互方式创建配置。或者手动创建：

```yaml
# openspec/config.yaml
schema: spec-driven

context: |
  Tech stack: TypeScript, React, Node.js, PostgreSQL
  API style: RESTful, documented in docs/api.md
  Testing: Jest + React Testing Library
  value backwards compatibility all public APIs

rules:
  proposal:
    - Include rollback plan
    - Identify affected teams
  specs:
    - Use Given/When/Then format
    - Reference existing patterns before inventing new ones

operations:
  apply:
    guidance:
      - Run focused tests before the full suite
  archive:
    guidance:
      - Keep the completion summary concise

# 由 `openspec-cn init` 在你选择（或拒绝）GitHub Copilot 云端编程 Agent 时设置；
# 控制 `init`/`update` 是否生成其相关文件。
githubCopilot:
  cloudAgent: false
```

### 如何生效

**默认 schema：**

```bash
# 没有配置时
openspec-cn new change my-feature --schema spec-driven

# 有配置后 —— schema 自动生效
openspec-cn new change my-feature
```

**上下文规则注入：**

生成制品时，上下文和规则会被注入到 AI 的提示词中：

```xml
<context>
Tech stack: TypeScript, React, Node.js, PostgreSQL
...
</context>
<rules>
- Include rollback plan
- Identify affected teams
</rules>
<template>
[Schema's built-in template]
</template>
```

- **Context**（上下文）会出现在**所有**制品中
- **Rules**（规则）只出现在匹配的制品里

**操作指引（Operation guidance）：**

`operations.apply.guidance` 和 `operations.archive.guidance` 是可选数组，用于
提供建议性指令，说明 Agent 应如何执行这些操作。它们与 `rules` 是分开的：操作
指引不约束制品内容，制品规则也绝不会被重新标记为操作指引。

apply 与 archive 在执行时获取这些输入：

```bash
openspec-cn instructions apply --change my-feature --json
openspec-cn instructions archive --change my-feature --json
```

两个接口都会把当前项目的 `context` 以及匹配的 `operationGuidance` 作为两个独立
的可选字段返回。每次调用都会从已解析的根目录读取一份新的快照。当选择了
`--store <id>` 时，变更、上下文和指引都来自该 store，而非当前仓库。
archive instruction 命令是只读的：它不检查或合并增量规范（delta specs），不写入
主 specs，不移动变更，也不运行静态的归档工作流。

项目上下文是提示词层面的必需输入。生成的工作流会读取它，并应用其中相关的项目
事实、约定与约束。操作指引则是可选的附加建议：工作流会考虑每一条，并遵循那些
适用且与内置工作流兼容的条目。

这两个字段都独立于 CLI 控制的状态、已解析的路径、内置步骤、用户的显式选择以及
制品规则。工作流会报告上下文冲突，同时保留起决定作用的值。它不会遵循不适用或
相互冲突的指引，并会说明原因。这两个字段都不是可强制执行的检查项，除非用户另行
要求，否则工作流不会把它们的文本拷贝进实现文件、specs、变更制品或总结中。

**归档与 spec 同步的输入安全性：**

archive、bulk archive 和独立的 sync 都以 `openspec-cn status --json` 返回的
`artifactPaths.specs.existingOutputPaths` 作为增量规范（delta spec）的唯一来源。
若 schema 中没有 `specs` 制品，或某个变更的具体输出列表为空，就没有内容需要同步；
系统不会用其他制品去推断增量规范。

在语义合并写入主 spec 之前，工作流会消费当前
`openspec-cn instructions specs --change <name> --json` 的输出。返回的 `specs`
规则仅约束该次合并所产出的主 specs。单个归档会把该快照传入内联 sync，独立 sync
会直接获取它，而 bulk archive 会在首次写入 spec 之前取得所有必需的快照。若
archive/specs instruction 响应返回非零退出码或无效 JSON，这属于查询失败，而非空
输入：工作流会在受影响的 spec 写入或变更移动之前停止（对 bulk archive 而言，是在
任何批量写入或移动之前停止）。

此项配置不会改变归档的执行阶段、用户提示、文件系统操作、语义合并的归属、直接的
`openspec-cn archive` 命令，也不会改变制品 `rules` 的结构与输出。

### Schema 解析顺序

当 OpenSpec 需要解析 schema 时，按以下顺序查找：

1. CLI 参数：`--schema <name>`
2. 变更元数据（变更文件夹中的 `.openspec.yaml`）
3. 项目配置（`openspec/config.yaml`）
4. 默认值（`spec-driven`）

---

<a id="custom-schemas"></a>

## 自定义 Schemas

当项目配置不够用时，可以创建完全自定义工作流的 schema。自定义 schema 存放在项目的 `openspec/schemas/` 目录中，随代码一起纳入版本控制。

```text
your-project/
├── openspec/
│   ├── config.yaml # 项目配置
│   ├── schemas/    # 自定义 schema 放在这里
│   │   └── my-workflow/
│   │       ├── schema.yaml
│   │       └── templates/
│   └── changes/    # 变更
└── src/
```

### 派生（Fork）一个现有 Schema

自定义最快的方式是派生（fork）一个内置 schema：

```bash
openspec-cn schema fork spec-driven my-workflow
```

这会把整个 `spec-driven` schema 复制到 `openspec/schemas/my-workflow/`，你可以自由编辑。

**你会得到：**

```text
openspec/schemas/my-workflow/
├── schema.yaml        # 工作流定义
└── templates/
    ├── proposal.md    # proposal 制品模板
    ├── spec.md        # specs 模板
    ├── design.md      # design 模板
    └── tasks.md       # tasks 模板
```

现在编辑 `schema.yaml` 来改变工作流，编辑模板来改变 AI 生成的内容。

### 从零创建 Schema

如果要完全全新的工作流：

```bash
# 交互式
openspec-cn schema init research-first

# 非交互式
openspec-cn schema init rapid \
  --description "Rapid iteration workflow" \
  --artifacts "proposal,tasks" \
  --default
```

### Schema 结构

一个 schema 定义了工作流中有哪些制品，以及它们如何相互依赖：

```yaml
# openspec/schemas/my-workflow/schema.yaml
name: my-workflow
version: 1
description: My team's custom workflow

artifacts:
  - id: proposal
    generates: proposal.md
    description: Initial proposal document
    template: proposal.md
    instruction: |
      Create a proposal that explains WHY this change is needed.
      Focus on the problem, not the solution.
    requires: []

  - id: design
    generates: design.md
    description: Technical design
    template: design.md
    instruction: |
      Create a design document explaining HOW to implement.
    requires:
      - proposal    # 在 proposal 存在之前不能创建 design

  - id: tasks
    generates: tasks.md
    description: Implementation checklist
    template: tasks.md
    requires:
      - design

apply:
  requires: [tasks]
  tracks: tasks.md
```

**关键字段：**

| 字段 | 用途 |
|-------|---------|
| `id` | 唯一标识符，用于命令和规则 |
| `generates` | 输出文件名（支持 `specs/**/*.md` 这样的 glob） |
| `template` | `templates/` 目录中的模板文件 |
| `instruction` | 创建该制品时给 AI 的指令 |
| `requires` | 依赖项 —— 哪些制品必须先存在 |

按你希望它们被写出的顺序来列出制品。`requires` 决定什么是可能的；而
`artifacts:` 列表的顺序决定当多个制品同时就绪时，哪一个排在前面。

### 模板

模板是引导 AI 的 markdown 文件。在创建对应制品时，它们会被注入到提示词中。

```markdown
<!-- templates/proposal.md -->
## Why

<!-- 说明本次变更的动机。它解决了什么问题？ -->

## What Changes

<!-- 描述将会发生哪些变化。明确指出新增的能力或所做的修改。 -->

## Impact

<!-- 受影响的代码、API、依赖、系统 -->
```

模板可以包含：
- 让 AI 填写的章节标题
- 给 AI 作提示的 HTML 注释
- 展示预期结构的示例格式

### 校验 Schema

在使用自定义 schema 之前，先校验它：

```bash
openspec-cn schema validate my-workflow
```

这会检查：
- `schema.yaml` 语法
- 引用的模板是否存在
- 是否有循环依赖
- 制品 ID 是否有效

### 使用自定义 Schema

创建完成后，即可使用该 schema：

```bash
# 在命令上指定
openspec-cn new change feature --schema my-workflow

# 或在 config.yaml 中设为默认
schema: my-workflow
```

### 调试 Schema 解析

不确定用的是哪个 schema？检查一下：

```bash
# 确认某个 schema 能解析
openspec-cn schema my-workflow

# 列出所有可用 schema
openspec-cn schema --all
```

输出会显示它来自项目、用户目录还是包：

```text
...
```

### Schema 示例

```yaml
id: proposal
generates: proposal.md
description: Quick proposal
template: proposal.md
instruction: |
  Create brief proposal for this change.
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

### 添加 Review 制品

派生默认 schema 并加上 review 步骤：

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
    Create review checklist based on design.
    Include security, performance, testing considerations.
  requires:
    - design

- id: tasks
  # ... 现有的 tasks 配置 ...
  requires:
    - specs
    - design
    - review # 现在 tasks 也需要 review
```

---

<a id="community-schemas"></a>

## 社区 Schemas

OpenSpec 还支持通过独立仓库分发的社区维护 schema。它们提供了一些固执己见的工作流，将 OpenSpec 与其他工具或系统集成，类似于 [github/spec-kit 的社区扩展目录](https://github.com/github/spec-kit/tree/main/extensions) 对 spec-kit 的作用。

社区 schema 不会被打包进 OpenSpec 核心 —— 它们存放在各自的仓库中，有各自的发布节奏。要使用某个社区 schema，把它的 schema 包复制到项目的 `openspec/schemas/<schema-name>/` 目录（每个仓库的 README 中有安装说明）。

| Schema | 维护者 | 仓库 | 描述 |
|--------|-----------|-----------|-------------|
| `intent-driven` | @harikrishnan83 | [intent-driven-dev/openspec-schemas](https://github.com/intent-driven-dev/openspec-schemas/tree/main/openspec/schemas/intent-driven) | 在实现之前先捕获变更意图、可观测行为、技术设计以及持久的架构决策。新增一份变更本地的 ADR 评审清单，并把符合条件的长期决策写成不可变、可被取代的 ADR。 |
| `superpowers-bridge` | @JiangWay | [JiangWay/openspec-schemas](https://github.com/JiangWay/openspec-schemas/tree/main/superpowers-bridge) | 将 OpenSpec 的制品治理与 [obra/superpowers](https://github.com/obra/superpowers) 的执行技能（头脑风暴、编写计划、通过子 Agent 做 TDD、代码审查、收尾）集成。新增了一个以证据为先的 `retrospective` 制品，弥补了 Superpowers 原生未覆盖的空缺。 |
| `nanopm` | @nmrtn | [nmrtn/nanopm](https://github.com/nmrtn/nanopm/tree/main/openspec-schema) | PM 优先的工作流。在实现之前先跑一遍 [nanopm](https://github.com/nmrtn/nanopm) 的规划流水线（audit → strategy → roadmap → PRD）。把产品规划衔接到 OpenSpec 的规范驱动工程工作流。若存在 `.nanopm/` 则从中读取制品内容 —— proposal 取自 audit，design 取自 strategy，tasks 取自 PRD 的任务拆解。 |
| `e2e-runbooks` | @Lukk17 | [Lukk17/openspec-schemas](https://github.com/Lukk17/openspec-schemas/tree/master/openspec/schemas/e2e-runbooks) | 能力级别的端到端测试运行手册。每项能力都有一份不可变的 spec、一份不可变的 tasks 模板，以及每次执行对应一条带时间戳的运行记录。断言只针对可观测行为（HTTP 状态码、响应体、持久化状态 —— 绝不针对日志子串）；每次运行都会记录起止 UTC 时间、耗时，以及对 LLM token 消耗的最佳估算。 |
| `anvil` | @jikkujoyce | [jikkujoyce/openspec-schemas](https://github.com/jikkujoyce/openspec-schemas/tree/main/schemas/anvil) | 带 TDD 纪律和对抗式评审步骤的规范驱动工作流。流程：`proposal` → `specs` → `design` → `review` → `test-plan` → `tasks` → `apply` → `verify`。`review` 由一个全新上下文、只读的评审者撰写（有条件时使用第二个模型），并输出一行 `VERDICT:`，指示 Agent 对 `test-plan`、`tasks` 和 `apply` 进行门禁控制；OpenSpec 只检查制品是否存在，因此需要你用自己的 CI 或 hook 来强制执行该门禁。`test-plan` 把每个 spec 场景映射到一个具名测试，同时充当由 `verify` 审计的红/绿状态台账。 |

> 想贡献一个社区 schema？开一个 issue 并附上你的仓库链接，或提交一个 PR 往这个表格里加一行。

---

## 参见

- [CLI 参考：Schema 命令](cli.md#schema-commands) - 完整的命令文档
