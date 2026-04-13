# 快速上手

本指南介绍在你完成安装与初始化之后，OpenSpec 是如何工作的。安装说明请参见 [主 README](../README.md#quick-start)。

## 工作原理

OpenSpec 帮助你和你的 AI 编程助手在编写任何代码之前，就要构建的内容达成一致。

**默认快速路径（`core` 配置文件）：**

```text
/opsx:propose ──► /opsx:apply ──► /opsx:archive
```

**扩展路径（自定义工作流选择）：**

```text
/opsx:new ──► /opsx:ff 或 /opsx:continue ──► /opsx:apply ──► /opsx:verify ──► /opsx:archive
```

默认全局配置文件为 `core`，包含 `propose`、`explore`、`apply` 和 `archive`。你可以通过 `openspec-cn config profile` 启用扩展工作流命令，然后运行 `openspec-cn update`。

## OpenSpec 创建的内容

在运行 `openspec-cn init` 后，你的项目会拥有如下结构：

```
openspec/
├── specs/              # 单一事实来源（系统的行为）
│   └── <domain>/
│       └── spec.md
├── changes/            # 提议的更新（每个变更一个文件夹）
│   └── <change-name>/
│       ├── proposal.md
│       ├── design.md
│       ├── tasks.md
│       └── specs/      # 增量规范（正在变更的内容）
│           └── <domain>/
│               └── spec.md
└── config.yaml         # 项目配置（可选）
```

**两个关键目录：**

- **`specs/`** - 单一事实来源。这些规范描述了你系统当前的行为。按领域组织（例如 `specs/auth/`、`specs/payments/`）。

- **`changes/`** - 提议的修改。每个变更都有自己的文件夹，包含所有相关制品。当变更完成时，其规范会合并到主 `specs/` 目录中。

## 理解制品

每个变更文件夹包含用于指导工作的制品：

| 制品 | 用途 |
|----------|---------|
| `proposal.md` | "为什么"和"做什么" - 捕获意图、范围和方法 |
| `specs/` | 增量规范，显示新增/修改/删除的需求 |
| `design.md` | "如何做" - 技术方法和架构决策 |
| `tasks.md` | 带复选框的实施清单 |

**制品相互构建：**

```
proposal ──► specs ──► design ──► tasks ──► implement
   ▲           ▲          ▲                    │
   └───────────┴──────────┴────────────────────┘
            在学习过程中更新
```

在实施过程中，你可以随时返回并完善之前的制品。

## 增量规范如何工作

增量规范是 OpenSpec 的核心概念。它们显示相对于当前规范正在变化的内容。

### 格式

增量规范使用章节来指示变更类型：

```markdown
# 认证增量规范

## 新增需求

### 需求：双因素认证
系统必须在登录时要求第二因素。

#### 场景：需要 OTP
- 当 用户启用了 2FA
- 当 用户提交了有效凭证
- 则 显示 OTP 挑战

## 修改需求

### 需求：会话超时
系统必须在 30 分钟无活动后过期会话。
（之前为：60 分钟）

#### 场景：空闲超时
- 当 存在已认证的会话
- 当 30 分钟无活动
- 则 会话失效

## 移除需求

### 需求：记住我
（已弃用，改为使用 2FA）
```

### 归档时会发生什么

当你归档一个变更时：

1. **ADDED** 需求被追加到主规范
2. **MODIFIED** 需求替换现有版本
3. **REMOVED** 需求从主规范中删除

变更文件夹移动到 `openspec/changes/archive/` 用于审计历史。

## 示例：你的第一个变更

让我们逐步介绍如何为应用程序添加深色模式。

### 1. 开始变更（默认方式）

```text
你：/opsx:propose add-dark-mode

AI：已创建 openspec/changes/add-dark-mode/
     ✓ proposal.md — 为什么要做这个，变更内容是什么
     ✓ specs/       — 需求和场景
     ✓ design.md    — 技术方案
     ✓ tasks.md     — 实施清单
     已准备好实施！
```

如果你启用了扩展工作流配置文件，也可以分两步完成：先 `/opsx:new` 然后 `/opsx:ff`（或用 `/opsx:continue` 逐步完成）。

### 2. 创建的内容

**proposal.md** - 捕获意图：

```markdown
# 提案：添加深色模式

## 意图
用户要求提供深色模式选项，以减少夜间使用时的眼睛疲劳。

## 范围
- 在设置中添加主题切换
- 支持系统偏好检测
- 在 localStorage 中持久化偏好

## 方案
使用 CSS 自定义属性进行主题化，配合 React context
进行状态管理。
```

**specs/ui/spec.md** - 显示新需求的增量规范：

```markdown
# UI 增量规范

## 新增需求

### 需求：主题选择
系统必须允许用户在浅色和深色主题之间进行选择。

#### 场景：手动切换
- 当 用户在任意页面上
- 当 用户点击主题切换按钮
- 则 主题立即切换
- 并且 偏好在会话间持久化

#### 场景：系统偏好
- 当 用户没有保存的偏好
- 当 应用程序加载时
- 则 使用系统的首选配色方案
```

**tasks.md** - 实施清单：

```markdown
# 任务

## 1. 主题基础设施
- [ ] 1.1 创建带浅色/深色状态的 ThemeContext
- [ ] 1.2 添加用于颜色的 CSS 自定义属性
- [ ] 1.3 实现 localStorage 持久化

## 2. UI 组件
- [ ] 2.1 创建 ThemeToggle 组件
- [ ] 2.2 在设置页面中添加切换按钮
- [ ] 2.3 更新 Header 以包含快捷切换

## 3. 样式
- [ ] 3.1 定义深色主题调色板
- [ ] 3.2 更新组件以使用 CSS 变量
```

### 3. 实施

```
你：/opsx:apply

AI：正在处理任务...
     ✓ 1.1 创建了带浅色/深色状态的 ThemeContext
     ✓ 1.2 添加了 CSS 自定义属性到 globals.css
     ✓ 1.3 实现了 localStorage 持久化
     ✓ 2.1 创建了 ThemeToggle 组件
     ...
     所有任务完成！
```

在实施过程中，如果你发现设计需要调整，只需更新制品然后继续。

### 4. 归档

```
你：/opsx:archive

AI：正在归档 add-dark-mode...
     ✓ 已将规范合并到 openspec/specs/ui/spec.md
     ✓ 已移动到 openspec/changes/archive/2025-01-24-add-dark-mode/
     完成！准备下一个功能。
```

你的增量规范现在是主规范的一部分，记录了你系统的工作方式。

## 验证和审查

使用 CLI 检查你的变更：

```bash
# 列出活动变更
openspec-cn list

# 查看变更详情
openspec-cn show add-dark-mode

# 验证规范格式
openspec-cn validate add-dark-mode

# 交互式仪表盘
openspec-cn view
```

## 下一步

- [工作流](workflows.md) - 常见模式以及何时使用每个命令
- [命令](commands.md) - 所有斜杠命令的完整参考
- [概念](concepts.md) - 深入理解规范、变更和模式
- [自定义](customization.md) - 让 OpenSpec 按你的方式工作
