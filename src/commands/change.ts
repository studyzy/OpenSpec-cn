import { promises as fs } from 'fs';
import path from 'path';
import { select } from '@inquirer/prompts';
import { JsonConverter } from '../core/converters/json-converter.js';
import { Validator } from '../core/validation/validator.js';
import { ChangeParser } from '../core/parsers/change-parser.js';
import { Change } from '../core/schemas/index.js';
import { isInteractive } from '../utils/interactive.js';
import { getActiveChangeIds } from '../utils/item-discovery.js';

// Constants for better maintainability
const ARCHIVE_DIR = 'archive';
const TASK_PATTERN = /^[-*]\s+\[[\sx]\]/i;
const COMPLETED_TASK_PATTERN = /^[-*]\s+\[x\]/i;

export class ChangeCommand {
  private converter: JsonConverter;

  constructor() {
    this.converter = new JsonConverter();
  }

  /**
   * Show a change proposal.
   * - Text mode: raw markdown passthrough (no filters)
   * - JSON mode: minimal object with deltas; --deltas-only returns same object with filtered deltas
   *   Note: --requirements-only is deprecated alias for --deltas-only
   */
  async show(changeName?: string, options?: { json?: boolean; requirementsOnly?: boolean; deltasOnly?: boolean; noInteractive?: boolean }): Promise<void> {
    const changesPath = path.join(process.cwd(), 'openspec', 'changes');

    if (!changeName) {
      const canPrompt = isInteractive(options?.noInteractive);
      const changes = await this.getActiveChanges(changesPath);
      if (canPrompt && changes.length > 0) {
        const selected = await select({
          message: '选择一个变更以显示',
          choices: changes.map(id => ({ name: id, value: id })),
        });
        changeName = selected;
      } else {
        if (changes.length === 0) {
          console.error('未指定变更。未找到活动变更。');
        } else {
          console.error(`未指定变更。可用ID：${changes.join(', ')}`);
        }
        console.error('提示：使用 "openspec-cn change list" 查看可用变更。');
        process.exitCode = 1;
        return;
      }
    }

    const proposalPath = path.join(changesPath, changeName, 'proposal.md');

    try {
      await fs.access(proposalPath);
    } catch {
      throw new Error(`在 ${proposalPath} 未找到变更 "${changeName}"`);
    }

    if (options?.json) {
      const jsonOutput = await this.converter.convertChangeToJson(proposalPath);

      if (options.requirementsOnly) {
        console.error('标志 --requirements-only 已弃用；请改用 --deltas-only。');
      }

      const parsed: Change = JSON.parse(jsonOutput);
      const contentForTitle = await fs.readFile(proposalPath, 'utf-8');
      const title = this.extractTitle(contentForTitle, changeName);
      const id = parsed.name;
      const deltas = parsed.deltas || [];

      if (options.requirementsOnly || options.deltasOnly) {
        const output = { id, title, deltaCount: deltas.length, deltas };
        console.log(JSON.stringify(output, null, 2));
      } else {
        const output = {
          id,
          title,
          deltaCount: deltas.length,
          deltas,
        };
        console.log(JSON.stringify(output, null, 2));
      }
    } else {
      const content = await fs.readFile(proposalPath, 'utf-8');
      console.log(content);
    }
  }

  /**
   * List active changes.
   * - Text default: IDs only; --long prints minimal details (title, counts)
   * - JSON: array of { id, title, deltaCount, taskStatus }, sorted by id
   */
  async list(options?: { json?: boolean; long?: boolean }): Promise<void> {
    const changesPath = path.join(process.cwd(), 'openspec', 'changes');
    
    const changes = await this.getActiveChanges(changesPath);
    
    if (options?.json) {
      const changeDetails = await Promise.all(
        changes.map(async (changeName) => {
          const proposalPath = path.join(changesPath, changeName, 'proposal.md');
          const tasksPath = path.join(changesPath, changeName, 'tasks.md');
          
          try {
            const content = await fs.readFile(proposalPath, 'utf-8');
            const changeDir = path.join(changesPath, changeName);
            const parser = new ChangeParser(content, changeDir);
            const change = await parser.parseChangeWithDeltas(changeName);
            
            let taskStatus = { total: 0, completed: 0 };
            try {
              const tasksContent = await fs.readFile(tasksPath, 'utf-8');
              taskStatus = this.countTasks(tasksContent);
            } catch (error) {
              // Tasks file may not exist, which is okay
              if (process.env.DEBUG) {
                console.error(`Failed to read tasks file at ${tasksPath}:`, error);
              }
            }
            
            return {
              id: changeName,
              title: this.extractTitle(content, changeName),
              deltaCount: change.deltas.length,
              taskStatus,
            };
          } catch (error) {
            return {
              id: changeName,
              title: 'Unknown',
              deltaCount: 0,
              taskStatus: { total: 0, completed: 0 },
            };
          }
        })
      );
      
      const sorted = changeDetails.sort((a, b) => a.id.localeCompare(b.id));
      console.log(JSON.stringify(sorted, null, 2));
    } else {
      if (changes.length === 0) {
        console.log('未找到项目');
        return;
      }
      const sorted = [...changes].sort();
      if (!options?.long) {
        // IDs only
        sorted.forEach(id => console.log(id));
        return;
      }

      // Long format: id: title and minimal counts
      for (const changeName of sorted) {
        const proposalPath = path.join(changesPath, changeName, 'proposal.md');
        const tasksPath = path.join(changesPath, changeName, 'tasks.md');
        try {
          const content = await fs.readFile(proposalPath, 'utf-8');
          const title = this.extractTitle(content, changeName);
          let taskStatusText = '';
          try {
            const tasksContent = await fs.readFile(tasksPath, 'utf-8');
            const { total, completed } = this.countTasks(tasksContent);
            taskStatusText = ` [任务 ${completed}/${total}]`;
          } catch (error) {
            if (process.env.DEBUG) {
              console.error(`Failed to read tasks file at ${tasksPath}:`, error);
            }
          }
          const changeDir = path.join(changesPath, changeName);
          const parser = new ChangeParser(await fs.readFile(proposalPath, 'utf-8'), changeDir);
          const change = await parser.parseChangeWithDeltas(changeName);
          const deltaCountText = ` [增量 ${change.deltas.length}]`;
          console.log(`${changeName}: ${title}${deltaCountText}${taskStatusText}`);
        } catch {
          console.log(`${changeName}: (无法读取)`);
        }
      }
    }
  }

