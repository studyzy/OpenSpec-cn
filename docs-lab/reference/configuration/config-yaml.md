# 项目配置（config.yaml）

> openspec/config.yaml 的每一个字段：这个项目规划时使用的 schema、上下文与规则。

## 位置

每个 OpenSpec 项目都将配置文件保存在项目根目录的 `openspec/config.yaml`。

## 字段

| 键 | 类型 | 必填 | 作用 |
| --- | --- | --- | --- |
| `schema` | string | Yes | 该项目变更遵循的工作流 schema |
| `context` | string | No | 注入到每个制品的指令中 |
| `rules` | map: artifact ID → list of strings | No | 添加到某个制品内置指引之上的额外规则 |
| `operations` | map: operation → guidance list | No | 针对 apply 与 archive 工作的建议性指引 |
| `store` | string | No | 当此 openspec/ 仅为纯配置时的回退 OpenSpec 根目录 |
| `references` | list | No | 其 specs 被编入指令索引的 store |

无效字段永远不会让命令失败。每个字段单独校验，坏值会以警告方式丢弃。

这些字段中该写什么，参见 [项目配置](../../customize/project-config.md)。

### schema

该项目中每个变更遵循的工作流 schema。有效值为 `spec-driven` 或项目自定义的 schema 名称。名称列在 [Schemas](../schemas/index.md) 中。

### context

注入到每个制品的指令中的自由文本。上限为 50KB，更大的值会被忽略并发出警告。

### rules

针对某个制品的额外规则，添加到 schema 的内置指引之上：

```yaml
rules:
  proposal:
    - Keep proposals under 500 words
```

制品 ID 不限于内置名称，因此自定义 schema 的制品也可以作为键。

### operations

针对 apply 与 archive 工作如何开展的建议性指引，与制品规则分开存放：

```yaml
operations:
  apply:
    guidance:
      - Keep test summaries concise
```

只读取 `apply` 和 `archive`。

### store

用作 OpenSpec 根目录的 store id，仅当此 openspec/ 目录为纯配置（没有 specs/ 或 changes/）时才查询。它是回退，绝不是覆盖。完整的解析阶梯参见 [根目录解析](../../multi-repo/stores.md#where-artifacts-get-created-when-using-stores)。

### references

该项目工作所引用的 store id。每个 store 的 specs 索引（id、摘要、获取命令）会被添加到指令输出中。spec 内容绝不会内联，根目录解析也绝不受影响。条目是一个 store id，或一个包含 `id` 和可选 `remote` 克隆源的映射：

```yaml
references:
  - platform-specs
  - id: billing-specs
    remote: git@github.com:acme/billing-specs.git
```

## 示例

一个填写完整的 config.yaml：

```yaml
schema: spec-driven

context: |
  Tech stack: TypeScript, React, Node.js
  We use conventional commits
  Domain: e-commerce platform

rules:
  proposal:
    - Keep proposals under 500 words
    - Always include a "Non-goals" section
  tasks:
    - Break tasks into chunks of max 2 hours

operations:
  apply:
    guidance:
      - Keep test summaries concise
  archive:
    guidance:
      - Summarize the archive outcome before finishing
```

## 旧名称

当 `config.yaml` 不存在时，`openspec/config.yml` 会被作为别名读取。当两个文件都存在时，`config.yaml` 优先，`config.yml` 被忽略。`openspec-cn init` 创建的是 `config.yaml`。
