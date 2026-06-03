# CLI 参考手册

OpenSpec CLI（`openspec-cn`）提供一组终端命令，用于项目初始化、校验、状态查看与管理。这些命令与 AI 的斜杠命令（如 `/opsx:propose`）相互补充；斜杠命令详见 [命令](commands.md)。

## 总览

| 分类 | 命令 | 用途 |
|----------|----------|---------|
| **初始化** | `init`, `update` | 在项目中初始化并更新 OpenSpec |
| **工作区（beta）** | `workspace setup`, `workspace list`, `workspace ls`, `workspace link`, `workspace relink`, `workspace doctor`, `workspace update`, `workspace open` | 设置关联仓库或文件夹的本地视图 |
| **共享上下文（beta）** | `context-store setup`, `context-store register`, `context-store unregister`, `context-store remove`, `context-store list`, `context-store doctor`, `initiative create`, `initiative show`, `initiative list` | 管理本地上下文存储注册和持久化 initiative 上下文 |
| **浏览** | `list`, `view`, `show` | 浏览变更（changes）与规范（specs） |
| **校验** | `validate` | 检查变更与规范是否存在问题 |
| **生命周期** | `archive` | 归档已完成的变更 |
| **工作流** | `new change`, `set change`, `status`, `instructions`, `templates`, `schemas` | 面向制品（artifact）的工作流支持 |
| **Schema** | `schema init`, `schema fork`, `schema validate`, `schema which` | 创建与管理自定义工作流 |
| **配置** | `config` | 查看并修改配置 |
| **工具** | `feedback`, `completion` | 反馈与 Shell 集成 |

---

## 面向人类 vs 面向 Agent 的命令

大多数 CLI 命令面向**人类**在终端中使用；其中一部分也支持通过 JSON 输出，便于**Agent/脚本**调用。

### 仅面向人类的命令

这些命令是交互式的，适合在终端中直接使用：

| 命令 | 用途 |
|---------|---------|
| `openspec-cn init` | 初始化项目（交互式提示） |
| `openspec-cn view` | 交互式仪表盘 |
| `openspec-cn config edit` | 在编辑器中打开配置 |
| `openspec-cn feedback` | 通过 GitHub 提交反馈 |
| `openspec-cn completion install` | 安装 Shell 补全 |

### 兼容 Agent 的命令

这些命令支持 `--json` 输出，便于 AI Agent 和脚本以结构化方式消费：

| 命令 | 人类使用 | Agent 使用 |
|---------|-----------|-----------|
| `openspec-cn list` | 浏览变更/规范 | `--json` 输出结构化数据 |
| `openspec-cn show <item>` | 查看内容 | `--json` 便于解析 |
| `openspec-cn validate` | 检查问题 | `--all --json` 批量校验 |
| `openspec-cn status` | 查看制品进度 | `--json` 输出结构化状态 |
| `openspec-cn instructions` | 获取下一步指引 | `--json` 获取 Agent 指令 |
| `openspec-cn templates` | 查询模板路径 | `--json` 解析模板解析结果 |
| `openspec-cn schemas` | 列出可用 schema | `--json` 发现 schema |
| `openspec-cn workspace setup --no-interactive` | 使用显式输入创建工作区 | `--json` 输出结构化设置信息 |
| `openspec-cn workspace list` | 浏览已知工作区 | `--json` 输出类型化工作区对象 |
| `openspec-cn workspace link` | 关联仓库或文件夹 | `--json` 输出结构化关联信息 |
| `openspec-cn workspace relink` | 修复已关联的路径 | `--json` 输出结构化关联信息 |
| `openspec-cn workspace doctor` | 检查单个工作区 | `--json` 输出结构化状态信息 |
| `openspec-cn workspace update` | 刷新工作区本地指引和 Agent 技能 | `--tools` 选择 Agent；配置文件选择工作流 |
| `openspec-cn context-store setup <id>` | 创建本地上下文存储 | `--json` 配合显式输入输出结构化设置信息 |
| `openspec-cn context-store register <path>` | 注册现有上下文存储 | `--json` 输出结构化注册信息 |
| `openspec-cn context-store unregister <id>` | 取消本地上下文存储注册 | `--json` 输出结构化清理信息 |
| `openspec-cn context-store remove <id>` | 删除已注册的本地上下文存储文件夹 | `--yes --json` 非交互式删除 |
| `openspec-cn context-store list` | 浏览已注册的上下文存储 | `--json` 输出结构化注册列表 |
| `openspec-cn context-store doctor` | 检查本地存储设置 | `--json` 输出结构化诊断信息 |
| `openspec-cn initiative list` | 浏览共享 initiative | `--json` 输出结构化 initiative 记录 |
| `openspec-cn initiative show <id>` | 解析 initiative | `--json` 输出规范路径和元数据 |
| `openspec-cn new change <id>` | 创建仓库本地变更脚手架 | `--json`，加上 `--initiative` 用于共享协调链接 |
| `openspec-cn set change <id>` | 更新已提交的变更元数据 | `--json`，加上 `--initiative` 用于共享协调链接 |

