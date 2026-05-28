'use client';

import type { AssistantEnvelope, PromptChip, UIAction } from '@/lib/portfolio/types';
import { PortfolioAssistantMessageFrame } from './portfolio-assistant-message-frame';
import { PortfolioPromptChip } from './portfolio-prompt-chip';
import { PortfolioButton } from './portfolio-button';

export function PortfolioAssistantPlainTextReply({
  envelope,
  onChipClick,
  onCta,
}: {
  envelope: AssistantEnvelope;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction) => void;
}) {
  const ctaBlocks = envelope.contentBlocks.filter((block) => block.type === 'cta');
  const textBlocks = envelope.contentBlocks.filter((block) => block.type === 'lead' || block.type === 'section');

  return (
    <PortfolioAssistantMessageFrame showFactsBadge={envelope.meta.responseSource === 'facts_constrained_synthesis'}>
      <div className="space-y-6">
        {textBlocks.map((block, index) =>
          block.type === 'lead' ? (
            <section key={`${block.type}-${index}`} className="space-y-4">
              <h3 className="text-[24px] font-semibold leading-[1.25] text-[#11110f]">{block.title}</h3>
              <div className="space-y-4 text-[17px] leading-[1.8] text-[#4e4740]">
                {block.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ) : (
            <section key={`${block.type}-${index}`} className="space-y-3">
              <h3 className="text-[22px] font-semibold leading-[1.3] text-[#11110f]">{block.title}</h3>
              <div className="space-y-3 text-[16px] leading-[1.8] text-[#4e4740]">
                {block.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ),
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
