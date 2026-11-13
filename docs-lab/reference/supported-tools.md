# 支持的工具

> OpenSpec 支持哪些 AI 编码工具，以及如何调用每个工具的 skills。

矩阵中的每个工具都运行相同的 OpenSpec 工作流，并以 skills 形式安装。早期版本还会写入命令文件；它们会怎样由 [升级到 2.0](../help/upgrade-to-2.md) 说明。

## skills 放在哪里

每个工具的 skills 只写一次，写到 `.agents/skills/`。不读取该文件夹的工具会在自己的 `skills/` 文件夹中为每个 skill 放一个链接，指回共享副本。

一个为 Claude Code、Cursor 和 Codex 配置的项目：

```
my-project/
├── .agents/skills/
│   ├── .openspec-target           此处配置的工具，每行一个
│   └── openspec-propose/SKILL.md  所有工具读取的唯一副本
└── .claude/
    └── skills/openspec-propose    指向 ../../.agents/skills/openspec-propose 的链接
```

Cursor 和 Codex 自己读取 `.agents/skills/`，因此无需其他内容。

`.openspec-target` 让 `openspec update` 知道哪些内容属于 OpenSpec。每一行是以下之一：

| 行 | 含义 |
|---|---|
| `<tool>` | 本项目配置的工具，例如 `cursor`。 |
| `<tool> own-files` | OpenSpec 在自己的文件夹中为该工具放了链接，例如 `claude own-files`。删除该文件夹后，`update` 会移除该工具。 |
| `keep <skill>` | 你自己的 skill，例如 `keep openspec-mine`。它在 OpenSpec 使用该文件夹之前就已存在，因此 OpenSpec 从不改动它。 |

- **链接**：Claude Code、Continue、ForgeCode、Kiro、CodeBuddy、EasyCode、iFlow、CodeArts、Lingma、GigaCode、Veai、Rovo Dev、Code Studio 和 Hermes Agent。
- **无链接**：其他所有工具都直接读取 `.agents/skills/`，因此绝不会重复加载某个 skill。
- **无法建立链接时**：OpenSpec 改为写入普通副本，并在 `openspec update` 时刷新。