---

## 全局选项

这些选项适用于所有命令：

| 选项 | 说明 |
|--------|-------------|
| `--version`, `-V` | 显示版本号 |
| `--no-color` | 禁用彩色输出 |
| `--help`, `-h` | 显示命令帮助 |

---

## 初始化命令

### `openspec-cn init`

在你的项目中初始化 OpenSpec。会创建目录结构并配置 AI 工具集成。

默认行为使用全局配置的默认值：配置文件 `core`，交付方式 `both`，工作流 `propose, explore, apply, sync, archive`。

```
openspec-cn init [path] [options]
```

**参数：**

| 参数 | 必填 | 说明 |
|----------|----------|-------------|
| `path` | 否 | 目标目录（默认：当前目录） |

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--tools <list>` | 非交互式配置 AI 工具。可用 `all`、`none` 或英文逗号分隔列表 |
| `--force` | 无需提示，自动清理遗留文件 |
| `--profile <profile>` | 覆盖全局配置文件（`core` 或 `custom`） |

`--profile custom` 使用当前在全局配置中选定的工作流（`openspec-cn config profile`）。

**支持的工具 ID（`--tools`）：** `amazon-q`, `antigravity`, `auggie`, `bob`, `claude`, `cline`, `codex`, `forgecode`, `codebuddy`, `continue`, `costrict`, `crush`, `cursor`, `factory`, `gemini`, `github-copilot`, `iflow`, `junie`, `kilocode`, `kimi`, `kiro`, `opencode`, `pi`, `qoder`, `lingma`, `qwen`, `roocode`, `trae`, `windsurf`

**示例：**

```bash
# 交互式初始化
openspec-cn init

# 在指定目录初始化
openspec-cn init ./my-project

# 非交互式：配置 Claude 与 Cursor
openspec-cn init --tools claude,cursor

# 配置所有支持的工具
openspec-cn init --tools all

# 覆盖此次运行的配置文件
openspec-cn init --profile core

# 跳过提示并自动清理旧文件
openspec-cn init --force
```

**会创建的内容：**

```
openspec/
├── specs/              # 规范（source of truth）
├── changes/            # 变更（proposed changes）
└── config.yaml         # 项目配置

.claude/skills/         # Claude Code 技能（如果选择了 claude）
.cursor/skills/         # Cursor 技能（如果选择了 cursor）
.cursor/commands/       # Cursor OPSX 命令（如果交付方式包含 commands）
... （其他工具配置）
```

---

### `openspec-cn update`

升级 CLI 后更新 OpenSpec 指令文件。使用当前全局配置文件、选定的工作流和交付方式重新生成 AI 工具配置文件。

```
openspec-cn update [path] [options]
```

**参数：**

| 参数 | 必填 | 说明 |
|----------|----------|-------------|
| `path` | 否 | 目标目录（默认：当前目录） |

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--force` | 即使文件已是最新，也强制更新 |

**示例：**

```bash
# npm 升级后刷新指令文件
npm update @fission-ai/openspec
openspec-cn update
```

---

## 工作区命令

工作区命令处于 beta 阶段。以下本地视图模型是当前方向，但外部自动化、集成和长期工作流应仍将命令行为、状态文件和 JSON 输出视为可能变化的。

协调工作区是关联仓库或文件夹的机器本地视图。工作区可见性不等同于变更承诺：关联 OpenSpec 应该了解的仓库或文件夹，然后在准备好规划具体工作时创建变更。

### `openspec-cn workspace setup`

在标准 OpenSpec 工作区位置创建工作区，并关联至少一个现有仓库或文件夹。

