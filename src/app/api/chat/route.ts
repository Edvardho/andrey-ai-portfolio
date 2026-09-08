import { NextResponse } from 'next/server';
import { z } from 'zod';

import { isKnownCase, resolveChatRequest } from '@/lib/portfolio/engine';
import { AIConfigurationError, getAIAnswerEngine, getAIMode } from '@/lib/portfolio/config';
import { FullContextUnavailableError } from '@/lib/portfolio/full-context-answer';
import { acquireFullContextLease, FullContextRateLimitError, getTrustedClientIp } from '@/lib/portfolio/full-context-rate-limit';
import { getOrCreateSession, SessionStoreUnavailableError } from '@/lib/portfolio/session-store';
import type { ChatRequestBody, UIAction } from '@/lib/portfolio/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const actionSchema: z.ZodType<UIAction> = z.discriminatedUnion('type', [
  z.object({ type: z.literal('open_entry') }),
  z.object({ type: z.literal('open_case_summary'), caseId: z.string().min(1) }),
  z.object({ type: z.literal('open_case_detail'), caseId: z.string().min(1) }),
  z.object({ type: z.literal('open_case_route'), caseId: z.string().min(1) }),
  z.object({ type: z.literal('open_experience_summary') }),
  z.object({ type: z.literal('open_experience_detail') }),
  z.object({ type: z.literal('open_experience_route'), caseId: z.string().min(1) }),
  z.object({ type: z.literal('open_mobile_experience_overview') }),
  z.object({ type: z.literal('open_mobile_case_summary'), caseId: z.string().min(1) }),
  z.object({ type: z.literal('open_mobile_case_detail'), caseId: z.string().min(1) }),
  z.object({ type: z.literal('open_additional_cases_overview') }),
  z.object({ type: z.literal('open_contact_modal'), source: z.string().optional() }),
  z.object({ type: z.literal('open_image_modal'), caseId: z.string().min(1), artifactId: z.string().min(1) }),
  z.object({ type: z.literal('close_modal') }),
]);

const requestSchema: z.ZodType<ChatRequestBody> = z.object({
  sessionId: z.string().trim().min(1).max(128).optional(),
  requestId: z.string().trim().min(1).max(128).optional(),
  contextId: z.string().trim().min(1).max(128).refine((contextId) => (
    contextId === 'entry' || contextId === 'experience' || contextId === 'mobile-experience' || contextId === 'additional-cases'
      || (contextId.startsWith('case:') && isKnownCase(contextId.slice(5)))
  ), 'Unknown context').optional(),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), text: z.string().trim().min(1).max(6000) })).max(12).optional(),
  input: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('message'),
      text: z.string(),
    }),
    z.object({
      type: z.literal('action'),
      action: actionSchema,
    }),
  ]),
});

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get('content-length') ?? '0');
    if (Number.isFinite(contentLength) && contentLength > 128 * 1024) {
      return NextResponse.json({ error: 'Request payload is too large' }, { status: 413 });
    }
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > 128 * 1024) {
      return NextResponse.json({ error: 'Request payload is too large' }, { status: 413 });
    }
    const json = JSON.parse(rawBody);
    const body = requestSchema.parse(json);
    if (body.input.type === 'message' && (body.input.text.trim().length < 1 || body.input.text.trim().length > 6000)) {
      return NextResponse.json({ error: 'Message must be 1 to 6000 characters' }, { status: 400 });
    }
    if ((body.history ?? []).reduce((sum, item) => sum + item.text.length, 0) > 24_000) {
      return NextResponse.json({ error: 'History is too large' }, { status: 400 });
    }
    let session = await getOrCreateSession(body.sessionId);
    const isFullContextMessage = getAIAnswerEngine() === 'full_context' && getAIMode() === 'live' && body.input.type === 'message';
    const lease = isFullContextMessage ? await acquireFullContextLease(session.id, getTrustedClientIp(request)) : null;
    try {
      // The lock is acquired after the initial lookup. Read again so two tabs
      // cannot both continue from an obsolete counter or request ledger.
      if (lease) session = await getOrCreateSession(session.id);
      const { envelope } = await resolveChatRequest(session, body, {
        beforeModelAttempt: lease ? () => lease.consumeAttempt() : undefined,
      });
      return NextResponse.json(envelope);
    } finally {
      try {
        await lease?.release();
      } catch {
        console.error('AI portfolio lease release failed:', { sessionId: session.id });
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'Invalid request payload',
          issues: error instanceof z.ZodError ? error.issues : undefined,
        },
        { status: 400 },
      );
    }

    if (error instanceof AIConfigurationError) {
      console.error('AI portfolio configuration error:', { code: error.code, variable: error.variable, reason: error.reason });
      return NextResponse.json({
        error: 'Assistant is not configured for this environment.',
        code: error.code,
        category: 'configuration',
        retryable: false,
      }, { status: 503 });
    }

    if (error instanceof SessionStoreUnavailableError) {
      console.error('AI portfolio chat session store unavailable:', {
        code: error.code,
        reason: error.reason,
        diagnostics: error.diagnostics,
      });
      return NextResponse.json(
        {
          error: 'Assistant session temporarily unavailable',
          code: error.code,
          retryable: true,
        },
        { status: 503 },
      );
    }

    if (error instanceof FullContextUnavailableError || error instanceof FullContextRateLimitError) {
      const category = error instanceof FullContextRateLimitError
        ? error.reason === 'limited' ? 'rate_limit' : 'storage_unavailable'
        : error.reason === 'timeout'
          ? 'timeout'
          : error.reason === 'provider_failure'
            ? 'provider'
            : error.reason === 'retry_limit'
              ? 'attempt_limit'
              : error.reason.startsWith('validation_')
                ? 'validation'
                : 'request';
      return NextResponse.json({
        error: 'Assistant answer is temporarily unavailable. Please retry.',
        code: error.code,
        category,
        retryable: category !== 'attempt_limit' && category !== 'request',
      }, { status: error instanceof FullContextRateLimitError && error.reason === 'limited' ? 429 : 503 });
    }

    console.error('AI portfolio chat route failed:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
      },
      { status: 500 },
    );
  }
}
