import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const YAHOO_SYMBOLS = ['GC=F', 'XAUUSD=X'];
const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

export async function GET() {
  for (const sym of YAHOO_SYMBOLS) {
    try {
      const res = await fetch(`${YAHOO_BASE}/${sym}?interval=1m&range=1d`, {
        signal: AbortSignal.timeout(5_000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!res.ok) continue;

      const json = await res.json();
      const result = json?.chart?.result?.[0];
      if (!result) continue;

      const meta = result.meta;
      const price = meta.regularMarketPrice;
      const prevClose = meta.previousClose;
      const change24h = price - prevClose;
      const changePercent24h = (change24h / prevClose) * 100;

      return NextResponse.json({
        success: true,
        symbol: 'XAU/USD',
        price,
        change24h: parseFloat(change24h.toFixed(2)),
        changePercent24h: parseFloat(changePercent24h.toFixed(2)),
        high24h: meta.regularMarketDayHigh ?? price + 5,
        low24h: meta.regularMarketDayLow ?? price - 5,
        volume: meta.regularMarketVolume ?? 0,
        bid: price - 0.05,
        ask: price + 0.05,
        spread: 0.5,
      });
    } catch {
      continue;
    }
  }

  return NextResponse.json(
    { success: false, error: 'No price data source available' },
    { status: 503 },
  );
}
