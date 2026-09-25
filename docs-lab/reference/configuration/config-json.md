# CLI 设置（config.json）

> config.json 的每一个字段：openspec-cn CLI 在你的机器上的行为方式。

## 位置

CLI 将机器级设置存放在 macOS 与 Linux 的 `~/.config/openspec/config.json`，以及 Windows 的 `%APPDATA%\openspec\config.json`。设置 `$XDG_CONFIG_HOME` 时，在所有平台上它都优先。`openspec-cn config` 命令负责读取和编辑它。

## 字段

| 键 | 类型 | 必填 | 作用 |
| --- | --- | --- | --- |
| `profile` | string: `core` or `custom` | No | 选择 `openspec-cn init` 安装的工作流集合 |
| `delivery` | string: `both`, `skills`, or `commands` | No | init 安装 skills、斜杠命令，还是两者都装 |
| `workflows` | list of strings | No | `custom` profile 安装的工作流列表 |
| `featureFlags` | map: flag → boolean | No | 布尔功能开关 |
| `defaultStore` | string | No | 根目录解析的机器级回退 store |
| `openers` | map: 工具 id → 设置 | No | workset 在哪些工具中打开，以及各自如何启动 |
| `telemetry` | map | No | 遥测退出开关、匿名 id 和提示已展示状态 |

### profile

`openspec-cn init` 安装哪一组工作流。默认为 `core`：propose、explore、apply、update、sync 和 archive。设置为 `custom` 则只安装 `workflows` 列表中指定的工作流。

### delivery

init 将工作流作为 skills、斜杠命令还是两者安装。默认为 `both`。

### workflows

`custom` profile 安装的工作流；profile 为 `core` 时忽略。有效 id：`propose`、`explore`、`new`、`continue`、`apply`、`update`、`ff`、`sync`、`archive`、`bulk-archive`、`verify`、`onboard`。

### featureFlags

以标志名称为键的布尔开关，用 `openspec-cn config set featureFlags.<flag> true` 设置。目前 CLI 不读取任何标志。

### defaultStore

根目录解析的机器级回退 store id，仅在无 `--store` 标志、本地 `openspec/` 或项目 `store:` 指针可解析时才会用到。完整的解析阶梯参见 [根目录解析](../../multi-repo/stores.md#where-artifacts-get-created-when-using-stores)。

### openers

workset 可以在哪些工具中打开，以工具 id 为键。在终端里用 `openspec-cn config edit` 编辑全局 `config.json` 中的 `openers`。

| 字段 | 契约 |
| --- | --- |
| `style` | `workspace-file` 或 `attach-dirs`。新工具必填；内置工具可选。 |
| `label` | 工具选择器中显示的非空字符串。新工具默认为其 id。 |
| `command` | 非空的可执行文件名或路径。新工具默认为其 id。参数请放在 `args` 中，不要写进这个字符串。 |
| `args` | 传给 workspace 文件或 attach 标志之前的字符串数组。新工具默认为 `[]`。 |
| `attach_flag` | `attach-dirs` 下与每个成员路径成对出现的非空字符串。新工具默认为 `--add-dir`。对 `workspace-file` 忽略。 |

**内置工具覆盖：** `code`、`cursor`、`claude` 和 `codex` 会保留你省略的字段。设置 `args` 会替换整个参数列表；`[]` 会清空它。

**启动方式：** `workspace-file` 把生成的 `.code-workspace` 路径传给可执行文件。`attach-dirs` 为每个成员（包括主成员）传递一对标志/路径。

**可用性：** `attach-dirs` 启动方式（包括 Claude Code 和 Codex）默认禁用。你不能用 `--tool` 选择或保存它们，且 OpenSpec 拒绝打开已指定此类工具的 workset。配置覆盖不会启用 `attach-dirs` 启动方式。

**校验：** 未知字段、无效类型，以及缺少 `style` 的新工具，都会在 workset 命令读取启动器表时报错。

下面的例子添加了 VS Code Insiders，并让内置的 VS Code 启动器在启动时带上 `--new-window`：

```json
{
  "openers": {
    "code-insiders": {
      "style": "workspace-file",
      "label": "VS Code Insiders"
    },
    "code": {
      "args": ["--new-window"]
    }
  }
}
```

对应的 `code-insiders` 或 `code` 可执行文件必须已安装且在 `PATH` 上可用。

### telemetry

CLI 存储你的匿名 id，以及首次运行提示是否已展示。将 `telemetry.enabled` 设为 `false` 可禁用遥测。你也可以在环境中设置 `OPENSPEC_TELEMETRY=0` 或 `DO_NOT_TRACK=1` 来退出遥测。

## 示例

一个填写完整的 config.json：

```json
{
  "profile": "core",
  "delivery": "both",
  "featureFlags": {},
  "telemetry": {
    "anonymousId": "5f8a2c1e-4b6d-4f9a-9c3d-7e1b2a8d4c6f",
    "noticeSeen": true
  }
}
```
