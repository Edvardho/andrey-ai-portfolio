export const MAX_USER_MESSAGES_PER_SESSION = 20;

export type AIMode = 'fallback' | 'live';
export type AIAnswerEngine = 'legacy' | 'full_context';

export type SemanticRouterMode = 'off' | 'shadow' | 'active';
export type GroundedOutputMode = 'legacy' | 'shadow' | 'v2';

export class AIConfigurationError extends Error {
  readonly code = 'AI_CONFIGURATION_ERROR';

  constructor(readonly variable: string, readonly reason: 'invalid_value' | 'missing_api_key') {
    super(`Invalid AI configuration: ${variable}.`);
    this.name = 'AIConfigurationError';
  }
}

export function getAIMode(): AIMode {
  return process.env.AI_MODE?.trim() === 'live' ? 'live' : 'fallback';
}

export function getAIAnswerEngine(): AIAnswerEngine {
  const value = process.env.AI_ANSWER_ENGINE?.trim();
  if (!value) return 'legacy';
  if (value === 'legacy' || value === 'full_context') return value;
  throw new AIConfigurationError('AI_ANSWER_ENGINE', 'invalid_value');
}

export function getFullContextModel(): string {
  return process.env.AI_FULL_CONTEXT_MODEL?.trim() || 'gpt-5.4-mini';
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
