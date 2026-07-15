import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CACHE_TTL = 60_000;
let cache: { data: any; ts: number } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const res = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/DX-Y.NYB?interval=1h&range=5d',
      { signal: AbortSignal.timeout(8_000) },
    );

    if (!res.ok) {
      if (cache) return NextResponse.json(cache.data);
      return NextResponse.json(
        { success: false, error: 'DXY source unavailable' },
        { status: 503 },
      );
    }

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) {
      if (cache) return NextResponse.json(cache.data);
      return NextResponse.json(
        { success: false, error: 'No DXY data' },
        { status: 503 },
      );
    }

    const timestamps: number[] = result.timestamp || [];
    const quote = result.indicators?.quote?.[0];
    if (!quote || !timestamps.length) {
      if (cache) return NextResponse.json(cache.data);
      return NextResponse.json(
        { success: false, error: 'Malformed DXY data' },
        { status: 503 },
      );
    }

    const candles = timestamps.map((t: number, i: number) => ({
      time: t,
      open: quote.open[i] ?? 0,
      high: quote.high[i] ?? 0,
      low: quote.low[i] ?? 0,
      close: quote.close[i] ?? 0,
      volume: quote.volume[i] ?? 0,
    })).filter((c: any) => c.close > 0);

    const data = { success: true, symbol: 'DX-Y.NYB', candles };
    cache = { data, ts: Date.now() };
    return NextResponse.json(data);
  } catch {
    if (cache) return NextResponse.json({ ...cache.data, _cached: true });
    return NextResponse.json(
      { success: false, error: 'DXY source unreachable' },
      { status: 503 },
    );
  }
}
