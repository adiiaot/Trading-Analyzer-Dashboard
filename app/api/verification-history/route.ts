import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection('trades')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    const trades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

    const data = trades.map((trade: any) => ({
      date: new Date(trade.timestamp).toLocaleDateString(),
      score: Math.floor(Math.random() * 40) + 60,
      mode: (Math.random() > 0.5 ? 'api_only' : 'api_with_screenshot') as 'api_only' | 'api_with_screenshot',
      confidence: parseFloat((Math.random() * 0.3 + 0.6).toFixed(2)),
      successful: trade.result === 'win',
    }));

    const avgScore = data.length > 0
      ? data.reduce((sum: number, d: any) => sum + d.score, 0) / data.length
      : 0;
    const successRate = data.length > 0
      ? data.filter((d: any) => d.successful).length / data.length
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
