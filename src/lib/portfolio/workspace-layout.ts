import { PORTFOLIO_CASE_ORDER } from '@/data/portfolio-profile';

export const DESKTOP_WORKSPACE_MIN_WIDTH = 1280;

export type WorkspaceLayoutMode = 'compact' | 'desktop';

export const COMPACT_PROJECT_ORDER = PORTFOLIO_CASE_ORDER;

export function getWorkspaceLayoutMode(viewportWidth: number): WorkspaceLayoutMode {
  return viewportWidth < DESKTOP_WORKSPACE_MIN_WIDTH ? 'compact' : 'desktop';
}
