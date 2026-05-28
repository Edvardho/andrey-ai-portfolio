export function PortfolioUserBubble({ text }: { text: string }) {
  const isShort = text.trim().length <= 32;

  return (
    <div className="flex justify-end">
      <div
        className={`flex flex-col items-start gap-2 overflow-hidden rounded-[20px] bg-[#F2F4FF] p-4 text-left ${
          isShort ? 'w-[338px]' : 'w-[390px]'
        }`}
      >
        <div className="text-[16px] font-bold leading-[1.2] text-[#202129]">Вы</div>
        <div className="w-full text-[16px] font-normal leading-[1.35] text-[#202129]">{text}</div>
      </div>
    </div>
  );
}
