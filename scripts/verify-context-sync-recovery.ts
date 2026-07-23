import assert from 'node:assert/strict';

import { getSyncActionForContext } from '@/lib/portfolio/context-sync';
import type { AssistantEnvelope } from '@/lib/portfolio/types';

function createEnvelope(
  selectedContext: AssistantEnvelope['selectedContext'],
  viewType: AssistantEnvelope['viewType'],
): AssistantEnvelope {
  return {
    sessionId: 'verify-context-sync',
    uiState: 'ready',
    viewType,
    presentationVariant: 'plain_text_reply',
    selectedContext,
    answerMode: null,
    railItems: [],
    contentBlocks: [],
    chips: [],
    contextPanel: {
      title: '',
      subtitle: '',
      tags: [],
      note: '',
      hidden: true,
    },
    modal: null,
    safetyState: 'none',
    nextActions: [],
    meta: {
      userMessagesUsed: 0,
      userMessagesRemaining: 20,
      responseSource: 'authored',
      assistantReplyState: 'authored_reply',
      sessionStoreMode: 'memory',
    },
  };
}

function main() {
  const fallback = createEnvelope(
    { kind: 'none', id: null, label: null },
    'ambiguous_question',
  );

  assert.deepEqual(
    getSyncActionForContext('case:siebel', fallback),
    { type: 'open_case_summary', caseId: 'siebel' },
    'a fallback in the SIEBEL thread must restore SIEBEL instead of entry',
  );
  assert.deepEqual(
    getSyncActionForContext('experience', fallback),
    { type: 'open_experience_summary' },
    'a fallback in the experience thread must restore experience',
  );
  assert.deepEqual(
    getSyncActionForContext('mobile-experience', fallback),
    { type: 'open_mobile_experience_overview' },
    'a fallback in the mobile overview thread must restore the overview',
  );
  assert.deepEqual(
    getSyncActionForContext('additional-cases', fallback),
    { type: 'open_additional_cases_overview' },
    'a fallback in the additional-cases thread must restore the overview',
  );
  assert.deepEqual(
    getSyncActionForContext('entry', fallback),
    { type: 'open_entry' },
    'the entry thread must remain entry',
  );

  assert.deepEqual(
    getSyncActionForContext(
      'case:siebel',
      createEnvelope({ kind: 'case', id: 'siebel', label: 'SIEBEL' }, 'case_detail'),
    ),
    { type: 'open_case_detail', caseId: 'siebel' },
    'a matching case detail must preserve its view',
  );
  assert.deepEqual(
    getSyncActionForContext(
      'case:siebel',
      createEnvelope({ kind: 'case', id: 'chatpoint', label: 'ChatPoint' }, 'case_detail'),
    ),
    { type: 'open_case_summary', caseId: 'siebel' },
    'a mismatched case envelope must not switch the restored thread',
  );

  console.log('Context sync recovery contract passed.');
}

main();
