/**
 * The router skill: the one place to start for anything OpenSpec. It answers
 * questions about where things stand and how OpenSpec works, hands a request
 * to the workflow skill that does it, and runs several of them in order. It
 * holds no workflow steps of its own. What it needs only sometimes lives in
 * its `references/` files.
 */
import type { SkillTemplate } from '../types.js';

export const ROUTER_SKILL_NAME = 'openspec';

const WITHOUT_SKILLS = `# 在没有对应 skill 时完成某一步

当某一步所需的 skill 未安装时使用。每一节是某个 skill 对应的 CLI 做法。从项目根目录运行这些命令，并读取它们的 \`--json\` 输出。用户也可以改用 \`openspec-cn config profile\` 安装该 skill，再运行 \`openspec-cn update\`。

## /opsx:explore

探索是对话，不是命令。读取 \`openspec-cn list --json\`、相关的 specs 和代码，然后与用户一起把问题想清楚。在他们决定要构建什么之前，不要写代码，也不要写变更文件。

## /opsx:propose、/opsx:new、/opsx:continue、/opsx:ff

1. 启动变更：\`openspec-cn new change "<name>"\`，使用简短的 kebab-case 名称。
2. 运行 \`openspec-cn status --change "<name>" --json\` 查看哪些制品已就绪。
3. 每写一个制品，运行 \`openspec-cn instructions <artifact-id> --change "<name>" --json\`，按它的 \`instruction\` 和 \`template\` 操作。把文件写到 \`outputPath\`。
4. 重复第 2、3 步。逐个制品创建变更时，写完一个制品就停；用户想要完整计划时，一直写到规划完成。

## /opsx:update

读取变更的文件，修订用户要求改动的那些，然后运行 \`openspec-cn validate "<name>"\` 并修复它报告的问题。只改规划文件，绝不改代码。

## /opsx:apply

运行 \`openspec-cn instructions apply --change "<name>" --json\`，读取它在 \`contextFiles\` 下列出的文件，然后按序完成未勾选的任务。每完成一项就立刻把 \`tasks.md\` 里的 \`- [ ]\` 勾成 \`- [x]\`。

## /opsx:verify

读取变更的 tasks 和 specs，然后逐项对照代码检查：每个任务都已完成，每条需求和场景都已实现。报告缺少什么。不要改动任何文件。

## /opsx:sync

没有命令能在保持变更开启的同时更新主 specs。要么手工把 \`openspec/changes/<name>/specs/\` 下的每个文件合并进对应的 \`openspec/specs/<capability>/spec.md\` 并运行 \`openspec-cn validate --specs\`，要么归档该变更，让归档替你完成合并。

## /opsx:archive、/opsx:bulk-archive

先确认变更已完成：\`openspec-cn status --change "<name>" --json\` 显示它的制品，\`openspec-cn list --json\` 显示 \`completedTasks\` 占 \`totalTasks\` 的情况。若有未完成项，告诉用户并在继续前询问。然后运行 \`openspec-cn archive "<name>" --yes\`，它会把变更的 spec 更新合并进主 specs，并把变更移入归档。多个变更时，一次处理一个。

## /opsx:onboard

带用户在他们自己的项目里完整走一遍一个小变更：用上面的各节依次探索、提案、实施、归档。
`;

const WHERE_THINGS_STAND = `# 当前进展

当用户问进展如何或下一步做什么时使用。回答前先查看：

- \`openspec-cn list --json\` 列出进行中的变更。
- \`openspec-cn status --change "<name>" --json\` 显示某个变更的计划已有哪些部分、下一步是什么。\`openspec-cn status --all --json\` 对所有变更做同样的事。
- \`openspec-cn show "<name>"\` 打印一个变更或一条 spec。
- 如果用户点名了 store，给以上每条加上 \`--store <id>\`。\`openspec-cn store list --json\` 列出所有 store。

用一两句话说明当前进展，点名下一步和负责它的 skill，并提议由你来执行。在用户同意之前不要开始。
`;

