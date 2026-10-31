# 安装

> 在你的机器上安装 `openspec-cn` CLI、更新它，以及卸载它。


<a id="install"></a>

## 安装

在 macOS 或 Linux 上，在终端中执行：

```bash
curl -fsSL https://raw.githubusercontent.com/studyzy/OpenSpec-cn/main/scripts/binary/install.sh | sh
```

在 Windows 上，使用 PowerShell：

```powershell
irm https://raw.githubusercontent.com/studyzy/OpenSpec-cn/main/scripts/binary/install.ps1 | iex
```

如果安装器打印了一行 `export PATH=...`，请运行它。然后[检查是否成功](#check-it-worked)。

<a id="install-with-your-ai-assistant"></a>

## 用你的 AI 助手安装

把这段内容粘贴到你的 AI 聊天框中：

```text
Fetch https://raw.githubusercontent.com/studyzy/openspec-cn/main/install.md and follow it.
```

或者，在终端中把它通过管道交给一个 CLI Agent（以 Claude Code 为例）：

```bash
curl -fsSL https://raw.githubusercontent.com/studyzy/openspec-cn/main/install.md | claude
```

这会获取[仓库根目录下的 install.md](https://github.com/studyzy/openspec-cn/blob/main/install.md)，这是一段为任何能执行 shell 命令的 Agent 编写的提示词（少数 IDE 集成做不到）。你的助手应当会：

1. 如果 CLI 已经在你机器上，跳过安装，并按它当初的安装方式提供更新。如果当初是 npm 或 Homebrew，顺带提一次 `openspec-cn install` 可以切换到独立安装，但不要推销。否则，展示上面的安装命令，等你确认后再执行。
2. 只有在你主动要求、或安装器失败时才改用 npm；如果你的 Node 低于 22.12.0 就停下。
3. 验证 `openspec-cn` 在 PATH 上。
4. 说出它认为你说的那个文件夹，建议你正在对话的这个 AI 工具，并询问你还用哪些工具，然后在那里运行 `openspec-cn init`（即[项目设置](setup.md)这一步）。
5. 报告 init 创建了什么，以及在你的工具中调用 OpenSpec 的确切拼写。

它会在任何需要特权的操作前停下来，并且绝不修改你的 shell 启动文件。[上面的安装命令](#install)和[下面的包管理器](#package-managers)才是事实来源，提示词只是替你执行它们。

这种安装方式是新的，根据所用模型不同结果可能各异。只有在你愿意纠正 AI 的错误时才使用它。否则我们建议采用下面介绍的标准方法。

<a id="package-managers"></a>

## 包管理器

这些方式把 OpenSpec 作为 Node.js 包安装，所以需要 Node.js 22.12.0 或更高版本（Homebrew 和 Nix 自带运行时）。在终端中执行：

```bash
node --version
```

如果输出 `v22.12.0` 或更高，就用 npm 安装：

```npm
npm install -g @studyzy/openspec-cn@latest
```

如果低于该版本，请从 [nodejs.org](https://nodejs.org) 或通过你的版本管理器（nvm、fnm、asdf、volta）安装更新的 Node，或改用[独立安装](#install)。

### Homebrew

Homebrew 会在 macOS 或 Linux 上安装 OpenSpec 及其 Node.js 依赖。在终端中执行：

```bash
brew install openspec
```

该 formula 发布在 [homebrew-core](https://formulae.brew.sh/formula/openspec) 中，因此无需添加 tap。

### Yarn

`yarn global add` 仅适用于 Yarn Classic（1.x）。现代 Yarn 移除了全局安装，所以改用 npm、pnpm 或 bun。全局 CLI 不必与你的项目共享同一个包管理器。

### Bun

Bun 会安装 OpenSpec，但不会运行它，所以你仍然需要本机有 Node（见上面的[包管理器](#package-managers)）。否则，每条命令都会以 `env: node: No such file or directory` 失败。Bun 对待[每个 Node CLI](https://bun.com/docs/pm/bunx#shebangs)都是这样。

### Deno

Deno 从 npm 安装 CLI，并且需要显式的权限标志。在终端中执行：

```bash
deno install --global \
  --allow-read --allow-write --allow-env --allow-sys=cpus,homedir --allow-net=edge.openspec.dev \
  npm:@studyzy/openspec-cn@latest
```

有些命令会启动另一个程序：[`openspec-cn config edit`](../reference/cli.md) 会打开你的编辑器。Deno 会在每次运行时都用权限提示打断这些命令。要让它不再询问，就在安装命令中加上一个限定范围的 `--allow-run=<program>`。

> [!NOTE]
> 如果 Deno 无法解析 `@latest`，改用版本范围固定：`npm:@studyzy/openspec-cn@^1.7.0`。

### Nix

OpenSpec 仓库附带一个 Nix flake。把它安装到你的 profile。在终端中执行：

```bash
nix profile install github:studyzy/OpenSpec-cn
```

或者先不安装，直接运行一次：

```bash
nix run github:studyzy/OpenSpec-cn -- --version
```

这不会在 PATH 上留下任何东西，所以事后无需检查安装。

如果想把 OpenSpec 放进项目的开发 shell，则把 flake 添加为 input 并使用它的默认包；[flake.nix](https://github.com/studyzy/openspec-cn/blob/main/flake.nix) 列出了所有 outputs。

Nix 包把 Bash、Fish 和 Zsh 补全脚本放在标准位置
（`share/bash-completion/completions`、`share/fish/vendor_completions.d`、
`share/zsh/site-functions`），因此它们随包一起加载，无需运行
`openspec-cn completion install`。

<a id="check-it-worked"></a>

## 检查是否成功

无论你用了哪种方法，在终端中执行：

```bash
openspec-cn --version
```

如果输出了版本号，CLI 就在你的 PATH 上。每台机器只需安装一次。

接下来，[设置你的项目](setup.md)。如果你的助手已经运行过 init，那页会展示它写了什么以及如何调整。

## 安装选项

要指定版本或安装目录，请在 `sh` 之前设置变量：

```bash
curl -fsSL https://raw.githubusercontent.com/studyzy/OpenSpec-cn/main/scripts/binary/install.sh | OPENSPEC_VERSION=v1.16.0 sh
```

- **`OPENSPEC_VERSION`**：要安装的发布版，例如 `v1.16.0`。默认是最新的发布版。
- **`OPENSPEC_INSTALL_DIR`**：安装目录。默认为 `~/.local/bin`（Windows：`%LOCALAPPDATA%\Programs\openspec-cn`）。

在 Windows 上，请先设置变量：

```powershell
$env:OPENSPEC_VERSION = 'v1.16.0'
irm https://raw.githubusercontent.com/studyzy/OpenSpec-cn/main/scripts/binary/install.ps1 | iex
```

在 Alpine Linux 上，安装前先运行 `apk add libstdc++ libgcc`。

### 手动下载

每个发布版为每种机器提供一个文件：

| 机器 | 文件 |
|---|---|
| Mac，Apple silicon | `openspec-cn-darwin-arm64.tar.gz` |
| Mac，Intel | `openspec-cn-darwin-x64.tar.gz` |
| Linux，arm64 | `openspec-cn-linux-arm64.tar.gz` |
| Linux，x64 | `openspec-cn-linux-x64.tar.gz` |
| Alpine，arm64 | `openspec-cn-linux-arm64-musl.tar.gz` |
| Alpine，x64 | `openspec-cn-linux-x64-musl.tar.gz` |
| Windows，arm64 | `openspec-cn-windows-arm64.zip` |
| Windows，x64 | `openspec-cn-windows-x64.zip` |

1. **下载**你的文件：从[最新发布版](https://github.com/studyzy/OpenSpec-cn/releases/latest)获取。文件会在发布版发布几分钟后才附加上去。如果你要的文件还没列出，请稍后刷新，或改用上一个发布版。
2. **解压**。在终端中执行：`tar -xzf openspec-cn-darwin-arm64.tar.gz`。在 Windows 上，右键点击 `.zip` 并选择"全部提取"。
3. **在 macOS 上**，在你解压到的目录中运行 `xattr -d com.apple.quarantine openspec-cn`。在此之前，macOS 会阻止运行浏览器下载的文件。
4. **移动** `openspec-cn` 到 PATH 上的某个文件夹，例如 `~/.local/bin`。在 Windows 上，把 `openspec-cn.exe` 移到你的用户 PATH 上的某个文件夹，例如 `%LOCALAPPDATA%\Programs\openspec-cn`。

### 校验下载

要确认文件确实由 OpenSpec 发布工作流构建，请使用 [GitHub CLI](https://cli.github.com) 运行：

```bash
gh attestation verify openspec-cn-darwin-arm64.tar.gz --repo studyzy/OpenSpec-cn
```

如果该文件不是由该工作流构建，它就会失败。安装命令已经用发布版的 `SHA256SUMS` 校验每次下载，所以这一步是可选的。

## 从 npm 切换到独立安装

切换是可选的；npm 会继续可用。你的设置和项目都会沿用，改变的只是程序本身。

**1. 安装独立副本。** 在终端中执行：

```bash
openspec-cn install
```

它会安装独立 `openspec-cn`，并打印用于移除你的 npm 或 Homebrew 副本的命令。

**2. 移除旧副本。** 它通常排在 PATH 更前面，所以在删掉之前，实际运行的仍是它。运行第 1 步打印的命令，例如：

```npm
npm uninstall -g @studyzy/openspec-cn
```

**3. 检查运行的是哪个副本。** 打开一个新终端：

```bash
openspec-cn version
```

它应当打印 `OpenSpec <version> (standalone)`。如果显示的是某个包管理器，说明 PATH 上还有另一份副本：`which -a openspec-cn`（Windows：`where.exe openspec-cn`）会列出所有副本，把其余的删掉。

不需要重新初始化任何项目。要切回 npm，删除该文件并重新运行 npm 安装即可。

## 更新

在终端中，在每个你运行过 init 的项目里：

```bash
openspec-cn update
```

当有更新的 CLI 发布时，[`openspec-cn update`](../reference/cli.md#openspec-update) 会提示你，并且可以替你安装；那次升级每台机器只发生一次。每次运行都会刷新项目生成的 skills 和 commands，它们不会自行更新。一个最新的项目会打印 `✓ All 2 tool(s) up to date (v1.7.0)`。


> [!WARNING]
> 使用独立安装（standalone）的，运行 `openspec-cn install` 原地替换你的副本；`openspec-cn update` 会在有新版本时告诉你。在 Homebrew 上，运行 `brew upgrade openspec`。在 Deno 上，重新执行[Deno 安装](#deno)时要加 `-f`；不加它不会覆盖已安装的命令。在 Nix 上，使用 `nix profile upgrade openspec`。

> [!NOTE]
> 全局 npm 安装归属于某个特定的 Node 安装。用 nvm 切换 Node 版本时 `openspec-cn` 命令不会跟过来，所以要在新版本下重新安装。

## 卸载

要卸载 OpenSpec，按下面的步骤执行；这些步骤都不会触碰你的源代码。你也可以让 Agent 直接照本节的说明来帮你移除。

**1. 移除 [shell 补全](../reference/cli.md#openspec-completion)**，如果你设置过的话，趁 CLI 还能做这件事。在终端中执行：

```bash
openspec-cn completion uninstall
```

**2. 移除 CLI。** 使用独立安装的，删除 `~/.local/bin/openspec-cn`（Windows：`%LOCALAPPDATA%\Programs\openspec-cn`，并从你的用户 PATH 中移除该文件夹）。使用 npm 的，在终端中执行：

```npm
npm uninstall -g @studyzy/openspec-cn
```

在 Homebrew 上：`brew uninstall openspec`。在 Deno 上：`deno uninstall --global openspec-cn`。在 Nix 上：`nix profile remove openspec`。你的 shell 应该再也找不到 `openspec-cn` 了。

**3. 删除剩下的部分，或者保留。**

- 生成的 Agent 文件：目录下的 `openspec-*` skills 和 `opsx` commands，位于 `.claude/` 或 `.agents/` 之类的目录下，按项目区分。[支持的工具](../reference/supported-tools.md) 列出了每种工具的路径；MiniMax Code 把 skills 放在 `~/.minimax/skills`。
- 旧版本的遗留物：`CLAUDE.md` 或 `AGENTS.md` 中的标记块（删除该块，保留文件）以及 `~/.codex/prompts` 下的 `opsx-*.md` 提示词。
- `openspec/` 文件夹：先停一下。`specs/` 和 `changes/archive/` 是系统的记录，是即使没有 OpenSpec 也能正常阅读的纯 Markdown。
- 每台机器的状态：`~/.config/openspec/` 下的设置和遥测 id；`~/.local/share/openspec/` 下的 schema 覆盖、store 注册，以及独立安装的内置 schema（`binary-schemas/`）（Windows：`%APPDATA%\openspec`、`%LOCALAPPDATA%\openspec`）。注册信息是指针；它们指向的 store 仓库不会被动到。
