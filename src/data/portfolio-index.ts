import type { ContactContent, EntryContent, PromptChip, RailItem } from '@/lib/portfolio/types';

export const railItems: RailItem[] = [
  { id: 'alfa-smart', label: 'Альфа-Смарт', subtitle: 'Подписка на банковские продукты', kind: 'case' },
  { id: 'siebel', label: 'SIEBEL', subtitle: 'CRM для службы поддержки', kind: 'case' },
  { id: 'expenses-card-holders', label: 'Расходы держателей', subtitle: 'Добавление точки входа', kind: 'case' },
  { id: 'subscription-sharing', label: 'Шаринг подписки', subtitle: 'Улучшение флоу добавления участников', kind: 'case' },
  { id: 'chatpoint', label: 'ChatPoint', subtitle: 'Платформа для коммуникации', kind: 'case' },
  { id: 'ux-ui-wannabelike', label: 'UX/UI WannabeLike', subtitle: 'Прохождение курса Миши Розова по UI', kind: 'case' },
  { id: 'experience', label: 'Опыт работы', subtitle: 'Где работал Андрей и какие были результаты', kind: 'experience' },
];

export const contactOptions: ContactContent = {
  title: 'Выберите удобный способ связи с Андреем',
  helper: '',
  options: [
    {
      id: 'telegram',
      label: 'Написать в Telegram',
      helper: 'Ответит в течении 1 минуты',
      href: 'https://t.me/Edvardho',
    },
    {
      id: 'linkedin',
      label: 'Написать в LinkedIn',
      helper: 'Ответит в течении дня, лучше пиши в Telegram',
      href: 'https://www.linkedin.com/in/edvardho/',
    },
  ],
};

export const entry: EntryContent = {
  title: 'Портфолио Андрея Макаревича',
  subtitle:
    'ИИ-ассистент отвечает только про опыт, кейсы, подход к продукту и то, как Андрей принимает решения.',
  quickPrompts: [
    { id: 'entry-experience', label: 'Какой опыт работы?', message: 'Какой опыт работы?' },
    { id: 'entry-mobile', label: 'Делал мобильный интерфейс?', message: 'Что делал в мобилке?' },
    { id: 'entry-strongest', label: 'Покажи сильный кейс', message: 'Покажи сильный кейс' },
    { id: 'entry-failures', label: 'Расскажи о неудачах', message: 'Какие есть ограничения?' },
  ],
  railItems,
  contextPanel: {
    title: 'Стартовая точка',
    subtitle: 'Desktop · AI portfolio',
    tags: ['RU-only', 'Desktop-first', 'Portfolio assistant'],
    note:
      'В V1 ассистент не пытается быть универсальным чат-ботом. Его задача уже: опыт, кейсы, доказательства и быстрый выход на связь.',
    cta: { label: 'Связаться с Андреем', action: { type: 'open_contact_modal', source: 'entry' } },
  },
};

export const CASE_IDS = [
  'alfa-smart',
  'siebel',
  'expenses-card-holders',
  'subscription-sharing',
  'chatpoint',
  'ux-ui-wannabelike',
] as const;

export type CaseId = (typeof CASE_IDS)[number];

const caseIdSet = new Set<string>(CASE_IDS);

export function isCaseId(value: string): value is CaseId {
  return caseIdSet.has(value);
}

export function getRailItems(): RailItem[] {
  return railItems;
}

export function getEntryPrompts(): PromptChip[] {
  return entry.quickPrompts;
}

export function getContactContent(): ContactContent {
  return contactOptions;
}
