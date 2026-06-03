'use client';

import type { RefObject } from 'react';
import { motion } from 'framer-motion';
import type {
  ArtifactOpenTarget,
  RailItem,
  PromptChip,
  UIAction,
  AssistantEnvelope,
  ContextPanelData,
  SelectedContext,
} from '@/lib/portfolio/types';
import { portfolioResponseAnimationConfig } from '@/lib/portfolio/response-animation-config';
import {
  getContextPanelRevealDelayMs,
  shouldDelayContextPanelReveal,
} from '@/lib/portfolio/response-animation-policy';
import type { ThreadItem, ContextId } from './portfolio-thread-view';
import { PortfolioRailSidebar } from './portfolio-rail-sidebar';
import { PortfolioThreadView } from './portfolio-thread-view';
import { PortfolioContextPanel } from './portfolio-context-panel';
import { PortfolioComposer } from './portfolio-composer';
import { COMPOSER_DOCK_SPRING, STAGE_FADE, WORKSPACE_EASE } from './portfolio-motion';

interface ContextThread {
  contextId: ContextId;
  items: ThreadItem[];
  lastEnvelope: AssistantEnvelope | null;
  initialized: boolean;
  hasPlayedInitialReveal: boolean;
  restoredFromStorage: boolean;
  lastAnimatedAssistantMessageId: string | null;
  updatedAt: string;
}

type ContextPanelPayload = {
  contextPanel: ContextPanelData;
  selectedContext: SelectedContext;
};

export function PortfolioChatWorkspace({
  railItems,
  selectedRailId,
  showAssistantReturn,
  assistantReturnSelected,
  messagesRemaining,
  onRailClick,
  onAssistantReturnClick,
  currentThread,
  loading,
  error,
  canRetryError,
  onRetryError,
  onClearError,
  stickToBottomSignal,
  expandedDisclosureIds,
  onToggleDisclosure,
  onChipClick,
  onCta,
  onOpenArtifact,
  onMarkAnimatedItems,
  input,
  onChangeInput,
  onSubmit,
  textareaRef,
  contextPanelPayload,
  composerLayoutId,
  startTransitionSource,
}: {
  railItems: RailItem[];
  selectedRailId: string | null;
  showAssistantReturn: boolean;
  assistantReturnSelected: boolean;
  messagesRemaining: number;
  onRailClick: (item: RailItem) => void;
  onAssistantReturnClick: () => void;
  currentThread: ContextThread;
  loading: boolean;
  error: string | null;
  canRetryError: boolean;
  onRetryError: () => void;
  onClearError: () => void;
  stickToBottomSignal: number;
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
  input: string;
  onChangeInput: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  contextPanelPayload: ContextPanelPayload | null;
  composerLayoutId: string;
  startTransitionSource: 'submit' | 'chip' | 'case' | null;
}) {
  const animateStageEntry = Boolean(startTransitionSource);
  const showContextPanel = Boolean(contextPanelPayload && !contextPanelPayload.contextPanel.hidden);
  const delayContextPanelReveal = shouldDelayContextPanelReveal(
    showContextPanel,
    currentThread.hasPlayedInitialReveal,
  );

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden bg-white"
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={STAGE_FADE}
    >
      <div
        className="grid h-full min-h-0 grid-cols-[298px_1px_980px_1px_304px] overflow-hidden"
      >
        <motion.div
          className="min-h-0"
          initial={animateStageEntry ? { opacity: 0, x: -32 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.48, ease: WORKSPACE_EASE, delay: 0.08 }}
        >
          <PortfolioRailSidebar
            railItems={railItems}
            selectedRailId={selectedRailId}
            showAssistantReturn={showAssistantReturn}
            assistantReturnSelected={assistantReturnSelected}
            messagesRemaining={messagesRemaining}
            onRailClick={onRailClick}
            onAssistantReturnClick={onAssistantReturnClick}
            onContactClick={() => onCta({ type: 'open_contact_modal', source: 'session-limit' })}
          />
        </motion.div>

        <div className="bg-[#EBEDF2]" aria-hidden="true" />

        <motion.div
          className="flex min-h-0 flex-col"
          initial={animateStageEntry ? { opacity: 0, y: 34 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.56, ease: WORKSPACE_EASE }}
        >
          <PortfolioThreadView
            contextId={currentThread.contextId}
            items={currentThread.items}
            hasPlayedInitialReveal={currentThread.hasPlayedInitialReveal}
            loading={loading}
            error={error}
            canRetryError={canRetryError}
            onRetryError={onRetryError}
            onClearError={onClearError}
            stickToBottomSignal={stickToBottomSignal}
            expandedDisclosureIds={expandedDisclosureIds}
            onToggleDisclosure={onToggleDisclosure}
            onChipClick={onChipClick}
            onCta={onCta}
            onOpenArtifact={onOpenArtifact}
            onMarkAnimatedItems={onMarkAnimatedItems}
            startTransitionSource={startTransitionSource}
          />

          <motion.div
            className="flex w-full flex-col items-center gap-2 px-6 pb-4"
          >
            <motion.div
              layoutId={composerLayoutId}
              className="w-full"
              transition={COMPOSER_DOCK_SPRING}
            >
              <PortfolioComposer
                input={input}
                onChangeInput={onChangeInput}
                onSubmit={onSubmit}
                disabled={loading || messagesRemaining <= 0}
                textareaRef={textareaRef}
                placeholder="Спросите про Андрея: опыт, проекты, процессы, продуктовые решения..."
              />
            </motion.div>
            <p className="text-center text-[14px] font-normal leading-[1.45] text-[#909090]">
              Ассистент может шутить, огрызаться и допускать ошибки, а вот Андрей – нет
            </p>
          </motion.div>
        </motion.div>

        <div className="bg-[#EBEDF2]" aria-hidden="true" />

        <div className="min-h-0 pl-6 pt-6">
          {showContextPanel && contextPanelPayload ? (
            <motion.div
              initial={animateStageEntry ? { opacity: 0, x: 32 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: portfolioResponseAnimationConfig.sidebarReveal.animation.durationMs / 1000,
                ease: WORKSPACE_EASE,
                delay: getContextPanelRevealDelayMs(delayContextPanelReveal) / 1000,
              }}
            >
              <PortfolioContextPanel
                contextPanel={contextPanelPayload.contextPanel}
                selectedContext={contextPanelPayload.selectedContext}
              />
            </motion.div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
