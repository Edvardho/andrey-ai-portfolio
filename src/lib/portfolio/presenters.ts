import { getCaseFactPack } from '@/data/portfolio-case-facts';
import { candidateFastReview } from '@/data/portfolio-candidate-review';
import { getSynthesisTopicConfig } from '@/data/portfolio-facts';
import {
  getCaseById,
  getContactContent,
  getExperienceRoute,
  getHiringGuide,
  getRailItems,
  portfolioContent,
} from '@/data/portfolio-content.server';
import { getAIMode, MAX_USER_MESSAGES_PER_SESSION } from '@/lib/portfolio/config';
import { getSessionStoreMode } from '@/lib/portfolio/session-store';
import type {
  AnswerType,
  AnswerMode,
  AssistantEnvelope,
  AssistantReplyState,
  AssistantSession,
  ContactOption,
  ContentBlock,
  ModalPayload,
  PresentationVariant,
  PromptChip,
  ResponseSource,
  SafetyState,
  SelectedContext,
  SynthesisSnapshot,
  QueryScope,
  QuestionSubject,
  UIAction,
  UIState,
  ViewType,
} from '@/lib/portfolio/types';

type BaseEnvelopeOptions = {
  session: AssistantSession;
  viewType: ViewType;
  presentationVariant: PresentationVariant;
  uiState?: UIState;
  answerMode?: AnswerMode | null;
  selectedContext?: SelectedContext;
  contentBlocks?: ContentBlock[];
  chips?: PromptChip[];
  contextPanel?: AssistantEnvelope['contextPanel'];
  modal?: ModalPayload | null;
  safetyState?: SafetyState;
  nextActions?: UIAction[];
  responseSource?: ResponseSource;
  assistantReplyState?: AssistantReplyState;
  answerType?: AnswerType | null;
  queryScope?: QueryScope | null;
  questionSubject?: QuestionSubject | null;
};

type HiringGuideOverrides = Partial<
  Pick<BaseEnvelopeOptions, 'viewType' | 'presentationVariant' | 'contentBlocks' | 'chips' | 'nextActions' | 'assistantReplyState'>
>;

function getPromptChipActions(chips: PromptChip[]): UIAction[] {
  return chips.flatMap((chip) => (chip.action ? [chip.action] : []));
}

function getMessageChipTopic(chip: PromptChip): SynthesisSnapshot['topic'] | null {
  if (!('message' in chip) || typeof chip.message !== 'string') {
    return null;
  }

  const message = chip.message.toLowerCase();

  if (/опыт работы|его опыт|пройдись по.*опыт/.test(message)) {
    return 'experience';
  }

  if (/кто такой|расскажи про андрея/.test(message)) {
    return 'identity';
  }

  if (/ограничени|слабое место|слабые зоны|риск/.test(message)) {
    return 'risks';
  }

  if (/сильн.+кейс|альфа/.test(message)) {
    return 'strengths';
  }

  return null;
}

function getMessageChipQuestionSubject(chip: PromptChip): QuestionSubject | null {
  if (!('message' in chip) || typeof chip.message !== 'string') {
    return null;
  }

  const message = chip.message.toLowerCase();

  if (/интервью|звать|нанять/.test(message)) {
    return 'interview_decision';
  }

  if (/слабое место|ограничени|риск/.test(message)) {
    return 'risk_check';
  }

  if (/опыт работы|его опыт|пройдись по.*опыт/.test(message)) {
    return 'experience_summary';
  }

  return null;
}

function filterRedundantSynthesisChips(
  synthesis: SynthesisSnapshot,
  chips: PromptChip[],
): PromptChip[] {
  return chips.filter((chip) => {
    const chipTopic = getMessageChipTopic(chip);
    const chipSubject = getMessageChipQuestionSubject(chip);

    if (chipTopic && chipTopic === synthesis.topic) {
      return false;
    }

    if (chipSubject && chipSubject === synthesis.questionSubject) {
      return false;
    }

    return true;
  });
}

