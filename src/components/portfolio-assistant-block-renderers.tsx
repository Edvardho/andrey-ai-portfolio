'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

import type {
  ArtifactOpenTarget,
  AssistantRenderMode,
  ContentBlock,
  PromptChip,
  UIAction,
} from '@/lib/portfolio/types';
import type { WorkspaceLayoutMode } from '@/lib/portfolio/workspace-layout';
import {
  getListItemRevealTiming,
  getParagraphRevealStartDelayMs,
} from '@/lib/portfolio/response-animation-policy';
import { PortfolioPromptChip } from './portfolio-prompt-chip';
import { PortfolioGallery } from './portfolio-gallery';
import { PortfolioDisclosureRow } from './portfolio-disclosure-row';
import { PortfolioButton } from './portfolio-button';
import { PortfolioProgressiveText } from './portfolio-progressive-text';
import { PortfolioAssistantEvidenceCaseBlock } from './portfolio-assistant-evidence-case-block';

const ASSISTANT_BODY_TEXT_CLASS = 'text-[16px] font-normal leading-6 tracking-[0] text-[#202129]';

type SharedRenderProps = {
  activeCaseId: string | null;
  expandedDisclosureIds: string[];
  onToggleDisclosure: (id: string) => void;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction) => void;
  onOpenArtifact: (target: ArtifactOpenTarget) => void;
  showChips?: boolean;
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
        <section key={`${block.type}-${index}`} className="max-w-[680px] space-y-4">
          <h3 className="text-[24px] font-semibold leading-[1.25] text-[#11110f] lg:text-[34px]">{block.title}</h3>
          <div className={`space-y-4 ${ASSISTANT_BODY_TEXT_CLASS}`}>
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
    case 'evidence_case':
      return (
        <PortfolioAssistantEvidenceCaseBlock
          key={`${block.type}-${index}`}
          block={block}
          onOpenArtifact={props.onOpenArtifact}
        />
      );
    case 'chips':
      if (props.showChips === false) {
        return null;
      }

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
          <ul className={`space-y-3 ${ASSISTANT_BODY_TEXT_CLASS}`}>
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
  options?: {
    renderMode?: AssistantRenderMode;
    layoutMode?: WorkspaceLayoutMode;
  },
): ReactNode {
  const progressive = options?.renderMode === 'progressive_text';
  const compact = options?.layoutMode === 'compact';
  const textRenderMode = progressive ? 'progressive_text' : 'instant';

  switch (block.type) {
    case 'lead':
      return (
        <section key={`${block.type}-${index}`} className={compact ? 'space-y-2' : 'space-y-4'}>
          <h3 className={compact
            ? 'text-[15px] font-semibold leading-[19px] text-[#11110f]'
            : 'text-[24px] font-semibold leading-[1.25] text-[#11110f]'}>{block.title}</h3>
          <div className={compact
            ? 'space-y-2 text-[14px] leading-5 text-[#202129]'
            : `space-y-4 ${ASSISTANT_BODY_TEXT_CLASS}`}>
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
        </section>
      );
    case 'section':
      return (
        <section key={`${block.type}-${index}`} className={compact ? 'space-y-2' : 'max-w-[680px] space-y-3'}>
          <h3 className={compact
            ? 'text-[15px] font-semibold leading-[19px] text-[#11110f]'
            : 'text-[22px] font-semibold leading-[1.3] text-[#11110f]'}>{block.title}</h3>
          <div className={compact
            ? 'space-y-2 text-[14px] leading-5 text-[#202129]'
            : `space-y-3 ${ASSISTANT_BODY_TEXT_CLASS}`}>
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
        </section>
      );
    case 'bullet_list':
      return (
        <section key={`${block.type}-${index}`} className={compact ? 'space-y-2' : 'max-w-[680px] space-y-3'}>
          {block.title ? <h3 className={compact
            ? 'text-[15px] font-semibold leading-[19px] text-[#11110f]'
            : 'text-[22px] font-semibold leading-[1.3] text-[#11110f]'}>{block.title}</h3> : null}
          <ul className={compact
            ? 'space-y-2 text-[14px] leading-5 text-[#202129]'
            : `space-y-3 ${ASSISTANT_BODY_TEXT_CLASS}`}>
            {block.items.map((item, itemIndex) => (
              <motion.li
                key={item}
                className="flex gap-3"
                initial={
                  progressive
                    ? { opacity: 0, y: getListItemRevealTiming(itemIndex).translateY }
                    : false
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: progressive ? getListItemRevealTiming(itemIndex).durationMs / 1000 : 0,
                  delay: progressive ? getListItemRevealTiming(itemIndex).delayMs / 1000 : 0,
                }}
              >
                <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-[#2d2923]" />
                <span>
                  <PortfolioProgressiveText
                    text={item}
                    renderMode={textRenderMode}
                    startDelayMs={getListItemRevealTiming(itemIndex).delayMs}
                  />
                </span>
              </motion.li>
            ))}
          </ul>
        </section>
      );
    case 'metrics':
    case 'disclosures':
    case 'gallery':
    case 'evidence_case':
    case 'chips':
    case 'cta':
      return renderCanonicalSummaryBlock(block, index, props);
    default:
      return null;
  }
}