  async validate(changeName?: string, options?: { strict?: boolean; json?: boolean; noInteractive?: boolean }): Promise<void> {
    const changesPath = path.join(process.cwd(), 'openspec', 'changes');
    
    if (!changeName) {
      const canPrompt = isInteractive(options?.noInteractive);
      const changes = await getActiveChangeIds();
      if (canPrompt && changes.length > 0) {
        const selected = await select({
          message: '选择一个变更以验证',
          choices: changes.map(id => ({ name: id, value: id })),
        });
        changeName = selected;
      } else {
        if (changes.length === 0) {
          console.error('未指定变更。未找到活动变更。');
        } else {
          console.error(`未指定变更。可用ID：${changes.join(', ')}`);
        }
        console.error('提示：使用 "openspec-cn change list" 查看可用变更。');
        process.exitCode = 1;
        return;
      }
    }
    
    const changeDir = path.join(changesPath, changeName);
    
    try {
      await fs.access(changeDir);
    } catch {
      throw new Error(`在 ${changeDir} 未找到变更 "${changeName}"`);
    }
    
    const validator = new Validator(options?.strict || false);
    const report = await validator.validateChangeDeltaSpecs(changeDir);
    
    if (options?.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      if (report.valid) {
        console.log(`变更 "${changeName}" 有效`);
      } else {
        console.error(`变更 "${changeName}" 存在问题`);
        report.issues.forEach(issue => {
          const label = issue.level === 'ERROR' ? 'ERROR' : 'WARNING';
          const prefix = issue.level === 'ERROR' ? '✗' : '⚠';
          console.error(`${prefix} [${label}] ${issue.path}: ${issue.message}`);
        });
        // Next steps footer to guide fixing issues
        this.printNextSteps();
        if (!options?.json) {
          process.exitCode = 1;
        }
      }
    }
  }

  private async getActiveChanges(changesPath: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(changesPath, { withFileTypes: true });
      const result: string[] = [];
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === ARCHIVE_DIR) continue;
        const proposalPath = path.join(changesPath, entry.name, 'proposal.md');
        try {
          await fs.access(proposalPath);
          result.push(entry.name);
        } catch {
          // skip directories without proposal.md
        }
      }
      return result.sort();
    } catch {
      return [];
    }
  }

  private extractTitle(content: string, changeName: string): string {
    const match = content.match(/^#\s+(?:Change:|变更：|变更:)\s*(.+)$/im);
    return match ? match[1].trim() : changeName;
  }

  private countTasks(content: string): { total: number; completed: number } {
    const lines = content.split('\n');
    let total = 0;
    let completed = 0;
    
    for (const line of lines) {
      if (line.match(TASK_PATTERN)) {
        total++;
        if (line.match(COMPLETED_TASK_PATTERN)) {
          completed++;
        }
      }
    }
    
    return { total, completed };
  }

  private printNextSteps(): void {
    const bullets: string[] = [];
    bullets.push('- 确保变更在specs/中有增量：使用标题## 新增|修改|移除|重命名需求');
    bullets.push('- 每个需求必须至少包含一个#### 场景：块');
    bullets.push('- 调试解析的增量：openspec-cn change show <id> --json --deltas-only');
    console.error('后续步骤：');
    bullets.forEach(b => console.error(`  ${b}`));
  }
}
