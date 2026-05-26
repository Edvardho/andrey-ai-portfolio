export type CaseCategory =
  | 'flagship'
  | 'primary'
  | 'supporting'
  | 'mobile'
  | 'additional';

export type ViewType =
  | 'entry'
  | 'case_summary'
  | 'case_detail'
  | 'case_route'
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

export type Metric = {
  value: string;
  label: string;
};

export type PromptChip = {
  id: string;
  label: string;
  action: UIAction;
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

export type GalleryItem = {
  id: string;
  artifactId: string;
  title: string;
  description: string;
};

export type ContactOption = {
  id: 'telegram' | 'linkedin' | 'email';
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
      type: 'cta';
      title?: string;
      label: string;
      action: UIAction;
    };

export type ContextPanelData = {
  title: string;
  subtitle: string;
  tags: string[];
  metrics?: Metric[];
  role?: string;
  roleDescription?: string;
  note?: string;
  cta?: {
    label: string;
    action: UIAction;
  };
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
  contextPanel: ContextPanelData;
  followUpChips: PromptChip[];
};

export type ExperienceContent = {
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

export type AssistantEnvelope = {
  sessionId: string;
  uiState: UIState;
  viewType: ViewType;
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
  };
};

export type AssistantSession = {
  id: string;
  userMessageCount: number;
  selectedContext: SelectedContext;
  currentView: ViewType;
  answerMode: AnswerMode | null;
  openModal: ModalPayload | null;
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
