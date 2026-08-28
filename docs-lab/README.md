# docs-lab：OpenSpec 文档的并行重建

**状态：正文逐页落地中；其余页面是骨架**（真实标题加上一行 `>` 工作声明，站点会将其提取为页面描述）。线上站点从该目录树构建：`website/docs.sync.config.mjs` 将这些文件映射到已发布的页面，旧的 `docs/` 目录树已不再被站点使用。

本 README 负责结构：哪些页面存在、每个页面教授什么。反向视角——从工作或消息到负责它的页面——见 [message-map.md](message-map.md)。如何编写它们（风格、语气、格式）是 `write-openspec-docs` skill 的 [writing.md](../.agents/skills/write-openspec-docs/writing.md)。

## 每个页面的标准

docs-lab 中的每个页面都从头手工编写。旧的 `docs/` 目录树只是事实的素材来源，绝不是要照搬的文本。

我们追求的是读者能领会要点：每个页面读起来都顺畅、对任何人都说得通，无论其技能水平如何，最重要的是简单。我们能交付的最糟糕的东西，是理解起来认知成本高昂的文档；这个成本来自复杂的词汇、说不通的隐喻、未加解释的随意术语，以及妨碍阅读的格式。每个句子都有目的，且易于阅读和理解。如果一个句子经不起这个检验，就重写或删掉它。

## 结构规则

**文件夹即领域。** 每个页面都位于其领域的文件夹中（`start/`、`guides/`、`customize/`、`multi-repo/`、`reference/`、`help/`）；根目录只保留本 README、`message-map.md` 和 `sources.md`。大多数文件夹发布为一个侧边栏分组；`guides/` 发布为 Guides 分组，包含三个可折叠子分组（Understanding OpenSpec、Using OpenSpec、Adopting OpenSpec），全部默认展开（在页面起草完成前从站点拿掉：整个章节在 `website/docs.sync.config.mjs` 中被注释掉，对指南的链接在其重新列入前会回退到 GitHub 上的源）。Reference 包含三个嵌套文件夹（`reference/architecture/`、`reference/schemas/` 和 `reference/configuration/`），各自发布为一个可折叠分组，以 `index.md` 作为其落地页；spec-driven schema 作为单个页面（`reference/schemas/spec-driven/index.md`）发布在 Schemas 分组内。标签和 URL 来自 `website/docs.sync.config.mjs`，因此移动文件永远不会移动 URL。

**只教一次。** 这个循环（propose、review、apply、archive）只有一个老师；其他每个页面都链接过去，从不重新讲解：

- `start/quickstart.md` 把它作为 UX 来教：人如何让变更走完整个生命周期，包括 archive 在磁盘上做什么。
- `start/overview.md` 把它作为宣传来展示：只复制，不解释。
- `guides/concepts.md` 不碰它：该页解释制品（specs、changes、delta），并把循环链接到 quickstart。磁盘路径与拥有它们的概念一起行内出现，绝不做成版式章节。
- `start/installation.md` 负责安装；`start/setup.md` 负责 init 及其写入的内容。Quickstart 开头有一行前置条件，链接到两者，并从 explore 开始。

**指南 vs 参考。** `reference/skills.md` 持有每个 skill 的契约：参数、它创建什么、它回复什么。指南页面（Using 和 Adopting 子分组）负责一项任务所需的人类判断，包括何时该用哪个 skill，可能跨越多个 skill，并且绝不重述 skill 机制。`reference/architecture/` 是 Reference 的查表标准的唯一例外：它是解释性内容，在只有三页的当下作为务实的落脚点放在这里。如果它长大（比如吸收贡献者内部细节），考虑给它一个自己的文件夹和标签页。

