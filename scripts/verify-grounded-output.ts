import assert from 'node:assert/strict';

import { makeGroundedFacts, validateGroundedDraft } from '@/lib/portfolio/grounding';

const facts = makeGroundedFacts('siebel', 'evidence', [
  'Андрей изучил работу операторов и проверил гипотезы.',
  'Решение довели до измеримого эффекта: время обработки сократилось с 900 до 580 секунд.',
]);
const plan = {
  answerType: 'contextual_summary' as const,
  requiredMoves: [], avoid: [], maxParagraphs: 3, allowSections: true, allowBullets: false, targetCaseIds: ['siebel'],
};
function expectReason(result: ReturnType<typeof validateGroundedDraft>, reason: string) {
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, reason);
}
const validDraft = {
  answerStatus: 'grounded' as const,
  title: { text: 'Вывод по SIEBEL', supportingFactIds: [facts[0].factId] },
  intro: { text: 'Главный вывод: Андрей начал с исследования работы операторов.', supportingFactIds: [facts[0].factId] },
  sections: [
    { title: 'Чем подтверждается', body: 'Гипотезы проверяли на реальном процессе.', supportingFactIds: [facts[0].factId] },
    { title: 'Что проверить', body: 'На интервью стоит уточнить детали измеримого эффекта.', supportingFactIds: [facts[1].factId] },
  ],
  bullets: [],
};
assert.deepEqual(validateGroundedDraft(validDraft, facts, 'current_case_only', 'siebel', plan, 'default'), { ok: true });

expectReason(validateGroundedDraft({ ...validDraft, title: { text: 'Итог по Альфа-Смарт', supportingFactIds: [facts[0].factId] } }, facts, 'current_case_only', 'siebel', plan), 'cross_case');
expectReason(validateGroundedDraft({ ...validDraft, intro: { text: 'Время обработки составило 300 секунд.', supportingFactIds: [facts[0].factId] } }, facts, 'current_case_only', 'siebel', plan), 'unsupported_metric');
expectReason(validateGroundedDraft({ ...validDraft, sections: validDraft.sections.map((section, index) => index ? section : { ...section, supportingFactIds: [] }) }, facts, 'current_case_only', 'siebel', plan), 'grounded_block_without_fact');
expectReason(validateGroundedDraft({ ...validDraft, title: { text: 'Вывод', supportingFactIds: ['alfa-smart:evidence:1'] } }, facts, 'current_case_only', 'siebel', plan), 'unknown_fact');
expectReason(validateGroundedDraft({ ...validDraft, sections: [validDraft.sections[0]] }, facts, 'current_case_only', 'siebel', plan), 'answer_plan_violation');
expectReason(validateGroundedDraft({ ...validDraft, bullets: [{ text: '900 секунд', supportingFactIds: [facts[1].factId] }] }, facts, 'current_case_only', 'siebel', plan), 'answer_plan_violation');
expectReason(validateGroundedDraft(validDraft, [], 'current_case_only', 'siebel', plan), 'empty_fact_scope');

console.log('verify-grounded-output: ok');
