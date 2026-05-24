import { NextRequest, NextResponse } from 'next/server';
import { groqChat } from '@/lib/groq/client';
import { logger } from '@/lib/utils/logger';
import { normaliseError } from '@/lib/utils/errors';

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const content = await groqChat(messages, model);

    return NextResponse.json({ content });
  } catch (error: unknown) {
    const normalised = normaliseError(error);
    logger.error('[API] AI route failed', { error: normalised.message });
    return NextResponse.json(
      { error: normalised.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
