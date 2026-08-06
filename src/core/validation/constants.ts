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
  REQUIREMENT_NO_SHALL: '需求必须包含 SHALL 或 MUST 关键字',
  REQUIREMENT_NO_SCENARIOS: '需求必须至少有一个场景',
  SPEC_NAME_EMPTY: 'Spec 名称不能为空',
  SPEC_PURPOSE_EMPTY: 'Purpose 章节不能为空',
  SPEC_NO_REQUIREMENTS: 'Spec 必须至少有一个需求',
  CHANGE_NAME_EMPTY: 'Change 名称不能为空',
  CHANGE_WHY_TOO_SHORT: `Why 章节必须至少 ${MIN_WHY_SECTION_LENGTH} 个字符`,
  CHANGE_WHY_TOO_LONG: `Why 章节不应超过 ${MAX_WHY_SECTION_LENGTH} 个字符`,
  CHANGE_WHAT_EMPTY: 'What Changes 章节不能为空',
  CHANGE_NO_DELTAS: 'Change 必须至少有一个 delta',
  CHANGE_SKIP_SPECS_CONFLICT:
    'skip_specs is set in .openspec.yaml but spec files exist under specs/. Remove skip_specs or delete the delta spec files',
  CHANGE_SKIP_SPECS_ACCEPTED:
    'skip_specs is set in .openspec.yaml: change declares no spec-level behavior changes, zero deltas accepted',
  CHANGE_SKIP_SPECS_INVALID_METADATA:
    'skip_specs is set but .openspec.yaml is not valid change metadata, so the marker is not honored. Fix the metadata',
  CHANGE_TOO_MANY_DELTAS: `超过 ${MAX_DELTAS_PER_CHANGE} 个 delta 时请考虑拆分 change`,
  DELTA_SPEC_EMPTY: 'Spec 名称不能为空',
  DELTA_DESCRIPTION_EMPTY: 'Delta 描述不能为空',
  // Warnings
  PURPOSE_TOO_BRIEF: `Purpose 章节过于简短（少于 ${MIN_PURPOSE_LENGTH} 个字符）`,
  REQUIREMENT_TOO_LONG: `需求文本过长（>${MAX_REQUIREMENT_TEXT_LENGTH} 个字符）。考虑拆分。`,
  DELTA_DESCRIPTION_TOO_BRIEF: 'Delta 描述过于简短',
  DELTA_MISSING_REQUIREMENTS: 'Delta 应包含需求',

  // Guidance snippets (appended to primary messages for remediation)
  GUIDE_NO_DELTAS:
    '未找到 deltas。请确保变更在 specs/ 目录中有能力文件夹（例如 specs/http-server/spec.md），其中包含使用 delta 标题（## ADDED/MODIFIED/REMOVED/RENAMED Requirements）的 .md 文件，并且每个需求至少包含一个 "#### Scenario:" 块。如果此变更故意不修改任何 spec（纯重构、工具、文档），请在变更的 .openspec.yaml 中设置 "skip_specs: true"。提示：运行 "openspec change show <change-id> --json --deltas-only" 查看解析出的 deltas。',
  GUIDE_MISSING_SPEC_SECTIONS:
    '缺少必要章节。期望标题："## Purpose" 和 "## Requirements"。示例：\n## Purpose\n[简短用途]\n\n## Requirements\n### Requirement: 清晰的需求陈述\nUsers SHALL ...\n\n#### Scenario: 描述性名称\n- **WHEN** ...\n- **THEN** ...',
  GUIDE_MISSING_CHANGE_SECTIONS:
    '缺少必要章节。期望标题："## Why" 和 "## What Changes"。确保 delta 已使用 delta 标题记录在 specs/ 中。',
  GUIDE_SCENARIO_FORMAT:
    '场景必须使用 4 级标题。将列表转换为：\n#### Scenario: 简短名称\n- **WHEN** ...\n- **THEN** ...\n- **AND** ...',
} as const;