```bash
openspec-cn workspace setup [options]
```

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--name <name>` | 工作区名称，必须为 kebab-case 格式 |
| `--link <path>` | 关联现有仓库或文件夹，从文件夹名推断关联名称 |
| `--link <name>=<path>` | 关联现有仓库或文件夹，指定显式关联名称 |
| `--opener <id>` | 在非交互式设置中存储首选打开器：`codex-cli`、`claude`、`github-copilot` 或 `editor` |
| `--tools <tools>` | 为 Agent 安装工作区本地 OpenSpec 技能。使用 `all`、`none` 或逗号分隔的工具 ID |
| `--no-interactive` | 禁用提示；需要 `--name` 和至少一个 `--link` |
| `--json` | 输出 JSON；需要 `--no-interactive` |

**示例：**

```bash
openspec-cn workspace setup
openspec-cn workspace setup --no-interactive --name platform --link /repos/api --link web=/repos/web
openspec-cn workspace setup --no-interactive --name platform --link /repos/api --opener codex-cli
openspec-cn workspace setup --no-interactive --name platform --link /repos/api --tools codex,claude
openspec-cn workspace setup --no-interactive --json --name checkout --link /repos/platform/apps/checkout
```

交互式设置会询问首选打开器，并可以为选定的 Agent 安装工作区本地 OpenSpec 技能。非交互式设置仅在提供 `--opener` 时存储首选打开器；否则 `workspace open` 会在支持的打开器可用时在交互式终端中提示，或要求脚本传递 `--agent <tool>` 或 `--editor`。

工作区技能安装在此 beta 阶段仅限于技能：即使全局交付方式为 `commands` 或 `both`，工作区设置也只在工作区根目录写入 Agent 技能文件夹，不创建斜杠命令文件。活跃的全局配置文件选择安装哪些工作流技能；`--tools` 选择哪些 Agent 接收它们。如果在非交互式设置中省略 `--tools`，则不安装技能，可稍后使用 `workspace update --tools <ids>` 添加。

### `openspec-cn workspace list`

列出本地注册表中已知的 OpenSpec 工作区。

```bash
openspec-cn workspace list [--json]
openspec-cn workspace ls [--json]
```

列表显示每个工作区位置和关联的仓库或文件夹。过期的注册表记录会被报告但不会被修改。

### `openspec-cn workspace link`

为工作区记录现有的仓库或文件夹。

```bash
openspec-cn workspace link [name] <path> [options]
```

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--workspace <name>` | 从本地注册表选择已知的工作区 |
| `--json` | 输出 JSON |
| `--no-interactive` | 禁用工作区选择器提示 |

**示例：**

```bash
openspec-cn workspace link /repos/api
openspec-cn workspace link api-service /repos/api
openspec-cn workspace link --workspace platform /repos/platform/apps/checkout
```

路径必须已存在。相对路径会在 OpenSpec 将验证后的绝对路径存储到机器本地工作区状态之前，根据命令的当前目录进行解析。关联的路径可以是完整仓库、包、服务、应用或没有仓库本地 `openspec/` 状态的文件夹。

### `openspec-cn workspace relink`

修复或更改现有关联的本地路径。

```bash
openspec-cn workspace relink <name> <path> [options]
```

路径必须已存在。Relink 仅更新稳定关联名称对应的机器本地路径。

### `openspec-cn workspace doctor`

检查当前机器上工作区能解析的内容。

```bash
openspec-cn workspace doctor [options]
```

Doctor 显示工作区位置、关联的仓库或文件夹、缺失的路径、存在时的仓库本地 specs 路径，以及建议的修复方法。JSON 输出还包含用于兼容性的工作区规划路径。它仅报告问题，不会自动修复。

需要指定工作区的命令在从工作区文件夹或子目录运行时使用当前工作区。在其他位置，传递 `--workspace <name>`，在交互式终端中从选择器选取，或在恰好只有一个已知工作区时依赖它。在 `--json` 或 `--no-interactive` 模式下，模糊的选择会以结构化状态错误失败并建议使用 `--workspace <name>`。

JSON 响应使用类型化对象加 `status` 数组。主要数据位于 `workspace`、`workspaces` 或 `link` 中；警告和错误位于 `status` 中。

### `openspec-cn workspace update`

刷新工作区本地 OpenSpec 指引和 Agent 技能。

```bash
openspec-cn workspace update [name] [options]
```

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--workspace <name>` | 从本地注册表选择已知的工作区 |
| `--tools <tools>` | 选择工作区技能的 Agent。使用 `all`、`none` 或逗号分隔的工具 ID |
| `--json` | 输出 JSON |
| `--no-interactive` | 禁用工作区选择器提示 |

**示例：**

```bash
openspec-cn workspace update
openspec-cn workspace update platform
openspec-cn workspace update --workspace platform --tools codex,claude
openspec-cn workspace update --workspace platform --tools none
```

`workspace update` 刷新生成的工作区指引块和本地开放界面。对于 Agent 技能，当省略 `--tools` 时会复用存储的工作区技能 Agent 选择。传递 `--tools` 会替换该存储选择。它只刷新工作区根目录中 OpenSpec 管理的工作流技能目录，移除取消选择的受管工作流技能，并保持关联的仓库和文件夹不变。

在工作区内运行 `openspec-cn update` 会重定向到 `openspec-cn workspace update`；在仓库本地项目内运行 `openspec-cn update` 以更新仓库拥有的工具文件。

### `openspec-cn workspace open`

通过存储的首选打开器、单次会话 Agent 覆盖或 VS Code 编辑器模式打开工作区工作集。

```bash
openspec-cn workspace open [name] [options]
```

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--workspace <name>` | 位置参数工作区名称的别名 |
| `--initiative <id>` | 以本地工作区视图打开 initiative。接受 `<id>` 或 `<store>/<id>` |
| `--store <id>` | `--initiative` 的已注册上下文存储 ID |
| `--store-path <path>` | `--initiative` 的现有本地上下文存储根路径 |
| `--agent <tool>` | 单次会话 Agent 覆盖：`codex-cli`、`claude` 或 `github-copilot` |
| `--editor` | 以普通编辑器工作区方式打开维护的 VS Code 工作区文件 |
| `--no-interactive` | 禁用工作区和打开器选择器提示 |

