import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight, X } from 'lucide-react';
import type { ModalPayload, ContactOption } from '@/lib/portfolio/types';
import { portfolioFocusRing, portfolioSoftSurfaceBorder } from './portfolio-interaction-styles';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const contactOptionIcons: Record<ContactOption['id'], { src: string; bgClass?: string; imageClassName: string }> = {
  telegram: {
    src: '/contact-modal/telegram.png',
    imageClassName: 'absolute inset-0 h-full w-full max-w-none object-cover',
  },
  linkedin: {
    src: '/contact-modal/linkedin.png',
    imageClassName: 'absolute inset-0 h-full w-full max-w-none object-cover',
  },
};

function ContactOptionRow({ option }: { option: ContactOption }) {
  const icon = contactOptionIcons[option.id];

  return (
    <a
      href={option.href}
      target="_blank"
      rel="noreferrer"
      className={cx(
        'flex w-full cursor-pointer items-center gap-[14px] overflow-hidden rounded-[20px] border p-[18px] transition-colors duration-150',
        portfolioSoftSurfaceBorder,
        portfolioFocusRing,
      )}
    >
      <div
        className={cx(
          'relative size-[52px] shrink-0 overflow-hidden rounded-[16px]',
          icon.bgClass,
        )}
      >
        <Image
          src={icon.src}
          alt=""
          width={52}
          height={52}
          sizes="52px"
          aria-hidden="true"
          className={icon.imageClassName}
        />
      </div>
      <div className="min-w-0 flex-1 space-y-1 text-left">
        <div className="text-[18px] font-semibold leading-6 text-[#202129]">{option.label}</div>
        <div className="text-[14px] leading-5 text-[#6E7286]">{option.helper}</div>
      </div>
      <div className="flex size-6 shrink-0 items-center justify-center text-[#11110F]">
        <ArrowRight className="size-[15px]" strokeWidth={2} />
      </div>
    </a>
  );
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
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
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
  }, [onClose]);

  return (
    <div
      className={cx(
        'fixed inset-0 z-50 flex justify-center px-6',
        isImage ? 'items-start bg-[rgba(9,11,16,0.74)] pt-[102px] pb-10' : 'items-center bg-[rgba(17,15,11,0.68)] py-10',
      )}
    >
      <button type="button" aria-label="Закрыть" className="absolute inset-0 cursor-default" onClick={onClose} />
      {isContact ? (
        <div
          className={cx(
            'relative z-10 flex w-[min(560px,calc(100vw-48px))] flex-col gap-[18px] rounded-[32px] border border-[#E6EAF3] bg-white p-6',
          )}
        >
          <div className="flex w-full items-start gap-3">
            <div className="w-[448px] min-w-0">
              <div className="text-[22px] font-bold leading-[1.2] text-[#1F2129]">{modal.title}</div>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className={cx(
                'flex size-[52px] shrink-0 cursor-pointer items-center justify-center rounded-[34px] border text-[#202129] transition-colors duration-150',
                portfolioSoftSurfaceBorder,
                portfolioFocusRing,
              )}
              aria-label="Закрыть"
            >
              <X className="size-6" strokeWidth={1.8} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {modal.options.map((option: ContactOption) => (
              <ContactOptionRow key={option.id} option={option} />
            ))}
          </div>
        </div>
      ) : isImage ? (
        <div className="relative z-10 flex max-w-[calc(100vw-48px)] items-start gap-4">
          <div className="h-[min(820px,calc(100dvh-142px))] w-[min(1280px,calc(100vw-116px))] shrink-0 overflow-hidden rounded-[24px] bg-[#D1D7E3] shadow-[0px_24px_60px_rgba(0,0,0,0.16)]">
            {modal.imageUrl ? (
              <Image
                src={modal.imageUrl}
                alt={modal.title}
                width={1280}
                height={820}
                sizes="min(1280px, calc(100vw - 116px))"
                className="block h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[14px] font-medium leading-5 text-[#8F95A7]">
                Artifact preview
              </div>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className={cx(
              'flex h-[52px] w-[52px] shrink-0 cursor-pointer items-center justify-center rounded-[34px] border shadow-[0px_10px_14px_rgba(0,0,0,0.14)] transition-colors duration-150',
              portfolioSoftSurfaceBorder,
              portfolioFocusRing,
            )}
            aria-label="Закрыть"
          >
            <X className="size-6 text-[#202129]" strokeWidth={1.8} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
