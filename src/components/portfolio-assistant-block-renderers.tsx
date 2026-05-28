'use client';

import type { ReactNode } from 'react';

import type { ContentBlock, PromptChip, UIAction } from '@/lib/portfolio/types';
import { PortfolioPromptChip } from './portfolio-prompt-chip';
import { PortfolioGallery } from './portfolio-gallery';
import { PortfolioDisclosureRow } from './portfolio-disclosure-row';
import { PortfolioButton } from './portfolio-button';

type SharedRenderProps = {
  activeCaseId: string | null;
  expandedDisclosureIds: string[];
  onToggleDisclosure: (id: string) => void;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction) => void;
  onOpenArtifact: (artifactId: string) => void;
};

export function renderCanonicalSummaryBlock(
  block: ContentBlock,
  index: number,
  props: SharedRenderProps,
): ReactNode {
  switch (block.type) {
    case 'lead':
      return (
        <section key={`${block.type}-${index}`} className="space-y-5">
          <h3 className="text-[34px] font-semibold leading-[1.12] tracking-[-0.03em] text-[#11110f] lg:text-[56px]">
            {block.title}
          </h3>
          <div className="space-y-4 text-[18px] leading-[1.9] text-[#4e4740]">
            {block.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      );
    case 'section':
      return (
        <section key={`${block.type}-${index}`} className="space-y-4">
          <h3 className="text-[24px] font-semibold leading-[1.25] text-[#11110f] lg:text-[34px]">{block.title}</h3>
          <div className="space-y-4 text-[17px] leading-[1.9] text-[#4e4740]">
            {block.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      );
    case 'metrics':
      return (
        <section key={`${block.type}-${index}`} className="space-y-4">
          {block.title ? <h3 className="text-[24px] font-semibold leading-[1.25] text-[#11110f]">{block.title}</h3> : null}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {block.items.map((metric) => (
              <div
                key={`${metric.value}-${metric.label}`}
                className="rounded-[26px] border border-[#EBEDF2] bg-[#fcfaf6] p-5"
              >
                <div className="text-[28px] font-semibold tracking-[-0.02em] text-[#11110f]">{metric.value}</div>
                <div className="mt-2 text-[15px] leading-6 text-[#6b645a]">{metric.label}</div>
              </div>
            ))}
          </div>
        </section>
      );
    case 'disclosures':
      return (
        <section key={`${block.type}-${index}`} className="space-y-4">
          {block.title ? <h3 className="text-[24px] font-semibold leading-[1.25] text-[#11110f]">{block.title}</h3> : null}
          <div className="space-y-4">
            {block.items.map((item) => (
              <PortfolioDisclosureRow
                key={item.id}
                item={item}
                activeCaseId={props.activeCaseId}
                onOpenArtifact={props.onOpenArtifact}
                expanded={props.expandedDisclosureIds.includes(item.id)}
                onToggle={() => props.onToggleDisclosure(item.id)}
              />
            ))}
          </div>
        </section>
      );
    case 'gallery':
      return (
        <section key={`${block.type}-${index}`} className="space-y-4">
          {block.title ? <h3 className="text-[24px] font-semibold leading-[1.25] text-[#11110f]">{block.title}</h3> : null}
          <PortfolioGallery items={block.items} caseId={props.activeCaseId} onOpenArtifact={props.onOpenArtifact} />
        </section>
      );
    case 'chips':
      return (
        <section key={`${block.type}-${index}`} className="space-y-4">
          {block.title ? <h3 className="text-[24px] font-semibold leading-[1.25] text-[#11110f]">{block.title}</h3> : null}
          <div className="flex flex-wrap gap-3">
            {block.items.map((chip) => (
              <PortfolioPromptChip key={chip.id} chip={chip} onClick={props.onChipClick} emphasis />
            ))}
          </div>
        </section>
      );
    case 'cta':
      return (
        <section key={`${block.type}-${index}`}>
          <PortfolioButton onClick={() => props.onCta(block.action)}>{block.label}</PortfolioButton>
        </section>
      );
    case 'bullet_list':
      return (
        <section key={`${block.type}-${index}`} className="space-y-4">
          {block.title ? <h3 className="text-[24px] font-semibold leading-[1.25] text-[#11110f]">{block.title}</h3> : null}
          <ul className="space-y-3 text-[17px] leading-[1.85] text-[#4e4740]">
            {block.items.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-[#2d2923]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      );
    default:
      return null;
  }
}

export function renderConversationalBlock(
  block: ContentBlock,
  index: number,
  props: SharedRenderProps,
): ReactNode {
  switch (block.type) {
    case 'lead':
      return (
        <section key={`${block.type}-${index}`} className="space-y-4">
          <h3 className="text-[24px] font-semibold leading-[1.25] text-[#11110f]">{block.title}</h3>
          <div className="space-y-4 text-[17px] leading-[1.85] text-[#4e4740]">
            {block.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      );
    case 'section':
      return (
        <section key={`${block.type}-${index}`} className="space-y-3">
          <h3 className="text-[22px] font-semibold leading-[1.3] text-[#11110f]">{block.title}</h3>
          <div className="space-y-3 text-[16px] leading-[1.8] text-[#4e4740]">
            {block.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      );
    case 'bullet_list':
      return (
        <section key={`${block.type}-${index}`} className="space-y-3">
          {block.title ? <h3 className="text-[22px] font-semibold leading-[1.3] text-[#11110f]">{block.title}</h3> : null}
          <ul className="space-y-3 text-[16px] leading-[1.8] text-[#4e4740]">
            {block.items.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-[#2d2923]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      );
    case 'metrics':
    case 'disclosures':
    case 'gallery':
    case 'chips':
    case 'cta':
      return renderCanonicalSummaryBlock(block, index, props);
    default:
      return null;
  }
}
