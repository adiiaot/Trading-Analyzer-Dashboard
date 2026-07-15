import { CandleData } from './types';

export function findSwingHighs(candles: CandleData[], n: number = 3): number[] {
  const indices: number[] = [];
  for (let i = n; i < candles.length - n; i++) {
    let isHigh = true;
    for (let j = 1; j <= n; j++) {
      if (candles[i].high <= candles[i - j].high || candles[i].high <= candles[i + j].high) {
        isHigh = false;
        break;
      }
    }
    if (isHigh) indices.push(i);
  }
  return indices;
}

export function findSwingLows(candles: CandleData[], n: number = 3): number[] {
  const indices: number[] = [];
  for (let i = n; i < candles.length - n; i++) {
    let isLow = true;
    for (let j = 1; j <= n; j++) {
      if (candles[i].low >= candles[i - j].low || candles[i].low >= candles[i + j].low) {
        isLow = false;
        break;
      }
    }
    if (isLow) indices.push(i);
  }
  return indices;
}
