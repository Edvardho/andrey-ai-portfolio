import assert from 'node:assert/strict';

import { resolveAction, resolveMessage } from '@/lib/portfolio/engine';
import { classifyMessageDeterministically, classifyMessageWithModel } from '@/lib/portfolio/intent';
import { interpretQuery } from '@/lib/portfolio/query-interpretation';
import { detectSafetyState } from '@/lib/portfolio/safety';
import { getOrCreateSession } from '@/lib/portfolio/session-store';
import type {
  AnswerType,
  AssistantSession,
  MessageIntent,
  QuestionSubject,
  QueryScope,
} from '@/lib/portfolio/types';

process.env.OPENAI_API_KEY = '';
process.env.SUPABASE_URL = '';
process.env.NEXT_PUBLIC_SUPABASE_URL = '';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

type MatrixScenario = {
  label: string;
  input: string;
  session: AssistantSession;
  expectedIntent: MessageIntent['type'];
  expectedScope: QueryScope;
  expectedQuestionSubject: QuestionSubject;
  expectedAnswerType: AnswerType;
  expectedTargetCaseId?: string | null;
};

async function classify(session: AssistantSession, input: string) {
  return (
    classifyMessageDeterministically(input, session)
    ?? await classifyMessageWithModel(input, session)
    ?? { intent: { type: 'ambiguous_question' as const }, confidence: 'low' as const }
  );
}

async function assertDesignLeadScenario(scenario: MatrixScenario) {
  assert.equal(detectSafetyState(scenario.input), null, `${scenario.label}: must not trigger safety`);

  const classification = await classify(scenario.session, scenario.input);
  const interpretation = interpretQuery(scenario.session, scenario.input, classification);

  assert.equal(interpretation.intent.type, scenario.expectedIntent, `${scenario.label}: intent`);
  assert.equal(interpretation.scope, scenario.expectedScope, `${scenario.label}: scope`);
  assert.equal(
    interpretation.questionSubject,
    scenario.expectedQuestionSubject,
    `${scenario.label}: questionSubject`,
  );
  assert.equal(interpretation.answerType, scenario.expectedAnswerType, `${scenario.label}: answerType`);

  if (scenario.expectedTargetCaseId !== undefined) {
    assert.equal(
      interpretation.targetCaseId,
      scenario.expectedTargetCaseId,
      `${scenario.label}: targetCaseId`,
    );
  }

  const { envelope } = await resolveMessage(scenario.session, scenario.input);
  assert.notEqual(envelope.viewType, 'ambiguous_question', `${scenario.label}: must not fall into ambiguous`);
  assert.notEqual(envelope.viewType, 'safety_refusal', `${scenario.label}: must not be safety refusal`);
  assert.equal(envelope.meta.answerType, scenario.expectedAnswerType, `${scenario.label}: envelope answerType`);
  assert.equal(
    envelope.meta.questionSubject,
    scenario.expectedQuestionSubject,
    `${scenario.label}: envelope questionSubject`,
  );
}

