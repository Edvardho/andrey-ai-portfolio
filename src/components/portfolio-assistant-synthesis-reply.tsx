'use client';

import { motion } from 'framer-motion';

import type { AssistantEnvelope, AssistantRenderMode, PromptChip, UIAction } from '@/lib/portfolio/types';
import type { WorkspaceLayoutMode } from '@/lib/portfolio/workspace-layout';
import { portfolioResponseAnimationConfig } from '@/lib/portfolio/response-animation-config';
import {
  getParagraphRevealStartDelayMs,
  getProgressiveReplyBlockTiming,
} from '@/lib/portfolio/response-animation-policy';
import { PortfolioAssistantIdentityHeader } from './portfolio-assistant-identity-header';
import { portfolioChipSurface, portfolioFocusRing } from './portfolio-interaction-styles';
import { PortfolioProgressiveText } from './portfolio-progressive-text';
import { PortfolioPromptChip } from './portfolio-prompt-chip';

const ASSISTANT_BODY_TEXT_CLASS = 'text-[16px] font-normal leading-6 tracking-[0] text-[#202129]';

export function PortfolioAssistantSynthesisReply({
  envelope,
  onChipClick,
  onCta,
  canRetryError = false,
  onRetryError,
  renderMode = 'instant',
  showChips = true,
  layoutMode = 'desktop',
}: {
  envelope: AssistantEnvelope;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction) => void;
  canRetryError?: boolean;
  onRetryError?: () => void;
  renderMode?: AssistantRenderMode;
  showChips?: boolean;
  layoutMode?: WorkspaceLayoutMode;
}) {
  const compact = layoutMode === 'compact';
  const progressive = renderMode === 'progressive_text';
  const textRenderMode = progressive ? 'progressive_text' : 'instant';
  const leadBlocks = envelope.contentBlocks.filter((block) => block.type === 'lead');
  const sectionBlocks = envelope.contentBlocks.filter((block) => block.type === 'section');
  const bulletBlocks = envelope.contentBlocks.filter((block) => block.type === 'bullet_list');
  const ctaBlocks = envelope.contentBlocks.filter((block) => block.type === 'cta');
  const title = leadBlocks[0]?.title;
  const paragraphs = leadBlocks.flatMap((block) => block.body);
  const bullets = bulletBlocks.flatMap((block) => block.items);
  const replyState = envelope.meta.assistantReplyState;
  const leadParagraphs = paragraphs.length ? paragraphs : title ? [title] : [];
  const sectionTimingOffset = leadParagraphs.length ? 1 : 0;
  const bulletTimingIndex = sectionTimingOffset + sectionBlocks.length;

  return (
    <article
      className={compact
        ? 'flex w-full flex-col items-start gap-2'
        : 'flex w-full max-w-[798px] flex-col items-start gap-2'}
      aria-live={progressive ? portfolioResponseAnimationConfig.global.accessibility.ariaLive : undefined}
    >
      <PortfolioAssistantIdentityHeader
        badge={null}
        layoutMode={layoutMode}
      />

      {leadParagraphs.length ? (
        <motion.div
          className={compact
            ? 'w-full space-y-3 text-[14px] font-normal leading-5 text-[#202129]'
            : `w-full max-w-[680px] space-y-3 ${ASSISTANT_BODY_TEXT_CLASS}`}
          initial={progressive ? { opacity: 0, y: getProgressiveReplyBlockTiming(0).translateY } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: progressive ? getProgressiveReplyBlockTiming(0).durationMs / 1000 : 0,
            delay: progressive ? getProgressiveReplyBlockTiming(0).delayMs / 1000 : 0,
          }}
        >
          {leadParagraphs.map((paragraph, index) => (
            <p key={paragraph}>
              <PortfolioProgressiveText
                text={paragraph}
                renderMode={textRenderMode}
                startDelayMs={getParagraphRevealStartDelayMs(index)}
              />
            </p>
          ))}
        </motion.div>
      ) : null}

      {sectionBlocks.length ? (
        <div className={compact ? 'flex w-full flex-col gap-4' : 'flex w-full max-w-[680px] flex-col gap-2'}>
          {sectionBlocks.map((block, sectionIndex) => (
            <motion.section
              key={`${block.title}-${sectionIndex}`}
              className="flex flex-col gap-2"
              initial={progressive ? { opacity: 0, y: getProgressiveReplyBlockTiming(sectionTimingOffset + sectionIndex).translateY } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: progressive ? getProgressiveReplyBlockTiming(sectionTimingOffset + sectionIndex).durationMs / 1000 : 0,
                delay: progressive ? getProgressiveReplyBlockTiming(sectionTimingOffset + sectionIndex).delayMs / 1000 : 0,
              }}
            >
              <h3 className={compact
                ? 'text-[15px] font-semibold leading-[19px] text-[#14161A]'
                : 'text-[20px] font-bold leading-7 tracking-[-0.015em] text-[#14161A]'}>
                <PortfolioProgressiveText
                  text={block.title}
                  renderMode={textRenderMode}
                  startDelayMs={getProgressiveReplyBlockTiming(sectionTimingOffset + sectionIndex).delayMs}
                />
              </h3>
              <div className={compact
                ? 'space-y-2 text-[14px] leading-5 text-[#202129]'
                : `space-y-2 ${ASSISTANT_BODY_TEXT_CLASS}`}>
                {block.body.map((paragraph, paragraphIndex) => (
                  <p key={paragraph}>
                    <PortfolioProgressiveText
                      text={paragraph}
                      renderMode={textRenderMode}
                      startDelayMs={
                        getProgressiveReplyBlockTiming(sectionTimingOffset + sectionIndex).delayMs +
                        getParagraphRevealStartDelayMs(paragraphIndex)
                      }
                    />
                  </p>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      ) : null}

      {bullets.length ? (
        <motion.ul
          className={compact
            ? 'flex w-full flex-col gap-2 pl-4 text-[14px] leading-5 text-[#202129]'
            : `flex w-full max-w-[680px] flex-col gap-2 pl-6 ${ASSISTANT_BODY_TEXT_CLASS}`}
          initial={progressive ? { opacity: 0, y: getProgressiveReplyBlockTiming(bulletTimingIndex).translateY } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: progressive ? getProgressiveReplyBlockTiming(bulletTimingIndex).durationMs / 1000 : 0,
            delay: progressive ? getProgressiveReplyBlockTiming(bulletTimingIndex).delayMs / 1000 : 0,
          }}
        >
          {bullets.map((item, index) => (
            <li key={item} className="flex gap-3">
              <span className="shrink-0 text-[16px] font-medium leading-6 text-[#202129]">•</span>
              <span className="min-w-0">
                <PortfolioProgressiveText
                  text={item}
                  renderMode={textRenderMode}
                  startDelayMs={
                    getProgressiveReplyBlockTiming(bulletTimingIndex).delayMs +
                    getParagraphRevealStartDelayMs(index)
                  }
                />
              </span>
            </li>
          ))}
        </motion.ul>
      ) : null}

      {ctaBlocks.length ? (
        <div className="flex max-w-full flex-wrap gap-3 pt-2">
          {ctaBlocks.map((block) => (
            <button
              key={`${block.label}-${block.action.type}`}
              type="button"
              onClick={() => onCta(block.action)}
              className={[
                'inline-flex shrink-0 cursor-pointer items-center rounded-[999px] border border-[#DEDFE5] bg-white px-[18px] py-[7px] text-[15px] leading-[22px] text-[#5A5E68] transition-colors duration-150',
                portfolioChipSurface,
                portfolioFocusRing,
              ].join(' ')}
            >
              {block.label}
            </button>
          ))}
        </div>
      ) : null}

      {replyState === 'error_retry' && canRetryError && onRetryError ? (
        <div className="flex max-w-full flex-wrap gap-3 pt-1">
          <button
            type="button"
            onClick={onRetryError}
            className={[
              'inline-flex shrink-0 cursor-pointer items-center rounded-[999px] border border-[#DEDFE5] bg-white px-[18px] py-[7px] text-[15px] leading-[22px] text-[#5A5E68] transition-colors duration-150',
              portfolioChipSurface,
              portfolioFocusRing,
            ].join(' ')}
          >
            Повторить
          </button>
        </div>
      ) : null}

      {showChips && envelope.chips.length ? (
        <div className="flex max-w-full flex-wrap gap-3 pt-2">
          {envelope.chips.map((chip) => (
            <PortfolioPromptChip
              key={chip.id}
              chip={chip}
              onClick={onChipClick}
              emphasis
              size="compact"
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}
