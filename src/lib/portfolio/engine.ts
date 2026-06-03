import { getCaseById } from '@/data/portfolio-content';
import { MAX_USER_MESSAGES_PER_SESSION } from '@/lib/portfolio/config';
import {
  classifyMessageDeterministically,
  classifyMessageWithModel,
  type IntentClassification,
  type MessageIntent,
} from '@/lib/portfolio/intent';
import {
  buildAdditionalCasesEnvelope,
  buildAmbiguousEnvelope,
  buildAssistantIntroEnvelope,
  buildCareerSummaryEnvelope,
  buildCaseEnvelope,
  buildCaseDiscoveryEnvelope,
  buildCaseRouteEnvelope,
  buildContactModalEnvelope,
  buildDecisionProcessEnvelope,
  buildEvidenceEnvelope,
  buildEntryEnvelope,
  buildExperienceEnvelope,
  buildExperienceRouteEnvelope,
  buildIdentityIntroEnvelope,
  buildImageModalEnvelope,
  buildLimitEnvelope,
  buildLoadingEnvelope,
  buildMobileSummaryEnvelope,
  buildMobileCaseEnvelope,
  buildMobileOverviewEnvelope,
  buildNoMatchingEnvelope,
  buildRiskEnvelope,
  buildRoleFitEnvelope,
  buildStrengthsEnvelope,
  buildSafetyEnvelope,
  buildUnsupportedEnvelope,
} from '@/lib/portfolio/presenters';
import { appendHistory, persistSession } from '@/lib/portfolio/session-store';
import { detectSafetyState, getSafetyFallbackChips } from '@/lib/portfolio/safety';
import type {
  AnswerMode,
  AssistantEnvelope,
  AssistantSession,
  ChatRequestBody,
  SelectedContext,
  UIAction,
  ViewType,
} from '@/lib/portfolio/types';

function isMobileCase(caseId: string): boolean {
  return ['expenses-card-holders', 'subscription-sharing', 'ux-ui-wannabelike'].includes(caseId);
}

function deriveContextFromAction(action: UIAction): { context: SelectedContext; view: ViewType } | null {
  const caseLabel = 'caseId' in action ? getCaseById(action.caseId)?.shortTitle ?? action.caseId : '';

  switch (action.type) {
    case 'open_entry':
      return { context: { kind: 'none', id: null, label: null }, view: 'entry' };
    case 'open_case_summary':
      return { context: { kind: 'case', id: action.caseId, label: caseLabel }, view: 'case_summary' };
    case 'open_case_detail':
      return { context: { kind: 'case', id: action.caseId, label: caseLabel }, view: 'case_detail' };
    case 'open_case_route':
      return { context: { kind: 'case', id: action.caseId, label: caseLabel }, view: 'case_route' };
    case 'open_experience_summary':
      return { context: { kind: 'experience', id: 'experience', label: 'Опыт работы' }, view: 'experience_summary' };
    case 'open_experience_detail':
      return { context: { kind: 'experience', id: 'experience', label: 'Опыт работы' }, view: 'experience_detail' };
    case 'open_experience_route':
      return { context: { kind: 'case', id: action.caseId, label: caseLabel }, view: 'experience_route' };
    case 'open_mobile_experience_overview':
      return {
        context: { kind: 'overview', id: 'mobile-experience', label: 'Мобильный опыт' },
        view: 'mobile_experience_overview',
      };
    case 'open_mobile_case_summary':
      return { context: { kind: 'case', id: action.caseId, label: caseLabel }, view: 'mobile_case_summary' };
    case 'open_mobile_case_detail':
      return { context: { kind: 'case', id: action.caseId, label: caseLabel }, view: 'mobile_case_detail' };
    case 'open_additional_cases_overview':
      return {
        context: { kind: 'overview', id: 'additional-cases', label: 'Дополнительные кейсы' },
        view: 'additional_cases_overview',
      };
    default:
      return null;
  }
}

