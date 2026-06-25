import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FALLBACK_PRICE = {
  symbol: 'XAU/USD',
  price: 2335.80,
  change24h: 8.45,
  changePercent24h: 0.36,
  high24h: 2342.15,
  low24h: 2328.50,
  volume: 98500,
  bid: 2335.75,
  ask: 2335.85,
  spread: 0.5,
};

function generateHistoricalClose(): number {
  return 2330 + Math.random() * 20;
}

export async function GET() {
  const botApiUrl = process.env.NEXT_PUBLIC_BOT_API_URL;

  if (botApiUrl) {
    try {
      const res = await fetch(`${botApiUrl}/api/price?timeframe=1m&limit=1`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.price) {
          return NextResponse.json({
            success: true,
            symbol: 'XAU/USD',
            price: data.price,
            change24h: data.change24h ?? 0,
            changePercent24h: data.changePercent24h ?? 0,
            high24h: data.high ?? data.price + 5,
            low24h: data.low ?? data.price - 5,
            volume: data.volume ?? 0,
            bid: data.price - 0.05,
            ask: data.price + 0.05,
            spread: data.spread ?? 0.5,
          });
        }
      }
    } catch {
      // Bot not available, fall through to fallback
    }
  }

  const basePrice = FALLBACK_PRICE.price;
  const simPrice = basePrice + (Math.random() - 0.5) * 2;

  return NextResponse.json({
    success: true,
    ...FALLBACK_PRICE,
    price: parseFloat(simPrice.toFixed(2)),
    bid: parseFloat((simPrice - 0.05).toFixed(2)),
    ask: parseFloat((simPrice + 0.05).toFixed(2)),
    high24h: parseFloat((FALLBACK_PRICE.high24h + Math.random()).toFixed(2)),
    low24h: parseFloat((FALLBACK_PRICE.low24h - Math.random()).toFixed(2)),
    volume: Math.floor(FALLBACK_PRICE.volume + (Math.random() - 0.5) * 5000),
  });
}
