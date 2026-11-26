# 在没有对应 skill 时完成某一步

当某一步所需的 skill 未安装时使用。每一节是某个 skill 对应的 CLI 做法。从项目根目录运行这些命令，并读取它们的 `--json` 输出。用户也可以改用 `openspec-cn config profile` 安装该 skill，再运行 `openspec-cn update`。

## openspec-explore

探索是对话，不是命令。读取 `openspec-cn list --json`、相关的 specs 和代码，然后与用户一起把问题想清楚。在他们决定要构建什么之前，不要写代码，也不要写变更文件。

## openspec-propose、openspec-new-change、openspec-continue-change、openspec-ff-change

1. 启动变更：`openspec-cn new change "<name>"`，使用简短的 kebab-case 名称。
2. 运行 `openspec-cn status --change "<name>" --json` 查看哪些制品已就绪。
3. 每写一个制品，运行 `openspec-cn instructions <artifact-id> --change "<name>" --json`，按它的 `instruction` 和 `template` 操作。把文件写到 `outputPath`。
4. 重复第 2、3 步。逐个制品创建变更时，写完一个制品就停；用户想要完整计划时，一直写到规划完成。

## openspec-update-change

读取变更的文件，修订用户要求改动的那些，然后运行 `openspec-cn validate "<name>"` 并修复它报告的问题。只改规划文件，绝不改代码。

## openspec-apply-change

运行 `openspec-cn instructions apply --change "<name>" --json`，读取它在 `contextFiles` 下列出的文件，然后按序完成未勾选的任务。每完成一项就立刻把 `tasks.md` 里的 `- [ ]` 勾成 `- [x]`。

## openspec-verify-change

读取变更的 tasks 和 specs，然后逐项对照代码检查：每个任务都已完成，每条需求和场景都已实现。报告缺少什么。不要改动任何文件。

## openspec-sync-specs

没有命令能在保持变更开启的同时更新主 specs。要么手工把 `openspec/changes/<name>/specs/` 下的每个文件合并进对应的 `openspec/specs/<capability>/spec.md` 并运行 `openspec-cn validate --specs`，要么归档该变更，让归档替你完成合并。

## openspec-archive-change、openspec-bulk-archive-change

先确认变更已完成：`openspec-cn status --change "<name>" --json` 显示它的制品，`openspec-cn list --json` 显示 `completedTasks` 占 `totalTasks` 的情况。若有未完成项，告诉用户并在继续前询问。然后运行 `openspec-cn archive "<name>" --yes`，它会把变更的 spec 更新合并进主 specs，并把变更移入归档。多个变更时，一次处理一个。

## openspec-onboard

带用户在他们自己的项目里完整走一遍一个小变更：用上面的各节依次探索、提案、实施、归档。
