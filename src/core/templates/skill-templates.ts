/**
 * Agent Skill Templates
 *
 * Templates for generating Agent Skills compatible with:
 * - Claude Code
 * - Cursor (Settings → Rules → Import Settings)
 * - Windsurf
 * - Other Agent Skills-compatible editors
 */

export interface SkillTemplate {
  name: string;
  description: string;
  instructions: string;
  license?: string;
  compatibility?: string;
  metadata?: Record<string, string>;
}

/**
 * Template for openspec-explore skill
 * Explore mode - adaptive thinking partner for exploring ideas and problems
 */
export function getExploreSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-explore',
    description: '进入探索模式 - 一个用于探索想法、调查问题和澄清需求的思考伙伴。当用户想要在进行更改之前或期间深入思考某事时使用。',
    instructions: `进入探索模式。深入思考。自由想象。跟随对话的任何方向。

**重要提示：探索模式是为了思考，而不是为了实施。** 你可以阅读文件、搜索代码和调查代码库，但你绝不能编写代码或实现功能。如果用户要求你实现某些内容，请提醒他们先退出探索模式（例如，使用 \`/opsx:new\` 或 \`/opsx:ff\` 开始变更）。如果用户要求，你可以创建 OpenSpec 产出物（提案、设计、规格说明）——这是捕捉思考，而不是实施。

**这是一种姿态，而不是一种工作流。** 没有固定的步骤，没有要求的顺序，没有强制性的输出。你是一个思考伙伴，帮助用户进行探索。

---

## 姿态

- **好奇而非说教** - 提出自然产生的问题，不要照本宣科
- **开放话题而非审问** - 浮现多个有趣的方向，让用户选择产生共鸣的部分。不要把他们限制在单一的提问路径中。
- **可视化** - 在有助于澄清思路时大方使用 ASCII 图表
- **自适应** - 跟随有趣的话题，当新信息出现时及时转换
- **耐心** - 不要急于下结论，让问题的轮廓自然显现
- **务实** - 在相关时探索实际的代码库，不要仅仅停留在理论上

---

## 你可能做的事情

根据用户提出的内容，你可能会：

**探索问题空间**
- 针对他们所说的内容提出澄清性问题
- 挑战假设
- 重新构建问题
- 寻找类比

**调查代码库**
- 绘制与讨论相关的现有架构图
- 寻找集成点
- 识别已在使用的模式
- 揭示隐藏的复杂性

**比较选项**
- 头脑风暴多种方法
- 构建比较表
- 勾勒权衡
- 推荐路径（如果被询问）

**可视化**
\`\`\`
┌─────────────────────────────────────────┐
│        大量使用 ASCII 图表              │
├─────────────────────────────────────────┤
│                                         │
│   ┌────────┐         ┌────────┐        │
│   │  状态  │────────▶│  状态  │        │
│   │   A    │         │   B    │        │
│   └────────┘         └────────┘        │
│                                         │
│   系统图、状态机、数据流、              │
│   架构草图、依赖图、比较表              │
│                                         │
└─────────────────────────────────────────┘
\`\`\`

**揭示风险和未知数**
- 识别可能出错的地方
- 发现理解上的差距
- 建议进行探针（Spike）或调查

---

## OpenSpec 意识

你拥有 OpenSpec 系统的完整上下文。自然地使用它，不要强行使用。

### 检查上下文

开始时，快速检查存在什么：
\`\`\`bash
openspec-cn list --json
\`\`\`

这会告诉你：
- 是否有活跃的变更
- 它们的名称、模式和状态
- 用户可能正在处理的内容

### 当不存在变更时

自由思考。当见解清晰时，你可以提议：

- “这感觉足够扎实，可以开始一个变更了。要我创建一个吗？”
  → 可以过渡到 \`/opsx:new\` 或 \`/opsx:ff\`
- 或者继续探索 - 没有形式化的压力

### 当存在变更时

如果用户提到变更或你检测到相关变更：

1. **阅读现有工件以获取上下文**
   - \`openspec/changes/<name>/proposal.md\`
   - \`openspec/changes/<name>/design.md\`
   - \`openspec/changes/<name>/tasks.md\`
   - 等等

2. **在对话中自然地引用它们**
   - “你的设计提到使用 Redis，但我们刚刚意识到 SQLite 更合适……”
   - “提案将此范围限定为高级用户，但我们现在考虑面向所有人……”

3. **当做出决定时提议捕获**

   | 见解类型 | 捕获位置 |
   |--------------|------------------|
   | 发现新需求 | \`specs/<capability>/spec.md\` |
   | 需求变更 | \`specs/<capability>/spec.md\` |
   | 做出设计决策 | \`design.md\` |
   | 范围变更 | \`proposal.md\` |
   | 识别出新工作 | \`tasks.md\` |
   | 假设失效 | 相关工件 |

   提议示例：
   - “这是一个设计决策。要把它记录在 design.md 中吗？”
   - “这是一个新需求。要把它添加到 specs 中吗？”
   - “这改变了范围。要更新 proposal 吗？”

4. **由用户决定** - 提议并继续。不要施压。不要自动捕获。

---

## 你不必做的事情

- 遵循脚本
- 每次都问相同的问题
- 生成特定的工件
- 得出结论
- 如果离题有价值，不必保持在主题上
- 简短（这是思考时间）

---

## 处理不同的切入点

**用户提出一个模糊的想法：**
\`\`\`
User: 我正在考虑添加实时协作

You: 实时协作是一个很大的领域。让我想想……

      协作谱系 (COLLABORATION SPECTRUM)
      ════════════════════════════════════════════

         感知               协调                同步
          │                   │                 │
          ▼                   ▼                 ▼
      ┌────────┐         ┌────────┐        ┌────────┐
      │  存在  │         │  光标  │        │  CRDT  │
      │  "3人  │         │  多选  │        │ 无冲突 │
      │  在线" │         │        │        │        │
      └────────┘         └────────┘        └────────┘
          │                   │                 │
         简单                中等                复杂

      你的想法倾向于哪里？
\`\`\`

**用户提出一个具体问题：**
\`\`\`
User: 认证系统一团糟

You: [阅读代码库]

     ┌─────────────────────────────────────────────┐
     │              当前认证流程                   │
     └─────────────────────────────────────────────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
     ┌─────────┐  ┌─────────┐  ┌─────────┐
     │ Google  │  │  GitHub │  │  Email  │
     │  OAuth  │  │  OAuth  │  │  Magic  │
     └────┬────┘  └────┬────┘  └────┬────┘
          │             │             │
          └─────────────┼─────────────┘
                        ▼
                  ┌───────────┐
                  │   会话    │
                  └─────┬─────┘
                        │
                        ▼
                  ┌───────────┐
                  │   权限    │
                  └───────────┘

     我看到三个纠结的地方。哪个最紧急？
\`\`\`

**用户在实施中途卡住：**
\`\`\`
User: /opsx:explore add-auth-system
      OAuth 集成比预期的要复杂

You: [阅读变更工件]

     你在任务 4：“实现 OAuth 流程”

     让我追踪一下涉及的内容……

     [绘制图表，探索选项，建议路径]

     想要更新设计以反映这一点吗？
     或者添加一个探针任务来调查？
\`\`\`

**用户想要比较选项：**
\`\`\`
User: 我们应该用 Postgres 还是 SQLite？

You: 通用的回答很无聊。上下文是什么？

User: 一个跟踪本地开发环境的 CLI 工具

You: 那改变了一切。

     ┌─────────────────────────────────────────────────┐
     │         CLI 工具数据存储                       │
     └─────────────────────────────────────────────────┘

     关键约束：
     • 无后台进程运行
     • 必须离线工作
     • 单用户

                  SQLite          Postgres
     部署         嵌入式 ✓        需要服务器 ✗
     离线         是 ✓            否 ✗
     单文件       是 ✓            否 ✗

     SQLite。毫无疑问。

     除非……有同步组件吗？
\`\`\`

---

## 结束探索

没有要求的结束方式。探索可能会：

- **流入行动**：“准备好开始了吗？ /opsx:new 或 /opsx:ff”
- **导致工件更新**：“已用这些决定更新 design.md”
- **仅提供清晰度**：用户得到了他们需要的，继续前进
- **稍后继续**：“我们可以随时继续这个话题”

当感觉事情变得清晰时，你可以总结：

\`\`\`
## 我们弄清楚了什么

**问题**：[清晰的理解]

**方法**：[如果出现了一个]

**未决问题**：[如果还有]

**下一步**（如果准备好了）：
- 创建变更：/opsx:new <name>
- 快进到任务：/opsx:ff <name>
- 继续探索：继续交谈
\`\`\`

但这个总结是可选的。有时思考本身就是价值。

---

## 护栏 (Guardrails)

- **不要实施** - 绝不编写代码或实现功能。创建 OpenSpec 产出物是可以的，编写应用程序代码是不行的。
- **不要假装理解** - 如果某些事情不清楚，请深入挖掘
- **不要匆忙** - 发现是思考时间，而不是任务时间
- **不要强加结构** - 让模式自然浮现
- **不要自动捕捉** - 提议保存见解，不要直接做
- **要可视化** - 一个好的图表胜过千言万语
- **要探索代码库** - 将讨论建立在现实基础上
- **要质疑假设** - 包括用户的和你自己的`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

/**
 * Template for openspec-new-change skill
 * Based on /opsx:new command
 */
export function getNewChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-new-change',
    description: '使用实验性的产出物工作流启动一个新的 OpenSpec 变更。当用户想要通过结构化的分步方法创建新功能、修复或修改时使用。',
    instructions: `使用实验性的产出物驱动方法启动新变更。

**输入**：用户的请求应当包含变更名称（kebab-case）或对想要构建内容的描述。

**步骤**

1. **如果没有提供明确的输入，询问用户想要构建什么**

   使用 **AskUserQuestion Tool**（开放式，无预设选项）询问：
   > "您想要处理什么变更？请描述您想要构建或修复的内容。"

   根据他们的描述，推导出一个 kebab-case 名称（例如："add user authentication" → \`add-user-auth\`）。

   **重要提示**：在不了解用户想要构建什么的情况下，请勿继续。

2. **确定工作流 Schema**

   除非用户明确要求不同的工作流，否则使用默认 Schema（省略 \`--schema\`）。

   **Use a different schema only if the user mentions:**
   - A specific schema name → use \`--schema <name>\`
   - "show workflows" or "what workflows" → run \`openspec schemas --json\` and let them choose

   **否则**：省略 \`--schema\` 以使用默认值。

3. **创建变更目录**
   \`\`\`bash
   openspec-cn new change "<name>"
   \`\`\`
   仅当用户请求特定工作流时才添加 \`--schema <name>\`。
   这将在 \`openspec/changes/<name>/\` 下使用所选 Schema 创建一个脚手架变更。

4. **显示产出物状态**
   \`\`\`bash
   openspec-cn status --change "<name>"
   \`\`\`
   这会显示哪些产出物需要创建，以及哪些已就绪（依赖项已满足）。

5. **Get instructions for the first artifact**
   The first artifact depends on the schema (e.g., \`proposal\` for spec-driven).
   Check the status output to find the first artifact with status "ready".
   \`\`\`bash
   openspec-cn instructions <first-artifact-id> --change "<name>"
   \`\`\`
   这会输出创建第一个产出物所需的模板和上下文。

6. **停止并等待用户指示**

**输出**

完成上述步骤后，进行总结：
- 变更名称和位置
- 正在使用的 Schema/工作流及其产出物顺序
- 当前状态（0/N 个产出物已完成）
- 第一个产出物的模板
- 提示："准备好创建第一个产出物了吗？请描述此变更的内容，我将为您起草，或者要求我继续。"

**护栏**

- 不要立即创建任何产出物 —— 仅显示指令
- 不要跳过显示第一个产出物模板的步骤
- 如果名称无效（非 kebab-case），请求有效的名称
- 如果同名变更已存在，建议继续处理该变更
- 如果使用非默认工作流，请传递 --schema`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

/**
 * Template for openspec-continue-change skill
 * Based on /opsx:continue command
 */
