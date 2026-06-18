'use client';

import type { ReactNode } from 'react';

import { PortfolioAssistantIdentityHeader } from './portfolio-assistant-identity-header';

export function PortfolioAssistantMessageFrame({
  children,
  showFactsBadge = false,
  showHeader = true,
  showLeadingBadge = false,
  chrome = 'bare',
}: {
  children: ReactNode;
  showFactsBadge?: boolean;
  showHeader?: boolean;
  showLeadingBadge?: boolean;
  chrome?: 'card' | 'bare';
}) {
  return (
    <div className="flex gap-[18px]">
      {showLeadingBadge ? (
        <div className="mt-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#E3E7FF] bg-[#F2F4FF] text-[22px] text-[#5b61ff] shadow-[0_8px_18px_rgba(91,97,255,0.08)]">
          ✦
        </div>
      ) : null}
      <article
        className={
          chrome === 'card'
            ? 'min-w-0 flex-1 rounded-[34px] border border-[#EBEDF2] bg-white px-9 py-8 shadow-[0_12px_30px_rgba(31,26,20,0.04)]'
            : 'min-w-0 flex-1'
        }
      >
        {showHeader ? (
          <>
            <PortfolioAssistantIdentityHeader
              badge={
                showFactsBadge ? (
                <span className="rounded-full border border-[#d9d1c6] bg-[#faf7f1] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b6257]">
                  Только подтвержденные факты
                </span>
                ) : undefined
              }
            />
            <div className="mt-4">{children}</div>
          </>
        ) : (
          children
        )}
      </article>
    </div>
  );
}
