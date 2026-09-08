import assert from 'node:assert/strict';

import { acquireFullContextLease, FullContextRateLimitError } from '@/lib/portfolio/full-context-rate-limit';

async function main() {
  const previous = {
    vercelEnv: process.env.VERCEL_ENV,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  delete process.env.VERCEL_ENV;
  process.env.SUPABASE_URL = '';
  process.env.SUPABASE_SERVICE_ROLE_KEY = '';
  const sessionId = `rate-limit-${Date.now()}`;
  const lease = await acquireFullContextLease(sessionId, 'local-rate-test');
  try {
    await assert.rejects(
      () => acquireFullContextLease(sessionId, 'local-rate-test'),
      (error: unknown) => error instanceof FullContextRateLimitError && error.reason === 'limited',
      'only one AI request may hold the session lock',
    );
    for (let attempt = 0; attempt < 6; attempt += 1) await lease.consumeAttempt();
    await assert.rejects(
      () => lease.consumeAttempt(),
      (error: unknown) => error instanceof FullContextRateLimitError && error.reason === 'limited',
      'every model call, including repair, consumes the per-minute limit',
    );
  } finally {
    await lease.release();
    if (previous.vercelEnv === undefined) delete process.env.VERCEL_ENV; else process.env.VERCEL_ENV = previous.vercelEnv;
    if (previous.supabaseUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = previous.supabaseUrl;
    if (previous.supabaseKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = previous.supabaseKey;
  }
  console.log('verify-full-context-rate-limit: ok');
}

void main();