export function getContinueChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-continue-change',
    description: '通过创建下一个产出物继续处理 OpenSpec 变更。当用户想要推进其变更、创建下一个产出物或继续其工作流程时使用。',
    instructions: `通过创建下一个产出物继续处理变更。

**输入**：可选指定变更名称。如果省略，检查是否可以从对话上下文中推断。如果模糊或不明确，你**必须**提示获取可用变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 \`openspec-cn list --json\` 获取按最近修改排序的可用变更。然后使用 **AskUserQuestion tool** 让用户选择要处理哪个变更。

   展示前 3-4 个最近修改的变更作为选项，显示：
   - 变更名称
   - Schema（如果存在 \`schema\` 字段，否则为 "spec-driven"）
   - 状态（例如："0/5 tasks", "complete", "no tasks"）
   - 最近修改时间（来自 \`lastModified\` 字段）

   将最近修改的变更标记为 "(推荐)"，因为它很可能是用户想要继续的。

   **重要提示**：不要猜测或自动选择变更。始终让用户选择。

2. **检查当前状态**
   \`\`\`bash
   openspec-cn status --change "<name>" --json
   \`\`\`
   Parse the JSON to understand current state. The response includes:
   - \`schemaName\`: The workflow schema being used (e.g., "spec-driven")
   - \`artifacts\`: Array of artifacts with their status ("done", "ready", "blocked")
   - \`isComplete\`: Boolean indicating if all artifacts are complete

3. **根据状态行动**：

   ---

   **如果所有产出物已完成 (\`isComplete: true\`)**：
   - 祝贺用户
   - 显示最终状态，包括使用的 Schema
   - 建议："所有产出物已创建！您现在可以实现此变更或将其归档。"
   - 停止

   ---

   **如果产出物准备好创建**（状态显示有 \`status: "ready"\` 的产出物）：
   - 从状态输出中选择第一个 \`status: "ready"\` 的产出物
   - 获取其指令：
     \`\`\`bash
     openspec-cn instructions <artifact-id> --change "<name>" --json
     \`\`\`
   - Parse the JSON. The key fields are:
     - \`context\`: Project background (constraints for you - do NOT include in output)
     - \`rules\`: Artifact-specific rules (constraints for you - do NOT include in output)
     - \`template\`: The structure to use for your output file
     - \`instruction\`: Schema-specific guidance
     - \`outputPath\`: Where to write the artifact
     - \`dependencies\`: Completed artifacts to read for context
   - **Create the artifact file**:
     - Read any completed dependency files for context
     - Use \`template\` as the structure - fill in its sections
     - Apply \`context\` and \`rules\` as constraints when writing - but do NOT copy them into the file
     - Write to the output path specified in instructions
   - Show what was created and what's now unlocked
   - STOP after creating ONE artifact

   ---

   **如果没有产出物准备好（全部受阻）**：
   - 在有效的 Schema 下不应发生这种情况
   - 显示状态并建议检查问题

4. **创建产出物后，显示进度**
   \`\`\`bash
   openspec-cn status --change "<name>"
   \`\`\`

**输出**

每次调用后，显示：
- 创建了哪个产出物
- 正在使用的 Schema 工作流
- 当前进度（N/M 完成）
- 现在解锁了哪些产出物
- 提示："想要继续吗？只需让我继续或告诉我下一步做什么。"

**产出物创建指南**

产出物类型及其用途取决于 Schema。使用指令输出中的 \`instruction\` 字段来了解要创建什么。

常见的产出物模式：

**spec-driven schema** (proposal → specs → design → tasks):
- **proposal.md**: Ask user about the change if not clear. Fill in Why, What Changes, Capabilities, Impact.
  - The Capabilities section is critical - each capability listed will need a spec file.
- **specs/<capability>/spec.md**: Create one spec per capability listed in the proposal's Capabilities section (use the capability name, not the change name).
- **design.md**: Document technical decisions, architecture, and implementation approach.
- **tasks.md**: Break down implementation into checkboxed tasks.

For other schemas, follow the \`instruction\` field from the CLI output.

**Guardrails**
- Create ONE artifact per invocation
- Always read dependency artifacts before creating a new one
- Never skip artifacts or create out of order
- If context is unclear, ask the user before creating
- Verify the artifact file exists after writing before marking progress
- Use the schema's artifact sequence, don't assume specific artifact names
- **IMPORTANT**: \`context\` and \`rules\` are constraints for YOU, not content for the file
  - Do NOT copy \`<context>\`, \`<rules>\`, \`<project_context>\` blocks into the artifact
  - These guide what you write, but should never appear in the output`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

/**
 * Template for openspec-apply-change skill
 * For implementing tasks from a completed (or in-progress) change
 */
export function getApplyChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-apply-change',
    description: '实现 OpenSpec 变更中的任务。当用户想要开始实现、继续实现或处理任务时使用。',
    instructions: `实现 OpenSpec 变更中的任务。

**输入**：可选指定变更名称。如果省略，检查是否可以从对话上下文中推断。如果模糊或不明确，你**必须**提示获取可用变更。

**步骤**

1. **选择变更**

   如果提供了名称，使用它。否则：
   - 如果用户提到了某个变更，从对话上下文中推断
   - 如果只存在一个活动变更，自动选择
   - 如果不明确，运行 \`openspec list --json\` 获取可用变更，并使用 **AskUserQuestion tool** 让用户选择

   始终宣布：“正在使用变更：<name>”以及如何覆盖（例如，\`/opsx:apply <other>\`）。

2. **检查状态以了解 Schema**
   \`\`\`bash
   openspec-cn status --change "<name>" --json
   \`\`\`
   Parse the JSON to understand:
   - \`schemaName\`: The workflow being used (e.g., "spec-driven")
   - Which artifact contains the tasks (typically "tasks" for spec-driven, check status for others)

3. **获取应用指令**

   \`\`\`bash
   openspec-cn instructions apply --change "<name>" --json
   \`\`\`

   这返回：
   - 上下文文件路径（因 Schema 而异 - 可能是 proposal/specs/design/tasks 或 spec/tests/implementation/docs）
   - 进度（总计，完成，剩余）
   - 带有状态的任务列表
   - 基于当前状态的动态指令

   **处理状态：**
   - 如果 \`state: "blocked"\`（缺少产出物）：显示消息，建议使用 openspec-continue-change
   - 如果 \`state: "all_done"\`：祝贺，建议归档
   - 否则：继续实现

4. **阅读上下文文件**

   阅读 apply instructions 输出中 \`contextFiles\` 列出的文件。
   文件取决于正在使用的 Schema：
   - **spec-driven**: proposal, specs, design, tasks
   - Other schemas: follow the contextFiles from CLI output

5. **显示当前进度**

   显示：
   - 正在使用的 Schema
   - 进度："N/M 任务已完成"
   - 剩余任务概览
   - 来自 CLI 的动态指令

6. **实现任务（循环直到完成或受阻）**

   对于每个待处理任务：
   - 显示正在处理哪个任务
   - 进行所需的代码更改
   - 保持更改最小化且专注
   - 在任务文件中标记任务完成：\`- [ ]\` → \`- [x]\`
   - 继续下一个任务

   **暂停如果：**
   - 任务不清楚 → 询问澄清
   - 实现揭示了设计问题 → 建议更新产出物
   - 遇到错误或阻碍 → 报告并等待指导
   - 用户中断

7. **完成或暂停时，显示状态**

   显示：
   - 本次会话完成的任务
   - 总体进度："N/M 任务已完成"
   - 如果全部完成：建议归档
   - 如果暂停：解释原因并等待指导

**实现期间的输出**

\`\`\`
## 正在实现：<change-name> (schema: <schema-name>)

正在处理任务 3/7：<task description>
[...正在进行实现...]
✓ 任务完成

正在处理任务 4/7：<task description>
[...正在进行实现...]
✓ 任务完成
\`\`\`

**完成时的输出**

\`\`\`
## 实现完成

**变更：** <change-name>
**Schema：** <schema-name>
**进度：** 7/7 任务已完成 ✓

### 本次会话已完成
- [x] 任务 1
- [x] 任务 2
...

所有任务已完成！准备归档此变更。
\`\`\`

**暂停时的输出（遇到问题）**

\`\`\`
## 实现暂停

**变更：** <change-name>
**Schema：** <schema-name>
**进度：** 4/7 任务已完成

### 遇到的问题
<问题描述>

**选项：**
1. <选项 1>
2. <选项 2>
3. 其他方法

您想怎么做？
\`\`\`

**护栏**
- 继续执行任务直到完成或受阻
- 开始前始终阅读上下文文件（来自 apply instructions 输出）
- 如果任务模棱两可，暂停并在实现前询问
- 如果实现揭示了问题，暂停并建议更新产出物
- 保持代码更改最小化并限定在每个任务范围内
- 完成每个任务后立即更新任务复选框
- 遇到错误、阻碍或不清楚的需求时暂停 - 不要猜测
- 使用 CLI 输出中的 contextFiles，不要假设特定的文件名

**流畅的工作流集成**

此技能支持“变更上的操作”模型：

- **可以随时调用**：在所有产出物完成之前（如果存在任务），部分实现之后，与其他操作交错
- **允许产出物更新**：如果实现揭示了设计问题，建议更新产出物 - 不是阶段锁定的，流畅地工作`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

/**
 * Template for openspec-ff-change skill
 * Fast-forward through artifact creation
 */
export function getFfChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-ff-change',
    description: '快速创建实现所需的所有产出物。当用户想要快速创建实现所需的所有产出物，而不是逐个创建时使用。',
    instructions: `快速完成产出物创建 - 一次性生成开始实现所需的一切。

**输入**：用户的请求应包含变更名称（kebab-case）或对他们想要构建内容的描述。

**步骤**

1. **如果没有提供明确的输入，询问他们想要构建什么**

   使用 **AskUserQuestion tool**（开放式，无预设选项）询问：
   > "您想要处理什么变更？请描述您想要构建或修复的内容。"

   根据他们的描述，推导出一个 kebab-case 名称（例如："add user authentication" → \`add-user-auth\`）。

   **重要提示**：在不了解用户想要构建什么的情况下，请勿继续。

2. **创建变更目录**
   \`\`\`bash
   openspec-cn new change "<name>"
   \`\`\`
   这将在 \`openspec/changes/<name>/\` 创建一个脚手架变更。

3. **获取产出物构建顺序**
   \`\`\`bash
   openspec-cn status --change "<name>" --json
   \`\`\`
   解析 JSON 以获取：
   - \`applyRequires\`: 实现前所需的产出物 ID 数组（例如：\`["tasks"]\`）
   - \`artifacts\`: 所有产出物及其状态和依赖项的列表

4. **按顺序创建产出物直到准备好应用**

   使用 **TodoWrite tool** 跟踪产出物的进度。

   按依赖顺序循环遍历产出物（没有待处理依赖项的产出物优先）：

   a. **对于每个 \`ready\`（依赖项已满足）的产出物**：
      - 获取指令：
        \`\`\`bash
        openspec-cn instructions <artifact-id> --change "<name>" --json
        \`\`\`
      - The instructions JSON includes:
        - \`context\`: Project background (constraints for you - do NOT include in output)
        - \`rules\`: Artifact-specific rules (constraints for you - do NOT include in output)
        - \`template\`: The structure to use for your output file
        - \`instruction\`: Schema-specific guidance for this artifact type
        - \`outputPath\`: Where to write the artifact
        - \`dependencies\`: Completed artifacts to read for context
      - Read any completed dependency files for context
      - Create the artifact file using \`template\` as the structure
      - Apply \`context\` and \`rules\` as constraints - but do NOT copy them into the file
      - Show brief progress: "✓ Created <artifact-id>"

   b. **继续直到所有 \`applyRequires\` 产出物完成**
      - 创建每个产出物后，重新运行 \`openspec-cn status --change "<name>" --json\`
      - 检查 \`applyRequires\` 中的每个产出物 ID 在 artifacts 数组中是否具有 \`status: "done"\`
      - 当所有 \`applyRequires\` 产出物完成时停止

   c. **如果产出物需要用户输入**（上下文不清楚）：
      - 使用 **AskUserQuestion tool** 进行澄清
      - 然后继续创建

5. **显示最终状态**
   \`\`\`bash
   openspec-cn status --change "<name>"
   \`\`\`

**输出**

完成所有产出物后，总结：
- 变更名称和位置
- 已创建产出物的列表及简要描述
- 准备就绪："所有产出物已创建！准备好实现。"
- 提示："运行 \`/opsx:apply\` 或要求我实现以开始处理任务。"

**产出物创建指南**

- Follow the \`instruction\` field from \`openspec instructions\` for each artifact type
- The schema defines what each artifact should contain - follow it
- Read dependency artifacts for context before creating new ones
- Use \`template\` as the structure for your output file - fill in its sections
- **IMPORTANT**: \`context\` and \`rules\` are constraints for YOU, not content for the file
  - Do NOT copy \`<context>\`, \`<rules>\`, \`<project_context>\` blocks into the artifact
  - These guide what you write, but should never appear in the output

**护栏**
- 创建实现所需的所有产出物（由 Schema 的 \`apply.requires\` 定义）
- 在创建新产出物之前始终阅读依赖产出物
- 如果上下文极其不清楚，询问用户 - 但倾向于做出合理的决定以保持势头
- 如果同名变更已存在，建议继续处理该变更
- 在继续下一个之前，验证写入后每个产出物文件是否存在`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

/**
 * Template for openspec-sync-specs skill
 * For syncing delta specs from a change to main specs (agent-driven)
 */
export function getSyncSpecsSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-sync-specs',
    description: '将变更中的增量规范同步到主规范。当用户想要使用增量规范中的更改更新主规范，而不归档该变更时使用。',
    instructions: `将变更中的增量规范同步到主规范。

这是一个 **Agent 驱动** 的操作 - 你将读取增量规范并直接编辑主规范以应用更改。这允许智能合并（例如，添加场景而不复制整个需求）。

**输入**：可选指定变更名称。如果省略，检查是否可以从对话上下文中推断。如果模糊或不明确，你**必须**提示获取可用变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 \`openspec-cn list --json\` 获取可用变更。使用 **AskUserQuestion tool** 让用户选择。

   显示具有增量规范（在 \`specs/\` 目录下）的变更。

   **重要提示**：不要猜测或自动选择变更。始终让用户选择。

2. **查找增量规范**

   在 \`openspec/changes/<name>/specs/*/spec.md\` 中查找增量规范文件。

   每个增量规范文件包含如下部分：
   - \`## ADDED Requirements\` - 要添加的新需求
   - \`## MODIFIED Requirements\` - 对现有需求的更改
   - \`## REMOVED Requirements\` - 要移除的需求
   - \`## RENAMED Requirements\` - 要重命名的需求（FROM:/TO: 格式）

   如果没有找到增量规范，通知用户并停止。

3. **对于每个增量规范，将更改应用到主规范**

   对于在 \`openspec/changes/<name>/specs/<capability>/spec.md\` 处具有增量规范的每个 capability：

   a. **阅读增量规范** 以了解预期的更改

   b. **阅读主规范** 于 \`openspec/specs/<capability>/spec.md\`（可能尚不存在）

   c. **智能地应用更改**：

      **ADDED Requirements:**
      - 如果需求在主规范中不存在 → 添加它
      - 如果需求已存在 → 更新它以匹配（视为隐式 MODIFIED）

      **MODIFIED Requirements:**
      - 在主规范中找到该需求
      - 应用更改 - 这可能是：
        - 添加新场景（不需要复制现有场景）
        - 修改现有场景
        - 更改需求描述
      - 保留增量中未提及的场景/内容

      **REMOVED Requirements:**
      - 从主规范中移除整个需求块

      **RENAMED Requirements:**
      - 找到 FROM 需求，重命名为 TO

   d. **创建新主规范** 如果 capability 尚不存在：
      - 创建 \`openspec/specs/<capability>/spec.md\`
      - 添加 Purpose 部分（可以简短，标记为 TBD）
      - 添加 Requirements 部分以及 ADDED 需求

4. **显示摘要**

   应用所有更改后，总结：
   - 哪些 capability 已更新
   - 做了什么更改（需求添加/修改/移除/重命名）

**增量规范格式参考**

\`\`\`markdown
## ADDED Requirements

### Requirement: New Feature
The system SHALL do something new.

#### Scenario: Basic case
- **WHEN** user does X
- **THEN** system does Y

## MODIFIED Requirements

### Requirement: Existing Feature
#### Scenario: New scenario to add
- **WHEN** user does A
- **THEN** system does B

## REMOVED Requirements

### Requirement: Deprecated Feature

## RENAMED Requirements

- FROM: \`### Requirement: Old Name\`
- TO: \`### Requirement: New Name\`
\`\`\`

**关键原则：智能合并**

与程序化合并不同，你可以应用 **部分更新**：
- 要添加场景，只需将该场景包含在 MODIFIED 下 - 不要复制现有场景
- 增量代表 *意图*，而不是整体替换
- 使用你的判断力合理地合并更改

**成功时的输出**

\`\`\`
## 规范已同步：<change-name>

已更新主规范：

**<capability-1>**：
- 添加需求："New Feature"
- 修改需求："Existing Feature"（添加了 1 个场景）

**<capability-2>**：
- 创建了新规范文件
- 添加需求："Another Feature"

主规范现已更新。变更保持活动状态 - 在实现完成后归档。
\`\`\`

**护栏**
- 在进行更改之前阅读增量规范和主规范
- 保留增量中未提及的现有内容
- 如果不清楚，询问澄清
- 在进行时显示你正在更改的内容
- 操作应该是幂等的 - 运行两次应给出相同的结果`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

