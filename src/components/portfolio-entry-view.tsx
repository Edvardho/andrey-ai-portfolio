'use client';

import type { RefObject } from 'react';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import type { RailItem } from '@/lib/portfolio/types';
import { PortfolioAssistantIdentityHeader } from './portfolio-assistant-identity-header';
import { PortfolioComposer } from './portfolio-composer';
import { portfolioFocusRing } from './portfolio-interaction-styles';
import { PortfolioMetadataChip } from './portfolio-metadata-chip';
import { COMPOSER_DOCK_SPRING, STAGE_FADE, WORKSPACE_EASE } from './portfolio-motion';
import type { EntryProjectPromptPreview } from './portfolio-project-prompt-card';
import { PortfolioProjectPromptCard } from './portfolio-project-prompt-card';

type EntryProjectCard = {
  id: string;
  title: string;
};

const entryProjectPreviewMap: Record<string, EntryProjectPromptPreview> = {
  'alfa-smart': {
    src: '/cases/alfa-smart/entry.png',
    imageClassName: 'absolute h-[197.58%] w-[81.05%] max-w-none left-[9.47%] top-[-1.37%]',
    fillClassName: 'bg-[#D1D7E3]',
  },
  'expenses-card-holders': {
    src: '/cases/expenses-card-holders/entry.png',
    imageClassName: 'absolute h-[211.44%] w-[84.11%] max-w-none left-[7.94%] top-0',
    fillStyle: {
      backgroundImage: 'linear-gradient(140.182deg, rgb(157, 180, 225) 0%, rgb(227, 210, 209) 96.702%)',
    },
  },
  'subscription-sharing': {
    src: '/cases/subscription-sharing/entry.png',
    imageClassName: 'absolute h-[220.02%] w-[83.23%] max-w-none left-[8.39%] top-[-3.62%]',
    fillStyle: {
      backgroundImage: 'linear-gradient(140.182deg, rgb(227, 210, 209) 0%, rgb(194, 215, 202) 96.702%)',
    },
  },
  'ux-ui-wannabelike': {
    src: '/cases/ux-ui-wannabelike/entry.png',
    imageClassName: 'absolute h-[241.99%] w-full max-w-none left-0 top-[-5.21%]',
    fillStyle: {
      backgroundImage: 'linear-gradient(140.182deg, rgb(211, 227, 209) 0%, rgb(32, 40, 56) 96.702%)',
    },
  },
  chatpoint: {
    src: '/cases/chatpoint/entry.png',
    imageClassName: 'absolute h-[141.99%] w-[180.69%] max-w-none left-[-18.76%] top-[8.07%]',
    fillClassName: 'bg-[#D1D7E3]',
  },
  siebel: {
    src: '/cases/siebel/entry.png',
    imageClassName: 'absolute h-[134.55%] w-[167.23%] max-w-none left-[-53.98%] top-[3.9%]',
    fillStyle: {
      backgroundImage: 'linear-gradient(141.559deg, rgb(255, 205, 205) 35.355%, rgb(255, 246, 212) 106.07%)',
    },
  },
};

const entryProjectCards: EntryProjectCard[] = [
  {
    id: 'alfa-smart',
    title: 'Альфа-смарт подписка на банковские продукты',
  },
  {
    id: 'expenses-card-holders',
    title: 'Добавление функционала в истории операции',
  },
  {
    id: 'subscription-sharing',
    title: 'Улучшение пути пользователя при добавлении участников',
  },
  {
    id: 'ux-ui-wannabelike',
    title: 'Прохождение курса Миши Розова по прокачке UI',
  },
  {
    id: 'chatpoint',
    title: 'Платформа для коммуникации ChatPoint',
  },
  {
    id: 'siebel',
    title: 'CRM для службы поддержки SIEBEL',
  },
];

const metadataChips = [
  { id: 'experience', label: '6 лет опыта', iconSrc: '/entry/icon-experience.svg' },
  { id: 'domain', label: 'B2B / B2C', iconSrc: '/entry/icon-domain.svg' },
  { id: 'platform', label: 'Mobile & Web', iconSrc: '/entry/icon-platform.svg' },
  { id: 'ai', label: 'AI products', iconSrc: '/entry/icon-ai.svg' },
];

const carouselControlClassName = [
  'inline-flex size-[38px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#EBEDF2] bg-white text-[#5F6474] transition-colors duration-150',
  'hover:border-[#D7DBE5] hover:bg-[#FAFBFF]',
  'active:border-[#D7DBE5] active:bg-[#F2F4FF]',
  portfolioFocusRing,
].join(' ');