function createEnvelope({
  session,
  viewType,
  presentationVariant,
  uiState = 'ready',
  answerMode = null,
  selectedContext = session.selectedContext,
  contentBlocks = [],
  chips = [],
  contextPanel = portfolioContent.entry.contextPanel,
  modal = null,
  safetyState = 'none',
  nextActions = [],
  responseSource = 'authored',
  assistantReplyState = 'authored_reply',
  answerType = null,
  queryScope = null,
  questionSubject = null,
}: BaseEnvelopeOptions): AssistantEnvelope {
  return {
    sessionId: session.id,
    uiState,
    viewType,
    presentationVariant,
    selectedContext,
    answerMode,
    railItems: getRailItems(),
    contentBlocks,
    chips,
    contextPanel,
    modal,
    safetyState,
    nextActions,
    meta: {
      userMessagesUsed: session.userMessageCount,
      userMessagesRemaining: Math.max(MAX_USER_MESSAGES_PER_SESSION - session.userMessageCount, 0),
      responseSource,
      assistantReplyState,
      sessionStoreMode: getSessionStoreMode(),
      answerType,
      queryScope,
      questionSubject,
      aiMode: getAIMode(),
    },
  };
}

function getReplyStateForSynthesis(status: SynthesisSnapshot['answerStatus']): AssistantReplyState {
  switch (status) {
    case 'insufficient_facts':
      return 'insufficient_facts';
    case 'needs_clarification':
      return 'clarifying_question';
    case 'navigation_suggested':
      return 'navigation_suggestion';
    case 'grounded':
    default:
      return 'grounded_answer';
  }
}

export function buildEntryEnvelope(session: AssistantSession): AssistantEnvelope {
  return createEnvelope({
    session,
    viewType: 'entry',
    presentationVariant: 'plain_text_reply',
    selectedContext: { kind: 'none', id: null, label: null },
    contentBlocks: [
      {
        type: 'lead',
        title: portfolioContent.entry.title,
        body: [portfolioContent.entry.subtitle],
      },
    ],
    contextPanel: portfolioContent.entry.contextPanel,
  });
}

export function buildCandidateFastReviewEnvelope(session: AssistantSession): AssistantEnvelope {
  const contentBlocks: ContentBlock[] = [
    {
      type: 'lead',
      title: candidateFastReview.intro.title,
      body: candidateFastReview.intro.body,
    },
    {
      type: 'section',
      title: candidateFastReview.projectScope.title,
      body: candidateFastReview.projectScope.body,
    },
    {
      type: 'section',
      title: candidateFastReview.watchOrder.title,
      body: candidateFastReview.watchOrder.body,
    },
    {
      type: 'section',
      title: candidateFastReview.disclosureTitle,
      body: candidateFastReview.disclosures.map((item) => `${item.label}. ${item.body}`),
    },
    {
      type: 'section',
      title: candidateFastReview.hiringLeadNote.title,
      body: candidateFastReview.hiringLeadNote.body,
    },
  ];

  return createEnvelope({
    session,
    viewType: 'candidate_fast_review',
    presentationVariant: 'candidate_fast_review',
    selectedContext: { kind: 'none', id: null, label: null },
    contentBlocks,
    contextPanel: {
      ...portfolioContent.entry.contextPanel,
      hidden: true,
    },
    nextActions: [candidateFastReview.footerAction.action],
    responseSource: 'authored',
    assistantReplyState: 'grounded_answer',
    answerType: 'candidate_fast_review',
    queryScope: 'portfolio_wide',
    questionSubject: 'candidate_fast_review',
  });
}

export function buildCaseEnvelope(
  session: AssistantSession,
  caseId: string,
  mode: AnswerMode,
): AssistantEnvelope {
  const caseContent = getCaseById(caseId);
  if (!caseContent) {
    return buildNoMatchingEnvelope(session);
  }

  return createEnvelope({
    session,
    viewType: mode === 'summary' ? 'case_summary' : 'case_detail',
    presentationVariant: mode === 'summary' ? 'case_summary' : 'sectioned_reply',
    answerMode: mode,
    selectedContext: { kind: 'case', id: caseContent.id, label: caseContent.shortTitle },
    contentBlocks: mode === 'summary' ? caseContent.summaryBlocks : caseContent.detailBlocks,
    contextPanel: caseContent.contextPanel,
  });
}

