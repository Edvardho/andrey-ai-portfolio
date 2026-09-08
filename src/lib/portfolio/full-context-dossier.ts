import { getAllCaseFactPacks } from '@/data/portfolio-case-facts';
import { getCaseById } from '@/data/portfolio-content.server';
import { portfolioProfile, PORTFOLIO_CASE_ORDER } from '@/data/portfolio-profile';
import type { CaseFactPack } from '@/lib/portfolio/types';
import { getEncoding } from 'js-tiktoken';

export const DOSSIER_VERSION = '2026-09-08.2';
export const DOSSIER_PROMPT_VERSION = '2026-09-08.2';
export const DOSSIER_TOKEN_LIMIT = 20_000;
export const FULL_CONTEXT_INPUT_TOKEN_LIMIT = 32_000;
export const FULL_CONTEXT_HISTORY_TOKEN_LIMIT = 6_000;

export type DossierKind = 'fact' | 'interpretation' | 'limitation';
export type DossierRecord = { id: string; kind: DossierKind; text: string; caseId: string | null; source: string };
export type DossierMetric = {
  id: string;
  recordId: string;
  caseId: string | null;
  text: string;
  values: string[];
  source: string;
};
export type DossierArtifact = {
  id: string;
  caseId: string;
  title: string;
  description: string;
};
export type Dossier = {
  version: string;
  promptVersion: string;
  records: DossierRecord[];
  metrics: DossierMetric[];
  artifacts: DossierArtifact[];
  serialized: string;
  estimatedTokens: number;
  contradictions: string[];
  review: {
    automatedAt: string;
    method: string;
    authorReviewed: boolean;
    authorReviewedAt: string | null;
    unresolvedCount: number;
  };
};

const FACT_FIELDS: Array<keyof Pick<CaseFactPack, 'overview' | 'role' | 'decisions' | 'constraints' | 'validation' | 'outcomes' | 'evidence'>> = ['overview', 'role', 'decisions', 'constraints', 'validation', 'outcomes', 'evidence'];
const INTERPRETATION_FIELDS: Array<keyof Pick<CaseFactPack, 'whatThisProves' | 'recruiterTakeaway' | 'hiringSignal' | 'weaknessAngle'>> = ['whatThisProves', 'recruiterTakeaway', 'hiringSignal', 'weaknessAngle'];

function stableDigest(value: string): string { let hash = 2166136261; for (const char of value) { hash ^= char.codePointAt(0) ?? 0; hash = Math.imul(hash, 16777619); } return (hash >>> 0).toString(36); }
function makeRecord(kind: DossierKind, caseId: string | null, field: string, text: string): DossierRecord | null { const normalized = text.trim(); if (!normalized) return null; const scope = caseId ?? 'profile'; return { id: `${scope}.${field}.${stableDigest(normalized)}`, kind, text: normalized, caseId, source: `portfolio:${scope}:${field}` }; }
const portfolioTokenizer = getEncoding('o200k_base');
/** GPT-5.4 family uses the o200k token vocabulary; live eval still records provider usage. */
export function estimateTokens(text: string): number { return portfolioTokenizer.encode(text).length; }
function profileRecords(): DossierRecord[] { const entries = [['positioning', `Андрей Макаревич — ${portfolioProfile.role}. ${portfolioProfile.description}`], ['experience', portfolioProfile.experienceLabel], ['location', portfolioProfile.location], ['contacts', `Публичная почта: ${portfolioProfile.contact.email}.`], ...portfolioProfile.workHistory.map((item) => ['employment', `${item.company}: ${item.period}. ${item.role}.`] as const)]; return entries.map(([field, text]) => makeRecord('fact', null, field, text)).filter((entry): entry is DossierRecord => Boolean(entry)); }
function caseRecords(caseId: string, pack: CaseFactPack): DossierRecord[] { const records: DossierRecord[] = []; for (const [field, text] of Object.entries(pack.recruiterSummary)) { const record = makeRecord('interpretation', caseId, `summary.${field}`, text ?? ''); if (record) records.push(record); } for (const field of FACT_FIELDS) for (const text of pack[field]) { const record = makeRecord('fact', caseId, field, text); if (record) records.push(record); } for (const field of INTERPRETATION_FIELDS) for (const text of pack[field]) { const record = makeRecord('interpretation', caseId, field, text); if (record) records.push(record); } for (const text of [...pack.risks, ...pack.missing]) { const record = makeRecord('limitation', caseId, pack.missing.includes(text) ? 'missing' : 'risks', text); if (record) records.push(record); } return records; }

