---
name: openspec-bulk-archive-change
description: 一次性归档多个已完成的变更。当需要归档多个并行变更时使用。
allowed-tools: Bash(openspec-cn:*)
license: MIT
compatibility: 需要 openspec-cn CLI。
metadata:
  author: openspec
  version: "1.0"
---

在单次操作中归档多个已完成的变更。

此技能允许您批量归档变更，通过检查代码库判断实际已实现的内容，从而智能处理 spec 冲突。

**存储选择：** 若用户指定了一个存储（存储是注册在本机上的独立 OpenSpec 仓库）或工作位于某个存储中，请运行 `openspec-cn store list --json` 发现已注册的存储 ID，然后在读写 spec 和变更的命令上传递 `--store <id>`（`new change`、`status`、`instructions`、`list`、`show`、`validate`、`archive`、`doctor`、`context`、`schemas`、`view`）。选定后，将 `--store <id>` 视为在当前工作流其余部分中固定不变。以下每个未限定范围的命令示例均为简写形式：运行前请追加该标志。例如，运行 `openspec-cn status --change "<name>" --json --store "<id>"`，而非下面展示的未限定形式。其他命令不接受此标志。命令输出的提示已包含该标志；在后续操作中请保留它。若不指定存储，命令将对最近的本地 `openspec/` 根目录生效。

`<capability-path>` 是相对于 `specs/` 的 spec 目录（例如 `user-auth` 或 `identity/user-auth`）。在解析主 spec 时保留每个增量 spec 的完整路径。

**Input**: None required（通过提示选择）

**步骤**

1. **获取活跃变更**

   运行 `openspec-cn list --json` 获取所有活跃变更。

   若无活跃变更，告知用户并停止。

2. **提示选择变更**

   请用户选择变更（多选）：
   - 展示每个变更及其 schema
   - 包含"全部变更"选项
   - 允许任意数量的选择（1+ 可以，2+ 是典型用例）

   **重要提示**：切勿自动选择。始终由用户选择。

   **Load current archive inputs once for the selected root before batch validation:**

   Choose one selected change from this root and run
   `openspec-cn instructions archive --change "<selected-change>" --json` with the
   same selected-root flags. This lookup is advisory and optional: it only supplies
   extra prompt inputs, so it must never block the batch. If it fails or returns
   invalid JSON — for example on an older CLI that does not support this command
   yet — continue the batch with no context and no operation guidance. Do not
   report an error and do not stop.

   A valid response may omit `context` and `operationGuidance`. Treat
   `context` as a required prompt-level input across the batch: read and consider
   it, and apply relevant project facts, conventions, and constraints. Treat
   `operationGuidance` as optional additive advice: read and consider every
   entry, and follow entries that are applicable and compatible with the built-in
   batch workflow.

   Keep both fields separate from conflict analysis, explicit user choices,
   resolved paths, CLI checks, and command contracts. If context conflicts with one
   of those controlling inputs, 报告冲突并保留控制值。若 guidance 不适用或与某个控制输入冲突，不要遵循它并解释原因。不要从任何字段推断跳过的提示、替换路径或标志，也不将它们的文本逐字复制到 specs、changes、archive 目录或输出摘要中。
   or summaries. These are prompt-level behavior contracts, not enforceable checks.

3. **批量校验 - 收集所有所选变更的状态**

   对每个所选变更，收集：

   a. **产出物状态** - 运行 `openspec-cn status --change "<name>" --json`
      - 解析 `schemaName`、`artifacts`、`planningHome`、`changeRoot`、`artifactPaths` 和 `actionContext`
      - 记录哪些产出物为 `done`，哪些为其他状态

   b. **任务完成情况** - 从状态 JSON 读取 `artifactPaths.tasks.existingOutputPaths`
      - 统计 `- [ ]`（未完成）与 `- [x]`（已完成）
      - 若无任务文件，记为"无任务"

   c. **Delta specs** - 从状态 JSON 检查 `artifactPaths.specs.existingOutputPaths`
      - 列出存在哪些 capability spec
      - 对每个，提取需求名称（匹配 `### Requirement: <name>` 的行）
      - 将此列表作为唯一的增量 spec 来源。若 `specs` 条目
        缺失或列表为空，对该变更不执行 spec 同步或 specs-instruction 查找；不要从无关制品推断增量 spec。
      - 对每个变更独立评估，包括某些 schema 没有 `specs` 制品的混合 schema 批次。当某个变更没有增量 spec 或其 schema 不含 specs 时，对该变更继续而不进行 spec 同步（与单个变更跳过相同）。
