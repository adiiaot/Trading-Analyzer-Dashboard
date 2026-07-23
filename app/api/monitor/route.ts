import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getAdminDb();
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

    const snapshot = await db
      .collection('signals')
      .where('timestamp', '>=', sixMonthsAgo)
      .orderBy('timestamp', 'desc')
      .limit(500)
      .get();

    const signals: any[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data()?.timestamp?.toMillis?.() || doc.data()?.timestamp,
    }));

    const total = signals.length;
    const won = signals.filter(s => s.outcome === 'won').length;
    const lost = signals.filter(s => s.outcome === 'lost').length;
    const expired = signals.filter(s => s.status === 'expired').length;
    const active = signals.filter(s => s.status === 'active').length;
    const closed = signals.filter(s => s.status === 'closed').length;
    const outcomes = won + lost;
    const overallWinRate = outcomes > 0 ? won / outcomes : 0;

    const last50 = signals.filter(s => s.outcome === 'won' || s.outcome === 'lost').slice(0, 50);
    const rolling50Wr = last50.length > 0
      ? last50.filter(s => s.outcome === 'won').length / last50.length
      : 0;

    const byStrategy: Record<string, { won: number; lost: number; total: number; last30: string[] }> = {};
    for (const s of signals) {
      const st = s.signalType || 'unknown';
      if (!byStrategy[st]) byStrategy[st] = { won: 0, lost: 0, total: 0, last30: [] };
      byStrategy[st].total++;
      if (s.outcome === 'won') byStrategy[st].won++;
      if (s.outcome === 'lost') byStrategy[st].lost++;
      if (s.outcome === 'won' || s.outcome === 'lost') {
        byStrategy[st].last30.push(s.outcome);
      }
    }

    const strategyBreakdown: Record<string, { total: number; won: number; lost: number; winRate: number; last30WinRate: number }> = {};
    for (const [st, stats] of Object.entries(byStrategy)) {
      const totalS = stats.won + stats.lost;
      const last30 = stats.last30.slice(-30);
      const last30Won = last30.filter(o => o === 'won').length;
      strategyBreakdown[st] = {
        total: stats.total,
        won: stats.won,
        lost: stats.lost,
        winRate: totalS > 0 ? Math.round((stats.won / totalS) * 1000) / 1000 : 0,
        last30WinRate: last30.length > 0 ? Math.round((last30Won / last30.length) * 1000) / 1000 : 0,
      };
    }

    const byDirection: Record<string, { won: number; lost: number }> = {};
    for (const s of signals) {
      const dir = s.trend || 'unknown';
      if (!byDirection[dir]) byDirection[dir] = { won: 0, lost: 0 };
      if (s.outcome === 'won') byDirection[dir].won++;
      if (s.outcome === 'lost') byDirection[dir].lost++;
    }

    const directionBreakdown: Record<string, { won: number; lost: number; winRate: number }> = {};
    for (const [dir, stats] of Object.entries(byDirection)) {
      const totalD = stats.won + stats.lost;
      directionBreakdown[dir] = {
        won: stats.won,
        lost: stats.lost,
        winRate: totalD > 0 ? Math.round((stats.won / totalD) * 1000) / 1000 : 0,
      };
    }

    let mlHealth: Record<string, unknown> = { loaded: false };
    try {
      const mlPath = path.join(process.cwd(), 'public', 'ml', 'model_weights.json');
      if (fs.existsSync(mlPath)) {
        const raw = fs.readFileSync(mlPath, 'utf-8');
        const model = JSON.parse(raw);
        mlHealth = {
          loaded: true,
          metadata: model.metadata || {},
          featureCount: model.feature_names?.length || 0,
          layerCount: model.layers?.length || 0,
        };
      }
    } catch { /* ignore */ }

    return NextResponse.json({
      success: true,
      totalSignals: total,
      won,
      lost,
      expired,
      active,
      closed,
      overallWinRate: Math.round(overallWinRate * 1000) / 1000,
      rolling50WinRate: Math.round(rolling50Wr * 1000) / 1000,
      strategyBreakdown,
      directionBreakdown,
      mlHealth,
    });
  } catch (error) {
    console.error('Error fetching monitor metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch monitoring metrics' },
      { status: 500 },
    );
  }
}
