/**
 * Instructions Command
 *
 * Generates enriched instructions for creating artifacts or applying tasks.
 * Includes both artifact instructions and apply instructions.
 */

import ora from 'ora';
import path from 'path';
import * as fs from 'fs';
import {
  loadChangeContext,
  generateInstructions,
  resolveSchema,
  resolveArtifactOutputPath,
  resolveArtifactOutputs,
  type ArtifactInstructions,
} from '../../core/artifact-graph/index.js';
import {
  getChangeDir,
  resolveCurrentPlanningHomeSync,
  type PlanningHome,
} from '../../core/planning-home.js';
import {
  resolveRootForCommand,
  withStoreFlag,
  toPlanningHome,
  toRootOutput,
  type ResolvedOpenSpecRoot,
} from '../../core/root-selection.js';
import {
  assembleReferenceIndex,
  renderReferencedStoresBlock,
  renderReferencedStoresSection,
  type ReferenceIndexEntry,
} from '../../core/references.js';
import { readRegistrySnapshot } from '../../core/store/registry.js';
import {
  loadOperationInputs,
  readProjectConfig,
  type ProjectConfig,
} from '../../core/project-config.js';
import {
  validateChangeExists,
  validateSchemaExists,
  type TaskItem,
  type ApplyInstructions,
  type ArchiveInstructions,
} from './shared.js';
import { parseTaskLines, type ParsedTask } from '../../utils/task-progress.js';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface InstructionsOptions {
  change?: string;
  schema?: string;
  store?: string;
  storePath?: string;
  json?: boolean;
}

export interface ApplyInstructionsOptions {
  change?: string;
  schema?: string;
  store?: string;
  storePath?: string;
  json?: boolean;
}

export type ArchiveInstructionsOptions = ApplyInstructionsOptions;

// -----------------------------------------------------------------------------
// Artifact Instructions Command
// -----------------------------------------------------------------------------

/**
 * Reads the resolved root's config once, assembles the referenced-store
 * index when references are declared, and resolves the config path for
 * fix text. Shared by both instruction surfaces.
 */
async function loadRootConfigContext(root: ResolvedOpenSpecRoot): Promise<{
  projectConfig: ProjectConfig | null;
  references: ReferenceIndexEntry[] | undefined;
}> {
  // readProjectConfig never throws: missing/unparseable configs are null.
  const projectConfig = readProjectConfig(root.path);

  // One registry read serves every relationship consumer in this
  // output so it never carries a torn snapshot.
  const snapshot = await readRegistrySnapshot();
  const registryEntries = snapshot.entries;

  const declared = projectConfig?.references ?? [];
  const index =
    declared.length > 0
      ? await assembleReferenceIndex({ references: declared, resolvedRoot: root, registryEntries })
      : [];

  // Omitted, not empty: an index emptied by self-reference omission must
  // look identical to an undeclared one in JSON.
  return {
    projectConfig,
    references: index.length > 0 ? index : undefined,
  };
}

export async function instructionsCommand(
  artifactId: string | undefined,
  options: InstructionsOptions
): Promise<void> {
  // Resolve (and banner) before the spinner starts so stderr stays readable.
  const root = await resolveRootForCommand(options, { json: options.json });
  if (!root) {
    return;
  }

  const spinner = options.json ? undefined : ora('正在生成指令...').start();

  try {
    const planningHome = toPlanningHome(root);
    const projectRoot = root.path;
    const changeName = await validateChangeExists(
      options.change,
      projectRoot,
      root.changesDir,
      { newChangeHint: withStoreFlag(root, 'openspec-cn new change <name>') }
    );

    // Validate schema if explicitly provided
    if (options.schema) {
      validateSchemaExists(options.schema, projectRoot);
    }

    const { projectConfig, references } = await loadRootConfigContext(root);

    // loadChangeContext will auto-detect schema from metadata if not provided
    const context = loadChangeContext(projectRoot, changeName, options.schema, {
      changeDir: getChangeDir(planningHome, changeName),
      planningHome,
      projectConfig,
    });

    if (!artifactId) {
      spinner?.stop();
      const validIds = context.graph.getAllArtifacts().map((a) => a.id);
      throw new Error(
        `缺少必要参数 <artifact>。可用产出物：\n  ${validIds.join('\n  ')}`
      );
    }

    const artifact = context.graph.getArtifact(artifactId);

    if (!artifact) {
      spinner?.stop();
      const validIds = context.graph.getAllArtifacts().map((a) => a.id);
      throw new Error(
        `在 schema '${context.schemaName}' 中未找到产出物 '${artifactId}'。可用产出物：\n  ${validIds.join('\n  ')}`
      );
    }

    const instructions = generateInstructions(context, artifactId, projectRoot, {
      projectConfig,
      references,
    });
    const isBlocked = instructions.dependencies.some((d) => !d.done);

    spinner?.stop();

    if (options.json) {
      console.log(JSON.stringify({ ...instructions, root: toRootOutput(root) }, null, 2));
      return;
    }

    printInstructionsText(instructions, isBlocked);
  } catch (error) {
    spinner?.stop();
    throw error;
  }
}

