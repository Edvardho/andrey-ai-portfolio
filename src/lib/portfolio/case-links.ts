import { isCaseId, type CaseId } from '@/data/portfolio-index';

export function readCaseLink(search: string): { explicit: boolean; caseId: CaseId | null } {
  const values = new URLSearchParams(search).getAll('case');
  return {
    explicit: values.length > 0,
    caseId: values.length === 1 && isCaseId(values[0]) ? values[0] : null,
  };
}

export function buildCaseLink(relativeUrl: string, caseId: CaseId | null): string {
  const url = new URL(relativeUrl, 'https://portfolio.invalid');
  url.searchParams.delete('case');
  if (caseId) url.searchParams.set('case', caseId);
  return `${url.pathname}${url.search}${url.hash}`;
}