**示例：**

```bash
openspec-cn workspace open
openspec-cn workspace open platform
openspec-cn workspace open platform --agent github-copilot
openspec-cn workspace open --agent codex-cli
openspec-cn workspace open --editor
openspec-cn workspace open --initiative billing-launch --store platform
openspec-cn workspace open --initiative platform/billing-launch
```

`workspace open` 在工作区内运行时使用当前工作区，在其他位置运行时自动选择唯一已知的工作区，多个工作区已知时询问用户选择。`--agent` 和 `--editor` 不会更改存储的首选打开器。同时传递两个打开器覆盖是错误的；选择 `--agent <tool>` 或 `--editor`。

使用 `--initiative` 时，OpenSpec 为该 initiative 准备或选择私有本地工作区视图。注册表选择的存储按 ID 存储；`--store-path` 存储运行时本地路径选择器，因为工作区视图是私有本地状态。

OpenSpec 在工作区根目录维护 `<workspace-name>.code-workspace` 文件，用于 VS Code 编辑器和 GitHub Copilot-in-VS-Code 打开。该文件是机器本地工作区视图状态。

维护的 VS Code 工作区首先列出有效的关联仓库或文件夹，然后是附加时的 initiative 上下文，最后是 OpenSpec 工作区文件。VS Code 将这些条目显示为多根工作区。

根工作区打开使关联的仓库或文件夹对探索和上下文可见。实施编辑应仅在显式用户请求和正常 OpenSpec 实施工作流之后开始。

---

## 共享上下文命令

上下文存储和 initiative 是 beta 协调界面。上下文存储是持久化共享上下文的本地注册，通常是 Git 支持的文件夹或克隆。Initiative 是上下文存储内的共享协调上下文；仓库本地变更可以链接到它，而无需将共享计划复制到每个仓库。

### `openspec-cn context-store setup`

创建并注册本地上下文存储。在终端中无参数时，OpenSpec 会引导用户完成设置。Agent 和脚本应传递显式输入并使用 `--json`。

```bash
openspec-cn context-store setup [id] [options]
```

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--path <path>` | 上下文存储文件夹路径；默认为 OpenSpec 的受管本地数据目录 |
| `--init-git` | 在上下文存储中初始化 Git 仓库 |
| `--no-init-git` | 不初始化 Git 仓库 |
| `--json` | 输出 JSON |

当省略 `--path` 时，setup 在 `getGlobalDataDir()/context-stores/<id>` 下创建存储：设置了 `XDG_DATA_HOME` 时为 `$XDG_DATA_HOME/openspec/context-stores/<id>`，Unix 风格回退时为 `~/.local/share/openspec/context-stores/<id>`。当你想将存储放在可见的克隆或团队特定文件夹中时传递 `--path`。

**示例：**

```bash
openspec-cn context-store setup
openspec-cn context-store setup team-context
openspec-cn context-store setup team-context --path /repos/team-context --no-init-git
openspec-cn context-store setup team-context --json --no-init-git
```

### `openspec-cn context-store register`

注册现有的本地上下文存储文件夹。

```bash
openspec-cn context-store register [path] [options]
```

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--id <id>` | 上下文存储 ID；默认使用存储元数据或文件夹名 |
| `--json` | 输出 JSON |

### `openspec-cn context-store unregister`

取消本地上下文存储注册但不删除文件。

```bash
openspec-cn context-store unregister <id> [--json]
```

当存储已移动、克隆到其他位置，或不应再在此机器上由 OpenSpec 显示时使用。

### `openspec-cn context-store remove`

取消本地上下文存储注册并删除其本地文件夹。

```bash
openspec-cn context-store remove <id> [--yes] [--json]
```

`remove` 在交互式终端中删除前会显示确切的文件夹。Agent、脚本和 JSON 调用者必须传递 `--yes` 以确认删除。OpenSpec 拒绝删除不包含匹配上下文存储元数据的文件夹。

### `openspec-cn context-store list`

列出本地注册的上下文存储。

```bash
openspec-cn context-store list [--json]
openspec-cn context-store ls [--json]
```

### `openspec-cn context-store doctor`

检查本地上下文存储注册、元数据和 Git 存在情况。

```bash
openspec-cn context-store doctor [id] [--json]
```

Doctor 仅用于诊断；它报告缺失的根目录、元数据不匹配和无效的本地注册表状态，而不修改存储。

### `openspec-cn initiative create`

在上下文存储中创建 initiative。

