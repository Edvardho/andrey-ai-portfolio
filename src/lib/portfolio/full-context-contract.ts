import { z } from 'zod';
import {
  FULL_CONTEXT_HISTORY_TOKEN_LIMIT,
  extractNumericValues,
  getDossierArtifact,
  getDossierArtifactEvidenceRecord,
  getDossierMetric,
  getDossierRecord,
  type DossierMetric,
  type DossierRecord,
  estimateTokens,
} from '@/lib/portfolio/full-context-dossier';
export const fullContextStatusSchema = z.enum(['supported', 'partial', 'unknown', 'clarification', 'out_of_scope']);
export const fullContextBlockSchema = z.object({
  kind: z.enum(['fact', 'inference', 'limitation', 'explanation']),
  text: z.string().trim().min(1).max(1200),
  evidenceIds: z.array(z.string().min(1)).max(8),
  // OpenAI Structured Outputs requires every object property to be listed in
  // `required`. Zod defaults make a property optional in the generated JSON
  // Schema, so empty collections must be returned explicitly by the model.
  metricIds: z.array(z.string().min(1)).max(3),
});
export const fullContextDraftSchema = z.object({
  status: fullContextStatusSchema,
  blocks: z.array(fullContextBlockSchema).min(1).max(4),
  relatedCaseIds: z.array(z.string().min(1)).max(3),
  artifactIds: z.array(z.string().min(1)).max(2),
  offerContact: z.boolean(),
});
export type FullContextDraft = z.infer<typeof fullContextDraftSchema>;
export type VisibleHistoryItem = { role: 'user' | 'assistant'; text: string };
function mentionsCandidate(text: string): boolean {
  const words = text.toLocaleLowerCase('ru-RU').split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  return words.some((word) => ['андрей', 'макаревич', 'кандидат', 'он', 'его', 'ему', 'него'].includes(word));
}
/**
 * The dossier exposes stable IDs so the model can cite them structurally.
 * They are implementation detail and must never leak into a visitor-facing
 * block if the model copies a source line too literally.
 */
function stripDossierMarkers(text: string): string {
  return text
    .replace(/\s*\[(?:artifact:)?[a-z][a-z0-9._:-]*\]/gi, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}
export function truncateVisibleHistory(history: VisibleHistoryItem[]): VisibleHistoryItem[] { const valid = history.filter((item) => item.text.trim() && (item.role === 'user' || item.role === 'assistant')).slice(-12); const pairs: VisibleHistoryItem[][] = []; for (let index = 0; index + 1 < valid.length; index += 2) if (valid[index].role === 'user' && valid[index + 1].role === 'assistant') pairs.push([valid[index], valid[index + 1]]); const kept: VisibleHistoryItem[][] = []; let used = 0; for (const pair of [...pairs].reverse()) { const size = estimateTokens(pair.map((item) => item.text).join('\n')); if (used + size > FULL_CONTEXT_HISTORY_TOKEN_LIMIT) break; kept.unshift(pair); used += size; } return kept.flat(); }
export type FullContextValidation = { ok: true; draft: FullContextDraft; records: DossierRecord[]; metrics: DossierMetric[] } | { ok: false; reason: string };
export function validateFullContextDraft(value: unknown): FullContextValidation {
  const parsed = fullContextDraftSchema.safeParse(value);
  if (!parsed.success) return { ok: false, reason: 'invalid_structure' };
  const draft = parsed.data;
  const records: DossierRecord[] = [];
  const metrics: DossierMetric[] = [];
  const normalizedBlocks: FullContextDraft['blocks'] = [];
  for (const block of draft.blocks) {
    const text = stripDossierMarkers(block.text);
    if (!text) return { ok: false, reason: 'empty_visible_text' };
    const citedMetrics = block.metricIds.map(getDossierMetric);
    if (citedMetrics.some((metric) => !metric)) return { ok: false, reason: 'unknown_metric_id' };
    const knownMetrics = citedMetrics.filter((metric): metric is DossierMetric => Boolean(metric));
    // A metric ID itself identifies its canonical evidence record. Models
    // occasionally omit that duplicate ID from evidenceIds; normalizing it
    // server-side keeps the evidence chain exact without rejecting a safe
    // canonical metric or attaching it to another case.
    const evidenceIds = [...new Set([...block.evidenceIds, ...knownMetrics.map((metric) => metric.recordId)])];
    // The model sees the available artefacts by their action IDs. Convert an
    // exact known artefact ID into its stable author-provided evidence record;
    // invented IDs still fail closed.
    const cited = evidenceIds.map((id) => getDossierRecord(id) ?? getDossierArtifactEvidenceRecord(id));
    if (cited.some((record) => !record)) return { ok: false, reason: 'unknown_evidence_id' };
    const known = cited.filter((record): record is DossierRecord => Boolean(record));
    if (block.kind === 'fact' && !known.length) return { ok: false, reason: 'unsupported_fact' };
    if (block.kind === 'inference' && !known.length) return { ok: false, reason: 'unsupported_inference' };
    if (block.kind === 'explanation' && mentionsCandidate(text)) {
      return { ok: false, reason: 'candidate_claim_in_explanation' };
    }
    // Numeric wording is rendered from the canonical registry. The model only
    // references metric IDs, which prevents correct values from being attached
    // to the wrong unit or project.
    if (extractNumericValues(text).length) return { ok: false, reason: 'free_numeric_claim' };
    metrics.push(...knownMetrics);
    records.push(...known);
    normalizedBlocks.push({ ...block, text, evidenceIds: known.map((record) => record.id) });
  }
  const citedCaseIds = new Set<string>();
  for (const record of records) if (record.caseId) citedCaseIds.add(record.caseId);
  if (draft.relatedCaseIds.some((caseId) => !citedCaseIds.has(caseId))) return { ok: false, reason: 'unsupported_case_action' };
  const validArtifactIds = draft.artifactIds.filter((artifactId) => {
    const artifact = getDossierArtifact(artifactId);
    return Boolean(artifact && citedCaseIds.has(artifact.caseId));
  });
  return { ok: true, draft: { ...draft, blocks: normalizedBlocks, artifactIds: validArtifactIds }, records, metrics };
}
