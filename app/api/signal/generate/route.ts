import { NextResponse } from 'next/server';
import { generateSignal, fetchCandlesMulti, CONFIG } from '@/lib/signal-engine';
import type { CandleData } from '@/lib/signal-engine';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

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

    const allCandles = await fetchFn();
    const memoizedFetch = async () => allCandles || {};
    const [signal, message] = await generateSignal(memoizedFetch, useAdaptiveParams);

    if (!signal) {
      return NextResponse.json({ success: false, signal: null, message });
    }

    // Dashboard signals: short validity (30 min)
    const shortenedValidUntil = new Date(Date.now() + 30 * 60 * 1000);
    const signalOutput = {
      ...signal,
      timestamp: signal.timestamp.toISOString(),
      valid_until: shortenedValidUntil.toISOString(),
      order_type: signal.order_type || 'market',
      entry_trigger: signal.entry_trigger || signal.entries[0]?.price || 0,
    };

    try {
      const db = getAdminDb();
      const signalData = {
        id: signal.id,
        userId: 'dashboard',
        timestamp: FieldValue.serverTimestamp(),
        confirmed: false,
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
        validUntil: shortenedValidUntil,
        confidence: signal.confidence,
        rrRatio: signal.rr_ratio,
        description: signal.description,
        signalType: signal.signal_type,
        tp1: signal.tp1,
        tp2: signal.tp2,
        macroTrend: signal.macro_trend,
        orderType: signal.order_type || 'market',
        entryTrigger: signal.entry_trigger || signal.entries[0]?.price || null,
        status: 'active',
        outcome: null,
        deliveredVia: 'dashboard',
        deliveredAt: FieldValue.serverTimestamp(),
      };
      await db.collection('signals').doc(signal.id).set(signalData);
    } catch (err) {
      console.error('Failed to save signal to Firestore:', err);
    }

    return NextResponse.json({
      success: true,
      signal: signalOutput,
      message,
    });
  } catch (error) {
    console.error('Signal generation error:', error);
    return NextResponse.json(
      { success: false, signal: null, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
