import { describe, expect, it } from 'vitest';

import {
  getBulkArchiveChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getExploreSkillTemplate,
  getOpsxBulkArchiveCommandTemplate,
  getOpsxContinueCommandTemplate,
  getOpsxExploreCommandTemplate,
  getOpsxUpdateCommandTemplate,
  getUpdateChangeSkillTemplate,
} from '../../../src/core/templates/skill-templates.js';
import { getCommandTemplates, getSkillTemplates } from '../../../src/core/shared/skill-generation.js';

describe('workflow list --json field usage', () => {
  it('does not invent schema labels in update and continue pickers', () => {
    const bodies = [
      getUpdateChangeSkillTemplate().instructions,
      getOpsxUpdateCommandTemplate().content,
      getContinueChangeSkillTemplate().instructions,
      getOpsxContinueCommandTemplate().content,
    ];

    for (const body of bodies) {
      const picker = body.slice(body.indexOf('1. **选择变更**'), body.indexOf('2. **'));
      expect(picker).toContain('openspec-cn list --json');
      expect(picker).toContain('- 变更名称');
      expect(picker).toContain('- 状态');
      expect(picker).toContain('`lastModified`');
      expect(picker).not.toMatch(/schema/i);
      expect(picker).not.toContain('openspec status');

      const status = body.slice(body.indexOf('2. **'), body.indexOf('3. **'));
      expect(status).toContain('openspec-cn status --change "<name>" --json');
      expect(status).toContain('`schemaName`');
    }
  });

  it('limits bulk archive selection to list fields', () => {
    const bodies = [
      getBulkArchiveChangeSkillTemplate().instructions,
      getOpsxBulkArchiveCommandTemplate().content,
    ];

    for (const body of bodies) {
      const picker = body.slice(body.indexOf('2. **'), body.indexOf('3. **'));
      expect(picker).toContain('展示列表输出中每个变更的名称和任务状态');
      expect(picker).not.toMatch(/schema/i);
      expect(picker).not.toContain('openspec status');

      const status = body.slice(body.indexOf('3. **'), body.indexOf('4. **'));
      expect(status).toContain('openspec-cn status --change "<name>" --json');
      expect(status).toContain('`schemaName`');
    }
  });

  it('does not claim explore receives schemas from list output', () => {
    const bodies = [
      getExploreSkillTemplate().instructions,
      getOpsxExploreCommandTemplate().content,
    ];

    for (const body of bodies) {
      expect(body).toContain('它们的名称和任务状态');
      expect(body).not.toContain('它们的名称、schema 和状态');
    }
  });

  // One text for every profile: it names the sync workflow "if installed"
  // and the inline merge otherwise, whether or not sync sits beside it.
  it('keeps bulk archive sync available with and without the sync workflow', () => {
    const variants = [
      [
        getSkillTemplates(['bulk-archive', 'sync']).find((entry) => entry.workflowId === 'bulk-archive')!.template.instructions,
        getSkillTemplates(['bulk-archive'])[0].template.instructions,
        'openspec-sync-specs',
      ],
      [
        getCommandTemplates(['bulk-archive', 'sync']).find((entry) => entry.id === 'bulk-archive')!.template.content,
        getCommandTemplates(['bulk-archive'])[0].template.content,
        '/opsx:sync',
      ],
    ] as const;

    for (const [withSync, withoutSync, workflow] of variants) {
      const syncStep = (text: string) => text.slice(
        text.indexOf('a. **同步包含的增量 spec**'),
        text.indexOf('b. **在移动 changeRoot 之前验证包含的增量 spec')
      );

      expect(withoutSync).toBe(withSync);
      expect(syncStep(withSync)).toContain(
        `内联运行 \`${workflow}\` 工作流（若已安装该 skill），否则自行内联执行 delta 到主 spec 的合并`
      );
      expect(syncStep(withSync)).toContain('`includedDeltas`');
      expect(syncStep(withSync)).toContain('`excludedDeltas`');
      expect(withSync).toContain(
        `内联运行 \`${workflow}\` 工作流（若已安装该 skill），否则自行内联执行 delta 到主 spec 的合并`
      );
    }
  });

  it('keeps archive sync available with and without the sync workflow', () => {
    const variants = [
      [
        getSkillTemplates(['archive', 'sync']).find((entry) => entry.workflowId === 'archive')!.template.instructions,
        getSkillTemplates(['archive'])[0].template.instructions,
        'openspec-sync-specs',
      ],
      [
        getCommandTemplates(['archive', 'sync']).find((entry) => entry.id === 'archive')!.template.content,
        getCommandTemplates(['archive'])[0].template.content,
        '/opsx:sync',
      ],
    ] as const;

    for (const [withSync, withoutSync, workflow] of variants) {
      const syncStep = (text: string) => text.slice(
        text.indexOf('4. **评估 delta spec 同步状态**'),
        text.indexOf('5. **执行归档**')
      );

      expect(withoutSync).toBe(withSync);
      expect(syncStep(withSync)).toContain(
        `内联运行 \`${workflow}\` 工作流（若已安装该 skill），否则自行内联执行 delta 到主 spec 的合并`
      );
      expect(withSync).toContain(
        `内联运行 \`${workflow}\` 工作流（若已安装该 skill），否则自行内联执行 delta 到主 spec 的合并`
      );
    }
  });
});
