'use client';

import type { AssistantRenderMode, ArtifactOpenTarget, ContentBlock } from '@/lib/portfolio/types';
import { getParagraphRevealStartDelayMs } from '@/lib/portfolio/response-animation-policy';

import { PortfolioProgressiveText } from './portfolio-progressive-text';
import { PortfolioCaseCollection } from './portfolio-case-collection';

type EvidenceCaseBlock = Extract<ContentBlock, { type: 'evidence_case' }>;

export function PortfolioAssistantEvidenceCaseBlock({
  block,
  onOpenArtifact,
  renderMode = 'instant',
}: {
  block: EvidenceCaseBlock;
  onOpenArtifact: (target: ArtifactOpenTarget) => void;
  renderMode?: AssistantRenderMode;
}) {
  const textRenderMode = renderMode === 'progressive_text' ? 'progressive_text' : 'instant';

  return (
    <section className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-[22px] font-semibold leading-[1.3] text-[#11110f]">{block.title}</h3>
        <div className="space-y-3 text-[16px] leading-[1.8] text-[#4e4740]">
          {block.body.map((paragraph, paragraphIndex) => (
            <p key={paragraph}>
              <PortfolioProgressiveText
                text={paragraph}
                renderMode={textRenderMode}
                startDelayMs={getParagraphRevealStartDelayMs(paragraphIndex)}
              />
            </p>
          ))}
        </div>
      </div>

      <PortfolioCaseCollection
        items={block.case.items}
        layoutType={block.case.layoutType}
        rowWidth={block.case.rowWidth}
        peekWidth={block.case.peekWidth}
        caseId={block.case.caseId}
        onOpenArtifact={onOpenArtifact}
      />
    </section>
  );
}
