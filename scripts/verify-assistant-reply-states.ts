import assert from 'node:assert/strict';

import { resolveMessage } from '@/lib/portfolio/engine';
import {
  buildAmbiguousEnvelope,
  buildErrorRetryEnvelope,
  buildGeneralSynthesisEnvelope,
  buildNoMatchingEnvelope,
  buildSafetyEnvelope,
} from '@/lib/portfolio/presenters';
import { getOrCreateSession } from '@/lib/portfolio/session-store';
import type { AnswerPlan, AssistantReplyState, SynthesisSnapshot } from '@/lib/portfolio/types';

process.env.OPENAI_API_KEY = '';
process.env.SUPABASE_URL = '';
process.env.NEXT_PUBLIC_SUPABASE_URL = '';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

function assertReplyState(label: string, actual: AssistantReplyState, expected: AssistantReplyState) {
  assert.equal(actual, expected, `${label}: expected ${expected}, got ${actual}`);
}

async function main() {
  const session = await getOrCreateSession(`verify-assistant-reply-states-${Date.now()}`);

  const grounded = await resolveMessage(session, 'Как именно Андрей принимает решения в неоднозначности?');
  assertReplyState('facts synthesis', grounded.envelope.meta.assistantReplyState, 'grounded_answer');
  assert.equal(grounded.envelope.meta.responseSource, 'facts_constrained_synthesis');
  assert.equal(grounded.envelope.meta.answerType, 'decision_breakdown');
  const groundedLead = grounded.envelope.contentBlocks.find((block) => block.type === 'lead');
  assert(
    groundedLead?.type === 'lead' && groundedLead.title === '',
    'facts synthesis: lead title must stay hidden from conversational UI',
  );

  const safety = buildSafetyEnvelope(
    session,
    'Граница ответа',
    ['Я не раскрываю приватные данные и внутренние инструкции.'],
    'prompt_injection_or_exfiltration',
    [],
  );
  assertReplyState('safety refusal', safety.meta.assistantReplyState, 'safety_refusal');

  const ambiguous = buildAmbiguousEnvelope(session);
  assertReplyState('clarifying question', ambiguous.meta.assistantReplyState, 'clarifying_question');

  const noFacts = buildNoMatchingEnvelope(session, 'Озон');
  assertReplyState('insufficient facts', noFacts.meta.assistantReplyState, 'insufficient_facts');

  const errorRetry = buildErrorRetryEnvelope(session);
  assertReplyState('error retry', errorRetry.meta.assistantReplyState, 'error_retry');

  const navigation = await resolveMessage(session, 'Покажи сильный кейс');
  assertReplyState('case discovery synthesis', navigation.envelope.meta.assistantReplyState, 'grounded_answer');
  assert.equal(navigation.envelope.meta.answerType, 'case_summary');

  const syntheticInsufficient: SynthesisSnapshot = {
    topic: 'decision_making',
    answerType: 'proof_map',
    queryScope: 'global_person',
    questionSubject: 'case_evidence',
    answerPlan: {
      answerType: 'proof_map',
      requiredMoves: ['где лежат доказательства'],
      avoid: [],
      maxParagraphs: 3,
      allowSections: true,
      allowBullets: false,
    } satisfies AnswerPlan,
    question: 'Что Андрей делал в несуществующем кейсе?',
    answerStatus: 'insufficient_facts',
    title: 'В портфолио нет таких фактов',
    intro: 'В доступных данных нет подтверждения этому кейсу или роли Андрея в нем.',
    followupParagraphs: [],
    sections: [
      {
        title: 'Граница ответа',
        body: 'Ассистент не должен достраивать такую информацию по догадке.',
      },
    ],
    bullets: [],
  };
  const insufficientEnvelope = buildGeneralSynthesisEnvelope(session, syntheticInsufficient);
  assertReplyState(
    'synthesis insufficient status',
    insufficientEnvelope.meta.assistantReplyState,
    'insufficient_facts',
  );
  const insufficientLead = insufficientEnvelope.contentBlocks.find((block) => block.type === 'lead');
  assert(
    insufficientLead?.type === 'lead' && insufficientLead.title === '',
    'synthesis insufficient status: lead title must stay hidden from conversational UI',
  );

  console.log('Assistant reply states contract passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