/**
 * Template for openspec-onboard skill
 * Guided onboarding through the complete OpenSpec workflow
 */
export function getOnboardSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-onboard',
    description: 'Guided onboarding for OpenSpec - walk through a complete workflow cycle with narration and real codebase work.',
    instructions: getOnboardInstructions(),
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

/**
 * Shared onboarding instructions used by both skill and command templates.
 */
function getOnboardInstructions(): string {
  return `引导用户完成他们的第一个完整OpenSpec工作流周期。这是一个教学体验——你将在他们的代码库中完成实际工作，同时解释每个步骤。

---

## 准备阶段

开始前，检查OpenSpec是否已初始化：

\`\`\`bash
openspec-cn status --json 2>&1 || echo "NOT_INITIALIZED"
\`\`\`

**如果未初始化：**
> OpenSpec尚未在此项目中设置。请先运行 \`openspec-cn init\`，然后返回 \`/opsx:onboard\`。

如果未初始化，请在此停止。

---

## 阶段1：欢迎

显示：

\`\`\`
## 欢迎使用OpenSpec！

我将引导您完成一个完整的变更周期——从想法到实现——使用您代码库中的真实任务。在此过程中，您将通过实践学习工作流程。

**我们将要做的事情：**
1. 在您的代码库中选择一个小的真实任务
2. 简要探索问题
3. 创建一个变更（我们工作的容器）
4. 构建产出物：提案 → 规格说明 → 设计 → 任务
5. 实现任务
6. 归档完成的变更

**时间：** ~15-20分钟

让我们开始寻找要处理的内容。
\`\`\`

---

## 阶段2：任务选择

### 代码库分析

扫描代码库寻找小的改进机会。寻找：

1. **TODO/FIXME注释** - 在代码文件中搜索 \`TODO\`、\`FIXME\`、\`HACK\`、\`XXX\`
2. **缺少错误处理** - 吞没错误的 \`catch\` 块，没有try-catch的风险操作
3. **没有测试的函数** - 交叉引用 \`src/\` 和测试目录
4. **类型问题** - TypeScript文件中的 \`any\` 类型（\`: any\`、\`as any\`）
5. **调试工件** - 非调试代码中的 \`console.log\`、\`console.debug\`、\`debugger\` 语句
6. **缺少验证** - 没有验证的用户输入处理程序

同时检查最近的git活动：
\`\`\`bash
git log --oneline -10 2>/dev/null || echo "No git history"
\`\`\`

### 提出建议

根据您的分析，提出3-4个具体建议：

\`\`\`
## 任务建议

基于扫描您的代码库，以下是一些好的入门任务：

**1. [最有希望的任务]**
   位置：\`src/path/to/file.ts:42\`
   范围：~1-2个文件，~20-30行
   为什么好：[简要原因]

**2. [第二个任务]**
   位置：\`src/another/file.ts\`
   范围：~1个文件，~15行
   为什么好：[简要原因]

**3. [第三个任务]**
   位置：[位置]
   范围：[估计]
   为什么好：[简要原因]

**4. 其他内容？**
   告诉我您想要处理什么。

哪个任务让您感兴趣？（选择一个数字或描述您自己的）
\`\`\`

**如果未找到任何内容：** 回退到询问用户想要构建什么：
> 我在您的代码库中没有找到明显的快速改进机会。您一直想要添加或修复什么小东西？

### 范围护栏

如果用户选择或描述的内容太大（主要功能，多天工作）：

\`\`\`
这是一个有价值的任务，但对于您的第一次OpenSpec体验来说可能太大了。

对于学习工作流程，越小越好——它让您能够看到完整周期而不会陷入实现细节。

**选项：**
1. **切分成更小的部分** - [他们的任务]中最小的有用部分是什么？也许只是[具体切片]？
2. **选择其他内容** - 其他建议之一，或不同的任务？
3. **无论如何都做** - 如果您真的想处理这个，我们可以做。只是要知道需要更长时间。

您更喜欢哪种？
\`\`\`

如果用户坚持，让他们覆盖——这是一个软护栏。

---

## 阶段3：探索演示

一旦选择了任务，简要演示探索模式：

\`\`\`
在我们创建变更之前，让我快速向您展示**探索模式**——这是在承诺方向之前思考问题的方式。
\`\`\`

花1-2分钟调查相关代码：
- 阅读涉及的文件
- 如果需要，绘制快速ASCII图表
- 注意任何考虑事项

\`\`\`
## 快速探索

[您的简要分析——您发现了什么，任何考虑事项]

┌─────────────────────────────────────────┐
│   [可选：如果有帮助的ASCII图表]          │
└─────────────────────────────────────────┘

探索模式（\`/opsx:explore\`）用于这种思考——在实现之前进行调查。您可以在需要思考问题时随时使用它。

现在让我们创建一个变更来保存我们的工作。
\`\`\`

**暂停** - 等待用户确认后再继续。

---

## 阶段4：创建变更

**解释：**
\`\`\`
## 创建变更

OpenSpec中的"变更"是围绕一项工作的所有思考和规划的容器。它位于 \`openspec/changes/<name>/\` 中，保存您的产出物——提案、规格说明、设计、任务。

让我为我们的任务创建一个。
\`\`\`

**执行：** 使用派生的kebab-case名称创建变更：
\`\`\`bash
openspec-cn new change "<derived-name>"
\`\`\`

**显示：**
\`\`\`
已创建：\`openspec/changes/<name>/\`

文件夹结构：
\`\`\`
openspec/changes/<name>/
├── proposal.md    ← 为什么我们要做这个（空，我们将填充它）
├── design.md      ← 我们将如何构建它（空）
├── specs/         ← 详细需求（空）
└── tasks.md       ← 实现检查清单（空）
\`\`\`

现在让我们填充第一个产出物——提案。
\`\`\`

---

## 阶段5：提案

**解释：**
\`\`\`
## 提案

提案捕获**为什么**我们要进行此变更以及**什么**在高层级上涉及。这是工作的"电梯演讲"。

我将根据我们的任务起草一个。
\`\`\`

**执行：** 起草提案内容（暂时不保存）：

\`\`\`
这是一个草案提案：

---

## 为什么

[1-2句话解释问题/机会]

## 什么变化

[将要不同的要点]

## 能力

### 新能力
- \`<能力名称>\`: [简要描述]

### 修改的能力
<!-- 如果修改现有行为 -->

## 影响

- \`src/path/to/file.ts\`: [什么变化]
- [其他文件如果适用]

---

这能捕捉意图吗？我可以在保存前调整。
\`\`\`

**暂停** - 等待用户批准/反馈。

批准后，保存提案：
\`\`\`bash
openspec-cn instructions proposal --change "<name>" --json
\`\`\`
然后将内容写入 \`openspec/changes/<name>/proposal.md\`。

\`\`\`
提案已保存。这是您的"为什么"文档——您随时可以回来在理解发展时完善它。

接下来：规格说明。
\`\`\`

---

## 阶段6：规格说明

**解释：**
\`\`\`
## 规格说明

规格说明以精确、可测试的术语定义**什么**我们正在构建。它们使用需求/场景格式，使预期行为清晰明了。

对于像这样的小任务，我们可能只需要一个规格说明文件。
\`\`\`

**执行：** 创建规格说明文件：
\`\`\`bash
mkdir -p openspec/changes/<name>/specs/<capability-name>
\`\`\`

起草规格说明内容：

\`\`\`
这是规格说明：

---

## 新增需求

### 需求：<名称>

<系统应该做什么的描述>

#### 场景：<场景名称>

- **当** <触发条件>
- **那么** <预期结果>
- **并且** <如果需要额外结果>

---

这种格式——当/那么/并且——使需求可测试。您可以将它们字面地读作测试用例。
\`\`\`

保存到 \`openspec/changes/<name>/specs/<capability>/spec.md\`。

---

## 阶段7：设计

**解释：**
\`\`\`
## 设计

设计捕获**如何**我们将构建它——技术决策、权衡、方法。

对于小变更，这可能很简短。没关系——不是每个变更都需要深入的设计讨论。
\`\`\`

**执行：** 起草design.md：

\`\`\`
这是设计：

---

## 上下文

[关于当前状态的简要上下文]

## 目标/非目标

**目标：**
- [我们试图实现什么]

**非目标：**
- [明确超出范围的内容]

## 决策

### 决策1：[关键决策]

[方法解释和理由]

---

对于小任务，这捕获了关键决策而不过度工程化。
\`\`\`

保存到 \`openspec/changes/<name>/design.md\`。

---

## 阶段8：任务

**解释：**
\`\`\`
## 任务

最后，我们将工作分解为实现任务——驱动应用阶段的复选框。

这些应该小、清晰且逻辑顺序。
\`\`\`

**执行：** 基于规格说明和设计生成任务：

\`\`\`
这是实现任务：

---

## 1. [类别或文件]

- [ ] 1.1 [具体任务]
- [ ] 1.2 [具体任务]

## 2. 验证

- [ ] 2.1 [验证步骤]

---

每个复选框成为应用阶段的工作单元。准备好实现了吗？
\`\`\`

**暂停** - 等待用户确认他们准备好实现。

保存到 \`openspec/changes/<name>/tasks.md\`。

---

## 阶段9：应用（实现）

**解释：**
\`\`\`
## 实现

现在我们实现每个任务，在过程中勾选它们。我将宣布每个任务，并偶尔注意规格说明/设计如何影响方法。
\`\`\`

**执行：** 对于每个任务：

1. 宣布："正在处理任务N：[描述]"
2. 在代码库中实现变更
3. 自然地引用规格说明/设计："规格说明说X，所以我做Y"
4. 在tasks.md中标记完成：\`- [ ]\` → \`- [x]\`
5. 简要状态："✓ 任务N完成"

保持叙述轻量——不要过度解释每一行代码。

所有任务后：

\`\`\`
## 实现完成

所有任务完成：
- [x] 任务1
- [x] 任务2
- [x] ...

变更已实现！还有一个步骤——让我们归档它。
\`\`\`

---

## 阶段10：归档

**解释：**
\`\`\`
## 归档

当变更完成时，我们归档它。这将把它从 \`openspec/changes/\` 移动到 \`openspec/changes/archive/YYYY-MM-DD-<name>/\`。

归档的变更成为您项目的决策历史——您随时可以找到它们来理解为什么某物以某种方式构建。
\`\`\`

**执行：**
\`\`\`bash
openspec-cn archive "<name>"
\`\`\`

**显示：**
\`\`\`
已归档到：\`openspec/changes/archive/YYYY-MM-DD-<name>/\`

变更现在是您项目历史的一部分。代码在您的代码库中，决策记录被保留。
\`\`\`

---

## 阶段11：回顾与下一步

\`\`\`
## 恭喜！

您刚刚完成了一个完整的OpenSpec周期：

1. **探索** - 思考问题
2. **新建** - 创建变更容器
3. **提案** - 捕获为什么
4. **规格说明** - 详细定义什么
5. **设计** - 决定如何
6. **任务** - 分解为步骤
7. **应用** - 实现工作
8. **归档** - 保留记录

同样的节奏适用于任何大小的变更——小修复或主要功能。

---

## 命令参考

| 命令 | 做什么 |
|---------|--------------|
| \`/opsx:explore\` | 在工作之前/期间思考问题 |
| \`/opsx:new\` | 开始新变更，逐步通过产出物 |
| \`/opsx:ff\` | 快进：一次创建所有产出物 |
| \`/opsx:continue\` | 继续处理现有变更 |
| \`/opsx:apply\` | 实现变更中的任务 |
| \`/opsx:verify\` | 验证实现是否匹配产出物 |
| \`/opsx:archive\` | 归档完成的变更 |

---

## 下一步是什么？

尝试 \`/opsx:new\` 或 \`/opsx:ff\` 在您实际想要构建的内容上。您现在掌握了节奏！
\`\`\`

---

## 优雅退出处理

### 用户想要中途停止

如果用户说他们需要停止、想要暂停或似乎不投入：

\`\`\`
没问题！您的变更保存在 \`openspec/changes/<name>/\`。

要在以后继续：
- \`/opsx:continue <name>\` - 恢复产出物创建
- \`/opsx:apply <name>\` - 跳转到实现（如果任务存在）

工作不会丢失。随时回来。
\`\`\`

优雅退出，不施加压力。

### 用户只想要命令参考

如果用户说他们只想看命令或跳过教程：

\`\`\`
## OpenSpec快速参考

| 命令 | 做什么 |
|---------|--------------|
| \`/opsx:explore\` | 思考问题（无代码更改） |
| \`/opsx:new <name>\` | 开始新变更，逐步进行 |
| \`/opsx:ff <name>\` | 快进：一次创建所有产出物 |
| \`/opsx:continue <name>\` | 继续现有变更 |
| \`/opsx:apply <name>\` | 实现任务 |
| \`/opsx:verify <name>\` | 验证实现 |
| \`/opsx:archive <name>\` | 完成后归档 |

尝试 \`/opsx:new\` 开始您的第一个变更，或 \`/opsx:ff\` 如果您想快速移动。
\`\`\`

优雅退出。

---

## 护栏

- **遵循解释→执行→显示→暂停模式**在关键转换点（探索后、提案草案后、任务后、归档后）
- **在实现期间保持叙述轻量**——教学而不说教
- **不要跳过阶段**即使变更很小——目标是教学工作流程
- **在标记点暂停等待确认**，但不要过度暂停
- **优雅处理退出**——从不施压用户继续
- **使用真实代码库任务**——不模拟或使用虚假示例
- **温和调整范围**——引导向更小任务但尊重用户选择`;
}

