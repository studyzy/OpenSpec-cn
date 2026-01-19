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

**这是一种姿态，而非工作流程。** 没有固定的步骤，没有要求的顺序，没有强制的输出。你是一个帮助用户进行探索的思考伙伴。

---

## 姿态

- **好奇而非说教** - 提出自然产生的问题，不要遵循脚本
- **可视化** - 在有助于澄清思路时大方使用 ASCII 图表
- **自适应** - 跟随有趣的思路，当新信息出现时及时转向
- **耐心** - 不要急于下结论，让问题的轮廓自然显现
- **落地** - 在相关时探索实际代码库，不要只进行理论探讨

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

- **不要假装理解** - 如果某事不清楚，深入挖掘
- **不要匆忙** - 探索是思考时间，不是任务时间
- **不要强迫结构** - 让模式自然浮现
- **不要自动捕获** - 提议保存见解，不要直接做
- **务必可视化** - 一张好的图表胜过千言万语
- **务必探索代码库** - 将讨论建立在现实基础上
- **务必质疑假设** - 包括用户的和你自己的`
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

   **仅当用户提到以下内容时才使用不同的 Schema**：
   - "tdd" 或 "测试驱动" → 使用 \`--schema tdd\`
   - 特定的 Schema 名称 → 使用 \`--schema <name>\`
   - "显示工作流" 或 "有哪些工作流" → 运行 \`openspec-cn schemas --json\` 并让他们选择

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
   第一个产出物取决于 Schema（例如：规格说明驱动为 \`proposal\`，TDD 为 \`spec\`）。
   检查状态输出，找到第一个状态为 "ready" 的产出物。
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
- 如果使用非默认工作流，请传递 --schema`
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

**输入**：可选地指定变更名称。如果省略，必须提示选择可用变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 \`openspec-cn list --json\` 获取按最近修改排序的可用变更。然后使用 **AskUserQuestion tool** 让用户选择要处理哪个变更。

   展示前 3-4 个最近修改的变更作为选项，显示：
   - 变更名称
   - Schema（如果存在 \`schema\` 字段，否则为 "spec-driven"）
   - 状态（例如："0/5 tasks", "complete", "no tasks"）
   - 最近修改时间（来自 \`lastModified\` 字段）

   将最近修改的变更标记为 "(Recommended)"，因为它很可能是用户想要继续的。

   **重要提示**：不要猜测或自动选择变更。始终让用户选择。

2. **检查当前状态**
   \`\`\`bash
   openspec-cn status --change "<name>" --json
   \`\`\`
   解析 JSON 以了解当前状态。响应包括：
   - \`schemaName\`: 正在使用的工作流 Schema（例如："spec-driven", "tdd"）
   - \`artifacts\`: 产出物数组及其状态（"done", "ready", "blocked"）
   - \`isComplete\`: 指示所有产出物是否完成的布尔值

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
   - 解析 JSON 以获取模板、依赖项以及它解锁的内容
   - **创建产出物文件**，使用模板作为起点：
     - 阅读任何已完成的依赖文件以获取上下文
     - 根据上下文和用户目标填写模板
     - 写入指令中指定的输出路径
   - 显示已创建的内容以及现在解锁的内容
   - 在创建一个产出物后停止

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
- **proposal.md**: 如果不清楚，询问用户关于变更的信息。填写 Why, What Changes, Capabilities, Impact。
  - Capabilities 部分至关重要 - 列出的每个 capability 都需要一个 spec 文件。
- **specs/*.md**: 为 proposal 中列出的每个 capability 创建一个 spec。
- **design.md**: 记录技术决策、架构和实现方法。
- **tasks.md**: 将实现分解为带复选框的任务。

**tdd schema** (spec → tests → implementation → docs):
- **spec.md**: 定义要构建内容的功能规格说明。
- **tests/*.test.ts**: 在实现之前编写测试（TDD 红阶段）。
- **src/*.ts**: 实现以通过测试（TDD 绿阶段）。
- **docs/*.md**: 记录已实现的功能。

对于其他 Schema，请遵循 CLI 输出中的 \`instruction\` 字段。

**护栏**
- 每次调用创建一个产出物
- 在创建新产出物之前，始终阅读依赖产出物
- 永远不要跳过产出物或乱序创建
- 如果上下文不清楚，在创建之前询问用户
- 在标记进度之前，验证写入后产出物文件是否存在
- 使用 Schema 的产出物序列，不要假设特定的产出物名称`
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

