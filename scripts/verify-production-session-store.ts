import assert from 'node:assert/strict';

process.env.VERCEL_ENV = 'production';
process.env.SUPABASE_URL = '';
process.env.NEXT_PUBLIC_SUPABASE_URL = '';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';

async function main() {
  const { getOrCreateSession } = await import('@/lib/portfolio/session-store');
  const { GET: bootstrap } = await import('@/app/api/assistant/bootstrap/route');
  const { POST: chat } = await import('@/app/api/chat/route');

  await assert.rejects(
    () => getOrCreateSession('verify-production-session-store'),
    { code: 'SESSION_STORE_UNAVAILABLE' },
    'production must not create an in-memory session when Supabase is unavailable',
  );

  const bootstrapResponse = await bootstrap(new Request('http://localhost/api/assistant/bootstrap'));
  assert.equal(bootstrapResponse.status, 503, 'bootstrap must return 503 when the production store is unavailable');
  assert.deepEqual(await bootstrapResponse.json(), {
    error: 'Assistant session temporarily unavailable',
    code: 'SESSION_STORE_UNAVAILABLE',
    retryable: true,
  });

  const chatResponse = await chat(new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ input: { type: 'message', text: 'Коротко расскажи о кейсе' } }),
  }));
  assert.equal(chatResponse.status, 503, 'chat must return 503 when the production store is unavailable');
  assert.deepEqual(await chatResponse.json(), {
    error: 'Assistant session temporarily unavailable',
    code: 'SESSION_STORE_UNAVAILABLE',
    retryable: true,
  });

  console.log('Production session store contract passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
