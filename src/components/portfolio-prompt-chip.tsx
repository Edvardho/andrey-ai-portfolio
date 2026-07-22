import type { PromptChip } from '@/lib/portfolio/types';
import clsx from 'clsx';
import { portfolioChipSurface, portfolioFocusRing } from './portfolio-interaction-styles';

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
        'inline-flex shrink-0 cursor-pointer items-center rounded-[999px] border transition-colors duration-150',
        portfolioFocusRing,
        size === 'compact'
          ? 'gap-3 px-[18px] py-[7px] text-[15px] leading-[22px]'
          : 'h-9 px-[18px] py-[11px] text-[16px] leading-[22px]',
        emphasis
          ? clsx('border-[#DEDFE5] bg-white text-[#5A5E68]', portfolioChipSurface)
          : clsx('border-[#ECECF1] bg-[rgba(255,255,255,0.92)] text-[#5A5E68]', portfolioChipSurface),
      )}
    >
      {chip.label}
    </button>
  );
}
