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
  MobileOverviewContent,
  PortfolioContent,
  PromptChip,
  RailItem,
} from '@/lib/portfolio/types';

const railItems: RailItem[] = [
  { id: 'alfa-smart', label: 'Альфа-Смарт', subtitle: 'Флагманский кейс', kind: 'case' },
  { id: 'siebel', label: 'SIEBEL', subtitle: 'Enterprise workflow', kind: 'case' },
  { id: 'chatpoint', label: 'ChatPoint', subtitle: 'B2B anti-case', kind: 'case' },
  { id: 'experience', label: 'Опыт работы', subtitle: 'Компании и траектория', kind: 'experience' },
  { id: 'additional-cases', label: 'Дополнительные кейсы', subtitle: 'Ширина экспертизы', kind: 'overview' },
];

const contactOptions: ContactContent = {
  title: 'Связаться с Андреем',
  helper:
    'Если нужен быстрый контакт по вакансии или кейсам, лучше не тянуть — здесь прямые каналы связи.',
  options: [
    {
      id: 'telegram',
      label: 'Telegram',
      helper: 'Быстрее всего отвечает здесь',
      href: 'https://t.me/Edvardho',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      helper: 'Если удобнее официальный контекст',
      href: 'https://www.linkedin.com/in/edvardho/',
    },
    {
      id: 'email',
      label: 'e-mail',
      helper: 'Если нужен длинный контекст письмом',
      href: 'mailto:Edvardho@list.ru',
    },
  ],
};

