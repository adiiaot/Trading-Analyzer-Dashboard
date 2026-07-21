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

function resetConfig() {
  CONFIG.MIN_RRR = 1.0;
  CONFIG.SL_ATR_MULTIPLE = 1.5;
  CONFIG.REGIME_ADX_THRESHOLD = 20;
  CONFIG.TP_FALLBACK_R_MULTIPLE = 2.5;
  CONFIG.ENTRY_SPACING_ATR = 0.15;
  CONFIG.BREAKOUT_ATR_MULTIPLE = 0.25;
  CONFIG.BREAKOUT_MIN_RANGE = 5.0;
  CONFIG.CONSOLIDATION_LOOKBACK = 16;
  CONFIG.TREND_CONT_ADX_THRESHOLD = 15;
  CONFIG.TREND_CONT_MIN_RRR = 0.8;
  CONFIG.EMA_BOUNCE_MIN_DIST_ATR = 0.1;
  CONFIG.EMA_BOUNCE_MAX_DIST_ATR = 2.0;
  sweepConfig.STRICT_MODE = undefined;
  sweepConfig.STRICT_KEEP_BREAKOUT = undefined;
  sweepConfig.STRICT_KEEP_TREND_CONT = undefined;
  sweepConfig.RSI_OVERBOUGHT = undefined;
  sweepConfig.RSI_OVERSOLD = undefined;
  sweepConfig.BB_STD = undefined;
}

const sweeps: SweepRun[] = [
  // === Pure strict mode ===
  {
    label: 'strict',
    desc: 'strict mode, default params, EMA bounce only',
    patch: () => { sweepConfig.STRICT_MODE = true; },
  },

  // === Strict + SL variation ===
  {
    label: 'strict_sl0.3',
    desc: 'strict + SL 0.3 ATR',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.SL_ATR_MULTIPLE = 0.3;
    },
  },
  {
    label: 'strict_sl0.5',
    desc: 'strict + SL 0.5 ATR',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.SL_ATR_MULTIPLE = 0.5;
    },
  },
  {
    label: 'strict_sl1.0',
    desc: 'strict + SL 1.0 ATR',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.SL_ATR_MULTIPLE = 1.0;
    },
  },

  // === Strict + TP variation ===
  {
    label: 'strict_tp1.0',
    desc: 'strict + TP fallback 1.0R',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 1.0;
    },
  },
  {
    label: 'strict_tp1.5',
    desc: 'strict + TP fallback 1.5R',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 1.5;
    },
  },
  {
    label: 'strict_tp2.0',
    desc: 'strict + TP fallback 2.0R',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 2.0;
    },
  },

  // === Strict + SL + TP combos ===
  {
    label: 'strict_sl0.5_tp1.0',
    desc: 'strict + SL 0.5 + TP 1.0R',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.SL_ATR_MULTIPLE = 0.5;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 1.0;
    },
  },
  {
    label: 'strict_sl0.5_tp1.5',
    desc: 'strict + SL 0.5 + TP 1.5R',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.SL_ATR_MULTIPLE = 0.5;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 1.5;
    },
  },
  {
    label: 'strict_sl0.3_tp1.0',
    desc: 'strict + SL 0.3 + TP 1.0R',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.SL_ATR_MULTIPLE = 0.3;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 1.0;
    },
  },
  {
    label: 'strict_sl0.3_tp0.5',
    desc: 'strict + SL 0.3 + TP 0.5R',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.SL_ATR_MULTIPLE = 0.3;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 0.5;
    },
  },

  // === Strict + RRR variation ===
  {
    label: 'strict_rrr0.5',
    desc: 'strict + MIN_RRR 0.5',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.MIN_RRR = 0.5;
    },
  },
  {
    label: 'strict_rrr0.3',
    desc: 'strict + MIN_RRR 0.3',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.MIN_RRR = 0.3;
    },
  },

  // === Strict + EMA distance ===
  {
    label: 'strict_ebd0.3_1.0',
    desc: 'strict + EMA dist 0.3-1.0 ATR',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.EMA_BOUNCE_MIN_DIST_ATR = 0.3;
      CONFIG.EMA_BOUNCE_MAX_DIST_ATR = 1.0;
    },
  },
  {
    label: 'strict_ebd0.5_1.5',
    desc: 'strict + EMA dist 0.5-1.5 ATR',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.EMA_BOUNCE_MIN_DIST_ATR = 0.5;
      CONFIG.EMA_BOUNCE_MAX_DIST_ATR = 1.5;
    },
  },

  // === Strict + ADX variation ===
  {
    label: 'strict_adx25',
    desc: 'strict + regime ADX 25',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.REGIME_ADX_THRESHOLD = 25;
    },
  },
  {
    label: 'strict_adx30',
    desc: 'strict + regime ADX 30',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.REGIME_ADX_THRESHOLD = 30;
    },
  },

  // === Strict + entry spacing ===
  {
    label: 'strict_es0.05',
    desc: 'strict + entry spacing 0.05 ATR',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.ENTRY_SPACING_ATR = 0.05;
    },
  },
  {
    label: 'strict_es0.02',
    desc: 'strict + entry spacing 0.02 ATR',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.ENTRY_SPACING_ATR = 0.02;
    },
  },

  // === Strict with breakout kept ===
  {
    label: 'strict_brk',
    desc: 'strict + keep consolidation breakout',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      sweepConfig.STRICT_KEEP_BREAKOUT = true;
    },
  },

  // === Best combos ===
  {
    label: 'best1',
    desc: 'strict + SL0.5 + TP1.0 + ADX25',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.SL_ATR_MULTIPLE = 0.5;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 1.0;
      CONFIG.REGIME_ADX_THRESHOLD = 25;
    },
  },
  {
    label: 'best2',
    desc: 'strict + SL0.3 + TP1.0 + ADX25',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.SL_ATR_MULTIPLE = 0.3;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 1.0;
      CONFIG.REGIME_ADX_THRESHOLD = 25;
    },
  },
  {
    label: 'best3',
    desc: 'strict + SL0.5 + TP1.5 + ADX25 + EBD',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.SL_ATR_MULTIPLE = 0.5;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 1.5;
      CONFIG.REGIME_ADX_THRESHOLD = 25;
      CONFIG.EMA_BOUNCE_MIN_DIST_ATR = 0.3;
      CONFIG.EMA_BOUNCE_MAX_DIST_ATR = 1.0;
    },
  },
  {
    label: 'best4',
    desc: 'strict + SL0.3 + TP0.5 + ADX30',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.SL_ATR_MULTIPLE = 0.3;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 0.5;
      CONFIG.REGIME_ADX_THRESHOLD = 30;
    },
  },
  {
    label: 'best5',
    desc: 'strict + SL0.5 + TP1.0 + ADX30 + EBD',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.SL_ATR_MULTIPLE = 0.5;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 1.0;
      CONFIG.REGIME_ADX_THRESHOLD = 30;
      CONFIG.EMA_BOUNCE_MIN_DIST_ATR = 0.5;
      CONFIG.EMA_BOUNCE_MAX_DIST_ATR = 1.0;
    },
  },
  {
    label: 'best6',
    desc: 'strict + SL0.3 + TP1.0 + ADX30 + EBD',
    patch: () => {
      sweepConfig.STRICT_MODE = true;
      CONFIG.SL_ATR_MULTIPLE = 0.3;
      CONFIG.TP_FALLBACK_R_MULTIPLE = 1.0;
      CONFIG.REGIME_ADX_THRESHOLD = 30;
      CONFIG.EMA_BOUNCE_MIN_DIST_ATR = 0.5;
      CONFIG.EMA_BOUNCE_MAX_DIST_ATR = 1.0;
    },
  },
];

