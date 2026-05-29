import type { AssistantEnvelope } from '@/lib/portfolio/types';
import { getCaseById } from '@/data/portfolio-content';
import { PortfolioPreviewSurface } from './portfolio-preview-surface';
import { PortfolioMetricRow } from './portfolio-metric-row';

function getCasePreview(caseId: string | null) {
  if (!caseId) {
    return null;
  }

  const caseContent = getCaseById(caseId);
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
  envelope,
}: {
  envelope: AssistantEnvelope;
}) {
  const panel = envelope.contextPanel;
  const tagRows = splitTagsIntoRows(panel.tags);
  const contextPreview =
    envelope.selectedContext.kind === 'case'
      ? getCasePreview(envelope.selectedContext.id) ?? {
          title: envelope.selectedContext.label,
          subtitle: 'Подтвержденный кейс из портфолио.',
          imageUrl: undefined,
          badge: 'Case',
        }
      : envelope.selectedContext.kind === 'experience'
        ? {
            title: 'Опыт работы',
            subtitle: 'Компании, домены и траектория роста.',
            imageUrl: undefined,
            badge: 'Career',
          }
        : envelope.selectedContext.kind === 'overview'
          ? {
              title:
                envelope.selectedContext.id === 'mobile-experience'
                  ? 'Мобильный опыт'
                  : 'Дополнительные кейсы',
              subtitle:
                envelope.selectedContext.id === 'mobile-experience'
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

  if (panel.hidden) {
    return null;
  }

  return (
    <aside className="overflow-hidden bg-white">
      {panel.headerLabel ? (
        <div className="text-[15px] font-medium leading-[1.45] text-[#202129]">{panel.headerLabel}</div>
      ) : null}

      {panel.preview ? (
        <div
          className="relative mt-4 h-[240px] w-full shrink-0 overflow-hidden"
          style={{ borderRadius: panel.preview.frameRadius ?? 24 }}
        >
          <div
            className="absolute inset-0"
            style={{
              borderRadius: panel.preview.frameRadius ?? 24,
              backgroundColor: panel.preview.backgroundColor,
              backgroundImage: panel.preview.backgroundImage,
              border: panel.preview.bordered ? '1px solid #EBEDF2' : undefined,
            }}
          />
          {panel.preview.src ? (
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ borderRadius: panel.preview.frameRadius ?? 24 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={panel.preview.src}
                alt={panel.title}
                className={panel.preview.imageClassName ?? 'absolute inset-0 h-full w-full object-cover'}
              />
            </div>
          ) : null}
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
        <div className="text-[18px] font-medium leading-[1.45] text-[#202129]">{panel.title}</div>
        <div className="text-[15px] leading-[1.45] text-[#30313A]">{panel.subtitle}</div>
      </div>

      {panel.tags.length ? (
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

      {panel.metrics?.length ? (
        <div className="mt-4 flex flex-col gap-3">
          <div className="text-[15px] font-medium leading-[1.45] text-[#202129]">
            {panel.metricsTitle ?? 'Ключевые метрики'}
          </div>
          {panel.metrics.map((metric) => (
            <PortfolioMetricRow key={`${metric.value}-${metric.label}`} value={metric.value} label={metric.label} />
          ))}
        </div>
      ) : null}

      {panel.role ? (
        <div className="mt-4 flex flex-col gap-2">
          <div className="text-[16px] font-medium leading-[1.45] text-[#202129]">
            {panel.roleTitle ?? `Моя роль: ${panel.role}`}
          </div>
          {panel.roleDescription ? (
            <div className="text-[13px] leading-[1.45] text-[#8B8D9B]">{panel.roleDescription}</div>
          ) : null}
        </div>
      ) : null}

      {panel.note ? <div className="mt-4 text-[13px] leading-[1.45] text-[#8B8D9B]">{panel.note}</div> : null}
    </aside>
  );
}
