import type { CaseCollectionLayoutType } from './types';
import type { WorkspaceLayoutMode } from './workspace-layout';

export const CASE_COLLECTION_SECTION_WIDTH = 798;
export const CASE_COLLECTION_DEFAULT_PEEK_WIDTH = 158;
// Every artifact card uses the same neutral image surface; source assets can vary.
export const CASE_COLLECTION_IMAGE_SURFACE_COLOR = '#D1D7E3';
// Single-preview disclosures use the same visual width across every case.
export const CASE_COLLECTION_SINGLE_PREVIEW_CARD_WIDTH = 389;
export const COMPACT_EVIDENCE_CARD_WIDTH = 280;
export const COMPACT_EVIDENCE_IMAGE_HEIGHT = 160;
export const COMPACT_SHOWCASE_CARD_WIDTH = 202;

export type CompactCollectionVariant = 'evidence' | 'showcase';

export type CaseCollectionContract = {
  sectionWidth: number;
  isScrollable: boolean;
  rowWidth?: number;
  peekWidth?: number;
};

export function isScrollableCaseCollectionLayout(layoutType: CaseCollectionLayoutType) {
  return layoutType === 'three_cards_scroll';
}

export function getCaseCollectionCardWidth({
  layoutType,
  requestedWidth,
  layoutMode = 'desktop',
  compactVariant = 'evidence',
}: {
  layoutType: CaseCollectionLayoutType;
  requestedWidth: number;
  layoutMode?: WorkspaceLayoutMode;
  compactVariant?: CompactCollectionVariant;
}) {
  if (layoutMode === 'compact') {
    return compactVariant === 'showcase'
      ? COMPACT_SHOWCASE_CARD_WIDTH
      : COMPACT_EVIDENCE_CARD_WIDTH;
  }

  return layoutType === 'single_preview'
    ? CASE_COLLECTION_SINGLE_PREVIEW_CARD_WIDTH
    : requestedWidth;
}

export function getCaseCollectionImageHeight(
  _layoutType: CaseCollectionLayoutType,
  layoutMode: WorkspaceLayoutMode = 'desktop',
  compactVariant: CompactCollectionVariant = 'evidence',
) {
  if (layoutMode === 'compact') {
    return compactVariant === 'showcase'
      ? COMPACT_SHOWCASE_CARD_WIDTH
      : COMPACT_EVIDENCE_IMAGE_HEIGHT;
  }

  return 224;
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
  return {
    sectionWidth: CASE_COLLECTION_SECTION_WIDTH,
    isScrollable: true,
    rowWidth,
    peekWidth: resolvedPeekWidth,
  };
}