**Reference 是查表，并且为此命名。** `reference/schemas/` 和 `reference/configuration/` 是契约：键、值、类型、默认值和位置，放在表格和代码围栏中。任何解释性的东西（schema 是什么、config.yaml 里放什么）都放在 Customize 或 Guides 中，并链接过去，绝不重述。命名遵循三条规则。参考文件夹的落地页标题为"Overview"；文件夹标签已经命名了分组，重复它会双层嵌套侧边栏。记录一个文件的页面在标题中同时带概念和文件名，概念在前，其中概念命名该文件的用途，而不仅仅是它的范围（"Project configuration (config.yaml)"、"CLI settings (config.json)"）：左边缘是眼睛在侧边栏中区分的东西，而文件名让标题匹配读者搜索并在磁盘上看到的名称。一个文件名本身就是读者所用术语的文件，保持单独用文件名作标题（`schema.yaml`）；一个页面拥有一个产品术语的，就用该术语作标题（`spec-driven`）；一个页面覆盖多个文件的，只取概念作标题（Stores），并在工作声明行中列出其文件。

**FAQ 是一行式回答。** 每条 FAQ 条目都是一个简短回答，最多几行，或者是一个指向拥有该主题页面的路由链接。How-to 内容绝不住在 FAQ 中：当一个回答超出单行时，它移到一个指南或参考页面，FAQ 条目变成一个指针。

## 页面索引：每个页面的职责

下面的每个目标都是该页面 `>` 块引用的原文，所以这里的承诺就是读者看到的承诺。一个页面只交付其目标：内容超出目标意味着拆分页面或同时重写两处的目标，绝不让它们漂移。

### Start：从"这是什么？"到你的第一个已归档变更

| 页面 | 目标 |
|---|---|
| [Overview](start/overview.md) | _TODO：2026-08-21 为从头重写清空，并从站点撤下（`/docs` 暂时重定向到 Installation）；旧的目标行因作为宣传太弱而被删除。简报见 Notes.md。_ |
| [Installation](start/installation.md) | 在机器上安装 `openspec` CLI、更新它、卸载它。 |
| [Set up your project](start/setup.md) | 将 OpenSpec 添加到项目中：运行 init，查看它写了什么，并调整它。 |
| [Quickstart](start/quickstart.md) | 在你现有仓库上的第一个变更，从想法到归档。 |

### Guides：理解系统、用好它、把它带到你的代码库和团队

| 页面 | 目标 |
|---|---|
| [Understanding › Concepts](guides/concepts.md) | 这两种制品是什么，以及一个 change 如何描述相对当前 specs 的差异。 |
| [Using › Explore an idea](guides/explore.md) | 在承诺一个 proposal 之前与 agent 一起想清楚。 |
| [Using › Review the plan](guides/review-the-plan.md) | 在错误变成代码之前抓住它们的两分钟检查。 |
| [Using › Apply a change](guides/apply.md) | 运行计划：节奏、上下文窗口，以及从中断处继续。 |
| [Using › Change course](guides/change-course.md) | 修订进行中的变更，或决定从零开始更干净。 |
| [Adopting › Existing codebases](guides/existing-codebases.md) | 把 OpenSpec 带到代码很多但没有 specs 的代码库：从哪里开始、补什么，以及 specs 如何由此生长。 |
| [Adopting › Teams](guides/teams.md) | 以团队方式运行 OpenSpec：提交什么、变更如何随 PR 走、何时归档。 |

### Customize：让工作流适配你的项目

| 页面 | 目标 |
|---|---|
| [Overview](customize/overview.md) | 自定义 OpenSpec 的选项。 |
| [Profiles](customize/profiles.md) | 选择安装哪些工作流，以及它们是安装为 skills、commands 还是两者。 |
| [Project configuration](customize/project-config.md) | 用 config.yaml 中的几行配置让工作流按你想要的方式规划变更。 |
| [Schemas](customize/schemas.md) | 改变 OpenSpec 产出的内容：制品、它们的顺序，以及它们的模板。 |

### Multi-repo（beta）：跨仓库边界规划

| 页面 | 目标 |
|---|---|
| [Stores (beta)](multi-repo/stores.md) | 规划跨仓库的变更：一个 store，多个仓库。 |
| [Worksets (beta)](multi-repo/worksets.md) | 在一个编辑器窗口中同时打开 store 和使用它的仓库，让 agent 能同时看到两者。 |

### Reference：精确而完整地查表

