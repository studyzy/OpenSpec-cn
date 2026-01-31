# 迁移到 OPSX

本指南帮助您从旧的 OpenSpec 工作流过渡到 OPSX。迁移过程设计得很流畅——您现有的工作得以保留，新系统提供更大的灵活性。

## 有什么变化？

OPSX 用流畅的、基于行动的方法取代了旧的阶段锁定工作流。以下是关键变化：

| 方面 | 旧版 | OPSX |
|--------|--------|------|
| **命令** | `/opsx:proposal`、`/opsx:apply`、`/opsx:archive` | `/opsx:new`、`/opsx:continue`、`/opsx:apply` 等 |
| **工作流** | 一次性创建所有制品 | 逐步创建或一次性创建——您决定 |
| **回退** | 尴尬的阶段门限 | 自然——随时更新任何制品 |
| **自定义** | 固定结构 | 模式驱动，完全可扩展 |
| **配置** | 带标记的 `CLAUDE.md` + `project.md` | `openspec/config.yaml` 中的干净配置 |

**理念变化：** 工作不是线性的。OPSX 不再假装它是。

---

## 迁移前准备

### 您的现有工作是安全的

迁移过程设计时就考虑了保留：

- **`openspec/changes/` 中的活跃变更** — 完全保留。您可以使用 OPSX 命令继续它们。
- **已归档的变更** — 不受影响。您的历史记录保持完整。
- **`openspec/specs/` 中的主要规范** — 不受影响。这些是您的真实来源。
- **您在 CLAUDE.md、AGENTS.md 等中的内容** — 保留。只有 OpenSpec 标记块被删除；您编写的内容保持不变。

### 删除的内容

仅删除被替换的 OpenSpec 管理文件：

| 内容 | 原因 |
|------|-----|
| 旧的斜杠命令目录/文件 | 被新的技能系统取代 |
| `openspec/AGENTS.md` | 过时的工作流触发器 |
| `CLAUDE.md`、`AGENTS.md` 等中的 OpenSpec 标记` | 不再需要 |

**各工具的旧命令位置**（示例——您的工具可能不同）：

- Claude Code：`.claude/commands/openspec/`
- Cursor：`.cursor/commands/openspec-*.md`
- Windsurf：`.windsurf/workflows/openspec-*.md`
- Cline：`.clinerules/workflows/openspec-*.md`
- Roo：`.roo/commands/openspec-*.md`
- GitHub Copilot：`.github/prompts/openspec-*.prompt.md`
- 其他（Augment、Continue、Amazon Q 等）

迁移会检测您配置的任何工具并清理其旧文件。

删除列表可能看起来很长，但这些都是 OpenSpec 最初创建的文件。您自己的内容从未被删除。

### 需要您注意的事项

一个文件需要手动迁移：

**`openspec/project.md`** — 这个文件不会自动删除，因为它可能包含您编写的项目上下文。您需要：

1. 检查其内容
2. 将有用的上下文移至 `openspec/config.yaml`（见下方指导）
3. 准备好后删除该文件

**我们做出此更改的原因：**

旧的 `project.md` 是被动的——代理可能会读取它，可能不会，可能会忘记读取的内容。我们发现可靠性不一致。

新的 `config.yaml` 上下文被**主动注入到每个 OpenSpec 规划请求中**。这意味着您的项目约定、技术栈和规则在 AI 创建制品时总是存在。更高的可靠性。

**权衡：**

由于上下文被注入到每个请求中，您希望保持简洁。专注于真正重要的内容：
- 技术栈和关键约定
- AI 需要了解的非明显约束
- 经常被忽略的规则

不要担心做到完美。我们仍在学习什么在这里效果最好，并且我们将改进上下文注入的工作方式，随着我们的实验。

---

## 运行迁移

`openspec-cn init` 和 `openspec-cn update` 都会检测旧文件并引导您完成相同的清理过程。使用适合您情况的任何一种：

### 使用 `openspec-cn init`

如果您想添加新工具或重新配置哪些工具被设置，请运行此命令：

```bash
openspec-cn init
```

init 命令检测旧文件并引导您完成清理：

```
升级到新的 OpenSpec

