'use client';

import clsx from 'clsx';
import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

type PortfolioFadeInImageProps = ImageProps & {
  overlayClassName?: string;
  revealDurationMs?: number;
};

export function PortfolioFadeInImage({
  alt,
  src,
  ...props
}: PortfolioFadeInImageProps) {
  return (
    <PortfolioFadeInImageInner
      key={typeof src === 'string' ? src : JSON.stringify(src)}
      alt={alt}
      src={src}
      {...props}
    />
  );
}

function PortfolioFadeInImageInner({
  alt,
  src,
  className,
  onLoad,
  onError,
  overlayClassName,
  revealDurationMs = 220,
  ...imageProps
}: PortfolioFadeInImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className="relative block h-full w-full overflow-hidden">
      <Image
        {...imageProps}
        alt={alt}
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