export function buildCaseRouteEnvelope(session: AssistantSession, caseId: string): AssistantEnvelope {
  const caseContent = getCaseById(caseId);
  if (!caseContent) {
    return buildNoMatchingEnvelope(session);
  }

  return createEnvelope({
    session,
    viewType: 'case_route',
    presentationVariant: 'sectioned_reply',
    selectedContext: { kind: 'case', id: caseContent.id, label: caseContent.shortTitle },
    contentBlocks: caseContent.routeBlocks,
    contextPanel: caseContent.contextPanel,
    nextActions: [
      { type: 'open_case_summary', caseId },
      { type: 'open_case_detail', caseId },
    ],
  });
}

export function buildGeneralSynthesisEnvelope(
  session: AssistantSession,
  synthesis: SynthesisSnapshot,
): AssistantEnvelope {
  const config = getSynthesisTopicConfig(synthesis.topic);
  const chips = filterRedundantSynthesisChips(synthesis, synthesis.chips ?? config.chips);
  const contentBlocks: ContentBlock[] = [
    {
      type: 'lead',
      title: '',
      body: [synthesis.intro, ...synthesis.followupParagraphs],
    },
    ...synthesis.sections.map((section) => ({
      type: 'section' as const,
      title: section.title,
      body: [section.body],
    })),
  ];

  if (synthesis.bullets.length) {
    contentBlocks.push({
      type: 'bullet_list',
      title: 'Что это подтверждает',
      items: synthesis.bullets,
    });
  }

  const contextPanel =
    session.selectedContext.kind === 'case'
      ? getCaseById(session.selectedContext.id)?.contextPanel ?? portfolioContent.entry.contextPanel
      : session.selectedContext.kind === 'experience'
        ? portfolioContent.experience.contextPanel
        : session.selectedContext.kind === 'overview'
          ? session.selectedContext.id === 'mobile-experience'
            ? portfolioContent.mobileOverview.contextPanel
            : portfolioContent.additionalCases.contextPanel
          : portfolioContent.entry.contextPanel;

  return createEnvelope({
    session,
    viewType: 'general_synthesis',
    presentationVariant: synthesis.bullets.length ? 'bullet_reply' : 'plain_text_reply',
    contentBlocks,
    chips,
    contextPanel,
    nextActions: getPromptChipActions(chips),
    responseSource: 'facts_constrained_synthesis',
    assistantReplyState: getReplyStateForSynthesis(synthesis.answerStatus),
    answerType: synthesis.answerType,
    queryScope: synthesis.queryScope,
    questionSubject: synthesis.questionSubject,
  });
}

export function buildMobileOverviewEnvelope(session: AssistantSession): AssistantEnvelope {
  const chips = portfolioContent.mobileOverview.followUpChips;

  return createEnvelope({
    session,
    viewType: 'mobile_experience_overview',
    presentationVariant: 'sectioned_reply',
    selectedContext: { kind: 'overview', id: 'mobile-experience', label: 'Мобильный опыт' },
    contentBlocks: portfolioContent.mobileOverview.summaryBlocks,
    chips,
    contextPanel: portfolioContent.mobileOverview.contextPanel,
    nextActions: getPromptChipActions(chips),
  });
}

export function buildMobileCaseEnvelope(
  session: AssistantSession,
  caseId: string,
  mode: AnswerMode,
): AssistantEnvelope {
  const caseContent = getCaseById(caseId);
  if (!caseContent) {
    return buildNoMatchingEnvelope(session);
  }

  return createEnvelope({
    session,
    viewType: mode === 'summary' ? 'mobile_case_summary' : 'mobile_case_detail',
    presentationVariant: mode === 'summary' ? 'case_summary' : 'sectioned_reply',
    answerMode: mode,
    selectedContext: { kind: 'case', id: caseId, label: caseContent.shortTitle },
    contentBlocks: mode === 'summary' ? caseContent.summaryBlocks : caseContent.detailBlocks,
    contextPanel: caseContent.contextPanel,
  });
}

