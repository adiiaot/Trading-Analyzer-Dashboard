'use client';

import React from 'react';
import { Trade } from '@/types';
import { TrendingUp, TrendingDown, Download } from 'lucide-react';
import { formatTimeAgo } from '@/lib/formatters';

interface TradeTableProps {
  trades: Trade[];
  onAnalyze?: (trade: Trade) => void;
}

export const TradeTable = ({ trades, onAnalyze }: TradeTableProps) => {
  const exportCSV = () => {
    const csv = [
      ['Date', 'Entry', 'Exit', 'PnL', 'PnL%', 'Result', 'Hold Time (s)'],
      ...trades.map(t => [
        new Date(t.timestamp).toLocaleString(),
        t.entryPrice?.toString() ?? '',
        t.exitPrice?.toString() ?? '',
        (t.pnl ?? 0).toFixed(2),
        (t.pnlPercent ?? 0).toFixed(2),
        (t.result ?? '').toUpperCase(),
        t.holdTimeSeconds?.toString() || 'N/A',
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades_${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-card p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-text-primary font-bold text-lg">Trade Logs</h2>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-dark-sidebar border border-dark-border hover:bg-dark-card text-text-secondary px-3 py-1.5 rounded-btn text-small transition"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-body">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="text-left py-3 px-4 text-text-secondary text-label font-semibold uppercase tracking-wider">Date</th>
              <th className="text-left py-3 px-4 text-text-secondary text-label font-semibold uppercase tracking-wider">Entry</th>
              <th className="text-left py-3 px-4 text-text-secondary text-label font-semibold uppercase tracking-wider">Exit</th>
              <th className="text-right py-3 px-4 text-text-secondary text-label font-semibold uppercase tracking-wider">P&L</th>
              <th className="text-left py-3 px-4 text-text-secondary text-label font-semibold uppercase tracking-wider">Result</th>
              <th className="text-left py-3 px-4 text-text-secondary text-label font-semibold uppercase tracking-wider">Hold</th>
              <th className="text-left py-3 px-4 text-text-secondary text-label font-semibold uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {trades.map(trade => (
              <tr
                key={trade.id}
                className="border-b border-dark-border hover:bg-dark-card/50 transition"
              >
                <td className="py-3 px-4 text-text-secondary">
                  {formatTimeAgo(trade.timestamp)}
                </td>
                <td className="py-3 px-4 text-text-secondary font-mono-num">${trade.entryPrice?.toFixed(2) ?? '0.00'}</td>
                <td className="py-3 px-4 text-text-secondary font-mono-num">${trade.exitPrice?.toFixed(2) ?? '0.00'}</td>
                <td className={`py-3 px-4 text-right font-semibold font-mono-num ${
                  (trade.pnl ?? 0) >= 0 ? 'text-neon-green' : 'text-alert-loss'
                }`}>
                  <span className="flex items-center justify-end gap-1">
                    ${(trade.pnl ?? 0).toFixed(2)}
                    {(trade.pnl ?? 0) >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={trade.result === 'win' ? 'badge-win' : 'badge-loss'}>
                    {(trade.result ?? 'N/A').toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4 text-text-secondary text-small">
                  {trade.holdTimeSeconds ? `${trade.holdTimeSeconds}s` : 'N/A'}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onAnalyze?.(trade)}
                    className="text-neon-green hover:text-neon-green-hover text-small font-semibold transition"
                  >
                    Analyze
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
