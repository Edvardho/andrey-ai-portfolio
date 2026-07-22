import assert from 'node:assert/strict';

import { resolveAction, resolveMessage } from '@/lib/portfolio/engine';
import { detectSafetyState } from '@/lib/portfolio/safety';
import { getOrCreateSession } from '@/lib/portfolio/session-store';
import type {
  AnswerType,
  AssistantSession,
  QuestionSubject,
  SynthesisAnswerStatus,
  SynthesisSnapshot,
} from '@/lib/portfolio/types';

process.env.OPENAI_API_KEY = '';
process.env.SUPABASE_URL = '';
process.env.NEXT_PUBLIC_SUPABASE_URL = '';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

type QualityScenario = {
  label: string;
  session: AssistantSession;
  input: string;
  expectedAnswerType: AnswerType;
  expectedQuestionSubject: QuestionSubject;
  expectedStatus?: SynthesisAnswerStatus;
  mustContainAny?: string[];
  mustContainAll?: string[];
  mustNotContain?: string[];
  disallowDuplicateSentences?: boolean;
};

function snapshotText(snapshot: SynthesisSnapshot): string {
  return [
    snapshot.intro,
    ...snapshot.followupParagraphs,
    ...snapshot.sections.flatMap((section) => [section.title, section.body]),
    ...snapshot.bullets,
  ]
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function assertIncludesAny(text: string, needles: string[], label: string) {
  const lowered = text.toLowerCase();
  assert(
    needles.some((needle) => lowered.includes(needle.toLowerCase())),
    `${label}: expected answer to contain one of: ${needles.join(' | ')}\nActual: ${text}`,
  );
}

function assertIncludesAll(text: string, needles: string[], label: string) {
  const lowered = text.toLowerCase();
  for (const needle of needles) {
    assert(
      lowered.includes(needle.toLowerCase()),
      `${label}: expected answer to contain "${needle}"\nActual: ${text}`,
    );
  }
}

function assertExcludes(text: string, needles: string[], label: string) {
  const lowered = text.toLowerCase();
  for (const needle of needles) {
    assert(
      !lowered.includes(needle.toLowerCase()),
      `${label}: answer must not contain "${needle}"\nActual: ${text}`,
    );
  }
}

function assertNoDuplicateSentences(text: string, label: string) {
  const seen = new Set<string>();
  const sentences = text
    .split(/[.!?]\s+|\n+/)
    .map((sentence) => sentence.replace(/\s+/g, ' ').trim().toLowerCase())
    .filter((sentence) => sentence.length > 24);

  for (const sentence of sentences) {
    assert(!seen.has(sentence), `${label}: answer contains duplicated sentence\nSentence: ${sentence}\nActual: ${text}`);
    seen.add(sentence);
  }
}

async function openCase(session: AssistantSession, caseId: string): Promise<AssistantSession> {
  const result = await resolveAction(session, {
    type: 'open_case_summary',
    caseId,
  });
  return result.session;
}

async function assertQualityScenario(scenario: QualityScenario): Promise<AssistantSession> {
  assert.equal(detectSafetyState(scenario.input), null, `${scenario.label}: must not trigger safety`);

  const result = await resolveMessage(scenario.session, scenario.input);
  const snapshot = result.session.lastSynthesis;

  assert(snapshot, `${scenario.label}: expected synthesis snapshot`);
  assert.equal(snapshot.answerType, scenario.expectedAnswerType, `${scenario.label}: answerType`);
  assert.equal(snapshot.questionSubject, scenario.expectedQuestionSubject, `${scenario.label}: questionSubject`);

  if (scenario.expectedStatus) {
    assert.equal(snapshot.answerStatus, scenario.expectedStatus, `${scenario.label}: answerStatus`);
  }

  const text = snapshotText(snapshot);
  assert(!/я могу быстро представить/i.test(text), `${scenario.label}: must not be generic fallback`);
  assert(!/заглуш/i.test(text), `${scenario.label}: must not expose placeholder language`);

  if (scenario.mustContainAny) {
    assertIncludesAny(text, scenario.mustContainAny, scenario.label);
  }
  if (scenario.mustContainAll) {
    assertIncludesAll(text, scenario.mustContainAll, scenario.label);
  }
  if (scenario.mustNotContain) {
    assertExcludes(text, scenario.mustNotContain, scenario.label);
  }
  if (scenario.disallowDuplicateSentences) {
    assertNoDuplicateSentences(text, scenario.label);
  }

  return result.session;
}

async function main() {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const baseSession = await getOrCreateSession(`verify-design-lead-answer-quality-${suffix}`);

  const alfaSession = await openCase(baseSession, 'alfa-smart');
  const siebelSession = await openCase(baseSession, 'siebel');
  const chatpointSession = await openCase(baseSession, 'chatpoint');
  const expensesSession = await openCase(baseSession, 'expenses-card-holders');
  const sharingSession = await openCase(baseSession, 'subscription-sharing');
  const wannabeSession = await openCase(baseSession, 'ux-ui-wannabelike');

  const scenarios: QualityScenario[] = [
    {
      label: 'alfa metrics are concrete',
      session: alfaSession,
      input: 'Какие метрики выросли?',
      expectedAnswerType: 'outcome_summary',
      expectedQuestionSubject: 'case_outcomes',
      expectedStatus: 'grounded',
      mustContainAll: ['32 111', '30%', '1,1 млн'],
    },
    {
      label: 'global metrics answer names concrete proof cases',
      session: baseSession,
      input: 'Какие метрики подтверждают результат?',
      expectedAnswerType: 'outcome_summary',
      expectedQuestionSubject: 'impact_measurement',
      expectedStatus: 'grounded',
      mustContainAll: ['32 111', '900', '580'],
      mustNotContain: ['флагман с метриками'],
    },
    {
      label: 'plain candidate quality is answered through evidence',
      session: baseSession,
      input: 'Андрей хороший дизайнер, как ты думаешь?',
      expectedAnswerType: 'hiring_argument',
      expectedQuestionSubject: 'candidate_value',
      expectedStatus: 'grounded',
      mustContainAll: ['Альфа-Смарт', 'SIEBEL'],
      mustContainAny: ['ChatPoint', 'артефакт', 'метрик', 'доказатель'],
      mustNotContain: ['Я могу быстро представить Андрея'],
    },
    {
      label: 'global hypothesis validation is not ambiguous',
      session: baseSession,
      input: 'Как Андрей обычно проверяет гипотезы?',
      expectedAnswerType: 'decision_breakdown',
      expectedQuestionSubject: 'design_process',
      mustContainAny: ['юзабилити', 'First Click', 'A/B', 'гипотез'],
    },
    {
      label: 'global research validation phrased as what he checked',
      session: baseSession,
      input: 'Что Андрей проверял через исследования?',
      expectedAnswerType: 'decision_breakdown',
      expectedQuestionSubject: 'design_process',
      mustContainAny: ['юзабилити', 'First Click', 'SIEBEL', 'оператор'],
      mustNotContain: ['Я могу быстро представить Андрея'],
    },
    {
      label: 'skeptical proof question answers with artifacts',
      session: baseSession,
      input: 'Если я не верю словам, на что смотреть в кейсах?',
      expectedAnswerType: 'proof_map',
      expectedQuestionSubject: 'case_evidence',
      expectedStatus: 'grounded',
      mustContainAll: ['Правильно, словам верить не нужно', 'user flow', 'дизайн-чек', 'Альфа-Смарте', 'SIEBEL', 'ChatPoint'],
      mustNotContain: ['Я не свободный чат-бот', 'Смотреть это портфолио стоит не из-за', 'Как читать сигнал', 'флагман с метриками'],
    },
    {
      label: 'thinking versus execution question is not fallback',
      session: baseSession,
      input: 'Где видно, что он думал, а не просто исполнял задачу?',
      expectedAnswerType: 'decision_breakdown',
      expectedQuestionSubject: 'candidate_value',
      mustContainAny: ['Альфа-Смарт', 'SIEBEL', 'гипотез', 'сценар'],
      mustNotContain: ['Я могу быстро представить Андрея'],
    },
    {
      label: 'value beyond pretty screens is not ambiguous',
      session: baseSession,
      input: 'Если убрать красивые экраны, что останется?',
      expectedAnswerType: 'hiring_argument',
      expectedQuestionSubject: 'candidate_value',
      expectedStatus: 'grounded',
      mustContainAll: ['Альфа-Смарт', 'SIEBEL'],
      mustContainAny: ['user flow', 'гипотез', 'handoff', 'сценари'],
      mustNotContain: ['Я могу быстро представить Андрея', 'Да, но проверять это лучше не по словам'],
    },
    {
      label: 'alfa problem does not duplicate the intro',
      session: baseSession,
      input: 'Какая была главная проблема в Альфа-Смарте?',
      expectedAnswerType: 'case_summary',
      expectedQuestionSubject: 'case_problem',
      mustContainAny: ['удерживать текущих клиентов', 'подключать близких'],
      disallowDuplicateSentences: true,
    },
    {
      label: 'alfa hypothesis validation is specific',
      session: alfaSession,
      input: 'Как Андрей проверял гипотезы?',
      expectedAnswerType: 'decision_breakdown',
      expectedQuestionSubject: 'case_research',
      mustContainAny: ['юзабилити', 'First Click'],
      mustContainAll: ['гипотез'],
    },
    {
      label: 'alfa personal contribution is not generic case summary',
      session: alfaSession,
      input: 'Что Андрей сделал сам, а не команда?',
      expectedAnswerType: 'contribution_breakdown',
      expectedQuestionSubject: 'case_contribution',
      mustContainAny: ['единственным Product Designer', 'user flow', 'гипотез'],
      mustNotContain: ['самый сильный кейс'],
    },
    {
      label: 'siebel metrics are concrete',
      session: siebelSession,
      input: 'Какие метрики выросли?',
      expectedAnswerType: 'outcome_summary',
      expectedQuestionSubject: 'case_outcomes',
      expectedStatus: 'grounded',
      mustContainAll: ['900', '580', 'вдвое'],
    },
    {
      label: 'siebel research mentions recordings',
      session: siebelSession,
      input: 'Какие исследования были?',
      expectedAnswerType: 'decision_breakdown',
      expectedQuestionSubject: 'case_research',
      mustContainAll: ['12', 'оператор'],
    },
    {
      label: 'siebel redesign question answers with outcomes',
      session: baseSession,
      input: 'Что изменилось в SIEBEL после редизайна?',
      expectedAnswerType: 'outcome_summary',
      expectedQuestionSubject: 'case_outcomes',
      expectedStatus: 'grounded',
      mustContainAll: ['900', '580'],
      mustNotContain: ['SIEBEL — внутренний интерфейс CRM'],
    },
    {
      label: 'chatpoint unsupported feedback is honest',
      session: chatpointSession,
      input: 'Какой результат и feedback получили после запуска/пилота?',
      expectedAnswerType: 'outcome_summary',
      expectedQuestionSubject: 'case_outcomes',
      expectedStatus: 'insufficient_facts',
      mustContainAny: ['не подтверждено', 'нет в фактах'],
      mustContainAll: ['продукт закрыли'],
    },
    {
      label: 'chatpoint mistake names owner/value issue',
      session: chatpointSession,
      input: 'Что было ошибкой?',
      expectedAnswerType: 'risk_assessment',
      expectedQuestionSubject: 'risk_check',
      mustContainAny: ['owner/product owner', 'ценность проверялась слишком поздно', 'функционале'],
    },
    {
      label: 'expenses NPS gap is honest',
      session: expensesSession,
      input: 'Был ли NPS?',
      expectedAnswerType: 'outcome_summary',
      expectedQuestionSubject: 'case_outcomes',
      expectedStatus: 'insufficient_facts',
      mustContainAny: ['не подтверждено', 'нет в фактах'],
      mustNotContain: ['NPS вырос'],
    },
    {
      label: 'expenses testing mentions seven clients',
      session: expensesSession,
      input: 'Как тестировали решение?',
      expectedAnswerType: 'decision_breakdown',
      expectedQuestionSubject: 'case_research',
      mustContainAll: ['7', 'текущих клиентах'],
    },
    {
      label: 'sharing missing metrics is honest',
      session: sharingSession,
      input: 'Какие метрики выросли?',
      expectedAnswerType: 'outcome_summary',
      expectedQuestionSubject: 'case_outcomes',
      expectedStatus: 'insufficient_facts',
      mustContainAny: ['нет подтвержденных метрик', 'не подтверждено'],
      mustNotContain: ['конверсия выросла'],
    },
    {
      label: 'sharing edge cases mention link lifetime',
      session: sharingSession,
      input: 'Какие edge cases были?',
      expectedAnswerType: 'risk_assessment',
      expectedQuestionSubject: 'case_constraints',
      mustContainAny: ['сроку жизни', 'ссылку можно было переслать', 'заканчивались места'],
    },
    {
      label: 'named sharing constraints do not use Alfa-Smart facts',
      session: baseSession,
      input: 'Какие ограничения были в Шаринге подписки?',
      expectedAnswerType: 'risk_assessment',
      expectedQuestionSubject: 'case_constraints',
      mustContainAny: ['сроку жизни', 'ссылку можно было переслать', 'заканчивались места'],
      mustNotContain: ['App Store удалил приложение', 'Что входит в подписку'],
    },
    {
      label: 'wannabelike research mentions interviews',
      session: wannabeSession,
      input: 'Какие исследования были?',
      expectedAnswerType: 'decision_breakdown',
      expectedQuestionSubject: 'case_research',
      mustContainAll: ['8', 'глубинных интервью'],
    },
    {
      label: 'wannabelike metrics gap is honest',
      session: wannabeSession,
      input: 'Какие метрики выросли?',
      expectedAnswerType: 'outcome_summary',
      expectedQuestionSubject: 'case_outcomes',
      expectedStatus: 'insufficient_facts',
      mustContainAny: ['не подтверждено', 'нет в фактах'],
      mustNotContain: ['запустили'],
    },
  ];

  for (const scenario of scenarios) {
    await assertQualityScenario(scenario);
  }

  const chatpointIntroSession = await assertQualityScenario({
    label: 'named ChatPoint summary creates case target',
    session: baseSession,
    input: 'Расскажи про ChatPoint без воды',
    expectedAnswerType: 'case_summary',
    expectedQuestionSubject: 'case_summary',
    mustContainAll: ['ChatPoint', 'B2B'],
  });

  await assertQualityScenario({
    label: 'anaphora keeps previous named case target',
    session: chatpointIntroSession,
    input: 'А какую ошибку он там совершил?',
    expectedAnswerType: 'risk_assessment',
    expectedQuestionSubject: 'risk_check',
    mustContainAny: ['owner/product owner', 'ценность проверялась слишком поздно', 'функционале'],
  });

  await assertQualityScenario({
    label: 'explicit named case beats current UI context',
    session: siebelSession,
    input: 'Какие метрики были в ChatPoint?',
    expectedAnswerType: 'outcome_summary',
    expectedQuestionSubject: 'case_outcomes',
    expectedStatus: 'insufficient_facts',
    mustContainAny: ['не подтверждено', 'нет в фактах'],
  });

  console.log('Design lead answer quality contract passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
