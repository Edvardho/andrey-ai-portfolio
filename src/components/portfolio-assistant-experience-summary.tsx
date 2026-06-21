'use client';

import { motion } from 'framer-motion';

import { experience } from '@/data/portfolio-global-content';
import { getSummaryRevealTiming } from '@/lib/portfolio/response-animation-policy';
import type {
  ArtifactOpenTarget,
  AssistantEnvelope,
  AssistantRenderMode,
  PromptChip,
  UIAction,
} from '@/lib/portfolio/types';
import { PortfolioAssistantMessageFrame } from './portfolio-assistant-message-frame';
import { PortfolioPromptChip } from './portfolio-prompt-chip';
import { PortfolioStructuredExperienceSummary } from './portfolio-structured-experience-summary';
import { renderCanonicalSummaryBlock } from './portfolio-assistant-block-renderers';

type Props = {
  envelope: AssistantEnvelope;
  expandedDisclosureIds: string[];
  onToggleDisclosure: (id: string) => void;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction) => void;
  onOpenArtifact: (target: ArtifactOpenTarget) => void;
  renderMode?: AssistantRenderMode;
};

export function PortfolioAssistantExperienceSummary({
  envelope,
  expandedDisclosureIds,
  onToggleDisclosure,
  onChipClick,
  onCta,
  onOpenArtifact,
  renderMode = 'instant',
}: Props) {
  const reveal = renderMode === 'reveal';

  if (envelope.presentationVariant === 'experience_summary' && experience.structuredSummary) {
    return (
      <PortfolioStructuredExperienceSummary
        experience={experience}
        onChipClick={onChipClick}
        onCta={onCta}
        renderMode={renderMode}
      />
    );
  }

  return (
    <PortfolioAssistantMessageFrame showFactsBadge={envelope.meta.responseSource === 'facts_constrained_synthesis'}>
      <div className="space-y-8">
        {envelope.contentBlocks.map((block, index) =>
          <motion.div
            key={`${block.type}-${index}`}
            initial={reveal ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reveal ? getSummaryRevealTiming(index).durationMs / 1000 : 0,
              delay: reveal ? getSummaryRevealTiming(index).delayMs / 1000 : 0,
            }}
          >
            {renderCanonicalSummaryBlock(block, index, {
              activeCaseId: null,
              expandedDisclosureIds,
              onToggleDisclosure,
              onChipClick,
              onCta,
              onOpenArtifact,
            })}
          </motion.div>,
        )}
      </div>

      {envelope.chips.length ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {envelope.chips.map((chip) => (
            <PortfolioPromptChip key={chip.id} chip={chip} onClick={onChipClick} emphasis />
          ))}
        </div>
      ) : null}
    </PortfolioAssistantMessageFrame>
  );
}
