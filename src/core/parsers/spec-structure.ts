const REQUIREMENTS_SECTION_HEADER = /^##\s+Requirements\s*$/i;
const TOP_LEVEL_SECTION_HEADER = /^##\s+/;
const DELTA_HEADER = /^##\s+(ADDED|MODIFIED|REMOVED|RENAMED)\s+Requirements\s*$/i;
const REQUIREMENT_HEADER = /^###\s+Requirement:\s*(.+)\s*$/;

export interface MainSpecStructureIssue {
  kind: 'delta-header' | 'requirement-outside-requirements';
  line: number;
  header: string;
  message: string;
}

export function findMainSpecStructureIssues(content: string): MainSpecStructureIssue[] {
  const normalized = content.replace(/\r\n?/g, '\n');
  const stripped = stripFencedCodeBlocksPreservingLines(normalized);
  const lines = stripped.split('\n');
  const issues: MainSpecStructureIssue[] = [];

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
          `主规范包含增量标题 "${trimmed}"。` +
          '增量标题仅在 openspec/changes/<name>/specs/<capability>/spec.md 中有效，' +
          '并且会截断已解析的 ## Requirements 部分。',
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
          `需求标题 "${trimmed}" 出现在主 ## Requirements 部分之外。` +
          '主规范仅解析该部分内的需求，因此该需求当前对验证、列出和归档操作不可见。',
      });
    }
  }

  return issues;
}

export function stripFencedCodeBlocksPreservingLines(content: string): string {
  const lines = content.split('\n');
  const output: string[] = [];
  let activeFence: { marker: '`' | '~'; length: number } | null = null;

  for (const line of lines) {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})(.*)$/);

    if (!activeFence) {
      if (fenceMatch) {
        activeFence = {
          marker: fenceMatch[1][0] as '`' | '~',
          length: fenceMatch[1].length,
        };
        output.push('');
      } else {
        output.push(line);
      }
      continue;
    }

    output.push('');

    if (isClosingFence(line, activeFence)) {
      activeFence = null;
    }
  }

  return output.join('\n');
}

function isClosingFence(
  line: string,
  activeFence: { marker: '`' | '~'; length: number }
): boolean {
  const fenceMatch = line.match(/^\s*(`{3,}|~{3,})\s*$/);
  return Boolean(
    fenceMatch &&
    fenceMatch[1][0] === activeFence.marker &&
    fenceMatch[1].length >= activeFence.length
  );
}
