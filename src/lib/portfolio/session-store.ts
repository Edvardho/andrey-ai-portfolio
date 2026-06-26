import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import {
  getSessionTableName,
  getSupabaseServerKey,
  getSupabaseUrl,
  hasSupabaseConfig,
} from '@/lib/portfolio/config';
import type {
  AssistantSession,
  SelectedContext,
  SessionStoreMode,
  ViewType,
} from '@/lib/portfolio/types';

type SessionStore = {
  mode: SessionStoreMode;
  get(sessionId: string): Promise<AssistantSession | null>;
  save(session: AssistantSession): Promise<void>;
};

const GLOBAL_KEY = '__aiPortfolioMemorySessions__';

function createEmptySession(sessionId: string): AssistantSession {
  const now = new Date().toISOString();

  return {
    id: sessionId,
    userMessageCount: 0,
    selectedContext: { kind: 'none', id: null, label: null },
    currentView: 'entry',
    answerMode: null,
    openModal: null,
    lastSynthesis: null,
    lastUserQuestion: null,
    lastAssistantAnswerPreview: null,
    lastQuestionSubject: null,
    recentHistory: [],
    createdAt: now,
    updatedAt: now,
  };
}

class MemorySessionStore implements SessionStore {
  readonly mode: SessionStoreMode;
  private sessions: Map<string, AssistantSession>;

  constructor(mode: SessionStoreMode = 'memory') {
    this.mode = mode;
    const globalStore = globalThis as typeof globalThis & {
      [GLOBAL_KEY]?: Map<string, AssistantSession>;
    };

    globalStore[GLOBAL_KEY] ??= new Map<string, AssistantSession>();
    this.sessions = globalStore[GLOBAL_KEY];
  }

  async get(sessionId: string): Promise<AssistantSession | null> {
    return this.sessions.get(sessionId) ?? null;
  }

  async save(session: AssistantSession): Promise<void> {
    this.sessions.set(session.id, session);
  }
}

class SupabaseSessionStore implements SessionStore {
  readonly mode: SessionStoreMode = 'supabase';
  private client: SupabaseClient;
  private tableName: string;

  constructor() {
    const url = getSupabaseUrl();
    const serverKey = getSupabaseServerKey();

    if (!url || !serverKey) {
      throw new Error('Supabase config is missing.');
    }

    this.client = createClient(url, serverKey);
    this.tableName = getSessionTableName();
  }

  async get(sessionId: string): Promise<AssistantSession | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('session_id, session_payload')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data?.session_payload as AssistantSession | undefined) ?? null;
  }

  async save(session: AssistantSession): Promise<void> {
    const { error } = await this.client.from(this.tableName).upsert(
      {
        session_id: session.id,
        session_payload: session,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'session_id' },
    );

    if (error) {
      throw error;
    }
  }
}

let sessionStoreSingleton: SessionStore | null = null;
let degradedStoreReason: string | null = null;

function switchToDegradedMemoryStore(reason: string): SessionStore {
  degradedStoreReason = reason;
  sessionStoreSingleton = new MemorySessionStore('degraded_memory');
  return sessionStoreSingleton;
}

export function getSessionStore(): SessionStore {
  if (sessionStoreSingleton) {
    return sessionStoreSingleton;
  }

  if (hasSupabaseConfig()) {
    try {
      sessionStoreSingleton = new SupabaseSessionStore();
      return sessionStoreSingleton;
    } catch {
      return switchToDegradedMemoryStore('supabase_init_failed');
    }
  }

  sessionStoreSingleton = new MemorySessionStore();
  return sessionStoreSingleton;
}

export function getSessionStoreMode(): SessionStoreMode {
  return getSessionStore().mode;
}

export function getSessionStoreDiagnostics() {
  return {
    mode: getSessionStoreMode(),
    degradedReason: degradedStoreReason,
  };
}

async function safeStoreGet(sessionId: string): Promise<AssistantSession | null> {
  const store = getSessionStore();

  try {
    return await store.get(sessionId);
  } catch (error) {
    if (store.mode === 'supabase') {
      return switchToDegradedMemoryStore('supabase_read_failed').get(sessionId);
    }

    throw error;
  }
}

async function safeStoreSave(session: AssistantSession): Promise<void> {
  const store = getSessionStore();

  try {
    await store.save(session);
  } catch (error) {
    if (store.mode === 'supabase') {
      await switchToDegradedMemoryStore('supabase_write_failed').save(session);
      return;
    }

    throw error;
  }
}

export async function getOrCreateSession(sessionId?: string): Promise<AssistantSession> {
  const safeSessionId = sessionId?.trim() || crypto.randomUUID();
  const existing = await safeStoreGet(safeSessionId);

  if (existing) {
    return existing;
  }

  const created = createEmptySession(safeSessionId);
  await safeStoreSave(created);
  return created;
}

export async function persistSession(
  session: AssistantSession,
  patch: Partial<AssistantSession>,
): Promise<AssistantSession> {
  const updated: AssistantSession = {
    ...session,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  await safeStoreSave(updated);
  return updated;
}

export function appendHistory(session: AssistantSession, entry: string): string[] {
  return [...session.recentHistory, entry].slice(-12);
}

export function updateContext(
  session: AssistantSession,
  selectedContext: SelectedContext,
  currentView: ViewType,
): Partial<AssistantSession> {
  return {
    selectedContext,
    currentView,
    openModal: null,
    lastSynthesis: null,
  };
}
