# CLI

> `openspec-cn` 终端命令。

<!-- Installing, updating, and uninstalling the CLI itself live in installation.md. -->

## 命令

**设置**

| 命令 | 作用 |
|---|---|
| [`openspec-cn init`](#openspec-cn-init) | 在项目中初始化 OpenSpec。 |
| [`openspec-cn update`](#openspec-cn-update) | 更新 OpenSpec 已安装的指令文件。 |
| [`openspec-cn config`](#openspec-cn-config) | 查看和修改全局配置。 |

**变更与 specs**

| 命令 | 作用 |
|---|---|
| [`openspec-cn list`](#openspec-cn-list) | 列出变更，或配合 `--specs` 列出 specs。 |
| [`openspec-cn show`](#openspec-cn-show) | 以 markdown 或 JSON 打印一个变更或 spec。 |
| [`openspec-cn view`](#openspec-cn-view) | specs 和变更的单屏仪表盘。 |
| [`openspec-cn validate`](#openspec-cn-validate) | 检查变更和 specs 的结构问题。 |
| [`openspec-cn archive`](#openspec-cn-archive) | 把已完成的变更移入归档并更新主 specs。 |

**工作流与 schemas**

你的 Agent 会在工作流期间运行其中大部分命令。

| 命令 | 作用 |
|---|---|
| [`openspec-cn new`](#openspec-cn-new) | 创建新的变更目录。 |
| [`openspec-cn status`](#openspec-cn-status) | 一个或每个活跃变更的制品完成状态。 |
| [`openspec-cn instructions`](#openspec-cn-instructions) | 创建制品、apply 或 archive 的指令。 |
| [`openspec-cn templates`](#openspec-cn-templates) | schema 制品的解析后模板路径。 |
| [`openspec-cn schemas`](#openspec-cn-schemas) | 列出可用的工作流 schemas。 |
| [`openspec-cn schema`](#openspec-cn-schema) | 检查、fork 或创建 schema（实验性）。 |

**多仓库（beta）**

| 命令 | 作用 |
|---|---|
| [`openspec-cn store`](#openspec-cn-store) | 创建和管理 store：注册在你机器上的独立 OpenSpec 仓库。 |
| [`openspec-cn doctor`](#openspec-cn-doctor) | 报告已解析 OpenSpec 根目录的关系健康状况。 |
| [`openspec-cn context`](#openspec-cn-context) | 打印已解析 OpenSpec 根目录的工作上下文。 |
| [`openspec-cn workset`](#openspec-cn-workset) | 组合、保存并打开个人工作视图。 |

**实用工具**

| 命令 | 作用 |
|---|---|
| [`openspec-cn feedback`](#openspec-cn-feedback) | 提交关于 OpenSpec 的反馈。 |
| [`openspec-cn completion`](#openspec-cn-completion) | 安装或生成 shell 补全。 |

**已弃用**

| 命令 | 作用 |
|---|---|
| [`openspec-cn change`](#openspec-cn-change) | show、list 和 validate 针对变更的名词形式。CLI 会警告并指向动词优先的命令。 |
| [`openspec-cn spec`](#openspec-cn-spec) | show、list 和 validate 针对 specs 的名词形式，附带同样的警告。 |

每个命令都支持 `-h, --help`。裸的 `openspec-cn` 命令还支持：

- `-V, --version`：打印 CLI 版本。
- `--no-color`：禁用彩色输出。

## openspec-cn init

在项目中初始化 OpenSpec。

```bash
openspec-cn init                        # 当前目录，交互式工具选择器
openspec-cn init --tools claude,cursor  # 设置特定工具，无提示
openspec-cn init --tools none           # 仅 openspec/ 结构，不生成工具文件
```

没有 `--tools` 时，init 会在交互式终端中提示你选择工具。在非交互终端中，它会设置项目里检测到的工具。若一个都未检测到，则退出 1 并列出有效的 id。

**参数**

| 参数 | 说明 |
|---|---|
| `path` | 要初始化的项目目录。默认：当前目录。缺失时创建。 |

**选项**

| 标志 | 作用 |
|---|---|
| `--tools <tools>` | 逗号分隔的工具 id、`all` 或 `none`。跳过选择器。id 列在[支持的工具](supported-tools.md)中。 |
| `--force` | 不询问就删除旧版 OpenSpec 布局中的文件。交互式运行否则会先确认清理。 |
| `--profile <profile>` | 覆盖本次运行的全局配置 profile：`core`（标准工作流集合）或 `custom`（全局配置中保存的工作流）。 |
| `--no-animation` | 显示静态欢迎屏而不是动画版。 |

**输出**

每个选中的工具都会在自己的目录中获得 OpenSpec 的 skills 和 commands：

```
▌ OpenSpec structure created
✔ Setup complete for Claude Code

OpenSpec Setup Complete

Created: Claude Code
6 skills and 6 commands in .claude/
Config: openspec/config.yaml (schema: spec-driven)

Getting started:
  Start your first change: /opsx:propose "your idea"

Restart your IDE for the new commands to take effect.
```

`--tools none` 只创建 `openspec/config.yaml`。在已初始化的项目上，init 会在原地重写已安装的文件，摘要显示 `Refreshed: Claude Code`，并有 `Config: openspec/config.yaml (exists)`。

**退出码**

- `0`：设置完成。
- `1`：`--tools` 或 `--profile` 值无效，或非交互运行且未检测到任何工具、也没有 `--tools`。

<a id="openspec-update"></a>

## openspec-cn update

更新 OpenSpec 已安装的指令文件。

```bash
openspec-cn update           # 刷新文件版本早于 CLI 的工具
openspec-cn update --force   # 即使文件是最新的也重写
```

update 会找到 init 配置的工具，并把它们生成的文件与 CLI 的版本比较。当存在更新的 OpenSpec 版本时，它会先提议升级 CLI，然后用升级后的版本重新运行。设置 `OPENSPEC_NO_UPDATE_CHECK=1` 可跳过该检查。

**参数**

| 参数 | 说明 |
|---|---|
| `path` | 要更新的项目目录。默认：当前目录。 |

**选项**

| 标志 | 作用 |
|---|---|
| `--force` | 即使每个已配置工具的文件都是最新的也重写。 |

**输出**

当每个工具的文件都与 CLI 版本一致时：

```
✓ All 1 tool(s) up to date (v1.7.0)
  Tools: claude

Use --force to refresh files anyway.
```

当某个工具的文件来自旧版 CLI 时（或使用 `--force`，此时会打印 `Force updating 1 tool(s): claude`）：

```
Updating 1 tool(s): claude (1.6.0 → 1.7.0)

✔ Updated Claude Code

✓ Updated: Claude Code (v1.7.0)
Tools: Claude Code

Restart your IDE for changes to take effect.
```

在没有 OpenSpec 的目录中，update 会拒绝执行：

```
✖ Error: No OpenSpec directory found. Run 'openspec-cn init' first.
```

**退出码**

- `0`：文件已更新，或一切已是最新。
- `1`：路径下没有 OpenSpec 目录，或更新失败。

## openspec-cn config

查看和修改全局配置。

```bash
openspec-cn config list                  # 查看当前设置
openspec-cn config set delivery skills   # 修改一个值
openspec-cn config profile               # 交互式工作流选择器
```

| 子命令 | 作用 |
|---|---|
| `path` | 打印配置文件位置。 |
| `list` | 显示所有当前设置。 |
| `get <key>` | 打印单个值，原始且可脚本化。 |
| `set <key> <value>` | 设置一个值，并强制其类型。 |
| `unset <key>` | 移除某个键，让默认值生效。 |
| `reset` | 将所有配置重置为默认值。 |
| `edit` | 在 `$EDITOR` 中打开配置文件。 |
| `profile [preset]` | 配置交付模式和工作流。 |

配置对你的机器是全局的，以 JSON 存储在 `config path` 指向的位置：设置 `$XDG_CONFIG_HOME` 时为 `$XDG_CONFIG_HOME/openspec/config.json`，否则为 `~/.config/openspec/config.json`（macOS、Linux）或 `%APPDATA%\openspec\config.json`（Windows）。每个子命令都接受 `--scope <scope>`，但目前只有 `global` 可用。任何其他 scope 都会以 `Error: Project-local config is not yet implemented` 退出 1。

### openspec-cn config path

```bash
openspec-cn config path
```

```
/Users/you/.config/openspec/config.json
```

### openspec-cn config list

```bash
openspec-cn config list          # 可读的设置外加 profile 摘要
openspec-cn config list --json   # 原始配置，JSON 形式
```

**选项**

| 标志 | 作用 |
|---|---|
| `--json` | 以 JSON 打印配置对象。 |

**输出**

每个设置，然后是标记值为显式或默认的 profile 摘要：

```
featureFlags: {}
profile: core
delivery: both

Profile settings:
  profile: core (default)
  delivery: both (default)
  workflows: propose, explore, apply, update, sync, archive (from core profile)
```

### openspec-cn config get

```bash
openspec-cn config get delivery
```

**参数**

| 参数 | 说明 |
|---|---|
| `key` | 要读取的键。点号可到达嵌套值（`featureFlags.workspaces`）。 |

**输出**

裸值，可供脚本使用。对象以紧凑 JSON 打印：

```
both
```

**退出码**

- `0`：值已打印。
- `1`：键没有值，且未打印任何内容。

### openspec-cn config set

```bash
openspec-cn config set delivery skills
openspec-cn config set featureFlags.workspaces true
```

**参数**

| 参数 | 说明 |
|---|---|
| `key` | 要写入的键，嵌套值用点号。 |
| `value` | 新值。`true`/`false` 变为布尔值，数字字符串变为数字。 |

**选项**

| 标志 | 作用 |
|---|---|
| `--string` | 将值存为字符串，跳过类型强制转换。 |
| `--allow-unknown` | 允许 schema 不认识的键。 |

**输出**

```
Set featureFlags.workspaces = true
```

未知键和无效值会在保存任何内容前以退出码 1 失败：

```
Error: Invalid configuration key "bogus.key". Unknown top-level key "bogus".
Use "openspec-cn config list" to see available keys.
Pass --allow-unknown to bypass this check.
```

```
Error: Invalid configuration - delivery: Invalid option: expected one of "both"|"skills"|"commands"
```

### openspec-cn config unset

```bash
openspec-cn config unset delivery
```

移除该键，让默认值再次生效。带内置默认值的键始终算作已设置，因此即使你从未设置过，它也会报告成功：

```
Unset delivery (reverted to default)
```

完全没有任何值的键会打印 `Key "featureFlags.nothere" was not set`。两种情况都退出 0。

### openspec-cn config reset

```bash
openspec-cn config reset --all      # 要求确认
openspec-cn config reset --all -y   # 无提示
```

**选项**

| 标志 | 作用 |
|---|---|
| `--all` | 必需。重置所有内容。 |
| `-y, --yes` | 跳过确认提示。 |

**输出**

```
Configuration reset to defaults
```

没有 `--all` 时它退出 1 并打印用法行。

**退出码**

- `0`：重置完成，或你在提示处回答了否。
- `1`：缺少 `--all`。
- `130`：提示被 Ctrl-C 取消。

### openspec-cn config edit

```bash
openspec-cn config edit
```

在 `$EDITOR`（回退到 `$VISUAL`）中打开配置文件，缺失时先用默认值创建。编辑器关闭后，文件会被校验。无效的 JSON 或无效的配置退出 1。未配置编辑器时退出 1：

```
Error: No editor configured
Set the EDITOR or VISUAL environment variable to your preferred editor
Example: export EDITOR=vim
```

### openspec-cn config profile

```bash
openspec-cn config profile        # 交互式选择器（需要终端）
openspec-cn config profile core   # 直接应用 core 预设
```

**参数**

| 参数 | 说明 |
|---|---|
| `preset` | 可选的预设名称。目前只有 `core`。它选择 core 工作流并保留你的 delivery 设置。 |

没有预设时，交互式选择器会显示你当前的 delivery 和工作流，让你修改其中之一或全部（delivery：both、仅 skills 或仅 commands；workflows：复选框列表），打印差异，并在 OpenSpec 项目内提议为你运行 `openspec-cn update`。在非终端环境中它退出 1：

```
Interactive mode required. Use `openspec-cn config profile core` or set config via environment/flags.
```

**输出**

更改后的配置要等到项目更新后才会生效：

```
Config updated. Run `openspec-cn update` in your projects to apply.
```

**退出码**

- `0`：profile 已保存，或你保留了当前设置。
- `1`：预设未知、没有终端，或提议的 `openspec-cn update` 失败。
- `130`：选择器被 Ctrl-C 取消。

## openspec-cn list

列出变更，或配合 `--specs` 列出 specs。

```bash
openspec-cn list           # 变更，最近修改的在前
openspec-cn list --specs   # specs 及需求数量
openspec-cn list --json    # 机器可读，包含已解析的根目录
```

行来自已解析根目录下的 `openspec/changes/` 和 `openspec/specs/`。`archive/` 目录会被跳过。

**选项**

| 标志 | 作用 |
|---|---|
| `--specs` | 列出 specs 而不是变更。 |
| `--changes` | 列出变更。这是默认行为。 |
| `--sort <order>` | `recent`（最后修改在前）或 `name`。默认：`recent`。specs 总是按名称排序。 |
| `--json` | 打印 JSON 而不是表格。 |
| `--store <id>` | 使用已注册的 store 作为 OpenSpec 根目录，而不是当前项目。 |

**输出**

每个变更一行：名称、任务状态、最后修改时间。状态列显示 `No tasks`、`2/5 tasks` 或 `✓ Complete`。

```
Changes:
  add-rate-limit     No tasks      just now
```

```
Specs:
  api     requirements 1
```

`--json` 增加任务计数和 `no-tasks`、`in-progress` 或 `complete` 的 `status`：

```json
{
  "changes": [
    {
      "name": "add-rate-limit",
      "completedTasks": 0,
      "totalTasks": 0,
      "lastModified": "2026-08-11T13:44:40.171Z",
      "status": "no-tasks"
    }
  ],
  "root": {
    "path": "/Users/you/projects/my-app",
    "source": "nearest"
  }
}
```

空列表打印 `No active changes found.` 或 `No specs found.`，仍以 0 退出。

**退出码**

- `0`：列表已打印，即使为空。
- `1`：找不到 OpenSpec 根目录（在项目外且没有 `--store`）。

## openspec-cn show

以 markdown 或 JSON 打印一个变更或 spec。

```bash
openspec-cn show add-rate-limit              # 变更：打印 proposal.md
openspec-cn show add-rate-limit --diff       # 变更：追加需求差异
openspec-cn show api                         # spec：打印 spec.md
openspec-cn show api --json --no-scenarios   # spec JSON，不含场景文本
```

没有名称时，show 会询问是变更还是 spec，然后列出可选项目。在非交互终端中它退出 1 并打印直接形式。

**参数**

| 参数 | 说明 |
|---|---|
| `item-name` | 要显示的变更或 spec，按目录名（`add-rate-limit`、`api`）。 |

**选项**

| 标志 | 作用 |
|---|---|
| `--json` | 打印结构化 JSON 而不是原始 markdown。 |
| `--type <change\|spec>` | 当变更和 spec 同名时选择类型。 |
| `--no-interactive` | 绝不提示：名称缺失即报错。 |
| `--deltas-only` | JSON、变更：将输出限制为增量。变更 JSON 本就是仅含增量，因此输出与普通 `--json` 相同。 |
| `--requirements-only` | `--deltas-only` 的已弃用别名。在 stderr 上警告。 |
| `--diff` | 变更：追加逐需求增量差异。对 specs 忽略并警告。 |
| `--requirements` | JSON、spec：保留需求文本，清空 `scenarios` 数组。 |
| `--no-scenarios` | JSON、spec：与 `--requirements` 输出相同。 |
| `-r, --requirement <id>` | JSON、spec：按从 1 开始的位置输出一个需求。不能与 `--requirements` 组合。 |
| `--store <id>` | 使用已注册的 store 作为 OpenSpec 根目录，而不是当前项目。 |

不适用于已解析类型的标志会在 stderr 上忽略并警告。

**输出**

文本模式是原始直通：变更打印其 `proposal.md`，spec 打印其 `spec.md`。

```
# Add rate limiting

## Why
Unauthenticated clients can exhaust the API.

## What Changes
- Add per-client rate limiting to the public API.
```

对于变更，`--diff` 先打印 proposal，然后是 `Specifications Changed (diffs)` 部分。ADDED 需求包含其完整文本。REMOVED 需求保留作者写的 Reason 和 Migration。RENAMED 需求显示 FROM 和 TO。MODIFIED 需求显示与匹配的主需求的统一差异。

如果 MODIFIED 标题仅在折叠大小写或空白后匹配，输出同时包含差异和一条警告：归档匹配是精确的。如果主 spec 或需求缺失，输出会警告并打印完整增量块。没有文本差异的 MODIFIED 块打印 `(no textual changes)`。

带 `--json` 的变更是增量形状：

```json
{
  "id": "add-rate-limit",
  "title": "Add rate limiting",
  "deltaCount": 1,
  "deltas": [
    {
      "spec": "api",
      "operation": "ADDED",
      "description": "Add requirement: The API SHALL limit each client to 100 requests per minute.",
      "requirement": {
        "text": "The API SHALL limit each client to 100 requests per minute.",
        "scenarios": [
          {
            "rawText": "- **WHEN** a client sends its 101st request within a minute\n- **THEN** the API responds 429"
          }
        ]
      },
      ...
    }
  ],
  "root": {
    "path": "/Users/you/projects/my-app",
    "source": "nearest"
  }
}
```

`--json --diff` 保持这个顶层形状。MODIFIED 增量会获得一个 `diff` 字符串、一个 `warning` 字符串，或两者。其他操作不变。空的 `diff` 字符串表示主块与增量块在文本上相同。

带 `--json` 的 spec 列出其需求及场景：

```json
{
  "id": "api",
  "title": "api",
  "overview": "Public HTTP API behavior.",
  "requirementCount": 1,
  "requirements": [
    {
      "text": "The API SHALL expose a health endpoint.",
      "scenarios": [
        {
          "rawText": "- **WHEN** a client requests GET /health\n- **THEN** the API responds 200"
        }
      ]
    }
  ],
  "metadata": {
    "version": "1.0.0",
    "format": "openspec"
  },
  "root": {
    "path": "/Users/you/projects/my-app",
    "source": "nearest"
  }
}
```

未知名称会提示近似匹配：`Unknown item 'does-not-exist'. Did you mean: add-rate-limit, api?`。同时匹配变更和 spec 的名称会报错并请你指定 `--type`。

**退出码**

- `0`：项目已打印。
- `1`：名称未知或不明确、非终端下无名称、`-r` 索引越界、`--requirements` 与 `-r` 组合，或 `--diff` 无法读取增量或主 spec。

## openspec-cn view

打印 specs 和变更的单屏仪表盘。

```bash
openspec-cn view   # 单屏项目摘要
```

view 打印一次仪表盘后即退出。它不读取按键。变更按任务进度分组：草稿（还没有任务）、进行中（任务进行中，带进度条和百分比）、已完成（每个任务都已勾选）。specs 按需求数量列出，最多在前。

**选项**

| 标志 | 作用 |
|---|---|
| `--store <id>` | 使用已注册的 store 作为 OpenSpec 根目录，而不是当前项目。 |

**输出**

```
OpenSpec Dashboard

════════════════════════════════════════════════════════════
Summary:
  ● Specifications: 1 specs, 1 requirements
  ● Draft Changes: 1
  ● Active Changes: 0 in progress
  ● Completed Changes: 0

Draft Changes
────────────────────────────────────────────────────────────
  ○ add-rate-limit

Specifications
────────────────────────────────────────────────────────────
  ▪ api                            1 requirement

════════════════════════════════════════════════════════════

Use openspec-cn list --changes or openspec-cn list --specs for detailed views
```

当任何变更有任务进行中时，会出现一行 `Task Progress` 摘要。

**退出码**

- `0`：仪表盘已打印。
- `1`：找不到 OpenSpec 根目录（在项目外且没有 `--store`）。

## openspec-cn validate

检查变更和 specs 的结构问题。

```bash
openspec-cn validate add-rate-limit   # 一个变更或 spec，按名称
openspec-cn validate --all            # 每个变更和 spec
```

没有名称且没有批量标志时，validate 会提示你选择项目。在非交互终端中它退出 1 并打印批量标志。

**参数**

| 参数 | 说明 |
|---|---|
| `item-name` | 要校验的变更或 spec，按目录名（`add-rate-limit`、`api`）。 |

**选项**

| 标志 | 作用 |
|---|---|
| `--all` | 校验每个变更和 spec。 |
| `--changes` | 校验每个变更。 |
| `--specs` | 校验每个 spec。 |
| `--strict` | 将警告视为失败。 |
| `--type <change\|spec>` | 当变更和 spec 同名时选择类型。 |
| `--json` | 打印结构化报告而不是文本。 |
| `--concurrency <n>` | 批量运行中的最大并行校验数。默认：`OPENSPEC_CONCURRENCY`，否则 6。 |
| `--no-interactive` | 绝不提示：名称缺失或不明确即报错。 |
| `--store <id>` | 使用已注册的 store 作为 OpenSpec 根目录，而不是当前项目。 |

**输出**

每个项目一行。批量运行以总计结尾：

```
✓ change/add-rate-limit
✓ spec/api
Totals: 2 passed, 0 failed (2 items)
```

失败的项目列出每个问题及修复方法：

```
Change 'add-rate-limit' has issues
✗ [ERROR] api/spec.md: ADDED "Rate limiting" must include at least one scenario
Next steps:
  - Ensure change has deltas in specs/: use headers ## ADDED/MODIFIED/REMOVED/RENAMED Requirements
  - Each requirement MUST include at least one #### Scenario: block
  - Debug parsed deltas: openspec-cn show add-rate-limit --json --deltas-only
```

`--json` 为本次运行打印一份报告：

```json
{
  "items": [
    {
      "id": "add-rate-limit",
      "type": "change",
      "valid": true,
      "issues": [],
      "durationMs": 2
    }
  ],
  "summary": {
    "totals": {
      "items": 1,
      "passed": 1,
      "failed": 0
    },
    "byType": {
      "change": {
        "items": 1,
        "passed": 1,
        "failed": 0
      }
    }
  },
  "version": "1.0",
  "root": {
    "path": "/Users/you/projects/my-app",
    "source": "nearest"
  }
}
```

`issues` 条目携带 `ERROR`、`WARNING` 或 `INFO` 级别的 `level`。

**退出码**

- `0`：每个已校验项目都通过。
- `1`：某个项目失败，或本次运行无法校验任何内容（名称未知、没有可校验的内容）。

## openspec-cn archive

把已完成的变更移入归档并更新主 specs。

```bash
openspec-cn archive add-rate-limit -y                # 归档一个变更，合并其增量
openspec-cn archive add-rate-limit -y --skip-specs   # 归档而不改动 specs
```

没有名称时，archive 会提示你选择变更。在非交互终端中它退出 1 并打印重新运行的命令。

**参数**

| 参数 | 说明 |
|---|---|
| `change-name` | 要归档的变更，按目录名（`add-rate-limit`）。 |

**选项**

| 标志 | 作用 |
|---|---|
| `-y, --yes` | 对所有确认都回答是：spec 更新、未完成任务、跳过校验。 |
| `--skip-specs` | 归档而不改动主 specs（基础设施、工具或仅文档变更）。 |
| `--no-validate` | 跳过校验。archive 会先请你确认，`-y` 会替你做答。 |
| `--json` | 打印结构化结果而不是文本。需要 `--yes` 来确认 spec 更新。 |
| `--store <id>` | 使用已注册的 store 作为 OpenSpec 根目录，而不是当前项目。 |

**输出**

成功的运行会报告任务状态、预览 spec 更新、应用它们，并命名归档目录：

```
Task status: ✓ Complete

Specs to update:
  api: update
Applying changes to openspec/specs/api/spec.md:
  + 1 added
Totals: + 1, ~ 0, - 0, → 0
Specs updated successfully.
Change 'add-rate-limit' archived as '2026-08-11-add-rate-limit'.
```

变更目录整体移入 `openspec/changes/archive/2026-08-11-add-rate-limit/`，名称前加上今天的日期。每个增量合并到其主 spec：上面的 ADDED 需求被追加到 `openspec/specs/api/spec.md`。没有 `-y` 时，archive 会显示预览并在更新前询问。拒绝仍会归档变更并保持 specs 不变。

带 `--json --yes`：

```json
{
  "archive": {
    "change": "add-rate-limit",
    "archivedAs": "2026-08-11-add-rate-limit",
    "path": "/Users/you/projects/my-app/openspec/changes/archive/2026-08-11-add-rate-limit",
    "specsUpdated": true,
    "totals": {
      "added": 1,
      "modified": 0,
      "removed": 0,
      "renamed": 0
    }
  },
  "root": {
    "path": "/Users/you/projects/my-app",
    "source": "nearest"
  }
}
```

archive 会先校验变更并拒绝失败的变更：

```
Validation errors in change delta specs:
  ✗ ADDED "Rate limiting" must include at least one scenario

Validation failed. Please fix the errors before archiving.
To skip validation (not recommended), use --no-validate flag.
```

未完成任务会警告但不会阻止。交互式 archive 会询问是否继续，`-y` 自行继续：

```
Task status: 1/2 tasks
Warning: 1 incomplete task(s) found. Continuing due to --yes flag.
```

**退出码**

- `0`：变更已归档，无论是否更新了 specs。
- `1`：校验失败、变更名称未知，或需要确认却无法读取答案。

## openspec-cn new

创建新的变更目录。

```bash
openspec-cn new change add-caching                                # 仅元数据
openspec-cn new change add-search --goal "Users can search docs"  # 记录目标
```

`new` 有一个子命令：`new change <name>`。它创建 `openspec/changes/<name>/`，其中包含一个[`.openspec.yaml` 元数据文件](configuration/change-metadata.md)：

```yaml
schema: spec-driven
created: 2026-08-11
```

制品（proposal、specs、design、tasks）不会在此搭脚手架。你稍后编写它们，`openspec-cn status` 会告诉你下一个是哪个。

**参数**

| 参数 | 说明 |
|---|---|
| `name` | 变更的目录名（`add-caching`）。 |

**选项**

| 标志 | 作用 |
|---|---|
| `--description <text>` | 同时在变更目录中创建带此文本的 `README.md`。 |
| `--goal <text>` | 在 `.openspec.yaml` 中存储一行 `goal:`。 |
| `--schema <name>` | 变更的工作流 schema。默认：`spec-driven`，唯一随附的 schema。 |
| `--json` | 以 JSON 打印已创建的变更而不是文本。 |
| `--store <id>` | 使用已注册的 store 作为 OpenSpec 根目录，而不是当前项目。 |

**输出**

```
Created change 'add-caching' at openspec/changes/add-caching/
Schema: spec-driven
Next: openspec-cn status --change add-caching
```

带 `--json`：

```json
{
  "change": {
    "id": "add-caching",
    "path": "/Users/you/projects/my-app/openspec/changes/add-caching",
    "metadataPath": "/Users/you/projects/my-app/openspec/changes/add-caching/.openspec.yaml",
    "schema": "spec-driven"
  },
  "root": {
    "path": "/Users/you/projects/my-app",
    "source": "nearest"
  }
}
```

**退出码**

- `0`：变更已创建。
- `1`：变更已存在，或 schema 未知。

## openspec-cn status

报告一个变更或每个活跃变更的制品完成状态。

```bash
openspec-cn status --change add-rate-limit          # 清单视图
openspec-cn status --change add-rate-limit --json   # 结构化报告
openspec-cn status --all                            # 每个活跃变更
openspec-cn status --all --json                     # 一份批量报告
```

当存在活跃变更时，必须恰好使用 `--change` 或 `--all` 之一。两者都不给时，status 退出 1 并列出可用的变更，即使只有一个：

```text
✖ Error: Missing required option --change (or --all for every active change). Available changes:
  add-rate-limit
```

当项目没有活跃变更时，status 打印 `No active changes. Create one with: openspec-cn new change <name>` 并以 0 退出，即使两个标志都不给。带 `--all --json` 时，同样的空状态是 `{ "changes": [], "message": "No active changes.", "root": ... }`。

**选项**

| 标志 | 作用 |
|---|---|
| `--change <id>` | 要报告的变更，按目录名。 |
| `--all` | 报告每个活跃变更，按名称排序。不能与 `--change` 组合。 |
| `--schema <name>` | 覆盖从 `openspec/config.yaml` 自动检测的 schema。未知名称是错误。 |
| `--json` | 打印结构化报告而不是文本。 |
| `--store <id>` | 使用已注册的 store 作为 OpenSpec 根目录，而不是当前项目。 |

**输出**

schema 制品的清单：`[x]` 已完成，`[ ]` 可编写，`[-]` 受阻，直到其依赖的制品存在。

```
Change: add-rate-limit
Schema: spec-driven
Change root: /Users/you/projects/my-app
Progress: 2/4 artifacts complete

[x] proposal
[x] specs
[ ] design
[-] tasks (blocked by: design)
```

`--json` 增加逐制品依赖、解析后的文件路径，以及建议的下一步。已精简：

```json
{
  "changeName": "add-rate-limit",
  "schemaName": "spec-driven",
  "isComplete": false,
  "nextSteps": [
    "Run openspec-cn instructions design --change \"add-rate-limit\" --json before writing that artifact."
  ],
  "artifacts": [
    {
      "id": "proposal",
      "outputPath": "proposal.md",
      "status": "done",
      "requires": []
    },
    {
      "id": "design",
      "outputPath": "design.md",
      "status": "ready",
      "requires": [
        "proposal"
      ]
    },
    {
      "id": "tasks",
      "outputPath": "tasks.md",
      "status": "blocked",
      "requires": [
        "specs",
        "design"
      ],
      "missingDeps": [
        "design"
      ]
    }
  ]
}
```

带 `--all --json` 时，`changes` 为每个变更包含相同的状态对象，没有逐变更的 `root`。选定的根目录在信封上出现一次。此示例精简了上面展示的逐变更状态字段：

```json
{
  "changes": [
    {
      "changeName": "add-rate-limit",
      "schemaName": "spec-driven",
      "artifacts": []
    }
  ],
  "root": {
    "path": "/Users/you/projects/my-app",
    "source": "nearest"
  }
}
```

如果某个变更无法加载，批量会继续。它的条目包含 `changeName` 和一个 `status` 诊断，其余条目仍可用。命令以 1 退出，包括 JSON 模式，这样 CI 不会把不完整的报告当作成功。JSON 输出仍是一份可解析的文档。

**退出码**

- `0`：每个请求的状态都已打印；空的 `--all` 报告也以 0 退出。
- `1`：请求的变更加载失败、缺少 `--change` 或 `--all`、两个标志被组合、变更不存在，或 schema 覆盖未知。

## openspec-cn instructions

打印创建制品、apply 或 archive 的指令。你的 Agent 会在工作流期间运行此命令，为下一步获取指令文本。

```bash
openspec-cn instructions proposal --change add-rate-limit   # 如何编写一个制品
openspec-cn instructions apply --change add-rate-limit      # 如何实现该变更
openspec-cn instructions archive --change add-rate-limit    # 归档的输入
```

**参数**

| 参数 | 说明 |
|---|---|
| `artifact` | schema 中的制品 id（`spec-driven` 中为 `proposal`、`specs`、`design`、`tasks`），或保留字 `apply` 和 `archive`。 |

**选项**

| 标志 | 作用 |
|---|---|
| `--change <id>` | 为其生成指令的变更。必需。 |
| `--schema <name>` | 覆盖 schema。否则从 `config.yaml` 自动检测。 |
| `--json` | 打印结构化对象而不是文本。 |
| `--store <id>` | 使用已注册的 store 作为 OpenSpec 根目录，而不是当前项目。 |

**输出**

制品形式打印一个指令块：任务、要写入的文件、如何编写、制品的模板，以及完成它会解锁什么。

```
<artifact id="proposal" change="add-rate-limit" schema="spec-driven">

<task>
Create the proposal artifact for change "add-rate-limit".
Initial proposal document outlining the change
</task>

<output>
Write to: /Users/you/projects/my-app/openspec/changes/add-rate-limit/proposal.md
</output>

<instruction>
Create the proposal document that establishes WHY this change is needed.
...
```

`apply` 打印上下文文件、任务进度和进行中的指令：

```
## Apply: add-rate-limit
Schema: spec-driven

### Context Files
- proposal: /Users/you/projects/my-app/openspec/changes/add-rate-limit/proposal.md
- specs: /Users/you/projects/my-app/openspec/changes/add-rate-limit/specs/api/spec.md
- tasks: /Users/you/projects/my-app/openspec/changes/add-rate-limit/tasks.md

### Progress
1/3 complete

### Tasks
- [x] 1.1 Add rate limit middleware
- [ ] 1.2 Return 429 with Retry-After header
- [ ] 1.3 Add tests for burst traffic

### Instruction
Read context files, work through pending tasks, mark complete as you go.
Pause if you hit blockers or need clarification.

No project context or operation guidance configured.
```

当必需制品缺失时，`apply` 会报告 `### ⚠️ Blocked` 并列出它们。`archive` 打印变更名称，外加来自配置的任何项目上下文和操作指引。未配置时它会说明，仅此而已。

带 `--json` 时，每种形式返回一个对象。制品形式以：

```json
{
  "changeName": "add-rate-limit",
  "artifactId": "proposal",
  "schemaName": "spec-driven",
  "changeDir": "/Users/you/projects/my-app/openspec/changes/add-rate-limit",
  ...
```

开头，并继续包含 `outputPath`、`existingOutputPaths`、完整的 `instruction` 和 `template` 字符串、`dependencies`、`unlocks` 和 `root`。`apply` 形式携带 `contextFiles`、`progress`、`tasks`、`state`（`blocked`、`ready`、`all_done`）和 `instruction`。

**退出码**

- `0`：指令已打印。
- `1`：制品未知、变更未知、schema 未知，或缺少 `--change`。每个错误都会列出有效值。

## openspec-cn templates

打印 schema 制品解析后的模板路径。

```bash
openspec-cn templates          # 默认 schema：spec-driven
openspec-cn templates --json   # 制品 id 到路径的映射
```

**选项**

| 标志 | 作用 |
|---|---|
| `--schema <name>` | 要解析的 schema。默认：`spec-driven`。 |
| `--json` | 打印制品 id 到模板路径的 JSON 映射。 |

**输出**

```
Schema: spec-driven
Source: package

proposal:
  /usr/local/lib/node_modules/@fission-ai/openspec/schemas/spec-driven/templates/proposal.md
specs:
  /usr/local/lib/node_modules/@fission-ai/openspec/schemas/spec-driven/templates/spec.md
design:
  /usr/local/lib/node_modules/@fission-ai/openspec/schemas/spec-driven/templates/design.md
tasks:
  /usr/local/lib/node_modules/@fission-ai/openspec/schemas/spec-driven/templates/tasks.md
```

`Source` 说明 schema 从哪里解析：`project`（你项目中的 `openspec/schemas/`）、`user`（全局覆盖）或 `package`（内置于 CLI）。project 优先于 user，user 优先于 package。

```json
{
  "proposal": {
    "path": "/usr/local/lib/node_modules/@fission-ai/openspec/schemas/spec-driven/templates/proposal.md",
    "source": "package"
  },
  "specs": {
    "path": "/usr/local/lib/node_modules/@fission-ai/openspec/schemas/spec-driven/templates/spec.md",
    "source": "package"
  },
  "design": {
    "path": "/usr/local/lib/node_modules/@fission-ai/openspec/schemas/spec-driven/templates/design.md",
    "source": "package"
  },
  "tasks": {
    "path": "/usr/local/lib/node_modules/@fission-ai/openspec/schemas/spec-driven/templates/tasks.md",
    "source": "package"
  }
}
```

**退出码**

- `0`：路径已打印。
- `1`：schema 未知。错误会列出可用的 schemas。

<a id="openspec-schemas"></a>

## openspec-cn schemas

列出可用的工作流 schemas。

```bash
openspec-cn schemas          # 名称、描述、制品顺序
openspec-cn schemas --json   # 机器可读，供 Agent 使用
```

**选项**

| 标志 | 作用 |
|---|---|
| `--json` | 以 JSON 输出（供 Agent 使用）。 |

**输出**

```
Available schemas:

  spec-driven
    Default OpenSpec workflow - proposal → specs → design → tasks
    Artifacts: proposal → specs → design → tasks
```

来自你项目的 schemas 标记为 `(project)`，全局覆盖标记为 `(user override)`。

```json
[
  {
    "name": "spec-driven",
    "description": "Default OpenSpec workflow - proposal → specs → design → tasks",
    "artifacts": [
      "proposal",
      "specs",
      "design",
      "tasks"
    ],
    "source": "package"
  }
]
```

**退出码**

- `0`：schemas 已列出。
- `1`：无法读取 schema 列表。

## openspec-cn schema

检查、fork 或创建 schema（实验性）。每个子命令都先在 stderr 上打印 `Note: Schema commands are experimental and may change.`。

```bash
openspec-cn schema which spec-driven          # schema 从哪里解析
openspec-cn schema fork spec-driven my-flow   # 把 schema 复制进项目
openspec-cn schema init my-schema             # 从零创建 schema
```

| 子命令 | 作用 |
|---|---|
| `which` | 显示 schema 从哪里解析。 |
| `validate` | 检查 schema 的结构和模板。 |
| `fork` | 把现有 schema 复制进项目以便自定义。 |
| `init` | 创建新的项目本地 schema。 |

Schemas 从三个位置解析。第一个匹配生效：

| 来源 | 位置 |
|---|---|
| `project` | 当前项目中的 `openspec/schemas/`。 |
| `user` | `~/.local/share/openspec/schemas/`（尊重 `XDG_DATA_HOME` 和 Windows 的 `%LOCALAPPDATA%`）。 |
| `package` | 随 CLI 附带的 schemas。`spec-driven` 在这里。 |

<a id="openspec-schema-which"></a>

### openspec-cn schema which

显示 CLI 将使用哪份 schema 副本。

```bash
openspec-cn schema which spec-driven
openspec-cn schema which --all        # 每个 schema，按来源分组
```

**参数**

| 参数 | 说明 |
|---|---|
| `name` | 要查找的 schema。除 `--all` 外必需。两者都不给时，which 退出 1。 |

**选项**

| 标志 | 作用 |
|---|---|
| `--all` | 列出每个 schema 及其解析来源。 |
| `--json` | 以 JSON 打印解析结果。 |

**输出**

```
Schema: spec-driven
Source: package
Path: /usr/local/lib/node_modules/@fission-ai/openspec/schemas/spec-driven
```

当更高优先级的副本遮蔽另一个副本时，`Shadows:` 部分列出被遮蔽的副本。带 `--json`：

```json
{
  "name": "my-flow",
  "source": "project",
  "path": "/Users/you/projects/my-app/openspec/schemas/my-flow",
  "shadows": []
}
```

未知名称退出 1 并列出可用的 schemas。

<a id="openspec-schema-validate"></a>

### openspec-cn schema validate

检查 schema 的结构和模板。

```bash
openspec-cn schema validate spec-driven   # 一个 schema，来自任何来源
openspec-cn schema validate               # 每个项目本地 schema
```

它验证 `schema.yaml` 存在且能解析、结构符合 schema 格式、每个制品的模板文件都存在于 schema 的 `templates/` 目录内，以及依赖图没有环或未知引用。

**选项**

| 标志 | 作用 |
|---|---|
| `--json` | 打印结构化报告而不是文本。 |
| `--verbose` | 打印每个校验步骤。 |

**输出**

```
✓ Schema 'spec-driven' is valid
```

没有名称时，每个项目 schema 在 `Validation Results:` 标题下各占一行。失败的 schema 列出其问题并以 1 退出：

```
✗ Schema 'my-schema' has errors:
  error: Template file 'tasks.md' not found for artifact 'tasks'
```

### openspec-cn schema fork

把现有 schema 复制进项目，以便你可以自定义它。

```bash
openspec-cn schema fork spec-driven my-flow
```

**参数**

| 参数 | 说明 |
|---|---|
| `source` | 要复制的 schema，来自任何来源位置。 |
| `name` | 副本的名称。kebab-case（`my-workflow`）。默认：`<source>-custom`。 |

**选项**

| 标志 | 作用 |
|---|---|
| `--force` | 覆盖已存在的目标 schema。 |
| `--json` | 以 JSON 打印结果。 |

**输出**

```
✔ Forked 'spec-driven' to 'my-flow'

Source: /usr/local/lib/node_modules/@fission-ai/openspec/schemas/spec-driven (package)
Destination: /Users/you/projects/my-app/openspec/schemas/my-flow
```

fork 落在 `openspec/schemas/`，其 `schema.yaml` 中的 `name:` 字段会被重写为新名称：

```
openspec/schemas/my-flow/
├── schema.yaml
└── templates/
    ├── design.md
    ├── proposal.md
    ├── spec.md
    └── tasks.md
```

已存在的目标除非传入 `--force`，否则是错误。保留源名称的 fork 会遮蔽原版。

### openspec-cn schema init

用起始模板创建新的项目本地 schema。

```bash
openspec-cn schema init my-schema --description "Lightweight flow" --artifacts proposal,tasks
```

在交互式终端中，没有 `--description` 和 `--artifacts` 时，init 会提示输入描述、制品清单，以及是否让该 schema 成为项目默认。在终端外它使用下面的默认值。

**参数**

| 参数 | 说明 |
|---|---|
| `name` | 新 schema 的名称。kebab-case（`my-workflow`）。 |

**选项**

| 标志 | 作用 |
|---|---|
| `--description <text>` | Schema 描述。默认：`Custom workflow schema for <name>`。 |
| `--artifacts <list>` | 来自 `proposal`、`specs`、`design`、`tasks` 的逗号分隔制品 id。默认：全部四个。 |
| `--default` | 把 `schema: <name>` 写入现有的 `openspec/config.yaml` 或 `openspec/config.yml`。两者都不存在时创建 `openspec/config.yaml`。新的变更使用此 schema。 |
| `--no-default` | 跳过关于默认值的提示。 |
| `--force` | 覆盖同名现有 schema。 |
| `--json` | 以 JSON 打印结果。 |

schema 创建与 `--default` 配置更新是一次操作。如果 OpenSpec 无法校验或写入配置，它会让配置和任何现有 schema 都保持不变。

**输出**

```
✔ Created schema 'my-schema'

Schema created at: /Users/you/projects/my-app/openspec/schemas/my-schema

Artifacts: proposal, tasks
```

磁盘上的布局：

```
openspec/schemas/my-schema/
├── schema.yaml
└── templates/
    ├── proposal.md
    └── tasks.md
```

`schema.yaml` 把选中的制品及其依赖连接起来。包含 `tasks` 时，它还会获得跟踪 `tasks.md` 的 `apply` 阶段。用 `openspec-cn new --schema my-schema` 使用该 schema。

## openspec-cn store

创建和管理 store：注册在你机器上的独立 OpenSpec 仓库。

```bash
openspec-cn store setup team-context --path ~/openspec/team-context   # 创建并注册
openspec-cn store register ~/stores/design-system                     # 注册现有检出
openspec-cn store list                                                # 查看已注册的内容
```

注册保存在每台机器的注册表中：`~/.local/share/openspec/stores/registry.yaml`，或设置 `XDG_DATA_HOME` 时的 `$XDG_DATA_HOME/openspec/stores/registry.yaml`。每个子命令都接受 `--json` 以打印结构化报告而不是文本。运行 `openspec-cn store` 时若子命令缺失或未知，会退出 1 并列出子命令。

| 子命令 | 作用 |
|---|---|
| `setup [id]` | 创建 store 目录并注册它。 |
| `register [path]` | 注册现有的 store 目录。 |
| `unregister <id>` | 遗忘注册。目录保留在磁盘上。 |
| `remove <id>` | 遗忘注册并删除目录。 |
| `list`（别名 `ls`） | 列出已注册的 stores。 |
| `doctor [id]` | 检查已注册 store 的注册、元数据和 Git 状态。 |

### openspec-cn store setup

创建 store 目录并注册它。

```bash
openspec-cn store setup team-context --path ~/openspec/team-context
```

在交互式终端中，setup 会提示缺失的名称和位置，并在创建任何内容前确认。在终端外，缺失名称或 `--path` 会以 1 退出并给出要传入的标志。对已注册的 store 重新运行 setup 会报告 `Registry: already registered`。

**参数**

| 参数 | 说明 |
|---|---|
| `id` | store 名称。它成为你传给 `--store` 的 id。 |

**选项**

| 标志 | 作用 |
|---|---|
| `--path <path>` | store 应存放的目录（`~` 会展开）。 |
| `--init-git` | 初始化带初始提交的 Git 仓库。默认。 |
| `--no-init-git` | 跳过所有 Git 操作：不 init，不初始提交。 |
| `--remote <url>` | 记录在 `store.yaml` 中的规范克隆来源。 |

**输出**

```
Store ready: team-context
Location: /Users/you/stores/team-context
OpenSpec root: ready
Registry: registered

Next: run normal OpenSpec commands against this store, for example:
  openspec-cn new change <change-id> --store team-context
Share this store by committing and pushing it like any Git repo.
```

`--json` 报告创建了什么以及注册在哪里：

```json
{
  "store": {
    "id": "design-system",
    "root": "/Users/you/stores/design-system",
    "metadata_path": "/Users/you/stores/design-system/.openspec-store/store.yaml"
  },
  "registry": {
    "path": "/Users/you/.local/share/openspec/stores/registry.yaml",
    "registered": true,
    "already_registered": false
  },
  "git": {
    "is_repository": true,
    "initialized": true,
    "committed": true
  },
  "created_files": [
    "openspec/",
    "openspec/specs/",
    "openspec/changes/",
    "openspec/changes/archive/",
    "openspec/config.yaml",
    "openspec/specs/.gitkeep",
    "openspec/changes/archive/.gitkeep",
    ".openspec-store/store.yaml"
  ],
  "status": []
}
```

### openspec-cn store register

注册现有的 store 目录，例如你克隆的队友的 store。

```bash
openspec-cn store register ~/stores/design-system
```

该目录必须包含健康的 `openspec/` 根目录。存在 `.openspec-store/store.yaml` 时，register 会复用记录的 id。没有它时，register 会先询问是否创建该元数据。在非交互终端中，请改传 `--yes`。每台机器每个 store id 只能注册一个检出。同一 id 下的第二个路径，或第二个 id 下的同一路径，会以 1 退出。

**参数**

| 参数 | 说明 |
|---|---|
| `path` | 要注册的 store 目录（`~` 会展开）。必需。 |

**选项**

| 标志 | 作用 |
|---|---|
| `--id <id>` | Store id。默认为元数据或目录名。 |
| `--yes` | 确认为健康的 OpenSpec 根目录创建 store 身份元数据。 |

**输出**

```
Store registered: design-system
Location: /Users/you/stores/design-system
OpenSpec root: ready
Registry: registered
```

`--json` 打印与 `store setup --json` 相同的文档结构。

### openspec-cn store unregister

遗忘注册。目录保留在磁盘上。

```bash
openspec-cn store unregister design-system
```

```
Unregistered store: design-system
Files kept at: /Users/you/stores/design-system
```

### openspec-cn store remove

遗忘注册并删除目录。

```bash
openspec-cn store remove design-system --yes
```

交互式 remove 会在删除前询问。带 `--json` 或在非交互终端中，删除需要 `--yes`：

```
Error: Pass --yes to delete store files non-interactively.
Fix: openspec-cn store remove design-system --yes
```

**选项**

| 标志 | 作用 |
|---|---|
| `--yes` | 确认删除本地 store 目录。 |

**输出**

```
Removed store: design-system
Deleted: /Users/you/stores/design-system
```

### openspec-cn store list

列出已注册的 stores。`ls` 是别名。

```bash
openspec-cn store list
```

```
OpenSpec stores (2)

ID              Location
design-system   /Users/you/stores/design-system
team-context    /Users/you/stores/team-context
```

没有任何注册时，list 打印 `No stores registered.` 以及接下来要运行的 setup 和 register 命令。

### openspec-cn store doctor

检查已注册 store 的注册、元数据和 Git 状态。

```bash
openspec-cn store doctor                # 每个已注册的 store
openspec-cn store doctor team-context  # 一个 store
```

**输出**

```
Store doctor

team-context
  Location: /Users/you/stores/team-context
  OpenSpec root: ok
  Metadata: ok
  Git: repository detected (commits: yes, uncommitted changes: no, remote: none)
  Issues: none
```

**退出码**

- `0`：报告已打印，即使某个 store 报告了问题。
- `1`：报告无法运行（例如未知的 store id）。

## openspec-cn doctor

报告已解析 OpenSpec 根目录的关系健康状况。

```bash
openspec-cn doctor                       # 你的 cwd 上方最近的 openspec/ 根目录
openspec-cn doctor --store team-context  # 以已注册 store 作为根目录
```

Doctor 是只读的：它从不克隆、同步或修复。它报告根目录是否健康，以及 `openspec/config.yaml` 中声明的每个引用是否在本机可解析。当你的 cwd 上方没有根目录且没有 `--store` 时，它退出 1 并列出你已注册的 stores。

**选项**

| 标志 | 作用 |
|---|---|
| `--store <id>` | 使用已注册的 store 作为 OpenSpec 根目录，而不是当前项目。 |
| `--json` | 以 JSON 打印健康报告。 |

**输出**

```
Doctor

Root
  Location: /Users/you/projects/my-app
  OpenSpec root: ok

References
  - team-context: ok (/Users/you/stores/team-context)
```

带 `--store` 时，根目录就是该 store，报告增加一行 store：

```
Using OpenSpec root: team-context (/Users/you/stores/team-context)
Doctor

Root
  Location: /Users/you/stores/team-context
  OpenSpec root: ok
  Store: team-context (metadata ok)

References
  (none declared)
```

```json
{
  "root": {
    "path": "/Users/you/projects/my-app",
    "source": "nearest",
    "healthy": true,
    "status": []
  },
  "store": null,
  "references": [
    {
      "store_id": "team-context",
      "root": "/Users/you/stores/team-context",
      "status": []
    }
  ],
  "status": []
}
```

**退出码**

- `0`：报告已打印，包括列出问题的情况。
- `1`：没有解析到根目录（你的 cwd 上方没有 `openspec/` 且没有 `--store`），或 `--store` id 未知。

## openspec-cn context

打印已解析 OpenSpec 根目录的工作上下文：根目录加上 `openspec/config.yaml` 中声明的每个被引用 store，各带一个获取命令。

```bash
openspec-cn context                       # 你的 cwd 上方最近的 openspec/ 根目录
openspec-cn context --store team-context  # 以已注册 store 作为根目录
openspec-cn context --json                # Agent 简报
```

在本机无法解析的引用会落在 `Not available on this machine` 部分，各带一个修复方法。

**选项**

| 标志 | 作用 |
|---|---|
| `--store <id>` | 使用已注册的 store 作为 OpenSpec 根目录，而不是当前项目。 |
| `--json` | 以 JSON 打印 Agent 简报。 |
| `--code-workspace <path>` | 同时为这组内容写入一个 VS Code workspace 文件。 |
| `--force` | 覆盖现有的 `--code-workspace` 文件。 |

**输出**

```
Working context for my-app (/Users/you/projects/my-app)

OpenSpec root
  my-app  /Users/you/projects/my-app

Referenced stores
  team-context  /Users/you/stores/team-context
    Fetch: openspec-cn show <spec-id> --type spec --store team-context
```

带 `--store` 时，该 store 就是整个集合：

```
Using OpenSpec root: team-context (/Users/you/stores/team-context)
Working context for team-context (/Users/you/stores/team-context)

OpenSpec root
  team-context  /Users/you/stores/team-context

No references declared; the working set is this root alone.
```

```json
{
  "root": {
    "path": "/Users/you/projects/my-app",
    "source": "nearest",
    "role": "openspec_root"
  },
  "members": [
    {
      "role": "referenced_store",
      "id": "team-context",
      "path": "/Users/you/stores/team-context",
      "fetch": "openspec-cn show <spec-id> --type spec --store team-context",
      "status": []
    }
  ],
  "status": []
}
```

**写入 workspace 文件**

`--code-workspace` 在你给出的路径写入一个 VS Code workspace 文件：根目录一个文件夹，每个可用的被引用 store 一个 `ref:<id>` 文件夹。不可用的引用会被跳过，并在摘要行中列出：`Wrote /Users/you/projects/my-app/openspec.code-workspace (2 folders)`。摘要打印在 stderr 上，因此 `--json` 的 stdout 保持为一份 JSON 文档。现有文件以 1 退出，除非你传 `--force`。

```json
{
  "folders": [
    {
      "name": "my-app",
      "path": "/Users/you/projects/my-app"
    },
    {
      "name": "ref:team-context",
      "path": "/Users/you/stores/team-context"
    }
  ]
}
```

**退出码**

- `0`：报告已打印。
- `1`：没有解析到根目录（你的 cwd 上方没有 `openspec/` 且没有 `--store`），或 `--code-workspace` 写入被拒绝。

## openspec-cn workset

组合、保存并打开个人工作视图。workset 是你一起工作的文件夹的已保存命名列表。

```bash
openspec-cn workset create checkout --member ~/projects/checkout-api --member web=~/projects/checkout-web
openspec-cn workset list
openspec-cn workset remove checkout --yes
```

| 子命令 | 作用 |
|---|---|
| `create [name]` | 组合并保存你选择的文件夹的命名工作视图。 |
| `list`、`ls` | 显示已保存的 worksets 及其成员。 |
| `open <name>` | 在你的工具中打开已保存的 workset（编辑器窗口或 Agent 会话）。 |
| `remove <name>` | 删除已保存的 workset（成员目录绝不动）。 |

workset 完全是本地的：

- 它的状态存放在一个目录中：`~/.local/share/openspec/worksets/`（设置 `$XDG_DATA_HOME` 时为 `$XDG_DATA_HOME/openspec/worksets/`；Windows 上为 `%LOCALAPPDATA%\openspec\worksets\`）。
- 不会向成员目录写入任何内容，也不提交或共享任何内容。
- 删除那一个目录就会移除所有痕迹。

### openspec-cn workset create

保存文件夹的命名工作视图。

```bash
openspec-cn workset create checkout \
  --member ~/projects/checkout-api \
  --member web=~/projects/checkout-web
```

在交互式终端中，create 会提示标志未提供的任何内容：名称、逐个目录、工具，然后询问是否现在就打开该 workset。在终端外，缺少名称或成员是错误。已保存的名称总是错误。先移除它。

**参数**

| 参数 | 说明 |
|---|---|
| `name` | workset 名称。kebab-case：小写字母、数字、单个连字符。在非交互终端中必需。 |

**选项**

| 标志 | 作用 |
|---|---|
| `--member <member>` | 成员目录，格式为 `<path>` 或 `<name>=<path>`，可重复。第一个是主目录。路径必须是现有目录，标签默认取目录自身名称。 |
| `--tool <id>` | 用于打开此 workset 的首选工具。内置 id：`code`（VS Code）、`cursor`（Cursor）。`claude` 和 `codex` 暂时禁用。 |
| `--json` | 以 JSON 打印已保存的 workset。 |

**输出**

```
Saved workset 'checkout' (2 members) to your machine.
Open it any time with: openspec-cn workset open checkout
```

### openspec-cn workset list

显示已保存的 worksets 及其成员，按名称排序。

```bash
openspec-cn workset list   # 别名：ls
```

**选项**

| 标志 | 作用 |
|---|---|
| `--json` | 以 JSON 打印 worksets。 |

**输出**

每个 workset 一块：名称、有工具时的工具，然后是每个成员一行 `name  path`。没有任何保存内容时，list 打印 `No worksets saved. Create one with: openspec-cn workset create`。

```
checkout
  checkout-api  /Users/you/projects/checkout-api
  web           /Users/you/projects/checkout-web
checkout-tool  (opens in VS Code)
  checkout-api  /Users/you/projects/checkout-api
```

带 `--json`：

```json
{
  "worksets": [
    {
      "name": "checkout",
      "members": [
        {
          "name": "checkout-api",
          "path": "/Users/you/projects/checkout-api"
        },
        {
          "name": "web",
          "path": "/Users/you/projects/checkout-web"
        }
      ]
    }
  ],
  "status": []
}
```

### openspec-cn workset open

在你的工具中打开已保存的 workset。编辑器工具（`code`、`cursor`）会得到一个生成的 `.code-workspace` 文件。窗口打开后命令返回。CLI Agent 工具（`claude`、`codex`）会带着每个已附加成员接管这个终端。在重新设计该流程期间它们暂时禁用，因此目前 workset 在 IDE 中打开。

```bash
openspec-cn workset open checkout                # 已保存的工具，或提示
openspec-cn workset open checkout --tool cursor  # 仅本次使用此工具
```

**参数**

| 参数 | 说明 |
|---|---|
| `name` | 要打开的 workset。 |

**选项**

| 标志 | 作用 |
|---|---|
| `--tool <id>` | 仅本次用此工具打开。 |

没有 `--tool` 且没有已保存的工具时，open 会提示你选择已安装的工具。在非交互终端中它改为退出 1。

- 已不存在的成员目录会跳过并警告。主目录缺失时，下一个幸存的成员成为本次打开的主目录。没有任何成员目录存在时，打开失败。
- `--json` 会被拒绝：open 把终端交给工具，没有 JSON 模式。
- 启动失败时，错误以手动路径结尾：workspace 文件的路径和成员列表。

**退出码**

- 镜像工具：命令以工具自身的退出码退出，信号变为 `128+n`（Ctrl-C 后为 `130`）。
- `1`：workset 未知、没有可用成员目录，或没有可用工具。

### openspec-cn workset remove

删除已保存的 workset 及其生成的 `.code-workspace` 文件。成员目录绝不动。

```bash
openspec-cn workset remove checkout --yes
```

在交互式终端中，remove 会显示 workset 并请你确认。带 `--json` 或在终端外，它要求 `--yes`，没有则以 1 退出。

**选项**

| 标志 | 作用 |
|---|---|
| `--yes` | 非交互地确认移除。 |
| `--json` | 以 JSON 打印移除结果。 |

**输出**

```
Removed workset 'checkout'. Member folders were not touched.
```

## openspec-cn feedback

提交关于 OpenSpec 的反馈。

```bash
openspec-cn feedback "Validate output is hard to scan"
openspec-cn feedback "Archive fails on Windows" --body "Steps: init, propose, archive. Error: EPERM."
```

CLI 通过你的 `gh` CLI 把你的消息作为 GitHub issue 提交到 `Fission-AI/OpenSpec` 仓库。标题变为 `Feedback: <message>`。正文包含你的 `--body` 文本，外加带 CLI 版本、平台和时间戳的页脚。该 issue 会获得 `feedback` 标签。如果仓库没有定义该标签，CLI 会去掉标签重试并说明。

**参数**

| 参数 | 说明 |
|---|---|
| `message` | 一行摘要。会成为 issue 标题。必需。 |

**选项**

| 标志 | 作用 |
|---|---|
| `--body <text>` | 添加到 issue 正文的更长的描述。 |

**输出**

成功时：

```
✓ Feedback submitted successfully!
Issue URL: https://github.com/Fission-AI/OpenSpec/issues/1234
```

没有安装 `gh`，或 `gh` 未登录时，不会提交任何内容。CLI 在 `--- FORMATTED FEEDBACK ---` 标记之间打印你格式化后的反馈，然后打印一个预填的新 issue URL 供在浏览器中打开。未登录的路径会追加 `To auto-submit in the future: gh auth login`。

**退出码**

- `0`：issue 已创建，或手动提交回退已运行（没有 `gh`，或 `gh` 未登录）。
- `1`：没有给出消息。
- `gh` 自身的代码：`gh` 在认证后失败（网络、限流、issue 被禁用）。CLI 会先重新打印你的反馈和手动提交 URL。

<a id="openspec-completion"></a>

## openspec-cn completion

安装或生成 shell 补全。

```bash
openspec-cn completion install        # 检测你的 shell，安装，配置好
openspec-cn completion generate zsh   # 把脚本打印到 stdout
```

支持的 shell：`zsh`、`bash`、`fish`、`powershell`。每个子命令都接受可选的 shell 参数。省略它时 CLI 会从环境检测你的 shell。

| 子命令 | 作用 |
|---|---|
| `generate [shell]` | 把补全脚本打印到 stdout。 |
| `install [shell]` | 写入脚本并配置你的 shell 启动文件。 |
| `uninstall [shell]` | 移除脚本和配置块。 |

### openspec-cn completion generate

打印脚本，不写入任何内容。

```
#compdef openspec

# Zsh completion script for OpenSpec CLI
# Auto-generated - do not edit manually

_openspec() {
  local context state line
  typeset -A opt_args
...
```

### openspec-cn completion install

写入脚本并编辑你的 shell 配置。配置编辑位于 `# OPENSPEC:START` 和 `# OPENSPEC:END` 标记之间。现有脚本会先备份（`.backup-<timestamp>` 副本）。

| Shell | 脚本位置 | 编辑的配置 |
|---|---|---|
| zsh | `~/.zsh/completions/_openspec` | `~/.zshrc` |
| bash | `~/.local/share/bash-completion/completions/openspec` | `~/.bashrc` |
| fish | `~/.config/fish/completions/openspec.fish` | 无：fish 自动加载。 |
| powershell | `OpenSpecCompletion.ps1` beside your profile | `$PROFILE` |

安装了 Oh My Zsh 时，脚本落在 `$ZSH_CUSTOM/completions/_openspec`（默认 `~/.oh-my-zsh/custom/completions/_openspec`）。

**选项**

| 标志 | 作用 |
|---|---|
| `--verbose` | 同时打印安装路径、任何备份路径，以及编辑了哪个配置文件。 |

**输出**

```
✓ Completion script installed and .zshrc configured successfully

Restart your shell or run: exec zsh
```

### openspec-cn completion uninstall

移除脚本和标记的配置块。它会在触碰你的配置前询问（默认：否）。

**选项**

| 标志 | 作用 |
|---|---|
| `-y, --yes` | 跳过确认提示。 |

**输出**

```
✓ Completion script removed from /Users/you/.zsh/completions/_openspec. Removed OpenSpec configuration from ~/.zshrc
```

**退出码**

- `0`：脚本已生成、安装或移除。取消卸载也以 0 退出。
- `1`：shell 不受支持或无法检测，或安装/卸载步骤失败。

## openspec-cn change

`show`、`list` 和 `validate` 的已弃用名词形式。每次运行都会警告并指向动词优先的命令，然后照常运行：

```
Warning: The "openspec-cn change ..." commands are deprecated. Prefer verb-first commands (e.g., "openspec-cn list", "openspec-cn validate --changes").
Warning: "openspec-cn change list" is deprecated. Use "openspec-cn list".
add-rate-limit
```

| 已弃用 | 请改用 |
|---|---|
| `openspec-cn change show <name>` | `openspec-cn show <name>` |
| `openspec-cn change list` | `openspec-cn list` |
| `openspec-cn change validate <name>` | `openspec-cn validate <name>`（全部变更：`openspec-cn validate --changes`） |

动词优先的小节记录了这些标志。

## openspec-cn spec

`show`、`list` 和 `validate` 的已弃用名词形式。每次运行都会警告并指向动词优先的命令，然后照常运行：

```
Warning: The "openspec-cn spec ..." commands are deprecated. Prefer verb-first commands (e.g., "openspec-cn show", "openspec-cn validate --specs").
api
```

| 已弃用 | 请改用 |
|---|---|
| `openspec-cn spec show <id>` | `openspec-cn show <id>` |
| `openspec-cn spec list` | `openspec-cn list --specs` |
| `openspec-cn spec validate <id>` | `openspec-cn validate <id>`（全部 specs：`openspec-cn validate --specs`） |

动词优先的小节记录了这些标志。
