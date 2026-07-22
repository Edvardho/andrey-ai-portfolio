import assert from 'node:assert/strict';

import { resolveAction, resolveMessage } from '@/lib/portfolio/engine';
import { classifyMessageDeterministically, classifyMessageWithModel } from '@/lib/portfolio/intent';
import { interpretQuery } from '@/lib/portfolio/query-interpretation';
import { getOrCreateSession } from '@/lib/portfolio/session-store';
import type {
  AnswerType,
  AssistantSession,
  MessageIntent,
  QuestionSubject,
  QueryScope,
  ResponseLength,
} from '@/lib/portfolio/types';

process.env.OPENAI_API_KEY = '';
process.env.SUPABASE_URL = '';
process.env.NEXT_PUBLIC_SUPABASE_URL = '';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

type Scenario = {
  label: string;
  input: string;
  expectedIntent: MessageIntent['type'];
  expectedScope: QueryScope;
  expectedQuestionSubject: QuestionSubject;
  expectedAnswerType: AnswerType;
  expectedResponseLength?: ResponseLength;
  expectedTargetCaseId?: string | null;
  session: AssistantSession;
};

async function classify(
  session: AssistantSession,
  input: string,
) {
  return (
    classifyMessageDeterministically(input, session)
    ?? await classifyMessageWithModel(input, session)
    ?? { intent: { type: 'ambiguous_question' as const }, confidence: 'low' as const }
  );
}

async function assertScenario(scenario: Scenario) {
  const classification = await classify(scenario.session, scenario.input);
  const interpretation = interpretQuery(scenario.session, scenario.input, classification);

  assert.equal(interpretation.intent.type, scenario.expectedIntent, `${scenario.label}: intent`);
  assert.equal(interpretation.scope, scenario.expectedScope, `${scenario.label}: scope`);
  assert.equal(interpretation.questionSubject, scenario.expectedQuestionSubject, `${scenario.label}: questionSubject`);
  assert.equal(interpretation.answerType, scenario.expectedAnswerType, `${scenario.label}: answerType`);
  if (scenario.expectedResponseLength !== undefined) {
    assert.equal(
      interpretation.responseLength,
      scenario.expectedResponseLength,
      `${scenario.label}: responseLength`,
    );
  }

  if (scenario.expectedTargetCaseId !== undefined) {
    assert.equal(
      interpretation.targetCaseId,
      scenario.expectedTargetCaseId,
      `${scenario.label}: targetCaseId`,
    );
  }

  const { envelope } = await resolveMessage(scenario.session, scenario.input);
  assert.notEqual(envelope.viewType, 'ambiguous_question', `${scenario.label}: must not fall into ambiguous`);
  assert.notEqual(envelope.viewType, 'no_matching_case', `${scenario.label}: must not fall into no-match fallback`);
  assert.notEqual(envelope.viewType, 'unsupported_request', `${scenario.label}: must not fall into unsupported fallback`);
  assert.notEqual(envelope.viewType, 'safety_refusal', `${scenario.label}: must not fall into safety fallback`);
  assert.equal(envelope.meta.answerType, scenario.expectedAnswerType, `${scenario.label}: envelope answerType`);
  assert.equal(envelope.meta.queryScope, scenario.expectedScope, `${scenario.label}: envelope queryScope`);
  assert.equal(envelope.meta.questionSubject, scenario.expectedQuestionSubject, `${scenario.label}: envelope questionSubject`);
}

