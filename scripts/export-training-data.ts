import { CandleData } from '../lib/signal-engine/types';
import { calculateATR, calculateEMA, calculateADX, calculateRSI, calculateBollingerBands, calculateSMA } from '../lib/signal-engine/indicators';
import { CONFIG } from '../lib/signal-engine/config';
import * as fs from 'fs';
import * as path from 'path';

const HYPERLIQUID_URL = CONFIG.HYPERLIQUID_URL;
const GOLD_SYMBOL = CONFIG.GOLD_SYMBOL;
const TIMEFRAME = '15m';
const INTERVAL_MS = CONFIG.INTERVAL_MS[TIMEFRAME];
const OUT_DIR = path.join(__dirname, '..', 'training_data');
const CSV_PATH = path.join(OUT_DIR, 'gold_15m_features.csv');

interface RawBar {
  t: string;
  o: string;
  h: string;
  l: string;
  c: string;
  v: string;
}

async function fetchCandleRange(startMs: number, endMs: number, retries = 3): Promise<CandleData[]> {
  const payload = {
    type: 'candleSnapshot',
    req: { coin: GOLD_SYMBOL, interval: TIMEFRAME, startTime: startMs, endTime: endMs },
  };

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(HYPERLIQUID_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        console.warn(`  HTTP ${res.status}, retry ${attempt + 1}/${retries}`);
        continue;
      }

      const json = await res.json();
      if (!json || !Array.isArray(json)) {
        console.warn(`  Invalid response, retry ${attempt + 1}/${retries}`);
        continue;
      }

      const candles: CandleData[] = [];
      for (const bar of json as RawBar[]) {
        try {
          candles.push({
            time: Math.floor(Number(bar.t) / 1000),
            open: Math.round(parseFloat(bar.o) * 100) / 100,
            high: Math.round(parseFloat(bar.h) * 100) / 100,
            low: Math.round(parseFloat(bar.l) * 100) / 100,
            close: Math.round(parseFloat(bar.c) * 100) / 100,
            volume: typeof bar.v === 'string' ? parseFloat(bar.v) : Number(bar.v),
          });
        } catch { /* skip malformed */ }
      }

      return candles.sort((a, b) => a.time - b.time);
    } catch (e) {
      if (attempt === retries - 1) throw e;
      console.warn(`  Fetch error, retry ${attempt + 1}/${retries}: ${e}`);
      await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  return [];
}

