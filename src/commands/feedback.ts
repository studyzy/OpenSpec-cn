import { execSync, execFileSync } from 'child_process';
import { createRequire } from 'module';
import os from 'os';

const require = createRequire(import.meta.url);

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
  return `反馈: ${message}`;
}

/**
 * Format the full feedback body
 */
function formatBody(bodyText?: string): string {
  const parts: string[] = [];

  if (bodyText) {
    parts.push(bodyText);
    parts.push(''); // Empty line before metadata
  }

  parts.push(generateMetadata());

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
 * Submit feedback via gh CLI
 * Uses execFileSync to prevent shell injection vulnerabilities
 */
function submitViaGhCli(title: string, body: string): void {
  try {
    const result = execFileSync(
      'gh',
      [
        'issue',
        'create',
        '--repo',
        'studyzy/OpenSpec-cn',
        '--title',
        title,
        '--body',
        body,
        '--label',
        'feedback',
      ],
      { encoding: 'utf-8', stdio: 'pipe' }
    );

    const issueUrl = result.trim();
    console.log(`\n✓ 反馈提交成功！`);
    console.log(`Issue 链接: ${issueUrl}\n`);
  } catch (error: any) {
    // Display the error output from gh CLI
    if (error.stderr) {
      console.error(error.stderr.toString());
    } else if (error.message) {
      console.error(error.message);
    }

    // Exit with the same code as gh CLI
    process.exit(error.status ?? 1);
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
    const body = formatBody(options?.body);

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
