'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';

export function PortfolioAssistantIdentityHeader({
  badge,
  className,
}: {
  badge?: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('flex flex-wrap items-center gap-2', className)}>
      <div className="flex size-7 shrink-0 items-center justify-center rounded-[14px] bg-[#F2F4FF]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ui/assistant-mark.svg" alt="" aria-hidden="true" className="size-[14px]" />
      </div>
      <p className="text-[15px] font-semibold leading-[22px] tracking-[-0.01em] text-[#24272E]">
        ИИ ассистент
      </p>
      {badge}
    </div>
  );
}
