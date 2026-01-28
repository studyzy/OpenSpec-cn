# CLI 参考手册

OpenSpec CLI（`openspec-cn`）提供一组终端命令，用于项目初始化、校验、状态查看与管理。这些命令与 AI 的斜杠命令（如 `/opsx:new`）相互补充；斜杠命令详见 [命令](commands.md)。

## 总览

| 分类 | 命令 | 用途 |
|----------|----------|---------|
| **初始化** | `init`, `update` | 在项目中初始化并更新 OpenSpec |
| **浏览** | `list`, `view`, `show` | 浏览变更（changes）与规范（specs） |
| **校验** | `validate` | 检查变更与规范是否存在问题 |
| **生命周期** | `archive` | 归档已完成的变更 |
| **工作流** | `status`, `instructions`, `templates`, `schemas` | 面向制品（artifact）的工作流支持 |
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

**支持的工具：** `amazon-q`, `antigravity`, `auggie`, `claude`, `cline`, `codex`, `codebuddy`, `continue`, `costrict`, `crush`, `cursor`, `factory`, `gemini`, `github-copilot`, `iflow`, `kilocode`, `opencode`, `qoder`, `qwen`, `roocode`, `windsurf`

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

# 跳过提示并自动清理遗留文件
openspec-cn init --force
```

**会创建的内容：**

```
openspec/
├── specs/              # 规范（source of truth）
├── changes/            # 变更（proposed changes）
└── config.yaml         # 项目配置

.claude/skills/         # Claude Code 技能文件（若选择 claude）
.cursor/rules/          # Cursor 规则（若选择 cursor）
...（其他工具配置）
```

---

### `openspec-cn update`

在升级 CLI 后更新 OpenSpec 的指令文件。会重新生成各类 AI 工具配置文件。

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
Active changes:
  add-dark-mode     UI theme switching support
  fix-login-bug     Session timeout handling
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
Validating add-dark-mode...
  ✓ proposal.md valid
  ✓ specs/ui/spec.md valid
  ⚠ design.md: missing "Technical Approach" section

1 warning found
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
Change: add-dark-mode
Schema: spec-driven

Artifacts:
  ✓ proposal     proposal.md exists
  ✓ specs        specs/ exists
  ◆ design       ready (requires: specs)
  ○ tasks        blocked (requires: design)

Next: 使用 /opsx:continue 创建设计
```

**输出（JSON）：**

```json
{
  "change": "add-dark-mode",
  "schema": "spec-driven",
  "artifacts": [
    {"id": "proposal", "status": "complete", "path": "proposal.md"},
    {"id": "specs", "status": "complete", "path": "specs/"},
    {"id": "design", "status": "ready", "requires": ["specs"]},
    {"id": "tasks", "status": "blocked", "requires": ["design"]}
  ],
  "next": "design"
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
| `OPENSPEC_CONCURRENCY` | 批量校验的默认并发数（默认：6） |
| `EDITOR` 或 `VISUAL` | 用于 `openspec-cn config edit` 的编辑器 |
| `NO_COLOR` | 设置时禁用彩色输出 |

---

## 相关文档

- [命令](commands.md) - AI 斜杠命令（`/opsx:new`、`/opsx:apply` 等）
- [工作流](workflows.md) - 常见模式及何时使用每个命令
- [自定义](customization.md) - 创建自定义 schema 和模板
- [入门指南](getting-started.md) - 首次设置指南
