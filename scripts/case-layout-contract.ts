import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  CASE_COLLECTION_DEFAULT_PEEK_WIDTH,
  CASE_COLLECTION_SECTION_WIDTH,
  getCaseCollectionContract,
} from '@/lib/portfolio/case-layout-contract';
import { portfolioContent } from '@/data/portfolio-content';
import type { ContentBlock } from '@/lib/portfolio/types';

function isThreeCardsEvidenceCase(
  block: ContentBlock,
): block is Extract<ContentBlock, { type: 'evidence_case' }> {
  return block.type === 'evidence_case' && block.case.layoutType === 'three_cards_scroll';
}

function assertScrollableContract({
  label,
  rowWidth,
  peekWidth,
}: {
  label: string;
  rowWidth: number;
  peekWidth: number;
}) {
  const contract = getCaseCollectionContract({
    layoutType: 'three_cards_scroll',
    rowWidth,
    peekWidth,
  });

  assert.equal(contract.sectionWidth, CASE_COLLECTION_SECTION_WIDTH, `${label}: section width must stay fixed`);
  assert.equal(contract.isScrollable, true, `${label}: contract must be scrollable`);
  assert.equal(contract.rowWidth, rowWidth, `${label}: row width must be preserved from data`);
  assert.equal(contract.peekWidth, peekWidth, `${label}: peek width must be preserved from data`);
  assert.equal(
    contract.viewportMaxWidth,
    CASE_COLLECTION_SECTION_WIDTH + peekWidth,
    `${label}: viewport max width must be section + peek`,
  );
  assert.equal(
    contract.viewportStyle?.width,
    `min(${CASE_COLLECTION_SECTION_WIDTH + peekWidth}px, calc(100% + ${peekWidth}px))`,
    `${label}: viewport style must expand only local viewport`,
  );
}

function main() {
  const fixedSingle = getCaseCollectionContract({ layoutType: 'single_preview' });
  assert.equal(fixedSingle.sectionWidth, CASE_COLLECTION_SECTION_WIDTH);
  assert.equal(fixedSingle.isScrollable, false);
  assert.equal(fixedSingle.viewportStyle, undefined);

  const fixedTwo = getCaseCollectionContract({ layoutType: 'two_cards', rowWidth: 798 });
  assert.equal(fixedTwo.sectionWidth, CASE_COLLECTION_SECTION_WIDTH);
  assert.equal(fixedTwo.isScrollable, false);
  assert.equal(fixedTwo.viewportStyle, undefined);

  const defaultScroll = getCaseCollectionContract({ layoutType: 'three_cards_scroll', rowWidth: 1009.333 });
  assert.equal(defaultScroll.peekWidth, CASE_COLLECTION_DEFAULT_PEEK_WIDTH);
  assert.equal(defaultScroll.viewportMaxWidth, CASE_COLLECTION_SECTION_WIDTH + CASE_COLLECTION_DEFAULT_PEEK_WIDTH);

  const alfaSummary = portfolioContent.cases['alfa-smart'].structuredSummary;
  assert.ok(alfaSummary, 'Alfa-Smart structured summary is required');
  const alfaDisclosure4 = alfaSummary.disclosures.find((item) => item.id === 'alfa-structured-delivery');
  assert.ok(alfaDisclosure4, 'Alfa-Smart disclosure 4 is required');
  assert.equal(alfaDisclosure4.layoutType, 'three_cards_scroll');
  assert.equal(alfaDisclosure4.rowWidth, 1207);
  assert.equal(alfaDisclosure4.peekWidth, 158);
  assertScrollableContract({
    label: 'Alfa-Smart disclosure 4',
    rowWidth: alfaDisclosure4.rowWidth!,
    peekWidth: alfaDisclosure4.peekWidth!,
  });

  assert.equal(alfaSummary.showcaseRowWidth, 1009.333);
  assert.equal(alfaSummary.showcasePeekWidth, 158);
  assertScrollableContract({
    label: 'Alfa-Smart showcase',
    rowWidth: alfaSummary.showcaseRowWidth!,
    peekWidth: alfaSummary.showcasePeekWidth!,
  });

  const chatpointSummary = portfolioContent.cases.chatpoint.structuredSummary;
  assert.ok(chatpointSummary, 'ChatPoint structured summary is required');
  const chatpointDisclosure4 = chatpointSummary.disclosures.find(
    (item) => item.id === 'chatpoint-structured-what-i-would-change',
  );
  assert.ok(chatpointDisclosure4, 'ChatPoint disclosure 4 is required');
  assert.equal(chatpointDisclosure4.layoutType, 'three_cards_scroll');
  assert.equal(chatpointDisclosure4.rowWidth, 1207);
  assert.equal(chatpointDisclosure4.peekWidth, 158);
  assertScrollableContract({
    label: 'ChatPoint disclosure 4',
    rowWidth: chatpointDisclosure4.rowWidth!,
    peekWidth: chatpointDisclosure4.peekWidth!,
  });

  assert.equal(chatpointSummary.showcaseRowWidth, 1009.333);
  assert.equal(chatpointSummary.showcasePeekWidth, 158);
  assertScrollableContract({
    label: 'ChatPoint showcase',
    rowWidth: chatpointSummary.showcaseRowWidth!,
    peekWidth: chatpointSummary.showcasePeekWidth!,
  });

  const evidenceIndex = portfolioContent.hiringGuides.evidenceIndex;
  const evidenceCase = evidenceIndex.contentBlocks.find(isThreeCardsEvidenceCase);
  assert.ok(evidenceCase, 'evidence_case proof block is required');
  assert.equal(evidenceCase.case.rowWidth, 766);
  assert.equal(evidenceCase.case.peekWidth, 158);
  assertScrollableContract({
    label: 'Evidence case',
    rowWidth: evidenceCase.case.rowWidth!,
    peekWidth: evidenceCase.case.peekWidth!,
  });

  const threadViewSource = readFileSync(
    '/Users/amakarevich/Desktop/My_Startap/.worktrees/ai-portfolio/src/components/portfolio-thread-view.tsx',
    'utf8',
  );
  assert.equal(threadViewSource.includes('peekWidth'), false, 'ThreadView must not know about peekWidth');
  assert.equal(threadViewSource.includes('rowWidth'), false, 'ThreadView must not know about rowWidth');
  assert.equal(
    threadViewSource.includes('PortfolioCaseCollection'),
    false,
    'ThreadView must not render CaseCollection directly',
  );

  console.log('Case layout contract passed.');
}

main();
