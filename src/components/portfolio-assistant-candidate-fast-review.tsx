'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import { candidateFastReview } from '@/data/portfolio-candidate-review';
import { getCandidateFastReviewRevealTiming } from '@/lib/portfolio/response-animation-policy';
import type {
  ArtifactOpenTarget,
  AssistantRenderMode,
  UIAction,
} from '@/lib/portfolio/types';

import { PortfolioAssistantIdentityHeader } from './portfolio-assistant-identity-header';
import { PortfolioAssistantMessageFrame } from './portfolio-assistant-message-frame';
import { PortfolioCaseCollection } from './portfolio-case-collection';
import { portfolioFocusRing, portfolioPrimaryAction } from './portfolio-interaction-styles';

const BODY_CLASS = 'text-[16px] font-normal leading-[22px] tracking-[0] text-[#202129]';
const MAX_REVEAL_ORDER = 10;

type Props = {
  expandedDisclosureIds: string[];
  onToggleDisclosure: (id: string) => void;
  onOpenArtifact: (target: ArtifactOpenTarget) => void;
  onCta: (action: UIAction) => void;
  renderMode?: AssistantRenderMode;
};

function TextSection({ title, body }: { title: string; body: string[] }) {
  return (
    <section className="w-full max-w-[798px] space-y-[10px]">
      <h4 className="text-[16px] font-semibold leading-[1.45] text-[#202129]">{title}</h4>
      <div className={clsx('space-y-3', BODY_CLASS)}>
        {body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

export function PortfolioAssistantCandidateFastReview({
  expandedDisclosureIds,
  onToggleDisclosure,
  onOpenArtifact,
  onCta,
  renderMode = 'instant',
}: Props) {
  const reveal = renderMode === 'reveal';
  const [visibleRevealOrder, setVisibleRevealOrder] = useState(() => (
    reveal ? -1 : MAX_REVEAL_ORDER
  ));

  useEffect(() => {
    if (!reveal) {
      return undefined;
    }

    const timers = Array.from({ length: MAX_REVEAL_ORDER + 1 }, (_, order) => {
      const timing = getCandidateFastReviewRevealTiming(order);
      return globalThis.setTimeout(() => {
        setVisibleRevealOrder((current) => Math.max(current, order));
      }, timing.delayMs);
    });

    return () => {
      timers.forEach((timer) => globalThis.clearTimeout(timer));
    };
  }, [reveal]);

  function shouldShowRevealOrder(order: number) {
    return !reveal || visibleRevealOrder >= order;
  }

  function getRevealProps(order: number, y = 4) {
    if (!reveal) {
      return {
        initial: false as const,
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      };
    }

    const timing = getCandidateFastReviewRevealTiming(order);

    return {
      initial: { opacity: 0, y },
      animate: { opacity: 1, y: 0 },
      transition: { duration: timing.durationMs / 1000 },
    };
  }

  return (
    <PortfolioAssistantMessageFrame showHeader={false} showLeadingBadge={false} chrome="bare">
      <div className="space-y-8 text-[#202129]">
        {shouldShowRevealOrder(0) ? (
          <motion.div className="flex items-center" {...getRevealProps(0)}>
            <PortfolioAssistantIdentityHeader />
          </motion.div>
        ) : null}

        {shouldShowRevealOrder(1) ? (
          <motion.div {...getRevealProps(1)}>
            <TextSection title={candidateFastReview.intro.title} body={candidateFastReview.intro.body} />
          </motion.div>
        ) : null}

        {shouldShowRevealOrder(2) ? (
          <motion.div {...getRevealProps(2)}>
            <TextSection title={candidateFastReview.projectScope.title} body={candidateFastReview.projectScope.body} />
          </motion.div>
        ) : null}

        {shouldShowRevealOrder(3) ? (
          <motion.div {...getRevealProps(3)}>
            <TextSection title={candidateFastReview.watchOrder.title} body={candidateFastReview.watchOrder.body} />
          </motion.div>
        ) : null}

        {shouldShowRevealOrder(4) ? (
          <motion.section className="w-full max-w-[798px] overflow-visible space-y-[10px]" {...getRevealProps(4)}>
            <h4 className="text-[16px] font-semibold leading-[22px] text-[#202332]">
              {candidateFastReview.disclosureTitle}
            </h4>
            <div className="space-y-1">
              {candidateFastReview.disclosures.map((item, index) => {
                const expanded = expandedDisclosureIds.includes(item.id);
                const isLastDisclosure = index === candidateFastReview.disclosures.length - 1;
                const rowRevealOrder = 5 + index;
                const expandedContentRevealOrder = index === 0 ? 8 : rowRevealOrder;

                return shouldShowRevealOrder(rowRevealOrder) ? (
                  <div key={item.id} className="rounded-[20px]">
                    <motion.button
                      type="button"
                      onClick={() => onToggleDisclosure(item.id)}
                      className="flex h-8 w-full cursor-pointer items-center text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8EA2FF] focus-visible:ring-offset-2"
                      {...getRevealProps(rowRevealOrder, 4)}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-[10px]">
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#F1F2FF] text-[12px] font-medium leading-4 text-[#434650]">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[16px] leading-6 text-[#202332]">{item.label}</p>
                        </div>
                      </div>
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white">
                        <ChevronDown
                          className={clsx(
                            'size-4 text-[#7A8090] transition-transform duration-200',
                            expanded && 'rotate-180',
                          )}
                          strokeWidth={1.8}
                        />
                      </div>
                    </motion.button>

                    {expanded && shouldShowRevealOrder(expandedContentRevealOrder) ? (
                      <motion.div
                        className={clsx('pt-3', isLastDisclosure ? 'pb-0' : 'pb-6')}
                        {...getRevealProps(expandedContentRevealOrder, 6)}
                      >
                        <div className="space-y-3">
                          <div className="h-px w-full bg-[#E7EAF2]" />
                          <p className="text-[14px] leading-5 text-[#202129]">{item.body}</p>
                        </div>
                        {item.layoutType !== 'text_only' && item.cards?.length ? (
                          <PortfolioCaseCollection
                            items={item.cards}
                            caseId={item.caseId}
                            layoutType={item.layoutType}
                            rowWidth={item.rowWidth}
                            peekWidth={item.peekWidth}
                            onOpenArtifact={onOpenArtifact}
                            className="pt-4"
                          />
                        ) : null}
                      </motion.div>
                    ) : null}
                  </div>
                ) : null;
              })}
            </div>
          </motion.section>
        ) : null}

        {shouldShowRevealOrder(9) ? (
          <motion.div {...getRevealProps(9)}>
            <TextSection
              title={candidateFastReview.hiringLeadNote.title}
              body={candidateFastReview.hiringLeadNote.body}
            />
          </motion.div>
        ) : null}

        {shouldShowRevealOrder(10) ? (
          <motion.div className="flex items-start" {...getRevealProps(10)}>
            <button
              type="button"
              onClick={() => onCta(candidateFastReview.footerAction.action)}
              className={[
                'flex h-8 cursor-pointer items-center rounded-full border px-[14px] text-[14px] font-medium leading-5 transition-colors duration-150',
                portfolioPrimaryAction,
                portfolioFocusRing,
              ].join(' ')}
            >
              {candidateFastReview.footerAction.label}
            </button>
          </motion.div>
        ) : null}
      </div>
    </PortfolioAssistantMessageFrame>
  );
}
