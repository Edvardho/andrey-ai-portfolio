'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AssistantRenderMode } from '@/lib/portfolio/types';
import {
  getProgressiveTextStepMs,
  splitTextIntoProgressiveChunks,
} from '@/lib/portfolio/response-animation-policy';
import { portfolioResponseAnimationConfig } from '@/lib/portfolio/response-animation-config';

type Props = {
  text: string;
  renderMode?: Extract<AssistantRenderMode, 'instant' | 'progressive_text'>;
  className?: string;
  startDelayMs?: number;
  stepMs?: number;
};

export function PortfolioProgressiveText({
  text,
  renderMode = 'instant',
  className,
  startDelayMs = 0,
  stepMs = getProgressiveTextStepMs(),
}: Props) {
  const progressive = renderMode === 'progressive_text';
  const chunks = useMemo(() => splitTextIntoProgressiveChunks(text), [text]);
  const [visibleCount, setVisibleCount] = useState(progressive ? 0 : chunks.length);
  const effectiveVisibleCount = progressive ? visibleCount : chunks.length;

  useEffect(() => {
    if (!progressive) {
      return;
    }

    let intervalId: ReturnType<typeof globalThis.setInterval> | null = null;
    const timeoutId = globalThis.setTimeout(() => {
      setVisibleCount(1);
      intervalId = globalThis.setInterval(() => {
        setVisibleCount((current) => {
          if (current >= chunks.length) {
            if (intervalId) {
              globalThis.clearInterval(intervalId);
            }
            return current;
          }

          return current + 1;
        });
      }, stepMs);
    }, startDelayMs);

    return () => {
      globalThis.clearTimeout(timeoutId);
      if (intervalId) {
        globalThis.clearInterval(intervalId);
      }
    };
  }, [progressive, chunks, startDelayMs, stepMs]);

  const visibleText = chunks.slice(0, effectiveVisibleCount).join(' ');
  const showCursor =
    progressive &&
    portfolioResponseAnimationConfig.textStreaming.showTypingCursor &&
    effectiveVisibleCount > 0 &&
    effectiveVisibleCount < chunks.length;

  if (!progressive) {
    return <span className={className}>{text}</span>;
  }

  return (
    <>
      <span aria-hidden="true" className={className}>
        {visibleText}
        {showCursor ? (
          <span
            className="ml-[2px] inline-block h-[1em] w-px animate-pulse bg-current align-[-0.12em] opacity-55"
          />
        ) : null}
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}
