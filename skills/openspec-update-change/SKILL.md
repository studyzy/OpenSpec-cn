---
name: openspec-update-change
description: 修订 OpenSpec 变更的现有规划制品并保持它们之间的一致。当用户想修订变更的计划、将新决定纳入其中，或在编辑后调和其制品时使用。也在用户说 "openspec update change" 或 "opsx update" 时使用。若用户指的是 openspec update CLI 命令（刷新生成的文件），请改为运行该命令。绝不要编辑代码。
allowed-tools: Bash(openspec-cn:*)
license: MIT
compatibility: 需要 openspec-cn CLI。
metadata:
  author: openspec
  version: "1.0"
---

修订变更的现有规划制品并保持它们之间一致。绝不要编辑代码。

**存储选择：** 若用户指定了一个存储（存储是注册在本机上的独立 OpenSpec 仓库）或工作位于某个存储中，请运行 `openspec-cn store list --json` 发现已注册的存储 ID，然后在读写 spec 和变更的命令上传递 `--store <id>`（`new change`、`status`、`instructions`、`list`、`show`、`validate`、`archive`、`doctor`、`context`、`schemas`、`view`）。选定后，将 `--store <id>` 视为在当前工作流其余部分中固定不变。以下每个未限定范围的命令示例均为简写形式：运行前请追加该标志。例如，运行 `openspec-cn status --change "<name>" --json --store "<id>"`，而非下面展示的未限定形式。其他命令不接受此标志。命令输出的提示已包含该标志；在后续操作中请保留它。若不指定存储，命令将对最近的本地 `openspec/` 根目录生效。

**项目检查：** 以下步骤期望项目已经在使用 OpenSpec。在第一个会写入任何内容的步骤之前（`new change`、`archive`、`sync specs`，或撰写任何产出物文件），确认项目已有根目录：运行 `openspec-cn list --json`（当选择了 store 时加上 `--store <id>`，因为此时 store 就是根目录），并读取 `root`。root 是一个对象表示项目已配置好。`"root": null` 表示尚未配置 —— 这里没有 `openspec/` 目录，而像 `openspec-cn new change` 这样的写入操作会作为副作用创建它。该命令还会以非零状态退出，这是它给出的答案而不是 CLI 坏了，因此请读取 JSON，不要重试或绕过它。

有一种 `"root": null` 与配置无关：当某条 `status` 错误消息以 `中声明` 或 `中的 store 声明无效` 结尾，并指向本项目的 `openspec/config.yaml`（或 `config.yml`）时，说明本项目确实通过它声明的某个 store 在使用 OpenSpec，只是本机无法解析该 store（store 未注册，或 `store:` 行格式有误）。不要把它当作未初始化而跳过下面的分支：请在写入前停下，把该错误的 `message` 和 `fix` 展示给用户。

否则，在没有根目录的情况下，接下来怎么做取决于这个工作流是如何被触发的：

- **自动选用**：这个工作流是你自己选的，用户没有提到 OpenSpec、没有点名这个 skill，也没有运行它的斜杠命令。停止使用 OpenSpec，按平常方式回答请求，就像没安装 OpenSpec 一样。不要要求他们做任何配置，也不要提及 OpenSpec 配置。
- **明确要求 OpenSpec**：用户提到了 OpenSpec、点名了这个 skill，或运行了它的斜杠命令。在写入前停下并询问如何继续：为本项目做配置（`openspec-cn init`）、指向他们已有的某个 store（`--store <id>`），还是本次请求不使用 OpenSpec 继续。等待他们的答复。

无论走哪个分支，都绝不能把创建根目录当作副作用：在用户要求之前不要运行 `openspec-cn init`，不要手工创建 `openspec/` 文件，也不要让任何命令创建它。

**Input**: 可选地指定变更名称。若省略，检查能否从对话上下文推断。若模糊或歧义，你必须提示用户从可用变更中选择。

本工作流仅修订已存在的制品；`/openspec-continue-change` 负责创建不存在的制品。

**步骤**

1. **选择变更**

   若提供了名称，使用它。否则：
   - 从对话上下文推断（若用户提到了某个变更）
   - 若仅有一个活跃变更则自动选择
   - 若存在歧义，运行 `openspec-cn list --json` 获取按最近修改排序的可用变更，并让用户选择

   提示时，展示最近修改的前 3-4 个变更作为选项，显示：
   - 变更名称
   - 状态（例如 "0/5 tasks"、"complete"、"no tasks"）
   - 最近修改时间（来自 `lastModified` 字段）

   将最近修改的变更标记为 "(推荐)"，因为这很可能是用户想更新的。

   始终宣告："使用变更：<name>"，以及如何覆盖（例如 `/openspec-update-change <other>`）。

2. **获取变更的制品**
   ```bash
   openspec-cn status --change "<name>" --json
   ```
   解析 JSON 以理解当前状态。响应包括：
   - `schemaName`：使用的工作流 schema（例如 "spec-driven"）
   - `artifacts`：制品数组及其状态（"done"、"skipped"、"ready"、"blocked"）
   - `isPlanningComplete`：布尔值，表示所有规划制品是否已完成。较旧 CLI 版本以 `isComplete` 暴露相同值。
   - `planningHome`、`changeRoot`、`artifactPaths` 和 `actionContext`：路径和作用域上下文。请使用这些值而非假设仓库本地路径。

   制品 ID 和路径来自活动 schema — 不要假设它们，且不要基于硬编码的制品名称分支。自定义 schema 必须能不加修改地工作。

   要编辑的文件是 `artifactPaths.<id>.existingOutputPaths` — 磁盘上存在的具体文件，已对 glob 制品（例如 `specs/**/*.md`）进行 glob 展开。不要写入 `resolvedOutputPath`：对于 glob 制品，它仍是 glob 模式，而非真实文件。

