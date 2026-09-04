'use client';

import Image from 'next/image';
import { portfolioProfile } from '@/data/portfolio-profile';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';

import { getCompactProjectNavItems } from '@/data/portfolio-compact-navigation';
import type {
  ArtifactOpenTarget,
  PromptChip,
  RailItem,
  UIAction,
} from '@/lib/portfolio/types';
import type { ThreadScrollState } from '@/lib/portfolio/response-scroll-policy';
import { PortfolioCaseWorkspaceSkeleton } from './portfolio-case-workspace-skeleton';
import { PortfolioCompactProjectsDrawer } from './portfolio-compact-projects-drawer';
import { PortfolioComposer } from './portfolio-composer';
import { portfolioFocusRing } from './portfolio-interaction-styles';
import {
  PortfolioThreadView,
  type ContextId,
  type PortfolioThreadViewHandle,
  type ReplyFocusRequest,
  type ThreadItem,
} from './portfolio-thread-view';

type CompactThread = {
  contextId: ContextId;
  items: ThreadItem[];
  hasPlayedInitialReveal: boolean;
  scrollState: ThreadScrollState;
};

export function PortfolioCompactWorkspace({
  railItems,
  selectedRailId,
  messagesRemaining,
  onRailClick,
  onHomeClick,
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
  caseBootstrapping,
  replyFocusRequest,
  onReplyFocusCancelled,
  onReplyFocusHandled,
}: {
  railItems: RailItem[];
  selectedRailId: string | null;
  messagesRemaining: number;
  onRailClick: (item: RailItem) => void;
  onHomeClick: () => void;
  currentThread: CompactThread;
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
  caseBootstrapping: boolean;
  replyFocusRequest: ReplyFocusRequest | null;
  onReplyFocusCancelled: (id: number) => void;
  onReplyFocusHandled: (id: number) => void;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const navItems = useMemo(() => getCompactProjectNavItems(railItems), [railItems]);
  const activeItem = navItems.find((item) => item.id === selectedRailId) ?? null;
  const isExperience = activeItem?.kind === 'experience';

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const workspace = workspaceRef.current;
    const viewport = globalThis.visualViewport;
    if (!workspace || !viewport) {
      return undefined;
    }

    const updateViewport = () => {
      workspace.style.setProperty('--portfolio-compact-viewport-height', `${viewport.height}px`);
      workspace.style.setProperty('--portfolio-compact-viewport-offset', `${viewport.offsetTop}px`);
    };

    updateViewport();
    viewport.addEventListener('resize', updateViewport);
    viewport.addEventListener('scroll', updateViewport);

    return () => {
      viewport.removeEventListener('resize', updateViewport);
      viewport.removeEventListener('scroll', updateViewport);
    };
  }, []);

  function closeDrawer() {
    setDrawerOpen(false);
    globalThis.requestAnimationFrame(() => menuButtonRef.current?.focus({ preventScroll: true }));
  }

  function selectProject(item: RailItem) {
    setDrawerOpen(false);
    onRailClick(item);
  }

  function submitFromCompact(event: React.FormEvent<HTMLFormElement>) {
    setDrawerOpen(false);
    onSubmit(event);
  }

  return (
    <div
      ref={workspaceRef}
      className="portfolio-compact-workspace fixed inset-x-0 top-0 z-0 grid min-h-0 min-w-0 grid-rows-[69px_minmax(0,1fr)_auto] overflow-hidden bg-white"
      style={{
        height: 'var(--portfolio-compact-viewport-height, 100dvh)',
        transform: 'translateY(var(--portfolio-compact-viewport-offset, 0px))',
      } as React.CSSProperties}
    >
      <header className="relative z-20 min-w-0 border-b border-[#EBEDF2] bg-white">
        <div className="portfolio-compact-frame mx-auto flex h-[69px] w-full min-w-0 max-w-[720px] items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={isExperience ? 'Вернуться к списку проектов' : 'Открыть мои проекты'}
              aria-expanded={drawerOpen}
              className={`flex size-11 shrink-0 items-center justify-center rounded-full bg-[#F2F4FF] text-[#202129] ${portfolioFocusRing}`}
            >
              {/* The exported Figma glyph is deliberately a two-line, compact menu mark. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ui/experience-menu.svg" alt="" aria-hidden="true" className="size-4" />
            </button>
            <div className="min-w-0">
              <p className={`truncate text-[16px] ${isExperience ? 'font-bold leading-[normal]' : 'font-semibold leading-[19px]'} text-[#202129]`}>
                {activeItem?.label ?? 'Портфолио Андрея'}
              </p>
              <p className={`mt-0.5 truncate ${isExperience ? 'text-[13px] leading-[normal]' : 'text-[12px] leading-4'} text-[#8B8D9B]`}>
                {activeItem?.headerSubtitle ?? 'ИИ-ассистент по кейсам'}
              </p>
            </div>
          </div>
          {isExperience ? null : (
            <div className="relative size-9 shrink-0 overflow-hidden rounded-[12px] bg-[#D1D7E3]">
              {activeItem ? (
              <Image
                src={activeItem.thumbnailSrc}
                alt=""
                aria-hidden="true"
                fill
                sizes="36px"
                className="object-contain p-0.5"
              />
              ) : (
              <Image
                src={portfolioProfile.portrait.src}
                alt=""
                aria-hidden="true"
                fill
                sizes="36px"
                className="object-cover"
                style={{ objectPosition: portfolioProfile.portrait.focalPosition }}
              />
              )}
            </div>
          )}
        </div>
      </header>

      <div className="relative min-h-0 min-w-0">
        {caseBootstrapping ? (
          <PortfolioCaseWorkspaceSkeleton layoutMode="compact" />
        ) : (
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
            replyFocusRequest={replyFocusRequest}
            onReplyFocusCancelled={onReplyFocusCancelled}
            onReplyFocusHandled={onReplyFocusHandled}
            startTransitionSource={null}
            layoutMode="compact"
          />
        )}
      </div>

      <div className="relative z-20 min-w-0 border-t border-[#F0F1F5] bg-white px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
        <div className="portfolio-compact-frame mx-auto flex w-full min-w-0 max-w-[720px] flex-col items-center gap-2">
          <PortfolioComposer
            input={input}
            onChangeInput={onChangeInput}
            onSubmit={submitFromCompact}
            disabled={loading || messagesRemaining <= 0}
            textareaRef={textareaRef}
            placeholder="Спросите про Андрея: опыт"
            layoutMode="compact"
          />
          <p className="w-full text-center text-[11px] leading-[13px] text-[#A0A4B3]">
            Отвечаю по кейсам, процессам и артефактам Андрея
          </p>
        </div>
      </div>

      <AnimatePresence>
        {drawerOpen ? (
          <PortfolioCompactProjectsDrawer
            key="compact-projects-drawer"
            activeProjectId={selectedRailId}
            items={navItems}
            onClose={closeDrawer}
            onSelect={selectProject}
            onHomeClick={() => {
              setDrawerOpen(false);
              onHomeClick();
            }}
            onContactClick={() => {
              setDrawerOpen(false);
              globalThis.requestAnimationFrame(() => {
                menuButtonRef.current?.focus({ preventScroll: true });
                onCta({ type: 'open_contact_modal', source: 'compact-projects-drawer' });
              });
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
