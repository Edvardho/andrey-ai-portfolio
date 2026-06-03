import type { PromptChip, SynthesisTopic } from '@/lib/portfolio/types';

type SynthesisTopicConfig = {
  topic: SynthesisTopic;
  title: string;
  facts: string[];
  fallbackTitle: string;
  fallbackParagraphs: string[];
  fallbackBullets: string[];
  chips: PromptChip[];
};

const sharedFacts = [
  'У Андрея 5+ лет опыта на стыке B2B и B2C.',
  'Его траектория включает MTS Digital, Альфа-Банк и Positive Technologies.',
  'Повторяющийся паттерн работы: research -> структура решения -> delivery до релиза.',
  'Он сильнее там, где нужно не просто нарисовать экран, а связать сценарий, ограничения, роли и метрики.',
];

const caseEvidence: Record<string, string[]> = {
  'alfa-smart': [
    'Альфа-Смарт — флагманский кейс с продуктовой логикой, тестированием, релизом и измеримым результатом.',
    'В кейсе зафиксированы конкретные метрики: 32 111 подписчиков, 30% владельцев с участниками, 1,1 млн ₽ дохода.',
    'Сценарий охватывал mobile, web и post-purchase управление участниками.',
  ],
  siebel: [
    'SIEBEL показывает зрелую продуктовую дисциплину: исследование операторов, гипотезы, A/B проверка MVP и цифры после внедрения.',
    'Изначально запрос звучал как редизайн, но Андрей перевел его в исследовательскую и workflow-задачу.',
    'После изменений сократилось время обработки диалога и выросло количество обрабатываемых диалогов.',
  ],
  chatpoint: [
    'ChatPoint — supporting anti-case про сложный B2B продукт без достаточного product focus.',
    'Сильная сторона кейса — не успех продукта, а понимание, почему delivery без проверки ценности приводит к закрытию продукта.',
    'Этот кейс доказывает product judgment и умение спорить за ценность, а не только за UI.',
  ],
};

