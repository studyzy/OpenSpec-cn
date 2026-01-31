# 命令参考

这是 OpenSpec 斜杠命令的参考文档。这些命令在你的 AI 编程助手的聊天界面中调用（例如 Claude Code、Cursor、Windsurf）。

关于工作流模式以及何时使用每个命令，请参阅[工作流](workflows.md)。关于 CLI 命令，请参阅[CLI](cli.md)。

## 快速参考

| 命令 | 用途 |
|---------|---------|
| `/opsx:explore` | 在提交变更前进行思路探索 |
| `/opsx:new` | 开始一个新变更 |
| `/opsx:continue` | 基于依赖关系创建下一个制品 |
| `/opsx:ff` | 快速前进：一次性创建所有规划制品 |
| `/opsx:apply` | 实施变更中的任务 |
| `/opsx:verify` | 校验实现是否与制品匹配 |
| `/opsx:sync` | 将增量规范合并到主规范中 |
| `/opsx:archive` | 归档已完成的变更 |
| `/opsx:bulk-archive` | 批量归档多个变更 |
| `/opsx:onboard` | 完整的 OpenSpec 工作流引导教程 |

---

## 命令参考

### `/opsx:explore`

在提交变更前进行思路探索、问题调查和需求澄清。

**语法：**
```
/opsx:explore [topic]
```

**参数：**

| 参数 | 必填 | 说明 |
|----------|----------|-------------|
| `topic` | 否 | 你想要探索或调查的主题 |

**功能：**
- 开启无需结构化的探索性对话
- 调查代码库以回答问题
- 比较不同选项和方案
- 创建可视化图表来澄清思路
- 当思路明确时可转为 `/opsx:new`

**示例：**
```text
你：/opsx:explore

AI：你想探索什么？

你：我们应该如何处理移动应用的认证？

AI：让我调查你当前的认证设置...
     [分析代码库]

     我看到你的 Web 应用使用的是基于会话的认证。
     对于移动端，我们有三个主要选项：

     1. JWT 令牌（无状态，支持离线）
     2. OAuth2（如果需要第三方登录）
     3. 扩展当前会话（更简单，但需要网络连接）

     你的 API 已经配置了 CORS。你对哪个方向感兴趣？

你：我们选择 JWT。可以开始一个变更吗？

AI：随时可以开始。运行 /opsx:new add-jwt-auth 来开始。
```

**提示：**
- 当需求不明确或需要调查时使用
- 探索期间不会创建任何制品
- 适合在决策前比较多种方案
- 可以读取文件和搜索代码库

---

### `/opsx:new`

开始一个新变更。创建变更文件夹结构并使用选定的 schema 进行脚手架搭建。

**语法：**
```
/opsx:new [change-name] [--schema <schema-name>]
```

**参数：**

| 参数 | 必填 | 说明 |
|----------|----------|-------------|
| `change-name` | 否 | 变更文件夹名称（未提供时会提示） |
| `--schema` | 否 | 使用的工作流 schema（默认：从配置或 `spec-driven`） |

**功能：**
- 创建 `openspec/changes/<change-name>/` 目录
- 在变更文件夹中创建 `.openspec.yaml` 元数据文件
- 显示第一个准备创建的制品模板
- 如果未提供变更名称和 schema 会进行提示

**创建的内容：**
```
openspec/changes/<change-name>/
└── .openspec.yaml    # 变更元数据（schema、创建日期）
```

**示例：**
```
你：/opsx:new add-dark-mode

AI：已创建 openspec/changes/add-dark-mode/
     Schema：spec-driven

     准备创建：proposal
     使用 /opsx:continue 创建它，或使用 /opsx:ff 创建所有制品。
```

**提示：**
- 使用描述性名称：`add-feature`、`fix-bug`、`refactor-module`
- 避免通用名称如 `update`、`changes`、`wip`
- schema 也可以在项目配置中设置（`openspec/config.yaml`）

---

### `/opsx:continue`

在依赖链中创建下一个制品。每次只创建一个制品，实现渐进式进展。

**语法：**
```
/opsx:continue [change-name]
```

**参数：**

| 参数 | 必填 | 说明 |
|----------|----------|-------------|
| `change-name` | 否 | 要继续的变更（未提供时从上下文推断） |

**功能：**
- 查询制品依赖关系图
- 显示哪些制品已就绪 vs 被阻塞
- 创建第一个就绪的制品
- 读取依赖文件获取上下文
- 显示创建后哪些制品变为可用

