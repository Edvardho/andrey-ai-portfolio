import { Output, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

import { getOpenAIModel, isOpenAIEnabled } from '@/lib/portfolio/config';
import {
  extractExplicitCaseRequest,
  findCaseId,
  hasExplicitNavigationVerb,
  mobileCaseIds,
  normalizeRequestedCase,
} from '@/lib/portfolio/query-interpretation';
import type {
  AssistantSession,
  IntentConfidence,
  MessageIntent,
  UIAction,
} from '@/lib/portfolio/types';
import { logOpenAICallStart, logOpenAICallEnd } from './logger';

export type { MessageIntent, IntentConfidence } from '@/lib/portfolio/types';

export type IntentClassification = {
  intent: MessageIntent;
  confidence: IntentConfidence;
};

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

  if (/какая была.+проблем|какую проблем|зачем понадоб|что решал|основная проблем/i.test(lowered)) {
    return { intent: { type: 'case_discovery', targetCaseId: findCaseId(lowered) ?? undefined }, confidence: 'medium' };
  }

  if (/какая была.+роль|что именно.+делал|что.+реально.+делал|какой был.+вклад|что здесь сделал он|а не команда/i.test(lowered)) {
    return { intent: { type: 'case_discovery', targetCaseId: findCaseId(lowered) ?? undefined }, confidence: 'high' };
  }

  if (/как.+исслед|как.+изучал|как.+тестировал|что.+проверял.+исслед|проверял.+через.+исслед|тестировал.+гипотез|проверял.+гипотез|юзабилити|shadowing|запис[ьи].+оператор|анализ задач/i.test(lowered)) {
    return { intent: { type: 'decision_process' }, confidence: 'high' };
  }

  if (/какие.+решени|ключевые решени|механик|архитектур|балансир|flow|флоу|сценари|вариант[а-яё\s]+рассматр/i.test(lowered)) {
    return { intent: { type: 'decision_process' }, confidence: 'medium' };
  }

  if (/compliance|edge[-\s]?кейс|безопасност|права доступа|управлени[ея].+доступ|ограничени|уведомлен|компромисс/i.test(lowered)) {
    return { intent: { type: 'risk_objection' }, confidence: 'high' };
  }

  if (/какой.+результ|какие.+метрик|что улучшил|эффект|feedback|фидбек|отзывы|после запуска|после внедрен|nps/i.test(lowered)) {
    return { intent: { type: 'evidence_request' }, confidence: 'high' };
  }

  if (/дизайн-процесс|типичн.+процесс|от получения задачи|handoff|хенд.?офф|product manager|pm|продакт|разработчик|обратн.+связ|стейкхолдер|приоритиз|измеря.+влияни|влияни.+(?:продукт|бизнес)|дизайн-систем|компонент|ui[-\s]?kit|быстро.+уч|учиться.+нов/i.test(lowered)) {
    return { intent: { type: /дизайн-систем|компонент|ui[-\s]?kit/i.test(lowered) ? 'experience_overview' : 'decision_process' }, confidence: 'high' };
  }

  if (
    /(?:а\s+)?ты.*кто|кто\s+ты(?:\s+такой)?|ну\s+ты\s+кто|что ты умеешь|что ты можешь|чем ты полезен|ты мне чем полезен|что умеет ассистент|что это за ассистент|что ты тут делаешь|ты зачем нужен|зачем ты тут/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'assistant_intro' }, confidence: 'high' };
  }

  if (
    /не верю.+(?:тебе|в тебя|что ты|этому ассистенту|ассистенту|ии|ответу|роутер|бот|шаблон)|ты не ии|не искусственн(ый|ого)? интеллект|зашаблон|шаблон(изированн|ированн)?|роутер|faq[-\s]?бот|просто бот|ты настоящий ии|ты реально ии|придумываешь ответы|подстраиваешься под/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'assistant_intro' }, confidence: 'high' };
  }

  if (/расскажи о себе|представься|кратко о себе/i.test(lowered)) {
    return { intent: { type: 'assistant_intro' }, confidence: 'medium' };
  }

  if (
    /почему это портфолио вообще стоит смотреть|зачем смотреть это портфолио|что дает такой формат портфолио|зачем (?:мне )?читать кейсы через ассистента|зачем (?:мне )?смотреть кейсы через ассистента|почему смотреть это портфолио, а не обычный лендинг|что я пойму по этому портфолио|чем полезен такой формат/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'portfolio_value_request' }, confidence: 'high' };
  }

  if (
    /сожми весь опыт|сожми.+по каждому кейсу|по каждому кейсу дай|по всем кейсам дай|кратко расскажи про андрея.+по каждому кейсу|дай выжимку по кейсам|краткое саммари по всем кейсам|кратко по всем кейсам|расскажи кратко о кейсах андр[её]я|расскажи емко о кейсах андр[её]я|кратко расскажи о кейсах|емко расскажи о кейсах|дай краткий обзор кейсов/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'portfolio_overview' }, confidence: 'high' };
  }

  if (
    /нравит(?:ся)? ли андр[её]ю.+(?:дизайн|работа дизайнером|быть дизайнером)|андре[юя].+нравит(?:ся)?.+(?:дизайн|работа дизайнером|быть дизайнером)|любит ли андр[её]й.+дизайн/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'identity_intro' }, confidence: 'high' };
  }

  if (
    /кто такой андрей|что это за кандидат|что за кандидат|расскажи про андрея|что еще можешь рассказать об андре[её]|\bещ[её].+рассказать.+об андре[её]|представ(ь|ьте).+андре|ну и кто такой андрей|что за чел|это вообще кто|короче кто он|что он за тип как спец/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'identity_intro' }, confidence: 'high' };
  }

  if (
    /покажи опыт работы|какой опыт работы|какой у него опыт работы|расскажи сжато об опыте работы|расскажи кратко об опыте работы|кратко расскажи об опыте работы|сжато расскажи об опыте работы|расскажи кратко про опыт работы|расскажи сжато про опыт работы|кратко про его опыт работы|сжато про его опыт работы|кратко пройдись по его опыту|пройдись по его опыту|где он работал|с какими доменами работал|какие компании|где он успел поработать|что у него по опыту|в каких темах он вообще варился|по доменам что у него|что у него по карьере|какой у него бэкграунд/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'experience_overview' }, confidence: 'high' };
  }

  if (
    /что делал в web|что делал в веб|что он делал в web|что он делал в веб|web[-\s]?кейсы|веб[-\s]?кейсы|что у него по web|что у него по веб/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'experience_overview' }, confidence: 'high' };
  }

  if (
    /покажи мобильные кейсы|что делал в мобилк|что он делал в мобилк|делал мобильн|есть мобильн(ый|ые|ых|ыми|ом)? кейс|мобильн(ый|ые|ых|ыми|ом)? кейс|в мобильн(ых|ые|ом|ыми).+кейс|mobile/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'mobile_overview' }, confidence: 'high' };
  }

  if (
    /(?:ошибк|сделал не так).*(chatpoint|чатпойнт|чат поинт)|(?:chatpoint|чатпойнт|чат поинт).*(?:ошибк|сделал не так)|какую ошибку.+(?:chatpoint|чатпойнт|чат поинт)/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'risk_objection' }, confidence: 'high' };
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
    /неудачн(ый|ого|ом)?\s+кейс|слаб(ый|ого|ом)?\s+кейс|плох(ой|ого|ом)?\s+кейс|провальн(ый|ого|ом)?\s+кейс/i.test(
      lowered,
    )
  ) {
    return {
      intent: { type: 'case_discovery', targetCaseId: 'chatpoint' },
      confidence: 'high',
    };
  }

  if (
    /почему его стоит позвать|почему его стоит звать|почему звать на интервью|в чем его сильная сторона|сильные стороны|и в чем он реально хорош|почему мне его дальше тащить|что в нем цепляет как в кандидате|окей а где сильный сигнал|что в нем сильного|почему мне вообще тратить на него слот|с чего ты взял что его надо звать|почему его не отсеять после первого скрининга|звать его или нет|позвоночник|чем андрей лучше других дизайнеров|чем он лучше других дизайнеров|чем отличается от других дизайнеров|почему андрей лучше других дизайнеров|почему он лучше других дизайнеров|расскажи почему андрей лучше других дизайнеров|расскажи почему он лучше других дизайнеров|андре[йя].+хорош.+дизайнер|хорош.+дизайнер.+андре[йя]|андре[йя].+сильн.+дизайнер|нормальн.+дизайнер/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'strengths_assessment' }, confidence: 'high' };
  }

  if (
    /если убрать.+(?:красив|аккуратн|визуальн).+(?:экран|ui|интерфейс|картин)|что останется.+(?:без|кроме|после).+(?:экран|ui|интерфейс|картин|визуал)|без красивых экранов|кроме красивых экранов|кроме аккуратного ui|если не смотреть на ui|если не смотреть на экраны/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'strengths_assessment' }, confidence: 'high' };
  }

  if (
    /где это подтверждается|где это видно|чем это доказывается|артефакт|доказательств|окей а пруфы где|на чем выводы основаны|чем это вообще подтверждается|не верю словам|на что смотреть в кейсах|где видно что это не слова|где видно что он влияет на продукт|какой кейс лучше открыть первым для оценки|на чем вообще основан вывод про senior|какой кейс лучше всего показывает мозги|где смотреть если мне важен research/i.test(
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

  if (/почему.+закрыл|почему.+не взлет|почему.+не полетел|почему.+провал/i.test(lowered)) {
    return { intent: { type: 'risk_objection' }, confidence: 'high' };
  }

  if (
    /на какой он уровень|на какие роли он подойдет|senior|middle|lead|куда его лучше приземлять|на какую роль он норм|где здесь senior сигнал|продуктов[а-яa-z-]*\s+позвоноч[а-яa-z-]*|какой у него потолок по роли|на какую команду он лучше зайдет/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'role_fit_assessment' }, confidence: 'high' };
  }

  if (
    /как он принимает решения|как он вообще решения принимает|как андрей принимал решения|как принимал решения в этом кейсе|как валидирует|как исследует|как андрей работает над задач|как работает над задач|как он работает над задач|где видно.+думал|не просто исполнял задачу|что.+проверял.+исслед|проверял.+через.+исслед|продуктовый подход|product thinking|он продуктом думает|пиксели красит|что у него с research|как он проверяет что не ерунду сделал|что у него есть кроме аккуратного ui|он умеет не только рисовать/i.test(
      lowered,
    )
  ) {
    return { intent: { type: 'decision_process' }, confidence: 'high' };
  }

  if (
    /что думаешь|расскажи что-нибудь|покажи что-нибудь интересное|удиви|развлеки|биткоин|биток|битка|крипт|нефть|погода|новости|политика|сериал|кино/i.test(
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

  if (
    session.selectedContext.kind === 'case'
    && /какая была.+проблем|какую проблем|зачем понадоб|что решал|основная проблем/i.test(lowered)
  ) {
    return {
      intent: { type: 'case_discovery', targetCaseId: session.selectedContext.id },
      confidence: 'high',
    };
  }

  if (
    session.selectedContext.kind === 'case'
    && /как.+исслед|как.+изучал|как.+тестировал|что.+проверял.+исслед|проверял.+через.+исслед|тестировал.+гипотез|проверял.+гипотез|юзабилити|shadowing|запис[ьи].+оператор|анализ задач/i.test(lowered)
  ) {
    return {
      intent: { type: 'decision_process' },
      confidence: 'high',
    };
  }

  if (
    session.selectedContext.kind === 'case'
    && /какие.+решени|ключевые решени|механик|архитектур|балансир|flow|флоу|сценари|вариант[а-яё\s]+рассматр/i.test(lowered)
  ) {
    return {
      intent: { type: 'decision_process' },
      confidence: 'high',
    };
  }

  if (
    session.selectedContext.kind === 'case'
    && /compliance|edge[-\s]?кейс|безопасност|права доступа|управлени[ея].+доступ|ограничени|уведомлен|компромисс/i.test(lowered)
  ) {
    return {
      intent: { type: 'risk_objection' },
      confidence: 'high',
    };
  }

  if (
    session.selectedContext.kind === 'case'
    && /какой.+результ|какие.+метрик|что улучшил|эффект|feedback|фидбек|отзывы|после запуска|после внедрен|nps/i.test(lowered)
  ) {
    return {
      intent: { type: 'evidence_request' },
      confidence: 'high',
    };
  }

  if (
    /дизайн-процесс|типичн.+процесс|от получения задачи|handoff|хенд.?офф|product manager|pm|продакт|разработчик|обратн.+связ|стейкхолдер|приоритиз|измеря.+влияни|влияни.+(?:продукт|бизнес)|дизайн-систем|компонент|ui[-\s]?kit|быстро.+уч|учиться.+нов/i.test(
      lowered,
    )
  ) {
    return {
      intent: { type: /дизайн-систем|компонент|ui[-\s]?kit/i.test(lowered) ? 'experience_overview' : 'decision_process' },
      confidence: 'high',
    };
  }

  if (/контакт|связа|написа/i.test(lowered)) {
    return {
      intent: { type: 'navigation_action', action: { type: 'open_contact_modal', source: 'message' } },
      confidence: 'high',
    };
  }

  if (
    /почему это портфолио вообще стоит смотреть|зачем смотреть это портфолио|что дает такой формат портфолио|зачем (?:мне )?читать кейсы через ассистента|зачем (?:мне )?смотреть кейсы через ассистента|почему смотреть это портфолио, а не обычный лендинг|что я пойму по этому портфолио|чем полезен такой формат/i.test(
      lowered,
    )
  ) {
    return {
      intent: { type: 'portfolio_value_request' },
      confidence: 'high',
    };
  }

  if (
    /расскажи коротко про андре|быстро оценить андре[яй].+кейс|оценить андре[яй].+кейс|расскажи про андре[яй].+3 минут|оценить андре[яй].+3 минут|только 3 минут.+что смотреть|3 минут.+что смотреть|коротко (?:о|об) кандидат|нет времени (?:изучать|читать|смотреть) портфолио|быстро.+(?:оценить|понять|разобрать).+андре/i.test(
      lowered,
    )
  ) {
    return {
      intent: { type: 'portfolio_overview' },
      confidence: 'high',
    };
  }

  if (
    /сожми весь опыт|сожми.+по каждому кейсу|по каждому кейсу дай|по всем кейсам дай|кратко расскажи про андрея.+по каждому кейсу|дай выжимку по кейсам|краткое саммари по всем кейсам|кратко по всем кейсам|расскажи кратко о кейсах андр[её]я|расскажи емко о кейсах андр[её]я|расскажи сжато о кейсах андр[её]я|кратко расскажи о кейсах|емко расскажи о кейсах|сжато расскажи о кейсах|дай краткий обзор кейсов/i.test(
      lowered,
    )
  ) {
    return {
      intent: { type: 'portfolio_overview' },
      confidence: 'high',
    };
  }

  if (
    /нравит(?:ся)? ли андр[её]ю.+(?:дизайн|работа дизайнером|быть дизайнером)|андре[юя].+нравит(?:ся)?.+(?:дизайн|работа дизайнером|быть дизайнером)|любит ли андр[её]й.+дизайн/i.test(
      lowered,
    )
  ) {
    return {
      intent: { type: 'identity_intro' },
      confidence: 'high',
    };
  }

  if (/кто такой андрей|что это за кандидат|что за кандидат|расскажи про андрея|ну и кто такой андрей|что за чел|это вообще кто|короче кто он|что он за тип как спец/i.test(lowered)) {
    return {
      intent: { type: 'identity_intro' },
      confidence: 'high',
    };
  }

  if (
    /расскажи сжато об опыте работы|расскажи кратко об опыте работы|кратко расскажи об опыте работы|сжато расскажи об опыте работы|расскажи кратко про опыт работы|расскажи сжато про опыт работы|кратко про его опыт работы|сжато про его опыт работы|кратко пройдись по его опыту|пройдись по его опыту/i.test(
      lowered,
    )
  ) {
    return {
      intent: { type: 'experience_overview' },
      confidence: 'high',
    };
  }

  if (
    /что делал в web|что делал в веб|что он делал в web|что он делал в веб|web[-\s]?кейсы|веб[-\s]?кейсы|что у него по web|что у него по веб/i.test(
      lowered,
    )
  ) {
    return {
      intent: { type: 'experience_overview' },
      confidence: 'high',
    };
  }

  if (/в чем у него позвоночник|чем андрей лучше других дизайнеров|чем он лучше других дизайнеров|чем отличается от других дизайнеров|почему андрей лучше других дизайнеров|почему он лучше других дизайнеров|расскажи почему андрей лучше других дизайнеров|расскажи почему он лучше других дизайнеров|андре[йя].+хорош.+дизайнер|хорош.+дизайнер.+андре[йя]|андре[йя].+сильн.+дизайнер|нормальн.+дизайнер/i.test(lowered)) {
    return {
      intent: { type: 'strengths_assessment' },
      confidence: 'high',
    };
  }

  if (/был у него неудачный кейс|есть неудачный кейс|был слабый кейс|есть слабый кейс|был плохой кейс|есть плохой кейс|был провальный кейс|есть провальный кейс/i.test(lowered)) {
    return {
      intent: { type: 'case_discovery', targetCaseId: 'chatpoint' },
      confidence: 'high',
    };
  }

  if (
    /(?:ошибк|сделал не так).*(chatpoint|чатпойнт|чат поинт)|(?:chatpoint|чатпойнт|чат поинт).*(?:ошибк|сделал не так)|какую ошибку.+(?:chatpoint|чатпойнт|чат поинт)/i.test(
      lowered,
    )
  ) {
    return {
      intent: { type: 'risk_objection' },
      confidence: 'high',
    };
  }

  if (
    /что тут смущает|что здесь смущает|что меня должно смутить|что должно смутить|а где тут риск|где тут риск|какие тут риски|какие здесь риски/i.test(
      lowered,
    )
  ) {
    return {
      intent: { type: 'risk_objection' },
      confidence: 'high',
    };
  }

  if (
    session.selectedContext.kind === 'case' &&
    /что здесь сделал андрей|что он здесь сделал|что он тут сделал|что делал андрей в этом кейсе|какая была роль|в чем была его роль|расскажи про этот кейс|расскажи про него|дай краткое саммари по кейсу|краткое саммари по кейсу|краткое summary по кейсу|дай саммари по кейсу|краткую выжимку по кейсу/i.test(
      lowered,
    )
  ) {
    return {
      intent: { type: 'case_discovery', targetCaseId: session.selectedContext.id },
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
    'portfolio_overview',
    'portfolio_value_request',
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
  action: classifierActionSchema.nullable(),
  caseId: z.string().nullable(),
  requestedCase: z.string().nullable(),
  source: z.string().nullable(),
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
- portfolio_overview
- portfolio_value_request
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
- Если пользователь спрашивает, нравится ли Андрею работа дизайнером или дизайн как профессия -> identity_intro.
- Если пользователь спрашивает, что Андрей делал в web/вебе -> experience_overview.
- Если пользователь просит сжать весь опыт и кратко пройтись по кейсам одним ответом -> portfolio_overview.
- Если пользователь спрашивает, зачем вообще смотреть это портфолио или что дает такой формат -> portfolio_value_request.
- Если пользователь просит показать или рассказать про кейс, но не просит явно перейти на экран -> case_discovery.
- Если пользователь спрашивает про мобильный опыт или мобильные кейсы без явного перехода -> mobile_overview.
- Если пользователь спрашивает про сильные стороны, почему стоит звать на интервью или хороший ли Андрей дизайнер -> strengths_assessment.
- Если пользователь спрашивает про уровень, seniority или fit для роли -> role_fit_assessment.
- Если пользователь спрашивает, как Андрей принимает решения, работает над задачей, исследует или валидирует -> decision_process.
- Если пользователь внутри кейса спрашивает про проблему, роль, research, тестирование гипотез, flow, механику, решения или процесс -> не ambiguous; выбери case_discovery или decision_process по смыслу.
- Если пользователь внутри кейса спрашивает про ограничения, compliance, edge cases, безопасность или права доступа -> risk_objection.
- Если пользователь внутри кейса спрашивает про результат, метрики, отзывы, эффект после запуска или NPS -> evidence_request.
- Если пользователь спрашивает глобально про работу с PM, разработчиками, стейкхолдерами, приоритизацию, измерение влияния, дизайн-систему или быстрое обучение -> decision_process или experience_overview, но не ambiguous.
- Если пользователь просит доказательства, подтверждения, артефакты или спрашивает, где это видно -> evidence_request.
- Если пользователь спрашивает про слабые стороны, ограничения, риски -> risk_objection.
- Если пользователь спрашивает, какую ошибку Андрей совершил в конкретном кейсе -> risk_objection.
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
- "Нравится ли Андрею работа дизайнером?" -> identity_intro, high
- "Что это за кандидат?" -> identity_intro, medium
- "что за кандидат" -> identity_intro, medium
- "где он успел поработать" -> experience_overview, high
- "Расскажи сжато об опыте работы Андрея" -> experience_overview, high
- "Кратко расскажи про его опыт работы" -> experience_overview, high
- "Кратко пройдись по его опыту" -> experience_overview, high
- "Что делал в web?" -> experience_overview, high
- "Сожми весь опыт и по каждому кейсу дай по паре строк" -> portfolio_overview, high
- "Расскажи сжато о кейсах Андрея" -> portfolio_overview, high
- "Почему это портфолио вообще стоит смотреть?" -> portfolio_value_request, high
- "Что дает такой формат портфолио?" -> portfolio_value_request, high
- "Зачем читать кейсы через ассистента?" -> portfolio_value_request, high
- "Зачем мне смотреть кейсы через ассистента?" -> portfolio_value_request, high
- "Покажи опыт работы" -> experience_overview, high
- "Покажи сильный кейс" -> case_discovery, high
- "Расскажи про ChatPoint" -> case_discovery, high, caseId=chatpoint
- "Что делал в мобилке?" -> mobile_overview, high
- "Какую ошибку совершил Андрей на ChatPoint?" -> risk_objection, high
- "Открой опыт работы" -> navigation_action, high, action=open_experience_summary
- "Перейди к ChatPoint" -> navigation_action, high, action=open_case_summary, caseId=chatpoint
- "Почему его стоит позвать?" -> strengths_assessment, high
- "почему мне вообще тратить на него слот?" -> strengths_assessment, high
- "с чего ты взял что его надо звать?" -> strengths_assessment, high
- "чем он сильнее обычного продуктового дизайнера?" -> strengths_assessment, high
- "что в нем не банально?" -> strengths_assessment, high
- "почему его не отсеять после первого скрининга?" -> strengths_assessment, high
- "окей а где сильный сигнал" -> strengths_assessment, high
- "Андрей хороший дизайнер?" -> strengths_assessment, high
- "он вообще на senior тянет?" -> role_fit_assessment, high
- "где здесь senior сигнал?" -> role_fit_assessment, high
- "если мне нужен человек с продуктовым позвоночником, это про него?" -> role_fit_assessment, high
- "пока выглядит как нормальный мидл, почему это не так?" -> role_fit_assessment, high
- "он продуктом думает или только пиксели красит" -> decision_process, high
- "Как Андрей работает над задачей?" -> decision_process, high
- "Как вы обычно работаете с Product Manager и разработчиками?" -> decision_process, high
- "Как вы получаете обратную связь от стейкхолдеров?" -> decision_process, high
- "Как вы приоритизируете задачи в условиях ограниченных ресурсов?" -> decision_process, high
- "Как вы измеряете влияние своей работы на продукт?" -> decision_process, high
- "Как вы работаете с дизайн-системами и компонентами?" -> experience_overview, high
- "Какие права доступа вы проектировали?" -> risk_objection, high
- "С какими edge-кейсами и ограничениями столкнулись?" -> risk_objection, high
- "Как тестировали гипотезы в этом кейсе?" -> decision_process, high
- "Какой результат получился после запуска?" -> evidence_request, high
- "что у него есть кроме аккуратного ui?" -> decision_process, high
- "окей а пруфы где" -> evidence_request, high
- "где видно что он влияет на продукт?" -> evidence_request, high
- "какой кейс лучше открыть первым для оценки?" -> evidence_request, high
- "на чем вообще основан вывод про senior?" -> evidence_request, high
- "где смотреть если мне важен research?" -> evidence_request, high
- "а риск какой если брать" -> risk_objection, high
- "что меня должно смутить как нанимающего?" -> risk_objection, high
- "где он может не вывезти?" -> risk_objection, high
- "если сравнивать с сильным senior, где у него зазор?" -> risk_objection, high
- "есть ощущение что он больше про execution, это так?" -> risk_objection, high
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
  if (!isOpenAIEnabled()) {
    return classifyMessageWithFallbackHeuristics(text);
  }

  const prompt = CLASSIFIER_PROMPT.replace(
    '{currentContext}',
    session.selectedContext.label ?? 'none',
  ).replace('{message}', text);

  const developerPromptChars = CLASSIFIER_PROMPT.length;
  const userMessageChars = text.length;
  const schemaChars = 400;
  const totalPayloadChars = prompt.length + schemaChars;

  const callId = logOpenAICallStart({
    route: 'classifyMessageWithModel',
    model: getOpenAIModel(),
    systemPromptChars: 0,
    developerPromptChars,
    userMessageChars,
    ragContextChars: 0,
    historyChars: 0,
    schemaChars,
    totalPayloadChars,
    estimatedInputChars: Math.round(totalPayloadChars / 4),
    retrievedChunksCount: 0,
    messagesCount: 1,
  });

  const startTime = Date.now();
  try {
    const result = await generateText({
      model: openai(getOpenAIModel()),
      temperature: 0,
      output: Output.object({ schema: classificationSchema }),
      prompt,
    });

    const { output, usage, response } = result;

    logOpenAICallEnd(callId, {
      requestId: response.id,
      status: 'success',
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      cachedInputTokens: usage.inputTokenDetails?.cacheReadTokens,
      durationMs: Date.now() - startTime,
    });

    switch (output.intent) {
      case 'navigation_action': {
        if (!output.action) {
          return null;
        }

        const action = buildNavigationAction(
          output.action,
          output.caseId ?? undefined,
          output.source ?? undefined,
        );
        return action
          ? { intent: { type: 'navigation_action', action }, confidence: output.confidence }
          : null;
      }
      case 'assistant_intro':
      case 'identity_intro':
      case 'experience_overview':
      case 'portfolio_overview':
      case 'portfolio_value_request':
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
          intent: { type: 'missing_case_request', requestedCase: normalizeRequestedCase(output.requestedCase ?? undefined) },
          confidence: output.confidence,
        };
      default:
        return null;
    }
  } catch (error: unknown) {
    logOpenAICallEnd(callId, {
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startTime,
    });
    return classifyMessageWithFallbackHeuristics(text);
  }
}
