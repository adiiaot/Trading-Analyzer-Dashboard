import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { fetchCurrentPrice } from '@/lib/signal-engine';
import { CONFIG } from '@/lib/signal-engine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const price = await fetchCurrentPrice();
    const sessionWindow = `${CONFIG.SESSION_START_UTC}:00 – ${CONFIG.SESSION_END_UTC}:00 UTC`;

    let activeSignals: any[] = [];
    let todayTrades: any[] = [];
    try {
      const db = getAdminDb();
      const [sigSnapshot, tradeSnapshot] = await Promise.all([
        db.collection('signals')
          .where('status', '==', 'active')
          .orderBy('timestamp', 'desc')
          .limit(5)
          .get(),
        db.collection('trades')
          .where('status', '==', 'closed')
          .orderBy('timestamp', 'desc')
          .limit(100)
          .get(),
      ]);
      activeSignals = sigSnapshot.docs.map(d => d.data());
      todayTrades = tradeSnapshot.docs.map(d => d.data());
    } catch {
      // Firestore unavailable — return brief without Firestore data
    }

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const todayClosed = todayTrades.filter((t: any) => {
      const ts = t.timestamp?.toDate?.() || new Date(t.timestamp);
      return ts.toISOString().slice(0, 10) === todayStr;
    });

    const wins = todayClosed.filter((t: any) => t.result === 'win');
    const losses = todayClosed.filter((t: any) => t.result === 'loss');
    const totalPnl = todayClosed.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0);

    const brief = {
      price: price ?? 0,
      priceChange24h: 0,
      priceChangePercent24h: 0,
      high24h: 0,
      low24h: 0,
      activeSignals: activeSignals.length,
      activeSignalDetails: activeSignals.slice(0, 3).map((s: any) => ({
        trend: s.trend || 'N/A',
        confidence: s.confidence || 0,
        entry: s.entries?.[0]?.price || 0,
      })),
      todayTrades: {
        count: todayClosed.length,
        wins: wins.length,
        losses: losses.length,
        totalPnl: Math.round(totalPnl * 100) / 100,
      },
      sessionWindow,
    };

    return NextResponse.json({ success: true, brief });
  } catch (error) {
    console.error('Brief error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate brief' },
      { status: 500 }
    );
  }
}
