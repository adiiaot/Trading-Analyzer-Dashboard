import { CandleData, TrendEnum, SignalResult, SignalEntry, MacroTrend, RegimeOverrides } from './types';
import { calculateATR, calculateEMA, calculateADX, calculateRSI, calculateBollingerBands, calculateSMA } from './indicators';
import { findSwingHighs, findSwingLows } from './swings';
import { getRegimeOverrides } from './market-cycle';
import { getMacroTrend } from './macro-trend';
import { CONFIG } from './config';
export { sessionTracker } from './session-tracker';
import { l2Client } from './l2-client';
import { evaluateMicrostructure } from './microstructure';
import { loadModel, predictDirection, isModelLoaded, getModelThreshold } from '../ml/inference';
import { MLModel } from '../ml/types';

const RSI_PERIOD = 14;
const RSI_OVERBOUGHT = 72;
const RSI_OVERSOLD = 30;
const BB_PERIOD = 20;
let BB_STD = 2.0;

export const sweepConfig: {
  BB_STD?: number;
  RSI_OVERBOUGHT?: number;
  RSI_OVERSOLD?: number;
  STRICT_MODE?: boolean;
  STRICT_KEEP_BREAKOUT?: boolean;
  STRICT_KEEP_TREND_CONT?: boolean;
} = {};
let l2ConfidenceBoost = 0;
export let lastL2Signal: string = '';

function roundPrice(p: number): number {
  return Math.round(p * 100) / 100;
}

function calcConfidence(trendClarity: number, rrRatio: number, adxValue: number, macro: MacroTrend): number {
  let score = trendClarity * 0.35;
  score += Math.min(rrRatio / 3, 1) * 0.30;
  score += Math.min(adxValue / 50, 1) * 0.35;
  if (macro.trend !== 'NEUTRAL') score += 0.05;
  if (macro.price_sma_pct > 0.02) score += 0.05;
  return Math.round(Math.min(score, 1) * 100) / 100;
}

function findTP(
  entry: number,
  trend: TrendEnum,
  candles: CandleData[],
  sh: number[],
  sl: number[],
  risk: number
): number {
  let nearestResistance: number | null = null;
  let nearestSupport: number | null = null;

  if (trend === TrendEnum.UP && sh.length > 0) {
    for (let i = sh.length - 1; i >= 0; i--) {
      const level = candles[sh[i]].high;
      if (level > entry) {
        nearestResistance = level;
        break;
      }
    }
  }

  if (trend === TrendEnum.DOWN && sl.length > 0) {
    for (let i = sl.length - 1; i >= 0; i--) {
      const level = candles[sl[i]].low;
      if (level < entry) {
        nearestSupport = level;
        break;
      }
    }
  }

  const tpBuffer = calculateATR(candles, CONFIG.ATR_PERIOD) ?? 0;
  const tpBuf = tpBuffer * CONFIG.TP_BUFFER_ATR;

  if (trend === TrendEnum.UP && nearestResistance !== null) {
    return nearestResistance + tpBuf;
  }
  if (trend === TrendEnum.DOWN && nearestSupport !== null) {
    return nearestSupport - tpBuf;
  }
  return entry + CONFIG.TP_FALLBACK_R_MULTIPLE * risk * (trend === TrendEnum.UP ? 1 : -1);
}

