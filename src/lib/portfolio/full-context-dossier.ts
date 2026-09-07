import { getAllCaseFactPacks } from '@/data/portfolio-case-facts';
import { portfolioProfile, PORTFOLIO_CASE_ORDER } from '@/data/portfolio-profile';
import type { CaseFactPack } from '@/lib/portfolio/types';

export const DOSSIER_VERSION = '2026-09-06.1';
export const DOSSIER_TOKEN_LIMIT = 20_000;
export const FULL_CONTEXT_INPUT_TOKEN_LIMIT = 32_000;
export const FULL_CONTEXT_HISTORY_TOKEN_LIMIT = 6_000;

export type DossierKind = 'fact' | 'interpretation' | 'limitation';
export type DossierRecord = { id: string; kind: DossierKind; text: string; caseId: string | null; source: string };
export type Dossier = { version: string; records: DossierRecord[]; serialized: string; estimatedTokens: number; contradictions: string[] };

const FACT_FIELDS: Array<keyof Pick<CaseFactPack, 'overview' | 'role' | 'decisions' | 'constraints' | 'validation' | 'outcomes' | 'evidence'>> = ['overview', 'role', 'decisions', 'constraints', 'validation', 'outcomes', 'evidence'];
const INTERPRETATION_FIELDS: Array<keyof Pick<CaseFactPack, 'whatThisProves' | 'recruiterTakeaway' | 'hiringSignal' | 'weaknessAngle'>> = ['whatThisProves', 'recruiterTakeaway', 'hiringSignal', 'weaknessAngle'];

function stableDigest(value: string): string { let hash = 2166136261; for (const char of value) { hash ^= char.codePointAt(0) ?? 0; hash = Math.imul(hash, 16777619); } return (hash >>> 0).toString(36); }
function makeRecord(kind: DossierKind, caseId: string | null, field: string, text: string): DossierRecord | null { const normalized = text.trim(); if (!normalized) return null; const scope = caseId ?? 'profile'; return { id: `${scope}.${field}.${stableDigest(normalized)}`, kind, text: normalized, caseId, source: `portfolio:${scope}:${field}` }; }
/** Planning estimate for mixed Russian/English prose; opt-in live eval records actual provider usage. */
export function estimateTokens(text: string): number { return Math.ceil(text.length / 3); }
function profileRecords(): DossierRecord[] { const entries = [['positioning', `Андрей Макаревич — ${portfolioProfile.role}. ${portfolioProfile.description}`], ['experience', portfolioProfile.experienceLabel], ['location', portfolioProfile.location], ['contacts', `Публичная почта: ${portfolioProfile.contact.email}.`], ...portfolioProfile.workHistory.map((item) => ['employment', `${item.company}: ${item.period}. ${item.role}.`] as const)]; return entries.map(([field, text]) => makeRecord('fact', null, field, text)).filter((entry): entry is DossierRecord => Boolean(entry)); }
function caseRecords(caseId: string, pack: CaseFactPack): DossierRecord[] { const records: DossierRecord[] = []; for (const [field, text] of Object.entries(pack.recruiterSummary)) { const record = makeRecord('fact', caseId, `summary.${field}`, text ?? ''); if (record) records.push(record); } for (const field of FACT_FIELDS) for (const text of pack[field]) { const record = makeRecord('fact', caseId, field, text); if (record) records.push(record); } for (const field of INTERPRETATION_FIELDS) for (const text of pack[field]) { const record = makeRecord('interpretation', caseId, field, text); if (record) records.push(record); } for (const text of [...pack.risks, ...pack.missing]) { const record = makeRecord('limitation', caseId, pack.missing.includes(text) ? 'missing' : 'risks', text); if (record) records.push(record); } return records; }
export function buildPortfolioDossier(): Dossier { const packs = getAllCaseFactPacks(); const rawRecords = [...profileRecords(), ...PORTFOLIO_CASE_ORDER.flatMap((caseId) => caseRecords(caseId, packs[caseId]))]; const seen = new Set<string>(); const records = rawRecords.filter((record) => { const key = `${record.kind}:${record.caseId ?? 'profile'}:${record.text}`; if (seen.has(key)) return false; seen.add(key); return true; }); const serialized = records.map((record) => `[${record.id}] (${record.kind}; ${record.source}) ${record.text}`).join('\n'); const estimatedTokens = estimateTokens(serialized); if (estimatedTokens > DOSSIER_TOKEN_LIMIT) throw new Error(`Dossier exceeds ${DOSSIER_TOKEN_LIMIT} estimated tokens (${estimatedTokens}).`); return { version: DOSSIER_VERSION, records, serialized, estimatedTokens, contradictions: [] }; }
export const portfolioDossier = buildPortfolioDossier();
export function getDossierRecord(id: string) { return portfolioDossier.records.find((record) => record.id === id) ?? null; }
