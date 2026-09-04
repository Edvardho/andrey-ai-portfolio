'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import type { CompactProjectNavItem } from '@/data/portfolio-compact-navigation';
import { portfolioFocusRing } from './portfolio-interaction-styles';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const DRAWER_BACKDROP_DURATION = 0.28;
const DRAWER_SLIDE_DURATION = 0.4;
const DRAWER_EASING = [0.22, 1, 0.36, 1] as const;

export function PortfolioCompactProjectsDrawer({
  activeProjectId,
  items,
  onClose,
  onContactClick,
  onHomeClick,
  onSelect,
}: {
  activeProjectId: string | null;
  items: CompactProjectNavItem[];
  onClose: () => void;
  onContactClick: () => void;
  onHomeClick: () => void;
  onSelect: (item: CompactProjectNavItem) => void;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
      );
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
    }

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div className="portfolio-compact-drawer-layer fixed inset-0 z-40">
      <motion.button
        type="button"
        aria-label="Закрыть список проектов"
        className="portfolio-compact-drawer-backdrop absolute inset-0 cursor-default bg-[rgba(23,25,32,0.56)]"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : DRAWER_BACKDROP_DURATION, ease: 'easeOut' }}
      />
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Мои проекты"
        className="portfolio-compact-drawer relative grid h-full w-[calc(100vw-52px)] max-w-[360px] grid-rows-[76px_minmax(0,1fr)_auto] overflow-hidden rounded-r-[32px] border-r border-[#EBEDF2] bg-white shadow-[4px_0_24px_rgba(0,0,0,0.1)]"
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ duration: reduceMotion ? 0 : DRAWER_SLIDE_DURATION, ease: DRAWER_EASING }}
      >
        <div className="flex items-center border-b border-[#EBEDF2] px-4">
          <button
            type="button"
            onClick={onHomeClick}
            className={`flex min-h-11 min-w-0 flex-1 items-center gap-2 py-2 pr-3 text-left text-[14px] font-medium leading-5 text-[#5E606A] ${portfolioFocusRing}`}
          >
            <ArrowLeft className="size-4 shrink-0" strokeWidth={1.8} />
            На главную
          </button>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className={`flex size-11 items-center justify-center rounded-full border border-[#EBEDF2] bg-white text-[#202129] ${portfolioFocusRing}`}
          >
            <X className="size-6" strokeWidth={1.8} />
          </button>
        </div>

        <div className="no-scrollbar min-h-0 overflow-y-auto px-4 pb-6 pt-4">
          <div className="space-y-3">
            {items.map((item) => {
              const active = item.id === activeProjectId;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => onSelect(item)}
                  className={[
                    'flex min-h-[80px] w-full items-center gap-3 rounded-[18px] border p-3 text-left transition-colors duration-150',
                    active
                      ? 'border-transparent bg-[#EFF1FB]'
                      : 'border-[#EBEDF2] bg-white hover:bg-[#FAFBFF]',
                    portfolioFocusRing,
                  ].join(' ')}
                >
                  <span className={`relative size-14 shrink-0 overflow-hidden rounded-2xl border ${active ? 'border-[#D1D7E3]' : 'border-[#EBEDF2]'} bg-[#D1D7E3]`}>
                    <Image
                      src={item.thumbnailSrc}
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes="56px"
                      className={item.kind === 'experience' ? 'object-cover object-[50%_18%]' : 'object-contain'}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium leading-[18px] text-[#202129]">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-[13px] leading-[18px] text-[#5E606A]">
                      {item.subtitle}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 border-t border-[#EBEDF2] bg-white px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">
          <a
            href="/cv/andrey-makarevich-product-designer.pdf"
            download
            className={`flex h-[50px] shrink-0 items-center rounded-full bg-[#ECECF1] px-[18px] text-[15px] font-medium text-[#202129] transition-colors hover:bg-[#E2E3E9] ${portfolioFocusRing}`}
          >
            Скачать CV
          </a>
          <button
            type="button"
            onClick={onContactClick}
            className={`h-[50px] min-w-0 flex-1 rounded-full bg-[#1A1C22] px-[18px] text-[15px] font-medium text-white transition-colors hover:bg-[#30333D] ${portfolioFocusRing}`}
          >
            Написать мне
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
