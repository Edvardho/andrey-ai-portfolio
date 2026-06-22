'use client';

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';

type WorkspaceMode = 'landing' | 'chat';

type ThreadLike = {
  items: Array<{ kind: 'user' | 'assistant' }>;
};

type PersistencePayload<ContextId extends string, ThreadStore, ContextUiStateStore> = {
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

export function useSyncedRef<T>(value: T) {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}

export function useDebouncedPortfolioPersistence<ContextId extends string, ThreadStore, ContextUiStateStore>({
  activeContextId,
  contextUiStateByContextId,
  debounceMs,
  enabled,
  persist,
  sessionId,
  sessionMeta,
  threadsByContextId,
  workspaceMode,
}: {
  activeContextId: ContextId;
  contextUiStateByContextId: ContextUiStateStore;
  debounceMs: number;
  enabled: boolean;
  persist: (payload: PersistencePayload<ContextId, ThreadStore, ContextUiStateStore>) => void;
  sessionId: string | null;
  sessionMeta: { used: number; remaining: number };
  threadsByContextId: ThreadStore;
  workspaceMode: WorkspaceMode;
}) {
  const persistenceTimeoutRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const payload: PersistencePayload<ContextId, ThreadStore, ContextUiStateStore> = {
      sessionId,
      activeContextId,
      threadsByContextId,
      contextUiStateByContextId,
      workspaceMode,
      sessionMeta,
    };

    if (persistenceTimeoutRef.current) {
      globalThis.clearTimeout(persistenceTimeoutRef.current);
    }

    persistenceTimeoutRef.current = globalThis.setTimeout(() => {
      persist(payload);
      persistenceTimeoutRef.current = null;
    }, debounceMs);

    return () => {
      if (persistenceTimeoutRef.current) {
        globalThis.clearTimeout(persistenceTimeoutRef.current);
        persistenceTimeoutRef.current = null;
      }
    };
  }, [
    activeContextId,
    contextUiStateByContextId,
    debounceMs,
    enabled,
    persist,
    sessionId,
    sessionMeta,
    threadsByContextId,
    workspaceMode,
  ]);
}

export function usePortfolioStageRouting<ContextId extends string>({
  activeContextId,
  isBootstrapEntryThread,
  isCaseContextId,
  threadsByContextId,
  workspaceMode,
}: {
  activeContextId: ContextId;
  isBootstrapEntryThread: (thread: ThreadLike | undefined) => boolean;
  isCaseContextId: (contextId: ContextId) => boolean;
  threadsByContextId: Record<string, ThreadLike>;
  workspaceMode: WorkspaceMode;
}) {
  const selectedRailId = useMemo(() => {
    if (activeContextId === 'experience') {
      return 'experience';
    }

    if (isCaseContextId(activeContextId)) {
      return activeContextId.replace(/^case:/, '');
    }

    return null;
  }, [activeContextId, isCaseContextId]);

  const showAssistantReturn = useMemo(() => {
    if (workspaceMode !== 'chat') {
      return false;
    }

    const entryThread = threadsByContextId.entry;
    if (!entryThread || isBootstrapEntryThread(entryThread)) {
      return false;
    }

    return entryThread.items.some((item) => item.kind === 'user');
  }, [isBootstrapEntryThread, threadsByContextId, workspaceMode]);

  return {
    selectedRailId,
    showAssistantReturn,
    showChatStage: workspaceMode === 'chat',
    showLandingStage: workspaceMode === 'landing',
  };
}

export function usePortfolioTextareaAutosize(input: string, textareaRef: RefObject<HTMLTextAreaElement | null>) {
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';

    const lineHeight = Number.parseFloat(globalThis.getComputedStyle(textarea).lineHeight) || 32;
    const maxHeight = Math.round(lineHeight * 3);
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = `${Math.max(nextHeight, lineHeight)}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [input, textareaRef]);
}

export function usePortfolioModalController<ModalPayload>({
  buildContactModalPayload,
  buildImageModalPayload,
  captureActiveThreadScrollState,
  getFallbackScrollTop,
  requestThreadScrollRestore,
  shouldRestoreScrollAfterModalClose,
}: {
  buildContactModalPayload: () => ModalPayload;
  buildImageModalPayload: (caseId: string, artifactId: string) => ModalPayload | null;
  captureActiveThreadScrollState: () => { scrollTop: number } | null;
  getFallbackScrollTop: () => number;
  requestThreadScrollRestore: (scrollTop: number | null) => void;
  shouldRestoreScrollAfterModalClose: () => boolean;
}) {
  const [modalPayload, setModalPayload] = useState<ModalPayload | null>(null);

  function clearModal() {
    setModalPayload(null);
  }

  function openContactModal() {
    captureActiveThreadScrollState();
    setModalPayload(buildContactModalPayload());
  }

  function openImageModal(caseId: string, artifactId: string) {
    captureActiveThreadScrollState();
    const modal = buildImageModalPayload(caseId, artifactId);
    if (modal) {
      setModalPayload(modal);
    }
  }

  function closeModal() {
    const snapshot = captureActiveThreadScrollState();
    setModalPayload(null);

    if (shouldRestoreScrollAfterModalClose()) {
      requestThreadScrollRestore(snapshot?.scrollTop ?? getFallbackScrollTop());
    }
  }

  return {
    clearModal,
    closeModal,
    modalPayload,
    openContactModal,
    openImageModal,
  };
}