**输入**：可选地指定变更名称。如果省略，必须提示选择可用变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 \`openspec-cn list --json\` 获取可用变更。使用 **AskUserQuestion tool** 让用户选择。

   显示准备好实现的变更（有任务产出物）。
   如果可用，包括每个变更使用的 Schema。
   将任务未完成的变更标记为 "(In Progress)"。

   **重要提示**：不要猜测或自动选择变更。始终让用户选择。

2. **检查状态以了解 Schema**
   \`\`\`bash
   openspec-cn status --change "<name>" --json
   \`\`\`
   解析 JSON 以了解：
   - \`schemaName\`: 正在使用的工作流（例如："spec-driven", "tdd"）
   - 哪个产出物包含任务（对于 spec-driven 通常是 "tasks"，其他请检查状态）

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
   - **tdd**: spec, tests, implementation, docs
   - 其他 Schema：遵循 CLI 输出中的 contextFiles

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
- **允许产出物更新**：如果实现揭示了设计问题，建议更新产出物 - 不是阶段锁定的，流畅地工作`
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
      - 指令 JSON 包括：
        - \`template\`: 要使用的模板内容
        - \`instruction\`: 此产出物类型的 Schema 特定指导
        - \`outputPath\`: 产出物写入位置
        - \`dependencies\`: 已完成的产出物，用于读取上下文
      - 阅读任何已完成的依赖文件以获取上下文
      - 按照 Schema 的 \`instruction\` 创建产出物文件
      - 显示简要进度："✓ Created <artifact-id>"

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

- 遵循每个产出物类型的 \`openspec-cn instructions\` 中的 \`instruction\` 字段
- Schema 定义了每个产出物应包含的内容 - 遵循它
- 在创建新产出物之前阅读依赖产出物以获取上下文
- 使用 \`template\` 作为起点，根据上下文填写

**护栏**
- 创建实现所需的所有产出物（由 Schema 的 \`apply.requires\` 定义）
- 在创建新产出物之前始终阅读依赖产出物
- 如果上下文极其不清楚，询问用户 - 但倾向于做出合理的决定以保持势头
- 如果同名变更已存在，建议继续处理该变更
- 在继续下一个之前，验证写入后每个产出物文件是否存在`
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

**输入**：可选地指定变更名称。如果省略，必须提示选择可用变更。

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

**这是一种姿态，而非工作流。** 没有固定的步骤，没有要求的顺序，没有强制的输出。你是一个帮助用户探索的思考伙伴。

**输入**：\`/opsx:explore\` 之后的参数是用户想要思考的任何内容。可能是：
- 一个模糊的想法："real-time collaboration"
- 一个具体的问题："the auth system is getting unwieldy"
- 一个变更名称："add-dark-mode"（在该变更的上下文中探索）
- 一个比较："postgres vs sqlite for this"
- 无（仅进入探索模式）

---

## 姿态 (The Stance)

- **好奇，而非指令式** - 提出自然涌现的问题，不要照本宣科
- **可视化** - 当有助于理清思路时，大量使用 ASCII 图表
- **适应性** - 追随有趣的线索，当新信息出现时灵活调整
- **耐心** - 不要急于下结论，让问题的形态自然浮现
- **脚踏实地** - 在相关时探索实际的代码库，不要只是空谈理论

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

- **不要假装理解** - 如果某事不清楚，深入挖掘
- **不要匆忙** - 探索是思考时间，不是任务时间
- **不要强迫结构** - 让模式自然浮现
- **不要自动捕获** - 提议保存见解，不要直接做
- **务必可视化** - 一张好的图表胜过千言万语
- **务必探索代码库** - 将讨论建立在现实基础上
- **务必质疑假设** - 包括用户的和你自己的`
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

   **仅当用户提到以下内容时才使用不同的 Schema**：
   - "tdd" 或 "测试驱动" → 使用 \`--schema tdd\`
   - 特定的 Schema 名称 → 使用 \`--schema <name>\`
   - "显示工作流" 或 "有哪些工作流" → 运行 \`openspec-cn schemas --json\` 并让他们选择

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

**输入**：可选地在 \`/opsx:continue\` 后指定 \`--change <name>\`。如果省略，必须提示选择可用变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 \`openspec-cn list --json\` 获取按最近修改排序的可用变更。然后使用 **AskUserQuestion tool** 让用户选择要处理哪个变更。

   展示前 3-4 个最近修改的变更作为选项，显示：
   - 变更名称
   - Schema（如果存在 \`schema\` 字段，否则为 "spec-driven"）
   - 状态（例如："0/5 tasks", "complete", "no tasks"）
   - 最近修改时间（来自 \`lastModified\` 字段）

   将最近修改的变更标记为 "(Recommended)"，因为它很可能是用户想要继续的。

   **重要提示**：不要猜测或自动选择变更。始终让用户选择。

2. **检查当前状态**
   \`\`\`bash
   openspec-cn status --change "<name>" --json
   \`\`\`
   解析 JSON 以了解当前状态。响应包括：
   - \`schemaName\`: 正在使用的工作流 Schema（例如："spec-driven", "tdd"）
   - \`artifacts\`: 产出物数组及其状态（"done", "ready", "blocked"）
   - \`isComplete\`: 指示所有产出物是否完成的布尔值

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
   - 解析 JSON 以获取模板、依赖项以及它解锁的内容
   - **创建产出物文件**，使用模板作为起点：
     - 阅读任何已完成的依赖文件以获取上下文
     - 根据上下文和用户目标填写模板
     - 写入指令中指定的输出路径
   - 显示已创建的内容以及现在解锁的内容
   - 在创建一个产出物后停止

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
- **proposal.md**: 如果不清楚，询问用户关于变更的信息。填写 Why, What Changes, Capabilities, Impact。
  - Capabilities 部分至关重要 - 列出的每个 capability 都需要一个 spec 文件。
- **specs/*.md**: 为 proposal 中列出的每个 capability 创建一个 spec。
- **design.md**: 记录技术决策、架构和实现方法。
- **tasks.md**: 将实现分解为带复选框的任务。

**tdd schema** (spec → tests → implementation → docs):
- **spec.md**: 定义要构建内容的功能规格说明。
- **tests/*.test.ts**: 在实现之前编写测试（TDD 红阶段）。
- **src/*.ts**: 实现以通过测试（TDD 绿阶段）。
- **docs/*.md**: 记录已实现的功能。

对于其他 Schema，请遵循 CLI 输出中的 \`instruction\` 字段。

**护栏**
- 每次调用创建一个产出物
- 在创建新产出物之前，始终阅读依赖产出物
- 永远不要跳过产出物或乱序创建
- 如果上下文不清楚，在创建之前询问用户
- 在标记进度之前，验证写入后产出物文件是否存在
- 使用 Schema 的产出物序列，不要假设特定的产出物名称`
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

