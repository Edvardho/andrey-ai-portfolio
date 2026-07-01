import type { AssistantEnvelope, AssistantRenderMode, PresentationVariant } from './types';
import { portfolioResponseAnimationConfig } from './response-animation-config';

type UserThreadItemLike = {
  id: string;
  kind: 'user';
  hasAnimated: boolean;
};

type AssistantThreadItemLike = {
  id: string;
  kind: 'assistant';
  hasAnimated: boolean;
  envelope: AssistantEnvelope;
};

export type AnimationThreadItemLike = UserThreadItemLike | AssistantThreadItemLike;

const SUMMARY_REVEAL_DURATION_MS = 180;
const SUMMARY_REVEAL_STAGGER_MS = 80;
const SUMMARY_REVEAL_MAX_ORDER = 11;
const USER_ITEM_REVEAL_DURATION_MS = 280;
const USER_ITEM_REVEAL_TRANSLATE_Y = 24;
const USER_ITEM_REVEAL_SCALE_FROM = 0.99;
const ASSISTANT_FALLBACK_REVEAL_DURATION_MS = 400;
const PROGRESSIVE_REPLY_BLOCK_STAGGER_MS = 120;
const CONTEXT_PANEL_BASE_DELAY_MS = 120;
const PROGRESSIVE_TEXT_BASE_COMPLETION_MS = 520;
const PROGRESSIVE_TEXT_MAX_COMPLETION_MS = 2200;

function average(min: number, max: number) {
  return Math.round((min + max) / 2);
}

function countEnvelopeWords(envelope: AssistantEnvelope) {
  return envelope.contentBlocks.reduce((total, block) => {
    if (block.type === 'lead' || block.type === 'section') {
      return total + block.body.join(' ').split(/\s+/).filter(Boolean).length;
    }

    if (block.type === 'bullet_list') {
      return total + block.items.join(' ').split(/\s+/).filter(Boolean).length;
    }

    return total;
  }, 0);
}

export function isSummaryPresentationVariant(variant: PresentationVariant) {
  return (
    variant === 'case_summary' ||
    variant === 'experience_summary' ||
    variant === 'candidate_fast_review'
  );
}

export function getAutoScrollThresholdPx() {
  return portfolioResponseAnimationConfig.global.autoScroll.thresholdPx;
}

export function getProgressiveTextStepMs() {
  return average(
    portfolioResponseAnimationConfig.textStreaming.updateIntervalMs.min,
    portfolioResponseAnimationConfig.textStreaming.updateIntervalMs.max,
  );
}

export function getListRevealDelayMs() {
  return average(
    portfolioResponseAnimationConfig.listReveal.itemDelayMs.min,
    portfolioResponseAnimationConfig.listReveal.itemDelayMs.max,
  );
}

export function getAssistantRenderMode(
  item: AssistantThreadItemLike,
  hasPlayedInitialReveal: boolean,
): AssistantRenderMode {
  if (item.hasAnimated) {
    return 'instant';
  }

  if (isSummaryPresentationVariant(item.envelope.presentationVariant) && !hasPlayedInitialReveal) {
    return 'reveal';
  }

  if (
    item.envelope.presentationVariant === 'plain_text_reply' ||
    item.envelope.presentationVariant === 'sectioned_reply' ||
    item.envelope.presentationVariant === 'bullet_reply'
  ) {
    return 'progressive_text';
  }

  return 'reveal';
}

export function shouldDelayContextPanelReveal(showContextPanel: boolean, hasPlayedInitialReveal: boolean) {
  return (
    showContextPanel &&
    portfolioResponseAnimationConfig.sidebarReveal.revealAfterFirstMeaningfulBlock &&
    !hasPlayedInitialReveal
  );
}

export function getContextPanelRevealDelayMs(shouldDelay: boolean) {
  return shouldDelay
    ? portfolioResponseAnimationConfig.sidebarReveal.delayAfterFirstMeaningfulBlockMs
    : CONTEXT_PANEL_BASE_DELAY_MS;
}

export function getSummaryRevealTiming(order: number) {
  return {
    durationMs: SUMMARY_REVEAL_DURATION_MS,
    delayMs: order * SUMMARY_REVEAL_STAGGER_MS,
  };
}

export function getProgressiveReplyBlockTiming(index: number) {
  return {
    durationMs: portfolioResponseAnimationConfig.headingReveal.animation.durationMs,
    delayMs: index * PROGRESSIVE_REPLY_BLOCK_STAGGER_MS,
    translateY: portfolioResponseAnimationConfig.headingReveal.animation.translateY,
  };
}

