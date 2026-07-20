'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

import type { ArtifactOpenTarget, AssistantEnvelope, PromptChip, UIAction } from '@/lib/portfolio/types';
import {
  estimateAssistantAnimationMs,
  getAssistantRenderMode,
  getThreadItemMotionTiming,
  shouldMarkInitialRevealPlayed,
} from '@/lib/portfolio/response-animation-policy';
import {
  getDisclosureScrollPreserveWindowMs,
  getDisclosureScrollRestoreDelaysMs,
  getManualScrollAutoStickSuppressionMs,
  getManualScrollLockMs,
  getScrollToTopSuppressionMs,
  isProgrammaticScrollAllowed,
  isNearBottom as isViewportNearBottom,
  shouldReleaseDisclosureAnchorOnManualScroll,
  shouldShowJumpToLatest,
  shouldStickToBottom,
  shouldTemporarilyPreserveDisclosureAnchor,
  type ProgrammaticScrollReason,
  type ThreadScrollState,
} from '@/lib/portfolio/response-scroll-policy';
import { THREAD_EASE, WORKSPACE_EASE } from './portfolio-motion';
import { PortfolioUserBubble } from './portfolio-user-bubble';
import { PortfolioAssistantEnvelopeView } from './portfolio-assistant-envelope';
import { PortfolioAssistantLoadingRow } from './portfolio-assistant-loading-row';
import {
  portfolioFocusRing,
  portfolioPrimaryAction,
  portfolioSoftSurfaceBorder,
} from './portfolio-interaction-styles';

export type ThreadItem =
  | { id: string; kind: 'user'; text: string; hasAnimated: boolean }
  | { id: string; kind: 'assistant'; envelope: AssistantEnvelope; hasAnimated: boolean };

export type ContextId =
  | 'entry'
  | 'experience'
  | 'mobile-experience'
  | 'additional-cases'
  | `case:${string}`;

export type PortfolioThreadViewHandle = {
  captureScrollState: () => ThreadScrollState | null;
};

export type ReplyFocusRequest = {
  id: number;
  contextId: ContextId;
  userItemId: string;
  assistantItemId: string | null;
  status: 'pending' | 'focused';
};

function getLatestAssistantItemId(items: ThreadItem[]) {
  return [...items].reverse().find((item) => item.kind === 'assistant')?.id ?? null;
}

function isManualScrollKey(key: string) {
  return key === 'PageDown'
    || key === 'PageUp'
    || key === 'ArrowDown'
    || key === 'ArrowUp'
    || key === ' '
    || key === 'Spacebar';
}

function areThreadScrollStatesEqual(left: ThreadScrollState, right: ThreadScrollState) {
  return left.scrollTop === right.scrollTop
    && left.isNearBottom === right.isNearBottom
    && left.hasUnseenAssistantContent === right.hasUnseenAssistantContent
    && left.lastSeenAssistantItemId === right.lastSeenAssistantItemId;
}

