# Stores (beta)

> 规划跨越多个仓库的变更：一个 store，多个仓库。

OpenSpec 通常住在单个仓库里：一个 `openspec/` 文件夹，紧挨着它所规划的代码。store 把这个文件夹搬进一个独立的仓库，多个代码仓库可以共享它。

在每台机器上完成一次性设置后，`status`、`new change`、`archive` 等命令就能从任何目录作用于 store。

```
         team-plans  (a store: OpenSpec in its own repo)
         ├── .openspec-store/store.yaml   the store's name
         └── openspec/
             ├── specs/
             └── changes/
                   ▲
                   │ set up once on each machine,
                   │ shared by pushing and cloning like any repo
     ┌─────────────┼─────────────┐
     │             │             │
 web-app       api-server     mobile-app
(code repo)   (code repo)    (code repo)
```

你和分享代码一样用 git 分享 store：自己提交、推送、拉取并评审。Specs 和 changes 和代码一样获得分支和 pull request。

<a id="when-you-need-one"></a>

## 何时需要 store

用 store 的两个常见理由：

- **前后端分属不同仓库**：一个功能同时触及两者，计划需要单一归属，而不是两半。

  ```
        shop-plans  (store)
        └── openspec/changes/add-discounts/    one plan for the feature
                  ▲
        ┌─────────┴─────────┐
        │                   │
    storefront             api
  (frontend repo)     (backend repo)
  ```

- **一个产品，多个客户端仓库**：Android、iOS 和 Web 从各自的仓库发布，但共享同一份预期行为。Spec 描述的是行为而不是实现，所以一份 spec 服务三者。

  ```
          product-specs  (store)
          └── openspec/specs/checkout/spec.md    the expected behavior
                    ▲
      ┌─────────────┼─────────────┐
      │             │             │
  android-app    ios-app       web-app
  (code repo)   (code repo)   (code repo)
  ```

你可以有不止一个 store，不过我们建议数量尽量少。

<a id="set-up-a-store"></a>

## 设置一个 store

一个人创建 store，其他人加入它。

1. **创建 store**（一个人，每个团队一次）。运行 `openspec-cn store setup` 并回答提示：

   ```bash
   # 从任何位置运行；它会询问创建什么以及在哪里
   openspec-cn store setup
   ```
   
   它会问三个问题：
   
   - **Store name**：`team-plans`
   - **Where should this store live?**：预填为 `~/openspec/<name>`，按 Enter 接受，或输入其他路径
   - **Create this store?**：展示它将要创建的内容，回答 `Yes`
   
   然后它报告创建了什么：
   
   ```yaml
   Store ready: team-plans
   Location: ~/openspec/team-plans
   OpenSpec root: ready
   Registry: registered
   
   Next: run normal OpenSpec commands against this store, for example:
     openspec-cn new change <change-id> --store team-plans
   Share this store by committing and pushing it like any Git repo.
   ```

2. **把它推送到你的 git 托管平台。** 先在托管平台创建一个空的 `team-plans` 仓库。Setup 不会添加 git remote，所以把 store 连到那个仓库，然后推送：

   ```bash
   # 把 store 连到你 git 托管平台上的空仓库
   cd ~/openspec/team-plans
   git remote add origin git@github.com:acme/team-plans.git

   # 发布它
   git push -u origin main
   ```
   
3. **加入 store**（每个团队成员，每台机器一次）：
   
   ```bash
   # 把 store 弄到你机器上
   git clone git@github.com:acme/team-plans.git ~/openspec/team-plans
   
   # 告诉 OpenSpec 它在哪里
   openspec-cn store register ~/openspec/team-plans
   ```

   ```yaml
   Store registered: team-plans
   Location: /Users/you/openspec/team-plans
   OpenSpec root: ready
   Registry: registered
   ```
   
   注册告诉你的机器这个 store 在哪里。store 的名字已经提交在它内部，位于 `.openspec-store/store.yaml`。Setup 注册了创建者的副本，所以只有克隆的副本需要这一步。
   
4. **确认生效**，从任何目录：
   
   ```bash
   # 任何 OpenSpec 命令都可以按名字到达 store
   openspec-cn status --store team-plans
   ```

   ```yaml
   Using OpenSpec root: team-plans (/Users/you/openspec/team-plans)
   No active changes. Create one with: openspec-cn new change <name> --store team-plans
   ```
   
## 设置类型

OpenSpec 有三种设置。本页其余部分使用这些名字：

- **repo-local**：OpenSpec 在你的仓库里，没有 store。默认。
- **store-only**：你的仓库不保留自己的 specs 或 changes。一切都住在 store 里。
- **store-optional**：你的项目有自己的 `openspec/` 文件夹，并且在你要求时也能到达 store。

