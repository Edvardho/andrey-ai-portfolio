import assert from 'node:assert/strict';

import { POST } from '@/app/api/chat/route';
import { GET as bootstrapRoute } from '@/app/api/assistant/bootstrap/route';

type Envelope = {
  sessionId: string;
  viewType: string;
  selectedContext: { kind: string; id: string | null };
  meta: {
    answerType: string | null;
    queryScope: string | null;
    questionSubject: string | null;
    assistantReplyState: string;
  };
};

async function bootstrap(): Promise<Envelope> {
  const response = await bootstrapRoute(new Request('http://localhost/api/assistant/bootstrap'));
  assert.equal(response.status, 200, 'bootstrap must return 200');
  return (await response.json()) as Envelope;
}

async function post(sessionId: string, input: unknown): Promise<Envelope> {
  const response = await POST(
    new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId, input }),
    }),
  );
  assert.equal(response.status, 200, 'chat request must return 200');
  return (await response.json()) as Envelope;
}

async function main() {
  const initial = await bootstrap();
  const sessionId = initial.sessionId;

  const opened = await post(sessionId, {
    type: 'action',
    action: { type: 'open_case_summary', caseId: 'siebel' },
  });
  assert.equal(opened.selectedContext.id, 'siebel', 'action must persist the selected case');

  const compact = await post(sessionId, {
    type: 'message',
    text: 'Коротко расскажи об этом кейсе',
  });
  assert.equal(compact.sessionId, sessionId, 'message must use the persisted session');
  assert.equal(compact.selectedContext.id, 'siebel', 'message must restore the selected case');
  assert.equal(compact.viewType, 'general_synthesis', 'compact case request must synthesize an answer');
  assert.equal(compact.meta.answerType, 'case_summary');
  assert.equal(compact.meta.queryScope, 'current_case_only');
  assert.equal(compact.meta.questionSubject, 'case_summary');
  assert.equal(compact.meta.assistantReplyState, 'grounded_answer');

  const compactWithoutDeicticCue = await post(sessionId, {
    type: 'message',
    text: 'Емко расскажи о кейсе',
  });
  assert.equal(compactWithoutDeicticCue.selectedContext.id, 'siebel');
  assert.equal(compactWithoutDeicticCue.viewType, 'general_synthesis');
  assert.equal(compactWithoutDeicticCue.meta.answerType, 'case_summary');
  assert.equal(compactWithoutDeicticCue.meta.queryScope, 'current_case_only');
  assert.equal(compactWithoutDeicticCue.meta.questionSubject, 'case_summary');

  const restored = await bootstrapRoute(
    new Request(`http://localhost/api/assistant/bootstrap?sessionId=${sessionId}`),
  );
  const restoredEnvelope = (await restored.json()) as Envelope;
  assert.equal(restoredEnvelope.sessionId, sessionId, 'bootstrap must restore the same session');
  assert.equal(restoredEnvelope.selectedContext.id, 'siebel', 'restored session must keep the case');

  console.log('Assistant API session flow contract passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
