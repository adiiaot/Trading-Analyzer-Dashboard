import { NextResponse } from 'next/server';
import { runBacktest } from '@/lib/signal-engine/backtester';

export const dynamic = 'force-dynamic';
// Vercel: 60s (Hobby), 300s (Pro), 900s (Enterprise)
export const maxDuration = 300;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months') || '12', 10);
    const sessionFilter = searchParams.get('sessionFilter') === 'true';
    const mc = searchParams.get('mc') === 'true';

    const result = await runBacktest(months, sessionFilter, false, mc);

    return NextResponse.json(result, {
      status: result.success ? 200 : 503,
    });
  } catch (error: any) {
    console.error('Backtest error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Backtest failed' },
      { status: 500 }
    );
  }
}
