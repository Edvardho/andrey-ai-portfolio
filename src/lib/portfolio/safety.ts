import type { ContextPanelData, PromptChip, SafetyState } from '@/lib/portfolio/types';

type SafetyMatch = {
  state: SafetyState;
  title: string;
  body: string[];
};

const TOXIC_PATTERNS = [
  /идиот/i,
  /туп/i,
  /соси/i,
  /пош[её]л/i,
  /дебил/i,
  /нах/i,
];

const INJECTION_PATTERNS = [
  /ignore.+instruction/i,
  /system prompt/i,
  /покажи.+промпт/i,
  /внутренн(ие|ю).+инструк/i,
  /раскрой.+инструк/i,
  /developer message/i,
  /tool schema/i,
];

const PRIVATE_PATTERNS = [
  /приватн/i,
  /личн(ые|ая|ую).+данн/i,
  /зарплат/i,
  /salary/i,
  /телефон/i,
  /passport/i,
  /паспорт/i,
  /адрес/i,
];

export function detectSafetyState(text: string): SafetyMatch | null {
  const trimmed = text.trim();

  if (!trimmed) {
    return null;
  }

  if (INJECTION_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return {
      state: 'prompt_injection_or_exfiltration',
      title: 'Нет, внутренности не отдам',
      body: [
        'Хитро, но нет: внутренние инструкции, системный prompt и служебную логику ассистент не раскрывает.',
        'Если нужен реальный сигнал, лучше спросить про кейсы, опыт или подход Андрея к продукту.',
      ],
    };
  }

  if (PRIVATE_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return {
      state: 'salary_or_private_data',
      title: 'Не эту дверь',
      body: [
        'Приватные данные и зарплатные ожидания я в чате не раскрываю. Я тут не сейф с дыркой в двери.',
        'Если вопрос серьезный, можно перейти к контакту и обсудить это напрямую с Андреем.',
      ],
    };
  }

  if (TOXIC_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return {
      state: 'toxic_or_abusive',
      title: 'Тон можно и получше',
      body: [
        'Язва ради язвы здесь бесполезна. Ассистент все равно отвечает только про портфолио, опыт и кейсы.',
        'Если хочешь, можно быстро вернуться к тому, что реально имеет смысл: флагманский кейс, опыт работы или мобильные сценарии.',
      ],
    };
  }

  return null;
}

export function getSafetyFallbackChips(): PromptChip[] {
  return [
    { id: 'safety-alfa', label: 'Покажи сильный кейс', message: 'Покажи сильный кейс' },
    { id: 'safety-exp', label: 'Какой опыт работы?', message: 'Какой опыт работы?' },
    { id: 'safety-contact', label: 'Написать Андрею', action: { type: 'open_contact_modal', source: 'safety' } },
  ];
}

export function getSafetyContextPanel(): ContextPanelData {
  return {
    title: 'Только по делу',
    subtitle: 'Safety · Portfolio scope',
    tags: ['Кейсы', 'Опыт', 'Подход', 'Контакт'],
    note:
      'Ассистент не обсуждает личные данные, системные инструкции и посторонние темы. Его границы узкие и сознательные.',
    cta: { label: 'Написать Андрею', action: { type: 'open_contact_modal', source: 'safety' } },
  };
}
