import { z, ZodError } from 'zod';
import { readFileSync, promises as fs } from 'fs';
import path from 'path';
import { SpecSchema, ChangeSchema, Spec, Change } from '../schemas/index.js';
import { MarkdownParser } from '../parsers/markdown-parser.js';
import { ChangeParser } from '../parsers/change-parser.js';
import { ValidationReport, ValidationIssue, ValidationLevel } from './types.js';
import {
  MIN_PURPOSE_LENGTH,
  MAX_REQUIREMENT_TEXT_LENGTH,
  VALIDATION_MESSAGES
} from './constants.js';
import { parseDeltaSpec, normalizeRequirementName } from '../parsers/requirement-blocks.js';
import { FileSystemUtils } from '../../utils/file-system.js';

export class Validator {
  private strictMode: boolean;

  constructor(strictMode: boolean = false) {
    this.strictMode = strictMode;
  }

  async validateSpec(filePath: string): Promise<ValidationReport> {
    const issues: ValidationIssue[] = [];
    const specName = this.extractNameFromPath(filePath);
    try {
      const content = readFileSync(filePath, 'utf-8');
      const parser = new MarkdownParser(content);
      
      const spec = parser.parseSpec(specName);
      
      const result = SpecSchema.safeParse(spec);
      
      if (!result.success) {
        issues.push(...this.convertZodErrors(result.error));
      }
      
      issues.push(...this.applySpecRules(spec, content));
      
    } catch (error) {
      const baseMessage = error instanceof Error ? error.message : 'Unknown error';
      const enriched = this.enrichTopLevelError(specName, baseMessage);
      issues.push({
        level: 'ERROR',
        path: 'file',
        message: enriched,
      });
    }
    
    return this.createReport(issues);
  }

  /**
   * Validate spec content from a string (used for pre-write validation of rebuilt specs)
   */
  async validateSpecContent(specName: string, content: string): Promise<ValidationReport> {
    const issues: ValidationIssue[] = [];
    try {
      const parser = new MarkdownParser(content);
      const spec = parser.parseSpec(specName);
      const result = SpecSchema.safeParse(spec);
      if (!result.success) {
        issues.push(...this.convertZodErrors(result.error));
      }
      issues.push(...this.applySpecRules(spec, content));
    } catch (error) {
      const baseMessage = error instanceof Error ? error.message : 'Unknown error';
      const enriched = this.enrichTopLevelError(specName, baseMessage);
      issues.push({ level: 'ERROR', path: 'file', message: enriched });
    }
    return this.createReport(issues);
  }

  async validateChange(filePath: string): Promise<ValidationReport> {
    const issues: ValidationIssue[] = [];
    const changeName = this.extractNameFromPath(filePath);
    try {
      const content = readFileSync(filePath, 'utf-8');
      const changeDir = path.dirname(filePath);
      const parser = new ChangeParser(content, changeDir);
      
      const change = await parser.parseChangeWithDeltas(changeName);
      
      const result = ChangeSchema.safeParse(change);
      
      if (!result.success) {
        issues.push(...this.convertZodErrors(result.error));
      }
      
      issues.push(...this.applyChangeRules(change, content));
      
    } catch (error) {
      const baseMessage = error instanceof Error ? error.message : 'Unknown error';
      const enriched = this.enrichTopLevelError(changeName, baseMessage);
      issues.push({
        level: 'ERROR',
        path: 'file',
        message: enriched,
      });
    }
    
    return this.createReport(issues);
  }

