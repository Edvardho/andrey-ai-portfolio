import {
  getCaseById,
  getEntryPrompts,
  getExperienceRoute,
  getRailItems,
  portfolioContent,
} from '@/data/portfolio-content';
import { MAX_USER_MESSAGES_PER_SESSION } from '@/lib/portfolio/config';
import type {
  AdditionalCasesContent,
  AnswerMode,
  AssistantEnvelope,
  AssistantReplyState,
  ContentBlock,
  ExperienceContent,
  MobileOverviewContent,
  PresentationVariant,
  PromptChip,
  ResponseSource,
  SafetyState,
  SelectedContext,
  UIAction,
  UIState,
  ViewType,
} from '@/lib/portfolio/types';

type SeedEnvelopeOptions = {
  sessionId: string | null;
  userMessagesUsed: number;
  viewType: ViewType;
  presentationVariant: PresentationVariant;
  selectedContext: SelectedContext;
  answerMode?: AnswerMode | null;
  contentBlocks?: ContentBlock[];
  chips?: PromptChip[];
  contextPanel?: AssistantEnvelope['contextPanel'];
  safetyState?: SafetyState;
  nextActions?: UIAction[];
  responseSource?: ResponseSource;
  assistantReplyState?: AssistantReplyState;
  uiState?: UIState;
};

function getPromptChipActions(chips: PromptChip[]): UIAction[] {
  return chips.flatMap((chip) => (chip.action ? [chip.action] : []));
}

function createSeedEnvelope({
  sessionId,
  userMessagesUsed,
  viewType,
  presentationVariant,
  selectedContext,
  answerMode = null,
  contentBlocks = [],
  chips = [],
  contextPanel = portfolioContent.entry.contextPanel,
  safetyState = 'none',
  nextActions = [],
  responseSource = 'authored',
  assistantReplyState = 'authored_reply',
  uiState = 'ready',
}: SeedEnvelopeOptions): AssistantEnvelope {
  return {
    sessionId: sessionId ?? 'local-seed',
    uiState,
    viewType,
    presentationVariant,
    selectedContext,
    answerMode,
    railItems: getRailItems(),
    contentBlocks,
    chips,
    contextPanel,
    modal: null,
    safetyState,
    nextActions,
    meta: {
      userMessagesUsed,
      userMessagesRemaining: Math.max(MAX_USER_MESSAGES_PER_SESSION - userMessagesUsed, 0),
      responseSource,
      assistantReplyState,
      sessionStoreMode: 'memory',
      answerType: null,
      queryScope: null,
      questionSubject: null,
    },
  };
}