**示例：**
```
你：/opsx:continue

AI：变更：add-dark-mode

     制品状态：
     ✓ proposal    （已完成）
     ◆ specs       （就绪）
     ◆ design      （就绪）
     ○ tasks       （被阻塞 - 需要：specs）

     正在创建 specs...

     [读取 proposal.md，基于需求创建 specs]

     ✓ 已创建 openspec/changes/add-dark-mode/specs/ui/spec.md

     现在可用：tasks
     运行 /opsx:continue 创建下一个制品。
```

**提示：**
- 当你想在继续前审查每个制品时使用
- 适合需要控制的复杂变更
- 多个制品可能同时变为就绪状态
- 你可以在继续前编辑已创建的制品

---

### `/opsx:ff`

快速前进完成制品创建。一次性创建所有规划制品。

**语法：**
```
/opsx:ff [change-name]
```

**参数：**

| 参数 | 必填 | 说明 |
|----------|----------|-------------|
| `change-name` | 否 | 要快速前进的变更（未提供时从上下文推断） |

**功能：**
- 按依赖顺序创建所有制品
- 通过待办事项列表跟踪进度
- 在所有需要实施的制品完成后停止
- 在创建下一个制品前读取每个依赖项

**示例：**
```
你：/opsx:ff add-dark-mode

AI：正在快速前进 add-dark-mode...

     ✓ 创建 proposal.md
     ✓ 创建 specs/ui/spec.md
     ✓ 创建 design.md
     ✓ 创建 tasks.md

     所有规划制品已完成！
     准备实施。运行 /opsx:apply 开始。
```

**提示：**
- 当你对要构建的内容有清晰思路时使用
- 对于简单的变更比 `/opsx:continue` 更快
- 你仍然可以在之后编辑制品
- 适合中小型功能

---

### `/opsx:apply`

实施变更中的任务。逐项处理任务列表，编写代码并勾选完成项。

**语法：**
```
/opsx:apply [change-name]
```

**参数：**

| 参数 | 必填 | 说明 |
|----------|----------|-------------|
| `change-name` | 否 | 要实施的变更（未提供时从上下文推断） |

**功能：**
- 读取 `tasks.md` 并识别未完成的任务
- 逐项处理任务
- 根据需要编写代码、创建文件、运行测试
- 使用复选框 `[x]` 标记任务完成

**示例：**
```
你：/opsx:apply

AI：正在实施 add-dark-mode...

     读取 tasks.md：
     - [ ] 1.1 创建 ThemeContext
     - [ ] 1.2 添加 CSS 自定义属性
     - [ ] 1.3 实现 localStorage 持久化

     正在处理 1.1：创建 ThemeContext...
     [创建 src/context/ThemeContext.tsx]

     ✓ 1.1 完成

     正在处理 1.2：添加 CSS 自定义属性...
     [更新 src/styles/globals.css]

     ✓ 1.2 完成
     ...
```

**提示：**
- 如果被中断，可以从上次停止的地方继续
- 通过指定变更名称来处理并行变更
- 完成状态通过 `tasks.md` 中的复选框跟踪

---

### `/opsx:verify`

校验实现是否与变更制品匹配。检查完整性、正确性和一致性。

**语法：**
```
/opsx:verify [change-name]
```

**参数：**

| 参数 | 必填 | 说明 |
|----------|----------|-------------|
| `change-name` | 否 | 要校验的变更（未提供时从上下文推断） |

**功能：**
- 检查实现质量的三个维度
- 搜索代码库寻找实现证据
- 报告问题，分类为 CRITICAL、WARNING 或 SUGGESTION
- 不会阻止归档，但会暴露问题

**校验维度：**

| 维度 | 校验内容 |
|-----------|-------------------|
| **完整性** | 所有任务完成、所有需求已实现、场景已覆盖 |
| **正确性** | 实现符合规范意图、边缘情况已处理 |
| **一致性** | 设计决策反映在代码中、模式一致 |

**示例：**
```
你：/opsx:verify

AI：正在校验 add-dark-mode...

     完整性
     ✓ tasks.md 中所有 8 个任务已勾选
     ✓ 规范中所有需求都有对应的代码
     ⚠ 场景"系统偏好检测"没有测试覆盖

     正确性
     ✓ 实现符合规范意图
     ✓ 场景中的边缘情况已处理
     ✓ 错误状态符合规范定义

     一致性
     ✓ 设计决策反映在代码结构中
     ✓ 命名约定与 design.md 一致
     ⚠ design.md 提到"CSS 变量"但实现使用 Tailwind 类

     总结
     ─────────────────────────────
     关键问题：0
     警告：2
     准备归档：是（有警告）

     建议：
     1. 为系统偏好检测添加测试
     2. 更新 design.md 以反映 Tailwind 使用，或重构为使用 CSS 变量
```

