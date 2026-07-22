import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';

// Ограничения на входные параметры (Safety Guards)
export const LIMITS = {
  MAX_SYSTEM_PROMPT_CHARS: 10000,
  MAX_USER_MESSAGE_CHARS: 1000,
  MAX_RETRIEVED_CHUNKS: 15,
  MAX_RETRIEVED_CHARS: 8000,
  MAX_MESSAGES_HISTORY: 10,
  MAX_TOTAL_PAYLOAD_CHARS: 25000,
};

export interface PreCallPayload {
  route: string;
  model: string;
  systemPromptChars: number;
  developerPromptChars: number;
  userMessageChars: number;
  ragContextChars: number;
  historyChars: number;
  schemaChars: number;
  totalPayloadChars: number;
  estimatedInputChars: number;
  retrievedChunksCount?: number;
  messagesCount: number;
}

export interface PostCallMetrics {
  requestId?: string;
  status: 'success' | 'error';
  error?: string;
  inputTokens?: number;
  outputTokens?: number;
  cachedInputTokens?: number;
  durationMs: number;
}

type OpenAILogEntry = {
  event: 'call_start' | 'call_end';
  route: string;
  model: string;
  [key: string]: unknown;
};

// Временное хранилище начатых вызовов для связывания старта и завершения
const pendingCalls = new Map<string, { startPayload: PreCallPayload; startTime: number }>();

const isLocalDev = process.env.NODE_ENV === 'development' || !process.env.VERCEL;

// Путь к файлу логов для локальной разработки
const LOG_FILE_PATH = path.resolve(process.cwd(), 'scratch/openai-calls.jsonl');

function ensureLogDirExists() {
  const dir = path.dirname(LOG_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getSafeErrorCategory(error: unknown): string {
  const message = String(error).toLowerCase();

  if (/rate.?limit|too many requests|429/.test(message)) return 'rate_limit';
  if (/timeout|timed out|deadline/.test(message)) return 'timeout';
  if (/unauthori[sz]ed|forbidden|api key|401|403/.test(message)) return 'authentication';
  if (/network|fetch failed|econn|enotfound/.test(message)) return 'network';

  return 'request_failed';
}

export function redactProductionTelemetry(entry: OpenAILogEntry): OpenAILogEntry {
  const { error, ...safeEntry } = entry;

  return error === undefined
    ? safeEntry
    : {
        ...safeEntry,
        errorCategory: getSafeErrorCategory(error),
      };
}

/**
 * Проверяет входные данные на превышение лимитов безопасности.
 * Выбрасывает ошибку или логирует предупреждение.
 */
export function validatePayloadLimits(payload: PreCallPayload): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (payload.systemPromptChars > LIMITS.MAX_SYSTEM_PROMPT_CHARS) {
    warnings.push(`System prompt length (${payload.systemPromptChars}) exceeds limit of ${LIMITS.MAX_SYSTEM_PROMPT_CHARS}`);
  }
  if (payload.userMessageChars > LIMITS.MAX_USER_MESSAGE_CHARS) {
    warnings.push(`User message length (${payload.userMessageChars}) exceeds limit of ${LIMITS.MAX_USER_MESSAGE_CHARS}`);
  }
  if (payload.retrievedChunksCount && payload.retrievedChunksCount > LIMITS.MAX_RETRIEVED_CHUNKS) {
    warnings.push(`Retrieved chunks count (${payload.retrievedChunksCount}) exceeds limit of ${LIMITS.MAX_RETRIEVED_CHUNKS}`);
  }
  if (payload.ragContextChars > LIMITS.MAX_RETRIEVED_CHARS) {
    warnings.push(`RAG context length (${payload.ragContextChars}) exceeds limit of ${LIMITS.MAX_RETRIEVED_CHARS}`);
  }
  if (payload.messagesCount > LIMITS.MAX_MESSAGES_HISTORY) {
    warnings.push(`History messages count (${payload.messagesCount}) exceeds limit of ${LIMITS.MAX_MESSAGES_HISTORY}`);
  }
  if (payload.totalPayloadChars > LIMITS.MAX_TOTAL_PAYLOAD_CHARS) {
    warnings.push(`Total payload length (${payload.totalPayloadChars}) exceeds limit of ${LIMITS.MAX_TOTAL_PAYLOAD_CHARS}`);
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Логирует начало вызова OpenAI API.
 * Возвращает уникальный callId для связывания с концом вызова.
 */
export function logOpenAICallStart(payload: PreCallPayload): string {
  const callId = `call_${randomUUID()}`;
  const startTime = Date.now();

  const { warnings } = validatePayloadLimits(payload);
  if (warnings.length > 0) {
    console.warn(`[OpenAI Limit Warning] ${payload.route}:`, warnings.join('; '));
  }

  pendingCalls.set(callId, { startPayload: payload, startTime });

  // Логируем старт в структурированном виде
  const logEntry = {
    event: 'call_start',
    callId,
    timestamp: new Date().toISOString(),
    ...payload,
    warnings: warnings.length > 0 ? warnings : undefined,
  } as const;

  writeLog(logEntry);

  return callId;
}

/**
 * Логирует завершение вызова OpenAI API.
 */
export function logOpenAICallEnd(callId: string, metrics: PostCallMetrics): void {
  const pending = pendingCalls.get(callId);
  if (!pending) {
    console.warn(`[OpenAI Logger] Pending call not found for callId: ${callId}`);
    return;
  }

  pendingCalls.delete(callId);

  const durationMs = Date.now() - pending.startTime;

  const { durationMs: metricDurationMs, ...restMetrics } = metrics;

  const logEntry = {
    event: 'call_end',
    callId,
    timestamp: new Date().toISOString(),
    route: pending.startPayload.route,
    model: pending.startPayload.model,
    durationMs: metricDurationMs || durationMs,
    ...restMetrics,
  } as const;

  writeLog(logEntry);
}

function writeLog(entry: OpenAILogEntry) {
  const logString = JSON.stringify(entry);

  // В production оставляем только технические метаданные без текста вопроса и raw ошибок.
  if (!isLocalDev) {
    console.log(`[OPENAI_TELEMETRY] ${JSON.stringify(redactProductionTelemetry(entry))}`);
    return;
  }

  // В локальной разработке дублируем в консоль и пишем в jsonl файл
  console.log(`[OPENAI_TELEMETRY] ${entry.event === 'call_start' ? '🚀 START' : '✅ END'} | ${entry.route} | ${entry.model}`);
  
  try {
    ensureLogDirExists();
    fs.appendFileSync(LOG_FILE_PATH, logString + '\n', 'utf-8');
  } catch (err) {
    console.error('Failed to write OpenAI telemetry log file:', err);
  }
}
