import type { RailItem } from '@/lib/portfolio/types';
import { PortfolioRailPreview } from './portfolio-rail-preview';

export function PortfolioRailSidebar({
  railItems,
  selectedRailId,
  messagesRemaining,
  onRailClick,
}: {
  railItems: RailItem[];
  selectedRailId: string | null;
  messagesRemaining: number;
  onRailClick: (item: RailItem) => void;
}) {
  return (
    <aside className="flex min-h-0 flex-col overflow-hidden border-r border-[#ece5da] px-6 py-6 bg-white">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#ebe4da] bg-[#f7f5f0] text-[20px] font-semibold text-[#8a8378]">
          AM
        </div>
        <div>
          <div className="text-[18px] font-semibold text-[#12110e]">Андрей Макаревич</div>
          <div className="mt-1 text-[15px] text-[#7a7268]">Product Designer</div>
        </div>
      </div>

      <div className="mt-10 text-[15px] font-semibold text-[#151310]">Мои проекты</div>
      <div className="mt-4 space-y-3 overflow-hidden">
        {railItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onRailClick(item)}
            disabled={selectedRailId === item.id}
            aria-current={selectedRailId === item.id ? 'page' : undefined}
            className="w-full text-left disabled:cursor-default"
          >
            <PortfolioRailPreview title={item.label} subtitle={item.subtitle} selected={selectedRailId === item.id} />
          </button>
        ))}
      </div>

      <div className="mt-auto rounded-[28px] border border-[#e8e1d7] bg-[#fbf9f4] p-5">
        <div className="text-[17px] font-semibold text-[#12110e]">Лимит сессии</div>
        <div className="mt-3 text-[15px] leading-7 text-[#655d53]">
          В V1 ассистент не болтает бесконечно. После 20 пользовательских сообщений он переводит разговор в прямой контакт.
        </div>
        <div className="mt-5 rounded-full border border-[#e6dfd4] bg-white px-4 py-2.5 text-[15px] font-medium text-[#544d44]">
          Осталось сообщений: {messagesRemaining}
        </div>
      </div>
    </aside>
  );
}
