'use client';

export function PortfolioAssistantLoadingRow() {
  return (
    <div className="flex gap-5">
      <div className="mt-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eef0ff] text-[22px] text-[#5b61ff]">
        ✦
      </div>
      <div className="rounded-[28px] border border-[#EBEDF2] bg-white px-6 py-5 text-[15px] leading-7 text-[#6a6258] shadow-[0_12px_28px_rgba(31,26,20,0.04)]">
        Ищу правильное состояние. Ассистент не должен стрелять в темноту.
      </div>
    </div>
  );
}