**提示：**
- 在归档前运行以尽早发现不匹配
- 警告不会阻止归档但表明潜在问题
- 适合在提交前审查 AI 的工作
- 可以揭示制品与实现之间的偏差

---

### `/opsx:sync`

**可选命令。** 将变更中的增量规范合并到主规范中。归档时如果需要会提示同步，因此通常不需要手动运行此命令。

**语法：**
```
/opsx:sync [change-name]
```

**参数：**

| 参数 | 必填 | 说明 |
|----------|----------|-------------|
| `change-name` | 否 | 要同步的变更（未提供时从上下文推断） |

**功能：**
- 从变更文件夹读取增量规范
- 解析 ADDED/MODIFIED/REMOVED/RENAMED 部分
- 将更改合并到主 `openspec/specs/` 目录
- 保留增量中未提及的现有内容
- 不归档变更（保持活动状态）

**示例：**
```text
你：/opsx:sync

AI：正在同步 add-dark-mode 的增量规范...

     读取：openspec/changes/add-dark-mode/specs/ui/spec.md
     目标：openspec/specs/ui/spec.md

     要应用的更改：
     ✓ 新增：主题选择需求（2 个场景）
     ✓ 新增：可访问性需求（1 个场景）

     正在合并...
     ✓ openspec/specs/ui/spec.md 已更新

     变更保持活动状态。准备完成时运行 /opsx:archive。
```

**何时手动使用：**

| 场景 | 使用同步？ |
|----------|-----------|
| 长期运行的变更，希望在归档前将规范合并到主规范 | 是 |
| 多个并行变更需要更新的基础规范 | 是 |
| 希望单独预览/审查合并 | 是 |
| 快速变更，直接归档 | 否（归档会处理） |

**提示：**
- 同步是智能的，不是简单的复制粘贴
- 可以在不重复的情况下向现有需求添加场景
- 同步后变更保持活动状态（不归档）
- 大多数用户永远不需要直接调用此命令——归档时会提示是否需要

---

### `/opsx:archive`

归档已完成的变更。最终确定变更并将其移动到归档文件夹。

**语法：**
```
/opsx:archive [change-name]
```

**参数：**

| 参数 | 必填 | 说明 |
|----------|----------|-------------|
| `change-name` | 否 | 要归档的变更（未提供时从上下文推断） |

**功能：**
- 检查制品完成状态
- 检查任务完成情况（未完成时发出警告）
- 如果尚未同步，提供同步增量规范选项
- 将变更文件夹移动到 `openspec/changes/archive/YYYY-MM-DD-<name>/`
- 保留所有制品用于审计追踪

**示例：**
```text
你：/opsx:archive

AI：正在归档 add-dark-mode...

     制品状态：
     ✓ proposal.md 存在
     ✓ specs/ 存在
     ✓ design.md 存在
     ✓ tasks.md 存在（8/8 任务完成）

     增量规范：尚未同步
     → 现在同步吗？（推荐）

你：是

AI：✓ 已将规范同步到 openspec/specs/ui/spec.md
     ✓ 已移动到 openspec/changes/archive/2025-01-24-add-dark-mode/

     变更已成功归档。
```

**提示：**
- 归档不会因未完成任务而阻止，但会发出警告
- 增量规范可以在归档期间或之前同步
- 已归档的变更会保留用于历史记录
- 先使用 `/opsx:verify` 来发现问题

---

### `/opsx:bulk-archive`

批量归档多个已完成的变更。处理变更之间的规范冲突。

**语法：**
```
/opsx:bulk-archive [change-names...]
```

**参数：**

| 参数 | 必填 | 说明 |
|----------|----------|-------------|
| `change-names` | 否 | 要归档的特定变更（未提供时会提示选择） |

**功能：**
- 列出所有已完成的变更
- 在归档前验证每个变更
- 检测变更之间的规范冲突
- 通过检查实际实现来解决冲突
- 按创建时间顺序归档

**示例：**
```text
你：/opsx:bulk-archive

AI：找到 3 个已完成的变更：
     - add-dark-mode（8/8 任务完成）
     - fix-login-bug（3/3 任务完成）
     - update-footer（2/2 任务完成）

     检查规范冲突...
     ⚠ add-dark-mode 和 update-footer 都涉及 specs/ui/

     检查代码库以解决冲突...
     两个变更都已实现。将按时间顺序合并：
     1. add-dark-mode（1 月 20 日创建）
     2. update-footer（1 月 22 日创建）

     归档所有 3 个变更？

你：是

AI：✓ 已归档 add-dark-mode
     ✓ 已归档 fix-login-bug
     ✓ 已归档 update-footer
     规范合并：add-dark-mode → update-footer
```

