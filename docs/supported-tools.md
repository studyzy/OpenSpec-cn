# 支持的工具

OpenSpec 可配合许多 AI 编程助手使用。当你运行 `openspec-cn init` 时,OpenSpec 会使用你的活跃 profile/工作流选择以及交付模式来配置所选工具。

## 工作原理

对每个选中的工具,OpenSpec 可安装:

1. **Skills**(若交付方式包含 skills):`.../skills/openspec-*/SKILL.md`
2. **Commands**(若交付方式包含 commands):各工具特定的 `opsx-*` 命令文件

Codex 仅支持 skills：即使交付方式设为 `commands`，OpenSpec 也会为 Codex 安装 `.agents/skills/openspec-*/SKILL.md`，并且不会生成 Codex 的自定义提示词文件。位于旧版 `.codex/skills` 路径下、由 OpenSpec 管理的既有 skills，会在其替代文件写入后被协调处理；自定义文件和有差异的文件会被保留。

默认情况下，OpenSpec 使用 `core` profile，它包含：
- `propose`
- `explore`
- `apply`
- `update`
- `sync`
- `archive`

你可以通过 `openspec-cn config profile` 启用扩展工作流(`new`、`continue`、`ff`、`verify`、`bulk-archive`、`onboard`),然后运行 `openspec-cn update`。

<a id="how-to-invoke"></a>

## 如何调用

