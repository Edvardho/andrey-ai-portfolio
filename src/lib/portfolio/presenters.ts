import {
  getCaseById,
  getContactContent,
  getEntryPrompts,
  getExperienceRoute,
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
  PromptChip,
  SafetyState,
  SelectedContext,
  UIAction,
  UIState,
  ViewType,
} from '@/lib/portfolio/types';

type BaseEnvelopeOptions = {
  session: AssistantSession;
  viewType: ViewType;
  uiState?: UIState;
  answerMode?: AnswerMode | null;
  selectedContext?: SelectedContext;
  contentBlocks?: ContentBlock[];
  chips?: PromptChip[];
  contextPanel?: AssistantEnvelope['contextPanel'];
  modal?: ModalPayload | null;
  safetyState?: SafetyState;
  nextActions?: UIAction[];
};

function createEnvelope({
  session,
  viewType,
  uiState = 'ready',
  answerMode = null,
  selectedContext = session.selectedContext,
  contentBlocks = [],
  chips = [],
  contextPanel = portfolioContent.entry.contextPanel,
  modal = null,
  safetyState = 'none',
  nextActions = [],
}: BaseEnvelopeOptions): AssistantEnvelope {
  return {
    sessionId: session.id,
    uiState,
    viewType,
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
    },
  };
}

export function buildEntryEnvelope(session: AssistantSession): AssistantEnvelope {
  return createEnvelope({
    session,
    viewType: 'entry',
    selectedContext: { kind: 'none', id: null, label: null },
    contentBlocks: [
      {
        type: 'lead',
        title: portfolioContent.entry.title,
        body: [portfolioContent.entry.subtitle],
      },
    ],
    chips: getEntryPrompts(),
    contextPanel: portfolioContent.entry.contextPanel,
    nextActions: getEntryPrompts().map((chip) => chip.action),
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
    answerMode: mode,
    selectedContext: { kind: 'case', id: caseContent.id, label: caseContent.shortTitle },
    contentBlocks: mode === 'summary' ? caseContent.summaryBlocks : caseContent.detailBlocks,
    chips: caseContent.followUpChips,
    contextPanel: caseContent.contextPanel,
    nextActions: caseContent.followUpChips.map((chip) => chip.action),
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
    selectedContext: { kind: 'case', id: caseContent.id, label: caseContent.shortTitle },
    contentBlocks: caseContent.routeBlocks,
    chips: [
      { id: `${caseId}-route-short`, label: 'Короткий ответ', action: { type: 'open_case_summary', caseId } },
      { id: `${caseId}-route-detail`, label: 'Развернутый ответ', action: { type: 'open_case_detail', caseId } },
      { id: `${caseId}-route-artifact`, label: 'Артефакты', action: { type: 'open_image_modal', caseId, artifactId: caseContent.gallery[0]?.artifactId ?? caseContent.artifacts[0]?.id ?? '' } },
      { id: `${caseId}-route-what-proves`, label: 'Что это доказывает', action: { type: 'open_case_detail', caseId } },
    ],
    contextPanel: caseContent.contextPanel,
    nextActions: [
      { type: 'open_case_summary', caseId },
      { type: 'open_case_detail', caseId },
    ],
  });
}

export function buildMobileOverviewEnvelope(session: AssistantSession): AssistantEnvelope {
  return createEnvelope({
    session,
    viewType: 'mobile_experience_overview',
    selectedContext: { kind: 'overview', id: 'mobile-experience', label: 'Мобильный опыт' },
    contentBlocks: portfolioContent.mobileOverview.summaryBlocks,
    chips: portfolioContent.mobileOverview.followUpChips,
    contextPanel: portfolioContent.mobileOverview.contextPanel,
    nextActions: portfolioContent.mobileOverview.followUpChips.map((chip) => chip.action),
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
    answerMode: mode,
    selectedContext: { kind: 'case', id: caseId, label: caseContent.shortTitle },
    contentBlocks: mode === 'summary' ? caseContent.summaryBlocks : caseContent.detailBlocks,
    chips: caseContent.followUpChips,
    contextPanel: caseContent.contextPanel,
    nextActions: caseContent.followUpChips.map((chip) => chip.action),
  });
}

export function buildExperienceEnvelope(
  session: AssistantSession,
  mode: AnswerMode,
): AssistantEnvelope {
  return createEnvelope({
    session,
    viewType: mode === 'summary' ? 'experience_summary' : 'experience_detail',
    answerMode: mode,
    selectedContext: { kind: 'experience', id: 'experience', label: 'Опыт работы' },
    contentBlocks: mode === 'summary' ? portfolioContent.experience.summaryBlocks : portfolioContent.experience.detailBlocks,
    chips: portfolioContent.experience.followUpChips,
    contextPanel: portfolioContent.experience.contextPanel,
    nextActions: portfolioContent.experience.followUpChips.map((chip) => chip.action),
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
    selectedContext: { kind: 'case', id: caseContent.id, label: caseContent.shortTitle },
    contentBlocks: getExperienceRoute(caseId),
    chips: [
      { id: `${caseId}-exp-short`, label: 'Короткий ответ', action: { type: 'open_case_summary', caseId } },
      { id: `${caseId}-exp-detail`, label: 'Развернутый ответ', action: { type: 'open_case_detail', caseId } },
    ],
    contextPanel: caseContent.contextPanel,
    nextActions: [
      { type: 'open_case_summary', caseId },
      { type: 'open_case_detail', caseId },
    ],
  });
}

