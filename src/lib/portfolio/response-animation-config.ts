export const portfolioResponseAnimationConfig = {
  global: {
    autoScroll: {
      thresholdPx: 120,
    },
    accessibility: {
      ariaLive: 'polite',
    },
  },
  assistantContainer: {
    initialDelayMs: 120,
    animation: {
      durationMs: 160,
      translateY: 4,
    },
  },
  textStreaming: {
    chunkSizeWords: {
      min: 3,
      max: 8,
    },
    updateIntervalMs: {
      min: 40,
      max: 80,
    },
    maxPauseBetweenChunksMs: 120,
    showTypingCursor: true,
    hideCursorOnComplete: true,
  },
  headingReveal: {
    animation: {
      durationMs: 140,
      translateY: 4,
    },
  },
  paragraphReveal: {
    startDelayStepMs: 110,
  },
  listReveal: {
    itemDelayMs: {
      min: 60,
      max: 120,
    },
    animation: {
      durationMs: 140,
      translateY: 4,
    },
  },
  sidebarReveal: {
    revealAfterFirstMeaningfulBlock: true,
    delayAfterFirstMeaningfulBlockMs: 200,
    animation: {
      durationMs: 220,
      translateX: 8,
    },
  },
} as const;

export type PortfolioResponseAnimationConfig = typeof portfolioResponseAnimationConfig;
