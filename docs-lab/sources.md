# 每个当前页面的去向

旧到新的映射：`docs-lab/` 各页面在起草时的源材料，以及切换时的重定向清单。目标结构是 [README.md](README.md) 中的页面索引。

| 当前（`docs/`） | 目的地 |
|---|---|
| README.md（索引） | `start/overview.md`，重写为宣传与路由 |
| getting-started.md | `start/quickstart.md` |
| installation.md | 拆分：`start/installation.md`（机器级：矩阵、更新、卸载）· `start/setup.md`（项目级：init、init 写入的内容、skills-vs-commands 交付方式、stores 路由） |
| how-commands-work.md | `start/quickstart.md`（行内标注）· `help/faq.md` · `help/troubleshooting.md` |
| existing-projects.md | `guides/existing-codebases.md`（"存量代码库"）；演练部分到 `start/quickstart.md` |
| overview.md | `guides/concepts.md` |
| concepts.md | `guides/concepts.md`（核心）· delta 格式到 `reference/schemas/spec-driven/index.md`（Delta specs 章节）· 内嵌术语表删除 |
| explore.md | `guides/explore.md` |
| workflows.md | `guides/apply.md`（执行模式、continue/ff）· `reference/skills.md` |
| opsx.md | 拆分为四个方向：配置到 `customize/project-config.md` · 命令到 `reference/skills.md` · 理念到 `guides/concepts.md` · 架构到 `reference/architecture/` |
| reviewing-changes.md + writing-specs.md | `guides/review-the-plan.md`（合并） |
| editing-changes.md | `guides/change-course.md` |
| team-workflow.md | `guides/teams.md` |
| examples.md | 停放：`guides/examples.md` 骨架在出现真实归档变更前保持不进入索引与同步配置（见 README TODOs） |
| customization.md | `customize/project-config.md` + `customize/schemas.md` + `customize/overview.md`（决策阶梯）· schema.yaml 字段到 `reference/schemas/schema-yaml.md` |
| multi-language.md | `customize/project-config.md` §context 中的"另一种语言"说明 |
| stores-beta/user-guide.md | `multi-repo/stores.md` · worksets 章节到 `multi-repo/worksets.md` |
| commands.md | `reference/skills.md`（移除遗留 `/openspec:*` 章节） |
| cli.md | `reference/cli.md`（减去安装部分，移至 `start/installation.md`） |
| supported-tools.md | `reference/supported-tools.md` |
| glossary.md | `reference/glossary.md` |
| faq.md | `help/faq.md`（删除未发布模型的说法；更新/卸载到 `start/installation.md`） |
| troubleshooting.md | `help/troubleshooting.md`，所有 5 份副本的规范归宿，外加"获取帮助" |
| migration-guide.md | `help/legacy/migration.md`（降级） |
| agent-contract.md | **站外**，转到仓库侧贡献者文档 |

没有单一现有来源的新页面：`customize/overview.md`、`customize/profiles.md`（目前：分散在 12 个页面中的两行片段），以及 `reference/schemas/` 和 `reference/configuration/` 章节（取代了计划中的 `reference/file-formats.md`）。

<a id="cutover"></a>

## 切换

将 `website/docs.sync.config.mjs` 指向此处，在 `website/public/_redirects` 中添加旧到新的重定向，并验证 `llms.txt` / `llms-full.txt` / 逐页 markdown 路由。`docs/` 保持原位、不动。站点只是停止读取它。
