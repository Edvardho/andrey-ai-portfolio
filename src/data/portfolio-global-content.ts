import { makeGallery } from '@/data/case-module-helpers';
import type {
  AdditionalCasesContent,
  ContextPanelData,
  ExperienceContent,
  HiringGuidesContent,
  MobileOverviewContent,
  StructuredExperienceSummaryData,
} from '@/lib/portfolio/types';

const experienceStructuredSummary: StructuredExperienceSummaryData = {
  intro: {
    title: 'Андрей — product designer с 6 годами опыта в B2B и B2C',
    body:
      'Работал в МТС, Альфа-Банке и Positive Technologies. Проектировал интерфейсы для финтеха, кибербезопасности и внутренних систем, где важно быстро разобраться в сложной логике, упростить сценарий и довести решение до запуска.',
    preview: {
      src: '/cases/experience/intro-preview.png',
      backgroundColor: '#D1D7E3',
      borderColor: '#EBEDF2',
      bordered: true,
      radiusClassName: 'rounded-[16px]',
      imageClassName: 'absolute left-0 top-0 h-[150.24%] w-full max-w-none',
    },
  },
  currentWork: {
    title: 'Где сейчас работает:',
    body:
      'Андрей работает в Positive Technologies и помогает создавать продукты: начиная от платформы для Кибер-игр хакеров, Багхантинга и заканчивая интерфейсами жюри, которые проверяют сданные отчеты хакеров.',
  },
  workHistory: {
    title: 'Где работал Андрей',
    items: [
      {
        id: 'positive-technologies',
        company: 'Positive Technologies',
        period: 'Июнь 2024 — сейчас',
        description: 'Проектирует интерфейс для Киберполигона и Багхантинга',
        resultLabel: 'Результат работы',
        resultTags: [
          'Сократил время сдачи отчетов хакерами',
          'Сократил время анализа отчета жюри',
        ],
      },
      {
        id: 'alfa-bank',
        company: 'Альфа-Банк',
        period: 'Май 2023 — Июнь 2024',
        description: 'Проектировал подписку на банковские продукты – Альфа-Смарт',
        resultLabel: 'Результат работы',
        resultTags: [
          '32 111 подписок за 1 месяц после запуска продукта',
          '1,1 млн ₽ выручка за 1 месяц',
        ],
      },
      {
        id: 'mts-digital',
        company: 'MTS Digital',
        period: 'Апрель 2021 — Май 2023',
        description: 'Проектировал платформу для коммуникации бизнеса с клиентами',
        resultLabel: 'Результат работы',
        resultTags: [
          'Сократилось время диалога с 900 до 580 сек.',
          'Выросла обработка диалогов с 1000 до 2000',
        ],
      },
    ],
  },
  importantTakeaway: {
    title: 'Что важно понять',
    body:
      'Андрей будет полезен командам, которым нужно превратить сложный B2B/B2C-продукт в понятный интерфейс и довести решение до релиза.',
    metrics: [
      {
        value: '6 лет опыта',
        label: 'В сложных B2B продуктах и B2C сценариях',
      },
      {
        value: 'Не оператор Figma',
        label: 'При решении задачи следует продуктовому подходу',
      },
      {
        value: 'AI tooling',
        label: 'Использует в работе AI инструменты для ускорения своей работы',
      },
    ],
  },
  casePromptSection: {
    title: 'Про какой кейс рассказать подробнее?',
    chips: [
      {
        id: 'experience-case-alfa-smart',
        label: 'Альфа-Смарт',
        action: { type: 'open_case_summary', caseId: 'alfa-smart' },
      },
      {
        id: 'experience-case-expenses',
        label: 'Расходы держателей',
        action: { type: 'open_case_summary', caseId: 'expenses-card-holders' },
      },
      {
        id: 'experience-case-sharing',
        label: 'Добавление участников в подписку',
        action: { type: 'open_case_summary', caseId: 'subscription-sharing' },
      },
      {
        id: 'experience-case-wannabelike',
        label: 'UX/UI WannabeLike',
        action: { type: 'open_case_summary', caseId: 'ux-ui-wannabelike' },
      },
      {
        id: 'experience-case-chatpoint',
        label: 'ChatPoint',
        action: { type: 'open_case_summary', caseId: 'chatpoint' },
      },
    ],
  },
  footerAction: {
    label: 'Написать Андрею',
    action: { type: 'open_contact_modal', source: 'experience' },
  },
};

