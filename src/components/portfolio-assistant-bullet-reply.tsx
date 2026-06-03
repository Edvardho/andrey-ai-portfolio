'use client';

import { motion } from 'framer-motion';

import type {
  ArtifactOpenTarget,
  AssistantEnvelope,
  AssistantRenderMode,
  PromptChip,
  UIAction,
} from '@/lib/portfolio/types';
import { portfolioResponseAnimationConfig } from '@/lib/portfolio/response-animation-config';
import { getProgressiveReplyBlockTiming } from '@/lib/portfolio/response-animation-policy';
import { PortfolioAssistantMessageFrame } from './portfolio-assistant-message-frame';
import { PortfolioPromptChip } from './portfolio-prompt-chip';
import { renderConversationalBlock } from './portfolio-assistant-block-renderers';

type Props = {
  envelope: AssistantEnvelope;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction) => void;
  onOpenArtifact: (target: ArtifactOpenTarget) => void;
  renderMode?: AssistantRenderMode;
};

export function PortfolioAssistantBulletReply({
  envelope,
  onChipClick,
  onCta,
  onOpenArtifact,
  renderMode = 'instant',
}: Props) {
  const progressive = renderMode === 'progressive_text';

  return (
    <PortfolioAssistantMessageFrame showFactsBadge={envelope.meta.responseSource === 'facts_constrained_synthesis'}>
      <div
        className="space-y-6"
        aria-live={progressive ? portfolioResponseAnimationConfig.global.accessibility.ariaLive : undefined}
      >
        {envelope.contentBlocks.map((block, index) =>
          <motion.div
            key={`${block.type}-${index}`}
            initial={progressive ? { opacity: 0, y: getProgressiveReplyBlockTiming(index).translateY } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: progressive ? getProgressiveReplyBlockTiming(index).durationMs / 1000 : 0,
              delay: progressive ? getProgressiveReplyBlockTiming(index).delayMs / 1000 : 0,
            }}
          >
            {renderConversationalBlock(
              block,
              index,
              {
                activeCaseId: envelope.selectedContext.kind === 'case' ? envelope.selectedContext.id : null,
                expandedDisclosureIds: [],
                onToggleDisclosure: () => {},
                onChipClick,
                onCta,
                onOpenArtifact,
              },
              { renderMode },
            )}
          </motion.div>,
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
