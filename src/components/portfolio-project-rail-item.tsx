'use client';

import clsx from 'clsx';
import type { CSSProperties } from 'react';

type RailThumbConfig = {
  src: string;
  imageClassName: string;
  frameClassName: string;
  fillClassName?: string;
  fillStyle?: CSSProperties;
};

const railThumbMap: Record<string, RailThumbConfig> = {
  'alfa-smart': {
    src: '/entry/card-alfa-smart-figma-image.png',
    imageClassName: 'absolute h-[172.95%] w-[93.94%] max-w-none left-[3.03%] top-[5.58%]',
    frameClassName: 'border-[#D1D7E3]',
    fillClassName: 'bg-[#D1D7E3]',
  },
  chatpoint: {
    src: '/entry/card-chatpoint.png',
    imageClassName: 'absolute h-full w-[160.32%] max-w-none left-[-12.24%] top-[16.6%]',
    frameClassName: 'border-[#EBEDF2]',
    fillClassName: 'bg-[#D1D7E3]',
  },
  siebel: {
    src: '/entry/card-siebel.png',
    imageClassName: 'absolute h-[121.17%] w-[150.6%] max-w-none left-[-45.67%] top-[9.01%]',
    frameClassName: 'border-[#EBEDF2]',
    fillClassName: 'bg-[#D1D7E3]',
  },
  'expenses-card-holders': {
    src: '/entry/card-expenses-history.png',
    imageClassName: 'absolute h-[172.61%] w-[90.08%] max-w-none left-[4.96%] top-[2.82%]',
    frameClassName: 'border-[#D1D7E3]',
    fillStyle: {
      backgroundImage: 'linear-gradient(133.594deg, rgb(227, 210, 209) 0%, rgb(157, 180, 225) 96.702%)',
    },
  },
  'subscription-sharing': {
    src: '/entry/card-subscription-sharing.png',
    imageClassName: 'absolute h-[181.39%] w-[88.19%] max-w-none left-[5.9%] top-[1.65%]',
    frameClassName: 'border-[#EBEDF2]',
    fillStyle: {
      backgroundImage: 'linear-gradient(133.594deg, rgb(227, 210, 209) 0%, rgb(194, 215, 202) 96.702%)',
    },
  },
  'ux-ui-wannabelike': {
    src: '/entry/card-wannabelike.png',
    imageClassName: 'absolute h-[223.85%] w-full max-w-none left-0 top-0',
    frameClassName: 'border-[#EBEDF2]',
    fillStyle: {
      backgroundImage: 'linear-gradient(133.594deg, rgb(211, 227, 209) 0%, rgb(32, 40, 56) 96.702%)',
    },
  },
  experience: {
    src: '/entry/card-experience.png',
    imageClassName: 'absolute size-[144.63%] max-w-none left-[-22.31%] top-[-10.92%]',
    frameClassName: 'border-[#EBEDF2]',
    fillClassName: 'bg-[#D1D7E3]',
  },
};

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
  const thumb = railThumbMap[id];

  return (
    <div
      className={clsx(
        'relative flex h-[90px] w-[280px] items-center gap-3 overflow-hidden rounded-[18px] border px-4 py-4 text-left transition-colors duration-150',
        selected
          ? 'border-[#E5E7F1] bg-[#F2F4FF]'
          : 'border-[#E8EAF2] bg-white hover:bg-[#FAFBFF]',
      )}
    >
      <div
        className={clsx(
          'relative size-[56px] shrink-0 overflow-hidden rounded-[16px] border',
          thumb?.frameClassName,
        )}
      >
        <div
          className={clsx('absolute inset-0 rounded-[16px]', thumb?.fillClassName)}
          style={thumb?.fillStyle}
        />
        <div className="absolute inset-0 overflow-hidden rounded-[16px]">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb.src} alt="" className={thumb.imageClassName} />
          ) : (
            <div className="flex size-full items-center justify-center bg-[#EEF2FA]">
              <span className="text-[13px] font-semibold uppercase leading-4 tracking-[0.12em] text-[#6B6F7E]">
                {title.slice(0, 2)}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold leading-[1.2] text-[#202129]">{title}</div>
        <div className="mt-1 text-[13px] leading-[1.35] text-[#5E606A]">{subtitle}</div>
      </div>
    </div>
  );
}
