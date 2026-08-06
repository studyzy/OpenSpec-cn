# Stores：把规划放在它自己的仓库里

> **Beta。** Stores、references、工作上下文和 worksets 都是新功能。命令名、标志、文件格式和 JSON 输出仍可能在版本之间改变形态。下面的每个演练都针对当前构建运行过，但升级后请重新阅读本指南。

## 它解决的问题

OpenSpec 通常活在一个代码仓库内部：代码旁边的一个 `openspec/` 文件夹，保存着该仓库的 specs 和 changes。

一旦你的规划大到超出单个仓库，这就不再适用了：

- 你的工作横跨多个仓库 —— 一个功能同时触碰 API 服务器、Web 应用和一个共享库。这个计划该放在谁的 `openspec/` 文件夹里？
- 你的团队在代码存在之前就做规划，或者规划那些永远不会变成*这个*仓库里代码的东西。
- 需求由一个团队拥有、被其他团队消费。Wiki 版本会漂移，而你的编码 Agent 反正也读不了它。

**Store** 就是答案：一个独立仓库，唯一职责就是规划。它有着你已经熟悉的同一个 `openspec/` 形态 —— specs 和 changes —— 外加一个小的身份文件。你在自己的机器上按名字注册它一次，之后每个普通的 OpenSpec 命令都能在任意位置作用于它。

## 形态

```
            team-plans  (一个 store：规划在它自己的仓库里)
            ├── .openspec-store/store.yaml     identity: "I am team-plans"
            └── openspec/
                ├── specs/      what is true
                └── changes/    what is in motion
                      ▲
                      │ 按名字在每台机器上注册；
                      │ 像普通仓库一样通过 push/clone 共享
        ┌─────────────┼─────────────┐
        │             │             │
    web-app       api-server     mobile-app
   (code repo)   (code repo)    (code repo)
```

两条规则让它保持简单：

1. **Store 就是一个 git 仓库。** 你自己在上面提交、push、pull、审查。OpenSpec 永远不会自己 clone、sync 或 push 任何东西。
2. **是声明，而非机制。** 仓库可以*声明*它们和 store 的关系（如下所示）。声明改变的是 OpenSpec 能告诉你的东西 —— 绝不是你的命令会在哪里生效。

## 五分钟创建你的第一个 store

两条命令就能让你从零拥有一个可工作的、store 作用域内的变更：

```bash
openspec-cn store setup team-plans --path ~/openspec/team-plans
```

```
Store ready: team-plans
Location: /Users/you/openspec/team-plans
OpenSpec root: ready
Registry: registered

Next: run normal OpenSpec commands against this store, for example:
  openspec-cn new change <change-id> --store team-plans
Share this store by committing and pushing it like any Git repo.
```

```bash
openspec-cn new change add-login --store team-plans
```

```
Using OpenSpec root: team-plans (/Users/you/openspec/team-plans)
Created change 'add-login' at /Users/you/openspec/team-plans/openspec/changes/add-login/
Schema: spec-driven
Next: openspec-cn status --change add-login --store team-plans
```

这就是整个模型。从这里开始，生命周期和你已知的完全一致 —— `status`、`instructions`、`validate`、`archive` —— 只是每条命令都带上 `--store team-plans`，而且每个打印出的提示都会为你带上该标志。`Using OpenSpec root:` 这一行总会告诉你命令正在作用于哪里。

## 故事：一个团队，一个规划仓库

一个团队把它的 specs 和 changes 放在 `team-plans` 里，而不是散落在各个代码仓库中。

**第一天（搭建的人）：**

```bash
openspec-cn store setup team-plans --path ~/openspec/team-plans \
  --remote git@github.com:acme/team-plans.git
git -C ~/openspec/team-plans push -u origin main
```

传入 `--remote` 会把 clone URL 记录在 store 自己的身份文件（`.openspec-store/store.yaml`）里，位于初始提交中。未来每一次 clone 一开始就知道自己从哪来，于是健康检查和错误消息能为还没有它的队友打印出完整、可直接粘贴的修复命令。

**每个队友（每台机器一次）：**

```bash
git clone git@github.com:acme/team-plans.git ~/openspec/team-plans
openspec-cn store register ~/openspec/team-plans
```

从那以后，每个人按名字在同一个规划仓库里工作：

