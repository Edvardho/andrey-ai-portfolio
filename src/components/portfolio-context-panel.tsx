'use client';

import clsx from 'clsx';
import type { ContextPanelData, SelectedContext } from '@/lib/portfolio/types';
import { AnimatePresence, motion } from 'framer-motion';
import { getLoadedCaseById } from '@/data/portfolio-case-loader.client';
import { PortfolioPreviewSurface } from './portfolio-preview-surface';
import { PortfolioFadeInImage } from './portfolio-fade-in-image';
import { PortfolioMetricRow } from './portfolio-metric-row';

export const PORTFOLIO_CONTEXT_PANEL_BASE_CLASS =
  'h-full overflow-y-auto overflow-x-hidden bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

function getCasePreview(caseId: string | null) {
  if (!caseId) {
    return null;
  }

  const caseContent = getLoadedCaseById(caseId);
  if (!caseContent) {
    return null;
  }

  const heroArtifact = caseContent.artifacts[0];

  return {
    title: caseContent.title,
    subtitle: caseContent.shortDescription,
    imageUrl: heroArtifact?.imageUrl,
    badge: caseContent.tags[0] ?? caseContent.category,
  };
}

function splitTagsIntoRows(tags: string[]) {
  const rows: string[][] = [];

  for (let index = 0; index < tags.length; index += 2) {
    rows.push(tags.slice(index, index + 2));
  }

  return rows;
}

export function PortfolioContextPanel({
  contextPanel,
  selectedContext,
  paddingMode = 'internal',
}: {
  contextPanel: ContextPanelData;
  selectedContext: SelectedContext;
  paddingMode?: 'internal' | 'none';
}) {
  const tagRows = splitTagsIntoRows(contextPanel.tags);
  const previewKey = contextPanel.preview?.src
    ? `${selectedContext.kind}:${selectedContext.id ?? 'none'}:${contextPanel.preview.src}:${contextPanel.preview.imageClassName ?? 'default'}`
    : `${selectedContext.kind}:${selectedContext.id ?? 'none'}:fallback`;
  const contextPreview =
    selectedContext.kind === 'case'
      ? getCasePreview(selectedContext.id) ?? {
          title: selectedContext.label,
          subtitle: 'Подтвержденный кейс из портфолио.',
          imageUrl: undefined,
          badge: 'Case',
        }
      : selectedContext.kind === 'experience'
        ? {
            title: 'Опыт работы',
            subtitle: 'Компании, домены и траектория роста.',
            imageUrl: undefined,
            badge: 'Career',
          }
        : selectedContext.kind === 'overview'
          ? {
              title:
                selectedContext.id === 'mobile-experience'
                  ? 'Мобильный опыт'
                  : 'Дополнительные кейсы',
              subtitle:
                selectedContext.id === 'mobile-experience'
                  ? 'Ширина mobile signal за пределами флагмана.'
                  : 'Не остатки, а breadth с нормальным сигналом.',
              imageUrl: undefined,
              badge: 'Overview',
            }
          : {
              title: 'Стартовая точка',
              subtitle: 'Опыт, кейсы, доказательства и выход на связь.',
              imageUrl: undefined,
              badge: 'Desktop',
            };

  if (contextPanel.hidden) {
    return null;
  }

  return (
    <aside
      className={clsx(
        PORTFOLIO_CONTEXT_PANEL_BASE_CLASS,
        paddingMode === 'internal' && 'px-6 pt-6 pb-6',
      )}
    >
      {contextPanel.headerLabel ? (
        <div className="text-[15px] font-medium leading-[1.45] text-[#202129]">{contextPanel.headerLabel}</div>
      ) : null}

      {contextPanel.preview ? (
        <div
          className="relative mt-4 h-[240px] w-full shrink-0 overflow-hidden"
          style={{ borderRadius: contextPanel.preview.frameRadius ?? 24 }}
        >
          <div
            className="absolute inset-0"
            style={{
              borderRadius: contextPanel.preview.frameRadius ?? 24,
              backgroundColor: contextPanel.preview.backgroundColor,
              backgroundImage: contextPanel.preview.backgroundImage,
              border: contextPanel.preview.bordered ? '1px solid #EBEDF2' : undefined,
            }}
          />
          <AnimatePresence initial={false} mode="wait">
            {contextPanel.preview.src ? (
              <motion.div
                key={previewKey}
                className="absolute inset-0 overflow-hidden"
                style={{ borderRadius: contextPanel.preview.frameRadius ?? 24 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}
              >
                <PortfolioFadeInImage
                  src={contextPanel.preview.src}
                  alt={contextPanel.title}
                  width={560}
                  height={480}
                  sizes="280px"
                  priority={selectedContext.kind === 'case'}
                  decoding="async"
                  draggable={false}
                  className={
                    contextPanel.preview.imageClassName ?? 'absolute inset-0 h-full w-full object-cover'
                  }
                  overlayClassName="bg-white/20"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : (
        <PortfolioPreviewSurface
          src={contextPreview.imageUrl}
          title={contextPreview.title}
          subtitle={contextPreview.subtitle}
          badge={contextPreview.badge}
          className="mt-4 aspect-[1.25/1]"
        />
      )}

      <div className="mt-4 flex flex-col gap-2">
        <div className="text-[18px] font-medium leading-[1.45] text-[#202129]">{contextPanel.title}</div>
        <div className="text-[15px] leading-[1.45] text-[#30313A]">{contextPanel.subtitle}</div>
      </div>

      {contextPanel.tags.length ? (
        <div className="mt-4 flex flex-col gap-2">
          {tagRows.map((row, rowIndex) => (
            <div key={`${row.join('-')}-${rowIndex}`} className="flex flex-wrap gap-2">
              {row.map((tag) => (
                <span
                  key={tag}
                  className="rounded-[14px] bg-[#F2F4FF] px-3 py-[7px] text-[12px] font-medium leading-[1.45] text-[#50525A]"
                >
                  {tag}
                </span>
              ))}
            </div>
          ))}
        </div>
      ) : null}

      {contextPanel.metrics?.length ? (
        <div className="mt-4 flex flex-col gap-3">
          <div className="text-[15px] font-medium leading-[1.45] text-[#202129]">
            {contextPanel.metricsTitle ?? 'Ключевые метрики'}
          </div>
          {contextPanel.metrics.map((metric) => (
            <PortfolioMetricRow key={`${metric.value}-${metric.label}`} value={metric.value} label={metric.label} />
          ))}
        </div>
      ) : null}

      {contextPanel.role ? (
        <div className="mt-4 flex flex-col gap-2">
          <div className="text-[16px] font-medium leading-[1.45] text-[#202129]">
            {contextPanel.roleTitle ?? `Моя роль: ${contextPanel.role}`}
          </div>
          {contextPanel.roleDescription ? (
            <div className="text-[13px] leading-[1.45] text-[#8B8D9B]">{contextPanel.roleDescription}</div>
          ) : null}
        </div>
      ) : null}

      {contextPanel.note ? (
        <div className="mt-4 text-[13px] leading-[1.45] text-[#8B8D9B]">{contextPanel.note}</div>
      ) : null}
    </aside>
  );
}
