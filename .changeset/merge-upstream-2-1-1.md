---
"@studyzy/openspec-cn": patch
---

合入上游 OpenSpec 2.1.1 的全部变更，并完成汉化与测试适配：

- `openspec-cn init` / `update` 改为直接从已安装的 npm 包中安装 skills：离线可用、不再需要 Git，且始终与所安装的版本一致。此前"缺少 Git"与"release tag 尚未创建"两类安装失败随之消失。
- `openspec-cn update` 现在能发现并刷新由 `npx skills add` 装入项目的 skills（读取 `skills-lock.json` 中的来源）。
- `openspec-cn version --check` 与 `openspec-cn update` 不再让 Homebrew / Nix 安装去执行 `npm install -g`：Homebrew 安装会报告为 `homebrew` 并提示 `brew upgrade openspec-cn`，Nix 安装报告为 `nix` 且不给 npm 命令。
- `openspec-cn archive` 在写入任何主 spec 之前先检查归档目标是否已存在，并在移动前再次检查，避免中途冲突留下已同步却未归档的中间状态；新建主 spec 时在 `## Purpose` 后补一个空行，满足 Prettier 与 markdownlint MD022。
- `openspec-cn validate --strict` 不再因 delta spec 以 frontmatter 块开头而失败；归档仍把该块留在变更中，并会点名提示。MODIFIED 需求相对主 spec 增长超过 500 字符时会给出警告。
- 退役能力时，以 `<` 开头的折行文本（如 `<args> are passed on`）不再被误判为需求外内容；单独成行的标签与原始 HTML 仍会报告。
- `openspec-continue-change` 恢复在规划完成时提示改用 apply。
- 同步汉化新增的 CLI 文案、工作流模板、生成的 skills 与 `docs-lab` 文档，并重算模板 parity 哈希、适配测试断言。