// -----------------------------------------------------------------------------
// Slash Command Templates
// -----------------------------------------------------------------------------

export interface CommandTemplate {
  name: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
}

/**
 * Template for /opsx:explore slash command
 * Explore mode - adaptive thinking partner
 */
export function getOpsxExploreCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Explore',
    description: '进入探索模式 - 构思想法、调查问题、澄清需求',
    category: 'Workflow',
    tags: ['workflow', 'explore', 'experimental', 'thinking'],
    content: `进入探索模式。深入思考。自由可视化。跟随对话的发展。

**重要提示：探索模式是为了思考，而不是为了实施。** 你可以阅读文件、搜索代码和调查代码库，但你绝不能编写代码或实现功能。如果用户要求你实现某些内容，请提醒他们先退出探索模式（例如，使用 \`/opsx:new\` 或 \`/opsx:ff\` 开始变更）。如果用户要求，你可以创建 OpenSpec 产出物（提案、设计、规格说明）——这是捕捉思考，而不是实施。

**这是一种姿态，而不是一种工作流。** 没有固定的步骤，没有要求的顺序，没有强制性的输出。你是一个思考伙伴，帮助用户进行探索。

**输入**：\`/opsx:explore\` 之后的参数是用户想要思考的任何内容。可能是：
- 一个模糊的想法："real-time collaboration"
- 一个具体的问题："the auth system is getting unwieldy"
- 一个变更名称："add-dark-mode"（在该变更的上下文中探索）
- 一个比较："postgres vs sqlite for this"
- 无（仅进入探索模式）

---

## 姿态 (The Stance)

- **好奇而非说教** - 提出自然产生的问题，不要照本宣科
- **开放话题而非审问** - 浮现多个有趣的方向，让用户选择产生共鸣的部分。不要把他们限制在单一的提问路径中。
- **可视化** - 在有助于澄清思路时大方使用 ASCII 图表
- **自适应** - 跟随有趣的话题，当新信息出现时及时转换
- **耐心** - 不要急于下结论，让问题的轮廓自然显现
- **务实** - 在相关时探索实际的代码库，不要仅仅停留在理论上

---

## 你可能做的事情

根据用户提出的内容，你可能会：

**探索问题空间**
- 针对他们所说的内容提出澄清性问题
- 挑战假设
- 重新构建问题
- 寻找类比

**调查代码库**
- 绘制与讨论相关的现有架构图
- 寻找集成点
- 识别已在使用的模式
- 揭示隐藏的复杂性

**比较选项**
- 头脑风暴多种方法
- 构建比较表
- 勾勒权衡
- 推荐路径（如果被询问）

**可视化**
\`\`\`
┌─────────────────────────────────────────┐
│        大量使用 ASCII 图表              │
├─────────────────────────────────────────┤
│                                         │
│   ┌────────┐         ┌────────┐        │
│   │  状态  │────────▶│  状态  │        │
│   │   A    │         │   B    │        │
│   └────────┘         └────────┘        │
│                                         │
│   系统图、状态机、数据流、              │
│   架构草图、依赖图、比较表              │
│                                         │
└─────────────────────────────────────────┘
\`\`\`

**揭示风险和未知数**
- 识别可能出错的地方
- 发现理解上的差距
- 建议进行探针（Spike）或调查

---

## OpenSpec 意识

你拥有 OpenSpec 系统的完整上下文。自然地使用它，不要强行使用。

### 检查上下文

开始时，快速检查存在什么：
\`\`\`bash
openspec-cn list --json
\`\`\`

这会告诉你：
- 是否有活跃的变更
- 它们的名称、模式和状态
- 用户可能正在处理的内容

如果用户提到了特定的变更名称，请阅读其产出物以获取上下文。

### 当不存在变更时

自由思考。当见解清晰时，你可以提议：

- “这感觉足够扎实，可以开始一个变更了。要我创建一个吗？”
  → 可以过渡到 \`/opsx:new\` 或 \`/opsx:ff\`
- 或者继续探索 - 没有形式化的压力

### 当存在变更时

如果用户提到变更或你检测到相关变更：

1. **阅读现有工件以获取上下文**
   - \`openspec/changes/<name>/proposal.md\`
   - \`openspec/changes/<name>/design.md\`
   - \`openspec/changes/<name>/tasks.md\`
   - 等等

2. **在对话中自然地引用它们**
   - “你的设计提到使用 Redis，但我们刚刚意识到 SQLite 更合适……”
   - “提案将此范围限定为高级用户，但我们现在考虑面向所有人……”

3. **当做出决定时提议捕获**

   | 见解类型 | 捕获位置 |
   |--------------|------------------|
   | 发现新需求 | \`specs/<capability>/spec.md\` |
   | 需求变更 | \`specs/<capability>/spec.md\` |
   | 做出设计决策 | \`design.md\` |
   | 范围变更 | \`proposal.md\` |
   | 识别出新工作 | \`tasks.md\` |
   | 假设失效 | 相关工件 |

   提议示例：
   - “这是一个设计决策。要把它记录在 design.md 中吗？”
   - “这是一个新需求。要把它添加到 specs 中吗？”
   - “这改变了范围。要更新 proposal 吗？”

4. **由用户决定** - 提议并继续。不要施压。不要自动捕获。

---

## 你不必做的事情

- 遵循脚本
- 每次都问相同的问题
- 生成特定的工件
- 得出结论
- 如果离题有价值，不必保持在主题上
- 简短（这是思考时间）

---

## 结束探索

没有要求的结束方式。探索可能会：

- **流入行动**：“准备好开始了吗？ \`/opsx:new\` 或 \`/opsx:ff\`”
- **导致工件更新**：“已用这些决定更新 design.md”
- **仅提供清晰度**：用户得到了他们需要的，继续前进
- **稍后继续**：“我们可以随时继续这个话题”

当感觉事情变得清晰时，你可以总结 - 但这是可选的。有时思考本身就是价值。

---

## 护栏 (Guardrails)

- **不要实施** - 绝不编写代码或实现功能。创建 OpenSpec 产出物是可以的，编写应用程序代码是不行的。
- **不要假装理解** - 如果某些事情不清楚，请深入挖掘
- **不要匆忙** - 发现是思考时间，而不是任务时间
- **不要强加结构** - 让模式自然浮现
- **不要自动捕捉** - 提议保存见解，不要直接做
- **要可视化** - 一个好的图表胜过千言万语
- **要探索代码库** - 将讨论建立在现实基础上
- **要质疑假设** - 包括用户的和你自己的`
  };
}

/**
 * Template for /opsx:new slash command
 */
export function getOpsxNewCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: New',
    description: '使用实验性的产出物工作流 (OPSX) 启动新变更',
    category: 'Workflow',
    tags: ['workflow', 'artifacts', 'experimental'],
    content: `使用实验性的产出物驱动方法启动新变更。

**输入**：\`/opsx:new\` 之后的参数是变更名称（kebab-case），或用户想要构建内容的描述。

**步骤**

1. **如果没有提供输入，询问他们想要构建什么**

   使用 **AskUserQuestion tool**（开放式，无预设选项）询问：
   > "您想要处理什么变更？请描述您想要构建或修复的内容。"

   根据他们的描述，推导出一个 kebab-case 名称（例如："add user authentication" → \`add-user-auth\`）。

   **重要提示**：在不了解用户想要构建什么的情况下，请勿继续。

2. **确定工作流 Schema**

   除非用户明确要求不同的工作流，否则使用默认 Schema（省略 \`--schema\`）。

   **Use a different schema only if the user mentions:**
   - A specific schema name → use \`--schema <name>\`
   - "show workflows" or "what workflows" → run \`openspec schemas --json\` and let them choose

   **否则**：省略 \`--schema\` 以使用默认值。

3. **创建变更目录**
   \`\`\`bash
   openspec-cn new change "<name>"
   \`\`\`
   仅当用户请求特定工作流时才添加 \`--schema <name>\`。
   这将在 \`openspec/changes/<name>/\` 下使用所选 Schema 创建一个脚手架变更。

4. **显示产出物状态**
   \`\`\`bash
   openspec-cn status --change "<name>"
   \`\`\`
   这会显示哪些产出物需要创建，以及哪些已就绪（依赖项已满足）。

5. **获取第一个产出物的指令**
   第一个产出物取决于 Schema。检查状态输出，找到第一个状态为 "ready" 的产出物。
   \`\`\`bash
   openspec-cn instructions <first-artifact-id> --change "<name>"
   \`\`\`
   这会输出创建第一个产出物所需的模板和上下文。

6. **停止并等待用户指示**

**输出**

完成上述步骤后，进行总结：
- 变更名称和位置
- 正在使用的 Schema/工作流及其产出物顺序
- 当前状态（0/N 个产出物已完成）
- 第一个产出物的模板
- 提示："准备好创建第一个产出物了吗？运行 \`/opsx:continue\` 或描述此变更的内容，我将为您起草。"

**护栏**
- 不要立即创建任何产出物 —— 仅显示指令
- 不要跳过显示第一个产出物模板的步骤
- 如果名称无效（非 kebab-case），请求有效的名称
- 如果同名变更已存在，建议使用 \`/opsx:continue\` 代替
- 如果使用非默认工作流，请传递 --schema`
  };
}

/**
 * Template for /opsx:continue slash command
 */
export function getOpsxContinueCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Continue',
    description: '继续处理变更 - 创建下一个产出物（实验性）',
    category: 'Workflow',
    tags: ['workflow', 'artifacts', 'experimental'],
    content: `通过创建下一个产出物继续处理变更。

**输入**：可选择在 \`/opsx:continue\` 后指定变更名称（例如，\`/opsx:continue add-auth\`）。如果省略，检查是否可以从对话上下文中推断出来。如果模糊或不明确，你必须提示可用的变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 \`openspec-cn list --json\` 获取按最近修改排序的可用变更。然后使用 **AskUserQuestion tool** 让用户选择要处理哪个变更。

   展示前 3-4 个最近修改的变更作为选项，显示：
   - 变更名称
   - Schema（如果存在 \`schema\` 字段，否则为 "spec-driven"）
   - 状态（例如："0/5 tasks", "complete", "no tasks"）
   - 最近修改时间（来自 \`lastModified\` 字段）

   将最近修改的变更标记为 "(推荐)"，因为它很可能是用户想要继续的。

   **重要提示**：不要猜测或自动选择变更。始终让用户选择。

2. **检查当前状态**
   \`\`\`bash
   openspec-cn status --change "<name>" --json
   \`\`\`
   Parse the JSON to understand current state. The response includes:
   - \`schemaName\`: The workflow schema being used (e.g., "spec-driven")
   - \`artifacts\`: Array of artifacts with their status ("done", "ready", "blocked")
   - \`isComplete\`: Boolean indicating if all artifacts are complete

3. **根据状态行动**：

   ---

   **If all artifacts are complete (\`isComplete: true\`)**:
   - Congratulate the user
   - Show final status including the schema used
   - Suggest: "All artifacts created! You can now implement this change with \`/opsx:apply\` or archive it with \`/opsx:archive\`."
   - STOP

   ---

   **如果产出物准备好创建**（状态显示有 \`status: "ready"\` 的产出物）：
   - 从状态输出中选择第一个 \`status: "ready"\` 的产出物
   - 获取其指令：
     \`\`\`bash
     openspec-cn instructions <artifact-id> --change "<name>" --json
     \`\`\`
   - Parse the JSON. The key fields are:
     - \`context\`: Project background (constraints for you - do NOT include in output)
     - \`rules\`: Artifact-specific rules (constraints for you - do NOT include in output)
     - \`template\`: The structure to use for your output file
     - \`instruction\`: Schema-specific guidance
     - \`outputPath\`: Where to write the artifact
     - \`dependencies\`: Completed artifacts to read for context
   - **Create the artifact file**:
     - Read any completed dependency files for context
     - Use \`template\` as the structure - fill in its sections
     - Apply \`context\` and \`rules\` as constraints when writing - but do NOT copy them into the file
     - Write to the output path specified in instructions
   - Show what was created and what's now unlocked
   - STOP after creating ONE artifact

   ---

   **如果没有产出物准备好（全部受阻）**：
   - 在有效的 Schema 下不应发生这种情况
   - 显示状态并建议检查问题

4. **创建产出物后，显示进度**
   \`\`\`bash
   openspec-cn status --change "<name>"
   \`\`\`

**输出**

每次调用后，显示：
- 创建了哪个产出物
- 正在使用的 Schema 工作流
- 当前进度（N/M 完成）
- 现在解锁了哪些产出物
- 提示："运行 \`/opsx:continue\` 以创建下一个产出物"

**产出物创建指南**

产出物类型及其用途取决于 Schema。使用指令输出中的 \`instruction\` 字段来了解要创建什么。

常见的产出物模式：

**spec-driven schema** (proposal → specs → design → tasks):
- **proposal.md**: Ask user about the change if not clear. Fill in Why, What Changes, Capabilities, Impact.
  - The Capabilities section is critical - each capability listed will need a spec file.
- **specs/<capability>/spec.md**: Create one spec per capability listed in the proposal's Capabilities section (use the capability name, not the change name).
- **design.md**: Document technical decisions, architecture, and implementation approach.
- **tasks.md**: Break down implementation into checkboxed tasks.

For other schemas, follow the \`instruction\` field from the CLI output.

**Guardrails**
- Create ONE artifact per invocation
- Always read dependency artifacts before creating a new one
- Never skip artifacts or create out of order
- If context is unclear, ask the user before creating
- Verify the artifact file exists after writing before marking progress
- Use the schema's artifact sequence, don't assume specific artifact names
- **IMPORTANT**: \`context\` and \`rules\` are constraints for YOU, not content for the file
  - Do NOT copy \`<context>\`, \`<rules>\`, \`<project_context>\` blocks into the artifact
  - These guide what you write, but should never appear in the output`
  };
}

