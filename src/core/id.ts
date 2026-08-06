/**
 * The one kebab id grammar. Store ids, change ids, and legacy initiative ids
 * all share it.
 */
export const KEBAB_ID_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export function isKebabId(value: string): boolean {
  return KEBAB_ID_REGEX.test(value);
}

/** Human rendering of the grammar, shared so the wording never forks. */
export const KEBAB_ID_DESCRIPTION =
  '必须是 kebab-case 形式，仅含小写字母、数字，以及单个连字符作为分隔符';

/** The fix-line twin of KEBAB_ID_DESCRIPTION, shared for the same reason. */
export const KEBAB_ID_FIX =
  '请使用 kebab-case 形式，仅含小写字母、数字，以及单个连字符作为分隔符。';

/**
 * The folder-safe-name grammar (store ids layer the kebab grammar on
 * top of it; workset member labels use it alone). Returns a problem
 * description, or null when valid.
 */
export function folderStyleNameProblem(
  value: string,
  label: string
): string | null {
  if (value.length === 0) {
    return `${label}不能为空`;
  }

  if (value === '.' || value === '..') {
    return `${label}不能是 '${value}'`;
  }

  if (/[\\/]/u.test(value)) {
    return `${label}不能包含路径分隔符`;
  }

  return null;
}
