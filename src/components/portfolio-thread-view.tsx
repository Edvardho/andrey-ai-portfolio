'use client';

import { useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';

import type { AssistantEnvelope, PromptChip, UIAction } from '@/lib/portfolio/types';
import { THREAD_EASE, WORKSPACE_EASE } from './portfolio-motion';
import { PortfolioUserBubble } from './portfolio-user-bubble';
import { PortfolioAssistantEnvelopeView } from './portfolio-assistant-envelope';
import { PortfolioAssistantLoadingRow } from './portfolio-assistant-loading-row';

type ThreadItem =
  | { kind: 'user'; text: string }
  | { kind: 'assistant'; envelope: AssistantEnvelope };

type ContextId =
  | 'entry'
  | 'experience'
  | 'mobile-experience'
  | 'additional-cases'
  | `case:${string}`;

export function PortfolioThreadView({
  items,
  loading,
  error,
  expandedDisclosureIds,
  onToggleDisclosure,
  onChipClick,
  onCta,
  onOpenArtifact,
  startTransitionSource,
}: {
  items: ThreadItem[];
  loading: boolean;
  error: string | null;
  expandedDisclosureIds: string[];
  onToggleDisclosure: (id: string) => void;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction) => void;
  onOpenArtifact: (artifactId: string) => void;
  startTransitionSource: 'submit' | 'chip' | 'case' | null;
}) {
  const animateThreadStart = Boolean(startTransitionSource);
  const threadViewportRef = useRef<HTMLDivElement | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const shouldStickToBottomRef = useRef(true);
  const hasMountedRef = useRef(false);

  function handleScroll() {
    const viewport = threadViewportRef.current;
    if (!viewport) {
      return;
    }

    const distanceToBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    shouldStickToBottomRef.current = distanceToBottom < 120;
  }

  useLayoutEffect(() => {
    if (!threadEndRef.current || !threadViewportRef.current) {
      return;
    }

    if (!shouldStickToBottomRef.current && !animateThreadStart) {
      return;
    }

    threadEndRef.current.scrollIntoView({
      block: 'end',
      behavior: hasMountedRef.current ? 'smooth' : 'auto',
    });
    hasMountedRef.current = true;
  }, [animateThreadStart, error, items.length, loading]);

  function getItemMotion(item: ThreadItem, index: number) {
    if (!animateThreadStart) {
      return {
        initial: false as const,
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0 },
      };
    }

    if (startTransitionSource === 'case') {
      return {
        initial: { opacity: 0, y: 44 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.48, delay: index * 0.08, ease: WORKSPACE_EASE },
      };
    }

    if (item.kind === 'user') {
      return {
        initial: { opacity: 0, y: 86, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.54, ease: WORKSPACE_EASE },
      };
    }

    return {
      initial: { opacity: 0, y: 54 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: 0.5, delay: 0.16 + index * 0.06, ease: WORKSPACE_EASE },
    };
  }

  return (
    <div
      ref={threadViewportRef}
      onScroll={handleScroll}
      className="min-h-0 flex-1 space-y-7 overflow-y-auto pb-3 pr-1"
    >
      {items.map((item, index) =>
        item.kind === 'user' ? (
          <motion.div key={`user-${index}`} {...getItemMotion(item, index)}>
            <PortfolioUserBubble text={item.text} />
          </motion.div>
        ) : (
          <motion.div key={`assistant-${index}-${item.envelope.viewType}`} {...getItemMotion(item, index)}>
            <PortfolioAssistantEnvelopeView
              envelope={item.envelope}
              expandedDisclosureIds={expandedDisclosureIds}
              onToggleDisclosure={onToggleDisclosure}
              onChipClick={onChipClick}
              onCta={onCta}
              onOpenArtifact={onOpenArtifact}
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
          className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-5 text-[15px] leading-7 text-red-700"
        >
          Ошибка: {error}
        </motion.div>
      ) : null}

      <div ref={threadEndRef} aria-hidden="true" />
    </div>
  );
}
export type { ThreadItem, ContextId };
