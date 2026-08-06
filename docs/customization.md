# 自定义

OpenSpec 提供三个层级的自定义能力：

| 层级 | 作用 | 最适合 |
|-------|--------------|----------|
| **项目配置** | 设置默认值、注入上下文/规则 | 大多数团队 |
| **自定义 schema** | 定义自己的工作流制品 | 流程独特的团队 |
| **全局覆盖** | 跨所有项目共享 schema | 高级用户 |

---

## 项目配置

`openspec/config.yaml` 是定制 OpenSpec、适配团队最简单的方式。它可以让你：

- **Set a default schema** - Skip `--schema` on every command
- **Inject project context** - AI sees your tech stack, conventions, etc.
- **Add per-artifact rules** - Custom rules for specific artifacts
- **Add per-operation guidance** - Advisory preferences for apply and archive work
- **Remember integration choices** - e.g. the [GitHub Copilot cloud coding agent](supported-tools.md#github-copilot-cloud-coding-agent) opt-in

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

# Set by `openspec init` when you choose (or decline) the GitHub Copilot
# cloud coding agent; controls whether `init`/`update` generate its files.
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

**Operation guidance:**

`operations.apply.guidance` and `operations.archive.guidance` are optional arrays
of advisory instructions for how an agent should conduct those operations. They
are separate from `rules`: operation guidance does not constrain artifact content,
and artifact rules are never relabeled as operation guidance.

Apply and archive fetch these inputs at execution time:

```bash
openspec instructions apply --change my-feature --json
openspec instructions archive --change my-feature --json
```

Both surfaces return current project `context` and matching
`operationGuidance` as separate optional fields. Each invocation reads a fresh
snapshot from the resolved root. When `--store <id>` is selected, the change,
context, and guidance all come from that store rather than the current repository.
The archive instruction command is read-only: it does not inspect or merge delta
specs, write main specs, move the change, or run the static archive workflow.

Project context is a required prompt-level input. Generated workflows read it and
apply relevant project facts, conventions, and constraints. Operation guidance is
optional additive advice: workflows consider every entry and follow entries that
are applicable and compatible with the built-in workflow.

Both fields remain separate from CLI-controlled state, resolved paths, built-in
steps, explicit user choices, and artifact rules. A workflow reports context
conflicts while preserving the controlling value. It does not follow inapplicable
or conflicting guidance and explains why. Neither field is an enforceable check,
and workflows do not copy their text into implementation files, specs, change
artifacts, or summaries unless the user separately requests that content.

**Archive and spec-sync input safety:**

Archive, bulk archive, and standalone sync use
`artifactPaths.specs.existingOutputPaths` from `openspec status --json` as the
only delta-spec source. A schema without a `specs` artifact, or a change whose
concrete output list is empty, has nothing to sync; other artifacts are not used
to infer delta specs.

Before a semantic merge writes a main spec, the workflow consumes current
`openspec instructions specs --change <name> --json` output. The returned
`specs` rules constrain only the main specs produced by that merge. Single archive
passes that snapshot into inline sync, standalone sync fetches it directly, and
bulk archive obtains every required snapshot before its first spec write. A
non-zero or invalid JSON archive/specs instruction response is a lookup failure,
not an empty input: the workflow stops before the affected spec write or change
move (for bulk archive, before any batch write or move).

This configuration does not change archive execution phases, user prompts,
filesystem operations, semantic merge ownership, the direct `openspec archive`
command, or the structure and output of artifact `rules`.

### Schema 解析顺序

当 OpenSpec 需要解析 schema 时，按以下顺序查找：

1. CLI 参数：`--schema <name>`
2. 变更元数据（变更文件夹中的 `.openspec.yaml`）
3. 项目配置（`openspec/config.yaml`）
4. 默认值（`spec-driven`）

---

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

List artifacts in the order you want them written. `requires` decides what is
possible; the order of the `artifacts:` list decides what comes first when
several artifacts are ready at once.

### 模板

模板是引导 AI 的 markdown 文件。在创建对应制品时，它们会被注入到提示词中。

```markdown
<!-- templates/proposal.md -->
## Why

<!-- Explain the motivation for this change. What problem does this solve? -->

## What Changes

<!-- Describe what will change. Be specific about new capabilities or modifications. -->

## Impact

<!-- Affected code, APIs, dependencies, systems -->
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

## 社区 Schemas

OpenSpec 还支持通过独立仓库分发的社区维护 schema。它们提供了一些固执己见的工作流，将 OpenSpec 与其他工具或系统集成，类似于 [github/spec-kit 的社区扩展目录](https://github.com/github/spec-kit/tree/main/extensions) 对 spec-kit 的作用。

社区 schema 不会被打包进 OpenSpec 核心 —— 它们存放在各自的仓库中，有各自的发布节奏。要使用某个社区 schema，把它的 schema 包复制到项目的 `openspec/schemas/<schema-name>/` 目录（每个仓库的 README 中有安装说明）。

| Schema | 维护者 | 仓库 | 描述 |
|--------|-----------|-----------|-------------|
| `intent-driven` | @harikrishnan83 | [intent-driven-dev/openspec-schemas](https://github.com/intent-driven-dev/openspec-schemas/tree/main/openspec/schemas/intent-driven) | Captures change intent, observable behaviour, technical design, and durable architectural decisions before implementation. Adds a change-local ADR review manifest and writes qualifying long-lived decisions as immutable, supersedable ADRs. |
| `superpowers-bridge` | @JiangWay | [JiangWay/openspec-schemas](https://github.com/JiangWay/openspec-schemas/tree/main/superpowers-bridge) | 将 OpenSpec 的制品治理与 [obra/superpowers](https://github.com/obra/superpowers) 的执行技能（头脑风暴、编写计划、通过子 Agent 做 TDD、代码审查、收尾）集成。新增了一个以证据为先的 `retrospective` 制品，弥补了 Superpowers 原生未覆盖的空缺。 |
| `nanopm` | @nmrtn | [nmrtn/nanopm](https://github.com/nmrtn/nanopm/tree/main/openspec-schema) | PM-first workflow. Runs [nanopm](https://github.com/nmrtn/nanopm)'s planning pipeline (audit → strategy → roadmap → PRD) upstream of implementation. Bridges product planning to OpenSpec's spec-driven engineering workflow. Artifacts read from `.nanopm/` if present — proposal sources the audit, design sources the strategy, and tasks source the PRD breakdown. |
| `e2e-runbooks` | @Lukk17 | [Lukk17/openspec-schemas](https://github.com/Lukk17/openspec-schemas/tree/master/openspec/schemas/e2e-runbooks) | Capability-level end-to-end test runbooks. Each capability gets an immutable spec, an immutable tasks-template, and one timestamped run record per execution. Assertions are observable behaviour only (HTTP status, response body, persisted state — never log substrings); each run records start/end UTC, duration, and best-estimate LLM token consumption. |
| `anvil` | @jikkujoyce | [jikkujoyce/openspec-schemas](https://github.com/jikkujoyce/openspec-schemas/tree/main/schemas/anvil) | Spec-driven workflow with TDD discipline and an adversarial review step. Flow: `proposal` → `specs` → `design` → `review` → `test-plan` → `tasks` → `apply` → `verify`. `review` is written by a fresh-context, read-only reviewer (a second model when one is available) and emits a `VERDICT:` line telling the agent to gate `test-plan`, `tasks`, and `apply`; OpenSpec only checks that artifacts exist, so enforce the gate with your own CI or hook. `test-plan` maps every spec scenario to a named test and doubles as a red/green ledger that `verify` audits. |

> 想贡献一个社区 schema？开一个 issue 并附上你的仓库链接，或提交一个 PR 往这个表格里加一行。

---

## 参见

- [CLI 参考：Schema 命令](cli.md#schema-commands) - 完整的命令文档
