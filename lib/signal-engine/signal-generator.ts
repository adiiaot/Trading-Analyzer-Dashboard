import { CandleData, TrendEnum, SignalResult, SignalEntry, MacroTrend, RegimeOverrides } from './types';
import { calculateATR, calculateEMA, calculateADX, calculateRSI, calculateBollingerBands } from './indicators';
import { findSwingHighs, findSwingLows } from './swings';
import { getRegimeOverrides } from './market-cycle';
import { getMacroTrend } from './macro-trend';
import { sessionTracker } from './session-tracker';
import { CONFIG } from './config';

const RSI_PERIOD = 14;
const RSI_OVERBOUGHT = 72;
const RSI_OVERSOLD = 30;
const BB_PERIOD = 20;
let BB_STD = 2.0;

export const sweepConfig: { BB_STD?: number; RSI_OVERBOUGHT?: number; RSI_OVERSOLD?: number } = {};

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

function checkIndicators(trendCandles: CandleData[]): [boolean, string] {
  const rsi = calculateRSI(trendCandles, RSI_PERIOD);
  if (rsi !== null) {
    const rsiOb = sweepConfig.RSI_OVERBOUGHT ?? RSI_OVERBOUGHT;
    const rsiOs = sweepConfig.RSI_OVERSOLD ?? RSI_OVERSOLD;
    if (rsi > rsiOb) return [false, `RSI overbought (${rsi.toFixed(1)}) — no LONG`];
    if (rsi < rsiOs) return [false, `RSI oversold (${rsi.toFixed(1)}) — no LONG`];
  }
  const bbStd = sweepConfig.BB_STD ?? BB_STD;
  const bb = calculateBollingerBands(trendCandles, BB_PERIOD, bbStd);
  if (bb) {
    const currentPrice = trendCandles[trendCandles.length - 1].close;
    if (currentPrice > bb.upper) return [false, `Price above upper BB ($${currentPrice.toFixed(2)} > $${bb.upper.toFixed(2)})`];
  }
  const parts: string[] = [];
  if (rsi !== null) parts.push(`RSI=${rsi.toFixed(1)}`);
  if (bb) parts.push(`BB=$${bb.middle.toFixed(1)}-$${bb.upper.toFixed(1)}`);
  return [true, parts.join('; ') || 'Indicators neutral'];
}

export async function generateSignal(
  fetchFn: () => Promise<Record<string, CandleData[] | null>>,
  useAdaptiveParams: boolean = false,
): Promise<[SignalResult | null, string]> {
  try {
    const dfs = await fetchFn();
    if (!dfs) return [null, 'Failed to fetch market data for all timeframes.'];

    const macro = getMacroTrend(dfs[CONFIG.MACRO_TIMEFRAME] || []);
    const regimeCandles = dfs[CONFIG.REGIME_TIMEFRAME] || [];
    const trendCandles = dfs[CONFIG.TREND_TIMEFRAME] || [];
    const entryCandles = dfs[CONFIG.ENTRY_TIMEFRAME] || [];

    if (regimeCandles.length < 30 || trendCandles.length < 20 || entryCandles.length < 10) {
      return [null, 'Insufficient market data for analysis.'];
    }

    // Stage 0: Multi-Indicator Confirmation (RSI + BB)
    let indicatorSummary = '';
    if (trendCandles.length >= 30) {
      const [passes, summary] = checkIndicators(trendCandles);
      if (!passes) return [null, `Indicator filter: ${summary}`];
      indicatorSummary = summary;
    }

    const overrides: RegimeOverrides = useAdaptiveParams
      ? getRegimeOverrides(regimeCandles, trendCandles)
      : {};

    if (CONFIG.ENABLE_EMA_BOUNCE) {
      const result = await tryEMABounce(regimeCandles, trendCandles, entryCandles, macro, overrides, indicatorSummary);
      if (result[0]) return result;
    }

    if (CONFIG.ENABLE_SESSION_BREAKOUT) {
      const result = await trySessionBreakout(regimeCandles, entryCandles, macro, overrides, indicatorSummary);
      if (result[0]) return result;
    }

    return [null, 'No signal conditions met.'];
  } catch (err) {
    return [null, `Error: ${err instanceof Error ? err.message : String(err)}`];
  }
}