### 默认：OpenSpec 在仓库内（`repo-local`）

`openspec-cn init` 在你的代码旁放一个 `openspec/` 文件夹，那个仓库的 specs 和 changes 住在那里。不涉及任何 store。这是 [设置你的项目](../start/setup.md) 教的设置，大多数项目永远不需要别的。

```
web-app  (code repo)
└── openspec/
    ├── specs/
    └── changes/
```

### OpenSpec 在仓库外，在 store 中（`store-only`）

仓库不保留自己的 specs 或 changes。它规划的一切都住在 store 里，仓库配置中的一行把它们连起来。

常见于一个团队构建所有仓库并集中规划的场景。上面的[示例](#when-you-need-one)都是这种形态。

```
team-plans  (store)
└── openspec/
    ├── specs/       the repo's specs live here
    └── changes/     its changes too
          ▲
          │ store: team-plans   (the connecting line)
web-app  (code repo)
└── openspec/
    └── config.yaml    nothing else
```

### OpenSpec 同时在仓库和 store 中（`store-optional`）

仓库为自己的工作保持 repo-local，同时 store 承载共享的 specs 和 changes。在仓库内，OpenSpec 使用你项目的 `openspec/` 文件夹，只有当你传 `--store` 时才到达 store。

常见于一个仓库在 store 出现之前就用 OpenSpec，或一个基本独立的仓库只是偶尔触碰共享工作。

```
team-plans  (store)
└── openspec/          the shared specs and changes
          ▲
          │ only when you pass --store team-plans
web-app  (code repo)
└── openspec/          this repo's own
    ├── config.yaml
    ├── specs/
    └── changes/
```

一个仓库可以先 repo-local，之后再把它 specs 和 changes 移入 store。[把仓库的 specs 和 changes 移入 store](#move-a-repos-specs-and-changes-into-the-store) 说明了怎么做。

<a id="where-artifacts-get-created-when-using-stores"></a>

## 使用 store 时制品在哪里创建

当你使用 store 时，OpenSpec 还必须决定制品在哪里创建。这取决于你的设置：

- **store-only**（你的项目只写入 store）：每个制品都在 store 中创建。下面的 `store:` 行记录这一点。
- **store-optional**（你的项目有自己的 `openspec/` 文件夹，同时也用 store）：制品在你的项目中创建，除非你在请求中指名 store，或为那个变更传 `--store`。然后你的 Agent 会在工作流的其余部分带着这个标志。

OpenSpec 把制品写入两个地方之一：你项目的 `openspec/` 文件夹，或 store 的。它按这个顺序选择，第一个适用的选项胜出：

1. **命令上的 `--store <id>`。** 永远胜出，从任何目录。
2. **你项目的 `openspec/` 文件夹。** 如果你的项目有自己的 `specs/` 或 `changes/` 文件夹，OpenSpec 使用它们。
3. **你项目里的 `store:` 行。** store-only 项目记录其 store 的方式。
4. **你机器上的 `defaultStore`。** 以上都不适用时的回退。

无论哪项生效，OpenSpec 的第一行输出都会说出它操作的文件夹（`Using OpenSpec root: ...`）。确切的规则，包括各种错误情况，见 [配置 › Stores](../reference/configuration/stores.md)。

### `store:` 那一行（store-only 项目）

在你的项目 `openspec/config.yaml` 中添加一行：

```yaml
# web-app/openspec/config.yaml
store: team-plans
```

现在你在项目里运行的一切都使用这个 store，不用敲任何标志：

```bash
# 在 web-app 内部，已连接
openspec-cn status
```

```yaml
Using OpenSpec root: team-plans (/Users/you/openspec/team-plans)
No active changes. Create one with: openspec-cn new change <name> --store team-plans
```

- **没有这一行**：在 store-only 项目里运行一条普通命令，OpenSpec 会带着列出你已注册 stores 的错误停下来。
- **提交它**：克隆你项目的队友也会拿到这一行。他们仍需要在各自机器上注册 store（[设置一个 store 的第 3 步](#set-up-a-store)），否则 OpenSpec 会报错并让他们注册。
- **和真实文件夹并列**：如果你的项目也有 `specs/` 或 `changes/` 文件夹，OpenSpec 使用那些并忽略这一行，同时给出警告。

### 你机器上的 `defaultStore`

如果你工作的每个项目都用同一个 store，设置一次即可。当 OpenSpec 找不到标志、找不到本地 `openspec/` 文件夹、也找不到 `store:` 行时，就会回退到它：

```bash
# 每当没有其他东西指名 store 时，使用 team-plans
openspec-cn config set defaultStore team-plans

# 撤销它
openspec-cn config unset defaultStore
```

**保持本地的命令。** `init`、`update`、`templates`、`schemas` 以及 `openspec-cn schema` 子命令只作用于当前目录，不接受 `--store`。

<a id="move-a-repos-specs-and-changes-into-the-store"></a>

## 把仓库的 specs 和 changes 移入 store

要把一个仓库从 repo-local 变为 store-only：

1. 把仓库 `openspec/specs/` 和 `openspec/changes/` 中的一切，移入 store 里相同的文件夹。
2. 删除现在为空的文件夹，让仓库的 `openspec/` 文件夹只保留 `config.yaml`。
3. 把 `store:` 行加进那个 `config.yaml`。

仓库内的 `openspec-cn status` 现在会以 `Using OpenSpec root: team-plans` 开头。

## 在 store 中工作

工作流不会变，无论对你还是对你的 Agent。Propose、apply 和 archive 按它们一直以来的方式运行。唯一的不同是制品在哪里创建，[上面的章节](#where-artifacts-get-created-when-using-stores) 覆盖了这一点。

在 store-only 仓库内部创建一个变更，它会落进 store：

```bash
# 在 web-app 内部；store: 行把它路由到 team-plans
openspec-cn new change add-login
```

```yaml
Using OpenSpec root: team-plans (/Users/you/openspec/team-plans)
Created change 'add-login' at /Users/you/openspec/team-plans/openspec/changes/add-login/
Schema: spec-driven
Next: openspec-cn status --change add-login --store team-plans
```

- **它去了哪里**：进了 store 仓库，而不是你的代码旁边。
- **分享它**：在你提交并推送 store 仓库之前，这个变更只存在于你的 checkout 里。队友拉取时才能看到。工作流写出的每个制品都一样。
- **文档中的路径**：无论文档在哪里展示 `openspec/` 路径，在 store 设置中那个文件夹就是 store 的。

当制品创建到了你意料之外的地方，`openspec-cn doctor` 会在不改动任何东西的情况下检查你的设置，并为每个发现打印一条修复：

```bash
# 检查当前根目录及其 stores
openspec-cn doctor
```

```yaml
Doctor

Root
  Location: /Users/you/openspec/team-plans
  OpenSpec root: ok
  Store: team-plans (metadata ok)

References
  (none declared)
```

`openspec-cn context` 列出你当前目录所配合的根目录和 stores，当你想看到同样的画面但不需要这些检查时。

要在同一个编辑器窗口打开 store 和一个仓库，让你的 Agent 能同时读到两者，见 [Worksets (beta)](worksets.md)。

## 从另一个 store 读取 specs

你的仓库可以保留自己的 `openspec/` 文件夹，同时仍让你的 Agent 读取另一个 store 的 specs。在那个仓库的 `openspec/config.yaml` 的 `references:` 下声明那个 store：

```yaml
# api-server/openspec/config.yaml
references:
  - team-plans
```

References 是只读的。你的工作留在你的仓库里，reference 只改变你的 Agent 被告知的内容。

当工作流创建一个制品时，它的指令会获得被引用 store 的 specs 索引，每个 spec 带一行摘要和获取它的确切命令：

```xml
<referenced_stores>
<!-- Read-only upstream context. Fetch what you need; cite what you use. -->
Store team-plans (/Users/you/openspec/team-plans):
  - payments: Rules for charging and refunding customers.
  Fetch: openspec-cn show <spec-id> --type spec --store team-plans
</referenced_stores>
```

reference 也可以携带 store 的克隆 URL，供还没有那个 store 的机器使用：

```yaml
references:
  - team-plans
  - { id: design-system, remote: "git@github.com:acme/design-system.git" }
```

声明 URL 后，`openspec-cn doctor` 会把缺失的 store 变成一条可粘贴的修复：

```yaml
# output wrapped to fit
References
  - team-plans: ok (/Users/you/openspec/team-plans)
  - design-system: Referenced store 'design-system' is not registered on this machine.
    Fix: git clone -- git@github.com:acme/design-system.git '/Users/you/openspec/design-system' &&
         openspec-cn store register '/Users/you/openspec/design-system' --id design-system
```

## Beta 限制

- **形态可能改变**：命令名、标志和文件格式会在版本之间变化。升级后重新阅读本页。
- **按设计不同步**：OpenSpec 从不克隆、拉取或推送。过期的 checkout 会显示过期的 specs，直到你拉取；references 从磁盘上现有的内容读取。
- **每个 store 名字只有一个 checkout**：在已注册的名字下注册第二个文件夹会失败，并提示先运行 `openspec-cn store unregister`。