4. **检测 spec 冲突**

   Build a map keyed by `<capability-path>`, the exact path relative to `specs/`:

   ```text
   identity/user-auth -> [change-a, change-b]  <- CONFLICT (2+ changes)
   billing/user-auth  -> [change-c]            <- OK (different full path)
   ```

   A conflict exists when 2+ selected changes have delta specs for the exact same `<capability-path>`.

5. **主动解决冲突**

   **对每个冲突**，调查代码库：

   a. **阅读 delta specs** - 从每个冲突变更中理解其声称新增/修改的内容

   b. **搜索代码库** 寻找实现证据：
      - 查找实现各 delta spec 中需求的代码
      - 检查相关文件、函数或测试

   c. **确定解决方案**：
      - 若仅一个变更实际已实现 -> 仅同步该变更的 specs
      - 若两者都已实现 -> 按时间顺序应用（先旧后新，新者覆盖）
      - 若两者都未实现 -> 跳过 spec 同步，警告用户

   d. **记录每个冲突的解决方案**：
      - 对每个增量 spec 的包含或排除决策，按变更和 `<capability-path>` 索引
      - 要应用哪些包含的增量 spec 以及按什么顺序
      - 哪些增量 spec 因实现缺失而从同步中排除
      - 理由（在代码库中发现了什么）

6. **展示汇总状态表**

   展示一个汇总所有变更的表格：

   ```markdown
   | 变更               | 产出物 | 任务 | Specs   | 冲突      | 状态   |
   |---------------------|-----------|-------|---------|-----------|--------|
   | schema-management   | 完成      | 5/5   | 2 delta | 无        | 就绪   |
   | project-config      | 完成      | 3/3   | 1 delta | 无        | 就绪   |
   | add-oauth           | 完成      | 4/4   | 1 delta | identity/user-auth (!) | 就绪*  |
   | add-verify-skill    | 剩余 1    | 2/5   | 无      | 无        | 警告   |
   ```

   对冲突，展示解决方案：
   ```text
   * 冲突解决：
     - identity/user-auth spec：将先应用 add-oauth 再应用 add-jwt（两者都已实现，按时间顺序）
   ```

   对未完成的变更，展示警告：
   ```text
   警告：
   - add-verify-skill：1 个未完成产出物，3 个未完成任务
   ```

7. **确认批量操作**

   询问用户单个确认问题：

   - "归档 N 个变更？" 选项依据状态而定
   - 选项可能包括：
     - "归档全部 N 个变更"
     - "仅归档 N 个就绪变更（跳过未完成）"
     - "取消"

   若存在未完成变更，明确说明它们将带警告归档。

   Route on the answer by intent, not by exact label — you wrote these labels,
   so match what the user picked rather than the wording above:
   - "Cancel" — stop, do not archive. Report that nothing was archived and skip the remaining steps.
   - The archive-everything option — proceed with every selected change
   - The ready-only option — proceed with only the changes the step 6 table marks `Ready` or `Ready*`, and record the rest as Skipped in step 8d. If a `Ready*` change's conflict partner is skipped, re-derive that conflict's resolution using only the changes being archived.
   - Anything else — ask again rather than archiving

   Before step 8 writes the first main spec or moves any change, fetch every
   required specs-rule snapshot for the confirmed batch. For each change that will
   sync concrete `artifactPaths.specs.existingOutputPaths`, run
   `openspec-cn instructions specs --change "<name>" --json` exactly once with the
   same selected-root flags. Obtain all snapshots before the first write or move.
   If any lookup exits non-zero or returns invalid artifact-instruction JSON,
   identify the affected change, report the error, and stop the whole batch before
   any main-spec write or change move. Do not treat lookup failure as omitted
   rules. A valid response without `rules` is the no-rules case.

