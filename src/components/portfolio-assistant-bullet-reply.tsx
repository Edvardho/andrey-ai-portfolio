'use client';

import type { AssistantEnvelope, PromptChip, UIAction } from '@/lib/portfolio/types';
import { PortfolioAssistantMessageFrame } from './portfolio-assistant-message-frame';
import { PortfolioPromptChip } from './portfolio-prompt-chip';
import { renderConversationalBlock } from './portfolio-assistant-block-renderers';

type Props = {
  envelope: AssistantEnvelope;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction) => void;
  onOpenArtifact: (artifactId: string) => void;
};

export function PortfolioAssistantBulletReply({
  envelope,
  onChipClick,
  onCta,
  onOpenArtifact,
}: Props) {
  return (
    <PortfolioAssistantMessageFrame showFactsBadge={envelope.meta.responseSource === 'facts_constrained_synthesis'}>
      <div className="space-y-6">
        {envelope.contentBlocks.map((block, index) =>
          renderConversationalBlock(block, index, {
            activeCaseId: envelope.selectedContext.kind === 'case' ? envelope.selectedContext.id : null,
            expandedDisclosureIds: [],
            onToggleDisclosure: () => {},
            onChipClick,
            onCta,
            onOpenArtifact,
          }),
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
