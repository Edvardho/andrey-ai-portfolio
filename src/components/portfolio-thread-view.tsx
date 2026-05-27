'use client';

import type { AssistantEnvelope, PromptChip, UIAction } from '@/lib/portfolio/types';
import { PortfolioUserBubble } from './portfolio-user-bubble';
import { PortfolioAssistantEnvelopeView } from './portfolio-assistant-envelope';

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
  onChipClick,
  onCta,
  onOpenArtifact,
}: {
  items: ThreadItem[];
  loading: boolean;
  error: string | null;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction, label: string) => void;
  onOpenArtifact: (artifactId: string, title: string) => void;
}) {
  return (
    <div className="min-h-0 flex-1 space-y-7 overflow-y-auto pr-2 pb-4">
      {items.map((item, index) =>
        item.kind === 'user' ? (
          <PortfolioUserBubble key={`user-${index}`} text={item.text} />
        ) : (
          <PortfolioAssistantEnvelopeView
            key={`assistant-${index}-${item.envelope.viewType}`}
            envelope={item.envelope}
            onChipClick={onChipClick}
            onCta={onCta}
            onOpenArtifact={onOpenArtifact}
          />
        ),
      )}

      {loading ? (
        <div className="flex gap-5">
          <div className="mt-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eef0ff] text-[22px] text-[#5b61ff]">
            ✦
          </div>
          <div className="rounded-[28px] border border-[#e8e2d8] bg-white px-6 py-5 text-[15px] leading-7 text-[#6a6258] shadow-[0_12px_28px_rgba(31,26,20,0.04)]">
            Ищу правильное состояние. Ассистент не должен стрелять в темноту.
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-5 text-[15px] leading-7 text-red-700">
          Ошибка: {error}
        </div>
      ) : null}
    </div>
  );
}
export type { ThreadItem, ContextId };
