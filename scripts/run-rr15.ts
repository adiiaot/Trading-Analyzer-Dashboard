import { runBacktest } from '../lib/signal-engine/backtester';
import { CONFIG } from '../lib/signal-engine/config';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  CONFIG.MIN_RRR = 1.5;
  console.log('Testing MIN_RRR=1.5 on web backtester (every bar)...');
  const result = await runBacktest(6, false, false, false);
  if (result.success && result.report) {
    const r = result.report;
    console.log('Signals: ' + r.total_signals);
    console.log('WR: ' + (r.win_rate * 100).toFixed(1) + '%');
    console.log('PF: ' + r.profit_factor.toFixed(2));
    console.log('AvgR: ' + r.avg_realized_r.toFixed(4));
    console.log('Target met: ' + r.meets_target);
    const dir = path.join(__dirname, '..', 'backtest_results');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'sweep_web_rr15.json'), JSON.stringify(r, null, 2));
  } else {
    console.error('FAILED: ' + result.error);
  }
  CONFIG.MIN_RRR = 1.2;
}
main().catch(e => { console.error(e); process.exit(1); });
