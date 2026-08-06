# 迁移到 OPSX

本指南帮助你从旧版 OpenSpec 工作流迁移到 OPSX。迁移设计得平滑顺畅——你已有的工作会被保留,新系统提供更大的灵活性。

## 有哪些变化?

OPSX 用流动的、基于动作的方式取代了旧的、阶段锁定的工作流。关键转变如下:

| 方面 | 旧版 | OPSX |
|--------|--------|------|
| **命令** | `/openspec:proposal`、`/openspec:apply`、`/openspec:archive` | 默认:`/opsx:propose`、`/opsx:explore`, `/opsx:apply`、`/opsx:update`, `/opsx:sync`、`/opsx:archive`(扩展工作流命令可选) |
| **工作流** | 一次性创建所有制品 | 增量创建或一次性创建——由你选择 |
| **回退** | 尴尬的阶段关卡 | 自然——随时更新任何制品 |
| **自定义** | 固定结构 | schema 驱动,可完全改写 |
| **配置** | 带标记的 `CLAUDE.md` + `project.md` | 位于 `openspec/config.yaml` 的干净配置 |

**理念变化:** 工作并非线性的。OPSX 不再假装它是。

---

## 开始之前

### 你已有的工作是安全的

迁移过程以保留为设计初衷:

- **`openspec/changes/` 中的活跃变更** — 完全保留。你可以用 OPSX 命令继续操作它们。
- **已归档的变更** — 原封不动。你的历史记录保持完整。
- **`openspec/specs/` 中的主 specs** — 原封不动。它们是你的事实来源。
- **你在 CLAUDE.md、AGENTS.md 等中的内容** — 保留。仅移除 OpenSpec 标记块;你写的一切都留下。

### 会被移除的内容

仅移除正在被替换的、由 OpenSpec 管理的文件:

| 内容 | 原因 |
|------|-----|
| 旧版 slash command 目录/文件 | 被新的 skills 系统取代 |
| `openspec/AGENTS.md` | 过时的触发器 |
| `CLAUDE.md`、`AGENTS.md` 等中的 OpenSpec 标记 | 不再需要 |

**按工具划分的旧版命令位置**(示例——你的工具可能不同):

- Claude Code: `.claude/commands/openspec/`
- Cursor: `.cursor/commands/openspec-*.md`
- Devin Desktop, formerly Windsurf: `.windsurf/workflows/openspec-*.md`
- Cline: `.clinerules/workflows/openspec-*.md`
- Roo: `.roo/commands/openspec-*.md`
- GitHub Copilot: `.github/prompts/openspec-*.prompt.md` (IDE extensions only; not supported in Copilot CLI)
- Codex: OpenSpec now uses the canonical `.agents/skills/openspec-*` path. OpenSpec-managed `SKILL.md` files under the former `.codex/skills` path are reconciled only after replacements exist; custom files and divergent copies stay in place. If an unmarked `.agents` tree already contains OpenSpec skills, OpenSpec preserves its existing Codex (`$openspec-*`) or generic (`/openspec-*`) rendering instead of guessing from the legacy directory. Select `codex` explicitly with `openspec init` to switch ownership. Legacy prompt cleanup still targets only OpenSpec's allowlisted filenames in `$CODEX_HOME/prompts` or `~/.codex/prompts`.
- And others (Augment, Continue, Amazon Q, etc.)

迁移会检测你配置了哪些工具并清理它们的旧版文件。

移除清单看起来可能很长,但这些全是 OpenSpec 最初创建的文件。你自己的内容绝不会被删除。

### 需要你关注的内容

一个文件需要手动迁移:

**`openspec/project.md`** — 此文件不会自动删除,因为它可能包含你写的项目上下文。你需要:

1. 审阅其内容
2. 将有用上下文移至 `openspec/config.yaml`(参见下方指引)
3. 准备好后删除该文件

**为何做出此改动:**

旧的 `project.md` 是被动的——agents 可能读它、可能不读、可能忘记读过的内容。我们发现可靠性并不一致。

新的 `config.yaml` 上下文会**主动注入到每个 OpenSpec 规划请求中**。这意味着你的项目约定、技术栈和规则在 AI 创建制品时始终在场。可靠性更高。

**权衡:**

由于上下文被注入到每个请求中,你会希望保持简洁。聚焦于真正重要的内容:
- 技术栈与关键约定
- AI 需要知道的、不显而易见的约束
- 之前经常被忽略的规则

别担心做到完美。我们仍在摸索这里什么最有效,并会随着实验改进上下文注入的方式。

---

