import { execSync, execFileSync } from 'child_process';
import { createRequire } from 'module';
import os from 'os';

const require = createRequire(import.meta.url);
const MAX_TITLE_LENGTH = 72;
const TITLE_PREFIX = '反馈: ';

/**
 * Check if gh CLI is installed and available in PATH
 * Uses platform-appropriate command: 'where' on Windows, 'which' on Unix/macOS
 */
function isGhInstalled(): boolean {
  try {
    const command = process.platform === 'win32' ? 'where gh' : 'which gh';
    execSync(command, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if gh CLI is authenticated
 */
function isGhAuthenticated(): boolean {
  try {
    execSync('gh auth status', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get OpenSpec version from package.json
 */
function getVersion(): string {
  try {
    const { version } = require('../../package.json');
    return version;
  } catch {
    return 'unknown';
  }
}

/**
 * Get platform name
 */
function getPlatform(): string {
  return os.platform();
}

/**
 * Get current timestamp in ISO format
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Generate metadata footer for feedback
 */
function generateMetadata(): string {
  const version = getVersion();
  const platform = getPlatform();
  const timestamp = getTimestamp();

  return `---
通过 OpenSpec CLI 提交
- 版本: ${version}
- 平台: ${platform}
- 时间戳: ${timestamp}`;
}

/**
 * Format the feedback title
 */
function formatTitle(message: string): string {
  const normalizedMessage = message.replace(/\s+/g, ' ').trim();
  const title = `${TITLE_PREFIX}${normalizedMessage}`;

  if (Array.from(title).length <= MAX_TITLE_LENGTH) {
    return title;
  }

  const availableLength = MAX_TITLE_LENGTH - TITLE_PREFIX.length - 1;
  let candidate = '';
  let candidateLength = 0;
  const segments = new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(
    normalizedMessage
  );

  for (const { segment } of segments) {
    const segmentLength = Array.from(segment).length;
    if (candidateLength + segmentLength > availableLength) {
      break;
    }
    candidate += segment;
    candidateLength += segmentLength;
  }

  candidate = candidate.trimEnd();
  const lastSpace = candidate.lastIndexOf(' ');
  const summary = lastSpace > 0 ? candidate.slice(0, lastSpace) : candidate;
  return `${TITLE_PREFIX}${summary}…`;
}

/**
 * Format the full feedback body
 */
function formatBody(message: string, bodyText?: string): string {
  const parts = ['## Summary', '', message];

  if (bodyText) {
    parts.push('', '## Details', '', bodyText);
  }

  parts.push('', generateMetadata());

  return parts.join('\n');
}

/**
 * Generate a pre-filled GitHub issue URL for manual submission
 */
function generateManualSubmissionUrl(title: string, body: string): string {
  const repo = 'studyzy/OpenSpec-cn';
  const encodedTitle = encodeURIComponent(title);
  const encodedBody = encodeURIComponent(body);
  const encodedLabels = encodeURIComponent('feedback');

  return `https://github.com/${repo}/issues/new?title=${encodedTitle}&body=${encodedBody}&labels=${encodedLabels}`;
}

/**
 * Display formatted feedback content for manual submission
 */
function displayFormattedFeedback(title: string, body: string): void {
  console.log('\n--- 格式化后的反馈内容 ---');
  console.log(`标题: ${title}`);
  console.log(`标签: feedback`);
  console.log('\n正文:');
  console.log(body);
  console.log('--- 反馈结束 ---\n');
}

/**
 * Check whether gh refused the issue because the repository does not define
 * the label. gh resolves label names before creating the issue, so this
 * failure means no issue was created.
 *
 * Only gh's stderr is inspected. The error message also embeds the command
 * line, which carries the user's own feedback text.
 */
function isMissingLabelError(error: any): boolean {
  return /could not add label/i.test(error?.stderr?.toString() ?? '');
}

/**
 * Report a gh CLI failure and exit, preserving gh's exit code.
 *
 * gh failed after the user already typed their feedback (issues disabled,
 * network, rate limit, ...), so show the same manual-submission path the
 * missing-gh and unauthenticated flows get instead of discarding the text.
 */
function reportGhFailure(error: any, title: string, body: string): void {
  // Display the error output from gh CLI
  if (error.stderr) {
    console.error(error.stderr.toString());
  } else if (error.message) {
    console.error(error.message);
  }

  displayFormattedFeedback(title, body);

  const manualUrl = generateManualSubmissionUrl(title, body);
  console.log('请手动提交您的反馈：');
  console.log(manualUrl);

  // Exit with the same code as gh CLI
  process.exit(error.status ?? 1);
}

/**
 * Create the feedback issue via gh CLI
 * Uses execFileSync to prevent shell injection vulnerabilities
 */
function createIssue(title: string, body: string, labels: string[]): string {
  const args = [
    'issue',
    'create',
    '--repo',
    'studyzy/OpenSpec-cn',
    '--title',
    title,
    '--body',
    body,
  ];

  for (const label of labels) {
    args.push('--label', label);
  }

  const result = execFileSync('gh', args, { encoding: 'utf-8', stdio: 'pipe' });

  return result.trim();
}

/**
 * Submit feedback via gh CLI
 */
function submitViaGhCli(title: string, body: string): void {
  let issueUrl: string;
  let labelApplied = true;

  try {
    issueUrl = createIssue(title, body, ['feedback']);
  } catch (error: any) {
    if (!isMissingLabelError(error)) {
      reportGhFailure(error, title, body);
      return;
    }

    // The repository does not define the 'feedback' label. Nothing was
    // created, so retry unlabeled rather than dropping the feedback.
    try {
      issueUrl = createIssue(title, body, []);
      labelApplied = false;
    } catch (retryError: any) {
      reportGhFailure(retryError, title, body);
      return;
    }
  }

  console.log(`\n✓ 反馈提交成功！`);
  console.log(`Issue 链接：${issueUrl}\n`);

  if (!labelApplied) {
    console.log(
      "注意：因仓库未定义 'feedback' 标签，Issue 未附带该标签创建。\n"
    );
  }
}

/**
 * Handle fallback when gh CLI is not available or not authenticated
 */
function handleFallback(title: string, body: string, reason: 'missing' | 'unauthenticated'): void {
  if (reason === 'missing') {
    console.log('⚠️  未找到 GitHub CLI。需要手动提交。');
  } else {
    console.log('⚠️  GitHub 未认证。需要手动提交。');
  }

  displayFormattedFeedback(title, body);

  const manualUrl = generateManualSubmissionUrl(title, body);
  console.log('请手动提交您的反馈:');
  console.log(manualUrl);

  if (reason === 'unauthenticated') {
    console.log('\n若要将来自动提交，请运行: gh auth login');
  }

  // Exit with success code (fallback is successful)
  process.exit(0);
}

/**
 * Feedback command implementation
 */
export class FeedbackCommand {
  async execute(message: string, options?: { body?: string }): Promise<void> {
    // Format title and body once for all code paths
    const title = formatTitle(message);
    const body = formatBody(message, options?.body);

    // Check if gh CLI is installed
    if (!isGhInstalled()) {
      handleFallback(title, body, 'missing');
      return;
    }

    // Check if gh CLI is authenticated
    if (!isGhAuthenticated()) {
      handleFallback(title, body, 'unauthenticated');
      return;
    }

    // Submit via gh CLI
    submitViaGhCli(title, body);
  }
}
