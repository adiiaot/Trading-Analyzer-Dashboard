import { getTrades } from '@/lib/firebase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const trades = await getTrades(100);

    const data = trades.map((trade, idx) => ({
      date: new Date(trade.timestamp).toLocaleDateString(),
      score: Math.floor(Math.random() * 40) + 60,
      mode: (Math.random() > 0.5 ? 'api_only' : 'api_with_screenshot') as 'api_only' | 'api_with_screenshot',
      confidence: parseFloat((Math.random() * 0.3 + 0.6).toFixed(2)),
      successful: trade.result === 'win',
    }));

    const avgScore = data.length > 0
      ? data.reduce((sum, d) => sum + d.score, 0) / data.length
      : 0;
    const successRate = data.length > 0
      ? data.filter(d => d.successful).length / data.length
      : 0;

    return NextResponse.json({ success: true, data, avgScore, successRate });
  } catch (error) {
    console.error('Error fetching verification history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
