import { CandleData, RegimeOverrides } from './types';
import { calculateADXSeries, calculateATRSeries } from './indicators';
import { CONFIG } from './config';

function percentileRank(values: number[], current: number): number {
  if (values.length < 10) return 0.5;
  const countLess = values.filter(v => v < current).length;
  return countLess / values.length;
}

export function getRegimeOverrides(
  regimeCandles: CandleData[],
  trendCandles: CandleData[]
): RegimeOverrides {
  const overrides: RegimeOverrides = {};

  const adxSeries = calculateADXSeries(regimeCandles, CONFIG.REGIME_ADX_PERIOD);
  const currentADX = adxSeries.length > 0 ? adxSeries[adxSeries.length - 1] : 0;
  const recentADX = adxSeries.slice(-50);
  const adxPct = percentileRank(recentADX, currentADX);
  overrides.adx_value = currentADX;

  const atrSeries = calculateATRSeries(trendCandles, CONFIG.ATR_PERIOD);
  const currentATR = atrSeries.length > 0 ? atrSeries[atrSeries.length - 1] : 0;
  const recentATR = atrSeries.slice(-60);
  const atrMean = recentATR.length > 0 ? recentATR.reduce((a, b) => a + b, 0) / recentATR.length : 0;
  const atrRatio = atrMean > 0 ? currentATR / atrMean : 1;
  overrides.atr_ratio = atrRatio;

  let volRegime = 'normal_vol';
  if (atrRatio > 1.5) {
    volRegime = 'high_vol';
    overrides.sl_atr_multiple = 2.0;
    overrides.max_dist_atr = 2.5;
    overrides.min_dist_atr = 0.15;
  } else if (atrRatio < 0.6) {
    volRegime = 'low_vol';
    overrides.sl_atr_multiple = 1.2;
    overrides.max_dist_atr = 1.2;
    overrides.min_dist_atr = 0.05;
  }
  overrides.volatility_regime = volRegime;

  let trendRegime = 'normal_trend';
  if (adxPct > 0.7 && currentADX >= CONFIG.REGIME_ADX_THRESHOLD) {
    trendRegime = 'strong_trend';
    overrides.min_rrr = 1.0;
    overrides.momentum_min_rising = 0;
    overrides.regime_adx_threshold = Math.max(20, currentADX - 5);
  } else if (adxPct < 0.3 || currentADX < CONFIG.REGIME_ADX_THRESHOLD) {
    trendRegime = 'weak_trend';
    overrides.min_rrr = 1.5;
    overrides.momentum_min_rising = 1;
  }
  overrides.trend_regime = trendRegime;

  if (volRegime === 'high_vol') {
    overrides.regime_name = `${trendRegime}_high_vol`;
  } else if (volRegime === 'low_vol') {
    overrides.regime_name = `${trendRegime}_low_vol`;
  } else {
    overrides.regime_name = trendRegime;
  }

  return overrides;
}