function buildSignal(
  signalType: string,
  trend: TrendEnum,
  entryPrice: number,
  stopLoss: number,
  takeProfit: number,
  rrRatio: number,
  confidence: number,
  adxValue: number,
  atr: number,
  validityHours: number,
  macroTrend: string,
  trendCandles: CandleData[],
  indicatorSummary: string = '',
): SignalResult {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const signalId = `signal_${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}_${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}`;

  const numEntries = CONFIG.NUM_ENTRIES;
  let entrySpacing = CONFIG.ENTRY_SPACING_ATR * atr;
  if (entrySpacing <= 0) entrySpacing = 0.5;

  const last5 = trendCandles.slice(-5);
  const pullbackLow = Math.min(...last5.map(c => c.low));
  const pullbackHigh = Math.max(...last5.map(c => c.high));

  const entries: SignalEntry[] = [];
  for (let i = 0; i < numEntries; i++) {
    let ePrice: number;
    if (trend === TrendEnum.UP) {
      ePrice = i > 0 ? entryPrice - entrySpacing * i * 0.5 : entryPrice;
      ePrice = Math.max(ePrice, pullbackLow);
    } else {
      ePrice = i > 0 ? entryPrice + entrySpacing * i * 0.5 : entryPrice;
      ePrice = Math.min(ePrice, pullbackHigh);
    }

    const tpBump = entrySpacing * i * 0.3;
    const eTP = takeProfit + (trend === TrendEnum.UP ? tpBump : -tpBump);

    const eTPRounded = roundPrice(eTP);
    const ePriceRounded = roundPrice(ePrice);
    const eTPPips = CONFIG.PIP_VALUE > 0 ? Math.floor(Math.abs(eTPRounded - ePriceRounded) / CONFIG.PIP_VALUE) : 0;

    entries.push({
      entry_number: i + 1,
      price: ePriceRounded,
      tp: eTPRounded,
      tp_pips: eTPPips,
      auto_close: false,
    });
  }

  const support = roundPrice(Math.min(entryPrice, pullbackLow, stopLoss));
  const resistance = roundPrice(Math.max(entryPrice, pullbackHigh, takeProfit));

  let tp2: number | null = null;
  const tpDist = Math.abs(takeProfit - entryPrice);
  if (trend === TrendEnum.UP && tpDist > 0) {
    tp2 = roundPrice(takeProfit + (takeProfit - entryPrice) * 0.5);
  } else if (trend === TrendEnum.DOWN && tpDist > 0) {
    tp2 = roundPrice(takeProfit - (entryPrice - takeProfit) * 0.5);
  }

  const typeLabel = signalType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const entriesDesc = entries.map(e =>
    `E${e.entry_number}@${e.price.toFixed(2)} TP${e.tp.toFixed(2)}(R:${(Math.abs(e.tp - e.price) / Math.abs(e.price - stopLoss)).toFixed(1)})`
  ).join('; ');
  const indLine = indicatorSummary ? `IND: ${indicatorSummary} | ` : '';
  const description = `${indLine}${typeLabel}: ${trend.toLowerCase()} trend, ${numEntries} entries: ${entriesDesc} (ADX ${adxValue.toFixed(1)}, daily macro ${macroTrend})`;

  return {
    id: signalId,
    timestamp: now,
    trend,
    entries,
    stop_loss: stopLoss,
    support_level: support,
    resistance_level: resistance,
    pullback_detected: true,
    entry_confirmation: true,
    valid_until: new Date(now.getTime() + validityHours * 3600000),
    confidence,
    rr_ratio: rrRatio,
    description,
    signal_type: signalType,
    tp1: roundPrice(takeProfit),
    tp2,
    macro_trend: macroTrend,
  };
}

function checkIndicators(candles: CandleData[], direction: 'UP' | 'DOWN'): [boolean, string] {
  const rsi = calculateRSI(candles, RSI_PERIOD);
  const rsiOb = sweepConfig.RSI_OVERBOUGHT ?? RSI_OVERBOUGHT;
  const rsiOs = sweepConfig.RSI_OVERSOLD ?? RSI_OVERSOLD;
  const bbStd = sweepConfig.BB_STD ?? BB_STD;
  const bb = calculateBollingerBands(candles, BB_PERIOD, bbStd);
  const currentPrice = candles[candles.length - 1].close;

  const parts: string[] = [];
  if (rsi !== null) parts.push(`RSI=${rsi.toFixed(1)}`);
  if (bb) parts.push(`BB=$${bb.middle.toFixed(1)}-$${bb.upper.toFixed(1)}`);

  if (direction === 'UP') {
    if (rsi !== null && rsi > rsiOb) return [false, `RSI overbought (${rsi.toFixed(1)}) — no LONG`];
    if (bb && currentPrice > bb.upper) return [false, `Price above upper BB ($${currentPrice.toFixed(2)} > $${bb.upper.toFixed(2)})`];
  } else {
    if (rsi !== null && rsi < rsiOs) return [false, `RSI oversold (${rsi.toFixed(1)}) — no SHORT`];
    if (bb && currentPrice < bb.lower) return [false, `Price below lower BB ($${currentPrice.toFixed(2)} < $${bb.lower.toFixed(2)})`];
  }

  return [true, parts.join('; ') || 'Indicators neutral'];
}