export function getListItemRevealTiming(index: number) {
  return {
    durationMs: portfolioResponseAnimationConfig.listReveal.animation.durationMs,
    delayMs: index * getListRevealDelayMs(),
    translateY: portfolioResponseAnimationConfig.listReveal.animation.translateY,
  };
}

export function getParagraphRevealStartDelayMs(index: number) {
  return index * portfolioResponseAnimationConfig.paragraphReveal.startDelayStepMs;
}

export function getThreadItemMotionTiming(
  item: AnimationThreadItemLike,
  hasPlayedInitialReveal: boolean,
) {
  if (item.hasAnimated) {
    return {
      durationMs: 0,
      delayMs: 0,
      translateY: 0,
      scaleFrom: 1,
    };
  }

  if (item.kind === 'user') {
    return {
      durationMs: USER_ITEM_REVEAL_DURATION_MS,
      delayMs: 0,
      translateY: USER_ITEM_REVEAL_TRANSLATE_Y,
      scaleFrom: USER_ITEM_REVEAL_SCALE_FROM,
    };
  }

  const renderMode = getAssistantRenderMode(item, hasPlayedInitialReveal);

  if (renderMode === 'progressive_text' || renderMode === 'reveal') {
    return {
      durationMs: portfolioResponseAnimationConfig.assistantContainer.animation.durationMs,
      delayMs: portfolioResponseAnimationConfig.assistantContainer.initialDelayMs,
      translateY: portfolioResponseAnimationConfig.assistantContainer.animation.translateY,
      scaleFrom: 1,
    };
  }

  return {
    durationMs: ASSISTANT_FALLBACK_REVEAL_DURATION_MS,
    delayMs: 0,
    translateY: 0,
    scaleFrom: 1,
  };
}

export function estimateAssistantAnimationMs(
  item: AssistantThreadItemLike,
  hasPlayedInitialReveal: boolean,
) {
  const renderMode = getAssistantRenderMode(item, hasPlayedInitialReveal);

  if (renderMode === 'reveal') {
    return SUMMARY_REVEAL_DURATION_MS + SUMMARY_REVEAL_STAGGER_MS * SUMMARY_REVEAL_MAX_ORDER;
  }

  if (renderMode === 'progressive_text') {
    const words = countEnvelopeWords(item.envelope);
    const estimatedChunks = Math.max(
      1,
      Math.ceil(words / average(
        portfolioResponseAnimationConfig.textStreaming.chunkSizeWords.min,
        portfolioResponseAnimationConfig.textStreaming.chunkSizeWords.max,
      )),
    );

    return Math.min(
      PROGRESSIVE_TEXT_MAX_COMPLETION_MS,
      PROGRESSIVE_TEXT_BASE_COMPLETION_MS + estimatedChunks * getProgressiveTextStepMs(),
    );
  }

  return ASSISTANT_FALLBACK_REVEAL_DURATION_MS;
}

export function shouldMarkInitialRevealPlayed(
  items: AnimationThreadItemLike[],
  hasPlayedInitialReveal: boolean,
) {
  return (
    !hasPlayedInitialReveal &&
    items.some(
      (item) =>
        item.kind === 'assistant' &&
        isSummaryPresentationVariant(item.envelope.presentationVariant),
    )
  );
}

export function getLastAnimatedAssistantMessageId(items: AnimationThreadItemLike[]) {
  return [...items].reverse().find((item) => item.kind === 'assistant' && item.hasAnimated)?.id ?? null;
}

export function splitTextIntoProgressiveChunks(text: string): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (!normalized) {
    return [''];
  }

  const sentenceChunks = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentenceChunks.length > 1) {
    return sentenceChunks;
  }

  const commaChunks = normalized.split(/(?<=,)\s+/).filter(Boolean);
  if (commaChunks.length > 1) {
    return commaChunks;
  }

  const words = normalized.split(' ');
  if (words.length <= portfolioResponseAnimationConfig.textStreaming.chunkSizeWords.min) {
    return [normalized];
  }

  const maxChunkSize = portfolioResponseAnimationConfig.textStreaming.chunkSizeWords.max;
  const midChunkSize = average(
    portfolioResponseAnimationConfig.textStreaming.chunkSizeWords.min,
    portfolioResponseAnimationConfig.textStreaming.chunkSizeWords.max,
  );
  const chunkSize =
    words.length > 20
      ? maxChunkSize
      : words.length > 12
        ? midChunkSize
        : portfolioResponseAnimationConfig.textStreaming.chunkSizeWords.min + 1;

  const chunks: string[] = [];

  for (let index = 0; index < words.length; index += chunkSize) {
    chunks.push(words.slice(index, index + chunkSize).join(' '));
  }

  return chunks;
}
