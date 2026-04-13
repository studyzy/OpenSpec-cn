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
  getExploreSkillTemplate: '82d2299171c86e531bfe9253399873c90d646f1e38506e15ea7d42176f49aff0',
  getNewChangeSkillTemplate: 'a745f8794b4717a201e001e99ef8ec67196e1057ecb3737a6963f5a5a9f4ba43',
  getContinueChangeSkillTemplate: 'fb04aa237e07898fff39481d5b544f0d9dae4dc5a83c75673e3bb2381e5a4f40',
  getApplyChangeSkillTemplate: '7f3f8f026e3316e10ca28c55836243043a009b6d87944f46dc9fc3c7242bc771',
  getFfChangeSkillTemplate: 'fe29d7df3a0c55f1f557452338568d57fd719be89cdff7f382235046bb87c4fa',
  getSyncSpecsSkillTemplate: 'f6b8ad7ab0b6a52e22d372e72456a74b804bcb4418bfea25a9db40448a7d5639',
  getOnboardSkillTemplate: 'b7af2de97b5fd5afce5117b06bc81a8feebdd1bb3fa3c760cfb1debe24100705',
  getOpsxExploreCommandTemplate: '8a02484304fdf3c81e9ea2adc11c0ada46c2ce73dd29ec6bc293a898ec70c2ca',
  getOpsxNewCommandTemplate: '34c75c2db33077faa5b571f485cef63b3fa61867eb0e9d93229aca00a3370443',
  getOpsxContinueCommandTemplate: '5fe9e09252c166943aeb2cb0312af54282e47075410f73bd123656449d8c8022',
  getOpsxApplyCommandTemplate: '061eb6304f71b1221ba7af2ff46359e8b0d8f0da4a9971b35e6deb6bed23c991',
  getOpsxFfCommandTemplate: '09cb0b5b3b6cb840b16c85c69b8ab744cff8c7954c6731beef665ef86f28a3d4',
  getArchiveChangeSkillTemplate: '801995a9ab80c11126c5382e2abc83cb02f2a939e19a51a92b58a123f8a75fd4',
  getBulkArchiveChangeSkillTemplate: '7b8c85795a64190dd7e606ec1c25b78e59a8f87643537e6eba210b3c9ab432ff',
  getOpsxSyncCommandTemplate: 'fe13a808ce5d2f4fd8eb4054373ce8b02e9b097d562f4921caa591fc50e5cfae',
  getVerifyChangeSkillTemplate: 'abbee80302cc7d343a9760a29224a8d73445fc9479091bfb21c3bf6f18094346',
  getOpsxArchiveCommandTemplate: '0d0044d5979bbf468a46f35f3e30799f3d2809b983e404156cb795eb33cee737',
  getOpsxOnboardCommandTemplate: '3e4e4430de045bd8a1ffc02f902220064f1d9358b503e9f68edd4fc2be6790af',
  getOpsxBulkArchiveCommandTemplate: 'ccc72708fa5afc926cf892e622566d572c7edc5297149c6b5efe7c147e1d9a8f',
  getOpsxVerifyCommandTemplate: 'b5cadec615b5cec0ac8ed76e06880be798e3828651a3e42137f70ae2f6484771',
  getOpsxProposeSkillTemplate: '7381f062a0f6dd0d06d29f59597a93f2473d0c7ce7ba4ad2a0c9939a9f1620bd',
  getOpsxProposeCommandTemplate: '65fb90a69faae0cbca2c4fdd33c7e887d55e625b4634a32040f4f88537c0960d',
  getFeedbackSkillTemplate: 'a2ee906458fa2cad42096fe0ec40000f3acfd5534d91bd48079ff3a19af914e3',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'openspec-explore': 'd4b9e68b1d0b632eb3507662047e2deee6a819c91e2a7b46c384541c9f4bf0c0',
  'openspec-new-change': 'ab9020a8468ec7186f2bf7f9b7017b4a2eb4ea861eb28d077f2d582dd8e16ff8',
  'openspec-continue-change': 'aa45e0220ac7cd9b56b6eb2762c7d3c7038e1ffba843304d05ef2d64a0a419ba',
  'openspec-apply-change': 'cf06315b4f945b877c9ae39bc92ebe5e72901e6d4342afe72f109b28afcfe7e2',
  'openspec-ff-change': '4f781bc02e5c53a9978aec3ad07ec0bf90eb571e13916034258b4639e618e8cd',
  'openspec-sync-specs': '21386f3b4bf05e0e451a9938e54d2162ff82d5324fabb947d68a2071254cb445',
  'openspec-archive-change': '3802344962fe01404d0e9a9e40e4783777f1d07a775efca92a2edda8f7259d4a',
  'openspec-bulk-archive-change': '4edc5c8f24005fe5ec19d71695184908f1a6239cd89021cf276f100bfc0742b0',
  'openspec-verify-change': '3aa94a809725f5589160e6a83f9b09e4156245a1e7533c4dd7acf02a43189686',
  'openspec-onboard': '0e41d9b7c171b6ab784a424e4965afbd1b26d4c71c19d911bec42a7d48192b35',
  'openspec-propose': 'f2f8dbcd9374f58fc1694c6472315c8ffc210e30ae062b37857e5830b2b2cd9f',
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
