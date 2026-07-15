import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitCount = parseInt(searchParams.get('limit') || '100');

    const db = getAdminDb();
    const snapshot = await db
      .collection('trades')
      .orderBy('timestamp', 'desc')
      .limit(limitCount)
      .get();

    const trades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, trades });
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entryPrice, exitPrice, direction, result, quantity = 0.01, notes, signalId } = body;

    if (!entryPrice || !exitPrice || !direction || !result) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: entryPrice, exitPrice, direction, result' },
        { status: 400 }
      );
    }

    const pnl = direction === 'LONG'
      ? (exitPrice - entryPrice) * quantity * 100
      : (entryPrice - exitPrice) * quantity * 100;
    const pnlPercent = entryPrice > 0 ? (pnl / (entryPrice * quantity)) * 100 : 0;
    const trend = direction === 'LONG' ? 'UP' : 'DOWN';
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const tradeId = `trade_${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}_${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}`;

    const tradeData = {
      tradeId,
      userId: 'dashboard',
      timestamp: FieldValue.serverTimestamp(),
      entryPrice,
      exitPrice,
      entrySize: quantity,
      entryTime: now.toISOString(),
      exitTime: now.toISOString(),
      pnl: Math.round(pnl * 100) / 100,
      pnlPercent: Math.round(pnlPercent * 100) / 100,
      result: result === 'win' ? 'win' : 'loss',
      status: 'closed',
      trend,
      supportLevel: 0,
      resistanceLevel: 0,
      stopLoss: 0,
      takeProfit: 0,
      riskRewardRatio: 0,
      signalId: signalId || '',
      journalNotes: notes || '',
      tradingConditions: '',
      holdTimeSeconds: null,
    };

    const db = getAdminDb();
    await db.collection('trades').doc(tradeId).set(tradeData);

    return NextResponse.json({
      success: true,
      id: tradeId,
      pnl: tradeData.pnl,
      pnlPercent: tradeData.pnlPercent,
      message: `Trade logged: ${result.toUpperCase()} $${Math.abs(tradeData.pnl).toFixed(2)}`,
    });
  } catch (error) {
    console.error('Error logging trade:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log trade' },
      { status: 500 }
    );
  }
}
