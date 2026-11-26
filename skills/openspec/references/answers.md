# 常见问题

当用户问 OpenSpec 如何工作、或如何设置时使用。在依赖某个标志之前，先用 CLI 自己的帮助（`openspec-cn <command> --help`）核对答案。

## 文件都在哪里

- `openspec/specs/<capability>/spec.md`：系统当下的行为，以带场景的需求描述。
- `openspec/changes/<name>/`：一个计划中的变更。通常有 `proposal.md`、`specs/`（spec 更新）、`design.md`（可选）和 `tasks.md`。
- `openspec/changes/archive/`：已完成的变更。
- `openspec/config.yaml`：项目的 schema、每个 Agent 都会读到的 `context` 行，以及每个制品的 `rules`。

## 查看状态

- 进行中的变更：`openspec-cn list`。specs：`openspec-cn list --specs`。
- 某个变更的进展：`openspec-cn status --change "<name>"`。
- 读取变更或 spec：`openspec-cn show "<name>"`。
- 检查文件格式是否正确：`openspec-cn validate "<name>"`，或 `openspec-cn validate --all`。
- 总览仪表盘：`openspec-cn view`。

## 初始化与配置

- 初始化项目，或给它添加一个 Agent：`openspec-cn init`。
- 选择安装哪些 skills：`openspec-cn config profile`，然后在每个项目里运行 `openspec-cn update`。
- 升级 OpenSpec 后刷新 skills：`openspec-cn update`。
- 让 Agent 了解这个项目的特定约定：在 `openspec/config.yaml` 的 `context` 下加一行简短说明。只有在用户认可措辞后才修改文件。
- 查看或修改制品工作流：`openspec-cn schemas` 列出所有 schema，`openspec-cn templates` 显示每个制品的模板来自哪里。

## Stores

store 是注册在本机上的、独立于代码仓库的 OpenSpec 仓库，用于存放代码之外的 specs。`openspec-cn store --help` 列出它的命令。大多数命令都接受 `--store <id>`，以便在 store 而非当前项目中工作。

## 出了问题时

- 运行 `openspec-cn doctor` 并阅读它的报告。
- 要告诉维护者，在用户认可消息内容后使用 `openspec-cn feedback "<message>"`。
