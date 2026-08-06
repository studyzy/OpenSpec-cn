# OpenSpec Agent 契约

机器可读的 `openspec` CLI 接口，已对照 `src/` 校验（截止审计，2026-06-11）。下面每个结构都有对应的发出代码作为依据。

## 1. 通用约定

- **每次调用一个 JSON 文档。** 在 `--json` 模式下，stdout 恰好携带一个 JSON 文档（2 空格缩进美化输出）。人类可读文字、加载动画、store 横幅走 stderr。
- **Store 横幅。** 在人类模式下，选中 store 的根目录会在 stderr 打印 `Using OpenSpec root: <id> (<path>)`。JSON 模式下永不打印。
- **键名大小写取决于接口**（见已知不一致项）：store/doctor/context 载荷使用 `snake_case`；工作流载荷（`status`、`instructions`、`new change`、`validate`、`list`）使用 `camelCase`，但内嵌的 `root` 对象始终使用 `store_id`。
- **可选键省略而非为 null**，绝大多数载荷如此（例如 `root.store_id`、`member.path`）。例外情况会使用显式 `null`，在对应结构中特别标注（store doctor 的 `git.*`、失败载荷）。

## 2. 诊断信封

每个机器可读诊断共享同一个信封结构（`StoreDiagnostic`）：

```json
{
  "severity": "error" | "warning" | "info",
  "code": "snake_case_string",
  "message": "human sentence",
  "target": "dotted.surface (optional)",
  "fix": "one actionable sentence/command (optional)"
}
```

诊断出现在两个位置：**status 数组**（`status: StoreDiagnostic[]`，顶层每个条目）用于健康检查结果，**抛出的错误**在命令失败时被转换为单元素 `status` 数组。

All root-resolving commands (`list`, `show`, `validate`, `status`, `instructions`, `instructions apply`, `instructions archive`, `new change`, `archive`, `doctor`, `context`) resolve one OpenSpec root with one precedence:

1. `--store <id>` → the registered store's root (`source: "store"`).
2. Otherwise, nearest ancestor with `openspec/`: planning shape → `source: "nearest"` (a `store:` pointer is ignored with a stderr warning); config-only dir with a valid `store:` pointer → that store, `source: "declared"`.
3. No nearest root + global `defaultStore` set (`openspec config set defaultStore <id>`) → that store, `source: "global_default"`; a stale id fails with the underlying store error and a `fix` naming `openspec config unset defaultStore`.
4. No nearest root, no default + registered stores exist → error `no_root_with_registered_stores`.
5. No root, no default, no stores: scaffolding commands treat the cwd as `source: "implicit"`; diagnostic commands (`doctor`, `context`) fail with `no_openspec_root` instead — they inspect, never scaffold.

Successful JSON payloads embed the root:

```json
"root": { "path": "/abs/path", "source": "store" | "declared" | "global_default" | "nearest" | "implicit", "store_id": "id (only when store-selected)" }
```

**根失败契约**：在 JSON 模式下，解析失败会在 stdout 打印 `{ ...commandNullShape, "status": [diagnostic] }` 并退出 1。

## 4. 命令 JSON 结构

### 4.1 `list --json`

`{ "changes": [ { "name", "completedTasks", "totalTasks", "lastModified", "status": "no-tasks"|"complete"|"in-progress" } ], "root": RootOutput }` —— 注意这里的每个变更 `status` 是字符串枚举。`--specs`：`{ "specs": [ { "id", "requirementCount" } ], "root" }`。

### 4.2 `show <item> --json`

变更：`{ "id", "title", "deltaCount", "deltas": [...], "root" }`。Spec：`{ "id", "title", "overview", "requirementCount", "requirements": [...], "metadata": { "version", "format", "sourcePath"? }, "root" }`。

### 4.3 `validate --json`

`{ "items": [ { "id", "type": "change"|"spec", "valid", "issues": [ { "level", "path", "message", "line"?, "column"? } ], "durationMs" } ], "summary": { "totals": {items,passed,failed}, "byType": {...} }, "version": "1.0", "root" }`。任一 item 失败时退出 1。

