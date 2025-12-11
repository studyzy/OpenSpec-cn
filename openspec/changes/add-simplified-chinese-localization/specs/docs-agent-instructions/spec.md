## ADDED Requirements

### Requirement: 多语言AI指令
OpenSpec SHALL为AI助手提供简体中文的指令文档，同时保持英文版本作为备用。

#### Scenario: 中文AI助手支持
- **WHEN** AI助手配置为使用中文界面
- **THEN** 提供简体中文版本的AGENTS.md文档
- **AND** 文档内容完全本地化，包括工作流程说明和最佳实践

#### Scenario: 向后兼容性
- **WHEN** 中文环境不可用或配置错误
- **THEN** 自动回退到英文版本的AGENTS.md文档
- **AND** 所有功能保持正常工作

### Requirement: 本地化模板生成
系统SHALL根据检测到的语言生成相应语言的模板文件。

#### Scenario: 中文模板生成
- **WHEN** 在中文环境下运行`openspec init`
- **THEN** 生成简体中文版本的AGENTS.md文件
- **AND** 生成的slash command模板使用中文内容
- **AND** 所有用户界面文本使用中文显示

#### Scenario: 英文模板生成
- **WHEN** 在非中文环境下运行`openspec init`
- **THEN** 生成英文版本的AGENTS.md文件
- **AND** 保持现有的英文模板内容