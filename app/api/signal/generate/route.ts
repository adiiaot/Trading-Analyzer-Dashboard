import { NextResponse } from 'next/server';
import { generateSignal, fetchCandlesMulti, CONFIG, checkDxyCorrelation } from '@/lib/signal-engine';
import type { CandleData, DxyState } from '@/lib/signal-engine';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

async function fetchDxyCandles(): Promise<CandleData[]> {
  try {
    const res = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/DX-Y.NYB?interval=1h&range=5d',
      { signal: AbortSignal.timeout(8_000) },
    );
    if (!res.ok) return [];
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return [];
    const timestamps: number[] = result.timestamp || [];
    const quote = result.indicators?.quote?.[0];
    if (!quote || !timestamps.length) return [];
    return timestamps.map((t: number, i: number) => ({
      time: t,
      open: quote.open[i] ?? 0,
      high: quote.high[i] ?? 0,
      low: quote.low[i] ?? 0,
      close: quote.close[i] ?? 0,
      volume: quote.volume[i] ?? 0,
    })).filter((c: CandleData) => c.close > 0);
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    let useAdaptiveParams = false;
    try {
      const body = await request.json();
      useAdaptiveParams = body?.useAdaptiveParams === true;
    } catch {}

    const fetchFn: () => Promise<Record<string, CandleData[] | null>> = async () => {
      const reqs: Record<string, number> = {
        [CONFIG.MACRO_TIMEFRAME]: CONFIG.MACRO_CANDLES,
        [CONFIG.REGIME_TIMEFRAME]: CONFIG.REGIME_CANDLES,
        [CONFIG.TREND_TIMEFRAME]: CONFIG.TREND_CANDLES,
        [CONFIG.ENTRY_TIMEFRAME]: CONFIG.ENTRY_CANDLES,
      };
      return await fetchCandlesMulti(reqs);
    };

    const [dxyCandles, allCandles] = await Promise.all([
      fetchDxyCandles(),
      fetchFn(),
    ]);

    let dxyState: DxyState | null = null;
    const goldTrendCandles = allCandles ? allCandles[CONFIG.TREND_TIMEFRAME] : null;
    if (dxyCandles.length >= 20 && goldTrendCandles && goldTrendCandles.length >= 20) {
      dxyState = await checkDxyCorrelation(dxyCandles, goldTrendCandles);
    }

    const memoizedFetch = async () => allCandles || {};
    const [signal, message] = await generateSignal(memoizedFetch, useAdaptiveParams, dxyCandles);

    if (!signal) {
      return NextResponse.json({ success: false, signal: null, message, dxyState });
    }

    try {
      const db = getAdminDb();
      const signalData = {
        id: signal.id,
        timestamp: FieldValue.serverTimestamp(),
        trend: signal.trend,
        entries: signal.entries.map(e => ({
          entryNumber: e.entry_number,
          price: e.price,
          tp: e.tp,
          tpPips: e.tp_pips,
          autoClose: e.auto_close,
        })),
        stopLoss: signal.stop_loss,
        supportLevel: signal.support_level,
        resistanceLevel: signal.resistance_level,
        pullbackDetected: signal.pullback_detected,
        entryConfirmation: signal.entry_confirmation,
        validUntil: signal.valid_until,
        confidence: signal.confidence,
        rrRatio: signal.rr_ratio,
        description: signal.description,
        signalType: signal.signal_type,
        tp1: signal.tp1,
        tp2: signal.tp2,
        macroTrend: signal.macro_trend,
        status: 'active',
        outcome: null,
        dxyState: dxyState || { trend: 'N/A', expectedGoldDirection: 'N/A', correlationConfirmed: false, summary: 'DXY data unavailable' },
        deliveredVia: 'dashboard',
        deliveredAt: FieldValue.serverTimestamp(),
      };
      await db.collection('signals').doc(signal.id).set(signalData);
    } catch (err) {
      console.error('Failed to save signal to Firestore:', err);
    }

    return NextResponse.json({
      success: true,
      signal: {
        ...signal,
        timestamp: signal.timestamp.toISOString(),
        valid_until: signal.valid_until.toISOString(),
      },
      dxyState,
      message,
    });
  } catch (error) {
    console.error('Signal generation error:', error);
    return NextResponse.json(
      { success: false, signal: null, dxyState: null, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