```bash
openspec-cn initiative create <id> --title <title> --summary <summary> [options]
```

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--store <id>` | 来自本地注册表的上下文存储 ID |
| `--store-path <path>` | 现有的本地上下文存储根路径 |
| `--title <title>` | Initiative 标题 |
| `--summary <summary>` | Initiative 摘要 |
| `--json` | 输出 JSON |

### `openspec-cn initiative list`

列出 initiative。不带选择器时，搜索所有已注册的上下文存储并在 `status` 中报告部分读取警告。

```bash
openspec-cn initiative list [options]
openspec-cn initiative ls [options]
```

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--store <id>` | 列出一个已注册的上下文存储 |
| `--store-path <path>` | 列出一个现有的本地上下文存储根路径 |
| `--json` | 输出 JSON |

### `openspec-cn initiative show`

解析 initiative 并打印其规范位置。

```bash
openspec-cn initiative show <id> [options]
openspec-cn initiative show <store>/<id> [options]
```

不带 `--store` 时，OpenSpec 搜索已注册的上下文存储。如果相同的 initiative ID 存在于多个存储中，传递 `--store <id>` 或使用 `<store>/<id>` 格式。

---

## 浏览命令

### `openspec-cn list`

列出项目中的变更（changes）或规范（specs）。

```
openspec-cn list [options]
```

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--specs` | 列出规范而不是变更 |
| `--changes` | 列出变更（默认） |
| `--sort <order>` | 按 `recent`（默认）或 `name` 排序 |
| `--json` | 以 JSON 输出 |

**示例：**

```bash
# 列出所有进行中的变更
openspec-cn list

# 列出所有规范
openspec-cn list --specs

# 脚本使用的 JSON 输出
openspec-cn list --json
```

**输出（文本）：**

```
活跃的变更:
  add-dark-mode     UI 主题切换支持
  fix-login-bug     会话超时处理
```

---

### `openspec-cn view`

打开交互式仪表盘，用于浏览项目中的规范（specs）与变更（changes）。

```
openspec-cn view
```

会启动一个基于终端的交互界面，方便你在项目规范与变更之间快速导航。

---

### `openspec-cn show`

查看某个变更（change）或规范（spec）的详细内容。

```
openspec-cn show [item-name] [options]
```

**参数：**

| 参数 | 必填 | 说明 |
|----------|----------|-------------|
| `item-name` | 否 | 变更或规范的名称（省略时会交互式提示选择） |

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--type <type>` | 指定类型：`change` 或 `spec`（当名称不唯一时使用） |
| `--json` | 以 JSON 输出 |
| `--no-interactive` | 禁用交互式提示 |

**仅变更（change）相关选项：**

| 选项 | 说明 |
|--------|-------------|
| `--deltas-only` | 仅显示增量规范（delta specs）（JSON 模式） |

**仅规范（spec）相关选项：**

| 选项 | 说明 |
|--------|-------------|
| `--requirements` | 仅显示需求（requirements），不包含场景（JSON 模式） |
| `--no-scenarios` | 排除场景内容（JSON 模式） |
| `-r, --requirement <id>` | 按 1 开始的索引显示某条特定需求（JSON 模式） |

**示例：**

```bash
# 交互式选择
openspec-cn show

# 查看指定变更
openspec-cn show add-dark-mode

# 查看指定规范
openspec-cn show auth --type spec

# 以 JSON 输出便于解析
openspec-cn show add-dark-mode --json
```

---

## 校验命令

### `openspec-cn validate`

检查变更与规范是否存在结构性问题。

```
openspec-cn validate [item-name] [options]
```

**参数：**

| 参数 | 必填 | 说明 |
|----------|----------|-------------|
| `item-name` | 否 | 要校验的具体条目（省略时会交互式提示选择） |

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--all` | 校验所有变更与规范 |
| `--changes` | 校验所有变更 |
| `--specs` | 校验所有规范 |
| `--type <type>` | 当名称不唯一时指定类型：`change` 或 `spec` |
| `--strict` | 启用严格校验模式 |
| `--json` | 以 JSON 输出 |
| `--concurrency <n>` | 最大并发校验数（默认：6，或使用环境变量 `OPENSPEC_CONCURRENCY`） |
| `--no-interactive` | 禁用交互式提示 |

**示例：**

```bash
# 交互式校验
openspec-cn validate

# 校验指定变更
openspec-cn validate add-dark-mode

# 校验所有变更
openspec-cn validate --changes

# 校验全部内容并以 JSON 输出（用于 CI/脚本）
openspec-cn validate --all --json

# 严格校验并提高并发度
openspec-cn validate --all --strict --concurrency 12
```

**输出（文本）：**

```
正在验证 add-dark-mode...
  ✓ proposal.md 有效
  ✓ specs/ui/spec.md 有效
  ⚠ design.md: 缺少 "Technical Approach" 部分

