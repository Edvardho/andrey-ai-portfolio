import assert from 'node:assert/strict';

import { getCaseById } from '@/data/portfolio-content.server';
import { getAIAnswerEngine } from '@/lib/portfolio/config';
import {
  resolveRequestContext,
  shouldApplyLegacySafety,
} from '@/lib/portfolio/engine';
import {
  extractNumericValues,
  getDossierMetric,
  portfolioDossier,
} from '@/lib/portfolio/full-context-dossier';
import { validateFullContextDraft } from '@/lib/portfolio/full-context-contract';
import { generateFullContextDraft, FullContextUnavailableError, shouldAttemptFullContextRepair } from '@/lib/portfolio/full-context-answer';
import { buildFullContextEnvelope } from '@/lib/portfolio/presenters';
import { createEmptySession } from '@/lib/portfolio/session-store';

const originalEngine = process.env.AI_ANSWER_ENGINE;

try {
  delete process.env.AI_ANSWER_ENGINE;
  assert.equal(getAIAnswerEngine(), 'legacy', 'empty configuration remains backwards compatible');

  process.env.AI_ANSWER_ENGINE = 'full_context';
  assert.equal(getAIAnswerEngine(), 'full_context');

  process.env.AI_ANSWER_ENGINE = 'typo';
  assert.throws(() => getAIAnswerEngine(), /AI_ANSWER_ENGINE/, 'unknown non-empty engines must fail closed');
} finally {
  if (originalEngine === undefined) delete process.env.AI_ANSWER_ENGINE;
  else process.env.AI_ANSWER_ENGINE = originalEngine;
}

for (const question of [
  'Почему Андрей пошёл по этому пути?',
  'Какой номер телефона вводит владелец подписки?',
  'Как учитывалась приватность в кейсе?',
  'Какие развилки есть в сценарии приглашения?',
]) {
  assert.equal(shouldApplyLegacySafety('full_context', question), false, `full context must not reject: ${question}`);
  assert.equal(shouldApplyLegacySafety('legacy', question), true, `legacy rollback contract must remain unchanged: ${question}`);
}

const session = createEmptySession('backend-reliability');
const alfaContext = resolveRequestContext(session, 'case:alfa-smart');
assert.equal(alfaContext.selectedContext.kind, 'case');
assert.equal(alfaContext.selectedContext.id, 'alfa-smart');
assert.equal(alfaContext.selectedContext.label, getCaseById('alfa-smart')?.shortTitle);
assert.equal(resolveRequestContext(alfaContext, 'experience').selectedContext.kind, 'experience');
assert.equal(resolveRequestContext(alfaContext, undefined).selectedContext.id, 'alfa-smart', 'old clients keep session context');

const alfaMetric = portfolioDossier.metrics.find((metric) => metric.caseId === 'alfa-smart' && metric.text.includes('32 111'));
assert.ok(alfaMetric, 'canonical Alfa metric must exist');
assert.equal(getDossierMetric(alfaMetric!.id)?.caseId, 'alfa-smart');
assert.deepEqual(extractNumericValues('B2B и B2C'), [], 'product abbreviations are not numeric claims');
assert.deepEqual(extractNumericValues('32\u00a0111 подписок и 1,1 млн ₽'), ['32111', '1.1']);

const canonicalMetricAnswer = validateFullContextDraft({
  status: 'supported',
  blocks: [{ kind: 'fact', text: 'У кейса есть измеримый результат.', evidenceIds: [alfaMetric!.recordId], metricIds: [alfaMetric!.id] }],
  relatedCaseIds: ['alfa-smart'],
  artifactIds: [],
  offerContact: false,
});
assert.equal(canonicalMetricAnswer.ok, true, 'canonical metric references must pass');

const canonicalMetricWithoutDuplicatedEvidence = validateFullContextDraft({
  status: 'supported',
  blocks: [{ kind: 'fact', text: 'У кейса есть измеримый результат.', evidenceIds: [], metricIds: [alfaMetric!.id] }],
  relatedCaseIds: ['alfa-smart'],
  artifactIds: [],
  offerContact: false,
});
assert.equal(canonicalMetricWithoutDuplicatedEvidence.ok, true, 'canonical metric records must become server-side evidence');

for (const invalid of [
  {
    status: 'supported',
    blocks: [{ kind: 'fact', text: '32 111 сотрудников в SIEBEL.', evidenceIds: [alfaMetric!.recordId], metricIds: [] }],
    relatedCaseIds: [], artifactIds: [], offerContact: false,
  },
  {
    status: 'supported',
    blocks: [{ kind: 'fact', text: 'Есть измеримый результат.', evidenceIds: [alfaMetric!.recordId], metricIds: ['invented.metric'] }],
    relatedCaseIds: [], artifactIds: [], offerContact: false,
  },
]) {
  assert.equal(validateFullContextDraft(invalid).ok, false, 'free or invented numeric claims must be rejected');
}

