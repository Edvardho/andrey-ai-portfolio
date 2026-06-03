import { Output, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

import { getOpenAIKey, getOpenAIModel } from '@/lib/portfolio/config';
import type { AssistantSession, UIAction } from '@/lib/portfolio/types';

export type MessageIntent =
  | { type: 'navigation_action'; action: UIAction }
  | { type: 'assistant_intro' }
  | { type: 'identity_intro' }
  | { type: 'experience_overview' }
  | { type: 'case_discovery'; targetCaseId?: string }
  | { type: 'mobile_overview' }
  | { type: 'strengths_assessment' }
  | { type: 'role_fit_assessment' }
  | { type: 'decision_process' }
  | { type: 'evidence_request' }
  | { type: 'risk_objection' }
  | { type: 'missing_case_request'; requestedCase?: string }
  | { type: 'ambiguous_question' }
  | { type: 'unsupported_request' };

export type IntentConfidence = 'high' | 'medium' | 'low';

export type IntentClassification = {
  intent: MessageIntent;
  confidence: IntentConfidence;
};

const caseAliases: Array<{ caseId: string; patterns: RegExp[] }> = [
  {
    caseId: 'alfa-smart',
    patterns: [
      /альфа/i,
      /смарт/i,
      /флагман/i,
      /сильн(ый|ого|ом|ые|ых)?.+кейс/i,
      /сам(ый|ого|ом)?.+сильн(ый|ого|ом)?.+кейс/i,
      /подписк/i,
    ],
  },
  { caseId: 'siebel', patterns: [/siebel/i, /оператор/i, /мтс/i] },
  { caseId: 'chatpoint', patterns: [/chatpoint/i, /чатпойнт/i, /anti-case/i] },
  { caseId: 'expenses-card-holders', patterns: [/держател/i, /расход/i, /истори/i] },
  { caseId: 'subscription-sharing', patterns: [/шаринг/i, /подписк.+ссыл/i, /приглаш/i] },
  { caseId: 'ux-ui-wannabelike', patterns: [/wannabelike/i, /superapp/i, /миш/i, /структур/i, /ux\/ui/i] },
];

const mobileCaseIds = new Set(['expenses-card-holders', 'subscription-sharing', 'ux-ui-wannabelike', 'alfa-smart']);

function hasExplicitNavigationVerb(text: string): boolean {
  return /(?:^|[\s.,!?;:()«»"'/-])(открой|перейди|смотри|смотреть|разверни|отведи|переключи)(?=$|[\s.,!?;:()«»"'/-])/i.test(
    text,
  );
}

function findCaseId(text: string): string | null {
  const lowered = text.toLowerCase();

  for (const alias of caseAliases) {
    if (alias.patterns.some((pattern) => pattern.test(lowered))) {
      return alias.caseId;
    }
  }

  return null;
}

function normalizeRequestedCase(raw: string | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }

  return raw
    .replace(/^[«"'\s]+|[»"'?.!,\s]+$/g, '')
    .replace(/^(про|о|по)\s+/i, '')
    .trim();
}

function extractExplicitCaseRequest(text: string): string | undefined {
  const trimmed = text.trim();
  const explicitRequest = /(покажи|расскажи|открой|есть ли|дай|был(?:\s+ли)?)/i.test(trimmed);
  const caseWord = /(кейс|case|проект)/i.test(trimmed);

  if (!explicitRequest || !caseWord) {
    return undefined;
  }

  const match = trimmed.match(/(?:кейс|case|проект)(?:\s+про|\s+о|\s+по)?\s+(.+)/i);
  if (match?.[1]) {
    return normalizeRequestedCase(match[1]);
  }

  return undefined;
}

function buildNavigationAction(
  action: string,
  caseId?: string,
  source?: string,
): UIAction | null {
  switch (action) {
    case 'open_entry':
      return { type: 'open_entry' };
    case 'open_case_summary':
      return caseId ? { type: 'open_case_summary', caseId } : null;
    case 'open_case_detail':
      return caseId ? { type: 'open_case_detail', caseId } : null;
    case 'open_case_route':
      return caseId ? { type: 'open_case_route', caseId } : null;
    case 'open_experience_summary':
      return { type: 'open_experience_summary' };
    case 'open_experience_detail':
      return { type: 'open_experience_detail' };
    case 'open_experience_route':
      return caseId ? { type: 'open_experience_route', caseId } : null;
    case 'open_mobile_experience_overview':
      return { type: 'open_mobile_experience_overview' };
    case 'open_mobile_case_summary':
      return caseId ? { type: 'open_mobile_case_summary', caseId } : null;
    case 'open_mobile_case_detail':
      return caseId ? { type: 'open_mobile_case_detail', caseId } : null;
    case 'open_additional_cases_overview':
      return { type: 'open_additional_cases_overview' };
    case 'open_contact_modal':
      return { type: 'open_contact_modal', source: source || 'message' };
    default:
      return null;
  }
}

function classifyMessageWithFallbackHeuristics(text: string): IntentClassification | null {
  const lowered = text.trim().toLowerCase();

  if (!lowered) {
    return null;
  }

  if (
    /(?:а\s+)?ты.*кто|кто\s+ты(?:\s+такой)?|ну\s+ты\s+кто|что ты умеешь|что ты можешь|чем ты полезен|ты мне чем полезен|что умеет ассистент|что это за ассистент|что ты тут делаешь|ты зачем нужен|зачем ты тут/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'assistant_intro' }, confidence: 'high' };
  }

  if (/расскажи о себе|представься|кратко о себе/i.test(lowered)) {
    return { intent: { type: 'assistant_intro' }, confidence: 'medium' };
  }

  if (
    /кто такой андрей|что это за кандидат|что за кандидат|расскажи про андрея|представ(ь|ьте).+андре|ну и кто такой андрей|что за чел|это вообще кто|короче кто он|что он за тип как спец/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'identity_intro' }, confidence: 'high' };
  }

  if (
    /какой опыт работы|где он работал|с какими доменами работал|какие компании|где он успел поработать|что у него по опыту|в каких темах он вообще варился|по доменам что у него|что у него по карьере|какой у него бэкграунд/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'experience_overview' }, confidence: 'high' };
  }

  if (
    /что делал в мобилк|что он делал в мобилк|делал мобильн|есть мобильн(ый|ые) кейс|мобильн(ый|ые) кейс|mobile/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'mobile_overview' }, confidence: 'high' };
  }

  if (
    /покажи сильный кейс|самый сильный кейс|сильный кейс|расскажи про chatpoint|расскажи про альфа|расскажи про siebel|есть b2b кейс|есть финтех кейс|расскажи про кейс/i.test(
      lowered,
    )
  ) {
    return {
      intent: { type: 'case_discovery', targetCaseId: findCaseId(lowered) ?? 'alfa-smart' },
      confidence: 'high',
    };
  }

  if (
    /почему его стоит позвать|почему его стоит звать|почему звать на интервью|в чем его сильная сторона|сильные стороны|и в чем он реально хорош|почему мне его дальше тащить|что в нем цепляет как в кандидате|окей а где сильный сигнал|что в нем сильного|почему мне вообще тратить на него слот|с чего ты взял что его надо звать|почему его не отсеять после первого скрининга|звать его или нет/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'strengths_assessment' }, confidence: 'high' };
  }

  if (
    /на какой он уровень|на какие роли он подойдет|senior|middle|lead|куда его лучше приземлять|на какую роль он норм|где здесь senior сигнал|продуктов[а-яa-z-]*\s+позвоноч[а-яa-z-]*|какой у него потолок по роли|на какую команду он лучше зайдет/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'role_fit_assessment' }, confidence: 'high' };
  }

  if (
    /как он принимает решения|как он вообще решения принимает|как валидирует|как исследует|продуктовый подход|product thinking|он продуктом думает|пиксели красит|что у него с research|как он проверяет что не ерунду сделал|что у него есть кроме аккуратного ui|он умеет не только рисовать/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'decision_process' }, confidence: 'high' };
  }

  if (
    /где это подтверждается|где это видно|чем это доказывается|артефакт|доказательств|окей а пруфы где|на чем выводы основаны|чем это вообще подтверждается|где видно что это не слова|где видно что он влияет на продукт|какой кейс лучше открыть первым для оценки|на чем вообще основан вывод про senior|какой кейс лучше всего показывает мозги|где смотреть если мне важен research/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'evidence_request' }, confidence: 'high' };
  }

  if (
    /какие у него слабые стороны|какие есть риски|ограничения|anti-case|неудачи|а где у него слабое место|что тут смущает|а риск какой если брать|в чем он может просесть|что меня должно смутить как нанимающего|где он может не вывезти|какой риск если дать ему сложный b2b|есть ощущение что он больше про execution|если сравнивать с сильным senior.*где у него зазор|куда его опасно сажать/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'risk_objection' }, confidence: 'high' };
  }

  if (
    /что думаешь|биткоин|биток|битка|крипт|нефть|погода|новости|политика|сериал|кино/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'unsupported_request' }, confidence: 'high' };
  }

  if (/расскажи подробнее|интересно|подробней|а дальше/i.test(lowered)) {
    return { intent: { type: 'ambiguous_question' }, confidence: 'low' };
  }

  return null;
}

