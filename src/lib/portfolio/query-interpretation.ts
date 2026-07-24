import { detectSynthesisTopic } from '@/lib/portfolio/synthesis';
import type {
  AnswerType,
  AssistantSession,
  CaseFactFacet,
  IntentConfidence,
  MessageIntent,
  QueryInterpretation,
  QueryScope,
  QuestionSubject,
  SemanticInterpretationCandidate,
  SynthesisTopic,
} from '@/lib/portfolio/types';

type ClassificationLike = {
  intent: MessageIntent;
  confidence: IntentConfidence;
};

type CaseAlias = {
  caseId: string;
  patterns: RegExp[];
};

type CueDefinition = {
  label: string;
  patterns: RegExp[];
};

export const caseAliases: CaseAlias[] = [
  {
    caseId: 'alfa-smart',
    patterns: [
      /альфа/i,
      /смарт/i,
      /флагман/i,
      /сильн(ый|ого|ом|ые|ых)?.+кейс/i,
      /сам(ый|ого|ом)?.+сильн(ый|ого|ом)?.+кейс/i,
    ],
  },
  { caseId: 'siebel', patterns: [/siebel/i, /оператор/i, /мтс/i] },
  { caseId: 'chatpoint', patterns: [/chatpoint/i, /чатпойнт/i, /чат\s+поинт/i, /anti-case/i] },
  { caseId: 'expenses-card-holders', patterns: [/держател/i, /расход/i, /истори/i] },
  { caseId: 'subscription-sharing', patterns: [/шаринг/i, /подписк.+ссыл/i, /приглаш/i] },
  { caseId: 'ux-ui-wannabelike', patterns: [/wannabelike/i, /superapp/i, /миш/i, /структур/i, /ux\/ui/i] },
];

const explicitCaseAliases: CaseAlias[] = [
  {
    caseId: 'alfa-smart',
    patterns: [/альфа[-\s]?смарт/i, /\balfa[-\s]?smart\b/i],
  },
  { caseId: 'siebel', patterns: [/siebel/i] },
  { caseId: 'chatpoint', patterns: [/chatpoint/i, /чатпойнт/i, /чат\s+поинт/i] },
  {
    caseId: 'expenses-card-holders',
    patterns: [/расходы держател/i, /держател[ея].+карт/i],
  },
  {
    caseId: 'subscription-sharing',
    patterns: [/шаринг[ае]?\s+подпис/i, /улучшени[ея].+добавлени[яе].+участник/i],
  },
  {
    caseId: 'ux-ui-wannabelike',
    patterns: [/wannabelike/i, /ux\/ui wannabelike/i],
  },
];

export const mobileCaseIds = new Set([
  'expenses-card-holders',
  'subscription-sharing',
  'ux-ui-wannabelike',
  'alfa-smart',
]);

const PORTFOLIO_WIDE_CUES: CueDefinition[] = [
  { label: 'portfolio_wide:all_cases', patterns: [/все кейсы/i, /по всем кейсам/i, /по каждому кейсу/i] },
  { label: 'portfolio_wide:whole_experience', patterns: [/весь опыт/i, /по всему опыту/i, /все портфолио/i] },
  { label: 'portfolio_wide:case_overview', patterns: [/кратко.+о кейсах/i, /сжато.+о кейсах/i, /обзор кейсов/i, /какие у него вообще кейсы/i] },
];

