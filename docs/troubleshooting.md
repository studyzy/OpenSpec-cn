# 故障排除

针对具体问题的具体修复。每条目点名一个症状，用一句话解释可能的原因，并给出修复方法。如果你在这里没看到自己的问题，[FAQ](faq.md) 可能有帮助，[Discord](https://discord.gg/YctCnvvshC) 肯定会有。

## 安装与设置

### `openspec: command not found`

CLI 没安装，或者你的 shell 找不到它。全局安装并检查：

```bash
npm install -g @fission-ai/openspec@latest
openspec --version
```

If it installed but still isn't found, your global npm bin directory probably isn't on your `PATH`. Run `npm prefix -g` to see where global packages live: on macOS and Linux the binaries are in that directory's `bin/`, and on Windows they sit directly in it. Make sure that path is on your `PATH`. (`npm bin -g` was removed in npm 9.)

If you used the [AI-assisted install](installation.md#install-with-your-ai-assistant), this is the expected hand-off point: that prompt tells your assistant to show you the `PATH` change rather than edit your shell startup files itself.

### "Requires Node.js 20.19.0 or higher"

OpenSpec 运行于 Node 20.19.0+。检查版本并在需要时升级：

```bash
node --version
```

如果你用 bun 安装 OpenSpec，注意 OpenSpec 仍然*运行*在 Node 上，所以无论怎样你都需要 `PATH` 上有 Node 20.19.0+。参见 [Installation](installation.md)。

### `openspec-cn init` 没有配置我的 AI 工具

Init 会询问要设置哪些工具。如果你跳过了你的工具或想再加一个，直接重跑，或用非交互形式：

```bash
openspec-cn init --tools claude,cursor
```

完整工具 ID 列表见 [Supported Tools](supported-tools.md)。用 `--tools all` 涵盖全部，`--tools none` 跳过工具设置。

## 命令不显示

如果 `/opsx:propose`（或你工具的对应物）不出现或没有任何反应，按这个列表往下查。它们按从最快检查到最慢排序。

1. **你可能待错了地方。** slash command 输入到 AI 助手的聊天框，不是你的终端。如果你在 shell 里输入了 `/opsx:propose`，那就是问题所在。参见 [How Commands Work](how-commands-work.md)。

2. **重新生成文件。** 从你的项目根目录：

   ```bash
   openspec-cn update
   ```

   这会为每一个你配置过的工具重写 skill 和 command 文件。

   Instruction files come from the *installed* CLI, so an outdated CLI reports everything up to date without ever writing the newer workflows. `openspec update` now checks for that and offers to upgrade — take the offer if you see it.

3. **重启你的助手。** 多数工具在启动时就扫描 skill 和命令。开一个新窗口常常就好。

4. **确认文件存在。** 对于 Claude Code，检查 `.claude/skills/` 是否包含 `openspec-*` 文件夹。其他工具有自己的目录，都列在 [Supported Tools](supported-tools.md)。

5. **确认你初始化了这个项目。** Skill 是按项目写入的。如果你克隆了仓库或切换了文件夹，在那里运行 `openspec-cn init`（或 `openspec-cn update`）。

6. **Confirm your tool supports command files.** Codex, CodeArts, ForgeCode, Hermes, Kimi Code, Mistral Vibe and the shared `.agents` target don't get generated `opsx-*` command files; they use skill-based invocations instead, so `/opsx` will never autocomplete for them. Type `$openspec-propose` in Codex, `/skill:openspec-propose` in Kimi Code, and `/openspec-propose` in the rest. The shared `.agents` target is vendor-neutral, so `/openspec-propose` is the common form rather than a guaranteed one — if your assistant does not answer to it, check its own docs for how it invokes a skill. Amazon Q does get command files, but loads them into its prompt library rather than its slash menu — type `@opsx-propose` there, not `/opsx`. Every tool's form is listed in [How To Invoke](supported-tools.md#how-to-invoke).

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
```

常见原因是缺失必需小节（如没有场景的 spec）或畸形的增量头部。修复文件后重跑。输出格式见 [CLI reference](cli.md#openspec-validate)。

One message deserves its own note:

```text
MODIFIED "<requirement>" omits scenario(s) the current spec still has: "<scenario>"
```

A `MODIFIED` requirement replaces the whole requirement block, so it has to carry every scenario that survives the change, not only the ones you edited. Copy the named scenarios from `openspec/specs/<capability-path>/spec.md` back into the delta, preserving any domain directories in the path. This often appears on an older change after someone else's change added a scenario to the same requirement — archive refuses that change either way, and validation now says so before you implement it.

### AI 创建了不完整或错误的制品

AI 没有足够的上下文。几个杠杆有用：

- 在 `openspec/config.yaml` 中添加项目上下文，让你的技术栈和约定被注入到每个请求。参见 [Customization](customization.md#project-configuration)。
- 为单个制品添加 `rules:` 以给出只适用于（比如）specs 的指引。
- 提案时给出更详细的描述。
- 使用扩展的 `/opsx:continue` 一次创建一个制品并逐一审阅，而不是让 `/opsx:ff` 一次性全做。

### 归档无法完成，或警告任务未完成

归档不会因任务未完成而*阻塞*，但会警告你，因为归档通常意味着工作已完成。如果任务是故意留下的（你在归档一个部分变更），继续即可。否则先完成任务。归档还会在你尚未同步时，提供把增量规范并入主 specs 的选项；除非你有理由不这么做，否则选是。

### "User force closed the prompt with 0 null"

Something ran `openspec archive` where nothing can answer a question — an AI agent calling it from a tool, a CI job, or any shell with stdin closed. Archive asks up to three confirmations, and an unanswerable one used to fail with that raw message.

Pass `--yes` to answer them up front:

```bash
openspec archive <change-name> --yes
```

Keep any flags you were already passing — `--skip-specs` and `--no-validate` change what archive does, so a bare `--yes` rerun is not the same command. Current versions name the flag for you and print a `Fix:` line you can paste. If you meant to pick from a list, pass the change name explicitly: the picker needs an answer too.

## Configuration

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

参见 [Customization](customization.md#custom-schemas)。

## 从旧版工作流迁移

### "Legacy files detected in non-interactive mode"

你在 CI 或非交互 shell 里，OpenSpec 发现要清理的旧文件但无法提示你。自动批准：

```bash
openspec-cn init --force
```

For Codex, OpenSpec may detect old managed prompt files in `$CODEX_HOME/prompts` or `~/.codex/prompts`. That cleanup is limited to OpenSpec's allowlisted legacy Codex prompt filenames, and non-interactive `openspec init` removes only the files whose replacement `.agents/skills/openspec-*` skills exist. Non-interactive `openspec update` leaves all legacy cleanup untouched unless you pass `--force`.

### 迁移后命令没出现

重启你的 IDE。Skill 在启动时检测。如果仍不出现，运行 `openspec-cn update` 并检查 [Supported Tools](supported-tools.md) 中的文件位置。

### 我的旧 `project.md` 没有被迁移

这是有意的。OpenSpec 从不自动删除 `project.md`，因为它可能持有你写的上下文。把有用部分移入 `config.yaml` 的 `context:` 段，然后自己删除它。[Migration Guide](migration-guide.md#migrating-projectmd-to-configyaml) 走了一遍这个过程，包括一段你可以交给 AI 用来提炼的提示。

## 仍然卡住了？

- **Discord：** [discord.gg/YctCnvvshC](https://discord.gg/YctCnvvshC)
- **GitHub Issues：** [github.com/Fission-AI/OpenSpec/issues](https://github.com/Fission-AI/OpenSpec/issues)
- **从你的终端：** `openspec-cn feedback "what went wrong"` 为你开一个 issue。

报告问题时，附上你的 OpenSpec 版本（`openspec --version`）、Node 版本（`node --version`）、你的 AI 工具，以及确切的命令和输出。这能让帮助快很多。
