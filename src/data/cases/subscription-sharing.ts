import { makeGallery } from '@/data/case-module-helpers';
import type { CaseContent, DisclosureRow, StructuredCaseSummaryData } from '@/lib/portfolio/types';

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

export const subscriptionSharingCase: CaseContent = {
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
