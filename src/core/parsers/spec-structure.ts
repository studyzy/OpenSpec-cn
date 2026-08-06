import { buildCodeFenceMask } from './code-fence.js';

const REQUIREMENTS_SECTION_HEADER = /^##\s+Requirements\s*$/i;
const TOP_LEVEL_SECTION_HEADER = /^##\s+/;
const DELTA_HEADER = /^##\s+(ADDED|MODIFIED|REMOVED|RENAMED)\s+Requirements\s*$/i;
const REQUIREMENT_HEADER = /^###\s+Requirement:\s*(.+)\s*$/i;

export interface MainSpecStructureIssue {
  kind: 'delta-header' | 'requirement-outside-requirements' | 'duplicate-requirement';
  line: number;
  header: string;
  message: string;
}

export function findMainSpecStructureIssues(content: string): MainSpecStructureIssue[] {
  const normalized = content.replace(/\r\n?/g, '\n');
  const stripped = stripFencedCodeBlocksPreservingLines(normalized);
  const lines = stripped.split('\n');
  const issues: MainSpecStructureIssue[] = [];
  const requirementLines = new Map<string, number>();

  const requirementsHeaderIndex = lines.findIndex(line => REQUIREMENTS_SECTION_HEADER.test(line));
  let requirementsEndIndex = lines.length;

  if (requirementsHeaderIndex !== -1) {
    for (let i = requirementsHeaderIndex + 1; i < lines.length; i++) {
      if (TOP_LEVEL_SECTION_HEADER.test(lines[i])) {
        requirementsEndIndex = i;
        break;
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    if (DELTA_HEADER.test(line)) {
      issues.push({
        kind: 'delta-header',
        line: i + 1,
        header: trimmed,
        message:
          `主 spec 包含 delta 标题 "${trimmed}"。` +
          'Delta 标题仅在 openspec/changes/<name>/specs/<capability-path>/spec.md 内有效，' +
          '并会截断已解析的 ## Requirements 章节。',
      });
      continue;
    }

    const requirementMatch = line.match(REQUIREMENT_HEADER);
    if (!requirementMatch) {
      continue;
    }

    const insideRequirements =
      requirementsHeaderIndex !== -1 &&
      i > requirementsHeaderIndex &&
      i < requirementsEndIndex;

    if (!insideRequirements) {
      issues.push({
        kind: 'requirement-outside-requirements',
        line: i + 1,
        header: trimmed,
        message:
          `需求标题 "${trimmed}" 出现在主 ## Requirements 章节之外。` +
          '主 spec 仅解析该章节内的需求，因此该需求目前对 validate、list 和 archive 不可见。',
      });
      continue;
    }

    const requirementName = requirementMatch[1].trim();
    const previousLine = requirementLines.get(requirementName);
    if (previousLine !== undefined) {
      issues.push({
        kind: 'duplicate-requirement',
        line: i + 1,
        header: trimmed,
        message:
          `Requirement header "${trimmed}" duplicates the requirement declared on line ${previousLine}. ` +
          'Requirement names must be unique so spec updates cannot discard one block while updating another.',
      });
    } else {
      requirementLines.set(requirementName, i + 1);
    }
  }

  return issues;
}

export function stripFencedCodeBlocksPreservingLines(content: string): string {
  const lines = content.split('\n');
  const mask = buildCodeFenceMask(lines);
  return lines.map((line, i) => (mask[i] ? '' : line)).join('\n');
}
