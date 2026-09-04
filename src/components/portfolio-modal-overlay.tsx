import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Mail, Minus, Plus, Scan, X } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import type { ModalPayload, ContactOption } from '@/lib/portfolio/types';
import { portfolioFocusRing, portfolioSoftSurfaceBorder } from './portfolio-interaction-styles';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const contactOptionIcons: Record<ContactOption['id'], { src?: string; bgClass?: string; imageClassName?: string }> = {
  telegram: {
    src: '/contact-modal/telegram.png',
    imageClassName: 'absolute inset-0 h-full w-full max-w-none object-cover',
  },
  linkedin: {
    src: '/contact-modal/linkedin.png',
    imageClassName: 'absolute inset-0 h-full w-full max-w-none object-cover',
  },
  email: {
    bgClass: 'bg-[#EEF0F6]',
  },
};

const FOCUSABLE_SELECTOR = [
  'button:not([disabled]):not([tabindex="-1"])',
  'a[href]',
  'input:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function ContactOptionRow({ option }: { option: ContactOption }) {
  const icon = contactOptionIcons[option.id];

  return (
    <a
      href={option.href}
      target={option.id === 'email' ? undefined : '_blank'}
      rel={option.id === 'email' ? undefined : 'noreferrer'}
      className={cx(
        'flex w-full cursor-pointer items-center gap-[14px] overflow-hidden rounded-[20px] border p-[18px] transition-colors duration-150 max-md:h-[72px] max-md:min-h-0',
        portfolioSoftSurfaceBorder,
        portfolioFocusRing,
      )}
    >
      <div
        className={cx(
          'relative size-[52px] shrink-0 overflow-hidden rounded-[16px] max-md:size-9 max-md:rounded-[11px]',
          icon.bgClass,
        )}
      >
        {icon.src ? (
          <Image
            src={icon.src}
            alt=""
            width={52}
            height={52}
            sizes="52px"
            aria-hidden="true"
            className={icon.imageClassName}
          />
        ) : (
          <Mail className="absolute inset-0 m-auto size-6 text-[#30313A]" strokeWidth={1.8} aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1 text-left">
        <div className="text-[18px] font-semibold leading-6 text-[#202129] max-md:text-[15px] max-md:font-medium max-md:leading-[18px]">
          {option.label}
        </div>
        <div className="text-[14px] leading-5 text-[#6E7286] max-md:hidden">{option.helper}</div>
      </div>
      <div className="flex size-6 shrink-0 items-center justify-center text-[#11110F]">
        <ArrowRight className="size-[15px]" strokeWidth={2} />
      </div>
    </a>
  );
}

const MOBILE_IMAGE_DOUBLE_TAP_SCALE = 2;
const MOBILE_IMAGE_MAX_SCALE = 3;
const MOBILE_IMAGE_ZOOM_STEP = 0.5;
const MOBILE_CONTACT_CLOSE_DURATION_MS = 400;

type PointerPosition = { x: number; y: number };

function pointerDistance([first, second]: PointerPosition[]) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

export function PortfolioModalOverlay({
  modal,
  onClose,
}: {
  modal: ModalPayload;
  onClose: () => void;
}) {
  const isContact = modal.type === 'contact';
  const isImage = modal.type === 'image';
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isClosingRef = useRef(false);
  const [isClosing, setIsClosing] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const reduceMotion = useReducedMotion();
  const imageGestureRef = useRef({
    pointers: new Map<number, PointerPosition>(),
    initialDistance: 0,
    initialScale: 1,
    didPinch: false,
    lastTapAt: 0,
  });

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const requestClose = useCallback(() => {
    if (isClosingRef.current) {
      return;
    }

    const shouldAnimateMobileContact =
      isContact &&
      !reduceMotion &&
      globalThis.matchMedia?.('(max-width: 767px)').matches;

    if (!shouldAnimateMobileContact) {
      onCloseRef.current();
      return;
    }

    isClosingRef.current = true;
    setIsClosing(true);
    closeTimeoutRef.current = globalThis.setTimeout(() => onCloseRef.current(), MOBILE_CONTACT_CLOSE_DURATION_MS);
  }, [isContact, reduceMotion]);

  useEffect(() => {
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const getFocusableElements = () => Array.from(
      overlayRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
    ).filter((element) => element.getClientRects().length > 0);

    getFocusableElements()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = getFocusableElements();
      if (!focusable.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocusedElement) {
        try {
          previouslyFocusedElement.focus({ preventScroll: true });
        } catch {
          previouslyFocusedElement.focus();
        }
      }
    };
  }, [onClose, requestClose]);

  useEffect(() => () => {
    if (closeTimeoutRef.current) {
      globalThis.clearTimeout(closeTimeoutRef.current);
    }
  }, []);

  function toggleImageZoom() {
    setImageScale((current) => (current > 1 ? 1 : MOBILE_IMAGE_DOUBLE_TAP_SCALE));
  }

  function zoomImage(direction: 'in' | 'out') {
    setImageScale((current) => {
      const next = current + (direction === 'in' ? MOBILE_IMAGE_ZOOM_STEP : -MOBILE_IMAGE_ZOOM_STEP);
      return Math.min(MOBILE_IMAGE_MAX_SCALE, Math.max(1, next));
    });
  }

  function handleMobileImagePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const gesture = imageGestureRef.current;
    gesture.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);

    if (gesture.pointers.size === 2) {
      gesture.initialDistance = pointerDistance(Array.from(gesture.pointers.values()));
      gesture.initialScale = imageScale;
      gesture.didPinch = false;
    }
  }

  function handleMobileImagePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const gesture = imageGestureRef.current;
    if (!gesture.pointers.has(event.pointerId)) {
      return;
    }

    gesture.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (gesture.pointers.size !== 2 || gesture.initialDistance <= 0) {
      return;
    }

    const scale = Math.min(
      MOBILE_IMAGE_MAX_SCALE,
      Math.max(1, gesture.initialScale * (pointerDistance(Array.from(gesture.pointers.values())) / gesture.initialDistance)),
    );
    gesture.didPinch = true;
    setImageScale(scale);
  }

  function handleMobileImagePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const gesture = imageGestureRef.current;
    gesture.pointers.delete(event.pointerId);

    if (event.pointerType === 'touch' && !gesture.didPinch && gesture.pointers.size === 0) {
      const now = performance.now();
      if (now - gesture.lastTapAt < 280) {
        toggleImageZoom();
        gesture.lastTapAt = 0;
      } else {
        gesture.lastTapAt = now;
      }
    }

    if (gesture.pointers.size < 2) {
      gesture.initialDistance = 0;
      gesture.didPinch = false;
    }
  }

  return (
    <div
      ref={overlayRef}
      className={cx(
        'fixed inset-0 z-50 flex justify-center px-6 max-md:px-0',
        isContact && 'portfolio-contact-overlay',
        isContact && isClosing && 'is-closing',
        isImage
          ? 'items-start bg-[rgba(9,11,16,0.74)] pt-[102px] pb-10 max-md:items-stretch max-md:bg-[#0B0C10] max-md:py-0'
          : 'items-center bg-[rgba(17,15,11,0.68)] py-10 max-md:items-end max-md:bg-[rgba(18,19,26,0.62)] max-md:py-0',
      )}
    >
      <button type="button" aria-label="Закрыть" tabIndex={-1} className="absolute inset-0 cursor-default" onClick={requestClose} />
      {isContact ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="portfolio-contact-modal-title"
          className={cx(
            'relative z-10 flex w-[min(560px,calc(100vw-48px))] flex-col gap-[18px] rounded-[32px] border border-[#E6EAF3] bg-white p-6',
            'portfolio-contact-mobile-sheet max-md:w-full max-md:gap-0 max-md:rounded-b-none max-md:rounded-t-[24px] max-md:border-y-0 max-md:border-l-0 max-md:border-r max-md:border-[#EBEDF2] max-md:p-0 max-md:pb-[calc(34px+env(safe-area-inset-bottom))] max-md:shadow-[4px_0px_24px_rgba(0,0,0,0.1)]',
          )}
        >
          <div className="hidden h-5 w-full items-center justify-center pt-2 max-md:flex" aria-hidden="true">
            <span className="h-1 w-9 rounded-sm bg-[#D9D9D9]" />
          </div>
          <div className="flex w-full items-start gap-3 max-md:gap-6 max-md:px-4 max-md:pb-4 max-md:pt-3">
            <div className="order-2 w-[448px] min-w-0 max-md:order-none max-md:flex-1">
              <div id="portfolio-contact-modal-title" className="text-[22px] font-bold leading-[1.2] text-[#1F2129] max-md:text-[16px] max-md:leading-[normal]">
                {modal.title}
              </div>
            </div>
            <button
              type="button"
              onClick={requestClose}
              className={cx(
                'order-3 flex size-[52px] shrink-0 cursor-pointer items-center justify-center rounded-[34px] border text-[#202129] transition-colors duration-150 max-md:order-[-1] max-md:size-11 max-md:p-[14px]',
                portfolioSoftSurfaceBorder,
                portfolioFocusRing,
              )}
              aria-label="Закрыть"
            >
              <X className="size-6" strokeWidth={1.8} />
            </button>
          </div>

          <div className="flex flex-col gap-3 max-md:px-4">
            {modal.options.map((option: ContactOption) => (
              <ContactOptionRow key={option.id} option={option} />
            ))}
          </div>
        </div>
      ) : isImage ? (
        <>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Просмотр изображения: ${modal.title}`}
            className="relative z-10 hidden max-w-[calc(100vw-48px)] items-start gap-4 md:flex"
          >
            <div className="flex w-[min(1280px,calc(100vw-188px))] shrink-0 flex-col gap-2">
              <div className="h-[min(790px,calc(100dvh-172px))] w-full overflow-hidden rounded-[24px] bg-[#D1D7E3] shadow-[0px_24px_60px_rgba(0,0,0,0.16)]">
                <div
                  className={cx('relative h-full w-full', !reduceMotion && 'transition-transform duration-200 ease-out')}
                  style={{ transform: `scale(${imageScale})` }}
                >
                  {modal.imageUrl ? (
                    <Image
                      src={modal.imageUrl}
                      alt={modal.title}
                      fill
                      sizes="min(1280px, calc(100vw - 188px))"
                      className="block object-contain"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[14px] font-medium leading-5 text-[#8F95A7]">
                      Artifact preview
                    </div>
                  )}
                </div>
              </div>
              <p className="truncate px-1 text-[13px] font-medium leading-5 text-white/85">{modal.title}</p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-3">
              <button
                type="button"
                onClick={requestClose}
                className={cx(
                  'flex size-[52px] shrink-0 cursor-pointer items-center justify-center rounded-[34px] border shadow-[0px_10px_14px_rgba(0,0,0,0.14)] transition-colors duration-150',
                  portfolioSoftSurfaceBorder,
                  portfolioFocusRing,
                )}
                aria-label="Закрыть"
              >
                <X className="size-6 text-[#202129]" strokeWidth={1.8} />
              </button>
              <div className="flex flex-col items-center gap-1 rounded-full border border-white/20 bg-[#171920]/85 p-1 text-white shadow-lg">
                <button type="button" onClick={() => zoomImage('in')} disabled={imageScale >= MOBILE_IMAGE_MAX_SCALE} className={cx('flex size-11 items-center justify-center rounded-full hover:bg-white/10 disabled:text-white/30', portfolioFocusRing)} aria-label="Увеличить изображение">
                  <Plus className="size-5" strokeWidth={1.8} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => setImageScale(1)} className={cx('flex size-11 items-center justify-center rounded-full hover:bg-white/10', portfolioFocusRing)} aria-label="Вписать изображение целиком" aria-pressed={imageScale === 1}>
                  <Scan className="size-5" strokeWidth={1.8} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => zoomImage('out')} disabled={imageScale <= 1} className={cx('flex size-11 items-center justify-center rounded-full hover:bg-white/10 disabled:text-white/30', portfolioFocusRing)} aria-label="Уменьшить изображение">
                  <Minus className="size-5" strokeWidth={1.8} aria-hidden="true" />
                </button>
              </div>
              <span className="rounded-full bg-[#171920]/85 px-2.5 py-1 text-[12px] font-medium text-white" aria-live="polite">{Math.round(imageScale * 100)}%</span>
            </div>
          </div>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Просмотр изображения: ${modal.title}`}
            className="relative z-10 flex min-h-0 w-full flex-col bg-[#0B0C10] pb-[max(8px,env(safe-area-inset-bottom))] pt-[max(34px,env(safe-area-inset-top))] md:hidden"
          >
            <div className="flex h-12 shrink-0 items-center px-4">
              <button
                type="button"
                onClick={requestClose}
                className={cx(
                  'flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#EBEDF2] bg-white text-[#202129]',
                  portfolioFocusRing,
                )}
                aria-label="Закрыть"
              >
                <X className="size-6" strokeWidth={1.8} />
              </button>
            </div>
            <div
              className="portfolio-mobile-image-lightbox flex min-h-0 flex-1 touch-none items-center justify-center overflow-hidden"
              onPointerDown={handleMobileImagePointerDown}
              onPointerMove={handleMobileImagePointerMove}
              onPointerUp={handleMobileImagePointerUp}
              onPointerCancel={handleMobileImagePointerUp}
              onDoubleClick={toggleImageZoom}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  toggleImageZoom();
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Изображение: ${modal.title}. Дважды коснитесь, чтобы изменить масштаб.`}
            >
              <div
                className={cx(
                  'portfolio-mobile-image-canvas relative aspect-[343/250] w-[calc(100vw-32px)] shrink-0 overflow-hidden rounded-[8px] border border-white/10',
                  !reduceMotion && 'transition-transform duration-200 ease-out',
                )}
                style={{ transform: `scale(${imageScale})` }}
              >
                {modal.imageUrl ? (
                  <Image
                    src={modal.imageUrl}
                    alt={modal.title}
                    fill
                    sizes="calc(100vw - 32px)"
                    draggable={false}
                    className="pointer-events-none object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[14px] font-medium leading-5 text-[#8F95A7]">
                    Artifact preview
                  </div>
                )}
              </div>
            </div>
            <div className="shrink-0 border-t border-white/10 bg-[#0B0C10] px-4 pb-2 pt-3 text-white">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium leading-[18px]">{modal.title}</p>
                  <p className="mt-0.5 truncate text-[11px] leading-4 text-white/55">
                    Разведите пальцы или используйте кнопки масштаба
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
                  <button
                    type="button"
                    onClick={() => zoomImage('out')}
                    disabled={imageScale <= 1}
                    className={cx(
                      'flex size-11 items-center justify-center rounded-full text-white transition-colors',
                      'hover:bg-white/10 disabled:cursor-default disabled:text-white/25',
                      portfolioFocusRing,
                    )}
                    aria-label="Уменьшить изображение"
                  >
                    <Minus className="size-5" strokeWidth={1.8} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageScale(1)}
                    className={cx(
                      'flex size-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10',
                      portfolioFocusRing,
                    )}
                    aria-label="Вписать изображение целиком"
                    aria-pressed={imageScale === 1}
                  >
                    <Scan className="size-5" strokeWidth={1.8} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => zoomImage('in')}
                    disabled={imageScale >= MOBILE_IMAGE_MAX_SCALE}
                    className={cx(
                      'flex size-11 items-center justify-center rounded-full text-white transition-colors',
                      'hover:bg-white/10 disabled:cursor-default disabled:text-white/25',
                      portfolioFocusRing,
                    )}
                    aria-label="Увеличить изображение"
                  >
                    <Plus className="size-5" strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className="sr-only" aria-live="polite">Масштаб {Math.round(imageScale * 100)}%</p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
