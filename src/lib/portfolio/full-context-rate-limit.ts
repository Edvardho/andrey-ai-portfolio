import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'node:crypto';

import { getSupabaseServerKey, getSupabaseUrl } from '@/lib/portfolio/config';

export class FullContextRateLimitError extends Error {
  readonly code = 'FULL_CONTEXT_RATE_LIMITED';
  constructor(readonly reason: 'limited' | 'unavailable') { super('Full-context rate limit unavailable.'); this.name = 'FullContextRateLimitError'; }
}

type Lease = { release(): Promise<void> };
const memoryBuckets = new Map<string, { count: number; expiresAt: number }>();
const memoryLocks = new Map<string, number>();

function isHosted() { return Boolean(process.env.VERCEL_ENV); }
function secureIpHash(ip: string) {
  const secret = process.env.RATE_LIMIT_HMAC_SECRET?.trim();
  if (!secret) {
    if (isHosted()) throw new FullContextRateLimitError('unavailable');
    return `local:${ip}`;
  }
  return createHmac('sha256', secret).update(ip).digest('hex');
}
function shouldUseMemoryStore() { return !getSupabaseUrl() || !getSupabaseServerKey(); }
function consumeMemory(key: string, windowMs: number, limit: number) {
  const now = Date.now(); const existing = memoryBuckets.get(key);
  if (!existing || existing.expiresAt <= now) { memoryBuckets.set(key, { count: 1, expiresAt: now + windowMs }); return true; }
  if (existing.count >= limit) return false;
  existing.count += 1; return true;
}

export async function acquireFullContextLease(sessionId: string, ip: string): Promise<Lease> {
  const hashedIp = secureIpHash(ip);
  if (shouldUseMemoryStore()) {
    const now = Date.now(); const lockUntil = memoryLocks.get(sessionId) ?? 0;
    if (lockUntil > now || !consumeMemory(`session:${sessionId}`, 60_000, 6) || !consumeMemory(`ip:${hashedIp}`, 3_600_000, 60)) throw new FullContextRateLimitError('limited');
    memoryLocks.set(sessionId, now + 30_000);
    return { release: async () => { memoryLocks.delete(sessionId); } };
  }
  try {
    const client = createClient(getSupabaseUrl()!, getSupabaseServerKey()!);
    const lock = await client.rpc('portfolio_acquire_ai_lock', { p_session_id: sessionId, p_ttl_seconds: 30 });
    if (lock.error) throw lock.error;
    if (lock.data !== true) throw new FullContextRateLimitError('limited');
    const consume = async (scope: string, key: string, seconds: number, limit: number) => {
      const result = await client.rpc('portfolio_consume_ai_rate_limit', { p_scope: scope, p_key: key, p_window_seconds: seconds, p_limit: limit });
      if (result.error) throw result.error;
      return result.data === true;
    };
    const sessionAllowed = await consume('session', sessionId, 60, 6);
    const ipAllowed = sessionAllowed && await consume('ip', hashedIp, 3600, 60);
    if (!sessionAllowed || !ipAllowed) { await client.rpc('portfolio_release_ai_lock', { p_session_id: sessionId }); throw new FullContextRateLimitError('limited'); }
    return { release: async () => { await client.rpc('portfolio_release_ai_lock', { p_session_id: sessionId }); } };
  } catch (error) {
    if (error instanceof FullContextRateLimitError) throw error;
    throw new FullContextRateLimitError('unavailable');
  }
}

export function getTrustedClientIp(request: Request) {
  const testIp = request.headers.get('x-ai-portfolio-test-ip');
  if (testIp && !isHosted()) return testIp.slice(0, 128);
  if (isHosted()) return request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
}
