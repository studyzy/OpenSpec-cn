# 支持的工具

> OpenSpec 支持哪些 AI 编码工具，以及每个工具的命令语法。

矩阵中的每个工具都运行相同的 OpenSpec 工作流。一个 skill 和它的 command 是同一份工作流指令。唯一的区别是你输入什么。init 安装哪种形式由 delivery 设置决定，详见[设置你的项目](../start/setup.md#the-workflow-files-skills-and-commands)。

## 支持矩阵

调用以 apply 工作流为例展示。每个工作流都遵循相同的结构。id 传给 `openspec-cn init --tools <id>` 可跳过选择器（[CLI](cli.md)）。

| 工具 | `--tools` id | Skills | 技能调用 | 命令 | 命令调用 |
|---|---|---|---|---|---|
| Amazon Q Developer | `amazon-q` | `.amazonq/skills/` | `/openspec-apply-change` | `.amazonq/prompts/` | `@opsx-apply` |
| Antigravity | `antigravity` | `.agents/skills/` | `/openspec-apply-change` | `.agents/workflows/` | `/opsx-apply` |
| Auggie (Augment CLI) | `auggie` | `.augment/skills/` | `/openspec-apply-change` | `.augment/commands/` | `/opsx-apply` |
| Bob Shell | `bob` | `.bob/skills/` | `/openspec-apply-change` | `.bob/commands/` | `/opsx-apply` |
| Claude Code | `claude` | `.claude/skills/` | `/openspec-apply-change` | `.claude/commands/opsx/` | `/opsx:apply` |
| Cline | `cline` | `.cline/skills/` | `/openspec-apply-change` | `.clinerules/workflows/` | `/opsx-apply` |
| CodeArts | `codeartsagent` | `.codeartsdoer/skills/` | `/openspec-apply-change` | none | none |
| CodeBuddy Code (CLI) | `codebuddy` | `.codebuddy/skills/` | `/openspec-apply-change` | `.codebuddy/commands/opsx/` | `/opsx:apply` |
| Codex | `codex` | `.agents/skills/` | `$openspec-apply-change` | none | none |
| Continue | `continue` | `.continue/skills/` | `/openspec-apply-change` | `.continue/prompts/` | `/opsx-apply` |
| CoStrict | `costrict` | `.cospec/skills/` | `/openspec-apply-change` | `.cospec/openspec/commands/` | `/opsx-apply` |
| Crush | `crush` | `.crush/skills/` | `/openspec-apply-change` | `.crush/commands/opsx/` | `/opsx:apply` |
| Cursor | `cursor` | `.cursor/skills/` | `/openspec-apply-change` | `.cursor/commands/` | `/opsx-apply` |
| Devin Desktop (formerly Windsurf) | `devin` | `.devin/skills/` | `/openspec-apply-change` | `.devin/workflows/` | `/opsx-apply` |
| Factory Droid | `factory` | `.factory/skills/` | `/openspec-apply-change` | `.factory/commands/` | `/opsx-apply` |
| ForgeCode | `forgecode` | `.forge/skills/` | `/openspec-apply-change` | none | none |
| Gemini CLI | `gemini` | `.gemini/skills/` | `/openspec-apply-change` | `.gemini/commands/opsx/` | `/opsx:apply` |
| GitHub Copilot | `github-copilot` | `.github/skills/` | `/openspec-apply-change` | `.github/prompts/` | `/opsx-apply` |
| Hermes Agent | `hermes` | `.hermes/skills/` | `/openspec-apply-change` | none | none |
| iFlow | `iflow` | `.iflow/skills/` | `/openspec-apply-change` | `.iflow/commands/` | `/opsx-apply` |
| Junie | `junie` | `.junie/skills/` | `/openspec-apply-change` | `.junie/commands/` | `/opsx-apply` |
| Kilo Code | `kilocode` | `.kilocode/skills/` | `/openspec-apply-change` | `.kilocode/workflows/` | `/opsx-apply` |
| Kimi Code | `kimi` | `.kimi-code/skills/` | `/skill:openspec-apply-change` | none | none |
| Kiro | `kiro` | `.kiro/skills/` | `/openspec-apply-change` | `.kiro/prompts/` | `/opsx-apply` |
| Lingma | `lingma` | `.lingma/skills/` | `/openspec-apply-change` | `.lingma/commands/opsx/` | `/opsx:apply` |
| MiniMax Code | `minimax-code` | `~/.minimax/skills/` (global) | `/openspec-apply-change` | none | none |
| Mistral Vibe | `vibe` | `.vibe/skills/` | `/openspec-apply-change` | none | none |
| Oh My Pi | `oh-my-pi` | `.omp/skills/` | `/openspec-apply-change` | `.omp/commands/` | `/opsx-apply` |
| OpenCode | `opencode` | `.opencode/skills/` | `/openspec-apply-change` | `.opencode/commands/` | `/opsx-apply` |
| Pi | `pi` | `.pi/skills/` | `/openspec-apply-change` | `.pi/prompts/` | `/opsx-apply` |
| Qoder | `qoder` | `.qoder/skills/` | `/openspec-apply-change` | `.qoder/commands/opsx/` | `/opsx:apply` |
| Qwen Code | `qwen` | `.qwen/skills/` | `/openspec-apply-change` | `.qwen/commands/` | `/opsx-apply` |
| Trae | `trae` | `.trae/skills/` | `/openspec-apply-change` | `.trae/commands/` | `/opsx-apply` |
| ZCode | `zcode` | `.zcode/skills/` | `/openspec-apply-change` | `.zcode/commands/opsx/` | `/opsx:apply` |
| Zoo Code | `roocode` | `.roo/skills/` | `/openspec-apply-change` | `.roo/commands/` | `/opsx-apply` |
| Shared `.agents` skills | `agents` | `.agents/skills/` | `/openspec-apply-change` | none | none |

- **技能调用**：工具是否把 skills 注册为键入项，是该工具自身的行为。这一列展示 OpenSpec 在生成文件和 init 打印的提示中使用的拼写。如果输入后没有反应，请查阅你的工具文档。
- **命令文件格式**：大多数工具使用 `.md` 命令文件。Gemini CLI 使用 `.toml`，Continue 使用 `.prompt`，Kiro 和 GitHub Copilot 使用 `.prompt.md`。你输入的内容无论哪种形式都一样。

## 各工具说明

未在此列出的工具，其行为与表中该行所述完全一致。

### Antigravity

- **当前目录**：Antigravity v1.20.5 及更高版本从 `.agents/` 读取工作区 skills 和工作流。
- **旧目录**：OpenSpec 写入替换文件后，会移除 `.agent/` 中等价的生成文件。自定义文件和被修改过的生成文件会留在 `.agent/` 中供你查看。
- **共享 skills**：Antigravity 与 Codex、Zed Agent 及 `agents` 目标共享 `.agents/skills/`。OpenSpec 只写一次该 skill 树，同时仍会把 Antigravity 命令写入 `.agents/workflows/`。

### Cline

Cline 从 `.clinerules/workflows/` 读取命令，而不是从它的 `.cline/` 目录。skills 仍放在 `.cline/skills/`。

### Codex

- **调用**：输入 `$openspec-<skill>`。Codex 不识别 `/openspec-<skill>` 形式（[上游问题](https://github.com/openai/codex/issues/11817)）。
- **无命令文件**：Codex 直接运行 skills，因此即使 delivery 包含命令，init 也会跳过命令并打印 `Commands skipped for: codex (uses skills)`。
- **共享目录**：Codex skills 落在 `.agents/skills/`，与 Antigravity、Zed Agent 和 `agents` 目标使用同一目录树。选择多个目标时保留单一兼容树，当 Codex 拥有该树时，其交接会同时写成 `$openspec-*` 和 `/openspec-*`。
- **旧路径**：旧版本安装到 `.codex/skills/` 下的 skills 会在下一次 `openspec-cn update` 时迁移。

### Devin Desktop（原 Windsurf）

- **两个 Agent**：`.devin/workflows/` 中的命令文件只在 Devin Desktop 中生效。Devin Local 只运行 skills，因此生成的 skills 引用 `/openspec-<skill>`，在两者中都可用。
- **重命名**：`--tools windsurf` 仍会解析为 `devin`。项目在旧版 `.windsurf/` 目录中持有 OpenSpec 文件时，会在下一次 `openspec-cn update` 时提供迁移选项。

### GitHub Copilot

提示文件在 Copilot IDE 扩展（VS Code、JetBrains、Visual Studio）中注册为斜杠命令。Copilot CLI 不读取 `.github/prompts/`。

### Hermes Agent

Hermes 默认只从 `~/.hermes/skills/` 加载 skills。把项目的 `.hermes/skills/` 目录加入 `~/.hermes/config.yaml` 的 `skills.external_dirs`；init 会在安装后打印这一提示。

### MiniMax Code

- **仅全局**：skills 写入 `~/.minimax/skills/`。仓库内不写入任何内容。
- **跨项目安全**：仅命令的 delivery 会保留全局 skills 不动，因此一个项目的设置不会移除另一个项目使用的 skills。

### 共享的 `.agents` skills

- **适用场景**：任何读取共享 `.agents/skills/` 目录的工具，包括矩阵中没有行的工具。
- **与其他目标共存**：Antigravity、Codex、Zed Agent 和此目标共享同一个物理 skill 树。OpenSpec 在 `.openspec-target` 中记录一个写入者，每次运行只写一次该树。每个工具各自的命令文件仍会生成。
- **OpenSpec 认领的范围**：只有 `openspec-*` 目录和 `.openspec-target` 标记。`.agents/` 下的其他任何内容都不动。
- **`AGENTS.md`**：不会创建或编辑。目标是 `.agents/` 目录，不是该文件。
