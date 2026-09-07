import assert from 'node:assert/strict';

import { fullContextEvalFixtures } from '@/lib/portfolio/full-context-eval-fixtures';
import { portfolioDossier } from '@/lib/portfolio/full-context-dossier';

const BUDGET_USD = 10;
const pricePerMillion: Record<string, { input: number; output: number }> = {
  'gpt-5.4-mini': { input: 0.75, output: 4.5 },
  'gpt-5.4': { input: 2.5, output: 15 },
};

function maxCost(model: keyof typeof pricePerMillion, calls: number) {
  const pricing = pricePerMillion[model];
  const input = portfolioDossier.estimatedTokens * calls * pricing.input / 1_000_000;
  const output = 2_000 * calls * pricing.output / 1_000_000;
  return input + output;
}

const pilotCalls = 12;
const holdoutCalls = fullContextEvalFixtures.filter((fixture) => fixture.split === 'holdout').reduce((count, fixture) => count + fixture.turns.length, 0);
const cap = maxCost('gpt-5.4-mini', pilotCalls + holdoutCalls) + maxCost('gpt-5.4', pilotCalls + holdoutCalls);

assert.ok(cap <= BUDGET_USD, `Worst-case new-engine comparison is $${cap.toFixed(2)}, over the $${BUDGET_USD} cap.`);
console.log(JSON.stringify({
  dossierVersion: portfolioDossier.version,
  estimatedDossierTokens: portfolioDossier.estimatedTokens,
  pilotCalls,
  holdoutCalls,
  maximumNewEngineComparisonUsd: Number(cap.toFixed(2)),
  note: 'This preflight never calls OpenAI. Add --live only after Preview secrets and Supabase rate-limit migration are configured.',
}, null, 2));
