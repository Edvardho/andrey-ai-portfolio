'use client';

function SkeletonBlock({
  className,
}: {
  className: string;
}) {
  return <div className={`animate-pulse rounded-[18px] bg-[#EEF1F8] ${className}`} aria-hidden="true" />;
}

export function PortfolioCaseWorkspaceSkeleton({
  title,
}: {
  title?: string | null;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-y-auto pt-6">
        <div className="space-y-7 px-6">
          <div className="w-full max-w-[798px] rounded-[28px] border border-[#EBEDF2] bg-white px-5 py-5">
            <div className="flex items-start gap-4">
              <SkeletonBlock className="size-8 rounded-[16px]" />
              <div className="min-w-0 flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="text-[14px] font-medium leading-5 text-[#666B7A]">
                    {title ? `Открываю кейс: ${title}` : 'Открываю кейс'}
                  </div>
                  <SkeletonBlock className="h-8 w-[58%]" />
                  <SkeletonBlock className="h-5 w-full max-w-[620px]" />
                  <SkeletonBlock className="h-5 w-[88%] max-w-[560px]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <SkeletonBlock className="h-[168px] w-full rounded-[24px]" />
                  <SkeletonBlock className="h-[168px] w-full rounded-[24px]" />
                </div>

                <div className="space-y-3">
                  <SkeletonBlock className="h-5 w-[34%]" />
                  <SkeletonBlock className="h-4 w-full max-w-[650px]" />
                  <SkeletonBlock className="h-4 w-[91%] max-w-[600px]" />
                  <SkeletonBlock className="h-4 w-[83%] max-w-[540px]" />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[798px] space-y-3">
            <SkeletonBlock className="h-4 w-[22%]" />
            <div className="grid grid-cols-3 gap-4">
              <SkeletonBlock className="h-[176px] w-full rounded-[24px]" />
              <SkeletonBlock className="h-[176px] w-full rounded-[24px]" />
              <SkeletonBlock className="h-[176px] w-full rounded-[24px]" />
            </div>
          </div>

          <div className="h-4" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export function PortfolioContextPanelSkeleton({
  title,
}: {
  title?: string | null;
}) {
  return (
    <aside className="overflow-hidden bg-white pt-6">
      <div className="space-y-4">
        <div className="text-[15px] font-medium leading-[1.45] text-[#202129]">
          Контекст проекта
        </div>

        <SkeletonBlock className="h-[240px] w-full rounded-[24px]" />

        <div className="space-y-2">
          {title ? (
            <div className="text-[18px] font-medium leading-[1.45] text-[#202129]">{title}</div>
          ) : (
            <SkeletonBlock className="h-7 w-[58%]" />
          )}
          <SkeletonBlock className="h-4 w-[74%]" />
          <SkeletonBlock className="h-4 w-[62%]" />
        </div>

        <div className="flex flex-wrap gap-2">
          <SkeletonBlock className="h-8 w-[88px] rounded-[14px]" />
          <SkeletonBlock className="h-8 w-[72px] rounded-[14px]" />
          <SkeletonBlock className="h-8 w-[94px] rounded-[14px]" />
          <SkeletonBlock className="h-8 w-[68px] rounded-[14px]" />
        </div>

        <div className="space-y-3">
          <SkeletonBlock className="h-4 w-[42%]" />
          <SkeletonBlock className="h-11 w-full rounded-[14px]" />
          <SkeletonBlock className="h-11 w-full rounded-[14px]" />
          <SkeletonBlock className="h-11 w-full rounded-[14px]" />
        </div>
      </div>
    </aside>
  );
}
