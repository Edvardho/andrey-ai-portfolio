import { getCaseFactPack } from '@/data/portfolio-case-facts';
import type { CaseFactPack, PromptChip, QuestionSubject, SynthesisTopic } from '@/lib/portfolio/types';

type SynthesisTopicConfig = {
  topic: SynthesisTopic;
  title: string;
  facts: string[];
  subjectFacts?: Partial<Record<QuestionSubject, string[]>>;
  fallbackTitle: string;
  fallbackParagraphs: string[];
  fallbackBullets: string[];
  chips: PromptChip[];
};

const sharedFacts = [
  'У Андрея 5+ лет опыта на стыке B2B и B2C.',
  'Его траектория включает MTS Digital, Альфа-Банк и Positive Technologies.',
  'В его портфолио есть кейсы в финтехе, B2B-платформах, операторских системах, мобильных сценариях и кибербезопасности.',
  'В большинстве проектов Андрей проходил путь от исследования и структуры сценария до передачи решения в разработку или релиза.',
  'В Positive Technologies часть интерфейсов проектировалась с помощью готовой дизайн-системы, а также поддерживался UI-kit, в который Андрей вносил правки.',
];

function unique(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function caseAtomicFacts(
  pack: CaseFactPack,
  options: {
    includeTakeaway?: boolean;
    includeProof?: boolean;
    includeOutcomes?: boolean;
  } = {},
): string[] {
  return unique([
    ...pack.overview.slice(0, 2),
    ...pack.role.slice(0, 1),
    ...pack.decisions.slice(0, 1),
    ...pack.whatThisProves.slice(0, 1),
    ...(options.includeTakeaway ? pack.recruiterTakeaway.slice(0, 1) : []),
    ...(options.includeProof ? pack.evidence.slice(0, 1) : []),
    ...(options.includeOutcomes ? pack.outcomes.slice(0, 1) : []),
  ]);
}

function requireCase(caseId: string) {
  const pack = getCaseFactPack(caseId);
  if (!pack) {
    throw new Error(`Missing CaseFactPack for ${caseId}`);
  }
  return pack;
}

const alfa = requireCase('alfa-smart');
const siebel = requireCase('siebel');
const chatpoint = requireCase('chatpoint');
const expenses = requireCase('expenses-card-holders');
const sharing = requireCase('subscription-sharing');
const wannabelike = requireCase('ux-ui-wannabelike');

const topicConfigs: Record<SynthesisTopic, SynthesisTopicConfig> = {
  identity: {
    topic: 'identity',
    title: 'Кто такой Андрей',
    facts: unique([
      ...sharedFacts,
      'Андрей — продуктовый дизайнер с опытом в MTS Digital, Альфа-Банке и Positive Technologies.',
      ...caseAtomicFacts(alfa, { includeTakeaway: true, includeOutcomes: true }),
      ...caseAtomicFacts(siebel, { includeTakeaway: true, includeOutcomes: true }),
      ...caseAtomicFacts(wannabelike, { includeTakeaway: true }),
    ]),
    fallbackTitle: 'Кто такой Андрей',
    fallbackParagraphs: [
      'Андрей — продуктовый дизайнер с 5+ годами опыта на стыке B2B и B2C. Он работал в MTS Digital, Альфа-Банке и Positive Technologies и занимался не только интерфейсами, но и исследованием, сценариями и запуском решений.',
      'Если коротко, его сильная сторона не в декоративном UI, а в умении разобраться в задаче, собрать рабочий сценарий и довести решение до релиза.',
    ],
    fallbackBullets: [],
    chips: [
      { id: 'facts-identity-exp', label: 'Какой у него опыт работы?', message: 'Какой у него опыт работы?' },
      { id: 'facts-identity-alfa', label: 'Покажи сильный кейс', message: 'Покажи сильный кейс' },
      { id: 'facts-identity-risks', label: 'Какие у него ограничения?', message: 'Какие у него ограничения?' },
    ],
  },
  experience: {
    topic: 'experience',
    title: 'Опыт работы Андрея',
    facts: unique([
      ...sharedFacts,
      'Андрей работал продуктовым дизайнером в MTS Digital, Альфа-Банке и Positive Technologies.',
      ...caseAtomicFacts(alfa, { includeOutcomes: true }),
      ...caseAtomicFacts(siebel, { includeOutcomes: true }),
      ...caseAtomicFacts(chatpoint, { includeTakeaway: true }),
    ]),
    fallbackTitle: 'Какой у него опыт работы',
    fallbackParagraphs: [
      'Андрей работал 5+ лет продуктовым дизайнером в MTS Digital, Альфа-Банке и Positive Technologies. Это опыт в B2B и B2C продуктах со сложными сценариями: банковские сервисы, операторские workflow и мобильные пользовательские пути.',
      'По этому опыту видно, что он умеет не только собирать интерфейс, но и разбираться в логике продукта, ограничениях и том, как решение дойдет до релиза.',
    ],
    fallbackBullets: [],
    chips: [
      { id: 'facts-exp-open', label: 'Открыть опыт работы', action: { type: 'open_experience_summary' } },
      { id: 'facts-exp-alfa', label: 'Покажи сильный кейс', message: 'Покажи сильный кейс' },
      { id: 'facts-exp-mobile', label: 'Что делал в мобилке?', message: 'Что делал в мобилке?' },
    ],
  },
  mobile: {
    topic: 'mobile',
    title: 'Мобильный опыт Андрея',
    facts: unique([
      ...sharedFacts,
      ...caseAtomicFacts(expenses, { includeTakeaway: true }),
      ...caseAtomicFacts(sharing, { includeTakeaway: true }),
      ...caseAtomicFacts(wannabelike, { includeTakeaway: true }),
      ...caseAtomicFacts(alfa, { includeTakeaway: true }),
    ]),
    fallbackTitle: 'Что он делал в мобилке',
    fallbackParagraphs: [
      'В мобильных кейсах Андрей работал не только над экранами. Там видны исследование, разветвленные сценарии, межкомандные зависимости и продуктовая логика на стыке приложения и бизнес-правил.',
      'Помимо Альфа-Смарта, это хорошо видно в кейсах про расходы держателей, шаринг подписки и UX/UI WannabeLike.',
    ],
    fallbackBullets: [],
    chips: [
      { id: 'facts-mobile-open', label: 'Открыть мобильные кейсы', action: { type: 'open_mobile_experience_overview' } },
      { id: 'facts-mobile-alfa', label: 'Покажи Альфа-Смарт', message: 'Покажи Альфа-Смарт' },
      { id: 'facts-mobile-risks', label: 'Какие есть ограничения?', message: 'Какие есть ограничения?' },
    ],
  },
  portfolio_overview: {
    topic: 'portfolio_overview',
    title: 'Краткий обзор Андрея и его кейсов',
    facts: unique([
      ...sharedFacts,
      'Андрей работал продуктовым дизайнером в MTS Digital, Альфа-Банке и Positive Technologies.',
      ...caseAtomicFacts(alfa, { includeTakeaway: true, includeProof: true, includeOutcomes: true }),
      ...caseAtomicFacts(siebel, { includeTakeaway: true, includeProof: true, includeOutcomes: true }),
      ...caseAtomicFacts(chatpoint, { includeTakeaway: true, includeProof: true }),
      ...caseAtomicFacts(expenses, { includeTakeaway: true }),
      ...caseAtomicFacts(sharing, { includeTakeaway: true }),
      ...caseAtomicFacts(wannabelike, { includeTakeaway: true }),
    ]),
    fallbackTitle: 'Кратко про Андрея и его кейсы',
    fallbackParagraphs: [
      'Если сжать опыт Андрея в одну мысль: он не дизайнер «про красивые экраны». Он дизайнер для сложных продуктов, где нужно сначала разобраться в логике, ролях, сценариях и ограничениях, а потом превратить это в понятный интерфейс.',
      'У него есть кейсы в финтехе, B2B, операторских системах и мобильных сценариях. Где-то результат подтверждается запуском и метриками, где-то — сокращением времени работы, а где-то честным выводом, почему продукт не сработал.',
      '**Альфа-Смарт** — запуск семейной подписки в мобильном банке. Андрей проектировал сценарии управления подпиской, выгоды, тарифы и семейные механики. Подтверждение — макеты, гипотезы, запуск и продуктовые метрики.',
      '**SIEBEL** — сложный операторский workflow. Андрей разбирал реальный процесс, убирал лишние шаги и проектировал интерфейс под работу операторов. Подтверждение — исследование, user flow и метрики до/после.',
      '**ChatPoint** — ранний B2B-продукт, который в итоге закрыли. Ценность кейса в том, что он показывает не успех, а честный вывод: спрос и PMF нужно проверять раньше. Подтверждение — сценарии onboarding и routing, продуктовая логика и выводы после закрытия.',
      '**Mobile cases** — компактные пользовательские сценарии с ограничениями, состояниями и согласованиями. Они показывают ширину опыта: Андрей умеет работать не только с тяжелыми B2B-интерфейсами, но и с мобильными пользовательскими путями.',
    ],
    fallbackBullets: [],
    chips: [
      { id: 'facts-overview-exp', label: 'Открыть опыт работы', action: { type: 'open_experience_summary' } },
      { id: 'facts-overview-alfa', label: 'Покажи Альфа-Смарт', message: 'Покажи Альфа-Смарт' },
      { id: 'facts-overview-chatpoint', label: 'Расскажи про ChatPoint', message: 'Расскажи про ChatPoint' },
    ],
  },
  portfolio_value: {
    topic: 'portfolio_value',
    title: 'Почему это портфолио стоит смотреть',
    facts: unique([
      ...sharedFacts,
      'В портфолио есть сильный запущенный кейс с метриками.',
      'В портфолио есть workflow/research кейс с измеримым эффектом.',
      'В портфолио есть честный слабый кейс, по которому видно не только успех, но и границы кандидата.',
      'В портфолио есть mobile breadth beyond one flagship case.',
      ...caseAtomicFacts(alfa, { includeTakeaway: true, includeOutcomes: true, includeProof: true }),
      ...caseAtomicFacts(siebel, { includeTakeaway: true, includeOutcomes: true, includeProof: true }),
      ...caseAtomicFacts(chatpoint, { includeTakeaway: true, includeProof: true }),
      ...caseAtomicFacts(expenses, { includeTakeaway: true }),
      ...caseAtomicFacts(sharing, { includeTakeaway: true }),
      ...caseAtomicFacts(wannabelike, { includeTakeaway: true }),
    ]),
    subjectFacts: {
      candidate_portfolio_value: unique([
        'В этом портфолио есть не один тип кейса, а набор разных доказательств для оценки кандидата.',
        'Альфа-Смарт показывает запуск и метрики.',
        'SIEBEL показывает workflow, исследование и измеримый эффект.',
        'ChatPoint показывает честный слабый кейс и границы кандидата.',
        'Mobile cases показывают ширину опыта beyond one flagship case.',
      ]),
      ai_format_value: unique([
        'Такой формат позволяет не читать все подряд и не собирать вывод о кандидате вручную.',
        'Через AI-формат можно быстро дойти до вопросов про метрики, вклад, слабые кейсы и доказательства.',
        'AI-формат превращает портфолио из статичной страницы в короткий диалог по hiring-вопросам.',
      ]),
      assistant_case_navigation: unique([
        'Через ассистента кейсы можно смотреть не линейно, а по конкретным вопросам.',
        'Ассистент помогает быстро перейти к вопросам про вклад, доказательства, метрики и риски.',
        'Не нужно открывать каждый кейс и вычитывать детали вручную, если нужно только проверить определенный угол.',
      ]),
    },
    fallbackTitle: 'Почему это портфолио стоит смотреть',
    fallbackParagraphs: [
      'Его стоит смотреть, если нужно быстро понять кандидата не по набору экранов, а по разным типам доказательств. Здесь видно, где у Андрея есть релиз и метрики, где сильное исследование и workflow, а где честная граница и слабый кейс.',
      'Альфа-Смарт показывает запуск и результат, SIEBEL — работу с реальным операторским процессом, ChatPoint — выводы из продукта, который закрыли, а mobile cases — ширину опыта. Поэтому по этому портфолио быстрее собирается цельная картина, чем по обычной подборке интерфейсов.',
    ],
    fallbackBullets: [],
    chips: [
      { id: 'facts-portvalue-overview', label: 'Расскажи кратко о кейсах Андрея', message: 'Расскажи кратко о кейсах Андрея' },
      { id: 'facts-portvalue-alfa', label: 'Покажи Альфа-Смарт', message: 'Покажи Альфа-Смарт' },
      { id: 'facts-portvalue-proof', label: 'Где доказательства?', message: 'Где доказательства?' },
    ],
  },
  strengths: {
    topic: 'strengths',
    title: 'Сильные стороны Андрея',
    facts: unique([
      ...sharedFacts,
      ...caseAtomicFacts(alfa, { includeTakeaway: true, includeOutcomes: true, includeProof: true }),
      ...caseAtomicFacts(siebel, { includeTakeaway: true, includeOutcomes: true, includeProof: true }),
      ...caseAtomicFacts(wannabelike, { includeTakeaway: true }),
    ]),
    subjectFacts: {
      candidate_value: unique([
        ...caseAtomicFacts(alfa, { includeTakeaway: true, includeOutcomes: true }),
        ...caseAtomicFacts(siebel, { includeTakeaway: true, includeOutcomes: true }),
        ...caseAtomicFacts(wannabelike, { includeTakeaway: true }),
      ]),
      interview_decision: unique([
        'Интервью с Андреем имеет смысл, если нужен дизайнер под сложный продукт, а не только под аккуратный UI.',
        'По Альфа-Смарту видно, что он умеет доводить сложный сценарий до релиза и метрик.',
        'По SIEBEL видно, что он умеет разбираться в реальной рабочей среде и проектировать workflow под задачу.',
        'На интервью у него стоит проверять, как он принимает решения, что считает доказательством и как связывает дизайн с результатом.',
      ]),
    },
    fallbackTitle: 'Каковы сильные стороны Андрея',
    fallbackParagraphs: [
      'Если коротко, Андрей сильнее там, где мало просто нарисовать аккуратный интерфейс. Он умеет сначала разобраться в сценарии, ролях и ограничениях, а уже потом собирать решение.',
      'Лучше всего это видно по Альфа-Смарту и SIEBEL: в одном случае он довел сложный продукт до запуска с метриками, в другом — сначала разобрал реальную работу операторов и только потом менял интерфейс.',
    ],
    fallbackBullets: [
      'проектирование на основе исследований и тестов',
      'системный UX/UI, а не просто отрисовка экранов',
      'доведение решений до запуска и работы в продакшене',
      'умение принимать продуктовые решения',
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
    facts: unique([
      ...sharedFacts,
      ...alfa.decisions,
      ...alfa.validation,
      ...siebel.decisions,
      ...siebel.validation,
      ...chatpoint.decisions,
    ]),
    fallbackTitle: 'Как он обычно принимает решения',
    fallbackParagraphs: [
      'Андрей работает по продуктовому подходу: сначала понимает проблему, роли и ограничения, потом собирает гипотезы и структуру решения, и только после этого переходит к интерфейсу.',
      'Лучше всего это видно в SIEBEL и Альфа-Смарте: сначала исследование и сценарий, потом проверка решений, затем запуск.',
    ],
    fallbackBullets: [
      'сначала изучение требований и потребностей',
      'затем выдвижение гипотез и проработка сценариев',
      'отрисовка интерфейса и передача в разработку',
      'честный анализ результатов, даже если они оказались неудовлетворительными',
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
    facts: unique([
      ...sharedFacts,
      ...caseAtomicFacts(siebel, { includeTakeaway: true }),
      ...caseAtomicFacts(alfa, { includeTakeaway: true }),
      ...caseAtomicFacts(sharing, { includeTakeaway: true }),
      ...caseAtomicFacts(expenses, { includeTakeaway: true }),
    ]),
    fallbackTitle: 'Какой у него продуктовый подход',
    fallbackParagraphs: [
      'Продуктовый подход Андрея простой: сначала понять задачу и ограничения, потом собрать сценарий, проверить гипотезы и только после этого переходить к интерфейсу.',
      'Это не подход “сделать красиво”. В сильных кейсах видно, что Андрей связывает исследование, UX-решение и запуск продукта.',
    ],
    fallbackBullets: [
      'сначала проектирование сценария, потом отрисовка экранов',
      'гипотезы и проверка до разработки',
      'качественная передача макетов в разработку и контроль реализации',
      'метрики и реальный продуктовый результат важнее декоративности',
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
    facts: unique([
      ...sharedFacts,
      ...expenses.constraints,
      ...expenses.outcomes,
      ...alfa.decisions,
      ...siebel.constraints,
    ]),
    fallbackTitle: 'Как он работает с командами',
    fallbackParagraphs: [
      'По кейсам видно, что Андрей не ограничивается лишь визуальной частью. Он много работает на стыке продактов, бизнеса, разработки и реальных пользователей.',
      'Особенно показательны здесь кейсы, где нужно было сначала договориться о проблеме и только потом о решении — например, расходы держателей карт и SIEBEL.',
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
    facts: unique([
      ...sharedFacts,
      ...caseAtomicFacts(alfa, { includeTakeaway: true, includeOutcomes: true }),
      ...caseAtomicFacts(siebel, { includeTakeaway: true, includeOutcomes: true }),
      ...caseAtomicFacts(chatpoint, { includeTakeaway: true }),
      ...caseAtomicFacts(expenses, { includeTakeaway: true }),
      ...caseAtomicFacts(sharing, { includeTakeaway: true }),
      ...caseAtomicFacts(wannabelike, { includeTakeaway: true }),
    ]),
    fallbackTitle: 'Почему это портфолио может быть полезно',
    fallbackParagraphs: [
      'Смотреть это портфолио стоит не из-за одного красивого кейса, а из-за набора разного опыта: здесь есть запущенный банковский продукт, операторский workflow, мобильные сценарии и честный разбор проекта, который не взлетел.',
      'Вместе эти кейсы показывают не только интерфейсы, а то, как Андрей исследует, собирает сценарий, принимает решения и делает выводы, если продукт срабатывает не так, как ожидали.',
    ],
    fallbackBullets: [
      'флагман с метриками',
      'сложный корпоративный кейс с исследованиями и запуском',
      'разбор неудавшегося проекта с честными выводами',
      'ширина мобильной работы',
    ],
    chips: [
      { id: 'facts-fit-alfa', label: 'Покажи сильный кейс', message: 'Покажи сильный кейс' },
      { id: 'facts-fit-more', label: 'Открыть дополнительные кейсы', action: { type: 'open_additional_cases_overview' } },
      { id: 'facts-fit-contact', label: 'Связаться с Андреем', action: { type: 'open_contact_modal', source: 'facts' } },
    ],
  },
  risks: {
    topic: 'risks',
    title: 'Какие у Андрея ограничения',
    facts: unique([
      ...chatpoint.risks,
      ...chatpoint.recruiterTakeaway,
      ...alfa.risks,
      ...siebel.risks,
      ...expenses.risks,
      ...sharing.risks,
      ...wannabelike.risks,
    ]),
    fallbackTitle: 'Какие у него ограничения',
    fallbackParagraphs: [
      'Самое слабое место у Андрея не в интерфейсах, а в неравномерности кейсов. У него есть сильные запущенные проекты вроде Альфа-Смарта, но есть и ранние или учебные кейсы, которые нельзя читать как такой же уровень доказательства.',
      'Самый честный пример здесь — ChatPoint: сложный B2B-кейс, который показывает хороший ход мысли внутри интерфейса, но слабый итог по продукту и слишком позднюю проверку ценности.',
    ],
    fallbackBullets: [],
    chips: [
      { id: 'facts-risks-chatpoint', label: 'Расскажи про ChatPoint', message: 'Расскажи про ChatPoint' },
      { id: 'facts-risks-strengths', label: 'В чем сильная сторона Андрея?', message: 'В чем сильная сторона Андрея?' },
      { id: 'facts-risks-contact', label: 'Написать Андрею', action: { type: 'open_contact_modal', source: 'facts:risks' } },
    ],
  },
};

export function getSynthesisTopicConfig(topic: SynthesisTopic): SynthesisTopicConfig {
  return topicConfigs[topic];
}

export function getPortfolioFacts(topic: SynthesisTopic): string[] {
  return topicConfigs[topic].facts;
}
