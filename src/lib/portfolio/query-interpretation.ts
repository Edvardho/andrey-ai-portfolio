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
      /подписк/i,
    ],
  },
  { caseId: 'siebel', patterns: [/siebel/i, /оператор/i, /мтс/i] },
  { caseId: 'chatpoint', patterns: [/chatpoint/i, /чатпойнт/i, /anti-case/i] },
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
  { caseId: 'chatpoint', patterns: [/chatpoint/i, /чатпойнт/i] },
  {
    caseId: 'expenses-card-holders',
    patterns: [/расходы держател/i, /держател[ея].+карт/i],
  },
  {
    caseId: 'subscription-sharing',
    patterns: [/шаринг подпис/i, /улучшени[ея].+добавлени[яе].+участник/i],
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
  { label: 'current_case:explicit', patterns: [/в этом кейсе/i, /в этом проекте/i] },
  { label: 'current_case:local', patterns: [/(^|[\s.,!?;:()«»"'/-])здесь($|[\s.,!?;:()«»"'/-])/i, /(^|[\s.,!?;:()«»"'/-])тут($|[\s.,!?;:()«»"'/-])/i] },
  { label: 'current_case:this_case', patterns: [/этот кейс/i, /данный кейс/i] },
];

const GLOBAL_PERSON_CUES: CueDefinition[] = [
  { label: 'global_person:hiring', patterns: [/почему.+звать/i, /стоит.+нанять/i, /как кандидат/i, /почему его стоит/i] },
  { label: 'global_person:better_than_others', patterns: [/лучше других дизайнеров/i, /чем он лучше/i, /чем андрей лучше/i, /отличается от других дизайнеров/i] },
  { label: 'global_person:whole_person', patterns: [/по андрею в целом/i, /в целом по андрею/i, /в целом по опыту/i] },
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

const SUMMARY_CUES: CueDefinition[] = [
  { label: 'summary:brief', patterns: [/кратко/i, /сжато/i, /емко/i, /коротко/i, /без воды/i] },
];

const EXPERIENCE_CUES: CueDefinition[] = [
  { label: 'experience:work_history', patterns: [/опыт работы/i, /его опыт/i, /где он работал/i, /карьер/i, /бэкграунд/i] },
  { label: 'experience:domains', patterns: [/компани/i, /домены/i, /где успел поработать/i] },
];

const EVIDENCE_CUES: CueDefinition[] = [
  { label: 'evidence:proof', patterns: [/доказательств/i, /где это подтверждается/i, /где тут доказательства/i, /пруфы/i, /артефакт/i] },
];

const RISK_CUES: CueDefinition[] = [
  { label: 'risk:weakness', patterns: [/слабое место/i, /слабые стороны/i, /ограничения/i, /риски/i, /что смущает/i] },
  { label: 'risk:failure', patterns: [/почему продукт закрыли/i, /почему закрыли/i, /неудачный кейс/i, /слабый кейс/i] },
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

function hasNegativeCaseCue(text: string): boolean {
  return /неудачн(ый|ого|ом)?\s+кейс|слаб(ый|ого|ом)?\s+кейс|плох(ой|ого|ом)?\s+кейс|провальн(ый|ого|ом)?\s+кейс/i.test(
    text,
  );
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
): QuestionSubject {
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
      if (/вклад|реально сделал|что именно сделал|что здесь сделал он|что здесь его|а не команд/i.test(text)) {
        return 'case_contribution';
      }
      return 'case_summary';
    case 'evidence_request':
      return 'case_evidence';
    case 'risk_objection':
      return 'risk_check';
    case 'decision_process':
      return scope === 'current_case_only' ? 'case_summary' : 'candidate_value';
    case 'identity_intro':
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
      return 'fit';
    case 'role':
      return 'fit';
    case 'decisions':
      return 'decision_making';
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
      if (questionSubject === 'case_contribution') {
        return 'contribution_breakdown';
      }
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
    case 'ambiguous_question': {
      const recoveredTopic = detectSynthesisTopic(text);
      if (!recoveredTopic) {
        return null;
      }

      switch (recoveredTopic) {
        case 'experience':
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

  switch (intent.type) {
    case 'case_discovery':
      return questionSubject === 'case_contribution' ? 'role' : 'overview';
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
  const portfolioValueCueLabels = collectCueLabels(text, PORTFOLIO_VALUE_CUES);
  const recoveredTopic = detectSynthesisTopic(text);

  if (portfolioValueCueLabels.length > 0) {
    return {
      intent: { type: 'portfolio_value_request' },
      confidence: 'medium',
      matchedCues: portfolioValueCueLabels,
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

  if (riskCueLabels.length > 0) {
    return {
      intent: { type: 'risk_objection' },
      confidence: 'medium',
      matchedCues: riskCueLabels,
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
      if (targetCaseId) {
        return { scope: 'named_case', matchedCues: [`named_case:${targetCaseId}`] };
      }
      if (session.selectedContext.kind === 'case') {
        return { scope: 'current_case_only', matchedCues: ['default:current_case_context'] };
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
): QueryInterpretation {
  const lowered = text.trim().toLowerCase();
  const portfolioWideCueLabels = collectCueLabels(lowered, PORTFOLIO_WIDE_CUES);
  const currentCaseCueLabels = collectCueLabels(lowered, CURRENT_CASE_CUES);
  const globalPersonCueLabels = collectCueLabels(lowered, GLOBAL_PERSON_CUES);
  const explicitNamedCaseId = findExplicitNamedCaseId(lowered);

  const recovered = classification.intent.type === 'ambiguous_question'
    ? recoverIntentFromText(
        lowered,
        currentCaseCueLabels,
        portfolioWideCueLabels,
        globalPersonCueLabels,
        explicitNamedCaseId,
      )
    : null;

  const contributionInCurrentCase =
    session.selectedContext.kind === 'case'
    && /вклад|что он реально сделал|что именно сделал|какой был его вклад|что здесь сделал он|а не команда/i.test(lowered);

  const caseStrengthInCurrentCase =
    session.selectedContext.kind === 'case'
    && /почему этот кейс сильный|почему этот проект важен|что этот кейс доказывает/i.test(lowered);

  const effectiveIntent =
    contributionInCurrentCase && classification.intent.type === 'ambiguous_question'
      ? { type: 'case_discovery' as const }
      : caseStrengthInCurrentCase && classification.intent.type === 'ambiguous_question'
        ? { type: 'strengths_assessment' as const }
        : recovered?.intent ?? classification.intent;
  const effectiveConfidence = recovered?.confidence ?? classification.confidence;

  const targetCaseId =
    effectiveIntent.type === 'case_discovery' && effectiveIntent.targetCaseId
      ? effectiveIntent.targetCaseId
      : explicitNamedCaseId
        ? explicitNamedCaseId
        : session.selectedContext.kind === 'case' && currentCaseCueLabels.length > 0
          ? session.selectedContext.id
          : null;

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

  const questionSubject = resolveQuestionSubject(
    effectiveIntent,
    scopeResolution.scope,
    lowered,
  );
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
  const topic = factFacet
    ? getCaseFacetTopic(factFacet)
    : getGlobalSynthesisTopic(effectiveIntent);

  return {
    intent: effectiveIntent,
    scope: scopeResolution.scope,
    questionSubject,
    answerType,
    topic,
    factFacet,
    targetCaseId: resolvedTargetCaseId,
    confidence: effectiveConfidence,
    matchedCues: recovered?.matchedCues.length
      ? recovered.matchedCues
      : scopeResolution.matchedCues,
  };
}
