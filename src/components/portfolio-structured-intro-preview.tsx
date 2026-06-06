import clsx from 'clsx';

import type { SummaryPreviewConfig } from '@/lib/portfolio/types';

type Props = {
  preview: SummaryPreviewConfig;
  alt?: string;
  className?: string;
};

export function PortfolioStructuredIntroPreview({ preview, alt = '', className }: Props) {
  const radiusClassName = preview.radiusClassName ?? 'rounded-[20px]';

  return (
    <div
      className={clsx(
        'relative size-28 shrink-0 overflow-hidden',
        radiusClassName,
        preview.bordered && 'border',
        className,
      )}
      style={{
        backgroundColor: preview.backgroundColor,
        borderColor: preview.bordered ? (preview.borderColor ?? '#EBEDF2') : undefined,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={preview.src} alt={alt} className={preview.imageClassName} />
    </div>
  );
}
