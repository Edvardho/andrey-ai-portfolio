import type { AnswerPlan, CaseFactFacet, CaseFactPack, GroundedFact, QueryScope, ResponseLength } from '@/lib/portfolio/types';

export type GroundedValidationReason =
  | 'empty_fact_scope'
  | 'grounded_block_without_fact'
  | 'unknown_fact'
  | 'cross_case'
  | 'unsupported_metric'
  | 'answer_plan_violation';

type GroundedBlock = { text: string; supportingFactIds: string[] };
type GroundedSection = { title: string; body: string; supportingFactIds: string[] };

export function makeGroundedFacts(caseId: string, facet: CaseFactFacet, facts: string[]): GroundedFact[] {
  return facts
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text, index) => ({ factId: `${caseId}:${facet}:${index + 1}`, caseId, facet, text }));
}

const FACT_PACK_FACETS: Array<[CaseFactFacet, keyof CaseFactPack]> = [
  ['overview', 'overview'], ['problem', 'overview'], ['role', 'role'], ['research', 'validation'],
  ['decisions', 'decisions'], ['constraints', 'constraints'], ['outcomes', 'outcomes'],
  ['evidence', 'evidence'], ['strengths', 'whatThisProves'], ['strengths', 'hiringSignal'],
  ['risks', 'risks'], ['risks', 'missing'], ['risks', 'weaknessAngle'],
  ['overview', 'recruiterTakeaway'],
];

/** Creates stable IDs from the real source facet, never from a synthetic “overview” bucket. */
export function buildCaseGroundedFacts(caseId: string, pack: CaseFactPack): GroundedFact[] {
  const facts: GroundedFact[] = [
    ...makeGroundedFacts(caseId, 'overview', [pack.recruiterSummary.intro, pack.recruiterSummary.followup ?? '']),
  ];
  const usedIds = new Set(facts.map((fact) => fact.factId));

  for (const [facet, key] of FACT_PACK_FACETS) {
    const values = pack[key];
    if (!Array.isArray(values)) continue;
    for (const fact of makeGroundedFacts(caseId, facet, values)) {
      let factId = fact.factId;
      let suffix = 2;
      while (usedIds.has(factId)) factId = `${fact.factId}-${suffix++}`;
      usedIds.add(factId);
      facts.push({ ...fact, factId });
    }
  }
  return facts;
}

function numericTokens(text: string): string[] {
  return text.match(/\d+(?:[.,]\d+)?/g) ?? [];
}

const CASE_NAMES: Record<string, string[]> = {
  'alfa-smart': ['альфа-смарт', 'альфа smart', 'alfa-smart'],
  siebel: ['siebel', 'мтс'],
  chatpoint: ['chatpoint', 'чатпойнт', 'чат поинт'],
  'expenses-card-holders': ['расходы держателей', 'держателей карт'],
  'subscription-sharing': ['шаринг подписки'],
  'ux-ui-wannabelike': ['wannabelike', 'ux/ui'],
};

function validateAnswerPlan(
  draft: { answerStatus: string; intro: GroundedBlock; sections: GroundedSection[]; bullets: GroundedBlock[] },
  answerPlan?: AnswerPlan,
  responseLength?: ResponseLength,
): GroundedValidationReason | null {
  if (!answerPlan || draft.answerStatus !== 'grounded') return null;
  if (!answerPlan.allowSections && draft.sections.length > 0) return 'answer_plan_violation';
  if (!answerPlan.allowBullets && draft.bullets.length > 0) return 'answer_plan_violation';
  if (draft.sections.length > 3 || draft.bullets.length > 4) return 'answer_plan_violation';
  if (answerPlan.mustStartWith && !draft.intro.text.trim().toLowerCase().startsWith(answerPlan.mustStartWith.toLowerCase())) {
    return 'answer_plan_violation';
  }
  const paragraphCount = 1 + draft.sections.length + draft.bullets.length;
  if (paragraphCount > answerPlan.maxParagraphs) return 'answer_plan_violation';
  if (responseLength === 'compact' && answerPlan.answerType !== 'contextual_summary' && (draft.sections.length || draft.bullets.length || paragraphCount > 2)) {
    return 'answer_plan_violation';
  }
  if (answerPlan.answerType === 'contextual_summary') {
    const titles = draft.sections.map((section) => section.title.toLowerCase()).join(' ');
    if (draft.sections.length !== 2 || !/подтверж/.test(titles) || !/провер/.test(titles)) return 'answer_plan_violation';
  }
  return null;
}

export function validateGroundedDraft(
  draft: {
    answerStatus: 'grounded' | 'insufficient_facts' | 'needs_clarification' | 'navigation_suggested';
    title: GroundedBlock;
    intro: GroundedBlock;
    sections: GroundedSection[];
    bullets: GroundedBlock[];
  },
  facts: GroundedFact[],
  scope: QueryScope,
  targetCaseId?: string | null,
  answerPlan?: AnswerPlan,
  responseLength?: ResponseLength,
): { ok: true } | { ok: false; reason: GroundedValidationReason } {
  const allowed = facts.filter((fact) => (
    scope === 'current_case_only' || scope === 'named_case' ? fact.caseId === targetCaseId : true
  ));
  if (draft.answerStatus === 'grounded' && allowed.length === 0) return { ok: false, reason: 'empty_fact_scope' };

  const planReason = validateAnswerPlan(draft, answerPlan, responseLength);
  if (planReason) return { ok: false, reason: planReason };

  const byId = new Map(allowed.map((fact) => [fact.factId, fact]));
  const blocks: GroundedBlock[] = [
    draft.title,
    draft.intro,
    ...draft.sections.flatMap((section) => [
      { text: section.title, supportingFactIds: section.supportingFactIds },
      { text: section.body, supportingFactIds: section.supportingFactIds },
    ]),
    ...draft.bullets,
  ];

  for (const block of blocks) {
    if (draft.answerStatus === 'grounded' && block.supportingFactIds.length === 0) {
      return { ok: false, reason: 'grounded_block_without_fact' };
    }
    const cited = block.supportingFactIds.map((id) => byId.get(id));
    if (cited.some((fact) => !fact)) return { ok: false, reason: 'unknown_fact' };

    if (scope === 'current_case_only' || scope === 'named_case') {
      const lower = block.text.toLocaleLowerCase('ru-RU');
      for (const [caseId, names] of Object.entries(CASE_NAMES)) {
        if (caseId !== targetCaseId && (lower.includes(caseId) || names.some((name) => lower.includes(name)))) {
          return { ok: false, reason: 'cross_case' };
        }
      }
    }
    const citedText = cited.map((fact) => fact?.text ?? '').join(' ');
    if (numericTokens(block.text).some((token) => !numericTokens(citedText).includes(token))) {
      return { ok: false, reason: 'unsupported_metric' };
    }
  }
  return { ok: true };
}