### 4.4 `status --json`
`{ "changeName", "schemaName", "planningHome"?: { "kind", "root", "changesDir", "defaultSchema" }, "changeRoot", "artifactPaths": { "<id>": {outputPath, resolvedOutputPath, existingOutputPaths} }, "nextSteps": ["..."], "actionContext": { "mode": "repo-local", "sourceOfTruth": "repo", "planningArtifacts", "linkedContext", "allowedEditRoots", "requiresAffectedAreaSelection", "constraints" }, "isPlanningComplete", "isComplete", "applyRequires", "artifacts": [ {id, outputPath, status: "done"|"skipped"|"ready"|"blocked", requires, missingDeps?} ], "root" }`. `isPlanningComplete` means every non-skipped planning artifact exists; skipped artifacts count as satisfied without being created. It does not mean implementation tasks are complete. `isComplete` is retained as a compatibility alias with the same value. Each artifact's `requires` is its direct dependency ids (present for every status, so the transitive required set is computable even when the artifact is `done`); `missingDeps` appears only when `blocked`. The `artifacts` array is in dependency order, with the schema's `artifacts:` declaration order breaking ties between artifacts that become ready at the same time (never alphabetical), so the first `ready` entry is the artifact to write next; `missingDeps` uses that same order. `"skipped"` marks an artifact whose `generates` path is under `specs/` in a change whose `.openspec.yaml` declares `skip_specs: true`; it satisfies dependencies but must not be created. No active changes: `{ "changes": [], "message", "root" }`, exit 0.

### 4.5 `instructions <artifact> --json`
`{ "changeName", "artifactId", "schemaName", "changeDir", "planningHome"?, "outputPath", "resolvedOutputPath", "existingOutputPaths", "description", "instruction"?, "context"?, "rules"?, "references"?: ReferenceIndexEntry[], "skipped"?, "warning"?, "template", "dependencies": [{id,done,path,description,skipped?}], "unlocks", "root" }`. `unlocks` lists the artifacts this one makes ready, in the schema's declaration order (the same order `status` recommends them). `"skipped": true` (with `"warning"`) appears when the change declares `skip_specs: true` and this artifact is skipped — do not create its files. A dependency entry with `skipped: true` is satisfied without files — do not try to read its paths.

`{ "changeName", "artifactId", "schemaName", "changeDir", "planningHome"?, "outputPath", "resolvedOutputPath", "existingOutputPaths", "description", "instruction"?, "context"?, "rules"?, "references"?: ReferenceIndexEntry[], "template", "dependencies": [{id,done,path,description}], "unlocks", "root" }`。

`ReferenceIndexEntry`：`{ "store_id", "root"?, "specs"?: [{id,summary}], "fetch"?, "status": [] }` —— 已解析的条目携带 root/specs/fetch；未解析的条目携带 store_id + 警告状态。索引上限 50KB（`reference_index_truncated`）。

### 4.6 `instructions apply --json`
`{ "changeName", "changeDir", "schemaName", "contextFiles": { "<artifactId>": ["/abs", ...] }, "progress": {total,complete,remaining}, "tasks": [{id,description,done}], "state": "blocked"|"all_done"|"ready", "missingArtifacts"?, "instruction", "references"?, "context"?, "operationGuidance"?, "root" }`. Both optional fields are read from the selected root on every invocation. `context` is a required prompt-level input whose relevant project facts, conventions, and constraints must be applied; `operationGuidance` is advisory input whose entries are followed only when applicable and compatible with the built-in workflow. Both remain separate from state, tasks, progress, context files, and the built-in instruction.

### 4.7 `instructions archive --json`
`{ "changeName", "context"?, "operationGuidance"?, "root" }`. Requires a valid `--change` in the resolved repo/store root and uses the same required-context/advisory-guidance semantics as apply. This is a read-only runtime-input surface: it does not return the static archive workflow, inspect or merge delta specs, write main specs, or move the change.

### 4.8 `new change <name> --json`

