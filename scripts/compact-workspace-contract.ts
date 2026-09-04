import assert from 'node:assert/strict';

import {
  COMPACT_PROJECT_ORDER,
  getWorkspaceLayoutMode,
} from '@/lib/portfolio/workspace-layout';
import {
  COMPACT_EVIDENCE_CARD_WIDTH,
  COMPACT_EVIDENCE_IMAGE_HEIGHT,
  COMPACT_SHOWCASE_CARD_WIDTH,
  getCaseCollectionCardWidth,
  getCaseCollectionImageHeight,
} from '@/lib/portfolio/case-layout-contract';
import { getCompactProjectNavItems } from '@/data/portfolio-compact-navigation';
import { getRailItems } from '@/data/portfolio-index';
import { portfolioProfile } from '@/data/portfolio-profile';

assert.equal(getWorkspaceLayoutMode(0), 'compact');
assert.equal(getWorkspaceLayoutMode(375), 'compact');
assert.equal(getWorkspaceLayoutMode(1279), 'compact');
assert.equal(getWorkspaceLayoutMode(1280), 'desktop');

const navItems = getCompactProjectNavItems(getRailItems());
assert.deepEqual(navItems.map((item) => item.id), [...COMPACT_PROJECT_ORDER, 'experience']);
assert.equal(navItems.length, 7);
assert.ok(navItems.filter((item) => item.kind === 'case').every((item) => item.thumbnailSrc.startsWith('/cases/')));
assert.equal(navItems.find((item) => item.id === 'experience')?.thumbnailSrc, portfolioProfile.portrait.src);
assert.equal(navItems.find((item) => item.id === 'experience')?.headerSubtitle, 'Где работал и какие были результаты');
assert.equal(navItems.find((item) => item.id === 'chatpoint')?.label, 'ChatPoint');
assert.equal(navItems.find((item) => item.id === 'alfa-smart')?.headerSubtitle, 'Кейс семейной подписки');
assert.equal(navItems.find((item) => item.id === 'ux-ui-wannabelike')?.headerSubtitle, 'Учебный кейс по UI');
assert.equal(
  getCaseCollectionCardWidth({
    layoutType: 'single_preview',
    requestedWidth: 389,
    layoutMode: 'compact',
  }),
  COMPACT_EVIDENCE_CARD_WIDTH,
);
assert.equal(
  getCaseCollectionCardWidth({
    layoutType: 'three_cards_scroll',
    requestedWidth: 320,
    layoutMode: 'compact',
    compactVariant: 'showcase',
  }),
  COMPACT_SHOWCASE_CARD_WIDTH,
);
assert.equal(
  getCaseCollectionCardWidth({
    layoutType: 'three_cards_scroll',
    requestedWidth: 320,
    layoutMode: 'compact',
    compactVariant: 'evidence',
  }),
  COMPACT_EVIDENCE_CARD_WIDTH,
);
assert.equal(getCaseCollectionImageHeight('single_preview', 'compact'), COMPACT_EVIDENCE_IMAGE_HEIGHT);
assert.equal(getCaseCollectionImageHeight('three_cards_scroll', 'compact', 'showcase'), COMPACT_SHOWCASE_CARD_WIDTH);

console.log('Compact workspace contract passed.');
