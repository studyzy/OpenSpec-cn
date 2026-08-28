# 变更元数据（.openspec.yaml）

> 每个变更存储的元数据所支持的字段与校验规则。

## 位置

每个变更将其元数据存放在 `openspec/changes/<change-name>/.openspec.yaml`，与其制品放在一起。创建变更时会写入该文件，并自动填入 `schema` 和 `created`。

## 字段

| 键 | 类型 | 必填 | 作用 |
| --- | --- | --- | --- |
| `schema` | string | Yes | 该变更遵循的工作流 schema |
| `created` | string, YYYY-MM-DD | No | 记录变更创建的日期 |
| `goal` | string | No | 记录变更打算达成的目标 |
| `affected_areas` | list of strings | No | 记录变更预期触及的领域 |
| `initiative` | map: `store` and `id` | No | 记录该变更所属的 initiative |
| `skip_specs` | boolean | No | 声明该变更不产生任何 spec 增量，因此零增量可通过校验 |
| `retire_capabilities` | boolean | No | 授权归档删除该变更清空的某项能力 |

### schema

该变更遵循的工作流 schema。它在变更创建时被设置，并且优先于项目配置，因此即使之后 `openspec/config.yaml` 发生变化，变更也会保留自己的 schema。有效的名称列在 [Schemas](../schemas/index.md) 中。

### initiative

该变更所属的 initiative，以 store id 和 initiative id 表示，两者均为 kebab-case：

```yaml
initiative:
  store: platform-specs
  id: unify-billing
```

`store` 和 `id` 之外的键会被拒绝。目前没有任何命令读取该链接。

### skip_specs

声明该变更有意不产生 spec 增量：例如纯重构、工具或文档变更。设置后，校验接受零增量，且本会生成 spec 文件的制品也视为完成。若在 specs/ 下已存在 spec 文件时设置该字段，则是校验错误。它对增量和归档的影响参见 [spec-driven](../schemas/spec-driven/index.md)。

### retire_capabilities

授权归档时退役某项能力。当本变更的 REMOVED 增量移除了某能力所拥有的最后一条需求时，归档会删除该能力的主 spec，而不是中止。此标志之所以存在，是因为删除只能通过 git 恢复，所以由作者决定。归档行为参见 [spec-driven](../schemas/spec-driven/index.md)。

## 示例

一个填写完整的 .openspec.yaml：

```yaml
schema: spec-driven
created: 2026-08-14
goal: Add magic-link login to the API
affected_areas:
  - auth
  - api
```

## 校验

每当命令写入或读取该文件时都会进行校验。写入校验失败会抛出异常且不写入任何内容。读取已有文件时，若 YAML 无效、字段违反其约定，或 schema 名称不可用，则失败。文件缺失不算错误，该变更视为没有元数据。

与 [config.yaml](config-yaml.md) 不同，坏值不会仅以警告方式丢弃。元数据错误会中止命令。唯一的例外是未知的顶级键，它们会被忽略而不是被拒绝。
