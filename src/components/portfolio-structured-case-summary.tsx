'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import type {
  ArtifactOpenTarget,
  AssistantRenderMode,
  CaseContent,
  UIAction,
} from '@/lib/portfolio/types';
import { getSummaryRevealTiming } from '@/lib/portfolio/response-animation-policy';

import { PortfolioAssistantMessageFrame } from './portfolio-assistant-message-frame';
import { PortfolioAssistantIdentityHeader } from './portfolio-assistant-identity-header';
import { PortfolioCaseCollection } from './portfolio-case-collection';
import { portfolioFocusRing, portfolioPrimaryAction } from './portfolio-interaction-styles';
import { PortfolioStructuredIntroPreview } from './portfolio-structured-intro-preview';
const SUMMARY_BODY_TEXT_16_CLASS =
  'text-[16px] font-normal leading-[22px] tracking-[0] text-[#202129]';

type Props = {
  caseContent: CaseContent;
  expandedDisclosureIds: string[];
  onToggleDisclosure: (id: string) => void;
  onOpenArtifact: (target: ArtifactOpenTarget) => void;
  onCta: (action: UIAction) => void;
  renderMode?: AssistantRenderMode;
};

function SummarySection({ title, body }: { title: string; body: string }) {
  return (
    <section className="w-full max-w-[798px] space-y-[10px]">
      <h4 className="text-[16px] font-semibold leading-[1.45] text-[#202129]">{title}</h4>
      <div className={clsx('space-y-0', SUMMARY_BODY_TEXT_16_CLASS)}>
        {body.split('\n').map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

export function PortfolioStructuredCaseSummary({
  caseContent,
  expandedDisclosureIds,
  onToggleDisclosure,
  onOpenArtifact,
  onCta,
  renderMode = 'instant',
}: Props) {
  const summary = caseContent.structuredSummary;
  const reveal = renderMode === 'reveal';

  if (!summary) {
    return null;
  }

  function getRevealProps(order: number, y = 4) {
    if (!reveal) {
      return {
        initial: false as const,
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      };
    }

    const timing = getSummaryRevealTiming(order);

    return {
      initial: { opacity: 0, y },
      animate: { opacity: 1, y: 0 },
      transition: { duration: timing.durationMs / 1000, delay: timing.delayMs / 1000 },
    };
  }

  return (
    <PortfolioAssistantMessageFrame showHeader={false} showLeadingBadge={false} chrome="bare">
      <div className="space-y-8 text-[#202129]">
        <motion.div className="flex items-center" {...getRevealProps(0)}>
          <PortfolioAssistantIdentityHeader />
        </motion.div>

        <motion.section className="flex w-full max-w-[798px] gap-4" {...getRevealProps(1)}>
          <PortfolioStructuredIntroPreview
            preview={summary.intro.preview}
            alt={summary.intro.title}
          />
          <div className="min-w-0 flex-1 space-y-2 text-[#202332]">
            <h3 className="text-[20px] font-semibold leading-7">{summary.intro.title}</h3>
            <p className={SUMMARY_BODY_TEXT_16_CLASS}>
              {summary.intro.body}
            </p>
          </div>
        </motion.section>

        {summary.sections.map((section, index) => (
          <motion.div key={section.title} {...getRevealProps(2 + index)}>
            <SummarySection title={section.title} body={section.body} />
          </motion.div>
        ))}

        <motion.section className="w-full max-w-[798px] overflow-visible space-y-[10px]" {...getRevealProps(4)}>
          <h4 className="text-[16px] font-semibold leading-[22px] text-[#202332]">
            {summary.disclosureTitle}
          </h4>
          <div className="space-y-1">
            {summary.disclosures.map((item, index) => {
              const expanded = expandedDisclosureIds.includes(item.id);
              const isLastDisclosure = index === summary.disclosures.length - 1;

              return (
                <div key={item.id} className="rounded-[20px]">
                  <motion.button
                    type="button"
                    onClick={() => onToggleDisclosure(item.id)}
                    className="flex h-8 w-full cursor-pointer items-center text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8EA2FF] focus-visible:ring-offset-2"
                    {...getRevealProps(5 + index, 4)}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-[10px]">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#F1F2FF] text-[12px] font-medium leading-4 text-[#434650]">
                        {index + 1}
                      </div>
                      <p className="truncate text-[16px] leading-6 text-[#202332]">{item.label}</p>
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

                  {expanded ? (
                    <div className={clsx('pt-3', isLastDisclosure ? 'pb-0' : 'pb-6')}>
                      <div className="space-y-3">
                        <div className="h-px w-full bg-[#E7EAF2]" />
                        <p className="text-[14px] leading-5 text-[#202129]">{item.body}</p>
                      </div>
                      {item.layoutType !== 'text_only' && item.cards?.length ? (
                        <PortfolioCaseCollection
                          items={item.cards}
                          caseId={caseContent.id}
                          layoutType={item.layoutType}
                          rowWidth={item.rowWidth}
                          peekWidth={item.peekWidth}
                          onOpenArtifact={onOpenArtifact}
                          className="pt-4"
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </motion.section>

        <motion.section className="w-full max-w-[798px] overflow-visible space-y-[10px]" {...getRevealProps(9)}>
          <h4 className="text-[16px] font-semibold leading-[1.45] text-[#202129]">
            {summary.showcaseTitle}
          </h4>
          <PortfolioCaseCollection
            items={summary.showcaseItems}
            caseId={caseContent.id}
            layoutType="three_cards_scroll"
            rowWidth={summary.showcaseRowWidth}
            peekWidth={summary.showcasePeekWidth}
            onOpenArtifact={onOpenArtifact}
          />
        </motion.section>

        <motion.section className="w-full max-w-[798px] space-y-[10px]" {...getRevealProps(10)}>
          <h4 className="text-[16px] font-semibold leading-[1.45] text-[#202129]">
            {summary.resultsTitle}
          </h4>
          <p className={SUMMARY_BODY_TEXT_16_CLASS}>{summary.resultsBody}</p>
          {summary.resultMetrics.length ? (
            <div className="flex flex-wrap gap-3 pt-3">
              {summary.resultMetrics.map((metric) => (
                <div
                  key={`${metric.value}-${metric.label}`}
                  className="flex min-h-[76px] w-[212px] shrink-0 flex-col gap-[6px] rounded-[18px] border border-[#E7EAF2] bg-[#FAFBFF] px-4 py-[14px]"
                >
                  <p className="text-[18px] font-semibold leading-6 text-[#202332]">{metric.value}</p>
                  <p className="text-[13px] leading-[18px] text-[#8F95A7]">{metric.label}</p>
                </div>
              ))}
            </div>
          ) : null}
        </motion.section>

        <motion.div className="flex items-start" {...getRevealProps(11)}>
          <button
            type="button"
            onClick={() => onCta(summary.footerAction.action)}
            className={[
              'flex h-8 cursor-pointer items-center rounded-full border px-[14px] text-[14px] font-medium leading-5 transition-colors duration-150',
              portfolioPrimaryAction,
              portfolioFocusRing,
            ].join(' ')}
          >
            {summary.footerAction.label}
          </button>
        </motion.div>
      </div>
    </PortfolioAssistantMessageFrame>
  );
}
