import clsx from 'clsx';

import type { SummaryPreviewConfig } from '@/lib/portfolio/types';
import { PortfolioFadeInImage } from './portfolio-fade-in-image';

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
      <PortfolioFadeInImage
        src={preview.src}
        alt={alt}
        width={112}
        height={112}
        sizes="112px"
        className={preview.imageClassName}
        overlayClassName="bg-white/14"
      />
    </div>
  );
}
