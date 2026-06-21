import { makeGallery } from '@/data/case-module-helpers';
import type { CaseContent, DisclosureRow, StructuredCaseSummaryData } from '@/lib/portfolio/types';

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

export const chatpointCase: CaseContent = {
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
