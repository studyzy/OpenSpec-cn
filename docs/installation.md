# 安装

## 前置条件

- **Node.js 20.19.0 或更高版本** — 检查你的版本:`node --version`

## Install with your AI assistant

Rather not do this by hand? Paste the prompt below into any coding assistant that can run shell commands — Claude Code, Codex, Cursor, Gemini CLI, Copilot, and the rest of the [supported tools](supported-tools.md). It installs the CLI, initializes this project, and reports back what actually happened.

The manual steps below are the source of truth — the prompt just runs them for you. If your assistant stops and hands something back, that's by design: it asks before anything privileged and never edits your shell startup files. Finish those bits yourself with [Package Managers](#package-managers) and [Troubleshooting](troubleshooting.md).

```text
Install OpenSpec in this project and set it up for me. Follow these steps in
order, and stop where a step tells you to stop.

1. RUNTIME. Run `node --version`. OpenSpec needs Node.js 20.19.0 or higher. If
   Node is missing or older, say so and stop — don't install Node, switch
   versions, or reconfigure my version manager for me.

2. INSTALL. Use whichever package manager is already on my PATH, preferring npm:
     npm install -g @fission-ai/openspec@latest
     pnpm add -g @fission-ai/openspec@latest
     bun add -g @fission-ai/openspec@latest
     yarn global add @fission-ai/openspec@latest   (Yarn 1.x only)
   Don't pick based on this project's lockfile — a global install has nothing to
   do with how this repo's own dependencies are installed. If none of those four
   is available, stop and tell me — don't improvise an install. (If I'm on Nix,
   point me at the Nix section of the OpenSpec installation docs instead.)
   Show me the exact command and let me confirm before you run it; this installs
   software outside the project, and I may want a different package manager to
   own it.
   Stop and ask me again if the install needs sudo or admin rights, fails with a
   permissions error, or reports that its global bin directory is missing or
   unconfigured. Never edit my shell startup files (.bashrc, .zshrc, .profile,
   fish, PowerShell profile), and never run a setup command that edits them for
   me — show me the change and let me make it.

3. PATH. Run `openspec --version`. If the command isn't found, it may just be
   missing from this shell: tell me where the package manager installed it and
   how to add that directory to PATH for my shell and OS, then stop until I
   confirm. If it prints an older version than the one the install just
   reported, an earlier copy is shadowing it on PATH — tell me both versions
   instead of continuing. If I use a version manager, say so rather than editing
   PATH around it: with nvm or fnm the CLI is tied to the Node version that was
   active when you installed it, and with asdf or volta a shim may need
   regenerating.

4. INITIALIZE. Ask me which AI coding tool or tools I use and map each to an id
   from `openspec init --help` (Copilot is `github-copilot`, Zoo Code is
   `roocode`). `--tools` takes a comma-separated list, so name all of them.
   `openspec init --tools <ids>` deletes leftovers from older OpenSpec versions
   automatically, without asking — including `opsx-*.md` prompt files in my home
   directory (Codex keeps them in ~/.codex/prompts). Before you run it, look for
   those: `.../commands/openspec/` folders, OpenSpec marker blocks in files like
   CLAUDE.md or AGENTS.md, and home-directory `opsx-*.md` prompts. List whatever
   you find and wait for my go-ahead; if you find nothing, say so and carry on
   without asking. An existing `openspec/` folder is not a problem — init
   refreshes it and leaves my specs and changes alone.
   Confirm I'm in the right folder too: init creates `openspec/` wherever it
   runs, including inside a monorepo package.
   Then run: openspec init --tools <ids>

5. REPORT. Don't assume what should exist — tell me what init actually printed:
   how many skills and/or commands it created and where, the config file line,
   any "Setup required" note, and what to restart or reload. Some tools are
   skills-only and correctly create zero command files, so missing commands is
   not a failure on its own. If init said nothing was generated, relay the fix
   it suggested instead of retrying. Finish by telling me how to invoke OpenSpec
   in my tool, and take the exact spelling from the files init created rather
   than from its summary line: the punctuation differs per tool (/opsx:propose
   in some, /opsx-propose in others, @opsx-propose in Amazon Q), and tools that
   get skills instead of commands are invoked by skill name (/openspec-propose,
   or $openspec-propose in Codex, or /skill:openspec-propose in Kimi Code).
```

