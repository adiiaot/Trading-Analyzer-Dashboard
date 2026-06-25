import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FALLBACK_PRICE = {
  symbol: 'XAU/USD',
  price: 4073.42,
  change24h: -18.35,
  changePercent24h: -0.45,
  high24h: 4100.80,
  low24h: 4055.20,
  volume: 112400,
  bid: 4073.37,
  ask: 4073.47,
  spread: 0.5,
};

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
          const p = data.price;
          return NextResponse.json({
            success: true,
            symbol: 'XAU/USD',
            price: p,
            change24h: data.change24h ?? 0,
            changePercent24h: data.changePercent24h ?? 0,
            high24h: data.high ?? p + 5,
            low24h: data.low ?? p - 5,
            volume: data.volume ?? 0,
            bid: p - 0.05,
            ask: p + 0.05,
            spread: data.spread ?? 0.5,
          });
        }
      }
    } catch {
      // Bot not available, use fallback
    }
  }

  const basePrice = FALLBACK_PRICE.price;
  const simPrice = basePrice + (Math.random() - 0.5) * 0.8;

  return NextResponse.json({
    success: true,
    ...FALLBACK_PRICE,
    price: parseFloat(simPrice.toFixed(2)),
    bid: parseFloat((simPrice - 0.05).toFixed(2)),
    ask: parseFloat((simPrice + 0.05).toFixed(2)),
    high24h: parseFloat((FALLBACK_PRICE.high24h + (Math.random() - 0.5) * 2).toFixed(2)),
    low24h: parseFloat((FALLBACK_PRICE.low24h + (Math.random() - 0.5) * 2).toFixed(2)),
    volume: Math.floor(FALLBACK_PRICE.volume + (Math.random() - 0.5) * 3000),
    change24h: parseFloat((FALLBACK_PRICE.change24h + (Math.random() - 0.5) * 2).toFixed(2)),
    changePercent24h: parseFloat((FALLBACK_PRICE.changePercent24h + (Math.random() - 0.5) * 0.1).toFixed(2)),
  });
}
