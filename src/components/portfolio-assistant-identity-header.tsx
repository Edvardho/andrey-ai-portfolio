'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';
import type { WorkspaceLayoutMode } from '@/lib/portfolio/workspace-layout';

export function PortfolioAssistantIdentityHeader({
  badge,
  className,
  layoutMode = 'desktop',
  strong = false,
}: {
  badge?: ReactNode;
  className?: string;
  layoutMode?: WorkspaceLayoutMode;
  strong?: boolean;
}) {
  const compact = layoutMode === 'compact';

  return (
    <div className={clsx('flex flex-wrap items-center gap-2', className)}>
      <div className={compact
        ? 'flex size-6 shrink-0 items-center justify-center rounded-[12px] bg-[#F2F4FF]'
        : 'flex size-7 shrink-0 items-center justify-center rounded-[14px] bg-[#F2F4FF]'}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ui/assistant-mark.svg" alt="" aria-hidden="true" className={compact ? 'size-[13px]' : 'size-[14px]'} />
      </div>
      <p className={compact
        ? `text-[14px] ${strong ? 'font-bold' : 'font-semibold'} leading-[17px] text-[#24272E]`
        : 'text-[15px] font-semibold leading-[22px] tracking-[-0.01em] text-[#24272E]'}>
        ИИ ассистент
      </p>
      {badge}
    </div>
  );
}
