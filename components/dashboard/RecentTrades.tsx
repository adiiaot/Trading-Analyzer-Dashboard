'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trade } from '@/types';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { formatTimeAgo } from '@/lib/formatters';

interface RecentTradesProps {
  trades: Trade[];
}

export const RecentTrades = ({ trades }: RecentTradesProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass-card"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-h3 font-bold text-text-primary">Recent Trades</h3>
        <button className="text-neon-green hover:text-neon-green-hover text-body font-medium flex items-center gap-1 transition">
          View All
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-body">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="text-left py-3 px-4 text-text-secondary text-label font-semibold uppercase">Date/Time</th>
              <th className="text-left py-3 px-4 text-text-secondary text-label font-semibold uppercase">Entry</th>
              <th className="text-left py-3 px-4 text-text-secondary text-label font-semibold uppercase">Exit</th>
              <th className="text-right py-3 px-4 text-text-secondary text-label font-semibold uppercase">P&L</th>
              <th className="text-left py-3 px-4 text-text-secondary text-label font-semibold uppercase">Result</th>
              <th className="text-left py-3 px-4 text-text-secondary text-label font-semibold uppercase">Duration</th>
            </tr>
          </thead>
          <tbody>
            {trades.slice(0, 15).map((trade, idx) => (
              <motion.tr
                key={trade.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ backgroundColor: 'rgba(26, 31, 58, 0.6)' }}
                className="border-b border-dark-border"
              >
                <td className="py-3 px-4 text-text-secondary">
                  {formatTimeAgo(trade.timestamp)}
                </td>
                <td className="py-3 px-4 text-text-primary font-mono-num">
                  ${trade.entry_price.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-text-primary font-mono-num">
                  ${trade.exit_price.toFixed(2)}
                </td>
                <td className={`py-3 px-4 text-right font-semibold font-mono-num ${
                  trade.pnl >= 0 ? 'text-neon-green' : 'text-alert-loss'
                }`}>
                  <span className="flex items-center justify-end gap-1">
                    ${trade.pnl.toFixed(2)}
                    {trade.pnl >= 0
                      ? <TrendingUp className="w-4 h-4 inline" />
                      : <TrendingDown className="w-4 h-4 inline" />
                    }
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={trade.result === 'win' ? 'badge-win' : 'badge-loss'}>
                    {trade.result.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4 text-text-secondary">
                  {trade.hold_time_seconds ? `${Math.floor(trade.hold_time_seconds / 60)}m ${trade.hold_time_seconds % 60}s` : 'N/A'}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