async function main() {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const baseSession = await getOrCreateSession(`verify-query-interpretation-${suffix}`);

  const allCaseIds = [
    'alfa-smart',
    'siebel',
    'expenses-card-holders',
    'subscription-sharing',
    'chatpoint',
    'ux-ui-wannabelike',
  ];

  const { session: alfaSession } = await resolveAction(baseSession, {
    type: 'open_case_summary',
    caseId: 'alfa-smart',
  });
  const { session: chatpointSession } = await resolveAction(baseSession, {
    type: 'open_case_summary',
    caseId: 'chatpoint',
  });
  const { session: siebelSession } = await resolveAction(baseSession, {
    type: 'open_case_summary',
    caseId: 'siebel',
  });

  const scenarios: Scenario[] = [
    {
      label: 'compact candidate intro is not fast review',
      input: 'Расскажи емко про Андрея',
      expectedIntent: 'identity_intro',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'candidate_value',
      expectedAnswerType: 'candidate_positioning',
      expectedResponseLength: 'compact',
      session: baseSession,
    },
    {
      label: 'candidate fast review case-based',
      input: 'Быстро оценить Андрея по кейсам',
      expectedIntent: 'portfolio_overview',
      expectedScope: 'portfolio_wide',
      expectedQuestionSubject: 'candidate_fast_review',
      expectedAnswerType: 'candidate_fast_review',
      expectedResponseLength: 'default',
      session: baseSession,
    },
    {
      label: 'candidate fast review no time',
      input: 'Нет времени изучать портфолио',
      expectedIntent: 'portfolio_overview',
      expectedScope: 'portfolio_wide',
      expectedQuestionSubject: 'candidate_fast_review',
      expectedAnswerType: 'candidate_fast_review',
      expectedResponseLength: 'default',
      session: baseSession,
    },
    {
      label: 'candidate fast review three minutes',
      input: 'Если у меня есть только 3 минуты, что смотреть?',
      expectedIntent: 'portfolio_overview',
      expectedScope: 'portfolio_wide',
      expectedQuestionSubject: 'candidate_fast_review',
      expectedAnswerType: 'candidate_fast_review',
      expectedResponseLength: 'default',
      session: baseSession,
    },
    {
      label: 'skeptical proof question is evidence, not assistant trust',
      input: 'Если я не верю словам, на что смотреть в кейсах?',
      expectedIntent: 'evidence_request',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'case_evidence',
      expectedAnswerType: 'proof_map',
      session: baseSession,
    },
    {
      label: 'follow-up about Andrey is candidate intro, not assistant fallback',
      input: 'Что еще можешь рассказать об Андрее?',
      expectedIntent: 'identity_intro',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'candidate_value',
      expectedAnswerType: 'candidate_positioning',
      session: baseSession,
    },
    {
      label: 'thinking versus execution question',
      input: 'Где видно, что он думал, а не просто исполнял задачу?',
      expectedIntent: 'decision_process',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'candidate_value',
      expectedAnswerType: 'decision_breakdown',
      session: baseSession,
    },
    {
      label: 'research validation phrased as what he checked',
      input: 'Что Андрей проверял через исследования?',
      expectedIntent: 'decision_process',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'design_process',
      expectedAnswerType: 'decision_breakdown',
      session: baseSession,
    },
    {
      label: 'lazy global strengths',
      input: 'Мне лень читать про все кейсы, расскажи почему Андрей лучше других дизайнеров?',
      expectedIntent: 'strengths_assessment',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'candidate_value',
      expectedAnswerType: 'hiring_argument',
      session: alfaSession,
    },
    {
      label: 'plain candidate quality question is evaluation task',
      input: 'Андрей хороший дизайнер, как ты думаешь?',
      expectedIntent: 'strengths_assessment',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'candidate_value',
      expectedAnswerType: 'hiring_argument',
      session: baseSession,
    },
    {
      label: 'hire without fluff',
      input: 'Без воды: почему его вообще звать на интервью?',
      expectedIntent: 'strengths_assessment',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'interview_decision',
      expectedAnswerType: 'hiring_argument',
      session: baseSession,
    },
    {
      label: 'compressed experience',
      input: 'Сжато расскажи об опыте работы Андрея',
      expectedIntent: 'experience_overview',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'experience_summary',
      expectedAnswerType: 'experience_overview',
      expectedResponseLength: 'compact',
      session: baseSession,
    },
    {
      label: 'walk through experience',
      input: 'Кратко пройдись по его опыту',
      expectedIntent: 'experience_overview',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'experience_summary',
      expectedAnswerType: 'experience_overview',
      expectedResponseLength: 'compact',
      session: baseSession,
    },
    {
      label: 'designer motivation',
      input: 'Нравится ли Андрею работа дизайнером?',
      expectedIntent: 'identity_intro',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'candidate_motivation',
      expectedAnswerType: 'candidate_positioning',
      session: baseSession,
    },
    {
      label: 'web experience',
      input: 'Что делал в web?',
      expectedIntent: 'experience_overview',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'experience_summary',
      expectedAnswerType: 'experience_overview',
      session: baseSession,
    },
    {
      label: 'brief cases',
      input: 'Расскажи кратко о кейсах Андрея',
      expectedIntent: 'portfolio_overview',
      expectedScope: 'portfolio_wide',
      expectedQuestionSubject: 'candidate_portfolio_value',
      expectedAnswerType: 'portfolio_compression',
      session: baseSession,
    },
    {
      label: 'portfolio value why watch',
      input: 'Почему это портфолио вообще стоит смотреть?',
      expectedIntent: 'portfolio_value_request',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'candidate_portfolio_value',
      expectedAnswerType: 'portfolio_value_argument',
      session: baseSession,
    },
    {
      label: 'portfolio value format',
      input: 'Что дает такой формат портфолио?',
      expectedIntent: 'portfolio_value_request',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'ai_format_value',
      expectedAnswerType: 'portfolio_value_argument',
      session: baseSession,
    },
    {
      label: 'portfolio value assistant flow',
      input: 'Зачем мне смотреть кейсы через ассистента?',
      expectedIntent: 'portfolio_value_request',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'assistant_case_navigation',
      expectedAnswerType: 'portfolio_value_argument',
      session: alfaSession,
    },
    {
      label: 'what cases',
      input: 'Если коротко, какие у него вообще кейсы?',
      expectedIntent: 'portfolio_overview',
      expectedScope: 'portfolio_wide',
      expectedQuestionSubject: 'candidate_portfolio_value',
      expectedAnswerType: 'portfolio_compression',
      session: baseSession,
    },
    {
      label: 'current case decisions',
      input: 'В этом кейсе как он принимал решения?',
      expectedIntent: 'decision_process',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_decisions',
      expectedAnswerType: 'decision_breakdown',
      expectedTargetCaseId: 'alfa-smart',
      session: alfaSession,
    },
    {
      label: 'current case real work',
      input: 'Что он здесь реально сделал?',
      expectedIntent: 'case_discovery',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_contribution',
      expectedAnswerType: 'contribution_breakdown',
      expectedTargetCaseId: 'alfa-smart',
      session: alfaSession,
    },
    {
      label: 'why this case strong',
      input: 'Почему этот кейс вообще сильный?',
      expectedIntent: 'strengths_assessment',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_strength',
      expectedAnswerType: 'hiring_argument',
      expectedTargetCaseId: 'alfa-smart',
      session: alfaSession,
    },
    {
      label: 'proofs here',
      input: 'Где тут доказательства?',
      expectedIntent: 'evidence_request',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_evidence',
      expectedAnswerType: 'proof_map',
      expectedTargetCaseId: 'alfa-smart',
      session: alfaSession,
    },
    {
      label: 'weak case',
      input: 'Был ли у него слабый кейс?',
      expectedIntent: 'case_discovery',
      expectedScope: 'named_case',
      expectedQuestionSubject: 'case_summary',
      expectedAnswerType: 'failure_postmortem',
      expectedTargetCaseId: 'chatpoint',
      session: baseSession,
    },
    {
      label: 'chatpoint concise',
      input: 'Расскажи про ChatPoint без воды',
      expectedIntent: 'case_discovery',
      expectedScope: 'named_case',
      expectedQuestionSubject: 'case_summary',
      expectedAnswerType: 'case_summary',
      expectedTargetCaseId: 'chatpoint',
      session: baseSession,
    },
    {
      label: 'hiring lead compare',
      input: 'Если я нанимающий лид, чем он лучше среднего дизайнера?',
      expectedIntent: 'strengths_assessment',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'candidate_value',
      expectedAnswerType: 'hiring_argument',
      session: baseSession,
    },
    {
      label: 'weak spot',
      input: 'Окей, а где у него слабое место?',
      expectedIntent: 'risk_objection',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'risk_check',
      expectedAnswerType: 'risk_assessment',
      session: baseSession,
    },
    {
      label: 'deadline reliability is calibrated globally',
      input: 'Продалбывал ли Андрей дедлайны?',
      expectedIntent: 'behavioral_fit_assessment',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'behavioral_evidence_check',
      expectedAnswerType: 'calibrated_unknown',
      session: alfaSession,
    },
    {
      label: 'execution question is calibrated globally',
      input: 'Исполнительный ли Андрей работник?',
      expectedIntent: 'behavioral_fit_assessment',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'behavioral_evidence_check',
      expectedAnswerType: 'calibrated_unknown',
      session: baseSession,
    },
    {
      label: 'named case deadline question narrows to the case',
      input: 'В Альфа-Смарте он срывал сроки?',
      expectedIntent: 'behavioral_fit_assessment',
      expectedScope: 'named_case',
      expectedQuestionSubject: 'behavioral_evidence_check',
      expectedAnswerType: 'calibrated_unknown',
      expectedTargetCaseId: 'alfa-smart',
      session: baseSession,
    },
    {
      label: 'chatpoint closed',
      input: 'Почему продукт закрыли?',
      expectedIntent: 'risk_objection',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'risk_check',
      expectedAnswerType: 'risk_assessment',
      expectedTargetCaseId: 'chatpoint',
      session: chatpointSession,
    },
    {
      label: 'chatpoint mistake',
      input: 'Какую ошибку совершил Андрей на чат поинте?',
      expectedIntent: 'risk_objection',
      expectedScope: 'named_case',
      expectedQuestionSubject: 'risk_check',
      expectedAnswerType: 'risk_assessment',
      expectedTargetCaseId: 'chatpoint',
      session: baseSession,
    },
    {
      label: 'compact current SIEBEL case summary',
      input: 'Коротко расскажи об этом кейсе',
      expectedIntent: 'case_discovery',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_summary',
      expectedAnswerType: 'case_summary',
      expectedResponseLength: 'compact',
      expectedTargetCaseId: 'siebel',
      session: siebelSession,
    },
    {
      label: 'compact current case research',
      input: 'Емко: как Андрей исследовал проблему?',
      expectedIntent: 'decision_process',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_research',
      expectedAnswerType: 'decision_breakdown',
      expectedResponseLength: 'compact',
      expectedTargetCaseId: 'siebel',
      session: siebelSession,
    },
    {
      label: 'compact current case risk',
      input: 'Коротко: какую ошибку совершили?',
      expectedIntent: 'risk_objection',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'risk_check',
      expectedAnswerType: 'risk_assessment',
      expectedResponseLength: 'compact',
      expectedTargetCaseId: 'chatpoint',
      session: chatpointSession,
    },
    {
      label: 'compact candidate intro stays global inside SIEBEL',
      input: 'Расскажи емко про Андрея',
      expectedIntent: 'identity_intro',
      expectedScope: 'global_person',
      expectedQuestionSubject: 'candidate_value',
      expectedAnswerType: 'candidate_positioning',
      expectedResponseLength: 'compact',
      session: siebelSession,
    },
  ];

  for (const scenario of scenarios) {
    await assertScenario(scenario);
  }

  // These phrases must keep the selected case context for every case, not just
  // the examples that happened to be covered by the product scenarios above.
  for (const caseId of allCaseIds) {
    const { session } = await resolveAction(baseSession, {
      type: 'open_case_summary',
      caseId,
    });

    await assertScenario({
      label: `${caseId}: compact current case summary`,
      input: 'Коротко расскажи об этом кейсе',
      expectedIntent: 'case_discovery',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_summary',
      expectedAnswerType: 'case_summary',
      expectedResponseLength: 'compact',
      expectedTargetCaseId: caseId,
      session,
    });

    await assertScenario({
      label: `${caseId}: compact current case summary reversed wording`,
      input: 'Кратко расскажи об этом кейсе',
      expectedIntent: 'case_discovery',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_summary',
      expectedAnswerType: 'case_summary',
      expectedResponseLength: 'compact',
      expectedTargetCaseId: caseId,
      session,
    });

    await assertScenario({
      label: `${caseId}: compact current case research`,
      input: 'Емко: как Андрей исследовал проблему?',
      expectedIntent: 'decision_process',
      expectedScope: 'current_case_only',
      expectedQuestionSubject: 'case_research',
      expectedAnswerType: 'decision_breakdown',
      expectedResponseLength: 'compact',
      expectedTargetCaseId: caseId,
      session,
    });
  }

  console.log('Query interpretation contract passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
