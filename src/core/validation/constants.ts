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

// The Purpose `openspec archive` writes into a main spec it creates when the
// delta introduced the capability without a usable `## Purpose`. Named here, and
// composed from these two halves at the write site, so validation recognises the
// placeholder through the same definition that produces it: a second, hand-copied
// spelling would stop matching the day the wording changed, and a check that
// matches nothing looks exactly like a check that found nothing.
export const PURPOSE_PLACEHOLDER_PREFIX = 'TBD - created by archiving change ';
export const PURPOSE_PLACEHOLDER_SUFFIX = '. Update Purpose after archive.';

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
    '.openspec.yaml 中设置了 skip_specs，但 specs/ 下存在 spec 文件。请移除 skip_specs，或删除这些增量 spec 文件',
  CHANGE_SKIP_SPECS_ACCEPTED:
    '.openspec.yaml 中设置了 skip_specs：该变更声明不涉及 spec 层面的行为变化，接受零个 delta',
  CHANGE_SKIP_SPECS_INVALID_METADATA:
    '设置了 skip_specs，但 .openspec.yaml 不是有效的变更元数据，因此该标记不生效。请修正元数据',
  CHANGE_TOO_MANY_DELTAS: `超过 ${MAX_DELTAS_PER_CHANGE} 个 delta 时请考虑拆分 change`,
  DELTA_SPEC_EMPTY: 'Spec 名称不能为空',
  DELTA_DESCRIPTION_EMPTY: 'Delta 描述不能为空',
  // Warnings
  PURPOSE_TOO_BRIEF: `Purpose 章节过于简短（少于 ${MIN_PURPOSE_LENGTH} 个字符）`,
  PURPOSE_IS_PLACEHOLDER:
    'Purpose 章节仍是占位符，而非任何人撰写的 Purpose（即 `openspec-cn archive` 为新能力写入的句子，或留在原处的 `TBD`/`TODO` 标记）。请将其替换为对该能力用途的描述，直接编辑主 spec：delta 中的 `## Purpose` 仅在该能力创建时被读取，因此它无法替代此章节。',
  REQUIREMENT_TOO_LONG: `需求文本过长（>${MAX_REQUIREMENT_TEXT_LENGTH} 个字符）。考虑拆分。`,
  DELTA_DESCRIPTION_TOO_BRIEF: 'Delta 描述过于简短',
  DELTA_MISSING_REQUIREMENTS: 'Delta 应包含需求',
  // Guidance snippets (appended to primary messages for remediation)
  GUIDE_NO_DELTAS:
    '未找到 deltas。请确保变更在 specs/ 目录中有能力文件夹（例如 specs/http-server/spec.md），其中包含使用 delta 标题（## ADDED/MODIFIED/REMOVED/RENAMED Requirements）的 .md 文件，并且每个需求至少包含一个 "#### Scenario:" 块。如果此变更故意不修改任何 spec（纯重构、工具、文档），请在变更的 .openspec.yaml 中设置 "skip_specs: true"。提示：运行 "openspec-cn change show <change-id> --json --deltas-only" 查看解析出的 deltas。',
  GUIDE_MISSING_SPEC_SECTIONS:
    '缺少必要章节。期望标题："## Purpose" 和 "## Requirements"。示例：\n## Purpose\n[简短用途]\n\n## Requirements\n### Requirement: 清晰的需求陈述\nUsers SHALL ...\n\n#### Scenario: 描述性名称\n- **WHEN** ...\n- **THEN** ...',
  GUIDE_MISSING_CHANGE_SECTIONS:
    '缺少必要章节。期望标题："## Why" 和 "## What Changes"。确保 delta 已使用 delta 标题记录在 specs/ 中。',
  GUIDE_SCENARIO_FORMAT:
    '场景必须使用 4 级标题。将列表转换为：\n#### Scenario: 简短名称\n- **WHEN** ...\n- **THEN** ...\n- **AND** ...',
} as const;
