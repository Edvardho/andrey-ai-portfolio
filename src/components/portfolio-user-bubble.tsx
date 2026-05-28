export function PortfolioUserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end pr-1">
      <div className="max-w-[390px] rounded-[24px] border border-[#E6EAF6] bg-[#F4F6FF] px-[18px] py-[15px] shadow-[0_10px_24px_rgba(18,32,71,0.05)]">
        <div className="text-[16px] font-semibold leading-[1.2] text-[#202129]">Вы</div>
        <div className="mt-[10px] w-full text-[16px] font-normal leading-[1.45] text-[#202129]">{text}</div>
      </div>
    </div>
  );
}
