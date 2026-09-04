import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { portfolioContent } from '@/data/portfolio-content.server';

const summary = portfolioContent.experience.structuredSummary;

assert.ok(summary, 'experience.structuredSummary is required');

function assertIncludes(haystack: string, needle: string, label: string) {
  assert.ok(haystack.includes(needle), `${label} should include "${needle}"`);
}

function assertAssetExists(src: string) {
  assert.ok(src.startsWith('/'), `asset src should be root-relative: ${src}`);

  const assetPath = join(process.cwd(), 'public', src.slice(1));

  assert.ok(existsSync(assetPath), `asset should exist: ${assetPath}`);
}

const serialized = JSON.stringify(summary);

assert.equal(summary.intro.title, 'Андрей — product designer с 6 годами опыта в B2B и B2C');
assertIncludes(summary.intro.body, 'Работал в МТС, Альфа-Банке и Positive Technologies', 'intro body');
assertIncludes(summary.intro.body, 'довести решение до запуска', 'intro body');
assertAssetExists(summary.intro.preview.src);
assert.equal(summary.intro.preview.backgroundColor, '#D1D7E3');
assert.equal(summary.intro.preview.bordered, true);
assert.equal(summary.intro.preview.radiusClassName, 'rounded-[16px]');
assert.equal(summary.intro.preview.imageClassName, 'absolute inset-0 h-full w-full object-cover object-[50%_18%]');

assert.equal(summary.currentWork.title, 'Где сейчас работает:');
assertIncludes(summary.currentWork.body, 'Positive Technologies', 'current work body');
assertIncludes(summary.currentWork.body, 'интерфейсов жюри', 'current work body');

assert.equal(summary.workHistory.title, 'Где работал Андрей');
assert.deepEqual(
  summary.workHistory.items.map((item) => item.company),
  ['Positive Technologies', 'Альфа-Банк', 'MTS Digital'],
);
assert.deepEqual(
  summary.workHistory.items.map((item) => item.period),
  ['Июнь 2024 — сейчас', 'Май 2023 — Июнь 2024', 'Апрель 2021 — Май 2023'],
);

for (const item of summary.workHistory.items) {
  assert.ok(item.description.length > 0, `${item.company} should have description`);
  assert.equal(item.resultLabel, 'Результат работы');
  assert.ok(item.resultTags.length >= 2, `${item.company} should have result tags`);
}

assertIncludes(serialized, 'Упростил сценарий сдачи отчётов исследователями', 'work result tags');
assertIncludes(serialized, '32 111 подписок за первый месяц', 'work result tags');
assertIncludes(serialized, '900→580 секунд на диалог', 'work result tags');
assertIncludes(serialized, '1000→2000 диалогов в обработке', 'work result tags');

assert.equal(summary.importantTakeaway.title, 'Что важно понять');
assertIncludes(summary.importantTakeaway.body, 'превратить сложный B2B/B2C-продукт', 'important takeaway');
assert.deepEqual(
  summary.importantTakeaway.metrics.map((metric) => metric.value),
  ['6 лет опыта', 'Продуктовый подход', 'AI в работе'],
);

assert.equal(summary.casePromptSection.title, 'Про какой кейс рассказать подробнее?');
assert.deepEqual(
  summary.casePromptSection.chips.map((chip) => chip.label),
  ['Альфа-Смарт', 'Расходы держателей', 'Добавление участников в подписку', 'UX/UI WannabeLike', 'ChatPoint'],
);

for (const chip of summary.casePromptSection.chips) {
  assert.ok('action' in chip && chip.action, `${chip.label} should route via action`);
  assert.equal(chip.action.type, 'open_case_summary', `${chip.label} should open case summary`);
}

assert.equal(summary.footerAction.label, 'Написать Андрею');
assert.equal(summary.footerAction.action.type, 'open_contact_modal');

const caseOnlyCopy = [
  'Ключевые артефакты',
  'Что делал Андрей',
  'Что сделал Андрей',
  'Enterprise-интерфейс для обработки входящих обращений',
  'Кейс про расходы для держателей карт',
  'Кейс про доработку шаринга подписки',
  'Кейс про UX/UI WannabeLike',
  'ChatPoint — B2B-платформа',
  'Альфа-Смарт — семейная подписка',
];

for (const phrase of caseOnlyCopy) {
  assert.ok(!serialized.includes(phrase), `experience should not leak case-only copy: ${phrase}`);
}

console.log('Structured experience contract passed.');
