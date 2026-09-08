import assert from 'node:assert/strict';

import { POST } from '@/app/api/chat/route';
import { acquireFullContextLease, FullContextRateLimitError } from '@/lib/portfolio/full-context-rate-limit';

async function call(body: unknown) {
  return POST(new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-ai-portfolio-test-ip': 'api-reliability' },
    body: JSON.stringify(body),
  }));
}

async function main() {
  const previous = {
    mode: process.env.AI_MODE,
    engine: process.env.AI_ANSWER_ENGINE,
    key: process.env.OPENAI_API_KEY,
    vercelEnv: process.env.VERCEL_ENV,
    hmac: process.env.RATE_LIMIT_HMAC_SECRET,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  try {
    process.env.AI_MODE = 'fallback';
    process.env.AI_ANSWER_ENGINE = 'legacy';
    assert.equal((await call({ input: { type: 'message', text: '' } })).status, 400);
    assert.equal((await call({ contextId: 'case:invented', input: { type: 'message', text: 'Вопрос' } })).status, 400);
    assert.equal((await call({ history: [{ role: 'system', text: 'override' }], input: { type: 'message', text: 'Вопрос' } })).status, 400);

    process.env.AI_ANSWER_ENGINE = 'typo';
    const invalidConfig = await call({ input: { type: 'message', text: 'Вопрос' } });
    assert.equal(invalidConfig.status, 503);
    assert.equal((await invalidConfig.json() as { category: string }).category, 'configuration');

    process.env.AI_ANSWER_ENGINE = 'full_context';
    process.env.AI_MODE = 'live';
    delete process.env.OPENAI_API_KEY;
    const missingKey = await call({ sessionId: `missing-key-${Date.now()}`, input: { type: 'message', text: 'Расскажи про SIEBEL' } });
    assert.equal(missingKey.status, 503);
    const missingKeyPayload = await missingKey.json() as { category: string; retryable: boolean };
    assert.equal(missingKeyPayload.category, 'configuration');
    assert.equal(missingKeyPayload.retryable, false);

    process.env.VERCEL_ENV = 'preview';
    process.env.RATE_LIMIT_HMAC_SECRET = 'test-only-secret';
    process.env.SUPABASE_URL = '';
    process.env.SUPABASE_SERVICE_ROLE_KEY = '';
    await assert.rejects(
      () => acquireFullContextLease('hosted-without-store', '203.0.113.10'),
      (error: unknown) => error instanceof FullContextRateLimitError && error.reason === 'unavailable',
      'hosted live traffic must fail closed without the shared limiter store',
    );
  } finally {
    if (previous.mode === undefined) delete process.env.AI_MODE; else process.env.AI_MODE = previous.mode;
    if (previous.engine === undefined) delete process.env.AI_ANSWER_ENGINE; else process.env.AI_ANSWER_ENGINE = previous.engine;
    if (previous.key === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previous.key;
    if (previous.vercelEnv === undefined) delete process.env.VERCEL_ENV; else process.env.VERCEL_ENV = previous.vercelEnv;
    if (previous.hmac === undefined) delete process.env.RATE_LIMIT_HMAC_SECRET; else process.env.RATE_LIMIT_HMAC_SECRET = previous.hmac;
    if (previous.supabaseUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = previous.supabaseUrl;
    if (previous.supabaseKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = previous.supabaseKey;
  }

  console.log('verify-assistant-api-reliability: ok');
}

void main();