## 运行迁移

`openspec-cn init` 和 `openspec-cn update` 都会检测旧版文件,并引导你完成相同的清理流程。根据你的处境任选其一:

- 全新安装默认使用 profile `core`(`propose`、`explore`、`apply`、`update`, `sync`、`archive`)。
- 迁移后的安装会在需要时写入 `custom` profile,以保留你之前安装的工作流。

### 使用 `openspec-cn init`

若你想添加新工具或重新配置设置了哪些工具,运行此命令:

```bash
openspec-cn init
```

init 命令会检测旧版文件并引导你完成清理:

```
Upgrading to the new OpenSpec

OpenSpec now uses agent skills, the emerging standard across coding
agents. This simplifies your setup while keeping everything working
as before.

Files to remove
No user content to preserve:
  • .claude/commands/openspec/
  • openspec/AGENTS.md

Files to update
OpenSpec markers will be removed, your content preserved:
  • CLAUDE.md
  • AGENTS.md

Needs your attention
  • openspec/project.md
    We won't delete this file. It may contain useful project context.

    The new openspec/config.yaml has a "context:" section for planning
    context. This is included in every OpenSpec request and works more
    reliably than the old project.md approach.

    Review project.md, move any useful content to config.yaml's context
    section, then delete the file when ready.

? Upgrade and clean up legacy files? (Y/n)
```

**当你回答 yes 时会发生什么:**

1. 移除旧版 slash command 目录
2. 从 `CLAUDE.md`、`AGENTS.md` 等中剥离 OpenSpec 标记(你的内容保留)
3. 删除 `openspec/AGENTS.md`
4. 在 `.claude/skills/` 中安装新 skills
5. 创建带有默认 schema 的 `openspec/config.yaml`

### 使用 `openspec-cn update`

若你只想迁移并将已有工具刷新到最新版本,运行此命令:

```bash
openspec-cn update
```

update 命令也会检测并清理旧版制品,然后将生成的 skills/commands 刷新以匹配你当前的 profile 与交付设置。

### 非交互式 / CI 环境

对于脚本化迁移:

```bash
openspec-cn init --force --tools claude
```

`--force` 标志会跳过提示并自动接受清理。

This includes cleanup of OpenSpec-managed Codex prompt files in the global Codex prompt directory. Cleanup only targets OpenSpec's allowlisted legacy Codex prompt filenames, removes them only after replacement `.agents/skills/openspec-*` skills exist, and preserves all other files.

---

## 将 project.md 迁移到 config.yaml

旧的 `openspec/project.md` 是一个用于项目上下文的自由格式 markdown 文件。新的 `openspec/config.yaml` 是结构化的,并且——关键的是——**注入到每个规划请求中**,因此你的约定在 AI 工作时始终在场。

### 迁移前(project.md)

```markdown
# Project Context

This is a TypeScript monorepo using React and Node.js.
We use Jest for testing and follow strict ESLint rules.
Our API is RESTful and documented in docs/api.md.

## Conventions

- All public APIs must maintain backwards compatibility
- New features should include tests
- Use Given/When/Then format for specifications
```

### 迁移后(config.yaml)

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

### 主要区别

| project.md | config.yaml |
|------------|-------------|
| 自由格式 markdown | 结构化 YAML |
| 一整块文本 | 分离的 context 与逐制品规则 |
| 何时被使用不明确 | context 出现在所有制品中;规则仅出现在匹配的制品中 |
| 无 schema 选择 | 显式 `schema:` 字段设置默认工作流 |

### 保留什么、丢弃什么

迁移时要有所取舍。问自己:"AI 在*每个*规划请求中都需要这个吗?"

**适合放入 `context:` 的:**
- 技术栈(语言、框架、数据库)
- 关键架构模式(monorepo、微服务等)
- 不显而易见的约束("因为……我们不能用 X 库")
- 经常被忽略的关键约定

**改为移到 `rules:` 的:**
- 特定于制品的格式("specs 中使用 Given/When/Then")
- 评审标准("proposals 必须包含回滚计划")
- 这些仅出现在匹配制品中,使其他请求更轻量

**完全排除的:**
- AI 已经知道的通用最佳实践
- 可被概括的冗长解释
- 不影响当前工作的历史背景

### 迁移步骤

1. **创建 config.yaml**(若 init 尚未创建):
   ```yaml
   schema: spec-driven
   ```

2. **添加你的 context**(保持简洁——它会进入每个请求):
   ```yaml
   context: |
     Your project background goes here.
     Focus on what the AI genuinely needs to know.
   ```

