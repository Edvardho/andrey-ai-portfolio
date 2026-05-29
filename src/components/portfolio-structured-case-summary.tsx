'use client';

import clsx from 'clsx';
import { ChevronDown, Copy } from 'lucide-react';

import type {
  CaseContent,
  StructuredSummaryDisclosureCard,
  StructuredSummaryDisclosureItem,
  UIAction,
} from '@/lib/portfolio/types';

import { PortfolioAssistantMessageFrame } from './portfolio-assistant-message-frame';

type Props = {
  caseContent: CaseContent;
  expandedDisclosureIds: string[];
  onToggleDisclosure: (id: string) => void;
  onOpenArtifact: (artifactId: string) => void;
  onCta: (action: UIAction) => void;
};

function SummarySection({ title, body }: { title: string; body: string }) {
  return (
    <section className="max-w-[798px] space-y-[10px]">
      <h4 className="text-[16px] font-semibold leading-[1.45] text-[#202129]">{title}</h4>
      <div className="space-y-0 text-[16px] leading-[26px] text-[#202129]">
        {body.split('\n').map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

function SummaryDisclosureCards({
  caseContent,
  cards,
  layoutType,
  onOpenArtifact,
}: {
  caseContent: CaseContent;
  cards: StructuredSummaryDisclosureCard[];
  layoutType: StructuredSummaryDisclosureItem['layoutType'];
  onOpenArtifact: (artifactId: string) => void;
}) {
  const cardsRow = (
    <div
      className={clsx(
        'flex items-start gap-5',
        layoutType === 'single_preview'
          ? 'w-full'
          : layoutType === 'two_cards'
            ? 'w-full'
            : 'w-max',
      )}
    >
      {cards.map((card) => {
        const cardWidthClass =
          layoutType === 'two_cards'
            ? 'min-w-0 flex-1'
            : layoutType === 'single_preview'
              ? 'w-full'
              : 'shrink-0';

        const content = (
          <div
            className={clsx('flex flex-col gap-3 text-left', cardWidthClass)}
            style={{ width: `${card.width}px` }}
          >
            <div
              className="relative h-[224px] overflow-hidden rounded-[24px] border"
              style={{
                backgroundColor: card.preview.backgroundColor,
                borderColor: card.preview.borderColor ?? '#E7EAF2',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.preview.src}
                alt={card.title ?? caseContent.shortTitle}
                className={card.preview.imageClassName}
              />
              {card.preview.overlaySrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={card.preview.overlaySrc}
                  alt=""
                  aria-hidden="true"
                  className={
                    card.preview.overlayImageClassName ??
                    'absolute inset-0 h-full w-full max-w-none object-cover'
                  }
                />
              ) : null}
            </div>

            {card.title || card.description ? (
              <div className="space-y-1">
                {card.title ? (
                  <p className="text-[16px] font-normal leading-[22px] text-[#202129]">
                    {card.title}
                  </p>
                ) : null}
                {card.description ? (
                  <p className="text-[14px] leading-[20px] text-[#676767]">{card.description}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        );

        if (!card.artifactId) {
          return <div key={card.id}>{content}</div>;
        }

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onOpenArtifact(card.artifactId!)}
            className={clsx('cursor-pointer', cardWidthClass)}
          >
            {content}
          </button>
        );
      })}
    </div>
  );

  if (layoutType === 'single_preview' || layoutType === 'two_cards') {
    return <div className="w-full pt-2">{cardsRow}</div>;
  }

  return (
    <div className="w-full overflow-x-auto pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="pr-4">{cardsRow}</div>
    </div>
  );
}

export function PortfolioStructuredCaseSummary({
  caseContent,
  expandedDisclosureIds,
  onToggleDisclosure,
  onOpenArtifact,
  onCta,
}: Props) {
  const summary = caseContent.structuredSummary;

  if (!summary) {
    return null;
  }

  return (
    <PortfolioAssistantMessageFrame showHeader={false} showLeadingBadge={false} chrome="bare">
      <div className="space-y-8 text-[#202129]">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-[14px] bg-[#F2F4FF] text-[15px] text-[#5b61ff]">
              ✦
            </div>
            <p className="text-[16px] font-bold leading-[1.45] text-[#202129]">ИИ ассистент</p>
          </div>
        </div>

        <section className="flex max-w-[798px] gap-4">
          <div
            className="relative size-28 shrink-0 overflow-hidden rounded-[20px]"
            style={{ backgroundColor: summary.intro.preview.backgroundColor }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={summary.intro.preview.src}
              alt={summary.intro.title}
              className={summary.intro.preview.imageClassName}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-2 text-[#202332]">
            <h3 className="text-[20px] font-semibold leading-7">{summary.intro.title}</h3>
            <p className="text-[16px] leading-[26px]">{summary.intro.body}</p>
          </div>
        </section>

        {summary.sections.map((section) => (
          <SummarySection key={section.title} title={section.title} body={section.body} />
        ))}

        <section className="w-full space-y-[10px]">
          <h4 className="text-[16px] font-semibold leading-[22px] text-[#202332]">
            {summary.disclosureTitle}
          </h4>
          <div className="space-y-1">
            {summary.disclosures.map((item, index) => {
              const expanded = expandedDisclosureIds.includes(item.id);
              const isLastDisclosure = index === summary.disclosures.length - 1;

              return (
                <div key={item.id} className="rounded-[20px]">
                  <button
                    type="button"
                    onClick={() => onToggleDisclosure(item.id)}
                    className="flex h-8 w-full cursor-pointer items-center text-left"
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
                  </button>

                  {expanded ? (
                    <div className={clsx('space-y-3 pt-3', isLastDisclosure ? 'pb-0' : 'pb-6')}>
                      <div className="h-px w-full bg-[#E7EAF2]" />
                      <p className="max-w-[798px] text-[14px] leading-5 text-[#202129]">
                        {item.body}
                      </p>
                      {item.layoutType !== 'text_only' && item.cards?.length ? (
                        <SummaryDisclosureCards
                          caseContent={caseContent}
                          cards={item.cards}
                          layoutType={item.layoutType}
                          onOpenArtifact={onOpenArtifact}
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="w-full space-y-[10px]">
          <h4 className="text-[16px] font-semibold leading-[1.45] text-[#202129]">
            {summary.showcaseTitle}
          </h4>
          <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max gap-5 pr-4">
              {summary.showcaseItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpenArtifact(item.artifactId)}
                  className="flex w-[252px] shrink-0 cursor-pointer flex-col items-start gap-3 text-left"
                >
                  <div className="h-[224px] w-full overflow-hidden rounded-[24px]">
                    <div
                      className="relative h-full w-full rounded-[24px] border border-solid"
                      style={{
                        backgroundColor: item.preview.backgroundColor,
                        borderColor: item.preview.borderColor ?? '#E7EAF2',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.preview.src}
                        alt={item.title}
                        className={item.preview.imageClassName}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[16px] leading-[1.45] text-[#202129]">{item.title}</p>
                    <p className="text-[14px] leading-[1.45] text-[#676767]">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-[798px] space-y-[10px]">
          <h4 className="text-[16px] font-semibold leading-[1.45] text-[#202129]">
            {summary.resultsTitle}
          </h4>
          <p className="text-[16px] leading-[26px] text-[#202129]">{summary.resultsBody}</p>
          {summary.resultMetrics.length ? (
            <div className="flex flex-wrap gap-3 pt-3">
              {summary.resultMetrics.map((metric) => (
                <div
                  key={`${metric.value}-${metric.label}`}
                  className="flex h-[76px] w-[212px] shrink-0 flex-col gap-[6px] rounded-[18px] border border-[#E7EAF2] bg-white px-4 py-[14px]"
                >
                  <p className="text-[18px] font-semibold leading-6 text-[#202332]">{metric.value}</p>
                  <p className="text-[13px] leading-[18px] text-[#8F95A7]">{metric.label}</p>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <div className="flex items-start gap-3">
          <div
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#ECECF1] bg-white text-[#6B7182]"
          >
            <Copy className="size-4" strokeWidth={1.8} />
          </div>
          <button
            type="button"
            onClick={() => onCta(summary.footerAction.action)}
            className="flex h-8 cursor-pointer items-center rounded-full bg-[#1A1C22] px-[14px] text-[14px] font-medium leading-5 text-white transition hover:bg-[#242832]"
          >
            {summary.footerAction.label}
          </button>
        </div>
      </div>
    </PortfolioAssistantMessageFrame>
  );
}
