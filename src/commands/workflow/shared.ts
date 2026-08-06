/**
 * Shared Types and Utilities for Artifact Workflow Commands
 *
 * This module contains types, constants, and validation helpers used across
 * multiple artifact workflow commands.
 */

import chalk from 'chalk';
import path from 'path';
import * as fs from 'fs';
import { getSchemaDir, listSchemas } from '../../core/artifact-graph/index.js';
import type { ReferenceIndexEntry } from '../../core/references.js';
import { isRootSelectionError } from '../../core/root-selection.js';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface ChangeCommandStatus {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  target?: string;
  fix?: string;
}

export interface TaskItem {
  id: string;
  description: string;
  done: boolean;
}

export interface ApplyInstructions {
  changeName: string;
  changeDir: string;
  schemaName: string;
  contextFiles: Record<string, string[]>;
  progress: {
    total: number;
    complete: number;
    remaining: number;
  };
  tasks: TaskItem[];
  state: 'blocked' | 'all_done' | 'ready';
  missingArtifacts?: string[];
  instruction: string;
  /** Referenced-store index (read-only upstream context; omitted when none declared) */
  references?: ReferenceIndexEntry[];
  /** Current project background from the selected root. */
  context?: string;
  /** Current advisory guidance for apply. */
  operationGuidance?: string[];
}

export interface ArchiveInstructions {
  changeName: string;
  /** Current project background from the selected root. */
  context?: string;
  /** Current advisory guidance for archive. */
  operationGuidance?: string[];
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export const DEFAULT_SCHEMA = 'spec-driven';

// -----------------------------------------------------------------------------
// Utility Functions
// -----------------------------------------------------------------------------

export function printJson(payload: unknown): void {
  console.log(JSON.stringify(payload, null, 2));
}

export function statusFromError(error: unknown): ChangeCommandStatus {
  if (isRootSelectionError(error)) {
    return { ...error.diagnostic };
  }

  return {
    severity: 'error',
    code: 'change_error',
    message: error instanceof Error ? error.message : String(error),
  };
}

/**
 * Checks if color output is disabled via NO_COLOR env or --no-color flag.
 */
export function isColorDisabled(): boolean {
  return process.env.NO_COLOR === '1' || process.env.NO_COLOR === 'true';
}

/**
 * Gets the color function based on status.
 */
export function getStatusColor(status: 'done' | 'skipped' | 'ready' | 'blocked'): (text: string) => string {
  if (isColorDisabled()) {
    return (text: string) => text;
  }
  switch (status) {
    case 'done':
      return chalk.green;
    case 'skipped':
      return chalk.gray;
    case 'ready':
      return chalk.yellow;
    case 'blocked':
      return chalk.red;
  }
}

/**
 * Gets the status indicator for an artifact.
 */
export function getStatusIndicator(status: 'done' | 'skipped' | 'ready' | 'blocked'): string {
  const color = getStatusColor(status);
  switch (status) {
    case 'done':
      return color('[x]');
    case 'skipped':
      return color('[~]');
    case 'ready':
      return color('[ ]');
    case 'blocked':
      return color('[-]');
  }
}

/**
 * Returns the list of available change directory names under openspec/changes/.
 * Excludes the archive directory and hidden directories.
 */
export async function getAvailableChanges(
  projectRoot: string,
  changesDir = path.join(projectRoot, 'openspec', 'changes')
): Promise<string[]> {
  const changesPath = changesDir;
  try {
    const entries = await fs.promises.readdir(changesPath, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && e.name !== 'archive' && !e.name.startsWith('.'))
      .map((e) => e.name);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

/**
 * Validates a change name used to look up an existing change directory.
 * Lookup accepts any directory name that `getAvailableChanges` could return
 * (the kebab-case convention in `validateChangeName` applies at creation
 * time only); it only rejects names that would escape the changes directory
 * or address entries `getAvailableChanges` excludes (hidden dirs, archive).
 *
 * @returns An error message, or undefined if the name is safe to look up
 */
function validateChangeLookupName(changeName: string): string | undefined {
  if (changeName === '.' || changeName === '..') {
    return '变更名称不能是相对路径段';
  }
  if (changeName.includes('/') || changeName.includes('\\')) {
    return '变更名称不能包含路径分隔符';
  }
  if (changeName.includes('\0')) {
    return '变更名称不能包含空字符';
  }
  if (changeName.startsWith('.')) {
    return '变更名称不能以点号开头';
  }
  if (changeName === 'archive') {
    return "'archive' 是为归档变更保留的";
  }
  return undefined;
}

/**
 * Validates that a change exists and returns available changes if not.
 * Checks directory existence directly to support scaffolded changes (without proposal.md).
 */
export async function validateChangeExists(
  changeName: string | undefined,
  projectRoot: string,
  changesDir = path.join(projectRoot, 'openspec', 'changes'),
  hints: { newChangeHint?: string } = {}
): Promise<string> {
  // Hints must stay pasteable: callers with a selected store pass a
  // store-carrying hint so following it lands in the same root.
  const newChangeHint = hints.newChangeHint ?? 'openspec-cn new change <name>';

  if (!changeName) {
    const available = await getAvailableChanges(projectRoot, changesDir);
    if (available.length === 0) {
      throw new Error(`未找到变更。使用以下命令创建：${newChangeHint}`);
    }
    throw new Error(
      `缺少必需选项 --change。可用的变更：\n  ${available.join('\n  ')}`
    );
  }

  // Validate change name format to prevent path traversal
  const lookupError = validateChangeLookupName(changeName);
  if (lookupError) {
    throw new Error(`无效的变更名称 '${changeName}'：${lookupError}`);
  }

  // Check directory existence directly
  const changePath = path.join(changesDir, changeName);
  const exists = fs.existsSync(changePath) && fs.statSync(changePath).isDirectory();

  if (!exists) {
    const available = await getAvailableChanges(projectRoot, changesDir);
    if (available.length === 0) {
      throw new Error(
        `未找到变更 '${changeName}'。不存在任何变更。使用以下命令创建：${newChangeHint}`
      );
    }
    throw new Error(
      `未找到变更 '${changeName}'。可用的变更：\n  ${available.join('\n  ')}`
    );
  }

  return changeName;
}

/**
 * Validates that a schema exists and returns available schemas if not.
 *
 * @param schemaName - The schema name to validate
 * @param projectRoot - Optional project root for project-local schema resolution
 */
export function validateSchemaExists(schemaName: string, projectRoot?: string): string {
  const schemaDir = getSchemaDir(schemaName, projectRoot);
  if (!schemaDir) {
    const availableSchemas = listSchemas(projectRoot);
    throw new Error(
      `未找到 Schema '${schemaName}'。可用的 schemas：\n  ${availableSchemas.join('\n  ')}`
    );
  }
  return schemaName;
}
