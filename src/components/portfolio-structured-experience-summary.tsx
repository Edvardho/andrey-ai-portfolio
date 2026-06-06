'use client';

import { motion } from 'framer-motion';
import { Copy } from 'lucide-react';

import { getSummaryRevealTiming } from '@/lib/portfolio/response-animation-policy';
import type {
  AssistantRenderMode,
  ExperienceContent,
  PromptChip,
  UIAction,
} from '@/lib/portfolio/types';

import { PortfolioAssistantIdentityHeader } from './portfolio-assistant-identity-header';
import { PortfolioAssistantMessageFrame } from './portfolio-assistant-message-frame';
import { PortfolioPromptChip } from './portfolio-prompt-chip';
import { PortfolioStructuredIntroPreview } from './portfolio-structured-intro-preview';

const BODY_TEXT_CLASS = 'text-[16px] font-normal leading-[23px] tracking-[0] text-[#202129]';

type Props = {
  experience: ExperienceContent;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction) => void;
  renderMode?: AssistantRenderMode;
};

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section className="w-full max-w-[798px] space-y-[10px]">
      <h4 className="text-[16px] font-semibold leading-[22px] text-[#202129]">{title}</h4>
      <p className={BODY_TEXT_CLASS}>{body}</p>
    </section>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-h-[76px] w-[212px] shrink-0 flex-col gap-[6px] rounded-[18px] border border-[#E7EAF2] bg-[#FAFBFF] px-4 py-[14px]">
      <p className="text-[18px] font-semibold leading-6 text-[#202332]">{value}</p>
      <p className="whitespace-pre-line text-[13px] leading-[18px] text-[#50525A]">{label}</p>
    </div>
  );
}

export function PortfolioStructuredExperienceSummary({
  experience,
  onChipClick,
  onCta,
  renderMode = 'instant',
}: Props) {
  const summary = experience.structuredSummary;
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
      <div className="space-y-6 text-[#202129]">
        <motion.div className="flex items-center" {...getRevealProps(0)}>
          <PortfolioAssistantIdentityHeader />
        </motion.div>

        <motion.section className="flex w-full max-w-[798px] gap-4" {...getRevealProps(1)}>
          <PortfolioStructuredIntroPreview
            preview={summary.intro.preview}
            alt={summary.intro.title}
          />
          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="text-[20px] font-semibold leading-7 text-[#202332]">
              {summary.intro.title}
            </h3>
            <p className="text-[16px] font-normal leading-[26px] text-[#202129]">
              {summary.intro.body}
            </p>
          </div>
        </motion.section>

        <motion.div {...getRevealProps(2)}>
          <Section title={summary.currentWork.title} body={summary.currentWork.body} />
        </motion.div>

        <motion.section className="w-full max-w-[932px] space-y-4" {...getRevealProps(3)}>
          <h4 className="text-[16px] font-semibold leading-[22px] text-[#202129]">
            {summary.workHistory.title}
          </h4>
          <div>
            {summary.workHistory.items.map((item, index) => (
              <div key={item.id}>
                <div className="space-y-[6px] py-4">
                  <div className="space-y-1">
                    <p className="w-[257px] text-[13px] font-normal leading-[18px] text-[#5E606A]">
                      {item.period}
                    </p>
                    <h5 className="text-[18px] font-semibold leading-6 text-[#202332]">
                      {item.company}
                    </h5>
                  </div>
                  <p className={BODY_TEXT_CLASS}>{item.description}</p>
                  <div className="space-y-[6px] pt-3">
                    <p className="text-[16px] font-normal leading-[23px] text-[#202129]">
                      {item.resultLabel}
                    </p>
                    <div className="flex min-w-0 flex-wrap gap-3">
                      {item.resultTags.map((tag) => (
                        <span
                          key={tag}
                          className="w-[206px] shrink-0 rounded-[18px] border border-[#E7EAF2] bg-[#FAFBFF] px-4 py-[14px] text-[13px] font-normal leading-[18px] text-[#50525A]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {index < summary.workHistory.items.length - 1 ? (
                  <div className="h-px w-full bg-[#E7EAF2]" />
                ) : null}
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section className="w-full max-w-[798px] space-y-[10px]" {...getRevealProps(4)}>
          <h4 className="text-[16px] font-semibold leading-[22px] text-[#202129]">
            {summary.importantTakeaway.title}
          </h4>
          <p className={BODY_TEXT_CLASS}>{summary.importantTakeaway.body}</p>
          <div className="flex flex-wrap gap-3 pt-3">
            {summary.importantTakeaway.metrics.map((metric) => (
              <MetricCard key={`${metric.value}-${metric.label}`} value={metric.value} label={metric.label} />
            ))}
          </div>
        </motion.section>

        <motion.section className="w-full max-w-[932px] space-y-[10px]" {...getRevealProps(5)}>
          <h4 className="text-[16px] font-semibold leading-[22px] text-[#202129]">
            {summary.casePromptSection.title}
          </h4>
          <div className="flex flex-wrap gap-3">
            {summary.casePromptSection.chips.map((chip) => (
              <PortfolioPromptChip key={chip.id} chip={chip} onClick={onChipClick} emphasis />
            ))}
          </div>
        </motion.section>

        <motion.div className="flex items-start gap-3" {...getRevealProps(6)}>
          <div
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#ECECF1] bg-white text-[#6B7182]"
          >
            <Copy className="size-4" strokeWidth={1.8} />
          </div>
          <button
            type="button"
            onClick={() => onCta(summary.footerAction.action)}
            className="flex h-8 cursor-pointer items-center rounded-full bg-[#1A1C22] px-[14px] text-[14px] font-medium leading-5 text-white transition hover:bg-[#4D4D4D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8EA2FF] focus-visible:ring-offset-2"
          >
            {summary.footerAction.label}
          </button>
        </motion.div>
      </div>
    </PortfolioAssistantMessageFrame>
  );
}
