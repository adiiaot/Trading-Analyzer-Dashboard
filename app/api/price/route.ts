import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CACHE_TTL = 30_000;
const HYPERLIQUID_INFO = 'https://api.hyperliquid.xyz/info';

let cache: { data: any; ts: number } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const res = await fetch(HYPERLIQUID_INFO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'candleSnapshot',
        req: {
          coin: 'xyz:GOLD',
          interval: '1m',
          startTime: Date.now() - 120_000,
          endTime: Date.now(),
        },
      }),
      signal: AbortSignal.timeout(6_000),
    });

    if (!res.ok) {
      if (cache) return NextResponse.json(cache.data);
      return NextResponse.json(
        { success: false, error: 'Price source unavailable' },
        { status: 503 }
      );
    }

    const bars = await res.json();
    const latest = bars?.[bars.length - 1];
    if (!latest) {
      if (cache) return NextResponse.json(cache.data);
      return NextResponse.json(
        { success: false, error: 'No price data' },
        { status: 503 }
      );
    }

    const price = parseFloat(latest.c);
    const result = {
      success: true,
      symbol: 'XAU/USD',
      price,
      change24h: 0,
      changePercent24h: 0,
      high24h: parseFloat(latest.h),
      low24h: parseFloat(latest.l),
      volume: parseFloat(latest.v || 0),
      bid: price - 0.05,
      ask: price + 0.05,
      spread: 0.5,
    };

    cache = { data: result, ts: Date.now() };
    return NextResponse.json(result);
  } catch {
    if (cache) return NextResponse.json({ ...cache.data, _cached: true });
    return NextResponse.json(
      { success: false, error: 'Price source unreachable' },
      { status: 503 }
    );
  }
}
