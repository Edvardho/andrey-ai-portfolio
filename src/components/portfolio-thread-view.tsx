'use client';

import type { AssistantEnvelope, PromptChip, UIAction } from '@/lib/portfolio/types';
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
}: {
  items: ThreadItem[];
  loading: boolean;
  error: string | null;
  expandedDisclosureIds: string[];
  onToggleDisclosure: (id: string) => void;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction) => void;
  onOpenArtifact: (artifactId: string) => void;
}) {
  return (
    <div className="min-h-0 flex-1 space-y-7 overflow-y-auto">
      {items.map((item, index) =>
        item.kind === 'user' ? (
          <PortfolioUserBubble key={`user-${index}`} text={item.text} />
        ) : (
          <PortfolioAssistantEnvelopeView
            key={`assistant-${index}-${item.envelope.viewType}`}
            envelope={item.envelope}
            expandedDisclosureIds={expandedDisclosureIds}
            onToggleDisclosure={onToggleDisclosure}
            onChipClick={onChipClick}
            onCta={onCta}
            onOpenArtifact={onOpenArtifact}
          />
        ),
      )}

      {loading ? <PortfolioAssistantLoadingRow /> : null}

      {error ? (
        <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-5 text-[15px] leading-7 text-red-700">
          Ошибка: {error}
        </div>
      ) : null}
    </div>
  );
}
export type { ThreadItem, ContextId };
