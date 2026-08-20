# 命令参考

This is the reference for OpenSpec's slash commands. These commands are invoked in your AI coding assistant's chat interface (e.g., Claude Code, Cursor, Devin Desktop).

关于工作流模式以及何时使用各命令,见 [Workflows](workflows.md)。CLI 命令见 [CLI](cli.md)。

These pages use `/opsx:<command>` as the canonical name. Some tools spell it
differently — Cursor and GitHub Copilot register `/opsx-propose`, Codex uses
`$openspec-propose` — so check [How To Invoke](supported-tools.md#how-to-invoke)
for your tool. The files OpenSpec generates already use the right form.

## 快速参考

### 默认快速路径(`core` profile)

| 命令 | 用途 |
|---------|---------|
| `/opsx:propose` | 一步创建变更并生成规划制品 |
| `/opsx:explore` | 在着手变更前先梳理想法 |
| `/opsx:apply` | 实现变更中的任务 |
| `/opsx:update` | 修订一个变更的规划制品并保持其一致 |
| `/opsx:sync` | 将增量规范(delta spec)合并进主 specs |
| `/opsx:archive` | 归档已完成的变更 |

### 扩展工作流命令(自定义工作流选择)

| 命令 | 用途 |
|---------|---------|
| `/opsx:new` | 启动一个新的变更脚手架 |
| `/opsx:continue` | 根据依赖关系创建下一个制品 |
| `/opsx:ff` | 快进:一次性创建所有规划制品 |
| `/opsx:verify` | 验证实现是否与制品匹配 |
| `/opsx:bulk-archive` | 一次性归档多个变更 |
| `/opsx:onboard` | 引导式走完完整工作流 |

默认全局 profile 为 `core`。要启用扩展工作流命令,运行 `openspec-cn config profile`,选择工作流,然后在该项目中运行 `openspec-cn update`。

---

## 命令参考

### `/opsx:propose`

一步创建新变更并生成规划制品。这是 `core` profile 中默认的起始命令。

**语法:**
```text
/opsx:propose [change-name-or-description]
```

**参数:**
| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `change-name-or-description` | 否 | kebab-case 名称或自然语言变更描述 |

**作用:**
- 创建 `openspec/changes/<change-name>/`
- 生成实现前所需的制品(对于 `spec-driven`:proposal、specs、design、tasks)
- 当变更准备就绪可以进行 `/opsx:apply` 时停止

**示例:**
```text
You: /opsx:propose add-dark-mode

AI:  Created openspec/changes/add-dark-mode/
     ✓ proposal.md
     ✓ specs/ui/spec.md
     ✓ design.md
     ✓ tasks.md
     Ready for implementation. Run /opsx:apply.
```

**提示:**
- 用于最快的端到端路径
- 若你想要逐步控制制品,请启用扩展工作流并使用 `/opsx:new` + `/opsx:continue`

---

### `/opsx:explore`

> **当你不确定时,从这里开始。** Explore 是一个零风险的思考伙伴:它阅读你的代码库、对比方案,并在任何变更产生之前,将一个模糊的想法打磨成具体的计划。它随默认 profile 一同提供。完整说明与更多示例见 [Explore First](explore.md) 指南。

在着手变更之前,梳理想法、调查问题并澄清需求。

**语法:**
```
/opsx:explore [topic]
```

**参数:**
| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `topic` | 否 | 你想探索或调查的内容 |

**作用:**
- 开启一段无需结构的探索性对话
- 调查代码库以回答问题
- 对比方案与思路
- 创建可视化图表以理清思路
- 当洞见成型时,可过渡到 `/opsx:propose`(默认)或 `/opsx:new`(扩展工作流)

**示例:**
```text
You: /opsx:explore

AI:  What would you like to explore?

You: How should we handle authentication for the mobile app?

AI:  Let me investigate your current auth setup...
     [Analyzes codebase]

     I see you're using session-based auth for the web app.
     For mobile, we have three main options:

     1. JWT tokens (stateless, works offline)
     2. OAuth2 (if you need third-party login)
     3. Extend current sessions (simpler, but requires connectivity)

     Your API already has CORS configured. Which direction interests you?

You: Let's go with JWT. Can we start a change for that?

AI:  Ready when you are. Run /opsx:propose add-jwt-auth to begin.
```

**提示:**
- 当需求不明确或你需要调查时使用
- 探索期间不会创建任何制品
- 适合在决定前对比多种方案
- 可以读取文件并搜索代码库

---

### `/opsx:new`

启动一个新的变更脚手架。创建变更文件夹,等待你用 `/opsx:continue` 或 `/opsx:ff` 生成制品。

此命令属于扩展工作流集合(不包含在默认 `core` profile 中)。

**语法:**
```
/opsx:new [change-name] [--schema <schema-name>]
```

**参数:**
| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 变更文件夹的名称(未提供时提示) |
| `--schema` | 否 | 要使用的工作流 schema(默认:来自配置或 `spec-driven`) |

**作用:**
- 创建 `openspec/changes/<change-name>/` 目录
- 在变更文件夹中创建 `.openspec.yaml` 元数据文件
- 显示第一个准备创建的制品模板
- 若未提供,提示输入变更名与 schema

**创建内容:**
```
openspec/changes/<change-name>/
└── .openspec.yaml    # 变更元数据(schema、创建日期)
```

**示例:**
```
You: /opsx:new add-dark-mode

AI:  Created openspec/changes/add-dark-mode/
     Schema: spec-driven

     Ready to create: proposal
     Use /opsx:continue to create it, or /opsx:ff to create all artifacts.
```

**提示:**
- 使用描述性名称:`add-feature`、`fix-bug`、`refactor-module`
- 避免 `update`、`changes`、`wip` 这类泛化名称
- schema 也可在项目配置中设置(`openspec/config.yaml`)

---

### `/opsx:continue`

在依赖链中创建下一个制品。一次创建一个制品,实现增量推进。

**语法:**
```
/opsx:continue [change-name]
```

**参数:**
| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 要继续的变更(未提供时从上下文推断) |

**作用:**
- 查询制品依赖图
- 显示哪些制品就绪、哪些被阻塞
- 创建第一个就绪的制品
- 读取依赖文件以获取上下文
- 显示创建后哪些内容变得可用

**示例:**
```
You: /opsx:continue

AI:  Change: add-dark-mode

     Artifact status:
     ✓ proposal    (done)
     ◆ specs       (ready)
     ◆ design      (ready)
     ○ tasks       (blocked - needs: specs, design)

     Creating specs...

     [Reads proposal.md, creates specs based on requirements]

     ✓ Created openspec/changes/add-dark-mode/specs/ui/spec.md

     Now available: design
     Run /opsx:continue to create the next artifact.
```

**提示:**
- 当你想在继续前审查每个制品时使用
- 适合你想要把控的复杂变更
- 多个制品可能同时就绪
- 你可以在继续前编辑已创建的制品

---

### `/opsx:ff`

快进式创建制品。一次性创建所有规划制品。

**语法:**
```
/opsx:ff [change-name]
```

**参数:**
| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 要快进的变更(未提供时从上下文推断) |

**作用:**
- 按依赖顺序创建所有制品
- 通过待办列表追踪进度
- 当所有 `apply-required` 制品完成时停止
- 在创建下一个制品前先读取每个依赖

**示例:**
```
You: /opsx:ff add-dark-mode

AI:  Fast-forwarding add-dark-mode...

     ✓ Creating proposal.md
     ✓ Creating specs/ui/spec.md
     ✓ Creating design.md
     ✓ Creating tasks.md

     All planning artifacts complete!
     Ready for implementation. Run /opsx:apply to begin.
```

**提示:**
- 当你对要构建的内容有清晰构想时使用
- 对于直白的变更比 `/opsx:continue` 更快
- 你仍可在之后编辑制品
- 适合中小规模功能

---

### `/opsx:apply`

实现变更中的任务。逐步推进任务清单,编写代码并勾选条目。

**语法:**
```
/opsx:apply [change-name]
```

**参数:**
| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 要实现的变更(未提供时从上下文推断) |

**作用:**
- 读取 `tasks.md` 并识别未完成任务
- 逐个推进任务
- 编写代码、创建文件、按需运行测试
- 用复选框 `[x]` 将任务标记为完成

**示例:**
```
You: /opsx:apply

AI:  Implementing add-dark-mode...

     Reading tasks.md:
     - [ ] 1.1 Create ThemeContext
     - [ ] 1.2 Add CSS custom properties
     - [ ] 1.3 Implement localStorage persistence

     Working on 1.1: Create ThemeContext...
     [Creates src/context/ThemeContext.tsx]

     ✓ 1.1 Complete

     Working on 1.2: Add CSS custom properties...
     [Updates src/styles/globals.css]

     ✓ 1.2 Complete
     ...
```

**提示:**
- 若被中断,可从断点处恢复
- 通过指定变更名用于并行变更
- 完成状态记录在 `tasks.md` 的复选框中

---

### `/opsx:update`

修订一个变更中已有的规划制品,并保持彼此一致。仅限规划制品——它从不编辑代码。

**语法:**

```text
/opsx:update [change-name]
```

**参数:**

| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 要更新的变更(未提供时从上下文推断) |

**作用:**

- 通过 `openspec status --change <name> --json` 读取该变更的制品
- 应用你请求的修订;若你未指定,则审查制品寻找矛盾之处
- 朝任意方向协调其他已有制品(对 design 的修改可能回荡影响到 proposal)
- 在写入前逐个制品与你确认
- 结束时建议下一步:`/opsx:continue`(制品缺失)、`/opsx:apply`(将修订后的计划带入代码)或 `/opsx:archive`(全部完成)

**示例:**

```text
You: /opsx:update add-dark-mode - we're storing the theme in a cookie now, not localStorage

AI:  Reading add-dark-mode artifacts...

     The design references localStorage in two places; tasks 1.3 covers
     localStorage persistence; the proposal doesn't mention storage.

     Proposed revisions:
     1. design.md - swap localStorage decision for cookie storage
     2. tasks.md - reword task 1.3 to cookie persistence

     Apply revision 1? (design.md)
```

**提示:**

- 它不会创建缺失的制品——那是 `/opsx:continue` 的职责
- 若变更已经实现,用 `/opsx:apply` 跟进,使代码与修订后的计划一致
- 若你的修订改变了变更的*意图*,不如从头开始一个新变更(见 [何时 Update 与从头开始](opsx.md#when-to-update-vs-start-fresh))

---

### `/opsx:verify`

验证实现是否与你的变更制品匹配。检查完整性、正确性与一致性。

**语法:**
```
/opsx:verify [change-name]
```

**参数:**
| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 要验证的变更(未提供时从上下文推断) |

**作用:**
- 检查实现质量的三方面维度
- 在代码库中搜索实现证据
- 将问题分类为 CRITICAL、WARNING 或 SUGGESTION 报告
- 不阻止归档,但会暴露问题

**验证维度:**

| 维度 | 验证内容 |
|-----------|-------------------|
| **Completeness** | 所有任务完成、所有需求实现、场景覆盖 |
| **Correctness** | 实现与 spec 意图一致、边界情况已处理 |
| **Coherence** | 设计决策反映在代码中、模式一致 |

**示例:**
```
You: /opsx:verify

AI:  Verifying add-dark-mode...

     COMPLETENESS
     ✓ All 8 tasks in tasks.md are checked
     ✓ All requirements in specs have corresponding code
     ⚠ Scenario "System preference detection" has no test coverage

     CORRECTNESS
     ✓ Implementation matches spec intent
     ✓ Edge cases from scenarios are handled
     ✓ Error states match spec definitions

     COHERENCE
     ✓ Design decisions reflected in code structure
     ✓ Naming conventions consistent with design.md
     ⚠ Design mentions "CSS variables" but implementation uses Tailwind classes

     SUMMARY
     ─────────────────────────────
     Critical issues: 0
     Warnings: 2
     Ready to archive: Yes (with warnings)

     Recommendations:
     1. Add test for system preference detection
     2. Update design.md to reflect Tailwind usage, or refactor to use CSS variables
```

**提示:**
- 归档前运行,尽早发现不匹配
- 警告不阻止归档,但提示潜在问题
- 适合在提交前审查 AI 的工作
- 能揭示制品与实现之间的漂移

---

### `/opsx:sync`

**可选命令。** 将变更中的增量规范(delta spec)合并进主 specs。归档时会在需要时提示同步,因此你通常无需手动运行此命令。

**语法:**
```
/opsx:sync [change-name]
```

**参数:**
| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 要同步的变更(未提供时从上下文推断) |

**作用:**
- 从变更文件夹读取增量规范(delta spec)
- 解析 ADDED/MODIFIED/REMOVED/RENAMED 段落
- 将变更合并进主 `openspec/specs/` 目录
- 保留增量中未提及的已有内容
- 不归档变更(保持活跃)

**示例:**
```text
You: /opsx:sync

AI:  Syncing add-dark-mode delta specs...

     Reading: openspec/changes/add-dark-mode/specs/ui/spec.md
     Target:  openspec/specs/ui/spec.md

     Changes to apply:
     ✓ ADDED: Theme Selection requirement (2 scenarios)
     ✓ ADDED: Accessibility requirement (1 scenario)

     Merging...
     ✓ openspec/specs/ui/spec.md updated

     Change remains active. Run /opsx:archive when ready to complete.
```

**何时手动使用:**

| 场景 | 使用 sync? |
|----------|-----------|
| 长期运行的变更,想在归档前让 specs 进入主分支 | 是 |
| 多个并行变更需要更新后的基础 specs | 是 |
| 想单独预览/审查合并 | 是 |
| 快速变更,直接归档 | 否(归档会处理) |

**提示:**
- sync 是智能的,而非复制粘贴
- 可向已有需求添加场景而不重复
- 同步后变更仍保持活跃(未归档)
- 大多数用户永远不需要直接调用它——归档会在需要时提示

---

### `/opsx:archive`

归档一个已完成的变更。定稿该变更并将其移动到归档文件夹。

**语法:**
```
/opsx:archive [change-name]
```

**参数:**
| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 要归档的变更(未提供时从上下文推断) |

**作用:**
- 检查制品完成状态
- 检查任务完成度(未完成时警告)
- 若尚未同步,提供同步增量规范(delta spec)的选项
- 将变更文件夹移动到 `openspec/changes/archive/YYYY-MM-DD-<name>/`
- 保留所有制品以供审计追溯

**示例:**
```text
You: /opsx:archive

AI:  Archiving add-dark-mode...

     Artifact status:
     ✓ proposal.md exists
     ✓ specs/ exists
     ✓ design.md exists
     ✓ tasks.md exists (8/8 tasks complete)

     Delta specs: Not yet synced
     → Sync now? (recommended)

You: Yes

AI:  ✓ Synced specs to openspec/specs/ui/spec.md
     ✓ Moved to openspec/changes/archive/2025-01-24-add-dark-mode/

     Change archived successfully.
```

**提示:**
- 归档不会因任务未完成而阻塞,但会警告
- 增量规范(delta spec)可在归档期间或之前同步
- 归档后的变更会保留以作历史记录
- 先用 `/opsx:verify` 以发现问题

---

### `/opsx:bulk-archive`

一次性归档多个已完成的变更。处理变更之间的 spec 冲突。

**语法:**
```
/opsx:bulk-archive [change-names...]
```

**参数:**
| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `change-names` | 否 | 要归档的具体变更(未提供时提示选择) |

**作用:**
- 列出所有已完成的变更
- 在归档前验证每个变更
- 检测跨变更的 spec 冲突
- 通过检查实际实现来解决冲突
- 按时间顺序归档

**示例:**
```
You: /opsx:bulk-archive

AI:  Found 3 completed changes:
     - add-dark-mode (8/8 tasks complete)
     - fix-login-bug (3/3 tasks complete)
     - update-footer (2/2 tasks complete)

     Checking for spec conflicts...
     ⚠ add-dark-mode and update-footer both touch specs/ui/

     Inspecting codebase to resolve...
     Both changes are implemented. Will merge in chronological order:
     1. add-dark-mode (created Jan 20)
     2. update-footer (created Jan 22)

     Archive all 3 changes?

You: Yes

AI:  ✓ Archived add-dark-mode
     ✓ Archived fix-login-bug
     ✓ Archived update-footer
     Specs merged: add-dark-mode → update-footer
```

**提示:**
- 适合并行工作流
- 冲突解决是 agentic 的(检查代码库)
- 变更按创建顺序归档
- 覆盖 spec 内容前会提示

---

### `/opsx:onboard`

通过完整的 OpenSpec 工作流引导式入门。一个使用你真实代码库的交互式教程。

**语法:**
```
/opsx:onboard
```

**作用:**
- 伴随着旁白走完一个完整的工作流周期
- 扫描你的代码库寻找真正的改进机会
- 创建一个带真实制品的真实变更
- 实现真实的工作(小而安全的变更)
- 归档已完成的变更
- 在执行每一步时加以解释

**阶段:**
1. 欢迎与代码库分析
2. 寻找改进机会
3. 创建变更(`/opsx:new`)
4. 编写 proposal
5. 创建 specs
6. 编写 design
7. 创建 tasks
8. 实现任务(`/opsx:apply`)
9. 验证实现
10. 归档变更
11. 总结与下一步

**示例:**
```
You: /opsx:onboard

AI:  Welcome to OpenSpec!

     I'll walk you through the complete workflow using your actual codebase.
     We'll find something small to improve, create a proper change for it,
     implement it, and archive it.

     Let me scan your codebase for opportunities...

     [Analyzes codebase]

     I found a few things we could work on:
     1. Add input validation to the contact form
     2. Improve error messages in the auth flow
     3. Add loading states to async buttons

     Which interests you? (or suggest something else)
```

**提示:**
- 最适合学习工作流的新用户
- 使用真实代码,而非玩具示例
- 创建一个你可以保留或丢弃的真实变更
- 耗时 15-30 分钟完成

---

## 按 AI 工具划分的命令语法

不同的 AI 工具使用略有不同的命令语法。使用与你的工具匹配的格式:

| Your tool's command file | Syntax example | Example tools |
|--------------------------|----------------|---------------|
| `.../commands/opsx/<id>.*` | `/opsx:propose`, `/opsx:apply` | Claude Code, Gemini CLI, Crush |
| `.../opsx-<id>.*` | `/opsx-propose`, `/opsx-apply` | Cursor, Devin Desktop, Copilot (IDE), Trae, Oh My Pi |
| none — skills only | `/openspec-propose`, `/openspec-apply-change` | CodeArts, ForgeCode, Hermes, MiniMax Code, Mistral Vibe, Zed Agent, shared `.agents` |
| none — Kimi Code | `/skill:openspec-propose` | Kimi Code |
| none — Codex CLI | `$openspec-propose` | Codex |

> **Devin Desktop vs Devin Local:** the `.devin/workflows/opsx-*.md` files give
> Devin Desktop `/opsx-propose`. Devin Local has no workflows — use the skills
> OpenSpec writes to `.devin/skills/`, e.g. `/openspec-propose`, which work on
> both agents.

The intent is the same across tools, but how commands are surfaced can differ by integration. [How To Invoke](supported-tools.md#how-to-invoke) lists every supported tool; this table shows only examples of each shape.

> **注意:** GitHub Copilot 命令(`.github/prompts/*.prompt.md`)仅在 IDE 扩展(VS Code、JetBrains、Visual Studio)中可用。GitHub Copilot CLI 目前不支持自定义 prompt 文件——详见 [Supported Tools](supported-tools.md)。

---

## 旧版命令

这些命令使用较老的"一次性全部"工作流。它们仍可使用,但推荐使用 OPSX 命令。

| 命令 | 作用 |
|---------|--------------|
| `/openspec:proposal` | 一次性创建所有制品(proposal、specs、design、tasks) |
| `/openspec:apply` | 实现变更 |
| `/openspec:archive` | 归档变更 |

**何时使用旧版命令:**
- 使用旧工作流的既有项目
- 不需要增量创建制品的简单变更
- 偏好"要么全有要么全无"的方式

**迁移到 OPSX:**
旧版变更可用 OPSX 命令继续。制品结构兼容。

---

## 故障排查

### "Change not found"(找不到变更)

命令无法识别要处理哪个变更。

**解决方案:**
- 显式指定变更名:`/opsx:apply add-dark-mode`
- 检查变更文件夹是否存在:`openspec-cn list`
- 确认你在正确的项目目录中

### "No artifacts ready"(没有就绪的制品)

所有制品要么已完成,要么被缺失的依赖阻塞。

**解决方案:**
- 运行 `openspec-cn status --change <name>` 查看阻塞原因
- 检查必需的制品是否存在
- 先创建缺失的依赖制品

### "Schema not found"(找不到 schema)

指定的 schema 不存在。

**解决方案:**
- 列出可用的 schemas:`openspec-cn schemas`
- 检查 schema 名称拼写
- 若是自定义则创建 schema:`openspec-cn schema init <name>`

### Commands not recognized(命令不被识别)

AI 工具无法识别 OpenSpec 命令。

**解决方案:**
- 确保 OpenSpec 已初始化:`openspec-cn init`
- 重新生成 skills:`openspec-cn update`
- 检查 `.claude/skills/` 目录是否存在(对于 Claude Code)
- 重启你的 AI 工具以加载新 skills

### Artifacts not generating properly(制品生成不正确)

AI 创建了不完整或不正确的制品。

**解决方案:**
- 在 `openspec/config.yaml` 中添加项目上下文
- 为特定指导添加逐制品规则
- 在变更描述中提供更详细的说明
- 使用 `/opsx:continue` 而非 `/opsx:ff` 以获得更多掌控

---

## 下一步

- [Workflows](workflows.md) - 常见模式以及何时使用各命令
- [CLI](cli.md) - 用于管理与验证的终端命令
- [Customization](customization.md) - 创建自定义 schemas 与工作流
