'use client';

import clsx from 'clsx';
import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

type PortfolioFadeInImageProps = ImageProps & {
  overlayClassName?: string;
  revealDurationMs?: number;
};

export function PortfolioFadeInImage({
  src,
  className,
  onLoad,
  onError,
  overlayClassName,
  revealDurationMs = 220,
  ...imageProps
}: PortfolioFadeInImageProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <span className="relative block h-full w-full overflow-hidden">
      <Image
        {...imageProps}
        src={src}
        className={clsx(
          className,
          'transition-opacity ease-out',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          transitionDuration: `${revealDurationMs}ms`,
        }}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        onError={(event) => {
          setLoaded(true);
          onError?.(event);
        }}
      />

      <span
        aria-hidden="true"
        className={clsx(
          'pointer-events-none absolute inset-0 bg-white/30 transition-opacity ease-out',
          loaded ? 'opacity-0' : 'opacity-100',
          overlayClassName,
        )}
        style={{ transitionDuration: `${revealDurationMs}ms` }}
      />
    </span>
  );
}
