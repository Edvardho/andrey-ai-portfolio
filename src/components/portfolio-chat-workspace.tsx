'use client';

import { useEffect, useState, type RefObject } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
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
import type { ThreadItem, ContextId, PortfolioThreadViewHandle } from './portfolio-thread-view';
import type { ThreadScrollState } from '@/lib/portfolio/response-scroll-policy';
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
  scrollState: ThreadScrollState;
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
  scrollToTopSignal,
  restoreThreadScrollSignal,
  restoreThreadScrollTop,
  expandedDisclosureIds,
  onToggleDisclosure,
  onChipClick,
  onCta,
  onOpenArtifact,
  onMarkAnimatedItems,
  onThreadScrollStateChange,
  input,
  onChangeInput,
  onSubmit,
  textareaRef,
  threadViewRef,
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
  onThreadScrollStateChange: (contextId: ContextId, scrollState: ThreadScrollState) => void;
  input: string;
  onChangeInput: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  threadViewRef: RefObject<PortfolioThreadViewHandle | null>;
  contextPanelPayload: ContextPanelPayload | null;
  composerLayoutId: string;
  startTransitionSource: 'submit' | 'chip' | 'case' | null;
}) {
  const animateStageEntry = Boolean(startTransitionSource);
  const showContextPanel = Boolean(contextPanelPayload && !contextPanelPayload.contextPanel.hidden);
  const [contextDrawerContextId, setContextDrawerContextId] = useState<ContextId | null>(null);
  const isContextDrawerOpen = showContextPanel && contextDrawerContextId === currentThread.contextId;
  const delayContextPanelReveal = shouldDelayContextPanelReveal(
    showContextPanel,
    currentThread.hasPlayedInitialReveal,
  );

  useEffect(() => {
    if (!isContextDrawerOpen) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setContextDrawerContextId(null);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isContextDrawerOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1440px)');
    const closeIfWide = () => {
      if (mediaQuery.matches) {
        setContextDrawerContextId(null);
      }
    };

    mediaQuery.addEventListener('change', closeIfWide);

    return () => {
      mediaQuery.removeEventListener('change', closeIfWide);
    };
  }, []);

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden bg-white"
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={STAGE_FADE}
    >
      <div className="portfolio-chat-grid grid h-full min-h-0 overflow-hidden">
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
          className="relative flex min-h-0 flex-col"
          initial={animateStageEntry ? { opacity: 0, y: 34 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.56, ease: WORKSPACE_EASE }}
        >
          {showContextPanel ? (
            <div className="portfolio-narrow-context-trigger justify-end px-6 pt-5">
              <button
                type="button"
                onClick={() => setContextDrawerContextId(currentThread.contextId)}
                className="flex h-9 cursor-pointer items-center rounded-full border border-[#EBEDF2] bg-white px-4 text-[14px] font-medium leading-5 text-[#202129] shadow-[0px_6px_14px_rgba(17,19,26,0.06)] transition hover:bg-[#F2F4FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8EA2FF] focus-visible:ring-offset-2"
              >
                Контекст проекта
              </button>
            </div>
          ) : null}

          <PortfolioThreadView
            ref={threadViewRef}
            contextId={currentThread.contextId}
            items={currentThread.items}
            scrollState={currentThread.scrollState}
            hasPlayedInitialReveal={currentThread.hasPlayedInitialReveal}
            loading={loading}
            error={error}
            canRetryError={canRetryError}
            onRetryError={onRetryError}
            onClearError={onClearError}
            stickToBottomSignal={stickToBottomSignal}
            scrollToTopSignal={scrollToTopSignal}
            restoreThreadScrollSignal={restoreThreadScrollSignal}
            restoreThreadScrollTop={restoreThreadScrollTop}
            expandedDisclosureIds={expandedDisclosureIds}
            onToggleDisclosure={onToggleDisclosure}
            onChipClick={onChipClick}
            onCta={onCta}
            onOpenArtifact={onOpenArtifact}
            onMarkAnimatedItems={onMarkAnimatedItems}
            onScrollStateChange={onThreadScrollStateChange}
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

        <div className="portfolio-wide-context-divider bg-[#EBEDF2]" aria-hidden="true" />

        <div className="portfolio-context-column min-h-0 pl-6 pt-6">
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

      {showContextPanel && contextPanelPayload && isContextDrawerOpen ? (
        <div className="portfolio-context-drawer-layer absolute inset-0 z-30">
          <button
            type="button"
            aria-label="Закрыть контекст проекта"
            className="absolute inset-0 cursor-default bg-[#202129]/10"
            onClick={() => setContextDrawerContextId(null)}
          />
          <motion.aside
            role="dialog"
            aria-label="Контекст проекта"
            className="absolute bottom-6 right-0 top-6 w-[304px] overflow-y-auto bg-white shadow-[0px_18px_48px_rgba(17,19,26,0.14)]"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 28 }}
            transition={{ duration: 0.28, ease: WORKSPACE_EASE }}
          >
            <button
              type="button"
              aria-label="Закрыть контекст проекта"
              onClick={() => setContextDrawerContextId(null)}
              className="absolute right-0 top-0 z-10 flex size-9 cursor-pointer items-center justify-center rounded-full bg-white text-[#202129] transition hover:bg-[#F2F4FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8EA2FF] focus-visible:ring-offset-2"
            >
              <X className="size-4" strokeWidth={1.8} />
            </button>
            <PortfolioContextPanel
              contextPanel={contextPanelPayload.contextPanel}
              selectedContext={contextPanelPayload.selectedContext}
            />
          </motion.aside>
        </div>
      ) : null}
    </motion.div>
  );
}