const entry: EntryContent = {
  title: 'Портфолио Андрея Макаревича',
  subtitle:
    'ИИ-ассистент отвечает только про опыт, кейсы, подход к продукту и то, как Андрей принимает решения.',
  quickPrompts: [
    { id: 'entry-strongest', label: 'Расскажи о самом сильном кейсе', action: { type: 'open_case_summary', caseId: 'alfa-smart' } },
    { id: 'entry-experience', label: 'Какой опыт работы?', action: { type: 'open_experience_summary' } },
    { id: 'entry-mobile', label: 'Что Андрей делал в мобилках?', action: { type: 'open_mobile_experience_overview' } },
    { id: 'entry-breadth', label: 'Есть ли что-то сильное кроме флагманов?', action: { type: 'open_additional_cases_overview' } },
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
      'На этом кейсе видно не только UX-мышление, но и delivery-дисциплину.',
      'Финальная ценность кейса — не в количестве экранов, а в том, что сценарий дошел до рынка и принес измеримый результат.',
    ],
    artifactIds: ['alfa-ui'],
  },
];

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
    { id: 'alfa-miro', title: 'Miro-структура', caption: 'Каркас продукта и роли до начала экранов.', imageUrl: '/projects/alfa-smart/miro.png', sourceLabel: 'Miro' },
    { id: 'alfa-prototype', title: 'Прототип для тестов', caption: 'Основа для проверки ключевых гипотез.', imageUrl: '/projects/alfa-smart/prototype.png', sourceLabel: 'Figma' },
    { id: 'alfa-ui', title: 'UI flows', caption: 'Итоговые сценарии, дошедшие до реализации.', imageUrl: '/projects/alfa-smart/ui.png', sourceLabel: 'Figma' },
    { id: 'alfa-landing', title: 'Лендинг подписки', caption: 'Вход в кейс.', imageUrl: '/projects/alfa-smart/screen-1.png' },
    { id: 'alfa-manage', title: 'Экран управления', caption: 'Управление подпиской.', imageUrl: '/projects/alfa-smart/screen-2.png' },
    { id: 'alfa-invite', title: 'Приглашение участников', caption: 'Подключение близких.', imageUrl: '/projects/alfa-smart/screen-3.png' },
    { id: 'alfa-members', title: 'Управление участниками', caption: 'Изменение состава подписки.', imageUrl: '/projects/alfa-smart/screen-4.png' },
  ],
  gallery: makeGallery([
    { id: 'alfa-landing', title: 'Лендинг подписки', description: 'Показывает преимущества до действия.' },
    { id: 'alfa-manage', title: 'Экран управления', description: 'Собирает ключевые post-purchase действия.' },
    { id: 'alfa-invite', title: 'Приглашение участников', description: 'Убирает лишнее трение.' },
    { id: 'alfa-members', title: 'Управление участниками', description: 'Закрывает lifecycle после подключения.' },
  ]),
  contextPanel: {
    title: 'Альфа-Смарт',
    subtitle: 'Mobile · Web · B2C',
    tags: ['Финтех', 'Подписка', 'Платежи', 'Личные финансы'],
    metrics: [
      { value: '32 111', label: 'подписчиков' },
      { value: '30%', label: 'владельцы с участниками' },
      { value: '1,1 млн ₽', label: 'доход' },
    ],
    role: 'Product Designer',
    roleDescription: 'UX/UI, User Flow, прототипы, тесты, дизайн-чек, handoff',
    cta: { label: 'Открыть полный кейс', action: { type: 'open_case_detail', caseId: 'alfa-smart' } },
  },
  followUpChips: [
    { id: 'alfa-follow-process', label: 'Как он принимал решения?', action: { type: 'open_case_detail', caseId: 'alfa-smart' } },
    { id: 'alfa-follow-artifacts', label: 'Покажи артефакты', action: { type: 'open_image_modal', caseId: 'alfa-smart', artifactId: 'alfa-miro' } },
    { id: 'alfa-follow-mobile', label: 'Что еще он делал в мобилках?', action: { type: 'open_mobile_experience_overview' } },
  ],
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
    { id: 'siebel-hypotheses', title: 'Гипотезы улучшения интерфейса', caption: 'Список проблем и задач после исследования.', imageUrl: '/projects/siebel/hypotheses.png', sourceLabel: 'Backlog' },
    { id: 'siebel-two-windows', title: 'Работа в 2 окнах', caption: 'Пересборка режима с двумя диалогами.', imageUrl: '/projects/siebel/two-windows.png', sourceLabel: 'Figma' },
    { id: 'siebel-customer-data', title: 'Данные о клиенте', caption: 'Вынесенные в рабочее место данные.', imageUrl: '/projects/siebel/customer-data.png', sourceLabel: 'Figma' },
    { id: 'siebel-templates', title: 'Работа с шаблонами', caption: 'Сокращение времени на повторяющиеся ответы.', imageUrl: '/projects/siebel/templates.png', sourceLabel: 'Figma' },
    { id: 'siebel-old-ui', title: 'Старый интерфейс', caption: 'Контраст с исходным сценарием.', imageUrl: '/projects/siebel/old-ui.png', sourceLabel: 'Legacy UI' },
  ],
  gallery: makeGallery([
    { id: 'siebel-old-ui', title: 'Старый интерфейс', description: 'Исходная сложность рабочего места.' },
    { id: 'siebel-two-windows', title: '2-window mode', description: 'Убирает путаницу с активным окном.' },
    { id: 'siebel-customer-data', title: 'Данные о клиенте', description: 'Сокращают время поиска.' },
    { id: 'siebel-templates', title: 'Шаблоны', description: 'Ускоряют повторяющиеся ответы.' },
  ]),
  contextPanel: {
    title: 'SIEBEL',
    subtitle: 'Web · Enterprise · Support Ops',
    tags: ['Enterprise', 'Research', 'Workflow', 'A/B test'],
    metrics: [
      { value: '900 → 580 сек', label: 'время на диалог' },
      { value: '1 000 → 2 000', label: 'диалогов после' },
    ],
    role: 'Product Designer',
    roleDescription: 'Research, hypotheses, redesign, validation, handoff',
    cta: { label: 'Открыть полный кейс', action: { type: 'open_case_detail', caseId: 'siebel' } },
  },
  followUpChips: [
    { id: 'siebel-follow-why', label: 'Почему ты настоял на исследовании?', action: { type: 'open_case_detail', caseId: 'siebel' } },
    { id: 'siebel-follow-artifact', label: 'Покажи гипотезы', action: { type: 'open_image_modal', caseId: 'siebel', artifactId: 'siebel-hypotheses' } },
    { id: 'siebel-follow-experience', label: 'Какой у него еще опыт?', action: { type: 'open_experience_summary' } },
  ],
};

