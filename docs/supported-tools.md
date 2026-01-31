# 支持的工具

OpenSpec 支持 20 多种 AI 编码助手。当您运行 `openspec-cn init` 时，系统会提示您选择使用的工具，OpenSpec 将配置相应的集成。

## 工作原理

对于您选择的每个工具，OpenSpec 会安装：

1. **技能** — 可重用的指令文件，用于驱动 `/opsx:*` 工作流命令
2. **命令** — 特定于工具的斜杠命令绑定

## 工具目录参考

| 工具 | 技能位置 | 命令位置 |
|------|-----------------|-------------------|
| Amazon Q Developer | `.amazonq/skills/` | `.amazonq/prompts/` |
| Antigravity | `.agent/skills/` | `.agent/workflows/` |
| Auggie (Augment CLI) | `.augment/skills/` | `.augment/commands/` |
| Claude Code | `.claude/skills/` | `.claude/commands/opsx/` |
| Cline | `.cline/skills/` | `.clinerules/workflows/` |
| CodeBuddy | `.codebuddy/skills/` | `.codebuddy/commands/opsx/` |
| Codex | `.codex/skills/` | `~/.codex/prompts/`* |
| Continue | `.continue/skills/` | `.continue/prompts/` |
| CoStrict | `.cospec/skills/` | `.cospec/openspec/commands/` |
| Crush | `.crush/skills/` | `.crush/commands/opsx/` |
| Cursor | `.cursor/skills/` | `.cursor/commands/` |
| Factory Droid | `.factory/skills/` | `.factory/commands/` |
| Gemini CLI | `.gemini/skills/` | `.gemini/commands/opsx/` |
| GitHub Copilot | `.github/skills/` | `.github/prompts/` |
| iFlow | `.iflow/skills/` | `.iflow/commands/` |
| Kilo Code | `.kilocode/skills/` | `.kilocode/workflows/` |
| OpenCode | `.opencode/skills/` | `.opencode/command/` |
| Qoder | `.qoder/skills/` | `.qoder/commands/opsx/` |
| Qwen Code | `.qwen/skills/` | `.qwen/commands/` |
| RooCode | `.roo/skills/` | `.roo/commands/` |
| Trae | `.trae/skills/` | `.trae/skills/` (via `/openspec-*`) |
| Windsurf | `.windsurf/skills/` | `.windsurf/workflows/` |

\* Codex commands are installed to the global home directory (`~/.codex/prompts/` or `$CODEX_HOME/prompts/`), not the project directory.

## 非交互式设置

对于 CI/CD 或脚本化设置，使用 `--tools` 标志：

```bash
# 配置特定工具
openspec-cn init --tools claude,cursor

# 配置所有支持的工具
openspec-cn init --tools all

# 跳过工具配置
openspec-cn init --tools none
```

**可用的工具 ID：** `amazon-q`, `antigravity`, `auggie`, `claude`, `cline`, `codebuddy`, `codex`, `continue`, `costrict`, `crush`, `cursor`, `factory`, `gemini`, `github-copilot`, `iflow`, `kilocode`, `opencode`, `qoder`, `qwen`, `roocode`, `trae`, `windsurf`

## 安装内容

对于每个工具，OpenSpec 会生成 10 个驱动 OPSX 工作流的技能文件：

| 技能 | 用途 |
|-------|---------|
| `openspec-explore` | 探索思路的思考伙伴 |
| `openspec-new-change` | 开始新的变更 |
| `openspec-continue-change` | 创建下一个制品 |
| `openspec-ff-change` | 快速跳过所有规划制品 |
| `openspec-apply-change` | 实施任务 |
| `openspec-verify-change` | 验证实施完整性 |
| `openspec-sync-specs` | 将增量规范同步到主线（可选—如需要可归档提示词） |
| `openspec-archive-change` | 归档已完成的变更 |
| `openspec-bulk-archive-change` | 一次归档多个变更 |
| `openspec-onboard` | 通过完整工作流周期的引导式入职 |

这些技能通过斜杠命令调用，如 `/opsx:new`、`/opsx:apply` 等。完整列表请参阅[命令](commands.md)。

## 添加新工具

想要添加对其他 AI 编码助手的支持？请查看[命令适配器模式](../CONTRIBUTING.md)或在 GitHub 上提出 issue。

---

## 相关内容

- [CLI 参考](cli.md) — 终端命令
- [命令](commands.md) — 斜杠命令和技能
- [入门指南](getting-started.md) — 首次设置
