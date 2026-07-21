import { runBacktest } from '../lib/signal-engine/backtester';
import { CONFIG } from '../lib/signal-engine/config';
import { sweepConfig } from '../lib/signal-engine/signal-generator';
import * as fs from 'fs';
import * as path from 'path';

interface SweepRun {
  param: string;
  label: string;
  patch: () => void;
}

const BASELINE = {
  MIN_RRR: 1.0,
  SL_ATR_MULTIPLE: 1.5,
  REGIME_ADX_THRESHOLD: 20,
  BREAKOUT_ATR_MULTIPLE: 0.25,
  CONSOLIDATION_LOOKBACK: 16,
  TREND_CONT_ADX_THRESHOLD: 15,
  TREND_CONT_MIN_RRR: 0.8,
  RSI_OVERBOUGHT: 72,
  RSI_OVERSOLD: 30,
  BB_STD: 2.0,
  ENTRY_SPACING_ATR: 0.15,
  TP_FALLBACK_R_MULTIPLE: 2.5,
};

function resetToBaseline() {
  CONFIG.MIN_RRR = BASELINE.MIN_RRR;
  CONFIG.SL_ATR_MULTIPLE = BASELINE.SL_ATR_MULTIPLE;
  CONFIG.REGIME_ADX_THRESHOLD = BASELINE.REGIME_ADX_THRESHOLD;
  CONFIG.BREAKOUT_ATR_MULTIPLE = BASELINE.BREAKOUT_ATR_MULTIPLE;
  CONFIG.CONSOLIDATION_LOOKBACK = BASELINE.CONSOLIDATION_LOOKBACK;
  CONFIG.TREND_CONT_ADX_THRESHOLD = BASELINE.TREND_CONT_ADX_THRESHOLD;
  CONFIG.TREND_CONT_MIN_RRR = BASELINE.TREND_CONT_MIN_RRR;
  CONFIG.ENTRY_SPACING_ATR = BASELINE.ENTRY_SPACING_ATR;
  CONFIG.TP_FALLBACK_R_MULTIPLE = BASELINE.TP_FALLBACK_R_MULTIPLE;
  sweepConfig.RSI_OVERBOUGHT = undefined;
  sweepConfig.RSI_OVERSOLD = undefined;
  sweepConfig.BB_STD = undefined;
}

const sweeps: SweepRun[] = [
  { param: 'MIN_RRR', label: 'rrr0.6', patch: () => { CONFIG.MIN_RRR = 0.6; } },
  { param: 'MIN_RRR', label: 'rrr0.8', patch: () => { CONFIG.MIN_RRR = 0.8; } },
  { param: 'MIN_RRR', label: 'rrr1.2', patch: () => { CONFIG.MIN_RRR = 1.2; } },

  { param: 'SL_ATR_MULTIPLE', label: 'sl1.0', patch: () => { CONFIG.SL_ATR_MULTIPLE = 1.0; } },
  { param: 'SL_ATR_MULTIPLE', label: 'sl2.0', patch: () => { CONFIG.SL_ATR_MULTIPLE = 2.0; } },

  { param: 'REGIME_ADX_THRESHOLD', label: 'adx15', patch: () => { CONFIG.REGIME_ADX_THRESHOLD = 15; } },
  { param: 'REGIME_ADX_THRESHOLD', label: 'adx18', patch: () => { CONFIG.REGIME_ADX_THRESHOLD = 18; } },

  { param: 'BREAKOUT_ATR_MULTIPLE', label: 'bo0.1', patch: () => { CONFIG.BREAKOUT_ATR_MULTIPLE = 0.1; } },
  { param: 'BREAKOUT_ATR_MULTIPLE', label: 'bo0.5', patch: () => { CONFIG.BREAKOUT_ATR_MULTIPLE = 0.5; } },

  { param: 'CONSOLIDATION_LOOKBACK', label: 'cl12', patch: () => { CONFIG.CONSOLIDATION_LOOKBACK = 12; } },
  { param: 'CONSOLIDATION_LOOKBACK', label: 'cl24', patch: () => { CONFIG.CONSOLIDATION_LOOKBACK = 24; } },

  { param: 'TREND_CONT_ADX_THRESHOLD', label: 'tca12', patch: () => { CONFIG.TREND_CONT_ADX_THRESHOLD = 12; } },
  { param: 'TREND_CONT_ADX_THRESHOLD', label: 'tca18', patch: () => { CONFIG.TREND_CONT_ADX_THRESHOLD = 18; } },

  { param: 'RSI_OVERBOUGHT', label: 'rsiOb75', patch: () => { sweepConfig.RSI_OVERBOUGHT = 75; } },
  { param: 'RSI_OVERBOUGHT', label: 'rsiOb80', patch: () => { sweepConfig.RSI_OVERBOUGHT = 80; } },

  { param: 'RSI_OVERSOLD', label: 'rsiOs25', patch: () => { sweepConfig.RSI_OVERSOLD = 25; } },

  { param: 'BB_STD', label: 'bb1.5', patch: () => { sweepConfig.BB_STD = 1.5; } },
  { param: 'BB_STD', label: 'bb2.5', patch: () => { sweepConfig.BB_STD = 2.5; } },

  { param: 'ENTRY_SPACING_ATR', label: 'es0.1', patch: () => { CONFIG.ENTRY_SPACING_ATR = 0.1; } },
  { param: 'ENTRY_SPACING_ATR', label: 'es0.2', patch: () => { CONFIG.ENTRY_SPACING_ATR = 0.2; } },

  { param: 'TP_FALLBACK_R_MULTIPLE', label: 'tp2.0', patch: () => { CONFIG.TP_FALLBACK_R_MULTIPLE = 2.0; } },
  { param: 'TP_FALLBACK_R_MULTIPLE', label: 'tp3.0', patch: () => { CONFIG.TP_FALLBACK_R_MULTIPLE = 3.0; } },
];