const chatpointDisclosures: DisclosureRow[] = [
  {
    id: 'chatpoint-onboarding',
    title: 'Упростил подключение Apple Messages for Business',
    summary: 'Вместо длинной технической инструкции сделал step-by-step guide.',
    details: [
      'Ценность сценария была в том, чтобы пользователь мог пройти сложное подключение без менеджера рядом.',
      'Это сильный кусок не потому, что там много пикселей, а потому что тяжелый onboarding превратился в управляемый activation path.',
    ],
    artifactIds: ['chatpoint-apple-onboarding'],
  },
  {
    id: 'chatpoint-routing',
    title: 'Работал с routing и системными сценариями',
    summary: 'Проектировал не только onboarding, но и плотную B2B-логику.',
    details: [
      'Routing и системные настройки показывают, что кейс не сводился к одному wizard.',
      'Здесь была реальная enterprise-сложность: много каналов, правила распределения, сценарии операторов.',
    ],
    artifactIds: ['chatpoint-routing', 'chatpoint-system-settings'],
  },
  {
    id: 'chatpoint-anti',
    title: 'Anti-case: Form Messages',
    summary: 'Удобно спроектированная, но продуктово слабая фича.',
    details: [
      'Команда реализовала сценарий под внешнее требование Apple, но не доказала его ценность для клиентов.',
      'Главный вывод: удобный UX не оправдывает ненужную enterprise-функцию.',
    ],
    artifactIds: ['chatpoint-form-messages'],
  },
  {
    id: 'chatpoint-what-i-would-change',
    title: 'Что бы я сделал иначе сегодня',
    summary: 'Сначала разобрался бы с product value и activation, а потом накачивал backlog.',
    details: [
      'Продукт закрыли не потому, что интерфейсы были плохими, а потому что команда рано ушла в delivery без нормальной проверки ценности.',
      'Это полезный кейс именно как сигнал продуктовой зрелости, а не как медаль за успешный релиз.',
    ],
  },
];

