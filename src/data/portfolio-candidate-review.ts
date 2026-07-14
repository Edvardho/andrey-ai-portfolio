import type { StructuredCandidateFastReviewData } from '@/lib/portfolio/types';

export const candidateFastReview: StructuredCandidateFastReviewData = {
  intro: {
    title: 'Кто такой Андрей',
    body: [
      'Андрей — продуктовый дизайнер с 6 годами опыта в B2B и B2C. Работал в MTS Digital, Альфа-Банке и Positive Technologies.',
      'Его сильная зона — сложные продукты, где нужно разобраться в ролях, сценариях и ограничениях, а потом довести решение до понятного интерфейса.',
    ],
  },
  projectScope: {
    title: 'Что проектировал',
    body: [
      'В портфолио есть запущенный банковский продукт с метриками, enterprise workflow с исследованием и честный слабый B2B-кейс, где продукт закрыли из-за поздней проверки ценности.',
    ],
  },
  watchOrder: {
    title: 'На что стоит обратить внимание',
    body: [
      'Если смотреть быстро: начните с Альфа-Смарта, потом откройте SIEBEL и ChatPoint. Этого достаточно, чтобы понять сильные стороны, ограничения и уровень зрелости Андрея.',
    ],
  },
  disclosureTitle: 'Ключевые кейсы',
  disclosures: [
    {
      id: 'candidate-review-alfa-smart',
      caseId: 'alfa-smart',
      label: 'Самый сильный кейс для быстрого просмотра — Альфа-Смарт',
      subtitle: 'Запуск семейной подписки в банковском продукте',
      body: 'Альфа-Смарт — семейная подписка в банковском продукте. Андрей разбирал роли и сценарии, собирал user flow, готовил гипотезы и прототипы, прошел дизайн-чек, подготовил handoff и довел решение до запуска на iOS, Android и web.',
      layoutType: 'three_cards_scroll',
      rowWidth: 1009,
      peekWidth: 160,
      cards: [
        {
          id: 'candidate-review-alfa-flow',
          artifactId: 'alfa-user-flow',
          title: 'Карта пути пользователя',
          description: 'Семейный сценарий разложен по ролям, входам, состояниям и развилкам до детальной отрисовки.',
          width: 320,
          preview: {
            src: '/cases/alfa-smart/disclosure-userflow-1.png',
            backgroundColor: '#4D4D4D',
            imageClassName: 'absolute inset-0 h-full w-full max-w-none object-cover',
          },
        },
        {
          id: 'candidate-review-alfa-prototype',
          artifactId: 'alfa-test-prototypes',
          title: 'Гипотезы и прототип',
          description: 'Ключевые решения проверялись до передачи в разработку, а не только после сборки экранов.',
          width: 320,
          preview: {
            src: '/cases/alfa-smart/disclosure-testing-2.png',
            backgroundColor: '#D1D7E3',
            imageClassName: 'absolute inset-0 h-full w-full max-w-none object-cover',
          },
        },
        {
          id: 'candidate-review-alfa-handoff',
          artifactId: 'alfa-dev-handoff',
          title: 'Дизайн-чек и handoff',
          description: 'Макеты собраны по пользовательскому пути и подготовлены для реализации командой разработки.',
          width: 320,
          preview: {
            src: '/cases/alfa-smart/disclosure-delivery-2.png',
            backgroundColor: '#D1D7E3',
            imageClassName: 'absolute inset-0 h-full w-full max-w-none object-cover',
          },
        },
      ],
    },
    {
      id: 'candidate-review-siebel',
      caseId: 'siebel',
      label: 'SIEBEL — операторский workflow',
      subtitle: 'Исследование реальной работы операторов поддержки',
      body: 'SIEBEL — внутренний интерфейс операторов поддержки МТС. Андрей начал с исследования реальной работы: смотрел записи, собирал гипотезы, проводил интервью и перерабатывал workflow под то, как операторы действительно обрабатывали обращения.',
      layoutType: 'three_cards_scroll',
      rowWidth: 1009,
      peekWidth: 160,
      cards: [
        {
          id: 'candidate-review-siebel-research',
          artifactId: 'siebel-hypotheses',
          title: 'Исследование перед редизайном',
          description: 'Записи работы операторов, интервью и гипотезы легли в основу изменений.',
          width: 320,
          preview: {
            src: '/cases/siebel/disclosure-research.png',
            backgroundColor: '#F7F8FC',
            imageClassName: 'absolute inset-0 h-full w-full max-w-none object-cover',
          },
        },
        {
          id: 'candidate-review-siebel-two-window',
          artifactId: 'siebel-two-window',
          title: 'Работа в двух окнах',
          description: 'Операторам нужен был режим параллельной работы с диалогами без постоянного переключения.',
          width: 320,
          preview: {
            src: '/cases/siebel/showcase-two-window.png',
            backgroundColor: '#D1D7E3',
            imageClassName: 'absolute inset-0 h-full w-full max-w-none object-cover',
          },
        },
        {
          id: 'candidate-review-siebel-client-data',
          artifactId: 'siebel-customer-data',
          title: 'Данные о клиенте',
          description: 'Ключевой контекст вынесен в рабочее место, чтобы не искать его в соседних местах.',
          width: 320,
          preview: {
            src: '/cases/siebel/showcase-client-data.png',
            backgroundColor: '#D1D7E3',
            imageClassName: 'absolute inset-0 h-full w-full max-w-none object-cover',
          },
        },
      ],
    },
    {
      id: 'candidate-review-chatpoint',
      caseId: 'chatpoint',
      label: 'ChatPoint — честный слабый кейс',
      subtitle: 'B2B-платформа коммуникаций, которую закрыли',
      body: 'ChatPoint — B2B-платформа коммуникаций для бизнеса в разных каналах связи. Андрей проектировал onboarding каналов, routing, операторские и администраторские сценарии. Важный вывод: продукт закрыли, потому что ценность проверили поздно.',
      layoutType: 'three_cards_scroll',
      rowWidth: 1009,
      peekWidth: 160,
      cards: [
        {
          id: 'candidate-review-chatpoint-apple',
          artifactId: 'chatpoint-showcase-apple-onboarding',
          title: 'Apple onboarding',
          description: 'Подключение сложного канала разложено на понятные шаги.',
          width: 320,
          preview: {
            src: '/cases/chatpoint/showcase-apple-onboarding.png',
            backgroundColor: '#D1D7E3',
            imageClassName: 'absolute inset-0 h-full w-full max-w-none object-cover',
          },
        },
        {
          id: 'candidate-review-chatpoint-routing',
          artifactId: 'chatpoint-showcase-routing',
          title: 'Настройка роутинга',
          description: 'Правила распределения обращений связывали операторов, администраторов и каналы коммуникации.',
          width: 320,
          preview: {
            src: '/cases/chatpoint/showcase-routing.png',
            backgroundColor: '#D1D7E3',
            imageClassName: 'absolute inset-0 h-full w-full max-w-none object-cover',
          },
        },
        {
          id: 'candidate-review-chatpoint-form-messages',
          artifactId: 'chatpoint-showcase-form-messages',
          title: 'Form Messages',
          description: 'Функция была аккуратно спроектирована, но сама продуктовая ценность оказалась проверена слишком поздно.',
          width: 320,
          preview: {
            src: '/cases/chatpoint/showcase-form-messages.png',
            backgroundColor: '#D1D7E3',
            imageClassName: 'absolute inset-0 h-full w-full max-w-none object-cover',
          },
        },
      ],
    },
  ],
  hiringLeadNote: {
    title: 'Если вы нанимающий лид',
    body: [
      'На интервью стоит проверять не только визуальный уровень, а ход мышления: как Андрей разбирает неопределенную задачу, где просит доказательства, как спорит за ценность и как доводит макеты до реализации.',
    ],
  },
  footerAction: {
    label: 'Написать Андрею',
    action: { type: 'open_contact_modal', source: 'candidate-fast-review' },
  },
};
