'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { TradingStats } from '@/types';

interface KeyInsightsProps {
  stats: TradingStats;
}

export const KeyInsights = ({ stats }: KeyInsightsProps) => {
  const insights: string[] = [
    stats.win_rate >= 0.6
      ? `Your win rate of ${(stats.win_rate * 100).toFixed(0)}% is strong — you're winning more than half your trades. Focus on maintaining this edge.`
      : `Win rate of ${(stats.win_rate * 100).toFixed(0)}% needs improvement. Consider tighter entry filters and better risk-reward ratios.`,
    stats.profit_factor >= 1.5
      ? `Profit factor of ${stats.profit_factor.toFixed(2)}x shows excellent risk management. Your winners are ${stats.profit_factor.toFixed(1)}x larger than your losers.`
      : `Profit factor of ${stats.profit_factor.toFixed(2)}x is below target. Aim for at least 1.5x by cutting losers early.`,
    stats.total_pnl > 0
      ? `Overall profitability is positive at +$${stats.total_pnl.toFixed(2)}. Scaling up position sizing could accelerate growth.`
      : `Currently at -$${Math.abs(stats.total_pnl).toFixed(2)} drawdown. Consider reducing risk until profitability improves.`,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="glass-card"
    >
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="text-neon-green" size={20} />
        <h3 className="text-h3 font-bold text-text-primary">AI Insights</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + idx * 0.1, duration: 0.3 }}
            whileHover={{ borderColor: '#00FF88' }}
            className="bg-dark-sidebar border border-dark-border rounded-card p-4"
          >
            <p className="text-body text-text-secondary">{insight}</p>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ gap: '12px' }}
        className="mt-4 w-full py-3 border border-dark-border text-neon-green hover:bg-neon-green hover:text-dark-bg rounded-btn transition-all duration-200 flex items-center justify-center gap-2 text-body font-semibold"
      >
        Get Full Analysis
        <ArrowRight size={16} />
      </motion.button>
    </motion.div>
  );
};