const chatpointCase: CaseContent = {
  id: 'chatpoint',
  shortTitle: 'ChatPoint',
  title: 'ChatPoint — B2B платформа для коммуникации, которая не взлетела',
  railSubtitle: 'Supporting anti-case',
  shortDescription: 'Сложный B2B onboarding и трезвый anti-case про product value',
  category: 'supporting',
  tags: ['B2B', 'Onboarding', 'Routing', 'Research'],
  summaryTitle: 'Короткий ответ',
  detailTitle: 'Развернутый ответ',
  routeTitle: 'Почему этот anti-case вообще полезен',
  resultChips: ['B2B SaaS', 'research-driven', 'anti-case'],
  metrics: [],
  role: 'Product Designer',
  roleDescription: 'Onboarding, enterprise scenarios, research, design review',
  summaryBlocks: [
    {
      type: 'lead',
      title: 'Почему кейс не выкинут',
      body: [
        'ChatPoint не стал флагманским успехом, но он полезен как B2B anti-case: здесь видно onboarding, routing, слабый product process и взрослый вывод о том, почему продукт может проиграть.',
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
    { type: 'disclosures', title: 'Доказательства и anti-case выводы', items: chatpointDisclosures },
    { type: 'gallery', title: 'Артефакты', items: makeGallery([
      { id: 'chatpoint-apple-onboarding', title: 'Apple onboarding', description: 'Ключевой user-facing сценарий кейса.' },
      { id: 'chatpoint-viber', title: 'Viber onboarding', description: 'Повторяемый onboarding pattern, а не одноразовый wizard.' },
      { id: 'chatpoint-routing', title: 'Routing', description: 'Сложность продукта beyond onboarding.' },
      { id: 'chatpoint-form-messages', title: 'Form Messages', description: 'Anti-case внутри кейса.' },
    ]) },
    { type: 'cta', label: 'Связаться по этому кейсу', action: { type: 'open_contact_modal', source: 'chatpoint-detail' } },
  ],
  routeBlocks: [
    {
      type: 'lead',
      title: 'Почему этот кейс не стоит пропускать',
      body: [
        'ChatPoint не про победу на рынке, а про product judgment: сложный B2B onboarding, системная логика и трезвый вывод о том, где команда ушла не туда.',
      ],
    },
    { type: 'chips', title: 'Открыть', items: [
      { id: 'chatpoint-short', label: 'Короткий ответ', action: { type: 'open_case_summary', caseId: 'chatpoint' } },
      { id: 'chatpoint-detail', label: 'Развернутый ответ', action: { type: 'open_case_detail', caseId: 'chatpoint' } },
    ] },
  ],
  disclosures: chatpointDisclosures,
  artifacts: [
    { id: 'chatpoint-apple-onboarding', title: 'Apple Messages for Business', caption: 'Step-by-step guide для сложного подключения.', imageUrl: '/projects/chatpoint/apple-onboarding.png', sourceLabel: 'Figma' },
    { id: 'chatpoint-viber', title: 'Подключение Viber', caption: 'Повторяемый onboarding pattern.', imageUrl: '/projects/chatpoint/viber-onboarding.png', sourceLabel: 'Figma' },
    { id: 'chatpoint-routing', title: 'Маршрутизация диалогов', caption: 'Логика распределения внутри системы.', imageUrl: '/projects/chatpoint/routing.png', sourceLabel: 'Figma' },
    { id: 'chatpoint-system-settings', title: 'Настройка сценариев системы', caption: 'High-density B2B настройка.', imageUrl: '/projects/chatpoint/system-settings.png', sourceLabel: 'Figma' },
    { id: 'chatpoint-form-messages', title: 'Form Messages', caption: 'Удобно спроектировано, но не доказало ценность.', imageUrl: '/projects/chatpoint/form-messages.png', sourceLabel: 'Figma' },
    { id: 'chatpoint-purchase-path', title: 'Путь пользователя', caption: 'Попытка понять момент покупки слишком поздно.', imageUrl: '/projects/chatpoint/purchase-path.png', sourceLabel: 'Figma' },
  ],
  gallery: makeGallery([
    { id: 'chatpoint-apple-onboarding', title: 'Apple onboarding', description: 'Step-by-step вместо длинной инструкции.' },
    { id: 'chatpoint-routing', title: 'Routing', description: 'Системная логика распределения.' },
    { id: 'chatpoint-system-settings', title: 'Settings', description: 'Плотные B2B настройки.' },
    { id: 'chatpoint-form-messages', title: 'Form Messages', description: 'Anti-case про ценность.' },
  ]),
  contextPanel: {
    title: 'ChatPoint',
    subtitle: 'Web · B2B · SaaS',
    tags: ['B2B', 'Onboarding', 'Routing', 'Anti-case'],
    note:
      'Продукт не вышел в полноценный рынок. Ценность кейса — onboarding clarity, routing complexity и зрелый продуктовый вывод.',
    role: 'Product Designer',
    roleDescription: 'Onboarding, enterprise scenarios, research, design review',
    cta: { label: 'Открыть полный разбор', action: { type: 'open_case_detail', caseId: 'chatpoint' } },
  },
  followUpChips: [
    { id: 'chatpoint-follow-why', label: 'Почему продукт не взлетел?', action: { type: 'open_case_detail', caseId: 'chatpoint' } },
    { id: 'chatpoint-follow-artifact', label: 'Покажи Apple onboarding', action: { type: 'open_image_modal', caseId: 'chatpoint', artifactId: 'chatpoint-apple-onboarding' } },
    { id: 'chatpoint-follow-experience', label: 'Покажи опыт работы', action: { type: 'open_experience_summary' } },
  ],
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
    { id: 'expenses-history', title: 'История операций', caption: 'Исходный экран чужой команды.', imageUrl: '/projects/mobile/expenses-history.png' },
    { id: 'expenses-family', title: 'Расходы семьи', caption: 'Целевой сценарий просмотра расходов.', imageUrl: '/projects/mobile/expenses-family.png' },
    { id: 'expenses-filters', title: 'Фильтры', caption: 'Детализация и отбор операций.', imageUrl: '/projects/mobile/expenses-filters.png' },
  ],
  gallery: makeGallery([
    { id: 'expenses-history', title: 'История операций', description: 'Исходный контур.' },
    { id: 'expenses-family', title: 'Расходы семьи', description: 'Новый сценарий.' },
    { id: 'expenses-filters', title: 'Фильтры', description: 'Работа с деталями.' },
  ]),
  contextPanel: {
    title: 'Расходы держателей карт',
    subtitle: 'Mobile · Cards · B2C',
    tags: ['Финтех', 'Карты', 'История', 'Исследование'],
    role: 'Product Designer',
    roleDescription: 'Research, alignment, UX flow, UI, handoff',
    note: 'Сильная часть кейса — не “еще один экран”, а межкомандное согласование через доказанную потребность.',
  },
  followUpChips: [
    { id: 'expenses-follow-why', label: 'Как доказал потребность?', action: { type: 'open_mobile_case_detail', caseId: 'expenses-card-holders' } },
    { id: 'expenses-follow-mobile', label: 'Что еще он делал в мобилках?', action: { type: 'open_mobile_experience_overview' } },
  ],
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
    { id: 'sharing-flow', title: 'Путь пользователя', caption: 'Новая branching-логика сценария.', imageUrl: '/projects/mobile/subscription-sharing-flow.png' },
  ],
  gallery: makeGallery([{ id: 'sharing-flow', title: 'Путь пользователя', description: 'Новый link-based сценарий.' }]),
  contextPanel: {
    title: 'Шаринг подписки',
    subtitle: 'Mobile · Subscription · B2C',
    tags: ['Подписка', 'Friction', 'Branching', 'Mobile'],
    role: 'Product Designer',
    roleDescription: 'Flow redesign, branching logic, UX/UI',
  },
  followUpChips: [
    { id: 'sharing-follow-detail', label: 'Покажи подробнее', action: { type: 'open_mobile_case_detail', caseId: 'subscription-sharing' } },
  ],
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

const superappCase: CaseContent = {
  id: 'family-superapp',
  shortTitle: 'Семейное superapp UX/UI',
  title: 'Семейное superapp UX/UI',
  railSubtitle: 'Mobile case',
  shortDescription: 'Системный mobile UX/UI кейс с research и IA',
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
    { id: 'superapp-research', title: 'Исследования', caption: 'Основа продуктовой структуры.', imageUrl: '/projects/mobile/superapp-research.png' },
    { id: 'superapp-ia', title: 'Структура приложения', caption: 'Information architecture.', imageUrl: '/projects/mobile/superapp-ia.png' },
    { id: 'superapp-flow', title: 'User flow', caption: 'Ключевые сценарии.', imageUrl: '/projects/mobile/superapp-flow.png' },
    { id: 'superapp-ui', title: 'Работа над UI', caption: 'UI-концепт.', imageUrl: '/projects/mobile/superapp-ui.png' },
  ],
  gallery: makeGallery([
    { id: 'superapp-research', title: 'Исследования', description: 'Основа продуктовой структуры.' },
    { id: 'superapp-ia', title: 'Структура', description: 'Information architecture.' },
    { id: 'superapp-flow', title: 'User flows', description: 'Ключевые пользовательские пути.' },
    { id: 'superapp-ui', title: 'UI', description: 'Концепт интерфейса.' },
  ]),
  contextPanel: {
    title: 'Семейное superapp UX/UI',
    subtitle: 'Mobile · Systemic UX/UI',
    tags: ['Research', 'IA', 'Flows', 'UI'],
    role: 'Product Designer',
    roleDescription: 'Research, IA, flows, UI concept',
  },
  followUpChips: [
    { id: 'superapp-follow-detail', label: 'Покажи detail', action: { type: 'open_mobile_case_detail', caseId: 'family-superapp' } },
  ],
};

