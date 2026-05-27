import type { GalleryItem } from '@/lib/portfolio/types';
import { getCaseById } from '@/data/portfolio-content';
import { PortfolioPreviewSurface } from './portfolio-preview-surface';

function getArtifact(caseId: string, artifactId: string) {
  return getCaseById(caseId)?.artifacts.find((artifact) => artifact.id === artifactId);
}

export function PortfolioGallery({
  items,
  caseId,
  onOpenArtifact,
}: {
  items: GalleryItem[];
  caseId: string | null;
  onOpenArtifact: (artifactId: string, title: string) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
      {items.map((item) => {
        const artifact = caseId ? getArtifact(caseId, item.artifactId) : undefined;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpenArtifact(item.artifactId, item.title)}
            className="rounded-[28px] border border-[#e8e2d8] bg-white p-4 text-left shadow-[0_10px_28px_rgba(34,28,20,0.04)] transition hover:border-[#d7cdbe] hover:shadow-[0_16px_36px_rgba(34,28,20,0.07)]"
          >
            <PortfolioPreviewSurface
              src={artifact?.imageUrl}
              title={item.title}
              subtitle={artifact?.caption}
              badge={artifact?.sourceLabel ?? 'Artifact'}
              className="aspect-[1.05/1] h-auto w-full"
            />
            <div className="mt-4 text-[17px] font-semibold leading-6 text-[#1b1915]">{item.title}</div>
            <div className="mt-2 text-[15px] leading-7 text-[#6b645a]">{item.description}</div>
          </button>
        );
      })}
    </div>
  );
}