function checkMomentum(candles: CandleData[], direction: 'UP' | 'DOWN', required: number = 1): boolean {
  if (candles.length < 4) {
    if (candles.length < 2) return true;
    const last = candles[candles.length - 1].close;
    const prev = candles[candles.length - 2].close;
    return direction === 'UP' ? last > prev : last < prev;
  }
  const last4 = candles.slice(-4);
  let aligned = 0;
  for (let i = 1; i < last4.length; i++) {
    const rising = last4[i].close > last4[i - 1].close;
    if (direction === 'UP' && rising) aligned++;
    if (direction === 'DOWN' && !rising) aligned++;
  }
  return aligned >= required;
}

function applyConfidenceBoost(signal: SignalResult): void {
  if (l2ConfidenceBoost > 0) {
    signal.confidence = Math.min(1, signal.confidence + l2ConfidenceBoost);
    signal.description = signal.description
      ? `L2: continuation ✓ | ${signal.description}`
      : 'L2: continuation ✓';
    l2ConfidenceBoost = 0;
  }
}

let mlInitAttempted = false;

async function initML(): Promise<void> {
  if (mlInitAttempted || isModelLoaded()) return;
  mlInitAttempted = true;
  try {
    const res = await fetch('/ml/model_weights.json');
    if (res.ok) {
      const model: MLModel = await res.json();
      loadModel(model);
      console.log('[ML] Model loaded:', model.metadata);
    }
  } catch {
    // Model file not found — inference silently skipped
  }
}

