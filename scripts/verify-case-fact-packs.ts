import assert from 'node:assert/strict';

import {
  getAllCaseFactPacks,
  getCaseSynthesisConfig,
} from '@/data/portfolio-case-facts';
import type { CaseFactFacet, CaseFactPack } from '@/lib/portfolio/types';

const PRIORITY_CASES = ['alfa-smart', 'chatpoint', 'siebel'] as const;
const REQUIRED_KEYS: Array<keyof Omit<CaseFactPack, 'caseId' | 'missing' | 'recruiterSummary' | 'bestAnswerTypes'>> = [
  'overview',
  'role',
  'decisions',
  'constraints',
  'validation',
  'outcomes',
  'evidence',
  'risks',
  'hiringSignal',
  'whatThisProves',
  'recruiterTakeaway',
  'weaknessAngle',
];

const FACETS: CaseFactFacet[] = [
  'overview',
  'role',
  'decisions',
  'evidence',
  'strengths',
  'risks',
];

function main() {
  const packs = getAllCaseFactPacks();

  for (const caseId of PRIORITY_CASES) {
    const pack = packs[caseId];
    assert.ok(pack, `${caseId}: fact pack must exist`);
    assert.ok(pack.recruiterSummary.intro.length > 0, `${caseId}: recruiterSummary.intro must not be empty`);
    assert.ok(pack.bestAnswerTypes.length > 0, `${caseId}: bestAnswerTypes must not be empty`);

    for (const key of REQUIRED_KEYS) {
      assert.ok(pack[key].length > 0, `${caseId}: ${key} must not be empty`);
    }

    for (const facet of FACETS) {
      const config = getCaseSynthesisConfig(caseId, facet);
      assert.ok(config, `${caseId}: ${facet} synthesis config must exist`);
      assert.ok(config!.facts.length > 0, `${caseId}: ${facet} synthesis facts must not be empty`);
      assert.ok(config!.chips.length > 0, `${caseId}: ${facet} synthesis chips must not be empty`);
      assert.ok(config!.fallbackIntro.length > 0, `${caseId}: ${facet} fallback intro must not be empty`);
    }
  }

  console.log('Case fact pack contract passed.');
}

main();
