import assert from 'node:assert/strict';

import { fullContextEvalFixtures } from '@/lib/portfolio/full-context-eval-fixtures';

const working = fullContextEvalFixtures.filter((fixture) => fixture.split === 'working');
const holdout = fullContextEvalFixtures.filter((fixture) => fixture.split === 'holdout');
const holdoutSingles = holdout.filter((fixture) => fixture.turns.length === 1);
const holdoutDialogs = holdout.filter((fixture) => fixture.turns.length === 3);

assert.equal(working.length, 60, 'working set must have 60 scenarios');
assert.equal(holdoutSingles.length, 28, 'holdout must have 28 single-turn scenarios');
assert.equal(holdoutDialogs.length, 12, 'holdout must have 12 three-turn dialogues');
assert.equal(holdout.reduce((count, fixture) => count + fixture.turns.length, 0), 64, 'holdout must produce 64 evaluated answers');
assert.equal(new Set(fullContextEvalFixtures.map((fixture) => fixture.id)).size, 100, 'scenario IDs must be stable and unique');

console.log('verify-full-context-eval: ok (60 working scenarios, 40 holdout scenarios / 64 answers)');
