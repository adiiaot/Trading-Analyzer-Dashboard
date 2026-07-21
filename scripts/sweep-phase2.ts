import { runBacktest } from '../lib/signal-engine/backtester';
import { CONFIG } from '../lib/signal-engine/config';
import { sweepConfig } from '../lib/signal-engine/signal-generator';
import * as fs from 'fs';
import * as path from 'path';

interface SweepRun {
  label: string;
  desc: string;
  patch: () => void;
}

const BASELINE = {
  MIN_RRR: 1.0,
  SL_ATR_MULTIPLE: 1.5,
  REGIME_ADX_THRESHOLD: 20,
  BREAKOUT_ATR_MULTIPLE: 0.25,
  BREAKOUT_MIN_RANGE: 5.0,
  CONSOLIDATION_LOOKBACK: 16,
  TREND_CONT_ADX_THRESHOLD: 15,
  TREND_CONT_MIN_RRR: 0.8,
  RSI_OVERBOUGHT: 72,
  RSI_OVERSOLD: 30,
  BB_STD: 2.0,
  ENTRY_SPACING_ATR: 0.15,
  TP_FALLBACK_R_MULTIPLE: 2.5,
  EMA_BOUNCE_MIN_DIST_ATR: 0.1,
  EMA_BOUNCE_MAX_DIST_ATR: 2.0,
};

function resetToBaseline() {
  CONFIG.MIN_RRR = BASELINE.MIN_RRR;
  CONFIG.SL_ATR_MULTIPLE = BASELINE.SL_ATR_MULTIPLE;
  CONFIG.REGIME_ADX_THRESHOLD = BASELINE.REGIME_ADX_THRESHOLD;
  CONFIG.BREAKOUT_ATR_MULTIPLE = BASELINE.BREAKOUT_ATR_MULTIPLE;
  CONFIG.BREAKOUT_MIN_RANGE = BASELINE.BREAKOUT_MIN_RANGE;
  CONFIG.CONSOLIDATION_LOOKBACK = BASELINE.CONSOLIDATION_LOOKBACK;
  CONFIG.TREND_CONT_ADX_THRESHOLD = BASELINE.TREND_CONT_ADX_THRESHOLD;
  CONFIG.TREND_CONT_MIN_RRR = BASELINE.TREND_CONT_MIN_RRR;
  CONFIG.ENTRY_SPACING_ATR = BASELINE.ENTRY_SPACING_ATR;
  CONFIG.TP_FALLBACK_R_MULTIPLE = BASELINE.TP_FALLBACK_R_MULTIPLE;
  CONFIG.EMA_BOUNCE_MIN_DIST_ATR = BASELINE.EMA_BOUNCE_MIN_DIST_ATR;
  CONFIG.EMA_BOUNCE_MAX_DIST_ATR = BASELINE.EMA_BOUNCE_MAX_DIST_ATR;
  sweepConfig.RSI_OVERBOUGHT = undefined;
  sweepConfig.RSI_OVERSOLD = undefined;
  sweepConfig.BB_STD = undefined;
}

