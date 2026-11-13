# CODEBUDDY.md

当前项目是OpenSpec项目的汉化版，当前项目汉化后名叫@studyzy/openspec-cn，只有在命令行下是执行openspec-cn命令，而不是openspec命令了，但新建的目录也还是叫openspec，对应的SKILL也是保持openspec-XXX不变，不用变成openspec-cn-XXX。

在汉化过程中Schema作为特殊计算机词汇，不需要翻译成中文，保持不变即可。注意代码中的注释不需要翻译成中文。
翻译术语表参见：`TRANSLATION_GLOSSARY.md` 如果有新的术语时也请记得补充完善。
## 项目概述

`@studyzy/openspec-cn` 是 [OpenSpec](https://github.com/Fission-AI/OpenSpec) 的简体中文汉化分支。OpenSpec 是一个面向 AI 编程助手的规范驱动开发框架——在写代码前通过提案(proposal)、规范(spec)、设计(design)、任务(tasks)四类制品与 AI 对齐意图。

- 原版 npm: `@fission-ai/openspec`
- 本仓库 npm: `@studyzy/openspec-cn`
- 汉化作者: @studyzy (Devin Zeng)

## 技术栈

- TypeScript, ESM 模块 (`"type": "module"`)
- Node.js ≥ 22.12.0
- pnpm 包管理
- CLI 框架: Commander.js
- 测试: Vitest
- 构建: `node build.js` (内部调用 tsc)
- ESLint: typescript-eslint

## 常用命令

```bash
# 安装与构建
pnpm install
pnpm build          # 编译 src/ → dist/
pnpm dev            # tsc --watch 增量编译

# 测试
pnpm test           # 运行全部测试 (vitest run)
pnpm test:watch     # watch 模式
pnpm test:ui        # Vitest UI 仪表盘
pnpm test:coverage  # 覆盖率报告

# 运行单个测试
pnpm exec vitest run test/path/to/file.test.ts
pnpm exec vitest run test/path/to/file.test.ts -t "case name"

# 注意：修改 src/ 后运行 CLI E2E 测试前需先 pnpm build，否则测试会使用过期的 dist/

# Lint
pnpm lint           # eslint src/

# 本地 CLI 调试
pnpm dev:cli        # 构建并运行 bin/openspec.js
```

## 代码架构

```
src/
├── cli/          # CLI 入口，Commander.js 定义所有命令与子命令
│   └── index.ts  # ~590行，注册 init/list/view/change/archive/spec/config/schema/store/doctor 命令
├── commands/     # 各命令的实现逻辑（与 cli 注册分离）
├── core/         # 核心抽象（最大模块）
│   ├── artifact-graph/  # 制品图系统：schema 解析、依赖图、状态追踪、指令生成
│   │   ├── types.ts     # Artifact, SchemaYaml 的 Zod schema
│   │   ├── schema.ts    # YAML schema 加载与校验（重复ID检测、引用完整性、DFS环检测）
│   │   ├── graph.ts     # 制品依赖图
│   │   ├── state.ts     # 运行时状态追踪
│   │   └── resolver.ts  # 依赖解析
│   ├── command-generation/  # 命令适配器（2.0 只用于识别/清理旧版命令文件，不再生成）
│   │   └── adapters/        # 每种工具一个适配器（claude, cursor, codebuddy, copilot 等）
│   ├── store/            # Store 系统（注册、注销、Git 操作、诊断）
│   │   └── operations.ts # ~1200行，Store 完整生命周期管理
│   ├── shared/           # 共享工具：Agent Skills 模板生成、工具检测
│   │   ├── shared-skill-install.ts # 2.0 唯一入口：向 .agents/skills/ 安装共享 skills 并建链接
│   │   ├── skill-links.ts          # 链接的创建/识别/分类
│   │   └── own-skill-texts.ts      # 判断 .agents/skills/ 中哪些是用户自有 skill
│   ├── config.ts         # AI_TOOLS 常量（30+ 种工具）、RETIRED_TOOLS、OpenSpec 可用性检测
│   ├── retired-tools.ts  # 已退役工具（Amazon Q）的清理与提示
│   ├── config-prompts.ts # 交互式配置提示
│   ├── init.ts           # 项目初始化（动态导入 @inquirer，ESLint 豁免静态导入限制）
│   ├── profiles.ts       # Profile 定义（core, custom）
│   └── legacy-cleanup.ts # 旧版制品清理
├── utils/        # 工具函数
│   ├── file-system.ts   # FileSystemUtils：路径操作、规范化、跨平台兼容
│   ├── item-discovery.ts # Spec/Change/Store 项目发现
│   └── ...
├── prompts/      # 自定义交互式提示（searchable-multi-select）
├── ui/           # CLI 输出美化（ASCII art、欢迎屏）
└── telemetry/    # PostHog 匿名遥测
```

### 入口文件

- `src/index.ts` — 库入口，导出 `cli/index` 和 `core/index`
- `bin/openspec.js` — CLI 可执行入口，调用 `runCli()`

### 关键设计决策

1. **动态导入 @inquirer**: 因预提交钩子挂起问题(#367)，所有 `@inquirer/*` 必须用 `dynamic import()` 而非静态导入。此规则由 ESLint `no-restricted-imports` 强制执行。唯一的例外是 `src/core/init.ts`（它本身被动态加载，静态导入 @inquirer 是安全的）。

2. **跨平台路径**: 必须使用 `path.join()` / `path.resolve()`，禁止硬编码斜杠。测试中预期路径值也必须用 `path.join()` 构建。路径同一性比较前需规范化（`FileSystemUtils.canonicalizeExistingPath()`）。

3. **制品图系统**: 核心抽象。每个 schema 定义制品及其依赖关系(`requires`)。系统追踪完成状态，按依赖顺序生成任务。

4. **Schema 驱动**: `schemas/spec-driven/schema.yaml` 定义了 4 种制品（proposal → spec → design → tasks）及其依赖和模板。Schema 包通过独立仓库分发，类似 GitHub spec-kit 社区扩展模式。

5. **命令注册模式**: CLI 定义在 `cli/index.ts`，命令实现逻辑在 `commands/`。子命令注册通过 `registerSpecCommand`、`registerConfigCommand` 等函数完成。

6. **汉化范围**: 界面文字、文档、模板已汉化。代码标识符、CLI 参数名保持英文。`src/` 中中文字符串用 `// 中文注释` 标注。

7. **2.0 只安装 skills**: 项目 skills 只写一份到 `.agents/skills/`；不读该目录的工具（Claude Code、Kiro、CodeBuddy 等，见 `SKILL_LINKED_TOOL_IDS`）从其自身文件夹建立链接。MiniMax Code 例外，写全局 `~/.minimax/skills/`。原本由 `delivery` 设置的 skills/commands 二选一已退役：值仍会被读取，但不再影响安装内容；`command-generation/adapters` 仅保留用于识别并清理旧版生成的文件。

## OpenSpec 开发工作流

本仓库自身使用 OpenSpec 管理开发。`openspec/` 目录结构：

```
openspec/
├── config.yaml      # 项目配置（schema: spec-driven, 技术上下文, 编码规则）
├── specs/           # 20+ 规范目录（每个含 spec.md）
├── changes/         # 当前活跃的变更提案
├── changes/archive/ # 已归档的变更
└── explorations/    # 设计探索文档
```

工作流：`/openspec-explore` → `/openspec-propose` → `/openspec-apply-change` → `/openspec-archive-change`（Codex 中写作 `$openspec-propose`）。

## 测试结构

```
test/
├── AGENTS.md          # 测试编写指引
├── vocabulary-sweep.test.ts  # 确保退役术语不会重新出现
├── *-docs-claims.test.ts     # 校验文档（docs-lab/）与 CLI 实际行为/文案一致
├── cli-e2e/           # CLI 端到端测试
│   ├── basic.test.ts  # help/version/init/validate
│   └── commands/      # 各命令测试（~17+ 文件）
├── core/              # 核心模块单元测试（~35 文件）
├── helpers/
│   └── run-cli.ts     # runCLI() 辅助函数，spawn dist/cli/index.js
└── fixtures/          # 测试固件（含 released-output/ 各历史版本产物快照）
```

CLI E2E 测试通过 `runCLI()` spawn 已构建的 `dist/cli/index.js`，创建临时目录，设置 `OPEN_SPEC_INTERACTIVE=0` 禁用交互提示，使用 `--json` 标志获取机器可解析输出。`vitest.setup.ts` 确保测试前 CLI 已构建。

`*-docs-claims.test.ts` 会读取 `docs-lab/` 中的页面并断言其中引用的命令、文案、安装地址与源码一致；改动 CLI 输出的用户可见文案时，通常要同步这些测试与文档。

## 发布

使用 Changesets 管理版本发布：

```bash
pnpm changeset     # 交互式创建 changeset
pnpm release       # 发布流程
```

Nix 支持通过 `flake.nix` 提供（`pnpm_9`, `nodejs_22`），支持 x86_64-linux, aarch64-linux, x86_64-darwin, aarch64-darwin。

## 注意
EXPECTED_FUNCTION_HASHES 和 EXPECTED_GENERATED_SKILL_CONTENT_HASHES 会因为汉化而改变，导致相关的UT不通过。应当在所有汉化完成后用脚本重新计算哈希，不要手工改单个值：
1. `pnpm build`
2. `pnpm generate:skills` — 由 `src/core/templates/` 重新生成 `skills/*/SKILL.md`
3. `pnpm regen:parity-hashes` — 重算 parity 测试中的哈希表

## 合入上游版本

1. `git fetch offical --tags`，确认 `git merge-base HEAD v<版本>` 是上次合入的上游 tag。
2. `git merge --no-commit v<版本>`，逐个解决冲突。
3. 身份适配：npm 包 `@studyzy/openspec-cn`、命令 `openspec-cn`、独立二进制 `openspec-cn`/`openspec-cn.exe`、仓库与下载源 `studyzy/OpenSpec-cn`。目录 `openspec/`、schema 名、env 变量名（`OPENSPEC_*`）、skill 名（`openspec-*`）保持不变。
4. 新增或改动的用户可见文案按 `TRANSLATION_GLOSSARY.md` 汉化；`docs-lab/` 是当前文档来源，需一并汉化（`docs/` 为遗留目录，可不动）。
5. 更新 `CODEBUDDY.md`、`README.md`、`TRANSLATION_GLOSSARY.md` 中受影响的事实。
6. 重算模板哈希（见上），跑 `pnpm build && pnpm lint && pnpm test`。
7. 补一条对应版本级别的 changeset。