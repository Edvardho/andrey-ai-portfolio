'use client';

import { useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';

import type { ArtifactOpenTarget, AssistantEnvelope, PromptChip, UIAction } from '@/lib/portfolio/types';
import {
  estimateAssistantAnimationMs,
  getAssistantRenderMode,
  getAutoScrollThresholdPx,
  getThreadItemMotionTiming,
  shouldMarkInitialRevealPlayed,
} from '@/lib/portfolio/response-animation-policy';
import { THREAD_EASE, WORKSPACE_EASE } from './portfolio-motion';
import { PortfolioUserBubble } from './portfolio-user-bubble';
import { PortfolioAssistantEnvelopeView } from './portfolio-assistant-envelope';
import { PortfolioAssistantLoadingRow } from './portfolio-assistant-loading-row';

export type ThreadItem =
  | { id: string; kind: 'user'; text: string; hasAnimated: boolean }
  | { id: string; kind: 'assistant'; envelope: AssistantEnvelope; hasAnimated: boolean };

export type ContextId =
  | 'entry'
  | 'experience'
  | 'mobile-experience'
  | 'additional-cases'
  | `case:${string}`;

export function PortfolioThreadView({
  contextId,
  items,
  hasPlayedInitialReveal,
  loading,
  error,
  canRetryError,
  onRetryError,
  onClearError,
  stickToBottomSignal,
  scrollToTopSignal,
  expandedDisclosureIds,
  onToggleDisclosure,
  onChipClick,
  onCta,
  onOpenArtifact,
  onMarkAnimatedItems,
  startTransitionSource,
}: {
  contextId: ContextId;
  items: ThreadItem[];
  hasPlayedInitialReveal: boolean;
  loading: boolean;
  error: string | null;
  canRetryError: boolean;
  onRetryError: () => void;
  onClearError: () => void;
  stickToBottomSignal: number;
  scrollToTopSignal: number;
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
  startTransitionSource: 'submit' | 'chip' | 'case' | null;
}) {
  const animateThreadStart = Boolean(startTransitionSource);
  const threadViewportRef = useRef<HTMLDivElement | null>(null);
  const threadContentRef = useRef<HTMLDivElement | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const shouldStickToBottomRef = useRef(true);
  const hasMountedRef = useRef(false);
  const suppressAutoScrollUntilRef = useRef(0);
  const preservedDisclosureScrollTopRef = useRef<number | null>(null);
  const disclosureRestoreTimeoutsRef = useRef<ReturnType<typeof globalThis.setTimeout>[]>([]);

  function scrollThreadToBottom(behavior: ScrollBehavior) {
    const viewport = threadViewportRef.current;
    if (!viewport) {
      return;
    }

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior,
    });
  }

  function scrollThreadToTop() {
    const viewport = threadViewportRef.current;
    if (!viewport) {
      return;
    }

    viewport.scrollTop = 0;
  }

  function handleScroll() {
    const viewport = threadViewportRef.current;
    if (!viewport) {
      return;
    }

    const distanceToBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    shouldStickToBottomRef.current = distanceToBottom < getAutoScrollThresholdPx();
  }

  function restoreDisclosureScrollPosition() {
    const viewport = threadViewportRef.current;
    const scrollTop = preservedDisclosureScrollTopRef.current;

    if (!viewport || scrollTop === null) {
      return;
    }

    viewport.scrollTop = scrollTop;
  }

  function scheduleDisclosureScrollRestores() {
    disclosureRestoreTimeoutsRef.current.forEach((timeoutId) => {
      globalThis.clearTimeout(timeoutId);
    });
    disclosureRestoreTimeoutsRef.current = [];

    for (const delay of [0, 50, 150, 350, 800, 1200]) {
      const timeoutId = globalThis.setTimeout(() => {
        restoreDisclosureScrollPosition();
      }, delay);
      disclosureRestoreTimeoutsRef.current.push(timeoutId);
    }
  }

  function handleToggleDisclosure(disclosureId: string) {
    const viewport = threadViewportRef.current;

    if (viewport) {
      preservedDisclosureScrollTopRef.current = viewport.scrollTop;
      suppressAutoScrollUntilRef.current = globalThis.performance.now() + 1500;
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

    if (!shouldStickToBottomRef.current && !animateThreadStart) {
      return;
    }

    scrollThreadToBottom(hasMountedRef.current ? 'smooth' : 'auto');
    hasMountedRef.current = true;
  }, [animateThreadStart, error, items.length, loading]);

  useLayoutEffect(() => {
    if (stickToBottomSignal <= 0 || !threadViewportRef.current) {
      return;
    }

    shouldStickToBottomRef.current = true;
    scrollThreadToBottom('smooth');
  }, [stickToBottomSignal]);

  useLayoutEffect(() => {
    if (scrollToTopSignal <= 0 || !threadViewportRef.current) {
      return;
    }

    shouldStickToBottomRef.current = false;
    suppressAutoScrollUntilRef.current = globalThis.performance.now() + 1200;
    scrollThreadToTop();

    globalThis.requestAnimationFrame(() => {
      scrollThreadToTop();
    });
  }, [scrollToTopSignal]);

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

      preservedDisclosureScrollTopRef.current = null;

      if (!shouldStickToBottomRef.current) {
        return;
      }

      globalThis.cancelAnimationFrame(frameId);
      frameId = globalThis.requestAnimationFrame(() => {
        scrollThreadToBottom('auto');
      });
    });

    observer.observe(content);

    return () => {
      observer.disconnect();
      globalThis.cancelAnimationFrame(frameId);
    };
  }, []);

  useLayoutEffect(() => {
    return () => {
      disclosureRestoreTimeoutsRef.current.forEach((timeoutId) => {
        globalThis.clearTimeout(timeoutId);
      });
    };
  }, []);

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

  return (
    <div
      ref={threadViewportRef}
      onScroll={handleScroll}
      className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pt-6 [overflow-anchor:none]"
    >
      <div ref={threadContentRef} className="space-y-7 px-6">
        {!items.length && !loading && !error ? (
          <div className="max-w-[798px] rounded-[24px] border border-[#EBEDF2] bg-[#FCFDFF] px-5 py-4 text-[15px] leading-6 text-[#5E606A]">
            Задайте вопрос ассистенту или выберите кейс слева.
          </div>
        ) : null}

        {items.map((item) =>
          item.kind === 'user' ? (
            <motion.div key={item.id} {...getItemMotion(item)}>
              <PortfolioUserBubble text={item.text} />
            </motion.div>
          ) : (
            <motion.div
              key={item.id}
              {...getItemMotion(item)}
            >
              <PortfolioAssistantEnvelopeView
                envelope={item.envelope}
                expandedDisclosureIds={expandedDisclosureIds}
                onToggleDisclosure={handleToggleDisclosure}
                onChipClick={onChipClick}
                onCta={onCta}
                onOpenArtifact={onOpenArtifact}
                renderMode={getAssistantRenderMode(item, hasPlayedInitialReveal)}
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
            className="max-w-[798px] rounded-[24px] border border-[#F0D5D2] bg-[#FFF7F6] px-5 py-4 text-[#832B22]"
          >
            <p className="text-[15px] font-medium leading-5">Не получилось получить ответ</p>
            <p className="mt-1 text-[14px] leading-5 text-[#9A4A42]">{error}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {canRetryError ? (
                <button
                  type="button"
                  onClick={onRetryError}
                  className="h-8 cursor-pointer rounded-full bg-[#1A1C22] px-4 text-[13px] font-medium leading-5 text-white transition hover:bg-[#4D4D4D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8EA2FF] focus-visible:ring-offset-2"
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
  );
}
