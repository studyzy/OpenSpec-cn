/**
 * Input resolution and error builders shared by the workset command
 * and its interactive prompt flows.
 */
import * as path from 'node:path';

import { pathIsDirectory } from '../core/file-state.js';
import {
  findOpener,
  isOpenerCommandAvailable,
  isOpenerEnabled,
  type OpenerDefinition,
  type OpenerScanOptions,
} from '../core/openers.js';
import { StoreError } from '../core/store/errors.js';
import { expandUserPath } from '../core/store/operations.js';
import { getGlobalConfigPath } from '../core/global-config.js';
import {
  memberLabelProblem,
  memberListProblem,
  type Workset,
  type WorksetMember,
} from '../core/worksets.js';

function memberInvalidError(problem: string): StoreError {
  return new StoreError(
    `无效的 workset 成员：${problem}。`,
    'workset_member_invalid',
    {
      target: 'workset.member',
      fix: '使用 --member <path> 指定已有文件夹，或使用 --member <name>=<path> 为其添加标签。',
    }
  );
}

/** `--member <path>` or `--member <name>=<path>` (the first `=` splits). */
async function resolveMemberFlag(raw: string): Promise<WorksetMember> {
  const separator = raw.indexOf('=');
  const label = separator > 0 ? raw.slice(0, separator) : undefined;
  const rawPath = separator > 0 ? raw.slice(separator + 1) : raw;

  if (rawPath.length === 0) {
    throw memberInvalidError(`'${raw}' 没有指定路径`);
  }

  const resolvedPath = path.resolve(expandUserPath(rawPath));
  if (!(await pathIsDirectory(resolvedPath))) {
    throw memberInvalidError(`'${rawPath}' 不是一个已存在的文件夹`);
  }

  const name = label ?? path.basename(resolvedPath);
  const labelProblem = memberLabelProblem(name);
  if (labelProblem !== null) {
    throw memberInvalidError(labelProblem);
  }

  return { name, path: resolvedPath };
}

/** Concurrent stats; the first invalid flag (by flag order) reports. */
export async function resolveMemberFlags(
  flags: string[]
): Promise<WorksetMember[]> {
  const settled = await Promise.allSettled(flags.map(resolveMemberFlag));
  const members: WorksetMember[] = [];
  for (const result of settled) {
    if (result.status === 'rejected') {
      throw result.reason;
    }
    members.push(result.value);
  }
  return members;
}

/** One spelling of "this tool id must exist in the merged table". */
export function assertKnownTool(
  tool: string,
  table: OpenerDefinition[]
): void {
  if (findOpener(table, tool) === null) {
    throw toolUnknownError(tool, table);
  }
}

/** Final assembly shared by both compose paths: one validation rule. */
export function finalizeWorkset(
  name: string,
  members: WorksetMember[],
  tool: string | undefined,
  table: OpenerDefinition[]
): Workset {
  const problem = memberListProblem(members);
  if (problem !== null) {
    throw memberInvalidError(problem);
  }

  if (tool !== undefined) {
    assertKnownTool(tool, table);
  }

  return {
    name,
    ...(tool !== undefined ? { tool } : {}),
    members,
  };
}

/** The aligned `<name>  <path>` rows used by list, remove, and the
 * open fallback; callers pick the stream and indent. */
export function formatMemberRows(members: WorksetMember[]): string[] {
  const width = Math.max(...members.map((member) => member.name.length));
  return members.map(
    (member) => `${member.name.padEnd(width)}  ${member.path}`
  );
}

export function toolUnknownError(
  toolId: string,
  table: OpenerDefinition[]
): StoreError {
  const knownIds = table
    .filter((opener) => isOpenerEnabled(opener))
    .map((opener) => opener.id)
    .join(', ');
  return new StoreError(`未知的工具 '${toolId}'。`, 'workset_tool_unknown', {
    target: 'workset.tool',
    fix: `已知工具: ${knownIds}。在 ${getGlobalConfigPath()} 的 "openers" 下添加新工具。`,
  });
}

/** Stops at the first installed alternative instead of scanning all. */
export function firstInstalledAlternative(
  table: OpenerDefinition[],
  excludeId: string | undefined,
  scan?: OpenerScanOptions
): string | null {
  return (
    table.find(
      (candidate) =>
        candidate.id !== excludeId &&
        isOpenerEnabled(candidate) &&
        isOpenerCommandAvailable(candidate.command, scan)
    )?.id ?? null
  );
}

export function toolUnavailableError(
  opener: OpenerDefinition,
  table: OpenerDefinition[],
  worksetName: string,
  scan?: OpenerScanOptions
): StoreError {
  const alternative = firstInstalledAlternative(table, opener.id, scan);

  return new StoreError(
    `${opener.label}（'${opener.command}'）不在 PATH 中。`,
    'workset_tool_unavailable',
    {
      target: 'workset.tool',
      fix:
        alternative !== null
          ? `安装 '${opener.command}' 或运行：openspec-cn workset open ${worksetName} --tool ${alternative}`
          : `安装 '${opener.command}'，然后重新运行：openspec-cn workset open ${worksetName}`,
    }
  );
}

/** Interactive open with no saved tool and nothing installed at all. */
export function noToolInstalledError(
  table: OpenerDefinition[],
  worksetName: string
): StoreError {
  const commands = table
    .filter((opener) => isOpenerEnabled(opener))
    .map((opener) => opener.command)
    .join(', ');
  return new StoreError(
    '已知的工具均不在 PATH 中。',
    'workset_tool_unavailable',
    {
      target: 'workset.tool',
      fix: `安装以下工具之一：${commands}。然后重新运行：openspec-cn workset open ${worksetName}`,
    }
  );
}
