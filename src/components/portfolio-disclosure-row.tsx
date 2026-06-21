'use client';

import { getLoadedCaseById } from '@/data/portfolio-case-loader.client';
import type { ArtifactOpenTarget, DisclosureRow } from '@/lib/portfolio/types';

function getArtifact(caseId: string, artifactId: string) {
  return getLoadedCaseById(caseId)?.artifacts.find((artifact) => artifact.id === artifactId);
}

export function PortfolioDisclosureRow({
  item,
  activeCaseId,
  expanded,
  onToggle,
  onOpenArtifact,
}: {
  item: DisclosureRow;
  activeCaseId: string | null;
  expanded: boolean;
  onToggle: () => void;
  onOpenArtifact: (target: ArtifactOpenTarget) => void;
}) {
  return (
    <div className="rounded-[28px] border border-[#e8e2d8] bg-[#fffdfa] px-6 py-5 shadow-[0_8px_24px_rgba(32,25,18,0.03)]">
      <button type="button" onClick={onToggle} className="flex w-full cursor-pointer items-start justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8EA2FF] focus-visible:ring-offset-2">
        <div className="min-w-0">
          <div className="text-[19px] font-semibold leading-7 text-[#171512]">{item.title}</div>
          <div className="mt-3 text-[16px] leading-7 text-[#625b52]">{item.summary}</div>
        </div>
        <div className={`mt-1 text-[20px] text-[#8f8578] transition ${expanded ? 'rotate-45' : ''}`}>+</div>
      </button>
      {expanded ? (
        <div className="mt-5 space-y-4 border-t border-[#EBEDF2] pt-5 text-[16px] leading-[1.85] text-[#4f4940]">
        {item.details.map((detail) => (
          <p key={detail}>{detail}</p>
        ))}
        {item.artifactIds?.length ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {item.artifactIds.map((artifactId) => {
              const artifact = activeCaseId ? getArtifact(activeCaseId, artifactId) : undefined;
              return (
                <button
                  key={artifactId}
                  type="button"
                  onClick={() => onOpenArtifact({ artifactId, caseId: activeCaseId ?? undefined })}
                  className="cursor-pointer rounded-full border border-[#ded5c9] bg-white px-4 py-2 text-[13px] font-medium text-[#5a5248] transition hover:border-[#cfc3b3] hover:bg-[#fffcf7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8EA2FF] focus-visible:ring-offset-2"
                >
                  {artifact ? `Открыть: ${artifact.title}` : 'Открыть артефакт'}
                </button>
              );
            })}
          </div>
        ) : null}
        </div>
      ) : null}
    </div>
  );
}
