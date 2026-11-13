import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  type SkillTemplate,
  getApplyInstructions,
  getApplyChangeSkillTemplate,
  getArchiveChangeSkillTemplate,
  getBulkArchiveChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getExploreSkillTemplate,
  getFeedbackSkillTemplate,
  getFfChangeSkillTemplate,
  getNewChangeSkillTemplate,
  getOnboardSkillTemplate,
  getOpsxApplyCommandTemplate,
  getOpsxArchiveCommandTemplate,
  getOpsxBulkArchiveCommandTemplate,
  getOpsxContinueCommandTemplate,
  getOpsxExploreCommandTemplate,
  getOpsxFfCommandTemplate,
  getOpsxNewCommandTemplate,
  getOpsxOnboardCommandTemplate,
  getOpsxSyncCommandTemplate,
  getOpsxProposeCommandTemplate,
  getOpsxProposeSkillTemplate,
  getOpsxUpdateCommandTemplate,
  getOpsxVerifyCommandTemplate,
  getSyncSpecsSkillTemplate,
  getUpdateChangeSkillTemplate,
  getVerifyChangeSkillTemplate,
} from '../../../src/core/templates/skill-templates.js';
import {
  generateSkillContent,
  getCommandContents,
  getSkillTemplates,
} from '../../../src/core/shared/skill-generation.js';
import { STORE_SELECTION_GUIDANCE } from '../../../src/core/templates/workflows/store-selection.js';
import { resolveOptionalWorkflows } from '../../../src/core/templates/optional-workflow.js';
import { ALL_WORKFLOWS } from '../../../src/core/profiles.js';
import { parseSchema } from '../../../src/core/artifact-graph/schema.js';

/**
 * Templates carry optional-workflow conditionals that the production registry
 * resolves against the installed workflow set. Pin what generation emits, not
 * the unresolved authoring form: with every workflow installed this is byte
 * for byte what `getSkillTemplates()` returns.
 */
const asDeployed = (template: SkillTemplate): SkillTemplate => ({
  ...template,
  instructions: resolveOptionalWorkflows(
    template.instructions,
    new Set<string>(ALL_WORKFLOWS)
  ),
});

/**
 * The title `spec-driven` gives each artifact, read from the packaged templates
 * so guidance and template cannot drift apart.
 */
function specDrivenTitles(): Record<string, string> {
  const schemaDir = path.join(__dirname, '..', '..', '..', 'schemas', 'spec-driven');
  const schema = parseSchema(fs.readFileSync(path.join(schemaDir, 'schema.yaml'), 'utf-8'));

  return Object.fromEntries(
    schema.artifacts.map((artifact) => [
      artifact.id,
      fs
        .readFileSync(path.join(schemaDir, 'templates', artifact.template), 'utf-8')
        .replace(/\r\n?/g, '\n')
        .split('\n')[0],
    ])
  );
}

const EXPECTED_FUNCTION_HASHES: Record<string, string> = {
  getExploreSkillTemplate: 'dac060a1923c5d8f3dc840e27b6bdf04a39245f8f0d6ccb09f3ce8786b3d7269',
  getNewChangeSkillTemplate: 'b8d990b7cf71573415d3bd535f364a6403df5c1d95f83503a071ad806be8a99d',
  getContinueChangeSkillTemplate: '94413564c3c0b48dba0c1f7ee7734bc613b5cdbeebd325cf727c6710e61d07ff',
  getApplyChangeSkillTemplate: 'a3accd7ed5da30172614d6e8cd75787d2c0e27e23c05bf7604313ddc12dd75c2',
  getFfChangeSkillTemplate: 'a5b9c99a3189df1d49253e993876bc1e6b65f4eb7fc35a1224ccc8c53c0b9bf6',
  getSyncSpecsSkillTemplate: 'a5cb37e0d7601bed9c52942fb2de2b5de3e92c4b8dc0eb2cc9faf9edee67b147',
  getOnboardSkillTemplate: '325b8a4f485b53f5c55ead05b711db9cd33e19933924cf02237b0c25fee0f202',
  getOpsxExploreCommandTemplate: 'd4717ae9c246dba92468b954e66b24289046364cc6db953c3b53c08faede5019',
  getOpsxNewCommandTemplate: 'c69c9a855dd3c5b713b2c727175eaf3d3c780e4ab9d3e1da3690736f3bb76679',
  getOpsxContinueCommandTemplate: 'e1a07f22d7a801169b9549d2f03489df74841fa25c14108f9a7eb57e46db8380',
  getOpsxApplyCommandTemplate: '457ee0031078f2eb60f0ae5e762e2536256d2bb99d2b5241a5ad721b234be7f5',
  getOpsxFfCommandTemplate: 'c02a6e266947dd78d5fc429d8ce66805610c9cb976dc830b8aeb2c4e5561a9a5',
  getArchiveChangeSkillTemplate: '352b43b9441d745dbf0b6068fa15a1f8945c0672aa577bb2635e0599a2852116',
  getBulkArchiveChangeSkillTemplate: '1ca3b7cb1dabee83de02263174a062da5fe59996e1566ca5fddcf5d367cd488d',
  getOpsxSyncCommandTemplate: '7bfc1a12abe60769ef2e8001f38bcb3924a6930a037bca36a535ea301ff75b6d',
  getVerifyChangeSkillTemplate: '29f2f15fc11744a49909620ab84d0495e8442eb81edef9058db6b23651386903',
  getOpsxArchiveCommandTemplate: '84739f36c454a4291a0347115af1e76a4e383e00946d6b9a9ff5f078aae1f21a',
  getOpsxOnboardCommandTemplate: '140837f357e2b48571bad3ad7d9d8476e70e32523cdd419fd41245e0dae61806',
  getOpsxBulkArchiveCommandTemplate: '053abb7b092f3c2ecc98fe193c3fd6bb2470ec9afed776bb4f5872bba62a55f9',
  getOpsxVerifyCommandTemplate: '14b7ff69e319cbaadeff024223683220d0a7bd313650c34fe423f3d304432e9e',
  getOpsxProposeSkillTemplate: '67284cf5b447a6b165e2e280ef0c6c637b34ad8410b422809298817b50e7b63f',
  getOpsxProposeCommandTemplate: '0ff5efd4210596a1d842c982b86c4f4c369bb83fd408947b63996399e89a1b7b',
  getFeedbackSkillTemplate: '4d3252e3a359d4769bf36166ac6f486e92d7797e922bf9707808f6437ab022ef',
  getUpdateChangeSkillTemplate: 'befc938413fed4505a86152829a7b6880fdd09ee088aae2f9e8cc2cc4f38d73a',
  getOpsxUpdateCommandTemplate: 'a7b49139124848471a876c328a19633020a709c02a67607b4dc378680bf51b8e',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'openspec-explore': '2cd8580f223fb51a14fb93f835f2efdb8a6b5954d514532d9a5ba10dc36f041e',
  'openspec-new-change': 'f0c7fed6c6aec1cf34cc7ef4dd288656a985ad8790c19d8395314f656744a6a8',
  'openspec-continue-change': 'dd092fa6512343958099d3307e60c50c8d1de04900974398a6705e91b1519aff',
  'openspec-apply-change': 'f276ed48cabc5a3c17a75b018b3e1fbad3ad655a3d11feb270c5158be7ce0158',
  'openspec-ff-change': '6cdd8d3215b16212773270090946f0e11f49c10d3856af17ce5bd83933d0b5be',
  'openspec-sync-specs': '3a705ebf7d76b0f6b20ac5bf43c43ff666f3c0fc7eb6750006fcc2d1ab245168',
  'openspec-archive-change': 'dc8f7d93999dac26d9a5e6e05af1cf68727b74cd7a5d5f6a5146071d3aac5941',
  'openspec-bulk-archive-change': '82c312ff06ce319528136c0e9aea52b97139144f053a86e630b24319a8d28dc7',
  'openspec-verify-change': '2de53b8cca22e259ccd00f1186cd4a694f79c0ecb15d520f6aa1213e9a830569',
  'openspec-onboard': '087bdfa49eb98fa32d6944d05c7c894a7c935c00545c3c7701fc46a4d12f8257',
  'openspec-propose': 'dd08f0d77dc0a5162f9fb78064a2cd272f39a114f4aef91d228779611fba7ff8',
  'openspec-update-change': '056b576ba6d77bc5ff6ba32b690d126f6cc6482d876fbbddca2014136fad58c7',
};

