/**
 * The workset command's interactive prompt flows (the compose wizard,
 * the open-time tool select, the remove confirm). @inquirer is always
 * imported dynamically at the call site - never at module top.
 */
import * as path from 'node:path';

import { pathIsDirectory } from '../core/file-state.js';
import {
  listOpenerChoices,
  type OpenerChoice,
  type OpenerDefinition,
} from '../core/openers.js';
import { expandUserPath } from '../core/store/operations.js';
import {
  memberLabelProblem,
  validateWorksetName,
  type Workset,
  type WorksetMember,
} from '../core/worksets.js';
import { asErrorMessage } from './shared-output.js';
import {
  assertKnownTool,
  finalizeWorkset,
  formatMemberRows,
  resolveMemberFlags,
} from './workset-input.js';

export interface ComposeInput {
  memberFlags: string[];
  tool?: string;
}

export async function composeInteractively(
  givenName: string | undefined,
  input: ComposeInput,
  table: OpenerDefinition[]
): Promise<Workset> {
  const prompts = await import('@inquirer/prompts');

  console.log('[1/3] 命名 workset');
  let name: string;
  if (givenName !== undefined) {
    name = validateWorksetName(givenName);
    console.log(`  Workset 名称: ${name}`);
  } else {
    name = await prompts.input({
      message: 'Workset 名称:',
      required: true,
      validate(value: string) {
        try {
          validateWorksetName(value);
          return true;
        } catch (error) {
          return asErrorMessage(error);
        }
      },
    });
  }

  // Flag-provided pieces are validated before any prompting, so a
  // bad flag or tool cannot discard a finished wizard walk.
  if (input.tool !== undefined) {
    assertKnownTool(input.tool, table);
  }

  console.log('');
  console.log(
    '[2/3] 添加成员文件夹（第一个为主文件夹，会话将从那里开始）'
  );
  const members: WorksetMember[] = await resolveMemberFlags(input.memberFlags);
  if (members.length > 0) {
    finalizeWorkset(name, members, input.tool, table);
    for (const member of members) {
      console.log(`  已添加 '${member.name}' (${member.path})`);
    }
  }

  while (true) {
    if (members.length > 0) {
      const next = await prompts.select({
        message: '添加另一个文件夹或完成:',
        choices: [
          { name: '完成', value: 'finish' },
          { name: '添加另一个文件夹', value: 'add' },
        ],
        default: 'finish',
      });
      if (next === 'finish') {
        break;
      }
    }

    const rawPath = await prompts.input({
      message: '文件夹路径:',
      ...(members.length === 0 ? { default: '.', prefill: 'editable' } : {}),
      required: true,
      async validate(value: string) {
        const resolved = path.resolve(expandUserPath(value));
        if (!(await pathIsDirectory(resolved))) {
          return `'${value}' 不是一个已存在的文件夹`;
        }
        return true;
      },
    });

    const resolvedPath = path.resolve(expandUserPath(rawPath));
    let label = path.basename(resolvedPath);
    const collision = members.some((member) => member.name === label);
    if (memberLabelProblem(label) !== null || collision) {
      label = await prompts.input({
        message: '为此成员命名（文件夹标签）:',
        required: true,
        validate(value: string) {
          const problem = memberLabelProblem(value);
          if (problem !== null) {
            return problem;
          }
          if (members.some((member) => member.name === value)) {
            return `成员名称 '${value}' 重复`;
          }
          return true;
        },
      });
    }

    members.push({ name: label, path: resolvedPath });
    console.log(`  已添加 '${label}' (${resolvedPath})`);
  }

  console.log('');
  console.log('[3/3] 选择你的工具');
  let tool = input.tool;
  if (tool === undefined) {
    const choices = listOpenerChoices(table);
    const available = choices.filter((choice) => choice.available);
    if (available.length === 0) {
      console.log(
        '  PATH 中没有找到任何已知工具；不保存偏好设置。'
      );
      console.log(
        `  （已知工具：${choices.map((choice) => `${choice.opener.id} ${choice.note ?? ''}`.trim()).join(', ')}）`
      );
    } else {
      tool = await promptToolFromChoices(available);
    }
  }

  return finalizeWorkset(name, members, tool, table);
}

export async function promptToolFromChoices(
  available: OpenerChoice[]
): Promise<string> {
  const { select } = await import('@inquirer/prompts');
  return select({
    message: '打开方式:',
    choices: available.map((choice) => ({
      name: choice.opener.label,
      value: choice.opener.id,
    })),
  });
}

export async function promptOpenNow(label: string): Promise<boolean> {
  const { confirm } = await import('@inquirer/prompts');
  return confirm({
    message: `现在在 ${label} 中打开？`,
    default: true,
  });
}

/** Prints the workset (decision 13: remove shows what it removes). */
export async function confirmRemoveInteractively(
  workset: Workset
): Promise<boolean> {
  const { confirm } = await import('@inquirer/prompts');

  console.log(`工作集 '${workset.name}'：`);
  for (const row of formatMemberRows(workset.members)) {
    console.log(`  ${row}`);
  }

  return confirm({
    message: `删除 workset '${workset.name}'？（成员文件夹不会被触及）`,
    default: false,
  });
}
