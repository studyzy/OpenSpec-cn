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
  getExploreSkillTemplate: '5b19d4dbe656d1cd8edff329726e2827f18a412e22813b219489baea1a14a9a9',
  getNewChangeSkillTemplate: '61221375d50775da0a045f56d11cea1e04ed4822a84ef738342bacc481397055',
  getContinueChangeSkillTemplate: 'ade24da033eecf69174d701ee8f78c27de0d7c7ed136de620e4d7a2536ac58bf',
  getApplyChangeSkillTemplate: 'd4ee689b11883ea3de774609efbc5691cb8af27566b48038585beb594167b7db',
  getFfChangeSkillTemplate: '6acb28b6341e194343d92064b8b65dcb389a438a85e3d3eaa9125f767ba7f2be',
  getSyncSpecsSkillTemplate: 'd3feac43baeca2a022d52fc388c4f869238430f4e2dcf5f1664d0b3f0837cf6c',
  getOnboardSkillTemplate: '84a6b8e118d731e5fe39a40b444aefa0d93ba6a30bb3410aff8871c6da63385b',
  getOpsxExploreCommandTemplate: '8a02484304fdf3c81e9ea2adc11c0ada46c2ce73dd29ec6bc293a898ec70c2ca',
  getOpsxNewCommandTemplate: '34c75c2db33077faa5b571f485cef63b3fa61867eb0e9d93229aca00a3370443',
  getOpsxContinueCommandTemplate: 'a7d4680c7378cc389a3ef1d700c7f4d21d74e55dc498d20acb11e6af145324ee',
  getOpsxApplyCommandTemplate: '8a9375bc87023a730bd6423bfa03e083fb7f4b83af603b310ea489e4e5c1d833',
  getOpsxFfCommandTemplate: '9637410638e8e3b615a2c07300af65f920e2349dcdfd9341c1d982a35e901613',
  getArchiveChangeSkillTemplate: 'fdf1137927fbb98cbf694f68774c0c2c72dddab4a3d6e511deca559266fef2cd',
  getBulkArchiveChangeSkillTemplate: '4730cd7fa0e148ecc72fca66ab92ad7bb4d8842aa4a53262d59caeeea3b22557',
  getOpsxSyncCommandTemplate: 'fe13a808ce5d2f4fd8eb4054373ce8b02e9b097d562f4921caa591fc50e5cfae',
  getVerifyChangeSkillTemplate: '2575640303b9d80d4014df0b1a122b06112f7f1cea1b87005955c22d9e1dec6b',
  getOpsxArchiveCommandTemplate: '4aa12d9ba5bbc48b98109a178f418225b61aab83fd7c74a2702a3dae3c31384a',
  getOpsxOnboardCommandTemplate: '88470ce08d8c2da150d3539e78742dcf2ed6b8640c1638047a72c96a8bb6a052',
  getOpsxBulkArchiveCommandTemplate: 'ccc72708fa5afc926cf892e622566d572c7edc5297149c6b5efe7c147e1d9a8f',
  getOpsxVerifyCommandTemplate: 'c76ceec0342daf6ca5a02053890edf912c56d4e5a370c7b67c67656bb8f9277f',
  getOpsxProposeSkillTemplate: 'a7fdac53dfd33db4f119d78bddf952013ef7225d7c1007823db666848ce5fec5',
  getOpsxProposeCommandTemplate: '34081937f68a501cf821b2ef451367fd843c4043eef4dfd3ec720b588ac89c09',
  getFeedbackSkillTemplate: 'a9f5f14fbb4e8a1c29631082be5021f08c925d91773903488336085c1819d8eb',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'openspec-explore': 'e5fa57b0ba5f59ef345c7bed14d6d4df03f92048ab01238bffa7d2bc503d2764',
  'openspec-new-change': 'bafb1b1a364a373ad23412df19b012e678e49981820fccb270c15df59add387f',
  'openspec-continue-change': '899ca759c2fd3906c1f792bf7c993b4376ddc64caba93f597ec1da2ce323e42e',
  'openspec-apply-change': 'c3d7aad8ccede31f6d654b18333c05633e523ebf2993839a58449ebeb4aa3c00',
  'openspec-ff-change': '68e118aa6693dbb6fe9dfa3661801e16bfdf255114fcb25c996e4b4694639805',
  'openspec-sync-specs': 'f86649dbeee82332b787f92f3f4331bc4e2c445864f042aafd9bb7e6fb4cb266',
  'openspec-archive-change': 'ba62e3e1c5fef2c0da74ddbe6c061f3a6e6158e786f561c1c0bd5d24e1294989',
  'openspec-bulk-archive-change': 'f9a31fd8b54c26a709a86e49d619b43d71ecc6aa3d09983a1a5bbcc0a568418c',
  'openspec-verify-change': 'a77449de493030de4fc751a580502e2b582fbe1a7d091b18ff95d3d764e69109',
  'openspec-onboard': '7033f5694e4adeb3d9792075963aacc6c031b1186432f5cab8bac18b0a8c3b62',
  'openspec-propose': '0d3a58ebe9191c4e33250f2cc877051a3a8a78ee63d51750092ed4c927740c3e',
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
});
