import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BOT_API = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:8000';
const CACHE_TTL = 30_000; // 30s cache

let cache: { data: any; ts: number } | null = null;

export async function GET() {
  // Serve from cache if fresh
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const res = await fetch(`${BOT_API}/api/price`, {
      signal: AbortSignal.timeout(6_000),
    });

    if (!res.ok) {
      // Fallback to cached if stale but available
      if (cache) return NextResponse.json(cache.data);
      throw new Error(`Bot returned ${res.status}`);
    }

    const data = await res.json();

    // Normalize to the PricePanel schema
    const result = {
      success: true,
      symbol: 'XAU/USD',
      price: data.price ?? data.close ?? 0,
      change24h: data.change24h ?? 0,
      changePercent24h: data.changePercent24h ?? 0,
      high24h: data.high ?? (data.close ?? 0) + 3,
      low24h: data.low ?? (data.close ?? 0) - 3,
      volume: data.volume ?? 0,
      bid: (data.price ?? data.close ?? 0) - 0.05,
      ask: (data.price ?? data.close ?? 0) + 0.05,
      spread: data.spread ?? 0.5,
    };

    cache = { data: result, ts: Date.now() };
    return NextResponse.json(result);
  } catch (err) {
    // Return stale cache if available
    if (cache) {
      return NextResponse.json({ ...cache.data, _cached: true });
    }
    return NextResponse.json(
      { success: false, error: 'Price unavailable' },
      { status: 503 },
    );
  }
}
