import assert from 'node:assert/strict';

import { resolveAction, resolveMessage } from '@/lib/portfolio/engine';
import { classifyMessageDeterministically, classifyMessageWithModel } from '@/lib/portfolio/intent';
import { interpretQuery } from '@/lib/portfolio/query-interpretation';
import { getOrCreateSession } from '@/lib/portfolio/session-store';
import type { AssistantSession } from '@/lib/portfolio/types';

process.env.OPENAI_API_KEY = '';
process.env.SUPABASE_URL = '';
process.env.NEXT_PUBLIC_SUPABASE_URL = '';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

const CASE_IDS = [
  'alfa-smart',
  'siebel',
  'expenses-card-holders',
  'subscription-sharing',
  'chatpoint',
  'ux-ui-wannabelike',
] as const;
const PORTFOLIO_TARGET_CASE_IDS = ['alfa-smart', 'siebel', 'chatpoint'];

const CASE_SUMMARY_PROMPTS = [
  'Сожми эту информацию и дай вывод',
  'Обобщи кейс',
  'Что здесь главное?',
  'На что тут обратить внимание?',
  'На что стоит обратить внимание?',
  'Дай емкое резюме кейса',
  'Коротко скажи',
  'Ёмко скажи',
  'Расскажи короче',
];

async function classify(session: AssistantSession, input: string) {
  return (
    classifyMessageDeterministically(input, session)
    ?? await classifyMessageWithModel(input, session)
    ?? { intent: { type: 'ambiguous_question' as const }, confidence: 'low' as const }
  );
}

async function assertContextualSummary(
  session: AssistantSession,
  input: string,
  expected: {
    scope: 'current_case_only' | 'named_case' | 'portfolio_wide';
    targetCaseId: string | null;
    subject: 'case_recruiter_summary' | 'portfolio_recruiter_summary';
  },
) {
  const classification = await classify(session, input);
  const interpretation = interpretQuery(session, input, classification);

  assert.equal(interpretation.intent.type, 'contextual_summary_request', `${input}: intent`);
  assert.equal(interpretation.scope, expected.scope, `${input}: scope`);
  assert.equal(interpretation.targetCaseId, expected.targetCaseId, `${input}: target case`);
  assert.equal(interpretation.questionSubject, expected.subject, `${input}: question subject`);
  assert.equal(interpretation.answerType, 'contextual_summary', `${input}: answer type`);

  const { session: nextSession, envelope } = await resolveMessage(session, input);
  assert.equal(envelope.viewType, 'general_synthesis', `${input}: synthesis view`);
  assert.equal(envelope.meta.answerType, 'contextual_summary', `${input}: envelope answer type`);
  assert.equal(envelope.meta.queryScope, expected.scope, `${input}: envelope scope`);
  assert.equal(envelope.meta.questionSubject, expected.subject, `${input}: envelope subject`);
  assert.equal(envelope.meta.assistantReplyState, 'grounded_answer', `${input}: grounded answer`);
  assert.deepEqual(
    nextSession.lastSynthesis?.answerPlan.targetCaseIds ?? [],
    expected.targetCaseId ? [expected.targetCaseId] : PORTFOLIO_TARGET_CASE_IDS,
    `${input}: synthesis may only target the expected facts`,
  );
}

async function main() {
  const baseSession = await getOrCreateSession(`verify-contextual-summary-${Date.now()}`);

  for (const caseId of CASE_IDS) {
    const { session } = await resolveAction(baseSession, { type: 'open_case_summary', caseId });

    for (const input of CASE_SUMMARY_PROMPTS) {
      await assertContextualSummary(session, input, {
        scope: 'current_case_only',
        targetCaseId: caseId,
        subject: 'case_recruiter_summary',
      });
    }
  }

  const { session: alfaSession } = await resolveAction(baseSession, {
    type: 'open_case_summary',
    caseId: 'alfa-smart',
  });

  await assertContextualSummary(alfaSession, 'Обобщи SIEBEL и дай вывод', {
    scope: 'named_case',
    targetCaseId: 'siebel',
    subject: 'case_recruiter_summary',
  });

  await assertContextualSummary(alfaSession, 'Кратко по всем кейсам: какой вывод?', {
    scope: 'portfolio_wide',
    targetCaseId: null,
    subject: 'portfolio_recruiter_summary',
  });

  const { session: expensesSession } = await resolveAction(baseSession, {
    type: 'open_case_summary',
    caseId: 'expenses-card-holders',
  });
  const { session: sessionAfterNamedSiebel } = await resolveMessage(
    expensesSession,
    'Обобщи SIEBEL и дай вывод',
  );
  await assertContextualSummary(sessionAfterNamedSiebel, 'На что стоит обратить внимание?', {
    scope: 'current_case_only',
    targetCaseId: 'expenses-card-holders',
    subject: 'case_recruiter_summary',
  });

  await assertContextualSummary(baseSession, 'Сожми эту информацию и выдай резюме', {
    scope: 'portfolio_wide',
    targetCaseId: null,
    subject: 'portfolio_recruiter_summary',
  });

  for (const proofQuestion of ['Где тут доказательства?', 'Где докозательства?']) {
    const proofClassification = await classify(alfaSession, proofQuestion);
    const proofInterpretation = interpretQuery(alfaSession, proofQuestion, proofClassification);
    assert.equal(proofInterpretation.intent.type, 'evidence_request', 'proof request must keep its precise route');
    assert.equal(proofInterpretation.answerType, 'proof_map', 'proof request must not become a summary');
  }

  const metricsClassification = await classify(alfaSession, 'Сожми: какие метрики получились после запуска?');
  const metricsInterpretation = interpretQuery(
    alfaSession,
    'Сожми: какие метрики получились после запуска?',
    metricsClassification,
  );
  assert.equal(metricsInterpretation.intent.type, 'evidence_request', 'metrics request must keep its precise route');
  assert.equal(metricsInterpretation.answerType, 'outcome_summary', 'metrics request must not become a summary');

  const conflictClassification = await classify(alfaSession, 'Обобщи SIEBEL по всем кейсам');
  const conflictInterpretation = interpretQuery(alfaSession, 'Обобщи SIEBEL по всем кейсам', conflictClassification);
  assert.equal(conflictInterpretation.answerType, null, 'conflicting summary scope must ask for clarification');

  for (const input of ['Коротко скажи', 'Ёмко скажи', 'Расскажи короче']) {
    const bareClassification = await classify(baseSession, input);
    const bareInterpretation = interpretQuery(baseSession, input, bareClassification);
    assert.equal(bareInterpretation.answerType, null, `${input}: bare compact request must remain ambiguous`);
  }

  console.log('Contextual summary contract passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