function deriveAnswerMode(action: UIAction, fallback: AnswerMode | null): AnswerMode | null {
  switch (action.type) {
    case 'open_case_summary':
    case 'open_experience_summary':
    case 'open_mobile_case_summary':
      return 'summary';
    case 'open_case_detail':
    case 'open_experience_detail':
    case 'open_mobile_case_detail':
      return 'detail';
    case 'open_entry':
    case 'open_case_route':
    case 'open_experience_route':
    case 'open_mobile_experience_overview':
    case 'open_additional_cases_overview':
      return null;
    default:
      return fallback;
  }
}

function updateContext(
  session: AssistantSession,
  selectedContext: SelectedContext,
  currentView: ViewType,
): Partial<AssistantSession> {
  return {
    selectedContext,
    currentView,
    openModal: null,
    lastSynthesis: null,
  };
}

function rebuildCurrentViewEnvelope(session: AssistantSession): AssistantEnvelope {
  switch (session.currentView) {
    case 'entry':
      return buildEntryEnvelope(session);
    case 'case_summary':
      return session.selectedContext.kind === 'case'
        ? buildCaseEnvelope(session, session.selectedContext.id, 'summary')
        : buildEntryEnvelope(session);
    case 'case_detail':
      return session.selectedContext.kind === 'case'
        ? buildCaseEnvelope(session, session.selectedContext.id, 'detail')
        : buildEntryEnvelope(session);
    case 'case_route':
      return session.selectedContext.kind === 'case'
        ? buildCaseRouteEnvelope(session, session.selectedContext.id)
        : buildEntryEnvelope(session);
    case 'assistant_intro':
      return buildAssistantIntroEnvelope(session);
    case 'identity_intro':
      return buildIdentityIntroEnvelope(session);
    case 'career_summary':
      return buildCareerSummaryEnvelope(session);
    case 'case_discovery':
      return buildCaseDiscoveryEnvelope(session);
    case 'mobile_overview':
      return buildMobileSummaryEnvelope(session);
    case 'strengths_assessment':
      return buildStrengthsEnvelope(session);
    case 'role_fit_assessment':
      return buildRoleFitEnvelope(session);
    case 'decision_process':
      return buildDecisionProcessEnvelope(session);
    case 'evidence_request':
      return buildEvidenceEnvelope(session);
    case 'risk_objection':
      return buildRiskEnvelope(session);
    case 'experience_summary':
      return buildExperienceEnvelope(session, 'summary');
    case 'experience_detail':
      return buildExperienceEnvelope(session, 'detail');
    case 'experience_route':
      return session.selectedContext.kind === 'case'
        ? buildExperienceRouteEnvelope(session, session.selectedContext.id)
        : buildExperienceEnvelope(session, 'summary');
    case 'mobile_experience_overview':
      return buildMobileOverviewEnvelope(session);
    case 'mobile_case_summary':
      return session.selectedContext.kind === 'case'
        ? buildMobileCaseEnvelope(session, session.selectedContext.id, 'summary')
        : buildMobileOverviewEnvelope(session);
    case 'mobile_case_detail':
      return session.selectedContext.kind === 'case'
        ? buildMobileCaseEnvelope(session, session.selectedContext.id, 'detail')
        : buildMobileOverviewEnvelope(session);
    case 'additional_cases_overview':
      return buildAdditionalCasesEnvelope(session);
    case 'contact_modal':
      return buildContactModalEnvelope(session);
    case 'image_modal':
      return buildEntryEnvelope(session);
    case 'loading':
      return buildLoadingEnvelope(session);
    case 'ambiguous_question':
      return buildAmbiguousEnvelope(session);
    case 'no_matching_case':
      return buildNoMatchingEnvelope(session);
    case 'unsupported_request':
      return buildUnsupportedEnvelope(session);
    case 'safety_refusal':
    case 'limit_reached':
    case 'general_synthesis':
    default:
      return buildEntryEnvelope(session);
  }
}

async function resolveMessageIntent(
  session: AssistantSession,
  intent: MessageIntent,
): Promise<{ session: AssistantSession; envelope: AssistantEnvelope }> {
  const policy = resolveIntentPolicy(intent);

  if (policy.threadBehavior === 'navigate') {
    return resolveAction(session, policy.action);
  }

  return { session, envelope: policy.buildEnvelope(session) };
}

