import assert from 'node:assert/strict';
import { z } from 'zod';

import { PORTFOLIO_CASE_ORDER } from '@/data/portfolio-profile';
import { DOSSIER_TOKEN_LIMIT, portfolioDossier } from '@/lib/portfolio/full-context-dossier';
import { fullContextDraftSchema, truncateVisibleHistory, validateFullContextDraft } from '@/lib/portfolio/full-context-contract';

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

const providerSchema = z.toJSONSchema(fullContextDraftSchema);
assert.deepEqual(
  [...(providerSchema.required ?? [])].sort(),
  ['artifactIds', 'blocks', 'offerContact', 'relatedCaseIds', 'status'].sort(),
  'OpenAI Structured Outputs requires every root property',
);
const providerBlockSchema = providerSchema.properties?.blocks;
assert.ok(providerBlockSchema && typeof providerBlockSchema === 'object');
assert.equal(providerBlockSchema.type, 'array');
if (providerBlockSchema.type === 'array' && providerBlockSchema.items && typeof providerBlockSchema.items === 'object' && !Array.isArray(providerBlockSchema.items)) {
  assert.deepEqual(
    [...(providerBlockSchema.items.required ?? [])].sort(),
    ['evidenceIds', 'kind', 'metricIds', 'text'].sort(),
    'OpenAI Structured Outputs requires every block property',
  );
}

const alfaMetric = portfolioDossier.metrics.find((metric) => metric.caseId === 'alfa-smart' && metric.text.includes('32 111'));
assert.ok(alfaMetric);
const valid = validateFullContextDraft({
  status: 'supported',
  blocks: [{ kind: 'fact', text: 'Кейс дал измеримый продуктовый результат.', evidenceIds: [alfaMetric!.recordId], metricIds: [alfaMetric!.id] }],
  relatedCaseIds: ['alfa-smart'], artifactIds: [], offerContact: false,
});
assert.equal(valid.ok, true, 'a direct cited fact must render');

const markerLeak = validateFullContextDraft({
  status: 'supported',
  blocks: [{ kind: 'fact', text: `[${alfaMetric!.recordId}] Кейс дал измеримый продуктовый результат. [artifact:invented]`, evidenceIds: [alfaMetric!.recordId], metricIds: [alfaMetric!.id] }],
  relatedCaseIds: ['alfa-smart'], artifactIds: [], offerContact: false,
});
assert.equal(markerLeak.ok, true, 'a copied internal marker must not fail a safe answer');
assert.equal(markerLeak.ok ? markerLeak.draft.blocks[0]?.text.includes('[') : true, false, 'internal IDs must not reach visible text');

const artifactEvidence = validateFullContextDraft({
  status: 'supported',
  blocks: [{ kind: 'fact', text: 'На артефакте показано действие владельца подписки.', evidenceIds: ['artifact:alfa-invite'], metricIds: [] }],
  relatedCaseIds: ['alfa-smart'], artifactIds: ['alfa-invite'], offerContact: false,
});
assert.equal(artifactEvidence.ok, true, 'an exact known artefact can support a narrow factual answer');
assert.deepEqual(artifactEvidence.ok ? artifactEvidence.draft.blocks[0]?.evidenceIds : [], ['artifact.alfa-invite']);

const validWithoutInventedOptionalArtifact = validateFullContextDraft({
  status: 'supported',
  blocks: [{ kind: 'fact', text: 'Кейс дал измеримый продуктовый результат.', evidenceIds: [alfaMetric!.recordId], metricIds: [alfaMetric!.id] }],
  relatedCaseIds: ['alfa-smart'], artifactIds: ['invented-artifact'], offerContact: false,
});
assert.equal(validWithoutInventedOptionalArtifact.ok, true, 'an optional invalid artifact must not discard valid text');
assert.deepEqual(validWithoutInventedOptionalArtifact.ok ? validWithoutInventedOptionalArtifact.draft.artifactIds : [], []);

for (const bad of [
  { status: 'supported', blocks: [{ kind: 'fact', text: '32 111 подписок', evidenceIds: ['invented.id'] }], relatedCaseIds: [], artifactIds: [], offerContact: false },
  { status: 'supported', blocks: [{ kind: 'fact', text: '99 999 подписок', evidenceIds: [alfaMetric!.recordId], metricIds: [alfaMetric!.id] }], relatedCaseIds: [], artifactIds: [], offerContact: false },
  { status: 'supported', blocks: [{ kind: 'inference', text: 'Андрей точно подходит любой команде.', evidenceIds: [] }], relatedCaseIds: [], artifactIds: [], offerContact: false },
  { status: 'supported', blocks: [{ kind: 'fact', text: 'Есть измеримый результат.', evidenceIds: [alfaMetric!.recordId], metricIds: [alfaMetric!.id] }], relatedCaseIds: ['siebel'], artifactIds: [], offerContact: false },
]) {
  assert.equal(validateFullContextDraft(bad).ok, false, 'invalid evidence, metric, inference and case action must be rejected');
}

assert.ok(
  portfolioDossier.records
    .filter((record) => record.source.includes(':summary.'))
    .every((record) => record.kind === 'interpretation'),
  'subjective recruiter summaries must not be factual evidence',
);
assert.equal(portfolioDossier.review.unresolvedCount, portfolioDossier.contradictions.length);
assert.equal(portfolioDossier.review.authorReviewed, false, 'automated checks must not impersonate author sign-off');

const history = Array.from({ length: 8 }, (_, index) => [
  { role: 'user' as const, text: `Вопрос ${index}` },
  { role: 'assistant' as const, text: `Ответ ${index}` },
]).flat();
const kept = truncateVisibleHistory(history);
assert.equal(kept.length, 12, 'history keeps at most six completed pairs');
assert.equal(kept[0].text, 'Вопрос 2', 'history removes complete oldest pairs');
assert.equal(truncateVisibleHistory([{ role: 'assistant', text: 'orphan' }]).length, 0, 'orphan history is ignored');

console.log(`verify-full-context-assistant: ok (${portfolioDossier.records.length} records, conservative ${portfolioDossier.estimatedTokens} tokens)`);