const OUT_DIR = path.join(__dirname, '..', 'backtest_results', 'sweep');
const CSV_PATH = path.join(OUT_DIR, 'sweep_phase3.csv');
const MONTHS = 6;

function csvEscape(v: unknown): string {
  const s = String(v ?? '');
  return s.includes(',') ? `"${s}"` : s;
}

async function runOne(sweep: SweepRun, index: number, total: number): Promise<Record<string, unknown> | null> {
  resetConfig();
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
      else if (r.win_rate >= 0.60) marker = ' + 60%+ WR';
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
  console.log('  PHASE 3 — STRICT MODE SWEEP');
  console.log(`  Data: ${MONTHS} months, ${sweeps.length} runs`);
  console.log('=' .repeat(70));

  // Baseline first (current loose mode)
  console.log(`\n--- BASELINE (current loose) ---`);
  const baseStart = Date.now();
  const baseResult = await runBacktest(MONTHS, false, false, false);
  const baseElapsed = Math.round((Date.now() - baseStart) / 1000);
  if (baseResult.success && baseResult.report) {
    const r = baseResult.report;
    const row: Record<string, unknown> = {
      label: 'BASELINE', desc: 'current loose defaults',
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

  // Summary sorted by WR desc
  console.log('\n' + '=' .repeat(100));
  console.log('  PHASE 3 SUMMARY (sorted by WR desc)');
  console.log('=' .repeat(100));
  results.sort((a, b) => parseFloat(b.win_rate_pct as string) - parseFloat(a.win_rate_pct as string));
  console.log(`  ${'Label'.padEnd(18)} ${'Sig'.padEnd(6)} ${'WR%'.padEnd(7)} ${'PF'.padEnd(9)} ${'AvgR'.padEnd(8)} ${'Desc'}`);
  console.log('  ' + '-'.repeat(90));
  for (const r of results) {
    const wr = parseFloat(r.win_rate_pct as string);
    const marker = wr >= 70 ? '***' : wr >= 60 ? '** ' : wr >= 50 ? '*  ' : '   ';
    console.log(`${marker} ${(r.label as string).padEnd(18)} ${String(r.signals).padEnd(6)} ${(r.win_rate_pct as string).padEnd(7)} ${(r.profit_factor as number).toFixed(3).padEnd(9)} ${(r.avg_realized_r as number).toFixed(4).padEnd(8)} ${r.desc as string}`);
  }
  console.log('=' .repeat(100));
  console.log(`\n  CSV: ${CSV_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