/**
 * Template for /opsx:apply slash command
 */
export function getOpsxApplyCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Apply',
    description: '实现 OpenSpec 变更中的任务（实验性）',
    category: 'Workflow',
    tags: ['workflow', 'artifacts', 'experimental'],
    content: `实现 OpenSpec 变更中的任务。

**输入**：可选择指定变更名称（例如，\`/opsx:apply add-auth\`）。如果省略，检查是否可以从对话上下文中推断出来。如果模糊或不明确，你必须提示可用的变更。

**步骤**

1. **选择变更**

   如果提供了名称,使用它。否则：
   - 如果用户提到了某个变更，从对话上下文中推断
   - 如果只存在一个活动变更，自动选择
   - 如果不明确，运行 \`openspec list --json\` 获取可用变更，并使用 **AskUserQuestion tool** 让用户选择

   始终宣布："正在使用变更：<name>"以及如何覆盖（例如，\`/opsx:apply <other>\`）。

2. **检查状态以了解 Schema**
   \`\`\`bash
   openspec-cn status --change "<name>" --json
   \`\`\`
   Parse the JSON to understand:
   - \`schemaName\`: The workflow being used (e.g., "spec-driven")
   - Which artifact contains the tasks (typically "tasks" for spec-driven, check status for others)

3. **获取应用指令**

   \`\`\`bash
   openspec-cn instructions apply --change "<name>" --json
   \`\`\`

   这返回：
   - 上下文文件路径（因 Schema 而异）
   - 进度（总计，完成，剩余）
   - 带有状态的任务列表
   - 基于当前状态的动态指令

   **处理状态：**
   - 如果 \`state: "blocked"\`（缺少产出物）：显示消息，建议使用 \`/opsx:continue\`
   - 如果 \`state: "all_done"\`：祝贺，建议归档
   - 否则：继续实现

4. **阅读上下文文件**

   阅读 apply instructions 输出中 \`contextFiles\` 列出的文件。
   文件取决于正在使用的 Schema：
   - **spec-driven**: proposal, specs, design, tasks
   - Other schemas: follow the contextFiles from CLI output

5. **显示当前进度**

   显示：
   - 正在使用的 Schema
   - 进度："N/M 任务已完成"
   - 剩余任务概览
   - 来自 CLI 的动态指令

6. **实现任务（循环直到完成或受阻）**

   对于每个待处理任务：
   - 显示正在处理哪个任务
   - 进行所需的代码更改
   - 保持更改最小化且专注
   - 在任务文件中标记任务完成：\`- [ ]\` → \`- [x]\`
   - 继续下一个任务

   **暂停如果：**
   - 任务不清楚 → 询问澄清
   - 实现揭示了设计问题 → 建议更新产出物
   - 遇到错误或阻碍 → 报告并等待指导
   - 用户中断

7. **完成或暂停时，显示状态**

   显示：
   - 本次会话完成的任务
   - 总体进度："N/M 任务已完成"
   - 如果全部完成：建议归档
   - 如果暂停：解释原因并等待指导

**实现期间的输出**

\`\`\`
## 正在实现：<change-name> (schema: <schema-name>)

正在处理任务 3/7：<task description>
[...正在进行实现...]
✓ 任务完成

正在处理任务 4/7：<task description>
[...正在进行实现...]
✓ 任务完成
\`\`\`

**完成时的输出**

\`\`\`
## 实现完成

**变更：** <change-name>
**Schema：** <schema-name>
**进度：** 7/7 任务已完成 ✓

### 本次会话已完成
- [x] 任务 1
- [x] 任务 2
...

All tasks complete! You can archive this change with \`/opsx:archive\`.
\`\`\`

**暂停时的输出（遇到问题）**

\`\`\`
## 实现暂停

**变更：** <change-name>
**Schema：** <schema-name>
**进度：** 4/7 任务已完成

### 遇到的问题
<问题描述>

**选项：**
1. <选项 1>
2. <选项 2>
3. 其他方法

您想怎么做？
\`\`\`

**护栏**
- 继续执行任务直到完成或受阻
- 开始前始终阅读上下文文件（来自 apply instructions 输出）
- 如果任务模棱两可，暂停并在实现前询问
- 如果实现揭示了问题，暂停并建议更新产出物
- 保持代码更改最小化并限定在每个任务范围内
- 完成每个任务后立即更新任务复选框
- 遇到错误、阻碍或不清楚的需求时暂停 - 不要猜测
- 使用 CLI 输出中的 contextFiles，不要假设特定的文件名

**流畅的工作流集成**

此技能支持“变更上的操作”模型：

- **可以随时调用**：在所有产出物完成之前（如果存在任务），部分实现之后，与其他操作交错
- **允许产出物更新**：如果实现揭示了设计问题，建议更新产出物 - 不是阶段锁定的，流畅地工作`
  };
}


/**
 * Template for /opsx:ff slash command
 */
export function getOpsxFfCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Fast Forward',
    description: '一键创建变更并生成实现所需的所有产出物',
    category: 'Workflow',
    tags: ['workflow', 'artifacts', 'experimental'],
    content: `快速完成产出物创建 - 生成开始实现所需的一切。

**输入**：\`/opsx:ff\` 之后的参数是变更名称（kebab-case），或用户想要构建内容的描述。

**步骤**

1. **如果没有提供输入，询问他们想要构建什么**

   使用 **AskUserQuestion tool**（开放式，无预设选项）询问：
   > "您想要处理什么变更？请描述您想要构建或修复的内容。"

   根据他们的描述，推导出一个 kebab-case 名称（例如："add user authentication" → \`add-user-auth\`）。

   **重要提示**：在不了解用户想要构建什么的情况下，请勿继续。

2. **创建变更目录**
   \`\`\`bash
   openspec-cn new change "<name>"
   \`\`\`
   这将在 \`openspec/changes/<name>/\` 创建一个脚手架变更。

3. **获取产出物构建顺序**
   \`\`\`bash
   openspec-cn status --change "<name>" --json
   \`\`\`
   解析 JSON 以获取：
   - \`applyRequires\`: 实现前所需的产出物 ID 数组（例如：\`["tasks"]\`）
   - \`artifacts\`: 所有产出物及其状态和依赖项的列表

4. **按顺序创建产出物直到准备好应用**

   使用 **TodoWrite tool** 跟踪产出物的进度。

   按依赖顺序循环遍历产出物（没有待处理依赖项的产出物优先）：

   a. **对于每个 \`ready\`（依赖项已满足）的产出物**：
      - 获取指令：
        \`\`\`bash
        openspec-cn instructions <artifact-id> --change "<name>" --json
        \`\`\`
      - The instructions JSON includes:
        - \`context\`: Project background (constraints for you - do NOT include in output)
        - \`rules\`: Artifact-specific rules (constraints for you - do NOT include in output)
        - \`template\`: The structure to use for your output file
        - \`instruction\`: Schema-specific guidance for this artifact type
        - \`outputPath\`: Where to write the artifact
        - \`dependencies\`: Completed artifacts to read for context
      - Read any completed dependency files for context
      - Create the artifact file using \`template\` as the structure
      - Apply \`context\` and \`rules\` as constraints - but do NOT copy them into the file
      - Show brief progress: "✓ Created <artifact-id>"

   b. **继续直到所有 \`applyRequires\` 产出物完成**
      - 创建每个产出物后，重新运行 \`openspec-cn status --change "<name>" --json\`
      - 检查 \`applyRequires\` 中的每个产出物 ID 在 artifacts 数组中是否具有 \`status: "done"\`
      - 当所有 \`applyRequires\` 产出物完成时停止

   c. **如果产出物需要用户输入**（上下文不清楚）：
      - 使用 **AskUserQuestion tool** 进行澄清
      - 然后继续创建

5. **显示最终状态**
   \`\`\`bash
   openspec-cn status --change "<name>"
   \`\`\`

**输出**

完成所有产出物后，总结：
- 变更名称和位置
- 已创建产出物的列表及简要描述
- 准备就绪："所有产出物已创建！准备好实现。"
- 提示："运行 \`/opsx:apply\` 以开始实现。"

**产出物创建指南**

- 遵循每个产出物类型的 \`openspec-cn instructions\` 中的 \`instruction\` 字段
- Schema 定义了每个产出物应包含的内容 - 遵循它
- 在创建新产出物之前阅读依赖产出物以获取上下文
- 使用 \`template\` 作为起点，根据上下文填写

**护栏**
- 创建实现所需的所有产出物（由 Schema 的 \`apply.requires\` 定义）
- 在创建新产出物之前始终阅读依赖产出物
- 如果上下文极其不清楚，询问用户 - 但倾向于做出合理的决定以保持势头
- 如果同名变更已存在，询问用户是否要继续它或创建一个新的
- 在继续下一个之前，验证写入后每个产出物文件是否存在`
  };
}

/**
 * Template for openspec-archive-change skill
 * For archiving completed changes in the experimental workflow
 */
export function getArchiveChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-archive-change',
    description: '归档实验性工作流中已完成的变更。当用户想要在实现完成后最终确定并归档变更时使用。',
    instructions: `归档实验性工作流中已完成的变更。

**输入**：可选指定变更名称。如果省略，检查是否可以从对话上下文中推断。如果模糊或不明确，你**必须**提示获取可用变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 \`openspec-cn list --json\` 获取可用变更。使用 **AskUserQuestion tool** 让用户选择。

   仅显示活动变更（未归档的）。
   如果可用，包括每个变更使用的 Schema。

   **重要提示**：不要猜测或自动选择变更。始终让用户选择。

2. **检查产出物完成状态**

   运行 \`openspec-cn status --change "<name>" --json\` 检查产出物完成情况。

   解析 JSON 以了解：
   - \`schemaName\`: 正在使用的工作流
   - \`artifacts\`: 产出物列表及其状态（\`done\` 或其他）

   **如果有任何产出物未 \`done\`：**
   - 显示列出未完成产出物的警告
   - 使用 **AskUserQuestion tool** 确认用户是否要继续
   - 如果用户确认，则继续

3. **检查任务完成状态**

   阅读任务文件（通常是 \`tasks.md\`）以检查未完成的任务。

   统计标记为 \`- [ ]\`（未完成）与 \`- [x]\`（已完成）的任务。

   **如果发现未完成的任务：**
   - 显示警告，显示未完成任务的数量
   - 使用 **AskUserQuestion tool** 确认用户是否要继续
   - 如果用户确认，则继续

   **如果没有任务文件存在：** 继续，无需任务相关警告。

4. **Assess delta spec sync state**

   Check for delta specs at \`openspec/changes/<name>/specs/\`. If none exist, proceed without sync prompt.

   **If delta specs exist:**
   - Compare each delta spec with its corresponding main spec at \`openspec/specs/<capability>/spec.md\`
   - Determine what changes would be applied (adds, modifications, removals, renames)
   - Show a combined summary before prompting

   **Prompt options:**
   - If changes needed: "Sync now (recommended)", "Archive without syncing"
   - If already synced: "Archive now", "Sync anyway", "Cancel"

   If user chooses sync, execute /opsx:sync logic (use the openspec-sync-specs skill). Proceed to archive regardless of choice.

5. **执行归档**

   如果归档目录不存在，则创建它：
   \`\`\`bash
   mkdir -p openspec/changes/archive
   \`\`\`

   使用当前日期生成目标名称：\`YYYY-MM-DD-<change-name>\`

   **检查目标是否已存在：**
   - 如果是：失败并报错，建议重命名现有归档或使用不同日期
   - 如果否：将变更目录移动到归档

   \`\`\`bash
   mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
   \`\`\`

6. **显示摘要**

   显示归档完成摘要，包括：
   - 变更名称
   - 使用的 Schema
   - 归档位置
   - 规范是否已同步（如果适用）
   - 关于任何警告的说明（未完成的产出物/任务）

**成功时的输出**

\`\`\`
## 归档完成

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** openspec/changes/archive/YYYY-MM-DD-<name>/
**Specs:** ✓ Synced to main specs (or "No delta specs" or "Sync skipped")

所有产出物已完成。所有任务已完成。
\`\`\`

**防护措施**
- 如果未提供变更，始终提示选择
- 使用产出物图（openspec status --json）进行完成度检查
- 不要在警告时阻止归档 - 只需告知并确认
- 移动到归档时保留 .openspec.yaml（它与目录一起移动）
- 显示清晰的操作摘要
- 如果请求同步，使用 openspec-sync-specs 方法（代理驱动）
- 如果存在增量规格说明，始终运行同步评估并在提示前显示综合摘要`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

