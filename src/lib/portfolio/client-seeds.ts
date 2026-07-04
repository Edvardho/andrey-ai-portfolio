import {
  additionalCasesContent,
  experience,
  getExperienceRoute,
  mobileOverview,
} from '@/data/portfolio-global-content';
import { entry, getEntryPrompts, getRailItems } from '@/data/portfolio-index';
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
  CaseContent,
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
  contextPanel = entry.contextPanel,
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
      ...entry.contextPanel,
      hidden: true,
    },
    assistantReplyState: 'error_retry',
  });
}

export function buildClientRepeatedFastReviewEnvelope(
  sessionId: string | null,
  userMessagesUsed: number,
): AssistantEnvelope {
  return createSeedEnvelope({
    sessionId,
    userMessagesUsed,
    viewType: 'general_synthesis',
    presentationVariant: 'plain_text_reply',
    selectedContext: { kind: 'none', id: null, label: null },
    contentBlocks: [
      {
        type: 'lead',
        title: '',
        body: [
          'Я уже отвечала на этот вопрос выше — там краткая оценка Андрея по кейсам.',
          'Если хотите копнуть глубже, задавайте вопросы.',
        ],
      },
    ],
    chips: [],
    contextPanel: {
      ...entry.contextPanel,
      hidden: true,
    },
    responseSource: 'authored',
    assistantReplyState: 'navigation_suggestion',
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
        title: entry.title,
        body: [entry.subtitle],
      },
    ],
    chips,
    contextPanel: entry.contextPanel,
    nextActions: getPromptChipActions(chips),
  });
}

function buildCaseSeed(
  sessionId: string | null,
  userMessagesUsed: number,
  caseId: string,
  mode: AnswerMode,
  mobile: boolean,
  caseContent: CaseContent | null,
): AssistantEnvelope | null {
  if (!caseContent || caseContent.id !== caseId) {
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
  caseContent: CaseContent | null,
): AssistantEnvelope | null {
  if (!caseContent || caseContent.id !== caseId) {
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
  caseContent: CaseContent | null,
): AssistantEnvelope | null {
  if (!caseContent || caseContent.id !== caseId) {
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
  caseContent: CaseContent | null = null,
): AssistantEnvelope | null {
  switch (action.type) {
    case 'open_entry':
      return buildEntrySeed(sessionId, userMessagesUsed);
    case 'open_case_summary':
      return buildCaseSeed(sessionId, userMessagesUsed, action.caseId, 'summary', false, caseContent);
    case 'open_case_detail':
      return buildCaseSeed(sessionId, userMessagesUsed, action.caseId, 'detail', false, caseContent);
    case 'open_case_route':
      return buildCaseRouteSeed(sessionId, userMessagesUsed, action.caseId, caseContent);
    case 'open_mobile_case_summary':
      return buildCaseSeed(sessionId, userMessagesUsed, action.caseId, 'summary', true, caseContent);
    case 'open_mobile_case_detail':
      return buildCaseSeed(sessionId, userMessagesUsed, action.caseId, 'detail', true, caseContent);
    case 'open_experience_summary':
      return buildExperienceSeed(sessionId, userMessagesUsed, 'summary', experience);
    case 'open_experience_detail':
      return buildExperienceSeed(sessionId, userMessagesUsed, 'detail', experience);
    case 'open_experience_route':
      return buildExperienceRouteSeed(sessionId, userMessagesUsed, action.caseId, caseContent);
    case 'open_mobile_experience_overview':
      return buildOverviewSeed(
        sessionId,
        userMessagesUsed,
        'mobile_experience_overview',
        { kind: 'overview', id: 'mobile-experience', label: 'Мобильный опыт' },
        mobileOverview,
      );
    case 'open_additional_cases_overview':
      return buildOverviewSeed(
        sessionId,
        userMessagesUsed,
        'additional_cases_overview',
        { kind: 'overview', id: 'additional-cases', label: 'Дополнительные кейсы' },
        additionalCasesContent,
      );
    default:
      return null;
  }
}