3. **添加逐制品规则**(可选):
   ```yaml
   rules:
     proposal:
       - Your proposal-specific guidance
     specs:
       - Your spec-writing rules
   ```

4. **删除 project.md**,一旦你已迁移所有有用的内容。

**别想太多。** 从要点开始，然后逐步迭代。若你注意到 AI 遗漏了重要的东西，就加上。若 context 感觉臃肿,就精简。这是一份动态文档。

### 需要帮助?使用这个提示词

若你不确定如何提炼 project.md,询问你的 AI 助手:

```
I'm migrating from OpenSpec's old project.md to the new config.yaml format.

Here's my current project.md:
[paste your project.md content]

Please help me create a config.yaml with:
1. A concise `context:` section (this gets injected into every planning request, so keep it tight—focus on tech stack, key constraints, and conventions that often get ignored)
2. `rules:` for specific artifacts if any content is artifact-specific (e.g., "use Given/When/Then" belongs in specs rules, not global context)

Leave out anything generic that AI models already know. Be ruthless about brevity.
```

AI 会帮你识别哪些是必需的、哪些可以精简。

---

## 新命令

命令可用性取决于 profile:

**默认(`core` profile):**

| 命令 | 用途 |
|---------|---------|
| `/opsx:propose` | 一步创建变更并生成规划制品 |
| `/opsx:explore` | 无结构地梳理想法 |
| `/opsx:apply` | 实现 tasks.md 中的任务 |
| `/opsx:update` | Revise a change's planning artifacts and keep them coherent |
| `/opsx:sync` | Merge delta specs into main specs |
| `/opsx:archive` | 定稿并归档变更 |

**扩展工作流(自定义选择):**

| 命令 | 用途 |
|---------|---------|
| `/opsx:new` | Start a new change scaffold |
| `/opsx:continue` | Create the next artifact (one at a time) |
| `/opsx:ff` | Fast-forward—create planning artifacts at once |
| `/opsx:verify` | Validate implementation matches specs |
| `/opsx:bulk-archive` | Archive multiple changes at once |
| `/opsx:onboard` | Guided end-to-end onboarding workflow |

用 `openspec-cn config profile` 启用扩展命令,然后运行 `openspec-cn update`。

### 从旧版的命令映射

| 旧版 | OPSX 等价命令 |
|--------|-----------------|
| `/openspec:proposal` | `/opsx:propose`(默认)或 `/opsx:new` 后接 `/opsx:ff`(扩展) |
| `/openspec:apply` | `/opsx:apply` |
| `/openspec:archive` | `/opsx:archive` |

### 新能力

这些能力属于扩展工作流命令集合。

**细粒度制品创建:**
```
/opsx:continue
```
根据依赖关系一次创建一个制品。当你想审查每一步时使用。

**探索模式:**
```
/opsx:explore
```
在着手变更前,与伙伴一起梳理想法。

---

## 理解新架构

### 从阶段锁定到流动

旧版工作流强制线性推进:

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   PLANNING   │ ───► │ IMPLEMENTING │ ───► │   ARCHIVING  │
│    PHASE     │      │    PHASE     │      │    PHASE     │
└──────────────┘      └──────────────┘      └──────────────┘

If you're in implementation and realize the design is wrong?
Too bad. Phase gates don't let you go back easily.
```

OPSX 使用动作,而非阶段:

```
         ┌───────────────────────────────────────────────┐
         │           ACTIONS (not phases)                │
         │                                               │
         │     new ◄──► continue ◄──► apply ◄──► archive │
         │      │          │           │             │   │
         │      └──────────┴───────────┴─────────────┘   │
         │                    any order                  │
         └───────────────────────────────────────────────┘
```

### 依赖图

制品构成有向图。依赖是促成者,而非关卡:

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

当你运行 `/opsx:continue` 时,它会检查就绪情况并提供下一个制品。你也可以按任意顺序创建多个就绪的制品。

### Skills 与 Commands 对比

旧版系统使用各工具特定的命令文件:

```
.claude/commands/openspec/
├── proposal.md
├── apply.md
└── archive.md
```

OPSX 使用新兴的 **skills** 标准:

```
.claude/skills/
├── openspec-explore/SKILL.md
├── openspec-new-change/SKILL.md
├── openspec-continue-change/SKILL.md
├── openspec-apply-change/SKILL.md
└── ...
```

Skills 被多种 AI 编程工具识别,并提供更丰富的元数据。

Codex is skills-only in OPSX. OpenSpec no longer generates Codex custom prompt files; use the generated `.agents/skills/openspec-*` directories instead.

---

## 继续已有的变更

你进行中的变更可无缝配合 OPSX 命令使用。

**有一个来自旧版工作流的活跃变更?**

```
/opsx:apply add-my-feature
```

OPSX 读取已有的制品,并从中断处继续。

**想给已有变更添加更多制品?**

```
/opsx:continue add-my-feature
```

根据已存在的内容显示哪些即将就绪、可以创建。

**需要查看状态?**

```bash
openspec-cn status --change add-my-feature
```

---

## 新配置系统

### config.yaml 结构

```yaml
# Required: Default schema for new changes
schema: spec-driven

