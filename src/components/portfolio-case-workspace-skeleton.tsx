'use client';

import clsx from 'clsx';

import type { WorkspaceLayoutMode } from '@/lib/portfolio/workspace-layout';

import { PORTFOLIO_CONTEXT_PANEL_BASE_CLASS } from './portfolio-context-panel';

function SkeletonBlock({
  className,
}: {
  className: string;
}) {
  return <div className={`animate-pulse rounded-[18px] bg-[#EEF1F8] ${className}`} aria-hidden="true" />;
}

export function PortfolioCaseWorkspaceSkeleton({
  layoutMode = 'desktop',
}: {
  layoutMode?: WorkspaceLayoutMode;
}) {
  if (layoutMode === 'compact') {
    return (
      <div className="h-full min-h-0 overflow-hidden">
        <div className="mx-auto w-full max-w-[720px] space-y-6 px-4 pt-5 sm:px-6 md:px-12">
          <div className="ml-auto w-[280px] rounded-[20px] bg-white px-4 py-4 shadow-[0_8px_30px_rgba(32,33,41,0.06)]">
            <div className="space-y-2.5">
              <SkeletonBlock className="h-4 w-full rounded-[8px]" />
              <SkeletonBlock className="h-4 w-[88%] rounded-[8px]" />
              <SkeletonBlock className="h-4 w-[64%] rounded-[8px]" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SkeletonBlock className="size-12 shrink-0 rounded-[16px]" />
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-[112px] rounded-[8px]" />
              <SkeletonBlock className="h-3 w-[156px] rounded-[8px]" />
            </div>
          </div>

          <div className="space-y-4">
            <SkeletonBlock className="h-7 w-[76%] rounded-[10px]" />
            <SkeletonBlock className="aspect-[7/4] w-[280px] rounded-[20px]" />
            <div className="space-y-2.5">
              <SkeletonBlock className="h-4 w-full rounded-[8px]" />
              <SkeletonBlock className="h-4 w-[92%] rounded-[8px]" />
              <SkeletonBlock className="h-4 w-[68%] rounded-[8px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-y-auto pt-6">
        <div className="space-y-7 px-6">
          <div className="w-full max-w-[798px] rounded-[28px] bg-white px-5 py-5">
            <div className="flex items-start gap-5">
              <SkeletonBlock className="h-[112px] w-[112px] shrink-0 rounded-[24px]" />
              <div className="min-w-0 flex-1 space-y-4 pt-1">
                <SkeletonBlock className="h-8 w-[168px] rounded-[10px]" />
                <div className="space-y-3">
                  <SkeletonBlock className="h-5 w-full max-w-[600px] rounded-[10px]" />
                  <SkeletonBlock className="h-5 w-[92%] max-w-[560px] rounded-[10px]" />
                  <SkeletonBlock className="h-5 w-[74%] max-w-[430px] rounded-[10px]" />
                </div>
              </div>
            </div>
          </div>

          <div className="h-4" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export function PortfolioContextPanelSkeleton({
  paddingMode = 'internal',
}: {
  paddingMode?: 'internal' | 'none';
}) {
  return (
    <aside
      className={clsx(
        PORTFOLIO_CONTEXT_PANEL_BASE_CLASS,
        paddingMode === 'internal' && 'px-6 pt-6 pb-6',
      )}
    >
      <div className="space-y-4">
        <SkeletonBlock className="h-7 w-[168px] rounded-[10px]" />

        <SkeletonBlock className="h-[240px] w-full rounded-[24px]" />

        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-[58%] rounded-[10px]" />
          <SkeletonBlock className="h-4 w-[74%] rounded-[10px]" />
          <SkeletonBlock className="h-4 w-[62%] rounded-[10px]" />
        </div>
      </div>
    </aside>
  );
}
