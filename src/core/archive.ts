import { promises as fs } from 'fs';
import path from 'path';
import { FileSystemUtils } from '../utils/file-system.js';
import { getTaskProgressForChange, formatTaskStatus } from '../utils/task-progress.js';
import { Validator } from './validation/validator.js';
import chalk from 'chalk';
import {
  extractRequirementsSection,
  parseDeltaSpec,
  normalizeRequirementName,
  type RequirementBlock,
} from './parsers/requirement-blocks.js';

interface SpecUpdate {
  source: string;
  target: string;
  exists: boolean;
}

export class ArchiveCommand {
  async execute(
    changeName?: string,
    options: { yes?: boolean; skipSpecs?: boolean; noValidate?: boolean; validate?: boolean } = {}
  ): Promise<void> {
    const targetPath = '.';
    const changesDir = path.join(targetPath, 'openspec', 'changes');
    const archiveDir = path.join(changesDir, 'archive');
    const mainSpecsDir = path.join(targetPath, 'openspec', 'specs');

    // Check if changes directory exists
    try {
      await fs.access(changesDir);
    } catch {
      throw new Error("未找到OpenSpec更改目录。请先运行 'openspec-cn init'。");
    }

    // Get change name interactively if not provided
    if (!changeName) {
      const selectedChange = await this.selectChange(changesDir);
      if (!selectedChange) {
        console.log('未选择任何更改。已中止。');
        return;
      }
      changeName = selectedChange;
    }

    const changeDir = path.join(changesDir, changeName);

    // Verify change exists
    try {
      const stat = await fs.stat(changeDir);
      if (!stat.isDirectory()) {
        throw new Error(`未找到更改 '${changeName}'。`);
      }
    } catch {
      throw new Error(`未找到更改 '${changeName}'。`);
    }

    const skipValidation = options.validate === false || options.noValidate === true;

    // Validate specs and change before archiving
    if (!skipValidation) {
      const validator = new Validator();
      let hasValidationErrors = false;

      // Validate proposal.md (非严格，仅供参考)
      const changeFile = path.join(changeDir, 'proposal.md');
      try {
        await fs.access(changeFile);
        const changeReport = await validator.validateChange(changeFile);
        // Proposal 校验仅提供信息，不阻塞归档
        if (!changeReport.valid) {
          console.log(chalk.yellow(`\nproposal.md中的提案警告（非阻塞）：`));
          for (const issue of changeReport.issues) {
            const symbol = issue.level === 'ERROR' ? '⚠' : (issue.level === 'WARNING' ? '⚠' : 'ℹ');
            console.log(chalk.yellow(`  ${symbol} ${issue.message}`));
          }
        }
      } catch {
        // Change file doesn't exist, skip validation
      }

      // Validate delta-formatted spec files under the change directory if present
      const changeSpecsDir = path.join(changeDir, 'specs');
      let hasDeltaSpecs = false;
      try {
        const candidates = await fs.readdir(changeSpecsDir, { withFileTypes: true });
        for (const c of candidates) {
          if (c.isDirectory()) {
            try {
              const candidatePath = path.join(changeSpecsDir, c.name, 'spec.md');
              await fs.access(candidatePath);
              const content = await fs.readFile(candidatePath, 'utf-8');
              if (/^##\s+(新增需求|修改需求|移除需求|重命名需求)\s*$/m.test(content)) {
                hasDeltaSpecs = true;
                break;
              }

            } catch {}
          }
        }
      } catch {}
      if (hasDeltaSpecs) {
        const deltaReport = await validator.validateChangeDeltaSpecs(changeDir);
        if (!deltaReport.valid) {
          hasValidationErrors = true;
          console.log(chalk.red(`\n更改增量规范中的验证错误：`));
          for (const issue of deltaReport.issues) {
            if (issue.level === 'ERROR') {
              console.log(chalk.red(`  ✗ ${issue.message}`));
            } else if (issue.level === 'WARNING') {
              console.log(chalk.yellow(`  ⚠ ${issue.message}`));
            }
          }
        }
      }

      if (hasValidationErrors) {
        console.log(chalk.red('\n验证失败。请在归档前修复错误。'));
        console.log(chalk.yellow('要跳过验证（不推荐），请使用 --no-validate 标志。'));
        return;
      }
    } else {
      // Log warning when validation is skipped
      const timestamp = new Date().toISOString();
      
      if (!options.yes) {
        const { confirm } = await import('@inquirer/prompts');
        const proceed = await confirm({
          message: chalk.yellow('⚠️  警告：跳过验证可能会归档无效规范。继续吗？(y/N)'),
          default: false
        });
        if (!proceed) {
          console.log('归档已取消。');
          return;
        }
      } else {
        console.log(chalk.yellow(`\n⚠️  警告：跳过验证可能会归档无效规范。`));
      }
      
      console.log(chalk.yellow(`[${timestamp}] 验证已跳过更改：${changeName}`));
      console.log(chalk.yellow(`受影响文件：${changeDir}`));
    }

    // Show progress and check for incomplete tasks
    const progress = await getTaskProgressForChange(changesDir, changeName);
    const status = formatTaskStatus(progress);
    console.log(`任务状态：${status}`);

    const incompleteTasks = Math.max(progress.total - progress.completed, 0);
    if (incompleteTasks > 0) {
      if (!options.yes) {
        const { confirm } = await import('@inquirer/prompts');
        const proceed = await confirm({
          message: `警告：发现 ${incompleteTasks} 个未完成任务。继续吗？`,
          default: false
        });
        if (!proceed) {
          console.log('归档已取消。');
          return;
        }
      } else {
        console.log(`警告：发现 ${incompleteTasks} 个未完成任务。由于 --yes 标志继续。`);
      }
    }

    // Handle spec updates unless skipSpecs flag is set
    if (options.skipSpecs) {
      console.log('跳过规范更新（提供了 --skip-specs 标志）。');
    } else {
      // Find specs to update
      const specUpdates = await this.findSpecUpdates(changeDir, mainSpecsDir);
      
      if (specUpdates.length > 0) {
        console.log('\n要更新的规范：');
        for (const update of specUpdates) {
          const status = update.exists ? 'update' : 'create';
          const capability = path.basename(path.dirname(update.target));
          console.log(`  ${capability}: ${status === 'update' ? '更新' : '创建'}`);
        }

        let shouldUpdateSpecs = true;
        if (!options.yes) {
          const { confirm } = await import('@inquirer/prompts');
          shouldUpdateSpecs = await confirm({
            message: '继续执行规范更新吗？',
            default: true
          });
          if (!shouldUpdateSpecs) {
            console.log('跳过规范更新。继续归档。');
          }
        }

        if (shouldUpdateSpecs) {
          // Prepare all updates first (validation pass, no writes)
          const prepared: Array<{ update: SpecUpdate; rebuilt: string; counts: { added: number; modified: number; removed: number; renamed: number } }> = [];
          try {
            for (const update of specUpdates) {
              const built = await this.buildUpdatedSpec(update, changeName!);
              prepared.push({ update, rebuilt: built.rebuilt, counts: built.counts });
            }
          } catch (err: any) {
            console.log(String(err.message || err));
            console.log('已中止。未更改任何文件。');
            return;
          }

          // All validations passed; pre-validate rebuilt full spec and then write files and display counts
          let totals = { added: 0, modified: 0, removed: 0, renamed: 0 };
          for (const p of prepared) {
            const specName = path.basename(path.dirname(p.update.target));
            if (!skipValidation) {
              const report = await new Validator().validateSpecContent(specName, p.rebuilt);
              if (!report.valid) {
                console.log(chalk.red(`\n${specName}重建规范中的验证错误（将不会写入更改）：`));
                for (const issue of report.issues) {
                  if (issue.level === 'ERROR') console.log(chalk.red(`  ✗ ${issue.message}`));
                  else if (issue.level === 'WARNING') console.log(chalk.yellow(`  ⚠ ${issue.message}`));
                }
                console.log('已中止。未更改任何文件。');
                return;
              }
            }
            await this.writeUpdatedSpec(p.update, p.rebuilt, p.counts);
            totals.added += p.counts.added;
            totals.modified += p.counts.modified;
            totals.removed += p.counts.removed;
            totals.renamed += p.counts.renamed;
          }
          console.log(
            `总计：+ ${totals.added} 新增，~ ${totals.modified} 修改，- ${totals.removed} 删除，→ ${totals.renamed} 重命名`
          );
          console.log('规范更新成功。');
        }
      }
    }

    // Create archive directory with date prefix
    const archiveName = `${this.getArchiveDate()}-${changeName}`;
    const archivePath = path.join(archiveDir, archiveName);

    // Check if archive already exists
    try {
      await fs.access(archivePath);
      throw new Error(`归档 '${archiveName}' 已经存在。`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    // Create archive directory if needed
    await fs.mkdir(archiveDir, { recursive: true });

    // Move change to archive
    await fs.rename(changeDir, archivePath);
    
    console.log(`更改 '${changeName}' 已归档为 '${archiveName}'。`);
  }

  private async selectChange(changesDir: string): Promise<string | null> {
    const { select } = await import('@inquirer/prompts');
    // Get all directories in changes (excluding archive)
    const entries = await fs.readdir(changesDir, { withFileTypes: true });
    const changeDirs = entries
      .filter(entry => entry.isDirectory() && entry.name !== 'archive')
      .map(entry => entry.name)
      .sort();

    if (changeDirs.length === 0) {
      console.log('未找到活动的更改。');
      return null;
    }

    // Build choices with progress inline to avoid duplicate lists
    let choices: Array<{ name: string; value: string }> = changeDirs.map(name => ({ name, value: name }));
    try {
      const progressList: Array<{ id: string; status: string }> = [];
      for (const id of changeDirs) {
        const progress = await getTaskProgressForChange(changesDir, id);
        const status = formatTaskStatus(progress);
        progressList.push({ id, status });
      }
      const nameWidth = Math.max(...progressList.map(p => p.id.length));
      choices = progressList.map(p => ({
        name: `${p.id.padEnd(nameWidth)}     ${p.status}`,
        value: p.id
      }));
    } catch {
      // If anything fails, fall back to simple names
      choices = changeDirs.map(name => ({ name, value: name }));
    }

    try {
      const answer = await select({
        message: '选择要归档的更改',
        choices
      });
      return answer;
    } catch (error) {
      // User cancelled (Ctrl+C)
      return null;
    }
  }

  // Deprecated: replaced by shared task-progress utilities
  private async checkIncompleteTasks(_tasksPath: string): Promise<number> {
    return 0;
  }

  private async findSpecUpdates(changeDir: string, mainSpecsDir: string): Promise<SpecUpdate[]> {
    const updates: SpecUpdate[] = [];
    const changeSpecsDir = path.join(changeDir, 'specs');

    try {
      const entries = await fs.readdir(changeSpecsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const specFile = path.join(changeSpecsDir, entry.name, 'spec.md');
          const targetFile = path.join(mainSpecsDir, entry.name, 'spec.md');
          
          try {
            await fs.access(specFile);
            
            // Check if target exists
            let exists = false;
            try {
              await fs.access(targetFile);
              exists = true;
            } catch {
              exists = false;
            }

            updates.push({
              source: specFile,
              target: targetFile,
              exists
            });
          } catch {
            // Source spec doesn't exist, skip
          }
        }
      }
    } catch {
      // No specs directory in change
    }

    return updates;
  }

  private async buildUpdatedSpec(update: SpecUpdate, changeName: string): Promise<{ rebuilt: string; counts: { added: number; modified: number; removed: number; renamed: number } }> {
    // Read change spec content (delta-format expected)
    const changeContent = await fs.readFile(update.source, 'utf-8');

    // Parse deltas from the change spec file
    const plan = parseDeltaSpec(changeContent);
    const specName = path.basename(path.dirname(update.target));

    // Pre-validate duplicates within sections
    const addedNames = new Set<string>();
    for (const add of plan.added) {
      const name = normalizeRequirementName(add.name);
      if (addedNames.has(name)) {
        throw new Error(
          `${specName} 验证失败 - 新增需求中存在重复，标题为 "### 需求： ${add.name}"`
        );
      }
      addedNames.add(name);
    }
    const modifiedNames = new Set<string>();
    for (const mod of plan.modified) {
      const name = normalizeRequirementName(mod.name);
      if (modifiedNames.has(name)) {
        throw new Error(
          `${specName} 验证失败 - 修改需求中存在重复，标题为 "### 需求： ${mod.name}"`
        );
      }
      modifiedNames.add(name);
    }
    const removedNamesSet = new Set<string>();
    for (const rem of plan.removed) {
      const name = normalizeRequirementName(rem);
      if (removedNamesSet.has(name)) {
        throw new Error(
          `${specName} 验证失败 - 移除需求中存在重复，标题为 "### 需求： ${rem}"`
        );
      }
      removedNamesSet.add(name);
    }
    const renamedFromSet = new Set<string>();
    const renamedToSet = new Set<string>();
    for (const { from, to } of plan.renamed) {
      const fromNorm = normalizeRequirementName(from);
      const toNorm = normalizeRequirementName(to);
      if (renamedFromSet.has(fromNorm)) {
        throw new Error(
          `${specName} 验证失败 - 重命名需求中 FROM 存在重复，标题为 "### 需求： ${from}"`
        );
      }
      if (renamedToSet.has(toNorm)) {
        throw new Error(
          `${specName} 验证失败 - 重命名需求中 TO 存在重复，标题为 "### 需求： ${to}"`
        );
      }
      renamedFromSet.add(fromNorm);
      renamedToSet.add(toNorm);
    }

    // Pre-validate cross-section conflicts
    const conflicts: Array<{ name: string; a: string; b: string }> = [];
    for (const n of modifiedNames) {
      if (removedNamesSet.has(n)) conflicts.push({ name: n, a: '修改需求', b: '移除需求' });
      if (addedNames.has(n)) conflicts.push({ name: n, a: '修改需求', b: '新增需求' });
    }
    for (const n of addedNames) {
      if (removedNamesSet.has(n)) conflicts.push({ name: n, a: '新增需求', b: '移除需求' });
    }
    // Renamed interplay: MODIFIED must reference the NEW header, not FROM
    for (const { from, to } of plan.renamed) {
      const fromNorm = normalizeRequirementName(from);
      const toNorm = normalizeRequirementName(to);
      if (modifiedNames.has(fromNorm)) {
        throw new Error(
          `${specName} 验证失败 - 当存在重命名时，MODIFIED 必须引用新标题 "### 需求： ${to}"`
        );
      }
      // Detect ADDED colliding with a RENAMED TO
      if (addedNames.has(toNorm)) {
        throw new Error(
          `${specName} 验证失败 - 重命名需求的 TO 与新增需求冲突，标题为 "### 需求： ${to}"`
        );
      }
    }
    if (conflicts.length > 0) {
      const c = conflicts[0];
      throw new Error(
        `${specName} 验证失败 - 需求出现在多个部分中（${c.a} 和 ${c.b}），标题为 "### 需求： ${c.name}"`
      );
    }
    const hasAnyDelta = (plan.added.length + plan.modified.length + plan.removed.length + plan.renamed.length) > 0;
    if (!hasAnyDelta) {
      throw new Error(
        `未找到 ${path.basename(path.dirname(update.source))} 的任何操作。` +
        `请在变更规范中提供 ADDED/MODIFIED/REMOVED/RENAMED 部分。`
      );
    }

    // Load or create base target content
    let targetContent: string;
    try {
      targetContent = await fs.readFile(update.target, 'utf-8');
    } catch {
      // Target spec does not exist; only ADDED operations are permitted
      if (plan.modified.length > 0 || plan.removed.length > 0 || plan.renamed.length > 0) {
        throw new Error(
          `${specName}: 目标规范不存在；新规范仅允许 ADDED 需求。`
        );
      }
      targetContent = this.buildSpecSkeleton(specName, changeName);
    }

    // Extract requirements section and build name->block map
    const parts = extractRequirementsSection(targetContent);
    const nameToBlock = new Map<string, RequirementBlock>();
    for (const block of parts.bodyBlocks) {
      nameToBlock.set(normalizeRequirementName(block.name), block);
    }

    // Apply operations in order: RENAMED → REMOVED → MODIFIED → ADDED
    // RENAMED
    for (const r of plan.renamed) {
      const from = normalizeRequirementName(r.from);
      const to = normalizeRequirementName(r.to);
      if (!nameToBlock.has(from)) {
        throw new Error(
          `${specName} 重命名失败，标题 "### 需求： ${r.from}" - 未找到源`
        );
      }
      if (nameToBlock.has(to)) {
        throw new Error(
          `${specName} 重命名失败，标题 "### 需求： ${r.to}" - 目标已经存在`
        );
      }
      const block = nameToBlock.get(from)!;
      // Preserve the original header style (Requirement vs 需求) if possible, but default to consistent new header
      const newHeader = block.headerLine.includes('需求') ? `### 需求： ${to}` : `### 需求： ${to}`;
      const rawLines = block.raw.split('\n');
      rawLines[0] = newHeader;
      const renamedBlock: RequirementBlock = {
        headerLine: newHeader,
        name: to,
        raw: rawLines.join('\n'),
      };
      nameToBlock.delete(from);
      nameToBlock.set(to, renamedBlock);
    }

    // REMOVED
    for (const name of plan.removed) {
      const key = normalizeRequirementName(name);
      if (!nameToBlock.has(key)) {
        throw new Error(
          `${specName} 移除失败，标题 "### 需求： ${name}" - 未找到`
        );
      }
      nameToBlock.delete(key);
    }

    // MODIFIED
    for (const mod of plan.modified) {
      const key = normalizeRequirementName(mod.name);
      if (!nameToBlock.has(key)) {
        throw new Error(
          `${specName} 修改失败，标题 "### 需求： ${mod.name}" - 未找到`
        );
      }
      // Replace block with provided raw (ensure header line matches key)
      const REQUIREMENT_KEYWORD_PATTERN = '(?:Requirement|需求)';
      const REQUIREMENT_COLON_PATTERN = '[:：]';
      const modHeaderMatch = mod.raw.split('\n')[0].match(new RegExp(`^###\\s*${REQUIREMENT_KEYWORD_PATTERN}${REQUIREMENT_COLON_PATTERN}\\s*(.+)\\s*$`));
      if (!modHeaderMatch || normalizeRequirementName(modHeaderMatch[1]) !== key) {
        throw new Error(
          `${specName} 修改失败，标题 "### 需求： ${mod.name}" - 内容中的标题不匹配`
        );
      }
      nameToBlock.set(key, mod);

    }

    // ADDED
    for (const add of plan.added) {
      const key = normalizeRequirementName(add.name);
      if (nameToBlock.has(key)) {
        throw new Error(
          `${specName} 新增失败，标题 "### 需求： ${add.name}" - 已经存在`
        );
      }
      nameToBlock.set(key, add);
    }

    // Duplicates within resulting map are implicitly prevented by key uniqueness.

    // Recompose requirements section preserving original ordering where possible
    const keptOrder: RequirementBlock[] = [];
    const seen = new Set<string>();
    for (const block of parts.bodyBlocks) {
      const key = normalizeRequirementName(block.name);
      const replacement = nameToBlock.get(key);
      if (replacement) {
        keptOrder.push(replacement);
        seen.add(key);
      }
    }
    // Append any newly added that were not in original order
    for (const [key, block] of nameToBlock.entries()) {
      if (!seen.has(key)) {
        keptOrder.push(block);
      }
    }

    const reqBody = [
      parts.preamble && parts.preamble.trim() ? parts.preamble.trimEnd() : ''
    ]
      .filter(Boolean)
      .concat(keptOrder.map(b => b.raw))
      .join('\n\n')
      .trimEnd();

    const rebuilt = [
      parts.before.trimEnd(),
      parts.headerLine,
      reqBody,
      parts.after
    ]
      .filter((s, idx) => !(idx === 0 && s === ''))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');

    return {
      rebuilt,
      counts: {
        added: plan.added.length,
        modified: plan.modified.length,
        removed: plan.removed.length,
        renamed: plan.renamed.length,
      }
    };
  }

  private async writeUpdatedSpec(update: SpecUpdate, rebuilt: string, counts: { added: number; modified: number; removed: number; renamed: number }): Promise<void> {
    // Create target directory if needed
    const targetDir = path.dirname(update.target);
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(update.target, rebuilt);

    const specName = path.basename(path.dirname(update.target));
    console.log(`应用变更到 openspec/specs/${specName}/spec.md:`);
    if (counts.added) console.log(`  + 新增 ${counts.added} 条`);
    if (counts.modified) console.log(`  ~ 修改 ${counts.modified} 条`);
    if (counts.removed) console.log(`  - 删除 ${counts.removed} 条`);
    if (counts.renamed) console.log(`  → 重命名 ${counts.renamed} 条`);
  }

  private buildSpecSkeleton(specFolderName: string, changeName: string): string {
    const titleBase = specFolderName;
    return `# ${titleBase} Specification\n\n## Purpose\nTBD - created by archiving change ${changeName}. Update Purpose after archive.\n\n## 需求\n`;
  }

  private getArchiveDate(): string {
    // Returns date in YYYY-MM-DD format
    return new Date().toISOString().split('T')[0];
  }
}
