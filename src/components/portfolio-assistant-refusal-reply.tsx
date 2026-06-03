'use client';

import type { AssistantEnvelope, PromptChip, UIAction } from '@/lib/portfolio/types';
import { PortfolioAssistantMessageFrame } from './portfolio-assistant-message-frame';
import { PortfolioAssistantAmbiguousReply } from './portfolio-assistant-ambiguous-reply';
import { PortfolioPromptChip } from './portfolio-prompt-chip';
import { PortfolioButton } from './portfolio-button';

export function PortfolioAssistantRefusalReply({
  envelope,
  onChipClick,
  onCta,
}: {
  envelope: AssistantEnvelope;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction) => void;
}) {
  if (envelope.viewType === 'ambiguous_question') {
    return <PortfolioAssistantAmbiguousReply envelope={envelope} onChipClick={onChipClick} />;
  }

  const ctaBlocks = envelope.contentBlocks.filter((block) => block.type === 'cta');

  return (
    <PortfolioAssistantMessageFrame showFactsBadge={false}>
      <div className="space-y-5">
        {envelope.contentBlocks.map((block, index) =>
          block.type === 'lead' ? (
            <section key={`${block.type}-${index}`} className="space-y-4">
              <h3 className="text-[24px] font-semibold leading-[1.25] text-[#11110f]">{block.title}</h3>
              <div className="space-y-4 text-[17px] leading-[1.8] text-[#4e4740]">
                {block.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ) : null,
        )}

        {ctaBlocks.map((block, index) =>
          block.type === 'cta' ? (
            <PortfolioButton key={`cta-${index}`} onClick={() => onCta(block.action)}>
              {block.label}
            </PortfolioButton>
          ) : null,
        )}
      </div>

      {envelope.chips.length ? (
        <div className="mt-8 flex flex-wrap gap-3 border-t border-[#EBEDF2] pt-6">
          {envelope.chips.map((chip) => (
            <PortfolioPromptChip key={chip.id} chip={chip} onClick={onChipClick} emphasis />
          ))}
        </div>
      ) : null}
    </PortfolioAssistantMessageFrame>
  );
}
