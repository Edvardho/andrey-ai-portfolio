import { z } from 'zod';
import { getCaseById } from '@/data/portfolio-content.server';
import { FULL_CONTEXT_HISTORY_TOKEN_LIMIT, getDossierRecord, type DossierRecord, estimateTokens } from '@/lib/portfolio/full-context-dossier';
export const fullContextStatusSchema = z.enum(['supported', 'partial', 'unknown', 'clarification', 'out_of_scope']);
export const fullContextBlockSchema = z.object({ kind: z.enum(['fact', 'inference', 'limitation']), text: z.string().trim().min(1).max(1200), evidenceIds: z.array(z.string().min(1)).max(8) });
export const fullContextDraftSchema = z.object({ status: fullContextStatusSchema, blocks: z.array(fullContextBlockSchema).min(1).max(6), relatedCaseIds: z.array(z.string().min(1)).max(3).default([]), artifactIds: z.array(z.string().min(1)).max(2).default([]), offerContact: z.boolean().default(false) });
export type FullContextDraft = z.infer<typeof fullContextDraftSchema>;
export type VisibleHistoryItem = { role: 'user' | 'assistant'; text: string };
function numericTokens(text: string): string[] { return [...(text.match(/\d+(?:[.,]\d+)?/g) ?? [])]; }
export function truncateVisibleHistory(history: VisibleHistoryItem[]): VisibleHistoryItem[] { const valid = history.filter((item) => item.text.trim() && (item.role === 'user' || item.role === 'assistant')).slice(-12); const pairs: VisibleHistoryItem[][] = []; for (let index = 0; index + 1 < valid.length; index += 2) if (valid[index].role === 'user' && valid[index + 1].role === 'assistant') pairs.push([valid[index], valid[index + 1]]); const kept: VisibleHistoryItem[][] = []; let used = 0; for (const pair of [...pairs].reverse()) { const size = estimateTokens(pair.map((item) => item.text).join('\n')); if (used + size > FULL_CONTEXT_HISTORY_TOKEN_LIMIT) break; kept.unshift(pair); used += size; } return kept.flat(); }
export type FullContextValidation = { ok: true; draft: FullContextDraft; records: DossierRecord[] } | { ok: false; reason: string };
export function validateFullContextDraft(value: unknown): FullContextValidation {
  const parsed = fullContextDraftSchema.safeParse(value);
  if (!parsed.success) return { ok: false, reason: 'invalid_structure' };
  const draft = parsed.data;
  const records: DossierRecord[] = [];
  for (const block of draft.blocks) {
    const cited = block.evidenceIds.map(getDossierRecord);
    if (cited.some((record) => !record)) return { ok: false, reason: 'unknown_evidence_id' };
    const known = cited.filter((record): record is DossierRecord => Boolean(record));
    if ((draft.status === 'supported' || draft.status === 'partial') && block.kind === 'fact' && !known.length) return { ok: false, reason: 'unsupported_fact' };
    if (block.kind === 'inference' && (!known.length || !/^вывод:/iu.test(block.text))) return { ok: false, reason: 'unlabelled_inference' };
    if (block.kind === 'fact') {
      const citedText = known.map((record) => record.text).join(' ');
      if (numericTokens(block.text).some((token) => !numericTokens(citedText).includes(token))) return { ok: false, reason: 'unsupported_metric' };
    }
    records.push(...known);
  }
  const citedCaseIds = new Set<string>();
  for (const record of records) if (record.caseId) citedCaseIds.add(record.caseId);
  if (draft.relatedCaseIds.some((caseId) => !citedCaseIds.has(caseId))) return { ok: false, reason: 'unsupported_case_action' };
  if (draft.artifactIds.some((artifactId) => ![...citedCaseIds].some((caseId) => getCaseById(caseId)?.artifacts.some((artifact) => artifact.id === artifactId)))) {
    return { ok: false, reason: 'unsupported_artifact_action' };
  }
  return { ok: true, draft, records };
}
