import { CandleData, SignalResult, TrendEnum } from './types';
import { CONFIG } from './config';
import { generateSignal } from './signal-generator';
import { fetchCandlesMulti } from './hyperliquid-client';

const MAX_CANDLES_PER_TF = 5000;
const BACKTEST_TIMEOUT_MS = 300_000;
const ENTRY_CANDLES_MIN = 60;

interface BacktestOutcome {
  outcome: string;
  realizedR: number;
}

interface TrendBreak {
  full_win: number;
  partial_win: number;
  loss: number;
  expired: number;
  count: number;
}

function timeframeSeconds(tf: string): number {
  const unit = tf[tf.length - 1];
  const num = parseInt(tf.slice(0, -1), 10);
  if (unit === 'm') return num * 60;
  if (unit === 'h') return num * 3600;
  if (unit === 'd') return num * 86400;
  return 300;
}

function applySlippage(price: number, isBuy: boolean, slippage: number): number {
  return isBuy ? price + slippage : price - slippage;
}

function simulateMultiTP(
  entryPrice: number,
  stopLoss: number,
  takeProfit: number,
  takeProfit2: number | null,
  timestamp: number,
  validUntil: number,
  futureCandles: CandleData[],
  direction: string,
): BacktestOutcome {
  const isLong = direction.toUpperCase() === 'LONG';
  let tpHit1 = false;

  for (const candle of futureCandles) {
    if (candle.time > validUntil) break;

    const high = candle.high;
    const low = candle.low;

    if (isLong) {
      if (low <= stopLoss) {
        return tpHit1
          ? { outcome: 'partial_win', realizedR: 0.5 }
          : { outcome: 'loss', realizedR: -1.0 };
      }
      if (!tpHit1 && high >= takeProfit) {
        tpHit1 = true;
        if (takeProfit2 !== null && high >= takeProfit2) {
          return { outcome: 'full_win', realizedR: 2.0 };
        }
      }
      if (tpHit1 && takeProfit2 !== null && high >= takeProfit2) {
        return { outcome: 'full_win', realizedR: 2.0 };
      }
    } else {
      if (high >= stopLoss) {
        return tpHit1
          ? { outcome: 'partial_win', realizedR: 0.5 }
          : { outcome: 'loss', realizedR: -1.0 };
      }
      if (!tpHit1 && low <= takeProfit) {
        tpHit1 = true;
        if (takeProfit2 !== null && low <= takeProfit2) {
          return { outcome: 'full_win', realizedR: 2.0 };
        }
      }
      if (tpHit1 && takeProfit2 !== null && low <= takeProfit2) {
        return { outcome: 'full_win', realizedR: 2.0 };
      }
    }
  }

  if (tpHit1) return { outcome: 'partial_win', realizedR: 0.5 };
  return { outcome: 'expired', realizedR: 0.0 };
}

function calibrateConfidence(results: any[]): Record<string, any> {
  const groups: Record<string, any> = {};

  for (const r of results) {
    const trend = r.trend || 'NEUTRAL';
    const adx = r.adx || 25;
    const signalType = r.signal_type || 'ema_bounce';
    const outcome = r.outcome || 'expired';

    const adxBucket = adx >= 35 ? 'strong' : adx >= 25 ? 'moderate' : 'weak';
    const key = JSON.stringify([trend, adxBucket, signalType]);

    if (!groups[key]) {
      groups[key] = { full_win: 0, partial_win: 0, loss: 0, expired: 0, count: 0 };
    }
    groups[key][outcome] += 1;
    groups[key].count += 1;
  }

  const calibration: Record<string, any> = {};
  for (const [key, data] of Object.entries(groups)) {
    const won = data.full_win + data.partial_win;
    const lost = data.loss;
    const decided = won + lost;
    if (decided > 0) {
      calibration[key] = {
        win_rate: Math.round((won / decided) * 10000) / 10000,
        partial_rate: Math.round((data.partial_win / decided) * 10000) / 10000,
        full_win_rate: Math.round((data.full_win / decided) * 10000) / 10000,
        total: data.count,
        decided,
      };
    }
  }
  return calibration;
}

