import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { portfolioContent } from '@/data/portfolio-content';
import type {
  CaseContent,
  StructuredCaseSummaryData,
  StructuredSummaryDisclosureItem,
} from '@/lib/portfolio/types';

type CaseId = 'alfa-smart' | 'chatpoint' | 'siebel';

type ExpectedDisclosure = {
  id: string;
  label: string;
  bodyIncludes?: string;
  layoutType: StructuredSummaryDisclosureItem['layoutType'];
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
    ],
  },
  {
    id: 'chatpoint',
    sections: ['Что это был за продукт', 'Роль Андрея'],
    disclosureTitle: 'Что делал Андрей',
    disclosures: [
      {
        id: 'chatpoint-structured-onboarding',
        label: 'Упросил флоу подключение канала Messages for Business',
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
    resultMetricValues: ['Research', 'Value', 'Anti-case'],
    requiredText: [
      'ChatPoint — B2B-платформа для общения бизнеса с клиентами',
      'сложные B2B-флоу',
      'delivery без проверки ценности',
    ],
    disallowedText: [
      'Альфа-Смарт — семейная подписка Альфа-Банка',
      'Enterprise-интерфейс для обработки входящих обращений',
      'SIEBEL — внутренний интерфейс',
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
    ],
    expectedPreviewClasses: [
      {
        itemId: 'siebel-structured-showcase-old-interface',
        imageClassName: 'absolute left-0 top-0 h-full w-[171.88%] max-w-none',
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
  for (const contract of CASE_CONTRACTS) {
    assertCaseContract(contract);
  }

  console.log('Structured summary contract passed.');
}

main();
