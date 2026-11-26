# 当前进展

当用户问进展如何或下一步做什么时使用。回答前先查看：

- `openspec-cn list --json` 列出进行中的变更。
- `openspec-cn status --change "<name>" --json` 显示某个变更的计划已有哪些部分、下一步是什么。`openspec-cn status --all --json` 对所有变更做同样的事。
- `openspec-cn show "<name>"` 打印一个变更或一条 spec。
- 如果用户点名了 store，给以上每条加上 `--store <id>`。`openspec-cn store list --json` 列出所有 store。

用一两句话说明当前进展，点名下一步和负责它的 skill，并提议由你来执行。在用户同意之前不要开始。
