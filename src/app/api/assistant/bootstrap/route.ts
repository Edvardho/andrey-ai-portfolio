import { NextResponse } from 'next/server';
import { z } from 'zod';

import { resolveBootstrap } from '@/lib/portfolio/engine';
import { getOrCreateSession } from '@/lib/portfolio/session-store';

export const dynamic = 'force-dynamic';

const bootstrapQuerySchema = z.object({
  sessionId: z.string().trim().min(1).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = bootstrapQuerySchema.parse({
      sessionId: searchParams.get('sessionId') ?? undefined,
    });

    const session = await getOrCreateSession(query.sessionId);
    const envelope = await resolveBootstrap(session);

    return NextResponse.json(envelope);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid bootstrap query',
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    console.error('AI portfolio bootstrap failed:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
      },
      { status: 500 },
    );
  }
}
