'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup } from 'framer-motion';

import { MAX_USER_MESSAGES_PER_SESSION } from '@/lib/portfolio/config';
import {
  getLoadedCaseById,
  isCaseLoaded,
  loadCaseById,
} from '@/data/portfolio-case-loader.client';
import { additionalCasesContent, experience, mobileOverview } from '@/data/portfolio-global-content';
import { getContactContent, getEntryPrompts, getRailItems } from '@/data/portfolio-index';
import { buildClientEnvelopeForAction, buildClientErrorRetryEnvelope } from '@/lib/portfolio/client-seeds';
import type {
  AssistantEnvelope,
  ArtifactOpenTarget,
  Artifact,
  ChatRequestBody,
  ContextPanelData,
  ModalPayload,
  PromptChip,
  RailItem,
  SelectedContext,
  UIAction,
} from '@/lib/portfolio/types';
import { getLastAnimatedAssistantMessageId } from '@/lib/portfolio/response-animation-policy';
import {
  DEFAULT_THREAD_SCROLL_STATE,
  shouldRestoreScrollAfterModalClose,
  shouldRestoreThreadScrollOnSwitch,
  type ThreadScrollState,
} from '@/lib/portfolio/response-scroll-policy';

import { PortfolioEntryView } from './portfolio-entry-view';
import { PortfolioChatWorkspace } from './portfolio-chat-workspace';
import { PortfolioModalOverlay } from './portfolio-modal-overlay';
import { PortfolioDesktopHeader } from './portfolio-desktop-header';
import type { PortfolioThreadViewHandle } from './portfolio-thread-view';
import {
  useDebouncedPortfolioPersistence,
  usePortfolioModalController,
  usePortfolioStageRouting,
  usePortfolioTextareaAutosize,
  useSyncedRef,
} from './portfolio-shell-hooks';

type ThreadItem =
  | { id: string; kind: 'user'; text: string; hasAnimated: boolean }
  | { id: string; kind: 'assistant'; envelope: AssistantEnvelope; hasAnimated: boolean };

type ContextId =
  | 'entry'
  | 'experience'
  | 'mobile-experience'
  | 'additional-cases'
  | `case:${string}`;

type ContextThread = {
  contextId: ContextId;
  items: ThreadItem[];
  lastEnvelope: AssistantEnvelope | null;
  initialized: boolean;
  hasPlayedInitialReveal: boolean;
  restoredFromStorage: boolean;
  lastAnimatedAssistantMessageId: string | null;
  scrollState: ThreadScrollState;
  updatedAt: string;
};

type ThreadStore = Record<string, ContextThread>;

type ContextUiState = {
  expandedDisclosureIds: string[];
};

type ContextUiStateStore = Record<string, ContextUiState>;

type WorkspaceMode = 'landing' | 'chat';
type TransitionSource = 'submit' | 'chip' | 'case' | null;

type PersistedThreadState = {
  sessionId: string | null;
  activeContextId: ContextId;
  threadsByContextId: ThreadStore;
  contextUiStateByContextId: ContextUiStateStore;
  workspaceMode: WorkspaceMode;
  sessionMeta: {
    used: number;
    remaining: number;
  };
};

type ContextPanelPayload = {
  contextPanel: ContextPanelData;
  selectedContext: SelectedContext;
};

type LastFailedRequest =
  | {
      kind: 'chat';
      contextId: ContextId;
      body: ChatRequestBody;
      syncBeforeRequest: boolean;
      clearInputOnSuccess: boolean;
      forceThreadContextId?: ContextId;
    }
  | {
      kind: 'fresh-context';
      targetContextId: ContextId;
      action: UIAction;
    }
  | {
      kind: 'case-module';
      targetContextId: ContextId;
      action: UIAction;
      userLabel?: string;
      appendUserBubble?: boolean;
    };

const THREAD_STORAGE_KEY = 'ai-portfolio-context-threads-v2';
const LEGACY_THREAD_STORAGE_KEY = 'ai-portfolio-context-threads-v1';
const DEFAULT_SESSION_META = {
  used: 0,
  remaining: MAX_USER_MESSAGES_PER_SESSION,
};
const DEFAULT_CONTEXT_UI_STATE: ContextUiState = {
  expandedDisclosureIds: [],
};
const MOBILE_CASE_IDS = new Set(['expenses-card-holders', 'subscription-sharing', 'ux-ui-wannabelike']);
const PERSISTENCE_WRITE_DEBOUNCE_MS = 120;

function isCaseContextId(contextId: ContextId): contextId is `case:${string}` {
  return contextId.startsWith('case:');
}

function makeCaseContextId(caseId: string): `case:${string}` {
  return `case:${caseId}`;
}

function getContextIdFromEnvelope(envelope: AssistantEnvelope): ContextId {
  if (envelope.selectedContext.kind === 'case') {
    return makeCaseContextId(envelope.selectedContext.id);
  }

  if (envelope.selectedContext.kind === 'experience') {
    return 'experience';
  }

  if (envelope.selectedContext.kind === 'overview') {
    return envelope.selectedContext.id;
  }

  return 'entry';
}

async function ensureEnvelopeCaseLoaded(envelope: AssistantEnvelope) {
  if (envelope.selectedContext.kind === 'case') {
    await loadCaseById(envelope.selectedContext.id);
  }
}

function resolveReplyThreadContextId(
  currentContextId: ContextId,
  body: ChatRequestBody,
  envelope: AssistantEnvelope,
): ContextId {
  const nextContextId = getContextIdFromEnvelope(envelope);

  if (
    body.input.type === 'message' &&
    currentContextId !== 'entry' &&
    envelope.selectedContext.kind === 'none'
  ) {
    return currentContextId;
  }

  return nextContextId;
}

