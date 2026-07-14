export type CaseCategory =
  | 'flagship'
  | 'primary'
  | 'supporting'
  | 'mobile'
  | 'additional';

export type ViewType =
  | 'entry'
  | 'candidate_fast_review'
  | 'case_summary'
  | 'case_detail'
  | 'case_route'
  | 'general_synthesis'
  | 'assistant_intro'
  | 'identity_intro'
  | 'career_summary'
  | 'case_discovery'
  | 'mobile_overview'
  | 'strengths_assessment'
  | 'role_fit_assessment'
  | 'decision_process'
  | 'evidence_request'
  | 'risk_objection'
  | 'experience_summary'
  | 'experience_detail'
  | 'experience_route'
  | 'mobile_experience_overview'
  | 'mobile_case_summary'
  | 'mobile_case_detail'
  | 'additional_cases_overview'
  | 'contact_modal'
  | 'image_modal'
  | 'loading'
  | 'ambiguous_question'
  | 'no_matching_case'
  | 'unsupported_request'
  | 'safety_refusal'
  | 'limit_reached';

export type UIState = 'ready' | 'fallback' | 'modal' | 'limit_reached';

export type SafetyState =
  | 'none'
  | 'toxic_or_abusive'
  | 'prompt_injection_or_exfiltration'
  | 'salary_or_private_data'
  | 'unsupported_request'
  | 'ambiguous_question'
  | 'no_matching_case'
  | 'limit_reached';

export type AnswerMode = 'summary' | 'detail';

export type ResponseSource = 'authored' | 'facts_constrained_synthesis';
export type SessionStoreMode = 'supabase' | 'memory' | 'degraded_memory';

export type AssistantReplyState =
  | 'thinking'
  | 'grounded_answer'
  | 'insufficient_facts'
  | 'safety_refusal'
  | 'clarifying_question'
  | 'navigation_suggestion'
  | 'error_retry'
  | 'authored_reply';

export type PresentationVariant =
  | 'candidate_fast_review'
  | 'case_summary'
  | 'experience_summary'
  | 'plain_text_reply'
  | 'bullet_reply'
  | 'sectioned_reply'
  | 'refusal_reply'
  | 'loading_row';

export type AssistantRenderMode = 'instant' | 'reveal' | 'progressive_text';

export type AnswerType =
  | 'candidate_fast_review'
  | 'candidate_positioning'
  | 'experience_overview'
  | 'portfolio_compression'
  | 'portfolio_value_argument'
  | 'contribution_breakdown'
  | 'case_summary'
  | 'decision_breakdown'
  | 'outcome_summary'
  | 'proof_map'
  | 'hiring_argument'
  | 'failure_postmortem'
  | 'risk_assessment';

export type AnswerPlan = {
  answerType: AnswerType;
  mustStartWith?: string;
  requiredMoves: string[];
  avoid: string[];
  maxParagraphs: number;
  allowSections: boolean;
  allowBullets: boolean;
  targetCaseIds?: string[];
};

export type QueryScope =
  | 'global_person'
  | 'current_case_only'
  | 'named_case'
  | 'portfolio_wide';

// Product meaning: this is the evaluation task behind the question,
// not just the topic. Example: "portfolio" can mean proof, format value,
// navigation, or hiring decision, and those require different answers.
export type QuestionSubject =
  | 'candidate_fast_review'
  | 'candidate_value'
  | 'candidate_motivation'
  | 'interview_decision'
  | 'candidate_portfolio_value'
  | 'ai_format_value'
  | 'assistant_case_navigation'
  | 'design_process'
  | 'case_problem'
  | 'case_research'
  | 'case_decisions'
  | 'case_constraints'
  | 'case_outcomes'
  | 'case_contribution'
  | 'case_evidence'
  | 'case_strength'
  | 'risk_check'
  | 'collaboration_process'
  | 'stakeholder_feedback'
  | 'prioritization'
  | 'impact_measurement'
  | 'design_system_work'
  | 'learning_adaptation'
  | 'case_summary'
  | 'experience_summary';

export type SynthesisTopic =
  | 'identity'
  | 'experience'
  | 'web'
  | 'mobile'
  | 'portfolio_overview'
  | 'portfolio_value'
  | 'strengths'
  | 'decision_making'
  | 'product_approach'
  | 'collaboration'
  | 'fit'
  | 'risks';

export type CaseFactFacet =
  | 'overview'
  | 'problem'
  | 'role'
  | 'research'
  | 'decisions'
  | 'constraints'
  | 'outcomes'
  | 'evidence'
  | 'strengths'
  | 'risks';

