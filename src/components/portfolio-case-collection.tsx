'use client';

import clsx from 'clsx';

import {
  CASE_COLLECTION_SECTION_WIDTH,
  getCaseCollectionContract,
} from '@/lib/portfolio/case-layout-contract';
import type {
  ArtifactOpenTarget,
  CaseCollectionLayoutType,
  StructuredSummaryDisclosureCard,
} from '@/lib/portfolio/types';

function buildArtifactTarget(
  artifactId: string | undefined,
  caseId: string | undefined,
): ArtifactOpenTarget | null {
  if (!artifactId) {
    return null;
  }

  return {
    artifactId,
    caseId,
  };
}

export function PortfolioCaseCollection({
  items,
  layoutType,
  rowWidth,
  peekWidth,
  caseId,
  onOpenArtifact,
  className,
}: {
  items: StructuredSummaryDisclosureCard[];
  layoutType: CaseCollectionLayoutType;
  rowWidth?: number;
  peekWidth?: number;
  caseId?: string;
  onOpenArtifact: (target: ArtifactOpenTarget) => void;
  className?: string;
}) {
  const contract = getCaseCollectionContract({
    layoutType,
    rowWidth,
    peekWidth,
  });
  const fixedWidthLayout = !contract.isScrollable;

  const cardsRow = (
    <div
      className={clsx(
        'flex items-start gap-5',
        fixedWidthLayout ? 'w-full' : 'w-max',
      )}
    >
      {items.map((card) => {
        const artifactTarget = buildArtifactTarget(card.artifactId, caseId);

        const content = (
          <div className="flex flex-col gap-3 text-left" style={{ width: `${card.width}px` }}>
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
                alt={card.title ?? 'Case preview'}
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
                  <p className="text-[16px] font-normal leading-[22px] tracking-[0] text-[#202129]">
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

        if (!artifactTarget) {
          return (
            <div key={card.id} className="shrink-0">
              {content}
            </div>
          );
        }

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onOpenArtifact(artifactTarget)}
            className="shrink-0 cursor-pointer rounded-[24px] focus-visible:outline-none"
          >
            {content}
          </button>
        );
      })}
    </div>
  );

  if (fixedWidthLayout) {
    return (
      <div
        className={clsx(className)}
        style={{ maxWidth: `${CASE_COLLECTION_SECTION_WIDTH}px` }}
      >
        {cardsRow}
      </div>
    );
  }

  return (
    <div
      className={clsx('overflow-visible', className)}
      style={{ maxWidth: `${contract.sectionWidth}px` }}
    >
      <div
        className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={contract.viewportStyle}
      >
        <div className="pr-4">
          <div className="w-max" style={contract.rowWidth ? { width: `${contract.rowWidth}px` } : undefined}>
            {cardsRow}
          </div>
        </div>
      </div>
    </div>
  );
}