```bash
openspec-cn status --store team-plans --change add-login
openspec-cn show add-login --store team-plans
```

**共享工作就是 git，这是有意为之。** 你创建的变更只存在于你的 checkout 里，直到你提交并 push 它 —— 和代码一样。计划免费获得分支、pull request 和审查，因为 store 就是一个普通仓库。

**连接团队的代码仓库。** 一个规划被完全外部化的代码仓库，只需要在 `openspec/config.yaml` 里加一行：

```yaml
# web-app/openspec/config.yaml
store: team-plans
```

现在在 `web-app` 里运行的每个 OpenSpec 命令都会作用于 `team-plans`，完全不需要任何标志：

```bash
cd ~/src/web-app
openspec-cn status --change add-login
```

```
Using OpenSpec root: team-plans (/Users/you/openspec/team-plans)
...
```

这个指针是兜底，绝不是覆盖：显式的 `--store` 永远优先；如果仓库自己长出了真正的规划文件夹，那些优先（并附一条警告，提示移除过时的指针）。

**One default for every repo on your machine.** If you work across many
code repos that all plan into the same store, set it once, globally,
instead of adding the `store:` line to each repo:

```bash
openspec config set defaultStore team-plans
```

Now any command run outside a planning root — and with no `--store` and no
project pointer — resolves to `team-plans`. It sits at the bottom of the
precedence list, so `--store`, a local root, and a project `store:` pointer
all still win. The root banner and JSON `root` block report
`source: "global_default"` with the store id, so you can always tell a
machine-wide default from a repo's own pointer. Clear it with
`openspec config unset defaultStore`. If the id is not registered, commands
error and tell you to register it or clear the stale default.

## Example: one feature, two component repos

Suppose `add-checkout-promo` changes both `checkout-api` and
`checkout-web`. The team wants one shared product contract, while each code
repo still needs its own implementation tasks, branch, and review.

Use two layers:

1. Keep the shared behavior in `team-plans`.
2. Keep implementation plans in each component repo and reference the store
   as read-only upstream context.

First, plan the shared contract in the store:

```bash
openspec new change add-checkout-promo --store team-plans
openspec status --change add-checkout-promo --store team-plans
```

The proposal and specs should describe the behavior at the boundary between
the components — for example, the promotion fields returned by the service
and how the frontend handles an ineligible checkout. Review this change in
the store repo like any other branch and pull request.

### What context does planning see?

Selecting a store changes the OpenSpec root; it does not discover or read
every code repo that uses that store. Store instructions see the artifacts
and configured context in the store. They see component code only when those
folders are also available to the agent or editor and the agent reads them.

A workset is a convenient way to open the planning store and both code repos
together:

```bash
openspec workset create checkout-promo \
  --member ~/openspec/team-plans \
  --member ~/src/checkout-api \
  --member ~/src/checkout-web \
  --tool code
openspec workset open checkout-promo
```

This makes the folders visible in one IDE workspace. It does not copy source
context into the store, select affected repos, or grant an agent permission
to edit them. Put durable cross-component facts in the shared specs; do not
rely on a planner remembering source it happened to inspect.

### How does implementation start in each repo?

When no explicit `--store` or nearer `openspec/` root applies, a
`store: team-plans` pointer routes commands to that store. It does not split
one store task list by the directory from which `apply` was invoked. OpenSpec
currently does not route tasks to repos.

When each component needs an independently scoped apply/review cycle, give it
a local OpenSpec root and reference the central store instead of pointing at
it:

```yaml
# checkout-api/openspec/config.yaml (and likewise in checkout-web)
schema: spec-driven
references:
  - team-plans
```

After the shared contract is approved and available in the store's main
specs, create a small local change for the component's part:

```bash
cd ~/src/checkout-api
openspec new change implement-checkout-promo-api

cd ~/src/checkout-web
openspec new change implement-checkout-promo-ui
```

The reference index in each repo's instructions supplies the store spec's
summary and exact `openspec show ... --store team-plans` fetch command. Each
local proposal cites that shared contract, and its tasks describe only work
in that component. Then run `/opsx:apply` in each repo separately; root
resolution keeps the artifacts and implementation edits scoped to that repo.
The service and frontend changes can now be tested, reviewed, merged, and
archived independently.

