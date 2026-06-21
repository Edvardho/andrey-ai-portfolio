import { makeGallery } from '@/data/case-module-helpers';
import type { CaseContent, DisclosureRow, StructuredCaseSummaryData } from '@/lib/portfolio/types';

const alfaDisclosures: DisclosureRow[] = [
  {
    id: 'alfa-requirements',
    title: 'Разобрал требования и структуру продукта',
    summary: 'Собрал Miro-структуру и договорился со стейкхолдерами о границах MVP.',
    details: [
      'Не прыгал сразу в экраны: сначала разложил продукт на роли, сценарии и точки входа.',
      'Синхронизировал ожидания бизнеса до того, как команда начала тратить время на лишние фичи.',
    ],
    artifactIds: ['alfa-miro'],
  },
  {
    id: 'alfa-testing',
    title: 'Подготовил гипотезы и прототип для тестов',
    summary: 'Собрал пользовательский путь и проверил гипотезы до разработки.',
    details: [
      'Прототип нужен был не ради красивой презентации, а чтобы снять основные UX-риски до релиза.',
      'После тестирования убрали лишнее трение в сценарии подключения близких к подписке.',
    ],
    artifactIds: ['alfa-prototype'],
  },
  {
    id: 'alfa-delivery',
    title: 'Довел решение до релиза',
    summary: 'Прошел дизайн-чек, описал состояния и передал макеты в разработку.',
    details: [
      'На этом кейсе видно не только умение проектировать интерфейсы, но и умение доводить работу до релиза.',
      'Финальная ценность кейса — не в количестве экранов, а в том, что сценарий дошел до рынка и принес измеримый результат.',
    ],
    artifactIds: ['alfa-ui'],
  },
];