async function tryEMABounce(
  regimeCandles: CandleData[],
  trendCandles: CandleData[],
  entryCandles: CandleData[],
  macro: MacroTrend,
  overrides: RegimeOverrides,
  indicatorSummary: string = '',
): Promise<[SignalResult | null, string]> {
  const currentPrice = entryCandles[entryCandles.length - 1].close;
  const regimeAdxThreshold = overrides.regime_adx_threshold ?? CONFIG.REGIME_ADX_THRESHOLD;

  const adxValue = calculateADX(regimeCandles, CONFIG.REGIME_ADX_PERIOD);
  if (adxValue === null || adxValue < regimeAdxThreshold) {
    return [null, `Regime filter: ADX ${adxValue?.toFixed(1) ?? 'N/A'} < ${regimeAdxThreshold}`];
  }

  const trendCloses = trendCandles.map(c => c.close);
  const ema20Arr = calculateEMA(trendCloses, CONFIG.EMA_BOUNCE_PERIOD);
  if (ema20Arr.length === 0) return [null, 'EMA(20) not available'];
  const ema20 = ema20Arr[ema20Arr.length - 1];
  if (ema20 <= 0) return [null, 'EMA(20) not available'];

  const atr = calculateATR(trendCandles, CONFIG.ATR_PERIOD);
  if (atr === null || atr <= 0) return [null, 'ATR not available'];

  const priceDist = Math.abs(currentPrice - ema20);
  const minDist = overrides.min_dist_atr ?? CONFIG.EMA_BOUNCE_MIN_DIST_ATR;
  const maxDist = overrides.max_dist_atr ?? CONFIG.EMA_BOUNCE_MAX_DIST_ATR;

  if (priceDist < minDist * atr) {
    return [null, `Price too close to EMA (${priceDist.toFixed(2)} < ${minDist}×ATR)`];
  }
  if (priceDist > maxDist * atr) {
    return [null, `Price too far from EMA (${priceDist.toFixed(2)} > ${maxDist}×ATR)`];
  }

  if (currentPrice < ema20) {
    return [null, 'DOWN signals disabled — UP-only mode'];
  }
  if (currentPrice === ema20) {
    return [null, 'Price at EMA level — no clear direction'];
  }

  const trend = TrendEnum.UP;

  if (macro.trend !== 'NEUTRAL' && macro.trend !== trend) {
    if (adxValue < regimeAdxThreshold) {
      return [null, `Fighting daily macro trend (${macro.trend}) with weak ADX (${adxValue.toFixed(1)})`];
    }
  }

  const momentumMin = overrides.momentum_min_rising ?? 1;
  if (entryCandles.length >= 2 && momentumMin > 0) {
    const lastClose = entryCandles[entryCandles.length - 1].close;
    const prevClose = entryCandles[entryCandles.length - 2].close;
    if (lastClose <= prevClose) {
      return [null, 'No 15M buy momentum (last close not rising)'];
    }
  }

  const slAtr = overrides.sl_atr_multiple ?? CONFIG.SL_ATR_MULTIPLE;
  const risk = atr * slAtr;
  const stopLoss = ema20 - risk;

  const sh = findSwingHighs(trendCandles, CONFIG.SWING_LOOKBACK_N);
  const sl = findSwingLows(trendCandles, CONFIG.SWING_LOOKBACK_N);
  const takeProfit = findTP(currentPrice, trend, trendCandles, sh, sl, risk);

  const rr = Math.abs(takeProfit - currentPrice) / Math.abs(currentPrice - stopLoss);
  const minRRR = overrides.min_rrr ?? CONFIG.MIN_RRR;
  if (rr < minRRR) {
    return [null, `R:R ${rr.toFixed(2)} below min ${minRRR.toFixed(2)}`];
  }

  const trendClarity = Math.min(adxValue / 50, 0.8);
  const confidence = calcConfidence(trendClarity, rr, adxValue, macro);

  const signal = buildSignal(
    'ema_bounce', trend, currentPrice, roundPrice(stopLoss),
    roundPrice(takeProfit), rr, confidence, adxValue, atr,
    CONFIG.EMA_BOUNCE_VALIDITY_HOURS, macro.trend, trendCandles, indicatorSummary
  );
  return [signal, 'EMA bounce signal ready'];
}

async function trySessionBreakout(
  regimeCandles: CandleData[],
  entryCandles: CandleData[],
  macro: MacroTrend,
  overrides: RegimeOverrides,
  indicatorSummary: string = '',
): Promise<[SignalResult | null, string]> {
  const currentPrice = entryCandles[entryCandles.length - 1].close;

  sessionTracker.update(currentPrice);
  const [asianLow, asianHigh, rangeWidth] = sessionTracker.getAsianRange();
  if (rangeWidth < CONFIG.BREAKOUT_MIN_RANGE) {
    return [null, `Asian range too narrow ($${rangeWidth.toFixed(2)} < $${CONFIG.BREAKOUT_MIN_RANGE.toFixed(2)})`];
  }

  const atr = calculateATR(entryCandles, CONFIG.ATR_PERIOD);
  if (atr === null || atr <= 0) return [null, 'ATR not available'];
  const breakoutThreshold = atr * CONFIG.BREAKOUT_ATR_MULTIPLE;

  let trend: TrendEnum;
  let stopLoss: number;
  if (currentPrice > asianHigh + breakoutThreshold) {
    trend = TrendEnum.UP;
    stopLoss = asianLow - atr * 0.5;
  } else if (currentPrice < asianLow - breakoutThreshold) {
    return [null, 'DOWN signals disabled'];
  } else {
    return [null, `No breakout: price within Asian range (${asianLow.toFixed(2)}-${asianHigh.toFixed(2)})`];
  }

  const adxValue = calculateADX(regimeCandles, CONFIG.REGIME_ADX_PERIOD);
  if (adxValue !== null && adxValue < CONFIG.REGIME_ADX_THRESHOLD - 5) {
    return [null, `4H ADX too low (${adxValue.toFixed(1)}) for breakout`];
  }

  const risk = Math.abs(currentPrice - stopLoss);
  if (risk <= 0) return [null, 'Invalid SL distance'];

  const tpExtension = Math.max(rangeWidth, atr * 2);
  const takeProfit = trend === TrendEnum.UP
    ? currentPrice + tpExtension
    : currentPrice - tpExtension;

  const minRRR = overrides.min_rrr ?? CONFIG.MIN_RRR;
  const rr = Math.abs(takeProfit - currentPrice) / risk;
  if (rr < minRRR) {
    return [null, `R:R ${rr.toFixed(2)} below min ${minRRR.toFixed(2)}`];
  }

  const adxForConfidence = adxValue ?? 25;
  const trendClarity = Math.min(adxForConfidence / 50, 0.7);
  const confidence = calcConfidence(trendClarity + 0.1, rr, adxForConfidence, macro);

  const signal = buildSignal(
    'session_breakout', trend, currentPrice, roundPrice(stopLoss),
    roundPrice(takeProfit), rr, confidence, adxForConfidence, atr,
    CONFIG.BREAKOUT_VALIDITY_HOURS, macro.trend, regimeCandles, indicatorSummary
  );
  return [signal, 'Session breakout signal ready'];
}