export function classifyMessageDeterministically(
  text: string,
  session: AssistantSession,
): IntentClassification | null {
  const lowered = text.trim().toLowerCase();

  if (!lowered) {
    return null;
  }

  if (/контакт|связа|написа/i.test(lowered)) {
    return {
      intent: { type: 'navigation_action', action: { type: 'open_contact_modal', source: 'message' } },
      confidence: 'high',
    };
  }

  const explicitNavigation = hasExplicitNavigationVerb(lowered);

  if (explicitNavigation && /(мобил|mobile)/i.test(lowered)) {
    const caseId = findCaseId(lowered);
    if (caseId && mobileCaseIds.has(caseId)) {
      return {
        intent: { type: 'navigation_action', action: { type: 'open_mobile_case_summary', caseId } },
        confidence: 'high',
      };
    }

    return {
      intent: { type: 'navigation_action', action: { type: 'open_mobile_experience_overview' } },
      confidence: 'high',
    };
  }

  if (
    explicitNavigation &&
    /(что еще делал|еще кейсы|дополнительн(ые|ый)? кейс|кроме флагман|есть что-то кроме флагмана)/i.test(
      lowered,
    )
  ) {
    return {
      intent: { type: 'navigation_action', action: { type: 'open_additional_cases_overview' } },
      confidence: 'high',
    };
  }

  if (explicitNavigation && /(опыт работы|career|компани|домены)/i.test(lowered)) {
    return {
      intent: { type: 'navigation_action', action: { type: 'open_experience_summary' } },
      confidence: 'high',
    };
  }

  const caseId = findCaseId(lowered);
  if (caseId && explicitNavigation) {
    if (/подробн|длинн|детал/i.test(lowered)) {
      if (session.selectedContext.kind === 'experience') {
        return {
          intent: { type: 'navigation_action', action: { type: 'open_experience_route', caseId } },
          confidence: 'high',
        };
      }

      return {
        intent: { type: 'navigation_action', action: { type: 'open_case_detail', caseId } },
        confidence: 'high',
      };
    }

    if (/маршрут|почему этот кейс|стоит открыть|что это доказывает/i.test(lowered)) {
      if (session.selectedContext.kind === 'experience') {
        return {
          intent: { type: 'navigation_action', action: { type: 'open_experience_route', caseId } },
          confidence: 'high',
        };
      }

      return {
        intent: { type: 'navigation_action', action: { type: 'open_case_route', caseId } },
        confidence: 'high',
      };
    }

    return {
      intent: { type: 'navigation_action', action: { type: 'open_case_summary', caseId } },
      confidence: 'high',
    };
  }

  if (/(опыт работы|career|компани|домены)/i.test(lowered)) {
    return { intent: { type: 'experience_overview' }, confidence: 'high' };
  }

  if (/(мобил|mobile)/i.test(lowered)) {
    return { intent: { type: 'mobile_overview' }, confidence: 'high' };
  }

  if (
    caseId &&
    /(покажи|расскажи|какой|какие|что|есть|нужен|хочу|интересует|сильн(ый|ого|ом)? кейс)/i.test(
      lowered,
    )
  ) {
    return {
      intent: { type: 'case_discovery', targetCaseId: caseId },
      confidence: 'high',
    };
  }

  if (
    /(покажи сильный кейс|какой сильный кейс|самый сильный кейс|есть b2b кейс|есть финтех кейс|расскажи про кейс)/i.test(
      lowered,
    )
  ) {
    return {
      intent: { type: 'case_discovery', targetCaseId: 'alfa-smart' },
      confidence: 'high',
    };
  }

  const requestedCase = extractExplicitCaseRequest(text);
  if (requestedCase) {
    return {
      intent: { type: 'missing_case_request', requestedCase },
      confidence: 'high',
    };
  }

  return null;
}

