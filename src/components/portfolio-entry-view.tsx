'use client';

import type { RefObject } from 'react';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import type { RailItem, PromptChip } from '@/lib/portfolio/types';
import { PortfolioButton } from './portfolio-button';
import { PortfolioComposer } from './portfolio-composer';
import { PortfolioMetadataChip } from './portfolio-metadata-chip';
import { COMPOSER_DOCK_SPRING, STAGE_FADE, WORKSPACE_EASE } from './portfolio-motion';
import { PortfolioProjectPromptCard } from './portfolio-project-prompt-card';
import { PortfolioPromptChip } from './portfolio-prompt-chip';

type EntryProjectCard = {
  id: string;
  title: string;
  imageSrc: string;
};

const entryProjectCards: EntryProjectCard[] = [
  {
    id: 'alfa-smart',
    title: 'Альфа-смарт подписка на банковские продукты',
    imageSrc: '/entry/card-alfa-smart.png',
  },
  {
    id: 'expenses-card-holders',
    title: 'Добавление функционала в истории операции',
    imageSrc: '/entry/card-expenses-history.png',
  },
  {
    id: 'subscription-sharing',
    title: 'Улучшение пути пользователя при добавлении участников',
    imageSrc: '/entry/card-subscription-sharing.png',
  },
  {
    id: 'ux-ui-wannabelike',
    title: 'Прохождение курса Миши Розова по прокачке UI',
    imageSrc: '/entry/card-wannabelike.png',
  },
  {
    id: 'chatpoint',
    title: 'Платформа для коммуникации ChatPoint',
    imageSrc: '/entry/card-chatpoint.png',
  },
];

const metadataChips = [
  { id: 'experience', label: '6 лет опыта', iconSrc: '/entry/icon-experience.svg' },
  { id: 'domain', label: 'B2B / B2C', iconSrc: '/entry/icon-domain.svg' },
  { id: 'platform', label: 'Mobile & Web', iconSrc: '/entry/icon-platform.svg' },
  { id: 'ai', label: 'AI products', iconSrc: '/entry/icon-ai.svg' },
];

export function PortfolioEntryView({
  railItems,
  onRailClick,
  input,
  onChangeInput,
  onSubmit,
  loading,
  textareaRef,
  chips,
  onChipClick,
  composerLayoutId,
}: {
  railItems: RailItem[];
  onRailClick: (item: RailItem) => void;
  input: string;
  onChangeInput: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  chips: PromptChip[];
  onChipClick: (chip: PromptChip) => void;
  composerLayoutId: string;
}) {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  function scrollProjects(direction: 'left' | 'right') {
    const container = carouselRef.current;
    if (!container) {
      return;
    }

    const offset = direction === 'left' ? -344 : 344;
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
      <div className="mx-auto flex h-full w-full max-w-[1548px] flex-1 flex-col items-center overflow-y-auto px-[32px] pb-[46px] pt-[34px]">
        <motion.section
          layout
          className="flex flex-col items-center gap-5"
          exit={{ y: -28, opacity: 0 }}
          transition={{ duration: 0.48, ease: WORKSPACE_EASE }}
        >
          <h1 className="text-center text-[78px] font-semibold leading-[84px] tracking-[-0.03em] text-[#11131a]">
            Макаревич Андрей
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
          className="mt-[64px] w-full max-w-[1584px]"
          exit={{ y: -22, opacity: 0 }}
          transition={{ duration: 0.44, ease: WORKSPACE_EASE }}
        >
          <div className="flex items-center">
            <h2 className="text-[24px] font-semibold leading-[30px] text-[#171920]">Про какой кейс мне рассказать?</h2>
            <div className="min-w-px flex-1" />
            <div className="flex items-center gap-[10px]">
              <PortfolioButton
                tone="secondary"
                size="icon-sm"
                onClick={() => scrollProjects('left')}
                aria-label="Прокрутить проекты влево"
                icon={
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="/entry/icon-chevron-left.svg" alt="" className="size-4" />
                }
              />
              <PortfolioButton
                tone="secondary"
                size="icon-sm"
                onClick={() => scrollProjects('right')}
                aria-label="Прокрутить проекты вправо"
                icon={
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="/entry/icon-chevron-right.svg" alt="" className="size-4" />
                }
              />
            </div>
          </div>

          <div
            ref={carouselRef}
            className="no-scrollbar mt-[18px] overflow-x-auto overflow-y-hidden"
          >
            <div className="flex w-max gap-6 pb-4">
              {caseRailItems.map(({ item, card }) => {
                return (
                  <PortfolioProjectPromptCard
                    key={item.id}
                    title={card.title}
                    imageSrc={card.imageSrc}
                    onClick={() => onRailClick(item)}
                  />
                );
              })}
            </div>
          </div>
        </motion.section>

        <motion.section
          layout
          className="mt-[52px] flex w-full max-w-[980px] flex-col items-center gap-6"
          transition={COMPOSER_DOCK_SPRING}
        >
          <motion.div
            layoutId={composerLayoutId}
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
              variant="landing"
            />
          </motion.div>
          <motion.div
            className="flex flex-wrap items-center justify-center gap-[18px]"
            exit={{ y: 108, opacity: 0 }}
            transition={{ duration: 0.46, ease: WORKSPACE_EASE }}
          >
            {chips.map((chip) => (
              <PortfolioPromptChip key={chip.id} chip={chip} onClick={onChipClick} emphasis />
            ))}
          </motion.div>
        </motion.section>
      </div>
    </motion.div>
  );
}
