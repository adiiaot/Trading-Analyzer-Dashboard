import type { CandleData } from './types';

const CACHE_TTL_MS = 60_000;

interface CacheEntry {
  candles: CandleData[];
  at: number;
}

const store = new Map<string, CacheEntry>();

export function getCached(timeframe: string): CandleData[] | null {
  const entry = store.get(timeframe);
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    store.delete(timeframe);
    return null;
  }
  return entry.candles;
}

export function setCached(timeframe: string, candles: CandleData[]): void {
  store.set(timeframe, { candles, at: Date.now() });
}

export function clearCache(): void {
  store.clear();
}