function createThreadItemId(prefix: 'user' | 'assistant') {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return `${prefix}:${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
}

function createUserThreadItem(text: string): ThreadItem {
  return {
    id: createThreadItemId('user'),
    kind: 'user',
    text,
    hasAnimated: false,
  };
}

function reportCaseTransitionMetric({
  caseId,
  durationMs,
  mode,
  path,
}: {
  caseId: string;
  durationMs: number;
  mode: 'cold' | 'warm';
  path: 'known-context' | 'restore';
}) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  console.debug('[portfolio-case-transition]', {
    caseId,
    mode,
    path,
    durationMs: Math.round(durationMs),
  });
}

function createAssistantThreadItem(envelope: AssistantEnvelope): ThreadItem {
  return {
    id: createThreadItemId('assistant'),
    kind: 'assistant',
    envelope,
    hasAnimated: false,
  };
}

function getLastAssistantItemId(items: ThreadItem[]) {
  return [...items].reverse().find((item) => item.kind === 'assistant')?.id ?? null;
}

function normalizeThreadScrollState(
  scrollState: Partial<ThreadScrollState> | undefined,
  items: ThreadItem[],
): ThreadScrollState {
  const lastAssistantItemId = getLastAssistantItemId(items);

  return {
    scrollTop: typeof scrollState?.scrollTop === 'number' ? scrollState.scrollTop : DEFAULT_THREAD_SCROLL_STATE.scrollTop,
    isNearBottom:
      typeof scrollState?.isNearBottom === 'boolean' ? scrollState.isNearBottom : DEFAULT_THREAD_SCROLL_STATE.isNearBottom,
    hasUnseenAssistantContent:
      typeof scrollState?.hasUnseenAssistantContent === 'boolean'
        ? scrollState.hasUnseenAssistantContent
        : DEFAULT_THREAD_SCROLL_STATE.hasUnseenAssistantContent,
    lastSeenAssistantItemId:
      typeof scrollState?.lastSeenAssistantItemId === 'string' || scrollState?.lastSeenAssistantItemId === null
        ? scrollState.lastSeenAssistantItemId
        : lastAssistantItemId,
  };
}

function getContextIdFromAction(action: UIAction): ContextId | null {
  switch (action.type) {
    case 'open_entry':
      return 'entry';
    case 'open_case_summary':
    case 'open_case_detail':
    case 'open_case_route':
    case 'open_mobile_case_summary':
    case 'open_mobile_case_detail':
      return makeCaseContextId(action.caseId);
    case 'open_experience_summary':
    case 'open_experience_detail':
      return 'experience';
    case 'open_experience_route':
      return makeCaseContextId(action.caseId);
    case 'open_mobile_experience_overview':
      return 'mobile-experience';
    case 'open_additional_cases_overview':
      return 'additional-cases';
    default:
      return null;
  }
}

function getCaseIdFromAction(action: UIAction): string | null {
  switch (action.type) {
    case 'open_case_summary':
    case 'open_case_detail':
    case 'open_case_route':
    case 'open_mobile_case_summary':
    case 'open_mobile_case_detail':
    case 'open_experience_route':
    case 'open_image_modal':
      return action.caseId;
    default:
      return null;
  }
}

function getCanonicalActionForCase(caseId: string): UIAction {
  if (MOBILE_CASE_IDS.has(caseId)) {
    return { type: 'open_mobile_case_summary', caseId };
  }

  return { type: 'open_case_summary', caseId };
}

function getSyncActionForContext(thread: ContextThread): UIAction | null {
  const envelope = thread.lastEnvelope;

  if (!envelope) {
    if (thread.contextId === 'entry') {
      return { type: 'open_entry' };
    }

    if (thread.contextId === 'experience') {
      return { type: 'open_experience_summary' };
    }

    if (thread.contextId === 'mobile-experience') {
      return { type: 'open_mobile_experience_overview' };
    }

    if (thread.contextId === 'additional-cases') {
      return { type: 'open_additional_cases_overview' };
    }

    if (isCaseContextId(thread.contextId)) {
      return getCanonicalActionForCase(thread.contextId.replace(/^case:/, ''));
    }

    return null;
  }

  if (envelope.selectedContext.kind === 'case') {
    const caseId = envelope.selectedContext.id;

    switch (envelope.viewType) {
      case 'case_detail':
        return { type: 'open_case_detail', caseId };
      case 'case_route':
        return { type: 'open_case_route', caseId };
      case 'mobile_case_detail':
        return { type: 'open_mobile_case_detail', caseId };
      case 'mobile_case_summary':
        return { type: 'open_mobile_case_summary', caseId };
      default:
        return getCanonicalActionForCase(caseId);
    }
  }

  if (envelope.selectedContext.kind === 'experience') {
    return envelope.viewType === 'experience_detail'
      ? { type: 'open_experience_detail' }
      : { type: 'open_experience_summary' };
  }

  if (envelope.selectedContext.kind === 'overview') {
    return envelope.selectedContext.id === 'mobile-experience'
      ? { type: 'open_mobile_experience_overview' }
      : { type: 'open_additional_cases_overview' };
  }

  return { type: 'open_entry' };
}

function createContextThread(contextId: ContextId, envelope?: AssistantEnvelope): ContextThread {
  const now = new Date().toISOString();
  const initialItems = envelope ? [createAssistantThreadItem(envelope)] : [];

  return {
    contextId,
    items: initialItems,
    lastEnvelope: envelope ?? null,
    initialized: Boolean(envelope),
    hasPlayedInitialReveal: false,
    restoredFromStorage: false,
    lastAnimatedAssistantMessageId: null,
    scrollState: normalizeThreadScrollState(
      envelope
        ? {
            isNearBottom: false,
            hasUnseenAssistantContent: false,
            lastSeenAssistantItemId: getLastAssistantItemId(initialItems),
          }
        : undefined,
      initialItems,
    ),
    updatedAt: now,
  };
}

function buildContactModalPayload(): ModalPayload {
  const content = getContactContent();

  return {
    type: 'contact',
    title: content.title,
    helper: content.helper,
    options: content.options,
  };
}

function buildImageModalPayload(caseId: string, artifactId: string): ModalPayload | null {
  const artifact = getArtifact(caseId, artifactId);

  if (!artifact) {
    return null;
  }

  return {
    type: 'image',
    title: artifact.title,
    caption: artifact.caption,
    imageUrl: artifact.imageUrl,
    sourceLabel: artifact.sourceLabel,
    note: artifact.note,
  };
}

function getArtifact(caseId: string, artifactId: string): Artifact | undefined {
  return getLoadedCaseById(caseId)?.artifacts.find((artifact) => artifact.id === artifactId);
}

function isBootstrapEntryThread(thread: ContextThread | undefined): boolean {
  if (!thread || thread.contextId !== 'entry') {
    return false;
  }

  return (
    thread.items.length === 1 &&
    thread.items[0]?.kind === 'assistant' &&
    thread.items[0].envelope.viewType === 'entry'
  );
}

function inferWorkspaceMode(
  persisted: Partial<PersistedThreadState>,
  persistedThreads: ThreadStore,
  persistedActiveContext: ContextId,
): WorkspaceMode {
  if (persisted.workspaceMode === 'landing' || persisted.workspaceMode === 'chat') {
    return persisted.workspaceMode;
  }

  if (!Object.keys(persistedThreads).length) {
    return 'landing';
  }

  if (persistedActiveContext !== 'entry') {
    return 'chat';
  }

  const hasConversationItems = Object.values(persistedThreads).some((thread) =>
    thread.items.some((item) => item.kind === 'user'),
  );

  if (hasConversationItems) {
    return 'chat';
  }

  const onlyEntryBootstrap =
    Object.keys(persistedThreads).length === 1 &&
    isBootstrapEntryThread(persistedThreads.entry);

  return onlyEntryBootstrap ? 'landing' : 'chat';
}

function getCurrentContextPanel(envelope: AssistantEnvelope): AssistantEnvelope['contextPanel'] {
  if (envelope.selectedContext.kind === 'case') {
    return getLoadedCaseById(envelope.selectedContext.id)?.contextPanel ?? envelope.contextPanel;
  }

  if (envelope.selectedContext.kind === 'experience') {
    return experience.contextPanel;
  }

  if (envelope.selectedContext.kind === 'overview') {
    return envelope.selectedContext.id === 'mobile-experience'
      ? mobileOverview.contextPanel
      : additionalCasesContent.contextPanel;
  }

  return envelope.contextPanel;
}

function readStorageItem(storage: Storage, key: string) {
  try {
    return storage.getItem(key);
  } catch (error) {
    console.warn(`Failed to read ${key} from portfolio storage.`, error);
    return null;
  }
}

function removeStorageItem(storage: Storage, key: string) {
  try {
    storage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove ${key} from portfolio storage.`, error);
  }
}