| 页面 | 目标 |
|---|---|
| [Skills](reference/skills.md) | 每个 OpenSpec skill：参数、它创建什么、它回复什么。 |
| [CLI](reference/cli.md) | `openspec` 终端命令。 |
| [Schemas](reference/schemas/index.md) | 每个可用的工作流 schema 及其定义的制品。 |
| [Schemas › schema.yaml](reference/schemas/schema-yaml.md) | schema 定义的每个字段，用于读取或编写一个。 |
| [Schemas › spec-driven](reference/schemas/spec-driven/index.md) | 默认工作流的制品：它们的顺序、格式，以及它们产出的变更文件夹。 |
| [Configuration](reference/configuration/index.md) | 改变 OpenSpec 行为的每个文件和设置，以及各自的位置。 |
| [Configuration › Project configuration (config.yaml)](reference/configuration/config-yaml.md) | openspec/config.yaml 的每个字段：此项目据以规划的 schema、context 和 rules。 |
| [Configuration › Change metadata (.openspec.yaml)](reference/configuration/change-metadata.md) | 每个变更所存元数据的受支持字段与校验规则。 |
| [Configuration › CLI settings (config.json)](reference/configuration/config-json.md) | config.json 的每个字段：openspec CLI 在你机器上的行为。 |
| [Configuration › Environment variables](reference/configuration/environment-variables.md) | OpenSpec 读取的每个环境变量。 |
| [Configuration › Stores](reference/configuration/stores.md) | multi-repo store 背后的文件：registry.yaml 和 store.yaml，以及命令使用哪个根目录。 |
| [Supported tools](reference/supported-tools.md) | OpenSpec 支持哪些 AI 编程工具，以及各自命令的语法。 |
| [Glossary](reference/glossary.md) | 每个 OpenSpec 术语，各一行。 |
| [Architecture](reference/architecture/index.md)（起草完成前从站点撤下） | OPSX 是如何构建的：给好奇者的内部细节。 |
| [Architecture › Workflow runs](reference/architecture/workflow-runs.md) | 一次工作流运行如何执行，从调用到写出的制品。 |
| [Architecture › Design decisions](reference/architecture/design-decisions.md) | OPSX 为什么以这种方式工作。 |

### Help：脱困（起草完成前从站点撤下，见 Open TODOs）

| 页面 | 目标 |
|---|---|
| [FAQ](help/faq.md) | 对不需要一个页面的问题给出简短回答。 |
| [Troubleshooting](help/troubleshooting.md) | 当 OpenSpec 没有按你预期工作时：症状及其修复。 |

### Legacy：安全落地旧工作流（起草完成前从站点撤下，见 Open TODOs）

| 页面 | 目标 |
|---|---|
| [Migrating from the legacy workflow](help/legacy/migration.md) | 从遗留的 `/openspec:*` 命令迁移到 OPSX。 |

## 旧文档

`docs/` 目录树是遗留的，计划是在 docs-lab 覆盖它所负责的内容后移除它。它已经有点变成 AI 垃圾场，所以不会把其中的任何文本带过来（见"每个页面的标准"）。在移除之前它保持不动：修复落在 docs-lab，绝不落在 `docs/`。