本文档统一使用 `/opsx:propose` 作为标准名称，但每个工具会按它加载 OpenSpec 所写文件的方式来拼写它。请在下方的[工具目录参考](#tool-directory-reference)中找到你的工具的命令路径，然后在这里对应上它的形态。

| OpenSpec 写入的命令文件 | 你要输入 | 工具 |
|------------------------------|----------|-------|
| `.../commands/opsx/<id>.*` —— `opsx/` 文件夹为其提供了命名空间 | `/opsx:<id>` | Claude Code、CodeBuddy、Crush、Gemini CLI、Lingma、Qoder、ZCode |
| `.../opsx-<id>.*` —— 文件名即命令名 | `/opsx-<id>` | 其余所有会生成命令文件的工具，Amazon Q 和 Devin 除外 |
| `.devin/workflows/opsx-<id>.md` —— Devin 的两个 Agent 中只有一个会读取它 | 在 Devin Desktop 上是 `/opsx-<id>`，在 Devin Local 上是 `/openspec-<skill>` | Devin Desktop\*\*\*\* |
| `.amazonq/prompts/opsx-<id>.md` —— 这是提示词，不是命令 | `@opsx-<id>` | Amazon Q Developer |
| 无 —— 仅 skills | `/openspec-<skill>` | CodeArts、ForgeCode、Hermes、MiniMax Code、Mistral Vibe、Zed Agent、共享 `.agents` |
| 无 —— Kimi Code | `/skill:openspec-<skill>` | Kimi Code |
| 无 —— Codex CLI | `$openspec-<skill>` | Codex（[`/openspec-<skill>` 不被识别](https://github.com/openai/codex/issues/11817)） |

因此 `/opsx:propose` 在 Cursor 里是 `/opsx-propose`，在 Amazon Q 里是 `@opsx-propose`，在 Codex 里是 `$openspec-propose`。

有两个因素各自独立变化，这就是这些行无法合并的原因：

- **名称。** 第 1–2 行的差别仅在于文件如何为命令命名，而对每个会生成命令文件的工具来说，`opsx-<id>` / `opsx:<id>` 这个词干都是相同的。
- **外壳。** Amazon Q 把它的文件加载进一个用 `@` 调用的提示词库。仅支持 skills 的工具根本不生成命令文件，因此最后三行用的是 *skill* 名称 —— 列在[生成的 Skill 名称](#generated-skill-names)之下 —— 它们与命令 id 并非一一对应（`/opsx:apply` 对应的是 `openspec-apply-change` skill）。

上面的命令路径模式刻意不带扩展名（写成 `.*`）：扩展名由工具自己决定（Gemini CLI 用 `.toml`，Continue 用 `.prompt`，Kiro 和 GitHub Copilot 用 `.prompt.md`），而且少数工具会在选择器里连扩展名一起显示。请对照目录形态，而不是扩展名。

OpenSpec 生成的文件，以及设置完成后打印的 "Getting started" 提示，已经为你所选的工具采用了正确的形式 —— 所以最快的答案就是去读那条提示。

<a id="tool-directory-reference"></a>

## 工具目录参考

| 工具 (ID) | Skills 路径模式 | Command 路径模式 |
|-----------|---------------------|----------------------|
| Amazon Q Developer (`amazon-q`) | `.amazonq/skills/openspec-*/SKILL.md` | `.amazonq/prompts/opsx-<id>.md` |
| Antigravity (`antigravity`) | `.agent/skills/openspec-*/SKILL.md` | `.agent/workflows/opsx-<id>.md` |
| Auggie (`auggie`) | `.augment/skills/openspec-*/SKILL.md` | `.augment/commands/opsx-<id>.md` |
| IBM Bob Shell (`bob`) | `.bob/skills/openspec-*/SKILL.md` | `.bob/commands/opsx-<id>.md` |
| Claude Code (`claude`) | `.claude/skills/openspec-*/SKILL.md` | `.claude/commands/opsx/<id>.md` |
| Cline (`cline`) | `.cline/skills/openspec-*/SKILL.md` | `.clinerules/workflows/opsx-<id>.md` |
| Command Code (`command-code`) | `.commandcode/skills/openspec-*/SKILL.md` | `.commandcode/commands/opsx-<id>.md` |
| CodeArts (`codeartsagent`) | `.codeartsdoer/skills/openspec-*/SKILL.md` | 不生成（无命令适配器；使用基于 skill 的 `/openspec-*` 调用） |
| CodeBuddy (`codebuddy`) | `.codebuddy/skills/openspec-*/SKILL.md` | `.codebuddy/commands/opsx/<id>.md` |
| Codex (`codex`) | `.agents/skills/openspec-*/SKILL.md` | 不生成（仅 skills；使用 `$openspec-*`） |
| Devin Desktop, formerly Windsurf (`devin`) | `.devin/skills/openspec-*/SKILL.md` | `.devin/workflows/opsx-<id>.md`\*\*\*\* |
| ForgeCode (`forgecode`) | `.forge/skills/openspec-*/SKILL.md` | 不生成(无命令适配器;使用基于 skill 的 `/openspec-*` 调用) |
| Continue (`continue`) | `.continue/skills/openspec-*/SKILL.md` | `.continue/prompts/opsx-<id>.prompt` |
| CoStrict (`costrict`) | `.cospec/skills/openspec-*/SKILL.md` | `.cospec/openspec/commands/opsx-<id>.md` |
| Crush (`crush`) | `.crush/skills/openspec-*/SKILL.md` | `.crush/commands/opsx-<id>.md` |
| Cursor (`cursor`) | `.cursor/skills/openspec-*/SKILL.md` | `.cursor/commands/opsx-<id>.md` |
| Factory Droid (`factory`) | `.factory/skills/openspec-*/SKILL.md` | `.factory/commands/opsx-<id>.md` |
| Gemini CLI (`gemini`) | `.gemini/skills/openspec-*/SKILL.md` | `.gemini/commands/opsx/<id>.toml` |
| GitHub Copilot (`github-copilot`) | `.github/skills/openspec-*/SKILL.md` | `.github/prompts/opsx-<id>.prompt.md`\*\* |
| Hermes Agent (`hermes`) | `.hermes/skills/openspec-*/SKILL.md`\*\*\* | 不生成（无命令适配器；使用基于 skill 的 `/openspec-*` 调用） |
| iFlow (`iflow`) | `.iflow/skills/openspec-*/SKILL.md` | `.iflow/commands/opsx-<id>.md` |
| Junie (`junie`) | `.junie/skills/openspec-*/SKILL.md` | `.junie/commands/opsx-<id>.md` |
| Kilo Code (`kilocode`) | `.kilocode/skills/openspec-*/SKILL.md` | `.kilocode/workflows/opsx-<id>.md` |
| Kimi Code (`kimi`) | `.kimi-code/skills/openspec-*/SKILL.md` | 不生成(无命令适配器;使用基于 skill 的 `/skill:openspec-*` 调用) |
| Kiro (`kiro`) | `.kiro/skills/openspec-*/SKILL.md` | `.kiro/prompts/opsx-<id>.prompt.md` |
| Lingma (`lingma`) | `.lingma/skills/openspec-*/SKILL.md` | `.lingma/commands/opsx-<id>.md` |
| MiniMax Code (`minimax-code`) | `~/.minimax/skills/openspec-*/SKILL.md` | 不生成（无命令适配器；使用 MiniMax Code 的 skills） |
| Mistral Vibe (`vibe`) | `.vibe/skills/openspec-*/SKILL.md` | 不生成(无命令适配器;使用基于 skill 的 `/openspec-*` 调用) |
| Oh My Pi (`oh-my-pi`) | `.omp/skills/openspec-*/SKILL.md` | `.omp/commands/opsx-<id>.md` |
| OpenCode (`opencode`) | `.opencode/skills/openspec-*/SKILL.md` | `.opencode/commands/opsx-<id>.md` |
| Pi (`pi`) | `.pi/skills/openspec-*/SKILL.md` | `.pi/prompts/opsx-<id>.md` |
| SourceCraft Code Assistant for VS Code (`codeassistant`) | `.codeassistant/skills/openspec-*/SKILL.md` | `.codeassistant/commands/opsx-<id>.md` |
| Qoder (`qoder`) | `.qoder/skills/openspec-*/SKILL.md` | `.qoder/commands/opsx/<id>.md` |
| Qwen Code (`qwen`) | `.qwen/skills/openspec-*/SKILL.md` | `.qwen/commands/opsx-<id>.md` |
| [Rovo Dev CLI](https://support.atlassian.com/rovo/docs/use-rovo-dev-cli/) (`rovodev`) | `.rovodev/skills/openspec-*/SKILL.md` | 不生成。Rovo 没有斜杠命令入口 —— 它会自动匹配 skills，或通过提示词匹配（例如"使用 openspec-propose skill"）；`/skills` 只用于管理它们。生成的内容按名称引用 skills，绝不会写成 `/openspec-*` 命令。 |
| [Zoo Code](https://github.com/Zoo-Code-Org/Zoo-Code) (`roocode`) | `.roo/skills/openspec-*/SKILL.md` | `.roo/commands/opsx-<id>.md` |
| Trae (`trae`) | `.trae/skills/openspec-*/SKILL.md` | `.trae/commands/opsx-<id>.md` |
| [Zed Agent](https://zed.dev/docs/ai/skills) (`zed`) | `.agents/skills/openspec-*/SKILL.md` | 不生成（仅 skills；使用 `/openspec-*` 或 `@openspec-*`） |
| ZCode (`zcode`) | `.zcode/skills/openspec-*/SKILL.md` | `.zcode/commands/opsx/<id>.md` |
| 共享 `.agents` skills (`agents`) | `.agents/skills/openspec-*/SKILL.md` | 不生成（无命令适配器；使用基于 skill 的 `/openspec-*` 调用） |

\*\* GitHub Copilot 的提示词文件在 IDE 扩展（VS Code、JetBrains、Visual Studio）中会被识别为自定义斜杠命令。Copilot CLI 目前不会直接消费 `.github/prompts/*.prompt.md`。选择 `github-copilot` 还可以配置 GitHub 托管的**云端编程 Agent** —— 参见下文的 [GitHub Copilot 云端编程 Agent](#github-copilot-cloud-coding-agent)。

\*\*\* Hermes 默认从 `~/.hermes/skills/` 加载 skills。若要使用项目本地的 OpenSpec skills，请把项目的 `.hermes/skills/` 目录加入 `~/.hermes/config.yaml` 中的 `skills.external_dirs`；此后 Hermes 会以面向用户的斜杠调用形式暴露这些 skills，例如 `/openspec-propose`。

\*\*\*\* Windsurf 已于 2026 年 6 月 2 日[更名为 Devin Desktop](https://docs.devin.ai/desktop/devin-desktop-faq)，其配置目录也随之迁移：`.devin/` 是首选的读写位置，`.windsurf/` 则是仅可读的旧版回退位置。OpenSpec 跟进了这次更名 —— 工具 id 为 `devin`，而 `--tools windsurf` 仍会解析到它，以便既有的配置脚本继续可用。如果某个项目的 OpenSpec 文件仍留在 `.windsurf/` 中，下一次 `openspec-cn update` 时会提示你迁移；拒绝则原样保留，而你自己写的文件永远不会被触碰。工作流按文件名调用，因此 `.devin/workflows/opsx-apply.md` 对应 `/opsx-apply`。[Devin Local Agent 不支持工作流](https://docs.devin.ai/desktop/devin-local) —— 它只支持 skills，且完全不读取 `.windsurf/` —— 因此每当 OpenSpec 写入 Devin skills 时，都会让它们的正文以及 getting-started 提示保持使用 `/openspec-*` 这种 skill 调用形式，这在两个 Agent 上都能用。在仅 commands 的交付模式下不会写入任何 skills，两者都回退到 `/opsx-*`。

SourceCraft Code Assistant 支持面向其 VS Code 扩展。它的[自定义命令](https://sourcecraft.dev/portal/docs/en/code-assistant/operations/agent/slash-commands)和[技能](https://sourcecraft.dev/portal/docs/ru/code-assistant/operations/agent/skills)仅在 VS Code 中可用。此集成不会配置 SourceCraft 网页版或 JetBrains。

在仅 skills 的交付模式下，请让 Code Assistant 使用 `openspec-propose` skill 并附上你的想法。skills 通过请求匹配激活；OpenSpec 不会为此工具生成 `/openspec-*` 命令。

MiniMax Code 是一个全局的、仅支持 skills 的集成。OpenSpec 只会在
`~/.minimax/skills/` 下写入它的 `openspec-*` 目录；它不会创建仓库本地的
`.minimax` 或 `.mavis` 目录。仅 commands 的交付模式不会改动已有的全局 MiniMax
Code skills，这样一个项目的交付设置就不会移除另一个项目正在使用的 skills。

<a id="github-copilot-cloud-coding-agent"></a>

### GitHub Copilot 云端编程 Agent

GitHub 的 [Copilot coding agent](https://docs.github.com/en/copilot/using-github-copilot/coding-agent) 运行在 GitHub 的 GitHub Actions 环境中 —— 与你编辑器中的 Copilot 是相互独立的。OpenSpec 可以通过生成两个文件把它配置为使用 OpenSpec CLI：

- `.github/workflows/copilot-setup-steps.yml` —— 在该 Agent 的环境中安装 `@studyzy/openspec-cn`
- `.github/agents/openspec.agent.md` —— 告诉该 Agent 如何驱动 OpenSpec

由于这会往你的仓库里写入一个 GitHub Actions 工作流，因此它是**需要主动选择启用的**：

| 方式 | 行为 |
|-----|----------|
| `openspec-cn init`（交互式） | 询问是否配置云端文件。默认是**否**。 |
| `openspec-cn init --copilot-cloud` | 不询问直接配置（适用于脚本/CI）。 |
| `openspec-cn init --no-copilot-cloud` | 不询问直接跳过，并移除此前已生成的文件。 |
| `openspec-cn update` | 从不询问。仅当你已选择启用（或项目中已有这些文件）时才刷新它们。若你选择了不启用，它会移除由 OpenSpec 管理的云端文件。 |

你的选择会以 `githubCopilot.cloudAgent: true|false` 的形式保存在 `openspec/config.yaml` 中，因此非交互式的更新也会遵循它。OpenSpec 只会写入或移除内容由它自己生成的文件 —— 如果你自定义了 `copilot-setup-steps.yml` 或 `openspec.agent.md`，或者你本来就有自己的版本，它们会被原样保留（并且 `init`/`update` 会告知你这一点）。

### 何时选择共享 `.agents` 目标

`agents` 是与厂商无关的选项：它把 skills 写入 `.agents/skills/` —— 许多 Agent 工具都会读取的共享根目录 —— 而不是某个工具专属的目录。

| 场景 | 选择 |
|-----------|------|
| 你的工具在上表中有自己的一行 | 用它自己的 ID —— 你会获得该工具的集成，包括在它支持的情况下提供斜杠命令 |
| 同一个仓库上有多个 Agent，且都读取 `.agents/skills` | `agents` —— 只需一棵 skill 树，而不是每个工具一棵 |
| 你的工具尚未被列出，但它会读取 `.agents/skills` | `agents` |

把它和某个工具专属 ID 一起选中是没问题的；通常各自会写入自己的根目录。Codex 和 Zed Agent 是个例外，因为它们使用的正是同一个规范的 `.agents` 根目录。如果 `codex` 与 `zed` 或 `agents` 一起被选中，OpenSpec 会只保留一棵以 Codex 为主导的树。它的交接说明中会同时给出面向 Codex 的 `$openspec-*` 和面向其他 Agent 的 `/openspec-*`，因此 `--tools all` 以及既有的多 Agent 配置都能继续工作，而不会出现两个写入方覆盖同一批文件的情况。
一旦项目中存在 `.agents/skills/` 目录，OpenSpec 也会自动提供该选项 —— 仅有一个空的 `.agents/` 是不够的，因为工具也会把那个根目录用于规则和子 Agent 定义。请注意 `.agents` 不是 `.agent`：单数形式的目录属于 Antigravity。

有两点需要了解：

- **仅 skills。** 不存在命令适配器，因此不会写入任何 `opsx-*` 命令文件；在包含 commands 的交付模式下，`openspec-cn init` 会把 `agents` 列在它以 `Commands skipped for: … (no adapter)` 报告的工具之中。
  请按 skill 名称调用这些工作流 —— 大多数读取 `.agents/skills` 的助手把它写作 `/openspec-propose`，这也是 OpenSpec 设置提示所打印的形式。该目标与厂商无关，因此如果你的助手使用别的形式，请查阅它自己的文档。
- **不会创建或修改任何 `AGENTS.md`。** 目标是 `.agents/` 目录。
  如果你根目录的 `AGENTS.md` 中仍带有旧版本留下的 OpenSpec 标记块，`openspec-cn update` 会将其清除 —— 参见[迁移指南](migration-guide.md)。

这里的 Zed 支持针对的是内置的 Zed Agent。Zed External Agents 和 Terminal Threads 使用各自的集成。Agent Skills 需要 [Zed v1.4.2](https://github.com/zed-industries/zed/releases/tag/v1.4.2) 或更高版本。在你[授予信任](https://zed.dev/docs/worktree-trust)之前，项目级 skills 在不受信任的 worktree 中不可用。

由于 `.agents/skills/` 由 Codex、Zed Agent 和厂商无关目标共享，有必要了解 OpenSpec 在其中主张归属的内容：它只会为你所选的工作流写入、刷新和移除 `openspec-*` skill 目录，外加一个 `.openspec-target` 标记文件，用于记录那棵共享树是由 Codex、Zed Agent 还是厂商无关目标渲染的。该目录中的其他任何内容都不会被动。请把 `openspec-*` 这些名称和该标记视为 OpenSpec 所有 —— 对它们内部的修改会在下一次 `openspec-cn update` 时被替换掉，这一点与其他所有工具一致。

对于早于该标记机制的项目，OpenSpec 会从受管 skill 的引用形式推断归属：`$openspec-*` 表示 Codex，`/openspec-*` 表示厂商无关目标。若一棵通用的规范树与旧版 `.codex/skills` 并存，则会被视为更早的双目标安装，并被合并到兼容的共享树中。

`openspec-cn update` 同样遵循这一归属。如果项目把 `.agents` 作为厂商无关目标，且仅从零散的 prompt 文件中检测到遗留的 Codex 安装，update 会保留既有的 `agents` 树而非用 Codex 语法重写它，并保留那些遗留 prompt 文件而不是删除。若想把这棵共享树交给 Codex，请显式运行 `openspec-cn init --tools codex`。

## 非交互式安装

对于 CI/CD 或脚本化安装,使用 `--tools`(以及可选的 `--profile`):

```bash
# 配置指定工具
openspec-cn init --tools claude,cursor

# 配置所有支持的工具
openspec-cn init --tools all

# 跳过工具配置
openspec-cn init --tools none

# 本次 init 运行覆盖 profile
openspec-cn init --profile core
```

**可用工具 ID(`--tools`)** —— `windsurf` 也可接受，作为 `devin` 的别名：`amazon-q`, `antigravity`, `auggie`, `bob`, `claude`, `cline`, `command-code`, `codeartsagent`, `codex`, `devin`, `forgecode`, `codebuddy`, `continue`, `costrict`, `crush`, `cursor`, `factory`, `gemini`, `github-copilot`, `hermes`, `iflow`, `junie`, `kilocode`, `kimi`, `kiro`, `lingma`, `minimax-code`, `vibe`, `oh-my-pi`, `opencode`, `pi`, `codeassistant`, `qoder`, `qwen`, `rovodev`, `roocode`, `trae`, `zed`, `zcode`, `agents`

## 依赖工作流的安装

OpenSpec 根据所选工作流安装工作流制品:

- **Core profile(默认):** `propose`、`explore`、`apply`、`update`、`sync`、`archive`
- **自定义选择:** 所有工作流 ID 的任意子集:
  `propose`、`explore`、`new`、`continue`、`apply`、`update`、`ff`、`sync`、`archive`、`bulk-archive`、`verify`、`onboard`

换言之,skill/命令的数量取决于 profile 和交付方式,而非固定不变。

<a id="generated-skill-names"></a>

## 生成的 Skill 名称

当被 profile/工作流配置选中时,OpenSpec 生成以下 skills:

- `openspec-propose`
- `openspec-explore`
- `openspec-new-change`
- `openspec-continue-change`
- `openspec-apply-change`
- `openspec-update-change`
- `openspec-ff-change`
- `openspec-sync-specs`
- `openspec-archive-change`
- `openspec-bulk-archive-change`
- `openspec-verify-change`
- `openspec-onboard`

命令行为见[命令](commands.md),`init`/`update` 选项见 [CLI](cli.md)。

## 相关文档

- [CLI 参考](cli.md) —— 终端命令
- [命令](commands.md) —— 斜杠命令与 skills
- [快速上手](getting-started.md) —— 首次设置
