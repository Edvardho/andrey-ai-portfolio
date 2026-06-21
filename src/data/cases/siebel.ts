import { makeGallery } from '@/data/case-module-helpers';
import type { CaseContent, DisclosureRow, StructuredCaseSummaryData } from '@/lib/portfolio/types';

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

export const siebelCase: CaseContent = {
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