export function buildExperienceEnvelope(
  session: AssistantSession,
  mode: AnswerMode,
): AssistantEnvelope {
  const chips = portfolioContent.experience.followUpChips;

  return createEnvelope({
    session,
    viewType: mode === 'summary' ? 'experience_summary' : 'experience_detail',
    presentationVariant: mode === 'summary' ? 'experience_summary' : 'sectioned_reply',
    answerMode: mode,
    selectedContext: { kind: 'experience', id: 'experience', label: 'Опыт работы' },
    contentBlocks: mode === 'summary' ? portfolioContent.experience.summaryBlocks : portfolioContent.experience.detailBlocks,
    chips,
    contextPanel: portfolioContent.experience.contextPanel,
    nextActions: getPromptChipActions(chips),
  });
}

export function buildExperienceRouteEnvelope(
  session: AssistantSession,
  caseId: string,
): AssistantEnvelope {
  const caseContent = getCaseById(caseId);
  if (!caseContent) {
    return buildNoMatchingEnvelope(session);
  }

  return createEnvelope({
    session,
    viewType: 'experience_route',
    presentationVariant: 'sectioned_reply',
    selectedContext: { kind: 'case', id: caseContent.id, label: caseContent.shortTitle },
    contentBlocks: getExperienceRoute(caseId),
    contextPanel: caseContent.contextPanel,
    nextActions: [
      { type: 'open_case_summary', caseId },
      { type: 'open_case_detail', caseId },
    ],
  });
}

export function buildAdditionalCasesEnvelope(session: AssistantSession): AssistantEnvelope {
  const chips = portfolioContent.additionalCases.followUpChips;

  return createEnvelope({
    session,
    viewType: 'additional_cases_overview',
    presentationVariant: 'sectioned_reply',
    selectedContext: { kind: 'overview', id: 'additional-cases', label: 'Дополнительные кейсы' },
    contentBlocks: portfolioContent.additionalCases.summaryBlocks,
    chips,
    contextPanel: portfolioContent.additionalCases.contextPanel,
    nextActions: getPromptChipActions(chips),
  });
}

function buildHiringGuideEnvelope(
  session: AssistantSession,
  guideKey: Parameters<typeof getHiringGuide>[0],
  overrides: HiringGuideOverrides = {},
): AssistantEnvelope {
  const guide = getHiringGuide(guideKey);
  const chips = overrides.chips ?? guide.chips;

  return createEnvelope({
    session,
    viewType: overrides.viewType ?? guide.viewType,
    presentationVariant: overrides.presentationVariant ?? guide.presentationVariant,
    selectedContext: { kind: 'none', id: null, label: null },
    contentBlocks: overrides.contentBlocks ?? guide.contentBlocks,
    chips,
    contextPanel: {
      ...guide.contextPanel,
      hidden: true,
    },
    nextActions: overrides.nextActions ?? getPromptChipActions(chips),
    assistantReplyState: overrides.assistantReplyState ?? 'authored_reply',
  });
}

function getCaseDiscoveryBlocks(targetCaseId?: string): ContentBlock[] {
  const guide = getHiringGuide('caseDiscovery');
  const normalizedTargetCaseId = targetCaseId && getCaseById(targetCaseId) ? targetCaseId : 'alfa-smart';
  const caseContent = getCaseById(normalizedTargetCaseId);
  const caseFacts = getCaseFactPack(normalizedTargetCaseId);

  if (!caseContent || !caseFacts) {
    return guide.contentBlocks;
  }

  return [
    {
      type: 'lead',
      title: `Кратко про ${caseContent.shortTitle}`,
      body: [
        caseFacts.recruiterSummary.intro,
        caseFacts.recruiterSummary.followup ?? 'Если нужна полная картина, лучше открыть сам кейс и посмотреть его целиком.',
      ].filter(Boolean),
    },
    {
      type: 'cta',
      label: `Открыть ${caseContent.shortTitle}`,
      action: { type: 'open_case_summary', caseId: caseContent.id },
    },
  ];
}

export function buildIdentityIntroEnvelope(session: AssistantSession): AssistantEnvelope {
  return buildHiringGuideEnvelope(session, 'identityProfile');
}

export function buildAssistantIntroEnvelope(session: AssistantSession): AssistantEnvelope {
  return buildHiringGuideEnvelope(session, 'assistantProfile');
}