const CURRENT_CASE_CUES: CueDefinition[] = [
  { label: 'current_case:explicit', patterns: [/в этом кейсе/i, /об этом кейсе/i, /в этом проекте/i, /об этом проекте/i] },
  { label: 'current_case:local', patterns: [/(^|[\s.,!?;:()«»"'/-])здесь($|[\s.,!?;:()«»"'/-])/i, /(^|[\s.,!?;:()«»"'/-])тут($|[\s.,!?;:()«»"'/-])/i] },
  { label: 'current_case:this_case', patterns: [/этот кейс/i, /данный кейс/i] },
];

const CONTEXT_CASE_REFERENCE_CUES: CueDefinition[] = [
  {
    label: 'context_case:anaphora',
    patterns: [
      /(^|[\s.,!?;:()«»"'/-])там($|[\s.,!?;:()«»"'/-])/i,
      /в том кейсе/i,
      /в этом ответе/i,
      /у него в этом проекте/i,
    ],
  },
];

const GLOBAL_PERSON_CUES: CueDefinition[] = [
  { label: 'global_person:hiring', patterns: [/почему.+звать/i, /стоит.+нанять/i, /как кандидат/i, /почему его стоит/i] },
  { label: 'global_person:better_than_others', patterns: [/лучше других дизайнеров/i, /чем он лучше/i, /чем андрей лучше/i, /отличается от других дизайнеров/i] },
  { label: 'global_person:candidate_quality', patterns: [/андре[йя].+хорош.+дизайнер/i, /хорош.+дизайнер.+андре[йя]/i, /андре[йя].+сильн.+дизайнер/i, /нормальн.+дизайнер/i] },
  { label: 'global_person:whole_person', patterns: [/по андрею в целом/i, /в целом по андрею/i, /в целом по опыту/i] },
];

const VALUE_BEYOND_UI_CUES: CueDefinition[] = [
  {
    label: 'global_person:value_beyond_ui',
    patterns: [
      /если убрать.+(?:красив|аккуратн|визуальн).+(?:экран|ui|интерфейс|картин)/i,
      /что останется.+(?:без|кроме|после).+(?:экран|ui|интерфейс|картин|визуал)/i,
      /без красивых экранов/i,
      /кроме красивых экранов/i,
      /кроме аккуратного ui/i,
      /если не смотреть на ui/i,
      /если не смотреть на экраны/i,
    ],
  },
];

const PORTFOLIO_VALUE_CUES: CueDefinition[] = [
  {
    label: 'portfolio_value:why_watch',
    patterns: [/почему это портфолио/i, /зачем смотреть это портфолио/i, /почему смотреть это портфолио/i],
  },
  {
    label: 'portfolio_value:format_value',
    patterns: [/что дает такой формат портфолио/i, /чем полезен такой формат/i, /что я пойму по этому портфолио/i],
  },
  {
    label: 'portfolio_value:assistant_flow',
    patterns: [/зачем (?:мне )?читать кейсы через ассистента/i, /зачем (?:мне )?смотреть кейсы через ассистента/i],
  },
];

const FAST_REVIEW_CUES: CueDefinition[] = [
  {
    label: 'fast_review:explicit_launch',
    patterns: [
      /расскажи про андре[яй].+3 минут/i,
      /оценить андре[яй].+3 минут/i,
      /только 3 минут.+что смотреть/i,
      /3 минут.+что смотреть/i,
      /быстро оценить андре[яй].+кейс/i,
      /оценить андре[яй].+кейс/i,
      /нет времени (?:изучать|читать|смотреть) портфолио/i,
    ],
  },
];

const SUMMARY_CUES: CueDefinition[] = [
  { label: 'summary:brief', patterns: [/кратко/i, /сжато/i, /ёмко/i, /емко/i, /емка/i, /коротко/i, /покороче/i, /короче/i, /без воды/i] },
];

const CONTEXTUAL_SUMMARY_CUES: CueDefinition[] = [
  {
    label: 'contextual_summary:aggregate',
    patterns: [/сожми/i, /обобщи/i, /резюмир/i, /выжимк/i, /сводк/i, /(?:дай|какой).+итог/i],
  },
  {
    label: 'contextual_summary:evaluation',
    patterns: [
      /что (?:здесь|тут).+(?:главное|важное)/i,
      /на что (?:здесь|тут)?\s*(?:(?:нужно|стоит)\s*)?обратить внимание/i,
      /что важно понять/i,
      /что проверить(?: на интервью)?/i,
      /какой вывод/i,
    ],
  },
];

const EXPERIENCE_CUES: CueDefinition[] = [
  { label: 'experience:work_history', patterns: [/опыт работы/i, /его опыт/i, /где он работал/i, /карьер/i, /бэкграунд/i] },
  { label: 'experience:domains', patterns: [/компани/i, /домены/i, /где успел поработать/i] },
  { label: 'experience:web', patterns: [/что делал в web/i, /что делал в веб/i, /web[-\s]?кейсы/i, /веб[-\s]?кейсы/i, /что у него по web/i, /что у него по веб/i] },
];

const CANDIDATE_INTRO_CUES: CueDefinition[] = [
  {
    label: 'candidate_intro:direct_about',
    patterns: [
      /^(?:(?:можешь|можете)\s+)?(?:расскажи|расскажите)(?:\s+(?:коротко|ёмко|емко|сжато|без воды))?\s+(?:про|об)\s+андре[яй]/i,
      /^(?:коротко|ёмко|емко|сжато)\s+(?:о|об)\s+кандидат/i,
    ],
  },
  {
    label: 'candidate_intro:about_andrey',
    patterns: [
      /что еще можешь рассказать об андре[её]/i,
      /\bещ[её].+рассказать.+об андре[её]/i,
      /расскажи.+об андре[её].+еще/i,
    ],
  },
];

const EVIDENCE_CUES: CueDefinition[] = [
  {
    label: 'evidence:proof',
    patterns: [
      /док[ао]зательств/i,
      /где это подтверждается/i,
      /где тут доказательства/i,
      /не верю словам/i,
      /на что смотреть в кейсах/i,
      /где видно что это не слова/i,
      /пруфы/i,
      /артефакт/i,
    ],
  },
];

const RISK_CUES: CueDefinition[] = [
  { label: 'risk:weakness', patterns: [/слабое место/i, /слабые стороны/i, /ограничения/i, /риски/i, /что смущает/i] },
  { label: 'risk:failure', patterns: [/почему продукт закрыли/i, /почему закрыли/i, /неудачный кейс/i, /слабый кейс/i] },
  { label: 'risk:error', patterns: [/ошибк/i, /что.+сделал не так/i, /какую ошибку/i] },
];

const BEHAVIORAL_FIT_CUES: CueDefinition[] = [
  {
    label: 'behavioral_fit:deadline_reliability',
    patterns: [
      /срыв(?:ал|ает|ать).+(?:дедлайн|срок)/i,
      /(?:дедлайн|срок).+(?:срыв|горел|продалб)/i,
      /продалбыва(?:л|ет)?.+(?:дедлайн|срок)/i,
      /успева(?:ет|л).+(?:дедлайн|срок)/i,
      /можно.+доверить.+дедлайн/i,
    ],
  },
  {
    label: 'behavioral_fit:execution',
    patterns: [
      /исполнительн(?:ый|ая|ли)/i,
      /ответственн(?:ый|ая|ли)/i,
      /доводит.+(?:задач|работ).+(?:до конца|до результат)/i,
      /доводит.+(?:задач|работ)/i,
    ],
  },
];

const MOTIVATION_CUES: CueDefinition[] = [
  {
    label: 'identity:motivation',
    patterns: [
      /нравит(?:ся)? ли андр[её]ю.+(?:дизайн|работа дизайнером|быть дизайнером)/i,
      /андре[юя].+нравит(?:ся)?.+(?:дизайн|работа дизайнером|быть дизайнером)/i,
      /любит ли андр[её]й.+дизайн/i,
    ],
  },
];

const CASE_PROBLEM_CUES: CueDefinition[] = [
  {
    label: 'case:problem',
    patterns: [
      /какая была.+проблем/i,
      /какую проблем/i,
      /зачем понадоб/i,
      /что решал/i,
      /какая бизнес.+проблем/i,
      /пользовательск.+проблем/i,
      /основная проблем/i,
    ],
  },
];

const CASE_RESEARCH_CUES: CueDefinition[] = [
  {
    label: 'case:research',
    patterns: [
      /как.+проверя.+гипотез/i,
      /как.+исслед/i,
      /как.+изучал/i,
      /как.+тестировал/i,
      /что.+проверял.+исслед/i,
      /проверял.+через.+исслед/i,
      /тестировал.+гипотез/i,
      /проверял.+гипотез/i,
      /юзабилити/i,
      /a\/b|а\/б/i,
      /shadowing/i,
      /интервью/i,
      /анализ задач/i,
      /запис[ьи].+оператор/i,
    ],
  },
];

const CASE_DECISION_CUES: CueDefinition[] = [
  {
    label: 'case:decisions',
    patterns: [
      /какие.+решени/i,
      /ключевые решени/i,
      /как.+принимал.+решени/i,
      /как.+решал/i,
      /механик/i,
      /архитектур/i,
      /переключени/i,
      /вариант[а-яё\s]+рассматр/i,
      /балансир/i,
      /роли пользов/i,
      /flow/i,
      /флоу/i,
      /сценари/i,
      /где видно.+думал/i,
      /не просто исполнял задачу/i,
    ],
  },
];

const CASE_CONSTRAINT_CUES: CueDefinition[] = [
  {
    label: 'case:constraints',
    patterns: [
      /ограничени/i,
      /compliance/i,
      /edge[-\s]?кейс/i,
      /edge[-\s]?cases/i,
      /безопасност/i,
      /права доступа/i,
      /доступ/i,
      /уведомлен/i,
      /техническ/i,
      /компромисс/i,
    ],
  },
];

const CASE_OUTCOME_CUES: CueDefinition[] = [
  {
    label: 'case:outcomes',
    patterns: [
      /какой.+результ/i,
      /какие.+метрик/i,
      /метрик/i,
      /что изменил/i,
      /что изменилось/i,
      /что улучшил/i,
      /какой.+доход/i,
      /сколько.+принес/i,
      /выручк/i,
      /доход/i,
      /эффект/i,
      /feedback/i,
      /фидбек/i,
      /отзывы/i,
      /после запуска/i,
      /после внедрен/i,
      /после редизайн/i,
      /nps/i,
      /ошибок/i,
    ],
  },
];

const GLOBAL_PROCESS_CUES: CueDefinition[] = [
  {
    label: 'global:design_process',
    patterns: [/дизайн-процесс/i, /типичн.+процесс/i, /от получения задачи/i, /handoff/i, /хенд.?офф/i],
  },
  {
    label: 'global:collaboration',
    patterns: [/product manager/i, /pm/i, /продакт/i, /разработчик/i, /команд/i, /как.+работа.+с.+разработ/i],
  },
  {
    label: 'global:stakeholder_feedback',
    patterns: [/обратн.+связ/i, /стейкхолдер/i, /stakeholder/i, /feedback/i, /фидбек/i],
  },
  {
    label: 'global:prioritization',
    patterns: [/приоритиз/i, /ограниченн.+ресурс/i, /фич/i],
  },
  {
    label: 'global:impact_measurement',
    patterns: [/измеря.+влияни/i, /влияни.+(?:продукт|бизнес)/i, /метрик.+работ/i, /как.+измер/i],
  },
  {
    label: 'global:design_system',
    patterns: [/дизайн-систем/i, /компонент/i, /ui[-\s]?kit/i, /юай[-\s]?кит/i],
  },
  {
    label: 'global:learning',
    patterns: [/быстро.+уч/i, /учиться.+нов/i, /новому.+проект/i, /пришлось.+уч/i],
  },
];

export function hasExplicitNavigationVerb(text: string): boolean {
  return /(?:^|[\s.,!?;:()«»"'/-])(открой|перейди|смотри|смотреть|разверни|отведи|переключи)(?=$|[\s.,!?;:()«»"'/-])/i.test(
    text,
  );
}

export function findCaseId(text: string): string | null {
  const lowered = text.toLowerCase();

  for (const alias of caseAliases) {
    if (alias.patterns.some((pattern) => pattern.test(lowered))) {
      return alias.caseId;
    }
  }

  return null;
}

function findExplicitNamedCaseId(text: string): string | null {
  const lowered = text.toLowerCase();

  for (const alias of explicitCaseAliases) {
    if (alias.patterns.some((pattern) => pattern.test(lowered))) {
      return alias.caseId;
    }
  }

  return null;
}

export function normalizeRequestedCase(raw: string | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }

  return raw
    .replace(/^[«"'\s]+|[»"'?.!,\s]+$/g, '')
    .replace(/^(про|о|по)\s+/i, '')
    .trim();
}

export function extractExplicitCaseRequest(text: string): string | undefined {
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

function collectCueLabels(text: string, groups: CueDefinition[]): string[] {
  const labels: string[] = [];

  for (const group of groups) {
    if (group.patterns.some((pattern) => pattern.test(text))) {
      labels.push(group.label);
    }
  }

  return labels;
}

export function isCompactCurrentCaseSummaryRequest(text: string): boolean {
  const normalized = text
    .toLocaleLowerCase('ru-RU')
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .trim();
  const hasCompactCue = collectCueLabels(normalized, SUMMARY_CUES).length > 0;
  const hasTellCue = /(?:^|[\s.,!?;:()«»"'/-])(?:расскажи|скажи|объясни|опиши|пройдись)(?=$|[\s.,!?;:()«»"'/-])/i.test(normalized);
  const hasCurrentCaseReference = [
    'об этом кейсе',
    'про этот кейс',
    'об этом проекте',
    'про этот проект',
    'здесь',
  ].some((cue) => normalized.includes(cue));
  const hasSingularCaseReference = /(?:^|[\s.,!?;:()«»"'/-])(?:о|про)\s+(?:этот\s+)?(?:кейсе|кейс|проекте|проект)(?=$|[\s.,!?;:()«»"'/-])/i.test(normalized);

  return hasCompactCue && hasTellCue && (hasCurrentCaseReference || hasSingularCaseReference);
}

export function isBareCompactCurrentCaseSummaryRequest(text: string): boolean {
  const normalized = text
    .toLocaleLowerCase('ru-RU')
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .trim();

  return /^(?:коротко|емко|емка) скажи[.!?…]*$|^короче давай[.!?…]*$|^расскажи (?:короче|покороче)[.!?…]*$/.test(normalized);
}

function hasNegativeCaseCue(text: string): boolean {
  return /неудачн(ый|ого|ом)?\s+кейс|слаб(ый|ого|ом)?\s+кейс|плох(ой|ого|ом)?\s+кейс|провальн(ый|ого|ом)?\s+кейс/i.test(
    text,
  );
}

function hasCaseQuestionCue(text: string): boolean {
  return [
    CASE_PROBLEM_CUES,
    CASE_RESEARCH_CUES,
    CASE_DECISION_CUES,
    CASE_CONSTRAINT_CUES,
    CASE_OUTCOME_CUES,
  ].some((group) => collectCueLabels(text, group).length > 0);
}

function hasCaseScopedQuestionCue(text: string): boolean {
  return (
    hasCaseQuestionCue(text)
    || collectCueLabels(text, EVIDENCE_CUES).length > 0
    || collectCueLabels(text, RISK_CUES).length > 0
    || /вклад|реально сделал|что именно сделал|какая была.+роль|в чем была.+роль|что здесь сделал он|что здесь его|а не команд/i.test(text)
  );
}

function getLastReferencedCaseId(session: AssistantSession): string | null {
  const targetCaseIds = session.lastSynthesis?.answerPlan.targetCaseIds ?? [];
  return targetCaseIds.length === 1 ? targetCaseIds[0] : null;
}

function getGlobalProcessSubject(text: string): QuestionSubject | null {
  const labels = collectCueLabels(text, GLOBAL_PROCESS_CUES);
  if (!labels.length) {
    return null;
  }

  if (labels.some((label) => label.includes('design_process'))) {
    return 'design_process';
  }
  if (labels.some((label) => label.includes('stakeholder_feedback'))) {
    return 'stakeholder_feedback';
  }
  if (labels.some((label) => label.includes('prioritization'))) {
    return 'prioritization';
  }
  if (labels.some((label) => label.includes('impact_measurement'))) {
    return 'impact_measurement';
  }
  if (labels.some((label) => label.includes('design_system'))) {
    return 'design_system_work';
  }
  if (labels.some((label) => label.includes('learning'))) {
    return 'learning_adaptation';
  }
  return 'collaboration_process';
}

function getGlobalSynthesisTopic(intent: MessageIntent): SynthesisTopic | null {
  switch (intent.type) {
    case 'identity_intro':
      return 'identity';
    case 'experience_overview':
      return 'experience';
    case 'portfolio_overview':
      return 'portfolio_overview';
    case 'portfolio_value_request':
      return 'portfolio_value';
    case 'contextual_summary_request':
      return 'portfolio_overview';
    case 'mobile_overview':
      return 'mobile';
    case 'strengths_assessment':
      return 'strengths';
    case 'role_fit_assessment':
      return 'fit';
    case 'decision_process':
      return 'decision_making';
    case 'risk_objection':
      return 'risks';
    case 'behavioral_fit_assessment':
      return 'delivery_evidence';
    case 'evidence_request':
      return 'fit';
    default:
      return null;
  }
}

function resolveQuestionSubject(
  intent: MessageIntent,
  scope: QueryScope,
  text: string,
  isExplicitFastReview: boolean,
): QuestionSubject {
  if (intent.type === 'contextual_summary_request') {
    return scope === 'portfolio_wide'
      ? 'portfolio_recruiter_summary'
      : 'case_recruiter_summary';
  }
  // `QuestionSubject` is the hiring evaluation task behind the wording:
  // proof, contribution, risk, interview decision, or candidate value.
  if (isExplicitFastReview) {
    return 'candidate_fast_review';
  }

  if (intent.type === 'behavioral_fit_assessment') {
    return 'behavioral_evidence_check';
  }

  if (scope === 'current_case_only' || scope === 'named_case') {
    if (/вклад|реально сделал|что именно сделал|какая была.+роль|в чем была.+роль|что здесь сделал он|что здесь его|а не команд/i.test(text)) {
      return 'case_contribution';
    }
    if (collectCueLabels(text, EVIDENCE_CUES).length > 0) {
      return 'case_evidence';
    }
    if (collectCueLabels(text, CASE_PROBLEM_CUES).length > 0) {
      return 'case_problem';
    }
    if (collectCueLabels(text, CASE_RESEARCH_CUES).length > 0) {
      return 'case_research';
    }
    if (collectCueLabels(text, CASE_DECISION_CUES).length > 0) {
      return 'case_decisions';
    }
    if (collectCueLabels(text, CASE_CONSTRAINT_CUES).length > 0) {
      return 'case_constraints';
    }
    if (collectCueLabels(text, CASE_OUTCOME_CUES).length > 0) {
      return 'case_outcomes';
    }
    if (/почему.+сильн|почему этот кейс|почему этот проект.+важен|что этот кейс.+доказыва/i.test(text)) {
      return 'case_strength';
    }
  }

  if (collectCueLabels(text, CASE_OUTCOME_CUES).length > 0) {
    return 'impact_measurement';
  }

  if (collectCueLabels(text, CASE_RESEARCH_CUES).length > 0 && /обычно|андр|процесс|гипотез|исслед/i.test(text)) {
    return 'design_process';
  }

  const globalProcessSubject = getGlobalProcessSubject(text);
  if (globalProcessSubject) {
    return globalProcessSubject;
  }

  switch (intent.type) {
    case 'experience_overview':
      return 'experience_summary';
    case 'portfolio_overview':
      return 'candidate_portfolio_value';
    case 'portfolio_value_request':
      if (/через ассистента/i.test(text)) {
        return 'assistant_case_navigation';
      }
      if (/формат/i.test(text)) {
        return 'ai_format_value';
      }
      return 'candidate_portfolio_value';
    case 'strengths_assessment':
      if (/интервью|позвать|звать|потратить.+слот|тащить/i.test(text)) {
        return 'interview_decision';
      }
      if (scope === 'current_case_only') {
        return 'case_strength';
      }
      return 'candidate_value';
    case 'role_fit_assessment':
      return 'candidate_value';
    case 'case_discovery':
      if (/вклад|реально сделал|что именно сделал|какая была.+роль|в чем была.+роль|что здесь сделал он|что здесь его|а не команд/i.test(text)) {
        return 'case_contribution';
      }
      return 'case_summary';
    case 'evidence_request':
      return 'case_evidence';
    case 'risk_objection':
      return 'risk_check';
    case 'decision_process':
      return scope === 'current_case_only' ? 'case_decisions' : 'candidate_value';
    case 'identity_intro':
      if (collectCueLabels(text, MOTIVATION_CUES).length > 0) {
        return 'candidate_motivation';
      }
      return 'candidate_value';
    case 'ambiguous_question':
    case 'mobile_overview':
    default:
      return scope === 'portfolio_wide' ? 'candidate_portfolio_value' : 'candidate_value';
  }
}

function getCaseFacetTopic(facet: CaseFactFacet): SynthesisTopic {
  switch (facet) {
    case 'overview':
    case 'problem':
      return 'fit';
    case 'role':
      return 'fit';
    case 'research':
    case 'decisions':
      return 'decision_making';
    case 'constraints':
      return 'fit';
    case 'outcomes':
      return 'fit';
    case 'evidence':
      return 'fit';
    case 'strengths':
      return 'strengths';
    case 'risks':
    default:
      return 'fit';
  }
}

function getAnswerType(
  intent: MessageIntent,
  scope: QueryScope,
  text: string,
  questionSubject: QuestionSubject,
): AnswerType | null {
  if (
    questionSubject === 'case_recruiter_summary'
    || questionSubject === 'portfolio_recruiter_summary'
  ) {
    return 'contextual_summary';
  }
  if (questionSubject === 'candidate_fast_review') {
    return 'candidate_fast_review';
  }

  switch (questionSubject) {
    case 'behavioral_evidence_check':
      return 'calibrated_unknown';
    case 'case_contribution':
      return 'contribution_breakdown';
    case 'case_evidence':
      return 'proof_map';
    case 'case_problem':
    case 'case_summary':
      return hasNegativeCaseCue(text) ? 'failure_postmortem' : 'case_summary';
    case 'case_research':
    case 'case_decisions':
    case 'design_process':
    case 'collaboration_process':
    case 'stakeholder_feedback':
    case 'prioritization':
    case 'learning_adaptation':
      return 'decision_breakdown';
    case 'case_constraints':
    case 'risk_check':
      return 'risk_assessment';
    case 'case_outcomes':
    case 'impact_measurement':
      return 'outcome_summary';
    case 'design_system_work':
      return 'experience_overview';
    default:
      break;
  }

  switch (intent.type) {
    case 'identity_intro':
      return 'candidate_positioning';
    case 'experience_overview':
      return 'experience_overview';
    case 'portfolio_overview':
      return 'portfolio_compression';
    case 'portfolio_value_request':
      return 'portfolio_value_argument';
    case 'mobile_overview':
      return 'experience_overview';
    case 'case_discovery':
      return hasNegativeCaseCue(text) ? 'failure_postmortem' : 'case_summary';
    case 'strengths_assessment':
      return 'hiring_argument';
    case 'role_fit_assessment':
      return 'hiring_argument';
    case 'decision_process':
      return 'decision_breakdown';
    case 'evidence_request':
      return 'proof_map';
    case 'risk_objection':
      return 'risk_assessment';
    case 'behavioral_fit_assessment':
      return 'calibrated_unknown';
    case 'ambiguous_question': {
      const recoveredTopic = detectSynthesisTopic(text);
      if (!recoveredTopic) {
        return null;
      }

      switch (recoveredTopic) {
        case 'experience':
        case 'web':
          return 'experience_overview';
        case 'portfolio_overview':
          return 'portfolio_compression';
        case 'portfolio_value':
          return 'portfolio_value_argument';
        case 'strengths':
        case 'fit':
          return 'hiring_argument';
        case 'decision_making':
        case 'product_approach':
        case 'collaboration':
          return 'decision_breakdown';
        case 'risks':
          return 'risk_assessment';
        case 'identity':
        default:
          return scope === 'portfolio_wide' ? 'portfolio_compression' : 'candidate_positioning';
      }
    }
    default:
      return null;
  }
}

function getCaseAwareFacet(
  scope: QueryScope,
  session: AssistantSession,
  intent: MessageIntent,
  questionSubject: QuestionSubject,
): CaseFactFacet | null {
  if (scope !== 'current_case_only' && scope !== 'named_case') {
    return null;
  }

  if (scope === 'current_case_only' && session.selectedContext.kind !== 'case') {
    return null;
  }

  switch (questionSubject) {
    case 'case_problem':
      return 'problem';
    case 'case_research':
      return 'research';
    case 'case_decisions':
      return 'decisions';
    case 'case_constraints':
      return 'constraints';
    case 'case_outcomes':
      return 'outcomes';
    case 'case_contribution':
      return 'role';
    case 'case_evidence':
      return 'evidence';
    case 'case_strength':
      return 'strengths';
    case 'risk_check':
      return 'risks';
    case 'behavioral_evidence_check':
      return 'outcomes';
    case 'case_recruiter_summary':
      return null;
    default:
      break;
  }

  switch (intent.type) {
    case 'case_discovery':
      return 'overview';
    case 'decision_process':
      return 'decisions';
    case 'strengths_assessment':
      return 'strengths';
    case 'risk_objection':
      return 'risks';
    case 'role_fit_assessment':
      return 'strengths';
    case 'evidence_request':
      return 'evidence';
    default:
      return null;
  }
}

function recoverIntentFromText(
  text: string,
  currentCaseCueLabels: string[],
  portfolioWideCueLabels: string[],
  globalPersonCueLabels: string[],
  explicitNamedCaseId: string | null,
): { intent: MessageIntent; confidence: IntentConfidence; matchedCues: string[] } | null {
  const summaryCueLabels = collectCueLabels(text, SUMMARY_CUES);
  const experienceCueLabels = collectCueLabels(text, EXPERIENCE_CUES);
  const evidenceCueLabels = collectCueLabels(text, EVIDENCE_CUES);
  const riskCueLabels = collectCueLabels(text, RISK_CUES);
  const behavioralFitCueLabels = collectCueLabels(text, BEHAVIORAL_FIT_CUES);
  const portfolioValueCueLabels = collectCueLabels(text, PORTFOLIO_VALUE_CUES);
  const valueBeyondUiCueLabels = collectCueLabels(text, VALUE_BEYOND_UI_CUES);
  const motivationCueLabels = collectCueLabels(text, MOTIVATION_CUES);
  const fastReviewCueLabels = collectCueLabels(text, FAST_REVIEW_CUES);
  const caseProblemCueLabels = collectCueLabels(text, CASE_PROBLEM_CUES);
  const caseResearchCueLabels = collectCueLabels(text, CASE_RESEARCH_CUES);
  const caseDecisionCueLabels = collectCueLabels(text, CASE_DECISION_CUES);
  const caseConstraintCueLabels = collectCueLabels(text, CASE_CONSTRAINT_CUES);
  const caseOutcomeCueLabels = collectCueLabels(text, CASE_OUTCOME_CUES);
  const globalProcessCueLabels = collectCueLabels(text, GLOBAL_PROCESS_CUES);
  const recoveredTopic = detectSynthesisTopic(text);
  const caseScopedCueLabels = [
    ...currentCaseCueLabels,
    ...(explicitNamedCaseId ? [`named_case:${explicitNamedCaseId}`] : []),
  ];

  if (behavioralFitCueLabels.length > 0) {
    return {
      intent: { type: 'behavioral_fit_assessment' },
      confidence: 'high',
      matchedCues: [...caseScopedCueLabels, ...behavioralFitCueLabels],
    };
  }

  if ((currentCaseCueLabels.length > 0 || explicitNamedCaseId) && caseProblemCueLabels.length > 0) {
    return {
      intent: { type: 'case_discovery', targetCaseId: explicitNamedCaseId ?? undefined },
      confidence: 'medium',
      matchedCues: [...caseScopedCueLabels, ...caseProblemCueLabels],
    };
  }

  if ((currentCaseCueLabels.length > 0 || explicitNamedCaseId) && caseResearchCueLabels.length > 0) {
    return {
      intent: { type: 'decision_process' },
      confidence: 'medium',
      matchedCues: [...caseScopedCueLabels, ...caseResearchCueLabels],
    };
  }

  if ((currentCaseCueLabels.length > 0 || explicitNamedCaseId) && caseDecisionCueLabels.length > 0) {
    return {
      intent: { type: 'decision_process' },
      confidence: 'medium',
      matchedCues: [...caseScopedCueLabels, ...caseDecisionCueLabels],
    };
  }

  if ((currentCaseCueLabels.length > 0 || explicitNamedCaseId) && caseConstraintCueLabels.length > 0) {
    return {
      intent: { type: 'risk_objection' },
      confidence: 'medium',
      matchedCues: [...caseScopedCueLabels, ...caseConstraintCueLabels],
    };
  }

  if ((currentCaseCueLabels.length > 0 || explicitNamedCaseId) && caseOutcomeCueLabels.length > 0) {
    return {
      intent: { type: 'evidence_request' },
      confidence: 'medium',
      matchedCues: [...caseScopedCueLabels, ...caseOutcomeCueLabels],
    };
  }

  if (fastReviewCueLabels.length > 0) {
    return {
      intent: { type: 'portfolio_overview' },
      confidence: 'high',
      matchedCues: fastReviewCueLabels,
    };
  }

  if (motivationCueLabels.length > 0) {
    return {
      intent: { type: 'identity_intro' },
      confidence: 'medium',
      matchedCues: motivationCueLabels,
    };
  }

  if (portfolioValueCueLabels.length > 0) {
    return {
      intent: { type: 'portfolio_value_request' },
      confidence: 'medium',
      matchedCues: portfolioValueCueLabels,
    };
  }

  if (valueBeyondUiCueLabels.length > 0) {
    return {
      intent: { type: 'strengths_assessment' },
      confidence: 'medium',
      matchedCues: valueBeyondUiCueLabels,
    };
  }

  if (portfolioWideCueLabels.length > 0 && summaryCueLabels.length > 0) {
    return {
      intent: { type: 'portfolio_overview' },
      confidence: 'medium',
      matchedCues: [...portfolioWideCueLabels, ...summaryCueLabels],
    };
  }

  if (experienceCueLabels.length > 0) {
    return {
      intent: { type: 'experience_overview' },
      confidence: summaryCueLabels.length > 0 ? 'high' : 'medium',
      matchedCues: [...experienceCueLabels, ...summaryCueLabels],
    };
  }

  if (globalPersonCueLabels.length > 0) {
    return {
      intent: { type: 'strengths_assessment' },
      confidence: 'medium',
      matchedCues: globalPersonCueLabels,
    };
  }

  if (globalProcessCueLabels.length > 0) {
    const subject = getGlobalProcessSubject(text);
    return {
      intent: subject === 'design_system_work' ? { type: 'experience_overview' } : { type: 'decision_process' },
      confidence: 'medium',
      matchedCues: globalProcessCueLabels,
    };
  }

  if (caseResearchCueLabels.length > 0 && /обычно|андр|процесс|гипотез|исслед/i.test(text)) {
    return {
      intent: { type: 'decision_process' },
      confidence: 'medium',
      matchedCues: caseResearchCueLabels,
    };
  }

  if (caseOutcomeCueLabels.length > 0) {
    return {
      intent: { type: 'evidence_request' },
      confidence: 'medium',
      matchedCues: caseOutcomeCueLabels,
    };
  }

  if (/мобильн(ых|ые|ый|ом|ыми|ых)?\s+кейс|в мобилк|mobile/i.test(text)) {
    return {
      intent: { type: 'mobile_overview' },
      confidence: 'medium',
      matchedCues: ['mobile:overview'],
    };
  }

  if (riskCueLabels.length > 0) {
    return {
      intent: { type: 'risk_objection' },
      confidence: 'medium',
      matchedCues: riskCueLabels,
    };
  }

  if (
    recoveredTopic === 'decision_making'
    || recoveredTopic === 'product_approach'
    || recoveredTopic === 'collaboration'
  ) {
    return {
      intent: { type: 'decision_process' },
      confidence: 'medium',
      matchedCues: [`topic:${recoveredTopic}`],
    };
  }

  if (recoveredTopic === 'strengths' || recoveredTopic === 'fit') {
    return {
      intent: { type: 'strengths_assessment' },
      confidence: 'medium',
      matchedCues: [`topic:${recoveredTopic}`],
    };
  }

  if (explicitNamedCaseId) {
    return {
      intent: { type: 'case_discovery', targetCaseId: explicitNamedCaseId },
      confidence: 'medium',
      matchedCues: [`named_case:${explicitNamedCaseId}`],
    };
  }

  if (
    currentCaseCueLabels.length > 0
    && /что.+сделал|что.+делал|какая была роль|в чем была его роль/i.test(text)
  ) {
    return {
      intent: { type: 'case_discovery' },
      confidence: 'medium',
      matchedCues: [...currentCaseCueLabels, 'current_case:role_or_work'],
    };
  }

  if (
    currentCaseCueLabels.length > 0
    && /почему.+сильн|почему этот кейс|почему этот проект.+важен|что этот кейс.+доказыва/i.test(text)
  ) {
    return {
      intent: { type: 'strengths_assessment' },
      confidence: 'medium',
      matchedCues: [...currentCaseCueLabels, 'current_case:strength'],
    };
  }

  if (currentCaseCueLabels.length > 0 && evidenceCueLabels.length > 0) {
    return {
      intent: { type: 'evidence_request' },
      confidence: 'medium',
      matchedCues: [...currentCaseCueLabels, ...evidenceCueLabels],
    };
  }

  if (evidenceCueLabels.length > 0) {
    return {
      intent: { type: 'evidence_request' },
      confidence: 'medium',
      matchedCues: evidenceCueLabels,
    };
  }

  return null;
}

function recoverCurrentCaseIntentFromText(text: string): MessageIntent | null {
  if (isCompactCurrentCaseSummaryRequest(text)) {
    return { type: 'case_discovery' };
  }
  if (/вклад|реально сделал|что именно сделал|какая была.+роль|в чем была.+роль|что здесь сделал он|что здесь его|а не команд/i.test(text)) {
    return { type: 'case_discovery' };
  }
  if (collectCueLabels(text, CASE_PROBLEM_CUES).length > 0) {
    return { type: 'case_discovery' };
  }
  if (
    collectCueLabels(text, CASE_RESEARCH_CUES).length > 0
    || collectCueLabels(text, CASE_DECISION_CUES).length > 0
  ) {
    return { type: 'decision_process' };
  }
  if (
    collectCueLabels(text, CASE_CONSTRAINT_CUES).length > 0
    || collectCueLabels(text, RISK_CUES).length > 0
  ) {
    return { type: 'risk_objection' };
  }
  if (
    collectCueLabels(text, CASE_OUTCOME_CUES).length > 0
    || collectCueLabels(text, EVIDENCE_CUES).length > 0
  ) {
    return { type: 'evidence_request' };
  }
  if (/почему.+сильн|почему этот кейс|почему этот проект.+важен|что этот кейс.+доказыва/i.test(text)) {
    return { type: 'strengths_assessment' };
  }
  if (
    /(?:на\s+что\s+(?:(?:тут|здесь|в\s+этом\s+(?:кейсе|проекте))\s+)?(?:нужно\s+)?обратить\s+внимание|что\s+(?:тут|здесь)\s+(?:самое\s+)?(?:важное|главное))/i.test(text)
  ) {
    return { type: 'strengths_assessment' };
  }
  if (/об этом (?:кейсе|проекте)|в этом (?:кейсе|проекте)/i.test(text)) {
    return { type: 'case_discovery' };
  }
  return null;
}

function resolveScope(
  session: AssistantSession,
  intent: MessageIntent,
  text: string,
  targetCaseId: string | null,
  portfolioWideCueLabels: string[],
  currentCaseCueLabels: string[],
  globalPersonCueLabels: string[],
): { scope: QueryScope; matchedCues: string[] } {
  switch (intent.type) {
    case 'contextual_summary_request':
      if (targetCaseId && portfolioWideCueLabels.length === 0) {
        if (session.selectedContext.kind === 'case' && targetCaseId === session.selectedContext.id) {
          return { scope: 'current_case_only', matchedCues: [`current_case:${targetCaseId}`] };
        }
        return { scope: 'named_case', matchedCues: [`named_case:${targetCaseId}`] };
      }
      if (portfolioWideCueLabels.length > 0) {
        return { scope: 'portfolio_wide', matchedCues: portfolioWideCueLabels };
      }
      if (session.selectedContext.kind === 'case') {
        return { scope: 'current_case_only', matchedCues: ['default:current_case_context'] };
      }
      return { scope: 'portfolio_wide', matchedCues: ['default:portfolio_context'] };
    case 'portfolio_overview':
    case 'mobile_overview':
      return {
        scope: 'portfolio_wide',
        matchedCues: portfolioWideCueLabels.length ? portfolioWideCueLabels : ['default:portfolio_wide'],
      };
    case 'portfolio_value_request':
      return {
        scope: portfolioWideCueLabels.length > 0 ? 'portfolio_wide' : 'global_person',
        matchedCues: portfolioWideCueLabels.length ? portfolioWideCueLabels : ['default:portfolio_value'],
      };
    case 'identity_intro':
    case 'experience_overview':
      return {
        scope: 'global_person',
        matchedCues: globalPersonCueLabels.length ? globalPersonCueLabels : ['default:global_person'],
      };
    case 'strengths_assessment':
    case 'role_fit_assessment':
      if (currentCaseCueLabels.length > 0 && session.selectedContext.kind === 'case') {
        return { scope: 'current_case_only', matchedCues: currentCaseCueLabels };
      }

      return {
        scope: 'global_person',
        matchedCues: globalPersonCueLabels.length
          ? globalPersonCueLabels
          : portfolioWideCueLabels.length
            ? portfolioWideCueLabels
            : ['default:global_person'],
      };
    case 'decision_process':
    case 'evidence_request':
    case 'risk_objection':
      if (currentCaseCueLabels.length > 0 && session.selectedContext.kind === 'case') {
        return { scope: 'current_case_only', matchedCues: currentCaseCueLabels };
      }
      if (targetCaseId && session.selectedContext.kind === 'case' && targetCaseId === session.selectedContext.id) {
        return { scope: 'current_case_only', matchedCues: [`current_case:${targetCaseId}`] };
      }
      if (targetCaseId) {
        return { scope: 'named_case', matchedCues: [`named_case:${targetCaseId}`] };
      }
      if (session.selectedContext.kind === 'case') {
        return { scope: 'current_case_only', matchedCues: ['default:current_case_context'] };
      }
      return { scope: 'global_person', matchedCues: ['default:global_person'] };
    case 'behavioral_fit_assessment':
      // Reliability is a candidate-level question unless the user explicitly
      // anchors it to the current or a named case.
      if (currentCaseCueLabels.length > 0 && session.selectedContext.kind === 'case') {
        return { scope: 'current_case_only', matchedCues: currentCaseCueLabels };
      }
      if (targetCaseId && session.selectedContext.kind === 'case' && targetCaseId === session.selectedContext.id) {
        return { scope: 'current_case_only', matchedCues: [`current_case:${targetCaseId}`] };
      }
      if (targetCaseId) {
        return { scope: 'named_case', matchedCues: [`named_case:${targetCaseId}`] };
      }
      return { scope: 'global_person', matchedCues: ['default:global_person'] };
    case 'case_discovery':
      if (
        session.selectedContext.kind === 'case' &&
        (!targetCaseId || targetCaseId === session.selectedContext.id) &&
        currentCaseCueLabels.length > 0
      ) {
        return { scope: 'current_case_only', matchedCues: currentCaseCueLabels };
      }
      if (
        session.selectedContext.kind === 'case' &&
        targetCaseId &&
        targetCaseId === session.selectedContext.id &&
        portfolioWideCueLabels.length === 0 &&
        globalPersonCueLabels.length === 0
      ) {
        return { scope: 'current_case_only', matchedCues: ['default:current_case_target'] };
      }
      if (targetCaseId) {
        return { scope: 'named_case', matchedCues: [`named_case:${targetCaseId}`] };
      }
      if (session.selectedContext.kind === 'case') {
        return { scope: 'current_case_only', matchedCues: ['default:current_case_context'] };
      }
      return { scope: 'global_person', matchedCues: ['default:global_person'] };
    default:
      return { scope: 'global_person', matchedCues: ['default:global_person'] };
  }
}

export function interpretQuery(
  session: AssistantSession,
  text: string,
  classification: ClassificationLike,
  semanticCandidate?: SemanticInterpretationCandidate | null,
): QueryInterpretation {
  const lowered = text.trim().toLowerCase();
  const portfolioWideCueLabels = collectCueLabels(lowered, PORTFOLIO_WIDE_CUES);
  const currentCaseCueLabels = collectCueLabels(lowered, CURRENT_CASE_CUES);
  const contextCaseCueLabels = collectCueLabels(lowered, CONTEXT_CASE_REFERENCE_CUES);
  const globalPersonCueLabels = collectCueLabels(lowered, GLOBAL_PERSON_CUES);
  const valueBeyondUiCueLabels = collectCueLabels(lowered, VALUE_BEYOND_UI_CUES);
  const candidateIntroCueLabels = collectCueLabels(lowered, CANDIDATE_INTRO_CUES);
  const fastReviewCueLabels = collectCueLabels(lowered, FAST_REVIEW_CUES);
  const summaryCueLabels = collectCueLabels(lowered, SUMMARY_CUES);
  const contextualSummaryCueLabels = collectCueLabels(lowered, CONTEXTUAL_SUMMARY_CUES);
  const caseOutcomeCueLabels = collectCueLabels(lowered, CASE_OUTCOME_CUES);
  const caseResearchCueLabels = collectCueLabels(lowered, CASE_RESEARCH_CUES);
  const caseConstraintCueLabels = collectCueLabels(lowered, CASE_CONSTRAINT_CUES);
  const behavioralFitCueLabels = collectCueLabels(lowered, BEHAVIORAL_FIT_CUES);
  const evidenceCueLabels = collectCueLabels(lowered, EVIDENCE_CUES);
  const riskCueLabels = collectCueLabels(lowered, RISK_CUES);
  const decisionCueLabels = collectCueLabels(lowered, CASE_DECISION_CUES);
  const contributionCueLabels = /вклад|что он реально сделал|что именно сделал|какой был его вклад|что здесь сделал он|а не команда/i.test(lowered);
  const hasSpecializedServerCue = Boolean(
    evidenceCueLabels.length || riskCueLabels.length || caseOutcomeCueLabels.length || caseResearchCueLabels.length
    || caseConstraintCueLabels.length || decisionCueLabels.length || contributionCueLabels,
  );
  const semanticUsable = Boolean(
    semanticCandidate
    && semanticCandidate.confidence >= 0.65
    && !semanticCandidate.needsClarification
    && !hasSpecializedServerCue,
  );
  const explicitNamedCaseId = findExplicitNamedCaseId(lowered)
    ?? (semanticUsable && semanticCandidate?.scopeHint === 'named_case' && semanticCandidate.namedCaseId
      ? findCaseId(semanticCandidate.namedCaseId)
      : null);
  const isBareCompactCurrentCaseSummary =
    session.selectedContext.kind === 'case'
    && isBareCompactCurrentCaseSummaryRequest(lowered);
  const hasExplicitCaseTarget = currentCaseCueLabels.length > 0 || explicitNamedCaseId !== null;
  const isExplicitFastReview = fastReviewCueLabels.length > 0 && !hasExplicitCaseTarget;
  const isExplicitPortfolioCompression =
    portfolioWideCueLabels.length > 0
    && /сожми|обзор|по каждому кейсу|какие.+кейсы|расскажи.+о кейсах/i.test(lowered);
  const isContextualSummaryRequest =
    !hasCaseScopedQuestionCue(lowered)
    && (
      isBareCompactCurrentCaseSummary
      || contextualSummaryCueLabels.length > 0
      || (semanticUsable && semanticCandidate?.intent === 'contextual_summary_request')
    || (
      summaryCueLabels.length > 0
      && /(?:резюме|вывод|главн|итог|сводк|выжимк)/i.test(lowered)
    ));
  // A named case and an explicit request for every case are mutually
  // exclusive. Do not let later cue recovery silently choose one of them.
  const hasContextConflict =
    explicitNamedCaseId !== null
    && portfolioWideCueLabels.length > 0;
  const isTerminalUnsupportedRequest = classification.intent.type === 'unsupported_request';
  const lastReferencedCaseId = getLastReferencedCaseId(session);

  const recovered = classification.intent.type === 'ambiguous_question'
    ? recoverIntentFromText(
        lowered,
        currentCaseCueLabels,
        portfolioWideCueLabels,
        globalPersonCueLabels,
        explicitNamedCaseId,
      )
    : null;
  const currentCaseRecovered =
    session.selectedContext.kind === 'case'
      ? recoverCurrentCaseIntentFromText(lowered)
      : null;

  const contributionInCurrentCase =
    session.selectedContext.kind === 'case'
    && /вклад|что он реально сделал|что именно сделал|какой был его вклад|что здесь сделал он|а не команда/i.test(lowered);

  const caseStrengthInCurrentCase =
    session.selectedContext.kind === 'case'
    && /почему этот кейс сильный|почему этот проект важен|что этот кейс доказывает/i.test(lowered);
  // A direct question about Andrey stays global even inside an open case.
  // It must not depend on the classifier choosing the same general intent.
  const shouldUseCandidateIntro =
    candidateIntroCueLabels.length > 0
    && !hasExplicitCaseTarget;

  const effectiveIntent =
    isTerminalUnsupportedRequest
      ? { type: 'unsupported_request' as const }
      : hasContextConflict
      ? { type: 'ambiguous_question' as const }
      : behavioralFitCueLabels.length > 0
      ? { type: 'behavioral_fit_assessment' as const }
      : valueBeyondUiCueLabels.length > 0
        ? { type: 'strengths_assessment' as const }
      : (currentCaseCueLabels.length > 0 || explicitNamedCaseId) && caseOutcomeCueLabels.length > 0
        ? { type: 'evidence_request' as const }
      : (currentCaseCueLabels.length > 0 || explicitNamedCaseId) && caseConstraintCueLabels.length > 0
        ? { type: 'risk_objection' as const }
      : contributionInCurrentCase && classification.intent.type === 'ambiguous_question'
      ? { type: 'case_discovery' as const }
      : caseStrengthInCurrentCase && classification.intent.type === 'ambiguous_question'
        ? { type: 'strengths_assessment' as const }
        : isContextualSummaryRequest
          ? { type: 'contextual_summary_request' as const }
        : currentCaseRecovered
          ? currentCaseRecovered
        : !explicitNamedCaseId && caseResearchCueLabels.length > 0 && /обычно|андр|процесс|гипотез|исслед/i.test(lowered)
          ? { type: 'decision_process' as const }
        : isExplicitFastReview
          ? { type: 'portfolio_overview' as const }
          : isExplicitPortfolioCompression
            ? { type: 'portfolio_overview' as const }
            : shouldUseCandidateIntro
              ? { type: 'identity_intro' as const }
              : semanticCandidate?.needsClarification || (semanticCandidate && semanticCandidate.confidence < 0.65)
                ? { type: 'ambiguous_question' as const }
                : recovered?.intent ?? classification.intent;
  const effectiveConfidence = hasContextConflict
    ? 'low'
    : isContextualSummaryRequest
      ? 'high'
      : isExplicitFastReview
    ? 'high'
    : behavioralFitCueLabels.length > 0
      ? 'high'
    : isExplicitPortfolioCompression
      ? 'high'
    : shouldUseCandidateIntro
      ? 'high'
    : valueBeyondUiCueLabels.length > 0
      ? 'high'
    : recovered?.confidence ?? classification.confidence;

  let targetCaseId: string | null = null;
  if (explicitNamedCaseId) {
    targetCaseId = explicitNamedCaseId;
  } else if (
    effectiveIntent.type === 'contextual_summary_request'
    && lastReferencedCaseId
    && session.selectedContext.kind !== 'case'
  ) {
    targetCaseId = semanticUsable && semanticCandidate?.scopeHint === 'portfolio'
      ? null
      : lastReferencedCaseId;
  } else if (effectiveIntent.type === 'case_discovery' && effectiveIntent.targetCaseId) {
    targetCaseId = effectiveIntent.targetCaseId;
  } else if (lastReferencedCaseId && contextCaseCueLabels.length > 0 && hasCaseScopedQuestionCue(lowered)) {
    targetCaseId = lastReferencedCaseId;
  } else if (
    session.selectedContext.kind === 'case'
    && (currentCaseCueLabels.length > 0 || hasCaseScopedQuestionCue(lowered) || (semanticUsable && semanticCandidate?.scopeHint === 'selected_case'))
  ) {
    targetCaseId = session.selectedContext.id;
  }

  const scopeResolution = resolveScope(
    session,
    effectiveIntent,
    lowered,
    targetCaseId,
    portfolioWideCueLabels,
    currentCaseCueLabels,
    globalPersonCueLabels,
  );

  const resolvedTargetCaseId =
    targetCaseId
    ?? (scopeResolution.scope === 'current_case_only' && session.selectedContext.kind === 'case'
      ? session.selectedContext.id
      : null);

  const summaryContextSource =
    effectiveIntent.type !== 'contextual_summary_request'
      ? null
      : scopeResolution.scope === 'portfolio_wide'
        ? 'portfolio'
        : explicitNamedCaseId
          ? 'named_case'
          : session.selectedContext.kind === 'case'
            ? 'selected_case'
            : 'last_case_synthesis';

  const resolvedQuestionSubject = resolveQuestionSubject(
    effectiveIntent,
    scopeResolution.scope,
    lowered,
    isExplicitFastReview,
  );
  const questionSubject = semanticUsable
    && semanticCandidate?.questionSubject
    && effectiveIntent.type !== 'contextual_summary_request'
    ? semanticCandidate.questionSubject
    : resolvedQuestionSubject;
  const factFacet = getCaseAwareFacet(
    scopeResolution.scope,
    session,
    effectiveIntent,
    questionSubject,
  );
  const answerType = getAnswerType(
    effectiveIntent,
    scopeResolution.scope,
    lowered,
    questionSubject,
  );
  const isWebExperience =
    effectiveIntent.type === 'experience_overview'
    && /(^|[\s.,!?;:()«»"'/-])(web|веб)(?=$|[\s.,!?;:()«»"'/-])/i.test(lowered);
  const topic = factFacet
    ? getCaseFacetTopic(factFacet)
    : isWebExperience
      ? 'web'
    : questionSubject === 'impact_measurement'
      ? 'decision_making'
    : getGlobalSynthesisTopic(effectiveIntent);

  return {
    intent: effectiveIntent,
    scope: scopeResolution.scope,
    questionSubject,
    answerType,
    topic,
    factFacet,
    targetCaseId: resolvedTargetCaseId,
    summaryContextSource,
    confidence: effectiveConfidence,
    responseLength: summaryCueLabels.length > 0
      ? 'compact'
      : semanticUsable && semanticCandidate?.responseLength === 'compact'
        ? 'compact'
        : 'default',
    matchedCues: isContextualSummaryRequest
      ? [
          ...(isBareCompactCurrentCaseSummary ? ['contextual_summary:bare_current_case'] : contextualSummaryCueLabels),
          ...scopeResolution.matchedCues,
        ]
      : isExplicitFastReview
      ? fastReviewCueLabels
      : isExplicitPortfolioCompression
        ? portfolioWideCueLabels
      : shouldUseCandidateIntro
        ? candidateIntroCueLabels
      : valueBeyondUiCueLabels.length
        ? valueBeyondUiCueLabels
      : recovered?.matchedCues.length
        ? recovered.matchedCues
        : [...scopeResolution.matchedCues, ...contextCaseCueLabels, ...summaryCueLabels],
  };
}