function monteCarloSimulate(
  tradeRValues: number[],
  numSimulations: number = 10000,
  confidenceLevel: number = 0.95,
): Record<string, any> {
  const n = tradeRValues.length;
  if (n === 0) {
    return {
      error: 'No trades to simulate',
      num_simulations: 0,
      win_rate: {}, profit_factor: {}, avg_realized_r: {},
    };
  }

  const alpha = (1 - confidenceLevel) / 2;
  const lowerPct = alpha * 100;
  const upperPct = (1 - alpha) * 100;

  const winRates: number[] = [];
  const profitFactors: number[] = [];
  const avgRs: number[] = [];
  const maxDrawdowns: number[] = [];

  for (let sim = 0; sim < numSimulations; sim++) {
    const sample: number[] = [];
    for (let i = 0; i < n; i++) {
      sample.push(tradeRValues[Math.floor(Math.random() * n)]);
    }

    const wins = sample.filter(r => r > 0).length;
    const losses = sample.filter(r => r < 0).length;
    const decided = wins + losses;
    const wr = decided > 0 ? wins / decided : 0;
    winRates.push(wr);

    const grossWin = sample.filter(r => r > 0).reduce((s, r) => s + r, 0);
    const grossLoss = Math.abs(sample.filter(r => r < 0).reduce((s, r) => s + r, 0));
    const pf = grossLoss > 0 ? grossWin / grossLoss : 0;
    profitFactors.push(pf);

    const avgR = sample.reduce((s, r) => s + r, 0) / sample.length;
    avgRs.push(avgR);

    let equity = 0;
    let peak = 0;
    let dd = 0;
    for (const r of sample) {
      equity += r;
      if (equity > peak) peak = equity;
      const drawdown = (peak - equity) / (peak + 1e-10) * 100;
      if (drawdown > dd) dd = drawdown;
    }
    maxDrawdowns.push(dd);
  }

  function stats(values: number[]): Record<string, number> {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const mean = sorted.reduce((s, v) => s + v, 0) / n;
    const median = sorted[Math.floor(n / 2)];
    const variance = sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
    const std = Math.sqrt(variance);
    return {
      mean: Math.round(mean * 10000) / 10000,
      median: Math.round(median * 10000) / 10000,
      std: Math.round(std * 10000) / 10000,
      min: Math.round(sorted[0] * 10000) / 10000,
      max: Math.round(sorted[n - 1] * 10000) / 10000,
      [`p${Math.round(lowerPct)}`]: Math.round(sorted[Math.max(0, Math.floor(n * alpha))] * 10000) / 10000,
      [`p${Math.round(upperPct)}`]: Math.round(sorted[Math.min(n - 1, Math.floor(n * (1 - alpha)) - 1)] * 10000) / 10000,
    };
  }

  return {
    num_simulations: numSimulations,
    confidence_level: confidenceLevel,
    sample_size: n,
    win_rate: stats(winRates),
    profit_factor: stats(profitFactors),
    avg_realized_r: stats(avgRs),
    max_drawdown_pct: stats(maxDrawdowns),
  };
}

