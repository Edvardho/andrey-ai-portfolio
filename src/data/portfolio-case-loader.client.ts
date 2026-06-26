'use client';

import { isCaseId, type CaseId } from '@/data/portfolio-index';
import type { CaseContent } from '@/lib/portfolio/types';

const loaders: Record<CaseId, () => Promise<CaseContent>> = {
  'alfa-smart': () => import('./cases/alfa-smart').then((module) => module.alfaSmartCase),
  chatpoint: () => import('./cases/chatpoint').then((module) => module.chatpointCase),
  siebel: () => import('./cases/siebel').then((module) => module.siebelCase),
  'expenses-card-holders': () => import('./cases/expenses-card-holders').then((module) => module.expensesCardHoldersCase),
  'subscription-sharing': () => import('./cases/subscription-sharing').then((module) => module.subscriptionSharingCase),
  'ux-ui-wannabelike': () => import('./cases/ux-ui-wannabelike').then((module) => module.uxUiWannabelikeCase),
};

const resolvedCases = new Map<CaseId, CaseContent>();
const pendingCases = new Map<CaseId, Promise<CaseContent>>();

export function getLoadedCaseById(caseId: string): CaseContent | undefined {
  return isCaseId(caseId) ? resolvedCases.get(caseId) : undefined;
}

export function isCaseLoaded(caseId: string): boolean {
  return isCaseId(caseId) && resolvedCases.has(caseId);
}

export function isCaseLoading(caseId: string): boolean {
  return isCaseId(caseId) && pendingCases.has(caseId);
}

export async function loadCaseById(caseId: string): Promise<CaseContent | null> {
  if (!isCaseId(caseId)) {
    return null;
  }

  const resolved = resolvedCases.get(caseId);
  if (resolved) {
    return resolved;
  }

  const pending = pendingCases.get(caseId);
  if (pending) {
    return pending;
  }

  const request = loaders[caseId]().then((caseContent) => {
    resolvedCases.set(caseId, caseContent);
    pendingCases.delete(caseId);
    return caseContent;
  }).catch((error) => {
    pendingCases.delete(caseId);
    throw error;
  });

  pendingCases.set(caseId, request);
  return request;
}