要添加未列出的工具，见[链接其他工具](#link-another-tool)。

## 支持矩阵

调用以 apply 工作流为例展示。每个工作流都遵循相同的结构。id 传给 `openspec-cn init --tools <id>` 可跳过选择器（[CLI](cli.md)）。

| 工具 | `--tools` id | Skills | 技能调用 |
|---|---|---|---|
| Amp | `amp` | `.agents/skills/` | `/openspec-apply-change` |
| Antigravity | `antigravity` | `.agents/skills/` | `/openspec-apply-change` |
| AtomCode | `atomcode` | `.agents/skills/` | `/openspec-apply-change` |
| Auggie (Augment CLI) | `auggie` | `.agents/skills/` | `/openspec-apply-change` |
| IBM Bob | `bob` | `.agents/skills/` | `/openspec-apply-change` |
| Claude Code | `claude` | `.agents/skills/`（链接在 `.claude/skills/`） | `/openspec-apply-change` |
| Cline | `cline` | `.agents/skills/` | `/openspec-apply-change` |
| CodeArts | `codeartsagent` | `.agents/skills/`（链接在 `.codeartsdoer/skills/`） | `/openspec-apply-change` |
| CodeBuddy Code (CLI) | `codebuddy` | `.agents/skills/`（链接在 `.codebuddy/skills/`） | `/openspec-apply-change` |
| Code Studio | `codestudio` | `.agents/skills/`（链接在 `.codestudio/skills/`） | `/openspec-apply-change` |
| Codex | `codex` | `.agents/skills/` | `$openspec-apply-change` |
| Continue | `continue` | `.agents/skills/`（链接在 `.continue/skills/`） | `/openspec-apply-change` |
| CoStrict | `costrict` | `.agents/skills/` | `/openspec-apply-change` |
| Crush | `crush` | `.agents/skills/` | `/openspec-apply-change` |
| Cursor | `cursor` | `.agents/skills/` | `/openspec-apply-change` |
| DeepSeek Harness | `dsh` | `.agents/skills/` | `/openspec-apply-change` |
| Devin Desktop（原 Windsurf） | `devin` | `.agents/skills/` | `/openspec-apply-change` |
| EasyCode | `easycode` | `.agents/skills/`（链接在 `.easycode/skills/`） | `/openspec-apply-change` |
| Factory Droid | `factory` | `.agents/skills/` | `/openspec-apply-change` |
| ForgeCode | `forgecode` | `.agents/skills/`（链接在 `.forge/skills/`） | `/openspec-apply-change` |
| Gemini CLI | `gemini` | `.agents/skills/` | `/openspec-apply-change` |
| GigaCode | `gigacode` | `.agents/skills/`（链接在 `.gigacode/skills/`） | `/openspec-apply-change` |
| GitHub Copilot | `github-copilot` | `.agents/skills/` | `/openspec-apply-change` |
| Grok Build | `grok` | `.agents/skills/` | `/openspec-apply-change` |
| GSD | `gsd` | `.agents/skills/` | 请求使用 `openspec-apply-change` |
| Hermes Agent | `hermes` | `.agents/skills/`（链接在 `.hermes/skills/`） | `/openspec-apply-change` |
| iFlow | `iflow` | `.agents/skills/`（链接在 `.iflow/skills/`） | `/openspec-apply-change` |
| Junie | `junie` | `.agents/skills/` | `/openspec-apply-change` |
| Kilo Code | `kilocode` | `.agents/skills/` | `/openspec-apply-change` |
| Kimi Code | `kimi` | `.agents/skills/` | `/skill:openspec-apply-change` |
| Kiro | `kiro` | `.agents/skills/`（链接在 `.kiro/skills/`） | `/openspec-apply-change` |
| Lingma | `lingma` | `.agents/skills/`（链接在 `.lingma/skills/`） | `/openspec-apply-change` |
| MiniMax Code | `minimax-code` | `~/.minimax/skills/`（全局） | `/openspec-apply-change` |
| Mistral Vibe | `vibe` | `.agents/skills/` | `/openspec-apply-change` |
| Oh My Pi | `oh-my-pi` | `.agents/skills/` | `/openspec-apply-change` |
| OpenCode | `opencode` | `.agents/skills/` | `/openspec-apply-change` |
| Pi | `pi` | `.agents/skills/` | `/openspec-apply-change` |
| Qoder | `qoder` | `.agents/skills/` | `/openspec-apply-change` |
| Qwen Code | `qwen` | `.agents/skills/` | `/openspec-apply-change` |
| Rovo Dev CLI | `rovodev` | `.agents/skills/`（链接在 `.rovodev/skills/`） | 请求使用 `openspec-apply-change` |
| Trae | `trae` | `.agents/skills/` | `/openspec-apply-change` |
| [Veai](https://veai.ru/docs/veai/download) | `veai` | `.agents/skills/`（链接在 `.veai/skills/`） | `/openspec-apply-change` |
| Warp | `warp` | `.agents/skills/` | `/openspec-apply-change` |
| ZCode | `zcode` | `.agents/skills/` | `/openspec-apply-change` |
| Zoo Code | `roocode` | `.agents/skills/` | `/openspec-apply-change` |
| Other / Universal | `agents` | `.agents/skills/` | `/openspec-apply-change` |

- **技能调用**：工具是否把 skills 注册为可键入的条目由工具自身决定。该列展示的是 OpenSpec 在生成文件中使用的拼写，以及 init 打印的提示中的拼写。如果键入后没有反应，请查阅你的工具文档。

## 链接其他工具

读取 `.agents/skills/` 的工具无需任何操作：在 init 时选择 `agents`（[Other / Universal](#other--universal-shared-agents-skills)）。只读取自己文件夹的工具可以用一个链接指向共享副本。在项目根目录的终端中执行：

```bash
mkdir -p .mytool
ln -s ../.agents/skills .mytool/skills
```

在 Windows 的命令提示符中：

```
mkdir .mytool
mklink /J .mytool\skills .agents\skills
```

把 `.mytool` 换成你的工具文件夹。如果该工具已有自己的 `skills/` 文件夹，则改为逐个链接 skill：`ln -s ../../.agents/skills/openspec-propose .mytool/skills/openspec-propose`。

**提交链接**：Git 会把链接存为链接。Windows 上的协作者应当运行 `git config --global core.symlinks true`（或用 `git clone -c core.symlinks=true <url>` 克隆）并开启开发者模式，以便创建链接。否则每个链接都会检出为一个小文本文件，`openspec update` 会用普通副本替换它。用 `mklink /J` 创建的联接（junction）不会被作为链接提交；需在每台机器上重新创建。

## 各工具说明

未在此列出的工具，其行为与表中该行所述完全一致。

### Amazon Q Developer（已停止支持）

OpenSpec 2.0 不再支持 Amazon Q Developer：它无法加载 skills，且 AWS 正逐渐用 Kiro 取代它。`openspec init --tools amazon-q` 会以该消息停止。在已为它配置的项目中，`openspec update` 会删除 OpenSpec 写入 `.amazonq/` 的提示词和 skills，并保留和列出你编辑过的内容。请改用 Kiro：`openspec init --tools kiro`。

### Antigravity

- **当前文件夹**：Antigravity v1.20.5 及更高版本从 `.agents/` 读取工作区 skills 和工作流。
- **旧文件夹**：OpenSpec 写入替换文件后，会移除 `.agent/` 中等价的生成文件。自定义文件和被修改过的生成文件会留在 `.agent/` 中供你查看。
- **共享 skills**：Antigravity 与其他所有工具读取的是 `.agents/skills/` 中的同一份副本。2.0 之前 OpenSpec 写入 `.agents/workflows/` 的工作流会在 update 时被移除。

### Cline

skills 就是 `.agents/skills/` 中的共享副本。2.0 之前 OpenSpec 写入 `.clinerules/workflows/` 的工作流会在 update 时被移除；你在那里的自定义规则不受影响。

### Codex

- **CLI 和 IDE 扩展**：带上你的想法提及 `$openspec-propose`，或运行 `/skills` 选择该 skill。Codex 不识别 `/openspec-propose`（[上游 issue](https://github.com/openai/codex/issues/11817)）。
- **桌面应用**：打开侧边栏中的 Skills 并选择 `openspec-propose`。[OpenAI 的 skills 文档](https://learn.chatgpt.com/docs/build-skills) 描述了这两种界面。
- **共享文件夹**：Codex 与其他所有工具读取的是 `.agents/skills/` 中的同一份副本。skills 之间以 skill 名称互相引用（`openspec-apply-change`），Codex 以 `$openspec-apply-change` 调用它。
- **旧路径**：旧版本安装在 `.codex/skills/` 下的 skills 会在下一次 `openspec update` 时迁移。

### DeepSeek Harness

- **项目根**：DSH 使用最近的 `.git` 祖先目录；不在 Git 中时使用当前目录。在那里运行 `openspec init --tools dsh`。对于嵌套的 OpenSpec 项目，将其 `.agents/skills/` 目录的绝对路径加入 DSH 的 `customSkillDirs`。若名称冲突，Git 根目录下的 skills 仍然优先（[上游发现规则](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/skill/skill-filesystem)）。
- **旧副本**：2.0 之前 `.dsh/skills/` 中的副本会优先于 `.agents/skills/`。`openspec update` 会删除未改动的副本，并报告你改动过的。

### Devin Desktop（原 Windsurf）

- **两个 Agent**：Devin Desktop 和 Devin Local 都运行共享 skills。2.0 之前 OpenSpec 写入 `.devin/workflows/` 的工作流会在 update 时被移除。
- **重命名**：`--tools windsurf` 仍会解析为 `devin`。在旧版 `.windsurf/` 文件夹中持有 OpenSpec 文件的项目，会在下一次 `openspec update` 时收到迁移提议。

### GitHub Copilot

- **Skills**：Copilot 加载 `.agents/skills/openspec-*/SKILL.md`。以 `/openspec-<skill>` 调用 skill。在 CLI 中，如果某个 skill 消失但其文件仍然存在，运行 `/skills reload`，再运行 `/skills info openspec-propose` 确认已被发现。在 IDE 中，请重启它。
- **旧提示词文件**：2.0 之前 OpenSpec 写入的 `.github/prompts/opsx-*.prompt.md` 文件会在 update 时被移除。

### GSD

- **项目 skills**：GSD 从 [`.agents/skills/`](https://github.com/open-gsd/gsd-pi/blob/main/docs/user-docs/skills.md) 读取 OpenSpec 工作流。
- **调用**：请 GSD 使用 `openspec-<workflow>` skill。GSD 也可以通过其 skill 发现设置选择一个匹配的 skill。
- **无 subagent 文件**：[`.gsd/agents/`](https://github.com/open-gsd/gsd-pi/blob/main/docs/user-docs/subagents.md) 存放 GSD 的 subagent 定义。OpenSpec 不会向其中写入工作流 skills。

### Hermes Agent

OpenSpec 会把每个 skill 链接到项目的 `.hermes/skills/` 文件夹。Hermes v2026.6.5 及更高版本会在你信任该仓库之后加载该文件夹：在项目中运行 `hermes skills trust`。在此之前，Hermes 会提示它发现了项目 skills 但未加载。旧版本请改为将项目的 `.hermes/skills/` 文件夹添加到 `~/.hermes/config.yaml` 中的 `skills.external_dirs`。init 会在安装后打印这一提醒。

### MiniMax Code

- **仅全局**：skills 写入 `~/.minimax/skills/`。仓库内不写入任何内容。

### Warp

- **OpenSpec 声明的内容**：`.warp/` 中没有任何内容。OpenSpec 不会创建或编辑 Warp 设置和 `WARP.md`。

<a id="other--universal-shared-agents-skills"></a>

- **适用场景**：任何读取共享 `.agents/skills/` 文件夹的工具，包括矩阵中没有行的工具。当你的助手未被列出时，就选这一项。init 选择器的搜索框可以用 `universal`、`other`、`generic`、`custom`、`proprietary`、`unlisted`、`unsupported`、`vendor-neutral` 或 `agents.md` 找到它。
- **与其他工具共存**：所有工具读取同一棵 skill 树。`.openspec-target` 列出了项目中配置的工具。要移除某个工具，删除它的文件夹（对于没有自己文件夹的工具，则删除它在 `.openspec-target` 中的行）。
- **你自己的 `openspec-*` skills**：在 OpenSpec 使用该文件夹之前就已存在于 `.agents/skills/` 中的 skill 会被保留，绝不会被覆盖，并在 `.openspec-target` 中记录为 `keep <skill>`。删除该 skill 可让 OpenSpec 写入自己的版本。
- **OpenSpec 声明的内容**：只有 `openspec-*` 文件夹和 `.openspec-target` 列表。`.agents/` 下的其他内容不受影响。
- **`AGENTS.md`**：不创建也不编辑。目标是 `.agents/` 文件夹，而不是该文件。