export const experience: ExperienceContent = {
  structuredSummary: experienceStructuredSummary,
  summaryBlocks: [
    { type: 'lead', title: 'Коротко про опыт', body: ['У Андрея 5+ лет опыта на стыке B2B и B2C: MTS Digital, Альфа-Банк и Positive Technologies. Общий знаменатель — research → решение → релиз, а не просто “рисование экранов”.'] },
    { type: 'gallery', title: 'Компании', items: makeGallery([
      { id: 'experience-mts', title: 'MTS Digital', description: 'Enterprise, support ops, B2B SaaS.' },
      { id: 'experience-alfa', title: 'Альфа-Банк', description: 'Финтех, mobile/web, подписка и семейные сценарии.' },
      { id: 'experience-positive', title: 'Positive Technologies', description: 'Текущий фокус: AI, инструменты и продуктовый подход.' },
    ]) },
  ],
  detailBlocks: [
    { type: 'lead', title: 'Как читать этот опыт', body: ['Это не список компаний ради списка. Важно, что каждый этап добавлял слой сложности: enterprise процессы в MTS, флагманский финтех в Альфе и текущий AI/tooling-фокус.'] },
    { type: 'section', title: 'MTS Digital', body: ['Здесь Андрей вырос на проектировании сложных корпоративных систем, рабочих процессов операторов и разборе неидеальных проектов вроде ChatPoint.'] },
    { type: 'section', title: 'Альфа-Банк', body: ['Здесь виден более зрелый product ownership: от сильного флагманского кейса Альфа-Смарт до мобильных сценариев с исследованием и межкомандным согласованием.'] },
    { type: 'section', title: 'Positive Technologies', body: ['Текущий фокус — AI, инструменты и системная продуктовая работа, а не просто очередной визуальный refresh.'] },
    { type: 'cta', label: 'Открыть SIEBEL как доказательство', action: { type: 'open_experience_route', caseId: 'siebel' } },
  ],
  routeBlocks: {
    siebel: [
      { type: 'lead', title: 'Почему SIEBEL здесь важен', body: ['Если нужен один кейс, который быстро докажет, что Андрей умеет не только редизайнить, а переводить проблемы в продуктовую работу, это именно SIEBEL.'] },
      { type: 'chips', title: 'Открыть', items: [
        { id: 'exp-siebel-short', label: 'Короткий ответ', action: { type: 'open_case_summary', caseId: 'siebel' } },
        { id: 'exp-siebel-detail', label: 'Развернутый ответ', action: { type: 'open_case_detail', caseId: 'siebel' } },
      ] },
    ],
    default: [
      { type: 'lead', title: 'Открыть кейс', body: ['Из опыта лучше всего переходить либо в SIEBEL, если нужен enterprise-signal, либо в Альфа-Смарт, если нужен флагманский продуктовый кейс.'] },
    ],
  },
  contextPanel: {
    title: 'Опыт работы',
    subtitle: 'B2B + B2C · 5+ лет',
    tags: ['MTS Digital', 'Альфа-Банк', 'Positive Technologies', 'Research → release'],
    note: 'Сильная часть траектории — ширина доменов без потери продуктовой дисциплины.',
    cta: { label: 'Связаться с Андреем', action: { type: 'open_contact_modal', source: 'experience' } },
    hidden: true,
  },
  followUpChips: [],
};

const additionalCases: ContextPanelData = {
  title: 'Дополнительные кейсы',
  subtitle: 'Разнообразный опыт',
  tags: ['AI', 'B2B', 'Systems', 'UX/UI'],
  note: 'Это не “остатки портфолио”, а дополнительное разнообразие опыта: мобильные сценарии, честные разборы проектов и системные B2B-решения.',
};

