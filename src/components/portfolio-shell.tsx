'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { MAX_USER_MESSAGES_PER_SESSION } from '@/lib/portfolio/config';
import { getCaseById, getContactContent, getRailItems, getEntryPrompts } from '@/data/portfolio-content';
import { buildClientEnvelopeForAction } from '@/lib/portfolio/client-seeds';
import type {
  AssistantEnvelope,
  Artifact,
  ChatRequestBody,
  ModalPayload,
  PromptChip,
  RailItem,
  UIAction,
} from '@/lib/portfolio/types';

import { PortfolioEntryView } from './portfolio-entry-view';
import { PortfolioChatWorkspace } from './portfolio-chat-workspace';
import { PortfolioModalOverlay } from './portfolio-modal-overlay';

type ThreadItem =
  | { kind: 'user'; text: string }
  | { kind: 'assistant'; envelope: AssistantEnvelope };

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
  updatedAt: string;
};

type ThreadStore = Record<string, ContextThread>;

type ContextUiState = {
  expandedDisclosureIds: string[];
};

type ContextUiStateStore = Record<string, ContextUiState>;

type PersistedThreadState = {
  sessionId: string | null;
  activeContextId: ContextId;
  threadsByContextId: ThreadStore;
  contextUiStateByContextId: ContextUiStateStore;
  sessionMeta: {
    used: number;
    remaining: number;
  };
};

const THREAD_STORAGE_KEY = 'ai-portfolio-context-threads-v1';
const DEFAULT_SESSION_META = {
  used: 0,
  remaining: MAX_USER_MESSAGES_PER_SESSION,
};
const DEFAULT_CONTEXT_UI_STATE: ContextUiState = {
  expandedDisclosureIds: [],
};
const MOBILE_CASE_IDS = new Set(['expenses-card-holders', 'subscription-sharing', 'ux-ui-wannabelike']);

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

  return {
    contextId,
    items: envelope ? [{ kind: 'assistant', envelope }] : [],
    lastEnvelope: envelope ?? null,
    initialized: Boolean(envelope),
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
  return getCaseById(caseId)?.artifacts.find((artifact) => artifact.id === artifactId);
}

