'use client';

import type {
  ArtifactOpenTarget,
  AssistantEnvelope,
  AssistantRenderMode,
  PromptChip,
  UIAction,
} from '@/lib/portfolio/types';
import { PortfolioAssistantCaseSummary } from './portfolio-assistant-case-summary';
import { PortfolioAssistantCandidateFastReview } from './portfolio-assistant-candidate-fast-review';
import { PortfolioAssistantExperienceSummary } from './portfolio-assistant-experience-summary';
import { PortfolioAssistantLoadingRow } from './portfolio-assistant-loading-row';
import { PortfolioAssistantSectionedReply } from './portfolio-assistant-sectioned-reply';
import { PortfolioAssistantSynthesisReply } from './portfolio-assistant-synthesis-reply';

export function PortfolioAssistantEnvelopeView({
  envelope,
  expandedDisclosureIds,
  onToggleDisclosure,
  onChipClick,
  onCta,
  onOpenArtifact,
  canRetryError = false,
  onRetryError,
  renderMode = 'instant',
  showChips = true,
}: {
  envelope: AssistantEnvelope;
  expandedDisclosureIds: string[];
  onToggleDisclosure: (id: string) => void;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction) => void;
  onOpenArtifact: (target: ArtifactOpenTarget) => void;
  canRetryError?: boolean;
  onRetryError?: () => void;
  renderMode?: AssistantRenderMode;
  showChips?: boolean;
}) {
  if (envelope.presentationVariant === 'loading_row') {
    return <PortfolioAssistantLoadingRow />;
  }

  if (envelope.presentationVariant === 'candidate_fast_review') {
    return (
      <PortfolioAssistantCandidateFastReview
        expandedDisclosureIds={expandedDisclosureIds}
        onToggleDisclosure={onToggleDisclosure}
        onCta={onCta}
        onOpenArtifact={onOpenArtifact}
        renderMode={renderMode}
      />
    );
  }

  const isStructuredSummary =
    envelope.presentationVariant === 'case_summary' ||
    envelope.presentationVariant === 'experience_summary';
  const isEntitySectionedReply =
    envelope.presentationVariant === 'sectioned_reply' &&
    envelope.selectedContext.kind !== 'none';

  if (!isStructuredSummary && !isEntitySectionedReply) {
    return (
      <PortfolioAssistantSynthesisReply
        envelope={envelope}
        onChipClick={onChipClick}
        onCta={onCta}
        canRetryError={canRetryError}
        onRetryError={onRetryError}
        renderMode={renderMode}
        showChips={showChips}
      />
    );
  }

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
          showChips={showChips}
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
          showChips={showChips}
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
          showChips={showChips}
        />
      );
    case 'refusal_reply':
    default:
      return (
        <PortfolioAssistantSynthesisReply
          envelope={envelope}
          onChipClick={onChipClick}
          onCta={onCta}
          canRetryError={canRetryError}
          onRetryError={onRetryError}
          renderMode={renderMode}
          showChips={showChips}
        />
      );
  }
}