function extractMLFeatures(
  entryCandles: CandleData[],
  trendCandles: CandleData[],
  regimeCandles: CandleData[],
  macroCandles: CandleData[],
): Record<string, number> {
  const currentPrice = entryCandles[entryCandles.length - 1].close;

  const atr = calculateATR(entryCandles, CONFIG.ATR_PERIOD) ?? 0;
  const rsi = calculateRSI(entryCandles, 14) ?? 50;
  const bb = calculateBollingerBands(entryCandles, 20, 2.0);
  const adx = calculateADX(regimeCandles.length > 30 ? regimeCandles : entryCandles, 14) ?? 25;

  const trendCloses = trendCandles.map(c => c.close);
  const ema20Arr = calculateEMA(trendCloses, 20);
  const ema20 = ema20Arr.length > 0 ? ema20Arr[ema20Arr.length - 1] : currentPrice;

  const entryCloses = entryCandles.map(c => c.close);
  const ema50Arr = calculateEMA(entryCloses, 50);
  const ema50 = ema50Arr.length > 0 ? ema50Arr[ema50Arr.length - 1] : ema20;
  const ema200Arr = calculateEMA(entryCloses, 200);
  const ema200 = ema200Arr.length > 0 ? ema200Arr[ema200Arr.length - 1] : ema50;

  const macroCloses = macroCandles.map(c => c.close);
  const sma50 = calculateSMA(macroCloses.length > 50 ? macroCloses : entryCloses, 50) ?? ema50;

  const priceDistEma20 = atr > 0 ? (currentPrice - ema20) / atr : 0;
  const priceDistEma50 = atr > 0 ? (currentPrice - ema50) / atr : 0;
  const ema20DistEma50 = atr > 0 ? (ema20 - ema50) / atr : 0;

  const prev20 = entryCandles.slice(-21, -1);
  const range20 = prev20.length > 0
    ? Math.max(...prev20.map(c => c.high)) - Math.min(...prev20.map(c => c.low))
    : 0;
  const prev5 = entryCandles.slice(-6, -1);
  const range5 = prev5.length > 0
    ? Math.max(...prev5.map(c => c.high)) - Math.min(...prev5.map(c => c.low))
    : 0;

  const body = Math.abs(currentPrice - (entryCandles[entryCandles.length - 1]?.open ?? currentPrice));
  const high = entryCandles[entryCandles.length - 1]?.high ?? currentPrice;
  const low = entryCandles[entryCandles.length - 1]?.low ?? currentPrice;
  const hlRange = high - low;
  const bodyPct = hlRange > 0 ? body / hlRange : 0.5;
  const upperWickPct = hlRange > 0 ? (high - Math.max(currentPrice, entryCandles[entryCandles.length - 1]?.open ?? currentPrice)) / hlRange : 0;
  const lowerWickPct = hlRange > 0 ? (Math.min(currentPrice, entryCandles[entryCandles.length - 1]?.open ?? currentPrice) - low) / hlRange : 0;

  const vol3 = entryCandles.slice(-4);
  const vol3Change = vol3.length >= 2
    ? (vol3[vol3.length - 1].close - vol3[0].close) / (vol3[0].close || 1)
    : 0;

  const dt = new Date();
  const hour = dt.getUTCHours();
  const dayOfWeek = dt.getUTCDay();

  return {
    atr: atr || 0,
    ema20: ema20 || 0,
    ema50: ema50 || 0,
    ema200: ema200 || 0,
    sma50: sma50 || 0,
    rsi: rsi || 50,
    bb_upper: bb?.upper ?? 0,
    bb_middle: bb?.middle ?? 0,
    bb_lower: bb?.lower ?? 0,
    bb_width: bb && bb.middle > 0 ? (bb.upper - bb.lower) / bb.middle : 0,
    bb_pct: bb && bb.upper > bb.lower ? (currentPrice - bb.lower) / (bb.upper - bb.lower) : 0.5,
    adx: adx || 25,
    price_dist_ema20_atr: priceDistEma20,
    price_dist_ema50_atr: priceDistEma50,
    ema20_dist_ema50_atr: ema20DistEma50,
    range_5: range5,
    range_20: range20,
    range_5_atr: atr > 0 ? range5 / atr : 0,
    range_20_atr: atr > 0 ? range20 / atr : 0,
    body_pct: bodyPct,
    upper_wick_pct: upperWickPct,
    lower_wick_pct: lowerWickPct,
    vol3_change: vol3Change,
    hour,
    day_of_week: dayOfWeek,
    london_session: hour >= 8 && hour < 17 ? 1 : 0,
    ny_session: hour >= 13 && hour < 21 ? 1 : 0,
    asian_session: hour >= 0 && hour < 9 ? 1 : 0,
  };
}

