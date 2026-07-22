'use client';

import clsx from 'clsx';

import {
  CASE_COLLECTION_IMAGE_SURFACE_COLOR,
  CASE_COLLECTION_SECTION_WIDTH,
  getCaseCollectionCardWidth,
  getCaseCollectionContract,
} from '@/lib/portfolio/case-layout-contract';
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
        const cardWidth = getCaseCollectionCardWidth({
          layoutType,
          requestedWidth: card.width,
        });

        const content = (
          <div className="flex flex-col gap-3 text-left" style={{ width: `${cardWidth}px` }}>
            <div
              className="relative h-[224px] overflow-hidden rounded-[24px] border"
              style={{
                backgroundColor: CASE_COLLECTION_IMAGE_SURFACE_COLOR,
                borderColor: card.preview.borderColor ?? '#E7EAF2',
              }}
            >
              <PortfolioFadeInImage
                src={card.preview.src}
                alt={card.title ?? 'Case preview'}
                width={Math.max(cardWidth, 320)}
                height={224}
                sizes={`${Math.max(cardWidth, 320)}px`}
                className={card.preview.imageClassName}
                overlayClassName="bg-white/18"
              />
              {card.preview.overlaySrc ? (
                <PortfolioFadeInImage
                  src={card.preview.overlaySrc}
                  alt=""
                  aria-hidden="true"
                  width={Math.max(cardWidth, 320)}
                  height={224}
                  sizes={`${Math.max(cardWidth, 320)}px`}
                  className={
                    card.preview.overlayImageClassName ??
                    'absolute inset-0 h-full w-full max-w-none object-cover'
                  }
                  overlayClassName="bg-white/10"
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
        className={clsx('overflow-visible', className)}
        style={{ width: '100%', maxWidth: `${CASE_COLLECTION_SECTION_WIDTH}px` }}
      >
        <div className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {cardsRow}
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx('overflow-visible', className)}
      style={{ width: '100%', maxWidth: `${contract.sectionWidth}px` }}
    >
      <div
        className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