const topicConfigs: Record<SynthesisTopic, SynthesisTopicConfig> = {
  strengths: {
    topic: 'strengths',
    title: 'Сильные стороны Андрея',
    facts: [
      ...sharedFacts,
      'Сильнее всего он выглядит в сочетании research, системного UX/UI и delivery-дисциплины.',
      'В его кейсах повторяются три сигнала: системное мышление, умение доводить до релиза и нормальный product judgment.',
      ...caseEvidence['alfa-smart'],
      ...caseEvidence.siebel,
    ],
    fallbackTitle: 'В чем у него сильный сигнал',
    fallbackParagraphs: [
      'Главная сила Андрея не в декоративном UI, а в сочетании исследовательской дисциплины, системного мышления и умения доводить решение до релиза.',
      'Флагманский сигнал дает Альфа-Смарт, а самый редкий для дизайнеров паттерн видно в SIEBEL: сначала исследование и гипотезы, потом решение, потом проверка на живом процессе.',
    ],
    fallbackBullets: [
      'research-driven подход',
      'системный UX/UI, а не локальные экраны',
      'delivery и работа до релиза',
      'product judgment, а не только craft',
    ],
    chips: [
      { id: 'facts-strengths-alfa', label: 'Покажи Альфа-Смарт', message: 'Покажи Альфа-Смарт' },
      { id: 'facts-strengths-siebel', label: 'Открыть SIEBEL', action: { type: 'open_case_summary', caseId: 'siebel' } },
      { id: 'facts-strengths-exp', label: 'Какой опыт работы?', message: 'Какой опыт работы?' },
    ],
  },
  decision_making: {
    topic: 'decision_making',
    title: 'Как Андрей принимает решения',
    facts: [
      ...sharedFacts,
      'Он не прыгает сразу в экраны: сначала раскладывает сценарий, роли, ограничения и гипотезы.',
      'В Альфа-Смарте сначала были требования, user flow и тестовые гипотезы, а не просто рисование интерфейсов.',
      'В SIEBEL он отказался от редизайна “по ощущениям” и начал с записей операторов и интервью.',
      'В ChatPoint ценность кейса в том, что он увидел, где продукт идет не туда, даже если фича визуально получалась удобной.',
    ],
    fallbackTitle: 'Как он обычно принимает решения',
    fallbackParagraphs: [
      'По кейсам видно, что Андрей не начинает с визуала. Он сначала разбирается, где реальная проблема, какие роли и ограничения у сценария и что именно нужно доказать до реализации.',
      'Лучший паттерн здесь — SIEBEL и Альфа-Смарт: сначала исследование и структура решения, потом гипотезы, затем delivery, а не наоборот.',
    ],
    fallbackBullets: [
      'сначала research и требования',
      'потом гипотезы и сценарии',
      'потом интерфейс и handoff',
      'если ценность не доказана, это отдельный сигнал, а не баг narrative',
    ],
    chips: [
      { id: 'facts-decisions-siebel', label: 'Открыть SIEBEL', action: { type: 'open_case_summary', caseId: 'siebel' } },
      { id: 'facts-decisions-alfa', label: 'Покажи Альфа-Смарт', message: 'Покажи Альфа-Смарт' },
      { id: 'facts-decisions-chatpoint', label: 'Открыть ChatPoint', action: { type: 'open_case_summary', caseId: 'chatpoint' } },
    ],
  },
  product_approach: {
    topic: 'product_approach',
    title: 'Какой у него продуктовый подход',
    facts: [
      ...sharedFacts,
      'Общий знаменатель кейсов — research -> решение -> релиз, а не просто визуальный refresh.',
      'В мобильных кейсах ценность чаще всего в ролях, ветвлениях, согласовании и логике сценария, а не в декоративных экранах.',
      'SIEBEL доказывает workflow-thinking и измеримость эффекта.',
      'Альфа-Смарт доказывает связку продуктовой логики, UX и метрик.',
    ],
    fallbackTitle: 'Какой у него продуктовый подход',
    fallbackParagraphs: [
      'У Андрея подход не “сделать красиво”, а довести решение до продуктового смысла: понять, где реальная проблема, какие ограничения у сценария и как это скажется на результате.',
      'Поэтому в сильных кейсах у него всегда видна связка research, структура решения, UX/UI и delivery, а не только финальные экраны.',
    ],
    fallbackBullets: [
      'workflow-first, а не screen-first',
      'гипотезы и проверка до разработки',
      'сильный handoff и delivery',
      'метрики и product signal важнее декоративности',
    ],
    chips: [
      { id: 'facts-approach-exp', label: 'Какой опыт работы?', message: 'Какой опыт работы?' },
      { id: 'facts-approach-mobile', label: 'Что он делал в мобилках?', message: 'Что делал в мобилке?' },
      { id: 'facts-approach-alfa', label: 'Покажи сильный кейс', message: 'Покажи сильный кейс' },
    ],
  },
  collaboration: {
    topic: 'collaboration',
    title: 'Как Андрей работает с командами',
    facts: [
      ...sharedFacts,
      'В мобильном кейсе про расходы держателей карт сильная часть — межкомандное согласование через подтвержденную пользовательскую потребность.',
      'В Альфа-Смарте он синхронизировал требования и границы MVP до начала лишней реализации.',
      'В SIEBEL он согласовывал проблемы и гипотезы с продактами и бизнесом, а потом проверял решение на операторах.',
    ],
    fallbackTitle: 'Как он работает с командами',
    fallbackParagraphs: [
      'По кейсам видно, что Андрей не замыкается в craft. Он много работает на стыке продактов, бизнеса, разработки и реальных пользователей.',
      'Особенно сильный сигнал здесь дают кейсы, где нужно было сначала договориться о проблеме и только потом о решении — например, расходы держателей карт и SIEBEL.',
    ],
    fallbackBullets: [
      'умеет синхронизировать требования и границы MVP',
      'работает через исследование, а не через мнение громкого стейкхолдера',
      'умеет вести сложные межкомандные сценарии',
    ],
    chips: [
      { id: 'facts-collab-mobile', label: 'Покажи мобильные кейсы', message: 'Что делал в мобилке?' },
      { id: 'facts-collab-siebel', label: 'Открыть SIEBEL', action: { type: 'open_case_summary', caseId: 'siebel' } },
      { id: 'facts-collab-contact', label: 'Связаться с Андреем', action: { type: 'open_contact_modal', source: 'facts' } },
    ],
  },
  fit: {
    topic: 'fit',
    title: 'Почему здесь есть что смотреть',
    facts: [
      ...sharedFacts,
      'Альфа-Смарт дает флагманский продуктовый сигнал с метриками.',
      'SIEBEL дает редкую для дизайнеров связку research, workflow-redesign и измеримого результата.',
      'ChatPoint дает anti-case и product judgment вместо вымышленного success story.',
      'Mobile cases показывают ширину: сценарии, ветвления, роли и межкомандные зависимости.',
    ],
    fallbackTitle: 'Почему это портфолио может быть полезно',
    fallbackParagraphs: [
      'Здесь есть не только один сильный флагманский кейс, но и ширина сигнала: мобильные сценарии, enterprise workflows и anti-case, который показывает product judgment вместо рекламной легенды.',
      'Именно эта комбинация делает портфолио сильнее обычной подборки “красивых экранов”: видно, как Андрей исследует, принимает решения, доводит до релиза и делает выводы из неидеальных продуктов.',
    ],
    fallbackBullets: [
      'флагман с метриками',
      'enterprise кейс с research и rollout',
      'anti-case с честным выводом',
      'ширина мобильной работы',
    ],
    chips: [
      { id: 'facts-fit-alfa', label: 'Покажи сильный кейс', message: 'Покажи сильный кейс' },
      { id: 'facts-fit-more', label: 'Открыть дополнительные кейсы', action: { type: 'open_additional_cases_overview' } },
      { id: 'facts-fit-contact', label: 'Связаться с Андреем', action: { type: 'open_contact_modal', source: 'facts' } },
    ],
  },
};

export function getSynthesisTopicConfig(topic: SynthesisTopic): SynthesisTopicConfig {
  return topicConfigs[topic];
}

export function getPortfolioFacts(topic: SynthesisTopic): string[] {
  return topicConfigs[topic].facts;
}

export function getContextualCaseFacts(caseId: string | null): string[] {
  if (!caseId) {
    return [];
  }

  return caseEvidence[caseId] ?? [];
}