export async function runBacktest(
  months: number,
  applySessionFilter: boolean,
  useAdaptiveParams: boolean = false,
  enableMc: boolean = false,
): Promise<{ success: boolean; report?: any; monte_carlo?: any; error?: string }> {
  const end = Date.now();
  const start = end - months * 30 * 24 * 3600 * 1000;

  const months4h = months * 30 * 6;
  const months1h = months * 30 * 24;
  const months15m = months * 30 * 24 * 4;

  const reqs: Record<string, number> = {
    [CONFIG.MACRO_TIMEFRAME]: Math.min(months * 30 + 55, MAX_CANDLES_PER_TF),
    [CONFIG.REGIME_TIMEFRAME]: Math.min(months4h + 100, MAX_CANDLES_PER_TF),
    [CONFIG.TREND_TIMEFRAME]: Math.min(months1h + 100, MAX_CANDLES_PER_TF),
    [CONFIG.ENTRY_TIMEFRAME]: Math.min(months15m + 500, MAX_CANDLES_PER_TF),
  };

  let fetched: Record<string, CandleData[] | null>;
  try {
    fetched = await fetchCandlesMulti(reqs);
  } catch {
    return { success: false, error: 'Hyperliquid data fetch timed out — try fewer months' };
  }

  const candlesMacroRaw = fetched[CONFIG.MACRO_TIMEFRAME] || [];
  const candlesRegimeRaw = fetched[CONFIG.REGIME_TIMEFRAME] || [];
  const candlesTrendRaw = fetched[CONFIG.TREND_TIMEFRAME] || [];
  const candlesEntryRaw = fetched[CONFIG.ENTRY_TIMEFRAME] || [];

  if (candlesRegimeRaw.length === 0 || candlesEntryRaw.length === 0) {
    return { success: false, error: 'Failed to fetch historical data — Hyperliquid may be unreachable or try fewer months' };
  }

  const startTs = Math.floor(start / 1000);
  const endTs = Math.floor(end / 1000);
  const candlesEntry = candlesEntryRaw.filter(c => c.time >= startTs && c.time <= endTs);

  if (candlesEntry.length < ENTRY_CANDLES_MIN) {
    return { success: false, error: `Only ${candlesEntry.length} ${CONFIG.ENTRY_TIMEFRAME} candles available (need ≥${ENTRY_CANDLES_MIN}). Try fewer months or a smaller lookback.` };
  }

  let totalSignals = 0;
  const outcomes: Record<string, number> = { full_win: 0, partial_win: 0, loss: 0, expired: 0 };
  const trendBreakdown: Record<string, TrendBreak> = {};
  const rrrValues: number[] = [];
  const tradeRValues: number[] = [];

  const minHistory = CONFIG.ENTRY_CANDLES + 5;
  let lastBarTime = 0;
  const rejectionLog: Record<string, number> = {};

  const startTime = Date.now();

  for (let i = minHistory; i < candlesEntry.length; i++) {
    if (Date.now() - startTime > BACKTEST_TIMEOUT_MS) {
      break;
    }

    const nowTs = candlesEntry[i].time;
    const nowDt = new Date(nowTs * 1000);

    if (applySessionFilter) {
      const hour = nowDt.getUTCHours();
      if (!(CONFIG.LONDON_NY_OVERLAP_START_UTC <= hour && hour < CONFIG.LONDON_NY_OVERLAP_END_UTC)) {
        continue;
      }
    }

    if (totalSignals >= 1000) break;

    const barSeconds = timeframeSeconds(CONFIG.ENTRY_TIMEFRAME);
    const currentBarTime = Math.floor(nowTs / barSeconds) * barSeconds;
    if (currentBarTime === lastBarTime) continue;
    lastBarTime = currentBarTime;

    const histMacro = candlesMacroRaw.filter(c => c.time <= nowTs);
    const histRegime = candlesRegimeRaw.filter(c => c.time <= nowTs);
    const histTrend = candlesTrendRaw.filter(c => c.time <= nowTs);
    const histEntry = candlesEntryRaw.filter(c => c.time <= nowTs);

    if (histRegime.length < 30 || histEntry.length < minHistory) {
      rejectionLog['insufficient_history'] = (rejectionLog['insufficient_history'] || 0) + 1;
      continue;
    }

    const mockFetch = async () => ({
      [CONFIG.MACRO_TIMEFRAME]: histMacro.slice(-Math.min(histMacro.length, CONFIG.MACRO_CANDLES)),
      [CONFIG.REGIME_TIMEFRAME]: histRegime.slice(-Math.min(histRegime.length, CONFIG.REGIME_CANDLES)),
      [CONFIG.TREND_TIMEFRAME]: histTrend.slice(-Math.min(histTrend.length, CONFIG.TREND_CANDLES)),
      [CONFIG.ENTRY_TIMEFRAME]: histEntry.slice(-Math.min(histEntry.length, CONFIG.ENTRY_CANDLES)),
    });

    let signal: SignalResult | null = null;
    let message: string;
    try {
      [signal, message] = await generateSignal(mockFetch, useAdaptiveParams);
    } catch {
      rejectionLog['exception'] = (rejectionLog['exception'] || 0) + 1;
      continue;
    }

    if (!signal) {
      const rejKey = message ? message.substring(0, 60) : 'unknown';
      rejectionLog[rejKey] = (rejectionLog[rejKey] || 0) + 1;
      continue;
    }

    totalSignals += 1;
    const trend = signal.trend;

    const futureCandles = candlesEntryRaw.filter(c => c.time > nowTs);
    const direction = trend === TrendEnum.UP ? 'LONG' : 'SHORT';
    const entryPoint = signal.entries[0];
    const tp1 = signal.tp1 || entryPoint.tp;
    const tp2 = signal.tp2;
    const entryPrice = entryPoint.price;
    const sl = signal.stop_loss;

    const validityHours = signal.signal_type === 'ema_bounce'
      ? CONFIG.EMA_BOUNCE_VALIDITY_HOURS
      : CONFIG.BREAKOUT_VALIDITY_HOURS;
    const validUntil = nowTs + validityHours * 3600;

    const { outcome, realizedR } = simulateMultiTP(
      entryPrice, sl, tp1, tp2, nowTs, validUntil, futureCandles, direction,
    );

    outcomes[outcome] = (outcomes[outcome] || 0) + 1;

    if (!trendBreakdown[trend]) {
      trendBreakdown[trend] = { full_win: 0, partial_win: 0, loss: 0, expired: 0, count: 0 };
    }
    trendBreakdown[trend][outcome as keyof TrendBreak] += 1;
    trendBreakdown[trend].count += 1;

    rrrValues.push(signal.rr_ratio);
    tradeRValues.push(realizedR);
  }

  const confidenceCalibration = calibrateConfidence(
    tradeRValues.map((r, idx) => ({
      realized_r: r,
      outcome: r > 0 ? (r >= 2 ? 'full_win' : r >= 0.5 ? 'partial_win' : 'win') : r < 0 ? 'loss' : 'expired',
    }))
  );

  const total = totalSignals;
  const fullWins = outcomes['full_win'] || 0;
  const partialWins = outcomes['partial_win'] || 0;
  const losses = outcomes['loss'] || 0;
  const expired = outcomes['expired'] || 0;
  const won = fullWins + partialWins;
  const decided = won + losses;

  const winRate = decided > 0 ? won / decided : 0;
  const lossRate = decided > 0 ? losses / decided : 0;
  const expireRate = total > 0 ? expired / total : 0;

  const grossWinR = tradeRValues.filter(r => r > 0).reduce((s, r) => s + r, 0);
  const grossLossR = Math.abs(tradeRValues.filter(r => r < 0).reduce((s, r) => s + r, 0));
  const profitFactor = grossLossR > 0 ? grossWinR / grossLossR : 0;

  const avgRrAll = rrrValues.length > 0 ? rrrValues.reduce((s, r) => s + r, 0) / rrrValues.length : 0;
  const avgRealizedR = tradeRValues.length > 0 ? tradeRValues.reduce((s, r) => s + r, 0) / tradeRValues.length : 0;

  const trendBreakdownOutput: Record<string, any> = {};
  for (const [trend, data] of Object.entries(trendBreakdown)) {
    const tWon = data.full_win + data.partial_win;
    const tLost = data.loss;
    const tDecided = tWon + tLost;
    const tWinRate = tDecided > 0 ? tWon / tDecided : 0;
    trendBreakdownOutput[trend] = {
      signals: data.count,
      full_win: data.full_win,
      partial_win: data.partial_win,
      loss: data.loss,
      expired: data.expired,
      win_rate: Math.round(tWinRate * 10000) / 10000,
    };
  }

  const report = {
    backtest_date: new Date().toISOString(),
    use_adaptive_params: useAdaptiveParams,
    session_filter_applied: applySessionFilter,
    timeframes: {
      macro: CONFIG.MACRO_TIMEFRAME,
      regime: CONFIG.REGIME_TIMEFRAME,
      trend: CONFIG.TREND_TIMEFRAME,
      entry: CONFIG.ENTRY_TIMEFRAME,
    },
    entry_bar: CONFIG.ENTRY_TIMEFRAME,
    total_signals: total,
    full_win: fullWins,
    partial_win: partialWins,
    loss: losses,
    expired,
    win_rate: Math.round(winRate * 10000) / 10000,
    full_win_rate: Math.round((fullWins / (decided || 1)) * 10000) / 10000,
    loss_rate: Math.round(lossRate * 10000) / 10000,
    expire_rate: Math.round(expireRate * 10000) / 10000,
    avg_rr_planned: Math.round(avgRrAll * 100) / 100,
    avg_realized_r: Math.round(avgRealizedR * 10000) / 10000,
    profit_factor: Math.round(profitFactor * 100) / 100,
    gross_win_r: Math.round(grossWinR * 100) / 100,
    gross_loss_r: Math.round(grossLossR * 100) / 100,
    trend_breakdown: trendBreakdownOutput,
    confidence_calibration: confidenceCalibration,
    meets_target: winRate >= 0.50 && profitFactor >= 1.5 && total >= 50,
  };

  const result: { success: boolean; report: any; monte_carlo?: any } = {
    success: true,
    report,
  };

  if (enableMc && tradeRValues.length > 0) {
    result.monte_carlo = monteCarloSimulate(tradeRValues, 10000, 0.95);
  }

  return result;
}