const sweeps: SweepRun[] = [
  // === STRICTER MIN_RRR (higher R:R required) ===
  { label: 'rrr1.5', desc: 'MIN_RRR=1.5', patch: () => { CONFIG.MIN_RRR = 1.5; } },
  { label: 'rrr2.0', desc: 'MIN_RRR=2.0', patch: () => { CONFIG.MIN_RRR = 2.0; } },
  { label: 'rrr3.0', desc: 'MIN_RRR=3.0', patch: () => { CONFIG.MIN_RRR = 3.0; } },

  // === BIGGER BREAKOUT required ===
  { label: 'bo0.5', desc: 'BREAKOUT_ATR_MULTIPLE=0.5', patch: () => { CONFIG.BREAKOUT_ATR_MULTIPLE = 0.5; } },
  { label: 'bo1.0', desc: 'BREAKOUT_ATR_MULTIPLE=1.0', patch: () => { CONFIG.BREAKOUT_ATR_MULTIPLE = 1.0; } },
  { label: 'bo1.5', desc: 'BREAKOUT_ATR_MULTIPLE=1.5', patch: () => { CONFIG.BREAKOUT_ATR_MULTIPLE = 1.5; } },
  { label: 'bo2.0', desc: 'BREAKOUT_ATR_MULTIPLE=2.0', patch: () => { CONFIG.BREAKOUT_ATR_MULTIPLE = 2.0; } },

  // === HIGHER ADX thresholds (stronger trends only) ===
  { label: 'adx25', desc: 'REGIME_ADX_THRESHOLD=25', patch: () => { CONFIG.REGIME_ADX_THRESHOLD = 25; } },
  { label: 'adx30', desc: 'REGIME_ADX_THRESHOLD=30', patch: () => { CONFIG.REGIME_ADX_THRESHOLD = 30; } },

  // === HIGHER trend continuation ADX ===
  { label: 'tca20', desc: 'TREND_CONT_ADX_THRESHOLD=20', patch: () => { CONFIG.TREND_CONT_ADX_THRESHOLD = 20; } },
  { label: 'tca25', desc: 'TREND_CONT_ADX_THRESHOLD=25', patch: () => { CONFIG.TREND_CONT_ADX_THRESHOLD = 25; } },

  // === TIGHTER SL (less room to get stopped out) ===
  { label: 'sl0.5', desc: 'SL_ATR_MULTIPLE=0.5', patch: () => { CONFIG.SL_ATR_MULTIPLE = 0.5; } },
  { label: 'sl1.0', desc: 'SL_ATR_MULTIPLE=1.0', patch: () => { CONFIG.SL_ATR_MULTIPLE = 1.0; } },

  // === WIDER TP target ===
  { label: 'tp3.0', desc: 'TP_FALLBACK_R_MULTIPLE=3.0', patch: () => { CONFIG.TP_FALLBACK_R_MULTIPLE = 3.0; } },
  { label: 'tp4.0', desc: 'TP_FALLBACK_R_MULTIPLE=4.0', patch: () => { CONFIG.TP_FALLBACK_R_MULTIPLE = 4.0; } },

  // === TIGHTER entry spacing ===
  { label: 'es0.05', desc: 'ENTRY_SPACING_ATR=0.05', patch: () => { CONFIG.ENTRY_SPACING_ATR = 0.05; } },
  { label: 'es0.10', desc: 'ENTRY_SPACING_ATR=0.10', patch: () => { CONFIG.ENTRY_SPACING_ATR = 0.10; } },

  // === SHORTER consolidation window ===
  { label: 'cl8', desc: 'CONSOLIDATION_LOOKBACK=8', patch: () => { CONFIG.CONSOLIDATION_LOOKBACK = 8; } },
  { label: 'cl12', desc: 'CONSOLIDATION_LOOKBACK=12', patch: () => { CONFIG.CONSOLIDATION_LOOKBACK = 12; } },

  // === STRICTER EMA bounce distance ===
  { label: 'ebd0.5', desc: 'EMA_BOUNCE_MIN_DIST_ATR=0.5', patch: () => { CONFIG.EMA_BOUNCE_MIN_DIST_ATR = 0.5; } },
  { label: 'ebd1.0', desc: 'EMA_BOUNCE_MIN_DIST_ATR=1.0', patch: () => { CONFIG.EMA_BOUNCE_MIN_DIST_ATR = 1.0; } },

  // === WIDER minimum breakout range ===
  { label: 'mr10', desc: 'BREAKOUT_MIN_RANGE=10', patch: () => { CONFIG.BREAKOUT_MIN_RANGE = 10; } },
  { label: 'mr20', desc: 'BREAKOUT_MIN_RANGE=20', patch: () => { CONFIG.BREAKOUT_MIN_RANGE = 20; } },

  // === HIGHER trend cont min RRR ===
  { label: 'tcR1.0', desc: 'TREND_CONT_MIN_RRR=1.0', patch: () => { CONFIG.TREND_CONT_MIN_RRR = 1.0; } },
  { label: 'tcR1.2', desc: 'TREND_CONT_MIN_RRR=1.2', patch: () => { CONFIG.TREND_CONT_MIN_RRR = 1.2; } },

  // === COMBOS (promising combinations) ===
  {
    label: 'combo1',
    desc: 'rrr2.0+bo1.0+adx25+sl1.0+tp3.0',
    patch: () => {
      CONFIG.MIN_RRR = 2.0;
      CONFIG.BREAKOUT_ATR_MULTIPLE = 1.0;
      CONFIG.REGIME_ADX_THRESHOLD = 25;
      CONFIG.SL_ATR_MULTIPLE = 1.0;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 3.0;
    },
  },
  {
    label: 'combo2',
    desc: 'rrr1.5+bo0.5+adx25+sl1.0+tp3.0',
    patch: () => {
      CONFIG.MIN_RRR = 1.5;
      CONFIG.BREAKOUT_ATR_MULTIPLE = 0.5;
      CONFIG.REGIME_ADX_THRESHOLD = 25;
      CONFIG.SL_ATR_MULTIPLE = 1.0;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 3.0;
    },
  },
  {
    label: 'combo3',
    desc: 'rrr2.0+bo1.5+adx30+es0.1+tp4.0',
    patch: () => {
      CONFIG.MIN_RRR = 2.0;
      CONFIG.BREAKOUT_ATR_MULTIPLE = 1.5;
      CONFIG.REGIME_ADX_THRESHOLD = 30;
      CONFIG.ENTRY_SPACING_ATR = 0.1;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 4.0;
    },
  },
  {
    label: 'combo4',
    desc: 'rrr1.5+bo1.0+adx20+sl0.5+tp3.0+ebd0.5',
    patch: () => {
      CONFIG.MIN_RRR = 1.5;
      CONFIG.BREAKOUT_ATR_MULTIPLE = 1.0;
      CONFIG.REGIME_ADX_THRESHOLD = 20;
      CONFIG.SL_ATR_MULTIPLE = 0.5;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 3.0;
      CONFIG.EMA_BOUNCE_MIN_DIST_ATR = 0.5;
    },
  },
  {
    label: 'combo5',
    desc: 'rrr3.0+bo2.0+adx25+sl1.0+tp4.0+es0.05',
    patch: () => {
      CONFIG.MIN_RRR = 3.0;
      CONFIG.BREAKOUT_ATR_MULTIPLE = 2.0;
      CONFIG.REGIME_ADX_THRESHOLD = 25;
      CONFIG.SL_ATR_MULTIPLE = 1.0;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 4.0;
      CONFIG.ENTRY_SPACING_ATR = 0.05;
    },
  },
  {
    label: 'combo6',
    desc: 'rrr2.0+bo1.0+adx25+sl0.5+tp3.0+mr10',
    patch: () => {
      CONFIG.MIN_RRR = 2.0;
      CONFIG.BREAKOUT_ATR_MULTIPLE = 1.0;
      CONFIG.REGIME_ADX_THRESHOLD = 25;
      CONFIG.SL_ATR_MULTIPLE = 0.5;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 3.0;
      CONFIG.BREAKOUT_MIN_RANGE = 10;
    },
  },
  {
    label: 'combo7',
    desc: 'rrr1.5+bo0.5+adx25+sl1.0+tp4.0+mr15',
    patch: () => {
      CONFIG.MIN_RRR = 1.5;
      CONFIG.BREAKOUT_ATR_MULTIPLE = 0.5;
      CONFIG.REGIME_ADX_THRESHOLD = 25;
      CONFIG.SL_ATR_MULTIPLE = 1.0;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 4.0;
      CONFIG.BREAKOUT_MIN_RANGE = 15;
    },
  },
  {
    label: 'combo8',
    desc: 'rrr2.0+bo0.5+adx30+sl0.5+tp3.0+mr10+cl8',
    patch: () => {
      CONFIG.MIN_RRR = 2.0;
      CONFIG.BREAKOUT_ATR_MULTIPLE = 0.5;
      CONFIG.REGIME_ADX_THRESHOLD = 30;
      CONFIG.SL_ATR_MULTIPLE = 0.5;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 3.0;
      CONFIG.BREAKOUT_MIN_RANGE = 10;
      CONFIG.CONSOLIDATION_LOOKBACK = 8;
    },
  },
  {
    label: 'combo9',
    desc: 'rrr1.5+bo1.0+adx25+sl1.0+tp4.0+es0.1+tcR1.0',
    patch: () => {
      CONFIG.MIN_RRR = 1.5;
      CONFIG.BREAKOUT_ATR_MULTIPLE = 1.0;
      CONFIG.REGIME_ADX_THRESHOLD = 25;
      CONFIG.SL_ATR_MULTIPLE = 1.0;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 4.0;
      CONFIG.ENTRY_SPACING_ATR = 0.1;
      CONFIG.TREND_CONT_MIN_RRR = 1.0;
    },
  },
  {
    label: 'combo10',
    desc: 'rrr3.0+bo1.5+adx30+sl0.5+tp4.0+mr20+cl12',
    patch: () => {
      CONFIG.MIN_RRR = 3.0;
      CONFIG.BREAKOUT_ATR_MULTIPLE = 1.5;
      CONFIG.REGIME_ADX_THRESHOLD = 30;
      CONFIG.SL_ATR_MULTIPLE = 0.5;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 4.0;
      CONFIG.BREAKOUT_MIN_RANGE = 20;
      CONFIG.CONSOLIDATION_LOOKBACK = 12;
    },
  },
];