// Intentionally excludes getFeedbackSkillTemplate: this list only models templates
// deployed via generateSkillContent, while feedback is covered in function payload parity.
const GENERATED_SKILL_FACTORIES: Array<[string, () => SkillTemplate]> = [
  ['openspec-explore', getExploreSkillTemplate],
  ['openspec-new-change', getNewChangeSkillTemplate],
  ['openspec-continue-change', getContinueChangeSkillTemplate],
  ['openspec-apply-change', getApplyChangeSkillTemplate],
  ['openspec-ff-change', getFfChangeSkillTemplate],
  ['openspec-sync-specs', getSyncSpecsSkillTemplate],
  ['openspec-archive-change', getArchiveChangeSkillTemplate],
  ['openspec-bulk-archive-change', getBulkArchiveChangeSkillTemplate],
  ['openspec-verify-change', getVerifyChangeSkillTemplate],
  ['openspec-onboard', getOnboardSkillTemplate],
  ['openspec-propose', getOpsxProposeSkillTemplate],
  ['openspec-update-change', getUpdateChangeSkillTemplate],
];

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`);

    return `{${entries.join(',')}}`;
  }

  return JSON.stringify(value);
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('skill templates split parity', () => {
  it('uses one clarification threshold in fast-forward guidance (#1837)', () => {
    const variants: Array<[string, string]> = [
      ['ff skill', getFfChangeSkillTemplate().instructions],
      ['ff command', getOpsxFfCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain(
        '**若某个产出物需要用户输入**（上下文严重不清）'
      );
      expect(content, variant).not.toContain(
        '**若某个产出物需要用户输入**（上下文不清）'
      );
    }
  });

  it('approves onboarding tasks before saving or offering implementation (#1837)', () => {
    const variants: Array<[string, string]> = [
      ['onboard skill', getOnboardSkillTemplate().instructions],
      ['onboard command', getOpsxOnboardCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain('这个任务拆分看起来合适吗？');
      expect(content, variant).not.toContain(
        '每个复选框成为 apply 阶段的工作单元。准备好实现了吗？'
      );
      expect(content, variant).toContain(
        '**暂停** - 等待用户批准/反馈。\n\n' +
        '批准后，保存到 `openspec-cn instructions tasks --change "<name>" --json` 的 `resolvedOutputPath`。'
      );
      expect(content, variant).toContain('> "任务已保存。准备好实现了吗？"');
      expect(content, variant).toContain(
        '**暂停** - 在实现之前等待用户确认。'
      );

      const saveAt = content.indexOf('批准后，保存到');
      const implementationChoiceAt = content.indexOf('> "任务已保存。准备好实现了吗？"');
      const implementationAt = content.indexOf('## 阶段 9：Apply（实现）');
      expect(saveAt, variant).toBeGreaterThanOrEqual(0);
      expect(implementationChoiceAt, variant).toBeGreaterThan(saveAt);
      expect(implementationAt, variant).toBeGreaterThan(implementationChoiceAt);
    }
  });

  it('preserves all template function payloads exactly', () => {
    const functionFactories: Record<string, () => unknown> = {
      getExploreSkillTemplate,
      getNewChangeSkillTemplate,
      getContinueChangeSkillTemplate,
      getApplyChangeSkillTemplate,
      getFfChangeSkillTemplate,
      getSyncSpecsSkillTemplate,
      getOnboardSkillTemplate,
      getOpsxExploreCommandTemplate,
      getOpsxNewCommandTemplate,
      getOpsxContinueCommandTemplate,
      getOpsxApplyCommandTemplate,
      getOpsxFfCommandTemplate,
      getArchiveChangeSkillTemplate,
      getBulkArchiveChangeSkillTemplate,
      getOpsxSyncCommandTemplate,
      getVerifyChangeSkillTemplate,
      getOpsxArchiveCommandTemplate,
      getOpsxOnboardCommandTemplate,
      getOpsxBulkArchiveCommandTemplate,
      getOpsxVerifyCommandTemplate,
      getOpsxProposeSkillTemplate,
      getOpsxProposeCommandTemplate,
      getFeedbackSkillTemplate,
      getUpdateChangeSkillTemplate,
      getOpsxUpdateCommandTemplate,
    };

    const actualHashes = Object.fromEntries(
      Object.entries(functionFactories).map(([name, fn]) => [name, hash(stableStringify(fn()))])
    );

    expect(actualHashes).toEqual(EXPECTED_FUNCTION_HASHES);
  });

  it('preserves generated skill file content exactly', () => {
    const actualHashes = Object.fromEntries(
      GENERATED_SKILL_FACTORIES.map(([dirName, createTemplate]) => [
        dirName,
        hash(generateSkillContent(asDeployed(createTemplate()), 'PARITY-BASELINE')),
      ])
    );

    expect(actualHashes).toEqual(EXPECTED_GENERATED_SKILL_CONTENT_HASHES);
  });

  // The assertion above only compares the skills this file already lists, so a
  // workflow added to getSkillTemplates() but never pinned here would ship with
  // no golden hash and nothing would fail. Pin the registry itself.
  it('pins every skill the production registry deploys', () => {
    const pinned = GENERATED_SKILL_FACTORIES.map(([dirName]) => dirName).sort();
    const deployed = getSkillTemplates().map(({ dirName }) => dirName).sort();

    expect(pinned, 'add the new skill to GENERATED_SKILL_FACTORIES and EXPECTED_GENERATED_SKILL_CONTENT_HASHES').toEqual(deployed);
  });

  // Iterating the production registries (not a local list) means a newly
  // added workflow is covered automatically; the full-constant containment
  // check fails if any template's interpolation drifts.
  it('teaches store selection in every deployed skill template', () => {
    for (const { template, dirName } of getSkillTemplates()) {
      const content = generateSkillContent(template, 'PARITY-BASELINE');
      expect(content, dirName).toContain(STORE_SELECTION_GUIDANCE);
    }
  });

  // Auto-approve the OpenSpec CLI: every generated skill carries
  // `allowed-tools: Bash(openspec:*)` so agents that honor it stop prompting
  // on each `openspec` call. Iterating the registry covers new skills too.
  it('pre-approves the openspec CLI via allowed-tools in every deployed skill', () => {
    for (const { template, dirName } of getSkillTemplates()) {
      const content = generateSkillContent(template, 'PARITY-BASELINE');
      expect(content, dirName).toContain('allowed-tools: Bash(openspec-cn:*)');
    }
  });

  it('teaches store selection in every deployed opsx command template', () => {
    for (const entry of getCommandContents()) {
      expect(entry.body, entry.id).toContain(STORE_SELECTION_GUIDANCE);
    }

    // Feedback has no store-capable command and intentionally carries no
    // store teaching; it ships outside both registries.
    expect(getFeedbackSkillTemplate().instructions).not.toContain('**Store selection:**');
  });

  it('keeps a selected store on every applicable workflow command', () => {
    expect(STORE_SELECTION_GUIDANCE).toContain(
      '将 `--store <id>` 视为在当前工作流其余部分中固定不变'
    );
    expect(STORE_SELECTION_GUIDANCE).toContain(
      '以下每个未限定范围的命令示例均为简写形式：运行前请追加该标志'
    );
    expect(STORE_SELECTION_GUIDANCE).toContain(
      'openspec-cn status --change "<name>" --json --store "<id>"'
    );
    expect(STORE_SELECTION_GUIDANCE).toContain('`context`、`schemas`、`view`');
  });

  it('validates synced main specs before reporting success', () => {
    const variants: Array<[string, string]> = [
      ['sync skill', getSyncSpecsSkillTemplate().instructions],
      ['sync command', getOpsxSyncCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      const mutationsComplete = content.indexOf(
        '遵循下方的 **主 Spec 格式参考**'
      );
      const validation = content.indexOf('openspec-cn validate --specs');
      const summary = content.indexOf('**显示摘要**');

      expect(mutationsComplete, variant).toBeGreaterThanOrEqual(0);
      expect(validation, variant).toBeGreaterThan(mutationsComplete);
      expect(summary, variant).toBeGreaterThan(validation);
      expect(content, variant).toContain('相同的选定根路径标志');
      expect(content, variant).toContain(
        '若验证失败，报告问题且不要声称同步成功'
      );
    }
  });

  it('preserves nested capability paths in spec-aware workflow guidance (#1459)', () => {
    const capabilityPathDefinition =
      '`<capability-path>` 是相对于 `specs/` 的 spec 目录';
    const pathAwareTemplates: Array<[string, string, string, string]> = [
      [
        'propose skill',
        generateSkillContent(asDeployed(getOpsxProposeSkillTemplate()), 'PARITY-BASELINE'),
        'specs/<capability-path>/spec.md',
        '保留其完整路径',
      ],
      [
        'propose command',
        getOpsxProposeCommandTemplate().content,
        'specs/<capability-path>/spec.md',
        '保留其完整路径',
      ],
      [
        'explore skill',
        generateSkillContent(asDeployed(getExploreSkillTemplate()), 'PARITY-BASELINE'),
        'specs/<capability-path>/spec.md',
        '保留已有 capability 的完整路径',
      ],
      [
        'explore command',
        getOpsxExploreCommandTemplate().content,
        'specs/<capability-path>/spec.md',
        '保留已有 capability 的完整路径',
      ],
      [
        'onboard skill',
        generateSkillContent(asDeployed(getOnboardSkillTemplate()), 'PARITY-BASELINE'),
        '<existing-capability-path>',
        '使用确切的现有路径',
      ],
      [
        'onboard command',
        getOpsxOnboardCommandTemplate().content,
        '<existing-capability-path>',
        '使用确切的现有路径',
      ],
      [
        'sync skill',
        generateSkillContent(asDeployed(getSyncSpecsSkillTemplate()), 'PARITY-BASELINE'),
        '<planningHome.root>/openspec/specs/<capability-path>/spec.md',
        '保留每个增量 spec 的完整路径',
      ],
      [
        'sync command',
        getOpsxSyncCommandTemplate().content,
        '<planningHome.root>/openspec/specs/<capability-path>/spec.md',
        '保留每个增量 spec 的完整路径',
      ],
      [
        'archive skill',
        generateSkillContent(asDeployed(getArchiveChangeSkillTemplate()), 'PARITY-BASELINE'),
        '<planningHome.root>/openspec/specs/<capability-path>/spec.md',
        '保留每个增量 spec 的完整路径',
      ],
      [
        'archive command',
        getOpsxArchiveCommandTemplate().content,
        '<planningHome.root>/openspec/specs/<capability-path>/spec.md',
        '保留每个增量 spec 的完整路径',
      ],
      [
        'bulk archive skill',
        generateSkillContent(asDeployed(getBulkArchiveChangeSkillTemplate()), 'PARITY-BASELINE'),
        '<planningHome.root>/openspec/specs/<capability-path>/spec.md',
        '保留每个增量 spec 的完整路径',
      ],
      [
        'bulk archive command',
        getOpsxBulkArchiveCommandTemplate().content,
        '<planningHome.root>/openspec/specs/<capability-path>/spec.md',
        '保留每个增量 spec 的完整路径',
      ],
    ];

    for (const [label, content, destination, preservationGuidance] of pathAwareTemplates) {
      expect(content, label).toContain(capabilityPathDefinition);
      expect(content, label).toContain(destination);
      expect(content, label).toContain(preservationGuidance);
      expect(content, label).not.toContain('specs/<capability>/spec.md');
    }

    const onboardVariants: Array<[string, string]> = [
      [
        'onboard skill',
        generateSkillContent(asDeployed(getOnboardSkillTemplate()), 'PARITY-BASELINE'),
      ],
      ['onboard command', getOpsxOnboardCommandTemplate().content],
    ];

    for (const [label, content] of onboardVariants) {
      expect(content, label).toContain(
        '- `<capability-path>`: [简要描述]'
      );
      expect(content, label).not.toContain('<capability-name>');
    }

    const bulkArchiveVariants: Array<[string, string]> = [
      [
        'bulk archive skill',
        generateSkillContent(asDeployed(getBulkArchiveChangeSkillTemplate()), 'PARITY-BASELINE'),
      ],
      ['bulk archive command', getOpsxBulkArchiveCommandTemplate().content],
    ];

    for (const [label, content] of bulkArchiveVariants) {
      expect(content, label).toContain(
        '构建一个以 `<capability-path>`（相对于 `specs/` 的确切路径）为键的映射'
      );
      expect(content, label).toContain(
        'billing/user-auth  -> [change-c]            <- 正常（完整路径不同）'
      );
      expect(content, label).toContain(
        'identity/user-auth -> [change-a, change-b]  <- 冲突'
      );
      expect(content, label).toContain('identity/user-auth (!)');
      expect(content, label).toContain(
        '对同一个 `<capability-path>`'
      );
      expect(content, label).toContain(
        '按变更和 `<capability-path>`'
      );
      expect(content, label).toContain(
        '将先应用 add-oauth 再应用 add-jwt'
      );
      expect(content, label).toContain(
        'add-jwt，identity/user-auth：未找到实现'
      );
      expect(content, label).toContain(
        '1 个冲突已解决（identity/user-auth：已同步 add-oauth，已跳过 add-jwt）'
      );
      expect(content, label).not.toContain('\n   auth -> [change-a');
      expect(content, label).not.toContain('| auth (!)');
      expect(content, label).not.toContain('(auth: synced');
      expect(content, label).not.toContain('add-jwt/auth:');
    }
  });

  it('keeps onboarding task examples aligned with concrete verification guidance (#345)', () => {
    const variants: Array<[string, string]> = [
      ['onboard skill', generateSkillContent(asDeployed(getOnboardSkillTemplate()), 'PARITY-BASELINE')],
      ['onboard command', getOpsxOnboardCommandTemplate().content],
    ];

    for (const [label, content] of variants) {
      const taskBlock = content.match(
        /这是实现任务：([\s\S]*?)每个复选框成为 apply 阶段的工作单元/
      )?.[1];
      expect(taskBlock, label).toBeDefined();
      const checkboxes = taskBlock!
        .split('\n')
        .filter(line => /^- \[ \] \d+\.\d+ /.test(line));
      expect(checkboxes, label).toHaveLength(3);
      expect(
        checkboxes.every(
          line =>
            line.endsWith(
              '[具体任务] — verify: [测试、命令、可观察行为或交付的产物]'
            ) || /使用\[.+\]验证\[.+\]$/.test(line)
        ),
        label
      ).toBe(true);
      expect(content, label).toContain(
        '[具体任务] — verify: [测试、命令、可观察行为或交付的产物]'
      );
      expect(content, label).toContain(
        '使用[端到端测试或可观察结果]验证[更广泛的集成或系统行为]'
      );
      expect(content, label).not.toContain('[Verification step]');
    }
  });

  // #1952: the onboarding walkthrough is where a user first meets task groups,
  // so it has to say the same thing the tasks instruction does - tests and docs
  // belong to the group that did the work, not to a trailing catch-up group.
  it('teaches per-group tests and docs in the onboarding walkthrough (#1952)', () => {
    const variants: Array<[string, string]> = [
      ['onboard skill', generateSkillContent(asDeployed(getOnboardSkillTemplate()), 'PARITY-BASELINE')],
      ['onboard command', getOpsxOnboardCommandTemplate().content],
    ];

    for (const [label, content] of variants) {
      expect(content, label).toContain(
        '每个任务组自带其工作所需的测试和文档 - 最后一个任务组只用于集成检查'
      );
      // The trailing group stays integration-only; it must not be renamed back
      // into a general testing/documentation bucket.
      expect(content, label).toContain('## 2. 集成验证');
    }
  });

  it('generates no workspace-planning residue in any workflow template (4.1)', () => {
    const allSkills: Array<[string, () => SkillTemplate]> = [
      ['openspec-apply-change', getApplyChangeSkillTemplate],
      ['openspec-sync-specs', getSyncSpecsSkillTemplate],
      ['openspec-archive-change', getArchiveChangeSkillTemplate],
      ['openspec-bulk-archive-change', getBulkArchiveChangeSkillTemplate],
      ['openspec-verify-change', getVerifyChangeSkillTemplate],
    ];

    for (const [dirName, createTemplate] of allSkills) {
      const content = generateSkillContent(asDeployed(createTemplate()), 'PARITY-BASELINE');
      expect(content, dirName).not.toContain('workspace-planning');
      expect(content, dirName).not.toContain('Workspace guard');
    }
  });

  it('does not suggest archiving when only planning is complete', () => {
    const variants: Array<[string, string]> = [
      [
        'skill',
        generateSkillContent(asDeployed(getContinueChangeSkillTemplate()), 'PARITY-BASELINE'),
      ],
      ['opsx command', getOpsxContinueCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain('规划完成');
      if (variant === 'skill') {
        expect(content, variant).toContain('实现及所有跟踪的工作完成后，归档它');
      } else {
        expect(content, variant).toContain('所有被追踪的工作都完成后');
      }
      expect(content, variant).not.toContain('所有产出物已创建');
      expect(content, variant).not.toContain('或归档它');
    }
  });

  it('gates the archive on a completed spec sync (#1393)', () => {
    const generatedSkill = generateSkillContent(asDeployed(getArchiveChangeSkillTemplate()), 'PARITY-BASELINE');
    const commandContent = getOpsxArchiveCommandTemplate().content;

    // The single archive skill references openspec-sync-specs; opsx command references /opsx:sync.
    expect(generatedSkill, 'skill').toContain('内联运行 `openspec-sync-specs` 工作流');
    expect(commandContent, 'opsx command').toContain('内联运行 `/opsx:sync` 工作流');

    const variants: Array<[string, string]> = [
      ['skill', generatedSkill],
      ['opsx command', commandContent],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain('不要把它委托给后台任务');
      expect(content, variant).toContain('绝不在 spec 同步仍在进行时归档');

      expect(content, variant).toContain('若同步报告任何停止或受阻条件，视为同步失败');
      expect(content, variant).toContain('不要执行同步后的内容比较');
      expect(content, variant).toContain('也不要移动其 `changeRoot`');

      // Verification must follow delta semantics.
      expect(content, variant).toContain('MODIFIED 需求携带 delta 中指明的场景与描述更改');
      expect(content, variant).toContain('REMOVED 需求已消失');
      expect(content, variant).toContain('RENAMED 需求以新名称存在且旧名称下已消失');

      // Verification is bound to the delta specs on disk, not to whatever the sync reports it touched.
      expect(content, variant).toContain('不仅仅是同步报告它触及的那些');

      // Main spec paths are store-root aware
      expect(content, variant).toContain('<planningHome.root>/openspec/specs/<capability-path>/spec.md');

      // Semantic main-spec structure contract.
      expect(content, variant).toContain('新主 spec 以 `# <capability> Specification` 标题开头。已有主 spec 的标题保持原样。');
      expect(content, variant).not.toContain('必须以 `# <capability> Specification` 标题开头');
      expect(content, variant).toContain('对既有主 spec，完整保留其已有的 `## Purpose` 章节，不做任何改动。');
      expect(content, variant).toContain('对新主 spec，逐字复制 delta 的 `## Purpose`。');
      expect(content, variant).toContain('若没有可用的 `## Purpose`，沿用现有的 TBD Purpose 行为和警告。');
      expect(content, variant).toContain('同步写入或修改的需求块使用 `### Requirement:` 标题');
      expect(content, variant).toContain('delta 未提及的内容保持原样。');

      // Every canonical delta header must be rejected.
      const deltaHeaders = [
          '## ADDED Requirements',
          '## MODIFIED Requirements',
          '## REMOVED Requirements',
          '## RENAMED Requirements',
      ];

      expect(content, variant).toContain('验证主 spec 中不再残留 delta 风格的章节标题（`## ADDED Requirements`、`## MODIFIED Requirements`、`## REMOVED Requirements`、`## RENAMED Requirements`）');

      for (const header of deltaHeaders) {
          expect(content, variant).toContain(header);
      }
    }
  });

  it('requires sync to create a missing main spec from ADDED requirements (#1222, #1264)', () => {
    // `openspec archive` creates the main spec from the delta's ADDED requirements
    // when it does not exist yet (`buildUpdatedSpec`, specs-apply.ts). The agent
    // workflow only told the agent to "compare each delta spec with its
    // corresponding main spec", so a capability with no main spec compared against
    // nothing, read as "already synced", and the change archived with the spec
    // never written. Assertions are scoped to the sync-assessment step so they
    // cannot pass on unrelated text elsewhere in the body.
    const archiveVariants: Array<[string, string]> = [
      ['archive skill', generateSkillContent(asDeployed(getArchiveChangeSkillTemplate()), 'PARITY-BASELINE')],
      ['archive opsx command', getOpsxArchiveCommandTemplate().content],
    ];

    for (const [variant, content] of archiveVariants) {
      const start = content.indexOf('**评估 delta spec 同步状态**');
      const end = content.indexOf('**执行归档**');
      expect(start, variant).toBeGreaterThan(-1);
      expect(end, variant).toBeGreaterThan(start);
      const assessStep = content.slice(start, end);

      expect(assessStep, variant).toContain(
        '主 spec 缺失**并不自动**意味着"已同步"'
      );
      expect(assessStep, variant).toContain('是同步的*输出*，而非输入');
      expect(assessStep, variant).toContain('若 delta 含 MODIFIED 或 RENAMED');
      expect(assessStep, variant).toContain('只有 ADDED 需求才能创建新主 spec');
      expect(assessStep, variant).toContain('绝不要捏造一个没有当前版本的需求');
      expect(assessStep, variant).toContain('否则，若 delta 没有 ADDED 需求');
      expect(assessStep, variant).toContain('报告无法同步');
      expect(assessStep, variant).toContain('对于仅含 REMOVED 的 delta');
      expect(assessStep, variant).toContain('保持主 spec 树不变');
      expect(assessStep, variant).toContain('将该能力标记为同步受阻');
      expect(assessStep, variant).toContain('Spec must have at least one requirement');
      expect(assessStep, variant).toContain('将该 capability 计为需要同步');
      expect(assessStep, variant).toContain('若 delta 还含 REMOVED 需求');
      expect(assessStep, variant).toContain('警告它们将被忽略');
      expect(assessStep, variant).toContain(
        '同步仅依据 delta 的 ADDED 需求创建主 spec'
      );
    }

    // The sync itself must not invent a requirement that has no base to modify:
    // the CLI throws "only ADDED requirements are allowed for new specs".
    const syncVariants: Array<[string, string]> = [
      ['sync skill', getSyncSpecsSkillTemplate().instructions],
      ['sync command', getOpsxSyncCommandTemplate().content],
    ];

    for (const [variant, content] of syncVariants) {
      const start = content.indexOf('b. **读取主 spec**');
      const end = content.indexOf('c. **智能应用变更**');
      expect(start, variant).toBeGreaterThan(-1);
      expect(end, variant).toBeGreaterThan(start);
      const readStep = content.slice(start, end);

      expect(readStep, variant).toContain('**若它尚不存在**（新 capability）');
      expect(readStep, variant).toContain('只能应用 ADDED 需求');
      expect(readStep, variant).toContain('MODIFIED 和 RENAMED 没有可作用的需求');
      expect(readStep, variant).toContain('绝不要凭空捏造缺失的需求');
      expect(readStep, variant).toContain('REMOVED 没有可移除的内容');

      // ...and the creation step must not then write the empty spec the CLI refuses:
      // an unmarked REMOVED-only delta against a capability with no main spec aborts with
      // "Spec must have at least one requirement" and leaves the tree untouched.
      const createStart = content.indexOf('d. **若 capability 尚不存在则创建新主 spec**');
      const createEnd = content.indexOf('**验证更新后的主 spec');
      expect(createStart, variant).toBeGreaterThan(-1);
      expect(createEnd, variant).toBeGreaterThan(createStart);
      const createStep = content.slice(createStart, createEnd);

      expect(createStep, variant).toContain(
        '仅当增量 spec 有可放入的 ADDED 需求'
      );
      expect(createStep, variant).toContain('RENAMED 需求阻塞此 capability');
      expect(createStep, variant).toContain('什么都不创建');
      expect(createStep, variant).toContain('Spec must have at least one requirement');
      expect(createStep, variant).toContain('绝不要写入空的');
    }
  });

  it('preserves explicit archive-without-sync when a missing target blocks sync', () => {
    for (const content of [
      getArchiveChangeSkillTemplate().instructions,
      getOpsxArchiveCommandTemplate().content,
    ]) {
      const assessment = content.slice(
        content.indexOf('**若存在 delta specs：**'),
        content.indexOf('在所选同步写入任何主 spec 之前')
      );
      expect(assessment).not.toContain('stop instead of prompting to sync');
      expect(assessment).toContain('将该能力标记为同步受阻');
      expect(assessment).toContain('继续评估其余能力');
      expect(assessment).toContain(
        '若任何能力同步受阻：解释原因，仅提供"不同步归档"、"取消"'
      );
      expect(assessment).toContain('在任何能力同步受阻时不要开始同步');
      expect(assessment).toContain('"不同步归档" 或 "立即归档" — 继续归档');
      expect(assessment).toContain('"取消" — 停止，不归档');
      expect(content).toContain('若同步失败，或任何能力不匹配');
      expect(content).toContain('报告差异并停止 —— 不要归档');
    }
  });

  it('recognizes explicitly retired missing specs without blocking archive verification', () => {
    for (const content of [
      getArchiveChangeSkillTemplate().instructions,
      getOpsxArchiveCommandTemplate().content,
    ]) {
      const assessment = content.slice(
        content.indexOf('**若存在 delta specs：**'),
        content.indexOf('**提示选项：**')
      );
      const retirement = assessment.indexOf('否则，若 delta 仅含 REMOVED 需求');
      expect(retirement).toBeGreaterThan(-1);
      expect(retirement).toBeLessThan(assessment.indexOf('否则，若 delta 没有 ADDED 需求'));
      expect(assessment).toContain('`retire_capabilities: true`');
      expect(assessment).toContain('计为已同步');
      expect(assessment).toContain('不要重新创建主 spec');
      expect(content).toContain('包括显式退役的、主 spec 缺失的情况');
    }

    for (const content of [
      getSyncSpecsSkillTemplate().instructions,
      getOpsxSyncCommandTemplate().content,
    ]) {
      const createStep = content.slice(
        content.indexOf('d. **若 capability 尚不存在则创建新主 spec**'),
        content.indexOf('**验证更新后的主 spec')
      );
      expect(createStep).toContain('`retire_capabilities: true`');
      expect(createStep).toContain('报告它已退役');
      expect(createStep).toContain('没有该标记时，报告同步受阻');
      expect(createStep).toContain('什么都不创建');
    }
  });

  it('gates bulk archive on inline synchronous spec sync and verification before moving change root', () => {
    const generatedSkill = generateSkillContent(asDeployed(getBulkArchiveChangeSkillTemplate()), 'PARITY-BASELINE');
    const commandContent = getOpsxBulkArchiveCommandTemplate().content;

    // The bulk archive skill references openspec-sync-specs; opsx command references /opsx:sync.
    expect(generatedSkill, 'bulk skill').toContain('内联运行 `openspec-sync-specs` 工作流');
    expect(commandContent, 'bulk opsx command').toContain('内联运行 `/opsx:sync` 工作流');

    const variants: Array<[string, string]> = [
      ['bulk skill', generatedSkill],
      ['bulk opsx command', commandContent],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain('不要委托给后台任务');
      expect(content, variant).toContain('绝不在 spec 同步仍在进行时归档某个变更');
      expect(content, variant).toContain('在移动 changeRoot 之前验证包含的增量 spec');

      // Verification must follow delta semantics.
      expect(content, variant).toContain('MODIFIED 需求携带 delta 中指明的场景与描述更改');
      expect(content, variant).toContain('REMOVED 需求已消失');
      expect(content, variant).toContain('RENAMED 需求以新名称存在且旧名称下已消失');

      expect(content, variant).toContain('若同步报告任何停止或受阻条件，视为同步失败');
      expect(content, variant).toContain('不要执行同步后的内容比较');
      expect(content, variant).toContain('也不要移动其 `changeRoot`');

      // Main spec paths are store-root aware
      expect(content, variant).toContain('<planningHome.root>/openspec/specs/<capability-path>/spec.md');
    }
  });

  it('carries mixed included and excluded bulk-archive deltas through both generated variants', () => {
    const variants: Array<[string, string]> = [
      [
        'bulk skill',
        generateSkillContent(asDeployed(getBulkArchiveChangeSkillTemplate()), 'PARITY-BASELINE'),
      ],
      ['bulk opsx command', getOpsxBulkArchiveCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain(
        '对每个增量 spec 的包含或排除决策'
      );
      expect(content, variant).toContain(
        '单个变更可以同时拥有包含和排除的增量 spec'
      );
      expect(content, variant).toContain(
        '仅传递包含的 delta 路径，并明确指示忽略'
      );
      expect(content, variant).not.toContain(
        'for each change, passing the delta spec analysis'
      );
      expect(content, variant).toContain(
        '仅针对 `includedDeltas` 中的增量 spec'
      );
      expect(content, variant).toContain(
        '不要验证 `excludedDeltas` 中的增量 spec'
      );
      expect(content, variant).toContain('报告 `sync skipped`');
      expect(content, variant).toContain(
        '`sync skipped`，但不把归档本身视为跳过'
      );

      // These three carried no assertion, so deleting any of them from a
      // single variant was caught only by the golden hash — and this repo
      // regenerates hashes as a matter of routine, which makes that no
      // protection at all.
      expect(content, variant).toContain(
        '`includedDeltas`：来自已确认变更中所有无冲突的增量 spec'
      );
      expect(content, variant).toContain(
        '`excludedDeltas`：来自已确认变更中因实现缺失而被排除的冲突增量 spec'
      );
      expect(content, variant).toContain(
        '将每个 delta 的 `includedDeltas` 和 `excludedDeltas` 决策带入执行'
      );
      // The worked example must show the skip, or the agent has no model of
      // what a partially-synced batch report looks like.
      expect(content, variant).toContain(
        '1 个增量 spec 同步已跳过（add-jwt，identity/user-auth：未找到实现）'
      );
    }
  });

  it('lets the sync workflow honor the delta subset bulk archive hands it', () => {
    // Bulk archive tells sync to ignore excludedDeltas, but sync treats
    // existingOutputPaths as its own source of truth. Without an explicit
    // carve-out the callee re-syncs the delta the caller withheld, step 8b
    // never checks it (it verifies only includedDeltas), and the run still
    // reports `sync skipped` for a spec that was in fact written.
    const variants: Array<[string, string]> = [
      ['sync skill', getSyncSpecsSkillTemplate().instructions],
      ['sync command', getOpsxSyncCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain(
        '调用方通过指定来自'
      );
      expect(content, variant).toContain(
        '然后仅同步指定的路径，保持其余增量 spec 不变'
      );
      expect(content, variant).toContain(
        '永远不要将其扩展回完整列表'
      );
      expect(content, variant).toContain(
        '遵循调用方提供的 `existingOutputPaths` 子集'
      );
      expect(content, variant).toContain(
        '逐字复制这些绝对路径值'
      );
      expect(content, variant).toContain('通过选择以');
      expect(content, variant).toContain('/specs/billing/invoices/spec.md');
      expect(content, variant).not.toContain('only sync the billing delta');
      expect(content, variant).not.toContain('only sync `specs/billing/invoices/spec.md`');

      // Step 4 is the operative loop. Narrowing step 3 alone left the loop
      // still iterating "each path returned by the CLI", which re-widens the
      // set and re-syncs the delta the caller withheld — the original bug,
      // one step further down the template.
      expect(content, variant).toContain(
        '对步骤 3 中选定的每个 capability'
      );
      expect(content, variant).not.toContain(
        'For each capability delta spec path returned by the CLI'
      );

      // The undefined edges: a named path outside existingOutputPaths, and an
      // empty named list. Both must stop rather than proceed on a guess.
      expect(content, variant).toContain(
        '若指定的路径不在 `existingOutputPaths` 中，不要同步它'
      );
      expect(content, variant).toContain(
        '若指定列表为空，报告没有可同步的内容并停止'
      );
    }
  });

  it('requires apply context while keeping guidance advisory and state separate', () => {
    const variants: Array<[string, string]> = [
      ['apply skill', getApplyChangeSkillTemplate().instructions],
      ['apply command', getOpsxApplyCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain('可选的 `context`');
      expect(content, variant).toContain('可选的 `operationGuidance`');
      expect(content, variant).toContain('将 `context` 视为必需的提示级输入');
      expect(content, variant).toContain('应用相关的项目事实、约定和约束');
      expect(content, variant).toContain(
        '将 `operationGuidance` 视为可选的补充建议'
      );
      expect(content, variant).toContain('阅读并考虑每个');
      expect(content, variant).toContain('适用且与内置');
      expect(content, variant).toContain(
        '与 CLI 返回的状态、缺失的制品、任务'
      );
      expect(content, variant).toContain(
        '不要将 context 或 operation guidance 作为任务完成的证据'
      );
      expect(content, variant).toContain('冲突并保留控制值');
      expect(content, variant).toContain('不要遵循它并解释原因');
      expect(content, variant).toContain(
        '不要将运行时 context 或 operation guidance 复制到实现文件或规划制品中'
      );
      expect(content, variant).toContain(
        '保留 CLI 控制的 blocked/ready/all-done 行为'
      );
      expect(content, variant).toContain(
        '这些是提示级行为契约，不是可强制执行的检查'
      );
    }
  });

  it('makes the archive-inputs lookup fail open and sync instruction consumption fail closed', () => {
    const archiveVariants: Array<[string, string]> = [
      ['archive skill', getArchiveChangeSkillTemplate().instructions],
      ['archive command', getOpsxArchiveCommandTemplate().content],
    ];

    for (const [variant, content] of archiveVariants) {
      expect(content, variant).toContain(
        'openspec-cn instructions archive --change "<name>" --json'
      );
      expect(content, variant).toContain('相同的已选根目录标志');
      // The archive-inputs lookup is a new CLI command, so a skill installed
      // ahead of the CLI (skills.sh) must degrade instead of blocking archiving.
      expect(content, variant).toContain('建议性且可选');
      expect(content, variant).toContain('绝不能阻塞归档');
      expect(content, variant).toContain('尚不支持此命令的旧版 CLI');
      expect(content, variant).toContain(
        '在没有 context 与 operation guidance 的情况下继续归档工作流'
      );
      expect(content, variant).toContain('不要报告错误，也不要停止');
      expect(content, variant).not.toContain(
        'stop before inspecting or\n   writing specs or moving the change'
      );
      expect(content, variant).toContain('成功的响应可能省略这两个可选字段');
      expect(content, variant).toContain(
        '将 `context` 视为必需的提示级输入'
      );
      expect(content, variant).toContain(
        '将 `operationGuidance` 视为可选的增量建议'
      );
      expect(content, variant).toContain('阅读并考虑每一条目');
      expect(content, variant).toContain('报告冲突并保留控制值');
      expect(content, variant).toContain('不要遵循它并解释原因');
      expect(content, variant).toContain(
        '使用 status JSON 中的 `artifactPaths.specs.existingOutputPaths` 作为唯一'
      );
      expect(content, variant).toContain('`specs` 条目缺失');
      expect(content, variant).toContain(
        '不要从其他产出物推断 delta specs'
      );
      expect(content, variant).toContain(
        'openspec-cn instructions specs --change "<name>" --json'
      );
      expect(content, variant).toContain('在写入任何主 spec 或移动变更之前停止');
      expect(content, variant).toContain('省略 `rules` 的有效响应');
      expect(content, variant).toContain('内联同步必须复用该快照');
      expect(content, variant).toContain('不要将其用于归档指导');
      expect(content, variant).toContain(
        '现有的 CLI 检查、已解析路径、提示与命令契约保持不变'
      );
      expect(content, variant).toContain(
        '绝不把运行时 context、operation guidance 或制品规则文本原样复制到输出文件中'
      );
      expect(content, variant).toContain(
        '制品规则仅约束正在写入的 specs，绝不是 operation guidance'
      );
    }

    const syncVariants: Array<[string, string]> = [
      ['sync skill', getSyncSpecsSkillTemplate().instructions],
      ['sync command', getOpsxSyncCommandTemplate().content],
    ];

    for (const [variant, content] of syncVariants) {
      expect(content, variant).toContain(
        '将状态 JSON 中的 `artifactPaths.specs.existingOutputPaths` 作为'
      );
      expect(content, variant).toContain('`specs` 条目缺失');
      expect(content, variant).toContain('不要从其他制品推断');
      expect(content, variant).toContain('复用它且不再次获取相同指令');
      expect(content, variant).toContain('否则现在使用相同的选定根路径标志运行该命令一次');
      expect(content, variant).toContain('在写入任何主 spec 之前停止');
      expect(content, variant).toContain('不要将失败视为缺少规则集');
      expect(content, variant).toContain('省略 `rules` 的有效响应');
      expect(content, variant).toContain('制品规则不是操作指导');
      expect(content, variant).toContain('不逐字复制');
    }
  });

  it('keeps bulk archive instruction lookups atomic across mixed-schema batches', () => {
    const variants: Array<[string, string]> = [
      ['bulk skill', getBulkArchiveChangeSkillTemplate().instructions],
      ['bulk command', getOpsxBulkArchiveCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain('为所选根目录一次性加载当前归档输入');
      expect(content, variant).toContain(
        'openspec-cn instructions archive --change "<selected-change>" --json'
      );
      // Same rule as the single-change skill: a missing archive-inputs command
      // must not take down a whole batch.
      expect(content, variant).toContain('建议性且可选');
      expect(content, variant).toContain('绝不能阻塞批量操作');
      expect(content, variant).toContain(
        '在没有 context 与 operation guidance 的情况下继续批量操作'
      );
      expect(content, variant).not.toContain(
        'stop the whole batch before inspecting specs, writing main specs'
      );
      expect(content, variant).toContain(
        '将此列表作为唯一的增量 spec 来源'
      );
      expect(content, variant).toContain('缺失或列表为空');
      expect(content, variant).toContain('混合 schema 批次');
      expect(content, variant).toContain('获取所有需要的 specs 规则快照');
      expect(content, variant).toContain(
        '在第一次写入或移动之前获取所有快照'
      );
      expect(content, variant).toContain(
        '在任何主 spec 写入或变更移动之前停止整个批次'
      );
      expect(content, variant).toContain(
        '内联同步必须复用它，不要再次获取指令'
      );
      expect(content, variant).toContain(
        '`context` 视为整个批次的必需提示级输入'
      );
      expect(content, variant).toContain(
        '`operationGuidance` 视为可选的增量建议'
      );
      expect(content, variant).toContain('阅读并考虑每');
      expect(content, variant).toContain('报告冲突并保留控制值');
      expect(content, variant).toContain('不要遵循它并解释原因');
      expect(content, variant).toContain(
        '保持运行时输入、冲突分析、CLI 派生值和制品规则彼此分离'
      );
      expect(content, variant).toContain(
        '制品规则仅约束正在写入的 specs'
      );
      expect(content, variant).toContain(
        '绝不把运行时输入或制品规则文本原样复制到输出文件中'
      );
    }
  });

  // The archive instructions must mirror `openspec archive`'s date-prefix
  // rule (#1316): a change already named with a `YYYY-MM-DD-` prefix keeps
  // its name, so archived names never stack dates. Guard the caveat, the
  // literal `mv` target, and the success-summary examples an agent would
  // copy verbatim (#1317).
  it('never instructs stacking a date prefix on an already-dated change (#1317)', () => {
    const archiveInstructions: Array<[string, string]> = [
      ['openspec-archive-change', getArchiveChangeSkillTemplate().instructions],
      ['openspec-bulk-archive-change', getBulkArchiveChangeSkillTemplate().instructions],
      ['openspec-onboard', getOnboardSkillTemplate().instructions],
      ['opsx-archive', getOpsxArchiveCommandTemplate().content],
      ['opsx-bulk-archive', getOpsxBulkArchiveCommandTemplate().content],
      ['opsx-onboard', getOpsxOnboardCommandTemplate().content],
    ];

    for (const [id, text] of archiveInstructions) {
      expect(text, id).toContain('已以 `YYYY-MM-DD-` 前缀开头');

      // Every archive path an agent reproduces must name the derived target,
      // never a hardcoded date.
      expect(text, id).toContain('<target-name>');

      // Discriminator: a `YYYY-MM-DD-` after a path separator belongs to a
      // literal archive path the agent copies verbatim. The rule statements
      // only name the prefix, never place it in a path, so they stay legal.
      expect(text, id).not.toMatch(/\/YYYY-MM-DD-/);
    }
  });

  // Guidance that tells an agent to run `openspec archive` has to pass
  // --yes: the agent cannot answer the confirmation prompts from a tool
  // call, so the bare command aborts (#1479). A golden hash proves the
  // generated file matches its source, never that the source is right, so
  // pin the flag itself.
  it('passes --yes wherever it tells an agent to run openspec archive (#1479)', () => {
    // Sweep the whole corpus, not just the one template that has such an
    // invocation today: the point is to catch the next one.
    const corpus: Array<[string, string]> = [
      ...getSkillTemplates().map(
        ({ dirName, template }) => [dirName, template.instructions] as [string, string]
      ),
      ...getCommandContents().map((entry) => [entry.id, entry.body] as [string, string]),
    ];

    // Only runnable invocations count: prose that merely names the command
    // ("same rule as `openspec archive`") has nothing to confirm, and it is
    // always mid-sentence, so requiring the command to open the line
    // separates the two. Everything a runnable line may legitimately carry in
    // front of the command is allowed, because each of these hid an
    // invocation from an earlier, stricter version of this check: indentation,
    // a list marker, a shell prompt, and a global flag between `openspec` and
    // `archive`. Tokenised rather than pattern-matched - the regex this
    // replaces needed nested quantifiers to accept the flags, which is a ReDoS
    // shape even in a test.
    function archiveInvocations(text: string): string[] {
      return text.split('\n').filter((line) => {
        const bare = line
          .trimStart()
          .replace(/^(?:[-*+]|\d+\.)[ \t]+/, '')
          .replace(/^\$[ \t]+/, '');
        const tokens = bare.split(/\s+/).filter(Boolean);
        if (tokens[0] !== 'openspec' && tokens[0] !== 'openspec-cn') return false;
        const archiveAt = tokens.indexOf('archive');
        if (archiveAt < 1) return false;
        // Anything between `openspec` and `archive` has to be a global flag or
        // one's value, or this is a different subcommand that merely mentions
        // the word (`openspec list archive`).
        return tokens
          .slice(1, archiveAt)
          .every((token, i, before) => token.startsWith('-') || !!before[i - 1]?.startsWith('-'));
      });
    }

    let total = 0;
    for (const [id, text] of corpus) {
      const invocations = archiveInvocations(text);
      total += invocations.length;
      for (const invocation of invocations) {
        expect(invocation.trim(), id).toContain('--yes');
      }
    }

    // Guards the guard, and names the floor rather than trusting `> 0`: the
    // onboarding walkthrough is the one template that is supposed to contain
    // a runnable archive invocation, so a corpus that stops containing it
    // fails here instead of passing vacuously.
    expect(total).toBeGreaterThan(0);
    const onboard = corpus.filter(([id]) => id.includes('onboard'));
    expect(onboard.length).toBeGreaterThan(0);
    for (const [id, text] of onboard) {
      expect(archiveInvocations(text), id).not.toHaveLength(0);
    }
  });

  // Covers both archive paths, not just the bulk one the fix targeted: the
  // single-change routing has been correct since #1357 (current wording from
  // #1394) but was never pinned, so a stale branch could silently reopen the
  // bug #1381 actually reported.
  it('honors Cancel at every archive confirmation (#1381)', () => {
    const variants: Array<[string, string]> = [
      ['bulk skill', generateSkillContent(asDeployed(getBulkArchiveChangeSkillTemplate()), 'PARITY-BASELINE')],
      ['bulk opsx command', getOpsxBulkArchiveCommandTemplate().content],
      ['single skill', generateSkillContent(asDeployed(getArchiveChangeSkillTemplate()), 'PARITY-BASELINE')],
      ['single opsx command', getOpsxArchiveCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      // Offering "Cancel" without routing it let an agent fall straight through
      // to the archive step and move the changes anyway.
      expect(content, variant).toContain('"取消" — 停止，不归档');

      // An unrecognized answer must re-prompt; archiving is never the default.
      expect(content, variant).toContain('其他任何回答 — 再次询问，而不是归档');
    }
  });

  // The bulk confirmation labels are written by the agent and carry an `N`
  // placeholder, so routing must match intent — matching the literal labels
  // would send every legitimate answer down the "ask again" path forever.
  it('routes the bulk archive confirmation by intent, not by literal label (#1381)', () => {
    const variants: Array<[string, string]> = [
      ['bulk skill', generateSkillContent(asDeployed(getBulkArchiveChangeSkillTemplate()), 'PARITY-BASELINE')],
      ['bulk opsx command', getOpsxBulkArchiveCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain('根据用户回答的意图路由，而不是精确匹配标签');

      // The ready-only route has to name where "ready" is decided, or the agent
      // cannot tell which subset to archive.
      expect(content, variant).toContain('步骤 6 表格中标记为');

      // A cancelled batch must archive nothing, reinforced where agents skim.
      expect(content, variant).toContain(
        '用户取消确认后绝不归档'
      );
    }
  });

  it('makes the schema instruction field authoritative for artifact creation (#777)', () => {
    const variants: Array<[string, string]> = [
      ['propose skill', generateSkillContent(asDeployed(getOpsxProposeSkillTemplate()), 'PARITY-BASELINE')],
      ['propose command', getOpsxProposeCommandTemplate().content],
      ['continue skill', generateSkillContent(asDeployed(getContinueChangeSkillTemplate()), 'PARITY-BASELINE')],
      ['continue command', getOpsxContinueCommandTemplate().content],
      ['ff skill', generateSkillContent(asDeployed(getFfChangeSkillTemplate()), 'PARITY-BASELINE')],
      ['ff command', getOpsxFfCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      // The instruction field wins even for familiar artifact names: the old
      // hard-coded "Common artifact patterns" shortcut is what let agents
      // ignore custom schemas that reuse proposal.md/tasks.md file names.
      expect(content, variant).toContain('权威指导');
      expect(content, variant).not.toContain('常见产出物模式');

      // Delegated creation is honored at the creation step itself, held to the
      // output path already chosen and checked (#2099), and the delegated
      // skill's output is verified rather than assumed.
      expect(content, variant).toContain(
        '若 `instruction` 字段将创建委托给特定 skill 或命令，则仅当它能把产出物写入该输出路径时才调用它；否则停止并告知用户'
      );
      expect(content, variant).toMatch(/验证产出物文件存在于该输出路径/u);

      // ...and restated in the artifact-creation guidelines.
      expect(content, variant).toContain(
        '若 `instruction` 字段指示你使用特定 skill 或命令创建产出物，则调用它而非直接写入产出物 —— 但仅在已选定并检查过输出路径之后，且仅当它能写入该处时才调用'
      );
    }
  });

  // A golden hash proves the generated file matches its source, never that the
  // source is right - so a careless `regen:parity-hashes` over a dropped
  // paragraph passes CI silently. The sync skill is the one place an agent
  // learns that retiring a capability needs the marker; pin the fact, not the
  // hash, so losing the guidance fails here instead of shipping.
  it('tells the sync skill that retirement needs the retire_capabilities marker', () => {
    const sync = getSkillTemplates().find(
      ({ dirName }) => dirName === 'openspec-sync-specs'
    );
    expect(sync, 'openspec-sync-specs template').toBeTruthy();
    const variants = [
      ['sync skill', sync!.template.instructions],
      ['sync command', getOpsxSyncCommandTemplate().content],
    ] as const;
    for (const [variant, text] of variants) {
      expect(text, variant).toContain('retire_capabilities: true');
      expect(text, variant).toContain('所有其他非空行都被解释');
      expect(text, variant).toContain('解析后位于真实 specs 根目录内');
      expect(text, variant).toContain('检出范围的恢复指导');
      expect(text, variant).toContain('不要修改主 spec');
      expect(text, variant).toMatch(/停止该 capability 的同步/);
      expect(text, variant).toContain(
        '绝不要写入或留下空的 `## Requirements` 章节'
      );
      expect(text, variant).not.toContain('any other sections');
      expect(text, variant).not.toContain('Loose prose left under `## Requirements` does NOT block');
    }
  });
  // explore 捕获表格指明的是 spec-driven 文件；没有这一说明，使用自定义 schema
  // 的代理会提议写入 schema 从未定义的制品（#2084）。
  it('把 explore 捕获表格限定到默认 schema', () => {
    const variants = [
      ['explore skill', getExploreSkillTemplate().instructions],
      ['explore command', getOpsxExploreCommandTemplate().content],
    ] as const;
    for (const [variant, text] of variants) {
      expect(text, variant).toContain(
        '下表是默认 spec-driven schema 的记录位置。使用其他 schema 时，请把每条洞察记录到 `artifactPaths` 中最适合它的产出物里'
      );
    }
  });
});

describe('apply skill/command shared instruction core', () => {
  // The apply skill and command are intentionally distinct surfaces, but they
  // differ only in how they are invoked — the generation transformers rewrite
  // the canonical `/opsx:<id>` tokens per surface downstream (asserted in
  // test/utils/command-references.test.ts). The instruction text itself is
  // shared, so this pins the contract: both surfaces render the one canonical
  // core and cannot silently drift apart at the template level.
  it('renders both apply surfaces from the shared instruction core', () => {
    const core = getApplyInstructions();
    expect(getApplyChangeSkillTemplate().instructions).toBe(core);
    expect(getOpsxApplyCommandTemplate().content).toBe(core);
  });

  it('keeps task completion distinct from archive readiness (#1790)', () => {
    const core = getApplyInstructions();
    expect(core).toContain('所有跟踪的任务已完成');
    expect(core).toMatch(/归档前请根据情况审查或验证/);
    expect(core).not.toContain('所有任务已完成！可以归档');
  });
});

describe('workflow guidance matches the packaged templates (#1138)', () => {
  // Onboard drafts each artifact in the conversation and then saves what it
  // drafted, so a preview missing the template's title writes an untitled file
  // no matter what the template says.
  it('shows every artifact title in the onboarding walkthrough', () => {
    const titles = specDrivenTitles();
    const surfaces: Array<[string, string]> = [
      ['onboard skill', getOnboardSkillTemplate().instructions],
      ['opsx onboard command', getOpsxOnboardCommandTemplate().content],
    ];

    for (const [surface, text] of surfaces) {
      for (const artifactId of ['proposal', 'specs', 'design', 'tasks']) {
        expect(text, `${surface} / ${artifactId}`).toContain(`\n${titles[artifactId]}\n`);
      }
    }
  });

  // The sync workflow prints a delta reference right beside the main-spec one.
  // The two are only telling them apart if the delta carries its own title.
  it('titles the delta spec in the sync format reference', () => {
    const titles = specDrivenTitles();

    for (const [surface, text] of [
      ['sync skill', getSyncSpecsSkillTemplate().instructions],
      ['opsx sync command', getOpsxSyncCommandTemplate().content],
    ] as Array<[string, string]>) {
      expect(text, surface).toContain(`\n${titles.specs}\n\n## Purpose\n`);
      expect(text, surface).toContain('\n# <capability> Specification\n');
    }
  });
});
