'use client';

import { motion } from 'framer-motion';

import { getSummaryRevealTiming } from '@/lib/portfolio/response-animation-policy';
import type {
  AssistantRenderMode,
  ExperienceContent,
  PromptChip,
  UIAction,
} from '@/lib/portfolio/types';
import type { WorkspaceLayoutMode } from '@/lib/portfolio/workspace-layout';

import { PortfolioAssistantIdentityHeader } from './portfolio-assistant-identity-header';
import { PortfolioAssistantMessageFrame } from './portfolio-assistant-message-frame';
import { portfolioFocusRing, portfolioPrimaryAction } from './portfolio-interaction-styles';
import { PortfolioPromptChip } from './portfolio-prompt-chip';
import { PortfolioStructuredIntroPreview } from './portfolio-structured-intro-preview';

const BODY_TEXT_CLASS = 'text-[16px] font-normal leading-[23px] tracking-[0] text-[#202129]';

type Props = {
  experience: ExperienceContent;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction) => void;
  renderMode?: AssistantRenderMode;
  showChips?: boolean;
  layoutMode?: WorkspaceLayoutMode;
  showAssistantIdentity?: boolean;
};

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section className="w-full max-w-[798px] space-y-[10px]">
      <h4 className="text-[16px] font-semibold leading-[22px] text-[#202129]">{title}</h4>
      <p className={BODY_TEXT_CLASS}>{body}</p>
    </section>
  );
}

function MetricCard({ value, label, compact }: { value: string; label: string; compact: boolean }) {
  return (
    <div className={compact
      ? 'flex w-[202px] shrink-0 flex-col gap-1 rounded-xl border border-[#EBEDF2] bg-white p-3'
      : 'flex min-h-[76px] w-[212px] shrink-0 flex-col gap-[6px] rounded-[18px] border border-[#E7EAF2] bg-[#FAFBFF] px-4 py-[14px]'}>
      <p className={compact ? 'text-[16px] font-bold leading-[normal] text-[#202129]' : 'text-[18px] font-semibold leading-6 text-[#202332]'}>{value}</p>
      <p className={compact ? 'whitespace-pre-line text-[12px] leading-[normal] text-[#8B8D9B]' : 'whitespace-pre-line text-[13px] leading-[18px] text-[#50525A]'}>{label}</p>
    </div>
  );
}

