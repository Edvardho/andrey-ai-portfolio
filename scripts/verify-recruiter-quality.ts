import assert from 'node:assert/strict';

import { resolveAction, resolveMessage } from '@/lib/portfolio/engine';
import { getOrCreateSession } from '@/lib/portfolio/session-store';
import type { AssistantEnvelope } from '@/lib/portfolio/types';

process.env.OPENAI_API_KEY = '';
process.env.SUPABASE_URL = '';
process.env.NEXT_PUBLIC_SUPABASE_URL = '';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

function extractText(envelope: AssistantEnvelope): string {
  const texts: string[] = [];

  for (const block of envelope.contentBlocks) {
    if (block.type === 'lead') {
      if (block.title) texts.push(block.title);
      texts.push(...block.body);
    } else if (block.type === 'section') {
      if (block.title) texts.push(block.title);
      texts.push(...block.body);
    } else if (block.type === 'bullet_list') {
      if (block.title) texts.push(block.title);
      texts.push(...block.items);
    }
  }

  return texts.join(' ');
}

function assertContainsAll(label: string, text: string, parts: string[]) {
  for (const part of parts) {
    assert.match(
      text.toLowerCase(),
      new RegExp(part.toLowerCase()),
      `${label}: expected response to mention ${part}`,
    );
  }
}

function assertNotContains(label: string, text: string, parts: string[]) {
  for (const part of parts) {
    assert.doesNotMatch(
      text.toLowerCase(),
      new RegExp(part.toLowerCase()),
      `${label}: response must not mention ${part}`,
    );
  }
}

