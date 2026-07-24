export const MAX_USER_MESSAGES_PER_SESSION = 20;

export type AIMode = 'fallback' | 'live';

export type SemanticRouterMode = 'off' | 'shadow' | 'active';
export type GroundedOutputMode = 'legacy' | 'shadow' | 'v2';

export function getAIMode(): AIMode {
  return process.env.AI_MODE?.trim() === 'live' ? 'live' : 'fallback';
}

export function getOpenAIKey(): string | undefined {
  return process.env.OPENAI_API_KEY;
}

export function isOpenAIEnabled(): boolean {
  return getAIMode() === 'live' && Boolean(getOpenAIKey());
}

export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';
}

export function getSemanticRouterMode(): SemanticRouterMode {
  const value = process.env.AI_SEMANTIC_ROUTER_MODE?.trim();
  if (process.env.VERCEL_ENV === 'production' && value === 'shadow') {
    return 'off';
  }
  return value === 'shadow' || value === 'active' ? value : 'off';
}

export function getGroundedOutputMode(): GroundedOutputMode {
  const value = process.env.AI_GROUNDED_OUTPUT_MODE?.trim();
  if (process.env.VERCEL_ENV === 'production' && value === 'shadow') {
    return 'legacy';
  }
  return value === 'shadow' || value === 'v2' ? value : 'legacy';
}

export function getOpenAIRouterModel(): string {
  return process.env.OPENAI_ROUTER_MODEL?.trim() || getOpenAIModel();
}

export function getOpenAISynthesisModel(): string {
  return process.env.OPENAI_SYNTHESIS_MODEL?.trim() || getOpenAIModel();
}

export function getSupabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getSupabaseServerKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function getSessionTableName(): string {
  return process.env.SUPABASE_SESSION_TABLE?.trim() || 'portfolio_sessions';
}

export function hasSupabaseConfig(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseServerKey());
}
