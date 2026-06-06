'use client';

import { motion } from 'framer-motion';

import type { AssistantEnvelope, AssistantRenderMode, PromptChip, UIAction } from '@/lib/portfolio/types';
import { portfolioResponseAnimationConfig } from '@/lib/portfolio/response-animation-config';
import {
  getParagraphRevealStartDelayMs,
  getProgressiveReplyBlockTiming,
} from '@/lib/portfolio/response-animation-policy';
import { PortfolioAssistantMessageFrame } from './portfolio-assistant-message-frame';
import { PortfolioPromptChip } from './portfolio-prompt-chip';
import { PortfolioButton } from './portfolio-button';
import { PortfolioProgressiveText } from './portfolio-progressive-text';
import { PortfolioAssistantIdentityHeader } from './portfolio-assistant-identity-header';

export function PortfolioAssistantPlainTextReply({
  envelope,
  onChipClick,
  onCta,
  renderMode = 'instant',
}: {
  envelope: AssistantEnvelope;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction) => void;
  renderMode?: AssistantRenderMode;
}) {
  const ctaBlocks = envelope.contentBlocks.filter((block) => block.type === 'cta');
  const textBlocks = envelope.contentBlocks.filter((block) => block.type === 'lead' || block.type === 'section');
  const progressive = renderMode === 'progressive_text';
  const textRenderMode = progressive ? 'progressive_text' : 'instant';

  return (
    <PortfolioAssistantMessageFrame showHeader={false} showLeadingBadge={false} chrome="bare">
      <div
        className="w-full max-w-[798px] space-y-5"
        aria-live={progressive ? portfolioResponseAnimationConfig.global.accessibility.ariaLive : undefined}
      >
        <PortfolioAssistantIdentityHeader
          badge={
            envelope.meta.responseSource === 'facts_constrained_synthesis' ? (
              <span className="rounded-full border border-[#E1E4EC] bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b6257]">
                Только подтвержденные факты
              </span>
            ) : undefined
          }
        />

        {textBlocks.map((block, index) =>
          block.type === 'lead' ? (
            <motion.section
              key={`${block.type}-${index}`}
              className="space-y-4"
              initial={progressive ? { opacity: 0, y: getProgressiveReplyBlockTiming(index).translateY } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: progressive ? getProgressiveReplyBlockTiming(index).durationMs / 1000 : 0,
                delay: progressive ? getProgressiveReplyBlockTiming(index).delayMs / 1000 : 0,
              }}
            >
              <h3 className="text-[18px] font-semibold leading-[24px] tracking-[-0.01em] text-[#202129]">
                {block.title}
              </h3>
              <div className="space-y-4 text-[16px] font-normal leading-[22px] tracking-[0] text-[#202129]">
                {block.body.map((paragraph, paragraphIndex) => (
                  <p key={paragraph}>
                    <PortfolioProgressiveText
                      text={paragraph}
                      renderMode={textRenderMode}
                      startDelayMs={
                        getProgressiveReplyBlockTiming(index).delayMs +
                        getParagraphRevealStartDelayMs(paragraphIndex)
                      }
                    />
                  </p>
                ))}
              </div>
            </motion.section>
          ) : (
            <motion.section
              key={`${block.type}-${index}`}
              className="space-y-3"
              initial={progressive ? { opacity: 0, y: getProgressiveReplyBlockTiming(index).translateY } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: progressive ? getProgressiveReplyBlockTiming(index).durationMs / 1000 : 0,
                delay: progressive ? getProgressiveReplyBlockTiming(index).delayMs / 1000 : 0,
              }}
            >
              <h3 className="text-[18px] font-semibold leading-[24px] tracking-[-0.01em] text-[#202129]">
                {block.title}
              </h3>
              <div className="space-y-3 text-[16px] font-normal leading-[22px] tracking-[0] text-[#202129]">
                {block.body.map((paragraph, paragraphIndex) => (
                  <p key={paragraph}>
                    <PortfolioProgressiveText
                      text={paragraph}
                      renderMode={textRenderMode}
                      startDelayMs={
                        getProgressiveReplyBlockTiming(index).delayMs +
                        getParagraphRevealStartDelayMs(paragraphIndex)
                      }
                    />
                  </p>
                ))}
              </div>
            </motion.section>
          ),
        )}

        {ctaBlocks.map((block, index) =>
          block.type === 'cta' ? (
            <div key={`cta-${index}`} className="pt-1">
              <PortfolioButton onClick={() => onCta(block.action)}>{block.label}</PortfolioButton>
            </div>
          ) : null,
        )}

        {envelope.chips.length ? (
          <div className="flex flex-wrap gap-3 pt-1">
            {envelope.chips.map((chip) => (
              <PortfolioPromptChip key={chip.id} chip={chip} onClick={onChipClick} />
            ))}
          </div>
        ) : null}
      </div>
    </PortfolioAssistantMessageFrame>
  );
}
