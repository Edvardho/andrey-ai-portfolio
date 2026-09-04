import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { portfolioContent } from '@/data/portfolio-content.server';
import type {
  CaseContent,
  StructuredCaseSummaryData,
  StructuredSummaryDisclosureItem,
} from '@/lib/portfolio/types';

type CaseId =
  | 'alfa-smart'
  | 'chatpoint'
  | 'siebel'
  | 'expenses-card-holders'
  | 'subscription-sharing'
  | 'ux-ui-wannabelike';

type ExpectedDisclosure = {
  id: string;
  label: string;
  bodyIncludes?: string;
  layoutType: StructuredSummaryDisclosureItem['layoutType'];
  cardCount?: number;
  rowWidth?: number;
  peekWidth?: number;
};

type ExpectedCaseContract = {
  id: CaseId;
  sections: string[];
  disclosureTitle: string;
  disclosures: ExpectedDisclosure[];
  showcaseTitle: string;
  showcaseItems: string[];
  resultsTitle: string;
  resultMetricValues: string[];
  requiredText: string[];
  disallowedText: string[];
  expectedPreviewClasses?: Array<{
    itemId: string;
    imageClassName: string;
  }>;
};

const CASE_CONTRACTS: ExpectedCaseContract[] = [
  {
    id: 'alfa-smart',
    sections: ['Что это был за продукт', 'Роль Андрея'],
    disclosureTitle: 'Что делал Андрей',
    disclosures: [
      {
        id: 'alfa-structured-requirements',
        label: 'Разбирался в требованиях заказчика',
        layoutType: 'single_preview',
      },
      {
        id: 'alfa-structured-user-flow',
        label: 'Собирал User Flow, драфты макетов, чтобы быстро синхронизироваться с бизнесом',
        layoutType: 'two_cards',
      },
      {
        id: 'alfa-structured-testing',
        label: 'Готовил гипотезы и прототипы для юзабилити тестирования',
        layoutType: 'two_cards',
      },
      {
        id: 'alfa-structured-delivery',
        label: 'Прошел дизайн-чек, передал макеты в разработку, провел дизайн-ревью',
        layoutType: 'three_cards_scroll',
        rowWidth: 1207,
        peekWidth: 158,
      },
    ],
    showcaseTitle: 'Примеры интерфейсных решений',
    showcaseItems: [
      'Лендинг подписки',
      'Экран управления',
      'Приглашение участников',
      'Управление участниками',
    ],
    resultsTitle: 'Результаты',
    resultMetricValues: ['32 111', '30%', '1,1 млн ₽'],
    requiredText: [
      'Альфа-Смарт — семейная подписка Альфа-Банка',
      'Семейная подписка, встроенная в мобильное приложение',
      'Решение запустили на iOS, Android и web',
    ],
    disallowedText: [
      'Enterprise-интерфейс для обработки входящих обращений',
      'ChatPoint',
      'Apple Messages for Business',
      'Кейс про доработку шаринга подписки',
      'Старый путь добавления участника был перегружен',
    ],
  },
  {
    id: 'chatpoint',
    sections: ['Что это был за продукт', 'Роль Андрея'],
    disclosureTitle: 'Что делал Андрей',
    disclosures: [
      {
        id: 'chatpoint-structured-onboarding',
        label: 'Упростил подключение канала Messages for Business',
        layoutType: 'single_preview',
      },
      {
        id: 'chatpoint-structured-routing',
        label: 'Настройка маршрутизации и системные сценарии',
        layoutType: 'two_cards',
      },
      {
        id: 'chatpoint-structured-anti',
        label: 'Анти-кейс: реализация функционала Form Messages',
        layoutType: 'two_cards',
      },
      {
        id: 'chatpoint-structured-what-i-would-change',
        label: 'Что бы я сделал иначе сегодня',
        layoutType: 'three_cards_scroll',
        rowWidth: 1207,
        peekWidth: 158,
      },
    ],
    showcaseTitle: 'Ключевые артефакты',
    showcaseItems: ['Apple onboarding', 'Routing', 'Form Messages', 'Activation path'],
    resultsTitle: 'Что важно понять',
    resultMetricValues: ['Research', 'Value', 'Выводы'],
    requiredText: [
      'ChatPoint — B2B-платформа для общения бизнеса с клиентами',
      'сложные B2B-сценарии',
      'разработка без проверки ценности',
    ],
    disallowedText: [
      'Альфа-Смарт — семейная подписка Альфа-Банка',
      'Enterprise-интерфейс для обработки входящих обращений',
      'SIEBEL — внутренний интерфейс',
      'Кейс про доработку шаринга подписки',
      'Старый путь добавления участника был перегружен',
    ],
  },
  {
    id: 'siebel',
    sections: ['Что это был за продукт', 'Роль Андрея'],
    disclosureTitle: 'Что сделал Андрей',
    disclosures: [
      {
        id: 'siebel-structured-research',
        label: 'Инициировал исследования перед началом работы над редизайном',
        bodyIncludes: 'Вместо редизайна по ощущениям Андрей изучил около 12 записей работы операторов',
        layoutType: 'single_preview',
      },
      {
        id: 'siebel-structured-workflow',
        label: 'Переработал основной workflow оператора',
        bodyIncludes: 'оператор путался между двумя окнами и тратил время на поиск контекста',
        layoutType: 'two_cards',
      },
      {
        id: 'siebel-structured-repeat-actions',
        label: 'Упростил повторяющиеся действия в ежедневной работе',
        bodyIncludes: 'Операторы часто пользовались шаблонами',
        layoutType: 'two_cards',
      },
      {
        id: 'siebel-structured-rollout',
        label: 'Проверил MVP и довел изменения до релиза',
        bodyIncludes: 'MVP протестировали через A/B на операторах',
        layoutType: 'single_preview',
      },
    ],
    showcaseTitle: 'Ключевые артефакты',
    showcaseItems: ['Старый интерфейс', '2-window mode', 'Данные о клиенте', 'Шаблоны ответов'],
    resultsTitle: 'Что важно понять',
    resultMetricValues: ['Research', 'Impact', 'Rollout'],
    requiredText: [
      'Enterprise-интерфейс для обработки входящих обращений',
      'Чем дольше оператор отвечает на один диалог',
      'время обработки: 900 сек → 580 сек',
    ],
    disallowedText: [
      'Альфа-Смарт — семейная подписка Альфа-Банка',
      'ChatPoint — B2B платформа',
      'семейная подписка, встроенная в мобильное приложение',
      'Кейс про доработку шаринга подписки',
      'Старый путь добавления участника был перегружен',
    ],
    expectedPreviewClasses: [
      {
        itemId: 'siebel-structured-showcase-old-interface',
        imageClassName: 'absolute inset-0 size-full max-w-none object-contain',
      },
    ],
  },
  {
    id: 'expenses-card-holders',
    sections: ['Почему задача была сложной', 'Роль Андрея'],
    disclosureTitle: 'Что делал Андрей',
    disclosures: [
      {
        id: 'expenses-structured-research',
        label: 'Составил путь пользователя, провел исследование и подтвердил гипотезу',
        bodyIncludes: 'Сначала Андрей составил путь пользователя и провел исследование',
        layoutType: 'single_preview',
      },
      {
        id: 'expenses-structured-entity',
        label: 'Согласовал новую сущность с командой истории операций',
        bodyIncludes: 'функционал истории операций принадлежал другой команде',
        layoutType: 'single_preview',
      },
      {
        id: 'expenses-structured-filters',
        label: 'Внедрил функционал не ломая логику работы фильтра',
        bodyIncludes: 'Были собраны просмотр расходов, переходы внутри истории операций',
        layoutType: 'two_cards',
        cardCount: 2,
      },
    ],
    showcaseTitle: 'Ключевые экраны и артефакты',
    showcaseItems: ['История операций', 'Расходы семьи', 'Фильтры', 'Flow'],
    resultsTitle: 'Результат',
    resultMetricValues: ['2 команды', '1 исследование', 'mobile flow'],
    requiredText: [
      'Кейс про расходы для держателей карт',
      'Семейный банк отвечал за сценарий доп. держателей',
      'Андрей доказал потребность, синхронизировал две команды',
    ],
    disallowedText: [
      'Альфа-Смарт — семейная подписка Альфа-Банка',
      'ChatPoint — B2B-платформа',
      'Enterprise-интерфейс для обработки входящих обращений',
      'Кейс про доработку шаринга подписки',
      'Старый путь добавления участника был перегружен',
    ],
    expectedPreviewClasses: [
      {
        itemId: 'expenses-structured-expenses-screen-card',
        imageClassName: 'absolute inset-0 size-full max-w-none object-cover',
      },
      {
        itemId: 'expenses-structured-filter-details-card',
        imageClassName: 'absolute inset-0 size-full max-w-none object-cover',
      },
      {
        itemId: 'expenses-structured-showcase-flow',
        imageClassName: 'absolute inset-0 size-full max-w-none object-cover',
      },
    ],
  },
  {
    id: 'subscription-sharing',
    sections: ['Почему старый путь ломался', 'Роль Андрея'],
    disclosureTitle: 'Что делал Андрей',
    disclosures: [
      {
        id: 'sharing-structured-old-flow',
        label: 'Разобрал, где старый путь создает лишнее трение',
        bodyIncludes: 'Старый user-flow заставлял пользователя',
        layoutType: 'single_preview',
      },
      {
        id: 'sharing-structured-link-flow',
        label: 'Заменил SMS-зависимый flow на ссылку',
        bodyIncludes: 'Приглашение по ссылке сделало сценарий проще и дешевле',
        layoutType: 'single_preview',
      },
      {
        id: 'sharing-structured-branches',
        label: 'Развел сценарии для клиента и не-клиента банка',
        bodyIncludes: 'После перехода по ссылке приглашенный участник видит лендинг',
        layoutType: 'two_cards',
      },
    ],
    showcaseTitle: 'Ключевые экраны и артефакты',
    showcaseItems: ['Старый путь', 'Ссылка', 'Новый путь'],
    resultsTitle: 'Результат',
    resultMetricValues: ['2 шага', 'Сокращение расходов'],
    requiredText: [
      'Кейс про доработку шаринга подписки',
      'Старый путь добавления участника был перегружен',
      'переписывать саму механику активации',
    ],
    disallowedText: [
      'Альфа-Смарт — семейная подписка Альфа-Банка',
      'ChatPoint — B2B-платформа',
      'Enterprise-интерфейс для обработки входящих обращений',
      'Кейс про расходы для держателей карт',
    ],
    expectedPreviewClasses: [
      {
        itemId: 'sharing-structured-showcase-old-path',
        imageClassName: 'absolute inset-0 size-full max-w-none object-cover',
      },
      {
        itemId: 'sharing-structured-showcase-link',
        imageClassName: 'absolute inset-0 size-full max-w-none object-cover',
      },
      {
        itemId: 'sharing-structured-showcase-new-path',
        imageClassName: 'absolute inset-0 size-full max-w-none object-cover',
      },
    ],
  },
  {
    id: 'ux-ui-wannabelike',
    sections: ['Почему кейс важен', 'Роль Андрея'],
    disclosureTitle: 'Что делал Андрей',
    disclosures: [
      {
        id: 'wannabelike-structured-research',
        label: 'Собрал обратную связь от пользователей и собрал структуру приложения',
        bodyIncludes: 'После проведенных интервью Андрей собрал боли',
        layoutType: 'two_cards',
        cardCount: 2,
      },
      {
        id: 'wannabelike-structured-scenarios',
        label: 'Создание пользовательских сценариев и поиск визуальной метафоры',
        bodyIncludes: 'как распределить семейные сценарии',
        layoutType: 'two_cards',
        cardCount: 2,
      },
      {
        id: 'wannabelike-structured-ui-concept',
        label: 'Подготовил UI-концепт приложения',
        bodyIncludes: 'На основе User Flow',
        layoutType: 'three_cards_scroll',
        cardCount: 3,
        rowWidth: 1207,
        peekWidth: 158,
      },
    ],
    showcaseTitle: 'Ключевые экраны и артефакты',
    showcaseItems: ['Исследования', 'Структура', 'User flow', 'UI-концепт'],
    resultsTitle: 'Результат',
    resultMetricValues: ['Исследования', 'Собрал структуру', 'Создал UI концепт'],
    requiredText: [
      'Кейс про UX/UI WannabeLike',
      'Андрей пришел на курс Миши Розова',
      'Сильная сторона этого кейса — связность',
      'Проведено 8 интервью',
    ],
    disallowedText: [
      'Альфа-Смарт — семейная подписка Альфа-Банка',
      'ChatPoint — B2B-платформа',
      'Enterprise-интерфейс для обработки входящих обращений',
      'Кейс про расходы для держателей карт',
      'Кейс про доработку шаринга подписки',
    ],
    expectedPreviewClasses: [
      {
        itemId: 'wannabelike-structured-research-card',
        imageClassName: 'absolute inset-0 size-full max-w-none object-cover',
      },
      {
        itemId: 'wannabelike-structured-metaphor-card',
        imageClassName: 'absolute inset-0 size-full max-w-none object-cover',
      },
      {
        itemId: 'wannabelike-structured-first-entry-card',
        imageClassName: 'absolute inset-0 size-full max-w-none object-cover',
      },
      {
        itemId: 'wannabelike-structured-showcase-ui-concept',
        imageClassName: 'absolute inset-0 size-full max-w-none object-cover',
      },
    ],
  },
];

