import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import {
  getSessionTableName,
  getSupabaseServerKey,
  getSupabaseUrl,
  hasSupabaseConfig,
} from '@/lib/portfolio/config';
import type { AssistantSession, SelectedContext, ViewType } from '@/lib/portfolio/types';

type SessionStore = {
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
    recentHistory: [],
    createdAt: now,
    updatedAt: now,
  };
}

class MemorySessionStore implements SessionStore {
  private sessions: Map<string, AssistantSession>;

  constructor() {
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
  private client: SupabaseClient;
  private tableName: string;
  private fallbackStore: MemorySessionStore;

  constructor() {
    const url = getSupabaseUrl();
    const serverKey = getSupabaseServerKey();

    if (!url || !serverKey) {
      throw new Error('Supabase config is missing.');
    }

    this.client = createClient(url, serverKey);
    this.tableName = getSessionTableName();
    this.fallbackStore = new MemorySessionStore();
  }

  async get(sessionId: string): Promise<AssistantSession | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('session_id, session_payload')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error || !data?.session_payload) {
        return this.fallbackStore.get(sessionId);
      }

      return data.session_payload as AssistantSession;
    } catch {
      return this.fallbackStore.get(sessionId);
    }
  }

  async save(session: AssistantSession): Promise<void> {
    try {
      const { error } = await this.client.from(this.tableName).upsert(
        {
          session_id: session.id,
          session_payload: session,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'session_id' },
      );

      if (error) {
        await this.fallbackStore.save(session);
      }
    } catch {
      await this.fallbackStore.save(session);
    }
  }
}

let sessionStoreSingleton: SessionStore | null = null;

export function getSessionStore(): SessionStore {
  if (sessionStoreSingleton) {
    return sessionStoreSingleton;
  }

  if (hasSupabaseConfig()) {
    try {
      sessionStoreSingleton = new SupabaseSessionStore();
      return sessionStoreSingleton;
    } catch {
      // Fall back to in-memory storage if Supabase is not usable in local MVP.
    }
  }

  sessionStoreSingleton = new MemorySessionStore();
  return sessionStoreSingleton;
}

export async function getOrCreateSession(sessionId?: string): Promise<AssistantSession> {
  const safeSessionId = sessionId?.trim() || crypto.randomUUID();
  const store = getSessionStore();
  const existing = await store.get(safeSessionId);

  if (existing) {
    return existing;
  }

  const created = createEmptySession(safeSessionId);
  await store.save(created);
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

  await getSessionStore().save(updated);
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
