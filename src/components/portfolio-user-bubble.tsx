export function PortfolioUserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[760px] rounded-[28px] border border-[#ebe4da] bg-white px-7 py-5 text-[16px] leading-7 text-[#22201c] shadow-[0_10px_30px_rgba(36,30,24,0.05)]">
        {text}
      </div>
    </div>
  );
}
