import { NextResponse } from 'next/server';
import { z } from 'zod';

import { resolveChatRequest } from '@/lib/portfolio/engine';
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
  sessionId: z.string().trim().min(1).optional(),
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
    const json = await request.json();
    const body = requestSchema.parse(json);
    const session = await getOrCreateSession(body.sessionId);
    const { envelope } = await resolveChatRequest(session, body);

    return NextResponse.json(envelope);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request payload',
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    if (error instanceof SessionStoreUnavailableError) {
      console.error('AI portfolio chat session store unavailable:', error.code);
      return NextResponse.json(
        {
          error: 'Assistant session temporarily unavailable',
          code: error.code,
          retryable: true,
        },
        { status: 503 },
      );
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
