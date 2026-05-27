'use client';

import type { RefObject } from 'react';
import type { RailItem, PromptChip, UIAction } from '@/lib/portfolio/types';
import { PortfolioPreviewSurface } from './portfolio-preview-surface';
import { PortfolioComposer } from './portfolio-composer';
import { PortfolioPromptChip } from './portfolio-prompt-chip';

export function PortfolioEntryView({
  railItems,
  getCasePreview,
  onRailClick,
  input,
  onChangeInput,
  onSubmit,
  loading,
  textareaRef,
  chips,
  onChipClick,
  onCta,
}: {
  railItems: RailItem[];
  getCasePreview: (caseId: string | null) => {
    title: string;
    subtitle: string;
    imageUrl?: string;
    badge: string;
  } | null;
  onRailClick: (item: RailItem) => void;
  input: string;
  onChangeInput: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  chips: PromptChip[];
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction, label: string) => void;
}) {
  return (
    <div className="mx-auto flex h-full max-w-[1800px] flex-col overflow-hidden rounded-[38px] border border-[#e6dfd4] bg-white shadow-[0_24px_80px_rgba(31,26,20,0.07)]">
      <header className="flex items-center justify-between border-b border-[#ece5da] px-10 py-6">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-[#12110e]">Андрей Макаревич</span>
          <span className="text-[#8a8378]">•</span>
          <span className="text-[#7a7268]">Product Designer</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-[14px] font-medium text-[#4e4740]">Открыт к предложениям</span>
          </div>
          <button
            type="button"
            onClick={() => onCta({ type: 'open_contact_modal', source: 'entry' }, 'Написать мне')}
            className="rounded-full bg-[#13110f] px-6 py-3 text-[15px] font-medium text-white transition hover:bg-[#22201c]"
          >
            Написать мне
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center py-10 px-8">
        <div className="text-center max-w-[800px] mt-auto">
          <h1 className="text-[64px] font-bold tracking-tight text-[#11110f] leading-tight">
            Макаревич Андрей
          </h1>
          <p className="mt-3 text-[24px] text-[#6e675d] font-medium">
            Продуктовый дизайнер
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {['6 лет опыта', 'B2B / B2C', 'Mobile & Web', 'AI products'].map((badgeText) => (
            <span
              key={badgeText}
              className="rounded-full border border-[#d9d1c6] bg-[#faf7f1] px-5 py-2.5 text-[15px] font-medium text-[#6b6257] shadow-sm"
            >
              {badgeText}
            </span>
          ))}
        </div>

        <div className="w-full max-w-[1400px] mt-16">
          <h2 className="text-[20px] font-semibold text-[#151310] text-center mb-6">
            Про какой кейс мне рассказать?
          </h2>
          <div className="flex gap-6 overflow-x-auto py-4 px-10 no-scrollbar justify-start xl:justify-center">
            {railItems.filter(item => item.kind === 'case').map((item) => {
              const preview = getCasePreview(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onRailClick(item)}
                  className="w-[320px] h-[330px] shrink-0 rounded-[28px] border border-[#e8e2d8] bg-white p-4 text-left shadow-[0_10px_28px_rgba(34,28,20,0.04)] transition hover:border-[#d7cdbe] hover:shadow-[0_16px_36px_rgba(34,28,20,0.07)] flex flex-col justify-between"
                >
                  <PortfolioPreviewSurface
                    src={preview?.imageUrl}
                    title={item.label}
                    subtitle={preview?.subtitle}
                    badge={preview?.badge}
                    className="aspect-[1.25/1] w-full"
                  />
                  <div className="mt-4 text-[17px] font-semibold leading-6 text-[#1b1915] line-clamp-2">
                    {preview?.title || item.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full max-w-[980px] mt-auto pt-12">
          <PortfolioComposer
            input={input}
            onChangeInput={onChangeInput}
            onSubmit={onSubmit}
            disabled={loading}
            textareaRef={textareaRef}
            placeholder="Спросите про Андрея: опыт, проекты, процессы, продуктовые решения..."
            title="Задать вопрос"
          />

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {chips.map((chip) => (
              <PortfolioPromptChip
                key={chip.id}
                chip={chip}
                onClick={onChipClick}
                emphasis
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