export function buildAdditionalCasesEnvelope(session: AssistantSession): AssistantEnvelope {
  return createEnvelope({
    session,
    viewType: 'additional_cases_overview',
    selectedContext: { kind: 'overview', id: 'additional-cases', label: 'Дополнительные кейсы' },
    contentBlocks: portfolioContent.additionalCases.summaryBlocks,
    chips: portfolioContent.additionalCases.followUpChips,
    contextPanel: portfolioContent.additionalCases.contextPanel,
    nextActions: portfolioContent.additionalCases.followUpChips.map((chip) => chip.action),
  });
}

export function buildContactModalEnvelope(session: AssistantSession, source?: string): AssistantEnvelope {
  const content = getContactContent();

  return createEnvelope({
    session,
    viewType: 'contact_modal',
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
    nextActions: chips.map((chip) => chip.action),
  });
}

export function buildAmbiguousEnvelope(session: AssistantSession): AssistantEnvelope {
  const chips: PromptChip[] = [
    { id: 'ambiguous-alfa', label: 'Самый сильный кейс', action: { type: 'open_case_summary', caseId: 'alfa-smart' } },
    { id: 'ambiguous-exp', label: 'Опыт работы', action: { type: 'open_experience_summary' } },
    { id: 'ambiguous-mobile', label: 'Мобильные кейсы', action: { type: 'open_mobile_experience_overview' } },
  ];

  return createEnvelope({
    session,
    uiState: 'fallback',
    viewType: 'ambiguous_question',
    safetyState: 'ambiguous_question',
    contentBlocks: [
      {
        type: 'lead',
        title: 'Запрос слишком расплывчатый',
        body: [
          'Сейчас ассистент отвечает только про опыт, кейсы и продуктовый подход Андрея.',
          'Сформулируй вопрос конкретнее или выбери один из быстрых входов ниже.',
        ],
      },
    ],
    chips,
    contextPanel: portfolioContent.entry.contextPanel,
    nextActions: chips.map((chip) => chip.action),
  });
}

export function buildNoMatchingEnvelope(session: AssistantSession): AssistantEnvelope {
  const chips: PromptChip[] = [
    { id: 'nomatch-alfa', label: 'Покажи Альфа-Смарт', action: { type: 'open_case_summary', caseId: 'alfa-smart' } },
    { id: 'nomatch-exp', label: 'Покажи опыт работы', action: { type: 'open_experience_summary' } },
    { id: 'nomatch-breadth', label: 'Дополнительные кейсы', action: { type: 'open_additional_cases_overview' } },
  ];

  return createEnvelope({
    session,
    uiState: 'fallback',
    viewType: 'no_matching_case',
    safetyState: 'no_matching_case',
    contentBlocks: [
      {
        type: 'lead',
        title: 'В базе нет такого кейса',
        body: [
          'Ассистент не выдумывает опыт и не притворяется, что знает больше, чем есть в портфолио.',
          'Лучше перейти к одному из подтвержденных кейсов или к общему опыту работы.',
        ],
      },
    ],
    chips,
    contextPanel: portfolioContent.entry.contextPanel,
    nextActions: chips.map((chip) => chip.action),
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
    safetyState,
    contentBlocks: [{ type: 'lead', title, body }],
    chips,
    contextPanel: {
      title: 'Границы ассистента',
      subtitle: 'Safety',
      tags: ['Кейсы', 'Опыт', 'Контакт'],
      note: 'Ассистент держит узкий scope специально: так меньше шума и выше доверие к ответам.',
      cta: { label: 'Связаться с Андреем', action: { type: 'open_contact_modal', source: 'safety' } },
    },
    nextActions: chips.map((chip) => chip.action),
  });
}

export function buildLoadingEnvelope(session: AssistantSession): AssistantEnvelope {
  return createEnvelope({
    session,
    uiState: 'fallback',
    viewType: 'loading',
    contentBlocks: [
      {
        type: 'lead',
        title: 'Думаю над маршрутом ответа',
        body: [
          'Ассистент не должен стрелять в темноту. Сначала он определяет, какой именно state открыть: кейс, опыт, breadth или контакт.',
        ],
      },
    ],
    contextPanel: portfolioContent.entry.contextPanel,
  });
}

export function makeContactActions(options: ContactOption[]): UIAction[] {
  return options.map(() => ({ type: 'close_modal' }));
}
