# 项目配置

> 用 config.yaml 中的几行配置，让工作流按你想要的方式规划变更。

`openspec/config.yaml` 告诉工作流你希望变更如何被规划。

例如，下面的配置更新了 [tasks.md](../reference/schemas/spec-driven/index.md) 制品的创建规则：

```yaml
rules:
  tasks:
    - End every task with a commit
```

当 Agent 运行时，它会采用这些规则，确保每个任务都以一次提交收尾。

保持 rules 简短。这里的一切都会进入 Agent 的上下文，冗长的规则可能让输出变差。

## 工作原理

config.yaml 保存的是 Agent 在创建制品或推进工作流时收到的指令。

每次运行时会发生这些：

1. 你运行一个工作流（例如 `/openspec-propose`）。
2. Agent 调用 [`openspec-cn instructions`](../reference/cli.md) 命令。
3. 该命令从 config.yaml 读取你的 context 和 rules。
4. OpenSpec 的内置指令和你的定制会合并成给 Agent 的单一提示词。
5. Agent 依据该提示词撰写制品。

例如，有了一个 `context` 字段和本页开头的规则，下面是 [`openspec-cn instructions`](../reference/cli.md) 为 tasks.md 返回的内容（已精简并加注）：

```xml
<artifact id="tasks" change="add-dark-mode" schema="spec-driven">

  <!-- From your config.yaml: context -->
  <project_context>
    Tech stack: TypeScript, Node.js
    Domain: e-commerce platform
  </project_context>

  <!-- From your config.yaml: rules for tasks -->
  <rules>
    - End every task with a commit
  </rules>

  <!-- From OpenSpec: the built-in guidance -->
  <instruction>
    ...how to write a good tasks.md...
  </instruction>

  <template>
    ...the tasks.md structure to fill in...
  </template>

</artifact>
```

你的配置先出现，然后是 OpenSpec 的内置指令和模板。Rules 是对内置内容的追加，从不替换。对 config.yaml 的编辑会在下次运行时传给 Agent。

[工作流运行](../reference/architecture/workflow-runs.md) 覆盖了从调用到产出制品的完整过程。

## 字段

三个字段决定 Agent 收到什么。每个字段的精确契约（类型、限制、校验）在 [项目配置 (config.yaml)](../reference/configuration/config-yaml.md) 中。

| 字段 | 作用 | 注入到 |
|---|---|---|
| `context` | Agent 始终收到的指令 | 一切：每个制品、`apply`、`archive` |
| `rules` | 针对某个制品的额外指令 | 仅该制品的创建 |
| `operations` | 工作流步骤如何执行的指引 | 仅 `apply` 和 `archive` |

config.yaml 的其他字段（`schema`、`store`、`references`）选择项目使用哪个 schema、哪个 OpenSpec 根目录。契约页覆盖了它们。

最后一列是精确的，所以一个字段只到达列出的步骤。特别是 `verify` 从不接收 `rules`。它对照制品本身检查实现。

### context

`context` 是 Agent 在规划变更时应该预先知道的，无论是创建制品、实施任务还是归档：

```yaml
context: |
  We ship cross-platform; designs and tasks must cover Windows, macOS, and Linux
  Tech stack: TypeScript, Node.js, Commander.js
  We use conventional commits
```

这是规划上下文，不是项目文档。当某个事实应该影响每份计划时就加进去，比如上面的跨平台那一行。Agent 通过读代码就能知道的内容就省略。

**另一种语言**：因为 context 会到达每个制品，它也是你改变输出语言的方式。一行，比如 `Write all artifacts in Spanish.`，就能切换工作流写出的每个 proposal、spec 和 tasks 文件的语言。

### rules

`rules` 挂到某个制品上，以制品 id 为键。每一行都会加到该制品的内置指引中：

```yaml
rules:
  proposal:
    - Keep proposals under 500 words
  tasks:
    - Every UI task includes a Playwright test
```

现在 proposal 保持简短，tasks.md 总是规划浏览器测试。其他制品不受影响。

### operations

`operations` 指引 Agent 如何执行 `apply` 和 `archive`，而不是制品的内容：

```yaml
operations:
  apply:
    guidance:
      - Run the linter before marking a task complete
  archive:
    guidance:
      - Summarize what shipped before archiving
```

在 apply 过程中，Agent 在完成任务时运行 lint。在 archive 过程中，它最后给出一个总结。

## 当 config.yaml 不够用时

Config 在标准工作流之上追加指令，但它不能改变存在哪些制品或它们如何组织。当你想要那个级别的控制，或者 rules 不能稳定地引导行为时，[fork 一个 schema](schemas.md)。
