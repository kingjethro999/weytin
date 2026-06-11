import { groqChat } from '@/lib/groq/client';
import { logger } from '@/lib/utils/logger';
import fs from 'fs';
import path from 'path';

export interface GroqMarketContext {
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  historicalTrend: string;
  predictedPrice: number;
  confidence: number;
}

const CACHE_FILE_PATH = path.join(process.cwd(), 'lib', 'price', 'groq-cache.json');

// Initialize cache file if it doesn't exist
function ensureCacheFile() {
  try {
    const dir = path.dirname(CACHE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(CACHE_FILE_PATH)) {
      fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify({}), 'utf-8');
    }
  } catch (err: any) {
    logger.error('[AI Cache] Failed to initialize cache file', { error: err.message });
  }
}

function getCache(): Record<string, { data: GroqMarketContext; timestamp: number }> {
  ensureCacheFile();
  try {
    const content = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
    return JSON.parse(content || '{}');
  } catch (err: any) {
    logger.error('[AI Cache] Failed to read cache', { error: err.message });
    return {};
  }
}

function setCache(key: string, data: GroqMarketContext) {
  ensureCacheFile();
  try {
    const cache = getCache();
    cache[key] = {
      data,
      timestamp: Date.now(),
    };
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (err: any) {
    logger.error('[AI Cache] Failed to write cache', { error: err.message });
  }
}

/**
 * Fetch market price context and predictions from Groq AI.
 * Uses persistent file cache to avoid redundant API queries.
 */
export async function getGroqMarketContext(
  productName: string,
  unit: string,
  locationName: string
): Promise<GroqMarketContext> {
  const cacheKey = `${productName}-${unit}-${locationName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // 1. Check Cache (1 day expiry)
  const cache = getCache();
  const cachedEntry = cache[cacheKey];
  const ONE_DAY = 24 * 60 * 60 * 1000;
  
  if (cachedEntry && Date.now() - cachedEntry.timestamp < ONE_DAY) {
    logger.info('[AI Market Data] Cache hit', { cacheKey });
    return cachedEntry.data;
  }

  // 2. Fetch from Groq
  logger.info('[AI Market Data] Cache miss, calling Groq', { cacheKey });
  
  const systemPrompt = `You are a commodities market analyst specializing in Nigerian retail and wholesale markets.
You must return a JSON object ONLY. Ensure it strictly matches this typescript type:
{
  "minPrice": number,
  "maxPrice": number,
  "averagePrice": number,
  "historicalTrend": string, // brief 2 sentences summarizing recent price trends or changes
  "predictedPrice": number, // estimated average price next month
  "confidence": number // confidence score from 0 to 100
}
Do not return any markdown formatting, do not wrap in \`\`\`json, do not return any conversational text. Return raw JSON text only.`;

  const userPrompt = `Provide current market price details for product: "${productName}" (sold in unit: "${unit}") in "${locationName}", Nigeria. 
Make sure prices are realistic current estimates in Nigerian Naira (NGN).`;

  try {
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];
    
    // Using a model that supports JSON and is fast
    const rawResponse = await groqChat(messages, 'llama-3.3-70b-versatile');
    
    // Clean up potential markdown formatting if the model accidentally included it
    let cleanJson = rawResponse.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
    }
    
    const parsed = JSON.parse(cleanJson) as GroqMarketContext;
    
    // Validate schema fields
    if (
      typeof parsed.minPrice === 'number' &&
      typeof parsed.maxPrice === 'number' &&
      typeof parsed.averagePrice === 'number' &&
      typeof parsed.historicalTrend === 'string'
    ) {
      setCache(cacheKey, parsed);
      return parsed;
    }
    
    throw new Error('Invalid JSON schema returned by AI');
  } catch (err: any) {
    logger.error('[AI Market Data] Failed to retrieve context from Groq', { error: err.message });
    // Safe fallback estimates
    const fallback: GroqMarketContext = {
      minPrice: 500,
      maxPrice: 50000,
      averagePrice: 20000,
      historicalTrend: 'Price ranges estimated using fallback database defaults.',
      predictedPrice: 21000,
      confidence: 30,
    };
    return fallback;
  }
}