function useThreadScrollStateController({
  contextId,
  scrollState,
  onScrollStateChange,
}: {
  contextId: ContextId;
  scrollState: ThreadScrollState;
  onScrollStateChange: (contextId: ContextId, scrollState: ThreadScrollState) => void;
}) {
  const [liveScrollState, setLiveScrollStateValue] = useState(scrollState);
  const liveScrollStateRef = useRef(scrollState);
  const latestScrollStatePropRef = useRef(scrollState);
  const scrollStateReportTimeoutRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);

  useLayoutEffect(() => {
    latestScrollStatePropRef.current = scrollState;
  }, [scrollState]);

  const cancelPendingScrollStateFlush = useCallback(() => {
    if (!scrollStateReportTimeoutRef.current) {
      return;
    }

    globalThis.clearTimeout(scrollStateReportTimeoutRef.current);
    scrollStateReportTimeoutRef.current = null;
  }, []);

  const flushScrollState = useCallback((nextScrollState: ThreadScrollState) => {
    liveScrollStateRef.current = nextScrollState;
    onScrollStateChange(contextId, nextScrollState);
  }, [contextId, onScrollStateChange]);

  const setLiveScrollStateIfChanged = useCallback((nextScrollState: ThreadScrollState) => {
    if (areThreadScrollStatesEqual(liveScrollStateRef.current, nextScrollState)) {
      return false;
    }

    liveScrollStateRef.current = nextScrollState;
    setLiveScrollStateValue((currentScrollState) => (
      areThreadScrollStatesEqual(currentScrollState, nextScrollState) ? currentScrollState : nextScrollState
    ));

    return true;
  }, []);

  const scheduleScrollStateFlush = useCallback((nextScrollState: ThreadScrollState) => {
    liveScrollStateRef.current = nextScrollState;
    cancelPendingScrollStateFlush();

    scrollStateReportTimeoutRef.current = globalThis.setTimeout(() => {
      flushScrollState(nextScrollState);
      scrollStateReportTimeoutRef.current = null;
    }, 80);
  }, [cancelPendingScrollStateFlush, flushScrollState]);

  const setNextScrollState = useCallback((nextScrollState: ThreadScrollState, options?: { flushImmediately?: boolean }) => {
    setLiveScrollStateIfChanged(nextScrollState);

    if (areThreadScrollStatesEqual(latestScrollStatePropRef.current, nextScrollState)) {
      cancelPendingScrollStateFlush();
      return;
    }

    if (options?.flushImmediately) {
      cancelPendingScrollStateFlush();
      flushScrollState(nextScrollState);
      return;
    }

    scheduleScrollStateFlush(nextScrollState);
  }, [
    cancelPendingScrollStateFlush,
    flushScrollState,
    scheduleScrollStateFlush,
    setLiveScrollStateIfChanged,
  ]);

  return {
    cancelPendingScrollStateFlush,
    latestScrollStatePropRef,
    liveScrollState,
    liveScrollStateRef,
    setLiveScrollStateIfChanged,
    setNextScrollState,
  };
}

type PortfolioThreadViewProps = {
  contextId: ContextId;
  items: ThreadItem[];
  scrollState: ThreadScrollState;
  hasPlayedInitialReveal: boolean;
  loading: boolean;
  error: string | null;
  canRetryError: boolean;
  onRetryError: () => void;
  onClearError: () => void;
  stickToBottomSignal: number;
  scrollToTopSignal: number;
  restoreThreadScrollSignal: number;
  restoreThreadScrollTop: number | null;
  expandedDisclosureIds: string[];
  onToggleDisclosure: (id: string) => void;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction) => void;
  onOpenArtifact: (target: ArtifactOpenTarget) => void;
  onMarkAnimatedItems: (
    contextId: ContextId,
    itemIds: string[],
    options?: { markInitialRevealPlayed?: boolean },
  ) => void;
  onScrollStateChange: (contextId: ContextId, scrollState: ThreadScrollState) => void;
  startTransitionSource: 'submit' | 'chip' | 'case' | null;
  replyFocusRequest: ReplyFocusRequest | null;
  onReplyFocusCancelled: (id: number) => void;
  onReplyFocusHandled: (id: number) => void;
};