If implementation must begin while the shared store change is still active,
fetch it explicitly with
`openspec show add-checkout-promo --store team-plans`; reference indexes list
canonical store specs, not active store changes. Keep the store branch and
component branches linked in their pull-request descriptions so reviewers
can see which version of the contract each implementation follows.

## 故事：跨越团队界线的需求

一个平台团队拥有需求。产品团队基于这些需求，在它们自己的仓库里、用它们自己的设计来构建。一个 reference 描述这种关系，而不移动任何人的工作。

```
   platform-reqs (store)                 api-server (code repo)
   owned by the platform team            owned by a product team
   ┌──────────────────────────┐          ┌──────────────────────────┐
   │ openspec/specs/          │ ◀────────│ openspec/config.yaml     │
   │   payments/spec.md       │ reads    │   references:            │
   │   auth/spec.md           │          │     - platform-reqs      │
   │                          │          │ openspec/specs/          │
   │ openspec/changes/        │          │   (their own designs)    │
   │   platform work          │          │ openspec/changes/        │
   │                          │          │   (their own work)       │
   │                          │          └──────────────────────────┘
   └──────────────────────────┘
```

**产品团队在它仓库的 `openspec/config.yaml` 里声明它依赖什么：**

```yaml
references:
  - platform-reqs
```

References 是只读上下文。仓库保留它自己的 `openspec/` 根；工作留在那里。变化在于：那个仓库里的 `openspec-cn instructions` 现在会包含被引用 store 的 specs 索引 —— 每条带一行摘要和精确的 fetch 命令（`openspec-cn show <spec-id> --type spec --store platform-reqs`）。在 `api-server` 里工作的 Agent 能找到上游的支付需求、引用它们，并在这个仓库自己的根里写它的底层设计 —— 而不需要任何人到处粘贴上下文。

一个 reference 可以携带它的 clone 来源，这样还没有这个 store 的队友会得到完整的修复方案，而不是死路一条：

```yaml
references:
  - { id: platform-reqs, remote: "git@github.com:acme/platform-reqs.git" }
```

**当你想把计划和代码一起打开时，做一个 workset。** 这是个人化且显式的：每个人选择他们在自己机器上实际一起工作的文件夹。这些本地 checkout 路径的信息都不会被提交到共享规划仓库。

```bash
openspec-cn workset create platform \
  --member ~/openspec/platform-reqs \
  --member ~/src/api-server \
  --member ~/src/web-app
```

## 你随时能问的两个问题

**"我的环境健康吗？"** —— `openspec-cn doctor` 检查当前根目录及其引用的 stores，只读，每个发现都附带可粘贴的修复命令：

```
Doctor

Root
  Location: /Users/you/src/api-server
  OpenSpec root: ok

References
  - platform-reqs: ok (/Users/you/openspec/platform-reqs)
  - design-system: Referenced store 'design-system' is not registered on this machine.
    Fix: git clone -- git@github.com:acme/design-system.git '/Users/you/openspec/design-system' && openspec-cn store register '/Users/you/openspec/design-system' --id design-system

```

**"我在和什么一起工作？"** —— `openspec-cn context` 从 OpenSpec 声明中拼出工作集：根目录和它引用的 stores。

```
Working context for api-server (/Users/you/src/api-server)

OpenSpec root
  api-server  /Users/you/src/api-server

Referenced stores
  platform-reqs  /Users/you/openspec/platform-reqs
    Fetch: openspec-cn show <spec-id> --type spec --store platform-reqs
```

两者都支持 `--json` 供 Agent 使用。`openspec-cn context --code-workspace <path>` 额外写入一个包含整个集合的 VS Code workspace 文件 —— 这是该命令执行的唯一写入操作。

## Worksets：重新打开你一起工作的文件夹

与上述所有都独立：大多数人每个会话都会一起打开同样几个文件夹 —— 规划仓库加上两三个代码仓库。一个 **workset** 正是这个的个人化、有名字的视图，用一条命令在你选择的工具里重新打开。

```
  workset "platform"                 openspec-cn workset open platform
  ├── team-plans   ~/openspec/team-plans         │
  ├── api-server   ~/src/api-server              ▼
  └── web-app      ~/src/web-app       all three open in your tool
```