type IntentPolicy =
  | {
      threadBehavior: 'navigate';
      action: UIAction;
    }
  | {
      threadBehavior: 'stay_current';
      buildEnvelope: (session: AssistantSession) => AssistantEnvelope;
    };

function resolveIntentPolicy(intent: MessageIntent): IntentPolicy {
  switch (intent.type) {
    case 'navigation_action':
      return { threadBehavior: 'navigate', action: intent.action };
    case 'assistant_intro':
      return { threadBehavior: 'stay_current', buildEnvelope: buildAssistantIntroEnvelope };
    case 'identity_intro':
      return { threadBehavior: 'stay_current', buildEnvelope: buildIdentityIntroEnvelope };
    case 'experience_overview':
      return { threadBehavior: 'stay_current', buildEnvelope: buildCareerSummaryEnvelope };
    case 'case_discovery':
      return {
        threadBehavior: 'stay_current',
        buildEnvelope: (session) => buildCaseDiscoveryEnvelope(session, intent.targetCaseId),
      };
    case 'mobile_overview':
      return { threadBehavior: 'stay_current', buildEnvelope: buildMobileSummaryEnvelope };
    case 'strengths_assessment':
      return { threadBehavior: 'stay_current', buildEnvelope: buildStrengthsEnvelope };
    case 'role_fit_assessment':
      return { threadBehavior: 'stay_current', buildEnvelope: buildRoleFitEnvelope };
    case 'decision_process':
      return { threadBehavior: 'stay_current', buildEnvelope: buildDecisionProcessEnvelope };
    case 'evidence_request':
      return { threadBehavior: 'stay_current', buildEnvelope: buildEvidenceEnvelope };
    case 'risk_objection':
      return { threadBehavior: 'stay_current', buildEnvelope: buildRiskEnvelope };
    case 'missing_case_request':
      return {
        threadBehavior: 'stay_current',
        buildEnvelope: (session) => buildNoMatchingEnvelope(session, intent.requestedCase),
      };
    case 'unsupported_request':
      return { threadBehavior: 'stay_current', buildEnvelope: buildUnsupportedEnvelope };
    case 'ambiguous_question':
    default:
      return { threadBehavior: 'stay_current', buildEnvelope: buildAmbiguousEnvelope };
  }
}

async function resolveIntentClassification(
  session: AssistantSession,
  classification: IntentClassification,
): Promise<{ session: AssistantSession; envelope: AssistantEnvelope }> {
  const { intent, confidence } = classification;

  if (intent.type === 'ambiguous_question') {
    return { session, envelope: buildAmbiguousEnvelope(session) };
  }

  if (confidence === 'low') {
    return { session, envelope: buildAmbiguousEnvelope(session) };
  }

  if (
    confidence === 'medium' &&
    (intent.type === 'navigation_action' || intent.type === 'missing_case_request')
  ) {
    return { session, envelope: buildAmbiguousEnvelope(session) };
  }

  return resolveMessageIntent(session, intent);
}

export async function resolveBootstrap(session: AssistantSession): Promise<AssistantEnvelope> {
  return buildEntryEnvelope(session);
}

