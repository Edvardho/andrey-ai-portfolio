'use client';

import clsx from 'clsx';

import {
  CASE_COLLECTION_IMAGE_SURFACE_COLOR,
  CASE_COLLECTION_SECTION_WIDTH,
  getCaseCollectionCardWidth,
  getCaseCollectionContract,
  getCaseCollectionImageHeight,
  type CompactCollectionVariant,
} from '@/lib/portfolio/case-layout-contract';
import type { WorkspaceLayoutMode } from '@/lib/portfolio/workspace-layout';
import type {
  ArtifactOpenTarget,
  CaseCollectionLayoutType,
  StructuredSummaryDisclosureCard,
} from '@/lib/portfolio/types';
import { PortfolioFadeInImage } from './portfolio-fade-in-image';

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
  layoutMode = 'desktop',
  compactVariant = 'evidence',
}: {
  items: StructuredSummaryDisclosureCard[];
  layoutType: CaseCollectionLayoutType;
  rowWidth?: number;
  peekWidth?: number;
  caseId?: string;
  onOpenArtifact: (target: ArtifactOpenTarget) => void;
  className?: string;
  layoutMode?: WorkspaceLayoutMode;
  compactVariant?: CompactCollectionVariant;
}) {
  const contract = getCaseCollectionContract({
    layoutType,
    rowWidth,
    peekWidth,
  });
  const fixedWidthLayout = !contract.isScrollable;
  const compact = layoutMode === 'compact';
  const imageHeight = getCaseCollectionImageHeight(layoutType, layoutMode, compactVariant);

  const cardsRow = (
    <div
      className={clsx(
        'flex items-start',
        compact ? 'gap-3' : 'gap-5',
        fixedWidthLayout ? 'w-full' : 'w-max',
      )}
    >
      {items.map((card) => {
        const artifactTarget = buildArtifactTarget(card.artifactId, caseId);
        const cardWidth = getCaseCollectionCardWidth({
          layoutType,
          requestedWidth: card.width,
          layoutMode,
          compactVariant,
        });

        const content = (
          <div
            className={compact ? 'flex snap-start flex-col gap-3 text-left' : 'flex flex-col gap-3 text-left'}
            style={{ width: `${cardWidth}px` }}
          >
            <div
              className={compact
                ? 'relative overflow-hidden rounded-[15px] border'
                : 'relative h-[224px] overflow-hidden rounded-[24px] border'}
              style={{
                height: compact ? `${imageHeight}px` : undefined,
                backgroundColor: CASE_COLLECTION_IMAGE_SURFACE_COLOR,
                borderColor: card.preview.borderColor ?? '#E7EAF2',
              }}
            >
              <PortfolioFadeInImage
                src={card.preview.src}
                alt={card.title ?? 'Case preview'}
                width={Math.max(cardWidth, compact ? cardWidth : 320)}
                height={imageHeight}
                sizes={`${cardWidth}px`}
                className={card.preview.imageClassName}
                overlayClassName="bg-white/18"
              />
              {card.preview.overlaySrc ? (
                <PortfolioFadeInImage
                  src={card.preview.overlaySrc}
                  alt=""
                  aria-hidden="true"
                  width={Math.max(cardWidth, compact ? cardWidth : 320)}
                  height={imageHeight}
                  sizes={`${cardWidth}px`}
                  className={
                    card.preview.overlayImageClassName ??
                    'absolute inset-0 h-full w-full max-w-none object-cover'
                  }
                  overlayClassName="bg-white/10"
                />
              ) : null}
            </div>

            {card.title || card.description ? (
              <div className={compact ? 'space-y-1' : 'space-y-1'}>
                {card.title ? (
                  <p className={compact
                    ? 'text-[14px] font-normal leading-5 text-[#202129]'
                    : 'text-[16px] font-normal leading-[22px] tracking-[0] text-[#202129]'}>
                    {card.title}
                  </p>
                ) : null}
                {card.description ? (
                  <p className={compact
                    ? 'text-[12px] leading-[18px] text-[#676767]'
                    : 'text-[14px] leading-[20px] text-[#676767]'}>{card.description}</p>
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
            className={compact
              ? 'shrink-0 snap-start cursor-pointer rounded-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8EA2FF] focus-visible:ring-offset-2'
              : 'shrink-0 cursor-pointer rounded-[24px] focus-visible:outline-none'}
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
        className={clsx('overflow-visible', className)}
        style={{
          width: compact ? 'calc(100% + 16px)' : '100%',
          maxWidth: compact ? 'none' : `${CASE_COLLECTION_SECTION_WIDTH}px`,
        }}
      >
        <div className={compact
          ? 'overflow-x-auto overscroll-x-contain scroll-smooth pr-4 [scroll-snap-type:x_proximity] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          : 'overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'}>
          {cardsRow}
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx('overflow-visible', className)}
      style={{
        width: compact ? 'calc(100% + 16px)' : '100%',
        maxWidth: compact ? 'none' : `${contract.sectionWidth}px`,
      }}
    >
      <div
        className={compact
          ? 'overflow-x-auto overscroll-x-contain scroll-smooth [scroll-snap-type:x_proximity] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          : 'portfolio-case-collection-scroll-viewport overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'}
      >
        <div className="portfolio-case-collection-scroll-content inline-block w-max pr-4">
          <div
            className="w-max"
            style={!compact && contract.rowWidth ? { minWidth: `${contract.rowWidth}px` } : undefined}
          >
            {cardsRow}
          </div>
        </div>
      </div>
    </div>
  );
}
