---
name: openspec-update-change
description: 修订 OpenSpec 变更的现有规划制品并保持它们之间的一致。当用户想修订变更的计划、将新决定纳入其中，或在编辑后调和其制品时使用。绝不要编辑代码。
allowed-tools: Bash(openspec-cn:*)
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
---

修订变更的现有规划制品并保持它们之间一致。绝不要编辑代码。

**存储选择：** 若用户指定了一个存储（存储是注册在本机上的独立 OpenSpec 仓库）或工作位于某个存储中，请运行 `openspec store list --json` 发现已注册的存储 ID，然后在读写 spec 和变更的命令上传递 `--store <id>`（`new change`、`status`、`instructions`、`list`、`show`、`validate`、`archive`、`doctor`、`context`、`view`）。选定后，将 `--store <id>` 视为在当前工作流其余部分中固定不变。以下每个未限定范围的命令示例均为简写形式：运行前请追加该标志。例如，运行 `openspec status --change "<name>" --json --store "<id>"`，而非下面展示的未限定形式。其他命令不接受此标志。命令输出的提示已包含该标志；在后续操作中请保留它。若不指定存储，命令将对最近的本地 `openspec/` 根目录生效。

**输入**：可选地指定变更名称。若省略，检查能否从对话上下文推断。若模糊或歧义，你必须提示用户从可用变更中选择。

`/openspec-continue-change` 是一个扩展 profile 工作流，可能未安装。在下方任何地方建议它之前，请验证它是否可用。若不可用，`openspec status --change "<name>" --json` 显示下一个制品，`openspec instructions "<artifact-id>" --change "<name>" --json` 解释如何创建它。

**步骤**

1. **选择变更**

   若提供了名称，使用它。否则：
   - 从对话上下文推断（若用户提到了某个变更）
   - 若仅有一个活跃变更则自动选择
   - 若存在歧义，运行 `openspec list --json` 获取按最近修改排序的可用变更，并让用户选择

   提示时，展示最近修改的前 3-4 个变更作为选项，显示：
   - 变更名称
   - Schema（来自 `schema` 字段，若无则为 "spec-driven"）
   - 状态（例如 "0/5 tasks"、"complete"、"no tasks"）
   - 最近修改时间（来自 `lastModified` 字段）

   将最近修改的变更标记为 "(推荐)"，因为这很可能是用户想更新的。

   始终宣告："使用变更：<name>"，以及如何覆盖（例如 `/openspec-update-change <other>`）。

2. **获取变更的制品**
   ```bash
   openspec status --change "<name>" --json
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
   - 应用请求的编辑。然后检查所有其他现有制品与其的一致性 — 在任何方向上：对后续制品的编辑可能需要修订前面的制品，而不仅仅是反过来。构建顺序是方便的阅读顺序，而非对哪些制品可被修订的约束。
   - 记录所有现在不一致、缺失或矛盾的内容。
   - 仅修订已存在的文件（`existingOutputPaths`）。不要创建尚不存在的制品，且不要在 glob 制品下创建新文件 — 指出它们并引导用户使用 `/openspec-continue-change` 来创建。
   - 若变更已一致，说明情况且不做编辑。

5. **确认并应用，一次一个制品**
   - 展示每个提议的修订及其原因。仅在用户确认后写入。
   - 若用户拒绝修订，不要写入 — 保持该制品不变。
   - 当需要重大重写时，先获取该制品的规则和模板：
     ```bash
     openspec instructions "<artifact-id>" --change "<name>" --json
     ```

6. **指出下一步（仅供参考 - 绝不要执行）**
   - 制品仍缺失 -> 建议 `/openspec-continue-change` 来创建它们。
   - 变更已实现（任务已勾选 / 已 apply） -> 代码可能不再匹配修订后的计划；建议 `/openspec-apply-change` 将增量带入代码。
   - 一切完成且已实现 -> 建议 `/openspec-archive-change`。

**输出**

每次调用后，展示：
- 修订了哪些制品（以及哪些提议的修订被拒绝）
- 推迟到 `/openspec-continue-change` 的任何内容（尚未创建的制品或文件）
- 变更的状态及推荐的下一步命令

**护栏**
- 仅规划制品 — 绝不要编辑实现代码。若修订后的计划暗示代码更改，停止并指向 `/openspec-apply-change`。
- 使用 `openspec status` 报告的制品 ID 和路径；绝不要基于硬编码的制品名称分支。
- 仅编辑 `existingOutputPaths` 中的具体文件；绝不要写入 glob `resolvedOutputPath`。
- 不要推进构建边界：不创建新制品，不在 glob 制品下创建新文件 — 那是 `/openspec-continue-change` 的职责。
- 在写入前与用户确认每个编辑。
- 若请求更改的是变更的*意图*而非细化，首先验证扩展 profile `/openspec-new-change` 工作流是否可用。若可用，建议用 `/openspec-new-change` 重新开始（"更新 vs 重新开始" 启发式）。若不可用，请求一个不同的未使用变更名称并建议改用 `openspec new change "<new-change-name>"`。
