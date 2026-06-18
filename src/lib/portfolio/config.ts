export const MAX_USER_MESSAGES_PER_SESSION = 20;

export function getOpenAIKey(): string | undefined {
  return process.env.OPENAI_API_KEY;
}

export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';
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
