'use client';

import clsx from 'clsx';

export function PortfolioMetadataChip({
  iconSrc,
  label,
  compact = false,
}: {
  iconSrc: string;
  label: string;
  compact?: boolean;
}) {
  return (
    <div
      className={clsx(
        'inline-flex shrink-0 items-center gap-[10px] rounded-[999px] border border-[#ececf1] bg-[rgba(255,255,255,0.9)] px-[16px] text-[#7c7f89]',
        compact ? 'h-[35px] py-[8px]' : 'h-[44px] py-[11px]',
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={iconSrc} alt="" className="size-4 shrink-0" />
      <span className="text-[15px] font-medium leading-5 whitespace-nowrap">{label}</span>
    </div>
  );
}