**输入**：可选地在 \`/opsx:apply\` 后指定 \`--change <name>\`。如果省略，必须提示选择可用变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 \`openspec-cn list --json\` 获取可用变更。使用 **AskUserQuestion tool** 让用户选择。

   显示准备好实现的变更（有任务产出物）。
   如果可用，包括每个变更使用的 Schema。
   将任务未完成的变更标记为 "(In Progress)"。

   **重要提示**：不要猜测或自动选择变更。始终让用户选择。

2. **检查状态以了解 Schema**
   \`\`\`bash
   openspec-cn status --change "<name>" --json
   \`\`\`
   解析 JSON 以了解：
   - \`schemaName\`: 正在使用的工作流（例如："spec-driven", "tdd"）
   - 哪个产出物包含任务（对于 spec-driven 通常是 "tasks"，其他请检查状态）

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
   - **tdd**: spec, tests, implementation, docs
   - 其他 Schema：遵循 CLI 输出中的 contextFiles

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
      - 指令 JSON 包括：
        - \`template\`: 要使用的模板内容
        - \`instruction\`: 此产出物类型的 Schema 特定指导
        - \`outputPath\`: 产出物写入位置
        - \`dependencies\`: 已完成的产出物，用于读取上下文
      - 阅读任何已完成的依赖文件以获取上下文
      - 按照 Schema 的 \`instruction\` 创建产出物文件
      - 显示简要进度："✓ Created <artifact-id>"

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

**输入**：可选地指定变更名称。如果省略，必须提示选择可用变更。

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

4. **检查增量规范是否需要同步**

   检查变更中是否存在带有规范文件的 \`specs/\` 目录。

   **如果存在增量规范，执行快速同步检查：**

   a. **对于每个增量规范** 于 \`openspec/changes/<name>/specs/<capability>/spec.md\`：
      - 提取需求名称（匹配 \`### Requirement: <name>\` 的行）
      - 注意存在哪些部分（ADDED, MODIFIED, REMOVED）

   b. **检查对应的主规范** 于 \`openspec/specs/<capability>/spec.md\`：
      - 如果主规范不存在 → 需要同步
      - 如果主规范存在，检查 ADDED 需求名称是否出现在其中
      - 如果任何 ADDED 需求在主规范中缺失 → 需要同步

   c. **报告发现：**

      **如果需要同步：**
      \`\`\`
      ⚠️ Delta specs may not be synced:
      - specs/auth/spec.md → Main spec missing requirement "Token Refresh"
      - specs/api/spec.md → Main spec doesn't exist yet

      Would you like to sync now before archiving?
      \`\`\`
      - 使用 **AskUserQuestion tool** 提供选项："Sync now", "Archive without syncing"
      - 如果用户选择同步，执行 /opsx:sync 逻辑（使用 openspec-sync-specs skill）

      **如果已同步（找到所有需求）：**
      - 继续，无需提示（规范似乎已同步）

   **如果不存在增量规范：** 继续，无需同步相关检查。

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

**变更：** <change-name>
**Schema：** <schema-name>
**归档至：** openspec/changes/archive/YYYY-MM-DD-<name>/
**规范：** ✓ 已同步到主规范（或 "无增量规范" 或 "⚠️ 未同步"）

所有产出物已完成。所有任务已完成。
\`\`\`

**护栏**
- 如果未提供，始终提示选择变更
- 使用产出物图（openspec-cn status --json）进行完成检查
- 不要因警告阻止归档 - 只是通知并确认
- 移动到归档时保留 .openspec.yaml（它随目录移动）
- 显示发生了什么的清晰摘要
- 如果请求同步，使用 openspec-sync-specs 方法（agent 驱动）
- 快速同步检查：在增量规范中查找需求名称，验证它们是否存在于主规范中`
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