[`sources.md`](sources.md) 将当前每个 `docs/` 页面映射到这里的去处：起草时的素材来源、切换时的重定向清单。切换步骤在该文件的 [Cutover](sources.md#cutover) 章节中。

## Open TODOs

- 未开始：Architecture 页面（`reference/architecture/index.md`、`workflow-runs.md`、`design-decisions.md`）。三个都只有标题，所以我们在 2026-08-21 把该分组从站点隐藏（文件夹条目在 `website/docs.sync.config.mjs` 中被注释掉）。这些文件保留在磁盘上，带 WIP 注释。链接到它们的已发布页面（`reference/glossary.md` 到 Overview，`customize/project-config.md` 到 Workflow runs）在分组重新列入前回退到 GitHub 源。
- 未开始：Help 和 Legacy 页面（`help/faq.md`、`help/troubleshooting.md`、`help/legacy/migration.md`）。FAQ 有一个回答，另外两个只有标题，所以我们在 2026-08-21 把两个章节都从站点隐藏（在 `website/docs.sync.config.mjs` 中注释掉，机制与 Guides 相同）。这些文件保留在磁盘上，带 WIP 注释。链接到它们的已发布页面（`start/setup.md` 到 FAQ，`reference/glossary.md` 到 Migration）在章节重新列入前回退到 GitHub 源。
- 未开始：`start/overview.md` 是故意为空的。我们在 2026-08-21 清除了骨架（标题、叙事节奏、图示画廊），以便从头重写落地页。旧宣传（"写代码之前有一个共享的、可评审的计划"）在 plan mode 无处不在的当下低估了 OpenSpec；重写应推销让较大功能保持在轨道上并保持一致（团队、原生 git、预期 vs 已实现行为、控制循环框架）。简报在 `Notes.md`（"Start > Overview"）；图示候选随画廊一起走，活在 git 历史中。在重写落地前该页从站点下架：其条目在 `website/docs.sync.config.mjs` 中被注释掉，`/docs` 重定向到 Installation（`website/public/_redirects` 加文档页面路由中的一个回退）。恢复它只需取消一处注释并移除两个重定向。"只教一次"规则仍然适用：这里循环只作为宣传出现。
- 产品反馈，不是文档任务：spec-driven 的 design `instruction` 列出六个章节（包括 Migration Plan 和 Open Questions），但 `schemas/spec-driven/templates/design.md` 只带四个标题。文档两者都原样展示；这个不一致属于上游。2026-08-14 在整合 spec-driven 页面时记录。
- 产品反馈，不是文档任务：`openspec store setup --remote` 将 URL 写入 `store.yaml`，但从不配置 git `origin`，因此"setup --remote，然后 `git push -u origin main`"照字面执行会失败；Stores 页面改为展示 `git remote add`。`openspec doctor` 中可粘贴的 missing-store 修复由 `references:` remotes 驱动，而非 `store.yaml`。2026-08-21 移植 Stores 页面时记录。
- 风格指南后续（`.agents/skills/write-openspec-docs/writing.md`），来自 Stores 页面的评审轮次，2026-08-21：绝不用页面尚未展示过的术语（说"`store:` 行"，不要说"指针"；先通过展示制品来定义）；当行为取决于读者的起始状态时，枚举这些状态并逐个走到其结果；句子主语是你、OpenSpec 或你的 agent，绝不是实现单元（"resolver 挑选"）或一类事物（"仅 store 的项目会…"）；当一个已定义术语在几节之后被复用，在使用点用一个括号重新释义。
- 围栏约定后续，2026-08-21：Stores 页面将命令放在 `bash` 围栏中并带一行 `#` 注释，OpenSpec 输出放在单独的 `yaml` 围栏中。`customize/schemas.md` 仍使用带 `$` 提示符的 `console` 围栏（第 78、114、137、145 行；提示符在第 24、115 行）；风格指南应命名该约定，且该页面应采用它。
- Monorepo：message-map 第 37 行仍是一个 Gap。"被视为独立仓库的包"日后可能落到 Stores 页面上；不是当前页面的范围。
- `reference/cli.md` 已完整起草：命令表加上每个真实命令一个章节，事实来自工作树运行（2026-08-11）。start/setup.md 的"Skills, commands, or both"章节所设置的 `delivery` 键在那里只作为命令输出出现；它的字段级归宿 `reference/configuration/config-json.md` 已起草（2026-08-14）。
- 遥测未记录。`OPENSPEC_TELEMETRY=0` 在目录树中无处出现；Deno 安装命令授予 `--allow-net=edge.openspec.dev` 且无解释（遥测释义在等待一个真正归宿时被刻意抽离）。归宿现在已存在：编写 `reference/configuration/environment-variables.md`（环境变量、收集什么、退出方式、CI 自动禁用），然后让 Deno 章节链接到它以解释该标志。2026-08-07 记录；归宿 2026-08-10 确定。
- 产品反馈，不是文档任务：init 不说全局 profile 何时改变了它所写的内容。一台 `profile: custom` 的机器与一台标配机器静默安装不同的工作流集合，而 init 输出中没有任何内容指名塑造它的 profile。2026-08-05 验证 installation.md 时记录；追踪上游，别在行文中粉饰。
- 产品反馈，不是文档任务：把 sync-specs skill 从默认集合中去掉；它的职责读起来像参考内容而不是工作流，还撑大了每个读者都会扫视的 skill 列表。2026-08-08 写 start/setup.md 的工作流树时记录。
- 产品反馈，不是文档任务：让共享的 `.agents/` 文件夹成为每种工具的默认安装目标，工具专用文件夹（`.claude/`、…）为例外。文档已在示例中偏好 `.agents/`；产品应与之匹配。2026-08-08 记录。
- `help/troubleshooting.md` 的骨架没有安装期失败（`command not found`、错误的 Node 版本、PATH）的章节。旧 `docs/troubleshooting.md` 覆盖了它们；`start/installation.md` 行内携带注意事项，但没有症状到修复的归宿。添加一个章节或一个 installation.md 锚点。2026-08-10 在旧文档消息审计期间记录。
- 缺失的指南：迭代流程。new/continue/fast-forward 没有负责判断的归属：这个流程是什么、何时选它而不是 propose、ff 与 continue 的区别。旧 `docs/workflows.md` 覆盖了它（Two Modes、When to Use What）；`sources.md` 将该页的机制路由到 `guides/apply.md`、契约路由到 `reference/skills.md`，因此选择本身落到无处。可能是在 Explore 与 Review the plan 之间插入一个 Guides › Using 页面，带一个指向 `customize/profiles.md` 的指针（这些 skill 是核心集合之外的可选工作流）。只保留 ff-vs-continue 的规则速记；workflows.md 的其余内容未经验证。2026-08-11 记录。相关：message-map 第 29 行把 apply.md 的节奏问题措辞为起草期节奏，同样是创建阶段的选择；此指南落地时修正该行的措辞或归属。2026-08-14 记录。
- 缺失的指南：与 git 协作。OpenSpec 从不触碰 git，因此每个 git 决定都落到读者头上而没有页面回答：你在 propose 之前还是之后建分支，一个 task 是否该有自己的提交，PR 里放什么，archive 提交落在哪里。`guides/teams.md` 负责归档与 PR 的先后顺序；其余没有归属。可能是 Adoption 分组中的一个 `guides/` 文件。2026-08-08 记录。
- `customize/skills.md` 停放：骨架留在磁盘上，但不在页面索引、侧边栏和同步配置中。编辑已安装的 skill 提示词还没有好的答案（`openspec update` 覆盖编辑）；消息映射将该问题保留为 Gap。当产品对更新后存留有真实方案时复活。2026-08-14 停放。
- `guides/examples.md` 停放：骨架留在磁盘上，但不在页面索引、侧边栏和同步配置中。刻意构造的示例对这个产品教错了课；当真实使用中的真实归档变更能填充它时复活该页。内容计划（弱 vs 已评审配对、归档变更画廊）在文件的注释中。2026-08-11 停放。
- 产品反馈，不是文档任务："expanded"残留在产品字符串中，且更新工作流在选择器中未加标签。唯一存储的 profile 值是 core 和 custom，但 `src/core/templates/workflows/update-change.ts` 说"expanded-profile workflow"，且 `WORKFLOW_PROMPT_META`（`src/commands/config.ts`）没有 `update` 条目，因此 `openspec config` 工作流选择器将 core 工作流渲染为裸 `update` / "Workflow: update"。文档统一为 core/custom，并把"expand the set"用作动词（2026-08-12）。2026-08-12 在术语表产品清扫期间记录。
- 产品反馈，不是文档任务：尽快收敛到仅 skills。一个工作流的 skill 和 command 是同一份指令，Claude Code 已经在上游把 commands 合并进 skills，setup 花了一整节解释两种形式为何存在。当 commands 消失时，每个页面都会更简单。2026-08-08 写 start/setup.md 时记录。
- 网站 QOL 积压，是站点构建而非行文：i18n；在库存关键词搜索之上叠加 AI 搜索（一个 ask-the-docs 问答框，而不只是匹配）；将 Survey 调色板（DESIGN.md tokens）带入两种模式的像样的明/暗主题，而不是库存暗色主题。可在同一轮打包的候选：`llms.txt` 加上每页"copy as Markdown"按钮，让 agent 能摄取页面、代码块上的复制按钮，以及"在 GitHub 上编辑此页面"链接。2026-08-11 记录。