export function printInstructionsText(instructions: ArtifactInstructions, isBlocked: boolean): void {
  const {
    artifactId,
    changeName,
    schemaName,
    changeDir,
    resolvedOutputPath,
    description,
    instruction,
    context,
    rules,
    template,
    dependencies,
    unlocks,
  } = instructions;

  // Opening tag
  console.log(`<artifact id="${artifactId}" change="${changeName}" schema="${schemaName}">`);
  console.log();

  // Artifacts skipped via skip_specs get no creation directive: emitting the
  // task/template anyway would prompt an agent to write spec files that
  // validate then rejects as conflicting with the marker.
  if (instructions.skipped) {
    console.log('<warning>');
    console.log(instructions.warning ?? '此制品已跳过（.openspec.yaml 中设置了 skip_specs）。');
    console.log('</warning>');
    console.log();
    console.log('</artifact>');
    return;
  }

  // Warning for blocked artifacts
  if (isBlocked) {
    const missing = dependencies.filter((d) => !d.done).map((d) => d.id);
    console.log('<warning>');
    console.log('此产出物有未满足的依赖。请先完成它们，或谨慎继续。');
    console.log(`缺失：${missing.join(', ')}`);
    console.log('</warning>');
    console.log();
  }

  // Task directive
  console.log('<task>');
  console.log(`为变更 "${changeName}" 创建 ${artifactId} 产出物。`);
  console.log(description);
  console.log('</task>');
  console.log();

  // Project context (AI constraint - do not include in output)
  if (context) {
    console.log('<project_context>');
    console.log('<!-- 以下是供你参考的背景信息。请勿将其包含在你的输出中。 -->');
    console.log(context);
    console.log('</project_context>');
    console.log();
  }

  // Referenced-store index (read-only upstream context)
  if (instructions.references && instructions.references.length > 0) {
    console.log(renderReferencedStoresBlock(instructions.references));
    console.log();
  }

  // Rules (AI constraint - do not include in output)
  if (rules && rules.length > 0) {
    console.log('<rules>');
    console.log('<!-- 以下是你需要遵守的约束条件。请勿将其包含在你的输出中。 -->');
    for (const rule of rules) {
      console.log(`- ${rule}`);
    }
    console.log('</rules>');
    console.log();
  }

  // Dependencies (files to read for context)
  if (dependencies.length > 0) {
    console.log('<dependencies>');
    console.log('请先阅读以下文件的当前内容，然后再创建此制品（即使之前看到过，也请重新从磁盘读取——它们可能已被编辑过）：');
    console.log();
    for (const dep of dependencies) {
      // A dependency satisfied via skip_specs has no files by design: telling
      // the agent to read them (or calling them "done") would send it hunting
      // for spec files that must not exist.
      if (dep.skipped) {
        console.log(`<dependency id="${dep.id}" status="skipped">`);
        console.log(`  <description>已跳过：该变更声明了 skip_specs，因此此制品没有需要阅读的文件。</description>`);
        console.log('</dependency>');
        continue;
      }
      const status = dep.done ? 'done' : 'missing';
      const fullPath = path.join(changeDir, dep.path);
      console.log(`<dependency id="${dep.id}" status="${status}">`);
      console.log(`  <path>${fullPath}</path>`);
      console.log(`  <description>${dep.description}</description>`);
      console.log('</dependency>');
    }
    console.log('</dependencies>');
    console.log();
  }

  // Output location
  console.log('<output>');
  console.log(`写入：${resolvedOutputPath}`);
  console.log('</output>');
  console.log();

  // Instruction (guidance)
  if (instruction) {
    console.log('<instruction>');
    console.log(instruction.trim());
    console.log('</instruction>');
    console.log();
  }

  // Template
  console.log('<template>');
  console.log('<!-- Use this as the structure for your output file. Fill in the sections. -->');
  console.log(template.trim());
  console.log('</template>');
  console.log();

  // Success criteria placeholder
  console.log('<success_criteria>');
  console.log('<!-- 具体内容由 schema 校验规则定义 -->');
  console.log('</success_criteria>');
  console.log();

  // Unlocks
  if (unlocks.length > 0) {
    console.log('<unlocks>');
    console.log(`完成此产出物后将启用：${unlocks.join(', ')}`);
    console.log('</unlocks>');
    console.log();
  }

  // Closing tag
  console.log('</artifact>');
}

