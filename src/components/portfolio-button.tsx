'use client';

import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type PortfolioButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'primary' | 'secondary';
  size?: 'sm' | 'lg' | 'icon-sm' | 'icon-lg';
  icon?: ReactNode;
  children?: ReactNode;
};

export function PortfolioButton({
  className,
  tone = 'primary',
  size = 'sm',
  icon,
  children,
  type = 'button',
  ...props
}: PortfolioButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[999px] border transition-colors duration-150',
        tone === 'primary'
          ? 'border-[#1a1c22] bg-[#1a1c22] text-white hover:bg-[#242832] hover:border-[#242832] disabled:border-[#a6a9b3] disabled:bg-[#a6a9b3]'
          : 'border-[#ececf1] bg-white text-[#5f6474] hover:border-[#d7dbe5] hover:bg-[#fafbff] disabled:border-[#ececf1] disabled:bg-white disabled:text-[#b5b8c2]',
        size === 'sm' && 'h-9 gap-2 px-[18px] text-[15px] font-medium leading-5',
        size === 'lg' && 'h-[52px] gap-2 px-7 text-[15px] font-medium leading-5',
        size === 'icon-sm' && 'size-[38px] p-0',
        size === 'icon-lg' && 'size-[54px] p-0',
        'disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      {children ? <span className="whitespace-nowrap">{children}</span> : null}
    </button>
  );
}