**提示：**
- 适合并行工作流
- 冲突解决是智能的（检查代码库）
- 变更按创建顺序归档
- 在覆盖规范内容前会提示确认

---

### `/opsx:onboard`

通过完整的 OpenSpec 工作流进行引导式入门。使用你的实际代码库的交互式教程。

**语法：**
```
/opsx:onboard
```

**功能：**
- 通过带讲解的完整工作流循环进行引导
- 扫描你的代码库寻找真实的改进机会
- 创建包含真实制品的实际变更
- 实施实际工作（小型、安全的更改）
- 归档已完成的变更
- 在每一步发生时进行解释

**阶段：**
1. 欢迎和代码库分析
2. 寻找改进机会
3. 创建变更（`/opsx:new`）
4. 编写提案
5. 创建规范
6. 编写设计
7. 创建任务
8. 实施任务（`/opsx:apply`）
9. 验证实现
10. 归档变更
11. 总结和下一步

**示例：**
```text
你：/opsx:onboard

AI：欢迎使用 OpenSpec！

     我将使用你的实际代码库引导你完成完整的工作流。
     我们会找到一个小改进点，为其创建适当的变更，
     实施它，然后归档它。

     让我扫描你的代码库寻找机会...

     [分析代码库]

     我找到几个可以改进的地方：
     1. 为联系表单添加输入验证
     2. 改进认证流程中的错误消息
     3. 为异步按钮添加加载状态

     你对哪个感兴趣？（或建议其他内容）
```

**提示：**
- 最适合学习工作流的新用户
- 使用真实代码，不是玩具示例
- 创建你可以保留或丢弃的实际变更
- 需要 15-30 分钟完成

---

## 不同 AI 工具的命令语法

不同的 AI 工具使用略微不同的命令语法。使用与你的工具匹配的格式：

| 工具 | 语法示例 |
|------|----------------|
| Claude Code | `/opsx:new`, `/opsx:apply` |
| Cursor | `/opsx-new`, `/opsx-apply` |
| Windsurf | `/opsx-new`, `/opsx-apply` |
| Copilot | `/opsx-new`, `/opsx-apply` |
| Trae | `/openspec-new-change`, `/openspec-apply-change` |

无论语法如何，功能都是相同的。

---

## 旧版命令

这些命令使用较旧的"一次性完成"工作流。它们仍然可以工作，但推荐使用 OPSX 命令。

| 命令 | 功能 |
|---------|--------------|
| `/opsx:proposal` | 一次性创建所有制品（proposal、specs、design、tasks） |
| `/opsx:apply` | 实施变更 |
| `/opsx:archive` | 归档变更 |

**何时使用旧版命令：**
- 现有项目使用旧工作流
- 简单变更，不需要增量制品创建
- 偏好一次性完成的方法

**迁移到 OPSX：**
旧版变更可以使用 OPSX 命令继续。制品结构是兼容的。

---

## 故障排除

### "Change not found"

命令无法识别要处理哪个变更。

**解决方案：**
- 明确指定变更名称：`/opsx:apply add-dark-mode`
- 检查变更文件夹是否存在：`openspec-cn list`
- 验证是否在正确的项目目录中

### "No artifacts ready"

所有制品要么已完成，要么被缺失的依赖项阻塞。

**解决方案：**
- 运行 `openspec-cn status --change <name>` 查看阻塞状态
- 检查所需的制品是否存在
- 首先创建缺失的依赖制品

### "Schema not found"

指定的 schema 不存在。

**解决方案：**
- 列出可用 schema：`openspec-cn schemas`
- 检查 schema 名称拼写
- 如果是自定义 schema，请创建：`openspec-cn schema init <name>`

### 命令无法识别

AI 工具无法识别 OpenSpec 命令。

**解决方案：**
- 确保 OpenSpec 已初始化：`openspec-cn init`
- 重新生成技能：`openspec-cn update`
- 检查 `.claude/skills/` 目录是否存在（针对 Claude Code）
- 重启 AI 工具以获取新技能

### 制品生成不正确

AI 创建了不完整或不正确的制品。

**解决方案：**
- 在 `openspec/config.yaml` 中添加项目上下文
- 添加针对每个制品的规则以提供具体指导
- 在变更描述中提供更多细节
- 使用 `/opsx:continue` 代替 `/opsx:ff` 以获得更多控制

---

## 下一步

- [Workflows](workflows.md) - Common patterns and when to use each command
- [CLI](cli.md) - Terminal commands for management and validation
- [Customization](customization.md) - Create custom schemas and workflows
