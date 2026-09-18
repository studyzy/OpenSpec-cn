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
import { isSpecsArtifactPath } from '../../core/artifact-graph/outputs.js';
import { findUnreadDeltaFiles } from '../../utils/spec-discovery.js';
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
  escapeEnvelopeAttribute,
  escapeEnvelopeTags,
  renderReferencedStoresBlock,
  renderReferencedStoresSection,
  sanitizeInline,
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
import { METADATA_FILENAME } from '../../utils/change-metadata.js';

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

  // Opening tag. The change name is a directory name read from disk, and the
  // read path rejects only separators and NUL - a quote in it would otherwise
  // close the attribute and forge siblings on this tag.
  console.log(
    `<artifact id="${escapeEnvelopeAttribute(artifactId)}"` +
      ` change="${escapeEnvelopeAttribute(changeName)}"` +
      ` schema="${escapeEnvelopeAttribute(schemaName)}">`
  );
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
  console.log(
    `为变更 "${escapeEnvelopeTags(changeName)}" 创建 ${escapeEnvelopeTags(artifactId)} 产出物。`
  );
  console.log(escapeEnvelopeTags(description));
  console.log('</task>');
  console.log();

  // Project context (AI constraint - do not include in output)
  if (context) {
    console.log('<project_context>');
    console.log('<!-- 以下是供你参考的背景信息。请勿将其包含在你的输出中。 -->');
    console.log(escapeEnvelopeTags(context));
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
      // Flattened so a newline cannot forge a sibling bullet, but never
      // truncated: these are instructions an agent has to follow in full.
      console.log(`- ${escapeEnvelopeTags(sanitizeInline(rule, Infinity))}`);
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
      console.log(`  <description>${escapeEnvelopeTags(dep.description)}</description>`);
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
    console.log(escapeEnvelopeTags(instruction.trim()));
    console.log('</instruction>');
    console.log();
  }

  // Template
  console.log('<template>');
  console.log('<!-- Use this as the structure for your output file. Fill in the sections. -->');
  // Copied verbatim into the artifact file, so its `<!-- ... -->` comments and
  // `<placeholder>` markers must survive - only the envelope's own closing
  // tags are neutralized.
  console.log(escapeEnvelopeTags(template.trim()));
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

/**
 * The command that builds one artifact.
 *
 * Every earlier remedy here named the `openspec-continue-change` skill, which
 * the `core` profile never installs - the advice was a dead end for the default
 * install. The CLI verb exists on every profile and is what the skill runs.
 */
function describeArtifactRemedy(
  changeName: string,
  artifactId?: string,
  options: { many?: boolean } = {}
): string {
  const target = artifactId ?? '<artifact>';
  const verb = options.many ? '请分别用' : '请用';
  return (
    `${verb} \`openspec instructions ${target} --change ${changeName}\` 创建` +
    `（\`openspec status --change ${changeName}\` 会显示还剩什么）。`
  );
}

/**
 * Finds the artifact a schema path is generated by, so a remedy can name it.
 */
function findArtifactIdFor(
  schema: { artifacts: { id: string; generates: string }[] },
  generates: string
): string | undefined {
  return schema.artifacts.find((artifact) => artifact.generates === generates)?.id;
}

/**
 * Everything still to build before apply can run, in build order.
 *
 * Apply blocks on the schema's `apply.requires` alone, so its own list stops at
 * the first hop: a change with only a proposal is told "Missing artifacts:
 * tasks" while the specs `tasks` depends on are missing too. An agent that
 * takes that literally writes the tracking file straight from the proposal and
 * skips the artifacts in between - the failure reported in #834 and #869.
 * Walking `requires` names the whole chain, the same set and order
 * `openspec status` already prints, without changing what apply blocks on.
 */
function collectMissingPrerequisites(input: {
  requiredArtifactIds: string[];
  schema: { artifacts: { id: string; requires: string[] }[] };
  buildOrder: string[];
  completed: Set<string>;
}): string[] {
  const { requiredArtifactIds, schema, buildOrder, completed } = input;
  const byId = new Map(schema.artifacts.map((artifact) => [artifact.id, artifact]));
  const missing = new Set<string>();
  const queue = [...requiredArtifactIds];
  const seen = new Set<string>(queue);

  while (queue.length > 0) {
    const id = queue.shift() as string;
    const artifact = byId.get(id);
    if (!artifact) continue;
    if (!completed.has(id)) missing.add(id);
    for (const dependency of artifact.requires) {
      if (seen.has(dependency)) continue;
      seen.add(dependency);
      queue.push(dependency);
    }
  }

  const order = new Map(buildOrder.map((id, index) => [id, index]));
  return [...missing].sort(
    (a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0)
  );
}

/**
 * Warnings apply reports alongside its instruction.
 *
 * Apply gates on the schema's `apply.requires` only, so a change whose tasks
 * file was written ahead of its specs reads as ready even though no delta spec
 * exists - the state `openspec validate` rejects. Blocking here would be a
 * policy change; naming the gap is not, and it is what keeps apply from being
 * the one surface that green-lights a change every other surface flags.
 *
 * Only reported once apply is past its own gate: for a change that has not
 * reached tasks yet, the missing specs are the next step rather than a warning.
 * Schemas that declare no spec-producing artifact carry `skip_specs` from
 * creation, so this never fires on them.
 *
 * A delta file the merge path never reads (specs/<capability>.md, a note
 * beside spec.md) still satisfies the specs glob, so it reads as written here
 * while validate rejects it and archive would drop it. Each one is named.
 */