export async function generateSignal(
  fetchFn: () => Promise<Record<string, CandleData[] | null>>,
  useAdaptiveParams: boolean = false,
): Promise<[SignalResult | null, string]> {
  try {
    const dfs = await fetchFn();
    if (!dfs) return [null, 'Failed to fetch market data for all timeframes.'];

    // Lazy-init ML model (loads once from public/ml/model_weights.json)
    if (!mlInitAttempted) initML().catch(() => {});

    const macro = getMacroTrend(dfs[CONFIG.MACRO_TIMEFRAME] || []);
    const regimeCandles = dfs[CONFIG.REGIME_TIMEFRAME] || [];
    const trendCandles = dfs[CONFIG.TREND_TIMEFRAME] || [];
    const entryCandles = dfs[CONFIG.ENTRY_TIMEFRAME] || [];

    if (regimeCandles.length < 30 || trendCandles.length < 20 || entryCandles.length < 10) {
      return [null, 'Insufficient market data for analysis.'];
    }

    // Stage -1: L2 Microstructure Pre-Filter
    l2ConfidenceBoost = 0;
    if (CONFIG.ENABLE_L2_FILTER) {
      const l2Metrics = l2Client.getMetrics();
      if (l2Metrics) {
        const l2Signal = evaluateMicrostructure(l2Metrics);
        lastL2Signal = `${l2Signal.signal} (${l2Signal.probability}%): ${l2Signal.evidence.join(', ')}`;
        if (l2Signal.signal === 'reversal' && l2Signal.probability > CONFIG.L2_REVERSAL_THRESHOLD) {
          return [null, `L2 microstructure: liquidity withdrawing — reversal pattern (${l2Signal.evidence.join(', ')})`];
        }
        if (l2Signal.signal === 'continuation' && l2Signal.probability > CONFIG.L2_CONTINUATION_THRESHOLD) {
          l2ConfidenceBoost = CONFIG.L2_CONTINUATION_BOOST;
        }
      } else {
        lastL2Signal = 'L2: waiting for data...';
      }
    }

    // Stage 0: ML Direction Prediction
    let mlDirection: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL';
    let mlProbability = 0;
    if (isModelLoaded() && entryCandles.length >= 100) {
      const features = extractMLFeatures(entryCandles, trendCandles, regimeCandles, dfs[CONFIG.MACRO_TIMEFRAME] || []);
      const mlResult = predictDirection(features);
      mlDirection = mlResult.direction;
      mlProbability = mlResult.probability;
    }

    const overrides: RegimeOverrides = useAdaptiveParams
      ? getRegimeOverrides(regimeCandles, trendCandles)
      : {};

    const rejectionReasons: string[] = [];

    // Try EMA bounce. If ML predicts a direction with positive confidence,
    // restrict to ML direction first. Otherwise try default direction then opposite.
    if (CONFIG.ENABLE_EMA_BOUNCE) {
      const mlOverride = mlDirection !== 'NEUTRAL'
        ? (mlDirection === 'LONG' ? TrendEnum.UP : TrendEnum.DOWN)
        : null;

      if (mlOverride !== null) {
        const result = await tryEMABounce(regimeCandles, trendCandles, entryCandles, macro, overrides, mlOverride);
        if (result[0]) {
          applyConfidenceBoost(result[0]);
          return [result[0], `ML ${mlDirection} ${result[1]}`];
        }
        rejectionReasons.push(`ML ${mlDirection}: ${result[1]}`);
      } else {
        const result = await tryEMABounce(regimeCandles, trendCandles, entryCandles, macro, overrides);
        if (result[0]) {
          applyConfidenceBoost(result[0]);
          return result;
        }
        rejectionReasons.push(result[1]);

        // Try opposite direction if neutral and first attempt failed
        if (mlDirection === 'NEUTRAL') {
          const opposite = await tryEMABounce(regimeCandles, trendCandles, entryCandles, macro, overrides, null, true);
          if (opposite[0]) {
            applyConfidenceBoost(opposite[0]);
            return opposite;
          }
        }
      }
    }

    if (CONFIG.ENABLE_SESSION_BREAKOUT && (!sweepConfig.STRICT_MODE || sweepConfig.STRICT_KEEP_BREAKOUT)) {
      const result = await tryConsolidationBreakout(regimeCandles, entryCandles, macro, overrides);
      if (result[0]) {
        applyConfidenceBoost(result[0]);
        return result;
      }
      rejectionReasons.push(result[1]);
    }

    if (CONFIG.ENABLE_TREND_CONTINUATION && (!sweepConfig.STRICT_MODE || sweepConfig.STRICT_KEEP_TREND_CONT)) {
      const result = await tryTrendContinuation(regimeCandles, trendCandles, entryCandles, macro, overrides);
      if (result[0]) {
        applyConfidenceBoost(result[0]);
        return result;
      }
      rejectionReasons.push(result[1]);
    }

    l2ConfidenceBoost = 0;
    return [null, `No signal conditions met. ${rejectionReasons.join(' | ')}`];
  } catch (err) {
    return [null, `Error: ${err instanceof Error ? err.message : String(err)}`];
  }
}

// ── Strategy 1: EMA Bounce ──────────────────────────────────────────
// ADX >= 25, price within 0.1-2.0x ATR of EMA20, momentum aligned
// Works: BOTH directions, softened momentum

