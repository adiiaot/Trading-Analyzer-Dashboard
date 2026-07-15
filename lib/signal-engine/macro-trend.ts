import { CandleData, MacroTrend } from './types';
import { calculateSMA } from './indicators';
import { CONFIG } from './config';

export function getMacroTrend(dailyCandles: CandleData[]): MacroTrend {
  if (dailyCandles.length < CONFIG.DAILY_SMA_PERIOD + 5) {
    return { trend: 'NEUTRAL', price_sma_pct: 0, sma50: 0 };
  }

  const closes = dailyCandles.map(c => c.close);
  const sma50 = calculateSMA(closes, CONFIG.DAILY_SMA_PERIOD);
  if (!sma50 || sma50 <= 0) {
    return { trend: 'NEUTRAL', price_sma_pct: 0, sma50: 0 };
  }

  const currentPrice = closes[closes.length - 1];
  const pct = (currentPrice - sma50) / sma50;
  let trend = 'NEUTRAL';
  if (pct > 0.01) trend = 'UP';
  else if (pct < -0.01) trend = 'DOWN';

  return {
    trend,
    price_sma_pct: Math.round(pct * 10000) / 10000,
    sma50: Math.round(sma50 * 100) / 100,
  };
}
