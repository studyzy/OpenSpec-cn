## MODIFIED Requirements

### Requirement: Progress Indicators
命令SHALL在初始化期间显示进度指示器，以提供关于每个步骤的清晰反馈。

#### Scenario: 显示初始化进度（汉化为中文）
- **WHEN** 执行初始化步骤
- **THEN** 在后台静默验证环境（除非出错否则无输出）
- **AND** 使用ora旋转器显示中文进度：
  - 显示旋转器："⠋ 正在创建OpenSpec结构..."
  - 然后显示成功："✔ OpenSpec结构已创建"
  - 显示旋转器："⠋ 正在配置AI工具..."
  - 然后显示成功："✔ AI工具已配置"

### Requirement: Interactive Mode
命令SHALL为AI工具选择提供交互式菜单和清晰的导航说明。

#### Scenario: 显示交互式菜单（汉化为中文）
- **WHEN** 在新建或扩展模式下运行
- **THEN** 呈现中文选择菜单，允许用户使用空格键切换工具，使用回车键确认选择
- **AND** 显示中文提示说明空格键用于切换工具，回车键用于选择高亮工具并确认选择