export function PortfolioUserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[392px] rounded-[24px] bg-[#F2F4FF] px-4 py-[14px]">
        <div className="text-[16px] font-semibold leading-[22px] text-[#202129]">Вы</div>
        <div className="mt-1 w-full text-[16px] font-normal leading-[1.45] text-[#202129]">{text}</div>
      </div>
    </div>
  );
}
