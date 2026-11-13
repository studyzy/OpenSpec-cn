---
"@studyzy/openspec-cn": major
---

合入上游 OpenSpec 2.0 的全部变更，这是一次破坏性升级：

- skills 统一安装到共享的 `.agents/skills/`，只写一份；不读取该目录的工具在其自己的文件夹中获得指向共享副本的链接（Claude Code、Kiro、CodeBuddy 等）。MiniMax Code 仍使用全局的 `~/.minimax/skills/`。
- 不再生成斜杠命令文件（`/opsx:*`）。`delivery` 设置被弃用：仍会被接受和读取，但不再改变安装内容。旧的生成命令文件会在 `update` 时移除，你编辑过的会保留并列出。
- Amazon Q Developer 停止支持，`init --tools amazon-q` 会报错并提示改用 Kiro；已有项目中的 OpenSpec 文件会在 `update` 时清理（编辑过的保留）。
- `openspec-cn update` 会一次性从 0.12 以来的任意版本升级项目，并可刷新被编辑过的 skill、清理退役工具与旧版遗留文件。
- 任务解析支持跨行续写的任务文本；Windows 上不再把 cmd.exe 误判为 PowerShell。

升级前请先提交工作区，具体步骤见 `docs-lab/help/upgrade-to-2.md`。