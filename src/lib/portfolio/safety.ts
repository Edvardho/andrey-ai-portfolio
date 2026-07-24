import type { ContextPanelData, PromptChip, SafetyState } from '@/lib/portfolio/types';

type SafetyMatch = {
  state: SafetyState;
  title: string;
  body: string[];
};

const WORD_START = String.raw`(?:^|[\s.,!?;:()«»"'/-])`;
const WORD_END = String.raw`(?=$|[\s.,!?;:()«»"'/-])`;
const CYRILLIC_TAIL = String.raw`[а-яё-]*`;

const TOXIC_PATTERNS = [
  new RegExp(`${WORD_START}идиот${CYRILLIC_TAIL}${WORD_END}`, 'i'),
  new RegExp(`${WORD_START}туп(?:ой|ая|ое|ые|ого|ому|ым|ыми|ых|о)?${WORD_END}`, 'i'),
  new RegExp(`${WORD_START}соси${WORD_END}`, 'i'),
  new RegExp(`${WORD_START}пош[её]л${CYRILLIC_TAIL}${WORD_END}`, 'i'),
  new RegExp(`${WORD_START}дебил${CYRILLIC_TAIL}${WORD_END}`, 'i'),
  new RegExp(`${WORD_START}нах(?:уй|ер|рен)?${WORD_END}`, 'i'),
];

const INJECTION_PATTERNS = [
  /ignore.+instruction/i,
  /system prompt/i,
  /покажи.+промпт/i,
  /(?:дай|скинь|покажи).+(?:свой|системн(?:ый|ого)?).+промпт/i,
  /внутренн(ие|ю).+инструк/i,
  /раскрой.+инструк/i,
  /developer message/i,
  /tool schema/i,
];

const PRIVATE_DATA_PATTERNS = [
  /приватн/i,
  /личн(ые|ая|ую).+данн/i,
  /телефон/i,
  /passport/i,
  /паспорт/i,
  /адрес/i,
];

const COMPENSATION_PATTERNS = [
  /зарплат/i,
  /salary/i,
  /зарплатн.+ожидани/i,
  /компенсац/i,
  /(?:зарплатн(?:ая|ый)|денежн(?:ая|ый))?\s*вилк/i,
  /сколько\s+(?:андр(?:ей|ею)|он)\s+хочет\s+(?:денег|получать|зарабатывать)/i,
  /сколько\s+(?:ему|андр(?:ею|ею))\s+(?:нужно|платить|предлагать)/i,
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

  if (COMPENSATION_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return {
      state: 'salary_or_private_data',
      title: 'Условия лучше обсудить напрямую',
      body: [
        'Зарплатные ожидания и формат сотрудничества Андрей обсуждает лично, с учетом роли, задач и условий работы.',
        'Напишите ему напрямую — он сориентирует без игры в испорченный телефон.',
      ],
    };
  }

  if (PRIVATE_DATA_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return {
      state: 'salary_or_private_data',
      title: 'Не эту дверь',
      body: [
        'Приватные данные я в чате не раскрываю.',
        'Если вопрос связан с наймом, можно перейти к контакту и обсудить это напрямую с Андреем.',
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