export function buildClientErrorRetryEnvelope(
  sessionId: string | null,
  userMessagesUsed: number,
  message = 'Не получилось получить ответ. Это техническая ошибка запроса, а не нехватка фактов в портфолио.',
): AssistantEnvelope {
  return createSeedEnvelope({
    sessionId,
    userMessagesUsed,
    viewType: 'unsupported_request',
    presentationVariant: 'refusal_reply',
    uiState: 'fallback',
    selectedContext: { kind: 'none', id: null, label: null },
    contentBlocks: [
      {
        type: 'lead',
        title: 'Ответ не загрузился',
        body: [message],
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

function buildEntrySeed(sessionId: string | null, userMessagesUsed: number): AssistantEnvelope {
  const chips = getEntryPrompts();

  return createSeedEnvelope({
    sessionId,
    userMessagesUsed,
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

function buildCaseSeed(
  sessionId: string | null,
  userMessagesUsed: number,
  caseId: string,
  mode: AnswerMode,
  mobile: boolean,
): AssistantEnvelope | null {
  const caseContent = getCaseById(caseId);
  if (!caseContent) {
    return null;
  }

  return createSeedEnvelope({
    sessionId,
    userMessagesUsed,
    viewType: mobile
      ? mode === 'summary'
        ? 'mobile_case_summary'
        : 'mobile_case_detail'
      : mode === 'summary'
        ? 'case_summary'
        : 'case_detail',
    presentationVariant: mode === 'summary' ? 'case_summary' : 'sectioned_reply',
    selectedContext: { kind: 'case', id: caseContent.id, label: caseContent.shortTitle },
    answerMode: mode,
    contentBlocks: mode === 'summary' ? caseContent.summaryBlocks : caseContent.detailBlocks,
    contextPanel: caseContent.contextPanel,
  });
}

function buildCaseRouteSeed(
  sessionId: string | null,
  userMessagesUsed: number,
  caseId: string,
): AssistantEnvelope | null {
  const caseContent = getCaseById(caseId);
  if (!caseContent) {
    return null;
  }

  return createSeedEnvelope({
    sessionId,
    userMessagesUsed,
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

function buildExperienceSeed(
  sessionId: string | null,
  userMessagesUsed: number,
  mode: AnswerMode,
  experience: ExperienceContent,
): AssistantEnvelope {
  const chips = experience.followUpChips;

  return createSeedEnvelope({
    sessionId,
    userMessagesUsed,
    viewType: mode === 'summary' ? 'experience_summary' : 'experience_detail',
    presentationVariant: mode === 'summary' ? 'experience_summary' : 'sectioned_reply',
    selectedContext: { kind: 'experience', id: 'experience', label: 'Опыт работы' },
    answerMode: mode,
    contentBlocks: mode === 'summary' ? experience.summaryBlocks : experience.detailBlocks,
    chips,
    contextPanel: experience.contextPanel,
    nextActions: getPromptChipActions(chips),
  });
}

function buildExperienceRouteSeed(
  sessionId: string | null,
  userMessagesUsed: number,
  caseId: string,
): AssistantEnvelope | null {
  const caseContent = getCaseById(caseId);
  if (!caseContent) {
    return null;
  }

  return createSeedEnvelope({
    sessionId,
    userMessagesUsed,
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

function buildOverviewSeed(
  sessionId: string | null,
  userMessagesUsed: number,
  viewType: 'mobile_experience_overview' | 'additional_cases_overview',
  selectedContext: SelectedContext,
  content: MobileOverviewContent | AdditionalCasesContent,
): AssistantEnvelope {
  const chips = content.followUpChips;

  return createSeedEnvelope({
    sessionId,
    userMessagesUsed,
    viewType,
    presentationVariant: 'sectioned_reply',
    selectedContext,
    contentBlocks: content.summaryBlocks,
    chips,
    contextPanel: content.contextPanel,
    nextActions: getPromptChipActions(chips),
  });
}

export function buildClientEnvelopeForAction(
  action: UIAction,
  sessionId: string | null,
  userMessagesUsed: number,
): AssistantEnvelope | null {
  switch (action.type) {
    case 'open_entry':
      return buildEntrySeed(sessionId, userMessagesUsed);
    case 'open_case_summary':
      return buildCaseSeed(sessionId, userMessagesUsed, action.caseId, 'summary', false);
    case 'open_case_detail':
      return buildCaseSeed(sessionId, userMessagesUsed, action.caseId, 'detail', false);
    case 'open_case_route':
      return buildCaseRouteSeed(sessionId, userMessagesUsed, action.caseId);
    case 'open_mobile_case_summary':
      return buildCaseSeed(sessionId, userMessagesUsed, action.caseId, 'summary', true);
    case 'open_mobile_case_detail':
      return buildCaseSeed(sessionId, userMessagesUsed, action.caseId, 'detail', true);
    case 'open_experience_summary':
      return buildExperienceSeed(sessionId, userMessagesUsed, 'summary', portfolioContent.experience);
    case 'open_experience_detail':
      return buildExperienceSeed(sessionId, userMessagesUsed, 'detail', portfolioContent.experience);
    case 'open_experience_route':
      return buildExperienceRouteSeed(sessionId, userMessagesUsed, action.caseId);
    case 'open_mobile_experience_overview':
      return buildOverviewSeed(
        sessionId,
        userMessagesUsed,
        'mobile_experience_overview',
        { kind: 'overview', id: 'mobile-experience', label: 'Мобильный опыт' },
        portfolioContent.mobileOverview,
      );
    case 'open_additional_cases_overview':
      return buildOverviewSeed(
        sessionId,
        userMessagesUsed,
        'additional_cases_overview',
        { kind: 'overview', id: 'additional-cases', label: 'Дополнительные кейсы' },
        portfolioContent.additionalCases,
      );
    default:
      return null;
  }
}
