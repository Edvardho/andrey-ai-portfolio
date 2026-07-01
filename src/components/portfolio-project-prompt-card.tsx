'use client';

import clsx from 'clsx';
import Image from 'next/image';
import type { CSSProperties } from 'react';

export type EntryProjectPromptPreview = {
  src: string;
  imageClassName: string;
  fillClassName?: string;
  fillStyle?: CSSProperties;
};

export function PortfolioProjectPromptCard({
  title,
  preview,
  onClick,
  className,
}: {
  title: string;
  preview: EntryProjectPromptPreview;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'group flex size-[286px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-[28px] bg-white text-left shadow-[0px_6px_16px_0px_rgba(0,0,0,0.06)] transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8EA2FF] focus-visible:ring-offset-2',
        className,
      )}
    >
      <div className="relative min-h-0 flex-1 w-full overflow-hidden">
        <div
          className={clsx('absolute inset-0', preview.fillClassName)}
          style={preview.fillStyle}
        />
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={preview.src}
            alt={title}
            width={572}
            height={432}
            sizes="286px"
            className={clsx(preview.imageClassName, 'transition-transform duration-200 group-hover:scale-[1.02]')}
          />
        </div>
      </div>
      <div className="flex h-[70px] shrink-0 items-start justify-center bg-white px-[18px] py-[12px]">
        <p className="line-clamp-2 text-[16px] font-medium leading-[22px] text-[#25272e]">{title}</p>
      </div>
    </button>
  );
}