发现 1 个警告
```

**输出（JSON）：**

```json
{
  "version": "1.0.0",
  "results": {
    "changes": [
      {
        "name": "add-dark-mode",
        "valid": true,
        "warnings": ["design.md: missing 'Technical Approach' section"]
      }
    ]
  },
  "summary": {
    "total": 1,
    "valid": 1,
    "invalid": 0
  }
}
```

---

## 生命周期命令

### `openspec-cn archive`

归档已完成的变更，并将增量规范（delta specs）合并到主规范中。

```
openspec-cn archive [change-name] [options]
```

**参数：**

| 参数 | 必填 | 说明 |
|----------|----------|-------------|
| `change-name` | 否 | 要归档的变更名称（省略时会交互式提示选择） |

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `-y, --yes` | 跳过确认提示 |
| `--skip-specs` | 跳过规范更新（适用于基础设施/工具/纯文档类变更） |
| `--no-validate` | 跳过校验（需要额外确认） |

**示例：**

```bash
# 交互式归档
openspec-cn archive

# 归档指定变更
openspec-cn archive add-dark-mode

# 无提示归档（CI/脚本）
openspec-cn archive add-dark-mode --yes

# 归档不影响规范的工具类变更
openspec-cn archive update-ci-config --skip-specs
```

**它会做什么：**

1. 校验变更（除非使用 `--no-validate`）
2. 询问确认（除非使用 `--yes`）
3. 将增量规范合并到 `openspec/specs/`
4. 将变更目录移动到 `openspec/changes/archive/YYYY-MM-DD-<name>/`

---

## 工作流命令

这些命令支持面向制品的 OPSX 工作流。对于人类检查进度和 Agent 确定下一步都很有用。

### `openspec-cn new change`

创建仓库本地变更目录和可选的已提交元数据。

```bash
openspec-cn new change <name> [options]
```

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--description <text>` | 添加到 `README.md` 的描述 |
| `--goal <text>` | 与变更一起存储的工作区产品目标 |
| `--areas <names>` | 逗号分隔的受影响工作区关联名称 |
| `--initiative <id>` | 将仓库本地变更链接到 initiative |
| `--store <id>` | `--initiative` 的上下文存储 ID |
| `--store-path <path>` | `--initiative` 的现有本地上下文存储根路径 |
| `--schema <name>` | 使用的工作流 schema |
| `--json` | 输出 JSON |

**示例：**

```bash
openspec-cn new change add-billing-api --initiative billing-launch --store platform
openspec-cn new change add-billing-api --initiative platform/billing-launch --json
```

### `openspec-cn set change`

更新已提交的仓库本地变更元数据，无需重新创建变更。

```bash
openspec-cn set change <name> [options]
```

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--initiative <id>` | 将仓库本地变更链接到 initiative |
| `--store <id>` | `--initiative` 的上下文存储 ID |
| `--store-path <path>` | `--initiative` 的现有本地上下文存储根路径 |
| `--json` | 输出 JSON |

`set change --initiative` 在请求的链接已存在时是幂等的，并拒绝替换不同的现有 initiative 链接。

### `openspec-cn status`

查看某个变更的制品（artifact）完成状态。

```
openspec-cn status [options]
```

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--change <id>` | 变更名称（省略时会交互式提示选择） |
| `--schema <name>` | 覆盖使用的 schema（默认会从变更配置中自动识别） |
| `--json` | 以 JSON 输出 |

**示例：**

```bash
# 交互式查看状态
openspec-cn status

# 查看指定变更的状态
openspec-cn status --change add-dark-mode

# 以 JSON 输出供 Agent/脚本使用
openspec-cn status --change add-dark-mode --json
```

**输出（文本）：**

```
变更: add-dark-mode
架构: spec-driven
进度: 2/4 个制品已完成

[x] proposal
[ ] design
[x] specs
[-] tasks (被以下内容阻塞: design)
```

**输出（JSON）：**

```json
{
  "changeName": "add-dark-mode",
  "schemaName": "spec-driven",
  "isComplete": false,
  "applyRequires": ["tasks"],
  "artifacts": [
    {"id": "proposal", "outputPath": "proposal.md", "status": "done"},
    {"id": "design", "outputPath": "design.md", "status": "ready"},
    {"id": "specs", "outputPath": "specs/**/*.md", "status": "done"},
    {"id": "tasks", "outputPath": "tasks.md", "status": "blocked", "missingDeps": ["design"]}
  ]
}
```

---

### `openspec-cn instructions`

获取创建制品（artifact）或执行任务（tasks）的详细指引。供 AI Agent 了解下一步该创建什么内容时使用。

```
openspec-cn instructions [artifact] [options]
```

**参数：**

| 参数 | 必填 | 说明 |
|----------|----------|-------------|
| `artifact` | 否 | 制品 ID：`proposal`、`specs`、`design`、`tasks` 或 `apply` |

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--change <id>` | 变更名称（非交互模式下必填） |
| `--schema <name>` | 覆盖使用的 schema |
| `--json` | 以 JSON 输出 |

**特殊用法：** 使用 `apply` 作为制品 ID 来获取任务执行指引。

**示例：**

```bash
# 获取下一个制品的指引
openspec-cn instructions --change add-dark-mode

# 获取特定制品的指引
openspec-cn instructions design --change add-dark-mode

# 获取任务执行指引
openspec-cn instructions apply --change add-dark-mode

