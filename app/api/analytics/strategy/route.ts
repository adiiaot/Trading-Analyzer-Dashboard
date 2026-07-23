import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

const STRATEGY_LABELS: Record<string, string> = {
  ema_bounce: 'EMA Bounce',
  consolidation_breakout: 'Consolidation Breakout',
  trend_continuation: 'Trend Continuation',
  unknown: 'Manual / Other',
};

export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection('trades')
      .orderBy('timestamp', 'desc')
      .limit(500)
      .get();

    const allTrades = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    const imported = allTrades.filter(
      (t: any) => t.source === 'mt5' || t.source === 'csv_import' || t.signalType
    );

    if (imported.length === 0) {
      return NextResponse.json({
        success: true,
        strategies: [],
        totalTrades: 0,
        overallWinRate: 0,
        overallProfitFactor: 0,
        totalProfit: 0,
        message: 'No imported trades found. Import trades first via MT5 connector or CSV upload.',
      });
    }

    const byStrategy: Record<string, any[]> = {};
    for (const t of imported) {
      const st = (t as any).signalType || 'unknown';
      if (!byStrategy[st]) byStrategy[st] = [];
      byStrategy[st].push(t);
    }

    const strategies = Object.entries(byStrategy).map(([key, trades]) => {
      const wins = trades.filter((t: any) => t.result === 'win' || t.pnl > 0);
      const losses = trades.filter((t: any) => t.result === 'loss' || t.pnl <= 0);
      const total = trades.length;
      const totalProfit = trades.reduce((s: number, t: any) => s + (t.pnl || 0), 0);
      const grossWin = wins.reduce((s: number, t: any) => s + (t.pnl || 0), 0);
      const grossLoss = Math.abs(losses.reduce((s: number, t: any) => s + (t.pnl || 0), 0));

      return {
        strategy: key,
        label: STRATEGY_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
        totalTrades: total,
        wins: wins.length,
        losses: losses.length,
        winRate: total ? parseFloat(((wins.length / total) * 100).toFixed(1)) : 0,
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        profitFactor: grossLoss > 0 ? parseFloat((grossWin / grossLoss).toFixed(2)) : grossWin > 0 ? grossWin : 0,
        avgProfit: total ? parseFloat((totalProfit / total).toFixed(2)) : 0,
      };
    });

    strategies.sort((a, b) => b.totalTrades - a.totalTrades);

    const allWins = imported.filter((t: any) => t.result === 'win' || t.pnl > 0).length;
    const allTotal = imported.length;
    const allProfit = imported.reduce((s: number, t: any) => s + (t.pnl || 0), 0);
    const allGrossWin = imported.filter((t: any) => t.pnl > 0).reduce((s: number, t: any) => s + (t.pnl || 0), 0);
    const allGrossLoss = Math.abs(imported.filter((t: any) => t.pnl <= 0).reduce((s: number, t: any) => s + (t.pnl || 0), 0));

    return NextResponse.json({
      success: true,
      strategies,
      totalTrades: allTotal,
      overallWinRate: allTotal ? parseFloat(((allWins / allTotal) * 100).toFixed(1)) : 0,
      overallProfitFactor: allGrossLoss > 0 ? parseFloat((allGrossWin / allGrossLoss).toFixed(2)) : 0,
      totalProfit: parseFloat(allProfit.toFixed(2)),
    });
  } catch (error) {
    console.error('Strategy analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compute strategy analytics' },
      { status: 500 }
    );
  }
}
