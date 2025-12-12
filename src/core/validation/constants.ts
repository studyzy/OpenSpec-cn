/**
 * Validation threshold constants
 */

// Minimum character lengths
export const MIN_WHY_SECTION_LENGTH = 50;
export const MIN_PURPOSE_LENGTH = 50;

// Maximum character/item limits
export const MAX_WHY_SECTION_LENGTH = 1000;
export const MAX_REQUIREMENT_TEXT_LENGTH = 500;
export const MAX_DELTAS_PER_CHANGE = 10;

// Validation messages
export const VALIDATION_MESSAGES = {
  // Required content
  SCENARIO_EMPTY: '场景文本不能为空',
  REQUIREMENT_EMPTY: '需求文本不能为空',
  REQUIREMENT_NO_SHALL: '需求必须包含 SHALL、MUST、必须或禁止关键字',
  REQUIREMENT_NO_SCENARIOS: '需求必须至少有一个场景',
  SPEC_NAME_EMPTY: '规范名称不能为空',
  SPEC_PURPOSE_EMPTY: '目的部分不能为空',
  SPEC_NO_REQUIREMENTS: '规范必须至少有一个需求',
  CHANGE_NAME_EMPTY: '变更名称不能为空',
  CHANGE_WHY_TOO_SHORT: `为什么部分必须至少${MIN_WHY_SECTION_LENGTH}个字符`,
  CHANGE_WHY_TOO_LONG: `为什么部分不应超过${MAX_WHY_SECTION_LENGTH}个字符`,
  CHANGE_WHAT_EMPTY: '变更内容部分不能为空',
  CHANGE_NO_DELTAS: '变更必须至少有一个增量',
  CHANGE_TOO_MANY_DELTAS: `考虑拆分包含超过${MAX_DELTAS_PER_CHANGE}个增量的变更`,
  DELTA_SPEC_EMPTY: '规范名称不能为空',
  DELTA_DESCRIPTION_EMPTY: '增量描述不能为空',
  
  // Warnings
  PURPOSE_TOO_BRIEF: `目的部分太简短（少于${MIN_PURPOSE_LENGTH}个字符）`,
  REQUIREMENT_TOO_LONG: `需求文本太长（>${MAX_REQUIREMENT_TEXT_LENGTH}个字符）。考虑拆分它。`,
  DELTA_DESCRIPTION_TOO_BRIEF: '增量描述太简短',
  DELTA_MISSING_REQUIREMENTS: '增量应包含需求',
  
  // Guidance snippets (appended to primary messages for remediation)
  GUIDE_NO_DELTAS:
    '未找到增量。确保您的变更在specs/目录下有功能文件夹（例如specs/http-server/spec.md），其中包含使用增量标题（## 新增需求/修改需求/移除需求/重命名需求）的.md文件，并且每个需求至少包含一个"#### 场景："块。提示：运行"openspec-cn change show <change-id> --json --deltas-only"来检查解析的增量。',
  GUIDE_MISSING_SPEC_SECTIONS:
    '缺少必需部分。预期标题："## 目的"和"## 需求"。示例：\n## 目的\n[简要目的]\n\n## 需求\n### 需求：清晰的需求陈述\n用户应当...\n\n#### 场景：描述性名称\n- **当** ...\n- **那么** ...',
  GUIDE_MISSING_CHANGE_SECTIONS:
    '缺少必需部分。预期标题："## 为什么"和"## 变更内容"。确保在specs/中使用增量标题记录增量。',
  GUIDE_SCENARIO_FORMAT:
    '场景必须使用四级标题。将项目符号列表转换为：\n#### 场景：简短名称\n- **当** ...\n- **那么** ...\n- **并且** ...',
} as const;