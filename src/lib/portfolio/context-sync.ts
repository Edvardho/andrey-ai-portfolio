import type { AssistantEnvelope, UIAction } from '@/lib/portfolio/types';

export type PortfolioContextId =
  | 'entry'
  | 'experience'
  | 'mobile-experience'
  | 'additional-cases'
  | `case:${string}`;

function getCanonicalActionForCase(caseId: string): UIAction {
  if (['expenses-card-holders', 'subscription-sharing', 'ux-ui-wannabelike'].includes(caseId)) {
    return { type: 'open_mobile_case_summary', caseId };
  }

  return { type: 'open_case_summary', caseId };
}

function getCanonicalActionForContext(contextId: PortfolioContextId): UIAction {
  if (contextId === 'entry') return { type: 'open_entry' };
  if (contextId === 'experience') return { type: 'open_experience_summary' };
  if (contextId === 'mobile-experience') return { type: 'open_mobile_experience_overview' };
  if (contextId === 'additional-cases') return { type: 'open_additional_cases_overview' };

  return getCanonicalActionForCase(contextId.replace(/^case:/, ''));
}

function getEnvelopeContextId(envelope: AssistantEnvelope): PortfolioContextId {
  if (envelope.selectedContext.kind === 'case') {
    return `case:${envelope.selectedContext.id}`;
  }
  if (envelope.selectedContext.kind === 'experience') {
    return 'experience';
  }
  if (envelope.selectedContext.kind === 'overview') {
    return envelope.selectedContext.id === 'mobile-experience'
      ? 'mobile-experience'
      : 'additional-cases';
  }
  return 'entry';
}

export function getSyncActionForContext(
  contextId: PortfolioContextId,
  envelope: AssistantEnvelope | null,
): UIAction {
  if (!envelope || getEnvelopeContextId(envelope) !== contextId) {
    return getCanonicalActionForContext(contextId);
  }

  if (envelope.selectedContext.kind === 'case') {
    const caseId = envelope.selectedContext.id;

    switch (envelope.viewType) {
      case 'case_detail':
        return { type: 'open_case_detail', caseId };
      case 'case_route':
        return { type: 'open_case_route', caseId };
      case 'mobile_case_detail':
        return { type: 'open_mobile_case_detail', caseId };
      case 'mobile_case_summary':
        return { type: 'open_mobile_case_summary', caseId };
      default:
        return getCanonicalActionForCase(caseId);
    }
  }

  return getCanonicalActionForContext(contextId);
}
