'use client';

import type { AssistantEnvelope, PromptChip, UIAction } from '@/lib/portfolio/types';
import { PortfolioAssistantMessageFrame } from './portfolio-assistant-message-frame';
import { PortfolioPromptChip } from './portfolio-prompt-chip';
import { renderConversationalBlock } from './portfolio-assistant-block-renderers';

type Props = {
  envelope: AssistantEnvelope;
  expandedDisclosureIds: string[];
  onToggleDisclosure: (id: string) => void;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction) => void;
  onOpenArtifact: (artifactId: string) => void;
};

export function PortfolioAssistantSectionedReply({
  envelope,
  expandedDisclosureIds,
  onToggleDisclosure,
  onChipClick,
  onCta,
  onOpenArtifact,
}: Props) {
  const activeCaseId = envelope.selectedContext.kind === 'case' ? envelope.selectedContext.id : null;

  return (
    <PortfolioAssistantMessageFrame showFactsBadge={envelope.meta.responseSource === 'facts_constrained_synthesis'}>
      <div className="space-y-6">
        {envelope.contentBlocks.map((block, index) =>
          renderConversationalBlock(block, index, {
            activeCaseId,
            expandedDisclosureIds,
            onToggleDisclosure,
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