async function tryEMABounce(
  regimeCandles: CandleData[],
  trendCandles: CandleData[],
  entryCandles: CandleData[],
  macro: MacroTrend,
  overrides: RegimeOverrides,
  mlOverride: TrendEnum | null = null,
  forceOpposite: boolean = false,
): Promise<[SignalResult | null, string]> {
  const currentPrice = entryCandles[entryCandles.length - 1].close;
  const regimeAdxThreshold = overrides.regime_adx_threshold ?? CONFIG.REGIME_ADX_THRESHOLD;

  const adxValue = calculateADX(regimeCandles, CONFIG.REGIME_ADX_PERIOD);
  if (adxValue === null || adxValue < regimeAdxThreshold) {
    return [null, `EMA bounce: ADX ${adxValue?.toFixed(1) ?? 'N/A'} < ${regimeAdxThreshold}`];
  }

  const trendCloses = trendCandles.map(c => c.close);
  const ema20Arr = calculateEMA(trendCloses, CONFIG.EMA_BOUNCE_PERIOD);
  if (ema20Arr.length === 0) return [null, 'EMA bounce: EMA(20) not available'];
  const ema20 = ema20Arr[ema20Arr.length - 1];
  if (ema20 <= 0) return [null, 'EMA bounce: EMA(20) not valid'];

  const atr = calculateATR(trendCandles, CONFIG.ATR_PERIOD);
  if (atr === null || atr <= 0) return [null, 'EMA bounce: ATR not available'];

  const priceDist = Math.abs(currentPrice - ema20);
  const minDist = overrides.min_dist_atr ?? CONFIG.EMA_BOUNCE_MIN_DIST_ATR;
  const maxDist = overrides.max_dist_atr ?? CONFIG.EMA_BOUNCE_MAX_DIST_ATR;

  if (priceDist < minDist * atr) {
    return [null, `EMA bounce: price too close to EMA (${priceDist.toFixed(2)} < ${minDist}×ATR)`];
  }
  if (priceDist > maxDist * atr) {
    return [null, `EMA bounce: price too far from EMA (${priceDist.toFixed(2)} > ${maxDist}×ATR)`];
  }

  // Determine trend: ML override takes priority, then force opposite, then default
  let trend: TrendEnum;
  if (mlOverride !== null) {
    trend = mlOverride;
  } else if (forceOpposite) {
    trend = currentPrice >= ema20 ? TrendEnum.DOWN : TrendEnum.UP;
  } else {
    trend = currentPrice >= ema20 ? TrendEnum.UP : TrendEnum.DOWN;
  }

  const momentumOk = checkMomentum(entryCandles, trend === TrendEnum.UP ? 'UP' : 'DOWN');

  const [indicatorOk, indicatorSummary] = checkIndicators(trendCandles, trend === TrendEnum.UP ? 'UP' : 'DOWN');

  const slAtr = overrides.sl_atr_multiple ?? CONFIG.SL_ATR_MULTIPLE;
  const risk = atr * slAtr;
  const stopLoss = trend === TrendEnum.UP ? ema20 - risk : ema20 + risk;

  const sh = findSwingHighs(trendCandles, CONFIG.SWING_LOOKBACK_N);
  const sl = findSwingLows(trendCandles, CONFIG.SWING_LOOKBACK_N);
  const takeProfit = findTP(currentPrice, trend, trendCandles, sh, sl, risk);

  const rr = Math.abs(takeProfit - currentPrice) / Math.abs(currentPrice - stopLoss);
  const minRRR = overrides.min_rrr ?? CONFIG.MIN_RRR;
  if (rr < minRRR) {
    return [null, `EMA bounce: R:R ${rr.toFixed(2)} below min ${minRRR.toFixed(2)}`];
  }

  if (sweepConfig.STRICT_MODE) {
    if (!indicatorOk) {
      return [null, `EMA bounce strict: indicators block (${indicatorSummary})`];
    }
    if (macro.trend !== 'NEUTRAL') {
      const macroDirection = macro.trend === 'UP' ? TrendEnum.UP : TrendEnum.DOWN;
      if (trend !== macroDirection) {
        return [null, `EMA bounce strict: macro trend ${macro.trend} opposes ${trend}`];
      }
    }
  }

  const trendClarity = Math.min(adxValue / 50, 0.8);
  let confidence = calcConfidence(trendClarity, rr, adxValue, macro);
  if (!indicatorOk) confidence *= 0.5;
  if (!momentumOk) confidence *= 0.7;

  const signal = buildSignal(
    'ema_bounce', trend, currentPrice, roundPrice(stopLoss),
    roundPrice(takeProfit), rr, confidence, adxValue, atr,
    CONFIG.EMA_BOUNCE_VALIDITY_HOURS, macro.trend, trendCandles, indicatorSummary
  );
  return [signal, `EMA bounce ${trend} signal ready`];
}

