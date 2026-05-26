import { portfolioContent } from '@/data/portfolio-content';

/**
 * Legacy compatibility layer.
 *
 * The old flat `projects` model is intentionally thin now. New code should use
 * `portfolioContent` and the typed backend schema under `src/lib/portfolio`.
 */
export const projects = Object.values(portfolioContent.cases).map((item) => ({
  id: item.id,
  name: item.title,
  shortDescription: item.shortDescription,
  type: item.railSubtitle,
  tags: item.tags,
  metrics: item.metrics,
  role: item.role,
  roleDescription: item.roleDescription,
  thumbnail: item.artifacts[0]?.imageUrl ?? '',
}));

export function getProjectById(id: string) {
  return projects.find((project) => project.id === id);
}
