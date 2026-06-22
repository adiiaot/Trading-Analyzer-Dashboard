'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TradingStats } from '@/types';

interface WinLossDistributionProps {
  stats: TradingStats;
}

export const WinLossDistribution = ({ stats }: WinLossDistributionProps) => {
  const data = [
    { name: 'Wins', value: stats.wins },
    { name: 'Losses', value: stats.losses },
  ];

  const COLORS = ['#00FF88', '#FF3D71'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card"
    >
      <h3 className="text-h3 font-bold text-text-primary mb-4">Win/Loss Distribution</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A1F3A',
              border: '1px solid #2D3561',
              borderRadius: '8px',
              color: '#FFFFFF',
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-neon-green" />
          <span className="text-body text-text-secondary">Wins: {stats.wins}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-alert-loss" />
          <span className="text-body text-text-secondary">Losses: {stats.losses}</span>
        </div>
      </div>
    </motion.div>
  );
};
