import type {
  AdditionalCasesContent,
  CaseContent,
  ContactContent,
  ContentBlock,
  ContextPanelData,
  DisclosureRow,
  EntryContent,
  ExperienceContent,
  GalleryItem,
  HiringGuidesContent,
  MobileOverviewContent,
  PortfolioContent,
  PromptChip,
  RailItem,
  StructuredCaseSummaryData,
  StructuredExperienceSummaryData,
} from '@/lib/portfolio/types';

const railItems: RailItem[] = [
  { id: 'alfa-smart', label: 'Альфа-Смарт', subtitle: 'Подписка на банковские продукты', kind: 'case' },
  { id: 'chatpoint', label: 'ChatPoint', subtitle: 'Платформа для коммуникации', kind: 'case' },
  { id: 'siebel', label: 'SIEBEL', subtitle: 'CRM для службы поддержки', kind: 'case' },
  { id: 'expenses-card-holders', label: 'Расходы держателей', subtitle: 'Добавление точки входа', kind: 'case' },
  { id: 'subscription-sharing', label: 'Шаринг подписки', subtitle: 'Улучшение флоу добавления участников', kind: 'case' },
  { id: 'ux-ui-wannabelike', label: 'UX/UI WannabeLike', subtitle: 'Прохождение курса Миши Розова по UI', kind: 'case' },
  { id: 'experience', label: 'Опыт работы', subtitle: 'Где работал Андрей и какие были результаты', kind: 'experience' },
];

const contactOptions: ContactContent = {
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
    {
      id: 'email',
      label: 'Написать на e-mail',
      helper: 'Может быть ответит, а может и нет 😅',
      href: 'mailto:Edvardho@list.ru',
    },
  ],
};

