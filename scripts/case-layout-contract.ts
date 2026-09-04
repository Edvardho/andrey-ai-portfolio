import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  CASE_COLLECTION_DEFAULT_PEEK_WIDTH,
  CASE_COLLECTION_SECTION_WIDTH,
  getCaseCollectionContract,
} from '@/lib/portfolio/case-layout-contract';
import { portfolioContent } from '@/data/portfolio-content.server';
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
  assert.equal('viewportMaxWidth' in contract, false, `${label}: scroll viewport must not exceed its real column`);
  assert.equal('viewportStyle' in contract, false, `${label}: scroll viewport width must be owned by its parent column`);
}

function main() {
  const fixedSingle = getCaseCollectionContract({ layoutType: 'single_preview' });
  assert.equal(fixedSingle.sectionWidth, CASE_COLLECTION_SECTION_WIDTH);
  assert.equal(fixedSingle.isScrollable, false);
  assert.equal('viewportStyle' in fixedSingle, false);

  const fixedTwo = getCaseCollectionContract({ layoutType: 'two_cards', rowWidth: 798 });
  assert.equal(fixedTwo.sectionWidth, CASE_COLLECTION_SECTION_WIDTH);
  assert.equal(fixedTwo.isScrollable, false);
  assert.equal('viewportStyle' in fixedTwo, false);

  const defaultScroll = getCaseCollectionContract({ layoutType: 'three_cards_scroll', rowWidth: 1009.333 });
  assert.equal(defaultScroll.peekWidth, CASE_COLLECTION_DEFAULT_PEEK_WIDTH);
  assert.equal('viewportMaxWidth' in defaultScroll, false);

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

  const expensesSummary = portfolioContent.cases['expenses-card-holders'].structuredSummary;
  assert.ok(expensesSummary, 'Expenses structured summary is required');
  assert.equal(expensesSummary.showcaseRowWidth, 1009.333);
  assert.equal(expensesSummary.showcasePeekWidth, 158);
  assertScrollableContract({
    label: 'Expenses showcase',
    rowWidth: expensesSummary.showcaseRowWidth!,
    peekWidth: expensesSummary.showcasePeekWidth!,
  });

  const sharingSummary = portfolioContent.cases['subscription-sharing'].structuredSummary;
  assert.ok(sharingSummary, 'Subscription Sharing structured summary is required');
  assert.equal(sharingSummary.showcaseRowWidth, 798);
  assert.equal(sharingSummary.showcasePeekWidth, 158);
  assertScrollableContract({
    label: 'Subscription Sharing showcase',
    rowWidth: sharingSummary.showcaseRowWidth!,
    peekWidth: sharingSummary.showcasePeekWidth!,
  });

  const wannabelikeSummary = portfolioContent.cases['ux-ui-wannabelike'].structuredSummary;
  assert.ok(wannabelikeSummary, 'UX/UI WannabeLike structured summary is required');
  const wannabelikeDisclosure3 = wannabelikeSummary.disclosures.find(
    (item) => item.id === 'wannabelike-structured-ui-concept',
  );
  assert.ok(wannabelikeDisclosure3, 'UX/UI WannabeLike disclosure 3 is required');
  assert.equal(wannabelikeDisclosure3.layoutType, 'three_cards_scroll');
  assert.equal(wannabelikeDisclosure3.rowWidth, 1207);
  assert.equal(wannabelikeDisclosure3.peekWidth, 158);
  assertScrollableContract({
    label: 'UX/UI WannabeLike disclosure 3',
    rowWidth: wannabelikeDisclosure3.rowWidth!,
    peekWidth: wannabelikeDisclosure3.peekWidth!,
  });

  assert.equal(wannabelikeSummary.showcaseRowWidth, 1009.333);
  assert.equal(wannabelikeSummary.showcasePeekWidth, 158);
  assertScrollableContract({
    label: 'UX/UI WannabeLike showcase',
    rowWidth: wannabelikeSummary.showcaseRowWidth!,
    peekWidth: wannabelikeSummary.showcasePeekWidth!,
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

  const collectionSource = readFileSync(
    '/Users/amakarevich/Desktop/My_Startap/.worktrees/ai-portfolio/src/components/portfolio-case-collection.tsx',
    'utf8',
  );
  assert.ok(
    collectionSource.includes('inline-block w-max pr-4'),
    'Scrollable case collections must reserve a real trailing 16px scroll spacer',
  );
  assert.equal(
    collectionSource.includes('contract.viewportStyle'),
    false,
    'Scrollable case collections must not escape the width of their actual parent column',
  );
  assert.ok(
    collectionSource.includes('{ minWidth: `${contract.rowWidth}px` }'),
    'The declared row width must be a minimum, so artifact cards can never overflow past the scroll range',
  );
  assert.equal(
    collectionSource.includes('{ width: `${contract.rowWidth}px` }'),
    false,
    'A fixed row width can clip the last artifact from the horizontal scroll range',
  );

  const globalStyles = readFileSync(
    '/Users/amakarevich/Desktop/My_Startap/.worktrees/ai-portfolio/src/app/globals.css',
    'utf8',
  );
  assert.equal(
    globalStyles.includes('width: calc(100% + 24px) !important'),
    false,
    'Desktop styles must not re-expand the artifact scroll viewport outside the chat column',
  );
  assert.equal(
    globalStyles.includes('.portfolio-case-collection-scroll-content {\n    padding-right: 0;'),
    false,
    'Desktop styles must keep the trailing scroll spacer intact',
  );

  console.log('Case layout contract passed.');
}

main();