function getCase(id: CaseId): CaseContent {
  const caseContent = portfolioContent.cases[id];
  assert.ok(caseContent, `${id}: case is required`);
  return caseContent;
}

function getSummary(caseContent: CaseContent): StructuredCaseSummaryData {
  const summary = caseContent.structuredSummary;
  assert.ok(summary, `${caseContent.id}: structuredSummary is required`);
  return summary;
}

function assertIncludes(haystack: string, needle: string, label: string) {
  assert.ok(haystack.includes(needle), `${label}: expected text fragment "${needle}"`);
}

function assertAssetExists(src: string, label: string) {
  assert.ok(src.startsWith('/'), `${label}: asset path must be absolute`);
  const assetPath = join(process.cwd(), 'public', src.slice(1));
  assert.ok(existsSync(assetPath), `${label}: missing asset ${src}`);
}

function assertPreviewAsset({
  src,
  overlaySrc,
}: {
  src: string;
  overlaySrc?: string;
}, label: string) {
  assertAssetExists(src, label);

  if (overlaySrc) {
    assertAssetExists(overlaySrc, `${label} overlay`);
  }
}

function stringifySummary(summary: StructuredCaseSummaryData): string {
  return JSON.stringify(summary);
}

function assertArtifactTargets(caseContent: CaseContent, summary: StructuredCaseSummaryData) {
  const artifactIds = new Set(caseContent.artifacts.map((artifact) => artifact.id));

  for (const item of summary.disclosures) {
    if (item.layoutType === 'text_only') {
      assert.equal(item.cards?.length ?? 0, 0, `${caseContent.id}/${item.id}: text_only must not carry cards`);
      continue;
    }

    assert.ok(item.cards?.length, `${caseContent.id}/${item.id}: non-text disclosure must have cards`);

    for (const card of item.cards) {
      assert.ok(card.artifactId, `${caseContent.id}/${card.id}: disclosure card artifactId is required`);
      assert.ok(
        artifactIds.has(card.artifactId),
        `${caseContent.id}/${card.id}: artifactId "${card.artifactId}" must exist in case artifacts`,
      );
      assertPreviewAsset(card.preview, `${caseContent.id}/${card.id}`);
    }
  }

  for (const item of summary.showcaseItems) {
    assert.ok(
      artifactIds.has(item.artifactId),
      `${caseContent.id}/${item.id}: showcase artifactId "${item.artifactId}" must exist in case artifacts`,
    );
    assertPreviewAsset(item.preview, `${caseContent.id}/${item.id}`);
  }
}

