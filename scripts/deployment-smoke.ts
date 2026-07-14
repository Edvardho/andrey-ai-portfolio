import assert from 'node:assert/strict';

type AssistantEnvelope = {
  sessionId: string;
  viewType: string;
  modal: { type: string } | null;
  selectedContext: { kind: string; id: string | null };
  meta: {
    aiMode?: string;
    sessionStoreMode?: string;
    responseSource?: string;
  };
};

const deploymentUrl = process.env.DEPLOYMENT_SMOKE_URL?.trim().replace(/\/$/, '');
const expectedAiMode = process.env.DEPLOYMENT_EXPECT_AI_MODE?.trim() || 'live';
const expectedSessionStore = process.env.DEPLOYMENT_EXPECT_SESSION_STORE?.trim() || 'supabase';

if (!deploymentUrl) {
  throw new Error('Set DEPLOYMENT_SMOKE_URL to the public Vercel deployment URL.');
}

async function requestJson(path: string, init?: RequestInit): Promise<AssistantEnvelope> {
  const response = await fetch(`${deploymentUrl}${path}`, init);
  const body = await response.json().catch(() => null);

  assert.equal(response.ok, true, `${path}: expected 2xx, got ${response.status}`);
  assert.ok(body && typeof body === 'object', `${path}: expected JSON response`);

  return body as AssistantEnvelope;
}

async function postChat(sessionId: string, input: unknown) {
  return requestJson('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, input }),
  });
}

function assertProductionRuntime(envelope: AssistantEnvelope, step: string) {
  assert.equal(envelope.meta.aiMode, expectedAiMode, `${step}: AI mode must be ${expectedAiMode}`);
  assert.equal(
    envelope.meta.sessionStoreMode,
    expectedSessionStore,
    `${step}: session store must be ${expectedSessionStore}`,
  );
}

async function main() {
  const bootstrap = await requestJson('/api/assistant/bootstrap');
  assert.equal(bootstrap.viewType, 'entry', 'bootstrap must return the entry state');
  assertProductionRuntime(bootstrap, 'bootstrap');

  const openedCase = await postChat(bootstrap.sessionId, {
    type: 'action',
    action: { type: 'open_case_summary', caseId: 'alfa-smart' },
  });
  assert.equal(openedCase.selectedContext.id, 'alfa-smart', 'case action must select Alfa-Smart');
  assertProductionRuntime(openedCase, 'case action');

  const answer = await postChat(openedCase.sessionId, {
    type: 'message',
    text: 'Кто такой Андрей?',
  });
  assert.equal(answer.viewType, 'general_synthesis', 'identity question must return synthesis');
  assert.equal(answer.meta.responseSource, 'facts_constrained_synthesis', 'identity answer must use facts synthesis');
  assertProductionRuntime(answer, 'identity answer');

  const contact = await postChat(answer.sessionId, {
    type: 'action',
    action: { type: 'open_contact_modal', source: 'deployment-smoke' },
  });
  assert.equal(contact.modal?.type, 'contact', 'contact CTA must open the contact modal');
  assertProductionRuntime(contact, 'contact action');

  console.log(`Deployment smoke passed for ${deploymentUrl}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
