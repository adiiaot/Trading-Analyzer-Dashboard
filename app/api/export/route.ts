import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const days = parseInt(searchParams.get('days') || '0');
    const userId = searchParams.get('userId') || 'dashboard';

    const db = getAdminDb();

    // Fetch signals and trades
    const signalsSnap = await db.collection('signals')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .get();

    const tradesSnap = await db.collection('trades')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .get();

    let signals = signalsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    let trades = tradesSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

    // Filter by date range
    if (days > 0) {
      const cutoff = new Date(Date.now() - days * 86400000);
      signals = signals.filter(s => s.timestamp?.toDate?.() >= cutoff || new Date(s.timestamp) >= cutoff);
      trades = trades.filter(t => t.timestamp?.toDate?.() >= cutoff || new Date(t.timestamp) >= cutoff);
    }

    // Build a map of signalId -> trade for joined data
    const tradeBySignalId: Record<string, any> = {};
    for (const t of trades) {
      if (t.signalId) tradeBySignalId[t.signalId] = t;
    }

    interface Row {
      date: string;
      strategy: string;
      direction: string;
      plannedEntry: number | null;
      plannedSL: number | null;
      plannedTP1: number | null;
      plannedTP2: number | null;
      rrRatio: number | null;
      confidence: number | null;
      mt5Entry: number | null;
      mt5Exit: number | null;
      mt5Slippage: number | null;
      outcome: string;
      realizedR: number | null;
      status: string;
      notes: string;
    }

    const rows: Row[] = [];

    for (const sig of signals) {
      const trade = tradeBySignalId[sig.id];
      const entry = sig.entries?.[0]?.price ?? null;
      const tp1 = sig.tp1 ?? sig.entries?.[0]?.tp ?? null;
      const tp2 = sig.tp2 ?? null;
      const sl = sig.stopLoss ?? null;

      const mt5Entry = sig.mt5EntryPrice ?? trade?.entryPrice ?? null;
      const mt5Exit = sig.mt5ExitPrice ?? trade?.exitPrice ?? null;
      const mt5Slippage = mt5Entry && entry ? Math.round(Math.abs(mt5Entry - entry) * 100) / 100 : null;

      rows.push({
        date: sig.timestamp?.toDate?.()?.toISOString()?.split('T')[0] ?? sig.timestamp?.split?.('T')[0] ?? '',
        strategy: sig.signal_type ?? sig.description?.split(':')[0]?.trim() ?? '',
        direction: sig.trend ?? '',
        plannedEntry: entry,
        plannedSL: sl,
        plannedTP1: tp1,
        plannedTP2: tp2,
        rrRatio: sig.rrRatio ?? null,
        confidence: sig.confidence ?? null,
        mt5Entry,
        mt5Exit,
        mt5Slippage,
        outcome: sig.outcome ?? (trade?.result === 'win' ? 'won' : trade?.result === 'loss' ? 'lost' : 'active'),
        realizedR: trade ? calcRealizedR(trade, sig) : null,
        status: sig.status ?? 'active',
        notes: sig.journalNotes ?? trade?.journalNotes ?? '',
      });
    }

    const csvHeader = 'Date,Strategy,Direction,PlannedEntry,PlannedSL,PlannedTP1,PlannedTP2,R:R,Confidence,MT5Entry,MT5Exit,MT5Slippage,Outcome,RealizedR,Status,Notes';
    const csvBody = rows.map(r => [
      r.date, r.strategy, r.direction, r.plannedEntry, r.plannedSL,
      r.plannedTP1, r.plannedTP2, r.rrRatio, r.confidence,
      r.mt5Entry, r.mt5Exit, r.mt5Slippage, r.outcome, r.realizedR,
      r.status, `"${(r.notes || '').replace(/"/g, '""')}"`,
    ].join(',')).join('\n');

    if (format === 'json') {
      return NextResponse.json({ success: true, count: rows.length, data: rows });
    }

    if (format === 'html') {
      const thead = csvHeader.split(',').map(h => `<th>${h}</th>`).join('');
      const tbody = rows.map(r => `<tr>${Object.values(r).map(v => `<td>${v ?? ''}</td>`).join('')}</tr>`).join('\n');
      return new Response(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>AOT Analyzer Performance Export</title>
        <style>body{font-family:monospace;padding:20px}table{border-collapse:collapse;width:100%}
        th,td{border:1px solid #ccc;padding:6px 10px;text-align:left}th{background:#080c24;color:#f0b429}
        tr:nth-child(even){background:#f5f5f5}</style></head>
        <body><h1>AOT Analyzer — Performance Export</h1>
        <p>${rows.length} signals · ${new Date().toISOString().split('T')[0]}</p>
        <table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Default: CSV
    return new Response(csvHeader + '\n' + csvBody, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="aot-analyzer-performance-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

function calcRealizedR(trade: any, signal: any): number | null {
  if (!trade?.entryPrice || !trade?.exitPrice) return null;
  const entry = signal.entries?.[0]?.price ?? trade.entryPrice;
  const sl = signal.stopLoss;
  if (!sl || !entry) return null;
  const risk = Math.abs(entry - sl);
  if (risk <= 0) return null;
  const direction = (signal.trend ?? trade.trend ?? '').toUpperCase();
  const pnl = direction === 'UP' || direction === 'LONG'
    ? trade.exitPrice - trade.entryPrice
    : trade.entryPrice - trade.exitPrice;
  return Math.round((pnl / risk) * 100) / 100;
}
