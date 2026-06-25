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

    const wins = trades.filter((t: any) => t.result === 'win');
    const losses = trades.filter((t: any) => t.result === 'loss');
    const total_pnl = trades.reduce((sum: number, t: any) => sum + (t.pnl ?? 0), 0);
    const win_pnl = wins.reduce((sum: number, t: any) => sum + (t.pnl ?? 0), 0);
    const loss_pnl = losses.reduce((sum: number, t: any) => sum + Math.abs(t.pnl ?? 0), 0);

    const stats = {
      total_trades: trades.length,
      wins: wins.length,
      losses: losses.length,
      win_rate: trades.length > 0 ? wins.length / trades.length : 0,
      total_pnl: parseFloat(total_pnl.toFixed(2)),
      profit_factor: loss_pnl > 0 ? parseFloat((win_pnl / loss_pnl).toFixed(2)) : 0,
      avg_win: wins.length > 0 ? parseFloat((win_pnl / wins.length).toFixed(2)) : 0,
      avg_loss: losses.length > 0 ? parseFloat((loss_pnl / losses.length).toFixed(2)) : 0,
      consecutive_wins: 0,
      consecutive_losses: 0,
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Error calculating stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate stats' },
      { status: 500 }
    );
  }
}