**输入**：可选地在 \`/opsx:sync\` 后指定 \`--change <name>\`。如果省略，必须提示选择可用变更。

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

**输入**：可选地指定变更名称。如果省略，必须提示选择可用变更。

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
   解析 JSON 以了解：
   - \`schemaName\`: 正在使用的工作流（例如："spec-driven", "tdd"）
   - 此变更存在哪些产出物

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
 * Template for /opsx:archive slash command
 */
export function getOpsxArchiveCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Archive',
    description: '归档实验性工作流中已完成的变更',
    category: 'Workflow',
    tags: ['workflow', 'archive', 'experimental'],
    content: `归档实验性工作流中已完成的变更。

**输入**：可选地在 \`/opsx:archive\` 后指定 \`--change <name>\`。如果省略，必须提示选择可用变更。

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

4. **检查增量规范是否需要同步**

   检查变更中是否存在带有规范文件的 \`specs/\` 目录。

   **如果存在增量规范，执行快速同步检查：**

   a. **对于每个增量规范** 于 \`openspec/changes/<name>/specs/<capability>/spec.md\`：
      - 提取需求名称（匹配 \`### Requirement: <name>\` 的行）
      - 注意存在哪些部分（ADDED, MODIFIED, REMOVED）

   b. **检查对应的主规范** 于 \`openspec/specs/<capability>/spec.md\`：
      - 如果主规范不存在 → 需要同步
      - 如果主规范存在，检查 ADDED 需求名称是否出现在其中
      - 如果任何 ADDED 需求在主规范中缺失 → 需要同步

   c. **报告发现：**

      **如果需要同步：**
      \`\`\`
      ⚠️ Delta specs may not be synced:
      - specs/auth/spec.md → Main spec missing requirement "Token Refresh"
      - specs/api/spec.md → Main spec doesn't exist yet

      Would you like to sync now before archiving?
      \`\`\`
      - 使用 **AskUserQuestion tool** 提供选项："Sync now", "Archive without syncing"
      - 如果用户选择同步，执行 \`/opsx:sync\` 逻辑

      **如果已同步（找到所有需求）：**
      - 继续，无需提示（规范似乎已同步）

   **如果不存在增量规范：** 继续，无需同步相关检查。

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
**规范：** ⚠️ 未同步

**警告：**
- 归档时有 2 个未完成的产出物
- 归档时有 3 个未完成的任务
- 增量规范未同步（用户选择跳过）

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

**护栏**
- 如果未提供，始终提示选择变更
- 使用产出物图（openspec-cn status --json）进行完成检查
- 不要因警告阻止归档 - 只是通知并确认
- 移动到归档时保留 .openspec.yaml（它随目录移动）
- 快速同步检查：在增量规范中查找需求名称，验证它们是否存在于主规范中
- 显示发生了什么的清晰摘要
- 如果请求同步，使用 /opsx:sync 方法（agent 驱动）`
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

**输入**：可选地在 \`/opsx:verify\` 后指定 \`--change <name>\`。如果省略，必须提示选择可用变更。

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
   解析 JSON 以了解：
   - \`schemaName\`: 正在使用的工作流（例如："spec-driven", "tdd"）
   - 此变更存在哪些产出物

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
