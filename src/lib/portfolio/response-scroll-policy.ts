import { portfolioResponseAnimationConfig } from './response-animation-config';

export type ThreadScrollState = {
  scrollTop: number;
  isNearBottom: boolean;
  hasUnseenAssistantContent: boolean;
  lastSeenAssistantItemId: string | null;
};

export type ProgrammaticScrollReason =
  | 'thread_switch_restore'
  | 'modal_restore'
  | 'jump_to_latest'
  | 'initial_thread_top'
  | 'sticky_bottom'
  | 'disclosure_anchor'
  | 'reply_anchor';

export const DEFAULT_THREAD_SCROLL_STATE: ThreadScrollState = {
  scrollTop: 0,
  isNearBottom: true,
  hasUnseenAssistantContent: false,
  lastSeenAssistantItemId: null,
};

const DISCLOSURE_SCROLL_RESTORE_DELAYS_MS = [0, 40, 120, 240] as const;
const DISCLOSURE_SCROLL_PRESERVE_WINDOW_MS = 320;
const SCROLL_TO_TOP_SUPPRESSION_MS = 1200;
const MANUAL_SCROLL_AUTO_STICK_SUPPRESSION_MS = 700;
const MANUAL_SCROLL_LOCK_MS = 700;
const MANUAL_LOCK_SAFE_SCROLL_REASONS = new Set<ProgrammaticScrollReason>([
  'thread_switch_restore',
  'modal_restore',
  'jump_to_latest',
  'initial_thread_top',
]);

type ViewportMetrics = {
  scrollHeight: number;
  scrollTop: number;
  clientHeight: number;
};

export function getAutoScrollThresholdPx() {
  return portfolioResponseAnimationConfig.global.autoScroll.thresholdPx;
}

export function isNearBottom(viewport: ViewportMetrics) {
  const distanceToBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
  return distanceToBottom < getAutoScrollThresholdPx();
}

export function shouldStickToBottom(params: { isNearBottom: boolean; force?: boolean }) {
  return Boolean(params.force) || params.isNearBottom;
}

export function shouldRestoreThreadScrollOnSwitch(threadInitialized: boolean) {
  return threadInitialized;
}

export function shouldShowJumpToLatest(params: {
  isNearBottom: boolean;
  hasUnseenAssistantContent: boolean;
}) {
  return !params.isNearBottom && params.hasUnseenAssistantContent;
}

export function shouldTemporarilyPreserveDisclosureAnchor() {
  return true;
}

export function shouldReleaseDisclosureAnchorOnManualScroll() {
  return true;
}

export function shouldRestoreScrollAfterModalClose() {
  return true;
}

export function getDisclosureScrollRestoreDelaysMs() {
  return [...DISCLOSURE_SCROLL_RESTORE_DELAYS_MS];
}

export function getDisclosureScrollPreserveWindowMs() {
  return DISCLOSURE_SCROLL_PRESERVE_WINDOW_MS;
}

export function getScrollToTopSuppressionMs() {
  return SCROLL_TO_TOP_SUPPRESSION_MS;
}

export function getManualScrollAutoStickSuppressionMs() {
  return MANUAL_SCROLL_AUTO_STICK_SUPPRESSION_MS;
}

export function getManualScrollLockMs() {
  return MANUAL_SCROLL_LOCK_MS;
}

export function isProgrammaticScrollAllowed(
  reason: ProgrammaticScrollReason,
  manualScrollLockUntil: number,
  now: number,
) {
  return now >= manualScrollLockUntil || MANUAL_LOCK_SAFE_SCROLL_REASONS.has(reason);
}