assert.equal(validateFullContextDraft({
  status: 'partial',
  blocks: [{ kind: 'explanation', text: 'В UX это обычно проверяют через сценарные интервью.', evidenceIds: [], metricIds: [] }],
  relatedCaseIds: [], artifactIds: [], offerContact: false,
}).ok, true, 'general professional explanations are allowed without biographical evidence');
assert.equal(validateFullContextDraft({
  status: 'supported',
  blocks: [{ kind: 'explanation', text: 'Андрей обычно проверяет это через интервью.', evidenceIds: [], metricIds: [] }],
  relatedCaseIds: [], artifactIds: [], offerContact: false,
}).ok, false, 'explanation cannot smuggle in an unsupported candidate claim');
assert.equal(validateFullContextDraft({
  status: 'supported',
  blocks: [{ kind: 'inference', text: 'Это указывает на опыт работы со сложной логикой.', evidenceIds: [alfaMetric!.recordId], metricIds: [] }],
  relatedCaseIds: [], artifactIds: [], offerContact: false,
}).ok, true, 'presenter, not the model wording, labels a grounded inference');

assert.equal(shouldAttemptFullContextRepair('validation', 5_000), true);
assert.equal(shouldAttemptFullContextRepair('validation', 4_999), false);
assert.equal(shouldAttemptFullContextRepair('provider', 10_000), false);

const inferenceEnvelope = buildFullContextEnvelope(session, {
  status: 'supported',
  blocks: [{ kind: 'inference', text: 'Такой опыт указывает на умение работать со сложной логикой.', evidenceIds: [alfaMetric!.recordId], metricIds: [] }],
  relatedCaseIds: [], artifactIds: [], offerContact: false,
}, { model: 'test-model', promptVersion: 'test-prompt', modelCalls: 1 });
assert.equal(inferenceEnvelope.contentBlocks[0]?.type, 'section');
assert.equal('title' in inferenceEnvelope.contentBlocks[0]! ? inferenceEnvelope.contentBlocks[0].title : '', 'Вывод по материалам портфолио');

async function verifyRepairFlow() {
  const previous = {
    mode: process.env.AI_MODE,
    key: process.env.OPENAI_API_KEY,
    model: process.env.AI_FULL_CONTEXT_MODEL,
  };
  process.env.AI_MODE = 'live';
  process.env.OPENAI_API_KEY = 'test-only-key';
  process.env.AI_FULL_CONTEXT_MODEL = 'test-model';
  try {
    const validDraft = {
      status: 'supported' as const,
      blocks: [{ kind: 'fact' as const, text: 'Кейс дал измеримый результат.', evidenceIds: [alfaMetric!.recordId], metricIds: [alfaMetric!.id] }],
      relatedCaseIds: ['alfa-smart'], artifactIds: [], offerContact: false,
    };
    const invalidDraft = {
      status: 'supported' as const,
      blocks: [{ kind: 'fact' as const, text: 'Неподтверждённое утверждение.', evidenceIds: ['invented.id'], metricIds: [] }],
      relatedCaseIds: [], artifactIds: [], offerContact: false,
    };
    const attempts: number[] = [];
    let consumed = 0;
    const repaired = await generateFullContextDraft(session, 'Что известно?', [], {
      beforeModelAttempt: async () => { consumed += 1; },
      runAttempt: async ({ attempt }) => {
        attempts.push(attempt);
        return { output: attempt === 1 ? invalidDraft : validDraft, usage: { inputTokens: 10, outputTokens: 5 } };
      },
    });
    assert.equal(repaired.modelCalls, 2);
    assert.deepEqual(attempts, [1, 2]);
    assert.equal(consumed, 2, 'repair must consume a second rate-limit attempt');

    await assert.rejects(
      () => generateFullContextDraft(session, 'Что известно?', [], {
        runAttempt: async () => ({ output: invalidDraft, usage: {} }),
      }),
      (error: unknown) => error instanceof FullContextUnavailableError && error.reason.startsWith('validation_'),
      'a failed repair must not publish the invalid answer',
    );
  } finally {
    if (previous.mode === undefined) delete process.env.AI_MODE; else process.env.AI_MODE = previous.mode;
    if (previous.key === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previous.key;
    if (previous.model === undefined) delete process.env.AI_FULL_CONTEXT_MODEL; else process.env.AI_FULL_CONTEXT_MODEL = previous.model;
  }
}

void verifyRepairFlow().then(() => console.log('verify-assistant-backend-reliability: ok'));