export type SynthesisAnswerStatus =
  | 'grounded'
  | 'insufficient_facts'
  | 'needs_clarification'
  | 'navigation_suggested';

export type SynthesisSnapshot = {
  topic: SynthesisTopic;
  answerType: AnswerType;
  queryScope: QueryScope;
  questionSubject: QuestionSubject;
  answerPlan: AnswerPlan;
  question: string;
  answerStatus: SynthesisAnswerStatus;
  title: string;
  intro: string;
  followupParagraphs: string[];
  sections: Array<{
    title: string;
    body: string;
  }>;
  bullets: string[];
  chips?: PromptChip[];
};

export type QueryInterpretation = {
  intent: MessageIntent;
  scope: QueryScope;
  questionSubject: QuestionSubject;
  answerType: AnswerType | null;
  topic: SynthesisTopic | null;
  factFacet: CaseFactFacet | null;
  targetCaseId: string | null;
  confidence: IntentConfidence;
  matchedCues: string[];
};

export type CaseFactPack = {
  caseId: string;
  recruiterSummary: {
    intro: string;
    followup?: string;
  };
  whatThisProves: string[];
  recruiterTakeaway: string[];
  weaknessAngle: string[];
  bestAnswerTypes: AnswerType[];
  overview: string[];
  role: string[];
  decisions: string[];
  constraints: string[];
  validation: string[];
  outcomes: string[];
  evidence: string[];
  risks: string[];
  hiringSignal: string[];
  missing: string[];
};

export type Metric = {
  value: string;
  label: string;
};

export type PromptChip =
  | {
      id: string;
      label: string;
      action: UIAction;
      message?: never;
    }
  | {
      id: string;
      label: string;
      message: string;
      action?: never;
    };

export type RailItem = {
  id: string;
  label: string;
  subtitle: string;
  kind: 'case' | 'experience' | 'overview';
};

export type DisclosureRow = {
  id: string;
  title: string;
  summary: string;
  details: string[];
  artifactIds?: string[];
};

export type Artifact = {
  id: string;
  title: string;
  caption: string;
  imageUrl?: string;
  sourceLabel?: string;
  note?: string;
};

export type ArtifactOpenTarget = {
  artifactId: string;
  caseId?: string;
};

export type GalleryItem = {
  id: string;
  artifactId: string;
  title: string;
  description: string;
};

export type SummaryPreviewConfig = {
  src: string;
  backgroundColor: string;
  borderColor?: string;
  bordered?: boolean;
  radiusClassName?: string;
  imageClassName: string;
  overlaySrc?: string;
  overlayImageClassName?: string;
};

export type CaseCollectionLayoutType =
  | 'single_preview'
  | 'two_cards'
  | 'three_cards_scroll';

export type StructuredSummaryDisclosureCard = {
  id: string;
  artifactId?: string;
  title?: string;
  description?: string;
  width: number;
  preview: SummaryPreviewConfig;
};

export type StructuredSummaryDisclosureLayoutType =
  | CaseCollectionLayoutType
  | 'text_only';

export type StructuredSummaryDisclosureItem = {
  id: string;
  label: string;
  body: string;
  layoutType: StructuredSummaryDisclosureLayoutType;
  rowWidth?: number;
  peekWidth?: number;
  cards?: StructuredSummaryDisclosureCard[];
};

export type StructuredSummaryShowcaseItem = {
  id: string;
  artifactId: string;
  title: string;
  description: string;
  width: number;
  preview: SummaryPreviewConfig;
};

export type StructuredCaseSummaryData = {
  intro: {
    title: string;
    body: string;
    preview: SummaryPreviewConfig;
  };
  sections: Array<{
    title: string;
    body: string;
  }>;
  disclosureTitle: string;
  disclosures: StructuredSummaryDisclosureItem[];
  showcaseTitle: string;
  showcaseRowWidth?: number;
  showcasePeekWidth?: number;
  showcaseItems: StructuredSummaryShowcaseItem[];
  resultsTitle: string;
  resultsBody: string;
  resultMetrics: Metric[];
  footerAction: {
    label: string;
    action: UIAction;
  };
};

export type StructuredExperienceWorkItem = {
  id: string;
  company: string;
  period: string;
  description: string;
  resultLabel: string;
  resultTags: string[];
};

export type StructuredExperienceSummaryData = {
  intro: {
    title: string;
    body: string;
    preview: SummaryPreviewConfig;
  };
  currentWork: {
    title: string;
    body: string;
  };
  workHistory: {
    title: string;
    items: StructuredExperienceWorkItem[];
  };
  importantTakeaway: {
    title: string;
    body: string;
    metrics: Metric[];
  };
  casePromptSection: {
    title: string;
    chips: PromptChip[];
  };
  footerAction: {
    label: string;
    action: UIAction;
  };
};