```bash
openspec-cn workset create platform \
  --member ~/openspec/team-plans --member ~/src/api-server \
  --tool code
openspec-cn workset list
```

```
platform  (opens in VS Code)
  team-plans  /Users/you/openspec/team-plans
  api-server  /Users/you/src/api-server
```

`openspec-cn workset open platform` 随后启动保存的工具：编辑器（VS Code、Cursor）打开一个包含所有成员的窗口并返回。第一个成员是主成员。随时用 `--tool <id>` 覆盖工具。

Worksets 刻意*不是*共享状态。它们活在你的机器上，从不被提交，也不对工作内容做任何声明 —— 它们只记录你喜欢一起打开什么。移除一个绝不会触碰成员文件夹。新工具是配置而非代码：任何通过 workspace 文件或按文件夹 attach 标志启动的工具，都可以加到全局配置的 `openers` 键下（`openspec-cn config edit`）。

## 命令如何决定在哪里生效

每个普通命令以相同的方式、按以下顺序解析它的根：

```
1. --store <id>          you said so explicitly        → that store
2. nearest openspec/     a real planning root here     → this repo
   (walking up from cwd)
3. store: pointer        config.yaml declares a store  → that store
4. defaultStore          global config sets a machine  → that store
                         default
5. none of the above     stores registered on this     → error with a
                         machine?                        selection hint
                         no stores registered?         → the current
                                                          directory
                                                          (classic behavior)
```

`Using OpenSpec root:` 这一行（以及 `--json` 输出里的 `root` 块）会告诉你命中的是哪种情况。

## 已知限制

- **Beta 形态。** 本页上的任何东西都可能在版本之间改变 —— 名字、标志、文件格式、JSON 键。
- **每台机器每个 store id 一个 checkout。** 用同一个 id 注册第二个 checkout 会失败，并提示先 `store unregister`。
- **绝不 sync，这是设计使然。** OpenSpec 永不 clone、pull 或 push。一个过时的 checkout 会一直显示陈旧 specs，直到*你* pull；references 是从磁盘上任何现存内容实时索引的。
- **空的规划文件夹可以缺失。** 一个新的 store 可能还没有 `openspec/changes/`、`openspec/specs/` 或 `openspec/changes/archive/`。这在 beta 期间是被接受的；这些文件夹会在普通命令为其创建文件时自行出现。
- **指针仓库保持指针身份。** 一个 `openspec/config.yaml` 声明了 `store: <id>` 的仅配置仓库，被视为外部化规划，而非可注册的 store checkout。如果你有意想把这个仓库转成本地 store 根，先移除 `store:` 这一行。
- **有些命令留在原地。** `view`、`templates`、`schemas`，以及已废弃的名词形式（`openspec-cn change show`，...）只作用于当前目录 —— 没有 `--store`。
- **每机器状态就是每机器的。** store 注册表和 worksets 都是本地设置。你机器上的任何布局信息都不会被提交到共享规划中。
- **Worksets 有两种启动方式。** 一个无法用 workspace 文件或按文件夹 attach 标志启动的工具，不能被加为 opener。
- **Agent JSON 有一个已知的命名大小写分裂**（store 系列键是 snake_case，工作流系列是 camelCase）。记录在 [agent 契约](../agent-contract.md)；统一它延后到带版本号的发布。

## 各文件在哪

| 什么 | 在哪 | 共享？ |
|---|---|---|
| 一个 store 的规划 | `<store>/openspec/`（specs、changes） | 是 —— 提交并 push 它 |
| 一个 store 的身份 | `<store>/.openspec-store/store.yaml` | 是 —— 随 store 一起提交 |
| Store 注册表 | `<data dir>/openspec/stores/registry.yaml` | 否 —— 仅本机 |
| Worksets | `<data dir>/openspec/worksets/` | 否 —— 仅本机 |

`<data dir>` 在 macOS 和 Linux 上是 `~/.local/share/openspec`（若设置了则是 `$XDG_DATA_HOME/openspec`），在 Windows 上是 `%LOCALAPPDATA%\openspec`。

## 参考

本页上每个命令的确切标志和 JSON 结构：[CLI 参考](../cli.md)（Stores、Doctor、工作上下文、个人 worksets）以及 [agent 契约](../agent-contract.md)。
