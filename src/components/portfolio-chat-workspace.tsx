'use client';

import type { RefObject } from 'react';
import { motion } from 'framer-motion';
import type { RailItem, PromptChip, UIAction, AssistantEnvelope } from '@/lib/portfolio/types';
import type { ThreadItem, ContextId } from './portfolio-thread-view';
import { PortfolioRailSidebar } from './portfolio-rail-sidebar';
import { PortfolioThreadView } from './portfolio-thread-view';
import { PortfolioContextPanel } from './portfolio-context-panel';
import { PortfolioComposer } from './portfolio-composer';

interface ContextThread {
  contextId: ContextId;
  items: ThreadItem[];
  lastEnvelope: AssistantEnvelope | null;
  initialized: boolean;
  updatedAt: string;
}

const SOFT_EASE = [0.16, 1, 0.3, 1] as const;
const COMPOSER_SPRING = {
  type: 'spring' as const,
  stiffness: 220,
  damping: 28,
  mass: 0.95,
};

export function PortfolioChatWorkspace({
  railItems,
  selectedRailId,
  messagesRemaining,
  onRailClick,
  currentThread,
  loading,
  error,
  expandedDisclosureIds,
  onToggleDisclosure,
  onChipClick,
  onCta,
  onOpenArtifact,
  input,
  onChangeInput,
  onSubmit,
  textareaRef,
  currentEnvelope,
  composerLayoutId,
  startTransitionSource,
}: {
  railItems: RailItem[];
  selectedRailId: string | null;
  messagesRemaining: number;
  onRailClick: (item: RailItem) => void;
  currentThread: ContextThread;
  loading: boolean;
  error: string | null;
  expandedDisclosureIds: string[];
  onToggleDisclosure: (id: string) => void;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction) => void;
  onOpenArtifact: (artifactId: string) => void;
  input: string;
  onChangeInput: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  currentEnvelope: AssistantEnvelope | null;
  composerLayoutId: string;
  startTransitionSource: 'submit' | 'chip' | 'case' | null;
}) {
  const animateStageEntry = Boolean(startTransitionSource);

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden bg-white"
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grid h-full min-h-0 grid-cols-[298px_1px_980px_1px_304px] overflow-hidden">
        <motion.div
          className="min-h-0"
          initial={animateStageEntry ? { opacity: 0, x: -32 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.48, ease: SOFT_EASE, delay: 0.08 }}
        >
          <PortfolioRailSidebar
            railItems={railItems}
            selectedRailId={selectedRailId}
            messagesRemaining={messagesRemaining}
            onRailClick={onRailClick}
          />
        </motion.div>

        <div className="bg-[#EBEDF2]" aria-hidden="true" />

        <motion.div
          className="flex min-h-0 flex-col px-6 pt-6"
          initial={animateStageEntry ? { opacity: 0, y: 34 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.56, ease: SOFT_EASE }}
        >
          <PortfolioThreadView
            items={currentThread.items}
            loading={loading}
            error={error}
            expandedDisclosureIds={expandedDisclosureIds}
            onToggleDisclosure={onToggleDisclosure}
            onChipClick={onChipClick}
            onCta={onCta}
            onOpenArtifact={onOpenArtifact}
            startTransitionSource={startTransitionSource}
          />

          <motion.div
            layoutId={composerLayoutId}
            className="mt-6"
            transition={COMPOSER_SPRING}
          >
            <PortfolioComposer
              input={input}
              onChangeInput={onChangeInput}
              onSubmit={onSubmit}
              disabled={loading}
              textareaRef={textareaRef}
              placeholder="Спроси про опыт, кейсы, продуктовый подход или попроси открыть конкретный сценарий."
              title="Задать вопрос"
            />
          </motion.div>
        </motion.div>

        <div className="bg-[#EBEDF2]" aria-hidden="true" />

        <motion.div
          className="min-h-0 pl-6 pt-6"
          initial={animateStageEntry ? { opacity: 0, x: 32 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.48, ease: SOFT_EASE, delay: 0.12 }}
        >
          {currentEnvelope ? <PortfolioContextPanel envelope={currentEnvelope} onAction={onCta} /> : null}
        </motion.div>
      </div>
    </motion.div>
  );
}
