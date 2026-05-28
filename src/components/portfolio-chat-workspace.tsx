'use client';

import type { RefObject } from 'react';
import type { RailItem, PromptChip, UIAction, AssistantEnvelope } from '@/lib/portfolio/types';
import type { ThreadItem, ContextId } from './portfolio-thread-view';
import { PortfolioRailSidebar } from './portfolio-rail-sidebar';
import { PortfolioThreadView } from './portfolio-thread-view';
import { PortfolioContextPanel } from './portfolio-context-panel';
import { PortfolioComposer } from './portfolio-composer';
import { PortfolioButton } from './portfolio-button';
import { PortfolioAvailabilityPill } from './portfolio-availability-pill';

interface ContextThread {
  contextId: ContextId;
  items: ThreadItem[];
  lastEnvelope: AssistantEnvelope | null;
  initialized: boolean;
  updatedAt: string;
}

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
}) {
  return (
    <div className="flex h-full w-full justify-center overflow-hidden bg-white">
      <div className="flex h-full w-[1584px] flex-col overflow-hidden bg-white">
        <header className="flex h-[84px] shrink-0 items-center justify-between border-b border-[#EBEDF2]">
          <div className="flex items-center gap-[10px] whitespace-nowrap">
            <span className="text-[15px] font-semibold leading-5 text-[#1a1d23]">Андрей Макаревич</span>
            <span className="text-[14px] leading-[18px] text-[#c6c8d0]">•</span>
            <span className="text-[14px] leading-[18px] text-[#9da1ae]">Product Designer</span>
          </div>

          <div className="flex items-center gap-3">
            <PortfolioAvailabilityPill />
            <PortfolioButton onClick={() => onCta({ type: 'open_contact_modal', source: 'header' })}>
              Написать мне
            </PortfolioButton>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[298px_1px_980px_1px_304px] overflow-hidden">
          <div className="min-h-0">
            <PortfolioRailSidebar
              railItems={railItems}
              selectedRailId={selectedRailId}
              messagesRemaining={messagesRemaining}
              onRailClick={onRailClick}
            />
          </div>

          <div className="bg-[#EBEDF2]" aria-hidden="true" />

          <div className="flex min-h-0 flex-col px-6 pt-6">
            <PortfolioThreadView
              items={currentThread.items}
              loading={loading}
              error={error}
              expandedDisclosureIds={expandedDisclosureIds}
              onToggleDisclosure={onToggleDisclosure}
              onChipClick={onChipClick}
              onCta={onCta}
              onOpenArtifact={onOpenArtifact}
            />

            <div className="mt-6">
              <PortfolioComposer
                input={input}
                onChangeInput={onChangeInput}
                onSubmit={onSubmit}
                disabled={loading}
                textareaRef={textareaRef}
                placeholder="Спроси про опыт, кейсы, продуктовый подход или попроси открыть конкретный сценарий."
                title="Задать вопрос"
              />
            </div>
          </div>

          <div className="bg-[#EBEDF2]" aria-hidden="true" />

          <div className="min-h-0 pl-6 pt-6">
            {currentEnvelope ? <PortfolioContextPanel envelope={currentEnvelope} onAction={onCta} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