function writeStorageItem(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to persist ${key} to portfolio storage.`, error);
  }
}

function readPersistedThreadState() {
  return (
    readStorageItem(globalThis.localStorage, THREAD_STORAGE_KEY) ??
    readStorageItem(globalThis.localStorage, LEGACY_THREAD_STORAGE_KEY) ??
    readStorageItem(globalThis.sessionStorage, LEGACY_THREAD_STORAGE_KEY)
  );
}

function clearPersistedThreadState() {
  removeStorageItem(globalThis.localStorage, THREAD_STORAGE_KEY);
  removeStorageItem(globalThis.localStorage, LEGACY_THREAD_STORAGE_KEY);
  removeStorageItem(globalThis.sessionStorage, LEGACY_THREAD_STORAGE_KEY);
}

function persistThreadState(payload: PersistedThreadState) {
  try {
    writeStorageItem(globalThis.localStorage, THREAD_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Failed to serialize portfolio thread state.', error);
  }
}

function normalizeEnvelope(envelope: AssistantEnvelope): AssistantEnvelope {
  return {
    ...envelope,
    meta: {
      ...envelope.meta,
      assistantReplyState: envelope.meta.assistantReplyState ?? (
        envelope.meta.responseSource === 'facts_constrained_synthesis'
          ? 'grounded_answer'
          : 'authored_reply'
      ),
      sessionStoreMode: envelope.meta.sessionStoreMode ?? 'memory',
      answerType: envelope.meta.answerType ?? null,
      queryScope: envelope.meta.queryScope ?? null,
      questionSubject: envelope.meta.questionSubject ?? null,
    },
    contextPanel: getCurrentContextPanel(envelope),
  };
}

function getContextPanelPayloadFromContextId(contextId: ContextId): ContextPanelPayload | null {
  if (contextId === 'entry') {
    return null;
  }

  if (contextId === 'experience') {
    return {
      contextPanel: experience.contextPanel,
      selectedContext: {
        kind: 'experience',
        id: 'experience',
        label: 'Опыт работы',
      },
    };
  }

  if (contextId === 'mobile-experience') {
    return {
      contextPanel: mobileOverview.contextPanel,
      selectedContext: {
        kind: 'overview',
        id: 'mobile-experience',
        label: 'Мобильный опыт',
      },
    };
  }

  if (contextId === 'additional-cases') {
    return {
      contextPanel: additionalCasesContent.contextPanel,
      selectedContext: {
        kind: 'overview',
        id: 'additional-cases',
        label: 'Дополнительные кейсы',
      },
    };
  }

  if (!isCaseContextId(contextId)) {
    return null;
  }

  const caseId = contextId.replace(/^case:/, '');
  const caseContent = getLoadedCaseById(caseId);

  if (!caseContent) {
    return null;
  }

  return {
    contextPanel: caseContent.contextPanel,
    selectedContext: {
      kind: 'case',
      id: caseId,
      label: caseContent.title,
    },
  };
}

function normalizeRuntimeThreads(threads: ThreadStore): ThreadStore {
  return Object.fromEntries(
    Object.entries(threads).map(([contextId, thread]) => {
      const items = thread.items.map((item, index) => {
        if (item.kind === 'assistant') {
          return {
            id: 'id' in item && typeof item.id === 'string' ? item.id : `persisted:${contextId}:assistant:${index}`,
            kind: 'assistant' as const,
            envelope: normalizeEnvelope(item.envelope),
            hasAnimated:
              'hasAnimated' in item && typeof item.hasAnimated === 'boolean'
                ? item.hasAnimated
                : false,
          };
        }

        return {
          id: 'id' in item && typeof item.id === 'string' ? item.id : `persisted:${contextId}:user:${index}`,
          kind: 'user' as const,
          text: item.text,
          hasAnimated:
            'hasAnimated' in item && typeof item.hasAnimated === 'boolean'
              ? item.hasAnimated
              : false,
        };
      });

      const lastAnimatedAssistantMessageId =
        ('lastAnimatedAssistantMessageId' in thread && typeof thread.lastAnimatedAssistantMessageId === 'string'
          ? thread.lastAnimatedAssistantMessageId
          : getLastAnimatedAssistantMessageId(items)) ?? null;
      const scrollState = normalizeThreadScrollState(
        'scrollState' in thread && thread.scrollState ? thread.scrollState : undefined,
        items,
      );

      return [
        contextId,
        {
          ...thread,
          items,
          lastEnvelope: thread.lastEnvelope ? normalizeEnvelope(thread.lastEnvelope) : null,
          hasPlayedInitialReveal:
            'hasPlayedInitialReveal' in thread && typeof thread.hasPlayedInitialReveal === 'boolean'
              ? thread.hasPlayedInitialReveal
              : false,
          restoredFromStorage:
            'restoredFromStorage' in thread && typeof thread.restoredFromStorage === 'boolean'
              ? thread.restoredFromStorage
              : false,
          lastAnimatedAssistantMessageId,
          scrollState,
        },
      ];
    }),
  );
}

function hydratePersistedThreads(threads: ThreadStore): ThreadStore {
  const normalized = normalizeRuntimeThreads(threads);

  return Object.fromEntries(
    Object.entries(normalized).map(([contextId, thread]) => {
      const items = thread.items.map((item) => ({ ...item, hasAnimated: true }));
      const lastAnimatedAssistantMessageId = getLastAnimatedAssistantMessageId(items);

      return [
        contextId,
        {
          ...thread,
          items,
          hasPlayedInitialReveal: true,
          restoredFromStorage: true,
          lastAnimatedAssistantMessageId,
          scrollState: normalizeThreadScrollState(thread.scrollState, items),
        },
      ];
    }),
  );
}

export function PortfolioShell() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeContextId, setActiveContextId] = useState<ContextId>('entry');
  const [threadsByContextId, setThreadsByContextId] = useState<ThreadStore>({});
  const [contextUiStateByContextId, setContextUiStateByContextId] = useState<ContextUiStateStore>({});
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('landing');
  const [sessionMeta, setSessionMeta] = useState(DEFAULT_SESSION_META);
  const [input, setInput] = useState('');
  const [loadingContextId, setLoadingContextId] = useState<ContextId | null>(null);
  const [bootstrappingContextId, setBootstrappingContextId] = useState<ContextId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedRequest, setLastFailedRequest] = useState<LastFailedRequest | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [transitionSource, setTransitionSource] = useState<TransitionSource>(null);
  const [stickToBottomSignal, setStickToBottomSignal] = useState(0);
  const [scrollToTopSignal, setScrollToTopSignal] = useState(0);
  const [restoreThreadScrollSignal, setRestoreThreadScrollSignal] = useState(0);
  const [restoreThreadScrollTop, setRestoreThreadScrollTop] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const threadViewRef = useRef<PortfolioThreadViewHandle | null>(null);
  const serverContextIdRef = useRef<ContextId | null>(null);
  const transitionTimeoutRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);
  const caseLoadRequestRef = useRef(0);
  const sessionIdRef = useSyncedRef(sessionId);
  const activeContextIdRef = useSyncedRef(activeContextId);
  const workspaceModeRef = useSyncedRef(workspaceMode);

  const railItems = getRailItems();
  const normalizedThreadsByContextId = useMemo(
    () => normalizeRuntimeThreads(threadsByContextId),
    [threadsByContextId],
  );
  const threadsRef = useSyncedRef(normalizedThreadsByContextId);
  const messagesRemaining = sessionMeta.remaining;
  const currentThread = normalizedThreadsByContextId[activeContextId] ?? createContextThread(activeContextId);
  const currentContextUiState = contextUiStateByContextId[activeContextId] ?? DEFAULT_CONTEXT_UI_STATE;
  const currentCaseId = isCaseContextId(activeContextId) ? activeContextId.replace(/^case:/, '') : null;
  const currentContextPanelPayload = getContextPanelPayloadFromContextId(activeContextId);
  const { selectedRailId, showAssistantReturn, showChatStage, showLandingStage } = usePortfolioStageRouting({
    activeContextId,
    isBootstrapEntryThread: (thread) => isBootstrapEntryThread(thread as ContextThread | undefined),
    isCaseContextId,
    threadsByContextId: normalizedThreadsByContextId,
    workspaceMode,
  });

  useDebouncedPortfolioPersistence({
    activeContextId,
    contextUiStateByContextId,
    debounceMs: PERSISTENCE_WRITE_DEBOUNCE_MS,
    enabled: hasHydrated,
    persist: persistThreadState,
    sessionId,
    sessionMeta,
    threadsByContextId: normalizedThreadsByContextId,
    workspaceMode,
  });

  const {
    clearModal,
    closeModal,
    modalPayload,
    openContactModal,
    openImageModal,
  } = usePortfolioModalController<ModalPayload>({
    buildContactModalPayload,
    buildImageModalPayload,
    captureActiveThreadScrollState,
    getFallbackScrollTop: () => currentThread.scrollState.scrollTop,
    requestThreadScrollRestore,
    shouldRestoreScrollAfterModalClose,
  });

  function setServerContextId(contextId: ContextId | null) {
    serverContextIdRef.current = contextId;
  }

  function requestStickyScroll() {
    setStickToBottomSignal((current) => current + 1);
  }

  function requestThreadTopScroll() {
    setScrollToTopSignal((current) => current + 1);
  }

  function requestThreadScrollRestore(scrollTop: number | null) {
    if (scrollTop === null) {
      return;
    }

    setRestoreThreadScrollTop(scrollTop);
    setRestoreThreadScrollSignal((current) => current + 1);
  }

  function clearChatError() {
    setError(null);
    setLastFailedRequest(null);
  }

  function updateSessionMeta(envelope: AssistantEnvelope) {
    setSessionMeta({
      used: envelope.meta.userMessagesUsed,
      remaining: envelope.meta.userMessagesRemaining,
    });
  }

  function upsertThread(contextId: ContextId, recipe: (thread: ContextThread) => ContextThread) {
    setThreadsByContextId((current) => {
      const existing = current[contextId] ?? createContextThread(contextId);
      return {
        ...current,
        [contextId]: recipe(existing),
      };
    });
  }

  function updateThreadScrollState(contextId: ContextId, scrollState: ThreadScrollState) {
    setThreadsByContextId((current) => {
      const existing = current[contextId] ?? createContextThread(contextId);
      const previousScrollState = existing.scrollState;
      if (
        previousScrollState.scrollTop === scrollState.scrollTop &&
        previousScrollState.isNearBottom === scrollState.isNearBottom &&
        previousScrollState.hasUnseenAssistantContent === scrollState.hasUnseenAssistantContent &&
        previousScrollState.lastSeenAssistantItemId === scrollState.lastSeenAssistantItemId
      ) {
        return current;
      }

      return {
        ...current,
        [contextId]: {
          ...existing,
          scrollState,
        },
      };
    });
  }

  function captureActiveThreadScrollState() {
    const snapshot = threadViewRef.current?.captureScrollState();
    if (!snapshot) {
      return null;
    }

    updateThreadScrollState(activeContextIdRef.current, snapshot);
    return snapshot;
  }

  function ensureContextUiState(contextId: ContextId) {
    setContextUiStateByContextId((current) => {
      if (current[contextId]) {
        return current;
      }

      return {
        ...current,
        [contextId]: DEFAULT_CONTEXT_UI_STATE,
      };
    });
  }

  function prepareLandingConversationStart() {
    if (workspaceModeRef.current !== 'landing') {
      return;
    }

    setThreadsByContextId((current) => {
      if (!isBootstrapEntryThread(current.entry)) {
        return current;
      }

      return {
        ...current,
        entry: createContextThread('entry'),
      };
    });
  }

  function startWorkspaceTransition(source: Exclude<TransitionSource, null>) {
    if (workspaceModeRef.current === 'landing') {
      setWorkspaceMode('chat');
    }

    if (transitionTimeoutRef.current) {
      globalThis.clearTimeout(transitionTimeoutRef.current);
    }

    setTransitionSource(source);
    transitionTimeoutRef.current = globalThis.setTimeout(() => {
      setTransitionSource(null);
      transitionTimeoutRef.current = null;
    }, 720);
  }

  function upsertContextUiState(contextId: ContextId, recipe: (state: ContextUiState) => ContextUiState) {
    setContextUiStateByContextId((current) => {
      const existing = current[contextId] ?? DEFAULT_CONTEXT_UI_STATE;
      return {
        ...current,
        [contextId]: recipe(existing),
      };
    });
  }

  function appendUserToThread(contextId: ContextId, text: string) {
    upsertThread(contextId, (thread) => ({
      ...thread,
      items: [...thread.items, createUserThreadItem(text)],
      updatedAt: new Date().toISOString(),
    }));
  }

  function appendAssistantToThread(contextId: ContextId, envelope: AssistantEnvelope) {
    upsertThread(contextId, (thread) => {
      const assistantItem = createAssistantThreadItem(envelope);
      const isThreadNearBottom = thread.scrollState.isNearBottom;
      const shouldMarkUnseenAssistantContent = thread.initialized && !isThreadNearBottom;

      return {
        ...thread,
        items: [...thread.items, assistantItem],
        lastEnvelope: envelope,
        initialized: true,
        restoredFromStorage: false,
        scrollState: {
          ...thread.scrollState,
          hasUnseenAssistantContent: shouldMarkUnseenAssistantContent,
          lastSeenAssistantItemId: !shouldMarkUnseenAssistantContent
            ? assistantItem.id
            : thread.scrollState.lastSeenAssistantItemId,
        },
        updatedAt: new Date().toISOString(),
      };
    });
  }

  function removeErrorRetryItems(contextId: ContextId) {
    upsertThread(contextId, (thread) => {
      const items = thread.items.filter((item) => (
        item.kind !== 'assistant' || item.envelope.meta.assistantReplyState !== 'error_retry'
      ));
      const lastEnvelope = [...items].reverse().find((item) => item.kind === 'assistant')?.envelope ?? null;

      return {
        ...thread,
        items,
        lastEnvelope,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  function replaceThreadWithEnvelope(contextId: ContextId, envelope: AssistantEnvelope) {
    setThreadsByContextId((current) => ({
      ...current,
      [contextId]: createContextThread(contextId, envelope),
    }));
  }

  function markThreadItemsAnimated(
    contextId: ContextId,
    itemIds: string[],
    options?: { markInitialRevealPlayed?: boolean },
  ) {
    if (!itemIds.length) {
      return;
    }

    upsertThread(contextId, (thread) => {
      let lastAnimatedAssistantMessageId = thread.lastAnimatedAssistantMessageId;

      const items = thread.items.map((item) => {
        if (!itemIds.includes(item.id)) {
          return item;
        }

        if (item.kind === 'assistant') {
          lastAnimatedAssistantMessageId = item.id;
        }

        return {
          ...item,
          hasAnimated: true,
        };
      });

      return {
        ...thread,
        items,
        hasPlayedInitialReveal:
          thread.hasPlayedInitialReveal || Boolean(options?.markInitialRevealPlayed),
        lastAnimatedAssistantMessageId,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  function toggleDisclosure(contextId: ContextId, disclosureId: string) {
    upsertContextUiState(contextId, (state) => {
      const expanded = state.expandedDisclosureIds.includes(disclosureId);
      return {
        ...state,
        expandedDisclosureIds: expanded
          ? state.expandedDisclosureIds.filter((id) => id !== disclosureId)
          : [...state.expandedDisclosureIds, disclosureId],
      };
    });
  }

  function handleThreadScrollStateChange(contextId: ContextId, scrollState: ThreadScrollState) {
    updateThreadScrollState(contextId, scrollState);
  }

  async function fetchChatEnvelope(body: ChatRequestBody): Promise<AssistantEnvelope> {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed with ${response.status}`);
    }

    return (await response.json()) as AssistantEnvelope;
  }

  async function ensureServerContextSynced(contextId: ContextId) {
    if (!sessionIdRef.current || serverContextIdRef.current === contextId) {
      return;
    }

    const thread = threadsRef.current[contextId];
    const syncAction = thread ? getSyncActionForContext(thread) : null;

    if (!syncAction) {
      return;
    }

    const envelope = await fetchChatEnvelope({
      sessionId: sessionIdRef.current,
      input: { type: 'action', action: syncAction },
    });

    setSessionId(envelope.sessionId);
    updateSessionMeta(envelope);
    setServerContextId(getContextIdFromEnvelope(envelope));
  }

  async function syncKnownContextInBackground(action: UIAction) {
    try {
      const envelope = await fetchChatEnvelope({
        sessionId: sessionIdRef.current ?? undefined,
        input: { type: 'action', action },
      });
      await ensureEnvelopeCaseLoaded(envelope);
      const nextContextId = getContextIdFromEnvelope(envelope);

      setSessionId(envelope.sessionId);
      updateSessionMeta(envelope);

      if (activeContextIdRef.current === nextContextId) {
        setServerContextId(nextContextId);
      }
    } catch (caughtError) {
      console.error('Silent context sync failed', caughtError);
    }
  }

  async function openKnownContextLocally(
    action: UIAction,
    options?: { userLabel?: string; appendUserBubble?: boolean },
  ): Promise<boolean> {
    const targetContextId = getContextIdFromAction(action);
    const caseId = getCaseIdFromAction(action);
    const wasCaseCold = Boolean(caseId && !isCaseLoaded(caseId));
    const requestId = ++caseLoadRequestRef.current;
    const startedAt = typeof performance !== 'undefined' ? performance.now() : 0;
    const userLabel = options?.userLabel;
    const shouldAppendUserBubble = options?.appendUserBubble ?? Boolean(userLabel);

    clearModal();
    setError(null);
    setLastFailedRequest(null);

    if (targetContextId && caseId && !isCaseLoaded(caseId)) {
      captureActiveThreadScrollState();
      setActiveContextId(targetContextId);
      setBootstrappingContextId(targetContextId);
      setLoadingContextId(targetContextId);
      ensureContextUiState(targetContextId);
      requestThreadTopScroll();
    }

    try {
      const caseContent = caseId ? await loadCaseById(caseId) : null;
      if (requestId !== caseLoadRequestRef.current) {
        return true;
      }

      const localEnvelope = buildClientEnvelopeForAction(
        action,
        sessionIdRef.current,
        sessionMeta.used,
        caseContent,
      );
      if (!localEnvelope) {
        return false;
      }

      const resolvedContextId = getContextIdFromEnvelope(localEnvelope);

      if (resolvedContextId !== activeContextIdRef.current || !threadsRef.current[resolvedContextId]?.initialized) {
        captureActiveThreadScrollState();
        const items: ThreadItem[] = [];
        if (shouldAppendUserBubble && userLabel) {
          items.push(createUserThreadItem(userLabel));
        }
        items.push(createAssistantThreadItem(localEnvelope));

        setThreadsByContextId((current) => ({
          ...current,
          [resolvedContextId]: {
            contextId: resolvedContextId,
            items,
            lastEnvelope: localEnvelope,
            initialized: true,
            hasPlayedInitialReveal: false,
            restoredFromStorage: false,
            lastAnimatedAssistantMessageId: null,
            scrollState: normalizeThreadScrollState(
              {
                isNearBottom: false,
                hasUnseenAssistantContent: false,
                lastSeenAssistantItemId: getLastAssistantItemId(items),
              },
              items,
            ),
            updatedAt: new Date().toISOString(),
          },
        }));
        ensureContextUiState(resolvedContextId);
        setActiveContextId(resolvedContextId);
        requestThreadTopScroll();
      } else {
        if (shouldAppendUserBubble && userLabel) {
          appendUserToThread(resolvedContextId, userLabel);
        }
        appendAssistantToThread(resolvedContextId, localEnvelope);
        ensureContextUiState(resolvedContextId);
      }

      void syncKnownContextInBackground(action);
      if (caseId) {
        reportCaseTransitionMetric({
          caseId,
          durationMs: (typeof performance !== 'undefined' ? performance.now() : startedAt) - startedAt,
          mode: wasCaseCold ? 'cold' : 'warm',
          path: 'known-context',
        });
      }
      return true;
    } catch (caughtError) {
      if (requestId !== caseLoadRequestRef.current || !targetContextId) {
        return true;
      }

      const errorEnvelope = buildClientErrorRetryEnvelope(
        sessionIdRef.current,
        sessionMeta.used,
        caughtError instanceof Error ? caughtError.message : 'Не удалось загрузить кейс.',
      );
      setLastFailedRequest({
        kind: 'case-module',
        targetContextId,
        action,
        userLabel,
        appendUserBubble: shouldAppendUserBubble,
      });
      replaceThreadWithEnvelope(targetContextId, errorEnvelope);
      return true;
    } finally {
      if (requestId === caseLoadRequestRef.current) {
        setBootstrappingContextId(null);
        setLoadingContextId(null);
      }
    }
  }

  async function openFreshContext(
    targetContextId: ContextId,
    action: UIAction,
    options?: { userLabel?: string; appendUserBubble?: boolean },
  ) {
    const userLabel = options?.userLabel;
    const shouldAppendUserBubble = options?.appendUserBubble ?? Boolean(userLabel);

    captureActiveThreadScrollState();
    clearModal();
    setActiveContextId(targetContextId);
    setLoadingContextId(targetContextId);
    setError(null);
    setLastFailedRequest(null);
    ensureContextUiState(targetContextId);
    requestThreadTopScroll();

    if (shouldAppendUserBubble && userLabel) {
      appendUserToThread(targetContextId, userLabel);
    }

    try {
      const envelope = await fetchChatEnvelope({
        sessionId: sessionIdRef.current ?? undefined,
        input: { type: 'action', action },
      });
      await ensureEnvelopeCaseLoaded(envelope);
      const nextContextId = getContextIdFromEnvelope(envelope);

      setSessionId(envelope.sessionId);
      updateSessionMeta(envelope);
      appendAssistantToThread(nextContextId, envelope);
      setActiveContextId(nextContextId);
      setServerContextId(nextContextId);
    } catch (caughtError) {
      const errorEnvelope = buildClientErrorRetryEnvelope(
        sessionIdRef.current,
        sessionMeta.used,
        caughtError instanceof Error ? caughtError.message : undefined,
      );
      setLastFailedRequest({
        kind: 'fresh-context',
        targetContextId,
        action,
      });
      appendAssistantToThread(targetContextId, errorEnvelope);
      setError(null);
    } finally {
      setLoadingContextId(null);
    }
  }

  async function appendAssistantResponse(
    contextId: ContextId,
    body: ChatRequestBody,
    options?: {
      userText?: string;
      syncBeforeRequest?: boolean;
      clearInputOnSuccess?: boolean;
      forceThreadContextId?: ContextId;
    },
  ) {
    if (options?.userText) {
      appendUserToThread(contextId, options.userText);
    }

    clearModal();
    setLoadingContextId(contextId);
    setError(null);
    setLastFailedRequest(null);
    if (threadsRef.current[contextId]?.scrollState.isNearBottom ?? true) {
      requestStickyScroll();
    }

    try {
      if (options?.syncBeforeRequest) {
        await ensureServerContextSynced(contextId);
      }

      const envelope = await fetchChatEnvelope(body);
      await ensureEnvelopeCaseLoaded(envelope);
      const nextContextId = getContextIdFromEnvelope(envelope);
      const targetContextId = options?.forceThreadContextId ?? resolveReplyThreadContextId(contextId, body, envelope);

      setSessionId(envelope.sessionId);
      updateSessionMeta(envelope);
      appendAssistantToThread(targetContextId, envelope);
      setActiveContextId(targetContextId);
      setServerContextId(nextContextId);
      if (options?.clearInputOnSuccess) {
        setInput('');
      }
      setLastFailedRequest(null);
    } catch (caughtError) {
      const targetContextId = options?.forceThreadContextId ?? contextId;
      const errorEnvelope = buildClientErrorRetryEnvelope(
        sessionIdRef.current,
        sessionMeta.used,
        caughtError instanceof Error ? caughtError.message : undefined,
      );
      setLastFailedRequest({
        kind: 'chat',
        contextId,
        body,
        syncBeforeRequest: Boolean(options?.syncBeforeRequest),
        clearInputOnSuccess: Boolean(options?.clearInputOnSuccess),
        forceThreadContextId: options?.forceThreadContextId,
      });
      appendAssistantToThread(targetContextId, errorEnvelope);
      setError(null);
    } finally {
      setLoadingContextId(null);
    }
  }

  async function restoreExistingContext(contextId: ContextId) {
    const targetThread = threadsRef.current[contextId];
    const startedAt = typeof performance !== 'undefined' ? performance.now() : 0;
    if (isCaseContextId(contextId)) {
      const caseId = contextId.replace(/^case:/, '');
      const requestId = ++caseLoadRequestRef.current;
      const wasCaseCold = !isCaseLoaded(caseId);
      if (!isCaseLoaded(caseId)) {
        captureActiveThreadScrollState();
        setActiveContextId(contextId);
        setBootstrappingContextId(contextId);
        setLoadingContextId(contextId);
        requestThreadTopScroll();
        try {
          await loadCaseById(caseId);
        } catch (caughtError) {
          if (requestId === caseLoadRequestRef.current) {
            const action = targetThread ? getSyncActionForContext(targetThread) : getCanonicalActionForCase(caseId);
            const errorEnvelope = buildClientErrorRetryEnvelope(
              sessionIdRef.current,
              sessionMeta.used,
              caughtError instanceof Error ? caughtError.message : 'Не удалось загрузить кейс.',
            );
            replaceThreadWithEnvelope(contextId, errorEnvelope);
            setLastFailedRequest({
              kind: 'case-module',
              targetContextId: contextId,
              action: action ?? getCanonicalActionForCase(caseId),
            });
          }
          return;
        } finally {
          if (requestId === caseLoadRequestRef.current) {
            setBootstrappingContextId(null);
            setLoadingContextId(null);
          }
        }
        if (requestId !== caseLoadRequestRef.current) {
          return;
        }
      }

      reportCaseTransitionMetric({
        caseId,
        durationMs: (typeof performance !== 'undefined' ? performance.now() : startedAt) - startedAt,
        mode: wasCaseCold ? 'cold' : 'warm',
        path: 'restore',
      });
    } else {
      caseLoadRequestRef.current += 1;
      setBootstrappingContextId(null);
    }

    captureActiveThreadScrollState();
    clearModal();
    setError(null);
    setLastFailedRequest(null);
    setActiveContextId(contextId);

    if (!shouldRestoreThreadScrollOnSwitch(Boolean(targetThread?.initialized))) {
      requestThreadTopScroll();
    }
  }

  function retryLastFailedRequest() {
    if (!lastFailedRequest || loadingContextId) {
      return;
    }

    setError(null);

    if (lastFailedRequest.kind === 'fresh-context') {
      removeErrorRetryItems(lastFailedRequest.targetContextId);
      void openFreshContext(lastFailedRequest.targetContextId, lastFailedRequest.action, {
        appendUserBubble: false,
      });
      return;
    }

    if (lastFailedRequest.kind === 'case-module') {
      removeErrorRetryItems(lastFailedRequest.targetContextId);
      void openKnownContextLocally(lastFailedRequest.action, {
        userLabel: lastFailedRequest.userLabel,
        appendUserBubble: lastFailedRequest.appendUserBubble,
      });
      return;
    }

    removeErrorRetryItems(lastFailedRequest.forceThreadContextId ?? lastFailedRequest.contextId);
    void appendAssistantResponse(lastFailedRequest.contextId, lastFailedRequest.body, {
      syncBeforeRequest: lastFailedRequest.syncBeforeRequest,
      clearInputOnSuccess: lastFailedRequest.clearInputOnSuccess,
      forceThreadContextId: lastFailedRequest.forceThreadContextId,
    });
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setError(null);

      try {
        const searchParams = new URLSearchParams(globalThis.location.search);
        if (searchParams.get('reset') === '1') {
          clearPersistedThreadState();
          searchParams.delete('reset');
          const nextQuery = searchParams.toString();
          const nextUrl = `${globalThis.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${globalThis.location.hash}`;
          globalThis.history.replaceState(null, '', nextUrl);
        }

        try {
          const persistedRaw = readPersistedThreadState();
          if (persistedRaw) {
            const persisted = JSON.parse(persistedRaw) as Partial<PersistedThreadState>;
            const persistedThreads = hydratePersistedThreads(persisted.threadsByContextId ?? {});
            const persistedContextUiState = persisted.contextUiStateByContextId ?? {};
            const persistedActiveContext = persisted.activeContextId ?? 'entry';
            const persistedWorkspaceMode = inferWorkspaceMode(persisted, persistedThreads, persistedActiveContext);
            const shouldHydratePersistedState =
              Boolean(persisted.sessionId && Object.keys(persistedThreads).length) ||
              persistedWorkspaceMode === 'chat';

            if (shouldHydratePersistedState) {
              if (isCaseContextId(persistedActiveContext)) {
                await loadCaseById(persistedActiveContext.replace(/^case:/, ''));
              }
              if (!cancelled) {
                setSessionId(persisted.sessionId ?? null);
                setThreadsByContextId(persistedThreads);
                setContextUiStateByContextId(persistedContextUiState);
                setActiveContextId(persistedActiveContext);
                setWorkspaceMode(persistedWorkspaceMode);
                setSessionMeta(persisted.sessionMeta ?? DEFAULT_SESSION_META);
                setServerContextId(null);
                setHasHydrated(true);
              }
              return;
            }
          }
        } catch {
          clearPersistedThreadState();
        }

        if (!cancelled) {
          setHasHydrated(true);
        }
      } catch (caughtError) {
        if (!cancelled) {
          console.warn('Portfolio state hydration failed; continuing with local shell.', caughtError);
          setHasHydrated(true);
          setError(null);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
      if (transitionTimeoutRef.current) {
        globalThis.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  usePortfolioTextareaAutosize(input, textareaRef);

  async function handleChipClick(chip: PromptChip) {
    if (workspaceModeRef.current === 'landing') {
      startWorkspaceTransition('chip');
    }

    if (chip.message) {
      prepareLandingConversationStart();
      void appendAssistantResponse(
        activeContextId,
        {
          sessionId: sessionIdRef.current ?? undefined,
          input: { type: 'message', text: chip.message },
        },
        { userText: chip.label },
      );
      return;
    }

    if (!chip.action) {
      return;
    }

    const targetContextId = getContextIdFromAction(chip.action);
    if (targetContextId && targetContextId !== activeContextId && threadsRef.current[targetContextId]?.initialized) {
      await restoreExistingContext(targetContextId);
      return;
    }

    if (await openKnownContextLocally(chip.action, { userLabel: chip.label, appendUserBubble: true })) {
      return;
    }

    void appendAssistantResponse(
      activeContextId,
      {
        sessionId: sessionIdRef.current ?? undefined,
        input: { type: 'action', action: chip.action },
      },
      { userText: chip.label },
    );
  }

  async function handleRailClick(item: RailItem) {
    if (workspaceModeRef.current === 'landing') {
      startWorkspaceTransition('case');
    }

    const targetContextId: ContextId =
      item.kind === 'experience' ? 'experience' : makeCaseContextId(item.id);

    if (targetContextId === activeContextId) {
      return;
    }

    if (threadsRef.current[targetContextId]?.initialized) {
      await restoreExistingContext(targetContextId);
      return;
    }

    const action =
      item.kind === 'experience'
        ? ({ type: 'open_experience_summary' } as UIAction)
        : getCanonicalActionForCase(item.id);

    if (await openKnownContextLocally(action, { appendUserBubble: false })) {
      return;
    }

    void openFreshContext(targetContextId, action, { appendUserBubble: false });
  }

  function handleAssistantReturnClick() {
    if (activeContextId === 'entry') {
      return;
    }

    void restoreExistingContext('entry');
  }

  async function handleCta(action: UIAction) {
    if (action.type === 'open_contact_modal') {
      openContactModal();
      return;
    }

    if (action.type === 'open_image_modal') {
      await loadCaseById(action.caseId);
      openImageModal(action.caseId, action.artifactId);
      return;
    }

    const targetContextId = getContextIdFromAction(action);

    if (targetContextId && targetContextId !== activeContextId && threadsRef.current[targetContextId]?.initialized) {
      await restoreExistingContext(targetContextId);
      return;
    }

    if (await openKnownContextLocally(action, { appendUserBubble: false })) {
      return;
    }

    void appendAssistantResponse(activeContextId, {
      sessionId: sessionIdRef.current ?? undefined,
      input: { type: 'action', action },
    });
  }

  async function handleOpenArtifact(target: ArtifactOpenTarget) {
    const targetCaseId = target.caseId ?? currentCaseId;

    if (!targetCaseId) {
      return;
    }

    await loadCaseById(targetCaseId);
    openImageModal(targetCaseId, target.artifactId);
  }

  function handleCloseModal() {
    closeModal();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loadingContextId || sessionMeta.remaining <= 0) {
      return;
    }

    const isLandingTextSubmit = workspaceModeRef.current === 'landing';

    if (workspaceModeRef.current === 'landing') {
      prepareLandingConversationStart();
      startWorkspaceTransition('submit');
    }

    void appendAssistantResponse(
      activeContextId,
      { sessionId: sessionIdRef.current ?? undefined, input: { type: 'message', text } },
      {
        userText: text,
        syncBeforeRequest: true,
        clearInputOnSuccess: true,
        forceThreadContextId: isLandingTextSubmit ? 'entry' : undefined,
      },
    );
  }

  return (
    <>
      <div className="portfolio-desktop-blocker min-h-screen items-center justify-center bg-[#F7F8FC] px-6 py-10">
        <div className="flex w-full max-w-[464px] flex-col items-center gap-8 rounded-[32px] border border-[#F0F2F8] bg-white px-[44px] py-8 text-center shadow-[0_6px_8px_rgba(0,0,0,0.06)]">
          <div className="relative size-28 shrink-0 overflow-hidden rounded-[20px]" aria-hidden="true">
            <Image
              src="/ui/desktop-only-icon-preview.png"
              alt=""
              width={112}
              height={112}
              sizes="112px"
              draggable={false}
              className="absolute inset-0 size-full select-none object-cover"
            />
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-[#1F2129]">
              Доступна только Destop версия
            </div>
            <p className="max-w-[376px] text-[18px] font-normal leading-6 text-[#202129]">
              Мобильная версия в этот релиз сознательно не входит. Вы можете связаться с Андреем
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleCta({ type: 'open_contact_modal', source: 'desktop-blocker' })}
            className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#1A1C22] px-6 py-3 text-[15px] font-medium leading-5 text-white transition-colors duration-150 hover:bg-[#4D4D4D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17191F]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Написать Андрею
          </button>
        </div>
      </div>

      <div className="portfolio-desktop-stage h-screen overflow-hidden bg-white">
        <div className="flex h-full w-full justify-center overflow-hidden bg-white">
          <div className="portfolio-desktop-frame flex h-full flex-col overflow-hidden bg-white">
            <PortfolioDesktopHeader
              onContactClick={(source) => handleCta({ type: 'open_contact_modal', source })}
              ctaSource={workspaceMode === 'landing' ? 'entry' : 'header'}
              showDivider={showChatStage}
              constrainToLandingFrame={showLandingStage && !showChatStage}
            />

            <div className="relative min-h-0 flex-1 overflow-hidden">
              <LayoutGroup id="portfolio-workspace">
                <AnimatePresence initial={false} mode="sync">
                  {showLandingStage ? (
                    <PortfolioEntryView
                      key="landing"
                      railItems={railItems}
                      onRailClick={handleRailClick}
                      input={input}
                      onChangeInput={setInput}
                      onSubmit={handleSubmit}
                      loading={Boolean(loadingContextId) || sessionMeta.remaining <= 0}
                      textareaRef={textareaRef}
                      chips={getEntryPrompts()}
                      onChipClick={handleChipClick}
                      composerLayoutId="portfolio-composer-shell"
                    />
                  ) : null}

                  {showChatStage ? (
                    <PortfolioChatWorkspace
                      key="chat"
                      railItems={railItems}
                      selectedRailId={selectedRailId}
                      showAssistantReturn={showAssistantReturn}
                      assistantReturnSelected={activeContextId === 'entry'}
                      messagesRemaining={messagesRemaining}
                      onRailClick={handleRailClick}
                      onAssistantReturnClick={handleAssistantReturnClick}
                      currentThread={currentThread}
                      loading={loadingContextId === activeContextId}
                      error={error}
                      canRetryError={Boolean(lastFailedRequest)}
                      onRetryError={retryLastFailedRequest}
                      onClearError={clearChatError}
                      stickToBottomSignal={stickToBottomSignal}
                      scrollToTopSignal={scrollToTopSignal}
                      restoreThreadScrollSignal={restoreThreadScrollSignal}
                      restoreThreadScrollTop={restoreThreadScrollTop}
                      expandedDisclosureIds={currentContextUiState.expandedDisclosureIds}
                      onToggleDisclosure={(disclosureId) => toggleDisclosure(activeContextId, disclosureId)}
                      onChipClick={handleChipClick}
                      onCta={handleCta}
                      onOpenArtifact={handleOpenArtifact}
                      onMarkAnimatedItems={markThreadItemsAnimated}
                      onThreadScrollStateChange={handleThreadScrollStateChange}
                      input={input}
                      onChangeInput={setInput}
                      onSubmit={handleSubmit}
                      textareaRef={textareaRef}
                      threadViewRef={threadViewRef}
                      contextPanelPayload={currentContextPanelPayload}
                      composerLayoutId="portfolio-composer-shell"
                      startTransitionSource={transitionSource}
                      caseBootstrapping={bootstrappingContextId === activeContextId}
                    />
                  ) : null}
                </AnimatePresence>

              </LayoutGroup>
            </div>
          </div>
        </div>
      </div>

      {modalPayload ? (
        <PortfolioModalOverlay
          modal={modalPayload}
          onClose={handleCloseModal}
        />
      ) : null}
    </>
  );
}
