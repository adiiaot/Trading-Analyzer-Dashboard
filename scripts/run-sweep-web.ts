import { runBacktest } from '../lib/signal-engine/backtester';
import { CONFIG } from '../lib/signal-engine/config';
import { sweepConfig } from '../lib/signal-engine/signal-generator';
import * as fs from 'fs';
import * as path from 'path';

interface SweepRun {
  label: string;
  patches: () => void;
}

function resetDefaults() {
  CONFIG.MIN_RRR = 1.2;
  CONFIG.SL_ATR_MULTIPLE = 1.5;
  sweepConfig.BB_STD = undefined;
  sweepConfig.RSI_OVERBOUGHT = undefined;
  sweepConfig.RSI_OVERSOLD = undefined;
}

const sweeps: SweepRun[] = [
  {
    label: 'combo_rr10_sl20',
    patches: () => { CONFIG.MIN_RRR = 1.0; CONFIG.SL_ATR_MULTIPLE = 2.0; },
  },
  {
    label: 'combo_rr10_bb22',
    patches: () => { CONFIG.MIN_RRR = 1.0; sweepConfig.BB_STD = 2.2; },
  },
  {
    label: 'combo_rr10_sl15',
    patches: () => { CONFIG.MIN_RRR = 1.0; },
  },
  {
    label: 'combo_rr12_sl20',
    patches: () => { CONFIG.SL_ATR_MULTIPLE = 2.0; },
  },
];

function pad(s: string | number, len: number): string {
  return String(s).padEnd(len);
}

function pct(n: number): string {
  return (n * 100).toFixed(1);
}

async function runOne(label: string, patches: () => void): Promise<Record<string, unknown> | null> {
  resetDefaults();
  patches();
  console.log('\n' + '='.repeat(60));
  console.log('  Running ' + label + ' ...');
  console.log('='.repeat(60));
  try {
    const result = await runBacktest(6, false, false, false);
    if (result.success && result.report) {
      const dir = path.join(__dirname, '..', 'backtest_results');
      fs.mkdirSync(dir, { recursive: true });
      const filepath = path.join(dir, 'sweep_web_' + label + '.json');
      fs.writeFileSync(filepath, JSON.stringify(result.report, null, 2));
      const r = result.report;
      console.log('  ' + label + ': ' + r.total_signals + ' sig, ' + pct(r.win_rate) + '% WR, ' + r.profit_factor.toFixed(2) + ' PF');
      return {
        label,
        signals: r.total_signals,
        win_rate: r.win_rate,
        profit_factor: r.profit_factor,
        avg_realized_r: r.avg_realized_r,
        meets_target: r.meets_target,
      };
    } else {
      console.error('  ' + label + ' FAILED: ' + result.error);
      return null;
    }
  } catch (e) {
    console.error('  ' + label + ' EXCEPTION: ' + e);
    return null;
  }
}

async function main() {
  console.log('Web backtester combined sweep (every bar)');
  console.log('Months: 6, Session filter: false');

  const results: Record<string, unknown>[] = [];
  for (const sweep of sweeps) {
    const r = await runOne(sweep.label, sweep.patches);
    if (r) results.push(r);
  }

  resetDefaults();
  console.log('\n' + '='.repeat(80));
  console.log('  COMBINED SWEEP SUMMARY');
  console.log('='.repeat(80));
  console.log('  ' + pad('Label', 20) + pad('Signals', 8) + pad('WR%', 8) + pad('PF', 8) + pad('AvgR', 8) + pad('Target', 8));
  console.log('  ' + '-'.repeat(72));
  for (const r of results) {
    const lbl = r.label as string;
    const sig = String(r.signals);
    const wr = pct(r.win_rate as number);
    const pf = (r.profit_factor as number).toFixed(2);
    const avgR = (r.avg_realized_r as number).toFixed(4);
    const tgt = String(r.meets_target);
    console.log('  ' + pad(lbl, 20) + pad(sig, 8) + pad(wr, 8) + pad(pf, 8) + pad(avgR, 8) + pad(tgt, 8));
  }
  console.log('='.repeat(80));
}

main().catch(err => { console.error(err); process.exit(1); });