export function PortfolioStructuredExperienceSummary({
  experience,
  onChipClick,
  onCta,
  renderMode = 'instant',
  showChips = true,
  layoutMode = 'desktop',
  showAssistantIdentity = true,
}: Props) {
  const summary = experience.structuredSummary;
  const reveal = renderMode === 'reveal';
  const compact = layoutMode === 'compact';
  const contentRevealOffset = showAssistantIdentity ? 1 : 0;

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
    <PortfolioAssistantMessageFrame showHeader={false} showLeadingBadge={false} chrome="bare" layoutMode={layoutMode}>
      <div className="text-[#202129]">
        {showAssistantIdentity ? (
          <motion.div className="flex items-center" {...getRevealProps(0)}>
            <PortfolioAssistantIdentityHeader layoutMode={layoutMode} strong={compact} />
          </motion.div>
        ) : null}

        <div className={showAssistantIdentity ? (compact ? 'mt-4 space-y-6' : 'mt-6 space-y-6') : 'space-y-6'}>
        <motion.section className={compact ? 'flex w-full flex-col gap-3' : 'flex w-full max-w-[798px] gap-4'} {...getRevealProps(contentRevealOffset)}>
          <PortfolioStructuredIntroPreview
            preview={summary.intro.preview}
            alt={summary.intro.title}
            layoutMode={layoutMode}
          />
          <div className="min-w-0 flex-1 space-y-2">
            <h3 className={compact ? 'text-[16px] font-semibold leading-[normal] text-[#202129]' : 'text-[20px] font-semibold leading-7 text-[#202332]'}>
              {summary.intro.title}
            </h3>
            <p className={compact ? 'text-[14px] font-normal leading-[1.4] text-[#202129]' : 'text-[16px] font-normal leading-[26px] text-[#202129]'}>
              {summary.intro.body}
            </p>
          </div>
        </motion.section>

        <motion.div {...getRevealProps(contentRevealOffset + 1)}>
          {compact ? (
            <section className="w-full space-y-2">
              <h4 className="text-[15px] font-semibold leading-[normal] text-[#202129]">{summary.currentWork.title}</h4>
              <p className="text-[13px] font-normal leading-[1.4] text-[#494A56]">{summary.currentWork.body}</p>
            </section>
          ) : (
            <Section title={summary.currentWork.title} body={summary.currentWork.body} />
          )}
        </motion.div>

        <motion.section className={compact ? 'w-full space-y-4' : 'w-full max-w-[932px] space-y-4'} {...getRevealProps(contentRevealOffset + 2)}>
          <h4 className={compact ? 'text-[15px] font-semibold leading-[normal] text-[#202129]' : 'text-[16px] font-semibold leading-[22px] text-[#202129]'}>
            {summary.workHistory.title}
          </h4>
          <div className={compact ? 'space-y-4' : ''}>
            {summary.workHistory.items.map((item, index) => (
              <div key={item.id}>
                {compact || index < summary.workHistory.items.length - 1 ? <div className="h-px w-full bg-[#E7EAF2]" /> : null}
                <div className={compact ? 'space-y-[6px] pt-4' : 'space-y-[6px] py-4'}>
                  <div className="space-y-1">
                    <p className="w-[257px] text-[13px] font-normal leading-[18px] text-[#5E606A]">
                      {item.period}
                    </p>
                    <h5 className={compact ? 'text-[16px] font-semibold leading-6 text-[#202332]' : 'text-[18px] font-semibold leading-6 text-[#202332]'}>
                      {item.company}
                    </h5>
                  </div>
                  <p className={compact ? 'text-[13px] font-normal leading-[1.4] text-[#494A56]' : BODY_TEXT_CLASS}>{item.description}</p>
                  <div className="space-y-[6px] pt-3">
                    <p className={compact ? 'text-[13px] font-normal leading-[1.4] text-black' : 'text-[16px] font-normal leading-[23px] text-[#202129]'}>
                      {item.resultLabel}
                    </p>
                    <div className={compact ? 'flex min-w-0 gap-2' : 'flex min-w-0 flex-wrap gap-3'}>
                      {item.resultTags.map((tag) => (
                        <span
                          key={tag}
                          className={compact
                            ? 'min-w-0 flex-1 rounded-[18px] border border-[#E7EAF2] bg-[#FAFBFF] px-[14px] py-3 text-[12px] font-normal leading-[1.4] text-[#494A56]'
                            : 'w-[206px] shrink-0 rounded-[18px] border border-[#E7EAF2] bg-[#FAFBFF] px-4 py-[14px] text-[13px] font-normal leading-[18px] text-[#50525A]'}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {!compact && index < summary.workHistory.items.length - 1 ? (
                  <div className="h-px w-full bg-[#E7EAF2]" />
                ) : null}
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section className={compact ? 'w-full space-y-3' : 'w-full max-w-[798px] space-y-[10px]'} {...getRevealProps(contentRevealOffset + 3)}>
          <h4 className={compact ? 'text-[15px] font-semibold leading-[normal] text-[#202129]' : 'text-[16px] font-semibold leading-[22px] text-[#202129]'}>
            {summary.importantTakeaway.title}
          </h4>
          <p className={compact ? 'text-[13px] font-normal leading-[1.4] text-[#494A56]' : BODY_TEXT_CLASS}>{summary.importantTakeaway.body}</p>
          <div className={compact ? 'no-scrollbar -mr-4 flex gap-2 overflow-x-auto pt-3 pr-4' : 'flex flex-wrap gap-3 pt-3'}>
            {summary.importantTakeaway.metrics.map((metric) => (
              <MetricCard key={`${metric.value}-${metric.label}`} value={metric.value} label={metric.label} compact={compact} />
            ))}
          </div>
        </motion.section>

        {showChips ? (
          <motion.section className={compact ? 'w-full space-y-[10px]' : 'w-full max-w-[932px] space-y-[10px]'} {...getRevealProps(contentRevealOffset + 4)}>
            <h4 className={compact ? 'text-[16px] font-semibold leading-[1.45] text-[#202129]' : 'text-[16px] font-semibold leading-[22px] text-[#202129]'}>
              {summary.casePromptSection.title}
            </h4>
            <div className={compact ? 'no-scrollbar -mr-4 flex gap-3 overflow-x-auto pr-4' : 'flex flex-wrap gap-3'}>
              {summary.casePromptSection.chips.map((chip) => (
                <PortfolioPromptChip key={chip.id} chip={chip} onClick={onChipClick} emphasis />
              ))}
            </div>
          </motion.section>
        ) : null}

        <motion.div className="flex items-start" {...getRevealProps(contentRevealOffset + 5)}>
          <button
            type="button"
            onClick={() => onCta(summary.footerAction.action)}
            className={[
              compact
                ? 'flex min-h-11 cursor-pointer items-center rounded-full border px-[18px] text-[15px] font-medium leading-5 transition-colors duration-150'
                : 'flex min-h-11 cursor-pointer items-center rounded-full border px-[16px] text-[14px] font-medium leading-5 transition-colors duration-150',
              portfolioPrimaryAction,
              portfolioFocusRing,
            ].join(' ')}
          >
            {summary.footerAction.label}
          </button>
        </motion.div>
        </div>
      </div>
    </PortfolioAssistantMessageFrame>
  );
}