function assertExpectedPreviewClasses(summary: StructuredCaseSummaryData, contract: ExpectedCaseContract) {
  for (const expected of contract.expectedPreviewClasses ?? []) {
    const item = summary.showcaseItems.find((showcaseItem) => showcaseItem.id === expected.itemId)
      ?? summary.disclosures.flatMap((disclosure) => disclosure.cards ?? []).find((card) => card.id === expected.itemId);

    assert.ok(item, `${contract.id}/${expected.itemId}: preview item is required`);
    assert.equal(
      item.preview.imageClassName,
      expected.imageClassName,
      `${contract.id}/${expected.itemId}: preview crop class must stay aligned with Figma baseline`,
    );
  }
}

function assertCompactCollapsedDisclosureLayout() {
  const source = readFileSync(
    join(process.cwd(), 'src/components/portfolio-structured-case-summary.tsx'),
    'utf8',
  );

  assert.ok(
    source.includes('<div className="flex flex-col gap-1">'),
    'Collapsed compact disclosures must use Figma\'s 4px list gap instead of stacked margins',
  );
  assert.ok(
    source.includes("? 'flex min-h-8 w-full cursor-pointer items-center gap-6 overflow-hidden text-left"),
    'Collapsed compact disclosure rows must retain the Figma 32px baseline and 24px content-to-chevron gap',
  );
  assert.ok(
    source.includes("? 'min-w-0 flex-1 text-[13px] leading-[18px] text-[#494A56]'"),
    'Collapsed compact disclosure labels must not add vertical padding outside the Figma text line-height',
  );
  assert.ok(
    source.includes("? 'flex size-8 shrink-0 items-center justify-center rounded-full bg-white'"),
    'Collapsed compact disclosure chevrons must use the Figma 32px visual container',
  );
  assert.equal(
    source.includes("? 'flex min-h-11 w-full cursor-pointer items-center text-left"),
    false,
    'Collapsed compact disclosure rows must not be inflated to 44px',
  );
}

