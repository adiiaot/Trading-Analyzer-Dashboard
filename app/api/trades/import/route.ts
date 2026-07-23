import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

function parseMT5CSV(content: string, userLabel = 'betatester') {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const colMap: Record<string, number> = {};

  const nameMap: Record<string, string[]> = {
    symbol: ['symbol', 'pair', 'instrument'],
    direction: ['direction', 'type', 'side'],
    entryPrice: ['entry price', 'open price', 'entryprice'],
    exitPrice: ['exit price', 'close price', 'exitprice'],
    profit: ['profit', 'pnl'],
    volume: ['volume', 'lots', 'size'],
    entryTime: ['entry time', 'open time', 'entrytime'],
    exitTime: ['exit time', 'close time', 'exittime'],
  };

  for (const [key, names] of Object.entries(nameMap)) {
    for (let i = 0; i < headers.length; i++) {
      if (names.includes(headers[i])) {
        colMap[key] = i;
        break;
      }
    }
  }

  const trades: any[] = [];
  for (let r = 1; r < lines.length; r++) {
    const cols = lines[r].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    try {
      const symbol = (cols[colMap.symbol] || 'XAUUSD').toUpperCase();
      if (!symbol.includes('XAU') && !symbol.includes('GOLD')) continue;

      const directionRaw = (cols[colMap.direction] || 'buy').toLowerCase();
      const direction = directionRaw === 'buy' || directionRaw === 'long' ? 'LONG' : 'SHORT';
      const entryPrice = parseFloat(cols[colMap.entryPrice] || '0');
      const exitPrice = parseFloat(cols[colMap.exitPrice] || '0');
      if (!entryPrice || !exitPrice) continue;

      const profit = parseFloat(cols[colMap.profit] || '0');
      const volume = parseFloat(cols[colMap.volume] || '0.01');

      trades.push({
        entryPrice, exitPrice, direction, profit, volume,
        userLabel,
        source: 'csv_import',
        signalType: 'unknown',
        signalId: '',
      });
    } catch { }
  }

  return trades;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userLabel = (formData.get('userLabel') as string) || 'betatester';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const content = await file.text();
    const trades = parseMT5CSV(content, userLabel);

    if (trades.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No XAUUSD trades found in CSV. Check column names.' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    let saved = 0;

    for (const trade of trades) {
      try {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const tradeId = `import_${userLabel}_${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}_${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}_${saved}`;

        const tradeData = {
          tradeId,
          userId: 'dashboard',
          timestamp: FieldValue.serverTimestamp(),
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          entrySize: trade.volume,
          pnl: trade.profit,
          pnlPercent: 0,
          result: trade.profit > 0 ? 'win' : 'loss',
          status: 'closed',
          direction: trade.direction,
          source: 'csv_import',
          userLabel: trade.userLabel,
          signalType: trade.signalType,
          signalId: trade.signalId,
          holdTimeSeconds: null,
          importedAt: now.toISOString(),
        };

        await db.collection('trades').doc(tradeId).set(tradeData);
        saved++;
      } catch (e) {
        console.error('Save error:', e);
      }
    }

    const wins = trades.filter((t: any) => t.profit > 0).length;
    const total = trades.length;

    return NextResponse.json({
      success: true,
      imported: saved,
      matched: 0,
      userLabel,
      totalTrades: total,
      winRate: total ? parseFloat(((wins / total) * 100).toFixed(1)) : 0,
      message: `Imported ${saved} XAUUSD trades${userLabel !== 'betatester' ? ` for ${userLabel}` : ''}`,
    });
  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import CSV' },
      { status: 500 }
    );
  }
}