export function buildAssistantTrustEnvelope(session: AssistantSession): AssistantEnvelope {
  const chips: PromptChip[] = [
    { id: 'trust-proof', label: 'Где доказательства?', message: 'Где доказательства его опыта?' },
    { id: 'trust-weak-case', label: 'Проверь слабый кейс', message: 'Был ли слабый кейс?' },
    { id: 'trust-contribution', label: 'Что он сделал сам?', message: 'Что Андрей сделал сам в Альфа-Смарте, а не команда?' },
  ];

  return createEnvelope({
    session,
    viewType: 'assistant_intro',
    presentationVariant: 'plain_text_reply',
    selectedContext: session.selectedContext,
    contentBlocks: [
      {
        type: 'lead',
        title: 'Честно? Частично ты прав.',
        body: [
          'Я не свободный чат-бот обо всем и не притворяюсь человеком. Я специально ограничен портфолио Андрея: беру вопрос, сопоставляю его с кейсами и отвечаю только по подтвержденным фактам.',
          'Это сделано не чтобы “зашаблонить” ответ, а чтобы не выдумывать опыт и не подстраиваться под лида. Проверять меня лучше неудобными вопросами: что Андрей сделал сам, где есть метрики, какой кейс слабый и где продукт не сработал.',
        ],
      },
    ],
    chips,
    contextPanel: {
      ...portfolioContent.entry.contextPanel,
      hidden: true,
    },
    nextActions: getPromptChipActions(chips),
    assistantReplyState: 'authored_reply',
  });
}

export function buildCareerSummaryEnvelope(session: AssistantSession): AssistantEnvelope {
  return buildHiringGuideEnvelope(session, 'careerSummary', {
    assistantReplyState: 'navigation_suggestion',
  });
}

export function buildCaseDiscoveryEnvelope(
  session: AssistantSession,
  targetCaseId?: string | null,
): AssistantEnvelope {
  return buildHiringGuideEnvelope(session, 'caseDiscovery', {
    contentBlocks: getCaseDiscoveryBlocks(targetCaseId ?? undefined),
    assistantReplyState: 'navigation_suggestion',
  });
}

export function buildMobileSummaryEnvelope(session: AssistantSession): AssistantEnvelope {
  return buildHiringGuideEnvelope(session, 'mobileSummary', {
    assistantReplyState: 'navigation_suggestion',
  });
}

export function buildStrengthsEnvelope(session: AssistantSession): AssistantEnvelope {
  return buildHiringGuideEnvelope(session, 'strengthsMap');
}

export function buildRoleFitEnvelope(session: AssistantSession): AssistantEnvelope {
  return buildHiringGuideEnvelope(session, 'roleFit');
}

export function buildDecisionProcessEnvelope(session: AssistantSession): AssistantEnvelope {
  return buildHiringGuideEnvelope(session, 'decisionMakingPatterns');
}

export function buildEvidenceEnvelope(session: AssistantSession): AssistantEnvelope {
  return buildHiringGuideEnvelope(session, 'evidenceIndex');
}

export function buildRiskEnvelope(session: AssistantSession): AssistantEnvelope {
  return buildHiringGuideEnvelope(session, 'risksAndLimits');
}

export function buildContactModalEnvelope(session: AssistantSession, source?: string): AssistantEnvelope {
  const content = getContactContent();

  return createEnvelope({
    session,
    viewType: 'contact_modal',
    presentationVariant: 'plain_text_reply',
    uiState: 'modal',
    selectedContext: session.selectedContext,
    modal: {
      type: 'contact',
      title: content.title,
      helper: source
        ? `${content.helper} Источник: ${source}.`
        : content.helper,
      options: content.options,
    },
    contentBlocks: [],
    chips: [],
    contextPanel: portfolioContent.entry.contextPanel,
    nextActions: [{ type: 'close_modal' }],
  });
}

export function buildImageModalEnvelope(
  session: AssistantSession,
  caseId: string,
  artifactId: string,
): AssistantEnvelope {
  const caseContent = getCaseById(caseId);
  const artifact = caseContent?.artifacts.find((item) => item.id === artifactId);

  if (!caseContent || !artifact) {
    return buildNoMatchingEnvelope(session);
  }

  return createEnvelope({
    session,
    viewType: 'image_modal',
    presentationVariant: 'plain_text_reply',
    uiState: 'modal',
    selectedContext: { kind: 'case', id: caseContent.id, label: caseContent.shortTitle },
    modal: {
      type: 'image',
      title: artifact.title,
      caption: artifact.caption,
      imageUrl: artifact.imageUrl,
      sourceLabel: artifact.sourceLabel,
      note: artifact.note,
    },
    contextPanel: caseContent.contextPanel,
    nextActions: [{ type: 'close_modal' }],
  });
}

