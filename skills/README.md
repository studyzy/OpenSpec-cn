# 适用于 skills.sh 的 OpenSpec skills

将 OpenSpec 工作流 skills 安装到任何兼容 [skills.sh](https://skills.sh) 的智能体中：

```bash
npx skills add studyzy/OpenSpec-cn
```

此处的每个 `openspec-*/SKILL.md` 与 `openspec-cn init` 写入项目的 skill 完全相同。
这些 skills 驱动 `openspec-cn` CLI，因此若需完整安装（CLI + `openspec/` 项目脚手架 +
斜杠命令），请运行：

```bash
npx @studyzy/openspec-cn@latest init
```

> 这些文件由 skill 模板生成 —— 请勿手工编辑。修改模板后请运行
> `pnpm build && pnpm generate:skills`；若两者出现漂移，
> `skillssh-parity.test.ts` 会失败。
