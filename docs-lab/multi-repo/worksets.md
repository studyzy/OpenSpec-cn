# Worksets (beta)

> 在同一个编辑器窗口打开 store 和使用它的仓库，让你的 Agent 同时看到两者。

有 store 时，你的 Agent 需要的上下文分散在多个文件夹里。Specs 和 changes 住在 store 中，代码住在各个仓库里。在一个仓库中启动的 Agent 只能读取和 grep 那个仓库，别无其他，所以它只能基于一半的图景工作。

Worksets 就是 OpenSpec 为此提供的工具。一个 workset 是你在同一时间一起打开的一组已保存、有名字的文件夹。本页假设 store 已经设置好并注册在你机器上。[Stores (beta)](stores.md) 覆盖了那部分。

## 工作原理

- **它是什么**：一个命名的文件夹列表，只保存在你的机器上。不会向成员文件夹写入任何内容，也不提交任何东西。
- **打开做什么**：OpenSpec 根据列表生成一个 `.code-workspace` 文件，并在其上启动你的编辑器。每个成员文件夹都落在同一个窗口里。
- **你得到什么**：你编辑器的搜索，以及你在那个窗口内运行的任何 Agent，都能读取每个成员文件夹。Agent 可以在一个会话里 grep store 的 specs 和仓库的代码。
- **它不改变什么**：命令使用哪个 `openspec/` 文件夹。那仍然遵循[使用 store 时制品在哪里创建](stores.md#where-artifacts-get-created-when-using-stores)。

## 设置它

1. **保存 workset**（每台机器一次）。把仓库和 store 列为成员，以及用什么工具打开它们：

   ```bash
   # 保存一组你一起打开的命名文件夹
   openspec-cn workset create platform \
     --member ~/src/web-app \
     --member ~/openspec/team-plans \
     --tool code
   ```

   ```yaml
   Saved workset 'platform' (2 members) to your machine.
   Open it any time with: openspec-cn workset open platform
   ```

2. **每次开始工作时打开它**：

   ```bash
   # 在同一个 VS Code 窗口中打开每个成员
   openspec-cn workset open platform
   ```

`openspec-cn workset list` 显示你保存了什么，`openspec-cn workset remove <name>` 删除一个 workset 而不触碰成员文件夹：

```yaml
platform  (opens in VS Code)
  web-app     /Users/you/src/web-app
  team-plans  /Users/you/openspec/team-plans
```

## 使用它：一个变更，两个文件夹

假设 `add-login` 变更住在 `team-plans` store 里，它的代码住在 `web-app` 中。打开 `platform` workset，让你的 Agent 实施这个变更。在那个会话里它能：

- 读取 `team-plans/openspec/changes/add-login/` 以及旁边的 specs
- 编辑 `web-app/` 里的代码
- 在 `web-app` 内部运行 `openspec-cn` 命令

没有 workset，Agent 只能看到它被启动的那个文件夹。

## 开箱即用的工具

- **VS Code**（`--tool code`）和 **Cursor**（`--tool cursor`）：内置。各自打开一个包含所有成员文件夹的窗口。
- **终端里的 Claude Code 和 Codex**：在流程重做期间，暂时禁用作为 workset 打开器。`--tool claude` 或 `--tool codex` 会带着说明错误的报错停下来，并把你指向 VS Code 或 Cursor。
- **其他编辑器**：在 [CLI settings (config.json)](../reference/configuration/config-json.md) 的 `openers` 键下添加它们。