# Optional: Project context (max 50KB)
# Injected into ALL artifact instructions
context: |
  Your project background, tech stack,
  conventions, and constraints.

# Optional: Per-artifact rules
# Only injected into matching artifacts
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

### Schema 解析

在确定使用哪个 schema 时,OPSX 按以下顺序检查:

1. **CLI flag**: `--schema <name>`(最高优先级)
2. **变更元数据**: 变更目录中的 `.openspec.yaml`
3. **项目配置**: `openspec/config.yaml`
4. **默认**: `spec-driven`

### 可用 Schemas

| Schema | 制品 | 最适合 |
|--------|-----------|----------|
| `spec-driven` | proposal → specs → design → tasks | 多数项目 |

列出所有可用 schemas:

```bash
openspec-cn schemas
```

### 自定义 Schemas

创建你自己的工作流:

```bash
openspec-cn schema init my-workflow
```

或 fork 一个已有的:

```bash
openspec-cn schema fork spec-driven my-workflow
```

详情见 [Customization](customization.md)。

---

## 故障排查

### "Legacy files detected in non-interactive mode"(非交互模式下检测到旧版文件)

你正在 CI 或非交互式环境中运行。使用:

```bash
openspec-cn init --force
```

### 迁移后命令未出现

重启你的 IDE。Skills 在启动时检测。

### "Unknown artifact ID in rules"(rules 中存在未知制品 ID)

检查你的 `rules:` 键是否与 schema 的制品 ID 匹配:

- **spec-driven**: `proposal`、`specs`、`design`、`tasks`

运行以下命令查看有效制品 ID:

```bash
openspec-cn schemas --json
```

### 配置未生效

1. 确保文件位于 `openspec/config.yaml`(而非 `.yml`)
2. 验证 YAML 语法
3. 配置更改立即生效——无需重启

### project.md 未迁移

系统有意保留 `project.md`,因为它可能包含你的自定义内容。请手动审阅,将有用的部分移至 `config.yaml`,然后删除它。

### 想看看会被清理什么?

运行 init 并拒绝清理提示——你会看到完整的检测摘要,而系统不会做任何改动。

---

## 快速参考

### 迁移后的文件

```
project/
├── openspec/
│   ├── specs/                    # 未变
│   ├── changes/                  # 未变
│   │   └── archive/              # 未变
│   └── config.yaml               # 新增:项目配置
├── .claude/
│   └── skills/                   # 新增:OPSX skills
│       ├── openspec-propose/     # 默认 core profile
│       ├── openspec-explore/
│       ├── openspec-apply-change/
│       ├── openspec-update-change/
│       ├── openspec-sync-specs/
│       ├── openspec-archive-change/
│       └── ...                   # expanded profile 添加 new/continue/ff 等
├── CLAUDE.md                     # OpenSpec 标记已移除,你的内容保留
└── AGENTS.md                     # OpenSpec 标记已移除,你的内容保留
```

### 已消失的内容

- `.claude/commands/openspec/` — 被 `.claude/skills/` 取代
- `openspec/AGENTS.md` — 已过时
- `openspec/project.md` — 迁移到 `config.yaml`,然后删除
- `CLAUDE.md`、`AGENTS.md` 等中的 OpenSpec 标记块

### 命令速查表

```text
/opsx:propose      Start quickly (default core profile)
/opsx:apply        Implement tasks
/opsx:archive      Finish and archive

# Expanded workflow (if enabled):
/opsx:new          Scaffold a change
/opsx:continue     Create next artifact
/opsx:ff           Create planning artifacts
```

---

## 获取帮助

- **Discord**: [discord.gg/YctCnvvshC](https://discord.gg/YctCnvvshC)
- **GitHub Issues**: [github.com/Fission-AI/OpenSpec/issues](https://github.com/Fission-AI/OpenSpec/issues)
- **文档**: [docs/opsx.md](opsx.md) 获取完整 OPSX 参考
