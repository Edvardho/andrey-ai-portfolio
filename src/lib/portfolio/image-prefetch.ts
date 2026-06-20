'use client';

const prefetchedImages = new Set<string>();

const caseImagePrefetchMap: Record<string, string[]> = {
  'alfa-smart': [
    '/cases/alfa-smart/rail.png',
    '/cases/alfa-smart/context.png',
    '/cases/alfa-smart/intro-preview.png',
  ],
  chatpoint: [
    '/cases/chatpoint/rail.png',
    '/cases/chatpoint/context.png',
    '/cases/chatpoint/intro-preview.png',
  ],
  siebel: [
    '/cases/siebel/rail.png',
    '/cases/siebel/context.png',
    '/cases/siebel/intro-preview.png',
  ],
  'expenses-card-holders': [
    '/cases/expenses-card-holders/rail.png',
    '/cases/expenses-card-holders/context.png',
    '/cases/expenses-card-holders/intro-preview.png',
  ],
  'subscription-sharing': [
    '/cases/subscription-sharing/rail.png',
    '/cases/subscription-sharing/context.png',
    '/cases/subscription-sharing/intro-preview.png',
  ],
  'ux-ui-wannabelike': [
    '/cases/ux-ui-wannabelike/rail.png',
    '/cases/ux-ui-wannabelike/context.png',
    '/cases/ux-ui-wannabelike/intro-preview.png',
  ],
  experience: [
    '/cases/experience/rail.png',
    '/cases/experience/intro-preview.png',
  ],
};

export function prefetchPortfolioCaseImages(caseId: string, limit = 3) {
  if (typeof window === 'undefined') {
    return;
  }

  for (const src of caseImagePrefetchMap[caseId]?.slice(0, limit) ?? []) {
    if (prefetchedImages.has(src)) {
      continue;
    }

    prefetchedImages.add(src);
    const image = new window.Image();
    image.decoding = 'async';
    image.src = src;
  }
}