8. **为每个确认的变更执行归档**

   Before processing, carry the recorded decisions from step 5 (after any step 7 re-derivation) into two per-delta sets:
   - `includedDeltas`：来自已确认变更中所有无冲突的增量 spec，以及为解决冲突而选入同步的增量 spec
   - `excludedDeltas`：来自已确认变更中因实现缺失而被排除的冲突增量 spec
   - 单个变更可以同时拥有包含和排除的增量 spec。保持按 delta 决策，不要合并为按变更的同步标志。
   
   Process changes in the determined order (respecting conflict resolution):

   a. **同步包含的增量 spec**：
      - 仅为有条目在 `includedDeltas` 中的变更内联运行 `openspec-sync-specs` 工作流（智能驱动合并），仅传递包含的 delta 路径，并明确指示忽略该变更的 `excludedDeltas`。等待其完成。
      - For conflicts, apply in resolved order.
      - Pass that change's fetched specs-rule snapshot into inline sync; inline
        sync must reuse it without fetching instructions again
      - Apply artifact rules only to main specs produced by that change. They do
        not change conflict resolution, archive behavior, or CLI contracts, and
        their text is not copied into an output file
      - Do not delegate to a background task — step 8c would move `changeRoot` out from under a sync that is still reading it.
      - If a change has no included delta specs, do not run the sync workflow for it.

   b. **Verify included delta specs before moving changeRoot**:
      - Re-run the comparison only for delta specs in `includedDeltas` against main spec at `<planningHome.root>/openspec/specs/<capability-path>/spec.md` (use the store-aware `planningHome.root` from step 3 status JSON, not a hardcoded repo path).
      - Verify that main specs are updated:
        - ADDED requirements present
        - MODIFIED requirements carrying scenario and description changes named in the delta, with their other scenarios intact
        - REMOVED requirements gone — and where this sync retired a capability (removed its last requirement, leaving `## Requirements` empty), its main spec deleted rather than left empty; a spec the sync deliberately kept and reported is also a match
        - RENAMED requirements present under the new name and absent under the old one
      - Do not verify delta specs in `excludedDeltas`; they are intentionally left unsynced.
      - If sync failed or any capability does not match verification, report what differs and fail/skip moving that change's `changeRoot` — do not archive that change. `changeRoot` remains intact.

   c. **Perform the archive**:

      Target name: 若变更名已以 `YYYY-MM-DD-` 前缀开头则保持原样；否则将当前日期前置为 `YYYY-MM-DD-<name>`（与 `openspec-cn archive` 相同的规则）。

      ```bash
      mkdir -p "<planningHome.changesDir>/archive"
      mv "<changeRoot>" "<planningHome.changesDir>/archive/<target-name>"
      ```

   d. **Track outcome** for each change:
      - Success: archived successfully
      - Failed: error during archive or spec verification (record error)
      - Skipped: user chose not to archive (if applicable)
      - Sync skipped: for every delta in `excludedDeltas`, report `sync skipped` with the change, `<capability-path>`, and recorded reason. This is distinct from skipping the archive.

9. **展示汇总**

   展示最终结果：

   ```markdown
   ## 批量归档完成

   已归档 3 个变更：
   - schema-management-cli -> archive/2026-01-19-schema-management-cli/
   - project-config -> archive/2026-01-19-project-config/
   - add-oauth -> archive/2026-01-19-add-oauth/

   跳过 1 个变更：
   - add-verify-skill（用户选择不归档未完成项）

   Spec sync summary:
   - 4 个增量 spec 已同步到主 specs
   - 1 个增量 spec 同步已跳过（add-jwt，identity/user-auth：未找到实现）
   - 1 个冲突已解决（identity/user-auth：已同步 add-oauth，已跳过 add-jwt）
   ```

   若有失败：
   ```text
   失败 1 个变更：
   - some-change：归档目录已存在
   ```