const entry: EntryContent = {
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

const makeGallery = (items: Array<{ id: string; title: string; description: string }>): GalleryItem[] =>
  items.map((item) => ({
    id: item.id,
    artifactId: item.id,
    title: item.title,
    description: item.description,
  }));

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

const alfaCase: CaseContent = {
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

const siebelDisclosures: DisclosureRow[] = [
  {
    id: 'siebel-research',
    title: 'Не пошел в редизайн по ощущениям',
    summary: 'Сначала посмотрел реальные записи операторов и собрал гипотезы.',
    details: [
      'Изначально задача звучала как редизайн, но это был бы дешевый и бесполезный ход.',
      'Просмотр записей дал фактуру: два окна, шаблоны, хаос с поиском данных о клиенте.',
    ],
    artifactIds: ['siebel-hypotheses', 'siebel-old-ui'],
  },
  {
    id: 'siebel-two-windows',
    title: 'Пересобрал режим работы в двух окнах',
    summary: 'Убрал путаницу с активным окном и лишнее время на переключение.',
    details: [
      'Операторы буквально теряли секунды и концентрацию на банальном выборе активного окна.',
      'Эта мелочь выглядела локальной, но била по общему времени обработки диалога.',
    ],
    artifactIds: ['siebel-two-windows'],
  },
  {
    id: 'siebel-data',
    title: 'Вынес критичные данные о клиенте в рабочее место',
    summary: 'Сократил время поиска информации за счет внутренней панели данных.',
    details: [
      'До изменений операторы держали открытыми до пяти внешних окон помимо чата.',
      'После переноса ключевой информации в рабочее место сократилось и время поиска, и время ответа.',
    ],
    artifactIds: ['siebel-customer-data'],
  },
  {
    id: 'siebel-validation',
    title: 'Проверил MVP до rollout',
    summary: 'Сначала A/B на операторах, потом масштабирование и weekly feedback loop.',
    details: [
      'Это важная часть кейса: решение не просто согласовали, а проверили на реальной работе операторов.',
      'После релиза команда продолжила weekly sync с бизнесом и операторами и собирала список доработок.',
    ],
  },
];

const siebelStructuredSummary: StructuredCaseSummaryData = {
  intro: {
    title: 'О продукте',
    body: 'SIEBEL — внутренний интерфейс операторов поддержки МТС.\nИзначально задачей было сделать редизайн, но Андрей провел исследования. Собрав обратную связь он переделал не только интерфейс но и улучшил пользовательский путь операторов в приложении.',
    preview: {
      src: '/cases/siebel/intro-preview.png',
      backgroundColor: '#D1D7E3',
      borderColor: '#EBEDF2',
      imageClassName: 'absolute left-[-45.67%] top-[9.01%] h-[121.17%] w-[150.6%] max-w-none',
    },
  },
  sections: [
    {
      title: 'Что это был за продукт',
      body: 'Enterprise-интерфейс для обработки входящих обращений. Чем дольше оператор отвечает на один диалог, тем дольше ждут остальные клиенты и тем выше нагрузка на штат.',
    },
    {
      title: 'Роль Андрея',
      body: 'Product Designer: посмотрел 12 записей работы операторов, собрал гипотезы, провел интервью, согласовал проблемы с продактами и довел ключевые изменения до релиза.',
    },
  ],
  disclosureTitle: 'Что сделал Андрей',
  disclosures: [
    {
      id: 'siebel-structured-research',
      label: 'Инициировал исследования перед началом работы над редизайном',
      body: 'Вместо редизайна по ощущениям Андрей изучил около 12 записей работы операторов в старом интерфейсе, собрал гипотезы и провел интервью. Это помогло увидеть, что главная проблема не в визуале, а во времени поиска информации и переключениях между системами.',
      layoutType: 'single_preview',
      cards: [
        {
          id: 'siebel-structured-research-card',
          artifactId: 'siebel-hypotheses',
          width: 462,
          preview: {
            src: '/cases/siebel/disclosure-research.png',
            backgroundColor: '#F7F8FC',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute left-0 top-[-5.02%] h-[106.67%] w-full max-w-none',
          },
        },
      ],
    },
    {
      id: 'siebel-structured-workflow',
      label: 'Переработал основной workflow оператора',
      body: 'Проблемы были взаимосвязаны: оператор путался между двумя окнами и тратил время на поиск контекста в пяти внешних источниках. Поэтому Андрей пересобрал режим параллельной работы и вынес ключевые данные о клиенте в само рабочее место.',
      layoutType: 'two_cards',
      cards: [
        {
          id: 'siebel-structured-workflow-card-1',
          artifactId: 'siebel-two-windows',
          title: 'Режим работы в двух окнах',
          description: 'Сделан более явный акцент на активном окне, в котором оператор ведет диалог.',
          width: 389,
          preview: {
            src: '/cases/siebel/disclosure-workflow-two-window.png',
            backgroundColor: '#D1D7E3',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute left-[4.72%] top-[8.38%] h-[93.79%] w-[90.57%] max-w-none',
          },
        },
        {
          id: 'siebel-structured-workflow-card-2',
          artifactId: 'siebel-customer-data',
          title: 'Данные о клиенте',
          description: 'Перенесены в окно оператора, что позволило сэкономить время на поиск информации о клиенте',
          width: 389,
          preview: {
            src: '/cases/siebel/disclosure-workflow-client-data.png',
            backgroundColor: '#F7F8FC',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute inset-0 h-full w-full max-w-none rounded-[24px] object-contain',
            overlaySrc: '/cases/siebel/disclosure-workflow-client-data-overlay.png',
            overlayImageClassName: 'absolute inset-0 h-full w-full max-w-none rounded-[24px] object-cover',
          },
        },
      ],
    },
    {
      id: 'siebel-structured-repeat-actions',
      label: 'Упростил повторяющиеся действия в ежедневной работе',
      body: 'Операторы часто пользовались шаблонами, поэтому важно было ускорить повторяющиеся ответы и не перегрузить интерфейс новой логикой. Решение встроили в общий workflow, чтобы ответы стали быстрее и стабильнее в ежедневной работе.',
      layoutType: 'two_cards',
      cards: [
        {
          id: 'siebel-structured-repeat-card-1',
          artifactId: 'siebel-templates',
          title: 'Шаблоны ответов',
          description: 'Быстрый доступ к частым ответам без лишнего ручного копирования.',
          width: 389,
          preview: {
            src: '/cases/siebel/disclosure-repeat-templates.png',
            backgroundColor: '#F7F8FC',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute inset-0 h-full w-full max-w-none rounded-[24px] object-cover',
          },
        },
        {
          id: 'siebel-structured-repeat-card-2',
          artifactId: 'siebel-search',
          title: 'Поиск шаблона',
          description: 'У операторов насчитывалось 100+ шаблонов. Для сокращения времени поиска нужного, был реализован поиск по ключевым словам',
          width: 389,
          preview: {
            src: '/cases/siebel/disclosure-repeat-search.png',
            backgroundColor: '#F7F8FC',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute left-0 top-[-7.86%] h-[112.71%] w-full max-w-none',
            overlaySrc: '/cases/siebel/disclosure-repeat-search-overlay.png',
            overlayImageClassName: 'absolute inset-0 h-full w-full max-w-none rounded-[24px] object-cover',
          },
        },
      ],
    },
    {
      id: 'siebel-structured-rollout',
      label: 'Проверил MVP и довел изменения до релиза',
      body: 'MVP протестировали через A/B на операторах, а после релиза раз в неделю собирали обратную связь с бизнесом, менеджерами и операторами и превращали ее в backlog доработок. Это позволило не только запустить изменения, но и стабильно улучшать их дальше.',
      layoutType: 'single_preview',
      cards: [
        {
          id: 'siebel-structured-rollout-card',
          artifactId: 'siebel-mvp-release',
          title: 'Лендинг',
          description: 'Маркетинговую оболочку команды собрали слишком поздно — уже после накачки фичами.',
          width: 462,
          preview: {
            src: '/cases/siebel/disclosure-mvp-release.png',
            backgroundColor: '#111827',
            borderColor: '#111827',
            imageClassName: 'absolute inset-0 h-full w-full max-w-none rounded-[24px] object-contain',
          },
        },
      ],
    },
  ],
  showcaseTitle: 'Ключевые артефакты',
  showcaseRowWidth: 1009.333,
  showcasePeekWidth: 158,
  showcaseItems: [
    {
      id: 'siebel-structured-showcase-old-interface',
      artifactId: 'siebel-old-ui',
      title: 'Старый интерфейс',
      description: 'Исходная точка: оператор держал открытыми чат и несколько отдельных окон с данными',
      width: 252,
      preview: {
        src: '/cases/siebel/showcase-old-interface.png',
        backgroundColor: '#F7F8FC',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute left-0 top-0 h-full w-[171.88%] max-w-none',
      },
    },
    {
      id: 'siebel-structured-showcase-two-window',
      artifactId: 'siebel-two-windows',
      title: '2-window mode',
      description: 'Режим параллельной работы без путаницы между активными диалогами',
      width: 252,
      preview: {
        src: '/cases/siebel/showcase-two-window.png',
        backgroundColor: '#D1D7E3',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute left-[5.84%] top-[9.29%] h-[81.41%] w-[88.32%] max-w-none',
      },
    },
    {
      id: 'siebel-structured-showcase-client-data',
      artifactId: 'siebel-customer-data',
      title: 'Данные о клиенте',
      description: 'Ключевой контекст перенесен в основное рабочее окно оператора',
      width: 252,
      preview: {
        src: '/cases/siebel/showcase-client-data.png',
        backgroundColor: '#D1D7E3',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute left-[5.53%] top-[9%] h-[81.99%] w-[88.95%] max-w-none',
      },
    },
    {
      id: 'siebel-structured-showcase-templates',
      artifactId: 'siebel-templates',
      title: 'Шаблоны ответов',
      description: 'Пересобрал навигацию в быстрых ответах и разбили их на группы',
      width: 252,
      preview: {
        src: '/cases/siebel/showcase-templates.png',
        backgroundColor: '#D1D7E3',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute left-[5.12%] top-[8.63%] h-[82.74%] w-[89.75%] max-w-none',
      },
    },
  ],
  resultsTitle: 'Что важно понять',
  resultsBody:
    'Андрей не пошел в поверхностный редизайн: он исследовал реальную работу операторов, собрал гипотезы, проверил MVP и довел изменения до релиза с измеримым эффектом.',
  resultMetrics: [
    { value: 'Research', label: '12 записей и интервью задали список гипотез' },
    { value: 'Impact', label: 'время обработки: 900 сек → 580 сек' },
    { value: 'Rollout', label: 'A/B проверка MVP и релиз всех ключевых фич' },
  ],
  footerAction: {
    label: 'Написать Андрею',
    action: { type: 'open_contact_modal', source: 'siebel-summary' },
  },
};

const siebelCase: CaseContent = {
  id: 'siebel',
  shortTitle: 'SIEBEL',
  title: 'SIEBEL — редизайн операторского интерфейса через исследование',
  railSubtitle: 'Enterprise workflow',
  shortDescription: 'Пересборка операторского workflow с измеримым влиянием на время ответа',
  category: 'primary',
  tags: ['Enterprise', 'B2B', 'Workflow', 'Research'],
  summaryTitle: 'Короткий ответ',
  detailTitle: 'Развернутый ответ',
  routeTitle: 'Почему SIEBEL — не просто редизайн',
  resultChips: ['-320 сек / диалог', 'x2 диалогов', 'research-driven'],
  metrics: [
    { value: '900 → 580 сек', label: 'время обработки диалога' },
    { value: '1 000 → 2 000', label: 'обрабатываемых диалогов' },
  ],
  role: 'Product Designer',
  roleDescription: 'Исследование, гипотезы, workflow redesign, validation, handoff',
  summaryBlocks: [
    {
      type: 'lead',
      title: 'Сильная часть кейса',
      body: [
        'Изначально это называли редизайном, но я перевел задачу в продуктовую плоскость: сначала исследование операторов, потом гипотезы, потом изменения, потом проверка на MVP.',
      ],
    },
    {
      type: 'section',
      title: 'Главная проблема',
      body: [
        'Операторы отвечали слишком долго, потому что держали несколько окон и искали данные о клиентах в разных системах.',
      ],
    },
    { type: 'disclosures', title: 'Что именно было сделано', items: siebelDisclosures },
    { type: 'metrics', title: 'Результат', items: [
      { value: '≈900 сек', label: 'было на диалог' },
      { value: '≈580 сек', label: 'стало на диалог' },
      { value: '≈2 000', label: 'обрабатываемых диалогов после' },
    ] },
    { type: 'gallery', title: 'Ключевые интерфейсные изменения', items: makeGallery([
      { id: 'siebel-old-ui', title: 'Старый интерфейс', description: 'Показывает исходную сложность рабочего места.' },
      { id: 'siebel-two-windows', title: 'Работа в двух окнах', description: 'Убирает путаницу с активным диалогом.' },
      { id: 'siebel-customer-data', title: 'Данные о клиенте', description: 'Сокращают время поиска.' },
      { id: 'siebel-templates', title: 'Шаблоны', description: 'Ускоряют повторяющиеся ответы.' },
    ]) },
  ],
  detailBlocks: [
    {
      type: 'lead',
      title: 'Почему кейс сильный',
      body: [
        'Это кейс не про “перекрасил enterprise-интерфейс”, а про то, как из расплывчатого запроса на редизайн сделать исследовательски обоснованное решение с измеримым эффектом.',
      ],
    },
    {
      type: 'bullet_list',
      title: 'Что делал Андрей',
      items: [
        'Инициировал исследование вместо поверхностного редизайна.',
        'Просмотрел порядка 12 записей операторов и собрал гипотезы.',
        'Провел интервью, согласовал проблемы с продактами и разбил их на задачи для разработки.',
        'Проверил MVP через A/B до массового rollout.',
      ],
    },
    { type: 'disclosures', title: 'Доказательства', items: siebelDisclosures },
    { type: 'gallery', title: 'Артефакты', items: makeGallery([
      { id: 'siebel-hypotheses', title: 'Гипотезы улучшения', description: 'Показывают, как исследование превратилось в backlog.' },
      { id: 'siebel-two-windows', title: '2-window mode', description: 'Решение одной из самых дорогих операционных болей.' },
      { id: 'siebel-customer-data', title: 'Панель данных клиента', description: 'Сокращает time-to-information.' },
      { id: 'siebel-templates', title: 'Шаблоны ответов', description: 'Ускоряют повторяемые действия.' },
    ]) },
    { type: 'cta', label: 'Связаться по этому кейсу', action: { type: 'open_contact_modal', source: 'siebel-detail' } },
  ],
  routeBlocks: [
    {
      type: 'lead',
      title: 'Почему здесь есть что смотреть',
      body: [
        'SIEBEL важен не тем, что это внутренний продукт, а тем, что он показывает редкую для дизайнеров дисциплину: исследование, гипотезы, валидированный rollout и цифры.',
      ],
    },
    { type: 'chips', title: 'Открыть', items: [
      { id: 'siebel-short', label: 'Короткий ответ', action: { type: 'open_case_summary', caseId: 'siebel' } },
      { id: 'siebel-detail', label: 'Развернутый ответ', action: { type: 'open_case_detail', caseId: 'siebel' } },
    ] },
  ],
  disclosures: siebelDisclosures,
  artifacts: [
    { id: 'siebel-hypotheses', title: 'Исследование перед редизайном', caption: 'Гипотезы после просмотра записей работы операторов.', imageUrl: '/cases/siebel/disclosure-research.png', sourceLabel: 'Research' },
    { id: 'siebel-two-windows', title: 'Работа в 2 окнах', caption: 'Пересборка режима с двумя диалогами.', imageUrl: '/cases/siebel/disclosure-workflow-two-window.png', sourceLabel: 'Figma' },
    { id: 'siebel-customer-data', title: 'Данные о клиенте', caption: 'Вынесенные в рабочее место данные.', imageUrl: '/cases/siebel/disclosure-workflow-client-data.png', sourceLabel: 'Figma' },
    { id: 'siebel-templates', title: 'Работа с шаблонами', caption: 'Сокращение времени на повторяющиеся ответы.', imageUrl: '/cases/siebel/disclosure-repeat-templates.png', sourceLabel: 'Figma' },
    { id: 'siebel-search', title: 'Поиск шаблона', caption: 'Ускорение выбора нужного ответа в ежедневной работе.', imageUrl: '/cases/siebel/disclosure-repeat-search.png', sourceLabel: 'Figma' },
    { id: 'siebel-mvp-release', title: 'Проверка MVP', caption: 'A/B проверка и rollout ключевых изменений.', imageUrl: '/cases/siebel/disclosure-mvp-release.png', sourceLabel: 'Rollout' },
    { id: 'siebel-old-ui', title: 'Старый интерфейс', caption: 'Контраст с исходным сценарием.', imageUrl: '/cases/siebel/showcase-old-interface.png', sourceLabel: 'Legacy UI' },
  ],
  gallery: makeGallery([
    { id: 'siebel-old-ui', title: 'Старый интерфейс', description: 'Исходная сложность рабочего места.' },
    { id: 'siebel-two-windows', title: '2-window mode', description: 'Убирает путаницу с активным окном.' },
    { id: 'siebel-customer-data', title: 'Данные о клиенте', description: 'Сокращают время поиска.' },
    { id: 'siebel-templates', title: 'Шаблоны', description: 'Ускоряют повторяющиеся ответы.' },
  ]),
  contextPanel: {
    headerLabel: 'Контекст проекта',
    title: 'SIEBEL',
    subtitle: 'Web · Enterprise · Support Ops',
    tags: ['Enterprise', 'Research', 'Workflow', 'A/B test'],
    metricsTitle: 'Что важно',
    metrics: [
      { value: '12', label: 'записей работы операторов' },
      { value: '-320s', label: 'на один диалог после релиза' },
      { value: 'x2', label: 'обрабатываемых диалогов' },
      { value: 'Ship', label: 'все ключевые фичи в релизе' },
    ],
    role: 'Product Designer',
    roleTitle: 'Моя роль: Product Designer',
    roleDescription: 'Research, hypotheses, workflow redesign, A/B validation, handoff',
    preview: {
      src: '/cases/siebel/context.png',
      backgroundColor: '#D1D7E3',
      imageClassName: 'absolute h-[127.72%] w-[193.52%] max-w-none left-[-75.94%] top-[-1.28%]',
      frameRadius: 24,
      bordered: true,
    },
  },
  structuredSummary: siebelStructuredSummary,
  followUpChips: [],
};

const chatpointDisclosures: DisclosureRow[] = [
  {
    id: 'chatpoint-onboarding',
    title: 'Упросил флоу подключение канала Messages for Business',
    summary: 'Убрал необходимость читать длинный документ и ждать отдельного менеджера.',
    details: [
      'Пользователь не должен читать длинный документ или ждать отдельного менеджера.',
      'Андрей проходил все сценарии подключения каналов связи и после этого собрал сценарий, который вел человека по сложному подключению шаг за шагом и снимал ощущение, что он остался один на один с интеграцией.',
    ],
    artifactIds: ['chatpoint-apple-onboarding'],
  },
  {
    id: 'chatpoint-routing',
    title: 'Настройка маршрутизации и системные сценарии',
    summary: 'Не просто настройки, а предсказуемый способ управлять потоком обращений.',
    details: [
      'Это был B2B-интерфейс с высокой плотностью информации: важно было не просто показать настройки, а дать операторам и администраторам предсказуемый способ управлять потоком обращений.',
    ],
    artifactIds: ['chatpoint-routing', 'chatpoint-system-settings'],
  },
  {
    id: 'chatpoint-anti',
    title: 'Анти-кейс: реализация функционала Form Messages',
    summary: 'Сценарий оказался удобным в UI, но ошибочным по продуктовой ценности.',
    details: [
      'Продакт инициировал сценарий ради требований Apple. Я сделал side-panel flow понятным и протестировал его, но исследование показало: клиентам нужнее быстрые шаблоны, а не дорогая кастомная анкета.',
    ],
    artifactIds: ['chatpoint-form-messages', 'chatpoint-operator-window'],
  },
  {
    id: 'chatpoint-what-i-would-change',
    title: 'Что бы я сделал иначе сегодня',
    summary: 'Начал бы с проверки PMF и ценности до очередной enterprise-фичи.',
    details: [
      'Продукт не взлетел не потому, что интерфейсы были плохими. Команда слишком рано сосредоточилась на разработке, не проверив востребованность.',
      'Сейчас я бы начал с проверки востребованности (PMF), карты пути пользователя (CJM) и приоритизации ценности до проектирования очередной сложной функции.',
    ],
    artifactIds: ['chatpoint-landing', 'chatpoint-purchase-path', 'chatpoint-dialog-window'],
  },
];

const chatpointStructuredSummary: StructuredCaseSummaryData = {
  intro: {
    title: 'О продукте',
    body: 'ChatPoint — B2B-платформа для общения бизнеса с клиентами через мессенджеры и другие каналы. Этот кейс важен не рыночным успехом, а тем, что показывает: Андрей проектировал сложный интерфейс и видел, где продукт теряет ценность.',
    preview: {
      src: '/cases/chatpoint/intro-preview.png',
      backgroundColor: '#D1D7E3',
      borderColor: '#EBEDF2',
      imageClassName: 'absolute left-[-12.24%] top-[16.6%] h-full w-[160.32%] max-w-none',
    },
  },
  sections: [
    {
      title: 'Что это был за продукт',
      body: 'Платформа должна была собрать в одном интерфейсе Apple Messages for Business, WhatsApp, Telegram, Viber, VK, Одноклассники и почту, чтобы бизнес не терял обращения и не держал отдельный процесс под каждый канал.',
    },
    {
      title: 'Роль Андрея',
      body: 'Product Designer: проектировал сложные B2B-флоу: окно оператора, настройку маршрутизации, подключения каналов, activation-сценарии. Андрей проводил коридорные тесты и спорил за ценность решение, а не отвечал только за интерфейс.',
    },
  ],
  disclosureTitle: 'Что делал Андрей',
  disclosures: [
    {
      id: 'chatpoint-structured-onboarding',
      label: 'Упросил флоу подключение канала Messages for Business',
      body: 'Пользователь не должен читать длинный документ или ждать отдельного менеджера. Андрей проходил все сценарии подключения каналов связи и после этого собрал сценарий, который вел человека по сложному подключению шаг за шагом и снимал ощущение, что он остался один на один с интеграцией.',
      layoutType: 'single_preview',
      cards: [
        {
          id: 'chatpoint-structured-onboarding-card',
          artifactId: 'chatpoint-apple-onboarding',
          width: 462,
          preview: {
            src: '/cases/chatpoint/disclosure-apple-onboarding.png',
            backgroundColor: '#FFFFFF',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute left-0 top-0 h-[133.86%] w-full max-w-none',
          },
        },
      ],
    },
    {
      id: 'chatpoint-structured-routing',
      label: 'Настройка маршрутизации и системные сценарии',
      body: 'Это был B2B-интерфейс с высокой плотностью информации: важно было не просто показать настройки, а дать операторам и администраторам предсказуемый способ управлять потоком обращений.',
      layoutType: 'two_cards',
      cards: [
        {
          id: 'chatpoint-structured-routing-card',
          artifactId: 'chatpoint-routing',
          title: 'Маршрутизация диалогов',
          description: 'Логика распределения обращений между очередями, сотрудниками и сценариями.',
          width: 389,
          preview: {
            src: '/cases/chatpoint/disclosure-routing.png',
            backgroundColor: '#FFFFFF',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute inset-0 size-full max-w-none rounded-[24px] object-cover',
          },
        },
        {
          id: 'chatpoint-structured-settings-card',
          artifactId: 'chatpoint-system-settings',
          title: 'Настройка сценариев',
          description: 'Системные правила и high-density настройки без декоративного шума.',
          width: 389,
          preview: {
            src: '/cases/chatpoint/disclosure-system-settings.png',
            backgroundColor: '#D1D7E3',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute left-0 top-[2.86%] h-[80%] w-full max-w-none',
          },
        },
      ],
    },
    {
      id: 'chatpoint-structured-anti',
      label: 'Анти-кейс: реализация функционала Form Messages',
      body: 'Продакт инициировал сценарий ради требований Apple. Я сделал side-panel flow понятным и протестировал его, но исследование показало: клиентам нужнее быстрые шаблоны, а не дорогая кастомная анкета.',
      layoutType: 'two_cards',
      cards: [
        {
          id: 'chatpoint-structured-anti-card',
          artifactId: 'chatpoint-form-messages',
          title: 'Form Messages',
          description: 'Настройка анкеты в side-panel: удобно, но не там лежала реальная ценность.',
          width: 389,
          preview: {
            src: '/cases/chatpoint/disclosure-form-messages.png',
            backgroundColor: '#FFFFFF',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute inset-0 size-full max-w-none rounded-[24px] object-cover',
          },
        },
        {
          id: 'chatpoint-structured-anti-operator-card',
          artifactId: 'chatpoint-operator-window',
          title: 'Окно оператора',
          description: 'Контекст, в котором оператор выбирал сущность сообщения и отправлял форму клиенту.',
          width: 389,
          preview: {
            src: '/cases/chatpoint/disclosure-operator-window.png',
            backgroundColor: '#FFFFFF',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute left-0 top-[-7.86%] h-[112.71%] w-full max-w-none',
          },
        },
      ],
    },
    {
      id: 'chatpoint-structured-what-i-would-change',
      label: 'Что бы я сделал иначе сегодня',
      body: 'Продукт не взлетел не потому, что интерфейсы были плохими. Команда слишком рано ушла в разработку. Сейчас я бы начал с проверки востребованности (PMF), карты пути пользователя (CJM) и приоритизации ценности до проектирования очередной сложной функции.',
      layoutType: 'three_cards_scroll',
      rowWidth: 1207,
      peekWidth: 158,
      cards: [
        {
          id: 'chatpoint-structured-landing-card',
          artifactId: 'chatpoint-landing',
          title: 'Лендинг',
          description: 'Маркетинговую оболочку команды собрали слишком поздно — уже после накачки фичами.',
          width: 389,
          preview: {
            src: '/cases/chatpoint/disclosure-landing.png',
            backgroundColor: '#D1D7E3',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute left-[5.38%] top-[6.77%] h-[147.5%] w-[89.24%] max-w-none',
          },
        },
        {
          id: 'chatpoint-structured-purchase-path-card',
          artifactId: 'chatpoint-purchase-path',
          title: 'Путь покупки',
          description: 'Только потом стали разбираться, где именно продукт должен предлагать ценность клиенту.',
          width: 389,
          preview: {
            src: '/cases/chatpoint/disclosure-purchase-path.png',
            backgroundColor: '#D1D7E3',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute left-[1.06%] top-[2.65%] h-[97.35%] w-[97.15%] max-w-none',
          },
        },
        {
          id: 'chatpoint-structured-dialog-window-card',
          artifactId: 'chatpoint-dialog-window',
          title: 'Окно диалогов',
          description: 'Хороший операторский UI не спасает продукт без ценности.',
          width: 389,
          preview: {
            src: '/cases/chatpoint/disclosure-dialog-window.png',
            backgroundColor: '#FFFFFF',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute left-0 top-0 h-[107.21%] w-full max-w-none',
          },
        },
      ],
    },
  ],
  showcaseTitle: 'Ключевые артефакты',
  showcaseRowWidth: 1009.333,
  showcasePeekWidth: 158,
  showcaseItems: [
    {
      id: 'chatpoint-structured-showcase-onboarding',
      artifactId: 'chatpoint-showcase-apple-onboarding',
      title: 'Apple onboarding',
      description: 'Step-by-step guide помогал без менеджера пройти сложное подключение канала.',
      width: 252,
      preview: {
        src: '/cases/chatpoint/showcase-apple-onboarding.png',
        backgroundColor: '#D1D7E3',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute left-[5.99%] top-[7.62%] h-[210.92%] w-[88.01%] max-w-none',
      },
    },
    {
      id: 'chatpoint-structured-showcase-routing',
      artifactId: 'chatpoint-showcase-routing',
      title: 'Routing',
      description: 'Настройка распределения диалогов и поведения системы для операторов.',
      width: 252,
      preview: {
        src: '/cases/chatpoint/showcase-routing.png',
        backgroundColor: '#D1D7E3',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute left-[6.76%] top-[7.28%] h-[118.59%] w-[86.48%] max-w-none',
      },
    },
    {
      id: 'chatpoint-structured-showcase-form-messages',
      artifactId: 'chatpoint-showcase-form-messages',
      title: 'Form Messages',
      description: 'Хорошо спроектированная, но продуктово сомнительная функция.',
      width: 252,
      preview: {
        src: '/cases/chatpoint/showcase-form-messages.png',
        backgroundColor: '#D1D7E3',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute left-[6.41%] top-[5.98%] h-[135.9%] w-[87.19%] max-w-none',
      },
    },
    {
      id: 'chatpoint-structured-showcase-activation',
      artifactId: 'chatpoint-activation-path',
      title: 'Activation path',
      description: 'Слишком поздно искали момент продажи ценности.',
      width: 252,
      preview: {
        src: '/cases/chatpoint/showcase-activation-path.png',
        backgroundColor: '#D1D7E3',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute inset-0 size-full max-w-none rounded-[24px] object-contain',
      },
    },
  ],
  resultsTitle: 'Что важно понять',
  resultsBody:
    'Почти все сценарии дошли до запуска, но сам продукт закрыли. Сила этого кейса не в успехе платформы, а в зрелом выводе: разработка без проверки ценности приводит к созданию дорогого, но невостребованного решения.',
  resultMetrics: [
    { value: 'Research', label: 'решения проверялись на реальных пользователях' },
    { value: 'Value', label: 'спорил за ценность, не только за UI' },
    { value: 'Выводы', label: 'понял, где UX уже не спасает продукт' },
  ],
  footerAction: {
    label: 'Написать Андрею',
    action: { type: 'open_contact_modal', source: 'chatpoint-summary' },
  },
};

const chatpointCase: CaseContent = {
  id: 'chatpoint',
  shortTitle: 'ChatPoint',
  title: 'ChatPoint — B2B платформа для коммуникации, которая не взлетела',
  railSubtitle: 'Честный разбор',
  shortDescription: 'Сложный B2B-онбординг и честный разбор ошибок проектирования',
  category: 'supporting',
  tags: ['B2B', 'Onboarding', 'Routing', 'Research'],
  summaryTitle: 'Короткий ответ',
  detailTitle: 'Развернутый ответ',
  routeTitle: 'Почему этот разбор ошибок полезен',
  resultChips: ['B2B SaaS', 'research-driven', 'анализ ошибок'],
  metrics: [],
  role: 'Product Designer',
  roleDescription: 'Onboarding, enterprise scenarios, research, design review',
  summaryBlocks: [
    {
      type: 'lead',
      title: 'Почему кейс не выкинут',
      body: [
        'ChatPoint не стал успешным на рынке, но он полезен как честный разбор: здесь показана работа со сложными сценариями и взрослые выводы о том, почему закрыли проект.',
      ],
    },
    {
      type: 'section',
      title: 'Сильная часть работы',
      body: [
        'Андрей проектировал сложный activation path, валидировал решения через тестирование и спорил за ценность, а не только за UI.',
      ],
    },
    { type: 'disclosures', title: 'Что важно', items: chatpointDisclosures },
    { type: 'gallery', title: 'Артефакты', items: makeGallery([
      { id: 'chatpoint-apple-onboarding', title: 'Apple onboarding', description: 'Step-by-step вместо длинной инструкции.' },
      { id: 'chatpoint-routing', title: 'Routing', description: 'Системная логика распределения обращений.' },
      { id: 'chatpoint-system-settings', title: 'System settings', description: 'High-density B2B настройки.' },
      { id: 'chatpoint-form-messages', title: 'Form Messages', description: 'Удобный UX без доказанной ценности.' },
    ]) },
  ],
  detailBlocks: [
    {
      type: 'lead',
      title: 'Главный вывод',
      body: [
        'Это кейс про сложный B2B продукт, где хороший UX внутри отдельных сценариев не спас продукт без фокуса на реальной ценности.',
      ],
    },
    {
      type: 'bullet_list',
      title: 'Что делал Андрей',
      items: [
        'Проектировал onboarding подключения каналов.',
        'Упрощал activation path через step-by-step guide.',
        'Работал со сложными B2B-сценариями: routing, настройки, логика операторов.',
        'Инициировал usability testing даже в слабом процессе.',
      ],
    },
    { type: 'disclosures', title: 'Доказательства и разбор ошибок', items: chatpointDisclosures },
    { type: 'gallery', title: 'Артефакты', items: makeGallery([
      { id: 'chatpoint-apple-onboarding', title: 'Apple onboarding', description: 'Ключевой user-facing сценарий кейса.' },
      { id: 'chatpoint-viber', title: 'Viber onboarding', description: 'Повторяемый onboarding pattern, а не одноразовый wizard.' },
      { id: 'chatpoint-routing', title: 'Routing', description: 'Сложность продукта beyond onboarding.' },
      { id: 'chatpoint-form-messages', title: 'Form Messages', description: 'Разбор ошибок внутри кейса.' },
    ]) },
    { type: 'cta', label: 'Связаться по этому кейсу', action: { type: 'open_contact_modal', source: 'chatpoint-detail' } },
  ],
  routeBlocks: [
    {
      type: 'lead',
      title: 'Почему этот кейс не стоит пропускать',
      body: [
        'ChatPoint интересен не историей успеха на рынке, а демонстрацией продуктового мышления: сложный сценарий подключения, системная логика и трезвый вывод о том, почему проект закрыли.',
      ],
    },
    { type: 'chips', title: 'Открыть', items: [
      { id: 'chatpoint-short', label: 'Короткий ответ', action: { type: 'open_case_summary', caseId: 'chatpoint' } },
      { id: 'chatpoint-detail', label: 'Развернутый ответ', action: { type: 'open_case_detail', caseId: 'chatpoint' } },
    ] },
  ],
  disclosures: chatpointDisclosures,
  artifacts: [
    { id: 'chatpoint-apple-onboarding', title: 'Apple Messages for Business', caption: 'Step-by-step guide для сложного подключения.', imageUrl: '/cases/chatpoint/disclosure-apple-onboarding.png', sourceLabel: 'Figma' },
    { id: 'chatpoint-showcase-apple-onboarding', title: 'Apple onboarding', caption: 'Step-by-step guide помогал без менеджера пройти сложное подключение канала.', imageUrl: '/cases/chatpoint/showcase-apple-onboarding.png', sourceLabel: 'Figma' },
    { id: 'chatpoint-viber', title: 'Подключение Viber', caption: 'Повторяемый onboarding pattern.', imageUrl: '/cases/chatpoint/rail.png', sourceLabel: 'Figma' },
    { id: 'chatpoint-routing', title: 'Маршрутизация диалогов', caption: 'Логика распределения обращений между очередями, сотрудниками и сценариями.', imageUrl: '/cases/chatpoint/disclosure-routing.png', sourceLabel: 'Figma' },
    { id: 'chatpoint-showcase-routing', title: 'Routing', caption: 'Настройка распределения диалогов и поведения системы для операторов.', imageUrl: '/cases/chatpoint/showcase-routing.png', sourceLabel: 'Figma' },
    { id: 'chatpoint-system-settings', title: 'Настройка сценариев', caption: 'Системные правила и high-density настройки без декоративного шума.', imageUrl: '/cases/chatpoint/disclosure-system-settings.png', sourceLabel: 'Figma' },
    { id: 'chatpoint-form-messages', title: 'Form Messages', caption: 'Настройка анкеты в side-panel: удобно, но не там лежала реальная ценность.', imageUrl: '/cases/chatpoint/disclosure-form-messages.png', sourceLabel: 'Figma' },
    { id: 'chatpoint-showcase-form-messages', title: 'Form Messages', caption: 'Хорошо спроектированная, но продуктово сомнительная функция.', imageUrl: '/cases/chatpoint/showcase-form-messages.png', sourceLabel: 'Figma' },
    { id: 'chatpoint-purchase-path', title: 'Путь покупки', caption: 'Только потом стали разбираться, где именно продукт должен предлагать ценность клиенту.', imageUrl: '/cases/chatpoint/disclosure-purchase-path.png', sourceLabel: 'Figma' },
    { id: 'chatpoint-operator-window', title: 'Окно оператора', caption: 'Контекст, в котором оператор выбирал сущность сообщения и отправлял форму клиенту.', imageUrl: '/cases/chatpoint/disclosure-operator-window.png', sourceLabel: 'Figma' },
    { id: 'chatpoint-landing', title: 'Лендинг', caption: 'Маркетинговую оболочку команды собрали слишком поздно — уже после накачки фичами.', imageUrl: '/cases/chatpoint/disclosure-landing.png', sourceLabel: 'Figma' },
    { id: 'chatpoint-dialog-window', title: 'Окно диалогов', caption: 'Хороший операторский UI не спасает продукт без ценности.', imageUrl: '/cases/chatpoint/disclosure-dialog-window.png', sourceLabel: 'Figma' },
    { id: 'chatpoint-activation-path', title: 'Activation path', caption: 'Слишком поздно искали момент продажи ценности.', imageUrl: '/cases/chatpoint/showcase-activation-path.png', sourceLabel: 'Figma' },
  ],
  gallery: makeGallery([
    { id: 'chatpoint-showcase-apple-onboarding', title: 'Apple onboarding', description: 'Step-by-step вместо длинной инструкции.' },
    { id: 'chatpoint-showcase-routing', title: 'Routing', description: 'Системная логика распределения.' },
    { id: 'chatpoint-showcase-form-messages', title: 'Form Messages', description: 'Пример удобного UX без доказанной ценности.' },
    { id: 'chatpoint-activation-path', title: 'Activation path', description: 'Слишком поздно искали момент продажи ценности.' },
  ]),
  contextPanel: {
    headerLabel: 'Контекст проекта',
    title: 'ChatPoint',
    subtitle: 'Web · B2B · SaaS',
    tags: ['B2B', 'Onboarding', 'Routing', 'Research'],
    metricsTitle: 'Что важно',
    metrics: [
      { value: 'B2B', label: 'сложная операторская система' },
      { value: 'MVP', label: 'быстрый запуск без ясного PMF' },
      { value: 'UX', label: 'onboarding, routing, high-density UI' },
      { value: 'Выводы', label: 'разбор ошибок продуктового процесса' },
    ],
    role: 'Product Designer',
    roleTitle: 'Моя роль: Product Designer',
    roleDescription: 'Onboarding, UX flows, enterprise scenarios, testing, design review',
    preview: {
      src: '/cases/chatpoint/context.png',
      backgroundColor: '#D1D7E3',
      imageClassName: 'absolute h-[120.17%] w-[186.45%] max-w-none left-[-25.8%] top-[6.99%]',
      frameRadius: 24,
      bordered: true,
    },
  },
  structuredSummary: chatpointStructuredSummary,
  followUpChips: [],
};

const expensesDisclosures: DisclosureRow[] = [
  {
    id: 'expenses-research',
    title: 'Подтвердил потребность через исследование',
    summary: 'Сначала доказал, что дополнительным держателям реально нужен просмотр расходов.',
    details: [
      'Это был не “добавим еще один экран”, а работа с новой сущностью пользователя внутри уже чужого контура.',
      'Без исследования соседняя команда просто не приняла бы этот сценарий.',
    ],
  },
  {
    id: 'expenses-alignment',
    title: 'Снял межкомандное сопротивление',
    summary: 'Перевел разговор из “нам неудобно” в product logic.',
    details: [
      'Одна команда отвечала за семейный банк, другая — за историю операций и не хотела добавлять новую сущность.',
      'Кейс силен именно тем, что решение надо было не только нарисовать, но и провести через организационные границы.',
    ],
  },
  {
    id: 'expenses-flow',
    title: 'Спроектировал mobile flow расходов',
    summary: 'Встроил новый сценарий просмотра расходов и фильтрации операций.',
    details: [
      'Пользователь нового типа перестал выпадать из важного финансового сценария.',
    ],
  },
];

const expensesStructuredSummary: StructuredCaseSummaryData = {
  intro: {
    title: 'Кейс про расходы для держателей карт',
    body: 'Задача выглядела как локальная мобильная доработка: Нужно было дать дополнительным держателям карт доступ к информации о расходах. Но на самом функционал истории операций принадлежал другой команде и чтобы реализовать доработку пришлось долго договариаваться.',
    preview: {
      src: '/cases/expenses-card-holders/intro-preview.png',
      backgroundColor: '#D1D7E3',
      borderColor: '#EBEDF2',
      imageClassName: 'absolute inset-0 size-full max-w-none rounded-[24px] object-contain',
    },
  },
  sections: [
    {
      title: 'Почему задача была сложной',
      body: 'Проблема была не в отрисовке экрана, а в согласовании логики между двумя командами. Семейный банк отвечал за сценарий доп. держателей, а история операций — за базовый экран расходов. Без доказанной потребности фича не проходила бы дальше обсуждения.',
    },
    {
      title: 'Роль Андрея',
      body: 'Андрей коммуницировал с командой истории операций, собрал аргументацию через исследование, подтвердил, что пользователям действительно нужен такой сценарий, затем помог согласовать новую сущность с соседней командой и спроектировал мобильный путь просмотра расходов и фильтрации операций.',
    },
  ],
  disclosureTitle: 'Что делал Андрей',
  disclosures: [
    {
      id: 'expenses-structured-research',
      label: 'Составил путь пользователя, провел исследование и подтвердил гипотезу',
      body: 'Сначала Андрей составил путь пользователя и провел исследование, чтобы понять, действительно ли доп. держателям нужен отдельный сценарий просмотра расходов. Исследование подтвердило гипотезу и дало аргументы для обсуждения с соседней командой.',
      layoutType: 'single_preview',
      cards: [
        {
          id: 'expenses-structured-research-card',
          artifactId: 'expenses-research-path',
          width: 462,
          preview: {
            src: '/cases/expenses-card-holders/disclosure-research.png',
            backgroundColor: '#FFFFFF',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute inset-0 size-full max-w-none rounded-[24px] object-cover',
          },
        },
      ],
    },
    {
      id: 'expenses-structured-entity',
      label: 'Согласовал новую сущность с командой истории операций',
      body: 'Проблема была не только в интерфейсе: функционал истории операций принадлежал другой команде. Поэтому Андрей согласовал появление новой сущности доп. держателя, показал сценарий и договорился о том, как эта сущность будет работать внутри истории операций.',
      layoutType: 'single_preview',
      cards: [
        {
          id: 'expenses-structured-entity-card',
          artifactId: 'expenses-entity-alignment',
          width: 462,
          preview: {
            src: '/cases/expenses-card-holders/disclosure-entity.png',
            backgroundColor: '#D1D7E3',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute inset-0 size-full max-w-none rounded-[24px] object-cover',
          },
        },
      ],
    },
    {
      id: 'expenses-structured-filters',
      label: 'Внедрил функционал не ломая логику работы фильтра',
      body: 'Были собраны просмотр расходов, переходы внутри истории операций и сценарий фильтрации. Важно было не навесить лишнюю сложность, а встроить новый путь в знакомую логику мобильного банка.',
      layoutType: 'two_cards',
      cards: [
        {
          id: 'expenses-structured-expenses-screen-card',
          artifactId: 'expenses-screen-flow',
          title: 'Экран расходов',
          description: 'Основной путь просмотра расходов был собран под новый тип пользователя.',
          width: 389,
          preview: {
            src: '/cases/expenses-card-holders/disclosure-filters.png',
            backgroundColor: '#D1D7E3',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute h-[83.34%] left-[3.2%] max-w-none top-[8.33%] w-[93.61%]',
          },
        },
        {
          id: 'expenses-structured-filter-details-card',
          artifactId: 'expenses-filter-details',
          title: 'Фильтры и детализация',
          description: 'Дополнительный слой сценария не усложняет базовую историю операций, а уточняет ее.',
          width: 389,
          preview: {
            src: '/cases/expenses-card-holders/disclosure-filters-detail.png',
            backgroundColor: '#D1D7E3',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute h-[107.16%] left-[13.67%] max-w-none top-[-2%] w-[72.66%]',
          },
        },
      ],
    },
  ],
  showcaseTitle: 'Ключевые экраны и артефакты',
  showcaseRowWidth: 1009.333,
  showcasePeekWidth: 158,
  showcaseItems: [
    {
      id: 'expenses-structured-showcase-history',
      artifactId: 'expenses-history',
      title: 'История операций',
      description: 'Контур, где нужно было встроить новый тип пользователя',
      width: 252,
      preview: {
        src: '/cases/expenses-card-holders/showcase-history.png',
        backgroundColor: '#D1D7E3',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute h-[185.06%] left-[10.65%] max-w-none top-[12.83%] w-[78.69%]',
      },
    },
    {
      id: 'expenses-structured-showcase-family',
      artifactId: 'expenses-family',
      title: 'Расходы семьи',
      description: 'Просмотр расходов для доп. держателя карты',
      width: 252,
      preview: {
        src: '/cases/expenses-card-holders/showcase-family-expenses.png',
        backgroundColor: '#D1D7E3',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute h-[185.06%] left-[10.65%] max-w-none top-[12.83%] w-[78.69%]',
      },
    },
    {
      id: 'expenses-structured-showcase-filters',
      artifactId: 'expenses-filters',
      title: 'Фильтры',
      description: 'Сценарий детализации и отбора операций',
      width: 252,
      preview: {
        src: '/cases/expenses-card-holders/showcase-filters.png',
        backgroundColor: '#D1D7E3',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute h-[182.93%] left-[15.24%] max-w-none top-[-89.16%] w-[69.52%]',
      },
    },
    {
      id: 'expenses-structured-showcase-flow',
      artifactId: 'expenses-flow-artifact',
      title: 'Flow',
      description: 'Как связались два командных контура',
      width: 252,
      preview: {
        src: '/cases/expenses-card-holders/showcase-flow.png',
        backgroundColor: '#F4F5FC',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute h-[209.85%] left-[-1.83%] max-w-none top-[-2.81%] w-[300.44%]',
      },
    },
  ],
  resultsTitle: 'Результат',
  resultsBody:
    'Этот кейс ценен тем, что показывает не декоративный UI, а работу с сопротивлением системы. Андрей доказал потребность, синхронизировал две команды и довел мобильный сценарий до понятного решения.',
  resultMetrics: [
    { value: '2 команды', label: 'было синхронизированно' },
    { value: '1 исследование', label: 'Подтвердило гипотезу' },
    { value: 'mobile flow', label: 'Довели до реализации' },
  ],
  footerAction: {
    label: 'Написать Андрею',
    action: { type: 'open_contact_modal', source: 'expenses-summary' },
  },
};

const expensesCase: CaseContent = {
  id: 'expenses-card-holders',
  shortTitle: 'Расходы держателей',
  title: 'Просмотр расходов для держателей карт',
  railSubtitle: 'Mobile case',
  shortDescription: 'Исследование, межкомандное согласование и mobile flow',
  category: 'mobile',
  tags: ['Mobile', 'Fintech', 'Research', 'Alignment'],
  summaryTitle: 'Короткий ответ',
  detailTitle: 'Развернутый ответ',
  routeTitle: 'Почему этот mobile case не локальная доработка',
  resultChips: ['2 команды', 'research', 'mobile flow'],
  metrics: [],
  role: 'Product Designer',
  roleDescription: 'Research, alignment, flow design, UI, handoff',
  summaryBlocks: [
    { type: 'lead', title: 'Что это за кейс', body: ['Кейс про то, как через исследование и согласование встроить нового пользователя в банковский mobile-сценарий, а не просто добавить еще одну вкладку.'] },
    { type: 'disclosures', title: 'Что в нем важно', items: expensesDisclosures },
    { type: 'gallery', title: 'Артефакты', items: makeGallery([
      { id: 'expenses-history', title: 'История операций', description: 'Контур экрана, куда нужно было встроить нового пользователя.' },
      { id: 'expenses-family', title: 'Расходы семьи', description: 'Целевой сценарий просмотра расходов.' },
      { id: 'expenses-filters', title: 'Фильтры', description: 'Детализация и отбор операций.' },
    ]) },
  ],
  detailBlocks: [
    { type: 'lead', title: 'Главная сложность', body: ['Здесь трудность была не в UI, а в том, чтобы доказать другой команде потребность и встроить новую сущность в уже существующий продуктовый контур.'] },
    { type: 'disclosures', title: 'Доказательства', items: expensesDisclosures },
    { type: 'gallery', title: 'Ключевые экраны', items: makeGallery([
      { id: 'expenses-history', title: 'История операций', description: 'Исходный контур чужой команды.' },
      { id: 'expenses-family', title: 'Расходы семьи', description: 'Новый сценарий внутри семейного банка.' },
      { id: 'expenses-filters', title: 'Фильтры', description: 'Проработанный сценарий реального использования.' },
    ]) },
  ],
  routeBlocks: [
    { type: 'lead', title: 'Почему кейс стоит открыть', body: ['Это хороший пример того, что Андрей умеет не только рисовать мобильные экраны, но и проводить решение через зависимые команды.'] },
  ],
  disclosures: expensesDisclosures,
  artifacts: [
    { id: 'expenses-research-path', title: 'Путь пользователя и исследование', caption: 'Проверка потребности до согласования с соседней командой.', imageUrl: '/cases/expenses-card-holders/disclosure-research.png', sourceLabel: 'Figma' },
    { id: 'expenses-entity-alignment', title: 'Новая сущность в истории операций', caption: 'Согласование доп. держателя как новой сущности внутри чужого продуктового контура.', imageUrl: '/cases/expenses-card-holders/disclosure-entity.png', sourceLabel: 'Figma' },
    { id: 'expenses-screen-flow', title: 'Экран расходов', caption: 'Основной путь просмотра расходов был собран под новый тип пользователя.', imageUrl: '/cases/expenses-card-holders/disclosure-filters.png', sourceLabel: 'Figma' },
    { id: 'expenses-filter-details', title: 'Фильтры и детализация', caption: 'Дополнительный слой сценария не усложняет базовую историю операций, а уточняет ее.', imageUrl: '/cases/expenses-card-holders/disclosure-filters-detail.png', sourceLabel: 'Figma' },
    { id: 'expenses-history', title: 'История операций', caption: 'Контур, где нужно было встроить новый тип пользователя.', imageUrl: '/cases/expenses-card-holders/showcase-history.png', sourceLabel: 'Figma' },
    { id: 'expenses-family', title: 'Расходы семьи', caption: 'Просмотр расходов для доп. держателя карты.', imageUrl: '/cases/expenses-card-holders/showcase-family-expenses.png', sourceLabel: 'Figma' },
    { id: 'expenses-filters', title: 'Фильтры', caption: 'Сценарий детализации и отбора операций.', imageUrl: '/cases/expenses-card-holders/showcase-filters.png', sourceLabel: 'Figma' },
    { id: 'expenses-flow-artifact', title: 'Flow', caption: 'Как связались два командных контура.', imageUrl: '/cases/expenses-card-holders/showcase-flow.png', sourceLabel: 'Figma' },
  ],
  gallery: makeGallery([
    { id: 'expenses-history', title: 'История операций', description: 'Исходный контур.' },
    { id: 'expenses-family', title: 'Расходы семьи', description: 'Новый сценарий.' },
    { id: 'expenses-filters', title: 'Фильтры', description: 'Работа с деталями.' },
    { id: 'expenses-flow-artifact', title: 'Flow', description: 'Связка двух командных контуров.' },
  ]),
  contextPanel: {
    headerLabel: 'Контекст кейса',
    title: 'Расходы держателей карт',
    subtitle: 'Mobile · Cards · B2C',
    tags: ['Финтех', 'Карты', 'История', 'Исследование'],
    metricsTitle: 'Что важно',
    metrics: [
      { value: '2 команды', label: 'межкомандная зависимость' },
      { value: 'research', label: 'доказал потребность' },
      { value: 'mobile', label: 'сценарий расходов' },
      { value: 'ship', label: 'согласовал и довел' },
    ],
    role: 'Product Designer',
    roleTitle: 'Моя роль: Product Designer',
    roleDescription: 'Research, alignment, UX flow, UI, передача в разработку.',
    preview: {
      src: '/cases/expenses-card-holders/context.png',
      backgroundImage: 'linear-gradient(133.594deg, rgb(227, 210, 209) 0%, rgb(157, 180, 225) 96.702%)',
      imageClassName: 'absolute max-w-none object-contain rounded-[24px] size-full',
      frameRadius: 24,
      bordered: false,
    },
  },
  structuredSummary: expensesStructuredSummary,
  followUpChips: [],
};

const sharingDisclosures: DisclosureRow[] = [
  {
    id: 'sharing-problem',
    title: 'Убрал трение из старого пути',
    summary: 'Старый сценарий требовал номер телефона, проверку клиента, SMS и лишние задержки.',
    details: [
      'Сценарий был дорогим по вниманию и по операционной логике.',
      'Любое лишнее ожидание в этом месте било по конверсии.',
    ],
  },
  {
    id: 'sharing-branch',
    title: 'Перестроил механику вокруг ссылки',
    summary: 'Новая версия позволяла отправить инвайт ссылкой любому пользователю.',
    details: [
      'Клиент банка видел офферы и принимал приглашение быстрее.',
      'Не-клиент видел те же офферы, но дальше попадал в flow оформления карты.',
    ],
  },
];

const sharingStructuredSummary: StructuredCaseSummaryData = {
  intro: {
    title: 'Кейс про доработку шаринга подписки',
    body: 'Старый путь добавления участника был перегружен: нужно было ввести телефон, дождаться проверки, является ли человек клиентом банка, отправить приглашение и еще потратить деньги на SMS. Андрей вместе с командой пересобрал этот flow вокруг ссылки и двух понятных сценариев.',
    preview: {
      src: '/cases/subscription-sharing/intro-preview.png',
      backgroundColor: '#D1D7E3',
      borderColor: '#E7EAF2',
      imageClassName: 'absolute h-[167.58%] left-[8.23%] max-w-none top-[-2.62%] w-[83.55%]',
    },
  },
  sections: [
    {
      title: 'Почему старый путь ломался',
      body: 'Пользователь делал слишком много шагов до реального результата. Вся логика завязывалась на системную проверку номера и платное SMS-оповещение, из-за чего путь становился медленным, хрупким и дорогим.',
    },
    {
      title: 'Роль Андрея',
      body: 'Андрей помог переосмыслить логику приглашения: вместо phone-based сценария появился flow с генерацией ссылки. Дальше пользователь попадал в одну из двух веток — клиент банка или не-клиент — и уже там видел релевантный onboarding.',
    },
  ],
  disclosureTitle: 'Что делал Андрей',
  disclosures: [
    {
      id: 'sharing-structured-old-flow',
      label: 'Разобрал, где старый путь создает лишнее трение',
      body: 'Старый user-flow заставлял пользователя  →  вводить телефон  →  ждать ответ системы  →  отправлять приглашение через SMS. Это добавляло шаги, задержки и ненужную зависимость от внутренних проверок.',
      layoutType: 'single_preview',
      cards: [
        {
          id: 'sharing-structured-old-flow-card',
          artifactId: 'sharing-old-flow',
          width: 462,
          preview: {
            src: '/cases/subscription-sharing/disclosure-old-flow.png',
            backgroundColor: '#F4F5FC',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute inset-0 size-full max-w-none rounded-[24px] object-cover',
          },
        },
      ],
    },
    {
      id: 'sharing-structured-link-flow',
      label: 'Заменил SMS-зависимый flow на ссылку',
      body: 'Приглашение по ссылке сделало сценарий проще и дешевле: пользователь может отправить ссылку как угодно. Когда приглашенный участник переходит по ссылке продукт уже решает, какой следующий шаг показать',
      layoutType: 'single_preview',
      cards: [
        {
          id: 'sharing-structured-link-flow-card',
          artifactId: 'sharing-link-flow',
          title: 'Ссылка как единая точка входа',
          description: 'Flow стал проще: одна сущность вместо цепочки phone-check → SMS.',
          width: 462,
          preview: {
            src: '/cases/subscription-sharing/disclosure-link-flow.png',
            backgroundColor: '#D1D7E3',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute h-[95.45%] left-[8.37%] max-w-none top-[2.28%] w-[83.27%]',
          },
        },
      ],
    },
    {
      id: 'sharing-structured-branches',
      label: 'Развел сценарии для клиента и не-клиента банка',
      body: 'После перехода по ссылке приглашенный участник видит лендинг с офферами и может быстро принять или отклонить приглашение. Не-клиент тоже видит ценность подписки, но для активации переходит в flow оформления карты.',
      layoutType: 'two_cards',
      cards: [
        {
          id: 'sharing-structured-bank-client-card',
          artifactId: 'sharing-bank-client-branch',
          title: 'Ветка клиента банка',
          description: 'Для существующего клиента сценарий стал максимально коротким и понятным.',
          width: 389,
          preview: {
            src: '/cases/subscription-sharing/disclosure-bank-client.png',
            backgroundColor: '#D1D7E3',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute h-[98.28%] left-0 max-w-none top-[3.82%] w-full',
          },
        },
        {
          id: 'sharing-structured-non-client-card',
          artifactId: 'sharing-non-client-branch',
          title: 'Превращение не-клиента в клиента банка',
          description: 'Чтобы принять подписку пользователю необходимо было заказать дебетовую карту',
          width: 389,
          preview: {
            src: '/cases/subscription-sharing/disclosure-non-client.png',
            backgroundColor: '#D1D7E3',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute h-[92.82%] left-[9.23%] max-w-none top-[3.59%] w-[81.54%]',
          },
        },
      ],
    },
  ],
  showcaseTitle: 'Ключевые экраны и артефакты',
  showcaseRowWidth: 798,
  showcasePeekWidth: 158,
  showcaseItems: [
    {
      id: 'sharing-structured-showcase-old-path',
      artifactId: 'sharing-showcase-old-path',
      title: 'Старый путь',
      description: 'Пользователь должен пройти 8 шагов чтобы добавить участника',
      width: 252,
      preview: {
        src: '/cases/subscription-sharing/showcase-old-path.png',
        backgroundColor: '#D1D7E3',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute h-[160.88%] left-0 max-w-none top-[-30.44%] w-[291.04%]',
      },
    },
    {
      id: 'sharing-structured-showcase-link',
      artifactId: 'sharing-showcase-link',
      title: 'Ссылка',
      description: 'Новая точка входа в сценарий приглашения',
      width: 252,
      preview: {
        src: '/cases/subscription-sharing/showcase-link.png',
        backgroundColor: '#D1D7E3',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute h-[175.21%] left-[11.81%] max-w-none top-[10.38%] w-[76.37%]',
      },
    },
    {
      id: 'sharing-structured-showcase-new-path',
      artifactId: 'sharing-showcase-new-path',
      title: 'Новый путь',
      description: 'Позволял добавить участника за 2 шага вместо 8 шагов',
      width: 252,
      preview: {
        src: '/cases/subscription-sharing/showcase-new-path.png',
        backgroundColor: '#E7EBF6',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute h-[123.7%] left-0 max-w-none top-0 w-[205.8%]',
      },
    },
  ],
  resultsTitle: 'Результат',
  resultsBody:
    'Этот кейс показывает, что Андрей умеет не только улучшать отдельный экран, а переписывать саму механику активации. Пользовательский путь стал короче, понятнее и гибче.',
  resultMetrics: [
    { value: '2 шага', label: 'вместо 8 шагов и валидаций' },
    { value: 'Сокращение расходов', label: 'ссылка вместо sms' },
  ],
  footerAction: {
    label: 'Написать Андрею',
    action: { type: 'open_contact_modal', source: 'subscription-sharing-summary' },
  },
};

const sharingCase: CaseContent = {
  id: 'subscription-sharing',
  shortTitle: 'Шаринг подписки',
  title: 'Доработка шаринга подписки',
  railSubtitle: 'Mobile case',
  shortDescription: 'Снижение трения в сценарии добавления участника',
  category: 'mobile',
  tags: ['Mobile', 'Subscription', 'Friction', 'Branching'],
  summaryTitle: 'Короткий ответ',
  detailTitle: 'Развернутый ответ',
  routeTitle: 'Почему кейс важен',
  resultChips: ['friction ↓', 'link-based flow', '2 сценария'],
  metrics: [],
  role: 'Product Designer',
  roleDescription: 'Flow redesign, branching logic, UX/UI',
  summaryBlocks: [
    { type: 'lead', title: 'Что изменилось', body: ['Команда ушла от тяжелого SMS-first пути и построила шаринг подписки через ссылку с двумя понятными ветками: клиент банка и не-клиент.'] },
    { type: 'disclosures', title: 'Почему решение было лучше', items: sharingDisclosures },
  ],
  detailBlocks: [
    { type: 'lead', title: 'Сильная часть кейса', body: ['Кейс показывает не визуальный полишинг, а умение убрать лишнее трение из многосоставного пользовательского пути.'] },
    { type: 'disclosures', title: 'Доказательства', items: sharingDisclosures },
  ],
  routeBlocks: [{ type: 'lead', title: 'О чем этот кейс', body: ['Про перепаковку сложного invite-flow в более прямой и масштабируемый путь через ссылку.'] }],
  disclosures: sharingDisclosures,
  artifacts: [
    { id: 'sharing-old-flow', title: 'Старый путь добавления участника', caption: 'Phone-check, ожидание проверки и SMS как источники лишнего трения.', imageUrl: '/cases/subscription-sharing/disclosure-old-flow.png', sourceLabel: 'Figma' },
    { id: 'sharing-link-flow', title: 'Ссылка как единая точка входа', caption: 'Новая механика приглашения по ссылке вместо SMS-зависимого flow.', imageUrl: '/cases/subscription-sharing/disclosure-link-flow.png', sourceLabel: 'Figma' },
    { id: 'sharing-bank-client-branch', title: 'Ветка клиента банка', caption: 'Короткий сценарий принятия приглашения для существующего клиента банка.', imageUrl: '/cases/subscription-sharing/disclosure-bank-client.png', sourceLabel: 'Figma' },
    { id: 'sharing-non-client-branch', title: 'Ветка не-клиента банка', caption: 'Сценарий, где ценность подписки ведет пользователя в flow оформления карты.', imageUrl: '/cases/subscription-sharing/disclosure-non-client.png', sourceLabel: 'Figma' },
    { id: 'sharing-showcase-old-path', title: 'Старый путь', caption: 'Пользователь должен пройти 8 шагов, чтобы добавить участника.', imageUrl: '/cases/subscription-sharing/showcase-old-path.png', sourceLabel: 'Figma' },
    { id: 'sharing-showcase-link', title: 'Ссылка', caption: 'Новая точка входа в сценарий приглашения.', imageUrl: '/cases/subscription-sharing/showcase-link.png', sourceLabel: 'Figma' },
    { id: 'sharing-showcase-new-path', title: 'Новый путь', caption: 'Добавление участника за 2 шага вместо 8.', imageUrl: '/cases/subscription-sharing/showcase-new-path.png', sourceLabel: 'Figma' },
  ],
  gallery: makeGallery([
    { id: 'sharing-showcase-old-path', title: 'Старый путь', description: '8 шагов до добавления участника.' },
    { id: 'sharing-showcase-link', title: 'Ссылка', description: 'Новая точка входа в сценарий.' },
    { id: 'sharing-showcase-new-path', title: 'Новый путь', description: '2 шага вместо 8.' },
  ]),
  contextPanel: {
    headerLabel: 'Контекст кейса',
    title: 'Шаринг подписки',
    subtitle: 'Mobile · Flow · B2C',
    tags: ['Финтех', 'Подписка', 'Link flow', 'Onboarding'],
    metricsTitle: 'Что важно',
    metrics: [
      { value: 'link', label: 'новая точка входа' },
      { value: '2 пути', label: 'клиент и не-клиент' },
      { value: 'growth', label: 'продуктовый onboarding' },
      { value: 'flow', label: 'упростил активацию' },
    ],
    role: 'Product Designer',
    roleTitle: 'Моя роль: Product Designer',
    roleDescription: 'User flow, branching logic, UX/UI, синхронизация с продуктом.',
    preview: {
      src: '/cases/subscription-sharing/context.png',
      backgroundImage: 'linear-gradient(133.594deg, rgb(227, 210, 209) 0%, rgb(225, 157, 158) 96.702%)',
      imageClassName: 'absolute max-w-none object-contain rounded-[16px] size-full',
      frameRadius: 16,
      bordered: true,
    },
  },
  structuredSummary: sharingStructuredSummary,
  followUpChips: [],
};

const superappDisclosures: DisclosureRow[] = [
  {
    id: 'superapp-research',
    title: 'Исследование и структура',
    summary: 'Кейс опирается на исследования, IA и user flows, а не на локальный UI-полиш.',
    details: ['Здесь важно системное мышление: как собрать продуктовую структуру, а не только красиво нарисовать экраны.'],
  },
  {
    id: 'superapp-ui',
    title: 'UI-концепт и пользовательские сценарии',
    summary: 'От структуры приложения до ключевых пользовательских путей и UI.',
    details: ['Это хороший пример того, что Андрей умеет идти от структуры и сценариев к интерфейсу, а не наоборот.'],
  },
];

const wannabelikeStructuredSummary: StructuredCaseSummaryData = {
  intro: {
    title: 'Кейс про UX/UI WannabeLike',
    body: 'Андрей пришел на курс Миши Розова, чтобы прокачать UI. Прежде чем рисовать красивые макеты нужно было, пройти полноценный продуктовый подход при разработке продукта.',
    preview: {
      src: '/cases/ux-ui-wannabelike/intro-preview.png',
      backgroundColor: '#D1D7E3',
      borderColor: '#E7EAF2',
      imageClassName: 'absolute h-[201.5%] left-[-6.7%] max-w-none top-[1.68%] w-[113.4%]',
    },
  },
  sections: [
    {
      title: 'Почему кейс важен',
      body: 'Сильная сторона этого кейса — связность. Андрей накидывал гипотезы → проводил исследования → создавал структуру приложения → делал пользовательские сценарии и только после этого начал отрисовывать UI интерфейса.',
    },
    {
      title: 'Роль Андрея',
      body: 'Андрей выступил в роли мультидисциплинарного дизайнера, который отвечал за весь путь создания продукта.',
    },
  ],
  disclosureTitle: 'Что делал Андрей',
  disclosures: [
    {
      id: 'wannabelike-structured-research',
      label: 'Собрал обратную связь от пользователей и собрал структуру приложения',
      body: 'После проведенных интервью Андрей собрал боли и желания пользователей. Из них получилось собрать функционал продукта.',
      layoutType: 'two_cards',
      cards: [
        {
          id: 'wannabelike-structured-research-card',
          artifactId: 'wannabelike-research-synthesis',
          title: 'Research synthesis',
          description: 'Инсайты были переведены в продуктовые фчич, а не остались данными после исследования',
          width: 389,
          preview: {
            src: '/cases/ux-ui-wannabelike/research-synthesis.png',
            backgroundColor: '#D1D7E3',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute h-full left-0 max-w-none top-0 w-[100.19%]',
          },
        },
        {
          id: 'wannabelike-structured-structure-card',
          artifactId: 'wannabelike-app-structure',
          title: 'Структура приложения',
          description: 'Информационная архитектура задает рамку для всех дальнейших UX-решений.',
          width: 389,
          preview: {
            src: '/cases/ux-ui-wannabelike/app-structure.png',
            backgroundColor: '#D1D7E3',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute h-[117.44%] left-0 max-w-none top-[-8.72%] w-full',
          },
        },
      ],
    },
    {
      id: 'wannabelike-structured-scenarios',
      label: 'Создание пользовательских сценариев и поиск визуальной метафоры',
      body: 'На этом этапе формировалась информационная архитектура: как распределить семейные сценарии, какие модули нужны приложению и как связать их так, чтобы продукт ощущался целостным, а не случайно склеенным.',
      layoutType: 'two_cards',
      cards: [
        {
          id: 'wannabelike-structured-user-flow-card',
          artifactId: 'wannabelike-user-flow',
          title: 'Проработал User-Flow пользователя',
          description: 'Основываясь на всей информации, Андрей подготовил Job Stories и на их основе создал путь, по которому двигался пользователь',
          width: 389,
          preview: {
            src: '/cases/ux-ui-wannabelike/user-flow.png',
            backgroundColor: '#D1D7E3',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute h-[129.86%] left-0 max-w-none top-[-2.01%] w-full',
          },
        },
        {
          id: 'wannabelike-structured-metaphor-card',
          artifactId: 'wannabelike-visual-metaphor',
          title: 'Поиск и согласование визуальной метафоры',
          description: 'Это был самый важный этап в обучениию. Андрей нашел нужную метафору после 3-го раунда согласования референсов с Мишей Розовым.',
          width: 389,
          preview: {
            src: '/cases/ux-ui-wannabelike/visual-metaphor.png',
            backgroundColor: '#D1D7E3',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute inset-0 size-full object-cover',
          },
        },
      ],
    },
    {
      id: 'wannabelike-structured-ui-concept',
      label: 'Подготовил UI-концепт приложения',
      body: 'На основе созданных User-Flow Андрей собрал экраны мобильного приложения.',
      layoutType: 'three_cards_scroll',
      rowWidth: 1207,
      peekWidth: 158,
      cards: [
        {
          id: 'wannabelike-structured-first-entry-card',
          artifactId: 'wannabelike-first-entry',
          title: 'Первый вход в приложение',
          width: 389,
          preview: {
            src: '/cases/ux-ui-wannabelike/first-entry.png',
            backgroundColor: '#D1D7E3',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute h-[125.3%] left-[-8.23%] max-w-none top-[-12.65%] w-[116.46%]',
          },
        },
        {
          id: 'wannabelike-structured-payment-card',
          artifactId: 'wannabelike-payment-scenario',
          title: 'Сценарий оплаты услуги',
          width: 389,
          preview: {
            src: '/cases/ux-ui-wannabelike/payment-scenario.png',
            backgroundColor: '#D1D7E3',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute h-[107.15%] left-0 max-w-none top-0 w-full',
          },
        },
        {
          id: 'wannabelike-structured-family-account-card',
          artifactId: 'wannabelike-family-account',
          title: 'Просмотр семейного счета',
          width: 389,
          preview: {
            src: '/cases/ux-ui-wannabelike/family-account.png',
            backgroundColor: '#D1D7E3',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute inset-0 size-full object-cover',
          },
        },
      ],
    },
  ],
  showcaseTitle: 'Ключевые экраны и артефакты',
  showcaseRowWidth: 1009.333,
  showcasePeekWidth: 158,
  showcaseItems: [
    {
      id: 'wannabelike-structured-showcase-research',
      artifactId: 'wannabelike-showcase-research',
      title: 'Исследования',
      description: 'Что легло в основу продуктовой концепции',
      width: 252,
      preview: {
        src: '/cases/ux-ui-wannabelike/showcase-research.png',
        backgroundColor: '#D1D7E3',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute h-[104.01%] left-0 max-w-none top-[-4.01%] w-full',
      },
    },
    {
      id: 'wannabelike-structured-showcase-structure',
      artifactId: 'wannabelike-showcase-structure',
      title: 'Структура',
      description: 'IA и модули приложения',
      width: 252,
      preview: {
        src: '/cases/ux-ui-wannabelike/showcase-structure.png',
        backgroundColor: '#D1D7E3',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute h-full left-[-3.05%] max-w-none top-0 w-[114.28%]',
      },
    },
    {
      id: 'wannabelike-structured-showcase-user-flow',
      artifactId: 'wannabelike-showcase-user-flow',
      title: 'User flow',
      description: 'Ключевые семейные сценарии',
      width: 252,
      preview: {
        src: '/cases/ux-ui-wannabelike/user-flow.png',
        backgroundColor: '#D1D7E3',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute h-[100.32%] left-0 max-w-none top-0 w-[119.25%]',
      },
    },
    {
      id: 'wannabelike-structured-showcase-ui-concept',
      artifactId: 'wannabelike-showcase-ui-concept',
      title: 'UI-концепт',
      description: 'Как это превратилось в мобильный интерфейс',
      width: 252,
      preview: {
        src: '/cases/ux-ui-wannabelike/showcase-ui-concept.png',
        backgroundColor: '#D1D7E3',
        borderColor: '#E7EAF2',
        imageClassName: 'absolute h-full left-[-6.01%] max-w-none top-0 w-[136.47%]',
      },
    },
  ],
  resultsTitle: 'Результат',
  resultsBody:
    'Для лида этот кейс полезен как индикатор системного уровня: Андрей умеет соединять research, IA, flow и UI в одну продуктовую историю, а не работать только на последнем визуальном слое.',
  resultMetrics: [
    { value: 'Исследования', label: 'Проведено 8 интервью' },
    { value: 'Собрал структуру', label: 'Основываясь на данных' },
    { value: 'Создал UI концепт', label: 'Состоящий из 6 сценариев' },
  ],
  footerAction: {
    label: 'Написать Андрею',
    action: { type: 'open_contact_modal', source: 'wannabelike-summary' },
  },
};

const superappCase: CaseContent = {
  id: 'ux-ui-wannabelike',
  shortTitle: 'UX/UI WannabeLike',
  title: 'UX/UI WannabeLike',
  railSubtitle: 'Systemic mobile UX/UI',
  shortDescription: 'Системный mobile UX/UI кейс с research, IA и user flows',
  category: 'mobile',
  tags: ['Mobile', 'Research', 'IA', 'UX/UI'],
  summaryTitle: 'Короткий ответ',
  detailTitle: 'Развернутый ответ',
  routeTitle: 'Почему кейс важен',
  resultChips: ['research', 'IA', 'user flows'],
  metrics: [],
  role: 'Product Designer',
  roleDescription: 'Research, information architecture, user flows, UI concept',
  summaryBlocks: [
    { type: 'lead', title: 'О чем кейс', body: ['Это не локальная доработка, а системный mobile UX/UI кейс: исследование, структура приложения, ключевые user flows и UI-концепт.'] },
    { type: 'disclosures', title: 'Что он доказывает', items: superappDisclosures },
  ],
  detailBlocks: [
    { type: 'lead', title: 'Почему кейс полезен', body: ['Он показывает системность: от research и IA до flows и UI, а не только работу над отдельным экраном.'] },
    { type: 'disclosures', title: 'Детали', items: superappDisclosures },
  ],
  routeBlocks: [{ type: 'lead', title: 'О чем будет detail', body: ['Про research, структуру приложения, ключевые пути и UI-концепт как единую систему.'] }],
  disclosures: superappDisclosures,
  artifacts: [
    { id: 'superapp-research', title: 'Исследования', caption: 'Основа продуктовой структуры.', imageUrl: '/cases/ux-ui-wannabelike/research-synthesis.png' },
    { id: 'superapp-ia', title: 'Структура приложения', caption: 'Information architecture.', imageUrl: '/cases/ux-ui-wannabelike/app-structure.png' },
    { id: 'superapp-flow', title: 'User flow', caption: 'Ключевые сценарии.', imageUrl: '/cases/ux-ui-wannabelike/user-flow.png' },
    { id: 'superapp-ui', title: 'Работа над UI', caption: 'UI-концепт.', imageUrl: '/cases/ux-ui-wannabelike/showcase-ui-concept.png' },
    { id: 'wannabelike-research-synthesis', title: 'Research synthesis', caption: 'Инсайты были переведены в продуктовые фчич, а не остались данными после исследования.', imageUrl: '/cases/ux-ui-wannabelike/research-synthesis.png', sourceLabel: 'Figma' },
    { id: 'wannabelike-app-structure', title: 'Структура приложения', caption: 'Информационная архитектура задает рамку для всех дальнейших UX-решений.', imageUrl: '/cases/ux-ui-wannabelike/app-structure.png', sourceLabel: 'Figma' },
    { id: 'wannabelike-user-flow', title: 'Проработал User-Flow пользователя', caption: 'Job Stories и пользовательский путь на основе собранной информации.', imageUrl: '/cases/ux-ui-wannabelike/user-flow.png', sourceLabel: 'Figma' },
    { id: 'wannabelike-visual-metaphor', title: 'Поиск визуальной метафоры', caption: 'Метафора была найдена после третьего раунда согласования референсов.', imageUrl: '/cases/ux-ui-wannabelike/visual-metaphor.png', sourceLabel: 'Figma' },
    { id: 'wannabelike-first-entry', title: 'Первый вход в приложение', caption: 'Первый сценарий входа в мобильное приложение.', imageUrl: '/cases/ux-ui-wannabelike/first-entry.png', sourceLabel: 'Figma' },
    { id: 'wannabelike-payment-scenario', title: 'Сценарий оплаты услуги', caption: 'Экранный сценарий оплаты услуги внутри UI-концепта.', imageUrl: '/cases/ux-ui-wannabelike/payment-scenario.png', sourceLabel: 'Figma' },
    { id: 'wannabelike-family-account', title: 'Просмотр семейного счета', caption: 'Сценарий просмотра семейного счета.', imageUrl: '/cases/ux-ui-wannabelike/family-account.png', sourceLabel: 'Figma' },
    { id: 'wannabelike-showcase-research', title: 'Исследования', caption: 'Что легло в основу продуктовой концепции.', imageUrl: '/cases/ux-ui-wannabelike/showcase-research.png', sourceLabel: 'Figma' },
    { id: 'wannabelike-showcase-structure', title: 'Структура', caption: 'IA и модули приложения.', imageUrl: '/cases/ux-ui-wannabelike/showcase-structure.png', sourceLabel: 'Figma' },
    { id: 'wannabelike-showcase-user-flow', title: 'User flow', caption: 'Ключевые семейные сценарии.', imageUrl: '/cases/ux-ui-wannabelike/user-flow.png', sourceLabel: 'Figma' },
    { id: 'wannabelike-showcase-ui-concept', title: 'UI-концепт', caption: 'Как это превратилось в мобильный интерфейс.', imageUrl: '/cases/ux-ui-wannabelike/showcase-ui-concept.png', sourceLabel: 'Figma' },
  ],
  gallery: makeGallery([
    { id: 'superapp-research', title: 'Исследования', description: 'Основа продуктовой структуры.' },
    { id: 'superapp-ia', title: 'Структура', description: 'Information architecture.' },
    { id: 'superapp-flow', title: 'User flows', description: 'Ключевые пользовательские пути.' },
    { id: 'superapp-ui', title: 'UI', description: 'Концепт интерфейса.' },
  ]),
  contextPanel: {
    headerLabel: 'Контекст кейса',
    title: 'UX/UI WannabeLike',
    subtitle: 'Mobile · Concept · Family',
    tags: ['Research', 'IA', 'Family', 'UI concept'],
    metricsTitle: 'Что важно',
    metrics: [
      { value: 'research', label: 'понимание сценариев' },
      { value: 'IA', label: 'структура приложения' },
      { value: 'flows', label: 'семейные пути' },
      { value: 'UI', label: 'mobile-концепт' },
    ],
    role: 'Product Designer',
    roleTitle: 'Моя роль: Product Designer',
    roleDescription: 'Research synthesis, IA, user flows, UX/UI concept.',
    preview: {
      src: '/cases/ux-ui-wannabelike/context.png',
      backgroundImage: 'linear-gradient(133.594deg, rgb(211, 227, 209) 0%, rgb(32, 40, 56) 96.702%)',
      imageClassName: 'absolute h-[107.49%] w-[58.55%] max-w-none left-[21.8%] top-[-1.76%]',
      frameRadius: 16,
      bordered: false,
    },
  },
  structuredSummary: wannabelikeStructuredSummary,
  followUpChips: [],
};

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

const experience: ExperienceContent = {
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

const additionalCasesContent: AdditionalCasesContent = {
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

const mobileOverview: MobileOverviewContent = {
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

const hiringGuides: HiringGuidesContent = {
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

export const portfolioContent: PortfolioContent = {
  entry,
  cases: {
    'alfa-smart': alfaCase,
    siebel: siebelCase,
    chatpoint: chatpointCase,
    'expenses-card-holders': expensesCase,
    'subscription-sharing': sharingCase,
    'ux-ui-wannabelike': superappCase,
  },
  experience,
  additionalCases: additionalCasesContent,
  mobileOverview,
  contact: contactOptions,
  hiringGuides,
};

export function getCaseById(caseId: string): CaseContent | undefined {
  return portfolioContent.cases[caseId];
}

export function getCaseContext(caseId: string): ContextPanelData {
  return getCaseById(caseId)?.contextPanel ?? entry.contextPanel;
}

export function getContactContent(): ContactContent {
  return portfolioContent.contact;
}

export function getRailItems(): RailItem[] {
  return railItems;
}

export function getEntryPrompts(): PromptChip[] {
  return entry.quickPrompts;
}

export function getHiringGuide<K extends keyof HiringGuidesContent>(
  key: K,
): HiringGuidesContent[K] {
  return hiringGuides[key];
}

export function getExperienceRoute(caseId?: string): ContentBlock[] {
  if (caseId && portfolioContent.experience.routeBlocks[caseId]) {
    return portfolioContent.experience.routeBlocks[caseId];
  }

  return portfolioContent.experience.routeBlocks.default;
}
