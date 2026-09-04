import type { WorkspaceLayoutMode } from '@/lib/portfolio/workspace-layout';

export function PortfolioUserBubble({
  text,
  layoutMode = 'desktop',
}: {
  text: string;
  layoutMode?: WorkspaceLayoutMode;
}) {
  const compact = layoutMode === 'compact';

  return (
    <div className="flex justify-end">
      <div className={compact
        ? 'w-[280px] max-w-full rounded-[20px] bg-[#F2F4FF] p-4'
        : 'max-w-[392px] rounded-[24px] bg-[#F2F4FF] px-4 py-[14px]'}>
        <div className={compact
          ? 'text-[14px] font-semibold leading-5 text-[#202129]'
          : 'text-[16px] font-semibold leading-[22px] text-[#202129]'}>Вы</div>
        <div className={compact
          ? 'mt-1 w-full text-[14px] font-normal leading-[1.4] text-[#202129]'
          : 'mt-1 w-full text-[16px] font-normal leading-[1.45] text-[#202129]'}>{text}</div>
      </div>
    </div>
  );
}