function computeFeatures(candles: CandleData[]): Record<string, number | null>[] {
  const closes = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);

  const atrArr: (number | null)[] = [];
  for (let i = 0; i < candles.length; i++) {
    atrArr.push(calculateATR(candles.slice(0, i + 1), CONFIG.ATR_PERIOD));
  }

  const ema20Arr = calculateEMA(closes, 20);
  const ema50Arr = calculateEMA(closes, 50);
  const ema200Arr = calculateEMA(closes, 200);
  const sma50Arr: (number | null)[] = [null];
  for (let i = 1; i < candles.length; i++) {
    sma50Arr.push(calculateSMA(closes.slice(0, i + 1), 50));
  }

  const features: Record<string, number | null>[] = [];

  for (let i = 50; i < candles.length; i++) {
    const slice = candles.slice(0, i + 1);
    const closeSlice = closes.slice(0, i + 1);
    const c = candles[i];

    const atr = atrArr[i];
    const ema20 = ema20Arr[i] ?? null;
    const ema50 = ema50Arr[i] ?? null;
    const ema200 = ema200Arr[i] ?? null;
    const sma50 = sma50Arr[i] ?? null;

    const rsi = calculateRSI(slice, 14);
    const bb = calculateBollingerBands(slice, 20, 2.0);
    const adx = calculateADX(slice, 14);

    const priceDistEma20 = ema20 !== null ? (c.close - ema20) / (atr || 1) : null;
    const priceDistEma50 = ema50 !== null ? (c.close - ema50) / (atr || 1) : null;
    const ema20DistEma50 = (ema20 !== null && ema50 !== null) ? (ema20 - ema50) / (atr || 1) : null;

    const prev5 = candles.slice(Math.max(0, i - 5), i);
    const range5 = prev5.length > 0 ? Math.max(...prev5.map(x => x.high)) - Math.min(...prev5.map(x => x.low)) : 0;
    const range20 = i >= 20 ? Math.max(...candles.slice(i - 20, i).map(x => x.high)) - Math.min(...candles.slice(i - 20, i).map(x => x.low)) : 0;

    const body = Math.abs(c.close - c.open);
    const upperWick = c.high - Math.max(c.open, c.close);
    const lowerWick = Math.min(c.open, c.close) - c.low;
    const bodyPct = (c.high - c.low) > 0 ? body / (c.high - c.low) : 0;
    const upperWickPct = (c.high - c.low) > 0 ? upperWick / (c.high - c.low) : 0;
    const lowerWickPct = (c.high - c.low) > 0 ? lowerWick / (c.high - c.low) : 0;

    const vol3 = i >= 3 ? closes.slice(i - 3, i + 1) : closeSlice;
    const vol3Change = vol3.length >= 2 ? (vol3[vol3.length - 1] - vol3[0]) / (vol3[0] || 1) : 0;

    const hour = new Date(c.time * 1000).getUTCHours();
    const dayOfWeek = new Date(c.time * 1000).getUTCDay();
    const isLondonSession = hour >= 8 && hour < 17 ? 1 : 0;
    const isNYSession = hour >= 13 && hour < 21 ? 1 : 0;
    const isAsianSession = hour >= 0 && hour < 9 ? 1 : 0;

    // Target: next bar direction (1 if next close > current close, else 0)
    const nextBar = candles[i + 1];
    const target = nextBar ? (nextBar.close > c.close ? 1 : 0) : null;

    if (target === null) continue;

    features.push({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
      atr,
      ema20,
      ema50,
      ema200,
      sma50,
      rsi,
      bb_upper: bb?.upper ?? null,
      bb_middle: bb?.middle ?? null,
      bb_lower: bb?.lower ?? null,
      bb_width: bb ? (bb.upper - bb.lower) / (bb.middle || 1) : null,
      bb_pct: bb ? (c.close - bb.lower) / ((bb.upper - bb.lower) || 1) : null,
      adx,
      price_dist_ema20_atr: priceDistEma20,
      price_dist_ema50_atr: priceDistEma50,
      ema20_dist_ema50_atr: ema20DistEma50,
      range_5: range5,
      range_20: range20,
      range_5_atr: atr && atr > 0 ? range5 / atr : null,
      range_20_atr: atr && atr > 0 ? range20 / atr : null,
      body_pct: bodyPct,
      upper_wick_pct: upperWickPct,
      lower_wick_pct: lowerWickPct,
      vol3_change: vol3Change,
      hour,
      day_of_week: dayOfWeek,
      london_session: isLondonSession,
      ny_session: isNYSession,
      asian_session: isAsianSession,
      target,
    });

    if (features.length % 1000 === 0) {
      process.stdout.write(`  Featurized ${features.length} bars...\r`);
    }
  }

  return features;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const now = Date.now();
  const CHUNK_MS = 30 * 24 * 3600 * 1000; // 1 month per chunk
  const TOTAL_MONTHS = 60; // 5 years
  const TOTAL_MS = TOTAL_MONTHS * CHUNK_MS;

  console.log('=' .repeat(60));
  console.log('  GOLD 15M TRAINING DATA EXPORT');
  console.log(`  Symbol: ${GOLD_SYMBOL}, Timeframe: ${TIMEFRAME}`);
  console.log(`  Fetching ${TOTAL_MONTHS} months of data (${TOTAL_MONTHS} chunks)`);
  console.log('=' .repeat(60));

  let allCandles: CandleData[] = [];
  let failedChunks = 0;

  for (let chunk = 0; chunk < TOTAL_MONTHS; chunk++) {
    const endMs = now - chunk * CHUNK_MS;
    const startMs = endMs - CHUNK_MS;
    const startDate = new Date(startMs).toISOString().slice(0, 10);
    const endDate = new Date(endMs).toISOString().slice(0, 10);

    process.stdout.write(`  Chunk ${chunk + 1}/${TOTAL_MONTHS}: ${startDate} to ${endDate} ... `);

    try {
      const candles = await fetchCandleRange(startMs, endMs);
      if (candles.length === 0) {
        console.log(`0 candles (may be end of data)`);
        failedChunks++;
        if (failedChunks >= 3) {
          console.log(`  3 consecutive empty chunks — stopping`);
          break;
        }
        continue;
      }
      failedChunks = 0;
      console.log(`${candles.length} candles`);
      allCandles = allCandles.concat(candles);
    } catch (e) {
      console.log(`ERROR: ${e}`);
      failedChunks++;
      if (failedChunks >= 3) {
        console.log(`  3 consecutive errors — stopping`);
        break;
      }
    }
  }

  // Deduplicate and sort by time
  const seen = new Set<number>();
  allCandles = allCandles.filter(c => {
    if (seen.has(c.time)) return false;
    seen.add(c.time);
    return true;
  }).sort((a, b) => a.time - b.time);

  console.log(`\n  Total unique candles: ${allCandles.length}`);
  if (allCandles.length < 1000) {
    console.log('  ERROR: Not enough data. Exiting.');
    process.exit(1);
  }
  console.log(`  Date range: ${new Date(allCandles[0].time * 1000).toISOString().slice(0, 10)} to ${new Date(allCandles[allCandles.length - 1].time * 1000).toISOString().slice(0, 10)}`);

  // Compute features
  console.log('\n  Computing features...');
  const features = computeFeatures(allCandles);
  console.log(`  Featurized ${features.length} bars`);

  // Write CSV
  const header = Object.keys(features[0]).join(',') + '\n';
  const csvContent = header + features.map(row =>
    Object.values(row).map(v => v === null || v === undefined ? '' : v).join(',')
  ).join('\n');

  fs.writeFileSync(CSV_PATH, csvContent);
  console.log(`\n  Saved: ${CSV_PATH}`);

  // Also save raw OHLCV for Colab
  const rawPath = path.join(OUT_DIR, 'gold_15m_raw.csv');
  const rawHeader = 'time,open,high,low,close,volume\n';
  const rawContent = rawHeader + allCandles.map(c =>
    `${c.time},${c.open},${c.high},${c.low},${c.close},${c.volume}`
  ).join('\n');
  fs.writeFileSync(rawPath, rawContent);
  console.log(`  Raw OHLCV: ${rawPath}`);
  console.log('  Done!');
}

main().catch(err => { console.error(err); process.exit(1); });
