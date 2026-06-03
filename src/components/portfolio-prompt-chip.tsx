import type { PromptChip } from '@/lib/portfolio/types';
import clsx from 'clsx';

export function PortfolioPromptChip({
  chip,
  onClick,
  emphasis = false,
  size = 'default',
}: {
  chip: PromptChip;
  onClick: (chip: PromptChip) => void;
  emphasis?: boolean;
  size?: 'default' | 'compact';
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(chip)}
      className={clsx(
        'inline-flex shrink-0 cursor-pointer items-center rounded-[999px] border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8EA2FF] focus-visible:ring-offset-2',
        size === 'compact'
          ? 'gap-3 px-[18px] py-[7px] text-[15px] leading-[22px]'
          : 'h-9 px-[18px] py-[11px] text-[16px] leading-[22px]',
        emphasis
          ? 'border-[#dedfe5] bg-white text-[#5A5E68] hover:border-transparent hover:bg-[#EAF0FF] hover:text-[#3F4454] active:border-transparent active:bg-[#F2F4FF] active:text-[#1F2129]'
          : 'border-[#ececf1] bg-[rgba(255,255,255,0.92)] text-[#5A5E68] hover:border-transparent hover:bg-[#EAF0FF] hover:text-[#3F4454] active:border-transparent active:bg-[#F2F4FF] active:text-[#1F2129]',
      )}
    >
      {chip.label}
    </button>
  );
}