export type StructuredCandidateFastReviewDisclosureItem =
  StructuredSummaryDisclosureItem & {
    caseId: string;
    subtitle: string;
  };

export type StructuredCandidateFastReviewData = {
  intro: {
    title: string;
    body: string[];
  };
  projectScope: {
    title: string;
    body: string[];
  };
  watchOrder: {
    title: string;
    body: string[];
  };
  disclosureTitle: string;
  disclosures: StructuredCandidateFastReviewDisclosureItem[];
  hiringLeadNote: {
    title: string;
    body: string[];
  };
  footerAction: {
    label: string;
    action: UIAction;
  };
};

export type ContactOption = {
  id: 'telegram' | 'linkedin';
  label: string;
  helper: string;
  href: string;
};

export type ContentBlock =
  | {
      type: 'lead';
      title: string;
      body: string[];
    }
  | {
      type: 'section';
      title: string;
      body: string[];
    }
  | {
      type: 'bullet_list';
      title?: string;
      items: string[];
    }
  | {
      type: 'metrics';
      title?: string;
      items: Metric[];
    }
  | {
      type: 'chips';
      title?: string;
      items: PromptChip[];
    }
  | {
      type: 'disclosures';
      title?: string;
      items: DisclosureRow[];
    }
  | {
      type: 'gallery';
      title?: string;
      items: GalleryItem[];
    }
  | {
      type: 'evidence_case';
      title: string;
      body: string[];
      case: {
        caseId: string;
        layoutType: CaseCollectionLayoutType;
        rowWidth?: number;
        peekWidth?: number;
        items: StructuredSummaryDisclosureCard[];
      };
    }
  | {
      type: 'cta';
      title?: string;
      label: string;
      action: UIAction;
    };

export type ContextPanelData = {
  headerLabel?: string;
  title: string;
  subtitle: string;
  tags: string[];
  metricsTitle?: string;
  metrics?: Metric[];
  role?: string;
  roleTitle?: string;
  roleDescription?: string;
  note?: string;
  cta?: {
    label: string;
    action: UIAction;
  };
  preview?: {
    src?: string;
    backgroundColor?: string;
    backgroundImage?: string;
    imageClassName?: string;
    frameRadius?: 16 | 24;
    bordered?: boolean;
  };
  hidden?: boolean;
};

export type SelectedContext =
  | { kind: 'none'; id: null; label: null }
  | { kind: 'case'; id: string; label: string }
  | { kind: 'experience'; id: 'experience'; label: 'Опыт работы' }
  | {
      kind: 'overview';
      id: 'additional-cases' | 'mobile-experience';
      label: string;
    };

export type CaseContent = {
  id: string;
  shortTitle: string;
  title: string;
  railSubtitle: string;
  shortDescription: string;
  category: CaseCategory;
  tags: string[];
  summaryTitle: string;
  detailTitle: string;
  routeTitle: string;
  resultChips: string[];
  metrics: Metric[];
  role: string;
  roleDescription: string;
  summaryBlocks: ContentBlock[];
  detailBlocks: ContentBlock[];
  routeBlocks: ContentBlock[];
  disclosures: DisclosureRow[];
  artifacts: Artifact[];
  gallery: GalleryItem[];
  structuredSummary?: StructuredCaseSummaryData;
  contextPanel: ContextPanelData;
  followUpChips: PromptChip[];
};

export type ExperienceContent = {
  structuredSummary?: StructuredExperienceSummaryData;
  summaryBlocks: ContentBlock[];
  detailBlocks: ContentBlock[];
  routeBlocks: Record<string, ContentBlock[]>;
  contextPanel: ContextPanelData;
  followUpChips: PromptChip[];
};

export type AdditionalCasesContent = {
  summaryBlocks: ContentBlock[];
  contextPanel: ContextPanelData;
  followUpChips: PromptChip[];
};

export type MobileOverviewContent = {
  summaryBlocks: ContentBlock[];
  contextPanel: ContextPanelData;
  followUpChips: PromptChip[];
};

export type ContactContent = {
  title: string;
  helper: string;
  options: ContactOption[];
};

export type HiringGuideContent = {
  title: string;
  viewType:
    | 'assistant_intro'
    | 'identity_intro'
    | 'career_summary'
    | 'case_discovery'
    | 'mobile_overview'
    | 'strengths_assessment'
    | 'role_fit_assessment'
    | 'decision_process'
    | 'evidence_request'
    | 'risk_objection';
  presentationVariant: Extract<
    PresentationVariant,
    'plain_text_reply' | 'bullet_reply' | 'sectioned_reply'
  >;
  contentBlocks: ContentBlock[];
  chips: PromptChip[];
  contextPanel: ContextPanelData;
};

