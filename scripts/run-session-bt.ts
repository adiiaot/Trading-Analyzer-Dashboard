import { runBacktest } from '../lib/signal-engine/backtester';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('Session-filtered web backtester (London-NY 13-17 UTC)');
  console.log('MIN_RRR=1.0, SL_ATR=1.5, BB_STD=2.0, every bar');
  const result = await runBacktest(6, true, false, false);
  if (result.success && result.report) {
    const r = result.report;
    console.log('Signals:     ' + r.total_signals);
    console.log('Full wins:   ' + r.full_win);
    console.log('Partial:     ' + r.partial_win);
    console.log('Losses:      ' + r.loss);
    console.log('Expired:     ' + r.expired);
    console.log('WR:          ' + (r.win_rate * 100).toFixed(1) + '%');
    console.log('PF:          ' + r.profit_factor.toFixed(2));
    console.log('AvgR:        ' + r.avg_realized_r.toFixed(4));
    console.log('Avg RR plan: ' + r.avg_rr_planned);
    const dir = path.join(__dirname, '..', 'backtest_results');
    fs.mkdirSync(dir, { recursive: true });
    const filepath = path.join(dir, 'session_filtered_6mo.json');
    fs.writeFileSync(filepath, JSON.stringify(r, null, 2));
    console.log('Saved: ' + filepath);
  } else {
    console.error('FAILED: ' + result.error);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