// ── Strategy 2: Consolidation Breakout ──────────────────────────────
// Detects recent price range from last N candles, fires on breakout
// Works 24/5, BOTH directions, no Asian session dependency

async function tryConsolidationBreakout(
  regimeCandles: CandleData[],
  entryCandles: CandleData[],
  macro: MacroTrend,
  overrides: RegimeOverrides,
): Promise<[SignalResult | null, string]> {
  const currentPrice = entryCandles[entryCandles.length - 1].close;

  const lookback = CONFIG.CONSOLIDATION_LOOKBACK;
  const recent = entryCandles.slice(-lookback);
  if (recent.length < 10) return [null, 'Consolidation breakout: insufficient data'];

  const rangeHigh = Math.max(...recent.map(c => c.high));
  const rangeLow = Math.min(...recent.map(c => c.low));
  const rangeWidth = rangeHigh - rangeLow;

  if (rangeWidth <= 0) return [null, 'Consolidation breakout: invalid range'];

  const atr = calculateATR(entryCandles, CONFIG.ATR_PERIOD);
  if (atr === null || atr <= 0) return [null, 'Consolidation breakout: ATR not available'];

  const breakoutThreshold = atr * CONFIG.BREAKOUT_ATR_MULTIPLE;

  let trend: TrendEnum;
  let stopLoss: number;
  if (currentPrice > rangeHigh + breakoutThreshold) {
    trend = TrendEnum.UP;
    stopLoss = rangeLow - atr * 0.5;
  } else if (currentPrice < rangeLow - breakoutThreshold) {
    trend = TrendEnum.DOWN;
    stopLoss = rangeHigh + atr * 0.5;
  } else {
    return [null, `Consolidation breakout: price within range (${rangeLow.toFixed(2)}-${rangeHigh.toFixed(2)})`];
  }

  const adxValue = calculateADX(regimeCandles, CONFIG.REGIME_ADX_PERIOD);

  const [indicatorOk, indicatorSummary] = checkIndicators(
    regimeCandles.length > 0 ? regimeCandles : entryCandles,
    trend === TrendEnum.UP ? 'UP' : 'DOWN'
  );

  const risk = Math.abs(currentPrice - stopLoss);
  if (risk <= 0) return [null, 'Consolidation breakout: invalid SL distance'];

  const tpExtension = Math.max(rangeWidth * 1.5, atr * 2);
  const takeProfit = trend === TrendEnum.UP
    ? currentPrice + tpExtension
    : currentPrice - tpExtension;

  const minRRR = overrides.min_rrr ?? CONFIG.MIN_RRR;
  const rr = Math.abs(takeProfit - currentPrice) / risk;
  if (rr < minRRR) {
    return [null, `Consolidation breakout: R:R ${rr.toFixed(2)} below min ${minRRR.toFixed(2)}`];
  }

  const adxForConfidence = adxValue ?? 25;
  const trendClarity = Math.min(adxForConfidence / 50, 0.7);
  let confidence = calcConfidence(trendClarity + 0.1, rr, adxForConfidence, macro);
  if (!indicatorOk) confidence *= 0.5;

  const signal = buildSignal(
    'consolidation_breakout', trend, currentPrice, roundPrice(stopLoss),
    roundPrice(takeProfit), rr, confidence, adxForConfidence, atr,
    CONFIG.BREAKOUT_VALIDITY_HOURS, macro.trend, entryCandles, indicatorSummary
  );
  return [signal, `Consolidation breakout ${trend} signal ready`];
}