const experience: ExperienceContent = {
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
    { type: 'section', title: 'MTS Digital', body: ['Здесь Андрей вырос на high-density enterprise-интерфейсах, workflows операторов и B2B anti-case вроде ChatPoint.'] },
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
  },
  followUpChips: [
    { id: 'experience-follow-siebel', label: 'Открой SIEBEL', action: { type: 'open_case_summary', caseId: 'siebel' } },
    { id: 'experience-follow-alfa', label: 'Покажи флагманский кейс', action: { type: 'open_case_summary', caseId: 'alfa-smart' } },
    { id: 'experience-follow-mobile', label: 'Что он делал в мобилках?', action: { type: 'open_mobile_experience_overview' } },
  ],
};

const additionalCases: ContextPanelData = {
  title: 'Дополнительные кейсы',
  subtitle: 'Breadth with signal',
  tags: ['AI', 'B2B', 'Systems', 'UI craft'],
  note: 'Это не “остатки портфолио”, а дополнительная ширина: мобильные сценарии, anti-cases и системные B2B-решения.',
};

const additionalCasesContent: AdditionalCasesContent = {
  summaryBlocks: [
    { type: 'lead', title: 'Да, у Андрея есть сильные кейсы и кроме флагманов', body: ['Важно не размывать впечатление количеством. Здесь ценность в ширине сигнала: мобильные сценарии, плотные B2B-интерфейсы, системное мышление и product judgment.'] },
    { type: 'disclosures', title: 'Направления', items: [
      { id: 'additional-mobile', title: 'Мобильные сценарии', summary: 'Подписки, семейные сценарии, роли, ветвления и межкомандные зависимости.', details: ['Хороший вход: кейсы про держателей карт, шаринг подписки и семейное superapp UX/UI.'] },
      { id: 'additional-enterprise', title: 'Плотные B2B-интерфейсы', summary: 'Workflow-heavy продукты с высокой информационной плотностью.', details: ['Главные примеры: SIEBEL и ChatPoint.'] },
      { id: 'additional-systems', title: 'Системное мышление', summary: 'Не просто локальный UI, а структура, routing, процессы и delivery.', details: ['Это проявляется и в SIEBEL, и в Alpha-Smart, и в mobile кейсах.'] },
      { id: 'additional-judgment', title: 'Product judgment', summary: 'Умение не только делать фичи, но и видеть, когда продукт идет не туда.', details: ['Лучший пример — ChatPoint как anti-case.'] },
    ] },
    { type: 'gallery', title: 'Куда можно открыть следующий шаг', items: makeGallery([
      { id: 'alfa-smart', title: 'Альфа-Смарт', description: 'Флагманский продуктовый кейс.' },
      { id: 'siebel', title: 'SIEBEL', description: 'Enterprise workflow с цифрами.' },
      { id: 'chatpoint', title: 'ChatPoint', description: 'B2B anti-case с product judgment.' },
      { id: 'expenses-card-holders', title: 'Mobile cases', description: 'Ширина мобильной работы.' },
    ]) },
  ],
  contextPanel: additionalCases,
  followUpChips: [
    { id: 'additional-chip-alfa', label: 'Открой Альфа-Смарт', action: { type: 'open_case_summary', caseId: 'alfa-smart' } },
    { id: 'additional-chip-siebel', label: 'Открой SIEBEL', action: { type: 'open_case_summary', caseId: 'siebel' } },
    { id: 'additional-chip-chatpoint', label: 'Открой ChatPoint', action: { type: 'open_case_summary', caseId: 'chatpoint' } },
    { id: 'additional-chip-mobile', label: 'Покажи мобильные кейсы', action: { type: 'open_mobile_experience_overview' } },
  ],
};

