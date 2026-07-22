import type { CaseCollectionLayoutType } from './types';

export const CASE_COLLECTION_SECTION_WIDTH = 798;
export const CASE_COLLECTION_DEFAULT_PEEK_WIDTH = 158;
// Every artifact card uses the same neutral image surface; source assets can vary.
export const CASE_COLLECTION_IMAGE_SURFACE_COLOR = '#D1D7E3';
// Single-preview disclosures use the same visual width across every case.
export const CASE_COLLECTION_SINGLE_PREVIEW_CARD_WIDTH = 389;

export type CaseCollectionContract = {
  sectionWidth: number;
  isScrollable: boolean;
  rowWidth?: number;
  peekWidth?: number;
  viewportMaxWidth?: number;
  viewportStyle?: {
    width: string;
  };
};

export function isScrollableCaseCollectionLayout(layoutType: CaseCollectionLayoutType) {
  return layoutType === 'three_cards_scroll';
}

export function getCaseCollectionCardWidth({
  layoutType,
  requestedWidth,
}: {
  layoutType: CaseCollectionLayoutType;
  requestedWidth: number;
}) {
  return layoutType === 'single_preview'
    ? CASE_COLLECTION_SINGLE_PREVIEW_CARD_WIDTH
    : requestedWidth;
}

export function getCaseCollectionContract({
  layoutType,
  rowWidth,
  peekWidth,
}: {
  layoutType: CaseCollectionLayoutType;
  rowWidth?: number;
  peekWidth?: number;
}): CaseCollectionContract {
  if (!isScrollableCaseCollectionLayout(layoutType)) {
    return {
      sectionWidth: CASE_COLLECTION_SECTION_WIDTH,
      isScrollable: false,
      rowWidth,
    };
  }

  const resolvedPeekWidth = peekWidth ?? CASE_COLLECTION_DEFAULT_PEEK_WIDTH;
  const viewportMaxWidth = CASE_COLLECTION_SECTION_WIDTH + resolvedPeekWidth;

  return {
    sectionWidth: CASE_COLLECTION_SECTION_WIDTH,
    isScrollable: true,
    rowWidth,
    peekWidth: resolvedPeekWidth,
    viewportMaxWidth,
    viewportStyle: {
      width: `min(${viewportMaxWidth}px, calc(100% + ${resolvedPeekWidth}px))`,
    },
  };
}