export type HiringGuidesContent = {
  assistantProfile: HiringGuideContent;
  identityProfile: HiringGuideContent;
  careerSummary: HiringGuideContent;
  caseDiscovery: HiringGuideContent;
  mobileSummary: HiringGuideContent;
  strengthsMap: HiringGuideContent;
  roleFit: HiringGuideContent;
  decisionMakingPatterns: HiringGuideContent;
  risksAndLimits: HiringGuideContent;
  evidenceIndex: HiringGuideContent;
};

export type EntryContent = {
  title: string;
  subtitle: string;
  quickPrompts: PromptChip[];
  railItems: RailItem[];
  contextPanel: ContextPanelData;
};

export type PortfolioContent = {
  entry: EntryContent;
  cases: Record<string, CaseContent>;
  experience: ExperienceContent;
  additionalCases: AdditionalCasesContent;
  mobileOverview: MobileOverviewContent;
  contact: ContactContent;
  hiringGuides: HiringGuidesContent;
};

export type ModalPayload =
  | {
      type: 'contact';
      title: string;
      helper: string;
      options: ContactOption[];
    }
  | {
      type: 'image';
      title: string;
      caption: string;
      imageUrl?: string;
      sourceLabel?: string;
      note?: string;
    };

export type UIAction =
  | { type: 'open_entry' }
  | { type: 'open_case_summary'; caseId: string }
  | { type: 'open_case_detail'; caseId: string }
  | { type: 'open_case_route'; caseId: string }
  | { type: 'open_experience_summary' }
  | { type: 'open_experience_detail' }
  | { type: 'open_experience_route'; caseId: string }
  | { type: 'open_mobile_experience_overview' }
  | { type: 'open_mobile_case_summary'; caseId: string }
  | { type: 'open_mobile_case_detail'; caseId: string }
  | { type: 'open_additional_cases_overview' }
  | { type: 'open_contact_modal'; source?: string }
  | { type: 'open_image_modal'; caseId: string; artifactId: string }
  | { type: 'close_modal' };

export type MessageIntent =
  | { type: 'navigation_action'; action: UIAction }
  | { type: 'assistant_intro' }
  | { type: 'identity_intro' }
  | { type: 'experience_overview' }
  | { type: 'portfolio_overview' }
  | { type: 'portfolio_value_request' }
  | { type: 'case_discovery'; targetCaseId?: string }
  | { type: 'mobile_overview' }
  | { type: 'strengths_assessment' }
  | { type: 'role_fit_assessment' }
  | { type: 'decision_process' }
  | { type: 'evidence_request' }
  | { type: 'risk_objection' }
  | { type: 'missing_case_request'; requestedCase?: string }
  | { type: 'ambiguous_question' }
  | { type: 'unsupported_request' };

export type IntentConfidence = 'high' | 'medium' | 'low';

export type AIMode = 'fallback' | 'live';

export type AssistantEnvelope = {
  sessionId: string;
  uiState: UIState;
  viewType: ViewType;
  presentationVariant: PresentationVariant;
  selectedContext: SelectedContext;
  answerMode: AnswerMode | null;
  railItems: RailItem[];
  contentBlocks: ContentBlock[];
  chips: PromptChip[];
  contextPanel: ContextPanelData;
  modal: ModalPayload | null;
  safetyState: SafetyState;
  nextActions: UIAction[];
  meta: {
    userMessagesUsed: number;
    userMessagesRemaining: number;
    responseSource: ResponseSource;
    assistantReplyState: AssistantReplyState;
    sessionStoreMode: SessionStoreMode;
    answerType?: AnswerType | null;
    queryScope?: QueryScope | null;
    questionSubject?: QuestionSubject | null;
    aiMode?: AIMode;
  };
};

export type AssistantSession = {
  id: string;
  userMessageCount: number;
  selectedContext: SelectedContext;
  currentView: ViewType;
  answerMode: AnswerMode | null;
  openModal: ModalPayload | null;
  lastSynthesis: SynthesisSnapshot | null;
  lastUserQuestion: string | null;
  lastAssistantAnswerPreview: string | null;
  lastQuestionSubject: QuestionSubject | null;
  recentHistory: string[];
  createdAt: string;
  updatedAt: string;
};

export type ChatRequestBody = {
  sessionId?: string;
  input:
    | {
        type: 'message';
        text: string;
      }
    | {
        type: 'action';
        action: UIAction;
      };
};
