'use client';

import clsx from 'clsx';

import type { AssistantEnvelope, PromptChip } from '@/lib/portfolio/types';
import { PortfolioAssistantMessageFrame } from './portfolio-assistant-message-frame';
import { PortfolioPromptChip } from './portfolio-prompt-chip';
import { PortfolioAssistantIdentityHeader } from './portfolio-assistant-identity-header';

export function PortfolioAssistantAmbiguousReply({
  envelope,
  onChipClick,
}: {
  envelope: AssistantEnvelope;
  onChipClick: (chip: PromptChip) => void;
}) {
  const leadBlock = envelope.contentBlocks.find((block) => block.type === 'lead');
  if (!leadBlock || leadBlock.type !== 'lead') {
    return null;
  }

  const paragraphs = [leadBlock.title, ...leadBlock.body].filter(Boolean);

  return (
    <PortfolioAssistantMessageFrame showHeader={false} showLeadingBadge={false} chrome="bare">
      <div className="max-w-[798px] space-y-5">
        <PortfolioAssistantIdentityHeader />

        <div className="space-y-5 text-[16px] font-normal leading-[22px] tracking-[0] text-[#202129]">
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="max-w-[798px]">
              {paragraph}
            </p>
          ))}
        </div>

        {envelope.chips.length ? (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {envelope.chips.map((chip) => (
              <div
                key={chip.id}
                className={clsx(
                  chip.label === 'Какой у него опыт работы' ? 'min-w-[198px]' : undefined,
                )}
              >
                <PortfolioPromptChip chip={chip} onClick={onChipClick} />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </PortfolioAssistantMessageFrame>
  );
}