const mobileOverview: MobileOverviewContent = {
  summaryBlocks: [
    { type: 'lead', title: 'Да, у Андрея есть не один мобильный кейс', body: ['Помимо Альфа-Смарта у него есть мобильные сценарии, где важны не декоративные экраны, а роли, ветвления, межкомандное согласование и системный UX/UI.'] },
    { type: 'gallery', title: 'Что можно открыть', items: makeGallery([
      { id: 'alfa-smart', title: 'Альфа-Смарт', description: 'Флагманский mobile/web кейс.' },
      { id: 'expenses-card-holders', title: 'Расходы держателей', description: 'Исследование и межкомандное согласование.' },
      { id: 'subscription-sharing', title: 'Шаринг подписки', description: 'Снижение трения в branching flow.' },
      { id: 'family-superapp', title: 'Семейное superapp UX/UI', description: 'Research, IA, flows и UI.' },
    ]) },
  ],
  contextPanel: {
    title: 'Мобильный опыт',
    subtitle: 'Mobile · Fintech · UX/UI',
    tags: ['Research', 'Mobile flows', 'Branching', 'Systemic UX'],
    note: 'Смысл этого блока — показать, что мобильный опыт Андрея не заканчивается одним флагманским кейсом.',
  },
  followUpChips: [
    { id: 'mobile-chip-expenses', label: 'Расходы держателей', action: { type: 'open_mobile_case_summary', caseId: 'expenses-card-holders' } },
    { id: 'mobile-chip-sharing', label: 'Шаринг подписки', action: { type: 'open_mobile_case_summary', caseId: 'subscription-sharing' } },
    { id: 'mobile-chip-superapp', label: 'Семейное superapp UX/UI', action: { type: 'open_mobile_case_summary', caseId: 'family-superapp' } },
  ],
};

export const portfolioContent: PortfolioContent = {
  entry,
  cases: {
    'alfa-smart': alfaCase,
    siebel: siebelCase,
    chatpoint: chatpointCase,
    'expenses-card-holders': expensesCase,
    'subscription-sharing': sharingCase,
    'family-superapp': superappCase,
  },
  experience,
  additionalCases: additionalCasesContent,
  mobileOverview,
  contact: contactOptions,
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

export function getExperienceRoute(caseId?: string): ContentBlock[] {
  if (caseId && portfolioContent.experience.routeBlocks[caseId]) {
    return portfolioContent.experience.routeBlocks[caseId];
  }

  return portfolioContent.experience.routeBlocks.default;
}
