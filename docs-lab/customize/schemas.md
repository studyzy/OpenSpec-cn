# Schemas

> 改变 OpenSpec 产出什么：制品、它们的顺序和模板。

schema 定义变更提案产出什么：哪些制品、什么顺序、来自哪些模板。例如默认随附的 [spec-driven](../reference/schemas/spec-driven/index.md) 大致按这个顺序产出下面四个，每个都建立在前一个之上：

```
proposal → specs → design → tasks
```

当你希望这些是不同的文档时 fork 一个 schema，无论是指更少的文档、不同的名字，还是不同的结构。

<a id="where-schemas-live"></a>

## schemas 放在哪里

OpenSpec 会按顺序在三个地方查找 schema，使用它找到的第一个：

1. **你的项目**：`openspec/schemas/`，随仓库一起提交，这样整个团队都能拿到。
2. **你的机器**：macOS 和 Linux 上是 `~/.local/share/openspec/schemas`（如果你设置了 `$XDG_DATA_HOME` 则在其下），Windows 上是 `%LOCALAPPDATA%\openspec\schemas`。这里的 schemas 在你工作的每个项目中都可用。
3. **包内**：像 `spec-driven` 这样的内置 schema 随 openspec 本身发布。

同一个名字可以存在于多个地方，更具体的位置胜出。`openspec-cn schema which` 显示正在使用哪个副本：

```
$ openspec-cn schema which spec-driven
Schema: spec-driven
Source: project
Path: /your-project/openspec/schemas/spec-driven

Shadows:
  package: .../openspec/schemas/spec-driven
```

## schema 里有什么

schema 由一个纯文件文件夹定义：一个声明制品的 schema.yaml，以及每个制品各一个模板。这是内置的 `spec-driven`：

```
spec-driven/
├── schema.yaml
└── templates/
    ├── proposal.md
    ├── spec.md
    ├── design.md
    └── tasks.md
```

- **schema.yaml**：声明每个制品、它生成的文件、它起始所用的模板、它首先需要什么，以及 Agent 在创建它时收到的指令。每个字段的契约在 [schema.yaml](../reference/schemas/schema-yaml.md) 中。
- **templates/**：每个制品一个 markdown 骨架，由 Agent 填充。

下面是 schema.yaml 中 tasks 制品的条目，已精简：

```yaml
artifacts:
  - id: tasks
    generates: tasks.md
    description: Implementation checklist with trackable tasks
    template: tasks.md
    instruction: |
      ...what the agent is told when creating tasks.md...
    requires:
      - specs
      - design
```

内置 schemas 随 openspec 包一起发布，所以你永远不要就地编辑它们。通过 fork 获得你自己的副本。

## 创建你自己的自定义 schema

有两种方式获得你自己的 schema：

1. **fork 一个已有 schema** 并编辑你的副本。当某个已有 schema 接近你想要的样子时从这里开始，因为里面的一切都已经能工作。
2. **从零开始**，当没有一个合适的，用 `openspec-cn schema init` 搭建一个空 schema。

### fork 一个已有 schema

1. fork 你想作为起点的 schema，从你的项目根目录运行：

   ```console
   $ openspec-cn schema fork spec-driven

   Note: Schema commands are experimental and may change.
   ✔ Forked 'spec-driven' to 'spec-driven-custom'

   Source: .../openspec/schemas/spec-driven (package)
   Destination: /your-project/openspec/schemas/spec-driven-custom
   ```

   传入第二个参数来选择名字（`openspec-cn schema fork spec-driven team-flow`）。名字是 kebab-case。

2. 编辑副本：schema.yaml 和模板。[编辑你的 fork](#editing-your-fork) 覆盖了要改什么。

3. 校验它：

   ```bash
   openspec-cn schema validate spec-driven-custom
   ```

   这是唯一能在一个坏 schema（缺失模板、YAML 错误、依赖循环）让你身陷变更中途之前抓住它的命令。

4. 在 openspec/config.yaml 中把你的项目指向它。这一步要你自己做，因为 fork 不会动 config.yaml：

   ```yaml
   schema: spec-driven-custom
   ```

5. 新的变更提案现在遵循你的 schema。更早创建的变更保留它们开始时用的 schema。

要在不触碰 config.yaml 的情况下随处替换默认 schema，fork 成同名即可：`openspec-cn schema fork spec-driven spec-driven`。于是你项目里的副本会遮蔽内置的，正如 [schemas 放在哪里](#where-schemas-live) 所解释的。

### 从零开始

`openspec-cn schema init` 搭建一个新的 schema，而不是复制一个：

```console
$ openspec-cn schema init lite --description "Lite flow" --artifacts proposal,tasks

✔ Created schema 'lite'
Schema created at: /your-project/openspec/schemas/lite
Artifacts: proposal, tasks
```

脚手架是空的。制品只来自内置的四个 id，生成的模板不带任何指令，所以在你写出自己的之前，Agent 得到的指引较少。之后 fork 的步骤原样适用：校验它，然后把 config.yaml 指向它。

<a id="editing-your-fork"></a>

## 编辑你的 fork

一个 fork 有两类文件可编辑：

- **templates/** 改变每份文档的骨架。给 tasks 模板加一个章节，每个新的 tasks.md 都会以它开头。
- **schema.yaml** 改变工作流本身：存在哪些制品、每个制品首先需要什么，以及 Agent 在创建它时得到的指令。

例如，为更精简的流程去掉 design 文档：

1. 从 schema.yaml 中删除 `design` 条目。
2. 从 `tasks` 的 `requires` 列表中移除 `design`。
3. 校验：

   ```console
   $ openspec-cn schema validate spec-driven-custom

   ✓ Schema 'spec-driven-custom' is valid
   ```

跳过第 2 步，校验会抓住它：

```console
✗ Schema 'spec-driven-custom' has errors:
  error: Invalid dependency reference in artifact 'tasks': 'design' does not exist
```

每次手工编辑后都要校验。一个坏 schema 否则会在变更中途浮出水面，当某个工作流索要一个不存在的文件时。和 config.yaml 一样，schema 的编辑会在下次运行时传给 Agent。

## fork 是一份快照

`openspec-cn update` 会刷新已安装的 skills 和 commands，但它从不触碰 `openspec/schemas/`。你的 fork 会精确地按你留下的样子继续工作，这也意味着当内置 schema 演进时，它不再接收改进。要在之后接收这些改进，就再以新名字 fork 一次内置 schema，并把差异迁移过去。

## 分享 schemas

分享一个 schema 就是复制它的文件夹。

- **和你的团队**：提交 `openspec/schemas/`，仓库里的每个人都用它。
- **跨你的项目**：把文件夹放进 [schemas 放在哪里](#where-schemas-live) 提到的用户级目录。
- **来自社区**：[社区目录](https://github.com/Fission-AI/OpenSpec/blob/main/docs/customization.md#community-schemas) 列出了共享的 schemas。复制一个到 `openspec/schemas/<name>`，它就和自己的 schema 一样工作。

我们正在做一个 schema registry，公有的和私有的，这样 schemas 可以按名字安装，而不是手工复制。
