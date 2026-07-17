import { runBacktest } from '../lib/signal-engine/backtester';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const months = 6;
  const sessionFilter = false;
  const adaptive = false;
  const mc = false;

  console.log('=' .repeat(60));
  console.log(`  Web Backtester (every bar, no stride)`);
  console.log(`  Months: ${months}, Session filter: ${sessionFilter}, Adaptive: ${adaptive}, MC: ${mc}`);
  console.log('=' .repeat(60));

  const result = await runBacktest(months, sessionFilter, adaptive, mc);

  if (!result.success || !result.report) {
    console.error(`BACKTEST FAILED: ${result.error}`);
    process.exit(1);
  }

  const report = result.report;

  console.log();
  console.log('=' .repeat(60));
  console.log('  WEB BACKTEST RESULTS');
  console.log('=' .repeat(60));
  console.log(`  Total signals:        ${report.total_signals}`);
  console.log(`  Full wins:            ${report.full_win}`);
  console.log(`  Partial wins:         ${report.partial_win}`);
  console.log(`  Losses:               ${report.loss}`);
  console.log(`  Expired:              ${report.expired}`);
  console.log(`  Win rate:             ${(report.win_rate * 100).toFixed(1)}%`);
  console.log(`  Loss rate:            ${(report.loss_rate * 100).toFixed(1)}%`);
  console.log(`  Expire rate:          ${(report.expire_rate * 100).toFixed(1)}%`);
  console.log(`  Avg R:R (planned):   ${report.avg_rr_planned}`);
  console.log(`  Avg realized R:       ${report.avg_realized_r}`);
  console.log(`  Profit factor:        ${report.profit_factor}`);
  console.log(`  Gross win R:          ${report.gross_win_r}`);
  console.log(`  Gross loss R:         ${report.gross_loss_r}`);
  console.log();
  console.log('  Trend breakdown:');
  for (const [trend, data] of Object.entries(report.trend_breakdown)) {
    const d = data as { signals: number; win_rate: number };
    console.log(`    ${trend}: ${d.signals} signals, ${(d.win_rate * 100).toFixed(1)}% WR`);
  }
  console.log();
  console.log(`  Target met: ${report.meets_target}`);
  console.log('=' .repeat(60));

  if (result.monte_carlo) {
    const mc = result.monte_carlo;
    console.log();
    console.log('  MONTE CARLO (10,000 sims, 95% confidence)');
    console.log(`  WR mean:  ${(mc.win_rate.mean * 100).toFixed(1)}% [${(mc.win_rate['p2.5'] * 100).toFixed(1)}-${(mc.win_rate['p97.5'] * 100).toFixed(1)}]`);
    console.log(`  PF mean:  ${mc.profit_factor.mean.toFixed(2)} [${mc.profit_factor['p2.5'].toFixed(2)}-${mc.profit_factor['p97.5'].toFixed(2)}]`);
    console.log(`  AvgR mean: ${mc.avg_realized_r.mean.toFixed(4)} [${mc.avg_realized_r['p2.5'].toFixed(4)}-${mc.avg_realized_r['p97.5'].toFixed(4)}]`);
  }

  const dir = path.join(__dirname, '..', 'backtest_results');
  fs.mkdirSync(dir, { recursive: true });
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filepath = path.join(dir, `web_backtest_${dateStr}.json`);
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  console.log(`\n  Full report: ${filepath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
