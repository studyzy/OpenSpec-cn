# 多语言指南

配置 OpenSpec，让其以英语以外的语言生成制品。

## 快速设置

对于新项目，可在初始化时设置语言：

```bash
openspec-cn init --language "Portuguese (pt-BR)"
```

这会把语言指令写入 `openspec/config.yaml`。如果项目已有配置，请直接编辑其 `context` 字段，以便保留既有的项目指引。

你也可以手动配置同样的行为：

在你的 `openspec/config.yaml` 里加上语言指令：

```yaml
schema: spec-driven

context: |
  Language: Portuguese (pt-BR)
  All artifacts must be written in Brazilian Portuguese.
  Keep OpenSpec structural headings and SHALL/MUST keywords in English.

  # 项目上下文如下...
  Tech stack: TypeScript, React, Node.js
```

就这么简单。所有生成的制品现在都是葡萄牙语。

OpenSpec 的文档结构和规范性 `SHALL`/`MUST` 关键字保持英文，因为校验依赖它们。周围的需求与场景正文可以使用你选择的语言。

## 语言示例

### 葡萄牙语（巴西）

```yaml
context: |
  Language: Portuguese (pt-BR)
  All artifacts must be written in Brazilian Portuguese.
```

### 西班牙语

```yaml
context: |
  Idioma: Español
  Todos los artefactos deben escribirse en español.
```

### 中文（简体）

```yaml
context: |
  语言：中文（简体）
  所有制品必须用简体中文撰写。
```

### 日语

```yaml
context: |
  言語：日本語
  すべての成果物は日本語で作成してください。
```

### 法语

```yaml
context: |
  Langue : Français
  Tous les artefacts doivent être rédigés en français.
```

### 德语

```yaml
context: |
  Sprache: Deutsch
  Alle Artefakte müssen auf Deutsch verfasst werden.
```

## 提示

### 处理技术术语

决定如何处理技术术语：

```yaml
context: |
  Language: Japanese
  Write in Japanese, but:
  - Keep technical terms like "API", "REST", "GraphQL" in English
  - Code examples and file paths remain in English
```

### 与其他上下文结合

语言设置可以与你的其他项目上下文一起工作：

```yaml
schema: spec-driven

context: |
  Language: Portuguese (pt-BR)
  All artifacts must be written in Brazilian Portuguese.

  Tech stack: TypeScript, React 18, Node.js 20
  Database: PostgreSQL with Prisma ORM
```

## 验证

要验证你的语言配置是否生效：

```bash
# 检查 instructions —— 应该显示你的语言上下文
openspec-cn instructions proposal --change my-change

# 输出会包含你的语言上下文
```

## 相关文档

- [自定义指南](./customization.md) - 项目配置选项
- [工作流指南](./workflows.md) - 完整工作流文档