const OUT_DIR = path.join(__dirname, '..', 'backtest_results', 'sweep');
const CSV_PATH = path.join(OUT_DIR, 'sweep_phase1.csv');
const MONTHS = 1;

function csvEscape(v: unknown): string {
  const s = String(v ?? '');
  return s.includes(',') ? `"${s}"` : s;
}

function getPatchedValue(param: string): string {
  const key = param as keyof typeof CONFIG;
  if (key in CONFIG) return String(CONFIG[key]);
  if (param === 'RSI_OVERBOUGHT') return String(sweepConfig.RSI_OVERBOUGHT ?? BASELINE.RSI_OVERBOUGHT);
  if (param === 'RSI_OVERSOLD') return String(sweepConfig.RSI_OVERSOLD ?? BASELINE.RSI_OVERSOLD);
  if (param === 'BB_STD') return String(sweepConfig.BB_STD ?? BASELINE.BB_STD);
  return '?';
}

async function runOne(sweep: SweepRun, index: number, total: number): Promise<Record<string, unknown> | null> {
  resetToBaseline();
  sweep.patch();
  const val = getPatchedValue(sweep.param);
  console.log(`\n[${index + 1}/${total}] ${sweep.label} (${sweep.param}=${val}) ...`);
  try {
    const start = Date.now();
    const result = await runBacktest(MONTHS, false, false, false);
    const elapsed = Math.round((Date.now() - start) / 1000);
    if (result.success && result.report) {
      const r = result.report;
      const row: Record<string, unknown> = {
        param: sweep.param,
        label: sweep.label,
        config_label: `${sweep.param}=${val}`,
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
      console.log(`  => ${r.total_signals} sig, ${(r.win_rate * 100).toFixed(1)}% WR, ${r.profit_factor.toFixed(3)} PF (${elapsed}s)`);
      return row;
    } else {
      console.error(`  FAILED: ${result.error}`);
      const row: Record<string, unknown> = {
        param: sweep.param, label: sweep.label, config_label: `${sweep.param}=${val}`,
        signals: 0, win_rate_pct: '0.0', profit_factor: 0, full_wins: 0, partial_wins: 0,
        losses: 0, expired: 0, avg_rr_planned: 0, avg_realized_r: 0, gross_win_r: 0,
        gross_loss_r: 0, meets_target: false,
      };
      const line = Object.values(row).map(csvEscape).join(',') + '\n';
      fs.appendFileSync(CSV_PATH, line);
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
    'param', 'label', 'config_label', 'signals', 'win_rate_pct', 'profit_factor',
    'full_wins', 'partial_wins', 'losses', 'expired', 'avg_rr_planned',
    'avg_realized_r', 'gross_win_r', 'gross_loss_r', 'meets_target',
  ].join(',') + '\n';
  fs.writeFileSync(CSV_PATH, header);

  console.log('=' .repeat(70));
  console.log('  WEB BACKTESTER — PHASE 1 SINGLE-FACTOR SWEEP');
  console.log(`  Months: ${MONTHS}`);
  console.log(`  ${sweeps.length} runs + baseline`);
  console.log('=' .repeat(70));

  resetToBaseline();

  // Baseline first
  console.log(`\n--- BASELINE RUN ---`);
  const baseStart = Date.now();
  const baseResult = await runBacktest(MONTHS, false, false, false);
  const baseElapsed = Math.round((Date.now() - baseStart) / 1000);
  if (baseResult.success && baseResult.report) {
    const r = baseResult.report;
    const row: Record<string, unknown> = {
      param: 'BASELINE', label: 'baseline', config_label: 'defaults',
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

  // Print summary
  console.log('\n' + '=' .repeat(80));
  console.log('  PHASE 1 SWEEP SUMMARY (sorted by WR desc)');
  console.log('=' .repeat(80));
  results.sort((a, b) => parseFloat(b.win_rate_pct as string) - parseFloat(a.win_rate_pct as string));
  console.log(`  ${'Param'.padEnd(22)} ${'Label'.padEnd(14)} ${'Sig'.padEnd(5)} ${'WR%'.padEnd(7)} ${'PF'.padEnd(9)} ${'AvgR'.padEnd(8)}`);
  console.log('  ' + '-'.repeat(65));
  for (const r of results) {
    console.log(`  ${(r.param as string).padEnd(22)} ${(r.label as string).padEnd(14)} ${String(r.signals).padEnd(5)} ${(r.win_rate_pct as string).padEnd(7)} ${(r.profit_factor as number).toFixed(3).padEnd(9)} ${(r.avg_realized_r as number).toFixed(4).padEnd(8)}`);
  }
  console.log('=' .repeat(80));
  console.log(`\n  CSV: ${CSV_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
