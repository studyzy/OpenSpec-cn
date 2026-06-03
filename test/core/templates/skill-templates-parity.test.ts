import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import {
  type SkillTemplate,
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
  getOpsxVerifyCommandTemplate,
  getSyncSpecsSkillTemplate,
  getVerifyChangeSkillTemplate,
} from '../../../src/core/templates/skill-templates.js';
import { generateSkillContent } from '../../../src/core/shared/skill-generation.js';

const EXPECTED_FUNCTION_HASHES: Record<string, string> = {
  getExploreSkillTemplate: '7348ecbd7dc678b8312c7a86fceccd6970917c8c61b8ee983774deaba56b191a',
  getNewChangeSkillTemplate: 'a745f8794b4717a201e001e99ef8ec67196e1057ecb3737a6963f5a5a9f4ba43',
  getContinueChangeSkillTemplate: '702a39545a9cbfb4c44446ee59b29bc1c12ae50c9251279a7f2a937d93989faf',
  getApplyChangeSkillTemplate: '87c0e4eea9accf399f2f8a426860b99c8f8c2c5ff50535ad3694cdf06c1d6859',
  getFfChangeSkillTemplate: '3c3fd939c85a8d14d9bd12889588d008b590060dc4501e5ed124bf8b87047008',
  getSyncSpecsSkillTemplate: '76584837d9a618956cd6b4f0824e22966ebf5bcfa9be67d097fb1700cbe3839d',
  getOnboardSkillTemplate: '2c1a80c5936d4c17175dd4be3c0ebdc57bbbf55019e04b593071e91d82b9d710',
  getOpsxExploreCommandTemplate: '052191bceca8f5d39ae77b53dbc8fab33855ed6f19e94d1a342f474481b1535f',
  getOpsxNewCommandTemplate: '30025e2d64114b8a4200fa4fd4d1f4c6830debdee797e57abf7eced0fe1e5756',
  getOpsxContinueCommandTemplate: '199b003a30192c88dacb1f1507937e7c4a543c1b972de70241aa3a899f90f8c0',
  getOpsxApplyCommandTemplate: 'e55c2a7504798355b5745c2c3344f6debda5db08ae57a17a469fe70f365eb0f4',
  getOpsxFfCommandTemplate: '175f3f1d8472f03af738669fd5420be08b8d90236c2a5751906a242be203af87',
  getArchiveChangeSkillTemplate: 'd8bc487badca34c165d5138a5ce9c9eaea82cf7ed07678998f394d66ab745060',
  getBulkArchiveChangeSkillTemplate: '4a17ea14f5a843663947bdec9051d4e650553191fdb4f4f84d15d55d87fd7c42',
  getOpsxSyncCommandTemplate: '43b256d1d43ba4a5b9aa979695f04cfd8ee6d8408e5fdeaae1b3c8defe3125d7',
  getVerifyChangeSkillTemplate: '9ade407bfac1b7defb8b9d46be30cf31de9db0b5e4c949674334ebb9473465df',
  getOpsxArchiveCommandTemplate: '40e43545f41393f71b95f41717d65d40fc21138c89ebceb3fe79348b785f354c',
  getOpsxOnboardCommandTemplate: '5aad95bb45366ce9125456f54089a72386a12376b967e5bf0b27c19b7e4bf051',
  getOpsxBulkArchiveCommandTemplate: '7c4e2160e83d93ad5ba8beab049700e679d6b72d21d3706ef9a324530e01c776',
  getOpsxVerifyCommandTemplate: 'c56345b7d511e1d3b03072ec4963bf5772b48cbed0c259925e0cce550c7fa233',
  getOpsxProposeSkillTemplate: '7c44bbfd1c7ee158d7d6a96de7b3a9cdb49b59bc48261f9de328897b3deed2dc',
  getOpsxProposeCommandTemplate: 'eac2d05f9e9c0db9714bd785d97c0189bcd0a6ff99e0957cfab46ffa295e5334',
  getFeedbackSkillTemplate: 'a2ee906458fa2cad42096fe0ec40000f3acfd5534d91bd48079ff3a19af914e3',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'openspec-explore': '673502a700b53e7e45ac6e9f380a36b096bcc1403a63d5970003f48aefbfa4f6',
  'openspec-new-change': 'ab9020a8468ec7186f2bf7f9b7017b4a2eb4ea861eb28d077f2d582dd8e16ff8',
  'openspec-continue-change': 'ae271ee329252fcb98f67142539e2c72bf4a63a265043456764d70644cd9ba15',
  'openspec-apply-change': 'ed75c277724178a5c72f5118c41e02d4f0bd6b39b22e87773f038137df6525bc',
  'openspec-ff-change': 'e21edbe5169e5001345ff45f4913af894a7268fcee3ead5304016928738e1c09',
  'openspec-sync-specs': '25c5b4f91a4964ad3273d2bd8bb33c7c012d21e9fce707ebccea99c150f91aeb',
  'openspec-archive-change': '2f45af02d5e44de29809c92724046a452c1f0cd84595d071757000e94fec103a',
  'openspec-bulk-archive-change': 'f6083609a7c532fc7508827aac852b751f200a6acd0748a7c99292f49ae868f5',
  'openspec-verify-change': '55521c38f6067e7805b661a8057e896eca1d234852e7f727f41ded0091e540cb',
  'openspec-onboard': '240ece87cfddcd111c0e99472b64efe3e34d1018d2f6402899a7ad449b372ec6',
  'openspec-propose': '7a6aa90858b1c0b4099e25c04252658d40e773d099bb9c6b96c8ee59777296b1',
};

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
    };

    const actualHashes = Object.fromEntries(
      Object.entries(functionFactories).map(([name, fn]) => [name, hash(stableStringify(fn()))])
    );

    expect(actualHashes).toEqual(EXPECTED_FUNCTION_HASHES);
  });

  it('preserves generated skill file content exactly', () => {
    // Intentionally excludes getFeedbackSkillTemplate: skillFactories only models templates
    // deployed via generateSkillContent, while feedback is covered in function payload parity.
    const skillFactories: Array<[string, () => SkillTemplate]> = [
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
    ];

    const actualHashes = Object.fromEntries(
      skillFactories.map(([dirName, createTemplate]) => [
        dirName,
        hash(generateSkillContent(createTemplate(), 'PARITY-BASELINE')),
      ])
    );

    expect(actualHashes).toEqual(EXPECTED_GENERATED_SKILL_CONTENT_HASHES);
  });

  it('guards unsupported workspace workflows from repo-local fallback edits', () => {
    const guardedSkills: Array<[string, () => SkillTemplate, string]> = [
      ['openspec-apply-change', getApplyChangeSkillTemplate, '工作区应用在此切片中不受支持'],
      ['openspec-sync-specs', getSyncSpecsSkillTemplate, '工作区规范同步在当前版本中不支持'],
      ['openspec-archive-change', getArchiveChangeSkillTemplate, '工作区归档在当前版本中不支持'],
      ['openspec-bulk-archive-change', getBulkArchiveChangeSkillTemplate, '工作区批量归档在当前版本中不支持'],
      ['openspec-verify-change', getVerifyChangeSkillTemplate, '工作区实现验证在当前版本中不支持'],
    ];

    for (const [dirName, createTemplate, guardText] of guardedSkills) {
      const content = generateSkillContent(createTemplate(), 'PARITY-BASELINE');

      expect(content, dirName).toContain('actionContext.mode: "workspace-planning"');
      expect(content, dirName).toContain(guardText);
      expect(content, dirName).not.toContain('openspec/changes/<name>');
      expect(content, dirName).not.toContain('mv openspec/changes');
    }
  });
});