const alfaStructuredSummary: StructuredCaseSummaryData = {
  intro: {
    title: 'О продукте',
    body: 'Альфа-Смарт — семейная подписка Альфа-Банка на банковские продукты. Это сильный кейс не из-за количества экранов, а потому что здесь видно продуктовую логику: сложный сценарий был разобран, проверен и доведен до релиза с измеримым результатом.',
    preview: {
      src: '/cases/alfa-smart/intro-preview.png',
      backgroundColor: '#D1D7E3',
      imageClassName: 'absolute left-0 top-0 h-[184.11%] w-full max-w-none',
    },
  },
  sections: [
    {
      title: 'Что это был за продукт',
      body: 'Семейная подписка, встроенная в мобильное приложение, web-версию и приложение Восход.\nОна должна была дать владельцу понятный способ подключать близких к преимуществам и удерживать не только текущих клиентов, но и новых пользователей через семейный сценарий.',
    },
    {
      title: 'Роль Андрея',
      body: 'Product Designer: разобрал требования, собрал User Flow и первые макеты, подготовил гипотезы, прототип для теста, прошёл дизайн-чек и передал решение в разработку.',
    },
  ],
  disclosureTitle: 'Что делал Андрей',
  disclosures: [
    {
      id: 'alfa-structured-requirements',
      label: 'Разбирался в требованиях заказчика',
      body: 'Получил структуру продукта в Miro, выделил роли и конфликтные сценарии до детальной отрисовки экранов.',
      layoutType: 'single_preview',
      cards: [
        {
          id: 'alfa-structured-requirements-card',
          artifactId: 'alfa-requirements-map',
          width: 462,
          preview: {
            src: '/cases/alfa-smart/disclosure-requirements.png',
            backgroundColor: '#F7F8FC',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute inset-0 h-full w-full max-w-none object-cover',
          },
        },
      ],
    },
    {
      id: 'alfa-structured-user-flow',
      label: 'Собирал User Flow, драфты макетов, чтобы быстро синхронизироваться с бизнесом',
      body: 'В самом начале было принято решение делать web версию продукта т.к. он был дешевле с точки зрения разработки. После 4 итераций было принято решение идти сначала в мобильную версию приложения',
      layoutType: 'two_cards',
      cards: [
        {
          id: 'alfa-structured-user-flow-card-1',
          artifactId: 'alfa-user-flow',
          title: 'User-Flow первого входа в продукт',
          description: 'На основе анализа конкурентов и особенностей приложения вместе с продактами солгасовали примерный путь пользователя',
          width: 389,
          preview: {
            src: '/cases/alfa-smart/disclosure-userflow-1.png',
            backgroundColor: '#505050',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute inset-0 h-full w-full max-w-none object-contain',
          },
        },
        {
          id: 'alfa-structured-user-flow-card-2',
          artifactId: 'alfa-first-designs',
          title: 'Первые варианты дизайна подписки',
          description: 'Из-за особенностей дизайн системы, дизайн подписки для Web версии оставлял желать лучшего',
          width: 389,
          preview: {
            src: '/cases/alfa-smart/disclosure-userflow-2.png',
            backgroundColor: '#F7F8FC',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute left-[-3px] top-[-3px] h-[calc(100%+6px)] w-[calc(100%+6px)] max-w-none object-cover object-top',
          },
        },
      ],
    },
    {
      id: 'alfa-structured-testing',
      label: 'Готовил гипотезы и прототипы для юзабилити тестирования',
      body: 'В самом начале было принято решение делать web версию продукта т.к. он был дешевле с точки зрения разработки. После 4 итераций было принято решение идти сначала в мобильную версию приложения',
      layoutType: 'two_cards',
      cards: [
        {
          id: 'alfa-structured-testing-card-1',
          artifactId: 'alfa-test-hypotheses',
          title: 'Гипотезы для тестирования',
          description: 'Совместно с продакт менеджером составили список гипотез для тестирования и согласовали их с комантой UX лаборатории',
          width: 389,
          preview: {
            src: '/cases/alfa-smart/disclosure-testing-1.png',
            backgroundColor: '#E7EBF6',
            borderColor: '#D1D7E3',
            imageClassName: 'absolute inset-0 h-full w-full max-w-none object-contain',
          },
        },
        {
          id: 'alfa-structured-testing-card-2',
          artifactId: 'alfa-test-prototypes',
          title: 'Прототипы для тестирования',
          description: 'Чтобы приготовить прототип пришлось перевести все экраны в изображения, т.к. из-за компонентов прототип оказался очень тяжелым и не хотел открываться на телефоне',
          width: 389,
          preview: {
            src: '/cases/alfa-smart/disclosure-testing-2.png',
            backgroundColor: '#000000',
            borderColor: '#000000',
            imageClassName: 'absolute left-0 top-[1.66%] h-[98.34%] w-[124.11%] max-w-none',
          },
        },
      ],
    },
    {
      id: 'alfa-structured-delivery',
      label: 'Прошел дизайн-чек, передал макеты в разработку, провел дизайн-ревью',
      body: 'В самом начале было принято решение делать web версию продукта т.к. он был дешевле с точки зрения разработки. После 4 итераций было принято решение идти сначала в мобильную версию приложения',
      layoutType: 'three_cards_scroll',
      rowWidth: 1207,
      peekWidth: 158,
      cards: [
        {
          id: 'alfa-structured-delivery-card-1',
          artifactId: 'alfa-design-check',
          title: 'Дизайн-чек',
          description: 'Перед тем как передать макеты разработчикам, я должен был получить как минимум 2 аппрува от других дизайнеров и внести правки в макеты.',
          width: 370,
          preview: {
            src: '/cases/alfa-smart/disclosure-delivery-1.png',
            overlaySrc: '/cases/alfa-smart/disclosure-delivery-1-overlay.png',
            overlayImageClassName: 'absolute inset-0 h-full w-full max-w-none object-cover',
            backgroundColor: '#505050',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute inset-0 h-full w-full max-w-none object-contain',
          },
        },
        {
          id: 'alfa-structured-delivery-card-2',
          artifactId: 'alfa-dev-handoff',
          title: 'Передача макетов разработчикам',
          description: 'Макеты были структурированы по пути пользователя т.к. такой подход помогал команде самостоятельно пройти путь пользователя и не запутаться в корнер кейсах',
          width: 370,
          preview: {
            src: '/cases/alfa-smart/disclosure-delivery-2.png',
            backgroundColor: '#E5E5E5',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute inset-0 h-full w-full max-w-none object-contain',
          },
        },
        {
          id: 'alfa-structured-delivery-card-3',
          artifactId: 'alfa-design-review',
          title: 'Дизайн-ревью макетов',
          description: 'После того, как разработчики сверстали макеты я проводил дизайн ревью',
          width: 370,
          preview: {
            src: '/cases/alfa-smart/disclosure-delivery-3.png',
            backgroundColor: '#D1D7E3',
            borderColor: '#D1D7E3',
            imageClassName: 'absolute inset-0 h-full w-full max-w-none object-contain',
          },
        },
      ],
    },
  ],
  showcaseTitle: 'Примеры интерфейсных решений',
  showcaseRowWidth: 1009.333,
  showcasePeekWidth: 158,
  showcaseItems: [
    {
      id: 'alfa-structured-landing',
      artifactId: 'alfa-landing',
      title: 'Лендинг подписки',
      description: 'Когда пользователь переходит к подписке он видит лендинг со всеми преимуществами',
      width: 252,
      preview: {
        src: '/cases/alfa-smart/showcase-landing.png',
        backgroundColor: '#D1D7E3',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute inset-0 h-full w-full max-w-none rounded-[24px] object-contain',
      },
    },
    {
      id: 'alfa-structured-manage',
      artifactId: 'alfa-manage',
      title: 'Экран управления',
      description: 'После того, как клиент подключил подписку, он видит экран управления',
      width: 252,
      preview: {
        src: '/cases/alfa-smart/showcase-manage.png',
        backgroundColor: '#D1D7E3',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute left-[-5.05%] top-[12.69%] h-[74.61%] w-[110.09%] max-w-none',
      },
    },
    {
      id: 'alfa-structured-invite',
      artifactId: 'alfa-invite',
      title: 'Приглашение участников',
      description: 'Чтобы добавить участника владельцу, нужно ввести номер телефона',
      width: 252,
      preview: {
        src: '/cases/alfa-smart/showcase-invite.png',
        backgroundColor: '#E7EBF6',
        borderColor: '#D1D7E3',
        imageClassName: 'absolute inset-0 h-full w-full max-w-none rounded-[24px] object-contain',
      },
    },
    {
      id: 'alfa-structured-members',
      artifactId: 'alfa-members',
      title: 'Управление участниками',
      description: 'Владелец подписки может удалять и добавлять новых участников',
      width: 252,
      preview: {
        src: '/cases/alfa-smart/showcase-members.png',
        backgroundColor: '#E7EBF6',
        borderColor: '#D1D7E3',
        imageClassName: 'absolute inset-0 h-full w-full max-w-none rounded-[24px] object-contain',
      },
    },
  ],
  resultsTitle: 'Результаты',
  resultsBody:
    'Решение запустили на iOS, Android и web. Важны не просто цифры, а то, что кейс показывает переход от сложного продуктового сценария к рабочему релизу с понятным влиянием на активацию и monetization.',
  resultMetrics: [
    { value: '32 111', label: 'активных подписчиков' },
    { value: '30%', label: 'владельцы с участниками' },
    { value: '1,1 млн ₽', label: 'доход' },
  ],
  footerAction: {
    label: 'Написать Андрею',
    action: { type: 'open_contact_modal', source: 'alfa-smart-summary' },
  },
};