// -----------------------------------------------------------------------------
// Apply Instructions Command
// -----------------------------------------------------------------------------

/**
 * Turns parsed task lines into the listed task items.
 *
 * A checkbox with no text after it is left out of the list: this is work for an
 * agent to act on and tick off, and a bare `- [ ]` gives it nothing to match.
 * It still counts toward progress, which is taken from every parsed line, so
 * this list can be shorter than the totals beside it but never disagrees with
 * `openspec list` or archive about how much work is left. An empty list is also
 * what puts apply in its "nothing to work on" state, so a file of nothing but
 * text-less checkboxes asks to be rewritten instead of being called done.
 */
function toTaskItems(parsed: ParsedTask[]): TaskItem[] {
  const tasks: TaskItem[] = [];

  for (const task of parsed) {
    if (task.description.length === 0) continue;
    tasks.push({
      id: `${tasks.length + 1}`,
      description: task.description,
      done: task.done,
    });
  }

  return tasks;
}

export interface GenerateApplyInstructionsOptions {
  planningHome?: PlanningHome;
  references?: ReferenceIndexEntry[];
  projectConfig?: ProjectConfig | null;
}

/**
 * Generates apply instructions for implementing tasks from a change.
 * Schema-aware: reads apply phase configuration from schema to determine
 * required artifacts, tracking file, and instruction.
 */
