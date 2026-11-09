import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import chalk from 'chalk';
import { findCopiesOnPath, samePath } from '../utils/executable-path.js';
import {
  getCliInstallInfo,
  getStandaloneBinaryPath,
  type CliInstallInfo,
} from '../core/version-check.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { name: PACKAGE_NAME } = require('../../package.json');

/**
 * `openspec install`: installs the standalone binary (no Node.js needed) by
 * running the same release installer the docs give users, then says how to
 * retire the package-manager copy. It never removes that copy itself: switching
 * is the user's choice, and so is when.
 */

// The installers come from main, which always has them; they then pick the
// newest release whose files are all attached (see install.sh).
const INSTALLER_BASE = 'https://raw.githubusercontent.com/studyzy/OpenSpec-cn/main/scripts/binary';
const RELEASE_VERSION = /^v?\d{1,10}\.\d{1,10}\.\d{1,10}(?:-[0-9A-Za-z.-]{1,64})?$/;

export interface InstallTarget {
  dir: string;
  name: string;
}

/**
 * Where the installer will put the binary. Mirrors install.sh and install.ps1,
 * and is passed to them explicitly so both sides agree. The standalone binary
 * reinstalls itself where it is, under its own name.
 */
export function resolveInstallTarget(
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
  standalonePath: string | null = getStandaloneBinaryPath()
): InstallTarget {
  const defaultName = platform === 'win32' ? 'openspec-cn.exe' : 'openspec-cn';
  if (env.OPENSPEC_INSTALL_DIR) {
    return { dir: path.resolve(env.OPENSPEC_INSTALL_DIR), name: env.OPENSPEC_INSTALL_NAME || defaultName };
  }
  if (standalonePath) {
    return { dir: path.dirname(standalonePath), name: path.basename(standalonePath) };
  }
  if (platform === 'win32') {
    const localAppData = env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    return { dir: path.join(localAppData, 'Programs', 'openspec-cn'), name: defaultName };
  }
  return { dir: path.join(os.homedir(), '.local', 'bin'), name: defaultName };
}

/** The command that removes a package-manager install, or null when there is nothing to remove. */
export function removeCommandFor(install: CliInstallInfo): string | null {
  if (install.scope !== 'global') return null;
  // The Homebrew formula keeps its own npm tree under Cellar; brew owns it.
  if (install.location && /[\\/]Cellar[\\/]openspec-cn[\\/]/i.test(install.location)) {
    return 'brew uninstall openspec-cn';
  }
  switch (install.packageManager) {
    case 'npm':
      return `npm uninstall -g ${PACKAGE_NAME}`;
    case 'pnpm':
      return `pnpm remove -g ${PACKAGE_NAME}`;
    case 'yarn':
      return `yarn global remove ${PACKAGE_NAME}`;
    case 'bun':
      return `bun remove -g ${PACKAGE_NAME}`;
    case 'volta':
      return `volta uninstall ${PACKAGE_NAME}`;
    default:
      return null;
  }
}

/**
 * Checks a download source given through the environment. Release files and
 * SHA256SUMS come from the same place, so a remote plain-HTTP source could
 * swap both: only https, or http to this machine. The host is parsed, not
 * prefix-matched, and a user part (http://localhost:80@evil.example/) is
 * refused.
 */
