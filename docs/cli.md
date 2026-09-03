# CLI 参考

OpenSpec CLI (`openspec`) 提供用于项目初始化、验证、状态检查与管理的终端命令。这些命令与 [Commands](commands.md) 中介绍的 AI slash command(如 `/opsx:propose`)互为补充。

## 概览

| 类别 | 命令 | 用途 |
|----------|----------|---------|
| **初始化** | `init`, `update` | 在项目中初始化和更新 OpenSpec |
| **Stores（独立的 OpenSpec 规划仓库）** | `store setup`, `store register`, `store unregister`, `store remove`, `store list`, `store doctor` | 管理已注册的 stores——你注册过的独立 OpenSpec 规划仓库 |
| **健康检查** | `doctor` | 报告当前根目录及其关联 store 的健康状态 |
| **工作上下文** | `context` | 组装工作集(根目录 + 引用的 stores) |
| **个人 workset** | `workset create`, `workset list`, `workset open`, `workset remove` | 在工具中保存并打开个人的本地视图 |
| **浏览** | `list`, `view`, `show` | 探索变更与 specs |
| **验证** | `validate` | 检查变更和 specs 是否存在问题 |
| **生命周期** | `archive` | 定稿已完成的变更 |
| **工作流** | `new change`, `status`, `instructions`, `templates`, `schemas` | 制品驱动的工作流支持 |
| **Schemas** | `schema init`, `schema fork`, `schema validate`, `schema which` | 创建并管理自定义工作流 |
| **配置** | `config` | 查看与修改设置 |
| **实用工具** | `feedback`, `completion` | 反馈与 shell 集成 |

---

## 人工命令与 Agent 命令

大多数 CLI 命令都是为终端中的**人工使用**而设计的。部分命令也支持通过 JSON 输出供 **agent/脚本使用**。

### 仅人工命令

这些命令是交互式的,专为终端使用设计:

| 命令 | 用途 |
|---------|---------|
| `openspec-cn init` | 初始化项目(交互式提示) |
| `openspec-cn view` | 交互式仪表盘 |
| `openspec-cn workset open <name>` | 打开已保存的 workset(编辑器窗口或终端 agent 会话) |
| `openspec-cn config edit` | 在编辑器中打开配置 |
| `openspec-cn feedback` | 通过 GitHub 提交反馈 |
| `openspec-cn completion install` | 安装 shell 补全 |

### 兼容 Agent 的命令

这些命令支持 `--json` 输出,供 AI agents 和脚本以编程方式使用:

| 命令 | 人工使用 | Agent 使用 |
|---------|-----------|-----------|
| `openspec-cn list` | 浏览变更/specs | `--json` 获取结构化数据 |
| `openspec-cn show <item>` | 阅读内容 | `--json` 用于解析 |
| `openspec-cn validate` | 检查问题 | `--all --json` 用于批量验证 |
| `openspec-cn status` | 查看制品进度 | `--json` 获取结构化状态 |
| `openspec-cn instructions` | 获取下一步 | `--json` 用于 agent 指令 |
| `openspec-cn templates` | 查找模板路径 | `--json` 用于路径解析 |
| `openspec-cn schemas` | 列出可用的 schemas | `--json` 用于 schema 发现；`--store <id>` 用于选择已注册的根目录 |
| `openspec-cn store setup <id>` | 创建并注册本地 store | `--json` 配合显式输入以获取结构化 setup 输出 |
| `openspec-cn store register <path>` | 注册已有的 store | `--json` 用于结构化注册输出 |
| `openspec-cn store unregister <id>` | 取消本地 store 注册 | `--json` 用于结构化清理输出 |
| `openspec-cn store remove <id>` | 删除已注册的本地 store 文件夹 | `--yes --json` 用于非交互式删除 |
| `openspec-cn store list` | 浏览已注册的 stores | `--json` 用于结构化注册信息 |
| `openspec-cn store doctor` | 检查本地 store 设置 | `--json` 用于结构化诊断 |
| `openspec-cn new change <id>` | 创建仓库本地的变更脚手架 | `--json`,外加 `--store <id>` 以使用已注册的 store 作为 OpenSpec 根目录 |
| `openspec-cn workset create [name]` | 组合个人工作视图 | `--member <path> --json` 用于非交互式组合 |
| `openspec-cn workset list` | 浏览已保存的 worksets | `--json` 用于结构化视图 |
| `openspec-cn workset remove <name>` | 删除已保存的视图 | `--yes --json` 用于非交互式移除 |

---

## 全局选项

这些选项对所有命令均生效:

| 选项 | 描述 |
|--------|-------------|
| `--version`, `-V` | 显示版本号 |
| `--no-color` | 关闭彩色输出 |
| `--help`, `-h` | 显示命令帮助 |

---

## 初始化命令

### `openspec-cn init`

在项目中初始化 OpenSpec。创建文件夹结构并配置 AI 工具集成。

默认行为使用全局配置默认值:profile `core`、交付方式 `both`、工作流 `propose, explore, apply, update, sync, archive`。

```
openspec-cn init [path] [options]
```

使用 `--language <language>` 可向新项目的 `openspec/config.yaml` 添加语言指令。对于已有项目，请编辑该配置的 `context` 字段，这样 OpenSpec 就永远不会覆盖项目特定的指引。

**参数:**

| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `path` | 否 | 目标目录(默认:当前目录) |

**选项:**

