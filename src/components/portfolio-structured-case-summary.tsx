'use client';

import clsx from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import type {
  ArtifactOpenTarget,
  AssistantRenderMode,
  CaseContent,
  UIAction,
} from '@/lib/portfolio/types';
import { getSummaryRevealTiming } from '@/lib/portfolio/response-animation-policy';
import type { WorkspaceLayoutMode } from '@/lib/portfolio/workspace-layout';

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
  layoutMode?: WorkspaceLayoutMode;
  showAssistantIdentity?: boolean;
};

function SummarySection({
  title,
  body,
  layoutMode,
}: {
  title: string;
  body: string;
  layoutMode: WorkspaceLayoutMode;
}) {
  const compact = layoutMode === 'compact';

  return (
    <section className={compact ? 'w-full space-y-2' : 'w-full max-w-[798px] space-y-[10px]'}>
      <h4 className={compact
        ? 'text-[15px] font-semibold leading-[18px] text-[#202129]'
        : 'text-[16px] font-semibold leading-[1.45] text-[#202129]'}>{title}</h4>
      <div className={compact
        ? 'space-y-0 text-[14px] font-normal leading-5 text-[#494A56]'
        : clsx('space-y-0', SUMMARY_BODY_TEXT_16_CLASS)}>
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
  layoutMode = 'desktop',
  showAssistantIdentity = true,
}: Props) {
  const summary = caseContent.structuredSummary;
  const reveal = renderMode === 'reveal';
  const compact = layoutMode === 'compact';
  const reduceMotion = useReducedMotion();

  if (!summary) {
    return null;
  }

  const introRevealOrder = showAssistantIdentity ? 1 : 0;
  const sectionRevealOrder = introRevealOrder + 1;
  const disclosureRevealOrder = sectionRevealOrder + summary.sections.length;
  const disclosureItemRevealOrder = disclosureRevealOrder + 1;
  const showcaseRevealOrder = disclosureItemRevealOrder + summary.disclosures.length;
  const resultsRevealOrder = showcaseRevealOrder + 1;
  const footerRevealOrder = resultsRevealOrder + 1;
  const glance = caseContent.atAGlance;

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
      <div className={compact ? 'space-y-5 text-[#202129]' : 'space-y-8 text-[#202129]'}>
        {showAssistantIdentity ? (
          <motion.div className="flex items-center" {...getRevealProps(0)}>
            <PortfolioAssistantIdentityHeader layoutMode={layoutMode} />
          </motion.div>
        ) : null}

        <motion.section
          className={compact
            ? 'w-full rounded-[20px] border border-[#E7EAF2] bg-[#FAFBFF] p-4'
            : 'w-full max-w-[920px] rounded-[20px] border border-[#E7EAF2] bg-[#FAFBFF] p-4'}
          aria-labelledby={`${caseContent.id}-at-a-glance-title`}
          {...getRevealProps(introRevealOrder)}
        >
          <div className={compact ? 'flex h-[60px] items-start gap-3' : 'flex h-[66px] items-start gap-3'}>
            <PortfolioStructuredIntroPreview
              preview={summary.intro.preview}
              alt={glance.title}
              layoutMode={layoutMode}
              compactSizeClassName="size-14 rounded-[14px]"
              desktopSizeClassName="size-[66px] rounded-[14px]"
            />
            <div className="min-w-0 w-[243px] max-w-full flex-1 text-[#202332]">
              <p className="text-[12px] font-normal leading-4 text-[#777B88]">
                Коротко о кейсе
              </p>
              <h3
                id={`${caseContent.id}-at-a-glance-title`}
                className={compact
                  ? 'mt-1 whitespace-pre-line text-[16px] font-semibold leading-5'
                  : 'mt-1 text-[16px] font-semibold leading-[23px]'}
              >
                {compact ? (glance.compactTitle ?? glance.title) : glance.title}
              </h3>
            </div>
          </div>

          <p className={compact
            ? 'mt-3 text-[13px] leading-[18px] text-[#494A56]'
            : 'mt-3 text-[16px] leading-[23px] text-[#202332]'}>
            {glance.problem}
          </p>

          <dl className={compact ? 'mt-4 grid grid-cols-2 gap-2 pt-1' : 'mt-4 grid grid-cols-3 gap-2 pt-1'}>
            {[
              { label: 'Роль', value: glance.role, className: '' },
              { label: 'Период', value: glance.period, className: '' },
              {
                label: 'Результат',
                value: glance.outcome,
                className: compact ? 'col-span-2' : '',
              },
            ].map((fact) => (
              <div
                key={fact.label}
                className={clsx(
                  'min-w-0 rounded-[14px] border bg-white px-3 py-[10px]',
                  fact.className,
                  fact.label === 'Результат' && glance.outcomeTone === 'caution'
                    ? 'border-[#E9D8B4]'
                    : 'border-[#E7EAF2]',
                )}
              >
                <dt className="text-[11px] leading-4 text-[#777B88]">{fact.label}</dt>
                <dd className={clsx(
                  'mt-1 text-[13px] font-medium leading-[18px]',
                  fact.label === 'Результат' && glance.outcomeTone === 'caution'
                    ? 'text-[#8A5A08]'
                    : 'text-[#30313A]',
                )}>
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </motion.section>

        {summary.sections.map((section, index) => (
          <motion.div key={section.title} {...getRevealProps(sectionRevealOrder + index)}>
            <SummarySection title={section.title} body={section.body} layoutMode={layoutMode} />
          </motion.div>
        ))}

        <motion.section
          className={compact
            ? 'w-full space-y-[10px] overflow-visible'
            : 'w-full max-w-[798px] space-y-[10px] overflow-visible'}
          {...getRevealProps(disclosureRevealOrder)}
        >
          <h4 className={compact
            ? 'text-[15px] font-semibold leading-[18px] text-[#202332]'
            : 'text-[16px] font-semibold leading-[22px] text-[#202332]'}>
            {summary.disclosureTitle}
          </h4>
          <div className="flex flex-col gap-1">
            {summary.disclosures.map((item, index) => {
              const expanded = expandedDisclosureIds.includes(item.id);

              return (
                <div key={item.id} className="w-full">
                  <motion.button
                    type="button"
                    onClick={() => onToggleDisclosure(item.id)}
                    aria-expanded={expanded}
                    aria-controls={`${caseContent.id}-${item.id}-panel`}
                    className={compact
                      ? 'flex min-h-8 w-full cursor-pointer items-center gap-6 overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8EA2FF] focus-visible:ring-offset-2'
                      : 'flex h-8 w-full cursor-pointer items-center text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8EA2FF] focus-visible:ring-offset-2'}
                    {...getRevealProps(disclosureItemRevealOrder + index, 4)}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-[10px]">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#F1F2FF] text-[12px] font-medium leading-4 text-[#434650]">
                        {index + 1}
                      </div>
                      <p className={compact
                        ? 'min-w-0 flex-1 text-[13px] leading-[18px] text-[#494A56]'
                        : 'min-w-0 flex-1 py-1 text-[16px] leading-6 text-[#202332]'}>{item.label}</p>
                    </div>
                    <div className={compact
                      ? 'flex size-8 shrink-0 items-center justify-center rounded-full bg-white'
                      : 'flex size-8 shrink-0 items-center justify-center rounded-full bg-white'}>
                      <ChevronDown
                        className={clsx(
                          'size-4 text-[#7A8090] transition-transform duration-200',
                          expanded && 'rotate-180',
                        )}
                        strokeWidth={1.8}
                      />
                    </div>
                  </motion.button>

                  <AnimatePresence initial={false}>
                    {expanded ? (
                      <motion.div
                        id={`${caseContent.id}-${item.id}-panel`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-3 pb-6 pt-3">
                          <div className="h-px w-full bg-[#E7EAF2]" aria-hidden="true" />
                          <p className={compact
                            ? 'text-[14px] leading-5 text-[#676767]'
                            : 'text-[16px] leading-6 text-[#202332]'}>{item.body}</p>
                          {item.layoutType !== 'text_only' && item.cards?.length ? (
                            <PortfolioCaseCollection
                              items={item.cards}
                              caseId={caseContent.id}
                              layoutType={item.layoutType}
                              rowWidth={item.rowWidth}
                              peekWidth={item.peekWidth}
                              onOpenArtifact={onOpenArtifact}
                              className="pt-2"
                              layoutMode={layoutMode}
                              compactVariant="evidence"
                            />
                          ) : null}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.section>

        <motion.section className={compact
          ? 'w-full space-y-[10px] overflow-visible'
          : 'w-full max-w-[798px] space-y-[10px] overflow-visible'} {...getRevealProps(showcaseRevealOrder)}>
          <h4 className={compact
            ? 'text-[15px] font-semibold leading-[18px] text-[#202129]'
            : 'text-[16px] font-semibold leading-[1.45] text-[#202129]'}>
            {summary.showcaseTitle}
          </h4>
          <PortfolioCaseCollection
            items={summary.showcaseItems}
            caseId={caseContent.id}
            layoutType="three_cards_scroll"
            rowWidth={summary.showcaseRowWidth}
            peekWidth={summary.showcasePeekWidth}
            onOpenArtifact={onOpenArtifact}
            layoutMode={layoutMode}
            compactVariant="showcase"
          />
        </motion.section>

        <motion.section className={compact
          ? 'w-full space-y-[10px]'
          : 'w-full max-w-[798px] space-y-[10px]'} {...getRevealProps(resultsRevealOrder)}>
          <h4 className={compact
            ? 'text-[15px] font-semibold leading-[18px] text-[#202129]'
            : 'text-[16px] font-semibold leading-[1.45] text-[#202129]'}>
            {summary.resultsTitle}
          </h4>
          <p className={compact
            ? 'text-[14px] leading-5 text-[#494A56]'
            : SUMMARY_BODY_TEXT_16_CLASS}>{summary.resultsBody}</p>
          {summary.resultMetrics.length ? (
            <div className={compact ? 'flex flex-col gap-2 pt-2' : 'flex flex-wrap gap-3 pt-3'}>
              {summary.resultMetrics.map((metric) => (
                <div
                  key={`${metric.value}-${metric.label}`}
                  className={compact
                    ? 'flex min-h-[62px] w-full flex-col gap-1 rounded-[14px] border border-[#E7EAF2] bg-[#FAFBFF] px-3 py-2.5'
                    : 'flex min-h-[76px] w-[212px] shrink-0 flex-col gap-[6px] rounded-[18px] border border-[#E7EAF2] bg-[#FAFBFF] px-4 py-[14px]'}
                >
                  <p className={compact
                    ? 'text-[15px] font-semibold leading-[19px] text-[#202332]'
                    : 'text-[18px] font-semibold leading-6 text-[#202332]'}>{metric.value}</p>
                  <p className={compact
                    ? 'text-[12px] leading-[15px] text-[#8F95A7]'
                    : 'text-[13px] leading-[18px] text-[#8F95A7]'}>{metric.label}</p>
                </div>
              ))}
            </div>
          ) : null}
        </motion.section>

        <motion.div className="flex items-start" {...getRevealProps(footerRevealOrder)}>
          <button
            type="button"
            onClick={() => onCta(summary.footerAction.action)}
            className={[
              compact
                ? 'flex min-h-11 cursor-pointer items-center rounded-full border px-[16px] text-[14px] font-medium leading-5 transition-colors duration-150'
                : 'flex min-h-11 cursor-pointer items-center rounded-full border px-[16px] text-[14px] font-medium leading-5 transition-colors duration-150',
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
