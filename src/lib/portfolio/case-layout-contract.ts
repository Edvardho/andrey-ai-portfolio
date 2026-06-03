import type { CaseCollectionLayoutType } from './types';

export const CASE_COLLECTION_SECTION_WIDTH = 798;
export const CASE_COLLECTION_DEFAULT_PEEK_WIDTH = 158;

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