export function buildLimitEnvelope(session: AssistantSession): AssistantEnvelope {
  const chips: PromptChip[] = [
    { id: 'limit-contact', label: 'Связаться с Андреем', action: { type: 'open_contact_modal', source: 'limit' } },
    { id: 'limit-alfa', label: 'Открыть Альфа-Смарт', action: { type: 'open_case_summary', caseId: 'alfa-smart' } },
  ];

  return createEnvelope({
    session,
    uiState: 'limit_reached',
    viewType: 'limit_reached',
    presentationVariant: 'refusal_reply',
    safetyState: 'limit_reached',
    contentBlocks: [
      {
        type: 'lead',
        title: 'Лимит вопросов на эту сессию закончился',
        body: [
          'На V1 ассистент держит границы жестко: после 20 пользовательских сообщений пора переходить к прямому контакту.',
          'Если интерес не декоративный, дальше логичнее не мучить чат, а написать Андрею напрямую.',
        ],
    },
    ],
    chips,
    contextPanel: {
      title: 'Контакт',
      subtitle: 'Next step',
      tags: ['Telegram', 'LinkedIn', 'e-mail'],
      note: 'Это осознанное ограничение MVP: ассистент не превращается в бесконечный чат и быстро выводит на живой контакт.',
      cta: { label: 'Открыть контакты', action: { type: 'open_contact_modal', source: 'limit' } },
    },
    nextActions: getPromptChipActions(chips),
    assistantReplyState: 'safety_refusal',
  });
}

export function buildAmbiguousEnvelope(session: AssistantSession): AssistantEnvelope {
  const chips: PromptChip[] = [
    { id: 'ambiguous-identity', label: 'Расскажи про Андрея', message: 'Расскажи про Андрея' },
    { id: 'ambiguous-exp', label: 'Какой у него опыт работы', message: 'Какой у него опыт работы' },
    { id: 'ambiguous-mobile', label: 'Что делал в мобилке', message: 'Что делал в мобилке?' },
    { id: 'ambiguous-web', label: 'Что делал в web', message: 'Что делал в web?' },
  ];

  return createEnvelope({
    session,
    uiState: 'fallback',
    viewType: 'ambiguous_question',
    presentationVariant: 'refusal_reply',
    selectedContext: { kind: 'none', id: null, label: null },
    safetyState: 'ambiguous_question',
    contentBlocks: [
      {
        type: 'lead',
        title: 'Прости, но я не знаю ответа на этот вопрос.',
        body: [
          'Я могу быстро представить Андрея, показать его опыт, сильный кейс, ограничения или доказательства.',
        ],
      },
    ],
    chips,
    contextPanel: {
      ...portfolioContent.entry.contextPanel,
      hidden: true,
    },
    nextActions: getPromptChipActions(chips),
    assistantReplyState: 'clarifying_question',
  });
}

export function buildNoMatchingEnvelope(
  session: AssistantSession,
  requestedCase?: string,
): AssistantEnvelope {
  const chips: PromptChip[] = [
    { id: 'nomatch-alfa', label: 'Открыть Альфа-Смарт', action: { type: 'open_case_summary', caseId: 'alfa-smart' } },
    { id: 'nomatch-exp', label: 'Открыть опыт работы', action: { type: 'open_experience_summary' } },
    { id: 'nomatch-chatpoint', label: 'Перейти к ChatPoint', action: { type: 'open_case_summary', caseId: 'chatpoint' } },
  ];

  return createEnvelope({
    session,
    uiState: 'fallback',
    viewType: 'no_matching_case',
    presentationVariant: 'refusal_reply',
    selectedContext: { kind: 'none', id: null, label: null },
    safetyState: 'no_matching_case',
    contentBlocks: [
      {
        type: 'lead',
        title: requestedCase ? `Кейса «${requestedCase}» в портфолио нет` : 'В базе нет такого кейса',
        body: [
          'Ассистент не выдумывает кейсы и не притворяется, что знает больше, чем реально есть в портфолио.',
          'Лучше перейти к одному из подтвержденных кейсов или к общему опыту работы.',
        ],
      },
    ],
    chips,
    contextPanel: {
      ...portfolioContent.entry.contextPanel,
      hidden: true,
    },
    nextActions: getPromptChipActions(chips),
    assistantReplyState: 'insufficient_facts',
  });
}

