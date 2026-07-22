import type { RailItem } from '@/lib/portfolio/types';
import {
  portfolioFocusRing,
  portfolioSoftSurfaceBorder,
} from './portfolio-interaction-styles';
import { PortfolioProjectRailItem } from './portfolio-project-rail-item';
import { PortfolioSessionLimitCard } from './portfolio-session-limit-card';

export function PortfolioRailSidebar({
  railItems,
  selectedRailId,
  showAssistantReturn,
  assistantReturnSelected,
  assistantReturnLabel = 'Ответ ИИ-ассистента',
  railTitle = 'Мои проекты',
  messagesRemaining,
  onRailClick,
  onAssistantReturnClick,
  onContactClick,
}: {
  railItems: RailItem[];
  selectedRailId: string | null;
  showAssistantReturn: boolean;
  assistantReturnSelected: boolean;
  assistantReturnLabel?: string;
  railTitle?: string;
  messagesRemaining: number;
  onRailClick: (item: RailItem) => void;
  onAssistantReturnClick: () => void;
  onContactClick: () => void;
}) {
  return (
    <aside className="box-border flex h-full min-h-0 w-[298px] min-w-[298px] max-w-[298px] flex-col overflow-hidden bg-white py-6 pr-[18px]">
      {showAssistantReturn ? (
        <button
          type="button"
          onClick={onAssistantReturnClick}
          disabled={assistantReturnSelected}
          aria-current={assistantReturnSelected ? 'page' : undefined}
          className={[
            'mb-8 flex w-[280px] cursor-pointer items-center gap-3 rounded-[18px] border p-4 text-left transition-colors duration-150 disabled:cursor-default',
            portfolioSoftSurfaceBorder,
            'disabled:border-[#E5E7F1] disabled:bg-[#F2F4FF]',
            portfolioFocusRing,
          ].join(' ')}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[14px] bg-[#F2F4FF] text-[17px] leading-none text-[#202129]">
            ✦
          </span>
          <span className="min-w-0 flex-1 text-[13px] font-normal leading-[1.35] text-[#5E606A]">
            {assistantReturnLabel}
          </span>
        </button>
      ) : null}

      <div className="w-[280px] shrink-0 text-[15px] font-medium text-[#151310]">{railTitle}</div>
      <div className="mt-4 min-h-0 w-[280px] flex-1 space-y-3 overflow-y-auto overflow-x-hidden pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {railItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onRailClick(item)}
            disabled={selectedRailId === item.id}
            aria-current={selectedRailId === item.id ? 'page' : undefined}
            className={['w-[280px] cursor-pointer text-left disabled:cursor-default', portfolioFocusRing].join(' ')}
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

      <div className="mt-4 w-[280px] shrink-0">
        <PortfolioSessionLimitCard messagesRemaining={messagesRemaining} onContactClick={onContactClick} />
      </div>
    </aside>
  );
}
