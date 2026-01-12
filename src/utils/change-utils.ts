import path from 'path';
import { FileSystemUtils } from './file-system.js';
import { writeChangeMetadata, validateSchemaName } from './change-metadata.js';

const DEFAULT_SCHEMA = 'spec-driven';

/**
 * Options for creating a change.
 */
export interface CreateChangeOptions {
  /** The workflow schema to use (default: 'spec-driven') */
  schema?: string;
}

/**
 * Result of validating a change name.
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates that a change name follows kebab-case conventions.
 *
 * Valid names:
 * - Start with a lowercase letter
 * - Contain only lowercase letters, numbers, and hyphens
 * - Do not start or end with a hyphen
 * - Do not contain consecutive hyphens
 *
 * @param name - The change name to validate
 * @returns Validation result with `valid: true` or `valid: false` with an error message
 *
 * @example
 * validateChangeName('add-auth') // { valid: true }
 * validateChangeName('Add-Auth') // { valid: false, error: '...' }
 */
export function validateChangeName(name: string): ValidationResult {
  // Pattern: starts with lowercase letter, followed by lowercase letters/numbers,
  // optionally followed by hyphen + lowercase letters/numbers (repeatable)
  const kebabCasePattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

  if (!name) {
    return { valid: false, error: '变更名称不能为空' };
  }

  if (!kebabCasePattern.test(name)) {
    // Provide specific error messages for common mistakes
    if (/[A-Z]/.test(name)) {
      return { valid: false, error: '变更名称必须小写（使用 kebab-case，即短横线分隔）' };
    }
    if (/\s/.test(name)) {
      return { valid: false, error: '变更名称不能包含空格（请使用短横线代替）' };
    }
    if (/_/.test(name)) {
      return { valid: false, error: '变更名称不能包含下划线（请使用短横线代替）' };
    }
    if (name.startsWith('-')) {
      return { valid: false, error: '变更名称不能以短横线开头' };
    }
    if (name.endsWith('-')) {
      return { valid: false, error: '变更名称不能以短横线结尾' };
    }
    if (/--/.test(name)) {
      return { valid: false, error: '变更名称不能包含连续的短横线' };
    }
    if (/[^a-z0-9-]/.test(name)) {
      return { valid: false, error: '变更名称只能包含小写字母、数字和短横线' };
    }
    if (/^[0-9]/.test(name)) {
      return { valid: false, error: '变更名称必须以字母开头' };
    }

    return { valid: false, error: '变更名称必须符合 kebab-case 规范（例如：add-auth, refactor-db）' };
  }

  return { valid: true };
}

/**
 * Creates a new change directory with metadata file.
 *
 * @param projectRoot - The root directory of the project (where `openspec/` lives)
 * @param name - The change name (must be valid kebab-case)
 * @param options - Optional settings for the change
 * @throws Error if the change name is invalid
 * @throws Error if the schema name is invalid
 * @throws Error if the change directory already exists
 *
 * @example
 * // Creates openspec/changes/add-auth/ with default schema
 * await createChange('/path/to/project', 'add-auth')
 *
 * @example
 * // Creates openspec/changes/add-auth/ with TDD schema
 * await createChange('/path/to/project', 'add-auth', { schema: 'tdd' })
 */
export async function createChange(
  projectRoot: string,
  name: string,
  options: CreateChangeOptions = {}
): Promise<void> {
  // Validate the name first
  const validation = validateChangeName(name);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Determine schema (validate if provided)
  const schemaName = options.schema ?? DEFAULT_SCHEMA;
  validateSchemaName(schemaName);

  // Build the change directory path
  const changeDir = path.join(projectRoot, 'openspec', 'changes', name);

  // Check if change already exists
  if (await FileSystemUtils.directoryExists(changeDir)) {
    throw new Error(`变更 '${name}' 已存在于 ${changeDir}`);
  }

  // Create the directory (including parent directories if needed)
  await FileSystemUtils.createDirectory(changeDir);

  // Write metadata file with schema and creation date
  const today = new Date().toISOString().split('T')[0];
  writeChangeMetadata(changeDir, {
    schema: schemaName,
    created: today,
  });
}
