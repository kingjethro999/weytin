import { logger } from '@/lib/utils/logger';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export async function groqChat(messages: Message[], model?: string) {
  const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
  const defaultModel = process.env.GROQ_DEFAULT_MODEL || 'llama-3.3-70b-versatile';

  if (!apiKey) {
    logger.error('[AI] Groq API key missing');
    throw new Error('AI service configuration missing');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || defaultModel,
      messages,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error('[AI] Groq request failed', { status: response.status, errorBody });
    throw new Error('AI analysis failed');
  }

  const data = (await response.json()) as GroqChatResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('AI returned an empty response');
  }

  return content;
}
