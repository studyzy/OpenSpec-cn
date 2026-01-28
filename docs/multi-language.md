# 多语言指南

配置 OpenSpec 以生成非英语语言的制品。

## 快速设置

将语言指令添加到您的 `openspec/config.yaml` 中：

```yaml
schema: spec-driven

context: |
  Language: Portuguese (pt-BR)
  All artifacts must be written in Brazilian Portuguese.

  # 您的其他项目上下文如下...
  Tech stack: TypeScript, React, Node.js
```

就这样。所有生成的制品现在都将使用葡萄牙语。

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
  所有产出物必须用简体中文撰写。
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

语言设置与您的其他项目上下文配合使用：

```yaml
schema: spec-driven

context: |
  Language: Portuguese (pt-BR)
  All artifacts must be written in Brazilian Portuguese.

  Tech stack: TypeScript, React 18, Node.js 20
  Database: PostgreSQL with Prisma ORM
```

## 验证

要验证您的语言配置是否正常工作：

```bash
# 检查指令 - 应该显示您的语言上下文
openspec-cn instructions proposal --change my-change

# 输出将包含您的语言上下文
```

## 相关文档

- [自定义指南](./customization.md) - 项目配置选项
- [工作流指南](./workflows.md) - 完整工作流文档
