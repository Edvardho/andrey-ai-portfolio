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
    <div className="flex gap-5">
      <div className="mt-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eef0ff] text-[22px] text-[#5b61ff] shadow-[inset_0_0_0_1px_rgba(91,97,255,0.08)]">
        ✦
      </div>
      <article className="min-w-0 flex-1 rounded-[36px] border border-[#EBEDF2] bg-white px-10 py-9 shadow-[0_16px_40px_rgba(31,26,20,0.05)]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-[18px] font-semibold text-[#11110f]">ИИ-ассистент</div>
          {showFactsBadge ? (
            <span className="rounded-full border border-[#d9d1c6] bg-[#faf7f1] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b6257]">
              Только подтвержденные факты
            </span>
          ) : null}
        </div>

        <div className="mt-8">{children}</div>
      </article>
    </div>
  );
}
