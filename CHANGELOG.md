# @studyzy/openspec-cn

## 1.3.1

### Patch Changes

- [#995](https://github.com/Fission-AI/OpenSpec/pull/995) [`d1f3861`](https://github.com/Fission-AI/OpenSpec/commit/d1f3861d9ec694cc924b042b5da01963dcf93137) Thanks [@TabishB](https://github.com/TabishB)! - ### Bug Fixes

  - **Canonical artifact paths** — Workflow artifact paths are now resolved via the native `realpath`, so symlinks and case-insensitive filesystems no longer cause path mismatches during apply and archive.
  - **Glob apply instructions** — Apply instructions with glob artifact outputs now resolve correctly, and literal artifact outputs are enforced to be file paths.
  - **Hidden main spec requirements** — Requirements nested inside fenced code blocks or otherwise hidden in main specs are now detected during validation.
  - **Clean `--json` output** — Spinner progress text no longer leaks into stderr when `--json` is passed, so AI agents that combine stdout and stderr can parse the JSON reliably.
  - **Silent telemetry in firewalled environments** — PostHog network errors are now swallowed with a 1s timeout and retries/remote config disabled, so OpenSpec no longer surfaces `PostHogFetchNetworkError` in locked-down networks. Telemetry opt-out is documented earlier in the README, installation guide, and CLI reference.

## 1.3.0

### 次要变更

- [#952](https://github.com/Fission-AI/OpenSpec/pull/952) [`cce787e`](https://github.com/Fission-AI/OpenSpec/commit/cce787ec4083da2b27781f6786f5ce0002909a7b) 感谢 [@TabishB](https://github.com/TabishB)！- ### 新功能

  - **支持 Junie** — 为 JetBrains Junie 新增工具与命令生成功能
  - **支持 Lingma IDE** — 新增对 Lingma IDE 的配置支持
  - **支持 ForgeCode** — 新增对 ForgeCode 的工具支持
  - **支持 IBM Bob** — 新增对 IBM Bob 编码助手的支持

  ### 问题修复

  - **Shell 补全改为手动启用** — 补全安装现在为可选启用，修复了 PowerShell 编码损坏问题
  - **Copilot 自动检测** — 避免仅因存在裸 `.github/` 目录而误判为 GitHub Copilot 已配置
  - **pi.dev 命令生成** — 修复命令引用转换与模板参数传递问题

### 补丁变更

- [#760](https://github.com/Fission-AI/OpenSpec/pull/760) [`61eb999`](https://github.com/Fission-AI/OpenSpec/commit/61eb999f7c6c0fc98d2e7f3678756fce6a3f4378) 感谢 [@fsilvaortiz](https://github.com/fsilvaortiz)！- 修复：OpenCode 适配器现在使用 `.opencode/commands/`（复数形式），以符合 OpenCode 官方目录约定。修复了 #748。

- [#759](https://github.com/Fission-AI/OpenSpec/pull/759) [`afdca0d`](https://github.com/Fission-AI/OpenSpec/commit/afdca0d5dab1aa109cfd8848b2512333ccad60c3) 感谢 [@fsilvaortiz](https://github.com/fsilvaortiz)！- 修复：`openspec status` 在没有变更时现在会优雅退出，而不是抛出致命错误。修复了 #714。

## 1.2.0

### 次要变更

- [#747](https://github.com/Fission-AI/OpenSpec/pull/747) [`1e94443`](https://github.com/Fission-AI/OpenSpec/commit/1e94443a3551b228eecbc89e95d96d3b9600a192) 感谢 [@TabishB](https://github.com/TabishB)！- ### 新功能

  - **配置档系统** — 可在 `core`（4 个核心工作流）与 `custom`（任意选择子集）配置档之间切换，以控制安装哪些技能。可通过新的 `openspec config profile` 命令管理配置档
  - **提案工作流** — 新增一步式工作流，只需一个请求即可生成包含设计、规格与任务的完整变更提案，无需再分别执行 `new` 和 `ff`
  - **AI 工具自动检测** — `openspec init` 现在会扫描项目中已有的工具目录（如 `.claude/`、`.cursor/` 等），并自动预选已检测到的工具
  - **支持 Pi（pi.dev）** — Pi 编码代理现已成为受支持工具，可生成提示词与技能
  - **支持 Kiro** — AWS Kiro IDE 现已成为受支持工具，可生成提示词与技能
  - **同步时清理未选工作流** — `openspec update` 现在会删除你已取消选择的工作流对应的命令文件和技能目录，保持项目整洁
  - **配置漂移警告** — 当全局配置与当前项目不同步时，`openspec config list` 会给出警告

  ### 问题修复

  - 修复了新初始化项目中 onboard 预检查误报“未初始化”的问题
  - 修复了 archive 工作流在同步过程中中途停止的问题——现在会在同步完成后正确恢复执行
  - 为 onboard 的 shell 命令补充了 Windows PowerShell 替代写法

## 1.1.1

### 补丁变更

- [#627](https://github.com/Fission-AI/OpenSpec/pull/627) [`afb73cf`](https://github.com/Fission-AI/OpenSpec/commit/afb73cf9ec59c6f8b26d0c538c0218c203ba3c56) 感谢 [@TabishB](https://github.com/TabishB)！- ### 问题修复

  - **OpenCode 命令引用** — 生成文件中的命令引用现在使用正确的 `/opsx-` 连字符格式，而不是 `/opsx:` 冒号格式，确保命令能在 OpenCode 中正常工作

## 1.1.0

### 次要变更

- [#625](https://github.com/Fission-AI/OpenSpec/pull/625) [`53081fb`](https://github.com/Fission-AI/OpenSpec/commit/53081fb2a26ec66d2950ae0474b9a56cbc5b5a76) 感谢 [@TabishB](https://github.com/TabishB)！- ### 问题修复

  - **Codex 全局路径支持** — Codex 适配器现在能正确解析全局路径，修复了在项目目录外运行时工作流文件生成异常的问题（#622）
  - **跨设备或受限路径上的归档操作** — 当 `rename` 因 EPERM 或 EXDEV 错误失败时，archive 现在会回退为 copy+remove，修复了网络盘或外置磁盘上的失败问题（#605）
  - **工作流消息中的斜杠命令提示** — 工作流完成消息现在会显示更有帮助的后续斜杠命令提示（#603）
  - **Windsurf 工作流文件路径** — 更新 Windsurf 适配器，改为使用正确的 `workflows` 目录，而不是旧版 `commands` 路径（#610）

### 补丁变更

- [#550](https://github.com/Fission-AI/OpenSpec/pull/550) [`86d2e04`](https://github.com/Fission-AI/OpenSpec/commit/86d2e04cae76a999dbd1b4571f52fa720036be0c) 感谢 [@jerome-benoit](https://github.com/jerome-benoit)！- ### 改进

  - **Nix flake 维护** — 版本号现在从 `package.json` 动态读取，减少手动同步问题
  - **Nix 构建优化** — 源码过滤排除了 `node_modules` 和构建产物，提升构建速度
  - **`update-flake.sh` 脚本** — 可检测哈希是否已正确，避免不必要的重新构建

  ### 其他

  - 将 Nix CI actions 更新到最新版本（`nix-installer v21`、`magic-nix-cache v13`）

## 1.0.2

### 补丁变更

- [#596](https://github.com/Fission-AI/OpenSpec/pull/596) [`e91568d`](https://github.com/Fission-AI/OpenSpec/commit/e91568deb948073f3e9d9bb2d2ab5bf8080d6cf4) 感谢 [@TabishB](https://github.com/TabishB)！- ### 问题修复

  - 明确规格命名约定 —— 规格应按能力命名（`specs/<capability>/spec.md`），而不是按变更命名
  - 修复任务复选框格式说明 —— 现在明确要求使用 `- [ ]` 复选框格式，以便在 apply 阶段跟踪任务

## 1.0.1

### 补丁变更

- [#587](https://github.com/Fission-AI/OpenSpec/pull/587) [`943e0d4`](https://github.com/Fission-AI/OpenSpec/commit/943e0d41026d034de66b9442d1276c01b293eb2b) 感谢 [@TabishB](https://github.com/TabishB)！- ### 问题修复

  - 修复了 onboarding 文档中的错误 archive 路径 —— 模板现在显示正确路径 `openspec/changes/archive/YYYY-MM-DD-<name>/`，而不是错误的 `openspec/archive/YYYY-MM-DD--<name>/`

## 1.0.0

### 重大变更

- [#578](https://github.com/Fission-AI/OpenSpec/pull/578) [`0cc9d90`](https://github.com/Fission-AI/OpenSpec/commit/0cc9d9025af367faa1688a7b2606a2549053cd3f) 感谢 [@TabishB](https://github.com/TabishB)！- ## OpenSpec-cn 1.0 —— OPSX 版本

  工作流已从底层彻底重构。OPSX 用基于动作的系统取代了旧的阶段锁定式 `/openspec:*` 命令，AI 现在能够理解已有的工件、可创建的内容，以及每个动作会解锁什么。

  ### 破坏性变更

  - **移除旧命令** — `/openspec:proposal`、`/openspec:apply` 和 `/openspec:archive` 已不再存在
  - **移除配置文件** — 不再生成工具专属的指令文件（`CLAUDE.md`、`.cursorrules`、`AGENTS.md`、`project.md`）
  - **迁移方式** — 运行 `openspec init` 进行升级。旧版工件会被检测出来，并在确认后清理。

  ### 从静态提示到动态指令

  **之前：** 无论项目状态如何，AI 每次收到的都是相同的静态指令。

  **现在：** 指令由三层动态组合而成：

  1. **上下文** — 来自 `config.yaml` 的项目背景（技术栈、约定等）
  2. **规则** — 针对特定工件的约束（例如“对未知项提出 spike 任务”）
  3. **模板** — 输出文件的实际结构

  AI 会向 CLI 查询实时状态：哪些工件已经存在、哪些已准备好创建、哪些依赖已满足，以及每个动作会解锁什么。

  ### 从阶段锁定到基于动作

  **之前：** 线性工作流——proposal → apply → archive，难以回退或迭代。

  **现在：** 可以围绕一个变更灵活执行动作，随时编辑任意工件，工件关系图会自动跟踪状态。

  | 命令 | 作用 |
  | --- | --- |
  | `/opsx:explore` | 在正式创建变更前先梳理思路 |
  | `/opsx:new` | 开始一个新的变更 |
  | `/opsx:continue` | 一次创建一个工件（逐步推进） |
  | `/opsx:ff` | 一次性创建所有规划工件（快速推进） |
  | `/opsx:apply` | 实现任务 |
  | `/opsx:verify` | 验证实现是否与工件一致 |
  | `/opsx:sync` | 将增量规格同步到主规格 |
  | `/opsx:archive` | 归档已完成的变更 |
  | `/opsx:bulk-archive` | 批量归档多个变更，并检测冲突 |
  | `/opsx:onboard` | 通过 15 分钟引导完成整个工作流 |

  ### 从文本合并到语义化规格同步

  **之前：** 更新规格需要手动合并，或者整体替换文件。

  **现在：** 增量规格使用 AI 可理解的语义标记：

  - `## ADDED Requirements` — 要新增的需求
  - `## MODIFIED Requirements` — 局部更新（无需复制原内容即可添加场景）
  - `## REMOVED Requirements` — 删除需求，并附带原因与迁移说明
  - `## RENAMED Requirements` — 重命名需求，同时保留内容

  Archive 会在“需求”这一层级解析这些变更，而不是依赖脆弱的标题匹配。

  ### 从分散文件到 Agent Skills

  **之前：** 项目根目录有 8 个以上配置文件，斜杠命令分散在 21 个工具专属位置中，格式也各不相同。

  **现在：** 统一使用单个 `.claude/skills/` 目录，内部是带 YAML frontmatter 的 Markdown 文件。Claude Code、Cursor、Windsurf 可自动识别，也兼容跨编辑器使用。

  ### 新功能

  - **Onboarding 技能** — `/opsx:onboard` 会引导新用户完成第一个完整变更，提供与代码库相关的任务建议，并逐步讲解整个过程（11 个阶段，约 15 分钟）

  - **支持 21 种 AI 工具** — Claude Code、Cursor、Windsurf、Continue、Gemini CLI、GitHub Copilot、Amazon Q、Cline、RooCode、Kilo Code、Auggie、CodeBuddy、Qoder、Qwen、CoStrict、Crush、Factory、OpenCode、Antigravity、iFlow 和 Codex

  - **交互式初始化** — `openspec init` 现提供动态欢迎界面和可搜索的多选工具列表，并会预选已配置工具，方便刷新更新

  - **可自定义 schema** — 可在 `openspec/schemas/` 中定义自定义工件工作流，而无需修改包代码；团队也可通过版本控制共享这些工作流

  ### 问题修复

  - 修复了命令名包含冒号时 Claude Code 的 YAML 解析失败问题
  - 修复了任务文件解析在复选框行尾存在空白字符时的处理问题
  - 修复了 JSON 指令输出未正确分离 context/rules 与 template 的问题 —— 之前 AI 会把约束块直接复制进工件文件中

  ### 文档

  - 新增入门指南、CLI 参考文档和概念说明文档
  - 移除了未实现的误导性说法，例如“中途编辑并继续”
  - 新增从 pre-OPSX 版本升级的迁移指南

## 0.23.0

### 次要变更

- [#540](https://github.com/Fission-AI/OpenSpec/pull/540) [`c4cfdc7`](https://github.com/Fission-AI/OpenSpec/commit/c4cfdc7c499daef30d8a218f5f59b8d9e5adb754) 感谢 [@TabishB](https://github.com/TabishB)！- ### 新功能

  - **批量归档技能** — 使用 `/opsx:bulk-archive` 一次性归档多个已完成变更，包含批量校验、规格冲突检测与统一确认流程

  ### 其他

  - **简化初始化** — 配置创建现在采用更合理的默认值和有帮助的注释，而非交互式提问

## 0.22.0

### 次要变更

- [#530](https://github.com/Fission-AI/OpenSpec/pull/530) [`33466b1`](https://github.com/Fission-AI/OpenSpec/commit/33466b1e2a6798bdd6d0e19149173585b0612e6f) 感谢 [@TabishB](https://github.com/TabishB)！- 新增项目级配置、项目本地 schema，以及 schema 管理命令

  **新功能**

  - **项目级配置** — 可通过 `openspec/config.yaml` 为每个项目配置 OpenSpec-cn 行为，包括自定义规则注入、上下文文件和 schema 解析设置
  - **项目本地 schema** — 可在项目的 `openspec/schemas/` 目录中定义项目专属的工件 schema
  - **schema 管理命令** — 新增 `openspec schema` 命令（`list`、`show`、`export`、`validate`），用于查看和管理工件 schema（实验性）

  **问题修复**

  - 修复项目配置中 `rules` 字段为 null 时的配置加载问题

## 0.21.0

### 次要变更

- [#516](https://github.com/Fission-AI/OpenSpec/pull/516) [`b5a8847`](https://github.com/Fission-AI/OpenSpec/commit/b5a884748be6156a7bb140b4941cfec4f20a9fc8) 感谢 [@TabishB](https://github.com/TabishB)！- 新增反馈命令和 Nix flake 支持

  **新功能**

  - **反馈命令** — 可直接通过 CLI 使用 `openspec feedback` 提交反馈；该命令会自动附带元数据创建 GitHub Issue，并在失败时优雅回退为手动提交方式
  - **Nix flake 支持** — 可通过新的 `flake.nix` 使用 Nix 安装和开发 OpenSpec-cn，并支持自动化 flake 维护与 CI 校验

  **问题修复**

  - **Explore 模式护栏** — Explore 模式现在会明确阻止直接实现代码，让重点保持在思考与探索上，同时仍允许创建工件

  **其他**

  - 改进 `opsx apply` 的变更推断 —— 当存在歧义时，会根据对话上下文或提示自动识别目标变更
  - 简化 archive 同步评估流程，并更清晰地说明增量规格的位置

## 0.20.0

### 次要变更

- [#502](https://github.com/Fission-AI/OpenSpec/pull/502) [`9db74aa`](https://github.com/Fission-AI/OpenSpec/commit/9db74aa5ac6547efadaed795217cfa17444f2004) 感谢 [@TabishB](https://github.com/TabishB)！- 新增 `/opsx:verify` 命令并修复 vitest 进程风暴问题

  **新功能**

  - **`/opsx:verify` 命令** — 校验变更实现是否与其规格一致

  **问题修复**

  - 通过限制 worker 并行度修复 vitest 进程风暴问题
  - 修复 agent 工作流校验命令未使用非交互模式的问题
  - 修复 PowerShell 补全生成器会保留尾随逗号的问题

## 0.19.0

### 次要变更

- eb152eb：新增 Continue IDE 支持、shell 补全和 `/opsx:explore` 命令

  **新功能**

  - **支持 Continue IDE** – OpenSpec-cn 现在可为 [Continue](https://continue.dev/) 生成斜杠命令，与 Cursor、Windsurf、Claude Code 等一起扩展编辑器集成选项
  - **支持 Bash、Fish 和 PowerShell 的 shell 补全** – 运行 `openspec completion install` 即可在你偏好的 shell 中启用 Tab 补全
  - **`/opsx:explore` 命令** – 新增一个“思考伙伴”模式，用于在正式提交变更之前探索想法和调查问题
  - **Codebuddy 斜杠命令改进** – 更新 frontmatter 格式以提升兼容性

  **问题修复**

  - 当命令存在子命令时，shell 补全现在能正确提供父级参数（如 `--help`）
  - 修复测试中的 Windows 兼容性问题

  **其他**

  - 新增可选的匿名使用统计，用于帮助了解 OpenSpec-cn 的使用情况。该功能默认**需要手动关闭**——设置 `OPENSPEC_TELEMETRY=0` 或 `DO_NOT_TRACK=1` 可禁用。仅收集命令名和版本号，不收集参数、文件路径或内容，并会在 CI 环境中自动禁用。

## 0.18.0

### 次要变更

- 8dfd824：新增 OPSX 实验性工作流命令和增强版工件系统

  **新命令：**

  - `/opsx:ff` - 快速推进工件创建，一次生成所有所需工件
  - `/opsx:sync` - 将某个变更的增量规格同步到主规格
  - `/opsx:archive` - 在智能同步检查后归档已完成变更

  **工件工作流增强：**

  - 带内联指导与 XML 输出的 schema 感知 apply 指令
  - 实验性工件工作流的 agent schema 选择
  - 通过 `.openspec.yaml` 文件为每个变更保存 schema 元数据
  - 实验性工件工作流的 Agent Skills
  - 用于模板加载和变更上下文的指令加载器
  - 将 schema 重构为目录 + 模板形式

  **改进：**

  - 增强 list 命令，支持显示最后修改时间和排序
  - 提供更完善的变更创建工具以支持工作流

  **修复：**

  - 规范路径以兼容跨平台 glob 匹配
  - 创建新规格文件时允许使用 REMOVED 需求段落

## 0.17.2

### 补丁变更

- 455c65f：修复 `validate` 命令中的 `--no-interactive` 参数，使其能正确禁用 spinner，避免在 pre-commit hook 和 CI 环境中卡住

## 0.17.1

### 补丁变更

- a2757e7：通过对 `@inquirer/prompts` 使用动态导入，修复 `config` 命令导致 pre-commit hook 卡住的问题

  `config` 命令此前会导致 pre-commit hook 无限挂起，因为 stdin 事件监听器在模块加载时就已注册。此次修复将静态导入改为动态导入，只有在交互式实际执行 `config reset` 命令时才会加载 inquirer。

  同时新增 ESLint 规则以防止未来再次静态导入 `@inquirer`，避免类似问题回归。

## 0.17.0

### 次要变更

- 2e71835：新增 `openspec config` 命令和 Oh-my-zsh 补全支持

  **新功能**

  - 新增 `openspec config` 命令，用于管理全局配置
  - 实现支持 XDG Base Directory 规范的全局配置目录
  - 新增 Oh-my-zsh shell 补全支持，提升 CLI 使用体验

  **问题修复**

  - 通过动态导入修复 pre-commit hook 卡住问题
  - 在所有平台上遵循 `XDG_CONFIG_HOME` 环境变量
  - 修复 zsh-installer 测试中的 Windows 兼容性问题
  - 使 CLI 补全规范与实现保持一致
  - 移除斜杠命令中的硬编码 agent 字段

  **文档**

  - 将 README 中的 AI 工具列表按字母顺序排序，并改为可折叠展示

## 0.16.0

### 次要变更

- c08fbc1：新增多项 AI 工具集成与增强：

  - **feat(iflow-cli)**：新增 iFlow-cli 集成，包括斜杠命令支持与文档
    **feat(init)**：在 `init` 后新增 IDE 重启提示，提醒用户斜杠命令已可用
    **feat(antigravity)**：新增 Antigravity 斜杠命令支持
  - **fix**：为 Qwen Code 生成 TOML 命令（修复 #293）
  - 澄清脚手架提案文档并增强提案指南
  - 更新提案指南，强调在实现前先进行设计

## Unreleased

### 次要变更

- 新增 Continue 斜杠命令支持，使 `openspec init` 能生成带有 MARKDOWN frontmatter 和 `$ARGUMENTS` 占位符的 `.continue/prompts/openspec-*.prompt` 文件，并在 `openspec update` 时刷新它们。

- 新增 Antigravity 斜杠命令支持，使 `openspec init` 能生成仅含 description frontmatter 的 `.agent/workflows/openspec-*.md` 文件，并让 `openspec update` 在刷新 Windsurf 工作流的同时刷新这些现有工作流。

## 0.15.0

### 次要变更

- 4758c5c：新增对原生斜杠命令集成的新 AI 工具支持

  - **Gemini CLI**：新增基于 TOML 的 Gemini CLI 原生斜杠命令支持，集成路径为 `.gemini/commands/openspec/`
  - **RooCode**：新增 RooCode 集成，包括配置器、斜杠命令和模板
  - **Cline**：修复 Cline 斜杠命令使用 `workflows` 而不是 `rules`（路径为 `.clinerules/workflows/`）
  - **文档**：更新文档以反映新的集成与工作流变化

## 0.14.0

### 次要变更

- 8386b91：新增多种 AI 助手支持并改进配置

  - feat：新增 Qwen Code 斜杠命令支持
  - feat：为 apply 斜杠命令新增 `$ARGUMENTS` 支持，以便动态传参
  - feat：新增 Qoder CLI 配置与文档支持
  - feat：新增 CoStrict AI 助手支持
  - fix：在 extend 模式下重新创建缺失的 openspec 模板文件
  - fix：避免错误地将工具识别为“已配置”
  - fix：使用 change-id 作为回退标题，而不是 “Untitled Change”
  - docs：补充项目级上下文填充指南
  - docs：在 README 的受支持 AI 工具列表中加入 Crush

## 0.13.0

### 次要变更

- 668a125：新增多种 AI 助手支持并改进校验

  本次发布新增对以下 AI 编码助手的支持：

  - CodeBuddy Code - AI 驱动的编码助手
  - CodeRabbit - AI 代码审查助手
  - Cline - 基于 Claude 的 CLI 助手
  - Crush AI - AI 助手平台
  - Auggie（Augment CLI）- 代码增强工具

  新功能：

  - Archive 斜杠命令现已支持参数，提供更灵活的工作流

  问题修复：

  - Delta spec 校验现在可处理大小写不敏感的标题，并能正确检测空章节
  - Archive 校验现在会正确遵循 `--no-validate` 参数并忽略元数据

  文档改进：

  - 新增 VS Code dev container 配置，便于开发环境搭建
  - 更新 `AGENTS.md`，明确 change-id 记法
  - 增强斜杠命令文档，补充重启提示

## 0.12.0

### 次要变更

- 082abb4：新增斜杠命令工厂函数支持和非交互式 init 选项

  本次发布包含两项新功能：

  - **斜杠命令工厂函数支持**：斜杠命令现在可定义为返回命令对象的函数，从而支持动态命令配置
  - **非交互式 init 选项**：为 `openspec init` 新增 `--tools`、`--all-tools` 和 `--skip-tools` CLI 参数，以便在 CI/CD 流水线中自动初始化，同时保持与交互模式的向后兼容

## 0.11.0

### 次要变更

- 312e1d6：新增 Amazon Q Developer CLI 集成。OpenSpec-cn 现已支持 Amazon Q Developer，可自动在 `.amazonq/prompts/` 目录中生成提示词，使你能够通过 Amazon Q 的 `@` 语法使用 OpenSpec-cn 的斜杠命令。

## 0.10.0

### 次要变更

- d7e0ce8：改进 init 向导中 Enter 键的行为，使用户能更自然地继续下一步提示

## 0.9.2

### 补丁变更

- 2ae0484：修复跨平台路径处理问题。本次发布修复了 `joinPath` 行为与斜杠命令路径解析，以确保 OpenSpec-cn 能在所有平台上正确运行。

## 0.9.1

### 补丁变更

- 8210970：修复选择 Codex 集成时 OpenSpec-cn 在 Windows 上无法运行的问题。本次发布包含跨平台路径处理和规范化修复，以确保 OpenSpec-cn 在 Windows 系统中正确工作。

## 0.9.0

### 次要变更

- efbbf3b：新增对 Codex 和 GitHub Copilot 斜杠命令的支持，使用 YAML frontmatter 与 `$ARGUMENTS`

## Unreleased

### 次要变更

- 新增 GitHub Copilot 斜杠命令支持。OpenSpec-cn 现在会将提示词写入 `.github/prompts/openspec-{proposal,apply,archive}.prompt.md`，并使用 YAML frontmatter 与 `$ARGUMENTS` 占位符，同时在 `openspec update` 时刷新这些文件。

## 0.8.1

### 补丁变更

- d070d08：修复 CLI 版本不一致问题，并新增发布保护机制：通过 `openspec --version` 校验打包产物输出的版本与 `package.json` 一致。

## 0.8.0

### 次要变更

- c29b06d：新增 Windsurf 支持。
- 新增 Codex 斜杠命令支持。OpenSpec-cn 现在会直接将提示词写入 Codex 的全局目录（`~/.codex/prompts` 或 `$CODEX_HOME/prompts`），并在 `openspec update` 时刷新它们。

## 0.7.0

### 次要变更

- 新增原生 Kilo Code 工作流集成，使 `openspec init` 和 `openspec update` 能管理 `.kilocode/workflows/openspec-*.md` 文件。
- 始终生成受管的根级 `AGENTS.md` 交接 stub，并在 init/update 期间重新整理 AI 工具提示词，以保持指令一致性。

## 0.6.0

### 次要变更

- 将生成的根级 agent 指令精简为一个受管的交接 stub，并更新 init/update 流程以安全刷新它。

## 0.5.0

### 次要变更

- feat：实现第一阶段 E2E 测试，并引入跨平台 CI 矩阵

  - 在 `test/helpers/run-cli.ts` 中新增共享的 `runCLI` 辅助函数，用于 spawn 测试
  - 创建 `test/cli-e2e/basic.test.ts`，覆盖 help、version、validate 流程
  - 将现有 CLI exec 测试迁移为使用 `runCLI` 辅助函数
  - 将 CI 矩阵扩展到 bash（Linux/macOS）和 pwsh（Windows）
  - 拆分 PR 和主分支工作流，以优化反馈速度

### 补丁变更

- 让 apply 指令更具体

  改进 agent 模板和斜杠命令模板，使 apply 指令更具体、更具可执行性。

- docs：改进文档并清理内容

  - 为 archive 命令补充非交互式参数说明
  - 替换 README 中的 Discord 徽章
  - 归档已完成的变更，以提升组织性

## 0.4.0

### 次要变更

- 新增 OpenSpec-cn 变更提案，以改进 CLI 和提升用户体验
- 新增 Opencode 斜杠命令支持，用于 AI 驱动的开发工作流

### 补丁变更

- 改进文档，包括为 archive 命令模板补充 `--yes` 参数说明及 Discord 徽章
- 修复 Markdown 解析器中的换行规范化问题，以正确处理 CRLF 文件

## 0.3.0

### 次要变更

- 增强 `openspec init`，加入 extend 模式、多工具选择，以及交互式 `AGENTS.md` 配置器。

## 0.2.0

### 次要变更

- ce5cead：- 新增 `openspec view` 仪表盘，可总览规格数量和变更进度
  - 在重命名后的 `openspec/AGENTS.md` 指令文件旁生成并更新 AI 斜杠命令
  - 移除已废弃的 `openspec diff` 命令，并引导用户改用 `openspec show`

## 0.1.0

### 次要变更

- 24b4866：初始发布