export const additionalCasesContent: AdditionalCasesContent = {
  summaryBlocks: [
    { type: 'lead', title: 'Да, у Андрея есть сильные кейсы и кроме флагманов', body: ['Важно не размывать впечатление количеством. Ценность этих проектов в разнообразии задач: мобильные сценарии, сложные интерфейсы для бизнеса, системное мышление и умение принимать продуктовые решения.'] },
    { type: 'disclosures', title: 'Направления', items: [
      { id: 'additional-mobile', title: 'Мобильные сценарии', summary: 'Подписки, семейные сценарии, роли, ветвления и межкомандные зависимости.', details: ['Хороший вход: кейсы про держателей карт, шаринг подписки и UX/UI WannabeLike.'] },
      { id: 'additional-enterprise', title: 'Плотные B2B-интерфейсы', summary: 'Сложные корпоративные продукты с высокой информационной плотностью.', details: ['Главные примеры: SIEBEL и ChatPoint.'] },
      { id: 'additional-systems', title: 'Системное мышление', summary: 'Не просто локальный UI, а структура сценариев, процессы и запуск решений.', details: ['Это проявляется и в SIEBEL, и в Alpha-Smart, и в mobile кейсах.'] },
      { id: 'additional-judgment', title: 'Продуктовое мышление', summary: 'Умение не только делать фичи, но и видеть, когда продукт идет не туда.', details: ['Лучший пример — ChatPoint как пример честного разбора спорного проекта.'] },
    ] },
    { type: 'gallery', title: 'Куда можно открыть следующий шаг', items: makeGallery([
      { id: 'alfa-smart', title: 'Альфа-Смарт', description: 'Флагманский продуктовый кейс.' },
      { id: 'siebel', title: 'SIEBEL', description: 'Enterprise workflow с цифрами.' },
      { id: 'chatpoint', title: 'ChatPoint', description: 'Пример разбора B2B-проекта с анализом ошибок.' },
      { id: 'expenses-card-holders', title: 'Mobile cases', description: 'Ширина мобильной работы.' },
    ]) },
  ],
  contextPanel: additionalCases,
  followUpChips: [],
};

export const mobileOverview: MobileOverviewContent = {
  summaryBlocks: [
    { type: 'lead', title: 'Да, у Андрея есть не один мобильный кейс', body: ['Помимо Альфа-Смарта у него есть мобильные сценарии, где важны не декоративные экраны, а роли, ветвления, межкомандное согласование и системный UX/UI.'] },
    { type: 'gallery', title: 'Что можно открыть', items: makeGallery([
      { id: 'alfa-smart', title: 'Альфа-Смарт', description: 'Флагманский mobile/web кейс.' },
      { id: 'expenses-card-holders', title: 'Расходы держателей', description: 'Исследование и межкомандное согласование.' },
      { id: 'subscription-sharing', title: 'Шаринг подписки', description: 'Снижение трения в branching flow.' },
      { id: 'ux-ui-wannabelike', title: 'UX/UI WannabeLike', description: 'Research, IA, flows и UI.' },
    ]) },
  ],
  contextPanel: {
    title: 'Мобильный опыт',
    subtitle: 'Mobile · Fintech · UX/UI',
    tags: ['Research', 'Mobile flows', 'Branching', 'Systemic UX'],
    note: 'Смысл этого блока — показать, что мобильный опыт Андрея не заканчивается одним флагманским кейсом.',
  },
  followUpChips: [],
};