OpenSpec 现在使用代理技能，这是编码代理中涌现的标准。
这简化了您的设置，同时保持一切像以前一样工作。

要删除的文件
没有需要保留的用户内容：
  • .claude/commands/openspec/
  • openspec/AGENTS.md

要更新的文件
OpenSpec 标记将被删除，您的内容保留：
  • CLAUDE.md
  • AGENTS.md

需要您注意
  • openspec/project.md
    我们不会删除此文件。它可能包含有用的项目上下文。

    新的 openspec/config.yaml 有一个用于规划上下文的 "context:" 部分。
    这包含在每次 OpenSpec 请求中，并且比旧的 project.md 方法更可靠。

    检查 project.md，将任何有用的内容移至 config.yaml 的 context 部分，
    然后在准备好时删除该文件。

? 升级并清理旧文件？(Y/n)
```

**当您说是时会发生什么：**

1. 旧的斜杠命令目录被删除
2. OpenSpec 标记从 `CLAUDE.md`、`AGENTS.md` 等中剥离（您的内容保留）
3. `openspec/AGENTS.md` 被删除
4. 新的技能安装在 `.claude/skills/`
5. `openspec/config.yaml` 使用默认模式创建

### 使用 `openspec-cn update`

如果您只想迁移并将现有工具刷新到最新版本，请运行此命令：

```bash
openspec-cn update
```

update 命令也检测并清理旧制品，然后将您的技能刷新到最新版本。

### 非交互式/CI 环境

对于脚本化迁移：

```bash
openspec-cn init --force --tools claude
```

`--force` 标志跳过提示并自动接受清理。

---

## 将 project.md 迁移到 config.yaml

旧的 `openspec/project.md` 是用于项目上下文的自由格式 markdown 文件。新的 `openspec/config.yaml` 是结构化的，并且——关键的是——**注入到每个规划请求中**，因此您的约定在 AI 工作时总是存在。

### 之前（project.md）

```markdown
# 项目上下文

这是一个使用 React 和 Node.js 的 TypeScript monorepo。
我们使用 Jest 进行测试并遵循严格的 ESLint 规则。
我们的 API 是 RESTful 并在 docs/api.md 中记录。

## 约定

- 所有公共 API 必须保持向后兼容
- 新功能应该包括测试
- 规范使用 Given/When/Then 格式
```

### 之后（config.yaml）

```yaml
schema: spec-driven

context: |
  Tech stack: TypeScript, React, Node.js
  Testing: Jest with React Testing Library
  API: RESTful, documented in docs/api.md
  We maintain backwards compatibility for all public APIs

rules:
  proposal:
    - Include rollback plan for risky changes
  specs:
    - Use Given/When/Then format for scenarios
    - Reference existing patterns before inventing new ones
  design:
    - Include sequence diagrams for complex flows
```

### 关键差异

| project.md | config.yaml |
|------------|-------------|
| 自由格式 markdown | 结构化 YAML |
| 一块文本 | 分离的上下文和每个制品规则 |
| 不清楚何时使用 | 上下文出现在所有制品中；规则仅出现在匹配的制品中 |
| 无模式选择 | 显式的 `schema:` 字段设置默认工作流 |

### 保留什么，删除什么

迁移时要有选择性。问问自己："AI 需要这个用于*每个*规划请求吗？"

**适合 `context:` 的候选内容：**
- 技术栈（语言、框架、数据库）
- 关键架构模式（monorepo、微服务等）
- 非明显的约束（"我们不能使用库 X 因为..."）
- 经常被忽略的关键约定

**改为移至 `rules:`**
- 特定于制品的格式（"在规范中使用 Given/When/Then"）
- 审查标准（"提案必须包括回滚计划"）
- 这些仅出现在匹配的制品中，使其他请求更轻量

**完全省略**
- AI 已经知道的一般最佳实践
- 可以总结的冗长解释
- 不影响当前工作的历史上下文

### 迁移步骤

1. **创建 config.yaml**（如果尚未由 init 创建）：
   ```yaml
   schema: spec-driven
   ```

2. **添加您的上下文**（保持简洁——这会进入每个请求）：
   ```yaml
   context: |
     您的项目背景放在这里。
     专注于 AI 真正需要了解的内容。
   ```

3. **添加每个制品规则**（可选）：
   ```yaml
   rules:
     proposal:
       - 您的特定于提案的指导
     specs:
       - 您的规范编写规则
   ```

4. **删除 project.md** 一旦您已移动所有有用的内容。

**不要过度思考。** 从 essentials 开始并迭代。如果您注意到 AI 缺少重要的东西，添加它。如果上下文感觉臃肿，修剪它。这是一个活跃文档。

### 需要帮助？使用此提示词

如果您不确定如何精简 project.md，请询问您的 AI 助手：

```
我正在从 OpenSpec 的旧 project.md 迁移到新的 config.yaml 格式。