| 选项 | 描述 |
|--------|-------------|
| `--tools <list>` | 非交互式配置 AI 工具。使用 `all`、`none` 或逗号分隔的列表 |
| `--language <language>` | 创建新配置时使用此语言编写制品 |
| `--force` | 自动清理旧版文件,不提示 |
| `--profile <profile>` | 本次 init 运行覆盖全局 profile(`core` 或 `custom`) |
| `--no-animation` | 显示静态欢迎屏而非动画版本 |
| `--copilot-cloud` | 不经提示直接设置 GitHub Copilot 的 [云端 coding-agent 文件](supported-tools.md#github-copilot-cloud-coding-agent) |
| `--no-copilot-cloud` | 不经提示直接跳过 GitHub Copilot 云端 coding-agent 文件 |

`--profile custom` 使用全局配置中当前选中的工作流(`openspec-cn config profile`)。

当设置了 `OPENSPEC_NO_ANIMATION` 环境变量(任意值,包括空值)、`NO_COLOR` 被设为非空值,或操作系统启用了减弱动态效果偏好(macOS 的"减弱动态效果"、GNOME 关闭动画)时,欢迎动画同样会被跳过。

**支持的工具 ID(`--tools`)** — `windsurf` 同样被接受,作为 `devin` 的别名:`amazon-q`, `antigravity`, `auggie`, `bob`, `claude`, `cline`, `command-code`, `codeartsagent`, `codex`, `devin`, `forgecode`, `codebuddy`, `continue`, `costrict`, `crush`, `cursor`, `factory`, `gemini`, `github-copilot`, `hermes`, `iflow`, `junie`, `kilocode`, `kimi`, `kiro`, `lingma`, `minimax-code`, `vibe`, `oh-my-pi`, `opencode`, `pi`, `codeassistant`, `qoder`, `qwen`, `rovodev`, `roocode`, `trae`, `zed`, `zcode`, `agents`

> 该列表与 `src/core/config.ts` 中的 `AI_TOOLS` 对应。各工具的 skill 与命令路径见 [支持的工具](supported-tools.md)。

**示例:**

```bash
# 交互式初始化
openspec-cn init

# 在指定目录初始化
openspec-cn init ./my-project

# 非交互式:配置 Claude 和 Cursor
openspec-cn init --tools claude,cursor

# 非交互式:配置全局 MiniMax Code skills
openspec-cn init --tools minimax-code

# 为所有受支持的工具配置
openspec-cn init --tools all

# 本次运行覆盖 profile
openspec-cn init --profile core

# 跳过提示并自动清理旧版文件
openspec-cn init --force
```

**创建内容:**

```
openspec/
├── specs/              # 你的规范(事实来源)
├── changes/            # 已提议的变更
└── config.yaml         # 项目配置

.claude/skills/         # Claude Code skills(若选中 claude)
.cursor/skills/         # Cursor skills(若选中 cursor)
.cursor/commands/       # Cursor OPSX commands(若交付方式包含 commands)
.agents/skills/         # 兼容 AGENTS.md 的工具的共享 skills(若选中 agents)
... (其他工具配置)
```

---

### `openspec-cn update`

升级 CLI 后更新 OpenSpec 指令文件。使用当前全局 profile、选中工作流和交付模式重新生成 AI 工具配置文件。

```
openspec-cn update [path] [options]
```

**参数:**

| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `path` | 否 | 目标目录(默认:当前目录) |

**选项:**

| 选项 | 描述 |
|--------|-------------|
| `--force` | 即使文件已是最新也强制更新 |

**示例:**

```bash
# npm 升级后更新指令文件
npm install -g @studyzy/openspec-cn@latest
openspec-cn update
```

请先升级包。指令文件由已安装的 CLI 生成,因此在一个陈旧的安装上运行 `openspec-cn update`,会报告一切都是最新的,却不会添加更新版本所附带的工作流。

为了让这一点显性化,`openspec-cn update` 会询问 npm registry 是否已发布更新的 CLI。当你的版本落后时,它会主动提出升级:

```text
A newer OpenSpec CLI is available (v1.6.0 → v1.7.0).
  Running from: /usr/local/lib/node_modules/@studyzy/openspec-cn
? Upgrade to v1.7.0 now? (Y/n)
```

回答 yes,它会运行 `npm install -g @studyzy/openspec-cn@latest`,然后用新 CLI 重新执行更新,这样新工作流会在同一条命令中落地。它通过询问已安装二进制的版本来确认升级,而不是信任 npm 的退出码,因此如果 `PATH` 上更靠前的另一份安装仍在响应,它会告诉你,而不是声称成功。回答 no,它会打印该命令并用你现有的 CLI 执行更新。Ctrl-C 可停止该命令。

该提示只在交互式终端中出现,并且只在 npm 拥有该安装时出现——这正是 `npm install -g` 真正能修复的那一种情况。其他所有情况会改为得到与其安装方式相匹配的命令:

| OpenSpec 的安装方式 | 你会得到什么 |
|---------------------------|--------------|
| 全局 npm 安装 | 提示,以及替你执行的升级——限于交互式终端;管道输出则改为打印命令 |
| 全局 pnpm、bun、yarn 或 volta 安装 | 该管理器自身的命令:`pnpm add -g …@latest`、`bun add -g …@latest`、`yarn global add …@latest` 或 `volta install …@latest` |
| 作为项目的依赖 | 一条提示你更新依赖的说明,因为其包管理器拥有 lockfile |
| `npx` / `dlx` 缓存 | `npx @studyzy/openspec-cn@latest update` — 那条命令本身就是更新,所以没有第二步 |
| git clone | 什么都没有——你的版本就是分支上的那个 |

无论打印什么内容,它都会点名正在运行的 CLI 是从哪个目录加载的——当你确实升级了、但一个陈旧的 shim 仍然占据你的 `PATH` 时,这正是要检查的东西。

当 npm 导出了 `npm_config_registry` 时,它会询问该 registry,否则询问 `https://registry.npmjs.org`。不会读取任何 `.npmrc`:让文件内容决定一个出站请求发往何处是一种值得避免的流程,而项目的 `.npmrc` 会随仓库一起流转。在私有镜像上,请导出 `npm_config_registry`——或设置 `OPENSPEC_NO_UPDATE_CHECK` 以完全跳过该检查。当 `CI` 被设为除显式关闭值(`false`、`0`、`no`、`off` 或空)之外的任何值时、在 `NODE_ENV=test` 下,以及设置了 `OPENSPEC_NO_UPDATE_CHECK`(任意值)、`DO_NOT_TRACK=1` 或 `OPENSPEC_TELEMETRY=0` 时,该检查都会被跳过。它在更新之前运行,最多只会延迟 1.5 秒——即使网络在静默丢包,超时后它也会放弃,并且在 registry 不可达时保持沉默。

**"是否最新"是如何判定的:** skill 文件会记录生成它们的版本,因此 OpenSpec 会
拿它与已安装的 CLI 作比较。命令文件不带版本戳,因此对于只有 commands 而没有
skills 的工具(交付方式为 `commands`),OpenSpec 会把文件内容与它现在会生成的
内容作比较——对这些文件的编辑会被视为漂移并被覆盖。当交付方式为 `skills` 或
`both` 时,只检查记录的版本,因此一个版本仍然匹配的手工编辑文件会被保留;用
`--force` 可以重写它。无论哪种方式,生成的文件都归 OpenSpec 所有——请把你自己的
指令放在别处。

---

## Stores（独立的 OpenSpec 规划仓库）

> **Beta。** Stores 及其上构建的功能(引用、工作上下文、worksets)为新增功能;命令名、标志、文件格式与 JSON 输出在版本间可能发生变化。如需以问题为导向的导览,见 [stores 指南](stores-beta/user-guide.md)。

store 是你在本机注册过的独立 OpenSpec 仓库——例如一个团队规划仓库。注册 store 后,常规命令(`list`、`show`、`status`、`validate`、`new change`、`archive` 等)可通过传入 `--store <id>` 从任意位置作用于它。

### `openspec-cn store setup`

创建并注册本地 store。在终端中无参数运行时,OpenSpec 会引导用户完成 setup。Agent 和脚本应传入显式输入并使用 `--json`。

```bash
openspec-cn store setup [id] [options]
```

**选项:**

| 选项 | 描述 |
|--------|-------------|
| `--path <path>` | store 所在的文件夹(例如 `~/openspec/<id>`) |
| `--remote <url>` | 将规范远程地址记录到新 store 的 `store.yaml` 中 |
| `--init-git` | 用初始提交初始化 Git 仓库(默认) |
| `--no-init-git` | 跳过所有 Git 操作:不初始化,不创建初始提交 |
| `--json` | 输出 JSON |

非交互式运行(`--json`、脚本、agents)必须同时传入 store id 和 `--path`。在交互式终端中,setup 会在一个可见的、用户拥有的位置(例如 `~/openspec/<id>`)以可编辑的建议值提示输入位置;它绝不会默认使用 OpenSpec 管理的 data 目录。

示例:

```bash
openspec-cn store setup
openspec-cn store setup team-context
openspec-cn store setup team-context --path ~/openspec/team-context --no-init-git
openspec-cn store setup team-context --path ~/openspec/team-context --no-init-git --json
```

### `openspec-cn store register`

注册一个已有的本地 store 文件夹。在 stores beta 期间，一个根目录在没有任何变更、specs 已应用或变更已归档之前就可以被注册;这种情况下 `openspec/changes/`、`openspec/specs/` 和 `openspec/changes/archive/` 可能要到常规命令创建它们时才会出现。
一个仅声明 `store: <id>` 的纯配置仓库仍是指向另一个 store 的指针,除非移除该指针,否则不会被注册为 store 根目录。

```bash
openspec-cn store register [path] [options]
```

**选项:**

| 选项 | 描述 |
|--------|-------------|
| `--id <id>` | store id;默认为 store 元数据或文件夹名 |
| `--yes` | 确认为一个健康的 OpenSpec 根目录创建 store 身份元数据 |
| `--json` | 输出 JSON |

### `openspec-cn store unregister`

取消本地 store 注册,但不删除文件。

```bash
openspec-cn store unregister <id> [--json]
```

当你移动了某个 store、把它克隆到了别处,或希望本机上的 OpenSpec 不再显示它时使用。

### `openspec-cn store remove`

取消本地 store 注册并删除其本地文件夹。

```bash
openspec-cn store remove <id> [--yes] [--json]
```

在交互式终端中,`remove` 会在删除前显示确切的文件夹。
agents、脚本和 JSON 调用方必须传入 `--yes` 以确认删除。
OpenSpec 拒绝删除不包含匹配 store 元数据的文件夹。

### `openspec-cn store list`

列出本地已注册的 stores。

```bash
openspec-cn store list [--json]
openspec-cn store ls [--json]
```

### `openspec-cn store doctor`

检查本地 store 的注册、元数据和 Git 存在情况。

```bash
openspec-cn store doctor [id] [--json]
```

doctor 仅用于诊断;它报告缺失的根目录、元数据不匹配和无效的本地注册状态,不会修改 store。

### 从项目引用 stores

项目仓库可在 `openspec/config.yaml` 中声明其工作所依赖的 stores:

```yaml
schema: spec-driven
references:
  - team-context
```

此后,该仓库中 `openspec-cn instructions` 的输出(每个制品与 `apply` 表面、JSON 和人类模式)都会携带一个索引,列出每个被引用 store 的 specs——spec id、每个 spec 的 Purpose 段落中的一行摘要,以及 fetch 命令(`openspec-cn show <spec-id> --type spec --store <id>`)。该索引在每次运行时从已注册的 checkout 实时构建;spec 内容绝不会被复制到输出中。

引用是只读上下文。它们绝不会改变命令的作用位置:工作仍保留在仓库自己的根目录中,写入被引用的 store 仍然是一个显式的 `--store` 操作。无法解析的引用(例如本机未注册的 store)会在索引中降级为一条带确切修复方法的警告,指令仍会生成。`openspec-cn doctor` 会在一处报告引用健康状态。

### 记录 store 的克隆来源

store 可以在其已提交的身份文件中记录规范的克隆来源,这样新成员在"注册 store"这一步就不会走入死胡同:

```bash
openspec-cn store setup team-context --path ~/openspec/team-context \
  --remote git@github.com:acme/team-context.git
```

该 remote 会落在初始提交内的 `.openspec-store/store.yaml` 中,因此每一次克隆自诞生起就知道它的来源。对于已有的 store,手动编辑 `store.yaml` 并提交。`store doctor` 会显示记录的 remote(以及 checkout 实际观察到的 Git origin);setup/register 共享指引会指出它;register 会将 checkout 的 origin 记录到本地机器的注册表中。

引用声明也可以携带克隆来源,这样尚未拥有该 store 的队友会得到一个完整、可粘贴的修复命令(`git clone <remote> <path> && openspec-cn store register <path> --id <id>`):

```yaml
references:
  - { id: team-context, remote: "git@github.com:acme/team-context.git" }
```

记录 remote 并非同步:OpenSpec 绝不会自行 clone、pull 或 push。

### 声明默认 store

一个规划完全外置化——没有本地 `openspec/specs/` 或 `openspec/changes/`——的仓库,可以声明一次其 store,而不必在每个命令上都传入 `--store`:

```yaml
# openspec/config.yaml(openspec/ 下唯一的文件)
store: team-context
```

常规命令随后会自动解析到声明的 store;根目录横幅和 JSON `root` 块会报告 `source: "declared"` 及 store id,打印的提示仍会携带 `--store <id>`。该声明是兜底方案,而非覆盖:显式的 `--store` 始终优先,而一个带有真实规划文件夹的目录会忽略该指针(并给出警告)。要将指针仓库转换为本地 OpenSpec 根目录,移除 `store:` 行并运行 `openspec-cn init`——在声明存在期间,init 拒绝搭建脚手架。

还有一个机器级变体可以一次覆盖所有仓库:`openspec-cn config set defaultStore <id>`(见"配置")。它只在 `--store`、本地根目录和项目指针全部解析失败之后才会被查询;此时根目录横幅和 JSON `root` 块会报告 `source: "global_default"`。

## Doctor(关系健康)

一个只读诊断，回答一个问题：OpenSpec 根目录是否健康？它引用的 stores 在本机是否可用？

```bash
openspec-cn doctor [--store <id>] [--json]
```

该报告把根目录健康、store 元数据健康(包括记录的 remote 与 checkout 的 origin 出现分歧时的提示,以及 store checkout 落后于其上次抓取的上游跟踪 ref 时的提示),以及引用健康(与 instructions 展示的诊断相同,并为未解析的引用给出克隆修复方案)分开呈现。任何严重级别的健康发现都以 0 退出——agent 读取 `status` 数组;只有命令级失败(无根目录、未知 store)才以 1 退出。Doctor 从不克隆、同步或修复。若想获取组装后的集合本身而非其健康状况,请使用 `openspec-cn context`。

## 工作上下文(组装后的集合)

通过 OpenSpec 声明与本工作相关的所有内容,汇聚到一个工作集中:OpenSpec 根目录及其引用的 stores。

```bash
openspec-cn context [--store <id>] [--json] [--code-workspace <path> [--force]]
```

JSON 摘要可供 agent 消费(每个可用的被引用 store 都带有它的 fetch 配方;未解析成员携带与指令和 doctor 相同的修复)。`--code-workspace` 还会额外写入一个 VS Code 工作区文件,包含根目录和可用被引用 stores(`ref:<id>` 文件夹)——这是该命令执行的唯一一次写入,若文件已存在则在不加 `--force` 时被拒绝。不可用成员会被报告,绝不会被猜测。

"工作上下文"是组装后的集合;`openspec/config.yaml` 中的 `context:` 字段是注入到指令中的项目背景——这是两件不同的事。`openspec-cn doctor` 回答集合是否健康;`openspec-cn context` 回答集合是什么。

## 个人 worksets

> **Beta。** Worksets 属于新增 beta 表面;命令、标志和文件格式在版本间可能发生变化。如需导览,见 [stores 指南](stores-beta/user-guide.md#worksets-reopen-the-folders-you-work-on-together)。

workset 是你一起工作的文件夹的一个个人、具名视图——一个规划根目录加上你挑选的其他内容——保存在本机,并可在工具中按名称重新打开。它是纯本地的:从不提交、从不共享、从不从声明派生;移除一个 workset 也绝不会触碰成员文件夹。

```bash
openspec-cn workset create [name] [--member <path> | --member <name>=<path>]... [--tool <id>] [--json]
openspec-cn workset list [--json]
openspec-cn workset open <name> [--tool <id>]
openspec-cn workset remove <name> [--yes] [--json]
```

`create` 会运行一个简短的引导流程(或以非交互式方式接收 `--member` 标志;第一个成员是主成员——会话从这里开始)。`open` 启动所选工具:编辑器(VS Code、Cursor)打开一个包含所有成员的窗口并返回;CLI agents(Claude Code、codex)将接管本终端作为一个会话,附加所有成员、不预填任何提示,在你退出时结束。打开时缺失的成员文件夹会被跳过并附带说明;其余成员照常打开。保存的工具偏好可在每次打开时通过 `--tool` 覆盖。

支持新工具是配置而非代码。每种工具都是两种启动风格之一——`workspace-file`(用生成的 `.code-workspace` 启动)或 `attach-dirs`(每个成员一个 attach 标志)——全局 `config.json` 中的 `openers` 键(用 `openspec-cn config edit` 打开它)可按字段添加工具或调整内置工具:

```json
{
  "openers": {
    "zed": { "style": "workspace-file" },
    "claude": { "attach_flag": "--dir" }
  }
}
```

所有 workset 状态都位于全局 data 目录的 `worksets/` 文件夹下(已保存的视图加上生成的 `<name>.code-workspace` 文件,每次打开都会重新生成);删除该文件夹会清除所有痕迹。

---

## 浏览命令

### `openspec-cn list`

列出项目中的变更或 specs。

```
openspec-cn list [options]
```

**选项:**

| 选项 | 描述 |
|--------|-------------|
| `--specs` | 列出 specs 而非变更 |
| `--changes` | 列出变更(默认) |
| `--sort <order>` | 按 `recent`(默认)或 `name` 排序 |
| `--json` | 以 JSON 输出 |

**示例:**

```bash
# 列出所有活跃变更
openspec-cn list

# 列出所有 specs
openspec-cn list --specs

# 供脚本使用的 JSON 输出
openspec-cn list --json
```

**输出(文本):**

```
Changes:
  add-dark-mode     No tasks      just now
```

---

### `openspec-cn view`

显示用于探索 specs 和变更的交互式仪表盘。

```
openspec-cn view
```

打开一个基于终端的界面,用于浏览项目的规范与变更。

---

### `openspec-cn show`

显示某个变更或 spec 的详情。

```
openspec-cn show [item-name] [options]
```

**参数:**

| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `item-name` | 否 | 变更或 spec 的名称(省略时提示) |

**选项:**

| 选项 | 描述 |
|--------|-------------|
| `--type <type>` | 指定类型:`change` 或 `spec`(无歧义时自动检测) |
| `--json` | 以 JSON 输出 |
| `--no-interactive` | 关闭提示 |

**变更专属选项:**

| 选项 | 描述 |
|--------|-------------|
| `--deltas-only` | 仅显示增量规范(delta spec)(JSON 模式) |

**Spec 专属选项:**

| 选项 | 描述 |
|--------|-------------|
| `--requirements` | 仅显示需求,排除场景(JSON 模式) |
| `--no-scenarios` | 排除场景内容(JSON 模式) |
| `-r, --requirement <id>` | 按 1 起始的索引显示指定需求(JSON 模式) |

**示例:**

```bash
# 交互式选择
openspec-cn show

# 显示指定变更
openspec-cn show add-dark-mode

# 显示指定 spec
openspec-cn show auth --type spec

# 供解析的 JSON 输出
openspec-cn show add-dark-mode --json
```

---

## 验证命令

### `openspec-cn validate`

校验变更与 specs 是否存在结构性问题,并对照变更的 MODIFIED 需求所要替换的主 specs 进行检查。

```
openspec-cn validate [item-name] [options]
```

一个 spec 增量为零的变更会校验失败,除非它的 `.openspec.yaml` 声明了 `skip_specs: true`(适用于纯重构、工具链或文档工作——见 [配方 5](examples.md#recipe-5-a-refactor-with-no-behavior-change))。

**参数:**

| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `item-name` | 否 | 要验证的具体条目(省略时提示) |

**选项:**

| 选项 | 描述 |
|--------|-------------|
| `--all` | 验证所有变更和 specs |
| `--changes` | 验证所有变更 |
| `--specs` | 验证所有 specs |
| `--archived` | 验证已归档变更的所有任务是否已完成(用于 pre-commit lint) |
| `--type <type>` | 名称有歧义时指定类型:`change` 或 `spec` |
| `--strict` | 启用严格验证模式 |
| `--json` | 以 JSON 输出 |
| `--concurrency <n>` | 最大并行验证数(默认:6,或环境变量 `OPENSPEC_CONCURRENCY`) |
| `--no-interactive` | 关闭提示 |

`--archived` 是独立的作用域:它不校验 spec 增量(归档时已应用),而是检查 `changes/archive/` 下每个变更的 `tasks.md` 复选框是否全部勾选,若有未勾选则以非零退出。这能捕获带着未完成工作被归档的变更——非常适合在 pre-commit 钩子中使用。

**示例:**

```bash
# 交互式验证
openspec-cn validate

# 验证指定变更
openspec-cn validate add-dark-mode

# 验证所有变更
openspec-cn validate --changes

# 以 JSON 输出验证全部(CI/脚本用)
openspec-cn validate --all --json

# 提高并行度的严格验证
openspec-cn validate --all --strict --concurrency 12

# 若有任何已归档变更仍带有未勾选的任务则失败
openspec-cn validate --archived
```

**输出(文本):**

```
Validating add-dark-mode...
  ✓ proposal.md valid
  ✓ specs/ui/spec.md valid
  ⚠ design.md: missing "Technical Approach" section

1 warning found
```

**输出(JSON):**

```json
{
  "version": "1.0.0",
  "results": {
    "changes": [
      {
        "name": "add-dark-mode",
        "valid": true,
        "warnings": ["design.md: missing 'Technical Approach' section"]
      }
    ]
  },
  "summary": {
    "total": 1,
    "valid": 1,
    "invalid": 0
  }
}
```

---

## 生命周期命令

### `openspec-cn archive`

归档已完成的变更,并将增量规范(delta spec)合并进主 specs。

```
openspec-cn archive [change-name] [options]
```

**参数:**

| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 要归档的变更(省略时会提示;当无人能回答提示时为必填) |

**选项:**

| 选项 | 描述 |
|--------|-------------|
| `-y, --yes` | 跳过确认提示。当无人能回答它们时为必需——AI agent、CI 任务,或任何 stdin 已关闭的运行 |
| `--skip-specs` | 在单次归档运行中跳过 spec 更新。一个永久没有 spec 增量的变更应改为在其 `.openspec.yaml` 中声明 `skip_specs: true`——这样无需任何标志即可归档 |
| `--no-validate` | 跳过校验(需要确认)。同时会禁用能力退役——没有校验器结论,任何能力都不会被退役 |

**示例:**

```bash
# 交互式归档(询问归档哪个变更,然后确认)
openspec-cn archive

# 归档指定变更
openspec-cn archive add-dark-mode

# 无提示归档(agents、CI、脚本)
openspec-cn archive add-dark-mode --yes

# 归档不影响 specs 的工具类变更
openspec-cn archive update-ci-config --skip-specs
```

**退役一个能力:** 把退役标记加到变更元数据中:

```yaml
# openspec/changes/retire-legacy/.openspec.yaml
schema: spec-driven
retire_capabilities: true
```

然后正常归档该变更:

```bash
openspec-cn archive retire-legacy --yes
```

当该变更移除了此能力的最后一条需求时,OpenSpec 会删除其活跃的 `spec.md`。同一变更中其他能力的增量仍会更新它们的主 spec。若没有该标记,归档会在改动任何文件之前停止,并提示你添加它。

**执行动作:**

1. 校验该变更(除非使用 `--no-validate`)
2. 提示确认(除非使用 `--yes`)
3. 在修改任何主 spec 之前先占用归档目标位置
4. 校验并把活跃的增量规范合并进 `openspec/specs/`——若某个能力的最后一条需求被该变更移除,该能力会被退役、其 spec 文件被删除,但仅当该变更的 `.openspec.yaml` 在 `schema:` 旁声明了 `retire_capabilities: true` 时才会发生
5. 把变更文件夹移动到 `openspec/changes/archive/YYYY-MM-DD-<name>/`
6. 如果在完整归档得到保障之前,spec 变更或最终移动失败,则恢复 specs 并把该变更保留或归还到其活跃路径
7. 如果一份经过校验的兜底副本已完成、但暂存源清理失败,则保留完整的归档和已提交的 spec 状态以便恢复

**没有终端时:** AI agent、CI 任务,或任何 stdin 已关闭的运行都无法回答第 2 步,
因此归档会在触碰任何东西之前停止、以 1 退出,并点名需要重跑的命令——
`openspec-cn archive <name> --yes`,并携带你原本传入的其他所有标志。
预先传入 `--yes`(以及变更名)即可省去这次往返。

---

## 工作流命令

这些命令支持制品驱动的 OPSX 工作流。它们对检查进度的人工和决定下一步的 agents 都很有用。

### `openspec-cn new change`

在解析出的 OpenSpec 根目录中创建变更目录及可选的已签入元数据。

```bash
openspec-cn new change <name> [options]
```

变更名必须使用小写 kebab-case:小写字母、数字和单个连字符。它们不能包含空格、
下划线、大写字母、连续连字符,或首尾连字符。允许以数字开头,因此你可以用前缀
对变更排序或分层,例如 `100-add-feature` 或 `00001-add-auth`。

**选项:**

| 选项 | 描述 |
|--------|-------------|
| `--description <text>` | 添加到 `README.md` 的描述 |
| `--goal <text>` | 随变更存储的可选 goal 元数据 |
| `--schema <name>` | 要使用的工作流 schema |
| `--store <id>` | 用作 OpenSpec 根目录的 store id(指你注册过的独立 OpenSpec 仓库) |
| `--json` | 输出 JSON |

示例:

```bash
openspec-cn new change add-billing-api
openspec-cn new change add-billing-api --store team-context --json
```

### `openspec-cn status`

显示变更的制品完成状态。

```
openspec-cn status [options]
```

**选项:**

| 选项 | 描述 |
|--------|-------------|
| `--change <id>` | 变更名称(省略时提示) |
| `--schema <name>` | schema 覆盖(从变更配置自动检测) |
| `--json` | 以 JSON 输出 |

**示例:**

```bash
# 交互式状态检查
openspec-cn status

# 指定变更的状态
openspec-cn status --change add-dark-mode

# 供 agent 使用的 JSON
openspec-cn status --change add-dark-mode --json
```

**输出(文本):**

```
Change: add-dark-mode
Schema: spec-driven
Progress: 2/4 artifacts complete

[x] proposal
[x] specs
[ ] design
[-] tasks (blocked by: design)
```

一个声明了 `skip_specs: true` 的变更,其 specs 阶段会显示为 `[~] specs (skipped: change declares skip_specs)`,并被排除在进度计数之外。

**输出(JSON):**

```json
{
  "changeName": "add-dark-mode",
  "schemaName": "spec-driven",
  "isPlanningComplete": false,
  "isComplete": false,
  "applyRequires": ["tasks"],
  "artifacts": [
    {"id": "proposal", "outputPath": "proposal.md", "status": "done", "requires": []},
    {"id": "specs", "outputPath": "specs/**/*.md", "status": "done", "requires": ["proposal"]},
    {"id": "design", "outputPath": "design.md", "status": "ready", "requires": ["proposal"]},
    {"id": "tasks", "outputPath": "tasks.md", "status": "blocked", "requires": ["specs", "design"], "missingDeps": ["design"]}
  ]
}
```

`isPlanningComplete` 报告是否每一个未被跳过的规划制品都已存在;被跳过的制品
无需创建即视为已满足。它不报告实现任务是否已完成。`isComplete` 作为兼容性别名
保留,其值相同。

制品按依赖顺序列出——依赖项绝不会出现在需要它的东西之后——并且同时变为就绪的
制品(spec-driven 中的 `specs` 与 `design` 都只需要 `proposal`)会保持 schema
声明它们的顺序,而非字母序。因此第一条 `ready` 条目就是接下来要写的制品。

---

### `openspec-cn instructions`

获取用于创建制品或应用任务的增强指令。供 AI agents 理解下一步要创建什么。

```
openspec-cn instructions [artifact] [options]
```

**参数:**

| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `artifact` | No | Artifact ID, or workflow input surface: `apply` or `archive` |

**选项:**

| 选项 | 描述 |
|--------|-------------|
| `--change <id>` | 变更名称(非交互模式下必填) |
| `--schema <name>` | schema 覆盖 |
| `--json` | 以 JSON 输出 |

**Special cases:** Use `apply` to get task implementation instructions. Use
`archive` to fetch current, read-only archive inputs (`context` and
`operationGuidance`) for a valid change; it does not archive or mutate anything.

**示例:**

```bash
# 获取下一个制品的指令
openspec-cn instructions --change add-dark-mode

# 获取指定制品的指令
openspec-cn instructions design --change add-dark-mode

# 获取 apply/实现指令
openspec-cn instructions apply --change add-dark-mode

# Get current archive operation inputs without archiving
openspec instructions archive --change add-dark-mode --json

# JSON for agent consumption
openspec instructions design --change add-dark-mode --json
```

**输出包含:**

- Template content for the artifact
- Project context from config
- Content from dependency artifacts
- Per-artifact rules from config
- Current project context and matching operation guidance for `apply`/`archive`

Operation inputs are read from the resolved repo or selected store on every
invocation. Project context is a required prompt-level input: agents read it and
apply relevant project facts, conventions, and constraints. Operation guidance is
optional additive advice: agents consider every entry and follow only entries that
are applicable and compatible with the built-in workflow. Both fields remain
separate from explicit user choices, CLI-controlled state, built-in instructions,
and artifact rules. Conflicting context is reported; conflicting or inapplicable
guidance is not followed and the reason is explained. These are behavioral
contracts for generated agents, not enforceable CLI checks. `instructions archive`
returns only the selected change, optional inputs, and root metadata; it does not
include the static archive workflow.

For an artifact skipped via `skip_specs: true`, the output is a warning only (JSON adds `skipped`/`warning` fields) — the artifact must not be created.

---

### `openspec-cn templates`

显示 schema 中所有制品的解析后模板路径。

```
openspec-cn templates [options]
```

**选项:**

| 选项 | 描述 |
|--------|-------------|
| `--schema <name>` | 要检查的 schema(默认:`spec-driven`) |
| `--json` | 以 JSON 输出 |

**示例:**

```bash
# 显示默认 schema 的模板路径
openspec-cn templates

# 显示自定义 schema 的模板
openspec-cn templates --schema my-workflow

# 供编程使用的 JSON
openspec-cn templates --json
```

**输出(文本):**

```
Schema: spec-driven

Templates:
  proposal  → ~/.openspec/schemas/spec-driven/templates/proposal.md
  specs     → ~/.openspec/schemas/spec-driven/templates/specs.md
  design    → ~/.openspec/schemas/spec-driven/templates/design.md
  tasks     → ~/.openspec/schemas/spec-driven/templates/tasks.md
```

---

### `openspec-cn schemas`

列出可用的工作流 schemas 及其描述与制品流程。

```
openspec-cn schemas [options]
```

**选项:**

| 选项 | 描述 |
|--------|-------------|
| `--json` | 以 JSON 输出 |
| `--store <id>` | 使用已注册的 store 作为 OpenSpec 根目录 |

**示例:**

```bash
openspec-cn schemas
```

**输出:**

```
Available schemas:

  spec-driven (package)
    The default spec-driven development workflow
    Flow: proposal → specs → design → tasks

  my-custom (project)
    Custom workflow for this project
    Flow: research → proposal → tasks
```

---

## Schema 命令

用于创建和管理自定义工作流 schemas 的命令。

### `openspec-cn schema init`

创建一个新的项目本地 schema。

```
openspec-cn schema init <name> [options]
```

**参数:**

| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `name` | 是 | schema 名称(kebab-case) |

**选项:**

| 选项 | 描述 |
|--------|-------------|
| `--description <text>` | schema 描述 |
| `--artifacts <list>` | 逗号分隔的制品 ID(默认:`proposal,specs,design,tasks`) |
| `--default` | 设为项目默认 schema |
| `--no-default` | 不提示设为默认 |
| `--force` | 覆盖已有 schema |
| `--json` | 以 JSON 输出 |

**示例:**

```bash
# 交互式创建 schema
openspec-cn schema init research-first

# 指定制品的非交互式创建
openspec-cn schema init rapid \
  --description "Rapid iteration workflow" \
  --artifacts "proposal,tasks" \
  --default
```

**创建内容:**

```
openspec/schemas/<name>/
├── schema.yaml           # schema 定义
└── templates/
    ├── proposal.md       # 每个制品的模板
    ├── specs.md
    ├── design.md
    └── tasks.md
```

---

### `openspec-cn schema fork`

复制一个已有 schema 到你的项目以做自定义。

```
openspec-cn schema fork <source> [name] [options]
```

**参数:**

| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `source` | 是 | 要复制的 schema |
| `name` | 否 | 新 schema 名称(默认:`<source>-custom`) |

**选项:**

| 选项 | 描述 |
|--------|-------------|
| `--force` | 覆盖已有的目标 |
| `--json` | 以 JSON 输出 |

**示例:**

```bash
# Fork 内置的 spec-driven schema
openspec-cn schema fork spec-driven my-workflow
```

---

### `openspec-cn schema validate`

验证一个 schema 的结构与模板。

```
openspec-cn schema validate [name] [options]
```

**参数:**

| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `name` | 否 | 要验证的 schema(省略则验证全部) |

**选项:**

| 选项 | 描述 |
|--------|-------------|
| `--verbose` | 显示详细的验证步骤 |
| `--json` | 以 JSON 输出 |

**示例:**

```bash
# 验证指定 schema
openspec-cn schema validate my-workflow

# 验证所有 schemas
openspec-cn schema validate
```

---

### `openspec-cn schema which`

显示某个 schema 从哪里解析而来(有助于调试优先级)。

```
openspec-cn schema which [name] [options]
```

**参数:**

| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `name` | 否 | schema 名称 |

**选项:**

| 选项 | 描述 |
|--------|-------------|
| `--all` | 列出所有 schema 及其来源 |
| `--json` | 以 JSON 输出 |

**示例:**

```bash
# 检查 schema 来自何处
openspec-cn schema which spec-driven
```

**输出:**

```
spec-driven resolves from: package
  Source: /usr/local/lib/node_modules/@fission-ai/openspec/schemas/spec-driven
```

**Schema 优先级:**

1. 项目:`openspec/schemas/<name>/`
2. 用户:`~/.local/share/openspec/schemas/<name>/`
3. 包:内置 schemas

---

## 配置命令

### `openspec-cn config`

查看并修改全局 OpenSpec 配置。

```
openspec-cn config <subcommand> [options]
```

**子命令:**

| 子命令 | 描述 |
|------------|-------------|
| `path` | 显示配置文件位置 |
| `list` | 显示所有当前设置 |
| `get <key>` | 获取特定值 |
| `set <key> <value>` | 设置一个值 |
| `unset <key>` | 移除一个键 |
| `reset` | 重置为默认值 |
| `edit` | 在 `$EDITOR` 中打开 |
| `profile [preset]` | 交互式或通过预设配置工作流 profile |

**示例:**

```bash
# 显示配置文件路径
openspec-cn config path

# 列出所有设置
openspec-cn config list

# 获取特定值
openspec-cn config get telemetry.enabled

# Set a value (disable anonymous usage telemetry)
openspec config set telemetry.enabled false

# 显式设置字符串值
openspec-cn config set user.name "My Name" --string

# 移除自定义设置
openspec-cn config unset user.name

# Set a machine-level default store (fallback root when no --store,
# local root, or project store: pointer resolves)
openspec config set defaultStore team-plans

# Reset all configuration
openspec config reset --all --yes

# 在编辑器中编辑配置
openspec-cn config edit

# 用基于动作的向导配置 profile
openspec-cn config profile

# 快速预设:将工作流切换到 core(保留交付模式)
openspec-cn config profile core
```

**Telemetry opt-out:** `telemetry.enabled` defaults to on when unset (opt-out model).
Set it to `false` to disable anonymous usage stats and the `openspec update` version check.
Environment variables take precedence over config: `OPENSPEC_TELEMETRY=0`, `DO_NOT_TRACK=1`,
and a truthy `CI` value (e.g. `true`/`1`/`yes`) always disable telemetry regardless of the config value.

`openspec-cn config profile` 以一个当前状态摘要开始,然后让你选择:
- 修改交付方式 + 工作流
- 仅修改交付方式
- 仅修改工作流
- 保留当前设置(退出)

若保留当前设置,则不写入任何更改,也不显示更新提示。
若没有配置更改但当前项目文件与你的全局 profile/交付方式不同步,OpenSpec 会显示警告并建议使用 `openspec-cn update`。
按 `Ctrl+C` 也会干净地取消流程(无堆栈跟踪)并以退出码 `130` 退出。在 workflow 清单中,`[x]` 表示工作流已在全局配置中选中。要将这些选择应用到项目文件,运行 `openspec-cn update`(或在项目内被提示时选择 `Apply changes to this project now?`)。

**交互式示例:**

```bash
# 仅更新交付方式
openspec-cn config profile
# 选择: Change delivery only
# 选择交付方式: Skills only

# 仅更新工作流
openspec-cn config profile
# 选择: Change workflows only
# 在清单中切换工作流,然后确认
```

---

## 实用工具命令

### `openspec-cn feedback`

提交关于 OpenSpec 的反馈。创建一个 GitHub issue。

```
openspec-cn feedback <message> [options]
```

**参数:**

| 参数 | 是否必填 | 描述 |
|----------|----------|-------------|
| `message` | 是 | 反馈摘要；长文本会在 Issue 标题中缩短，并在正文中保留 |

**选项:**

| 选项 | 描述 |
|--------|-------------|
| `--body <text>` | 附加在摘要之后的详细内容 |

**要求:** 必须安装并已认证 GitHub CLI(`gh`)。

**示例:**

```bash
openspec-cn feedback "Add support for custom artifact types" \
  --body "I'd like to define my own artifact types beyond the built-in ones."
```

---

### `openspec-cn completion`

管理 OpenSpec CLI 的 shell 补全。

```
openspec-cn completion <subcommand> [shell]
```

**子命令:**

| 子命令 | 描述 |
|------------|-------------|
| `generate [shell]` | 将补全脚本输出到 stdout |
| `install [shell]` | 为你的 shell 安装补全 |
| `uninstall [shell]` | 移除已安装的补全 |

**支持的 shell:** `bash`, `zsh`, `fish`, `powershell`

**示例:**

```bash
# 安装补全(自动检测 shell)
openspec-cn completion install

# 为指定 shell 安装
openspec-cn completion install zsh

# 生成脚本以手动安装(bash)
openspec-cn completion generate bash > ~/.bash_completion.d/openspec

# 卸载
openspec-cn completion uninstall
```

**Windows (PowerShell):** Install completions for the current PowerShell host:

```powershell
$env:PROFILE = $PROFILE
openspec completion install powershell
. $PROFILE
```

`$env:PROFILE` tells OpenSpec which profile to configure in this session. The
installer creates missing profile directories and adds a managed block that loads
`OpenSpecCompletion.ps1`. Reloading the profile enables completions immediately.

To uninstall from the current host, run:

```powershell
$env:PROFILE = $PROFILE
openspec completion uninstall powershell
```

Restart PowerShell after uninstalling to clear completions from the current session.

Completions are opt-in. The CLI mentions them once, on stderr, the first time you
run a command in an interactive terminal, and never again — it also stays quiet
if you already have completions installed. Set `OPENSPEC_NO_COMPLETIONS=1` to
suppress that tip entirely.

---

## 退出码

| 码 | 含义 |
|------|---------|
| `0` | 成功 |
| `1` | 错误(验证失败、文件缺失等) |

---

## 环境变量

| 变量 | 描述 |
|----------|-------------|
| `OPENSPEC_TELEMETRY` | Set to `0` to disable telemetry and the `openspec update` version check (overrides `telemetry.enabled` in global config) |
| `DO_NOT_TRACK` | Set to `1` to disable telemetry and the `openspec update` version check (standard DNT signal; overrides config) |
| `OPENSPEC_CONCURRENCY` | Default concurrency for bulk validation (default: 6) |
| `EDITOR` or `VISUAL` | Editor for `openspec config edit` |
| `NO_COLOR` | Disable color output when set |
| `OPENSPEC_NO_ANIMATION` | Disable the `openspec init` welcome animation when set |
| `OPENSPEC_NO_COMPLETIONS` | Set to `1` to suppress the one-time tip about shell completions |
| `OPENSPEC_NO_UPDATE_CHECK` | Disable the `openspec update` check for a newer published CLI when set (any value, including empty). Also skipped when `CI` is set (unless `false`/`0`/`no`/`off`) or `NODE_ENV=test` |
| `npm_config_registry` | Registry the `openspec update` version check asks. Must be an `http(s)` URL or it falls back to `https://registry.npmjs.org`. No `.npmrc` file is read |

---

## 相关文档

- [Commands](commands.md) - AI slash command(`/opsx:propose`、`/opsx:apply` 等)
- [Workflows](workflows.md) - 常见模式以及何时使用各命令
- [Customization](customization.md) - 创建自定义 schemas 与模板
- [Getting Started](getting-started.md) - 首次设置指南