const OUT_DIR = path.join(__dirname, '..', 'backtest_results', 'sweep');
const CSV_PATH = path.join(OUT_DIR, 'sweep_phase2.csv');
const MONTHS = 6;

function csvEscape(v: unknown): string {
  const s = String(v ?? '');
  return s.includes(',') ? `"${s}"` : s;
}

async function runOne(sweep: SweepRun, index: number, total: number): Promise<Record<string, unknown> | null> {
  resetToBaseline();
  sweep.patch();
  console.log(`\n[${index + 1}/${total}] ${sweep.label}: ${sweep.desc} ...`);
  try {
    const start = Date.now();
    const result = await runBacktest(MONTHS, false, false, false);
    const elapsed = Math.round((Date.now() - start) / 1000);
    if (result.success && result.report) {
      const r = result.report;
      const row: Record<string, unknown> = {
        label: sweep.label,
        desc: sweep.desc,
        signals: r.total_signals,
        win_rate_pct: (r.win_rate * 100).toFixed(1),
        profit_factor: r.profit_factor,
        full_wins: r.full_win,
        partial_wins: r.partial_win,
        losses: r.loss,
        expired: r.expired,
        avg_rr_planned: r.avg_rr_planned,
        avg_realized_r: r.avg_realized_r,
        gross_win_r: r.gross_win_r,
        gross_loss_r: r.gross_loss_r,
        meets_target: r.meets_target,
      };
      const line = Object.values(row).map(csvEscape).join(',') + '\n';
      fs.appendFileSync(CSV_PATH, line);
      const wr = (r.win_rate * 100).toFixed(1);
      const pf = r.profit_factor.toFixed(3);
      const sig = r.total_signals;
      let marker = '';
      if (r.win_rate >= 0.90) marker = ' *** 90%+ WR!';
      else if (r.win_rate >= 0.80) marker = ' ** 80%+ WR';
      else if (r.win_rate >= 0.70) marker = ' * 70%+ WR';
      console.log(`  => ${sig} sig, ${wr}% WR, ${pf} PF (${elapsed}s)${marker}`);
      return row;
    } else {
      console.error(`  FAILED: ${result.error}`);
      return null;
    }
  } catch (e) {
    console.error(`  EXCEPTION: ${e}`);
    return null;
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const header = [
    'label', 'desc', 'signals', 'win_rate_pct', 'profit_factor',
    'full_wins', 'partial_wins', 'losses', 'expired', 'avg_rr_planned',
    'avg_realized_r', 'gross_win_r', 'gross_loss_r', 'meets_target',
  ].join(',') + '\n';
  fs.writeFileSync(CSV_PATH, header);

  console.log('=' .repeat(70));
  console.log('  PHASE 2 — STRICT PARAMETER SWEEP');
  console.log(`  Data: ${MONTHS} months, cap: 100K signals`);
  console.log(`  ${sweeps.length} strict single-param + 10 combos`);
  console.log('=' .repeat(70));

  resetToBaseline();

  // Baseline first
  console.log(`\n--- BASELINE (${MONTHS} months) ---`);
  const baseStart = Date.now();
  const baseResult = await runBacktest(MONTHS, false, false, false);
  const baseElapsed = Math.round((Date.now() - baseStart) / 1000);
  if (baseResult.success && baseResult.report) {
    const r = baseResult.report;
    const row: Record<string, unknown> = {
      label: 'BASELINE', desc: 'current defaults',
      signals: r.total_signals, win_rate_pct: (r.win_rate * 100).toFixed(1),
      profit_factor: r.profit_factor, full_wins: r.full_win, partial_wins: r.partial_win,
      losses: r.loss, expired: r.expired, avg_rr_planned: r.avg_rr_planned,
      avg_realized_r: r.avg_realized_r, gross_win_r: r.gross_win_r,
      gross_loss_r: r.gross_loss_r, meets_target: r.meets_target,
    };
    const line = Object.values(row).map(csvEscape).join(',') + '\n';
    fs.appendFileSync(CSV_PATH, line);
    console.log(`  Baseline: ${r.total_signals} sig, ${(r.win_rate * 100).toFixed(1)}% WR, ${r.profit_factor.toFixed(3)} PF (${baseElapsed}s)`);
  }

  // Run sweeps
  const results: Record<string, unknown>[] = [];
  for (let i = 0; i < sweeps.length; i++) {
    const r = await runOne(sweeps[i], i, sweeps.length);
    if (r) results.push(r);
  }

  // Print summary sorted by WR desc, then PF desc
  console.log('\n' + '=' .repeat(90));
  console.log('  PHASE 2 SUMMARY (sorted by WR desc, then PF desc)');
  console.log('=' .repeat(90));
  results.sort((a, b) => {
    const wrA = parseFloat(a.win_rate_pct as string);
    const wrB = parseFloat(b.win_rate_pct as string);
    if (wrB !== wrA) return wrB - wrA;
    return (b.profit_factor as number) - (a.profit_factor as number);
  });
  console.log(`  ${'Label'.padEnd(12)} ${'Desc'.padEnd(38)} ${'Sig'.padEnd(6)} ${'WR%'.padEnd(7)} ${'PF'.padEnd(9)} ${'AvgR'.padEnd(8)}`);
  console.log('  ' + '-'.repeat(80));
  for (const r of results) {
    const marker = parseFloat(r.win_rate_pct as string) >= 70 ? '*' : ' ';
    console.log(`${marker} ${(r.label as string).padEnd(12)} ${(r.desc as string).padEnd(38)} ${String(r.signals).padEnd(6)} ${(r.win_rate_pct as string).padEnd(7)} ${(r.profit_factor as number).toFixed(3).padEnd(9)} ${(r.avg_realized_r as number).toFixed(4).padEnd(8)}`);
  }
  console.log('=' .repeat(90));
  console.log(`\n  CSV: ${CSV_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
