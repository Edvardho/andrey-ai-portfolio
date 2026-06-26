import { alfaSmartCase } from '@/data/cases/alfa-smart';
import { chatpointCase } from '@/data/cases/chatpoint';
import { expensesCardHoldersCase } from '@/data/cases/expenses-card-holders';
import { siebelCase } from '@/data/cases/siebel';
import { subscriptionSharingCase } from '@/data/cases/subscription-sharing';
import { uxUiWannabelikeCase } from '@/data/cases/ux-ui-wannabelike';
import { additionalCasesContent, experience, getExperienceRoute, getHiringGuide, hiringGuides, mobileOverview } from '@/data/portfolio-global-content';
import { contactOptions, entry, getContactContent, getEntryPrompts, getRailItems } from '@/data/portfolio-index';
import type { CaseContent, ContextPanelData, PortfolioContent } from '@/lib/portfolio/types';

export const portfolioContent: PortfolioContent = {
  entry,
  cases: {
    'alfa-smart': alfaSmartCase,
    chatpoint: chatpointCase,
    siebel: siebelCase,
    'expenses-card-holders': expensesCardHoldersCase,
    'subscription-sharing': subscriptionSharingCase,
    'ux-ui-wannabelike': uxUiWannabelikeCase,
  },
  experience,
  additionalCases: additionalCasesContent,
  mobileOverview,
  contact: contactOptions,
  hiringGuides,
};

export function getCaseById(caseId: string): CaseContent | undefined {
  return portfolioContent.cases[caseId];
}

export function getCaseContext(caseId: string): ContextPanelData {
  return getCaseById(caseId)?.contextPanel ?? entry.contextPanel;
}

export { getContactContent, getEntryPrompts, getExperienceRoute, getHiringGuide, getRailItems };