export function normalizeNumericValue(value: string): string {
  return value.replace(/[\s\u00a0\u202f]/g, '').replace(',', '.').toLocaleLowerCase('ru-RU');
}

export function extractNumericValues(text: string): string[] {
  return [...(text.match(/(?<![\p{L}\p{N}])\d[\d\s\u00a0\u202f]*(?:[.,]\d+)?%?(?![\p{L}\p{N}])/gu) ?? [])]
    .map(normalizeNumericValue)
    .filter(Boolean);
}

function buildMetrics(records: DossierRecord[]): DossierMetric[] {
  return records.flatMap((record) => {
    if (record.kind !== 'fact') return [];
    const values = extractNumericValues(record.text);
    if (!values.length) return [];
    return [{
      id: `metric.${record.id}`,
      recordId: record.id,
      caseId: record.caseId,
      text: record.text,
      values,
      source: record.source,
    }];
  });
}

function buildArtifacts(): DossierArtifact[] {
  return PORTFOLIO_CASE_ORDER.flatMap((caseId) => (
    getCaseById(caseId)?.artifacts.map((artifact) => ({
      id: artifact.id,
      caseId,
      title: artifact.title,
      description: artifact.caption || artifact.note || artifact.sourceLabel || '',
    })) ?? []
  ));
}

export function buildPortfolioDossier(): Dossier {
  const packs = getAllCaseFactPacks();
  const rawRecords = [...profileRecords(), ...PORTFOLIO_CASE_ORDER.flatMap((caseId) => caseRecords(caseId, packs[caseId]))];
  const seen = new Set<string>();
  const records = rawRecords.filter((record) => {
    const key = `${record.kind}:${record.caseId ?? 'profile'}:${record.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const metrics = buildMetrics(records);
  const artifacts = buildArtifacts();
  const serializedRecords = records.map((record) => `[${record.id}] (${record.kind}; ${record.source}) ${record.text}`);
  const serializedMetrics = metrics.map((metric) => `[${metric.id}] (canonical_numeric_fact; ${metric.recordId}) ${metric.text}`);
  const serializedArtifacts = artifacts.map((artifact) => `[artifact:${artifact.id}] (case:${artifact.caseId}) ${artifact.title}. ${artifact.description}`);
  const serialized = [...serializedRecords, 'КАНОНИЧЕСКИЕ ЧИСЛОВЫЕ ФАКТЫ:', ...serializedMetrics, 'ДОСТУПНЫЕ АРТЕФАКТЫ:', ...serializedArtifacts].join('\n');
  const estimatedTokens = estimateTokens(serialized);
  if (estimatedTokens > DOSSIER_TOKEN_LIMIT) throw new Error(`Dossier exceeds ${DOSSIER_TOKEN_LIMIT} estimated tokens (${estimatedTokens}).`);
  return {
    version: DOSSIER_VERSION,
    promptVersion: DOSSIER_PROMPT_VERSION,
    records,
    metrics,
    artifacts,
    serialized,
    estimatedTokens,
    contradictions: [],
    review: {
      automatedAt: '2026-09-08',
      method: 'Compared canonical profile fields and all six case fact packs; subjective recruiter summaries are interpretations. Author sign-off is still required.',
      authorReviewed: false,
      authorReviewedAt: null,
      unresolvedCount: 0,
    },
  };
}
export const portfolioDossier = buildPortfolioDossier();
export function getDossierRecord(id: string) { return portfolioDossier.records.find((record) => record.id === id) ?? null; }
export function getDossierMetric(id: string) { return portfolioDossier.metrics.find((metric) => metric.id === id) ?? null; }
export function getDossierArtifact(id: string) { return portfolioDossier.artifacts.find((artifact) => artifact.id === id) ?? null; }

/**
 * Artefact captions are author-provided portfolio material too. They are
 * serialized separately so the model can offer an action, but may also serve
 * as evidence for a narrow question about what an artefact shows.
 */
export function getDossierArtifactEvidenceRecord(id: string): DossierRecord | null {
  const artifact = getDossierArtifact(id.replace(/^artifact:/, ''));
  if (!artifact) return null;
  return {
    id: `artifact.${artifact.id}`,
    kind: 'fact',
    caseId: artifact.caseId,
    source: `portfolio:${artifact.caseId}:artifact:${artifact.id}`,
    text: `${artifact.title}. ${artifact.description}`.trim(),
  };
}
