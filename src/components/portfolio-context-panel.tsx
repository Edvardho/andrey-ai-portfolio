import type { AssistantEnvelope, UIAction } from '@/lib/portfolio/types';
import { getCaseById } from '@/data/portfolio-content';
import { PortfolioPreviewSurface } from './portfolio-preview-surface';
import { PortfolioButton } from './portfolio-button';

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

export function PortfolioContextPanel({
  envelope,
  onAction,
}: {
  envelope: AssistantEnvelope;
  onAction: (action: UIAction) => void;
}) {
  const panel = envelope.contextPanel;
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

  return (
    <aside className="rounded-[32px] border border-[#EBEDF2] bg-white p-[18px] shadow-[0_12px_28px_rgba(31,26,20,0.035)]">
      <PortfolioPreviewSurface
        src={contextPreview.imageUrl}
        title={contextPreview.title}
        subtitle={contextPreview.subtitle}
        badge={contextPreview.badge}
        className="aspect-[1.25/1]"
      />

      <div className="mt-[18px]">
        <div className="text-[26px] font-semibold tracking-[-0.03em] text-[#11110f]">{panel.title}</div>
        <div className="mt-2 text-[15px] leading-[1.55] text-[#7c746a]">{panel.subtitle}</div>
      </div>

      {panel.tags.length ? (
        <div className="mt-4 flex flex-wrap gap-[10px]">
          {panel.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#EBEDF2] bg-white px-3 py-1.5 text-[12px] font-medium text-[#665e54]"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {panel.metrics?.length ? (
        <div className="mt-[18px] space-y-3 border-t border-[#EBEDF2] pt-[18px]">
          {panel.metrics.map((metric) => (
            <div key={`${metric.value}-${metric.label}`} className="flex items-start justify-between gap-3">
              <span className="text-[18px] font-semibold text-[#11110f]">{metric.value}</span>
              <span className="text-right text-[14px] leading-[1.55] text-[#726a60]">{metric.label}</span>
            </div>
          ))}
        </div>
      ) : null}

      {panel.role ? (
        <div className="mt-[18px] border-t border-[#EBEDF2] pt-[18px]">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#9a9083]">Роль</div>
          <div className="mt-2 text-[16px] font-semibold text-[#11110f]">{panel.role}</div>
          {panel.roleDescription ? (
            <div className="mt-2 text-[15px] leading-[1.7] text-[#665f56]">{panel.roleDescription}</div>
          ) : null}
        </div>
      ) : null}

      {panel.note ? <div className="mt-[18px] text-[15px] leading-[1.7] text-[#5e564d]">{panel.note}</div> : null}

      {panel.cta ? (
        <PortfolioButton
          className="mt-5 w-full"
          size="lg"
          onClick={() => onAction(panel.cta!.action)}
        >
          {panel.cta.label}
        </PortfolioButton>
      ) : null}
    </aside>
  );
}
