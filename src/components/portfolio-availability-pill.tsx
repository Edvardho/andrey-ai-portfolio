'use client';

export function PortfolioAvailabilityPill({
  label = 'Открыт к предложениям',
}: {
  label?: string;
}) {
  return (
    <div className="inline-flex h-[42px] shrink-0 items-center gap-[10px] rounded-[999px] border border-[#ececf1] bg-white pl-[14px] pr-[16px]">
      <span className="size-2 rounded-full bg-[#7bd78d]" />
      <span className="text-[14px] font-medium leading-[18px] text-[#626674]">{label}</span>
    </div>
  );
}
