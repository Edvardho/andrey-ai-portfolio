export function PortfolioMetricRow({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-[10px]">
      <div className="h-[25px] w-[86px] shrink-0">
        <div className="inline-flex min-w-[52px] items-center justify-center rounded-[12px] bg-[#F2F4FF] px-[10px] py-1">
          <span className="whitespace-nowrap text-[12px] font-medium leading-[1.45] text-[#484B58]">{value}</span>
        </div>
      </div>
      <span className="min-w-0 flex-1 text-[13px] font-normal leading-[1.45] text-[#494A56]">{label}</span>
    </div>
  );
}
