import { NextResponse } from 'next/server';
import { runBacktest } from '@/lib/signal-engine/backtester';
import { CONFIG } from '@/lib/signal-engine/config';
import { sweepConfig } from '@/lib/signal-engine/signal-generator';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

interface SweepParam {
  name: string;
  values: number[];
  configKey?: string;
  sweepKey?: string;
}

const sweepParams: SweepParam[] = [
  { name: 'MIN_RRR', values: [0.6, 0.8, 1.0, 1.2], configKey: 'MIN_RRR' },
  { name: 'SL_ATR_MULTIPLE', values: [1.0, 1.5, 2.0, 2.5], configKey: 'SL_ATR_MULTIPLE' },
  { name: 'REGIME_ADX_THRESHOLD', values: [18, 20, 25, 30], configKey: 'REGIME_ADX_THRESHOLD' },
  { name: 'BREAKOUT_ATR_MULTIPLE', values: [0.1, 0.25, 0.5], configKey: 'BREAKOUT_ATR_MULTIPLE' },
  { name: 'CONSOLIDATION_LOOKBACK', values: [12, 16, 24], configKey: 'CONSOLIDATION_LOOKBACK' },
  { name: 'TREND_CONT_ADX_THRESHOLD', values: [15, 18, 20, 25], configKey: 'TREND_CONT_ADX_THRESHOLD' },
  { name: 'RSI_OVERBOUGHT', values: [72, 75, 80], sweepKey: 'RSI_OVERBOUGHT' },
  { name: 'RSI_OVERSOLD', values: [25, 30], sweepKey: 'RSI_OVERSOLD' },
  { name: 'BB_STD', values: [1.5, 2.0, 2.5], sweepKey: 'BB_STD' },
  { name: 'ENTRY_SPACING_ATR', values: [0.1, 0.15, 0.2], configKey: 'ENTRY_SPACING_ATR' },
  { name: 'TP_FALLBACK_R_MULTIPLE', values: [2.0, 2.5, 3.0], configKey: 'TP_FALLBACK_R_MULTIPLE' },
];

type ResultRow = {
  param: string;
  value: number;
  total_signals: number;
  win_rate: number;
  profit_factor: number;
  full_win: number;
  partial_win: number;
  loss: number;
  expired: number;
  avg_rr_planned: number;
  avg_realized_r: number;
};

function getDefaultValues(): { config: Record<string, number>; sweep: Record<string, unknown> } {
  const config: Record<string, number> = {};
  for (const p of sweepParams) {
    if (p.configKey) {
      config[p.configKey] = (CONFIG as any)[p.configKey];
    }
    if (p.sweepKey) {
      config[p.sweepKey] = (sweepConfig as any)[p.sweepKey];
    }
  }
  return {
    config,
    sweep: { ...sweepConfig },
  };
}

function runBaseline(): Promise<ResultRow> {
  return runSingle('baseline', (CONFIG as any).MIN_RRR ?? 1.0);
}

async function runSingle(paramName: string, paramValue: number): Promise<ResultRow> {
  const result = await runBacktest(1, false, false, false);
  if (!result.success || !result.report) {
    throw new Error(result.error || 'Backtest returned no report');
  }
  const r = result.report;
  return {
    param: paramName,
    value: paramValue,
    total_signals: r.total_signals ?? 0,
    win_rate: r.win_rate ?? 0,
    profit_factor: r.profit_factor ?? 0,
    full_win: r.full_win ?? 0,
    partial_win: r.partial_win ?? 0,
    loss: r.loss ?? 0,
    expired: r.expired ?? 0,
    avg_rr_planned: r.avg_rr_planned ?? 0,
    avg_realized_r: r.avg_realized_r ?? 0,
  };
}

function toCsvRow(row: ResultRow): string {
  return `${row.param},${row.value},${row.total_signals},${row.win_rate},${row.profit_factor},${row.full_win},${row.partial_win},${row.loss},${row.expired},${row.avg_rr_planned},${row.avg_realized_r}`;
}

export async function POST() {
  const results: ResultRow[] = [];
  let successCount = 0;
  let failCount = 0;

  try {
    const defaults = getDefaultValues();

    const configDefaults: Record<string, number> = {};
    for (const p of sweepParams) {
      if (p.configKey) configDefaults[p.configKey] = (CONFIG as any)[p.configKey];
      if (p.sweepKey) configDefaults[p.sweepKey] = (sweepConfig as any)[p.sweepKey];
    }

    const baselineResult = await runSingle('baseline', configDefaults.MIN_RRR ?? 1.0);
    results.push(baselineResult);
    successCount++;

    for (const param of sweepParams) {
      for (const value of param.values) {
        let savedConfig: number | undefined;
        let savedSweep: number | undefined;

        if (param.configKey) {
          savedConfig = (CONFIG as any)[param.configKey];
          (CONFIG as any)[param.configKey] = value;
        }
        if (param.sweepKey) {
          savedSweep = (sweepConfig as any)[param.sweepKey];
          (sweepConfig as any)[param.sweepKey] = value;
        }

        try {
          const row = await runSingle(param.name, value);
          results.push(row);
          successCount++;
        } catch (err: any) {
          failCount++;
          console.error(`[Sweep] ${param.name}=${value} failed:`, err?.message || err);
        }

        if (param.configKey && savedConfig !== undefined) {
          (CONFIG as any)[param.configKey] = savedConfig;
        }
        if (param.sweepKey && savedSweep !== undefined) {
          (sweepConfig as any)[param.sweepKey] = savedSweep;
        }
      }
    }

    results.sort((a, b) => b.win_rate - a.win_rate);

    const csvPath = join(process.cwd(), 'backtest_results.csv');
    const csvLines = [
      'param,value,total_signals,win_rate,profit_factor,full_win,partial_win,loss,expired,avg_rr_planned,avg_realized_r',
      ...results.map(toCsvRow),
    ];
    await writeFile(csvPath, csvLines.join('\n'), 'utf-8');

    return NextResponse.json({
      success: true,
      message: `Sweep complete. ${results.length} runs, ${successCount} succeeded, ${failCount} failed.`,
      count: results.length,
      filename: 'backtest_results.csv',
    });
  } catch (err: any) {
    console.error('[Sweep] Fatal error:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Sweep failed' },
      { status: 500 }
    );
  }
}
