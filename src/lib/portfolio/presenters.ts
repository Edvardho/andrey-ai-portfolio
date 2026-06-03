import { getSynthesisTopicConfig } from '@/data/portfolio-facts';
import {
  getCaseById,
  getContactContent,
  getEntryPrompts,
  getExperienceRoute,
  getHiringGuide,
  getRailItems,
  portfolioContent,
} from '@/data/portfolio-content';
import { MAX_USER_MESSAGES_PER_SESSION } from '@/lib/portfolio/config';
import type {
  AnswerMode,
  AssistantEnvelope,
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
};

type HiringGuideOverrides = Partial<
  Pick<BaseEnvelopeOptions, 'viewType' | 'presentationVariant' | 'contentBlocks' | 'chips' | 'nextActions'>
>;

function getPromptChipActions(chips: PromptChip[]): UIAction[] {
  return chips.flatMap((chip) => (chip.action ? [chip.action] : []));
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
    },
  };
}

export function buildEntryEnvelope(session: AssistantSession): AssistantEnvelope {
  const chips = getEntryPrompts();

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
    chips,
    contextPanel: portfolioContent.entry.contextPanel,
    nextActions: getPromptChipActions(chips),
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
  const contentBlocks: ContentBlock[] = [
    {
      type: 'lead',
      title: synthesis.title,
      body: synthesis.paragraphs,
    },
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
    chips: config.chips,
    contextPanel,
    nextActions: getPromptChipActions(config.chips),
    responseSource: 'facts_constrained_synthesis',
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
  });
}

function getCaseDiscoveryBlocks(targetCaseId?: string): ContentBlock[] {
  const guide = getHiringGuide('caseDiscovery');
  const normalizedTargetCaseId = targetCaseId && getCaseById(targetCaseId) ? targetCaseId : 'alfa-smart';
  const caseContent = getCaseById(normalizedTargetCaseId);

  if (!caseContent || normalizedTargetCaseId === 'alfa-smart') {
    return guide.contentBlocks;
  }

  return guide.contentBlocks.map((block, index) => {
    if (index === 0 && block.type === 'lead') {
      return {
        ...block,
        title: `Если нужен один релевантный кейс, начни с ${caseContent.shortTitle}`,
        body: [
          `${caseContent.shortTitle} — самый прямой ответ на этот запрос. Я могу коротко объяснить логику здесь, а полный сигнал лежит в самом кейсе.`,
          caseContent.id === 'chatpoint'
            ? 'Это не success-story ради галочки, а полезный anti-case: видно, где Андрей видел продуктовый риск и не прятался за delivery.'
            : 'Если нужна полная картина, лучше открыть сам кейс, а не пытаться выжать весь контекст из одного короткого ответа.',
        ],
      } satisfies ContentBlock;
    }

    if (block.type === 'cta') {
      return {
        ...block,
        label: caseContent.id === 'chatpoint' ? `Перейти к ${caseContent.shortTitle}` : `Открыть ${caseContent.shortTitle}`,
        action: { type: 'open_case_summary', caseId: caseContent.id },
      } satisfies ContentBlock;
    }

    return block;
  });
}

export function buildIdentityIntroEnvelope(session: AssistantSession): AssistantEnvelope {
  return buildHiringGuideEnvelope(session, 'identityProfile');
}

export function buildAssistantIntroEnvelope(session: AssistantSession): AssistantEnvelope {
  return buildHiringGuideEnvelope(session, 'assistantProfile');
}

export function buildCareerSummaryEnvelope(session: AssistantSession): AssistantEnvelope {
  return buildHiringGuideEnvelope(session, 'careerSummary');
}

export function buildCaseDiscoveryEnvelope(
  session: AssistantSession,
  targetCaseId?: string | null,
): AssistantEnvelope {
  return buildHiringGuideEnvelope(session, 'caseDiscovery', {
    contentBlocks: getCaseDiscoveryBlocks(targetCaseId ?? undefined),
  });
}

export function buildMobileSummaryEnvelope(session: AssistantSession): AssistantEnvelope {
  return buildHiringGuideEnvelope(session, 'mobileSummary');
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
          'Я не изображаю всезнающий чат обо всем на свете. Моя работа уже: помочь быстро оценить Андрея по опыту, кейсам, сильным сторонам, ограничениям и доказательствам.',
          'Если тебе нужен реальный hiring signal, лучше вернуться в эти границы, а не устраивать мне викторину по биткоину или погоде.',
        ],
      },
    ],
    chips,
    contextPanel: {
      ...portfolioContent.entry.contextPanel,
      hidden: true,
    },
    nextActions: getPromptChipActions(chips),
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
      cta: { label: 'Связаться с Андреем', action: { type: 'open_contact_modal', source: 'safety' } },
      hidden: true,
    },
    nextActions: getPromptChipActions(chips),
  });
}

export function buildLoadingEnvelope(session: AssistantSession): AssistantEnvelope {
  return createEnvelope({
    session,
    uiState: 'fallback',
    viewType: 'loading',
    presentationVariant: 'loading_row',
    selectedContext: { kind: 'none', id: null, label: null },
    contentBlocks: [
      {
        type: 'lead',
        title: 'Думаю над маршрутом ответа',
        body: [
          'Ассистент не должен стрелять в темноту. Сначала он определяет, какой именно state открыть: кейс, опыт, breadth или контакт.',
        ],
      },
    ],
    contextPanel: {
      ...portfolioContent.entry.contextPanel,
      hidden: true,
    },
  });
}

export function makeContactActions(options: ContactOption[]): UIAction[] {
  return options.map(() => ({ type: 'close_modal' }));
}
