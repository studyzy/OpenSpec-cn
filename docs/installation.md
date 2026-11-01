# 安装

## 前置条件

- **Node.js 20.19.0 或更高版本**(仅包管理器安装需要)— 检查你的版本:`node --version`

<a id="install"></a>

## 独立安装(standalone)

OpenSpec 也可以作为单个文件安装，无需 Node.js 或任何其他依赖(在 Alpine Linux 上需先运行 `apk add libstdc++ libgcc`)。

macOS 和 Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/studyzy/OpenSpec-cn/main/scripts/binary/install.sh | sh
```

Windows (PowerShell):

```powershell
irm https://raw.githubusercontent.com/studyzy/OpenSpec-cn/main/scripts/binary/install.ps1 | iex
```

安装器会挑选文件全部齐全的最新发布版本，为你的机器选出正确的文件，用该发布版的 `SHA256SUMS` 校验后再安装到 `~/.local/bin`(Windows:`%LOCALAPPDATA%\Programs\openspec-cn`,并加入你的用户 `PATH`)。设置 `OPENSPEC_INSTALL_DIR` 可换一个目录，或用 `OPENSPEC_VERSION=v1.15.0` 固定某个版本。更想用 npm 或其他包管理器?见[包管理器](#package-managers)。

手动安装时，从[最新发布](https://github.com/studyzy/OpenSpec-cn/releases/latest)下载对应平台的文件，重命名为 `openspec-cn`(Windows 上为 `openspec-cn.exe`)，在 macOS 和 Linux 上赋予执行权限(`chmod +x openspec-cn`)，并把它放到 `PATH` 上:

| 平台 | 文件 |
|---|---|
| macOS 13+ (Apple Silicon / Intel) | `openspec-cn-darwin-arm64` / `openspec-cn-darwin-x64` |
| Linux (glibc 2.17+) | `openspec-cn-linux-x64` / `openspec-cn-linux-arm64` |
| Alpine 3.17+ (需要 `apk add libstdc++ libgcc`) | `openspec-cn-linux-x64-musl` / `openspec-cn-linux-arm64-musl` |
| Windows 10+ | `openspec-cn-windows-x64.exe` / `openspec-cn-windows-arm64.exe` |

在 macOS 上，用浏览器下载的文件在运行 `xattr -d com.apple.quarantine openspec-cn` 之前会被拦截;安装脚本没有这个问题。在 Windows 上，第一次从资源管理器中运行时 SmartScreen 可能会警告。

<a id="install-with-your-ai-assistant"></a>

## 用你的 AI 助手安装

不想手动操作？把下面的提示词粘贴给任何能执行 shell 命令的编程助手 —— Claude Code、Codex、Cursor、Gemini CLI、Copilot，以及其余[支持的工具](supported-tools.md)。它会安装 CLI、初始化本项目，并汇报实际发生了什么。

下面的手动步骤才是事实来源 —— 提示词只是替你把它们跑一遍。如果你的助手中途停下来把事情交还给你，那是有意为之：任何需要特权的操作它都会先询问，并且绝不修改你的 shell 启动文件。这些部分请你自己借助[安装](#install)、[包管理器](#package-managers)和[故障排查](troubleshooting.md)来完成。

```text
在这个项目中安装 OpenSpec 并帮我完成设置。请按顺序执行以下步骤，遇到要求停下
的步骤就停下。

1. 运行时。执行 `node --version`。OpenSpec 需要 Node.js 20.19.0 或更高版本。如果
   Node 缺失或版本过低，请告诉我并停下 —— 不要替我安装 Node、切换版本，或重新
   配置我的版本管理器。

2. 包管理器（仅当第 1 步没有安装它时）。执行 `node --version`：
   这需要 Node.js 22.12.0 或更高版本。如果 Node 缺失或版本过低，请告诉我并停下 ——
   不要替我安装 Node、切换版本，或重新配置我的版本管理器。否则使用我 PATH 中已有
   的包管理器，优先选 npm：
     npm install -g @studyzy/openspec-cn@latest
     pnpm add -g @studyzy/openspec-cn@latest
     bun add -g @studyzy/openspec-cn@latest
     yarn global add @studyzy/openspec-cn@latest   （仅限 Yarn 1.x）
   不要根据本项目的 lockfile 来选择 —— 全局安装与本仓库自身依赖的安装方式毫无
   关系。如果这四个都不可用，请停下并告诉我 —— 不要自行发挥去安装。（如果我用的
   是 Nix，请改为指引我看 OpenSpec 安装文档的 Nix 章节。）
   在执行前先把确切的命令展示给我确认；这会在项目之外安装软件，我可能希望由别的
   包管理器来管理它。
   如果安装需要 sudo 或管理员权限、因权限错误失败，或提示其全局 bin 目录缺失或
   未配置，请停下再次询问我。绝不要修改我的 shell 启动文件（.bashrc、.zshrc、
   .profile、fish、PowerShell profile），也绝不要运行会替我修改它们的配置命令 ——
   把改动展示给我，由我自己来改。

