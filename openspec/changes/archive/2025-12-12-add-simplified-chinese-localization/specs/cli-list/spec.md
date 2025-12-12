## MODIFIED Requirements

### Requirement: Empty State
命令SHALL在所选模式下没有项目时提供清晰的反馈。

#### Scenario: 处理空状态（更改）
- **WHEN** 没有活动的更改（仅archive/或空的changes/）
- **THEN** 显示："未找到活动的更改。"

#### Scenario: 处理空状态（规范）
- **WHEN** 规范目录不存在或不包含任何能力
- **THEN** 显示："未找到规范。"

### Requirement: Error Handling
命令SHALL使用适当的消息优雅地处理缺失的文件和目录。

#### Scenario: 缺少tasks.md文件
- **WHEN** 更改目录没有`tasks.md`文件
- **THEN** 显示带有"无任务"状态的更改

#### Scenario: 缺少更改目录
- **WHEN** `openspec/changes/`目录不存在
- **THEN** 显示错误："未找到OpenSpec更改目录。请先运行'openspec init'。"
- **AND** 以代码1退出