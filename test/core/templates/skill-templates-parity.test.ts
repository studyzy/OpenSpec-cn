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
  getApplyChangeSkillTemplate: '1a729cfa38844a9db28270988589ba02c1f532af870ac8ff280fbcfa94439493',
  getFfChangeSkillTemplate: 'fe29d7df3a0c55f1f557452338568d57fd719be89cdff7f382235046bb87c4fa',
  getSyncSpecsSkillTemplate: 'f6b8ad7ab0b6a52e22d372e72456a74b804bcb4418bfea25a9db40448a7d5639',
  getOnboardSkillTemplate: 'b7af2de97b5fd5afce5117b06bc81a8feebdd1bb3fa3c760cfb1debe24100705',
  getOpsxExploreCommandTemplate: '6e76e88b1c37c87c53d25abceb349068092e33d885a18617f4045f1ddc2004f7',
  getOpsxNewCommandTemplate: '30025e2d64114b8a4200fa4fd4d1f4c6830debdee797e57abf7eced0fe1e5756',
  getOpsxContinueCommandTemplate: '1eb4aeefed580ff62fc0a4c88a547af07712aec9b18c7d8d840d674d738ab411',
  getOpsxApplyCommandTemplate: 'f632f5ed565b8f73e1e9c47d724f6e2cad011a331da9b79fdc13f5782ec94b54',
  getOpsxFfCommandTemplate: 'ab0169144d641391ab6e4f99e06add8bb76d5df06ddac563d64bbff1c709a4b9',
  getArchiveChangeSkillTemplate: '801995a9ab80c11126c5382e2abc83cb02f2a939e19a51a92b58a123f8a75fd4',
  getBulkArchiveChangeSkillTemplate: '7b8c85795a64190dd7e606ec1c25b78e59a8f87643537e6eba210b3c9ab432ff',
  getOpsxSyncCommandTemplate: '097d192c440b5ee6998f628c33e4acc4a4bf0e9fe09ea65fa8e88952fb31272b',
  getVerifyChangeSkillTemplate: '9144c160e38c5802449e39e46d1c49e04fbfc1c5217f322feaf7b024775be9a7',
  getOpsxArchiveCommandTemplate: 'bd806b25e12d79ebe4e0254da51bae3170cc531991bda7bee7cbce24a9b44650',
  getOpsxOnboardCommandTemplate: 'c759a5b5751b77e47c4f53c22938189a79c54a0ce647df3eda82c59b33754c87',
  getOpsxBulkArchiveCommandTemplate: '6fc1eacbe475036088b94120769be59e4e98fd1980cb91bf7c98235331f5db4d',
  getOpsxVerifyCommandTemplate: 'c958655ba5361104629b2209a5ecba82108af85e20458c2b7c8bb1efc8f75bc1',
  getOpsxProposeSkillTemplate: '7381f062a0f6dd0d06d29f59597a93f2473d0c7ce7ba4ad2a0c9939a9f1620bd',
  getOpsxProposeCommandTemplate: '9a920c021906a9864f469ed222397543ab1520522cd676a29a1ba4bc25d9abc6',
  getFeedbackSkillTemplate: 'a2ee906458fa2cad42096fe0ec40000f3acfd5534d91bd48079ff3a19af914e3',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'openspec-explore': 'd4b9e68b1d0b632eb3507662047e2deee6a819c91e2a7b46c384541c9f4bf0c0',
  'openspec-new-change': 'ab9020a8468ec7186f2bf7f9b7017b4a2eb4ea861eb28d077f2d582dd8e16ff8',
  'openspec-continue-change': 'aa45e0220ac7cd9b56b6eb2762c7d3c7038e1ffba843304d05ef2d64a0a419ba',
  'openspec-apply-change': '1692791c507724d881f7e9a2f8cab865a5bd14421df3d65d77bbfcb27d6b9ed4',
  'openspec-ff-change': '4f781bc02e5c53a9978aec3ad07ec0bf90eb571e13916034258b4639e618e8cd',
  'openspec-sync-specs': '21386f3b4bf05e0e451a9938e54d2162ff82d5324fabb947d68a2071254cb445',
  'openspec-archive-change': '3802344962fe01404d0e9a9e40e4783777f1d07a775efca92a2edda8f7259d4a',
  'openspec-bulk-archive-change': '4edc5c8f24005fe5ec19d71695184908f1a6239cd89021cf276f100bfc0742b0',
  'openspec-verify-change': '48e9c729e2b67c938418a6812ec12a8f201ec168bb10dbb241a00695a2b02fa2',
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