const ANSWERS = `# 常见问题

当用户问 OpenSpec 如何工作、或如何设置时使用。在依赖某个标志之前，先用 CLI 自己的帮助（\`openspec-cn <command> --help\`）核对答案。

## 文件都在哪里

- \`openspec/specs/<capability>/spec.md\`：系统当下的行为，以带场景的需求描述。
- \`openspec/changes/<name>/\`：一个计划中的变更。通常有 \`proposal.md\`、\`specs/\`（spec 更新）、\`design.md\`（可选）和 \`tasks.md\`。
- \`openspec/changes/archive/\`：已完成的变更。
- \`openspec/config.yaml\`：项目的 schema、每个 Agent 都会读到的 \`context\` 行，以及每个制品的 \`rules\`。

## 查看状态

- 进行中的变更：\`openspec-cn list\`。specs：\`openspec-cn list --specs\`。
- 某个变更的进展：\`openspec-cn status --change "<name>"\`。
- 读取变更或 spec：\`openspec-cn show "<name>"\`。
- 检查文件格式是否正确：\`openspec-cn validate "<name>"\`，或 \`openspec-cn validate --all\`。
- 总览仪表盘：\`openspec-cn view\`。

## 初始化与配置

- 初始化项目，或给它添加一个 Agent：\`openspec-cn init\`。
- 选择安装哪些 skills：\`openspec-cn config profile\`，然后在每个项目里运行 \`openspec-cn update\`。
- 升级 OpenSpec 后刷新 skills：\`openspec-cn update\`。
- 让 Agent 了解这个项目的特定约定：在 \`openspec/config.yaml\` 的 \`context\` 下加一行简短说明。只有在用户认可措辞后才修改文件。
- 查看或修改制品工作流：\`openspec-cn schemas\` 列出所有 schema，\`openspec-cn templates\` 显示每个制品的模板来自哪里。

## Stores

store 是注册在本机上的、独立于代码仓库的 OpenSpec 仓库，用于存放代码之外的 specs。\`openspec-cn store --help\` 列出它的命令。大多数命令都接受 \`--store <id>\`，以便在 store 而非当前项目中工作。

## 出了问题时

- 运行 \`openspec-cn doctor\` 并阅读它的报告。
- 要告诉维护者，在用户认可消息内容后使用 \`openspec-cn feedback "<message>"\`。
`;

export function getRouterSkillTemplate(): SkillTemplate {
  return {
    name: ROUTER_SKILL_NAME,
    description: '任何 OpenSpec 工作的起点。当用户提出 OpenSpec 相关请求却没有点名某个 skill、不确定在 OpenSpec 里该怎么做、询问某个变更的进展或下一步、或一次要求多个 OpenSpec 步骤时使用。用户只说 "openspec" 且没有更具体的 OpenSpec skill 匹配时也使用。',
    instructions: `OpenSpec 帮助人与编程 Agent 就软件该做什么达成一致，并在代码变化后保持这份共识为真。每个变更都规划为对 specs 的一次更新，在写代码前经过评审，构建完成后再合并进 specs。

你是本项目中一切 OpenSpec 工作的起点。先弄清用户需要什么，然后做三件事之一：回答他的问题、把请求交给负责该工作的 skill、或按顺序运行多个 skill。

**OpenSpec 如何组织**

- \`openspec/specs/\` 记录系统当下的行为。
- \`openspec/changes/<name>/\` 存放一个计划中的变更：proposal、spec 更新、design 和 tasks。
- 一个变更通常经历：探索（可选）、提案、实施、验证（可选）、归档。归档会更新 specs，并把变更移到 \`openspec/changes/archive/\`。

**当用户不确定时**

如果他问进展如何或下一步做什么，读取 \`references/where-things-stand.md\` 并按它操作。

如果他问 OpenSpec 如何工作或如何配置某项内容，读取 \`references/answers.md\` 并据此回答。

**挑选 skill**

当用户要求做事时，找到匹配的那一行，然后使用对应的 skill 并按它的步骤操作。

| 用户想要 | 使用 |
|---|---|
| 在决定构建什么之前，把一个想法或问题想清楚 | \`/opsx:explore\` |
| 描述要构建什么，并一次拿到完整计划：proposal、specs、design、tasks | \`/opsx:propose\` |
| 启动一个变更，逐个制品撰写计划 | \`/opsx:new\` |
| 撰写变更的下一个制品 | \`/opsx:continue\` |
| 一次写完所有剩余制品 | \`/opsx:ff\` |
| 修订已有变更的计划 | \`/opsx:update\` |
| 实施变更的任务 | \`/opsx:apply\` |
| 归档前把代码与变更逐项核对 | \`/opsx:verify\` |
| 从变更更新主 specs，同时保持变更开启 | \`/opsx:sync\` |
| 完成变更并归档 | \`/opsx:archive\` |
| 一次归档多个已完成的变更 | \`/opsx:bulk-archive\` |
| 在引导下完整走一遍 OpenSpec | \`/opsx:onboard\` |

- 如果一个请求可能对应多行，就点名这些选项，问用户要哪一个。
- 如果该行对应的 skill 未安装，说明情况，然后读取 \`references/without-skills.md\` 并按对应小节操作。告诉用户可以用 \`openspec-cn config profile\` 安装它，再运行 \`openspec-cn update\`。

**一次做多步**

如果请求包含多行，例如"验证这个变更，然后归档它"，就按顺序、一次一个 skill 地完成。完成一个再开始下一个。每个 skill 自己的规则仍然适用：当某个 skill 要求停下等待用户时，就停在那里并说明接下来是什么。

**如果本项目尚未使用 OpenSpec**

如果你是自己选中了这个 skill，而 \`openspec-cn list --json\` 报告 \`"root": null\`，就先放下 OpenSpec，正常回答请求。如果用户明确要求 OpenSpec，则提议用 \`openspec-cn init\` 来初始化。`,
    references: {
      'without-skills.md': WITHOUT_SKILLS,
      'answers.md': ANSWERS,
      'where-things-stand.md': WHERE_THINGS_STAND,
    },
    license: 'MIT',
    compatibility: '需要 openspec-cn CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}
