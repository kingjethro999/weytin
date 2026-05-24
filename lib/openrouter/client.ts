/**
 * OpenRouter AI Client for Weytin Platform.
 */

import { logger } from '@/lib/utils/logger';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function openRouterChat(messages: Message[], model?: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const defaultModel = process.env.OPENROUTER_DEFAULT_MODEL || 'google/gemma-3-27b-it';

  if (!apiKey) {
    logger.error('[AI] OpenRouter API key missing');
    throw new Error('AI service configuration missing');
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Weytin Platform',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || defaultModel,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error('[AI] OpenRouter request failed', { error });
      throw new Error('AI analysis failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    logger.error('[AI] Connection error', { error });
    throw error;
  }
}
