'use client';

import type { RefObject } from 'react';
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

export function PortfolioChatWorkspace({
  railItems,
  selectedRailId,
  messagesRemaining,
  onRailClick,
  currentThread,
  loading,
  error,
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
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction, label: string) => void;
  onOpenArtifact: (artifactId: string, title: string) => void;
  input: string;
  onChangeInput: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  currentEnvelope: AssistantEnvelope | null;
}) {
  return (
    <div className="mx-auto grid h-full max-w-[1800px] grid-cols-[320px_minmax(0,1fr)] overflow-hidden rounded-[38px] border border-[#e6dfd4] bg-white shadow-[0_24px_80px_rgba(31,26,20,0.07)]">
      <PortfolioRailSidebar
        railItems={railItems}
        selectedRailId={selectedRailId}
        messagesRemaining={messagesRemaining}
        onRailClick={onRailClick}
      />

      <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
        <header className="flex items-center justify-between border-b border-[#ece5da] px-9 py-6">
          <div>
            <div className="text-[22px] font-semibold tracking-[-0.03em] text-[#12110e]">
              AI Portfolio Assistant
            </div>
            <div className="mt-1 text-[15px] text-[#7a7268]">
              Desktop-first portfolio assistant с жёсткими границами и подтвержденным контентом.
            </div>
          </div>
          <button
            type="button"
            onClick={() => onCta({ type: 'open_contact_modal', source: 'header' }, 'Написать Андрею')}
            className="rounded-full bg-[#13110f] px-6 py-3.5 text-[15px] font-medium text-white transition hover:bg-[#22201c]"
          >
            Написать Андрею
          </button>
        </header>

        <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_330px] gap-6 overflow-hidden px-6 py-6">
          <div className="flex min-h-0 flex-col overflow-hidden rounded-[36px] bg-[#faf8f4] p-6">
            <PortfolioThreadView
              items={currentThread.items}
              loading={loading}
              error={error}
              onChipClick={onChipClick}
              onCta={onCta}
              onOpenArtifact={onOpenArtifact}
            />

            <div className="mt-6 border-t border-transparent bg-[#faf8f4] pt-1">
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

          {currentEnvelope ? (
            <PortfolioContextPanel
              envelope={currentEnvelope}
              onAction={(action, label) => onCta(action, label ?? '')}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