function assertCaseContract(contract: ExpectedCaseContract) {
  const caseContent = getCase(contract.id);
  const summary = getSummary(caseContent);
  const serialized = stringifySummary(summary);

  assertPreviewAsset(summary.intro.preview, `${contract.id}/intro`);
  assert.deepEqual(
    summary.sections.map((section) => section.title),
    contract.sections,
    `${contract.id}: section titles must stay stable`,
  );
  assert.equal(summary.disclosureTitle, contract.disclosureTitle, `${contract.id}: disclosure title mismatch`);
  assert.equal(summary.showcaseTitle, contract.showcaseTitle, `${contract.id}: showcase title mismatch`);
  assert.equal(summary.resultsTitle, contract.resultsTitle, `${contract.id}: results title mismatch`);

  for (const expected of contract.disclosures) {
    const item = summary.disclosures.find((disclosure) => disclosure.id === expected.id);
    assert.ok(item, `${contract.id}/${expected.id}: disclosure is required`);
    assert.equal(item.label, expected.label, `${contract.id}/${expected.id}: label mismatch`);
    assert.equal(item.layoutType, expected.layoutType, `${contract.id}/${expected.id}: layoutType mismatch`);
    assert.equal(item.rowWidth, expected.rowWidth, `${contract.id}/${expected.id}: rowWidth mismatch`);
    assert.equal(item.peekWidth, expected.peekWidth, `${contract.id}/${expected.id}: peekWidth mismatch`);
    if (expected.cardCount !== undefined) {
      assert.equal(
        item.cards?.length ?? 0,
        expected.cardCount,
        `${contract.id}/${expected.id}: card count mismatch`,
      );
    }

    if (expected.bodyIncludes) {
      assertIncludes(item.body, expected.bodyIncludes, `${contract.id}/${expected.id}`);
    }
  }

  assert.deepEqual(
    summary.showcaseItems.map((item) => item.title),
    contract.showcaseItems,
    `${contract.id}: showcase titles must stay stable`,
  );
  assert.deepEqual(
    summary.resultMetrics.map((metric) => metric.value),
    contract.resultMetricValues,
    `${contract.id}: result metric values must stay stable`,
  );

  for (const text of contract.requiredText) {
    assertIncludes(serialized, text, contract.id);
  }

  for (const text of contract.disallowedText) {
    assert.equal(serialized.includes(text), false, `${contract.id}: leaked foreign copy "${text}"`);
  }

  assertArtifactTargets(caseContent, summary);
  assertExpectedPreviewClasses(summary, contract);
}

function main() {
  assertCompactCollapsedDisclosureLayout();

  for (const contract of CASE_CONTRACTS) {
    assertCaseContract(contract);
  }

  console.log('Structured summary contract passed.');
}

main();
