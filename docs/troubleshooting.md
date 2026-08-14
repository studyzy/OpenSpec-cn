# 故障排除

针对具体问题的具体修复。每条目点名一个症状，用一句话解释可能的原因，并给出修复方法。如果你在这里没看到自己的问题，[FAQ](faq.md) 可能有帮助，[Discord](https://discord.gg/YctCnvvshC) 肯定会有。

## 安装与设置

### `openspec-cn: command not found`

CLI 没安装，或者你的 shell 找不到它。全局安装并检查：

```bash
npm install -g @studyzy/openspec-cn@latest
openspec-cn --version
```

如果它已安装但仍然找不到，很可能是你的全局 npm bin 目录不在 `PATH` 上。运行 `npm prefix -g` 查看全局包所在位置：在 macOS 和 Linux 上，可执行文件位于该目录的 `bin/` 中，在 Windows 上则直接位于该目录中。确保那个路径在你的 `PATH` 上。（`npm bin -g` 已在 npm 9 中移除。）

如果你使用了 [AI 辅助安装](installation.md#install-with-your-ai-assistant)，这里正是预期的交接点：那段提示词会让你的助手把需要做的 `PATH` 改动展示给你，而不是自行编辑你的 shell 启动文件。

### "Requires Node.js 20.19.0 or higher"

OpenSpec 运行于 Node 20.19.0+。检查版本并在需要时升级：

```bash
node --version
```

如果你用 bun 安装 OpenSpec，注意 OpenSpec 仍然*运行*在 Node 上，所以无论怎样你都需要 `PATH` 上有 Node 20.19.0+。参见 [安装](installation.md)。

### `openspec-cn init` 没有配置我的 AI 工具

Init 会询问要设置哪些工具。如果你跳过了你的工具或想再加一个，直接重跑，或用非交互形式：

```bash
openspec-cn init --tools claude,cursor
```

完整工具 ID 列表见 [支持的工具](supported-tools.md)。用 `--tools all` 涵盖全部，`--tools none` 跳过工具设置。

## 命令不显示

如果 `/opsx:propose`（或你工具的对应物）不出现或没有任何反应，按这个列表往下查。它们按从最快检查到最慢排序。

1. **你可能待错了地方。** slash command 输入到 AI 助手的聊天框，不是你的终端。如果你在 shell 里输入了 `/opsx:propose`，那就是问题所在。参见 [命令如何运作](how-commands-work.md)。

2. **重新生成文件。** 从你的项目根目录：

   ```bash
   openspec-cn update
   ```

   这会为每一个你配置过的工具重写 skill 和 command 文件。

   指令文件来自*已安装的* CLI，因此一个过时的 CLI 会报告一切都是最新的，却从不写入更新的工作流。`openspec-cn update` 现在会检查这一点并主动提出升级——看到这个提示就接受它。

3. **重启你的助手。** 多数工具在启动时就扫描 skill 和命令。开一个新窗口常常就好。

4. **确认文件存在。** 对于 Claude Code，检查 `.claude/skills/` 是否包含 `openspec-*` 文件夹。其他工具有自己的目录，都列在 [支持的工具](supported-tools.md)。

5. **确认你初始化了这个项目。** Skill 是按项目写入的。如果你克隆了仓库或切换了文件夹，在那里运行 `openspec-cn init`（或 `openspec-cn update`）。

6. **确认你的工具支持命令文件。** Codex、CodeArts、ForgeCode、Hermes、Kimi Code、Mistral Vibe 以及共享的 `.agents` 目标不会生成 `opsx-*` 命令文件；它们改用基于 skill 的调用方式，因此 `/opsx` 对它们永远不会自动补全。在 Codex 中输入 `$openspec-propose`，在 Kimi Code 中输入 `/skill:openspec-propose`，在其余工具中输入 `/openspec-propose`。共享的 `.agents` 目标是厂商中立的，所以 `/openspec-propose` 只是通用形式而非保证形式——如果你的助手不响应它，请查阅它自己的文档了解如何调用 skill。Amazon Q 确实会得到命令文件，但会把它们加载进提示词库而非斜杠菜单——在那里输入 `@opsx-propose`，而不是 `/opsx`。每种工具的形式都列在 [如何调用](supported-tools.md#how-to-invoke) 中。

## 使用变更时

### "Change not found"

命令无法判断你指的是哪个变更。显式命名它，或检查已存在什么：

```bash
openspec-cn list                    # 查看活跃变更
/opsx:apply add-dark-mode        # 在聊天中命名变更
```

同时确认你处在正确的项目目录。

### "No artifacts ready"

每个制品要么已经创建，要么被阻塞等在某个依赖上。看是什么在阻塞：

```bash
openspec-cn status --change <name>
```

然后先创建缺失的依赖。记住顺序：proposal 启用 specs 和 design；specs 和 design 一起启用 tasks。

### `openspec-cn validate` 报告警告或错误

Validation 检查你的 specs 和变更是否有结构性问题。读信息：它会点名文件和问题。

```bash
openspec-cn validate <name>           # 校验单个项
openspec-cn validate --all            # 校验全部
openspec-cn validate --all --strict   # 更严格的检查，适合 CI
openspec-cn validate --archived       # 若已归档变更带有未勾选任务则失败
```

常见原因是缺失必需小节（如没有场景的 spec）或畸形的增量头部。修复文件后重跑。输出格式见 [CLI 参考](cli.md#openspec-cn-validate)。

有一条信息值得单独说明：

```text
MODIFIED "<requirement>" omits scenario(s) the current spec still has: "<scenario>"
```

一条 `MODIFIED` 需求会替换整个需求块，所以它必须带上这次变更后仍然存在的每一个场景，而不只是你编辑过的那些。把点名的场景从 `openspec/specs/<capability-path>/spec.md` 复制回增量中，并保留路径中的所有领域目录。这通常出现在这样的情形：别人的变更给同一条需求添加了一个场景之后，你的旧变更就会报这个——无论如何归档都会拒绝那个变更，而现在校验会在你实现之前就告诉你。

### AI 创建了不完整或错误的制品

AI 没有足够的上下文。几个杠杆有用：

- 在 `openspec/config.yaml` 中添加项目上下文，让你的技术栈和约定被注入到每个请求。参见 [定制化](customization.md#project-configuration)。
- 为单个制品添加 `rules:` 以给出只适用于（比如）specs 的指引。
- 提案时给出更详细的描述。
- 使用扩展的 `/opsx:continue` 一次创建一个制品并逐一审阅，而不是让 `/opsx:ff` 一次性全做。

### 归档无法完成，或警告任务未完成

归档不会因任务未完成而*阻塞*，但会警告你，因为归档通常意味着工作已完成。如果任务是故意留下的（你在归档一个部分变更），继续即可。否则先完成任务。归档还会在你尚未同步时，提供把增量规范并入主 specs 的选项；除非你有理由不这么做，否则选是。

### "User force closed the prompt with 0 null"

有东西在无人能回答提问的环境中运行了 `openspec-cn archive`——可能是某个 AI agent 从工具里调用它、一个 CI 任务，或者任何 stdin 已关闭的 shell。归档最多会询问三次确认，而一个无法被回答的确认过去会以那条原始信息失败。

传入 `--yes` 来预先回答它们：

```bash
openspec-cn archive <change-name> --yes
```

保留你原本传入的所有标志——`--skip-specs` 和 `--no-validate` 会改变归档的行为，所以只加一个 `--yes` 重跑并不是同一条命令。当前版本会为你点名该标志，并打印一行可直接粘贴的 `Fix:`。如果你本意是从列表中挑选，请显式传入变更名：选择器同样需要一个答案。

如果你改为将 archive 的输出重定向到文件或由工具捕获，且*确实*通过管道提供了答案（`printf 'y\n' | openspec-cn archive …`），旧版本在绘制提示时会把这些终端转义码写进捕获内容——在某些环境中足以把文件撑爆。当前版本在 stdout 不是终端时会将确认提示读取为纯文本，而无参数的 `openspec-cn archive`（否则会绘制交互式变更选择器）会要求你先传入变更名，而不是把菜单渲染进捕获内容。无论哪种方式，重定向和 agent 运行都能保持干净；传入 `--yes`（带变更名）则会完全跳过提示。

## 配置

### 我的 `config.yaml` 没有被应用

三个常见嫌疑：

1. **文件名错误。** 它必须是 `openspec/config.yaml`，而非 `.yml`。
2. **YAML 无效。** 用任意 YAML 校验器跑一遍；CLI 也会带行号报告语法错误。
3. **你以为需要重启。** 你不需要。配置改动立即生效。

### "Unknown artifact ID in rules: X"

`rules:` 下的一个键与你 schema 中的任何 artifact 都不匹配。对于默认的 `spec-driven` schema，有效的 ID 是 `proposal`、`specs`、`design`、`tasks`。要查看任意 schema 的 ID：

```bash
openspec-cn schemas --json
```

### "Context too large"

`context:` 字段故意限制在 50KB，因为它会被注入到每个请求。摘要它，或链接到更长的文档，而不是粘贴它们。精简的上下文也能产生更好、更快的结果。

### "Schema not found"

你引用的 schema 名不存在。列出可用项并检查拼写：

```bash
openspec-cn schemas                    # 列出可用 schemas
openspec-cn schema which <name>        # 查看 schema 从哪解析而来
openspec-cn schema init <name>         # 创建一个自定义 schema
```

参见 [定制化](customization.md#custom-schemas)。

## 从旧版工作流迁移

### "Legacy files detected in non-interactive mode"

你在 CI 或非交互 shell 里，OpenSpec 发现要清理的旧文件但无法提示你。自动批准：

```bash
openspec-cn init --force
```

对于 Codex，OpenSpec 可能会检测到 `$CODEX_HOME/prompts` 或 `~/.codex/prompts` 中旧的受管提示词文件。该清理仅限于 OpenSpec 白名单内的旧版 Codex 提示词文件名，并且非交互式的 `openspec-cn init` 只会移除那些替代品 `.agents/skills/openspec-*` skills 已存在的文件。非交互式的 `openspec-cn update` 则完全不做任何旧版清理，除非你传入 `--force`。

### 迁移后命令没出现

重启你的 IDE。Skill 在启动时检测。如果仍不出现，运行 `openspec-cn update` 并检查 [支持的工具](supported-tools.md) 中的文件位置。

### 我的旧 `project.md` 没有被迁移

这是有意的。OpenSpec 从不自动删除 `project.md`，因为它可能持有你写的上下文。把有用部分移入 `config.yaml` 的 `context:` 段，然后自己删除它。[迁移指南](migration-guide.md#migrating-projectmd-to-configyaml) 走了一遍这个过程，包括一段你可以交给 AI 用来提炼的提示。

## 仍然卡住了？

- **Discord：** [discord.gg/YctCnvvshC](https://discord.gg/YctCnvvshC)
- **GitHub Issues：** [github.com/studyzy/OpenSpec-cn/issues](https://github.com/studyzy/OpenSpec-cn/issues)
- **从你的终端：** `openspec-cn feedback "哪里出了问题"` 为你开一个 issue。

报告问题时，附上你的 OpenSpec 版本（`openspec-cn --version`）、Node 版本（`node --version`）、你的 AI 工具，以及确切的命令和输出。这能让帮助快很多。
