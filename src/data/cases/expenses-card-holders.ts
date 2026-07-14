import { makeGallery } from '@/data/case-module-helpers';
import type { CaseContent, DisclosureRow, StructuredCaseSummaryData } from '@/lib/portfolio/types';

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
          width: 389,
          preview: {
            src: '/cases/expenses-card-holders/disclosure-research.png',
            backgroundColor: '#FFFFFF',
            borderColor: '#E7EAF2',
            imageClassName: 'absolute inset-0 size-full max-w-none object-cover',
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
            imageClassName: 'absolute inset-0 size-full max-w-none object-cover',
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
            imageClassName: 'absolute inset-0 size-full max-w-none object-cover',
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
            imageClassName: 'absolute inset-0 size-full max-w-none object-cover',
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
        imageClassName: 'absolute inset-0 size-full max-w-none object-cover',
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
        imageClassName: 'absolute inset-0 size-full max-w-none object-cover',
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
        imageClassName: 'absolute inset-0 size-full max-w-none object-cover',
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
        imageClassName: 'absolute inset-0 size-full max-w-none object-cover',
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

export const expensesCardHoldersCase: CaseContent = {
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