export function buildUnsupportedEnvelope(session: AssistantSession): AssistantEnvelope {
  const chips: PromptChip[] = [
    { id: 'unsupported-assistant', label: 'Кто ты такой?', message: 'Кто ты такой?' },
    { id: 'unsupported-identity', label: 'Кто такой Андрей?', message: 'Кто такой Андрей?' },
    { id: 'unsupported-exp', label: 'Какой опыт работы?', message: 'Какой опыт работы?' },
    { id: 'unsupported-alfa', label: 'Покажи сильный кейс', message: 'Покажи сильный кейс' },
  ];

  return createEnvelope({
    session,
    uiState: 'fallback',
    viewType: 'unsupported_request',
    presentationVariant: 'refusal_reply',
    selectedContext: { kind: 'none', id: null, label: null },
    safetyState: 'unsupported_request',
    contentBlocks: [
      {
        type: 'lead',
        title: 'Этот вопрос вне границ ассистента',
        body: [
          'Я тут не для того, чтобы развлекать тебя случайными байками. За этим лучше к КВН, Comedy Club или в любую соцсеть, где алгоритм уже потерял надежду.',
          'Моя зона уже: быстро оценить Андрея по опыту, кейсам, сильным сторонам, ограничениям и доказательствам.',
        ],
      },
    ],
    chips,
    contextPanel: {
      ...portfolioContent.entry.contextPanel,
      hidden: true,
    },
    nextActions: getPromptChipActions(chips),
    assistantReplyState: 'safety_refusal',
  });
}

export function buildSafetyEnvelope(
  session: AssistantSession,
  title: string,
  body: string[],
  safetyState: SafetyState,
  chips: PromptChip[],
): AssistantEnvelope {
  return createEnvelope({
    session,
    uiState: 'fallback',
    viewType: 'safety_refusal',
    presentationVariant: 'refusal_reply',
    selectedContext: { kind: 'none', id: null, label: null },
    safetyState,
    contentBlocks: [{ type: 'lead', title, body }],
    chips,
    contextPanel: {
      title: 'Границы ассистента',
      subtitle: 'Safety',
      tags: ['Кейсы', 'Опыт', 'Контакт'],
      note: 'Ассистент держит узкий scope специально: так меньше шума и выше доверие к ответам.',
      cta: { label: 'Написать Андрею', action: { type: 'open_contact_modal', source: 'safety' } },
      hidden: true,
    },
    nextActions: getPromptChipActions(chips),
    assistantReplyState: 'safety_refusal',
  });
}

export function buildErrorRetryEnvelope(session: AssistantSession): AssistantEnvelope {
  return createEnvelope({
    session,
    uiState: 'fallback',
    viewType: 'unsupported_request',
    presentationVariant: 'refusal_reply',
    selectedContext: { kind: 'none', id: null, label: null },
    contentBlocks: [
      {
        type: 'lead',
        title: 'Ответ не загрузился',
        body: [
          'Это техническая ошибка запроса, а не нехватка фактов в портфолио. Можно повторить попытку.',
        ],
      },
    ],
    chips: [],
    contextPanel: {
      ...portfolioContent.entry.contextPanel,
      hidden: true,
    },
    assistantReplyState: 'error_retry',
  });
}

export function buildLoadingEnvelope(session: AssistantSession): AssistantEnvelope {
  return createEnvelope({
    session,
    uiState: 'fallback',
    viewType: 'loading',
    presentationVariant: 'loading_row',
    selectedContext: { kind: 'none', id: null, label: null },
    contentBlocks: [],
    contextPanel: {
      ...portfolioContent.entry.contextPanel,
      hidden: true,
    },
    assistantReplyState: 'thinking',
  });
}

export function makeContactActions(options: ContactOption[]): UIAction[] {
  return options.map(() => ({ type: 'close_modal' }));
}