export function PortfolioEntryView({
  railItems,
  onRailClick,
  input,
  onChangeInput,
  onSubmit,
  loading,
  textareaRef,
}: {
  railItems: RailItem[];
  onRailClick: (item: RailItem) => void;
  input: string;
  onChangeInput: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  function scrollProjects(direction: 'left' | 'right') {
    const container = carouselRef.current;
    if (!container) {
      return;
    }

    const offset = direction === 'left' ? -302 : 302;
    container.scrollBy({ left: offset, behavior: 'smooth' });
  }

  const caseRailItems = entryProjectCards
    .map((card) => ({
      card,
      item: railItems.find((item) => item.id === card.id && item.kind === 'case'),
    }))
    .filter((entry): entry is { card: EntryProjectCard; item: RailItem } => Boolean(entry.item));

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden bg-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={STAGE_FADE}
    >
      <div className="portfolio-desktop-frame mx-auto flex h-full flex-1 flex-col items-center overflow-y-auto pb-[46px] pt-[34px]">
        <motion.section
          layout
          className="flex flex-col items-center gap-5"
          exit={{ y: -28, opacity: 0 }}
          transition={{ duration: 0.48, ease: WORKSPACE_EASE }}
        >
          <h1 className="text-center text-[78px] font-semibold leading-[84px] tracking-[-0.03em] text-[#11131a]">
            Андрей Макаревич
          </h1>
          <p className="text-center text-[30px] leading-[36px] text-[#707795]">Продуктовый дизайнер</p>
          <div className="mt-[2px] flex flex-wrap items-center justify-center gap-[14px]">
            {metadataChips.map((chip) => (
              <PortfolioMetadataChip key={chip.id} iconSrc={chip.iconSrc} label={chip.label} />
            ))}
          </div>
        </motion.section>

        <motion.section
          layout
          className="mt-[62px] flex w-full max-w-[932px] flex-col items-start"
          exit={{ y: -22, opacity: 0 }}
          transition={{ duration: 0.44, ease: WORKSPACE_EASE }}
        >
          <div className="flex w-[680px] flex-col items-start gap-[10px]">
            <PortfolioAssistantIdentityHeader />
            <div className="w-[680px] whitespace-pre-wrap text-[16px] font-normal leading-[1.45] text-[#202129]">
              <p>Если нет времени читать всё портфолио — начните отсюда.</p>
              <p>Коротко разберу: кто Андрей, какой кейс смотреть первым и чем подтверждён его опыт.</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          layout
          className="mt-[30px] flex w-full max-w-[932px] flex-col items-center gap-[10px]"
          transition={COMPOSER_DOCK_SPRING}
        >
          <motion.div
            className="w-full"
            transition={COMPOSER_DOCK_SPRING}
          >
            <PortfolioComposer
              input={input}
              onChangeInput={onChangeInput}
              onSubmit={onSubmit}
              disabled={loading}
              textareaRef={textareaRef}
              placeholder="Спросите про Андрея: опыт, проекты, процессы, продуктовые решения..."
            />
          </motion.div>
          <p className="text-center text-[16px] font-normal leading-[22px] text-[#909090]">
            Отвечаю только по кейсам, артефактам и подтверждённым фактам.
          </p>
        </motion.section>

        <motion.section
          layout
          className="mt-[64px] w-full"
          exit={{ y: -22, opacity: 0 }}
          transition={{ duration: 0.44, ease: WORKSPACE_EASE }}
        >
          <div className="flex items-center">
            <h2 className="text-[24px] font-semibold leading-[30px] text-[#171920]">
              Или откройте конкретный кейс →
            </h2>
            <div className="min-w-px flex-1" />
            <div className="flex items-center gap-[10px]">
              <button
                type="button"
                className={carouselControlClassName}
                onClick={() => scrollProjects('left')}
                aria-label="Прокрутить проекты влево"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/entry/icon-chevron-left.svg" alt="" className="size-4" />
              </button>
              <button
                type="button"
                className={carouselControlClassName}
                onClick={() => scrollProjects('right')}
                aria-label="Прокрутить проекты вправо"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/entry/icon-chevron-right.svg" alt="" className="size-4" />
              </button>
            </div>
          </div>

          <div
            ref={carouselRef}
            className="no-scrollbar mt-[18px] overflow-x-auto overflow-y-hidden"
          >
            <div className="flex w-max gap-6 pb-4">
              {caseRailItems.map(({ item, card }) => {
                const preview = entryProjectPreviewMap[card.id];

                return (
                  <PortfolioProjectPromptCard
                    key={item.id}
                    title={card.title}
                    preview={preview}
                    onClick={() => onRailClick(item)}
                  />
                );
              })}
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