const classifierActionSchema = z.enum([
  'open_entry',
  'open_case_summary',
  'open_case_detail',
  'open_case_route',
  'open_experience_summary',
  'open_experience_detail',
  'open_experience_route',
  'open_mobile_experience_overview',
  'open_mobile_case_summary',
  'open_mobile_case_detail',
  'open_additional_cases_overview',
  'open_contact_modal',
]);

const classificationSchema = z.object({
  intent: z.enum([
    'navigation_action',
    'assistant_intro',
    'identity_intro',
    'experience_overview',
    'case_discovery',
    'mobile_overview',
    'strengths_assessment',
    'role_fit_assessment',
    'decision_process',
    'evidence_request',
    'risk_objection',
    'missing_case_request',
    'ambiguous_question',
    'unsupported_request',
  ]),
  confidence: z.enum(['high', 'medium', 'low']),
  action: classifierActionSchema.optional(),
  caseId: z.string().optional(),
  requestedCase: z.string().optional(),
  source: z.string().optional(),
});

const CLASSIFIER_PROMPT = `
Ты классифицируешь сообщения для AI portfolio assistant про Андрея Макаревича.
Главный пользователь — hiring lead, который решает, звать ли Андрея на интервью.
Нельзя выдумывать кейсы, факты, роли, достижения и отсутствующие caseId.

Разрешенные известные caseId:
- alfa-smart
- siebel
- chatpoint
- expenses-card-holders
- subscription-sharing
- ux-ui-wannabelike

Твоя задача — вернуть ровно один intent:
- navigation_action
- assistant_intro
- identity_intro
- experience_overview
- case_discovery
- mobile_overview
- strengths_assessment
- role_fit_assessment
- decision_process
- evidence_request
- risk_objection
- missing_case_request
- ambiguous_question
- unsupported_request

Правила:
- Если пользователь явно хочет открыть или перейти к известному кейсу, опыту, breadth или контакту -> navigation_action.
- Если пользователь спрашивает, кто такой сам ассистент, что он умеет, чем полезен -> assistant_intro.
- Если пользователь спрашивает, кто такой Андрей, что это за кандидат, просит кратко представить -> identity_intro.
- Если пользователь спрашивает про опыт, компании, домены -> experience_overview.
- Если пользователь просит показать или рассказать про кейс, но не просит явно перейти на экран -> case_discovery.
- Если пользователь спрашивает про мобильный опыт или мобильные кейсы без явного перехода -> mobile_overview.
- Если пользователь спрашивает про сильные стороны или почему стоит звать на интервью -> strengths_assessment.
- Если пользователь спрашивает про уровень, seniority или fit для роли -> role_fit_assessment.
- Если пользователь спрашивает, как Андрей принимает решения, исследует или валидирует -> decision_process.
- Если пользователь просит доказательства, подтверждения, артефакты или спрашивает, где это видно -> evidence_request.
- Если пользователь спрашивает про слабые стороны, ограничения, риски -> risk_objection.
- Если пользователь просит конкретный кейс, которого нет в известном списке -> missing_case_request.
- Если вопрос вне границ портфолио, требует внешнего мнения, world knowledge или не относится к оценке кандидата -> unsupported_request.
- ambiguous_question только если запрос невозможно уверенно отнести ни к одному из классов выше.

Confidence:
- high: смысл запроса ясен, intent очевиден, риск ошибочного роутинга низкий.
- medium: intent наиболее вероятен, но формулировка общая или допускает альтернативное чтение.
- low: intent нельзя уверенно определить без догадки; в этом случае лучше ambiguous_question или осторожный fallback.

Примеры:
- "Кто ты такой?" -> assistant_intro, high
- "Расскажи о себе" -> assistant_intro, medium
- "ну ты кто" -> assistant_intro, high
- "Кто такой Андрей?" -> identity_intro, high
- "Что это за кандидат?" -> identity_intro, medium
- "что за кандидат" -> identity_intro, medium
- "где он успел поработать" -> experience_overview, high
- "Покажи опыт работы" -> experience_overview, high
- "Покажи сильный кейс" -> case_discovery, high
- "Расскажи про ChatPoint" -> case_discovery, high, caseId=chatpoint
- "Что делал в мобилке?" -> mobile_overview, high
- "Открой опыт работы" -> navigation_action, high, action=open_experience_summary
- "Перейди к ChatPoint" -> navigation_action, high, action=open_case_summary, caseId=chatpoint
- "Почему его стоит позвать?" -> strengths_assessment, high
- "почему мне вообще тратить на него слот?" -> strengths_assessment, high
- "с чего ты взял что его надо звать?" -> strengths_assessment, high
- "он вообще на senior тянет?" -> role_fit_assessment, high
- "где здесь senior сигнал?" -> role_fit_assessment, high
- "если мне нужен человек с продуктовым позвоночником, это про него?" -> role_fit_assessment, high
- "он продуктом думает или только пиксели красит" -> decision_process, high
- "что у него есть кроме аккуратного ui?" -> decision_process, high
- "окей а пруфы где" -> evidence_request, high
- "где видно что он влияет на продукт?" -> evidence_request, high
- "какой кейс лучше открыть первым для оценки?" -> evidence_request, high
- "а риск какой если брать" -> risk_objection, high
- "что меня должно смутить как нанимающего?" -> risk_objection, high
- "где он может не вывезти?" -> risk_objection, high
- "что думаешь про нефть" -> unsupported_request, high
- "Расскажи подробнее" -> ambiguous_question, low

Если выбираешь navigation_action:
- укажи action
- если action про кейс, укажи caseId
- source используй только для open_contact_modal
- navigation_action допустим только при явных навигационных глаголах: "открой", "перейди", "смотреть", "разверни", "переключи".
- Запросы с "покажи", "расскажи", "какие", "что" сами по себе не являются navigation_action.

Текущий выбранный контекст: {currentContext}
Последнее сообщение пользователя: {message}
`;