export async function resolveAction(
  session: AssistantSession,
  action: UIAction,
): Promise<{ session: AssistantSession; envelope: AssistantEnvelope }> {
  const contextPatch = deriveContextFromAction(action);
  let nextSession = session;

  if (contextPatch) {
    nextSession = await persistSession(session, {
      ...updateContext(session, contextPatch.context, contextPatch.view),
      answerMode: deriveAnswerMode(action, session.answerMode),
      recentHistory: appendHistory(session, `action:${action.type}`),
    });
  }

  switch (action.type) {
    case 'open_entry':
      return { session: nextSession, envelope: buildEntryEnvelope(nextSession) };
    case 'open_case_summary':
      return { session: nextSession, envelope: buildCaseEnvelope(nextSession, action.caseId, 'summary') };
    case 'open_case_detail':
      return { session: nextSession, envelope: buildCaseEnvelope(nextSession, action.caseId, 'detail') };
    case 'open_case_route':
      return { session: nextSession, envelope: buildCaseRouteEnvelope(nextSession, action.caseId) };
    case 'open_experience_summary':
      return { session: nextSession, envelope: buildExperienceEnvelope(nextSession, 'summary') };
    case 'open_experience_detail':
      return { session: nextSession, envelope: buildExperienceEnvelope(nextSession, 'detail') };
    case 'open_experience_route':
      return { session: nextSession, envelope: buildExperienceRouteEnvelope(nextSession, action.caseId) };
    case 'open_mobile_experience_overview':
      return { session: nextSession, envelope: buildMobileOverviewEnvelope(nextSession) };
    case 'open_mobile_case_summary':
      return { session: nextSession, envelope: buildMobileCaseEnvelope(nextSession, action.caseId, 'summary') };
    case 'open_mobile_case_detail':
      return { session: nextSession, envelope: buildMobileCaseEnvelope(nextSession, action.caseId, 'detail') };
    case 'open_additional_cases_overview':
      return { session: nextSession, envelope: buildAdditionalCasesEnvelope(nextSession) };
    case 'open_contact_modal':
      nextSession = await persistSession(nextSession, {
        openModal: {
          type: 'contact',
          title: 'Связаться с Андреем',
          helper: 'Прямые каналы связи.',
          options: [],
        },
        recentHistory: appendHistory(nextSession, `action:open_contact_modal:${action.source ?? 'unknown'}`),
      });
      return { session: nextSession, envelope: buildContactModalEnvelope(nextSession, action.source) };
    case 'open_image_modal':
      nextSession = await persistSession(nextSession, {
        recentHistory: appendHistory(nextSession, `action:open_image_modal:${action.caseId}:${action.artifactId}`),
      });
      return { session: nextSession, envelope: buildImageModalEnvelope(nextSession, action.caseId, action.artifactId) };
    case 'close_modal':
      nextSession = await persistSession(nextSession, {
        openModal: null,
        recentHistory: appendHistory(nextSession, 'action:close_modal'),
      });
      return { session: nextSession, envelope: rebuildCurrentViewEnvelope(nextSession) };
    default:
      return { session: nextSession, envelope: buildAmbiguousEnvelope(nextSession) };
  }
}

export async function resolveMessage(
  session: AssistantSession,
  text: string,
): Promise<{ session: AssistantSession; envelope: AssistantEnvelope }> {
  const safety = detectSafetyState(text);
  if (safety) {
    const nextSession = await persistSession(session, {
      recentHistory: appendHistory(session, `safety:${safety.state}`),
    });

    return {
      session: nextSession,
      envelope: buildSafetyEnvelope(nextSession, safety.title, safety.body, safety.state, getSafetyFallbackChips()),
    };
  }

  const incrementedCount = session.userMessageCount + 1;
  const nextSession = await persistSession(session, {
    userMessageCount: incrementedCount,
    recentHistory: appendHistory(session, `msg:${text.slice(0, 120)}`),
  });

  if (incrementedCount > MAX_USER_MESSAGES_PER_SESSION) {
    return { session: nextSession, envelope: buildLimitEnvelope(nextSession) };
  }

  const deterministic = classifyMessageDeterministically(text, nextSession);
  if (deterministic) {
    return resolveIntentClassification(nextSession, deterministic);
  }

  const modelClassification = await classifyMessageWithModel(text, nextSession);
  if (modelClassification) {
    return resolveIntentClassification(nextSession, modelClassification);
  }

  return { session: nextSession, envelope: buildAmbiguousEnvelope(nextSession) };
}

export async function resolveChatRequest(
  session: AssistantSession,
  body: ChatRequestBody,
): Promise<{ session: AssistantSession; envelope: AssistantEnvelope }> {
  if (body.input.type === 'action') {
    return resolveAction(session, body.input.action);
  }

  const text = body.input.text.trim();
  if (!text) {
    return { session, envelope: buildAmbiguousEnvelope(session) };
  }

  return resolveMessage(session, text);
}

export function isKnownCase(caseId: string): boolean {
  return Boolean(getCaseById(caseId));
}

export function isKnownMobileCase(caseId: string): boolean {
  return isMobileCase(caseId);
}