/**
 * Template for openspec-bulk-archive-change skill
 * For archiving multiple completed changes at once
 */
export function getBulkArchiveChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-bulk-archive-change',
    description: '一次归档多个已完成的变更。用于归档多个并行变更。',
    instructions: `在单个操作中归档多个已完成的变更。

此技能允许您批量归档变更，通过检查代码库以确定实际实现了什么来智能处理规格说明冲突。

**输入**：无需要求（会提示选择）

**步骤**

1. **获取活动变更**

   运行 \`openspec list --json\` 获取所有活动变更。

   如果不存在活动变更，通知用户并停止。

2. **提示变更选择**

   使用 **AskUserQuestion 工具**进行多选，让用户选择变更：
   - 显示每个变更及其 Schema
   - 包含"所有变更"选项
   - 允许任意数量的选择（1+ 可用，2+ 是典型用例）

   **重要提示**：不要自动选择。始终让用户选择。

3. **批量验证 - 收集所有选定变更的状态**

   对于每个选定的变更，收集：

   a. **产出物状态** - 运行 \`openspec status --change "<name>" --json\`
      - 解析 \`schemaName\` 和 \`artifacts\` 列表
      - 注意哪些产出物是 \`done\` 状态而非其他状态

   b. **任务完成度** - 读取 \`openspec/changes/<name>/tasks.md\`
      - 统计 \`- [ ]\`（未完成）与 \`- [x]\`（已完成）
      - 如果不存在任务文件，标注为"无任务"

   c. **增量规格说明** - 检查 \`openspec/changes/<name>/specs/\` 目录
      - 列出存在哪些能力规格说明
      - 对于每个，提取需求名称（匹配 \`### Requirement: <name>\` 的行）

4. **检测规格说明冲突**

   构建 \`capability -> [涉及它的变更]\` 映射：

   \`\`\`
   auth -> [change-a, change-b]  <- 冲突（2+ 个变更）
   api  -> [change-c]            <- 正常（仅 1 个变更）
   \`\`\`

   当 2+ 个选定的变更具有相同能力的增量规格说明时，存在冲突。

5. **代理式解决冲突**

   **对于每个冲突**，调查代码库：

   a. **读取增量规格说明** 从每个冲突的变更中了解每个声称添加/修改的内容

   b. **搜索代码库** 寻找实现证据：
      - 查找实现每个增量规格说明中需求的代码
      - 检查相关文件、函数或测试

   c. **确定解决方案**：
      - 如果只有一个变更实际实现 -> 同步该变更的规格说明
      - 如果两者都实现 -> 按时间顺序应用（旧的先，新的覆盖）
      - 如果两者都未实现 -> 跳过规格说明同步，警告用户

   d. **记录解决方案** 对于每个冲突：
      - 应用哪个变更的规格说明
      - 按什么顺序（如果两者都有）
      - 原理（在代码库中找到了什么）

6. **显示合并状态表**

   显示汇总所有变更的表：

   \`\`\`
   | 变更                 | 产出物    | 任务  | 规格说明 | 冲突      | 状态   |
   |---------------------|-----------|-------|---------|-----------|--------|
   | schema-management   | 完成      | 5/5   | 2 增量  | 无        | 就绪   |
   | project-config      | 完成      | 3/3   | 1 增量  | 无        | 就绪   |
   | add-oauth           | 完成      | 4/4   | 1 增量  | auth (!)  | 就绪*  |
   | add-verify-skill    | 剩余 1    | 2/5   | 无      | 无        | 警告   |
   \`\`\`

   对于冲突，显示解决方案：
   \`\`\`
   * 冲突解决方案：
     - auth 规格说明：将先应用 add-oauth 然后 add-jwt（两者都已实现，按时间顺序）
   \`\`\`

   对于未完成的变更，显示警告：
   \`\`\`
   警告：
   - add-verify-skill：1 个未完成产出物，3 个未完成任务
   \`\`\`

7. **确认批量操作**

   使用 **AskUserQuestion 工具**进行单次确认：

   - "归档 N 个变更？"根据状态提供选项
   - 选项可能包括：
     - "归档所有 N 个变更"
     - "仅归档 N 个就绪变更（跳过未完成的）"
     - "取消"

   如果存在未完成的变更，请明确说明它们将带着警告被归档。

8. **对每个确认的变更执行归档**

   按确定的顺序处理变更（遵循冲突解决方案）：

   a. **如果存在增量规格说明则同步规格说明**：
      - 使用 openspec-sync-specs 方法（代理驱动的智能合并）
      - 对于冲突，按已解决的顺序应用
      - 跟踪是否已完成同步

   b. **执行归档**：
      \`\`\`bash
      mkdir -p openspec/changes/archive
      mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
      \`\`\`

   c. **跟踪每个变更的结果**：
      - 成功：成功归档
      - 失败：归档期间出错（记录错误）
      - 跳过：用户选择不归档（如适用）

9. **显示摘要**

   显示最终结果：

   \`\`\`
   ## 批量归档完成

   已归档 3 个变更：
   - schema-management-cli -> archive/2026-01-19-schema-management-cli/
   - project-config -> archive/2026-01-19-project-config/
   - add-oauth -> archive/2026-01-19-add-oauth/

   跳过 1 个变更：
   - add-verify-skill（用户选择不归档未完成的）

   规格说明同步摘要：
   - 4 个增量规格说明已同步到主规格说明
   - 1 个冲突已解决（auth：按时间顺序应用两者）
   \`\`\`

   如果有任何失败：
   \`\`\`
   失败 1 个变更：
   - some-change：归档目录已存在
   \`\`\`

**冲突解决示例**

示例 1：仅一个已实现
\`\`\`
冲突：specs/auth/spec.md 被 [add-oauth, add-jwt] 涉及

检查 add-oauth：
- 增量添加"OAuth 提供商集成"需求
- 搜索代码库... 找到 src/auth/oauth.ts 实现 OAuth 流程

检查 add-jwt：
- 增量添加"JWT 令牌处理"需求
- 搜索代码库... 未找到 JWT 实现

解决方案：仅 add-oauth 已实现。将仅同步 add-oauth 规格说明。
\`\`\`

示例 2：两者都已实现
\`\`\`
冲突：specs/api/spec.md 被 [add-rest-api, add-graphql] 涉及

检查 add-rest-api（创建于 2026-01-10）：
- 增量添加"REST 端点"需求
- 搜索代码库... 找到 src/api/rest.ts

检查 add-graphql（创建于 2026-01-15）：
- 增量添加"GraphQL 架构"需求
- 搜索代码库... 找到 src/api/graphql.ts

解决方案：两者都已实现。将先应用 add-rest-api 规格说明，
然后应用 add-graphql 规格说明（按时间顺序，较新的优先）。
\`\`\`

**成功时的输出**

\`\`\`
## 批量归档完成

已归档 N 个变更：
- <change-1> -> archive/YYYY-MM-DD-<change-1>/
- <change-2> -> archive/YYYY-MM-DD-<change-2>/

规格说明同步摘要：
- N 个增量规格说明已同步到主规格说明
- 无冲突（或：M 个冲突已解决）
\`\`\`

**部分成功时的输出**

\`\`\`
## 批量归档完成（部分）

已归档 N 个变更：
- <change-1> -> archive/YYYY-MM-DD-<change-1>/

跳过 M 个变更：
- <change-2>（用户选择不归档未完成的）

失败 K 个变更：
- <change-3>：归档目录已存在
\`\`\`

**没有变更时的输出**

\`\`\`
## 无需归档的变更

未找到活动变更。使用 \`/opsx:new\` 创建新变更。
\`\`\`

**防护措施**
- 允许任意数量的变更（1+ 可以，2+ 是典型用例）
- 始终提示选择，永不自动选择
- 及早检测规格说明冲突并通过检查代码库解决
- 当两个变更都已实现时，按时间顺序应用规格说明
- 仅当实现缺失时跳过规格说明同步（警告用户）
- 在确认前显示清晰的每个变更状态
- 对整个批次使用单次确认
- 跟踪并报告所有结果（成功/跳过/失败）
- 移动到归档时保留 .openspec.yaml
- 归档目录目标使用当前日期：YYYY-MM-DD-<name>
- 如果归档目标已存在，该变更失败但继续处理其他变更`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

/**
 * Template for /opsx:sync slash command
 */
export function getOpsxSyncCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Sync',
    description: '将变更中的增量规范同步到主规范',
    category: 'Workflow',
    tags: ['workflow', 'specs', 'experimental'],
    content: `将变更中的增量规范同步到主规范。

这是一个 **Agent 驱动** 的操作 - 你将读取增量规范并直接编辑主规范以应用更改。这允许智能合并（例如，添加场景而不复制整个需求）。

**输入**：可选择在 \`/opsx:sync\` 后指定变更名称（例如，\`/opsx:sync add-auth\`）。如果省略，检查是否可以从对话上下文中推断出来。如果模糊或不明确，你必须提示可用的变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 \`openspec-cn list --json\` 获取可用变更。使用 **AskUserQuestion tool** 让用户选择。

   显示具有增量规范（在 \`specs/\` 目录下）的变更。

   **重要提示**：不要猜测或自动选择变更。始终让用户选择。

2. **查找增量规范**

   在 \`openspec/changes/<name>/specs/*/spec.md\` 中查找增量规范文件。

   每个增量规范文件包含如下部分：
   - \`## ADDED Requirements\` - 要添加的新需求
   - \`## MODIFIED Requirements\` - 对现有需求的更改
   - \`## REMOVED Requirements\` - 要移除的需求
   - \`## RENAMED Requirements\` - 要重命名的需求（FROM:/TO: 格式）

   如果没有找到增量规范，通知用户并停止。

3. **对于每个增量规范，将更改应用到主规范**

   对于在 \`openspec/changes/<name>/specs/<capability>/spec.md\` 处具有增量规范的每个 capability：

   a. **阅读增量规范** 以了解预期的更改

   b. **阅读主规范** 于 \`openspec/specs/<capability>/spec.md\`（可能尚不存在）

   c. **智能地应用更改**：

      **ADDED Requirements:**
      - 如果需求在主规范中不存在 → 添加它
      - 如果需求已存在 → 更新它以匹配（视为隐式 MODIFIED）

      **MODIFIED Requirements:**
      - 在主规范中找到该需求
      - 应用更改 - 这可能是：
        - 添加新场景（不需要复制现有场景）
        - 修改现有场景
        - 更改需求描述
      - 保留增量中未提及的场景/内容

      **REMOVED Requirements:**
      - 从主规范中移除整个需求块

      **RENAMED Requirements:**
      - 找到 FROM 需求，重命名为 TO

   d. **创建新主规范** 如果 capability 尚不存在：
      - 创建 \`openspec/specs/<capability>/spec.md\`
      - 添加 Purpose 部分（可以简短，标记为 TBD）
      - 添加 Requirements 部分以及 ADDED 需求

4. **显示摘要**

   应用所有更改后，总结：
   - 哪些 capability 已更新
   - 做了什么更改（需求添加/修改/移除/重命名）

**增量规范格式参考**

\`\`\`markdown
## ADDED Requirements

### Requirement: New Feature
The system SHALL do something new.

#### Scenario: Basic case
- **WHEN** user does X
- **THEN** system does Y

## MODIFIED Requirements

### Requirement: Existing Feature
#### Scenario: New scenario to add
- **WHEN** user does A
- **THEN** system does B

## REMOVED Requirements

### Requirement: Deprecated Feature

## RENAMED Requirements

- FROM: \`### Requirement: Old Name\`
- TO: \`### Requirement: New Name\`
\`\`\`

**关键原则：智能合并**

与程序化合并不同，你可以应用 **部分更新**：
- 要添加场景，只需将该场景包含在 MODIFIED 下 - 不要复制现有场景
- 增量代表 *意图*，而不是整体替换
- 使用你的判断力合理地合并更改

**成功时的输出**

\`\`\`
## 规范已同步：<change-name>

已更新主规范：

**<capability-1>**：
- 添加需求："New Feature"
- 修改需求："Existing Feature"（添加了 1 个场景）

**<capability-2>**：
- 创建了新规范文件
- 添加需求："Another Feature"

主规范现已更新。变更保持活动状态 - 在实现完成后归档。
\`\`\`

**护栏**
- 在进行更改之前阅读增量规范和主规范
- 保留增量中未提及的现有内容
- 如果不清楚，询问澄清
- 在进行时显示你正在更改的内容
- 操作应该是幂等的 - 运行两次应给出相同的结果`
  };
}

/**
 * Template for openspec-verify-change skill
 * For verifying implementation matches change artifacts before archiving
 */
