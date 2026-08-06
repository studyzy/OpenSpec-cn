## Why

<!-- 说明这次变更的动机。它解决了什么问题？为什么是现在？ -->

## What Changes

<!-- 描述将要变更的内容。明确写出新增能力、修改内容或移除项。 -->

## Capabilities

### New Capabilities
<!-- 引入的新能力。你新引入的路径片段使用 kebab-case
     （例如 user-auth 或 identity/user-auth），并遵循项目现有的
     spec 组织方式。每一项都会创建 specs/<capability-path>/spec.md。 -->
- `<capability-path>`: <这个能力涵盖内容的简要描述>

### Modified Capabilities
<!-- 需求（REQUIREMENTS）发生变化的既有能力（只改实现不算）。
     仅当 spec 层面的行为发生变化时才列在这里。每一项都需要一个增量规范文件。
     使用 openspec/specs/ 下已存在的精确路径。若没有需求变化则留空。
     完全没有涉及任何能力的变更（纯重构、工具链、文档）
     必须在其 .openspec.yaml 中设置 `skip_specs: true` ——
     openspec-cn validate 会拒绝没有该标记的零 delta 变更。
     不要为了通过校验而臆造需求。 -->
- `<existing-capability-path>`: <哪条需求正在发生变化>

## Impact

<!-- 受影响的代码、API、依赖、系统 -->
