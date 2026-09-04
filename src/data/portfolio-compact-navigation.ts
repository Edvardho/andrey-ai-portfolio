import type { RailItem } from '@/lib/portfolio/types';
import { COMPACT_PROJECT_ORDER } from '@/lib/portfolio/workspace-layout';
import { portfolioProfile } from './portfolio-profile';

export type CompactProjectNavItem = Omit<RailItem, 'kind'> & {
  kind: 'case' | 'experience';
  headerSubtitle: string;
  thumbnailSrc: string;
};

const compactHeaderSubtitles: Record<(typeof COMPACT_PROJECT_ORDER)[number], string> = {
  'alfa-smart': 'Кейс семейной подписки',
  'chatpoint': 'Платформа для коммуникации',
  'siebel': 'CRM для службы поддержки',
  'expenses-card-holders': 'Кейс доп. держателей карт',
  'subscription-sharing': 'Кейс семейного шеринга',
  'ux-ui-wannabelike': 'Учебный кейс по UI',
};

export function getCompactProjectNavItems(railItems: RailItem[]): CompactProjectNavItem[] {
  const railById = new Map(
    railItems
      .filter((item): item is RailItem & { kind: 'case' } => item.kind === 'case')
      .map((item) => [item.id, item]),
  );
  const caseItems = COMPACT_PROJECT_ORDER.flatMap((id) => {
    const railItem = railById.get(id);

    if (!railItem) {
      return [];
    }

    return [{
      ...railItem,
      kind: 'case' as const,
      headerSubtitle: compactHeaderSubtitles[id],
      thumbnailSrc: `/cases/${id}/entry.png`,
    }];
  });

  const experienceItem = railItems.find((item) => item.kind === 'experience');
  if (!experienceItem) {
    return caseItems;
  }

  return [
    ...caseItems,
    {
      ...experienceItem,
      kind: 'experience' as const,
      headerSubtitle: 'Где работал и какие были результаты',
      thumbnailSrc: portfolioProfile.portrait.src,
    },
  ];
}
