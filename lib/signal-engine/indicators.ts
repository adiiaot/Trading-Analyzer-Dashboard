import { CandleData } from './types';

export function calculateATR(candles: CandleData[], period: number = 14): number | null {
  if (candles.length < period + 1) return null;
  const tr: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const hl = candles[i].high - candles[i].low;
    const hc = Math.abs(candles[i].high - candles[i - 1].close);
    const lc = Math.abs(candles[i].low - candles[i - 1].close);
    tr.push(Math.max(hl, hc, lc));
  }
  if (tr.length < period) {
    return tr.reduce((a, b) => a + b, 0) / tr.length;
  }
  let atr = tr.slice(0, period).reduce((a, b) => a + b, 0) / period;
  const alpha = 1 / period;
  for (let i = period; i < tr.length; i++) {
    atr = atr + alpha * (tr[i] - atr);
  }
  return atr;
}

export function calculateEMA(closes: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  let sum = 0;
  for (let i = 0; i < period && i < closes.length; i++) sum += closes[i];
  ema.push(sum / period);
  for (let i = period; i < closes.length; i++) {
    ema.push((closes[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]);
  }
  return ema;
}

export function calculateSMA(closes: number[], period: number): number | null {
  if (closes.length < period) return null;
  const slice = closes.slice(closes.length - period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

export function calculateSMAArray(closes: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = period - 1; i < closes.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1);
    sma.push(slice.reduce((a, b) => a + b, 0) / period);
  }
  return sma;
}

export function calculateADX(candles: CandleData[], period: number = 14): number | null {
  if (candles.length < period * 2 + 1) return null;

  const len = candles.length - 1;
  const tr: number[] = [];
  const plusDM: number[] = [];
  const minusDM: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const hl = candles[i].high - candles[i].low;
    const hc = Math.abs(candles[i].high - candles[i - 1].close);
    const lc = Math.abs(candles[i].low - candles[i - 1].close);
    tr.push(Math.max(hl, hc, lc));

    const upMove = candles[i].high - candles[i - 1].high;
    const downMove = candles[i - 1].low - candles[i].low;
    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
  }

  let trSmooth = tr.slice(0, period).reduce((a, b) => a + b, 0);
  let plusSmooth = plusDM.slice(0, period).reduce((a, b) => a + b, 0);
  let minusSmooth = minusDM.slice(0, period).reduce((a, b) => a + b, 0);

  const alpha = 1 / period;
  const dxValues: number[] = [];

  for (let i = period; i < tr.length; i++) {
    trSmooth = trSmooth + alpha * (tr[i] - trSmooth);
    plusSmooth = plusSmooth + alpha * (plusDM[i] - plusSmooth);
    minusSmooth = minusSmooth + alpha * (minusDM[i] - minusSmooth);

    const denom = plusSmooth + minusSmooth;
    const pdi = 100 * plusSmooth / trSmooth;
    const ndi = 100 * minusSmooth / trSmooth;
    const dx = denom > 0 ? 100 * Math.abs(pdi - ndi) / denom : 0;
    dxValues.push(dx);
  }

  if (dxValues.length < period) return null;

  let adx = dxValues.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < dxValues.length; i++) {
    adx = adx + alpha * (dxValues[i] - adx);
  }
  return adx;
}

export function calculateADXSeries(candles: CandleData[], period: number = 14): number[] {
  if (candles.length < period * 2 + 1) return [];

  const tr: number[] = [];
  const plusDM: number[] = [];
  const minusDM: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const hl = candles[i].high - candles[i].low;
    const hc = Math.abs(candles[i].high - candles[i - 1].close);
    const lc = Math.abs(candles[i].low - candles[i - 1].close);
    tr.push(Math.max(hl, hc, lc));

    const upMove = candles[i].high - candles[i - 1].high;
    const downMove = candles[i - 1].low - candles[i].low;
    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
  }

  let trSmooth = tr.slice(0, period).reduce((a, b) => a + b, 0);
  let plusSmooth = plusDM.slice(0, period).reduce((a, b) => a + b, 0);
  let minusSmooth = minusDM.slice(0, period).reduce((a, b) => a + b, 0);

  const alpha = 1 / period;
  const dxValues: number[] = [];

  for (let i = period; i < tr.length; i++) {
    trSmooth = trSmooth + alpha * (tr[i] - trSmooth);
    plusSmooth = plusSmooth + alpha * (plusDM[i] - plusSmooth);
    minusSmooth = minusSmooth + alpha * (minusDM[i] - minusSmooth);

    const denom = plusSmooth + minusSmooth;
    const pdi = 100 * plusSmooth / trSmooth;
    const ndi = 100 * minusSmooth / trSmooth;
    const dx = denom > 0 ? 100 * Math.abs(pdi - ndi) / denom : 0;
    dxValues.push(dx);
  }

  if (dxValues.length < period) return [];

  const adxSeries: number[] = [];
  let adx = dxValues.slice(0, period).reduce((a, b) => a + b, 0) / period;
  adxSeries.push(adx);
  for (let i = period; i < dxValues.length; i++) {
    adx = adx + alpha * (dxValues[i] - adx);
    adxSeries.push(adx);
  }
  return adxSeries;
}

export function calculateATRSeries(candles: CandleData[], period: number = 14): number[] {
  if (candles.length < period + 1) return [];

  const tr: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const hl = candles[i].high - candles[i].low;
    const hc = Math.abs(candles[i].high - candles[i - 1].close);
    const lc = Math.abs(candles[i].low - candles[i - 1].close);
    tr.push(Math.max(hl, hc, lc));
  }

  if (tr.length < period) return [];

  const atrSeries: number[] = [];
  let atr = tr.slice(0, period).reduce((a, b) => a + b, 0) / period;
  atrSeries.push(atr);

  const alpha = 1 / period;
  for (let i = period; i < tr.length; i++) {
    atr = atr + alpha * (tr[i] - atr);
    atrSeries.push(atr);
  }
  return atrSeries;
}