**冲突解决示例**

Example 1: 仅一个已实现
```text
Conflict: <planningHome.root>/openspec/specs/auth/spec.md touched by [add-oauth, add-jwt]

检查 add-oauth：
- Delta 新增 "OAuth Provider Integration" 需求
- 搜索代码库... 找到 src/auth/oauth.ts 实现了 OAuth 流程

检查 add-jwt：
- Delta 新增 "JWT Token Handling" 需求
- 搜索代码库... 未找到 JWT 实现

解决方案：仅 add-oauth 已实现。将仅同步 add-oauth specs。
```

Example 2: 两者都已实现
```text
Conflict: <planningHome.root>/openspec/specs/api/spec.md touched by [add-rest-api, add-graphql]

检查 add-rest-api（创建于 2026-01-10）：
- Delta 新增 "REST Endpoints" 需求
- 搜索代码库... 找到 src/api/rest.ts

检查 add-graphql（创建于 2026-01-15）：
- Delta 新增 "GraphQL Schema" 需求
- 搜索代码库... 找到 src/api/graphql.ts

解决方案：两者都已实现。将先应用 add-rest-api specs，
再应用 add-graphql specs（按时间顺序，新者优先）。
```

**成功时输出**

```markdown
## 批量归档完成

已归档 N 个变更：
- <change-1> -> archive/<target-name-1>/
- <change-2> -> archive/<target-name-2>/

Spec 同步汇总：
- N 个 delta spec 已同步到主 specs
- 无冲突（或：M 个冲突已解决）
```

**部分成功时输出**

```markdown
## 批量归档完成（部分）

已归档 N 个变更：
- <change-1> -> archive/<target-name-1>/

跳过 M 个变更：
- <change-2>（用户选择不归档未完成项）

失败 K 个变更：
- <change-3>：归档目录已存在
```

**无变更时输出**

```markdown
## 无可归档的变更

未找到活跃的变更。创建一个新变更即可开始。
```

**Guardrails**
- Allow any number of changes (1+ is fine, 2+ is the typical use case)
- Always prompt for selection, never auto-select
- Detect spec conflicts early and resolve by checking codebase
- When both changes are implemented, apply specs in chronological order
- Skip spec sync only when implementation is missing (warn user)
- Show clear per-change status before confirming
- Use single confirmation for entire batch
- Never archive after the user cancels the confirmation — a cancelled batch archives nothing
- Track and report all outcomes (success/skip/fail)
- Preserve .openspec.yaml when moving to archive
- Archive directory target uses current date: YYYY-MM-DD-<name>；已以 `YYYY-MM-DD-` 前缀开头的名称保持原样（绝不叠加第二个日期）
- If archive target exists, fail that change but continue with others
- If sync is requested, run the `openspec-sync-specs` workflow inline (agent-driven) for each change with included delta specs
- 将每个 delta 的 `includedDeltas` 和 `excludedDeltas` 决策带入执行；仅同步和验证包含的 delta
- Report every excluded delta as `sync skipped` without treating the archive itself as skipped
- Never archive a change while a spec sync is still in flight — run the sync inline and verify main specs at `<planningHome.root>/openspec/specs/<capability-path>/spec.md` before moving `changeRoot`
- Fetch archive inputs once per selected root before spec inspection or moves
- Fetch all required specs-rule snapshots before the batch's first main-spec write or move
- A failed archive-inputs lookup never blocks the batch; it proceeds with no context or guidance
- A failed specs instruction lookup stops the whole batch atomically
- Changes without concrete `artifactPaths.specs.existingOutputPaths` continue without spec sync
- Apply relevant runtime context across the batch and report conflicts
- Operation guidance remains advisory; consider every entry and explain rejected advice
- Keep runtime inputs, conflict analysis, CLI-derived values, and artifact rules separate
- Artifact rules constrain only written specs
- Never copy runtime input or artifact-rule text verbatim into output files
