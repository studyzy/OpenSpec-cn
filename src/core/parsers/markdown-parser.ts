import { Spec, Change, Requirement, Scenario, Delta, DeltaOperation } from '../schemas/index.js';
import { buildCodeFenceMask, extractRequirementText } from './requirement-text.js';

export interface Section {
  level: number;
  title: string;
  content: string;
  children: Section[];
}

export class MarkdownParser {
  private lines: string[];
  private codeFenceLineMask: boolean[];
  private currentLine: number;

  constructor(content: string) {
    const normalized = MarkdownParser.normalizeContent(content);
    this.lines = normalized.split('\n');
    this.codeFenceLineMask = buildCodeFenceMask(this.lines);
    this.currentLine = 0;
  }

  protected static normalizeContent(content: string): string {
    // Strip a UTF-8 BOM so a header on the first line still matches.
    return content.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  }

  parseSpec(name: string): Spec {
    const sections = this.parseSections();
    const purpose = this.findSection(sections, 'Purpose')?.content || this.findSection(sections, '目的')?.content || '';

    const requirementsSection = this.findSection(sections, 'Requirements') || this.findSection(sections, '需求');
    
    if (!purpose) {
      throw new Error('Spec 必须包含 Purpose 章节');
    }
    
    if (!requirementsSection) {
      throw new Error('Spec 必须包含 Requirements 章节');
    }

    const requirements = this.parseRequirements(requirementsSection);

    return {
      name,
      overview: purpose.trim(),
      requirements,
      metadata: {
        version: '1.0.0',
        format: 'openspec',
      },
    };
  }

  parseChange(name: string): Change {
    const sections = this.parseSections();
    const why = this.findSection(sections, 'Why')?.content || this.findSection(sections, '为什么')?.content || '';
    const whatChanges = this.findSection(sections, 'What Changes')?.content || this.findSection(sections, '变更内容')?.content || '';

    if (!why) {
      throw new Error('Change 必须包含 Why 章节');
    }
    
    if (!whatChanges) {
      throw new Error('Change 必须包含 What Changes 章节');
    }

    const deltas = this.parseDeltas(whatChanges);

    return {
      name,
      why: why.trim(),
      whatChanges: whatChanges.trim(),
      deltas,
      metadata: {
        version: '1.0.0',
        format: 'openspec-change',
      },
    };
  }

  protected parseSections(): Section[] {
    const sections: Section[] = [];
    const stack: Section[] = [];
    
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      if (this.codeFenceLineMask[i]) {
        continue;
      }
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        const level = headerMatch[1].length;
        const title = headerMatch[2].trim();
        const content = this.getContentUntilNextHeader(i + 1, level);
        
        const section: Section = {
          level,
          title,
          content,
          children: [],
        };

        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }

        if (stack.length === 0) {
          sections.push(section);
        } else {
          stack[stack.length - 1].children.push(section);
        }
        
        stack.push(section);
      }
    }
    
    return sections;
  }

  protected getContentUntilNextHeader(startLine: number, currentLevel: number): string {
    const contentLines: string[] = [];
    
    for (let i = startLine; i < this.lines.length; i++) {
      const line = this.lines[i];
      const headerMatch = this.codeFenceLineMask[i] ? null : line.match(/^(#{1,6})\s+/);
      
      if (headerMatch && headerMatch[1].length <= currentLevel) {
        break;
      }
      
      contentLines.push(line);
    }
    
    return contentLines.join('\n').trim();
  }

  protected findSection(sections: Section[], title: string): Section | undefined {
    for (const section of sections) {
      if (section.title.toLowerCase() === title.toLowerCase()) {
        return section;
      }
      const child = this.findSection(section.children, title);
      if (child) {
        return child;
      }
    }
    return undefined;
  }

  protected parseRequirements(section: Section): Requirement[] {
    const requirements: Requirement[] = [];

    for (const child of section.children) {
      // Read the requirement text via the shared reader (multi-line, fence- and
      // metadata-aware, with the shared header-title fallback for empty bodies).
      const text = extractRequirementText(child.title, child.content.split('\n'));

      const scenarios = this.parseScenarios(child);

      requirements.push({
        text,
        scenarios,
      });
    }

    return requirements;
  }

  protected parseScenarios(requirementSection: Section): Scenario[] {
    const scenarios: Scenario[] = [];
    
    for (const scenarioSection of requirementSection.children) {
      // Store the raw text content of the scenario section
      if (scenarioSection.content.trim()) {
        scenarios.push({
          rawText: scenarioSection.content
        });
      }
    }
    
    return scenarios;
  }


  protected parseDeltas(content: string): Delta[] {
    const deltas: Delta[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Match both formats: **spec:** and **spec**:
      const deltaMatch = line.match(/^\s*-\s*\*\*([^*:]+)(?::\*\*|\*\*:)\s*(.+)$/);
      if (deltaMatch) {
        const specName = deltaMatch[1].trim();
        const description = deltaMatch[2].trim();
        
        let operation: DeltaOperation = 'MODIFIED';
        const lowerDesc = description.toLowerCase();
        
        // Use word boundaries to avoid false matches (e.g., "address" matching "add")
        // Check RENAMED first since it's more specific than patterns containing "new"
        // English keyword detection uses word boundaries; Chinese keywords are
        // matched against the raw description (CJK has no letter-case / \b).
        // Note: 1.4.1 matched a bare `新`, which mis-classified 更新/刷新/最新
        // ("update"/"refresh"/"latest") as ADDED; we narrow it to 新增/新建.
        if (/\brename(s|d|ing)?\b/.test(lowerDesc) || /\brenamed\s+(to|from)\b/.test(lowerDesc) || /重命名/.test(description)) {
          operation = 'RENAMED';
        } else if (/\badd(s|ed|ing)?\b/.test(lowerDesc) || /\bcreate(s|d|ing)?\b/.test(lowerDesc) || /\bnew\b/.test(lowerDesc) || /新增|添加|创建|新建/.test(description)) {
          operation = 'ADDED';
        } else if (/\bremove(s|d|ing)?\b/.test(lowerDesc) || /\bdelete(s|d|ing)?\b/.test(lowerDesc) || /移除|删除/.test(description)) {
          operation = 'REMOVED';
        }
        
        deltas.push({
          spec: specName,
          operation,
          description,
        });
      }
    }
    
    return deltas;
  }
}