async function main() {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const baseSession = await getOrCreateSession(`verify-design-lead-${suffix}`);
  const { session: alfaSession } = await resolveAction(baseSession, {
    type: 'open_case_summary',
    caseId: 'alfa-smart',
  });
  const { session: siebelSession } = await resolveAction(baseSession, {
    type: 'open_case_summary',
    caseId: 'siebel',
  });
  const { session: chatpointSession } = await resolveAction(baseSession, {
    type: 'open_case_summary',
    caseId: 'chatpoint',
  });
  const { session: expensesSession } = await resolveAction(baseSession, {
    type: 'open_case_summary',
    caseId: 'expenses-card-holders',
  });
  const { session: sharingSession } = await resolveAction(baseSession, {
    type: 'open_case_summary',
    caseId: 'subscription-sharing',
  });
  const { session: wannabeSession } = await resolveAction(baseSession, {
    type: 'open_case_summary',
    caseId: 'ux-ui-wannabelike',
  });

  assert.notEqual(detectSafetyState('Ты тупой?'), null, 'toxic word must still trigger safety');
  assert.equal(
    detectSafetyState('Какие права доступа вы проектировали?'),
    null,
    'access rights question must not trigger toxic safety',
  );
  assert.equal(
    detectSafetyState('Как проектировали управление доступом?'),
    null,
    'access management question must not trigger toxic safety',
  );
  assert.equal(
    detectSafetyState('С какими edge-кейсами и ограничениями столкнулись?'),
    null,
    'edge cases question must not trigger safety',
  );
  assert.equal(
    detectSafetyState('Что было с доступом у разных ролей?'),
    null,
    'plain access question must not trigger safety',
  );

  const scenarios: MatrixScenario[] = [
    {
      label: 'global design process',
      input: 'Опишите ваш типичный дизайн-процесс от получения задачи до handoff.',
      session: baseSession,
      expectedIntent: 'decision_process',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'design_process',
      expectedAnswerType: 'decision_breakdown',
    },
    {
      label: 'global collaboration with PM and developers',
      input: 'Как вы обычно работаете с Product Manager и разработчиками?',
      session: baseSession,
      expectedIntent: 'decision_process',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'collaboration_process',
      expectedAnswerType: 'decision_breakdown',
    },
    {
      label: 'global stakeholder feedback',
      input: 'Как вы получаете и обрабатываете обратную связь от стейкхолдеров?',
      session: baseSession,
      expectedIntent: 'decision_process',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'stakeholder_feedback',
      expectedAnswerType: 'decision_breakdown',
    },
    {
      label: 'global prioritization',
      input: 'Как вы приоритизируете задачи и фичи в условиях ограниченных ресурсов?',
      session: baseSession,
      expectedIntent: 'decision_process',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'prioritization',
      expectedAnswerType: 'decision_breakdown',
    },
    {
      label: 'global impact measurement',
      input: 'Как вы измеряете влияние своей работы на продукт и бизнес?',
      session: baseSession,
      expectedIntent: 'decision_process',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'impact_measurement',
      expectedAnswerType: 'outcome_summary',
    },
    {
      label: 'global design system work',
      input: 'Как вы работаете с дизайн-системами и компонентами?',
      session: baseSession,
      expectedIntent: 'experience_overview',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'design_system_work',
      expectedAnswerType: 'experience_overview',
    },
    {
      label: 'alfa problem by named case',
      input: 'Какая была основная проблема, которую решала семейная подписка Альфа-Смарт?',
      session: baseSession,
      expectedIntent: 'case_discovery',
      expectedScope: 'named_case',
      expectedQuestionSubject: 'case_problem',
      expectedAnswerType: 'case_summary',
      expectedTargetCaseId: 'alfa-smart',
    },
    {
      label: 'alfa personal role',
      input: 'Какая была ваша роль в этом проекте? Что именно вы делали?',
      session: alfaSession,
      expectedIntent: 'case_discovery',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_contribution',
      expectedAnswerType: 'contribution_breakdown',
      expectedTargetCaseId: 'alfa-smart',
    },
    {
      label: 'alfa research',
      input: 'Как вы исследовали потребности семей и pain points родителей/детей?',
      session: alfaSession,
      expectedIntent: 'decision_process',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_research',
      expectedAnswerType: 'decision_breakdown',
      expectedTargetCaseId: 'alfa-smart',
    },
    {
      label: 'alfa mechanics and access rights',
      input: 'Какие ключевые решения вы приняли по механике подписки, ролям и правам доступа?',
      session: alfaSession,
      expectedIntent: 'decision_process',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_decisions',
      expectedAnswerType: 'decision_breakdown',
      expectedTargetCaseId: 'alfa-smart',
    },
    {
      label: 'alfa compliance constraints',
      input: 'С какими compliance и техническими ограничениями столкнулись?',
      session: alfaSession,
      expectedIntent: 'risk_objection',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_constraints',
      expectedAnswerType: 'risk_assessment',
      expectedTargetCaseId: 'alfa-smart',
    },
    {
      label: 'alfa launch outcomes',
      input: 'Какой результат получился после запуска?',
      session: alfaSession,
      expectedIntent: 'evidence_request',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_outcomes',
      expectedAnswerType: 'outcome_summary',
      expectedTargetCaseId: 'alfa-smart',
    },
    {
      label: 'siebel operator research',
      input: 'Как вы изучали текущие рабочие процессы операторов?',
      session: siebelSession,
      expectedIntent: 'decision_process',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_research',
      expectedAnswerType: 'decision_breakdown',
      expectedTargetCaseId: 'siebel',
    },
    {
      label: 'siebel speed and errors tradeoff',
      input: 'Как вы балансировали между скоростью работы оператора и снижением количества ошибок?',
      session: siebelSession,
      expectedIntent: 'decision_process',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_decisions',
      expectedAnswerType: 'decision_breakdown',
      expectedTargetCaseId: 'siebel',
    },
    {
      label: 'chatpoint user roles',
      input: 'Как учитывали разные роли пользователей в ChatPoint?',
      session: chatpointSession,
      expectedIntent: 'decision_process',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_decisions',
      expectedAnswerType: 'decision_breakdown',
      expectedTargetCaseId: 'chatpoint',
    },
    {
      label: 'chatpoint launch feedback',
      input: 'Какой результат и feedback получили после запуска/пилота?',
      session: chatpointSession,
      expectedIntent: 'evidence_request',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_outcomes',
      expectedAnswerType: 'outcome_summary',
      expectedTargetCaseId: 'chatpoint',
    },
    {
      label: 'sharing link flow',
      input: 'Как вы проектировали flow шаринга ссылки?',
      session: sharingSession,
      expectedIntent: 'decision_process',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_decisions',
      expectedAnswerType: 'decision_breakdown',
      expectedTargetCaseId: 'subscription-sharing',
    },
    {
      label: 'sharing edge cases',
      input: 'Какие edge cases были со ссылкой и приглашением?',
      session: sharingSession,
      expectedIntent: 'risk_objection',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_constraints',
      expectedAnswerType: 'risk_assessment',
      expectedTargetCaseId: 'subscription-sharing',
    },
    {
      label: 'sharing missing metrics',
      input: 'Какие метрики выросли?',
      session: sharingSession,
      expectedIntent: 'evidence_request',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_outcomes',
      expectedAnswerType: 'outcome_summary',
      expectedTargetCaseId: 'subscription-sharing',
    },
    {
      label: 'expenses testing',
      input: 'Как тестировали решение?',
      session: expensesSession,
      expectedIntent: 'decision_process',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_research',
      expectedAnswerType: 'decision_breakdown',
      expectedTargetCaseId: 'expenses-card-holders',
    },
    {
      label: 'expenses post-launch NPS',
      input: 'Был ли NPS?',
      session: expensesSession,
      expectedIntent: 'evidence_request',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_outcomes',
      expectedAnswerType: 'outcome_summary',
      expectedTargetCaseId: 'expenses-card-holders',
    },
    {
      label: 'wannabelike research',
      input: 'Какие исследования были?',
      session: wannabeSession,
      expectedIntent: 'decision_process',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_research',
      expectedAnswerType: 'decision_breakdown',
      expectedTargetCaseId: 'ux-ui-wannabelike',
    },
    {
      label: 'wannabelike no product metrics',
      input: 'Какие метрики выросли?',
      session: wannabeSession,
      expectedIntent: 'evidence_request',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_outcomes',
      expectedAnswerType: 'outcome_summary',
      expectedTargetCaseId: 'ux-ui-wannabelike',
    },
    {
      label: 'explicit named case beats current context',
      input: 'Какие метрики были в ChatPoint?',
      session: siebelSession,
      expectedIntent: 'evidence_request',
      expectedScope: 'named_case',
      expectedQuestionSubject: 'case_outcomes',
      expectedAnswerType: 'outcome_summary',
      expectedTargetCaseId: 'chatpoint',
    },
  ];

  for (const scenario of scenarios) {
    await assertDesignLeadScenario(scenario);
  }

  const { session: afterChatPointSummary } = await resolveMessage(baseSession, 'Расскажи про ChatPoint без воды');
  await assertDesignLeadScenario({
    label: 'anaphora after named case summary',
    input: 'А какую ошибку он там совершил?',
    session: afterChatPointSummary,
    expectedIntent: 'risk_objection',
    expectedScope: 'named_case',
    expectedQuestionSubject: 'risk_check',
    expectedAnswerType: 'risk_assessment',
    expectedTargetCaseId: 'chatpoint',
  });

  console.log('Design lead question coverage contract passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