// ── Strategy 3: Trend Continuation ──────────────────────────────────
// Fallback for trending markets that don't meet EMA bounce or breakout
// Lower ADX threshold, wider EMA proximity, no momentum requirement

async function tryTrendContinuation(
  regimeCandles: CandleData[],
  trendCandles: CandleData[],
  entryCandles: CandleData[],
  macro: MacroTrend,
  overrides: RegimeOverrides,
): Promise<[SignalResult | null, string]> {
  const currentPrice = entryCandles[entryCandles.length - 1].close;

  const adxValue = calculateADX(regimeCandles, CONFIG.REGIME_ADX_PERIOD);
  const trendContAdx = CONFIG.TREND_CONT_ADX_THRESHOLD;
  if (adxValue === null || adxValue < trendContAdx) {
    return [null, `Trend continuation: ADX ${adxValue?.toFixed(1) ?? 'N/A'} < ${trendContAdx}`];
  }

  const trendCloses = trendCandles.map(c => c.close);
  const ema20Arr = calculateEMA(trendCloses, CONFIG.EMA_BOUNCE_PERIOD);
  if (ema20Arr.length === 0) return [null, 'Trend continuation: EMA(20) not available'];
  const ema20 = ema20Arr[ema20Arr.length - 1];
  if (ema20 <= 0) return [null, 'Trend continuation: EMA(20) not valid'];

  const trend = currentPrice >= ema20 ? TrendEnum.UP : TrendEnum.DOWN;

  const atr = calculateATR(trendCandles, CONFIG.ATR_PERIOD);
  if (atr === null || atr <= 0) return [null, 'Trend continuation: ATR not available'];

  // Wider proximity allowance than EMA bounce (up to 4x ATR)
  const priceDist = Math.abs(currentPrice - ema20);
  if (priceDist > 4 * atr) {
    return [null, `Trend continuation: price too far from EMA (${priceDist.toFixed(2)} > 4×ATR)`];
  }

  const [indicatorOk, indicatorSummary] = checkIndicators(trendCandles, trend === TrendEnum.UP ? 'UP' : 'DOWN');

  const slAtr = overrides.sl_atr_multiple ?? CONFIG.SL_ATR_MULTIPLE;
  const risk = atr * slAtr;
  const stopLoss = trend === TrendEnum.UP
    ? Math.min(ema20 - risk * 0.5, currentPrice - risk)
    : Math.max(ema20 + risk * 0.5, currentPrice + risk);

  const sh = findSwingHighs(trendCandles, CONFIG.SWING_LOOKBACK_N);
  const sl = findSwingLows(trendCandles, CONFIG.SWING_LOOKBACK_N);
  const takeProfit = findTP(currentPrice, trend, trendCandles, sh, sl, risk);

  const rr = Math.abs(takeProfit - currentPrice) / Math.abs(currentPrice - stopLoss);
  const minRRR = overrides.min_rrr ?? CONFIG.TREND_CONT_MIN_RRR;
  if (rr < minRRR) {
    return [null, `Trend continuation: R:R ${rr.toFixed(2)} below min ${minRRR.toFixed(2)}`];
  }

  const trendClarity = Math.min(adxValue / 50, 0.7);
  let confidence = calcConfidence(trendClarity, rr, adxValue, macro);
  if (!indicatorOk) confidence *= 0.5;

  const signal = buildSignal(
    'trend_continuation', trend, currentPrice, roundPrice(stopLoss),
    roundPrice(takeProfit), rr, confidence, adxValue, atr,
    CONFIG.EMA_BOUNCE_VALIDITY_HOURS, macro.trend, trendCandles, indicatorSummary
  );
  return [signal, `Trend continuation ${trend} signal ready`];
}
