import { CandleData, TrendEnum } from './types';
import { findSwingHighs, findSwingLows } from './swings';

export interface DxyState {
  trend: 'UP' | 'DOWN' | 'NEUTRAL';
  expectedGoldDirection: 'UP' | 'DOWN';
  correlationConfirmed: boolean;
  summary: string;
}

function detectTrendOnDf(candles: CandleData[]): 'UP' | 'DOWN' | 'NEUTRAL' {
  const highs = findSwingHighs(candles, 3);
  const lows = findSwingLows(candles, 3);

  if (highs.length < 2 || lows.length < 2) return 'NEUTRAL';

  const lastTwoHighs = highs.slice(-2);
  const lastTwoLows = lows.slice(-2);

  const highRising = candles[lastTwoHighs[1]].high > candles[lastTwoHighs[0]].high;
  const lowRising = candles[lastTwoLows[1]].low > candles[lastTwoLows[0]].low;
  const highFalling = candles[lastTwoHighs[1]].high < candles[lastTwoHighs[0]].high;
  const lowFalling = candles[lastTwoLows[1]].low < candles[lastTwoLows[0]].low;

  if (highRising && lowRising) return 'UP';
  if (highFalling && lowFalling) return 'DOWN';
  return 'NEUTRAL';
}

export async function checkDxyCorrelation(
  dxyCandles: CandleData[],
  goldTrendCandles: CandleData[],
): Promise<DxyState> {
  if (dxyCandles.length < 20 || goldTrendCandles.length < 20) {
    return {
      trend: 'NEUTRAL',
      expectedGoldDirection: 'UP',
      correlationConfirmed: false,
      summary: 'Insufficient data for DXY correlation check',
    };
  }

  const dxyTrend = detectTrendOnDf(dxyCandles.slice(-20));
  const goldTrend = detectTrendOnDf(goldTrendCandles.slice(-20));

  if (dxyTrend === 'NEUTRAL') {
    return {
      trend: 'NEUTRAL',
      expectedGoldDirection: 'UP',
      correlationConfirmed: false,
      summary: 'DXY in consolidation — no clear directional bias',
    };
  }

  const expectedGold: 'UP' | 'DOWN' = dxyTrend === 'UP' ? 'DOWN' : 'UP';
  const goldMatchesExpected = goldTrend === expectedGold;

  let summary: string;
  if (goldMatchesExpected) {
    summary = `DXY-gold correlation confirmed: DXY ${dxyTrend} → gold ${goldTrend} (as expected)`;
  } else {
    summary = `DXY-gold mismatch: DXY ${dxyTrend} but gold ${goldTrend} — inverse correlation broken, rejecting`;
  }

  return {
    trend: dxyTrend,
    expectedGoldDirection: expectedGold,
    correlationConfirmed: goldMatchesExpected,
    summary,
  };
}
