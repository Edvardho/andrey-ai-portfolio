import type { PromptChip } from '@/lib/portfolio/types';
import clsx from 'clsx';

export function PortfolioPromptChip({
  chip,
  onClick,
  emphasis = false,
}: {
  chip: PromptChip;
  onClick: (chip: PromptChip) => void;
  emphasis?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(chip)}
      className={clsx(
        'inline-flex h-9 shrink-0 items-center rounded-[999px] border px-[18px] py-[11px] text-[16px] leading-[22px] transition-colors duration-150',
        emphasis
          ? 'border-[#dedfe5] bg-white text-[#5a5e68] hover:border-[#cfd3de] hover:bg-[#fcfcff] active:border-[#c4c8d3]'
          : 'border-[#ececf1] bg-[rgba(255,255,255,0.92)] text-[#7c7f89] hover:border-[#daddE6] hover:bg-white active:border-[#cfd3de]',
      )}
    >
      {chip.label}
    </button>
  );
}