  /**
   * 验证变更目录下的增量格式规范文件。
   * 强制要求：
   * - 所有文件中至少有一个增量
   * - 新增/修改需求：每个需求必须包含 SHALL/MUST/必须/禁止 并且至少有一个场景
   * - 移除需求：仅需名称；不需要场景/描述
   * - 重命名需求：配对格式正确
   * - 每个部分内无重复；每个规范文件内无跨部分冲突
   */
  async validateChangeDeltaSpecs(changeDir: string): Promise<ValidationReport> {
    const issues: ValidationIssue[] = [];
    const specsDir = path.join(changeDir, 'specs');
    let totalDeltas = 0;
    const missingHeaderSpecs: string[] = [];
    const emptySectionSpecs: Array<{ path: string; sections: string[] }> = [];

    try {
      const entries = await fs.readdir(specsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const specName = entry.name;
        const specFile = path.join(specsDir, specName, 'spec.md');
        let content: string | undefined;
        try {
          content = await fs.readFile(specFile, 'utf-8');
        } catch {
          continue;
        }

        const plan = parseDeltaSpec(content);
        const entryPath = `${specName}/spec.md`;
        const sectionNames: string[] = [];
        if (plan.sectionPresence.added) sectionNames.push('## 新增需求');
        if (plan.sectionPresence.modified) sectionNames.push('## 修改需求');
        if (plan.sectionPresence.removed) sectionNames.push('## 移除需求');
        if (plan.sectionPresence.renamed) sectionNames.push('## 重命名需求');
        const hasSections = sectionNames.length > 0;
        const hasEntries = plan.added.length + plan.modified.length + plan.removed.length + plan.renamed.length > 0;
        if (!hasEntries) {
          if (hasSections) emptySectionSpecs.push({ path: entryPath, sections: sectionNames });
          else missingHeaderSpecs.push(entryPath);
        }

        const addedNames = new Set<string>();
        const modifiedNames = new Set<string>();
        const removedNames = new Set<string>();
        const renamedFrom = new Set<string>();
        const renamedTo = new Set<string>();

        // 验证新增需求
        for (const block of plan.added) {
          const key = normalizeRequirementName(block.name);
          totalDeltas++;
          if (addedNames.has(key)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `新增需求中存在重复: "${block.name}"` });
          } else {
            addedNames.add(key);
          }
          const requirementText = this.extractRequirementText(block.raw);
          if (!requirementText) {
            issues.push({ level: 'ERROR', path: entryPath, message: `新增需求 "${block.name}" 缺少需求文本` });
          } else if (!this.containsShallOrMust(requirementText)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `新增需求 "${block.name}" 必须包含 SHALL、MUST、必须 或 禁止` });
          }
          const scenarioCount = this.countScenarios(block.raw);
          if (scenarioCount < 1) {
            issues.push({ level: 'ERROR', path: entryPath, message: `新增需求 "${block.name}" 必须至少包含一个场景` });
          }
        }

        // 验证修改需求
        for (const block of plan.modified) {
          const key = normalizeRequirementName(block.name);
          totalDeltas++;
          if (modifiedNames.has(key)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `修改需求中存在重复: "${block.name}"` });
          } else {
            modifiedNames.add(key);
          }
          const requirementText = this.extractRequirementText(block.raw);
          if (!requirementText) {
            issues.push({ level: 'ERROR', path: entryPath, message: `修改需求 "${block.name}" 缺少需求文本` });
          } else if (!this.containsShallOrMust(requirementText)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `修改需求 "${block.name}" 必须包含 SHALL、MUST、必须 或 禁止` });
          }
          const scenarioCount = this.countScenarios(block.raw);
          if (scenarioCount < 1) {
            issues.push({ level: 'ERROR', path: entryPath, message: `修改需求 "${block.name}" 必须至少包含一个场景` });
          }
        }

        // 验证移除需求（仅名称）
        for (const name of plan.removed) {
          const key = normalizeRequirementName(name);
          totalDeltas++;
          if (removedNames.has(key)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `移除需求中存在重复: "${name}"` });
          } else {
            removedNames.add(key);
          }
        }

        // 验证重命名需求配对
        for (const { from, to } of plan.renamed) {
          const fromKey = normalizeRequirementName(from);
          const toKey = normalizeRequirementName(to);
          totalDeltas++;
          if (renamedFrom.has(fromKey)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `重命名需求中 FROM 存在重复: "${from}"` });
          } else {
            renamedFrom.add(fromKey);
          }
          if (renamedTo.has(toKey)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `重命名需求中 TO 存在重复: "${to}"` });
          } else {
            renamedTo.add(toKey);
          }
        }

        // 跨部分冲突检查（同一规范文件内）
        for (const n of modifiedNames) {
          if (removedNames.has(n)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `需求同时出现在修改需求和移除需求中: "${n}"` });
          }
          if (addedNames.has(n)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `需求同时出现在修改需求和新增需求中: "${n}"` });
          }
        }
        for (const n of addedNames) {
          if (removedNames.has(n)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `需求同时出现在新增需求和移除需求中: "${n}"` });
          }
        }
        for (const { from, to } of plan.renamed) {
          const fromKey = normalizeRequirementName(from);
          const toKey = normalizeRequirementName(to);
          if (modifiedNames.has(fromKey)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `修改需求引用了重命名需求的旧名称。请使用新标题 "${to}"` });
          }
          if (addedNames.has(toKey)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `重命名需求的 TO 与新增需求冲突: "${to}"` });
          }
        }
      }
    } catch {
      // If no specs dir, treat as no deltas
    }

    for (const { path: specPath, sections } of emptySectionSpecs) {
      issues.push({
        level: 'ERROR',
        path: specPath,
        message: `找到了增量部分 ${this.formatSectionList(sections)}，但未解析到任何需求条目。请确保每个部分至少包含一个 "### 需求:" 块（移除需求部分可以使用项目符号列表语法）。`,
      });
    }
    for (const path of missingHeaderSpecs) {
      issues.push({
        level: 'ERROR',
        path,
        message: '未找到增量部分。请添加标题如 "## 新增需求" 或将非增量说明移到 specs/ 目录外。',
      });
    }

    if (totalDeltas === 0) {
      issues.push({ level: 'ERROR', path: 'file', message: this.enrichTopLevelError('change', VALIDATION_MESSAGES.CHANGE_NO_DELTAS) });
    }

    return this.createReport(issues);
  }

  private convertZodErrors(error: ZodError): ValidationIssue[] {
    return error.issues.map(err => {
      let message = err.message;
      if (message === VALIDATION_MESSAGES.CHANGE_NO_DELTAS) {
        message = `${message}. ${VALIDATION_MESSAGES.GUIDE_NO_DELTAS}`;
      }
      return {
        level: 'ERROR' as ValidationLevel,
        path: err.path.join('.'),
        message,
      };
    });
  }

  private applySpecRules(spec: Spec, content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    if (spec.overview.length < MIN_PURPOSE_LENGTH) {
      issues.push({
        level: 'WARNING',
        path: 'overview',
        message: VALIDATION_MESSAGES.PURPOSE_TOO_BRIEF,
      });
    }
    
    spec.requirements.forEach((req, index) => {
      if (req.text.length > MAX_REQUIREMENT_TEXT_LENGTH) {
        issues.push({
          level: 'INFO',
          path: `requirements[${index}]`,
          message: VALIDATION_MESSAGES.REQUIREMENT_TOO_LONG,
        });
      }
      
      if (req.scenarios.length === 0) {
        issues.push({
          level: 'WARNING',
          path: `requirements[${index}].scenarios`,
          message: `${VALIDATION_MESSAGES.REQUIREMENT_NO_SCENARIOS}. ${VALIDATION_MESSAGES.GUIDE_SCENARIO_FORMAT}`,
        });
      }
    });
    
    return issues;
  }

  private applyChangeRules(change: Change, content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    const MIN_DELTA_DESCRIPTION_LENGTH = 10;
    
    change.deltas.forEach((delta, index) => {
      if (!delta.description || delta.description.length < MIN_DELTA_DESCRIPTION_LENGTH) {
        issues.push({
          level: 'WARNING',
          path: `deltas[${index}].description`,
          message: VALIDATION_MESSAGES.DELTA_DESCRIPTION_TOO_BRIEF,
        });
      }
      
      if ((delta.operation === 'ADDED' || delta.operation === 'MODIFIED') && 
          (!delta.requirements || delta.requirements.length === 0)) {
        const operationText = delta.operation === 'ADDED' ? '新增' : '修改';
        issues.push({
          level: 'WARNING',
          path: `deltas[${index}].requirements`,
          message: `${operationText}${VALIDATION_MESSAGES.DELTA_MISSING_REQUIREMENTS}`,
        });
      }
    });
    
    return issues;
  }

  private enrichTopLevelError(itemId: string, baseMessage: string): string {
    const msg = baseMessage.trim();
    if (msg === VALIDATION_MESSAGES.CHANGE_NO_DELTAS) {
      return `${msg}. ${VALIDATION_MESSAGES.GUIDE_NO_DELTAS}`;
    }
    if (msg.includes('规范必须有目的部分') || msg.includes('规范必须有需求部分')) {
      return `${msg}. ${VALIDATION_MESSAGES.GUIDE_MISSING_SPEC_SECTIONS}`;
    }
    if (msg.includes('变更必须有为什么部分') || msg.includes('变更必须有变更内容部分')) {
      return `${msg}. ${VALIDATION_MESSAGES.GUIDE_MISSING_CHANGE_SECTIONS}`;
    }
    return msg;
  }

  private extractNameFromPath(filePath: string): string {
    const normalizedPath = FileSystemUtils.toPosixPath(filePath);
    const parts = normalizedPath.split('/');
    
    // Look for the directory name after 'specs' or 'changes'
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i] === 'specs' || parts[i] === 'changes') {
        if (i < parts.length - 1) {
          return parts[i + 1];
        }
      }
    }
    
    // Fallback to filename without extension if not in expected structure
    const fileName = parts[parts.length - 1] ?? '';
    const dotIndex = fileName.lastIndexOf('.');
    return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  }

  private createReport(issues: ValidationIssue[]): ValidationReport {
    const errors = issues.filter(i => i.level === 'ERROR').length;
    const warnings = issues.filter(i => i.level === 'WARNING').length;
    const info = issues.filter(i => i.level === 'INFO').length;
    
    const valid = this.strictMode 
      ? errors === 0 && warnings === 0
      : errors === 0;
    
    return {
      valid,
      issues,
      summary: {
        errors,
        warnings,
        info,
      },
    };
  }

  isValid(report: ValidationReport): boolean {
    return report.valid;
  }

  private extractRequirementText(blockRaw: string): string | undefined {
    const lines = blockRaw.split('\n');
    // Skip header line (index 0)
    let i = 1;

    // Find the first substantial text line, skipping metadata and blank lines
    for (; i < lines.length; i++) {
      const line = lines[i];

      // Stop at scenario headers
      if (/^####\s+/.test(line)) break;

      const trimmed = line.trim();

      // Skip blank lines
      if (trimmed.length === 0) continue;

      // Skip metadata lines (lines starting with ** like **ID**, **Priority**, etc.)
      if (/^\*\*[^*]+\*\*:/.test(trimmed)) continue;

      // Found first non-metadata, non-blank line - this is the requirement text
      return trimmed;
    }

    // No requirement text found
    return undefined;
  }

  private containsShallOrMust(text: string): boolean {
    return /\b(SHALL|MUST|必须|禁止)\b/.test(text) || /(?:必须|禁止)/.test(text);
  }

  private countScenarios(blockRaw: string): number {
    const matches = blockRaw.match(/^####\s+/gm);
    return matches ? matches.length : 0;
  }

  private formatSectionList(sections: string[]): string {
    if (sections.length === 0) return '';
    if (sections.length === 1) return sections[0];
    const head = sections.slice(0, -1);
    const last = sections[sections.length - 1];
    return `${head.join('、')} 和 ${last}`;
  }
}