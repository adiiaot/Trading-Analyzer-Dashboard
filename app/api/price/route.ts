import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BASE_PRICE = 4073.42;
let lastPrice = BASE_PRICE;
let drift = 0;

export async function GET() {
  const botApiUrl = process.env.NEXT_PUBLIC_BOT_API_URL;

  if (botApiUrl) {
    try {
      const res = await fetch(`${botApiUrl}/api/price?timeframe=1m&limit=1`, {
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.price) {
          lastPrice = data.price;
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
            spread: 0.5,
          });
        }
      }
    } catch {
      // fall through to simulated
    }
  }

  // Smooth walk: small random drift each call, mean-reverting toward BASE_PRICE
  drift += (Math.random() - 0.5) * 0.3;
  if (Math.random() < 0.02) drift = 0;
  const revertPull = (BASE_PRICE - lastPrice) * 0.001;
  const newPrice = lastPrice + drift + revertPull + (Math.random() - 0.5) * 0.08;
  lastPrice = parseFloat(newPrice.toFixed(2));

  const simHigh = parseFloat((lastPrice + Math.random() * 1.5 + 0.2).toFixed(2));
  const simLow = parseFloat((lastPrice - Math.random() * 1.5 - 0.2).toFixed(2));

  return NextResponse.json({
    success: true,
    symbol: 'XAU/USD',
    price: lastPrice,
    change24h: parseFloat((lastPrice - BASE_PRICE + (Math.random() - 0.5) * 0.5).toFixed(2)),
    changePercent24h: parseFloat((((lastPrice - BASE_PRICE) / BASE_PRICE) * 100 + (Math.random() - 0.5) * 0.02).toFixed(2)),
    high24h: simHigh,
    low24h: simLow,
    volume: Math.floor(100000 + Math.random() * 50000),
    bid: parseFloat((lastPrice - 0.05).toFixed(2)),
    ask: parseFloat((lastPrice + 0.05).toFixed(2)),
    spread: 0.5,
  });
}