3. PATH。执行 `openspec-cn --version`。如果找不到该命令，可能只是当前 shell 里
   没有它：请告诉我包管理器把它装到了哪里，以及针对我的 shell 和操作系统该如何
   把那个目录加入 PATH，然后停下等我确认。如果它输出的版本比刚才安装时报告的版本
   更旧，说明 PATH 上有一份更早的副本遮蔽了它 —— 请把两个版本都告诉我，不要继续
   往下走。如果我使用版本管理器，请直接说明，而不要绕过它去改 PATH：使用 nvm 或
   fnm 时，CLI 绑定在你安装它时处于激活状态的那个 Node 版本上；使用 asdf 或 volta
   时，可能需要重新生成 shim。

4. 初始化。询问我使用哪个（哪些）AI 编程工具，并把每一个映射到 `openspec-cn init
   --help` 中的 id（Copilot 是 `github-copilot`，Zoo Code 是 `roocode`）。
   `--tools` 接受逗号分隔的列表，所以请把它们全部列出。
   `openspec-cn init --tools <ids>` 会自动删除旧版 OpenSpec 遗留的文件，不会询问 ——
   包括我主目录下的 `opsx-*.md` 提示词文件（Codex 把它们放在 ~/.codex/prompts）。
   在执行之前，请先查找这些内容：`.../commands/openspec/` 文件夹、CLAUDE.md 或
   AGENTS.md 之类文件中的 OpenSpec 标记块，以及主目录下的 `opsx-*.md` 提示词。把
   找到的都列出来，等我点头再继续；如果什么都没找到，说明一下就直接继续，不用问我。
   已存在的 `openspec/` 文件夹不是问题 —— init 会刷新它，并且不会动我的 specs 和
   changes。
   同时也请确认我处在正确的目录：init 会在它运行的任何位置创建 `openspec/`，包括
   在 monorepo 的某个子包内部。
   然后执行：openspec-cn init --tools <ids>

5. 汇报。不要臆测应该有什么 —— 请告诉我 init 实际打印了什么：它创建了多少个 skills
   和/或 commands、创建在哪里、配置文件那一行、任何 "Setup required" 提示，以及需要
   重启或重新加载什么。有些工具是仅支持 skills 的，正常情况下就会创建零个命令文件，
   所以仅仅缺少命令本身并不算失败。如果 init 说什么都没生成，请转达它建议的修复办法，
   而不是重试。最后告诉我在我的工具里该如何调用 OpenSpec，并且要以 init 实际创建的
   文件为准来确定确切写法，而不是照抄它的总结行：各工具的标点不同（有的是
   /opsx:propose，有的是 /opsx-propose，Amazon Q 是 @opsx-propose），而拿到 skills
   而非 commands 的工具则按 skill 名调用（/openspec-propose，Codex 里是
   $openspec-propose，Kimi Code 里是 /skill:openspec-propose）。
```

提示词中没有任何针对特定厂商的内容：它只是普通的指令，加上本页记录的那些相同命令。它在 macOS、Linux 和 Windows 上都能用，并且当某个步骤需要你授权时，它会有意停下而不是自行发挥。不过你的助手确实需要具备执行 shell 命令的能力 —— 少数 IDE 集成做不到这一点。

<a id="package-managers"></a>

## 包管理器

用包管理器安装需要 **Node.js 22.12.0 或更高版本**（用 `node --version` 检查）。

### npm

```bash
npm install -g @studyzy/openspec-cn@latest
```

### pnpm

```bash
pnpm add -g @studyzy/openspec-cn@latest
```

### yarn

```bash
yarn global add @studyzy/openspec-cn@latest
```

Yarn 2 及更高版本（Berry）移除了 `global` 命令。在这些版本上，请改用 npm、pnpm 或 bun 安装 OpenSpec —— 全局 CLI 不需要和你项目的包管理器保持一致。

### deno

Deno 有时在解析 @latest 标签时会出问题，不过我们可以在首次安装时指定一个具体版本。
若遇到这种情况，可以尝试把 @latest 标签换成版本号，例如 `@^1.3.1`

```bash
deno install --global \
  --allow-read --allow-write --allow-env --allow-sys=cpus,homedir --allow-net=edge.openspec.dev \
  npm:@studyzy/openspec-cn@latest
