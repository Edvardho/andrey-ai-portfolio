import assert from 'node:assert/strict';

import { getEntryPrompts, portfolioContent } from '@/data/portfolio-content.server';
import { getSynthesisTopicConfig } from '@/data/portfolio-facts';
import {
  resolveAction,
  resolveMessage,
} from '@/lib/portfolio/engine';
import {
  classifyMessageDeterministically,
  classifyMessageWithModel,
} from '@/lib/portfolio/intent';
import {
  buildAmbiguousEnvelope,
  buildNoMatchingEnvelope,
  buildUnsupportedEnvelope,
} from '@/lib/portfolio/presenters';
import { getSafetyFallbackChips } from '@/lib/portfolio/safety';
import { getOrCreateSession } from '@/lib/portfolio/session-store';
import type { AssistantSession, PromptChip, SynthesisTopic } from '@/lib/portfolio/types';

const EXPLICIT_ACTION_LABEL = /^(Открыть|Перейти|Смотреть|Связаться|Написать|Короткий ответ|Развернутый ответ)/;

process.env.OPENAI_API_KEY = '';
process.env.SUPABASE_URL = '';
process.env.NEXT_PUBLIC_SUPABASE_URL = '';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

function assertNoHiddenNavigation(label: string, chips: PromptChip[]) {
  for (const chip of chips) {
    if ('action' in chip) {
      assert.match(
        chip.label,
        EXPLICIT_ACTION_LABEL,
        `${label}: chip "${chip.label}" must be explicit navigation/contact, not hidden redirect`,
      );
    }
  }
}

async function assertIntent(input: string, expectedIntent: string) {
  const now = new Date().toISOString();
  const session: AssistantSession = {
    id: 'verify-intent-policy',
    userMessageCount: 0,
    selectedContext: { kind: 'none', id: null, label: null },
    currentView: 'entry',
    answerMode: null,
    openModal: null,
    lastSynthesis: null,
    lastUserQuestion: null,
    lastAssistantAnswerPreview: null,
    lastQuestionSubject: null,
    hasSeenCandidateFastReview: false,
    recentHistory: [],
    createdAt: now,
    updatedAt: now,
  };

  let classification = classifyMessageDeterministically(input, {
    ...session,
  });
  if (!classification) {
    classification = await classifyMessageWithModel(input, {
      ...session,
    });
  }

  assert.ok(classification, `"${input}" must classify to ${expectedIntent}`);
  assert.equal(
    classification.intent.type,
    expectedIntent,
    `"${input}" must classify as ${expectedIntent}, got ${classification?.intent.type}`,
  );
}

function envelopeText(envelope: { contentBlocks: unknown[] }): string {
  return JSON.stringify(envelope.contentBlocks);
}

async function main() {
  await assertIntent('Покажи опыт работы', 'experience_overview');
  await assertIntent('Покажи сильный кейс', 'case_discovery');
  await assertIntent('Расскажи про ChatPoint', 'case_discovery');
  await assertIntent('Что делал в мобилке?', 'mobile_overview');
  await assertIntent('Не верю! Я думаю, что ты не ИИ, а хитро зашаблонированный роутер', 'assistant_intro');
  await assertIntent('Если убрать красивые экраны, что останется?', 'strengths_assessment');
  await assertIntent('Андрей хороший дизайнер, как ты думаешь?', 'strengths_assessment');
  await assertIntent('Открой опыт работы', 'navigation_action');
  await assertIntent('Перейди к ChatPoint', 'navigation_action');

  assertNoHiddenNavigation('entry.quickPrompts', getEntryPrompts());

  for (const [guideKey, guide] of Object.entries(portfolioContent.hiringGuides)) {
    assertNoHiddenNavigation(`hiringGuides.${guideKey}`, guide.chips);
  }

  const synthesisTopics: SynthesisTopic[] = [
    'strengths',
    'decision_making',
    'product_approach',
    'collaboration',
    'fit',
  ];

  for (const topic of synthesisTopics) {
    assertNoHiddenNavigation(`portfolioFacts.${topic}`, getSynthesisTopicConfig(topic).chips);
  }

  const baseSession = await getOrCreateSession(`verify-intent-policy-${Date.now()}`);

  const { envelope: trustEnvelope } = await resolveMessage(
    baseSession,
    'Не верю! Я думаю, что ты не ИИ, а хитро зашаблонированный роутер',
  );
  const trustText = envelopeText(trustEnvelope);
  assert.equal(trustEnvelope.viewType, 'assistant_intro', 'assistant trust challenge must render assistant intro');
  assert.match(trustText, /Честно\? Частично ты прав|подтвержденным фактам/i);
  assert.doesNotMatch(trustText, /Я могу быстро представить Андрея/i);

  assertNoHiddenNavigation('ambiguous fallback', buildAmbiguousEnvelope(baseSession).chips);
  assertNoHiddenNavigation('unsupported fallback', buildUnsupportedEnvelope(baseSession).chips);
  assertNoHiddenNavigation('no matching fallback', buildNoMatchingEnvelope(baseSession, 'Озон').chips);
  assertNoHiddenNavigation('safety fallback', getSafetyFallbackChips());

  const ambiguousText = envelopeText(buildAmbiguousEnvelope(baseSession));
  assert.doesNotMatch(ambiguousText, /Я могу быстро представить Андрея/i);
  assert.match(ambiguousText, /проверяемым направлениям|личный вклад|доказательства/i);

  const unsupportedText = envelopeText(buildUnsupportedEnvelope(baseSession));
  assert.doesNotMatch(unsupportedText, /КВН|Comedy Club|развлекать/i);
  assert.match(unsupportedText, /нет подтвержденных фактов|оценку кандидата/i);

  const noMatchingText = envelopeText(buildNoMatchingEnvelope(baseSession, 'Озон'));
  assert.doesNotMatch(noMatchingText, /не выдумывает кейсы/i);
  assert.match(noMatchingText, /кейса «Озон» в портфолио нет|подтвержденный кейс/i);

  const { session: alfaSession } = await resolveAction(baseSession, {
    type: 'open_case_summary',
    caseId: 'alfa-smart',
  });

  const { session: genericInCaseSession } = await resolveMessage(alfaSession, 'Что ты такое?');
  assert.equal(
    genericInCaseSession.selectedContext.kind,
    'case',
    'generic reply inside case must preserve current case thread',
  );
  assert.equal(
    genericInCaseSession.selectedContext.id,
    'alfa-smart',
    'generic reply inside case must preserve current case id',
  );

  const { session: experienceInCaseSession } = await resolveMessage(alfaSession, 'Покажи опыт работы');
  assert.equal(
    experienceInCaseSession.selectedContext.kind,
    'case',
    'conversational experience reply must stay in current case thread',
  );
  assert.equal(
    experienceInCaseSession.selectedContext.id,
    'alfa-smart',
    'conversational experience reply must not change case id',
  );

  const { session: genericEntrySession } = await resolveMessage(baseSession, 'Что ты такое?');
  assert.equal(
    genericEntrySession.selectedContext.kind,
    'none',
    'generic reply from entry must not fabricate entity context',
  );

  console.log('Intent policy contract passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