成功：`{ "change": { "id", "path", "metadataPath", "schema" }, "root" }`。失败：`{ "change": null, "status": [d] }`，退出 1。

### 4.9 `archive <name> --json`
Success: `{ "archive": { "change", "archivedAs": "YYYY-MM-DD-name", "path", "specsUpdated", "totals"?, "warnings"? }, "root" }`. Failure: `{ "archive": null, "root"?, "status": [d] }`, exit 1. `specsUpdated` is true only when at least one spec file was written or retired (a capability whose last requirement the change removed has its spec deleted, which requires `retire_capabilities: true` in the change's `.openspec.yaml`; every retirement is named in `warnings`, with a pasteable Git recovery command only when the spec lived in the caller's checkout); an already-synced change archives with all-zero totals and the skips listed in `warnings`. JSON mode is strictly non-interactive: every prompt point becomes an `archive_*` code.

### 4.10 `doctor --json`
`{ "root": { "path", "source", "store_id"?, "healthy", "status": [] }, "store": { "id", "metadata": {present,valid,remote?}, "origin_url"?, "drift"?: {ahead,behind}, "status": [] } | null, "references": [...], "status": [] }`. `drift` (present only for a git-backed store checkout that has an upstream tracking ref) is ahead/behind counts against the last-fetched upstream, not the live remote. Health findings of any severity exit 0. Failure payload: `{ "root": null, "store": null, "references": [], "status": [d] }`, exit 1.

### 4.11 `context --json`

`{ "root": { "path", "source", "store_id"?, "role": "openspec_root" }, "members": [ { "role": "referenced_store", "id", "path"?, "remote"?, "fetch"?, "status": [] } ], "status": [] }`。AVAILABLE = 路径存在且 status 为空。`--code-workspace <path>` 写入 `{folders:[{name,path}]}`（仅含可用的被引用 store，带 `ref:` 前缀）；在 JSON 模式下写入操作先于打印执行，因此即使写入失败 stdout 也恰好持有一个文档。失败：`{ "root": null, "members": [], "status": [d] }`，退出 1。

### 4.12 `store ... --json`

setup/register：`{ "store": {id, root, metadata_path?}, "registry": {path, registered, already_registered}, "git": {is_repository, initialized, committed}, "created_files": [], "status": [] }`。unregister/remove：`{ "store", "registry": {path, removed}, "files": {deleted, deleted_path, left_on_disk}, "status": [] }`。list：`{ "stores": [{id, root}], "status": [] }`。doctor：`{ "stores": [ { id, root, metadata_path?, openspec_root: {...healthy, status}, metadata: {present, valid, id?, remote}, git: {is_repository, has_commits, has_uncommitted_changes, has_remote, origin_url}, status } ], "status": [] }`（`null` = 未知/未探测）。健康检查结果退出 0；失败退出 1 并返回对应的 null 结构。提示取消退出 130。

### 4.13 `schemas --json` / `templates --json`

`schemas`：裸数组 `[ {name, description, artifacts, source} ]`。`templates`：键控对象 `{ "<artifactId>": {path, source} }`。两者都基于 cwd，没有 root/status 键。

## 5. 退出码契约

| 情形 | 退出码 | Stdout |
|---|---|---|
| 成功，含健康检查结果（doctor/context/store doctor） | 0 | 对应的载荷 |
| `--json` 模式下的命令失败 | 1 | 一个带有 `status: [d]` 和该命令 null 结构的 JSON 文档 |
| `validate` 有失败项 | 1 | 完整报告 |
| 提示取消（store 组，人类模式） | 130 | 仅 stderr |

## 6. 诊断代码目录

### 解析

`no_openspec_root`, `no_root_with_registered_stores`, `no_registered_stores`, `unknown_store`, `store_identity_mismatch`, `unhealthy_store_root`, `store_path_not_supported`, `invalid_store_pointer`, `initiative_option_removed`, `areas_option_removed`；透传：`invalid_store_id`, `invalid_store_registry`, `invalid_store_metadata`。

