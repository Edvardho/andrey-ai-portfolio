function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function PortfolioRailPreview({
  title,
  subtitle,
  selected,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
}) {
  return (
    <div
      className={cx(
        'relative flex items-center gap-4 rounded-[26px] border px-4 py-4 text-left transition',
        selected
          ? 'border-[#d8d0c4] bg-white shadow-[0_10px_24px_rgba(31,26,20,0.05)]'
          : 'border-[#ece6dc] bg-white/90 hover:border-[#ddd5ca] hover:bg-white',
      )}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-[#ebe5da] bg-[linear-gradient(160deg,#faf8f3_0%,#f0ebe3_100%)] text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6a6258]">
        {title.slice(0, 2)}
      </div>
      <div className="min-w-0">
        <div className="text-[16px] font-semibold text-[#1d1b17]">{title}</div>
        <div className="mt-1 text-[14px] text-[#7b7368]">{subtitle}</div>
      </div>
      {selected ? <div className="ml-auto h-2.5 w-2.5 rounded-full bg-[#5b61ff]" /> : null}
    </div>
  );
}
