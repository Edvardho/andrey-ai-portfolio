import type { PromptChip } from '@/lib/portfolio/types';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

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
      className={cx(
        'rounded-full border px-5 py-3 text-[15px] leading-6 tracking-normal transition',
        emphasis
          ? 'border-[#d9d1c6] bg-white text-[#1b1915] shadow-[0_6px_20px_rgba(35,28,20,0.04)] hover:border-[#c9beaf] hover:bg-[#fffcf7]'
          : 'border-[#e5ddd1] bg-[#fffcf7] text-[#5e574f] hover:border-[#d2c7b7] hover:bg-white',
      )}
    >
      {chip.label}
    </button>
  );
}