export const PortfolioThreadView = forwardRef<PortfolioThreadViewHandle, PortfolioThreadViewProps>(function PortfolioThreadView({
  contextId,
  items,
  scrollState,
  hasPlayedInitialReveal,
  loading,
  error,
  canRetryError,
  onRetryError,
  onClearError,
  stickToBottomSignal,
  scrollToTopSignal,
  restoreThreadScrollSignal,
  restoreThreadScrollTop,
  expandedDisclosureIds,
  onToggleDisclosure,
  onChipClick,
  onCta,
  onOpenArtifact,
  onMarkAnimatedItems,
  onScrollStateChange,
  startTransitionSource,
  replyFocusRequest,
  onReplyFocusCancelled,
  onReplyFocusHandled,
}, ref) {
  const animateThreadStart = Boolean(startTransitionSource);
  const threadViewportRef = useRef<HTMLDivElement | null>(null);
  const threadContentRef = useRef<HTMLDivElement | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const shouldStickToBottomRef = useRef(scrollState.isNearBottom);
  const hasMountedRef = useRef(false);
  const handledStickToBottomSignalRef = useRef(0);
  const handledScrollToTopSignalRef = useRef(0);
  const handledRestoreThreadScrollSignalRef = useRef(0);
  const suppressAutoScrollUntilRef = useRef(0);
  const manualScrollLockUntilRef = useRef(0);
  const lastProgrammaticScrollReasonRef = useRef<ProgrammaticScrollReason | null>(null);
  const isProgrammaticScrollInFlightRef = useRef(false);
  const replyAnchorInFlightRef = useRef<number | null>(null);
  const preservedDisclosureScrollTopRef = useRef<number | null>(null);
  const disclosureRestoreTimeoutsRef = useRef<ReturnType<typeof globalThis.setTimeout>[]>([]);
  const latestAssistantItemId = getLatestAssistantItemId(items);
  const {
    cancelPendingScrollStateFlush,
    latestScrollStatePropRef,
    liveScrollState,
    liveScrollStateRef,
    setLiveScrollStateIfChanged,
    setNextScrollState,
  } = useThreadScrollStateController({
    contextId,
    scrollState,
    onScrollStateChange,
  });

  const readScrollStateFromViewport = useCallback((params?: { hasUnseenAssistantContent?: boolean }) => {
    const viewport = threadViewportRef.current;

    if (!viewport) {
      return liveScrollStateRef.current;
    }

    const nearBottom = isViewportNearBottom({
      scrollHeight: viewport.scrollHeight,
      scrollTop: viewport.scrollTop,
      clientHeight: viewport.clientHeight,
    });

    return {
      scrollTop: viewport.scrollTop,
      isNearBottom: nearBottom,
      hasUnseenAssistantContent: nearBottom ? false : (params?.hasUnseenAssistantContent ?? liveScrollStateRef.current.hasUnseenAssistantContent),
      lastSeenAssistantItemId: nearBottom ? latestAssistantItemId : liveScrollStateRef.current.lastSeenAssistantItemId,
    };
  }, [latestAssistantItemId, liveScrollStateRef]);

  useImperativeHandle(ref, () => ({
    captureScrollState() {
      return readScrollStateFromViewport();
    },
  }), [readScrollStateFromViewport]);

  const getThreadBottomScrollTop = useCallback(() => {
    const viewport = threadViewportRef.current;
    if (!viewport) {
      return 0;
    }

    return viewport.scrollHeight;
  }, []);

  const applyProgrammaticScroll = useCallback((params: {
    reason: ProgrammaticScrollReason;
    top: number;
    behavior?: ScrollBehavior;
  }) => {
    const viewport = threadViewportRef.current;
    if (!viewport) {
      return false;
    }

    const now = globalThis.performance.now();
    if (!isProgrammaticScrollAllowed(params.reason, manualScrollLockUntilRef.current, now)) {
      return false;
    }

    lastProgrammaticScrollReasonRef.current = params.reason;
    isProgrammaticScrollInFlightRef.current = true;

    if (params.behavior) {
      viewport.scrollTo({
        top: params.top,
        behavior: params.behavior,
      });
    } else {
      viewport.scrollTop = params.top;
    }

    globalThis.requestAnimationFrame(() => {
      isProgrammaticScrollInFlightRef.current = false;
    });

    return true;
  }, []);

  function handleScroll() {
    const nextScrollState = readScrollStateFromViewport();
    const programmaticReason = lastProgrammaticScrollReasonRef.current;
    const isProgrammaticScroll = isProgrammaticScrollInFlightRef.current && programmaticReason !== null;
    const isReplyAnchorActive = replyAnchorInFlightRef.current !== null;
    if ((!isProgrammaticScroll && !isReplyAnchorActive) || programmaticReason === 'sticky_bottom' || programmaticReason === 'jump_to_latest') {
      shouldStickToBottomRef.current = nextScrollState.isNearBottom;
    }
    setNextScrollState(nextScrollState);
  }

  const restoreDisclosureScrollPosition = useCallback(() => {
    const scrollTop = preservedDisclosureScrollTopRef.current;

    if (scrollTop === null) {
      return;
    }

    applyProgrammaticScroll({
      reason: 'disclosure_anchor',
      top: scrollTop,
    });
  }, [applyProgrammaticScroll]);

  const clearDisclosureScrollPreservation = useCallback(() => {
    disclosureRestoreTimeoutsRef.current.forEach((timeoutId) => {
      globalThis.clearTimeout(timeoutId);
    });
    disclosureRestoreTimeoutsRef.current = [];
    preservedDisclosureScrollTopRef.current = null;
    suppressAutoScrollUntilRef.current = 0;
  }, []);

  function scheduleDisclosureScrollRestores() {
    disclosureRestoreTimeoutsRef.current.forEach((timeoutId) => {
      globalThis.clearTimeout(timeoutId);
    });
    disclosureRestoreTimeoutsRef.current = [];

    for (const delay of getDisclosureScrollRestoreDelaysMs()) {
      const timeoutId = globalThis.setTimeout(() => {
        restoreDisclosureScrollPosition();
      }, delay);
      disclosureRestoreTimeoutsRef.current.push(timeoutId);
    }
  }

  function handleManualScrollIntent() {
    if (replyFocusRequest) {
      replyAnchorInFlightRef.current = null;
      onReplyFocusCancelled(replyFocusRequest.id);
    }
    shouldStickToBottomRef.current = false;
    manualScrollLockUntilRef.current = Math.max(
      manualScrollLockUntilRef.current,
      globalThis.performance.now() + getManualScrollLockMs(),
    );
    suppressAutoScrollUntilRef.current = Math.max(
      suppressAutoScrollUntilRef.current,
      globalThis.performance.now() + getManualScrollAutoStickSuppressionMs(),
    );

    if (preservedDisclosureScrollTopRef.current === null || !shouldReleaseDisclosureAnchorOnManualScroll()) {
      return;
    }

    clearDisclosureScrollPreservation();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!isManualScrollKey(event.key)) {
      return;
    }

    handleManualScrollIntent();
  }

  const getThreadItemScrollTop = useCallback((itemId: string) => {
    const viewport = threadViewportRef.current;
    const item = threadContentRef.current?.querySelector<HTMLElement>(`[data-thread-item-id="${itemId}"]`);
    if (!viewport || !item) {
      return null;
    }

    const viewportRect = viewport.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    return Math.max(0, itemRect.top - viewportRect.top + viewport.scrollTop - 24);
  }, []);

  useEffect(() => {
    if (!replyFocusRequest || replyFocusRequest.contextId !== contextId) {
      replyAnchorInFlightRef.current = null;
    }
  }, [contextId, replyFocusRequest]);

  useLayoutEffect(() => {
    if (
      !replyFocusRequest
      || replyFocusRequest.contextId !== contextId
      || replyFocusRequest.status === 'focused'
    ) {
      return undefined;
    }

    let frameId: number | null = null;
    let hasRetried = false;

    const focusReply = () => {
      const targetItemId = replyFocusRequest.assistantItemId ?? replyFocusRequest.userItemId;
      const targetTop = getThreadItemScrollTop(targetItemId);

      if (targetTop === null && !hasRetried) {
        hasRetried = true;
        frameId = globalThis.requestAnimationFrame(focusReply);
        return;
      }

      if (targetTop === null) {
        onReplyFocusCancelled(replyFocusRequest.id);
        return;
      }

      shouldStickToBottomRef.current = false;
      const didScroll = applyProgrammaticScroll({
        reason: 'reply_anchor',
        top: targetTop,
        behavior: 'smooth',
      });

      if (!didScroll) {
        onReplyFocusCancelled(replyFocusRequest.id);
        return;
      }

      replyAnchorInFlightRef.current = replyFocusRequest.id;
      setNextScrollState(
        {
          ...liveScrollStateRef.current,
          scrollTop: targetTop,
          isNearBottom: false,
          hasUnseenAssistantContent: false,
          lastSeenAssistantItemId: replyFocusRequest.assistantItemId ?? liveScrollStateRef.current.lastSeenAssistantItemId,
        },
        { flushImmediately: true },
      );

      if (replyFocusRequest.assistantItemId) {
        onReplyFocusHandled(replyFocusRequest.id);
      }
    };

    focusReply();

    return () => {
      if (frameId !== null) {
        globalThis.cancelAnimationFrame(frameId);
      }
    };
  }, [
    applyProgrammaticScroll,
    contextId,
    getThreadItemScrollTop,
    liveScrollStateRef,
    onReplyFocusCancelled,
    onReplyFocusHandled,
    replyFocusRequest,
    setNextScrollState,
  ]);

  function handleToggleDisclosure(disclosureId: string) {
    const viewport = threadViewportRef.current;

    if (viewport && shouldTemporarilyPreserveDisclosureAnchor()) {
      preservedDisclosureScrollTopRef.current = viewport.scrollTop;
      suppressAutoScrollUntilRef.current = globalThis.performance.now() + getDisclosureScrollPreserveWindowMs();
    }

    onToggleDisclosure(disclosureId);
    scheduleDisclosureScrollRestores();

    globalThis.requestAnimationFrame(() => {
      restoreDisclosureScrollPosition();

      globalThis.requestAnimationFrame(() => {
        restoreDisclosureScrollPosition();
      });
    });
  }

  useLayoutEffect(() => {
    if (!threadEndRef.current || !threadViewportRef.current) {
      return;
    }

    if (replyFocusRequest?.contextId === contextId) {
      return;
    }

    if (globalThis.performance.now() < suppressAutoScrollUntilRef.current) {
      return;
    }

    // The entry animation is visual only. It must not override an explicit
    // scroll-to-top request made when a new workspace opens.
    if (!shouldStickToBottom({ isNearBottom: shouldStickToBottomRef.current })) {
      return;
    }

    const didScroll = applyProgrammaticScroll({
      reason: 'sticky_bottom',
      top: getThreadBottomScrollTop(),
      behavior: hasMountedRef.current ? 'smooth' : 'auto',
    });
    if (didScroll) {
      hasMountedRef.current = true;
    }
  }, [applyProgrammaticScroll, contextId, error, getThreadBottomScrollTop, items.length, loading, replyFocusRequest]);

  useLayoutEffect(() => {
    if (stickToBottomSignal <= 0 || !threadViewportRef.current) {
      return;
    }

    if (stickToBottomSignal === handledStickToBottomSignalRef.current) {
      return;
    }
    handledStickToBottomSignalRef.current = stickToBottomSignal;

    shouldStickToBottomRef.current = true;
    const didScroll = applyProgrammaticScroll({
      reason: 'sticky_bottom',
      top: getThreadBottomScrollTop(),
      behavior: 'smooth',
    });
    if (!didScroll) {
      shouldStickToBottomRef.current = false;
      return;
    }

    setNextScrollState(
      {
        ...liveScrollStateRef.current,
        isNearBottom: true,
        hasUnseenAssistantContent: false,
        lastSeenAssistantItemId: latestAssistantItemId,
      },
      { flushImmediately: true },
    );
  }, [
    applyProgrammaticScroll,
    getThreadBottomScrollTop,
    latestAssistantItemId,
    liveScrollStateRef,
    setNextScrollState,
    stickToBottomSignal,
  ]);

  useLayoutEffect(() => {
    if (scrollToTopSignal <= 0 || !threadViewportRef.current) {
      return;
    }

    if (scrollToTopSignal === handledScrollToTopSignalRef.current) {
      return;
    }
    handledScrollToTopSignalRef.current = scrollToTopSignal;

    shouldStickToBottomRef.current = false;
    suppressAutoScrollUntilRef.current = globalThis.performance.now() + getScrollToTopSuppressionMs();
    applyProgrammaticScroll({
      reason: 'initial_thread_top',
      top: 0,
    });
    setNextScrollState(
      {
        ...liveScrollStateRef.current,
        scrollTop: 0,
        isNearBottom: false,
      },
      { flushImmediately: true },
    );

    globalThis.requestAnimationFrame(() => {
      applyProgrammaticScroll({
        reason: 'initial_thread_top',
        top: 0,
      });
    });
  }, [applyProgrammaticScroll, liveScrollStateRef, scrollToTopSignal, setNextScrollState]);

  useLayoutEffect(() => {
    const viewport = threadViewportRef.current;
    if (!viewport) {
      return;
    }

    const nextScrollState = latestScrollStatePropRef.current;
    applyProgrammaticScroll({
      reason: 'thread_switch_restore',
      top: nextScrollState.scrollTop,
    });
    shouldStickToBottomRef.current = nextScrollState.isNearBottom;
    setLiveScrollStateIfChanged(nextScrollState);

    globalThis.requestAnimationFrame(() => {
      applyProgrammaticScroll({
        reason: 'thread_switch_restore',
        top: nextScrollState.scrollTop,
      });
    });
  }, [
    applyProgrammaticScroll,
    contextId,
    latestScrollStatePropRef,
    setLiveScrollStateIfChanged,
  ]);

  useLayoutEffect(() => {
    if (restoreThreadScrollSignal <= 0 || restoreThreadScrollTop === null || !threadViewportRef.current) {
      return;
    }

    if (restoreThreadScrollSignal === handledRestoreThreadScrollSignalRef.current) {
      return;
    }
    handledRestoreThreadScrollSignalRef.current = restoreThreadScrollSignal;

    applyProgrammaticScroll({
      reason: 'modal_restore',
      top: restoreThreadScrollTop,
    });
    shouldStickToBottomRef.current = liveScrollStateRef.current.isNearBottom;
    setNextScrollState(
      {
        ...liveScrollStateRef.current,
        scrollTop: restoreThreadScrollTop,
      },
      { flushImmediately: true },
    );

    globalThis.requestAnimationFrame(() => {
      applyProgrammaticScroll({
        reason: 'modal_restore',
        top: restoreThreadScrollTop,
      });
    });
  }, [
    applyProgrammaticScroll,
    liveScrollStateRef,
    restoreThreadScrollSignal,
    restoreThreadScrollTop,
    setNextScrollState,
  ]);

  useLayoutEffect(() => {
    const content = threadContentRef.current;
    if (!content) {
      return;
    }

    let frameId = 0;

    const observer = new ResizeObserver(() => {
      if (globalThis.performance.now() < suppressAutoScrollUntilRef.current) {
        restoreDisclosureScrollPosition();
        return;
      }

      if (preservedDisclosureScrollTopRef.current !== null) {
        clearDisclosureScrollPreservation();
      }

      if (!shouldStickToBottomRef.current) {
        return;
      }

      globalThis.cancelAnimationFrame(frameId);
      frameId = globalThis.requestAnimationFrame(() => {
        applyProgrammaticScroll({
          reason: 'sticky_bottom',
          top: getThreadBottomScrollTop(),
          behavior: 'auto',
        });
      });
    });

    observer.observe(content);

    return () => {
      observer.disconnect();
      globalThis.cancelAnimationFrame(frameId);
    };
  }, [
    applyProgrammaticScroll,
    clearDisclosureScrollPreservation,
    getThreadBottomScrollTop,
    restoreDisclosureScrollPosition,
  ]);

  useLayoutEffect(() => {
    return () => {
      clearDisclosureScrollPreservation();
      cancelPendingScrollStateFlush();
    };
  }, [cancelPendingScrollStateFlush, clearDisclosureScrollPreservation]);

  useEffect(() => {
    setLiveScrollStateIfChanged({
      ...liveScrollStateRef.current,
      hasUnseenAssistantContent: scrollState.hasUnseenAssistantContent,
      lastSeenAssistantItemId: scrollState.lastSeenAssistantItemId,
    });
  }, [
    contextId,
    liveScrollStateRef,
    scrollState.hasUnseenAssistantContent,
    scrollState.lastSeenAssistantItemId,
    setLiveScrollStateIfChanged,
  ]);

  const pendingItems = items.filter((item) => !item.hasAnimated);
  const pendingSignature = pendingItems.map((item) => item.id).join('|');
  const markInitialRevealPlayed = shouldMarkInitialRevealPlayed(pendingItems, hasPlayedInitialReveal);
  const pendingTimeoutMs = pendingItems.length
    ? Math.max(
        ...pendingItems.map((item) =>
          item.kind === 'assistant'
            ? estimateAssistantAnimationMs(item, hasPlayedInitialReveal)
            : getThreadItemMotionTiming(item, hasPlayedInitialReveal).durationMs,
        ),
      )
    : 0;

  useLayoutEffect(() => {
    if (!pendingSignature) {
      return;
    }

    const itemIdsToMark = pendingSignature.split('|');

    const timeoutId = globalThis.setTimeout(() => {
      onMarkAnimatedItems(contextId, itemIdsToMark, {
        markInitialRevealPlayed,
      });
    }, pendingTimeoutMs);

    return () => {
      globalThis.clearTimeout(timeoutId);
    };
  }, [
    contextId,
    onMarkAnimatedItems,
    pendingSignature,
    pendingTimeoutMs,
    markInitialRevealPlayed,
  ]);

  function getItemMotion(item: ThreadItem) {
    const timing = getThreadItemMotionTiming(item, hasPlayedInitialReveal);

    if (item.hasAnimated) {
      return {
        initial: false as const,
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0 },
      };
    }

    if (item.kind === 'user') {
      return {
        initial: { opacity: 0, y: timing.translateY, scale: timing.scaleFrom },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: timing.durationMs / 1000, ease: WORKSPACE_EASE },
      };
    }

    const renderMode = getAssistantRenderMode(item, hasPlayedInitialReveal);

    if (renderMode === 'progressive_text') {
      return {
        initial: { opacity: 0, y: timing.translateY },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: {
          duration: timing.durationMs / 1000,
          delay: timing.delayMs / 1000,
          ease: WORKSPACE_EASE,
        },
      };
    }

    return {
      initial: { opacity: 0, y: timing.translateY },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: {
        duration: timing.durationMs / 1000,
        delay: timing.delayMs / 1000,
        ease: WORKSPACE_EASE,
      },
    };
  }

  function handleJumpToLatest() {
    shouldStickToBottomRef.current = true;
    clearDisclosureScrollPreservation();
    applyProgrammaticScroll({
      reason: 'jump_to_latest',
      top: getThreadBottomScrollTop(),
      behavior: 'smooth',
    });
    setNextScrollState(
      {
        ...liveScrollStateRef.current,
        isNearBottom: true,
        hasUnseenAssistantContent: false,
        lastSeenAssistantItemId: latestAssistantItemId,
      },
      { flushImmediately: true },
    );
  }

  const showJumpToLatest = shouldShowJumpToLatest({
    isNearBottom: liveScrollState.isNearBottom,
    hasUnseenAssistantContent: liveScrollState.hasUnseenAssistantContent,
  });

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <div
        ref={threadViewportRef}
        onScroll={handleScroll}
        onWheel={handleManualScrollIntent}
        onTouchMove={handleManualScrollIntent}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pt-6 [overflow-anchor:none]"
      >
        <div ref={threadContentRef} className="space-y-7 px-6 pb-6">
          {!items.length && !loading && !error ? (
            <div className="w-full max-w-[798px] rounded-[24px] border border-[#EBEDF2] bg-[#FCFDFF] px-5 py-4 text-[15px] leading-6 text-[#5E606A]">
              Задайте вопрос ассистенту или выберите кейс слева.
            </div>
          ) : null}

          {items.map((item) =>
            item.kind === 'user' ? (
              <motion.div key={item.id} data-thread-item-id={item.id} {...getItemMotion(item)}>
                <PortfolioUserBubble text={item.text} />
              </motion.div>
            ) : (
              <motion.div
                key={item.id}
                data-thread-item-id={item.id}
                {...getItemMotion(item)}
              >
                <PortfolioAssistantEnvelopeView
                  envelope={item.envelope}
                  expandedDisclosureIds={expandedDisclosureIds}
                  onToggleDisclosure={handleToggleDisclosure}
                  onChipClick={onChipClick}
                  onCta={onCta}
                  onOpenArtifact={onOpenArtifact}
                  canRetryError={canRetryError}
                  onRetryError={onRetryError}
                  renderMode={getAssistantRenderMode(item, hasPlayedInitialReveal)}
                  showChips={item.id === latestAssistantItemId}
                />
              </motion.div>
            ),
          )}

          {loading ? (
            <motion.div
              initial={animateThreadStart ? { opacity: 0, y: 40 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: animateThreadStart ? 0.22 : 0, ease: WORKSPACE_EASE }}
            >
              <PortfolioAssistantLoadingRow />
            </motion.div>
          ) : null}

          {error ? (
            <motion.div
              initial={animateThreadStart ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: THREAD_EASE }}
              className="w-full max-w-[798px] rounded-[24px] border border-[#F0D5D2] bg-[#FFF7F6] px-5 py-4 text-[#832B22]"
            >
              <p className="text-[15px] font-medium leading-5">Не получилось получить ответ</p>
              <p className="mt-1 text-[14px] leading-5 text-[#9A4A42]">{error}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {canRetryError ? (
                  <button
                    type="button"
                    onClick={onRetryError}
                    className={[
                      'h-8 cursor-pointer rounded-full border px-4 text-[13px] font-medium leading-5 transition-colors duration-150',
                      portfolioPrimaryAction,
                      portfolioFocusRing,
                    ].join(' ')}
                  >
                    Повторить
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onClearError}
                  className="h-8 cursor-pointer rounded-full border border-[#F0D5D2] bg-white px-4 text-[13px] font-medium leading-5 text-[#832B22] transition hover:bg-[#FFF1F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8EA2FF] focus-visible:ring-offset-2"
                >
                  Очистить ошибку
                </button>
              </div>
            </motion.div>
          ) : null}

          <div className="h-4" aria-hidden="true" />
          <div ref={threadEndRef} aria-hidden="true" />
        </div>
      </div>
      <AnimatePresence initial={false}>
        {showJumpToLatest ? (
          <motion.button
            key="jump-to-latest"
            type="button"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: WORKSPACE_EASE }}
            onClick={handleJumpToLatest}
            className={[
              'absolute bottom-5 left-1/2 z-10 flex size-[56px] -translate-x-1/2 cursor-pointer items-center justify-center rounded-full text-[#11110F] shadow-[0px_12px_24px_rgba(17,15,11,0.14)] transition-colors duration-150',
              portfolioSoftSurfaceBorder,
              portfolioFocusRing,
            ].join(' ')}
            aria-label="Прокрутить к последнему сообщению"
          >
            <ArrowDown className="size-[26px]" strokeWidth={1.9} />
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
});

PortfolioThreadView.displayName = 'PortfolioThreadView';