这是我当前的 project.md：
[粘贴您的 project.md 内容]

请帮助我创建一个 config.yaml，包含：
1. 简洁的 `context:` 部分（这会注入到每个规划请求中，所以保持紧凑——专注于技术栈、关键约束和经常被忽略的约定）
2. 特定于制品的 `rules:`（如果任何内容是特定于制品的，例如"使用 Given/When/Then" 属于规范规则，而不是全局上下文）

省略 AI 模型已经知道的任何通用内容。在简洁性上要坚决。
```

AI 将帮助您识别什么是必不可少的，什么可以被修剪。

---

## 新命令

迁移后，您有 9 个 OPSX 命令而不是 3 个：

| 命令 | 用途 |
|---------|---------|
| `/opsx:explore` | 毫无结构地思考想法 |
| `/opsx:new` | 开始新的变更 |
| `/opsx:continue` | 创建下一个制品（一次一个） |
| `/opsx:ff` | 快进——一次性创建所有规划制品 |
| `/opsx:apply` | 从 tasks.md 实施任务 |
| `/opsx:verify` | 验证实施是否匹配规范 |
| `/opsx:sync` | 预览规范合并（可选—如果需要归档提示词） |
| `/opsx:archive` | 最终确定并归档变更 |
| `/opsx:bulk-archive` | 一次归档多个变更 |

### 从旧版映射的命令

| 旧版 | OPSX 等效 |
|--------|-----------------|
| `/opsx:proposal` | `/opsx:new` 然后 `/opsx:ff` |
| `/opsx:apply` | `/opsx:apply` |
| `/opsx:archive` | `/opsx:archive` |

### 新功能

**细粒度制品创建：**
```
/opsx:continue
```
基于依赖关系一次创建一个制品。当您想审查每一步时使用此功能。

**探索模式：**
```
/opsx:explore
```
在提交变更之前与伙伴一起思考想法。

---

## 理解新架构

### 从阶段锁定到流畅

旧工作流强制线性进展：

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   PLANNING   │ ───► │ IMPLEMENTING │ ───► │   ARCHIVING  │
│    PHASE     │      │    PHASE     │      │    PHASE     │
└──────────────┘      └──────────────┘      └──────────────┘

如果您在实施过程中意识到设计是错误的？
太糟糕了。阶段门限不允许您轻松回退。
```

OPSX 使用行动，而不是阶段：

```
         ┌───────────────────────────────────────────┐
         │           ACTIONS (not phases)            │
         │                                           │
         │ new ◄──► continue ◄──► apply ◄──► archive │
         │   │          │           │           │    │
         │   └──────────┴───────────┴───────────┘    │
         │              any order                    │
         └───────────────────────────────────────────┘
```

### 依赖图

制品形成一个有向图。依赖关系是启用器，而不是门限：

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

当您运行 `/opsx:continue` 时，它会检查什么准备好了并提供下一个制品。您也可以按任何顺序创建多个准备好的制品。

### 技能与命令

旧系统使用特定于工具的命令文件：

```
.claude/commands/openspec/
├── proposal.md
├── apply.md
└── archive.md
```

OPSX 使用涌现的**技能**标准：

```
.claude/skills/
├── openspec-explore/SKILL.md
├── openspec-new-change/SKILL.md
├── openspec-continue-change/SKILL.md
├── openspec-apply-change/SKILL.md
└── ...
```

技能在多个 AI 编码工具中被识别，并提供更丰富的元数据。

---

## 继续现有变更

您进行中的变更与 OPSX 命令无缝工作。