3. **理解请求**
   - 若用户请求了特定修订（"design 现在使用 X"），那是起始编辑点。
   - 若他们仅说了 "update" / "make this coherent"，将其视为一致性审查：读取现有制品并相互检查矛盾、缺口和重复。

4. **读取并调和**
   - 读取请求涉及的制品以及变更的其他现有制品。
   - 在对话中起草请求的编辑，而非在文件中。明确它究竟改变了什么；步骤 5 负责所有写入。然后对照起草的编辑检查每个其他现有制品 — 在任何方向上：对后续制品的编辑可能需要修订前面的制品，而不仅仅是反过来。构建顺序是方便的阅读顺序，而非对哪些制品可被修订的约束。
   - 记录所有现在不一致、缺失或矛盾的内容。
   - 对已存在的文件（`existingOutputPaths`）提出修订。若制品没有现有输出文件且状态为 `ready` 或 `blocked`，指出它并引导用户使用 `/openspec-continue-change` 来创建它们。保持 `skipped` 制品不动；不要把它们当作缺失，也不要把它们推迟到 continue 工作流。
   - glob 制品（例如 `specs/**/*.md`）在至少一个文件匹配后即标记为 `done`，而 continue 工作流只处理 `ready` 制品。当调和发现一个 `existingOutputPaths` 非空的 glob 制品缺少文件时：
     1. 运行 `openspec-cn instructions "<artifact-id>" --change "<name>" --json` 并使用其 `instruction` 和 `template`。将 `context` 和 `rules` 视为约束；不要把它们复制进文件。若 instructions 报告 `skipped: true`，不要创建文件。从磁盘读取当前依赖文件；若所需的非 skipped 依赖缺失，停止并请用户先恢复它。
     2. 在 `changeRoot` 内选择一个符合 `artifactPaths.<id>.outputPath` 且尚不存在的具体路径。解析符号链接的父目录后，验证它仍在 `changeRoot` 内。glob 的 `resolvedOutputPath` 不是有效目标。
     3. 把新文件纳入步骤 5 提议的修订中，仅在用户确认后创建。
     4. 确认后、创建前，刷新 status 和 instructions。验证该制品仍在范围内、未被跳过且已部分填充；重复上述具体路径检查。
     5. 使用一个在目标已存在时会失败的创建操作。若 `instruction` 把创建委托给另一个 skill 或命令，仅当它能遵循确认的路径和这些护栏时才调用；否则停止。若任何检查失败或确认的草稿不再有效，停止并与用户调和，而不是替换现有内容或另选路径。
   - 若变更已一致，说明情况且不提议修订。

5. **确认并应用，一次一个制品**
   - 此步骤执行本工作流中的每一次制品写入；此前的步骤都不编辑制品。
   - 展示每个提议的修订及其原因 — 包括步骤 4 中起草的请求编辑。仅在用户确认后写入。
   - 若用户拒绝修订，不要写入 — 保持该制品不变。
   - 当需要重大重写时，先获取该制品的规则和模板：
     ```bash
     openspec-cn instructions "<artifact-id>" --change "<name>" --json
     ```

6. **指出下一步（仅供参考 - 绝不要执行）**
   - `existingOutputPaths` 为空且状态为 `ready` 或 `blocked` 的制品 -> 建议 `/openspec-continue-change` 创建它们。
   - 变更已实现（任务已勾选 / 已 apply） -> 代码可能不再匹配修订后的计划；建议 `/openspec-apply-change` 将增量带入代码。
   - 一切完成且已实现 -> 建议 `/openspec-archive-change`。

**输出**

每次调用后，展示：
- 修订了哪些制品（以及哪些提议的修订被拒绝）
- 在已部分填充的 glob 制品下创建的任何文件
- 推迟到 `/openspec-continue-change` 的任何内容（尚无文件的制品且状态为 `ready` 或 `blocked`，绝不包括 `skipped` 制品）
- 变更的状态及推荐的下一步命令

**护栏**
- 仅规划制品 — 绝不要编辑实现代码。若修订后的计划暗示代码更改，停止并指向 `/openspec-apply-change`。
- 使用 `openspec-cn status` 报告的制品 ID 和路径；绝不要基于硬编码的制品名称分支。
- 仅编辑 `existingOutputPaths` 中的具体文件；绝不要写入 glob `resolvedOutputPath`。
- 不要推进构建边界：若制品的 `existingOutputPaths` 为空且状态为 `ready` 或 `blocked`，那是 `/openspec-continue-change` 的职责。保持 `skipped` 制品不动。新文件的唯一允许范围是 `existingOutputPaths` 非空的 glob 制品下一个已确认的具体路径。
- 在写入前与用户确认每个编辑。
- 若请求更改的是变更的*意图*而非细化，建议用 `/openspec-new-change` 重新开始（"更新 vs 重新开始" 启发式）。