export function getVerifyChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-verify-change',
    description: '验证实现是否与变更产出物匹配。当用户想要在归档前验证实现是否完整、正确且一致时使用。',
    instructions: `验证实现是否与变更产出物（规范、任务、设计）匹配。

**输入**：可选指定变更名称。如果省略，检查是否可以从对话上下文中推断。如果模糊或不明确，你**必须**提示获取可用变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 \`openspec-cn list --json\` 获取可用变更。使用 **AskUserQuestion tool** 让用户选择。

   显示具有实现任务的变更（存在任务产出物）。
   如果可用，包括每个变更使用的 Schema。
   将任务未完成的变更标记为 "(进行中)"。

   **重要提示**：不要猜测或自动选择变更。始终让用户选择。

2. **检查状态以了解 Schema**
   \`\`\`bash
   openspec-cn status --change "<name>" --json
   \`\`\`
   Parse the JSON to understand:
   - \`schemaName\`: The workflow being used (e.g., "spec-driven")
   - Which artifacts exist for this change

3. **获取变更目录并加载产出物**

   \`\`\`bash
   openspec-cn instructions apply --change "<name>" --json
   \`\`\`

   这会返回变更目录和上下文文件。从 \`contextFiles\` 读取所有可用产出物。

4. **初始化验证报告结构**

   创建具有三个维度的报告结构：
   - **完整性**：跟踪任务和规范覆盖率
   - **正确性**：跟踪需求实现和场景覆盖率
   - **一致性**：跟踪设计遵循情况和模式一致性

   每个维度可以有 CRITICAL、WARNING 或 SUGGESTION 问题。

5. **验证完整性**

   **任务完成情况**：
   - 如果 contextFiles 中存在 tasks.md，读取它
   - 解析复选框：\`- [ ]\`（未完成）vs \`- [x]\`（已完成）
   - 统计已完成 vs 总任务数
   - 如果存在未完成的任务：
     - 为每个未完成任务添加 CRITICAL 问题
     - 建议："完成任务：<描述>" 或 "如果已实现则标记为完成"

   **规范覆盖率**：
   - 如果 \`openspec/changes/<name>/specs/\` 中存在增量规范：
     - 提取所有需求（标记为 "### Requirement:"）
     - 对于每个需求：
       - 在代码库中搜索与需求相关的关键词
       - 评估实现是否可能存在
     - 如果需求看起来未实现：
       - 添加 CRITICAL 问题："未找到需求：<需求名称>"
       - 建议："实现需求 X：<描述>"

6. **验证正确性**

   **需求实现映射**：
   - 对于增量规范中的每个需求：
     - 在代码库中搜索实现证据
     - 如果找到，记录文件路径和行范围
     - 评估实现是否符合需求意图
     - 如果检测到偏差：
       - 添加 WARNING："实现可能偏离规范：<详情>"
       - 建议："根据需求 X 审查 <文件>:<行>"

   **场景覆盖率**：
   - 对于增量规范中的每个场景（标记为 "#### Scenario:"）：
     - 检查代码中是否处理了条件
     - 检查是否存在覆盖该场景的测试
     - 如果场景看起来未覆盖：
       - 添加 WARNING："场景未覆盖：<场景名称>"
       - 建议："为场景添加测试或实现：<描述>"

7. **验证一致性**

   **设计遵循情况**：
   - 如果 contextFiles 中存在 design.md：
     - 提取关键决策（查找 "Decision:"、"Approach:"、"Architecture:" 等部分）
     - 验证实现是否遵循这些决策
     - 如果检测到矛盾：
       - 添加 WARNING："未遵循设计决策：<决策>"
       - 建议："更新实现或修订 design.md 以匹配实际情况"
   - 如果没有 design.md：跳过设计遵循检查，注明 "没有 design.md 可供验证"

   **代码模式一致性**：
   - 审查新代码与项目模式的一致性
   - 检查文件命名、目录结构、编码风格
   - 如果发现重大偏差：
     - 添加 SUGGESTION："代码模式偏差：<详情>"
     - 建议："考虑遵循项目模式：<示例>"

8. **生成验证报告**

   **摘要记分卡**：
   \`\`\`
   ## 验证报告：<change-name>

   ### 摘要
   | 维度     | 状态             |
   |----------|------------------|
   | 完整性   | X/Y 任务，N 需求 |
   | 正确性   | M/N 需求已覆盖   |
   | 一致性   | 已遵循/存在问题  |
   \`\`\`

   **按优先级分类的问题**：

   1. **CRITICAL**（归档前必须修复）：
      - 未完成的任务
      - 缺失的需求实现
      - 每个都有具体的、可操作的建议

   2. **WARNING**（应该修复）：
      - 规范/设计偏差
      - 缺失的场景覆盖
      - 每个都有具体的建议

   3. **SUGGESTION**（最好修复）：
      - 模式不一致
      - 小改进
      - 每个都有具体的建议

   **最终评估**：
   - 如果有 CRITICAL 问题："发现 X 个关键问题。归档前请修复。"
   - 如果只有警告："没有关键问题。有 Y 个警告需要考虑。可以归档（但建议改进）。"
   - 如果全部通过："所有检查通过。可以归档。"

**验证启发式方法**

- **完整性**：关注客观的检查清单项（复选框、需求列表）
- **正确性**：使用关键词搜索、文件路径分析、合理推断 - 不要求完全确定
- **一致性**：寻找明显的不一致，不要挑剔风格
- **误报**：不确定时，优先使用 SUGGESTION 而非 WARNING，WARNING 而非 CRITICAL
- **可操作性**：每个问题都必须有具体的建议，并在适用时提供文件/行引用

**优雅降级**

- 如果只存在 tasks.md：仅验证任务完成情况，跳过规范/设计检查
- 如果存在任务 + 规范：验证完整性和正确性，跳过设计
- 如果存在完整产出物：验证所有三个维度
- 始终注明跳过了哪些检查以及原因

**输出格式**

使用清晰的 Markdown：
- 摘要记分卡使用表格
- 问题按组列出（CRITICAL/WARNING/SUGGESTION）
- 代码引用格式：\`file.ts:123\`
- 具体的、可操作的建议
- 不要使用模糊的建议，如 "考虑审查"`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

/**
 * Template for /opsx:archive slash command
 */
export function getOpsxArchiveCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Archive',
    description: '归档实验性工作流中已完成的变更',
    category: 'Workflow',
    tags: ['workflow', 'archive', 'experimental'],
    content: `归档实验性工作流中已完成的变更。

**输入**：可选择在 \`/opsx:archive\` 后指定变更名称（例如，\`/opsx:archive add-auth\`）。如果省略，检查是否可以从对话上下文中推断出来。如果模糊或不明确，你必须提示可用的变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 \`openspec-cn list --json\` 获取可用变更。使用 **AskUserQuestion tool** 让用户选择。

   仅显示活动变更（未归档的）。
   如果可用，包括每个变更使用的 Schema。

   **重要提示**：不要猜测或自动选择变更。始终让用户选择。

2. **检查产出物完成状态**

   运行 \`openspec-cn status --change "<name>" --json\` 检查产出物完成情况。

   解析 JSON 以了解：
   - \`schemaName\`: 正在使用的工作流
   - \`artifacts\`: 产出物列表及其状态（\`done\` 或其他）

   **如果有任何产出物未 \`done\`：**
   - 显示列出未完成产出物的警告
   - 提示用户确认是否继续
   - 如果用户确认，则继续

3. **检查任务完成状态**

   阅读任务文件（通常是 \`tasks.md\`）以检查未完成的任务。

   统计标记为 \`- [ ]\`（未完成）与 \`- [x]\`（已完成）的任务。

   **如果发现未完成的任务：**
   - 显示警告，显示未完成任务的数量
   - 提示用户确认是否继续
   - 如果用户确认，则继续

   **如果没有任务文件存在：** 继续，无需任务相关警告。

4. **评估增量规格说明同步状态**

   在 \`openspec/changes/<name>/specs/\` 检查增量规格说明。如果不存在，不提示同步直接继续。

   **如果存在增量规格说明：**
   - 将每个增量规格说明与其在 \`openspec/specs/<capability>/spec.md\` 的相应主规格说明进行比较
   - 确定将应用哪些更改（添加、修改、删除、重命名）
   - 在提示前显示合并摘要

   **提示选项：**
   - 如果需要更改："立即同步（推荐）"，"不同步直接归档"
   - 如果已同步："立即归档"，"仍要同步"，"取消"

   如果用户选择同步，执行 \`/opsx:sync\` 逻辑。无论选择如何都继续归档。

5. **执行归档**

   如果归档目录不存在，则创建它：
   \`\`\`bash
   mkdir -p openspec/changes/archive
   \`\`\`

   使用当前日期生成目标名称：\`YYYY-MM-DD-<change-name>\`

   **检查目标是否已存在：**
   - 如果是：失败并报错，建议重命名现有归档或使用不同日期
   - 如果否：将变更目录移动到归档

   \`\`\`bash
   mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
   \`\`\`

6. **显示摘要**

   显示归档完成摘要，包括：
   - 变更名称
   - 使用的 Schema
   - 归档位置
   - 规格说明同步状态（已同步 / 跳过同步 / 无增量规格说明）
   - 任何警告的注释（未完成的产出物/任务）

**成功时的输出**

\`\`\`
## 归档完成

**变更：** <change-name>
**Schema：** <schema-name>
**归档至：** openspec/changes/archive/YYYY-MM-DD-<name>/
**规范：** ✓ 已同步到主规范

所有产出物已完成。所有任务已完成。
\`\`\`

**成功时的输出（无增量规范）**

\`\`\`
## 归档完成

**变更：** <change-name>
**Schema：** <schema-name>
**归档至：** openspec/changes/archive/YYYY-MM-DD-<name>/
**规范：** 无增量规范

所有产出物已完成。所有任务已完成。
\`\`\`

**成功时的输出（带警告）**

\`\`\`
## 归档完成（带警告）

**变更：** <change-name>
**Schema：** <schema-name>
**归档至：** openspec/changes/archive/YYYY-MM-DD-<name>/
**规格说明：** 跳过同步（用户选择跳过）

**警告：**
- 带有 2 个未完成产出物的归档
- 带有 3 个未完成任务的归档
- 增量规格说明同步已跳过（用户选择跳过）

如果这不是故意的，请检查归档。
\`\`\`

**错误时的输出（归档已存在）**

\`\`\`
## 归档失败

**变更：** <change-name>
**目标：** openspec/changes/archive/YYYY-MM-DD-<name>/

目标归档目录已存在。

**选项：**
1. 重命名现有归档
2. 如果是重复的，删除现有归档
3. 等待不同的日期再归档
\`\`\`

**防护措施**
- 如果未提供变更，始终提示选择
- 使用产出物图（openspec status --json）进行完成度检查
- 不要在警告时阻止归档 - 只需告知并确认
- 移动到归档时保留 .openspec.yaml（它与目录一起移动）
- 显示清晰的操作摘要
- 如果请求同步，使用 /opsx:sync 方法（代理驱动）
- If delta specs exist, always run the sync assessment and show the combined summary before prompting`
  };
}

/**
 * Template for /opsx:onboard slash command
 * Guided onboarding through the complete OpenSpec workflow
 */
export function getOpsxOnboardCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Onboard',
    description: '引导式入门 - 通过完整的OpenSpec工作流周期进行讲解',
    category: 'Workflow',
    tags: ['workflow', 'onboarding', 'tutorial', 'learning'],
    content: getOnboardInstructions(),
  };
}

/**
 * Template for /opsx:bulk-archive slash command
 */
export function getOpsxBulkArchiveCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: 批量归档',
    description: '一次归档多个已完成的变更',
    category: 'Workflow',
    tags: ['workflow', 'archive', 'experimental', 'bulk'],
    content: `在单个操作中归档多个已完成的变更。

此技能允许您批量归档变更，通过检查代码库以确定实际实现了什么来智能处理规格说明冲突。

**输入**：无需要求（会提示选择）

**步骤**

1. **获取活动变更**

   运行 \`openspec list --json\` 获取所有活动变更。

   如果不存在活动变更，通知用户并停止。

2. **提示变更选择**

   使用 **AskUserQuestion 工具**进行多选，让用户选择变更：
   - 显示每个变更及其 Schema
   - 包含"所有变更"选项
   - 允许任意数量的选择（1+ 可用，2+ 是典型用例）

   **重要提示**：不要自动选择。始终让用户选择。

3. **批量验证 - 收集所有选定变更的状态**

   对于每个选定的变更，收集：

   a. **产出物状态** - 运行 \`openspec status --change "<name>" --json\`
      - 解析 \`schemaName\` 和 \`artifacts\` 列表
      - 注意哪些产出物是 \`done\` 状态而非其他状态

   b. **任务完成度** - 读取 \`openspec/changes/<name>/tasks.md\`
      - 统计 \`- [ ]\`（未完成）与 \`- [x]\`（已完成）
      - 如果不存在任务文件，标注为"无任务"

   c. **增量规格说明** - 检查 \`openspec/changes/<name>/specs/\` 目录
      - 列出存在哪些能力规格说明
      - 对于每个，提取需求名称（匹配 \`### Requirement: <name>\` 的行）

4. **检测规格说明冲突**

   构建 \`capability -> [涉及它的变更]\` 映射：

   \`\`\`
   auth -> [change-a, change-b]  <- 冲突（2+ 个变更）
   api  -> [change-c]            <- 正常（仅 1 个变更）
   \`\`\`

   当 2+ 个选定的变更具有相同能力的增量规格说明时，存在冲突。

5. **代理式解决冲突**

   **对于每个冲突**，调查代码库：

   a. **读取增量规格说明** 从每个冲突的变更中了解每个声称添加/修改的内容

   b. **搜索代码库** 寻找实现证据：
      - 查找实现每个增量规格说明中需求的代码
      - 检查相关文件、函数或测试

   c. **确定解决方案**：
      - 如果只有一个变更实际实现 -> 同步该变更的规格说明
      - 如果两者都实现 -> 按时间顺序应用（旧的先，新的覆盖）
      - 如果两者都未实现 -> 跳过规格说明同步，警告用户

   d. **记录解决方案** 对于每个冲突：
      - 应用哪个变更的规格说明
      - 按什么顺序（如果两者都有）
      - 原理（在代码库中找到了什么）

6. **显示合并状态表**

   显示汇总所有变更的表：

   \`\`\`
   | 变更                 | 产出物    | 任务  | 规格说明 | 冲突      | 状态   |
   |---------------------|-----------|-------|---------|-----------|--------|
   | schema-management   | 完成      | 5/5   | 2 增量  | 无        | 就绪   |
   | project-config      | 完成      | 3/3   | 1 增量  | 无        | 就绪   |
   | add-oauth           | 完成      | 4/4   | 1 增量  | auth (!)  | 就绪*  |
   | add-verify-skill    | 剩余 1    | 2/5   | 无      | 无        | 警告   |
   \`\`\`

   对于冲突，显示解决方案：
   \`\`\`
   * 冲突解决方案：
     - auth 规格说明：将先应用 add-oauth 然后 add-jwt（两者都已实现，按时间顺序）
   \`\`\`

   对于未完成的变更，显示警告：
   \`\`\`
   警告：
   - add-verify-skill：1 个未完成产出物，3 个未完成任务
   \`\`\`

7. **确认批量操作**

   使用 **AskUserQuestion 工具**进行单次确认：

   - "归档 N 个变更？"根据状态提供选项
   - 选项可能包括：
     - "归档所有 N 个变更"
     - "仅归档 N 个就绪变更（跳过未完成的）"
     - "取消"

   如果存在未完成的变更，请明确说明它们将带着警告被归档。

8. **对每个确认的变更执行归档**

   按确定的顺序处理变更（遵循冲突解决方案）：

   a. **如果存在增量规格说明则同步规格说明**：
      - 使用 openspec-sync-specs 方法（代理驱动的智能合并）
      - 对于冲突，按已解决的顺序应用
      - 跟踪是否已完成同步

   b. **执行归档**：
      \`\`\`bash
      mkdir -p openspec/changes/archive
      mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
      \`\`\`

   c. **跟踪每个变更的结果**：
      - 成功：成功归档
      - 失败：归档期间出错（记录错误）
      - 跳过：用户选择不归档（如适用）

9. **显示摘要**

   显示最终结果：

   \`\`\`
   ## 批量归档完成

   已归档 3 个变更：
   - schema-management-cli -> archive/2026-01-19-schema-management-cli/
   - project-config -> archive/2026-01-19-project-config/
   - add-oauth -> archive/2026-01-19-add-oauth/

   跳过 1 个变更：
   - add-verify-skill（用户选择不归档未完成的）

   规格说明同步摘要：
   - 4 个增量规格说明已同步到主规格说明
   - 1 个冲突已解决（auth：按时间顺序应用两者）
   \`\`\`

   如果有任何失败：
   \`\`\`
   失败 1 个变更：
   - some-change：归档目录已存在
   \`\`\`

**冲突解决示例**

示例 1：仅一个已实现
\`\`\`
冲突：specs/auth/spec.md 被 [add-oauth, add-jwt] 涉及

检查 add-oauth：
- 增量添加"OAuth 提供商集成"需求
- 搜索代码库... 找到 src/auth/oauth.ts 实现 OAuth 流程

检查 add-jwt：
- 增量添加"JWT 令牌处理"需求
- 搜索代码库... 未找到 JWT 实现

解决方案：仅 add-oauth 已实现。将仅同步 add-oauth 规格说明。
\`\`\`

示例 2：两者都已实现
\`\`\`
冲突：specs/api/spec.md 被 [add-rest-api, add-graphql] 涉及

检查 add-rest-api（创建于 2026-01-10）：
- 增量添加"REST 端点"需求
- 搜索代码库... 找到 src/api/rest.ts

检查 add-graphql（创建于 2026-01-15）：
- 增量添加"GraphQL 架构"需求
- 搜索代码库... 找到 src/api/graphql.ts

解决方案：两者都已实现。将先应用 add-rest-api 规格说明，
然后应用 add-graphql 规格说明（按时间顺序，较新的优先）。
\`\`\`

**成功时的输出**

\`\`\`
## 批量归档完成

已归档 N 个变更：
- <change-1> -> archive/YYYY-MM-DD-<change-1>/
- <change-2> -> archive/YYYY-MM-DD-<change-2>/

规格说明同步摘要：
- N 个增量规格说明已同步到主规格说明
- 无冲突（或：M 个冲突已解决）
\`\`\`

**部分成功时的输出**

\`\`\`
## 批量归档完成（部分）

已归档 N 个变更：
- <change-1> -> archive/YYYY-MM-DD-<change-1>/

跳过 M 个变更：
- <change-2>（用户选择不归档未完成的）

失败 K 个变更：
- <change-3>：归档目录已存在
\`\`\`

**没有变更时的输出**

\`\`\`
## 无需归档的变更

未找到活动变更。使用 \`/opsx:new\` 创建新变更。
\`\`\`

**防护措施**
- 允许任意数量的变更（1+ 可以，2+ 是典型用例）
- 始终提示选择，永不自动选择
- 及早检测规格说明冲突并通过检查代码库解决
- 当两个变更都已实现时，按时间顺序应用规格说明
- 仅当实现缺失时跳过规格说明同步（警告用户）
- 在确认前显示清晰的每个变更状态
- 对整个批次使用单次确认
- 跟踪并报告所有结果（成功/跳过/失败）
- 移动到归档时保留 .openspec.yaml
- 归档目录目标使用当前日期：YYYY-MM-DD-<name>
- 如果归档目标已存在，该变更失败但继续处理其他变更`
  };
}

/**
 * Template for /opsx:verify slash command
 */
export function getOpsxVerifyCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Verify',
    description: '在归档前验证实现是否与变更产出物匹配',
    category: 'Workflow',
    tags: ['workflow', 'verify', 'experimental'],
    content: `验证实现是否与变更产出物（规范、任务、设计）匹配。

**输入**：可选择在 \`/opsx:verify\` 后指定变更名称（例如，\`/opsx:verify add-auth\`）。如果省略，检查是否可以从对话上下文中推断出来。如果模糊或不明确，你必须提示可用的变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 \`openspec-cn list --json\` 获取可用变更。使用 **AskUserQuestion tool** 让用户选择。

   显示具有实现任务的变更（存在任务产出物）。
   如果可用，包括每个变更使用的 Schema。
   将任务未完成的变更标记为 "(进行中)"。

   **重要提示**：不要猜测或自动选择变更。始终让用户选择。

2. **检查状态以了解 Schema**
   \`\`\`bash
   openspec-cn status --change "<name>" --json
   \`\`\`
   Parse the JSON to understand:
   - \`schemaName\`: The workflow being used (e.g., "spec-driven")
   - Which artifacts exist for this change

3. **获取变更目录并加载产出物**

   \`\`\`bash
   openspec-cn instructions apply --change "<name>" --json
   \`\`\`

   这会返回变更目录和上下文文件。从 \`contextFiles\` 读取所有可用产出物。

4. **初始化验证报告结构**

   创建具有三个维度的报告结构：
   - **完整性**：跟踪任务和规范覆盖率
   - **正确性**：跟踪需求实现和场景覆盖率
   - **一致性**：跟踪设计遵循情况和模式一致性

   每个维度可以有 CRITICAL、WARNING 或 SUGGESTION 问题。

5. **验证完整性**

   **任务完成情况**：
   - 如果 contextFiles 中存在 tasks.md，读取它
   - 解析复选框：\`- [ ]\`（未完成）vs \`- [x]\`（已完成）
   - 统计已完成 vs 总任务数
   - 如果存在未完成的任务：
     - 为每个未完成任务添加 CRITICAL 问题
     - 建议："完成任务：<描述>" 或 "如果已实现则标记为完成"

   **规范覆盖率**：
   - 如果 \`openspec/changes/<name>/specs/\` 中存在增量规范：
     - 提取所有需求（标记为 "### Requirement:"）
     - 对于每个需求：
       - 在代码库中搜索与需求相关的关键词
       - 评估实现是否可能存在
     - 如果需求看起来未实现：
       - 添加 CRITICAL 问题："未找到需求：<需求名称>"
       - 建议："实现需求 X：<描述>"

6. **验证正确性**

   **需求实现映射**：
   - 对于增量规范中的每个需求：
     - 在代码库中搜索实现证据
     - 如果找到，记录文件路径和行范围
     - 评估实现是否符合需求意图
     - 如果检测到偏差：
       - 添加 WARNING："实现可能偏离规范：<详情>"
       - 建议："根据需求 X 审查 <文件>:<行>"

   **场景覆盖率**：
   - 对于增量规范中的每个场景（标记为 "#### Scenario:"）：
     - 检查代码中是否处理了条件
     - 检查是否存在覆盖该场景的测试
     - 如果场景看起来未覆盖：
       - 添加 WARNING："场景未覆盖：<场景名称>"
       - 建议："为场景添加测试或实现：<描述>"

7. **验证一致性**

   **设计遵循情况**：
   - 如果 contextFiles 中存在 design.md：
     - 提取关键决策（查找 "Decision:"、"Approach:"、"Architecture:" 等部分）
     - 验证实现是否遵循这些决策
     - 如果检测到矛盾：
       - 添加 WARNING："未遵循设计决策：<决策>"
       - 建议："更新实现或修订 design.md 以匹配实际情况"
   - 如果没有 design.md：跳过设计遵循检查，注明 "没有 design.md 可供验证"

   **代码模式一致性**：
   - 审查新代码与项目模式的一致性
   - 检查文件命名、目录结构、编码风格
   - 如果发现重大偏差：
     - 添加 SUGGESTION："代码模式偏差：<详情>"
     - 建议："考虑遵循项目模式：<示例>"

8. **生成验证报告**

   **摘要记分卡**：
   \`\`\`
   ## 验证报告：<change-name>

   ### 摘要
   | 维度     | 状态             |
   |----------|------------------|
   | 完整性   | X/Y 任务，N 需求 |
   | 正确性   | M/N 需求已覆盖   |
   | 一致性   | 已遵循/存在问题  |
   \`\`\`

   **按优先级分类的问题**：

   1. **CRITICAL**（归档前必须修复）：
      - 未完成的任务
      - 缺失的需求实现
      - 每个都有具体的、可操作的建议

   2. **WARNING**（应该修复）：
      - 规范/设计偏差
      - 缺失的场景覆盖
      - 每个都有具体的建议

   3. **SUGGESTION**（最好修复）：
      - 模式不一致
      - 小改进
      - 每个都有具体的建议

   **最终评估**：
   - 如果有 CRITICAL 问题："发现 X 个关键问题。归档前请修复。"
   - 如果只有警告："没有关键问题。有 Y 个警告需要考虑。可以归档（但建议改进）。"
   - 如果全部通过："所有检查通过。可以归档。"

**验证启发式方法**

- **完整性**：关注客观的检查清单项（复选框、需求列表）
- **正确性**：使用关键词搜索、文件路径分析、合理推断 - 不要求完全确定
- **一致性**：寻找明显的不一致，不要挑剔风格
- **误报**：不确定时，优先使用 SUGGESTION 而非 WARNING，WARNING 而非 CRITICAL
- **可操作性**：每个问题都必须有具体的建议，并在适用时提供文件/行引用

**优雅降级**

- 如果只存在 tasks.md：仅验证任务完成情况，跳过规范/设计检查
- 如果存在任务 + 规范：验证完整性和正确性，跳过设计
- 如果存在完整产出物：验证所有三个维度
- 始终注明跳过了哪些检查以及原因

**输出格式**

使用清晰的 Markdown：
- 摘要记分卡使用表格
- 问题按组列出（CRITICAL/WARNING/SUGGESTION）
- 代码引用格式：\`file.ts:123\`
- 具体的、可操作的建议
- 不要使用模糊的建议，如 "考虑审查"`
  };
}
/**
 * Template for feedback skill
 * For collecting and submitting user feedback with context enrichment
 */
export function getFeedbackSkillTemplate(): SkillTemplate {
  return {
    name: 'feedback',
    description: 'Collect and submit user feedback about OpenSpec with context enrichment and anonymization.',
    instructions: `Help the user submit feedback about OpenSpec.

**Goal**: Guide the user through collecting, enriching, and submitting feedback while ensuring privacy through anonymization.

**Process**

1. **Gather context from the conversation**
   - Review recent conversation history for context
   - Identify what task was being performed
   - Note what worked well or poorly
   - Capture specific friction points or praise

2. **Draft enriched feedback**
   - Create a clear, descriptive title (single sentence, no "Feedback:" prefix needed)
   - Write a body that includes:
     - What the user was trying to do
     - What happened (good or bad)
     - Relevant context from the conversation
     - Any specific suggestions or requests

3. **Anonymize sensitive information**
   - Replace file paths with \`<path>\` or generic descriptions
   - Replace API keys, tokens, secrets with \`<redacted>\`
   - Replace company/organization names with \`<company>\`
   - Replace personal names with \`<user>\`
   - Replace specific URLs with \`<url>\` unless public/relevant
   - Keep technical details that help understand the issue

4. **Present draft for approval**
   - Show the complete draft to the user
   - Display both title and body clearly
   - Ask for explicit approval before submitting
   - Allow the user to request modifications

5. **Submit on confirmation**
   - Use the \`openspec feedback\` command to submit
   - Format: \`openspec feedback "title" --body "body content"\`
   - The command will automatically add metadata (version, platform, timestamp)

**Example Draft**

\`\`\`
Title: Error handling in artifact workflow needs improvement

Body:
I was working on creating a new change and encountered an issue with
the artifact workflow. When I tried to continue after creating the
proposal, the system didn't clearly indicate that I needed to complete
the specs first.

Suggestion: Add clearer error messages that explain dependency chains
in the artifact workflow. Something like "Cannot create design.md
because specs are not complete (0/2 done)."

Context: Using the spec-driven schema with <path>/my-project
\`\`\`

**Anonymization Examples**

Before:
\`\`\`
Working on /Users/john/mycompany/auth-service/src/oauth.ts
Failed with API key: sk_live_abc123xyz
Working at Acme Corp
\`\`\`

After:
\`\`\`
Working on <path>/oauth.ts
Failed with API key: <redacted>
Working at <company>
\`\`\`

**Guardrails**

- MUST show complete draft before submitting
- MUST ask for explicit approval
- MUST anonymize sensitive information
- ALLOW user to modify draft before submitting
- DO NOT submit without user confirmation
- DO include relevant technical context
- DO keep conversation-specific insights

**User Confirmation Required**

Always ask:
\`\`\`
Here's the feedback I've drafted:

Title: [title]

Body:
[body]

Does this look good? I can modify it if you'd like, or submit it as-is.
\`\`\`

Only proceed with submission after user confirms.`
  };
}
