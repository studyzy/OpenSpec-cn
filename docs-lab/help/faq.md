# 常见问题

> 不需要单独页面就能回答的简短问题。

<!-- WIP, on the todo list: this page is not written yet and is held back from the
site (its section is commented out in website/docs.sync.config.mjs, 2026-08-21). The
file stays so the structure and inbound links survive; re-list it in the sync config
once the prose lands. -->

<!-- Every entry is a one-liner: a short answer or a router link to the page that owns the topic; how-to content never lives here (README's "FAQ is one-liners" rule). Update/uninstall moved to installation.md; the skills-missing fix and Getting help live in troubleshooting.md; the git question is a one-line yes routing to guides/teams.md, which owns the team conventions. Unfilled headings are skeletons. -->

## openspec/ 应该提交进 git 吗？

## 哪些在终端运行，哪些在聊天中？

## OpenSpec 能配合我的工具使用吗？

如果它在[支持矩阵](../reference/supported-tools.md)中有对应行，就可以。
在 init 时选择它的 id。如果它没被列出，但能读取共享的 `.agents/skills/`
文件夹，就选择 **Shared `.agents` skills**（`--tools agents`）。如果两者都不是，
请在 [OpenSpec 仓库](https://github.com/Fission-AI/OpenSpec/issues)中提出请求。

## 旧的 /openspec:* 命令去哪了？