# or
deno install --global \
  --allow-read --allow-write --allow-env --allow-sys=cpus,homedir --allow-net=edge.openspec.dev \
  npm:@studyzy/openspec-cn@^1.3.1
```

注意：如果你的子命令会启动外部工具，例如 config edit、feedback 或 workspace open，你可能需要一个限定范围的 --allow-run=<program>。

### bun

Bun 可以全局安装 OpenSpec，但 OpenSpec 目前运行在 Node.js 上。
你仍需要在 `PATH` 中提供 Node.js 22.12.0 或更高版本。

```bash
bun add -g @studyzy/openspec-cn@latest
```

## Nix

直接运行 OpenSpec,无需安装:

```bash
nix run github:studyzy/OpenSpec-cn -- init
```

或安装到你的 profile:

```bash
nix profile install github:studyzy/OpenSpec-cn
```

或在 `flake.nix` 中加入你的开发环境:

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    openspec.url = "github:studyzy/OpenSpec-cn";
  };

  outputs = { nixpkgs, openspec, ... }: {
    devShells.x86_64-linux.default = nixpkgs.legacyPackages.x86_64-linux.mkShell {
      buildInputs = [ openspec.packages.x86_64-linux.default ];
    };
  };
}
```

## 验证安装

```bash
openspec-cn --version
```

## 从 npm 切换到独立安装

切换是可选的;npm 安装会继续可用。你的设置和项目都会沿用，改变的只是程序本身。

1. 运行 `openspec-cn install`。它会安装独立副本，并打印用于移除旧副本的命令。
2. 运行那条命令，例如 `npm uninstall -g @studyzy/openspec-cn`(Homebrew:`brew uninstall openspec`)。在那之前，旧副本在 `PATH` 上仍会优先运行。
3. 在新终端中运行 `openspec-cn version`。它应当打印 `OpenSpec <version> (standalone)`。如果它显示的是某个包管理器，说明 `PATH` 上还有另一份副本:`which -a openspec-cn`(Windows:`where.exe openspec-cn`)会把它们都列出来。

## 更新

再次运行[安装命令](#install)来升级 CLI(用包管理器时:`npm install -g @studyzy/openspec-cn@latest` 或 pnpm/yarn/bun 的等价命令)。然后刷新每个项目生成的文件:

```bash
openspec-cn update   # 在每个项目内运行
```

`openspec-cn update` 会为你已配置的工具重新生成 skill 与 command 文件，从而让你的斜杠命令与已安装的版本保持同步。它还会检查是否发布了更新的 CLI 并提示你升级，因为正是升级才让新的工作流成为可用 —— 参见 [CLI 参考](cli.md#openspec-update)。

<a id="uninstalling"></a>

## 卸载

没有 `openspec-cn uninstall` 命令,因为 OpenSpec 只是一个程序加上你项目中的一些文件。移除它需要几个手动步骤,这里没有任何操作会触及你的源代码。

**1. 移除 CLI。** 删除安装器放置的文件:`~/.local/bin/openspec-cn`,Windows 上为 `%LOCALAPPDATA%\Programs\openspec-cn\openspec-cn.exe`(并从你的用户 `PATH` 中移除该文件夹)。如果你是用包管理器安装的:

```bash
npm uninstall -g @studyzy/openspec-cn   # 或: pnpm rm -g / yarn global remove / bun rm -g
```

当该目录可写时，独立二进制还会在你的 OpenSpec 数据目录(`~/.local/share/openspec/binary-schemas`,Windows 上为 `%LOCALAPPDATA%\openspec\binary-schemas`)下保留一份内置 schema 的副本，你也可以把它一并删掉。

**2. 从项目中移除 OpenSpec(可选)。** 如果你不再需要其中的 specs 和变更,删除 `openspec/` 目录:

```bash
rm -rf openspec/
```

动手前请三思:`openspec/specs/` 和 `openspec/changes/archive/` 是系统行为及其变更原因的记录。若你可能需要那段历史,即便在卸载后也请保留该文件夹(或保留在 git 中)。

**3. 移除生成的 AI 工具文件(可选)。** OpenSpec 会将 skill 和 command 文件写入各工具的目录,如 `.claude/skills/openspec-*/`、`.cursor/commands/opsx-*` 等。删除你所配置工具对应的 `openspec-*` skills 和 `opsx-*` commands。各工具的准确路径列于[支持的工具](supported-tools.md)。

如果你还在 `CLAUDE.md` 或 `AGENTS.md` 之类的文件中有 OpenSpec 标记块,请手动移除它们;这些文件中你自己的内容由你保留。

## 下一步

安装后,在你的项目中初始化 OpenSpec:

```bash
cd your-project
openspec-cn init
```

完整导览见[快速上手](getting-started.md)。