export const alfaSmartCase: CaseContent = {
  id: 'alfa-smart',
  shortTitle: 'Альфа-Смарт',
  title: 'Альфа-Смарт — семейная подписка на банковские продукты',
  railSubtitle: 'Флагманский кейс',
  shortDescription: 'Семейная подписка Альфа-Банка с измеримым результатом',
  category: 'flagship',
  tags: ['Финтех', 'Mobile', 'Web', 'B2C'],
  summaryTitle: 'Короткий ответ',
  detailTitle: 'Развернутый ответ',
  routeTitle: 'Почему этот кейс стоит открыть первым',
  resultChips: ['32 111 подписчиков', '30% владельцев с участниками', '1,1 млн ₽ дохода'],
  metrics: [
    { value: '32 111', label: 'подписчиков' },
    { value: '30%', label: 'владельцы с участниками' },
    { value: '1,1 млн ₽', label: 'доход' },
  ],
  role: 'Product Designer',
  roleDescription: 'UX/UI, User Flow, прототипы, тестирование, дизайн-чек, передача в разработку',
  summaryBlocks: [
    {
      type: 'lead',
      title: 'Что это за продукт',
      body: [
        'Альфа-Смарт — семейная подписка Альфа-Банка на банковские продукты. Она должна была удерживать текущих клиентов и давать владельцу понятный способ подключать близких к преимуществам.',
      ],
    },
    {
      type: 'section',
      title: 'Роль Андрея',
      body: [
        'Разобрал требования, собрал User Flow и первые макеты, подготовил гипотезы для тестов, прошел дизайн-чек и передал решение в разработку.',
      ],
    },
    { type: 'disclosures', title: 'Что именно было сделано', items: alfaDisclosures },
    { type: 'gallery', title: 'Ключевые интерфейсные решения', items: makeGallery([
      { id: 'alfa-landing', title: 'Лендинг подписки', description: 'Показывает продуктовую ценность до входа в сценарий подключения.' },
      { id: 'alfa-manage', title: 'Экран управления', description: 'Дает владельцу контроль над подпиской и участниками.' },
      { id: 'alfa-invite', title: 'Приглашение участников', description: 'Упрощает добавление близких в семейный сценарий.' },
      { id: 'alfa-members', title: 'Управление участниками', description: 'Закрывает post-purchase сценарий без хаоса.' },
    ]) },
    { type: 'metrics', title: 'Результат', items: [
      { value: '32 111', label: 'подписчиков' },
      { value: '30%', label: 'владельцы с участниками' },
      { value: '1,1 млн ₽', label: 'доход' },
    ] },
  ],
  detailBlocks: [
    {
      type: 'lead',
      title: 'Почему кейс сильный',
      body: [
        'Здесь видно не просто интерфейсную работу, а нормальную продуктовую логику: требования, гипотезы, тестирование, релиз и измеримый результат.',
      ],
    },
    {
      type: 'section',
      title: 'Контекст',
      body: [
        'Подписка была встроена в mobile, web и смежные продукты банка. Ошибка в сценарии подключения близких била не по одному экрану, а по всей модели удержания.',
      ],
    },
    {
      type: 'bullet_list',
      title: 'Что делал Андрей',
      items: [
        'Разобрал требования и ограничения бизнеса.',
        'Собрал пользовательские сценарии от лендинга до управления участниками.',
        'Подготовил гипотезы и прототип для тестирования.',
        'Прошел дизайн-чек и передал решение в разработку.',
      ],
    },
    { type: 'disclosures', title: 'Подтверждения', items: alfaDisclosures },
    { type: 'gallery', title: 'Интерфейсные решения', items: makeGallery([
      { id: 'alfa-landing', title: 'Лендинг подписки', description: 'Показывает преимущества до действия.' },
      { id: 'alfa-manage', title: 'Экран управления', description: 'Собирает ключевые post-purchase действия.' },
      { id: 'alfa-invite', title: 'Приглашение участников', description: 'Убирает лишнее трение в основном сценарии.' },
      { id: 'alfa-members', title: 'Управление участниками', description: 'Закрывает lifecycle после подключения.' },
    ]) },
    { type: 'cta', label: 'Связаться по этому кейсу', action: { type: 'open_contact_modal', source: 'alfa-smart-detail' } },
  ],
  routeBlocks: [
    {
      type: 'lead',
      title: 'Почему стоит открыть Альфа-Смарт',
      body: [
        'Это самый убедительный кейс для первого впечатления: здесь есть продуктовая сложность, роль, артефакты и нормальные метрики.',
      ],
    },
    { type: 'chips', title: 'Следующий шаг', items: [
      { id: 'alfa-short', label: 'Короткий ответ', action: { type: 'open_case_summary', caseId: 'alfa-smart' } },
      { id: 'alfa-detail', label: 'Развернутый ответ', action: { type: 'open_case_detail', caseId: 'alfa-smart' } },
    ] },
  ],
  disclosures: alfaDisclosures,
  artifacts: [
    { id: 'alfa-miro', title: 'Miro-структура', caption: 'Каркас продукта и роли до начала экранов.', imageUrl: '/cases/alfa-smart/disclosure-requirements.png', sourceLabel: 'Miro' },
    { id: 'alfa-prototype', title: 'Прототип для тестов', caption: 'Основа для проверки ключевых гипотез.', imageUrl: '/cases/alfa-smart/disclosure-testing-2.png', sourceLabel: 'Figma' },
    { id: 'alfa-ui', title: 'UI flows', caption: 'Итоговые сценарии, дошедшие до реализации.', imageUrl: '/cases/alfa-smart/showcase-landing.png', sourceLabel: 'Figma' },
    { id: 'alfa-requirements-map', title: 'Структура продукта в Miro', caption: 'Роли, сценарии и конфликтные точки до отрисовки экранов.', imageUrl: '/cases/alfa-smart/disclosure-requirements.png' },
    { id: 'alfa-user-flow', title: 'User-Flow первого входа в продукт', caption: 'Согласованный путь пользователя на входе в семейный сценарий.', imageUrl: '/cases/alfa-smart/disclosure-userflow-1.png' },
    { id: 'alfa-first-designs', title: 'Первые варианты дизайна подписки', caption: 'Ранние драфты подписки до перехода в mobile-first решение.', imageUrl: '/cases/alfa-smart/disclosure-userflow-2.png' },
    { id: 'alfa-test-hypotheses', title: 'Гипотезы для тестирования', caption: 'Список гипотез для UX-лаборатории перед тестами.', imageUrl: '/cases/alfa-smart/disclosure-testing-1.png' },
    { id: 'alfa-test-prototypes', title: 'Прототипы для тестирования', caption: 'Тяжелые компоненты переведены в изображения ради мобильного теста.', imageUrl: '/cases/alfa-smart/disclosure-testing-2.png' },
    { id: 'alfa-design-check', title: 'Дизайн-чек', caption: 'Два аппрува и правки до передачи в разработку.', imageUrl: '/cases/alfa-smart/disclosure-delivery-1.png' },
    { id: 'alfa-dev-handoff', title: 'Передача макетов разработчикам', caption: 'Макеты структурированы по пути пользователя.', imageUrl: '/cases/alfa-smart/disclosure-delivery-2.png' },
    { id: 'alfa-design-review', title: 'Дизайн-ревью макетов', caption: 'Проверка сверстанных экранов после реализации.', imageUrl: '/cases/alfa-smart/disclosure-delivery-3.png' },
    { id: 'alfa-landing', title: 'Лендинг подписки', caption: 'Когда пользователь переходит к подписке он видит лендинг со всеми преимуществами', imageUrl: '/cases/alfa-smart/showcase-landing.png' },
    { id: 'alfa-manage', title: 'Экран управления', caption: 'После того, как клиент подключил подписку, он видит экран управления', imageUrl: '/cases/alfa-smart/showcase-manage.png' },
    { id: 'alfa-invite', title: 'Приглашение участников', caption: 'Чтобы добавить участника владельцу, нужно ввести номер телефона', imageUrl: '/cases/alfa-smart/showcase-invite.png' },
    { id: 'alfa-members', title: 'Управление участниками', caption: 'Владелец подписки может удалять и добавлять новых участников', imageUrl: '/cases/alfa-smart/showcase-members.png' },
  ],
  gallery: makeGallery([
    { id: 'alfa-landing', title: 'Лендинг подписки', description: 'Показывает преимущества до действия.' },
    { id: 'alfa-manage', title: 'Экран управления', description: 'Собирает ключевые post-purchase действия.' },
    { id: 'alfa-invite', title: 'Приглашение участников', description: 'Убирает лишнее трение.' },
    { id: 'alfa-members', title: 'Управление участниками', description: 'Закрывает lifecycle после подключения.' },
  ]),
  contextPanel: {
    headerLabel: 'Контекст проекта',
    title: 'Альфа-Смарт',
    subtitle: 'Mobile · Web · B2C',
    tags: ['Финтех', 'Платежи', 'Личные финансы', 'Подписка'],
    metricsTitle: 'Ключевые метрики',
    metrics: [
      { value: '32 111', label: 'подписчиков' },
      { value: '30%', label: 'владельцы с участниками' },
      { value: '1,1 млн', label: '₽ доход' },
      { value: '15 июля', label: 'доступно массовым клиентам' },
    ],
    role: 'Product Designer',
    roleTitle: 'Моя роль: Product Designer',
    roleDescription: 'UX/UI, User Flow, прототип, тестирование, дизайн-чек, передача в разработку',
    preview: {
      src: '/cases/alfa-smart/context.png',
      backgroundColor: '#D1D7E3',
      imageClassName: 'absolute max-w-none object-contain rounded-[24px] size-full',
      frameRadius: 24,
      bordered: false,
    },
  },
  structuredSummary: alfaStructuredSummary,
  followUpChips: [],
};
