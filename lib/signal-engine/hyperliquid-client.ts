import { CandleData } from './types';
import { CONFIG } from './config';
import { getCached, setCached } from './candle-cache';

interface RawBar {
  t: number;
  o: string;
  h: string;
  l: string;
  c: string;
  v: string | number;
}

const TIMEOUT_MS = 8000;

async function postWithTimeout(url: string, body: unknown, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function parseCandles(raw: RawBar[]): CandleData[] {
  const candles: CandleData[] = [];
  for (const bar of raw) {
    try {
      candles.push({
        time: Math.floor(Number(bar.t) / 1000),
        open: Math.round(parseFloat(bar.o) * 100) / 100,
        high: Math.round(parseFloat(bar.h) * 100) / 100,
        low: Math.round(parseFloat(bar.l) * 100) / 100,
        close: Math.round(parseFloat(bar.c) * 100) / 100,
        volume: parseFloat(String(bar.v || 0)),
      });
    } catch (e) {
      console.warn('[HL] Skipping malformed candle bar:', bar, e);
      continue;
    }
  }
  candles.sort((a, b) => a.time - b.time);
  return candles;
}

function buildPayload(timeframe: string, limit: number) {
  const interval = CONFIG.TIMEFRAME_MAP[timeframe];
  if (!interval) return null;
  const spanMs = CONFIG.INTERVAL_MS[interval] * (limit + 5);
  const endMs = Date.now();
  const startMs = endMs - spanMs;
  return {
    type: 'candleSnapshot' as const,
    req: {
      coin: CONFIG.GOLD_SYMBOL,
      interval,
      startTime: startMs,
      endTime: endMs,
    },
  };
}

export async function fetchCandles(timeframe: string, limit: number, forceFetch: boolean = false): Promise<CandleData[] | null> {
  if (!forceFetch) {
    const cached = getCached(timeframe);
    if (cached) return cached.slice(-limit);
  }

  const payload = buildPayload(timeframe, limit);
  if (!payload) return null;

  try {
    const raw = await postWithTimeout(CONFIG.HYPERLIQUID_URL, payload, TIMEOUT_MS) as RawBar[];
    if (!Array.isArray(raw) || raw.length === 0) {
      console.warn(`[HL] Empty response for ${timeframe} (limit=${limit})`);
      return null;
    }
    const candles = parseCandles(raw);
    if (candles.length === 0) {
      console.warn(`[HL] Zero valid candles for ${timeframe} (${raw.length} raw bars)`);
      return null;
    }
    setCached(timeframe, candles);
    return candles.slice(-limit);
  } catch (e) {
    console.error(`[HL] Fetch failed for ${timeframe}:`, e);
    return null;
  }
}

export async function fetchCandlesMulti(requests: Record<string, number>, forceFetch: boolean = false): Promise<Record<string, CandleData[] | null>> {
  const results: Record<string, CandleData[] | null> = {};
  const entries = Object.entries(requests);
  const fetches = entries.map(async ([tf, limit]) => {
    const candles = await fetchCandles(tf, limit, forceFetch);
    if (!candles) {
      console.warn(`[HL] Timeframe ${tf} returned no data`);
    }
    results[tf] = candles;
  });
  await Promise.all(fetches);
  return results;
}

export async function fetchCurrentPrice(): Promise<number | null> {
  const candles = await fetchCandles('1m', 1);
  if (!candles || candles.length === 0) return null;
  return candles[candles.length - 1].close;
}