export async function classifyMessageWithModel(
  text: string,
  session: AssistantSession,
): Promise<IntentClassification | null> {
  if (!getOpenAIKey()) {
    return classifyMessageWithFallbackHeuristics(text);
  }

  const prompt = CLASSIFIER_PROMPT.replace(
    '{currentContext}',
    session.selectedContext.label ?? 'none',
  ).replace('{message}', text);

  try {
    const { output } = await generateText({
      model: openai(getOpenAIModel()),
      temperature: 0,
      output: Output.object({ schema: classificationSchema }),
      prompt,
    });

    switch (output.intent) {
      case 'navigation_action': {
        if (!output.action) {
          return null;
        }

        const action = buildNavigationAction(output.action, output.caseId, output.source);
        return action
          ? { intent: { type: 'navigation_action', action }, confidence: output.confidence }
          : null;
      }
      case 'assistant_intro':
      case 'identity_intro':
      case 'experience_overview':
      case 'mobile_overview':
      case 'strengths_assessment':
      case 'role_fit_assessment':
      case 'decision_process':
      case 'evidence_request':
      case 'risk_objection':
      case 'ambiguous_question':
      case 'unsupported_request':
        return { intent: { type: output.intent }, confidence: output.confidence };
      case 'case_discovery':
        return {
          intent: {
            type: 'case_discovery',
            targetCaseId: output.caseId ? findCaseId(output.caseId) ?? output.caseId : undefined,
          },
          confidence: output.confidence,
        };
      case 'missing_case_request':
        return {
          intent: { type: 'missing_case_request', requestedCase: normalizeRequestedCase(output.requestedCase) },
          confidence: output.confidence,
        };
      default:
        return null;
    }
  } catch {
    return classifyMessageWithFallbackHeuristics(text);
  }
}