export function checkSource(label: string, value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} 不是合法的 URL：${value}`);
  }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.username || url.password || (url.protocol !== 'https:' && !(url.protocol === 'http:' && local))) {
    throw new Error(`${label} 必须使用 https（或指向 localhost 的 http）：${value}`);
  }
  return url.href.replace(/\/+$/, '');
}

/** Where the installer script comes from: OPENSPEC_DOWNLOAD_URL when set (mirrors, tests), else main. */
export function installerBase(env: NodeJS.ProcessEnv = process.env): string {
  if (env.OPENSPEC_RELEASES_URL) checkSource('OPENSPEC_RELEASES_URL', env.OPENSPEC_RELEASES_URL);
  return env.OPENSPEC_DOWNLOAD_URL ? checkSource('OPENSPEC_DOWNLOAD_URL', env.OPENSPEC_DOWNLOAD_URL) : INSTALLER_BASE;
}

// Fixed scripts: the installer URL reaches them as data (an argument, or an
// environment variable), never as part of the command text.
const POSIX_RUNNER =
  'f=$(mktemp) || exit 1; { curl -fsSL "$1" -o "$f" 2>/dev/null || wget -q -O "$f" "$1"; } && sh "$f"; s=$?; rm -f "$f"; exit $s';
// 脚本是 UTF-8 且含中文。GitHub raw 返回 text/plain; charset=utf-8，
// 但镜像或代理可能省略 charset，Windows PowerShell 5.1 就会按 ANSI 解码
// 导致中文乱码；加 BOM 又会让 iex 把 BOM 当成命令的一部分。这里按字节取回
// 后显式按 UTF-8 解码。RawContentStream 在 5.1 与 7 上都可用。
const WINDOWS_RUNNER =
  '$r = Invoke-WebRequest -UseBasicParsing $env:OPENSPEC_INSTALLER_URL; ' +
  'iex ([Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray()))';

/**
 * Downloads and runs the installer with the same tools as the documented
 * one-liners (curl or wget; PowerShell's irm), so proxies and certificates
 * behave as they do for those. Saved to a file first on macOS and Linux:
 * piped straight into sh, a failed download would look like a successful run.
 */
function runInstaller(scriptUrl: string, env: NodeJS.ProcessEnv): Promise<number> {
  const windows = process.platform === 'win32';
  const command = windows ? 'powershell.exe' : 'sh';
  const args = windows
    ? ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', WINDOWS_RUNNER]
    : ['-c', POSIX_RUNNER, 'openspec-install', scriptUrl];
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: windows ? { ...env, OPENSPEC_INSTALLER_URL: scriptUrl } : env,
    });
    child.on('error', reject);
    child.on('close', (code) => resolve(code ?? 1));
  });
}

export async function installStandalone(options: { version?: string } = {}): Promise<void> {
  const { version } = options;
  if (version && version !== 'latest' && !RELEASE_VERSION.test(version)) {
    throw new Error(`不是有效的发布版本：${version}。请使用形如 1.15.0 的版本号，或省略以安装最新版。`);
  }

  const scriptUrl = `${installerBase()}/${process.platform === 'win32' ? 'install.ps1' : 'install.sh'}`;
  const target = resolveInstallTarget();
  const exitCode = await runInstaller(scriptUrl, {
    ...process.env,
    OPENSPEC_INSTALL_DIR: target.dir,
    OPENSPEC_INSTALL_NAME: target.name,
    ...(version && version !== 'latest' ? { OPENSPEC_VERSION: version } : {}),
  });
  if (exitCode !== 0) {
    throw new Error(`独立版安装未完成（安装脚本：${scriptUrl}）。`);
  }

  const installedPath = path.join(target.dir, target.name);
  const defaultName = process.platform === 'win32' ? 'openspec-cn.exe' : 'openspec-cn';
  // 自定义文件名永远不会是 PATH 上的 `openspec-cn`，因此跳过该检查。
  const first = target.name === defaultName ? findCopiesOnPath()[0] : undefined;
  const runsStandalone = first !== undefined && samePath(first, installedPath);
  // Run from a package manager, the old copy stays until the user removes it.
  const remove = getStandaloneBinaryPath() ? null : removeCommandFor(getCliInstallInfo());

  console.log();
  if (runsStandalone) {
    console.log('现在 openspec-cn 运行的是独立版。');
  } else if (first) {
    console.log(`${first} 在 PATH 中更靠前，因此仍会运行它。`);
  } else if (target.name === defaultName) {
    console.log('请打开新的终端，以便加载新的 PATH。');
  }
  if (remove) {
    console.log(runsStandalone ? '如需移除包管理器安装的副本：' : '如需切换，请移除包管理器安装的副本：');
    console.log(chalk.cyan(`  ${remove}`));
  }
  console.log(chalk.dim("可用 'openspec-cn version' 检查；显示 (standalone) 即为独立版。"));
}
