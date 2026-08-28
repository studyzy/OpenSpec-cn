# 消息映射：文档必须回答的问题及其位置

[README](README.md) 索引按页面到职责组织。本文件反向组织：一份扁平的问题清单，列出我们需要文档回答的问题，每个问题指向负责回答的小组与页面。状态说明该答案是否已存在：**Answered**（负责页面的正文已落地）、**Skeleton**（已分配负责人，页面只有标题）、**Gap**（无负责人）、**Off-site**（按决策在这些文档之外回答）。当某个页面的正文落地后，将该行翻转为 Answered。行顺序跟随负责页面的侧边栏顺序；缺口放在其拟议归属的位置，站外行放在最后。保持行的粒度较粗（问题到页面，而不是句子到章节），以便维护成本低廉。

| 问题 | 由谁回答 | 状态 |
|---|---|---|
| 我们如何宣传核心理念（让较大功能保持在轨道上并保持一致，而不只是写代码前的计划）？ | [Start › Overview](start/overview.md)（2026-08-21 清空以从头重写，届时从站点下架；简报见 Notes.md） | Skeleton |
| 用户如何判断 OpenSpec 值得投入时间？ | [Start › Overview](start/overview.md)（2026-08-21 清空，见上一行） | Skeleton |
| 用户应如何安装 CLI、更新、卸载？ | [Start › Installation](start/installation.md) | Answered |
| 用户如何为他们的 AI 助手手动安装与设置？ | [Start › Installation](start/installation.md)，install.md 提示词 | Answered |
| 用户应如何将 OpenSpec 添加到他们的仓库？ | [Start › Set up your project](start/setup.md) | Answered |
| 工作流如何进入用户的工具，为什么同时有 skills 和 commands？ | [Start › Set up your project](start/setup.md) | Answered |
| 我们如何教授这个循环：propose、review、apply、archive？ | [Start › Quickstart](start/quickstart.md) | Answered |
| 用户应如何端到端跑完第一个变更？ | [Start › Quickstart](start/quickstart.md) | Answered |
| 用户如何知道哪些提示词放在 AI 聊天中、哪些命令放在终端里？ | [Start › Quickstart](start/quickstart.md) 各步骤行内说明，然后 [Help › FAQ](help/faq.md) | Answered |
| 我们如何解释什么是 specs 和 changes？ | [Guides › Understanding › Concepts](guides/concepts.md) | Skeleton |
| 用户应如何在提出 proposal 之前思考一个想法？ | [Guides › Using › Explore an idea](guides/explore.md) | Skeleton |
| 用户应如何评审计划？ | [Guides › Using › Review the plan](guides/review-the-plan.md) | Skeleton |
| 用户在归档前如何检查实现是否匹配计划？ | [Guides › Using › Review the plan](guides/review-the-plan.md)，verify 环节 | Skeleton |
| 用户应如何跨会话和上下文限制运行计划？ | [Guides › Using › Apply a change](guides/apply.md) | Skeleton |
| 用户应如何安排计划节奏：一次全部起草，还是一个制品一个制品来？ | [Guides › Using › Apply a change](guides/apply.md)，continue 和 fast-forward | Skeleton |
| 我们如何解释标准流程（propose 一步起草所有制品）与迭代流程（new 创建变更，continue 起草下一个制品，fast-forward 追赶进度）的区别？ | [Start › Quickstart](start/quickstart.md) 只教授标准流程；[Guides › Using › Apply a change](guides/apply.md) 负责变更存在后的节奏；[Reference › Skills](reference/skills.md) 持有 new/continue/ff 的契约；[Customize › Profiles](customize/profiles.md) 覆盖安装它们；[README](README.md) TODO 提议一个 Using 指南 | Gap |
| 用户应如何在变更中途调整方向，或放弃？ | [Guides › Using › Change course](guides/change-course.md) | Skeleton |
| 团队应如何一起运行 OpenSpec？ | [Guides › Adopting › Teams](guides/teams.md) | Skeleton |
| 用户应如何同时处理多个变更？ | [Guides › Adopting › Teams](guides/teams.md) 负责触碰同一 spec 的冲突情况；一般答案（包括单人，不止团队）尚无负责人 | Gap |
| 用户应如何在循环中处理 git：分支、提交、PR？ | 只有归档与 PR 的先后顺序有归属，由 [Guides › Adopting › Teams](guides/teams.md) 负责；README TODO 提议一个指南 | Gap |
| 一个好的变更长什么样？ | `guides/examples.md` 停放，直到真实归档变更能填充它（README TODO）；无已发布的负责人 | Gap |
| 用户应如何在已存在的代码上采用 OpenSpec？ | [Guides › Adopting › Existing codebases](guides/existing-codebases.md) | Skeleton |
| 用户应如何在单体仓库（monorepo）中运行 OpenSpec？ | 遗留 `docs/existing-projects.md` 负责（仓库根目录一个 `openspec/`，领域映射到包）；可能的归属是 [Guides › Adopting › Existing codebases](guides/existing-codebases.md)，其中 [Multi-repo › Stores](multi-repo/stores.md) 承接被视为独立仓库的包 | Gap |
| 我们如何解释 OpenSpec 中哪些可以自定义？ | [Customize › Overview](customize/overview.md) | Answered |
| 用户如何选择正确的自定义层级，何时应从配置升级到 schemas？ | [Customize › Overview](customize/overview.md) 的"Not sure which to use?"章节 | Answered |
| 用户应如何选择安装哪些工作流？ | [Customize › Profiles](customize/profiles.md) | Answered |
| 用户如何切换为仅 skills 或仅 commands？ | [Customize › Profiles](customize/profiles.md) 的 Delivery 章节；[Start › Set up your project](start/setup.md) 负责两种形式为何存在 | Answered |
| 用户如何让工作流按自己的方式规划变更：context、rules 和 guidance？ | [Customize › Project configuration](customize/project-config.md) | Answered |
| 用户如何让制品用英语以外的语言书写？ | [Customize › Project configuration](customize/project-config.md) 的 context 章节中"另一种语言"说明 | Answered |
| 用户应如何改变 OpenSpec 产出的内容？ | [Customize › Schemas](customize/schemas.md)，其中 fork 演练在"Creating your own custom schema" | Answered |
| 用户应如何编辑已安装的 skill 提示词？ | 无负责人：`customize/skills.md` 停放（README TODO），直到对 `openspec update` 覆盖编辑有好的答案 | Gap |
| 用户应如何跨多个仓库运行 OpenSpec？ | [Multi-repo › Stores](multi-repo/stores.md)；[Start › Set up your project](start/setup.md) 从"Pick where OpenSpec lives"路由过去 | Answered |
| 用户应如何规划跨仓库的变更？ | [Multi-repo › Stores](multi-repo/stores.md) | Answered |
| 每个 skill 做什么，用户何时应使用它？ | [Reference › Skills](reference/skills.md) | Answered |
| 用户在哪里查找终端命令？ | [Reference › CLI](reference/cli.md) | Answered |
| 用户如何了解收集了哪些遥测数据，以及如何选择退出？ | [Reference › Configuration › Environment variables](reference/configuration/environment-variables.md) 负责事实（曾是 README-TODO 缺口）；[Help › FAQ](help/faq.md) 为搜索者路由 | Skeleton |
| 用户在哪里查找制品的格式，或 schema 定义的字段？ | [Reference › Schemas](reference/schemas/index.md) | Answered |
| 用户在哪里查找改变 OpenSpec 行为的设置或文件？ | [Reference › Configuration](reference/configuration/index.md) | Answered |
| 一条命令作用于哪个 openspec/ 目录树？ | [Reference › Configuration › Stores](reference/configuration/stores.md) 负责整个解析阶梯，包括日常情形（最近的 openspec/ 生效）；读者从 [Configuration overview](reference/configuration/index.md) 映射的 Stores 行到达 | Skeleton |
| 用户应如何运行一个无 spec 影响的变更，或彻底退役一项能力？ | [Reference › Configuration › Change metadata](reference/configuration/change-metadata.md) 负责 `skip_specs` 和 `retire_capabilities` 契约；[Reference › Schemas › spec-driven](reference/schemas/spec-driven/index.md) 的 Delta specs 章节负责它们对 deltas 和归档的影响；两半都没有指南负责人 | Gap |
| 什么是 initiative，变更如何加入一个？ | 无负责人：`initiative` 字段的契约在 [Reference › Configuration › Change metadata](reference/configuration/change-metadata.md) 上，但没有页面教授 initiatives（multi-repo 只有 Stores） | Gap |
| 什么是 workset，用户如何在编辑器中打开一个？ | [Multi-repo › Worksets](multi-repo/worksets.md)；`openers` 字段的契约留在 [Reference › Configuration › CLI settings](reference/configuration/config-json.md) | Answered |
| 哪些 AI 工具可用，各自的语法是什么？ | [Reference › Supported tools](reference/supported-tools.md) | Answered |
| 我的工具没列出，还能用 OpenSpec 吗？ | [Help › FAQ](help/faq.md) 路由：共享的 `.agents` 目标或一个 issue；[Reference › Supported tools](reference/supported-tools.md) 的 Per-tool notes 持有共享目标的契约 | Answered |
| 用户在哪里查找术语？ | [Reference › Glossary](reference/glossary.md) | Answered |
| OPSX 是如何构建的？ | [Reference › Architecture](reference/architecture/index.md) | Skeleton |
| 我们如何解释工作流是流动的、动作而非阶段？ | [Start › Overview](start/overview.md) 重写后将承载这一宣传（"共享地图，而非提前计划"的框架在被清空的骨架中）；[sources.md](sources.md) 将 opsx.md 的解释路由到 [Guides › Understanding › Concepts](guides/concepts.md)，但该页在第 3 轮评审中收窄为仅制品；可能的归属是 Guides › Understanding，扩展 [Concepts](guides/concepts.md) 或新增同级页面，[Reference › Architecture › Design decisions](reference/architecture/design-decisions.md) 保留其中的 why | Gap |
| 当 OpenSpec 没按预期工作时，用户应怎么办？ | [Help › Troubleshooting](help/troubleshooting.md)，然后 [Help › FAQ](help/faq.md) | Skeleton |
| 用户去哪里求助或报告 bug？ | [Help › Troubleshooting](help/troubleshooting.md) 的 Getting help | Skeleton |
| 用户应如何迁移离开遗留的 `/openspec:*` 命令？ | [Help › Migration](help/legacy/migration.md) | Skeleton |
| 脚本或 CI 如何以编程方式驱动 CLI？ | 按决策站外：仓库侧贡献者文档，见 [sources.md](sources.md) | Off-site |
