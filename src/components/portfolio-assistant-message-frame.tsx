'use client';

import type { ReactNode } from 'react';
import type { WorkspaceLayoutMode } from '@/lib/portfolio/workspace-layout';

import { PortfolioAssistantIdentityHeader } from './portfolio-assistant-identity-header';

export function PortfolioAssistantMessageFrame({
  children,
  showHeader = true,
  showLeadingBadge = false,
  chrome = 'bare',
  layoutMode = 'desktop',
}: {
  children: ReactNode;
  showHeader?: boolean;
  showLeadingBadge?: boolean;
  chrome?: 'card' | 'bare';
  layoutMode?: WorkspaceLayoutMode;
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
            <PortfolioAssistantIdentityHeader layoutMode={layoutMode} />
            <div className="mt-4">{children}</div>
          </>
        ) : (
          children
        )}
      </article>
    </div>
  );
}
