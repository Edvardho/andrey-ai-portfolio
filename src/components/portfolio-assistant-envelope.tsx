'use client';

import type {
  ArtifactOpenTarget,
  AssistantEnvelope,
  AssistantRenderMode,
  PromptChip,
  UIAction,
} from '@/lib/portfolio/types';
import { PortfolioAssistantBulletReply } from './portfolio-assistant-bullet-reply';
import { PortfolioAssistantCaseSummary } from './portfolio-assistant-case-summary';
import { PortfolioAssistantExperienceSummary } from './portfolio-assistant-experience-summary';
import { PortfolioAssistantPlainTextReply } from './portfolio-assistant-plain-text-reply';
import { PortfolioAssistantRefusalReply } from './portfolio-assistant-refusal-reply';
import { PortfolioAssistantSectionedReply } from './portfolio-assistant-sectioned-reply';

export function PortfolioAssistantEnvelopeView({
  envelope,
  expandedDisclosureIds,
  onToggleDisclosure,
  onChipClick,
  onCta,
  onOpenArtifact,
  renderMode = 'instant',
}: {
  envelope: AssistantEnvelope;
  expandedDisclosureIds: string[];
  onToggleDisclosure: (id: string) => void;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction) => void;
  onOpenArtifact: (target: ArtifactOpenTarget) => void;
  renderMode?: AssistantRenderMode;
}) {
  switch (envelope.presentationVariant) {
    case 'case_summary':
      return (
        <PortfolioAssistantCaseSummary
          envelope={envelope}
          expandedDisclosureIds={expandedDisclosureIds}
          onToggleDisclosure={onToggleDisclosure}
          onChipClick={onChipClick}
          onCta={onCta}
          onOpenArtifact={onOpenArtifact}
          renderMode={renderMode}
        />
      );
    case 'experience_summary':
      return (
        <PortfolioAssistantExperienceSummary
          envelope={envelope}
          expandedDisclosureIds={expandedDisclosureIds}
          onToggleDisclosure={onToggleDisclosure}
          onChipClick={onChipClick}
          onCta={onCta}
          onOpenArtifact={onOpenArtifact}
          renderMode={renderMode}
        />
      );
    case 'bullet_reply':
      return (
        <PortfolioAssistantBulletReply
          envelope={envelope}
          onChipClick={onChipClick}
          onCta={onCta}
          onOpenArtifact={onOpenArtifact}
          renderMode={renderMode}
        />
      );
    case 'sectioned_reply':
      return (
        <PortfolioAssistantSectionedReply
          envelope={envelope}
          expandedDisclosureIds={expandedDisclosureIds}
          onToggleDisclosure={onToggleDisclosure}
          onChipClick={onChipClick}
          onCta={onCta}
          onOpenArtifact={onOpenArtifact}
          renderMode={renderMode}
        />
      );
    case 'refusal_reply':
      return (
        <PortfolioAssistantRefusalReply
          envelope={envelope}
          onChipClick={onChipClick}
          onCta={onCta}
        />
      );
    case 'plain_text_reply':
    default:
      return (
        <PortfolioAssistantPlainTextReply
          envelope={envelope}
          onChipClick={onChipClick}
          onCta={onCta}
          renderMode={renderMode}
        />
      );
  }
}