async function collectApplyWarnings(input: {
  state: ApplyInstructions['state'];
  schema: { artifacts: { id: string; generates: string }[] };
  changeDir: string;
  changeName: string;
  skippedArtifacts?: Set<string>;
}): Promise<string[]> {
  const { state, schema, changeDir, changeName, skippedArtifacts } = input;
  if (state === 'blocked') return [];

  const specArtifacts = schema.artifacts.filter((artifact) =>
    isSpecsArtifactPath(artifact.generates)
  );
  if (specArtifacts.length === 0) return [];
  if (specArtifacts.some((artifact) => skippedArtifacts?.has(artifact.id))) return [];
  const warnings = (await findUnreadDeltaFiles(path.join(changeDir, 'specs'))).map(
    (file) =>
      `specs/${file.path} is not a capability's spec.md, so \`openspec validate ${changeName}\` rejects it and archive never merges it. ` +
      `Move its requirements into specs/${file.expected}.`
  );
  const hasDeltas = specArtifacts.some(
    (artifact) => resolveArtifactOutputs(changeDir, artifact.generates).length > 0
  );
  if (hasDeltas) return warnings;

  const metadataPath = path.join(changeDir, METADATA_FILENAME);
  // The command names the artifact this schema actually declares, never the
  // literal `specs`. A schema whose spec-producing artifact is `contracts` was
  // told to run `openspec instructions specs`, an artifact it does not have,
  // so the warning dead-ended at the exact step meant to resolve it. With more
  // than one such artifact there is no single right answer, so the id becomes
  // a placeholder rather than a guess.
  const specTarget = specArtifacts.length === 1 ? specArtifacts[0].id : '<artifact-id>';
  return [
    ...warnings,
    `此变更没有增量规范（delta specs），也未声明 \`skip_specs: true\`，因此 \`openspec-cn validate ${changeName}\` 会校验失败。` +
      `在实现前先编写增量规范（\`openspec-cn instructions ${specTarget} --change ${changeName}\`），` +
      `或者，如果此变更确实没有改变任何已指定的行为，则在 ${metadataPath} 中添加 \`skip_specs: true\`。`,
  ];
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

  // Everything still to build, not just the first hop apply blocks on.
  const missingPrerequisites = collectMissingPrerequisites({
    requiredArtifactIds: [...requiredArtifactIds],
    schema,
    buildOrder: context.graph.getBuildOrder(),
    completed: context.completed,
  });

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
    const chain =
      missingPrerequisites.length > missingArtifacts.length
        ? `\n尚未创建，按构建顺序：${missingPrerequisites.join(', ')}。` +
          ` 在应用前先构建此变更所需的部分 - schema 会指明哪些是条件性的。`
        : '';
    instruction =
      `暂时无法应用此变更。缺少产出物：${missingArtifacts.join(', ')}。${chain}` +
      `\n${describeArtifactRemedy(
        changeName,
        // Only name one when one is left: the first of several would be the
        // schema's conditional artifact as often as not.
        missingPrerequisites.length === 1 ? missingPrerequisites[0] : undefined,
        { many: missingPrerequisites.length > 1 }
      )}`;
  } else if (tracksFile && !tracksFileExists) {
    // Tracking file configured but doesn't exist yet
    const tracksFilename = path.basename(tracksFile);
    state = 'blocked';
    instruction =
      `${tracksFilename} 文件缺失，必须先创建。` +
      `\n${describeArtifactRemedy(changeName, findArtifactIdFor(schema, tracksFile))}`;
  } else if (tracksFile && tracksFileExists && tasks.length === 0) {
    // Tracking file exists but lists nothing an agent can work on: either no
    // checkboxes at all, or only checkboxes with no text after them.
    const tracksFilename = path.basename(tracksFile);
    state = 'blocked';
    instruction =
      `${tracksFilename} 文件已存在，但其中没有可执行的任务。` +
      `\n向 ${tracksFilename} 中添加任务，或重建它：${describeArtifactRemedy(changeName, findArtifactIdFor(schema, tracksFile))}`;
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

  const warnings = await collectApplyWarnings({
    state,
    schema,
    changeDir,
    changeName,
    skippedArtifacts: context.skippedArtifacts,
  });

  return {
    changeName,
    changeDir,
    schemaName: context.schemaName,
    contextFiles,
    progress: { total, complete, remaining },
    tasks,
    state,
    missingArtifacts: missingArtifacts.length > 0 ? missingArtifacts : undefined,
    ...(missingPrerequisites.length > 0 ? { missingPrerequisites } : {}),
    ...(warnings.length > 0 ? { warnings } : {}),
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
  const { changeName, schemaName, contextFiles, progress, tasks, state, missingArtifacts, warnings, instruction } = instructions;

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
    if (
      instructions.missingPrerequisites &&
      instructions.missingPrerequisites.length > missingArtifacts.length
    ) {
      console.log(
        `尚未创建，按构建顺序：${instructions.missingPrerequisites.join(', ')}`
      );
    }
    console.log();
  }

  if (warnings && warnings.length > 0) {
    console.log('### ⚠️ 警告');
    console.log();
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
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
    // Printed verbatim on purpose. Escaping a leading `#` would also fire inside
    // fenced code (`# install deps`), so heading forgery is not guarded here.
    console.log(inputs.context);
    console.log();
  }

  if (inputs.operationGuidance && inputs.operationGuidance.length > 0) {
    console.log('### 操作指引（建议性）');
    for (const guidance of inputs.operationGuidance) {
      console.log(`- ${sanitizeInline(guidance, Infinity)}`);
    }
    console.log();
  }

  if (!inputs.context && !inputs.operationGuidance) {
    console.log('未配置项目上下文或操作指南。');
  }
}
