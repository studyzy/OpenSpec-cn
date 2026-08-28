# Profiles

> 选择安装哪些工作流，以及它们以 skills、commands 还是两者形式安装。

profile 是你的偏好：在你机器上安装哪些 OpenSpec 工作流（AI 工具中的 [skills 和 commands](../start/setup.md#the-workflow-files-skills-and-commands)）。默认 profile 是 `core`。包含或排除工作流后，你的选择会保存为 `custom` profile。

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

选择器会询问要配置什么（[交付方式](#delivery-skills-commands-or-both)、工作流，还是两者），然后把全部十二个工作流列成复选框，已安装的处于勾选状态。任何不是正好核心六个的选择都会保存为 `custom` profile，所以你也可以取消勾选不用的核心工作流。

<a id="delivery-skills-commands-or-both"></a>

## 交付方式：skills、commands 或两者

交付方式是 profile 的一个设置，让你选择只安装 skills、只安装 commands，还是两者都装。默认是 `both`。[设置你的项目](../start/setup.md#the-workflow-files-skills-and-commands) 解释了这两种形式以及为什么两者都存在。该字段的精确契约在 [CLI settings (config.json)](../reference/configuration/config-json.md#delivery)。

两种修改方式：

**交互式**：运行 `openspec-cn config profile` 并选择 "Delivery only"。下面是从 both 切换为仅 skills 的样子：

```
Current profile settings
  Delivery: both

? What do you want to configure? Delivery only
? Delivery mode (how workflows are installed): Skills only

Config changes:
  delivery: both -> skills
? Apply changes to this project now? (Y/n) y
```

**直接式**：一条命令，没有提示：

```bash
openspec-cn config set delivery skills   # or: both, commands
```

交付方式绝不会改变 profile 名称。`core` 和 `custom` 只描述工作流集合，切回 `core` 会保留你的交付方式设置。

## 切换 profiles

切换分两步：先在你机器上更改 profile，然后在每个项目中运行更新来应用它。

1. 更改 profile：

   ```bash
   openspec-cn config profile        # interactive
   openspec-cn config profile core   # reset to the core six (keeps delivery)
   ```

2. 在你工作的每个项目中运行更新：

   ```bash
   openspec-cn update
   ```

当你的当前目录是一个已有的 OpenSpec 项目时，交互式流程会主动提出替你在那里执行第 2 步。
