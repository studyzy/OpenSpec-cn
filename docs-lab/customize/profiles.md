# Profiles

> 选择安装哪些工作流。

profile 是你的偏好：在你机器上安装哪些 OpenSpec 工作流（AI 工具中的 [skills](../start/setup.md#the-workflow-files-skills)）。默认 profile 是 `core`。包含或排除工作流后，你的选择会保存为 `custom` profile。

## 核心集合

`core` profile 安装六个工作流，覆盖从想法到归档的整个循环：

| 工作流 | 用途 |
|---|---|
| [`explore`](../reference/skills.md#openspec-explore) | 在想法成为变更提案之前先想清楚 |
| [`propose`](../reference/skills.md#openspec-propose) | 创建变更提案，并一步生成它的全部规划制品 |
| [`apply`](../reference/skills.md#openspec-apply-change) | 实施变更提案的任务 |
| [`update`](../reference/skills.md#openspec-update-change) | 修订变更提案已有的规划制品 |
| [`sync`](../reference/skills.md#openspec-sync-specs) | 把变更提案的 spec 更新合并进 `specs/`，而不归档它 |
| [`archive`](../reference/skills.md#openspec-archive-change) | 把完成的变更提案移入归档 |

每个都链接到它的完整契约：参数、它创建什么，以及它如何回应。

## 扩展集合：可选工作流

核心集之外还有六个工作流可用。其中三个（`new`、`continue`、`ff`）逐个制品地创建变更提案，而不是像 `propose` 那样一次性创建。

| 工作流 | 用途 |
|---|---|
| [`new`](../reference/skills.md#openspec-new-change) | 以空脚手架启动一个变更提案 |
| [`continue`](../reference/skills.md#openspec-continue-change) | 一次一个地创建变更提案的下一个规划制品 |
| [`ff`](../reference/skills.md#openspec-ff-change) | 一遍创建变更提案及实现所需的全部规划制品 |
| [`verify`](../reference/skills.md#openspec-verify-change) | 检查实现是否与变更提案的制品一致 |
| [`bulk-archive`](../reference/skills.md#openspec-bulk-archive-change) | 一次归档多个变更提案 |
| [`onboard`](../reference/skills.md#openspec-onboard) | 通过端到端完成一个真实变更提案来学习工作流 |

要改变这个集合，运行交互式选择器：

```bash
openspec-cn config profile
```

选择器会把全部十二个工作流列成复选框，已安装的处于勾选状态。任何不是正好核心六个的选择都会保存为 `custom` profile，所以你也可以取消勾选不用的核心工作流。

## 交付方式（2.0 中已弃用）

OpenSpec 2.0 只安装 skills，因此 `delivery` 设置不再影响任何行为。已有的值会被保留。`openspec config set delivery <value>` 仍会保存该值，并打印一条说明它不起作用的提示。

在 1.x 中，delivery 决定安装 skills、commands 还是两者。[升级到 2.0](../help/upgrade-to-2.md) 说明了命令文件会怎样。

## 切换 profiles

切换分两步：先在你机器上更改 profile，然后在每个项目中运行更新来应用它。

1. 更改 profile：

   ```bash
   openspec-cn config profile        # 交互式
   openspec-cn config profile core   # 重置为核心六个
   ```

2. 在你工作的每个项目中运行更新：

   ```bash
   openspec-cn update
   ```

当你的当前目录是一个已有的 OpenSpec 项目时，交互式流程会主动提出替你在那里执行第 2 步。