export const hiringGuides: HiringGuidesContent = {
  assistantProfile: {
    title: 'Кто я такой',
    viewType: 'assistant_intro',
    presentationVariant: 'plain_text_reply',
    contentBlocks: [
      {
        type: 'lead',
        title: 'Я ИИ-ассистент Андрея',
        body: [
          'Я ИИ-ассистент Андрея. Помогаю быстро понять, насколько его опыт подходит под задачу: кто он, где работал, какие кейсы сильные, где есть ограничения и что стоит открыть первым.',
          'Я не заменяю интервью и не украшаю портфолио. Моя работа проще: сэкономить время на первом скрининге и не заставлять тебя читать все подряд.',
        ],
      },
      { type: 'cta', label: 'Открыть Альфа-Смарт', action: { type: 'open_case_summary', caseId: 'alfa-smart' } },
    ],
    chips: [
      { id: 'assistant-andrey', label: 'Кто такой Андрей?', message: 'Кто такой Андрей?' },
      { id: 'assistant-experience', label: 'Покажи опыт работы', message: 'Покажи опыт работы' },
      { id: 'assistant-strong-case', label: 'Покажи сильный кейс', message: 'Покажи сильный кейс' },
    ],
    contextPanel: {
      title: 'Assistant role',
      subtitle: 'Hiring lead copilot',
      tags: ['Опыт', 'Кейсы', 'Риски', 'Доказательства'],
      note: 'Нормальный способ использовать ассистента: быстро понять, стоит ли тратить время на следующий этап с Андреем.',
      cta: { label: 'Связаться с Андреем', action: { type: 'open_contact_modal', source: 'assistant-intro' } },
    },
  },
  identityProfile: {
    title: 'Кто такой Андрей',
    viewType: 'identity_intro',
    presentationVariant: 'plain_text_reply',
    contentBlocks: [
      {
        type: 'lead',
        title: 'Кто такой Андрей',
        body: [
          'Андрей — продуктовый дизайнер с 5+ годами опыта. Он работал в MTS Digital, Альфа-Банке и Positive Technologies, проектировал B2B и B2C продукты.',
          'Главный смысл портфолио: Андрей не только рисует интерфейсы, а разбирает задачу, проектирует сценарии, проверяет решения и доводит их до запуска.',
        ],
      },
      { type: 'cta', label: 'Открыть опыт работы', action: { type: 'open_experience_summary' } },
    ],
    chips: [
      { id: 'identity-experience', label: 'Покажи опыт работы', message: 'Покажи опыт работы' },
      { id: 'identity-strong-case', label: 'Покажи сильный кейс', message: 'Покажи сильный кейс' },
      { id: 'identity-level', label: 'На какой он уровень?', message: 'На какой он уровень?' },
    ],
    contextPanel: {
      title: 'Кандидат',
      subtitle: 'Product Designer · 5+ лет',
      tags: ['B2B + B2C', 'Research → release', 'Fintech + Enterprise'],
      note: 'Удобный раздел, чтобы быстро составить первое представление о кандидате.',
      cta: { label: 'Связаться с Андреем', action: { type: 'open_contact_modal', source: 'identity' } },
    },
  },
  careerSummary: {
    title: 'Опыт работы',
    viewType: 'career_summary',
    presentationVariant: 'plain_text_reply',
    contentBlocks: [
      {
        type: 'lead',
        title: 'Где Андрей получил ключевой опыт',
        body: [
          'Андрей работал 5+ лет продуктовым дизайнером в MTS Digital, Альфа-Банке и Positive Technologies. Основной опыт — B2B и B2C продукты, сложные сценарии, исследования, UX/UI и передача решений в разработку.',
          'Если нужен короткий вывод: это дизайнер не только про экраны, а про разбор задачи, сценарии, ограничения и доведение решения до релиза.',
        ],
      },
      { type: 'cta', label: 'Открыть опыт работы', action: { type: 'open_experience_summary' } },
    ],
    chips: [
      { id: 'career-case', label: 'Покажи сильный кейс', message: 'Покажи сильный кейс' },
      { id: 'career-fit', label: 'На какой он уровень?', message: 'На какой он уровень?' },
      { id: 'career-proof', label: 'Где это подтверждается?', message: 'Где это подтверждается?' },
    ],
    contextPanel: {
      title: 'Опыт работы',
      subtitle: 'B2B · B2C · Реализация решений',
      tags: ['MTS Digital', 'Альфа-Банк', 'Positive Technologies'],
      note: 'Этот pack нужен для короткого hiring-входа, а не чтобы заменять полный canonical screen опыта.',
    },
  },
  caseDiscovery: {
    title: 'Какой кейс открыть первым',
    viewType: 'case_discovery',
    presentationVariant: 'plain_text_reply',
    contentBlocks: [
      {
        type: 'lead',
        title: 'Если нужен один сильный кейс, начни с Альфа-Смарт',
        body: [
          'Начни с Альфа-Смарт. Это самый понятный флагманский кейс: продукт дошел до запуска, есть метрики, видна роль Андрея и видно, как он разбирал сложный семейный сценарий до разработки.',
          'Если времени мало, этот кейс лучше всего показывает связку: задача, сценарий, UX-решение, запуск и результат.',
        ],
      },
      { type: 'cta', label: 'Открыть Альфа-Смарт', action: { type: 'open_case_summary', caseId: 'alfa-smart' } },
    ],
    chips: [
      { id: 'case-discovery-chatpoint', label: 'Расскажи про ChatPoint', message: 'Расскажи про ChatPoint' },
      { id: 'case-discovery-mobile', label: 'Что делал в мобилке?', message: 'Что делал в мобилке?' },
      { id: 'case-discovery-risks', label: 'Какие есть ограничения?', message: 'Какие есть ограничения?' },
    ],
    contextPanel: {
      title: 'Case discovery',
      subtitle: 'Conversation first',
      tags: ['Strong case', 'CTA-led navigation', 'No hidden redirects'],
      note: 'Сначала короткий ответ в чате, потом явный переход в кейс. Не наоборот.',
    },
  },
  mobileSummary: {
    title: 'Мобильный опыт',
    viewType: 'mobile_overview',
    presentationVariant: 'plain_text_reply',
    contentBlocks: [
      {
        type: 'lead',
        title: 'Да, мобильный опыт у Андрея есть и он не сводится к одному экрану',
        body: [
          'В мобильной разработке Андрей занимался не просто отрисовкой интерфейсов, а проектированием сложных разветвленных сценариев, разграничением ролей, учетом технических ограничений и системным UX/UI на стыке мобильного приложения и продуктовой логики.',
          'Если нужен полный срез, лучше открыть мобильные кейсы отдельно, а не пытаться вытащить всю картину из одного короткого ответа.',
        ],
      },
      { type: 'cta', label: 'Открыть мобильные кейсы', action: { type: 'open_mobile_experience_overview' } },
    ],
    chips: [
      { id: 'mobile-summary-strong', label: 'Покажи сильный кейс', message: 'Покажи сильный кейс' },
      { id: 'mobile-summary-risks', label: 'Какие есть ограничения?', message: 'Какие есть ограничения?' },
      { id: 'mobile-summary-exp', label: 'Покажи опыт работы', message: 'Покажи опыт работы' },
    ],
    contextPanel: {
      title: 'Mobile overview',
      subtitle: 'Conversation first',
      tags: ['Mobile flows', 'Research', 'System UX/UI'],
      note: 'Мобильный опыт — это отдельный разговорный ответ плюс явный CTA на обзор кейсов.',
    },
  },
  strengthsMap: {
    title: 'Почему его стоит рассматривать',
    viewType: 'strengths_assessment',
    presentationVariant: 'bullet_reply',
    contentBlocks: [
      {
        type: 'lead',
        title: 'Почему его стоит рассматривать',
        body: [
          'Сильная сторона Андрея — он не начинает с красивого экрана. Сначала разбирает задачу, роли, ограничения и сценарии, а потом уже собирает интерфейс и доводит решение до запуска.',
        ],
      },
      {
        type: 'bullet_list',
        title: 'Что здесь действительно сильное',
        items: [
          'Альфа-Смарт показывает запуск и измеримый результат, а не просто красивую презентацию.',
          'SIEBEL показывает работу с реальной операционной болью и сложным рабочим процессом.',
          'ChatPoint важен как честный разбор ошибки: Андрей не прячет, где продуктовая ценность была проверена слишком поздно.',
          'Мобильные кейсы показывают ширину: роли, ветвления, межкомандные зависимости и системный UX/UI.',
        ],
      },
    ],
    chips: [
      { id: 'strengths-alfa', label: 'Покажи сильный кейс', message: 'Покажи сильный кейс' },
      { id: 'strengths-siebel', label: 'Открыть SIEBEL', action: { type: 'open_case_summary', caseId: 'siebel' } },
      { id: 'strengths-fit', label: 'На какие роли он подойдет?', message: 'На какие роли он подойдет?' },
    ],
    contextPanel: {
      title: 'Сильные стороны',
      subtitle: 'Исследования · Системность · Результат',
      tags: ['Флагманский кейс', 'Enterprise', 'Анализ ошибок', 'Мобильный опыт'],
      note: 'Сильная сторона Андрея — умение находить суть проблемы, проектировать системные решения и доводить их до релиза.',
    },
  },
  roleFit: {
    title: 'На какой уровень он выглядит',
    viewType: 'role_fit_assessment',
    presentationVariant: 'sectioned_reply',
    contentBlocks: [
      {
        type: 'lead',
        title: 'На какой уровень он выглядит',
        body: [
          'По портфолио видно, что уровень Андрея ближе к strong middle+ / senior. Он умеет проектировать интерфейсы под сложные бизнес-сценарии и технические ограничения, а не просто аккуратно исполнять задачи по макетам.',
        ],
      },
      {
        type: 'section',
        title: 'Почему квалификация именно такая',
        body: [
          'Его квалификация подтверждается умением исследовать потребности пользователей, проектировать сложные сценарии, проверять гипотезы и доводить решения до запуска.',
        ],
      },
      {
        type: 'section',
        title: 'Подходящие роли',
        body: [
          'Андрей лучше всего подходит на роли Product Designer или Senior Product Designer в B2B, финтехе, внутренних системах и продуктах со сложными пользовательскими сценариями.',
        ],
      },
      {
        type: 'section',
        title: 'Что честно учитывать',
        body: [
          'Если вам нужен дизайнер, специализирующийся в основном на бренд-дизайне, промо-лендингах или визуальном сторителлинге, то это не его основная специализация. Сильная сторона Андрея — глубокая проработка продуктовой логики и доведение работы до запуска.',
        ],
      },
    ],
    chips: [
      { id: 'rolefit-experience', label: 'Покажи опыт работы', message: 'Покажи опыт работы' },
      { id: 'rolefit-alfa', label: 'Покажи сильный кейс', message: 'Покажи сильный кейс' },
      { id: 'rolefit-risks', label: 'Какие есть риски?', message: 'Какие у него слабые стороны?' },
    ],
    contextPanel: {
      title: 'Подходящие роли',
      subtitle: 'Уровень ближе к strong middle+ / senior',
      tags: ['Product Designer', 'Fintech', 'Сложные интерфейсы', 'Мобильные системы'],
      note: 'Это оценка на основе подтвержденных кейсов и опыта работы в крупных проектах.',
    },
  },
  decisionMakingPatterns: {
    title: 'Как Андрей принимает решения',
    viewType: 'decision_process',
    presentationVariant: 'sectioned_reply',
    contentBlocks: [
      {
        type: 'lead',
        title: 'Как Андрей принимает решения',
        body: [
          'Андрей работает по продуктовому подходу: сначала понимает проблему, роли и ограничения, потом собирает гипотезы и структуру решения, и только после этого переходит к интерфейсу.',
        ],
      },
      {
        type: 'section',
        title: 'Как исследует',
        body: [
          'В SIEBEL он не пошел в редизайн по ощущениям, а начал с записей операторов и реальной операционной боли. В Альфа-Смарте сначала раскладывал требования и сценарий, а не рисовал экраны вслепую.',
        ],
      },
      {
        type: 'section',
        title: 'Как валидирует',
        body: [
          'Ключевой паттерн — убрать UX-риск до разработки: прототипы, гипотезы, проверки и только потом масштабирование решения.',
        ],
      },
      {
        type: 'section',
        title: 'Где это лучше всего видно',
        body: [
          'Лучшие примеры — SIEBEL и Альфа-Смарт. ChatPoint дополнительно показывает, что Андрей умеет разбирать неудачный продукт без попытки выдать его за победу.',
        ],
      },
    ],
    chips: [
      { id: 'decisions-siebel', label: 'Открыть SIEBEL', action: { type: 'open_case_summary', caseId: 'siebel' } },
      { id: 'decisions-alfa', label: 'Покажи сильный кейс', message: 'Покажи сильный кейс' },
      { id: 'decisions-evidence', label: 'Где это подтверждается?', message: 'Где это подтверждается?' },
    ],
    contextPanel: {
      title: 'Принятие решений',
      subtitle: 'Исследование → гипотезы → запуск',
      tags: ['SIEBEL', 'Альфа-Смарт', 'Проверка гипотез', 'Сложные сценарии'],
      note: 'Здесь важно, что решения рождались не из вкуса, а из проблем, ролей и проверки на реальном процессе.',
    },
  },
  risksAndLimits: {
    title: 'Где было больше всего проблем',
    viewType: 'risk_objection',
    presentationVariant: 'plain_text_reply',
    contentBlocks: [
      {
        type: 'lead',
        title: 'Где было больше всего проблем',
        body: [
          'Самым неоднозначным проектом для Андрея стал ChatPoint. Это пример честного разбора неудачи: сложный продукт для бизнеса дошел до запуска, но в итоге проект был закрыт.',
        ],
      },
      {
        type: 'section',
        title: 'Что там пошло не так',
        body: [
          'Проблема заключалась не в качестве интерфейса. Команда активно разрабатывала функции, но востребованность продукта проверялась слишком поздно: сценарии подключения пользователей и распределения диалогов проектировались в условиях, когда сама полезность мессенджера была под вопросом.',
          'Этот кейс полезен тем, что Андрей не пытается скрыть неудачу, а открыто анализирует ошибки проектирования: даже удобный интерфейс не спасет продукт, если не решена его главная задача.',
        ],
      },
      { type: 'cta', label: 'Открыть ChatPoint', action: { type: 'open_case_summary', caseId: 'chatpoint' } },
    ],
    chips: [
      { id: 'risks-chatpoint', label: 'Расскажи про ChatPoint', message: 'Расскажи про ChatPoint' },
      { id: 'risks-experience', label: 'Покажи опыт работы', message: 'Покажи опыт работы' },
      { id: 'risks-contact', label: 'Как связаться с Андреем?', message: 'Как связаться с Андреем?' },
    ],
    contextPanel: {
      title: 'Разбор ChatPoint',
      subtitle: 'Сложные сценарии · Продуктовые риски',
      tags: ['ChatPoint', 'Анализ ошибок', 'Продуктовое мышление'],
      note: 'Цель ответа — показать умение кандидата делать выводы из неудачных проектов, а не только описывать успешные кейсы.',
    },
  },
  evidenceIndex: {
    title: 'Где у него реальные доказательства',
    viewType: 'evidence_request',
    presentationVariant: 'sectioned_reply',
    contentBlocks: [
      {
        type: 'lead',
        title: 'Где у него реальные доказательства',
        body: [
          'Все выводы о квалификации Андрея подтверждаются конкретными проектами и артефактами в его портфолио.',
        ],
      },
      {
        type: 'evidence_case',
        title: 'Проектирование и метрики',
        body: ['Альфа-Смарт — основной кейс, показывающий полный цикл работы над продуктом: от проработки требований и проведения тестов до запуска и анализа метрик.'],
        case: {
          caseId: 'alfa-smart',
          layoutType: 'single_preview',
          items: [
            {
              id: 'evidence-alfa-landing',
              artifactId: 'alfa-landing',
              title: 'Лендинг подписки',
              description: 'Показывает преимущества до действия.',
              width: 798,
              preview: {
                src: '/cases/alfa-smart/showcase-landing.png',
                backgroundColor: '#D1D7E3',
                borderColor: '#E7EAF2',
                imageClassName: 'absolute inset-0 h-full w-full max-w-none rounded-[24px] object-contain',
              },
            },
          ],
        },
      },
      {
        type: 'evidence_case',
        title: 'Сложные интерфейсы и исследования',
        body: ['SIEBEL — пример того, как на основе реальных исследований был оптимизирован рабочий процесс операторов и сокращено время обработки обращений.'],
        case: {
          caseId: 'siebel',
          layoutType: 'two_cards',
          items: [
            {
              id: 'evidence-siebel-two-windows',
              artifactId: 'siebel-two-windows',
              title: '2-window mode',
              description: 'Решение одной из самых дорогих операционных болей.',
              width: 389,
              preview: {
                src: '/cases/siebel/disclosure-workflow-two-window.png',
                backgroundColor: '#FFFFFF',
                borderColor: '#E7EAF2',
                imageClassName: 'absolute inset-0 h-full w-full max-w-none object-contain',
              },
            },
            {
              id: 'evidence-siebel-customer-data',
              artifactId: 'siebel-customer-data',
              title: 'Панель данных клиента',
              description: 'Сокращает time-to-information.',
              width: 389,
              preview: {
                src: '/cases/siebel/disclosure-workflow-client-data.png',
                backgroundColor: '#FFFFFF',
                borderColor: '#E7EAF2',
                imageClassName: 'absolute inset-0 h-full w-full max-w-none object-contain',
              },
            },
          ],
        },
      },
      {
        type: 'evidence_case',
        title: 'Анализ рисков и ограничений',
        body: ['ChatPoint — пример честного разбора ошибок, показывающий умение оценивать риски и востребованность функций до их разработки.'],
        case: {
          caseId: 'chatpoint',
          layoutType: 'three_cards_scroll',
          rowWidth: 766,
          peekWidth: 158,
          items: [
            {
              id: 'evidence-chatpoint-showcase-onboarding',
              artifactId: 'chatpoint-showcase-apple-onboarding',
              title: 'Apple onboarding',
              description: 'Step-by-step guide помогал без менеджера пройти сложное подключение канала.',
              width: 242,
              preview: {
                src: '/cases/chatpoint/showcase-apple-onboarding.png',
                backgroundColor: '#D1D7E3',
                borderColor: '#E7EAF2',
                imageClassName: 'absolute left-[5.99%] top-[7.62%] h-[210.92%] w-[88.01%] max-w-none',
              },
            },
            {
              id: 'evidence-chatpoint-showcase-routing',
              artifactId: 'chatpoint-showcase-routing',
              title: 'Routing',
              description: 'Настройка распределения диалогов и поведения системы для операторов.',
              width: 242,
              preview: {
                src: '/cases/chatpoint/showcase-routing.png',
                backgroundColor: '#D1D7E3',
                borderColor: '#E7EAF2',
                imageClassName: 'absolute left-[6.76%] top-[7.28%] h-[118.59%] w-[86.48%] max-w-none',
              },
            },
            {
              id: 'evidence-chatpoint-showcase-form-messages',
              artifactId: 'chatpoint-showcase-form-messages',
              title: 'Form Messages',
              description: 'Хорошо спроектированная, но продуктово сомнительная функция.',
              width: 242,
              preview: {
                src: '/cases/chatpoint/showcase-form-messages.png',
                backgroundColor: '#D1D7E3',
                borderColor: '#E7EAF2',
                imageClassName: 'absolute left-[6.41%] top-[5.98%] h-[135.9%] w-[87.19%] max-w-none',
              },
            },
          ],
        },
      },
      {
        type: 'section',
        title: 'Опыт в мобильной разработке',
        body: [
          'Другие мобильные проекты демонстрируют разнообразие задач Андрея: проектирование сценариев под разные роли пользователей, работу с техническими ограничениями и сложную логику взаимодействия.',
        ],
      },
      { type: 'cta', label: 'Открыть Альфа-Смарт', action: { type: 'open_case_summary', caseId: 'alfa-smart' } },
    ],
    chips: [
      { id: 'evidence-alfa', label: 'Покажи сильный кейс', message: 'Покажи сильный кейс' },
      { id: 'evidence-siebel', label: 'Открыть SIEBEL', action: { type: 'open_case_summary', caseId: 'siebel' } },
      { id: 'evidence-chatpoint', label: 'Расскажи про ChatPoint', message: 'Расскажи про ChatPoint' },
    ],
    contextPanel: {
      title: 'Evidence index',
      subtitle: 'What to open next',
      tags: ['Альфа-Смарт', 'SIEBEL', 'ChatPoint', 'Mobile breadth'],
      note: 'Для оценки кандидата рекомендуется последовательно изучить основной кейс (Альфа-Смарт), пример оптимизации внутренних систем (SIEBEL) и разбор ошибок (ChatPoint).',
    },
  },
};

export function getHiringGuide<K extends keyof HiringGuidesContent>(key: K): HiringGuidesContent[K] {
  return hiringGuides[key];
}

export function getExperienceRoute(caseId?: string) {
  if (caseId && experience.routeBlocks[caseId]) {
    return experience.routeBlocks[caseId];
  }
  return experience.routeBlocks.default;
}
