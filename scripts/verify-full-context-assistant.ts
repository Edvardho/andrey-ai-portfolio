import assert from 'node:assert/strict';

import { PORTFOLIO_CASE_ORDER } from '@/data/portfolio-profile';
import { DOSSIER_TOKEN_LIMIT, portfolioDossier } from '@/lib/portfolio/full-context-dossier';
import { truncateVisibleHistory, validateFullContextDraft } from '@/lib/portfolio/full-context-contract';

assert.equal(new Set(portfolioDossier.records.map((record) => record.id)).size, portfolioDossier.records.length, 'dossier IDs must be unique');
assert.ok(portfolioDossier.estimatedTokens <= DOSSIER_TOKEN_LIMIT, 'whole dossier must fit its conservative cap');
assert.deepEqual(
  [...new Set(portfolioDossier.records.map((record) => record.caseId).filter(Boolean))].sort(),
  [...PORTFOLIO_CASE_ORDER].sort(),
  'every published case must have dossier records',
);
assert.ok(portfolioDossier.records.some((record) => record.kind === 'fact'));
assert.ok(portfolioDossier.records.some((record) => record.kind === 'interpretation'));
assert.ok(portfolioDossier.records.some((record) => record.kind === 'limitation'));

const alfaMetric = portfolioDossier.records.find((record) => record.caseId === 'alfa-smart' && record.text.includes('32 111'));
assert.ok(alfaMetric);
const valid = validateFullContextDraft({
  status: 'supported',
  blocks: [{ kind: 'fact', text: alfaMetric!.text, evidenceIds: [alfaMetric!.id] }],
  relatedCaseIds: ['alfa-smart'], artifactIds: [], offerContact: false,
});
assert.equal(valid.ok, true, 'a direct cited fact must render');

for (const bad of [
  { status: 'supported', blocks: [{ kind: 'fact', text: '32 111 подписок', evidenceIds: ['invented.id'] }], relatedCaseIds: [], artifactIds: [], offerContact: false },
  { status: 'supported', blocks: [{ kind: 'fact', text: '99 999 подписок', evidenceIds: [alfaMetric!.id] }], relatedCaseIds: [], artifactIds: [], offerContact: false },
  { status: 'supported', blocks: [{ kind: 'inference', text: 'Андрей точно подходит любой команде.', evidenceIds: [alfaMetric!.id] }], relatedCaseIds: [], artifactIds: [], offerContact: false },
  { status: 'supported', blocks: [{ kind: 'fact', text: alfaMetric!.text, evidenceIds: [alfaMetric!.id] }], relatedCaseIds: ['siebel'], artifactIds: [], offerContact: false },
]) {
  assert.equal(validateFullContextDraft(bad).ok, false, 'invalid evidence, metric, inference and case action must be rejected');
}

const history = Array.from({ length: 8 }, (_, index) => [
  { role: 'user' as const, text: `Вопрос ${index}` },
  { role: 'assistant' as const, text: `Ответ ${index}` },
]).flat();
const kept = truncateVisibleHistory(history);
assert.equal(kept.length, 12, 'history keeps at most six completed pairs');
assert.equal(kept[0].text, 'Вопрос 2', 'history removes complete oldest pairs');
assert.equal(truncateVisibleHistory([{ role: 'assistant', text: 'orphan' }]).length, 0, 'orphan history is ignored');

console.log(`verify-full-context-assistant: ok (${portfolioDossier.records.length} records, conservative ${portfolioDossier.estimatedTokens} tokens)`);
