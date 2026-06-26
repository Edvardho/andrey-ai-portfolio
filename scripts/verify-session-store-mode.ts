import assert from 'node:assert/strict';

import {
  getSessionStoreDiagnostics,
  getSessionStoreMode,
  getOrCreateSession,
} from '@/lib/portfolio/session-store';

process.env.SUPABASE_URL = '';
process.env.NEXT_PUBLIC_SUPABASE_URL = '';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-test-key';

async function main() {
  const session = await getOrCreateSession(`verify-session-store-${Date.now()}`);

  assert.ok(session.id.length > 0, 'session must be created');
  assert.equal(
    getSessionStoreMode(),
    'memory',
    'without service role key, session store must stay in memory mode instead of pretending Supabase is available',
  );

  const diagnostics = getSessionStoreDiagnostics();
  assert.equal(diagnostics.mode, 'memory');
  assert.equal(
    diagnostics.degradedReason,
    null,
    'plain memory mode should not report degraded reason',
  );

  console.log('Session store mode contract passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
