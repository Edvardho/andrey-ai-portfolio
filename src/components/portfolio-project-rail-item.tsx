'use client';

import clsx from 'clsx';

export function PortfolioProjectRailItem({
  id,
  title,
  subtitle,
  selected,
}: {
  id: string;
  title: string;
  subtitle: string;
  selected: boolean;
}) {
  const previewMap: Record<string, string> = {
    'alfa-smart': '/entry/card-alfa-smart.png',
    chatpoint: '/entry/card-chatpoint.png',
    siebel: '/entry/card-chatpoint.png',
    'expenses-card-holders': '/entry/card-expenses-history.png',
    'subscription-sharing': '/entry/card-subscription-sharing.png',
    'ux-ui-wannabelike': '/entry/card-wannabelike.png',
  };

  const previewSrc = previewMap[id];

  return (
    <div
      className={clsx(
        'relative flex h-[90px] w-[280px] items-center gap-3 rounded-[20px] border px-4 py-4 text-left transition-colors duration-150',
        selected
          ? 'border-[#E5E7F1] bg-[#F2F4FF]'
          : 'border-[#E8EAF2] bg-white hover:bg-[#FAFBFF]',
      )}
    >
      <div className="flex size-[56px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-[#E6E9F2] bg-[#EEF2FA]">
        {previewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[13px] font-semibold uppercase leading-4 tracking-[0.12em] text-[#6b6f7e]">
            {title.slice(0, 2)}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <div className="text-[15px] font-semibold leading-5 text-[#20232c]">{title}</div>
        <div className="mt-1 text-[14px] leading-[18px] text-[#8e92a0]">{subtitle}</div>
      </div>
    </div>
  );
}
