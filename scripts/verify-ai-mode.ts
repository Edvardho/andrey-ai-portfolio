import assert from 'node:assert/strict';

async function assertNoOpenAITelemetry(callback: () => Promise<void>, label: string) {
  const originalLog = console.log;
  const entries: string[] = [];

  console.log = (...args: unknown[]) => {
    entries.push(args.map(String).join(' '));
  };

  try {
    await callback();
  } finally {
    console.log = originalLog;
  }

  assert.equal(
    entries.some((entry) => entry.includes('[OPENAI_TELEMETRY]')),
    false,
    `${label}: must not start OpenAI telemetry`,
  );
}

async function main() {
  process.env.SUPABASE_URL = '';
  process.env.NEXT_PUBLIC_SUPABASE_URL = '';
  process.env.SUPABASE_SERVICE_ROLE_KEY = '';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

  const { getAIMode, isOpenAIEnabled } = await import('@/lib/portfolio/config');
  const { resolveMessage } = await import('@/lib/portfolio/engine');
  const { getOrCreateSession } = await import('@/lib/portfolio/session-store');

  process.env.AI_MODE = '';
  process.env.OPENAI_API_KEY = 'sk-test-key-that-must-not-be-used';
  assert.equal(getAIMode(), 'fallback', 'empty AI_MODE must default to fallback');
  assert.equal(isOpenAIEnabled(), false, 'empty AI_MODE must disable OpenAI even with key');

  process.env.AI_MODE = 'something-else';
  assert.equal(getAIMode(), 'fallback', 'unknown AI_MODE must default to fallback');
  assert.equal(isOpenAIEnabled(), false, 'unknown AI_MODE must disable OpenAI even with key');

  process.env.AI_MODE = 'fallback';
  assert.equal(getAIMode(), 'fallback', 'fallback AI_MODE must be preserved');
  assert.equal(isOpenAIEnabled(), false, 'fallback AI_MODE must disable OpenAI even with key');

  const fallbackSession = await getOrCreateSession(`verify-ai-mode-fallback-${Date.now()}`);
  await assertNoOpenAITelemetry(async () => {
    const { envelope } = await resolveMessage(fallbackSession, 'Как именно Андрей принимает решения в неоднозначности?');
    assert.equal(envelope.meta.aiMode, 'fallback', 'fallback envelope must expose aiMode');
    assert.equal(envelope.meta.responseSource, 'facts_constrained_synthesis');
  }, 'fallback mode with key');

  process.env.AI_MODE = 'live';
  process.env.OPENAI_API_KEY = '';
  assert.equal(getAIMode(), 'live', 'live AI_MODE must be preserved');
  assert.equal(isOpenAIEnabled(), false, 'live AI_MODE without key must not enable OpenAI');

  const liveNoKeySession = await getOrCreateSession(`verify-ai-mode-live-no-key-${Date.now()}`);
  await assertNoOpenAITelemetry(async () => {
    const { envelope } = await resolveMessage(liveNoKeySession, 'Кто такой Андрей?');
    assert.equal(envelope.meta.aiMode, 'live', 'live without key envelope must expose live aiMode');
    assert.equal(envelope.meta.responseSource, 'facts_constrained_synthesis');
  }, 'live mode without key');

  process.env.OPENAI_API_KEY = 'sk-test-key';
  assert.equal(isOpenAIEnabled(), true, 'live AI_MODE with key must enable OpenAI path');

  console.log('verify-ai-mode: ok');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
