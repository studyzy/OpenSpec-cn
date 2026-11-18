---
"@studyzy/openspec-cn": minor
---

合入上游 OpenSpec 2.1.0 的全部变更，并完成汉化与测试适配：

- 新增机器级（global）skills：`openspec-cn init --global` 与 `openspec-cn update --global` 通过 `skills` 安装器把 skills 装到 `~/.agents/skills/` 并链接到各工具目录，一次安装即可在本机所有项目复用。
- 新增 `--scope project` / `--scope global` 与 `skills: global` 配置；交互式 `openspec-cn update` 会询问是否把项目 skills 切换到全局，非交互运行仅给出提示。
- Windows 独立二进制补充文件属性标注，降低被杀毒软件误删的概率；Node.js 下限提升到 22.20.0，CI 与依赖同步升级。
- 同步汉化新增的 CLI 文案、工作流模板、生成的 skills 与 `docs-lab` 文档（含「升级到 2.1」指南），并重算模板 parity 哈希、适配测试断言。

升级说明见 `docs-lab/help/upgrade-to-2-1.md`。
