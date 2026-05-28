import type { RailItem } from '@/lib/portfolio/types';
import { PortfolioProjectRailItem } from './portfolio-project-rail-item';
import { PortfolioSessionLimitCard } from './portfolio-session-limit-card';

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
    <aside className="box-border flex h-full min-h-0 w-[298px] min-w-[298px] max-w-[298px] flex-col overflow-hidden bg-white py-6 pr-[18px]">
      <div className="text-[15px] font-semibold text-[#151310]">Мои проекты</div>
      <div className="mt-4 w-[280px] space-y-3 overflow-hidden">
        {railItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onRailClick(item)}
            disabled={selectedRailId === item.id}
            aria-current={selectedRailId === item.id ? 'page' : undefined}
            className="w-[280px] text-left disabled:cursor-default"
          >
            <PortfolioProjectRailItem
              id={item.id}
              title={item.label}
              subtitle={item.subtitle}
              selected={selectedRailId === item.id}
            />
          </button>
        ))}
      </div>

      <div className="mt-auto w-[280px]">
        <PortfolioSessionLimitCard messagesRemaining={messagesRemaining} />
      </div>
    </aside>
  );
}
