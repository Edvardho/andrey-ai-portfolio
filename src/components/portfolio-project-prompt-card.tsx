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
  onPrefetch,
  className,
}: {
  title: string;
  preview: EntryProjectPromptPreview;
  onClick: () => void;
  onPrefetch?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onFocus={onPrefetch}
      onMouseEnter={onPrefetch}
      className={clsx(
        'group flex h-[322px] w-[320px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-[28px] bg-white text-left shadow-[0px_6px_16px_0px_rgba(0,0,0,0.06)] transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8EA2FF] focus-visible:ring-offset-2',
        className,
      )}
    >
      <div className="relative h-[254px] w-full overflow-hidden">
        <div
          className={clsx('absolute inset-0', preview.fillClassName)}
          style={preview.fillStyle}
        />
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={preview.src}
            alt={title}
            width={640}
            height={508}
            sizes="320px"
            className={clsx(preview.imageClassName, 'transition-transform duration-200 group-hover:scale-[1.02]')}
          />
        </div>
      </div>
      <div className="flex flex-1 items-center bg-white px-[22px] py-[16px]">
        <p className="line-clamp-2 text-[16px] font-medium leading-[22px] text-[#25272e]">{title}</p>
      </div>
    </button>
  );
}