export async function generateApplyInstructions(
  projectRoot: string,
  changeName: string,
  schemaName?: string,
  options: GenerateApplyInstructionsOptions = {}
): Promise<ApplyInstructions> {
  const planningHome =
    options.planningHome ?? resolveCurrentPlanningHomeSync({ startPath: projectRoot });
  const references = options.references;
  // loadChangeContext will auto-detect schema from metadata if not provided
  const context = loadChangeContext(projectRoot, changeName, schemaName, {
    changeDir: getChangeDir(planningHome, changeName),
    planningHome,
    projectConfig: options.projectConfig,
  });
  const changeDir = context.changeDir;

  // Get the full schema to access the apply phase configuration
  const schema = resolveSchema(context.schemaName, projectRoot);
  const applyConfig = schema.apply;

  // Determine required artifacts and tracking file from schema
  // Fallback: if no apply block, require all artifacts
  const requiredArtifactIds = applyConfig?.requires ?? schema.artifacts.map((a) => a.id);
  const tracksFile = applyConfig?.tracks ?? null;
  const schemaInstruction = applyConfig?.instruction ?? null;
  const operationInputs = loadOperationInputs(options.projectConfig ?? null, 'apply');

  // Check which required artifacts are missing. Artifacts the change skips
  // via skip_specs count as present - their files must not exist, and
  // status already reports them complete, so apply cannot block on them.
  const missingArtifacts: string[] = [];
  for (const artifactId of requiredArtifactIds) {
    if (context.skippedArtifacts?.has(artifactId)) {
      continue;
    }
    const artifact = schema.artifacts.find((a) => a.id === artifactId);
    if (artifact && resolveArtifactOutputs(changeDir, artifact.generates).length === 0) {
      missingArtifacts.push(artifactId);
    }
  }

  // Build context files from all existing artifacts in schema
  const contextFiles: Record<string, string[]> = {};
  for (const artifact of schema.artifacts) {
    const outputs = resolveArtifactOutputs(changeDir, artifact.generates);
    if (outputs.length > 0) {
      contextFiles[artifact.id] = outputs;
    }
  }

  // Parse tasks if tracking file exists
  let parsedTasks: ParsedTask[] = [];
  let tracksFileExists = false;
  if (tracksFile) {
    const tracksPath = resolveArtifactOutputPath(changeDir, tracksFile);
    tracksFileExists = fs.existsSync(tracksPath);
    if (tracksFileExists) {
      const tasksContent = await fs.promises.readFile(tracksPath, 'utf-8');
      parsedTasks = parseTaskLines(tasksContent);
    }
  }
  const tasks = toTaskItems(parsedTasks);

  // Calculate progress over every checkbox in the file, listed or not, so these
  // numbers match `openspec list` and archive's incomplete-task check.
  const total = parsedTasks.length;
  const complete = parsedTasks.filter((task) => task.done).length;
  const remaining = total - complete;

  // Determine state and instruction
  let state: ApplyInstructions['state'];
  let instruction: string;

  if (missingArtifacts.length > 0) {
    state = 'blocked';
    instruction = `暂时无法应用此变更。缺少产出物：${missingArtifacts.join(', ')}。\n请先使用 openspec-continue-change skill 创建缺失的产出物。`;
  } else if (tracksFile && !tracksFileExists) {
    // Tracking file configured but doesn't exist yet
    const tracksFilename = path.basename(tracksFile);
    state = 'blocked';
    instruction = `${tracksFilename} 文件缺失，必须先创建。\n使用 openspec-continue-change 来生成跟踪文件。`;
  } else if (tracksFile && tracksFileExists && tasks.length === 0) {
    // Tracking file exists but lists nothing an agent can work on: either no
    // checkboxes at all, or only checkboxes with no text after them.
    const tracksFilename = path.basename(tracksFile);
    state = 'blocked';
    instruction = `${tracksFilename} 文件已存在，但其中没有可执行的任务。\n请向 ${tracksFilename} 中添加任务，或使用 openspec-continue-change 重新生成。`;
  } else if (tracksFile && remaining === 0 && total > 0) {
    state = 'all_done';
    instruction = '所有任务已完成！此变更可以归档了。\n归档前请考虑运行测试并审查变更。';
  } else if (!tracksFile) {
    // No tracking file configured in schema - ready to apply
    state = 'ready';
    instruction = schemaInstruction?.trim() ?? '所有必需的产出物已完成。可以开始实现。';
  } else {
    state = 'ready';
    instruction = schemaInstruction?.trim() ?? '阅读上下文文件，按顺序处理待办任务，完成一项就标记一项。\n遇到阻塞或需要澄清时暂停。';
  }

  return {
    changeName,
    changeDir,
    schemaName: context.schemaName,
    contextFiles,
    progress: { total, complete, remaining },
    tasks,
    state,
    missingArtifacts: missingArtifacts.length > 0 ? missingArtifacts : undefined,
    instruction,
    ...(references !== undefined ? { references } : {}),
    ...operationInputs,
  };
}

export async function applyInstructionsCommand(options: ApplyInstructionsOptions): Promise<void> {
  // Resolve (and banner) before the spinner starts so stderr stays readable.
  const root = await resolveRootForCommand(options, { json: options.json });
  if (!root) {
    return;
  }

  const spinner = options.json ? undefined : ora('正在生成应用指令...').start();

  try {
    const planningHome = toPlanningHome(root);
    const projectRoot = root.path;
    const changeName = await validateChangeExists(
      options.change,
      projectRoot,
      root.changesDir,
      { newChangeHint: withStoreFlag(root, 'openspec-cn new change <name>') }
    );

    // Validate schema if explicitly provided
    if (options.schema) {
      validateSchemaExists(options.schema, projectRoot);
    }

    // One parsed config snapshot supplies schema fallback, references, context,
    // and operation guidance for this command.
    const { projectConfig, references } = await loadRootConfigContext(root);
    const instructions = await generateApplyInstructions(projectRoot, changeName, options.schema, {
      planningHome,
      references,
      projectConfig,
    });

    spinner?.stop();

    if (options.json) {
      console.log(JSON.stringify({ ...instructions, root: toRootOutput(root) }, null, 2));
      return;
    }

    printApplyInstructionsText(instructions);
  } catch (error) {
    spinner?.stop();
    throw error;
  }
}