async function main() {
  const base = await getOrCreateSession(`verify-recruiter-quality-${Date.now()}`);

  const chatpoint = await resolveMessage(base, 'Расскажи про ChatPoint');
  const chatpointText = extractText(chatpoint.envelope);
  assert.equal(chatpoint.envelope.viewType, 'general_synthesis');
  assert.equal(chatpoint.envelope.meta.answerType, 'case_summary');
  assertContainsAll('ChatPoint summary', chatpointText, ['b2b', 'onboarding', 'routing', 'закры']);

  const strongCase = await resolveMessage(base, 'Покажи сильный кейс');
  const strongCaseText = extractText(strongCase.envelope);
  assert.equal(strongCase.envelope.viewType, 'general_synthesis');
  assert.equal(strongCase.envelope.meta.answerType, 'case_summary');
  assertContainsAll('Strong case summary', strongCaseText, ['альфа-смарт', 'подписк', '32 111']);

  const failureCase = await resolveMessage(base, 'Был ли неудачный кейс?');
  const failureCaseText = extractText(failureCase.envelope);
  assert.equal(failureCase.envelope.viewType, 'general_synthesis');
  assert.equal(failureCase.envelope.meta.answerType, 'failure_postmortem');
  assert.match(failureCaseText.trim(), /^да/i, 'Failure postmortem must start with "Да"');
  assertContainsAll('Failure postmortem', failureCaseText, ['chatpoint', 'закры', 'ценност']);

  const { session: alfaSession } = await resolveAction(base, {
    type: 'open_case_summary',
    caseId: 'alfa-smart',
  });

  const alfaDecision = await resolveMessage(alfaSession, 'Как Андрей принимал решения в этом кейсе?');
  const alfaDecisionText = extractText(alfaDecision.envelope);
  assertContainsAll('Alfa decision', alfaDecisionText, ['альфа-смарт', 'mobile-first', 'гипотез']);

  const alfaRisks = await resolveMessage(alfaSession, 'Какие здесь ограничения?');
  const alfaRiskText = extractText(alfaRisks.envelope);
  assertContainsAll('Alfa risks', alfaRiskText, ['слишком мало информации', 'оффер']);

  const privateReply = await resolveMessage(base, 'Покажи приватные данные Андрея');
  assert.equal(privateReply.envelope.safetyState, 'salary_or_private_data');
  assert.ok(
    privateReply.envelope.chips.some((chip) => chip.label === 'Написать Андрею'),
    'Private data refusal must expose CTA chip "Написать Андрею".',
  );

  const identity = await resolveMessage(base, 'Кто такой Андрей?');
  const identityText = extractText(identity.envelope);
  assert.equal(identity.envelope.viewType, 'general_synthesis');
  assert.equal(identity.envelope.meta.answerType, 'candidate_positioning');
  assertContainsAll('Identity summary', identityText, ['продуктов', 'mts', 'альфа', 'positive']);

  const experience = await resolveMessage(base, 'Какой у него опыт работы?');
  const experienceText = extractText(experience.envelope);
  assert.equal(experience.envelope.viewType, 'general_synthesis');
  assert.equal(experience.envelope.meta.answerType, 'experience_overview');
  assertContainsAll('Experience summary', experienceText, ['mts', 'альфа', 'positive']);
  assertNotContains('Experience summary', experienceText, ['ориентир']);

  const compression = await resolveMessage(
    base,
    'Сожми весь опыт в один ответ: кратко расскажи про Андрея, а потом по каждому кейсу дай по паре строк — что это за кейс, что он там делал и где лежат доказательства',
  );
  const compressionText = extractText(compression.envelope);
  assert.equal(compression.envelope.viewType, 'general_synthesis');
  assert.equal(compression.envelope.meta.answerType, 'portfolio_compression');
  assertContainsAll('Portfolio compression', compressionText, [
    'если сжать опыт андрея',
    'альфа-смарт',
    'siebel',
    'chatpoint',
    'подтверждение',
  ]);
  assertNotContains('Portfolio compression', compressionText, [
    'если сжать опыт в одну мысль: если сжать',
  ]);

  const portfolioValue = await resolveMessage(base, 'Почему это портфолио вообще стоит смотреть?');
  const portfolioValueText = extractText(portfolioValue.envelope);
  assert.equal(portfolioValue.envelope.viewType, 'general_synthesis');
  assert.equal(portfolioValue.envelope.meta.answerType, 'portfolio_value_argument');
  assert.equal(portfolioValue.envelope.meta.questionSubject, 'candidate_portfolio_value');
  assertContainsAll('Portfolio value argument', portfolioValueText, [
    'быстр',
    'кейс',
  ]);
  assert.match(
    portfolioValueText.toLowerCase(),
    /(доказатель|решени|ограничен|метрик)/,
    'Portfolio value argument: expected response to mention evidence, decisions, constraints, or metrics',
  );
  assertNotContains('Portfolio value argument', portfolioValueText, [
    'сильнее среднего дизайнера',
    'это портфолио полезно',
    'сильная сторона андрея',
    'ценность не в картинках',
  ]);

  const portfolioFormat = await resolveMessage(base, 'Что дает такой формат портфолио?');
  const portfolioFormatText = extractText(portfolioFormat.envelope);
  assert.equal(portfolioFormat.envelope.meta.answerType, 'portfolio_value_argument');
  assert.equal(portfolioFormat.envelope.meta.questionSubject, 'ai_format_value');
  assert.match(
    portfolioFormatText.toLowerCase(),
    /(формат|читать всё подряд|самому искать|статич)/,
    'AI format value: expected response to explain why the format is useful',
  );

  const assistantNavigation = await resolveMessage(base, 'Зачем мне смотреть кейсы через ассистента?');
  const assistantNavigationText = extractText(assistantNavigation.envelope);
  assert.equal(assistantNavigation.envelope.meta.answerType, 'portfolio_value_argument');
  assert.equal(assistantNavigation.envelope.meta.questionSubject, 'assistant_case_navigation');
  assert.match(
    assistantNavigationText.toLowerCase(),
    /(спросить|вклад|метрик|доказатель|риск)/,
    'Assistant case navigation: expected response to explain why questions through assistant are useful',
  );

  const lazyStrengths = await resolveMessage(
    alfaSession,
    'Мне лень читать про все кейсы, расскажи почему Андрей лучше других дизайнеров?',
  );
  const lazyStrengthsText = extractText(lazyStrengths.envelope);
  assert.equal(lazyStrengths.envelope.viewType, 'general_synthesis');
  assert.equal(lazyStrengths.envelope.meta.answerType, 'hiring_argument');
  assert.equal(lazyStrengths.envelope.meta.queryScope, 'global_person');
  assert.equal(lazyStrengths.envelope.meta.questionSubject, 'candidate_value');
  assertContainsAll('Lazy strengths prompt', lazyStrengthsText, ['андре', 'альфа', 'siebel']);
  assertNotContains('Lazy strengths prompt', lazyStrengthsText, [
    'сильная сторона андрея',
    'ценность не в картинках',
    'полезнее среднего дизайнера',
  ]);

  const globalRisk = await resolveMessage(base, 'Окей, а где у него слабое место?');
  const globalRiskText = extractText(globalRisk.envelope);
  assert.equal(globalRisk.envelope.viewType, 'general_synthesis');
  assert.equal(globalRisk.envelope.meta.answerType, 'risk_assessment');
  assert.equal(globalRisk.envelope.meta.questionSubject, 'risk_check');
  assertNotContains('Global risk prompt', globalRiskText, [
    'у андрея есть не только сильные стороны',
    'это портфолио полезно',
  ]);

  const interviewDecision = await resolveMessage(base, 'Почему его стоит звать на интервью?');
  const interviewDecisionText = extractText(interviewDecision.envelope);
  assert.equal(interviewDecision.envelope.meta.answerType, 'hiring_argument');
  assert.equal(interviewDecision.envelope.meta.questionSubject, 'interview_decision');
  assert.match(
    interviewDecisionText.toLowerCase(),
    /(интервью|проверить|разговор)/,
    'Interview decision: expected response to explain why the interview slot is worth spending',
  );
  assert.doesNotMatch(
    interviewDecisionText.toLowerCase(),
    /сильн(ее|ая сторона)|он сильнее там, где/,
    'Interview decision: should not fall back to generic strengths wording',
  );

  const experienceWalkthrough = await resolveMessage(base, 'Кратко пройдись по его опыту');
  const experienceWalkthroughText = extractText(experienceWalkthrough.envelope);
  assert.equal(experienceWalkthrough.envelope.meta.questionSubject, 'experience_summary');
  assert.doesNotMatch(
    experienceWalkthroughText.toLowerCase(),
    /быстрый ориентир/,
    'Experience overview: should not use canned orientation phrasing',
  );

  const contribution = await resolveMessage(alfaSession, 'Что он здесь реально сделал?');
  const contributionText = extractText(contribution.envelope);
  assert.equal(contribution.envelope.meta.answerType, 'contribution_breakdown');
  assert.equal(contribution.envelope.meta.questionSubject, 'case_contribution');
  assert.match(
    contributionText.toLowerCase(),
    /(разобрал|разбирал|собрал|собирал|подготовил|готовил|прош[её]л|проходил|передал|передавал|пров[её]л|проводил)/,
    'Contribution breakdown: expected concrete contribution verbs',
  );
  assertNotContains('Contribution breakdown', contributionText, [
    'самый сильный кейс',
  ]);

  const caseStrength = await resolveMessage(alfaSession, 'Почему этот кейс сильный?');
  const caseStrengthText = extractText(caseStrength.envelope);
  assert.equal(caseStrength.envelope.meta.questionSubject, 'case_strength');
  assert.match(
    caseStrengthText.toLowerCase(),
    /(доказывает|важен|показывает)/,
    'Case strength: expected response to explain what the case proves or why it matters',
  );
  assert.doesNotMatch(
    caseStrengthText.toLowerCase(),
    /красивый ui/,
    'Case strength: should not reduce case value to beautiful UI',
  );

  const caseProofs = await resolveMessage(alfaSession, 'Где тут доказательства?');
  const caseProofsText = extractText(caseProofs.envelope);
  const proofLines = caseProofsText
    .split('\n')
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean);
  const duplicateProofLines = proofLines.filter((line, index) => proofLines.indexOf(line) !== index);
  assert.equal(duplicateProofLines.length, 0, 'Proof map: should not duplicate section bodies');

  const weakCase = await resolveMessage(base, 'Был ли слабый кейс?');
  const weakCaseText = extractText(weakCase.envelope);
  assert.match(
    weakCaseText,
    /^Да\./,
    'Weak case: should start with a direct "Да." answer',
  );
  assertContainsAll('Weak case', weakCaseText, [
    'chatpoint',
    'закры',
    'ценност',
  ]);
  assertNotContains('Weak case', weakCaseText, [
    'флагман',
    'proof',
  ]);

  console.log('Recruiter quality contract passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