### OpenSpec 根目录健康（错误，无修复建议）

`openspec_store_root_missing`, `openspec_store_root_not_directory`, `openspec_root_missing`, `openspec_root_not_directory`, `openspec_config_missing`, `openspec_config_not_file`, `openspec_specs_not_directory`, `openspec_changes_not_directory`, `openspec_archive_not_directory`。在 stores beta 期间，`openspec/specs/`、`openspec/changes/`、`openspec/changes/archive/` 在健康根目录中可缺失；只有当它们存在但不是目录时才是健康错误。

### Store 注册表/身份/状态

`invalid_store_id`, `invalid_store_registry`, `invalid_store_metadata`, `store_registry_busy`, `store_not_found`, `no_store_registry`, `store_registry_changed`, `store_metadata_missing`, `store_metadata_id_mismatch`, `store_metadata_invalid`, `store_id_conflict`, `store_path_conflict`, `store_already_registered`（info）。

### Store setup/register/remove

`store_setup_id_required`, `store_setup_path_required`, `store_setup_path_not_directory`, `store_setup_inside_git_repo`, `store_setup_non_empty_directory`, `store_setup_cancelled`, `store_path_required`, `store_path_missing`, `store_path_not_directory`, `store_root_pointer_declared`, `store_register_root_unhealthy`, `store_register_identity_confirmation_required`, `store_register_cancelled`, `store_remote_empty`, `store_remote_requires_hand_edit`, `store_remove_confirmation_required`, `store_remove_cancelled`, `store_remove_path_not_directory`, `store_remove_metadata_missing`, `store_root_missing`（在 remove 中为 warning，在 doctor 中为 error）, `store_root_not_directory`。

### Store git
`store_git_init_failed`, `store_git_identity_missing`, `store_git_commit_failed`, `store_git_no_commits` (warning), `store_clone_fragile_directories` (warning), `store_remote_divergence` (info, doctor), `store_checkout_drift` (info, doctor).

`relationship_registry_unreadable`, `root_pointer_ignored`, `root_pointer_invalid`, `pointer_declarations_inert`。

### 归档（JSON 模式）

`archive_change_name_required`, `archive_change_not_found`, `archive_change_symlink`, `archive_validation_failed`, `archive_confirmation_required`, `archive_tasks_incomplete`, `archive_spec_update_failed`, `archive_spec_validation_failed`, `archive_target_exists`, `archive_error`。

### 上下文写入

`context_file_exists`, `context_output_dir_missing`。

### 兜底

`doctor_failed`, `context_failed`, `store_error`, `change_error`, `archive_error`。

## 已知不一致项

由封顶审计记录；公开键的重命名属于延后到本版本之后的产品决策：

1. ~~在 `--json` 模式下，若干失败路径仅打印 stderr 而没有 JSON 文档。~~ 已在封顶测试轮次中修复：`show`/`validate` 对未知和歧义 item 会发出 `{status:[{code: unknown_item | ambiguous_item, ...}]}`；`status`/`instructions`/`list`/`show`/`validate` 中抛出的错误会经由 JSON 感知的失败辅助函数路由（命令的 null 结构 + `status`）；`store <unknown subcommand> --json` 发出 `{status:[{code: unknown_store_subcommand}]}`；`list` 在解析失败时会携带其 `{changes|specs: [], root: null}` null 结构。
2. `store_root_missing` 以两种严重程度发出（在 remove 中为 warning，在 store doctor 中为 error）—— 视上下文而定，如上所述。
3. snake_case（store 系列）与 camelCase（工作流系列）的键名大小写差异；`root.store_id` 处处都是 snake_case。
4. src 中存在四份并行的信封类型声明；归档诊断从不携带 `target`。
5. `list --json` 复用 `status` 键作为每个变更的字符串枚举。
6. 只有 `validate` 输出携带 `version` 字段。
7. `schemas`/`templates` 忽略根目录选择（基于 cwd，无 `--store`）。
8. 已废弃的名词形式（`change`/`spec` 子命令）发出不带 `root`/`status` 的非信封载荷。
