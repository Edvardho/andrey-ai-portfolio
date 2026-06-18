'use client';

import type { ReactNode } from 'react';
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

type InlineSegment = {
  text: string;
  strong: boolean;
};

function parseInlineSegments(text: string): InlineSegment[] {
  if (!text.includes('**')) {
    return [{ text, strong: false }];
  }

  const segments: InlineSegment[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let cursor = 0;

  for (const match of text.matchAll(pattern)) {
    const fullMatch = match[0];
    const content = match[1];
    const start = match.index ?? 0;

    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), strong: false });
    }

    if (content) {
      segments.push({ text: content, strong: true });
    } else {
      segments.push({ text: fullMatch, strong: false });
    }

    cursor = start + fullMatch.length;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), strong: false });
  }

  return segments.length ? segments : [{ text, strong: false }];
}

function renderInlineSegments(text: string): ReactNode {
  return parseInlineSegments(text).map((segment, index) => {
    if (!segment.strong) {
      return <span key={`${segment.text}-${index}`}>{segment.text}</span>;
    }

    return (
      <span
        key={`${segment.text}-${index}`}
        className="font-semibold tracking-[-0.015em] text-[#202129]"
      >
        {segment.text}
      </span>
    );
  });
}

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
    return <span className={className}>{renderInlineSegments(text)}</span>;
  }

  return (
    <>
      <span aria-hidden="true" className={className}>
        {renderInlineSegments(visibleText)}
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
