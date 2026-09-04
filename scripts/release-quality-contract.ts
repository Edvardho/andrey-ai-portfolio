import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

import { portfolioContent } from '@/data/portfolio-content.server';
import { portfolioProfile, PORTFOLIO_CASE_ORDER } from '@/data/portfolio-profile';
import { getCompactProjectNavItems } from '@/data/portfolio-compact-navigation';
import { getRailItems } from '@/data/portfolio-index';
import { shouldShowAssistantIdentity } from '@/lib/portfolio/assistant-presentation';

assert.equal(portfolioProfile.experienceLabel, '6 лет опыта');
assert.equal(portfolioProfile.workHistory[2]?.company, 'MTS Digital');
assert.equal(portfolioProfile.contact.email, 'andrew.makarevitch@yandex.ru');
assert.equal(portfolioProfile.highlightMetrics.alfaSubscriptions, '32 111 подписок за первый месяц');
assert.equal(portfolioProfile.highlightMetrics.alfaRevenue, '1,1 млн ₽ выручки');

const railItems = getRailItems();
assert.deepEqual(
  railItems.filter((item) => item.kind === 'case').map((item) => item.id),
  [...PORTFOLIO_CASE_ORDER],
);
assert.deepEqual(
  getCompactProjectNavItems(railItems).map((item) => item.id),
  [...PORTFOLIO_CASE_ORDER, 'experience'],
);

assert.deepEqual(
  portfolioContent.contact.options.map((option) => option.id),
  ['telegram', 'linkedin', 'email'],
);
assert.equal(
  portfolioContent.contact.options.find((option) => option.id === 'email')?.href,
  'mailto:andrew.makarevitch@yandex.ru',
);

for (const caseId of PORTFOLIO_CASE_ORDER) {
  const caseContent = portfolioContent.cases[caseId];
  assert.ok(caseContent, `${caseId} should exist`);
  assert.ok(caseContent.atAGlance.title.length > 0, `${caseId} atAGlance.title`);
  assert.ok(caseContent.atAGlance.problem.length > 0, `${caseId} atAGlance.problem`);
  assert.ok(caseContent.atAGlance.role.length > 0, `${caseId} atAGlance.role`);
  assert.ok(caseContent.atAGlance.period.length > 0, `${caseId} atAGlance.period`);
  assert.ok(caseContent.atAGlance.outcome.length > 0, `${caseId} atAGlance.outcome`);
}

assert.equal(shouldShowAssistantIdentity({
  itemIndex: 0,
  hasPrecedingUser: false,
  presentationVariant: 'case_summary',
  selectedContextKind: 'case',
}), false);
assert.equal(shouldShowAssistantIdentity({
  itemIndex: 0,
  hasPrecedingUser: false,
  presentationVariant: 'experience_summary',
  selectedContextKind: 'experience',
}), false);
assert.equal(shouldShowAssistantIdentity({
  itemIndex: 1,
  hasPrecedingUser: true,
  presentationVariant: 'experience_summary',
  selectedContextKind: 'experience',
}), true);
assert.equal(shouldShowAssistantIdentity({
  itemIndex: 1,
  hasPrecedingUser: true,
  presentationVariant: 'sectioned_reply',
  selectedContextKind: 'case',
}), true);

const experienceSerialized = JSON.stringify(portfolioContent.experience.structuredSummary);
assert.ok(!experienceSerialized.includes('Не оператор Figma'));
assert.ok(!experienceSerialized.includes('AI tooling'));
assert.ok(experienceSerialized.includes('Продуктовый подход'));
assert.ok(experienceSerialized.includes('AI в работе'));

const publicCvPath = resolve('public/cv/andrey-makarevich-product-designer.pdf');
assert.ok(existsSync(publicCvPath), 'Public CV must exist at the stable URL');
assert.ok(statSync(publicCvPath).size > 100_000, 'Public CV must be a rendered PDF, not a placeholder');

console.log('Release quality contract passed.');
