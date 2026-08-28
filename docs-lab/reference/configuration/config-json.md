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
| `openers` | list | No | workset 在哪些工具中打开，以及各自如何启动 |
| `telemetry` | map | No | CLI 维护的状态：匿名 id 和是否已展示过提示 |

### profile

`openspec-cn init` 安装哪一组工作流。默认为 `core`：propose、explore、apply、update、sync 和 archive。设置为 `custom` 则只安装 `workflows` 列表中指定的工作流。

### delivery

init 将工作流作为 skills、斜杠命令还是两者安装。默认为 `both`。

### workflows

`custom` profile 安装的工作流；profile 为 `core` 时忽略。有效 id：`propose`、`explore`、`new`、`continue`、`apply`、`update`、`ff`、`sync`、`archive`、`bulk-archive`、`verify`、`onboard`。

### featureFlags

以标志名称为键的布尔开关，用 `openspec-cn config set featureFlags.<flag> true` 设置。目前 CLI 不读取任何标志。

### defaultStore

根目录解析的机器级回退 store id，仅在无 `--store` 标志、本地 `openspec/` 或项目 `store:` 指针可解析时才会用到。完整的解析阶梯参见 [根目录解析](stores.md#root-resolution)。

### openers

workset 可以在哪些工具中打开，以及各自如何启动。条目为手工编辑，使用时校验。每条可设置 `style`（`workspace-file` 或 `attach-dirs`）、`label`、`command`、`args` 和 `attach_flag`，并合并到内置默认值之上。

### telemetry

CLI 为遥测写入的状态：你的匿名 id，以及首次运行的提示是否已展示。它本身不是退出开关。禁用遥测用的是环境变量，参见 [环境变量](environment-variables.md)。

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
