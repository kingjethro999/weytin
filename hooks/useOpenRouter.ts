'use client';

import { useState } from 'react';
import { Message } from '@/lib/groq/client';
import { logger } from '@/lib/utils/logger';
import { normaliseError, AppError } from '@/lib/utils/errors';

export function useOpenRouter() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const queryAI = async (messages: Message[], model?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages, model }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'AI request failed');
      }

      const data = await response.json();
      return data.content;
    } catch (err) {
      const normalised = normaliseError(err);
      setError(normalised);
      logger.error('[Hooks] useOpenRouter failed', { error: normalised });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { queryAI, isLoading, error };
}
