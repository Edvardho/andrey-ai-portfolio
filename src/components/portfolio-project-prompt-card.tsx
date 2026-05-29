'use client';

import clsx from 'clsx';

export function PortfolioProjectPromptCard({
  title,
  imageSrc,
  onClick,
  className,
}: {
  title: string;
  imageSrc: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'group flex h-[322px] w-[320px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-[28px] bg-white text-left shadow-[0px_6px_16px_0px_rgba(0,0,0,0.06)] transition-transform duration-150 hover:-translate-y-0.5',
        className,
      )}
    >
      <div className="relative h-[254px] w-full overflow-hidden bg-[#d8deea]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={title}
          className="size-full object-cover object-center transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-1 items-center bg-white px-[22px] py-[16px]">
        <p className="line-clamp-2 text-[16px] font-medium leading-[22px] text-[#25272e]">{title}</p>
      </div>
    </button>
  );
}