Nothing in the prompt is vendor-specific: it's plain instructions plus the same commands documented on this page. It works on macOS, Linux, and Windows, and it deliberately stops rather than improvising when a step needs your permission. Your assistant does need to be able to run shell commands — a few IDE integrations can't.

## Package Managers

### npm

```bash
npm install -g @fission-ai/openspec@latest
```

### pnpm

```bash
pnpm add -g @fission-ai/openspec@latest
```

### yarn

```bash
yarn global add @fission-ai/openspec@latest
```

Yarn 2 and later (Berry) removed the `global` command. On those versions, install OpenSpec with npm, pnpm, or bun instead — a global CLI doesn't need to share your project's package manager.

### deno

Deno sometimes has issues parsing the @latest tag, but we can specify a version while installing initially.
If that happens, you could try to change the @latest tag with the version, something like `@^1.3.1`

```bash
deno install --global \
  --allow-read --allow-write --allow-env --allow-sys=cpus,homedir --allow-net=edge.openspec.dev \
  npm:@fission-ai/openspec@latest
# or
deno install --global \
  --allow-read --allow-write --allow-env --allow-sys=cpus,homedir --allow-net=edge.openspec.dev \
  npm:@fission-ai/openspec@^1.3.1
```

Note: If your subcommands launch external tools, like config edit, feedback, or workspace open, you may need a scoped --allow-run=<program>.

### bun

Bun 可以全局安装 OpenSpec,但 OpenSpec 目前运行在 Node.js 上。
你仍需要在 `PATH` 中提供 Node.js 20.19.0 或更高版本。

```bash
bun add -g @fission-ai/openspec@latest
```

## Nix

直接运行 OpenSpec,无需安装:

```bash
nix run github:Fission-AI/OpenSpec -- init
```

或安装到你的 profile:

```bash
nix profile install github:Fission-AI/OpenSpec
```

或在 `flake.nix` 中加入你的开发环境:

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    openspec.url = "github:Fission-AI/OpenSpec";
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
openspec --version
```

## 更新

升级包,然后刷新每个项目生成的文件:

```bash
npm install -g @fission-ai/openspec@latest   # 或 pnpm/yarn/bun 的等价命令
openspec-cn update                              # 在每个项目内运行
```

`openspec update` regenerates the skill and command files for the tools you've configured, so your slash commands stay current with the installed version. It also checks whether a newer CLI has been published and offers to upgrade, since upgrading is what makes new workflows available in the first place — see [CLI Reference](cli.md#openspec-update).

## 卸载

没有 `openspec-cn uninstall` 命令,因为 OpenSpec 只是一个全局包加上你项目中的一些文件。移除它需要几个手动步骤,这里没有任何操作会触及你的源代码。

**1. 移除全局包:**

```bash
npm uninstall -g @fission-ai/openspec   # 或: pnpm rm -g / yarn global remove / bun rm -g
```

**2. 从项目中移除 OpenSpec(可选)。** 如果你不再需要其中的 specs 和变更,删除 `openspec/` 目录:

```bash
rm -rf openspec/
```

动手前请三思:`openspec/specs/` 和 `openspec/changes/archive/` 是系统行为及其变更原因的记录。若你可能需要那段历史,即便在卸载后也请保留该文件夹(或保留在 git 中)。

**3. 移除生成的 AI 工具文件(可选)。** OpenSpec 会将 skill 和 command 文件写入各工具的目录,如 `.claude/skills/openspec-*/`、`.cursor/commands/opsx-*` 等。删除你所配置工具对应的 `openspec-*` skills 和 `opsx-*` commands。各工具的准确路径列于 [Supported Tools](supported-tools.md)。

如果你还在 `CLAUDE.md` 或 `AGENTS.md` 之类的文件中有 OpenSpec 标记块,请手动移除它们;这些文件中你自己的内容由你保留。

## 下一步

安装后,在你的项目中初始化 OpenSpec:

```bash
cd your-project
openspec-cn init
```

完整导览见 [Getting Started](getting-started.md)。
