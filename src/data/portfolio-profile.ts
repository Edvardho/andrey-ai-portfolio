export const PORTFOLIO_CASE_ORDER = [
  'alfa-smart',
  'expenses-card-holders',
  'subscription-sharing',
  'siebel',
  'chatpoint',
  'ux-ui-wannabelike',
] as const;

export const portfolioProfile = {
  name: 'Андрей Макаревич',
  role: 'Product Designer',
  portrait: {
    src: '/profile/andrey-makarevich.png',
    focalPosition: '50% 18%',
  },
  experienceYears: 6,
  experienceLabel: '6 лет опыта',
  location: 'Санкт-Петербург',
  description:
    'Проектирую интерфейсы для финтеха, кибербезопасности и enterprise. Умею разобраться в сложной логике, упростить сценарий и довести до релиза.',
  tags: ['B2B / B2C', 'Финтех & Enterprise', 'Сложные B2B-продукты'],
  contact: {
    email: 'andrew.makarevitch@yandex.ru',
    telegram: 'https://t.me/Edvardho',
    linkedin: 'https://www.linkedin.com/in/edvardho/',
  },
  workHistory: [
    {
      period: 'Июнь 2024 — сейчас',
      compactPeriod: '2024 — сейчас',
      company: 'Positive Technologies',
      role: 'Продуктовый дизайнер · Киберполигон и багбаунти',
    },
    {
      period: 'Май 2023 — Июнь 2024',
      compactPeriod: '2023 — 2024',
      company: 'Альфа-Банк',
      role: 'Продуктовый дизайнер · Подписка и финтех',
    },
    {
      period: 'Апрель 2021 — Май 2023',
      compactPeriod: '2021 — 2023',
      company: 'MTS Digital',
      role: 'UX/UI дизайнер · CRM и коммуникации',
    },
  ],
  highlightMetrics: {
    alfaSubscriptions: '32 111 подписок за первый месяц',
    alfaRevenue: '1,1 млн ₽ выручки',
    mtsDialogTime: '900→580 секунд на диалог',
    mtsDialogVolume: '1000→2000 диалогов в обработке',
  },
} as const;