export function printApplyInstructionsText(instructions: ApplyInstructions): void {
  const { changeName, schemaName, contextFiles, progress, tasks, state, missingArtifacts, instruction } = instructions;

  console.log(`## Apply: ${changeName}`);
  console.log(`Schema：${schemaName}`);
  console.log();

  if (instructions.references && instructions.references.length > 0) {
    console.log(renderReferencedStoresSection(instructions.references));
    console.log();
  }

  // Warning for blocked state
  if (state === 'blocked' && missingArtifacts) {
    console.log('### ⚠️ 已阻塞');
    console.log();
    console.log(`缺失的产出物：${missingArtifacts.join(', ')}`);
    console.log('使用 openspec-continue-change 技能先创建这些产出物。');
    console.log();
  }

  // Context files (dynamically from schema)
  const contextFileEntries = Object.entries(contextFiles);
  if (contextFileEntries.length > 0) {
    console.log('### 上下文文件');
    for (const [artifactId, filePaths] of contextFileEntries) {
      for (const filePath of filePaths) {
        console.log(`- ${artifactId}: ${filePath}`);
      }
    }
    console.log();
  }

  // Progress (only show if we have tracking)
  if (progress.total > 0 || tasks.length > 0) {
    console.log('### 进度');
    if (state === 'all_done') {
      console.log(`${progress.complete}/${progress.total} 已完成 ✓`);
    } else {
      console.log(`${progress.complete}/${progress.total} 已完成`);
    }
    console.log();
  }

  // Tasks
  if (tasks.length > 0) {
    console.log('### 任务');
    for (const task of tasks) {
      const checkbox = task.done ? '[x]' : '[ ]';
      console.log(`- ${checkbox} ${task.description}`);
    }
    console.log();
  }

  // Instruction
  console.log('### 指令');
  console.log(instruction);
  console.log();

  printOperationInputsText(instructions);
}

export function generateArchiveInstructions(
  changeName: string,
  projectConfig: ProjectConfig | null
): ArchiveInstructions {
  return {
    changeName,
    ...loadOperationInputs(projectConfig, 'archive'),
  };
}

export async function archiveInstructionsCommand(
  options: ArchiveInstructionsOptions
): Promise<void> {
  const root = await resolveRootForCommand(options, { json: options.json });
  if (!root) {
    return;
  }

  const spinner = options.json ? undefined : ora('正在加载归档输入...').start();

  try {
    const changeName = await validateChangeExists(
      options.change,
      root.path,
      root.changesDir,
      { newChangeHint: withStoreFlag(root, 'openspec-cn new change <name>') }
    );
    const projectConfig = readProjectConfig(root.path);
    const instructions = generateArchiveInstructions(changeName, projectConfig);

    spinner?.stop();

    if (options.json) {
      console.log(JSON.stringify({ ...instructions, root: toRootOutput(root) }, null, 2));
      return;
    }

    printArchiveInstructionsText(instructions);
  } catch (error) {
    spinner?.stop();
    throw error;
  }
}

export function printArchiveInstructionsText(instructions: ArchiveInstructions): void {
  console.log(`## 归档输入：${instructions.changeName}`);
  console.log();
  printOperationInputsText(instructions);
}

function printOperationInputsText(inputs: {
  context?: string;
  operationGuidance?: string[];
}): void {
  if (inputs.context) {
    console.log('### 项目上下文（必填的指令输入）');
    console.log(inputs.context);
    console.log();
  }

  if (inputs.operationGuidance && inputs.operationGuidance.length > 0) {
    console.log('### 操作指引（建议性）');
    for (const guidance of inputs.operationGuidance) {
      console.log(`- ${guidance}`);
    }
    console.log();
  }

  if (!inputs.context && !inputs.operationGuidance) {
    console.log('未配置项目上下文或操作指南。');
  }
}
