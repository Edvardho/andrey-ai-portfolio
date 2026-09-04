import clsx from 'clsx';

import type { SummaryPreviewConfig } from '@/lib/portfolio/types';
import type { WorkspaceLayoutMode } from '@/lib/portfolio/workspace-layout';
import { PortfolioFadeInImage } from './portfolio-fade-in-image';

type Props = {
  preview: SummaryPreviewConfig;
  alt?: string;
  className?: string;
  compactSizeClassName?: string;
  desktopSizeClassName?: string;
  layoutMode?: WorkspaceLayoutMode;
};

export function PortfolioStructuredIntroPreview({
  preview,
  alt = '',
  className,
  compactSizeClassName,
  desktopSizeClassName,
  layoutMode = 'desktop',
}: Props) {
  const radiusClassName = preview.radiusClassName ?? 'rounded-[20px]';
  const compact = layoutMode === 'compact';

  return (
    <div
      className={clsx(
        'relative shrink-0 overflow-hidden',
        compact
          ? (compactSizeClassName ?? 'size-12 rounded-[12px]')
          : (desktopSizeClassName ?? `size-28 ${radiusClassName}`),
        preview.bordered && 'border',
        className,
      )}
      style={{
        backgroundColor: preview.backgroundColor,
        borderColor: preview.bordered ? (preview.borderColor ?? '#EBEDF2') : undefined,
      }}
    >
      <PortfolioFadeInImage
        src={preview.src}
        alt={alt}
        width={compact ? 48 : 112}
        height={compact ? 48 : 112}
        sizes={compact ? '48px' : '112px'}
        className={preview.imageClassName}
        overlayClassName="bg-white/14"
      />
    </div>
  );
}
