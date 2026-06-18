'use client';

import { PortfolioAssistantIdentityHeader } from './portfolio-assistant-identity-header';

export function PortfolioAssistantLoadingRow() {
  return (
    <div className="flex w-full max-w-[798px] flex-col items-start gap-4" aria-live="polite">
      <PortfolioAssistantIdentityHeader
        badge={
          <span className="flex items-center gap-[2px] text-[16px] font-bold leading-[1.45] text-[#202129]">
            <span className="animate-pulse [animation-delay:0ms]">.</span>
            <span className="animate-pulse [animation-delay:120ms]">.</span>
            <span className="animate-pulse [animation-delay:240ms]">.</span>
          </span>
        }
      />
    </div>
  );
}
