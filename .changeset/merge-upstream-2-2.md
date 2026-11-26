---
"@studyzy/openspec-cn": minor
---

合入上游 OpenSpec 2.2.0 的全部变更，并完成汉化与测试适配：

- 新增 `openspec` 路由 skill：任何 OpenSpec 问题的统一入口。输入 `/openspec`（Codex 为 `$openspec`，Kimi Code 为 `/skill:openspec`）并说出需求，它会先检查项目当前状态，然后回答问题、把请求交给负责该工作的 skill，或按顺序完成多个步骤；所需 skill 未安装时改用 `openspec-cn` CLI 完成该步，并提示如何安装。它随每个 profile 一起安装，不属于工作流集合，也不出现在 `openspec-cn config profile` 中。
- skills 支持 `references/` 子目录：`SKILL.md` 之外可附带补充细节文件，Agent 按需读取；安装、更新、移除都按整个 skill 文件夹处理，`openspec-cn update` 会一并刷新。路由 skill 是首个使用它的技能。
- 默认安装的 skills 由 6 个变为 7 个（含路由 skill），`openspec-cn init` / `update` 的摘要与提示文案随之更新。**注意**：若有脚本解析初始化摘要中的 skills 数量，需相应调整。
- Windows 独立二进制安装：新版 exe 在版本校验后被杀毒软件短暂占用时，移动操作会重试，避免安装失败。
- 同步汉化新增的 CLI 文案、工作流模板、生成的 skills 与 `docs-lab` 文档，重算模板 parity 哈希、适配测试断言，并把版本号与上游对齐为 2.2.0。

本次无其它破坏性变更。
