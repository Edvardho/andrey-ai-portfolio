'use client';

import { motion } from 'framer-motion';

import type {
  ArtifactOpenTarget,
  AssistantEnvelope,
  AssistantRenderMode,
  PromptChip,
  UIAction,
} from '@/lib/portfolio/types';
import type { WorkspaceLayoutMode } from '@/lib/portfolio/workspace-layout';
import { portfolioResponseAnimationConfig } from '@/lib/portfolio/response-animation-config';
import { getProgressiveReplyBlockTiming } from '@/lib/portfolio/response-animation-policy';
import { PortfolioAssistantMessageFrame } from './portfolio-assistant-message-frame';
import { PortfolioPromptChip } from './portfolio-prompt-chip';
import { renderConversationalBlock } from './portfolio-assistant-block-renderers';

type Props = {
  envelope: AssistantEnvelope;
  expandedDisclosureIds: string[];
  onToggleDisclosure: (id: string) => void;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction) => void;
  onOpenArtifact: (target: ArtifactOpenTarget) => void;
  renderMode?: AssistantRenderMode;
  showChips?: boolean;
  layoutMode?: WorkspaceLayoutMode;
};

export function PortfolioAssistantSectionedReply({
  envelope,
  expandedDisclosureIds,
  onToggleDisclosure,
  onChipClick,
  onCta,
  onOpenArtifact,
  renderMode = 'instant',
  showChips = true,
  layoutMode = 'desktop',
}: Props) {
  const activeCaseId = envelope.selectedContext.kind === 'case' ? envelope.selectedContext.id : null;
  const progressive = renderMode === 'progressive_text';

  return (
    <PortfolioAssistantMessageFrame layoutMode={layoutMode}>
      <div
        className={layoutMode === 'compact' ? 'space-y-5' : 'space-y-6'}
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
                activeCaseId,
                expandedDisclosureIds,
                onToggleDisclosure,
                onChipClick,
                onCta,
                onOpenArtifact,
                showChips,
              },
              { renderMode, layoutMode },
            )}
          </motion.div>,
        )}
      </div>

      {showChips && envelope.chips.length ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {envelope.chips.map((chip) => (
            <PortfolioPromptChip key={chip.id} chip={chip} onClick={onChipClick} emphasis />
          ))}
        </div>
      ) : null}
    </PortfolioAssistantMessageFrame>
  );
}
