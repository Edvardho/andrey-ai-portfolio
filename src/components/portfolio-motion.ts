'use client';

export const WORKSPACE_EASE = [0.16, 1, 0.3, 1] as const;
export const THREAD_EASE = [0.22, 1, 0.36, 1] as const;

export const COMPOSER_DOCK_SPRING = {
  type: 'spring' as const,
  stiffness: 220,
  damping: 28,
  mass: 0.95,
};

export const STAGE_FADE = {
  duration: 0.42,
  ease: WORKSPACE_EASE,
};
