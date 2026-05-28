'use client';

import { useState } from 'react';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function PortfolioPreviewSurface({
  src,
  title,
  subtitle,
  badge,
  className,
}: {
  src?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);

  if (src && !broken) {
    return (
      <div className={cx('overflow-hidden rounded-[24px] border border-[#EBEDF2] bg-[#f6f3ee]', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={title}
          className="h-full w-full object-cover"
          onError={() => setBroken(true)}
        />
      </div>
    );
  }

  return (
      <div
      className={cx(
        'overflow-hidden rounded-[24px] border border-[#EBEDF2] bg-[linear-gradient(160deg,#faf8f4_0%,#f0ece6_100%)]',
        className,
      )}
    >
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full border border-[#ddd6cb] bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b6257]">
            {badge ?? 'Preview'}
          </span>
          <div className="h-10 w-10 rounded-2xl border border-white/60 bg-white/60" />
        </div>
        <div>
          <div className="text-base font-semibold text-[#191714]">{title}</div>
          {subtitle ? <div className="mt-2 text-sm leading-6 text-[#6e675d]">{subtitle}</div> : null}
        </div>
      </div>
    </div>
  );
}