**有来自旧工作流的活跃变更吗？**

```
/opsx:apply add-my-feature
```

OPSX 读取现有制品并从您离开的地方继续。

**想要向现有变更添加更多制品吗？**

```
/opsx:continue add-my-feature
```

根据已经存在的内容显示什么准备好创建。

**需要查看状态吗？**

```bash
openspec-cn status --change add-my-feature
```

---

## 新配置系统

### config.yaml 结构

```yaml
# 必需：新变更的默认模式
schema: spec-driven

# 可选：项目上下文（最大 50KB）
# 注入到所有制品指令中
context: |
  您的项目背景、技术栈、
  约定和约束。

# 可选：每个制品规则
# 仅注入到匹配的制品中
rules:
  proposal:
    - Include rollback plan
  specs:
    - Use Given/When/Then format
  design:
    - Document fallback strategies
  tasks:
    - Break into 2-hour maximum chunks
```

### 模式解析

当确定使用哪个模式时，OPSX 按顺序检查：

1. **CLI 标志**：`--schema <name>`（最高优先级）
2. **变更元数据**：变更目录中的 `.openspec.yaml`
3. **项目配置**：`openspec/config.yaml`
4. **默认**：`spec-driven`

### 可用的模式

| 模式 | 制品 | 最适合 |
|--------|-----------|----------|
| `spec-driven` | proposal → specs → design → tasks | 大多数项目 |

列出所有可用的模式：

```bash
openspec-cn schemas
```

### 自定义模式

创建您自己的工作流：

```bash
openspec-cn schema init my-workflow
```

或派生现有模式：

```bash
openspec-cn schema fork spec-driven my-workflow
```

详情请参阅[自定义](customization.md)。

---

## 故障排除

### "在非交互模式下检测到旧文件"

您正在 CI 或非交互式环境中运行。使用：

```bash
openspec-cn init --force
```

### 迁移后命令未出现

重启您的 IDE。技能在启动时被检测到。

### "规则中的未知制品 ID"

检查您的 `rules:` 键是否与您的模式的制品 ID 匹配：

- **spec-driven**：`proposal`、`specs`、`design`、`tasks`

运行此命令以查看有效的制品 ID：

```bash
openspec-cn schemas --json
```

### 配置未应用

1. 确保文件位于 `openspec/config.yaml`（不是 `.yml`）
2. 验证 YAML 语法
3. 配置更改立即生效——无需重启

### project.md 未迁移

系统有意保留 `project.md`，因为它可能包含您的自定义内容。手动检查它，将有用的部分移至 `config.yaml`，然后删除它。

### 想要查看将被清理的内容吗？

运行 init 并拒绝清理提示——您将看到完整的检测摘要，而不会进行任何更改。

---

## 快速参考

### 迁移后的文件

```
project/
├── openspec/
│   ├── specs/                    # 未更改
│   ├── changes/                  # 未更改
│   │   └── archive/              # 未更改
│   └── config.yaml               # 新：项目配置
├── .claude/
│   └── skills/                   # 新：OPSX 技能
│       ├── openspec-explore/
│       ├── openspec-new-change/
│       └── ...
├── CLAUDE.md                     # OpenSpec 标记已删除，您的内容保留
└── AGENTS.md                     # OpenSpec 标记已删除，您的内容保留
```

### 什么消失了

- `.claude/commands/openspec/` — 被 `.claude/skills/` 取代
- `openspec/AGENTS.md` — 过时
- `openspec/project.md` — 迁移到 `config.yaml`，然后删除
- `CLAUDE.md`、`AGENTS.md 等中的 OpenSpec 标记块`

### 命令速查表

```
/opsx:new          开始变更
/opsx:continue     创建下一个制品
/opsx:ff           创建所有规划制品
/opsx:apply        实施任务
/opsx:archive      完成并归档
```

---

## 获取帮助

- **Discord**：[discord.gg/YctCnvvshC](https://discord.gg/YctCnvvshC)
- **GitHub Issues**：[github.com/Fission-AI/OpenSpec/issues](https://github.com/Fission-AI/OpenSpec/issues)
- **文档**：[docs/opsx.md](opsx.md) 用于完整的 OPSX 参考