# 以 JSON 输出供 Agent 使用
openspec-cn instructions design --change add-dark-mode --json
```

**输出包含：**

- 制品的模板内容
- 来自配置的项目上下文
- 依赖制品的内容
- 来自配置的每个制品规则

---

### `openspec-cn templates`

显示某个 schema 中所有制品（artifact）的模板文件路径。

```
openspec-cn templates [options]
```

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--schema <name>` | 要查看的 schema（默认：`spec-driven`） |
| `--json` | 以 JSON 输出 |

**示例：**

```bash
# 显示默认 schema 的模板路径
openspec-cn templates

# 显示自定义 schema 的模板
openspec-cn templates --schema my-workflow

# 以 JSON 输出供程序化使用
openspec-cn templates --json
```

**输出（文本）：**

```
Schema: spec-driven

Templates:
  proposal  → ~/.openspec/schemas/spec-driven/templates/proposal.md
  specs     → ~/.openspec/schemas/spec-driven/templates/specs.md
  design    → ~/.openspec/schemas/spec-driven/templates/design.md
  tasks     → ~/.openspec/schemas/spec-driven/templates/tasks.md
```

---

### `openspec-cn schemas`

列出可用的工作流 schema，包含描述与制品流程。

```
openspec-cn schemas [options]
```

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--json` | 以 JSON 输出 |

**示例：**

```bash
openspec-cn schemas
```

**输出：**

```
可用 schemas:

  spec-driven (package)
    默认的规范驱动开发工作流
    流程: proposal → specs → design → tasks

  my-custom (project)
    本项目的自定义工作流
    流程: research → proposal → tasks
```

---

## Schema 命令

用于创建和管理自定义工作流 schema 的命令。

### `openspec-cn schema init`

创建一个新的项目本地 schema。

```
openspec-cn schema init <name> [options]
```

**参数：**

| 参数 | 必填 | 说明 |
|----------|----------|-------------|
| `name` | 是 | schema 名称（kebab-case 格式） |

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--description <text>` | schema 描述 |
| `--artifacts <list>` | 逗号分隔的制品 ID（默认：`proposal,specs,design,tasks`） |
| `--default` | 设为项目默认 schema |
| `--no-default` | 不提示设为默认 |
| `--force` | 覆盖已存在的 schema |
| `--json` | 以 JSON 输出 |

**示例：**

```bash
# 交互式创建 schema
openspec-cn schema init research-first

# 非交互式创建，指定特定制品
openspec-cn schema init rapid \
  --description "快速迭代工作流" \
  --artifacts "proposal,tasks" \
  --default
```

**会创建的内容：**

```
openspec/schemas/<name>/
├── schema.yaml           # Schema 定义
└── templates/
    ├── proposal.md       # 每个制品的模板
    ├── specs.md
    ├── design.md
    └── tasks.md
```

---

### `openspec-cn schema fork`

复制一个现有的 schema 到你的项目中进行自定义。

```
openspec-cn schema fork <source> [name] [options]
```

**参数：**

| 参数 | 必填 | 说明 |
|----------|----------|-------------|
| `source` | 是 | 要复制的 schema |
| `name` | 否 | 新 schema 名称（默认：`<source>-custom`） |

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--force` | 覆盖已存在的目标 |
| `--json` | 以 JSON 输出 |

**示例：**

```bash
# 复制内置的 spec-driven schema
openspec-cn schema fork spec-driven my-workflow
```

---

### `openspec-cn schema validate`

校验 schema 的结构与模板。

```
openspec-cn schema validate [name] [options]
```

**参数：**

| 参数 | 必填 | 说明 |
|----------|----------|-------------|
| `name` | 否 | 要校验的 schema（省略时校验所有） |

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--verbose` | 显示详细校验步骤 |
| `--json` | 以 JSON 输出 |

**示例：**

```bash
# 校验指定 schema
openspec-cn schema validate my-workflow

# 校验所有 schema
openspec-cn schema validate
```

---

### `openspec-cn schema which`

显示 schema 的解析来源（用于调试优先级）。

```
openspec-cn schema which [name] [options]
```

**参数：**

| 参数 | 必填 | 说明 |
|----------|----------|-------------|
| `name` | 否 | schema 名称 |

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--all` | 列出所有 schema 及其来源 |
| `--json` | 以 JSON 输出 |

**示例：**

```bash
# 检查 schema 的来源
openspec-cn schema which spec-driven
```

**输出：**

```
spec-driven 解析来源: package
  来源: /usr/local/lib/node_modules/@fission-ai/openspec/schemas/spec-driven
