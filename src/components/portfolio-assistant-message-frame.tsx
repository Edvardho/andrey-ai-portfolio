'use client';

import type { ReactNode } from 'react';

export function PortfolioAssistantMessageFrame({
  children,
  showFactsBadge = false,
}: {
  children: ReactNode;
  showFactsBadge?: boolean;
}) {
  return (
    <div className="flex gap-[18px]">
      <div className="mt-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#E3E7FF] bg-[#F2F4FF] text-[22px] text-[#5b61ff] shadow-[0_8px_18px_rgba(91,97,255,0.08)]">
        ✦
      </div>
      <article className="min-w-0 flex-1 rounded-[34px] border border-[#EBEDF2] bg-white px-9 py-8 shadow-[0_12px_30px_rgba(31,26,20,0.04)]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-[18px] font-semibold text-[#11110f]">ИИ-ассистент</div>
          {showFactsBadge ? (
            <span className="rounded-full border border-[#d9d1c6] bg-[#faf7f1] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b6257]">
              Только подтвержденные факты
            </span>
          ) : null}
        </div>

        <div className="mt-7">{children}</div>
      </article>
    </div>
  );
}
