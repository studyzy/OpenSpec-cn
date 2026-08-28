# schema.yaml

> schema 定义的每个字段，供阅读或编写。

`schema.yaml` 列出工作流创建的规划文件。它还定义它们的顺序，以及向实现的交接。

<a id="location"></a>

## 位置

项目 schema 位于 `openspec/schemas/<name>/` 下：

```text
openspec/schemas/review-first/
├── schema.yaml
└── templates/
    ├── proposal.md
    └── tasks.md
```

OpenSpec 会在三个地方查找该目录。第一个匹配到的生效。

| 副本 | 目录 |
|---|---|
| **1. 项目** | `<project>/openspec/schemas/<name>/` |
| **2. 用户，macOS 与 Linux** | `~/.local/share/openspec/schemas/<name>/` |
| **2. 用户，Windows** | `%LOCALAPPDATA%\openspec\schemas\<name>\` |
| **3. 包** | 随 CLI 安装的 schemas |

如果设置了 `XDG_DATA_HOME`，用户目录在所有平台上都会移到 `$XDG_DATA_HOME/openspec/schemas/<name>/`。

目录名称是 `--schema`、`config.yaml` 和 [`.openspec.yaml`](../configuration/change-metadata.md#schema) 使用的查找键。如果 `name` 字段与目录名不同，OpenSpec 仍使用目录名进行查找。

[`openspec-cn schema which <name>`](../cli.md#openspec-schema-which) 会打印活动目录，以及被它遮蔽的优先级更低的副本。

## 顶层字段

| 字段 | 契约 |
|---|---|
| `name` | **必需。** 一个非空字符串，作为 schema 名称存储。查找仍使用目录名。 |
| `version` | **必需。** 一个正整数，作为 schema 修订号存储。该值不改变 OpenSpec 的行为。 |
| `description` | 一个可选字符串，由 `openspec schemas` 打印。没有值时，schema 没有描述。 |
| `artifacts` | **必需。** 一个非空的[制品条目](#artifact-fields)列表。 |
| `apply` | 可选的 [apply 设置](#apply-fields)。没有该块时，OpenSpec 使用 [apply 默认值](#apply-defaults)。 |

<a id="artifact-fields"></a>

## 制品字段

`artifacts` 下的每个条目定义一个规划文件或一组文件。

| 字段 | 契约 |
|---|---|
| `id` | **必需。** 一个唯一的非空字符串，用于依赖、项目规则、命令和 apply 设置。 |
| `generates` | **必需。** 一个相对路径或 glob，告诉 Agent 在变更目录内的何处写入制品。 |
| `description` | **必需。** 一个字符串，在发给 Agent 的指令中为制品命名。 |
| `template` | **必需。** 一个相对路径，指向 schema 的 `templates/` 目录中该制品的格式。 |
| `instruction` | 可选的指引，告诉 Agent 要生成什么内容。 |
| `requires` | 一个必须先完成的制品 ID 列表。默认：`[]`。 |

### `generates`

路径从变更目录开始。对于名为 `add-auth` 的变更：

```yaml
generates: proposal.md
```

制品会写到这里：

```text
openspec/changes/add-auth/proposal.md
```

一个 glob 可以匹配多个文件：

```yaml
generates: specs/**/*.md
```

这会匹配 `openspec/changes/add-auth/specs/` 下的 Markdown 文件。OpenSpec 将包含 `*`、`?` 或 `[` 的值视为 glob。

OpenSpec 拒绝绝对路径和包含 `..` 段的路径。

#### 完成判定

OpenSpec 检查输出是否存在。它不读取文件内容来判断制品是否完成。

| `generates` 值 | 完成当 |
|---|---|
| `proposal.md` | 该文件存在。 |
| `specs/**/*.md` | glob 至少匹配到一个文件。 |

### `template`

路径从 schema 的 `templates/` 目录开始。在 `review-first` schema 中：

```yaml
template: proposal.md
```

OpenSpec 读取这个文件：

```text
openspec/schemas/review-first/templates/proposal.md
```

OpenSpec 将模板内容作为输出格式交给 Agent。它不会把模板复制进变更目录。

OpenSpec 拒绝绝对路径和包含 `..` 段的路径。

### `requires`

- **依赖**：`requires` 中的每个 ID 都必须指向同一 schema 中的另一个制品。
- **就绪状态**：一个制品在它的全部依赖完成后才就绪。
- **无效图**：缺失 ID、重复 ID 和依赖环都会校验失败。
- **并列**：当多个制品同时就绪时，它们在 `artifacts` 中的顺序决定 OpenSpec 先返回哪个。

<a id="apply-fields"></a>

## Apply 字段

`apply` 定义实现开始前必须存在什么。

| 字段 | 契约 |
|---|---|
| `requires` | **必需。** 一个非空的制品列表，必须先存在，apply 指令才会就绪。 |
| `tracks` | 一个可选相对路径，指向变更目录中的 Markdown 任务文件。默认：`null`。 |
| `instruction` | 可选的指引，apply 就绪时发送给 Agent。默认使用 OpenSpec 的内置指引。 |

制品的 `requires` 控制规划顺序。`apply.requires` 控制 apply 指令何时就绪。

### `tracks`

路径从变更目录开始。对于名为 `add-auth` 的变更，`tracks: tasks.md` 读取：

```text
openspec/changes/add-auth/tasks.md
```

如果该文件缺失或不包含带任务文本的复选框，apply 会保持受阻。OpenSpec 统计这些复选框形式：

```markdown
- [ ] Pending task
- [x] Completed task
* [X] Completed task
```

允许前导空格。spec-driven 页面中的 [tasks.md 一节](spec-driven/index.md#tasksmd) 定义了默认 schema 生成的更严格格式。

被跟踪的文件驱动 apply 状态：

- **`blocked`**：文件缺失，或没有带任务文本的复选框。
- **`ready`**：至少有一个被跟踪的任务待办。
- **`all_done`**：每个被跟踪的任务都已勾选。

OpenSpec 拒绝绝对路径和包含 `..` 段的路径。

<a id="apply-defaults"></a>

### Apply 默认值

| 行为 | 默认值 |
|---|---|
| 必需制品 | schema 中的每个制品 |
| 进度跟踪 | 无被跟踪文件 |
| Agent 指引 | 内置 apply 指引 |

## 完整示例

```yaml
name: review-first
version: 1
description: Proposal and implementation checklist

artifacts:
  - id: proposal
    generates: proposal.md
    description: Why the change is needed and what it affects
    template: proposal.md
    instruction: |
      Explain the problem, the proposed change, and its impact.
    requires: []

  - id: tasks
    generates: tasks.md
    description: Trackable implementation checklist
    template: tasks.md
    instruction: |
      Break the approved proposal into ordered implementation tasks.
    requires:
      - proposal

apply:
  requires:
    - tasks
  tracks: tasks.md
  instruction: |
    Work through the pending tasks and mark each one complete.
```

## 校验

[`openspec-cn schema validate <name>`](../cli.md#openspec-schema-validate) 检查：

- 字段类型和必填字段
- 相对路径
- 制品 ID、依赖和环
- 模板文件

校验不会捕获这些错误：

| 错误 | 后果 |
|---|---|
| 字段拼写错误，例如 `instrution` | OpenSpec 忽略它。校验不报告该拼写错误。 |
| `apply.requires` 指向未知的制品 ID | 校验不报告该未知 ID。 |
| `name` 与 schema 目录名不同 | 校验通过。OpenSpec 仍使用目录名进行查找。 |