```

**Schema 优先级：**

1. 项目：`openspec/schemas/<name>/`
2. 用户：`~/.local/share/openspec/schemas/<name>/`
3. 包：内置 schema

---

## 配置命令

### `openspec-cn config`

查看并修改全局 OpenSpec 配置。

```
openspec-cn config <subcommand> [options]
```

**子命令：**

| 子命令 | 说明 |
|------------|-------------|
| `path` | 显示配置文件路径 |
| `list` | 显示所有当前设置 |
| `get <key>` | 获取特定值 |
| `set <key> <value>` | 设置值 |
| `unset <key>` | 移除键 |
| `reset` | 重置为默认值 |
| `edit` | 在 `$EDITOR` 中打开编辑 |
| `profile [preset]` | 交互式或通过预设配置工作流配置文件 |

**示例：**

```bash
# 显示配置文件路径
openspec-cn config path

# 列出所有设置
openspec-cn config list

# 获取特定值
openspec-cn config get telemetry.enabled

# 设置值
openspec-cn config set telemetry.enabled false

# 显式设置字符串值
openspec-cn config set user.name "我的名字" --string

# 移除自定义设置
openspec-cn config unset user.name

# 重置所有配置
openspec-cn config reset --all --yes

# 在编辑器中编辑配置
openspec-cn config edit

# 通过基于操作的向导配置配置文件
openspec-cn config profile

# 快速预设：切换工作流为 core（保持交付方式不变）
openspec-cn config profile core
```

`openspec-cn config profile` 首先显示当前状态摘要，然后让你选择：
- 更改交付方式 + 工作流
- 仅更改交付方式
- 仅更改工作流
- 保持当前设置（退出）

如果保持当前设置，不会写入任何更改，也不会显示更新提示。
如果没有配置更改，但当前项目或工作区文件与全局配置文件/交付方式不同步，OpenSpec 会显示警告并建议对仓库本地项目运行 `openspec-cn update`，或对工作区本地指引和技能运行 `openspec-cn workspace update`。
按 `Ctrl+C` 也会干净地取消流程（无堆栈跟踪），并以退出码 `130` 退出。
在工作流检查列表中，`[x]` 表示该工作流已在全局配置中选定。要将这些选择应用到项目文件，请运行 `openspec-cn update`（或在项目内时选择"立即将更改应用到此项目？"）。在工作区内，使用 `openspec-cn workspace update` 刷新工作区本地指引和技能；对于生成的 Agent 工作流文件，这仅限于技能，不会生成工作区斜杠命令。

**交互式示例：**

```bash
# 仅更新交付方式
openspec-cn config profile
# 选择：仅更改交付方式
# 选择交付方式：仅技能

# 仅更新工作流
openspec-cn config profile
# 选择：仅更改工作流
# 在检查列表中切换工作流，然后确认
```

---

## 实用工具命令

### `openspec-cn feedback`

提交关于 OpenSpec 的反馈。会创建一个 GitHub issue。

```
openspec-cn feedback <message> [options]
```

**参数：**

| 参数 | 必填 | 说明 |
|----------|----------|-------------|
| `message` | 是 | 反馈消息 |

**选项：**

| 选项 | 说明 |
|--------|-------------|
| `--body <text>` | 详细描述 |

**要求：** 必须安装并认证 GitHub CLI (`gh`)。

**示例：**

```bash
openspec-cn feedback "添加自定义制品类型支持" \
  --body "我希望能够定义自己的制品类型，而不仅限于内置的类型。"
```

---

### `openspec-cn completion`

管理 OpenSpec CLI 的 Shell 自动补全。

```
openspec-cn completion <subcommand> [shell]
```

**子命令：**

| 子命令 | 说明 |
|------------|-------------|
| `generate [shell]` | 输出补全脚本到标准输出 |
| `install [shell]` | 为你的 Shell 安装补全 |
| `uninstall [shell]` | 移除已安装的补全 |

**支持的 Shell：** `bash`, `zsh`, `fish`, `powershell`

**示例：**

```bash
# 安装补全（自动检测 Shell）
openspec-cn completion install

# 为特定 Shell 安装
openspec-cn completion install zsh

# 生成脚本用于手动安装
openspec-cn completion generate bash > ~/.bash_completion.d/openspec-cn

# 卸载补全
openspec-cn completion uninstall
```

---

## 退出码

| 代码 | 含义 |
|------|---------|
| `0` | 成功 |
| `1` | 错误（校验失败、文件缺失等） |

---

## 环境变量

| 变量 | 描述 |
|----------|-------------|
| `OPENSPEC_TELEMETRY` | Set to `0` to disable telemetry |
| `DO_NOT_TRACK` | Set to `1` to disable telemetry (standard DNT signal) |
| `OPENSPEC_CONCURRENCY` | 批量校验的默认并发数（默认：6） |
| `EDITOR` 或 `VISUAL` | 用于 `openspec-cn config edit` 的编辑器 |
| `NO_COLOR` | 设置时禁用彩色输出 |

---

## 相关文档

- [命令](commands.md) - AI 斜杠命令（`/opsx:propose`、`/opsx:apply` 等）
- [工作流](workflows.md) - 常见模式及何时使用每个命令
- [自定义](customization.md) - 创建自定义 schema 和模板
- [入门指南](getting-started.md) - 首次设置指南