export function PortfolioShell() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeContextId, setActiveContextId] = useState<ContextId>('entry');
  const [threadsByContextId, setThreadsByContextId] = useState<ThreadStore>({});
  const [contextUiStateByContextId, setContextUiStateByContextId] = useState<ContextUiStateStore>({});
  const [modalPayload, setModalPayload] = useState<ModalPayload | null>(null);
  const [sessionMeta, setSessionMeta] = useState(DEFAULT_SESSION_META);
  const [input, setInput] = useState('');
  const [loadingContextId, setLoadingContextId] = useState<ContextId | null>('entry');
  const [error, setError] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const serverContextIdRef = useRef<ContextId | null>(null);
  const activeContextIdRef = useRef<ContextId>('entry');
  const threadsRef = useRef<ThreadStore>({});
  const contextUiStateRef = useRef<ContextUiStateStore>({});

  const railItems = getRailItems();
  const messagesRemaining = sessionMeta.remaining;
  const currentThread = threadsByContextId[activeContextId] ?? createContextThread(activeContextId);
  const currentContextUiState = contextUiStateByContextId[activeContextId] ?? DEFAULT_CONTEXT_UI_STATE;
  const currentEnvelope = currentThread.lastEnvelope;
  const currentCaseId = currentEnvelope?.selectedContext.kind === 'case' ? currentEnvelope.selectedContext.id : null;

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    activeContextIdRef.current = activeContextId;
  }, [activeContextId]);

  useEffect(() => {
    threadsRef.current = threadsByContextId;
  }, [threadsByContextId]);

  useEffect(() => {
    contextUiStateRef.current = contextUiStateByContextId;
  }, [contextUiStateByContextId]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const payload: PersistedThreadState = {
      sessionId,
      activeContextId,
      threadsByContextId,
      contextUiStateByContextId,
      sessionMeta,
    };

    globalThis.sessionStorage.setItem(THREAD_STORAGE_KEY, JSON.stringify(payload));
  }, [activeContextId, contextUiStateByContextId, hasHydrated, sessionId, sessionMeta, threadsByContextId]);

  function setServerContextId(contextId: ContextId | null) {
    serverContextIdRef.current = contextId;
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
      items: [...thread.items, { kind: 'user', text }],
      updatedAt: new Date().toISOString(),
    }));
  }

  function appendAssistantToThread(contextId: ContextId, envelope: AssistantEnvelope) {
    upsertThread(contextId, (thread) => ({
      ...thread,
      items: [...thread.items, { kind: 'assistant', envelope }],
      lastEnvelope: envelope,
      initialized: true,
      updatedAt: new Date().toISOString(),
    }));
  }

  function replaceThreadWithEnvelope(contextId: ContextId, envelope: AssistantEnvelope) {
    setThreadsByContextId((current) => ({
      ...current,
      [contextId]: createContextThread(contextId, envelope),
    }));
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

  async function fetchBootstrapEnvelope(nextSessionId?: string | null): Promise<AssistantEnvelope> {
    const query = nextSessionId ? `?sessionId=${encodeURIComponent(nextSessionId)}` : '';
    const response = await fetch(`/api/assistant/bootstrap${query}`);

    if (!response.ok) {
      throw new Error(`Bootstrap failed with ${response.status}`);
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

  function openKnownContextLocally(
    action: UIAction,
    options?: { userLabel?: string; appendUserBubble?: boolean },
  ): boolean {
    const localEnvelope = buildClientEnvelopeForAction(action, sessionIdRef.current, sessionMeta.used);
    if (!localEnvelope) {
      return false;
    }

    const targetContextId = getContextIdFromEnvelope(localEnvelope);
    const userLabel = options?.userLabel;
    const shouldAppendUserBubble = options?.appendUserBubble ?? Boolean(userLabel);

    setModalPayload(null);
    setError(null);

    if (targetContextId !== activeContextId) {
      const items: ThreadItem[] = [];
      if (shouldAppendUserBubble && userLabel) {
        items.push({ kind: 'user', text: userLabel });
      }
      items.push({ kind: 'assistant', envelope: localEnvelope });

      setThreadsByContextId((current) => ({
        ...current,
        [targetContextId]: {
          contextId: targetContextId,
          items,
          lastEnvelope: localEnvelope,
          initialized: true,
          updatedAt: new Date().toISOString(),
        },
      }));
      ensureContextUiState(targetContextId);
      setActiveContextId(targetContextId);
    } else {
      if (shouldAppendUserBubble && userLabel) {
        appendUserToThread(targetContextId, userLabel);
      }
      appendAssistantToThread(targetContextId, localEnvelope);
      ensureContextUiState(targetContextId);
    }

    void syncKnownContextInBackground(action);
    return true;
  }

  async function openFreshContext(
    targetContextId: ContextId,
    action: UIAction,
    options?: { userLabel?: string; appendUserBubble?: boolean },
  ) {
    const userLabel = options?.userLabel;
    const shouldAppendUserBubble = options?.appendUserBubble ?? Boolean(userLabel);

    setModalPayload(null);
    setActiveContextId(targetContextId);
    setLoadingContextId(targetContextId);
    setError(null);
    ensureContextUiState(targetContextId);

    if (shouldAppendUserBubble && userLabel) {
      appendUserToThread(targetContextId, userLabel);
    }

    try {
      const envelope = await fetchChatEnvelope({
        sessionId: sessionIdRef.current ?? undefined,
        input: { type: 'action', action },
      });
      const nextContextId = getContextIdFromEnvelope(envelope);

      setSessionId(envelope.sessionId);
      updateSessionMeta(envelope);
      appendAssistantToThread(nextContextId, envelope);
      setActiveContextId(nextContextId);
      setServerContextId(nextContextId);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unknown error');
    } finally {
      setLoadingContextId(null);
    }
  }

  async function appendAssistantResponse(
    contextId: ContextId,
    body: ChatRequestBody,
    options?: { userText?: string },
  ) {
    if (options?.userText) {
      appendUserToThread(contextId, options.userText);
    }

    setModalPayload(null);
    setLoadingContextId(contextId);
    setError(null);

    try {
      const envelope = await fetchChatEnvelope(body);
      const nextContextId = getContextIdFromEnvelope(envelope);

      setSessionId(envelope.sessionId);
      updateSessionMeta(envelope);
      appendAssistantToThread(nextContextId, envelope);
      setActiveContextId(nextContextId);
      setServerContextId(nextContextId);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unknown error');
    } finally {
      setLoadingContextId(null);
    }
  }

  function restoreExistingContext(contextId: ContextId) {
    setModalPayload(null);
    setError(null);
    setActiveContextId(contextId);
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoadingContextId('entry');
      setError(null);

      try {
        try {
          const persistedRaw = globalThis.sessionStorage.getItem(THREAD_STORAGE_KEY);
          if (persistedRaw) {
            const persisted = JSON.parse(persistedRaw) as Partial<PersistedThreadState>;
            const persistedThreads = persisted.threadsByContextId ?? {};
            const persistedContextUiState = persisted.contextUiStateByContextId ?? {};
            const persistedActiveContext = persisted.activeContextId ?? 'entry';

            if (persisted.sessionId && Object.keys(persistedThreads).length) {
              if (!cancelled) {
                setSessionId(persisted.sessionId);
                setThreadsByContextId(persistedThreads);
                setContextUiStateByContextId(persistedContextUiState);
                setActiveContextId(persistedActiveContext);
                setSessionMeta(persisted.sessionMeta ?? DEFAULT_SESSION_META);
                setServerContextId(null);
                setLoadingContextId(null);
                setHasHydrated(true);
              }
              return;
            }
          }
        } catch {
          globalThis.sessionStorage.removeItem(THREAD_STORAGE_KEY);
        }

        const envelope = await fetchBootstrapEnvelope();
        if (cancelled) {
          return;
        }

        const contextId = getContextIdFromEnvelope(envelope);
        setSessionId(envelope.sessionId);
        updateSessionMeta(envelope);
        replaceThreadWithEnvelope(contextId, envelope);
        ensureContextUiState(contextId);
        setActiveContextId(contextId);
        setServerContextId(contextId);
        setHasHydrated(true);
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setLoadingContextId(null);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = '0px';

    const lineHeight = Number.parseFloat(globalThis.getComputedStyle(textarea).lineHeight) || 32;
    const verticalPadding = 32;
    const maxHeight = Math.round(lineHeight * 3 + verticalPadding);
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = `${Math.max(nextHeight, lineHeight + verticalPadding)}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [input]);

  function handleChipClick(chip: PromptChip) {
    if (chip.message) {
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
      restoreExistingContext(targetContextId);
      return;
    }

    if (openKnownContextLocally(chip.action, { userLabel: chip.label, appendUserBubble: true })) {
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

  function handleRailClick(item: RailItem) {
    const targetContextId: ContextId =
      item.kind === 'experience' ? 'experience' : makeCaseContextId(item.id);

    if (targetContextId === activeContextId) {
      return;
    }

    if (threadsRef.current[targetContextId]?.initialized) {
      restoreExistingContext(targetContextId);
      return;
    }

    const action =
      item.kind === 'experience'
        ? ({ type: 'open_experience_summary' } as UIAction)
        : getCanonicalActionForCase(item.id);

    if (openKnownContextLocally(action, { appendUserBubble: false })) {
      return;
    }

    void openFreshContext(targetContextId, action, { appendUserBubble: false });
  }

  function handleCta(action: UIAction) {
    if (action.type === 'open_contact_modal') {
      setModalPayload(buildContactModalPayload());
      return;
    }

    if (action.type === 'open_image_modal') {
      const modal = buildImageModalPayload(action.caseId, action.artifactId);
      if (modal) {
        setModalPayload(modal);
      }
      return;
    }

    const targetContextId = getContextIdFromAction(action);

    if (targetContextId && targetContextId !== activeContextId && threadsRef.current[targetContextId]?.initialized) {
      restoreExistingContext(targetContextId);
      return;
    }

    if (openKnownContextLocally(action, { appendUserBubble: false })) {
      return;
    }

    void appendAssistantResponse(activeContextId, {
      sessionId: sessionIdRef.current ?? undefined,
      input: { type: 'action', action },
    });
  }

  function handleOpenArtifact(artifactId: string) {
    if (!currentCaseId) {
      return;
    }

    const modal = buildImageModalPayload(currentCaseId, artifactId);
    if (modal) {
      setModalPayload(modal);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loadingContextId) {
      return;
    }

    setInput('');
    try {
      await ensureServerContextSynced(activeContextId);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unknown error');
      return;
    }

    void appendAssistantResponse(
      activeContextId,
      { sessionId: sessionIdRef.current ?? undefined, input: { type: 'message', text } },
      { userText: text },
    );
  }

  const selectedRailId = useMemo(() => {
    if (activeContextId === 'experience') {
      return 'experience';
    }

    if (isCaseContextId(activeContextId)) {
      return activeContextId.replace(/^case:/, '');
    }

    return null;
  }, [activeContextId]);

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-white p-5 lg:hidden">
        <div className="max-w-md rounded-[32px] border border-[#e6dfd4] bg-white p-8 text-center shadow-[0_18px_44px_rgba(31,26,20,0.06)]">
          <div className="text-[26px] font-semibold tracking-[-0.03em] text-[#11110f]">Desktop-only V1</div>
          <p className="mt-4 text-[16px] leading-8 text-[#605950]">
            Мобильная версия в этот релиз сознательно не входит. Сейчас продукт собран как desktop-first assistant, а не как еще один расползающийся MVP.
          </p>
        </div>
      </div>

      <div className="hidden h-screen overflow-hidden bg-white lg:block">
        {activeContextId === 'entry' ? (
          <PortfolioEntryView
            railItems={railItems}
            onRailClick={handleRailClick}
            input={input}
            onChangeInput={setInput}
            onSubmit={handleSubmit}
            loading={Boolean(loadingContextId)}
            textareaRef={textareaRef}
            chips={getEntryPrompts()}
            onChipClick={handleChipClick}
            onCta={handleCta}
          />
        ) : (
          <PortfolioChatWorkspace
            railItems={railItems}
            selectedRailId={selectedRailId}
            messagesRemaining={messagesRemaining}
            onRailClick={handleRailClick}
            currentThread={currentThread}
            loading={loadingContextId === activeContextId}
            error={error}
            expandedDisclosureIds={currentContextUiState.expandedDisclosureIds}
            onToggleDisclosure={(disclosureId) => toggleDisclosure(activeContextId, disclosureId)}
            onChipClick={handleChipClick}
            onCta={handleCta}
            onOpenArtifact={handleOpenArtifact}
            input={input}
            onChangeInput={setInput}
            onSubmit={handleSubmit}
            textareaRef={textareaRef}
            currentEnvelope={currentEnvelope}
          />
        )}
      </div>

      {modalPayload ? (
        <PortfolioModalOverlay
          modal={modalPayload}
          onClose={() => setModalPayload(null)}
        />
      ) : null}
    </>
  );
}
