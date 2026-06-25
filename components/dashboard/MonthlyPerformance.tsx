'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Trade } from '@/types';

interface MonthlyPerformanceProps {
  trades: Trade[];
}

export const MonthlyPerformance = ({ trades }: MonthlyPerformanceProps) => {
  const monthlyData = useMemo(() => {
    const grouped: Record<string, { trades: number; pnl: number }> = {};

    trades.forEach(trade => {
      const date = new Date(trade.timestamp);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!grouped[key]) {
        grouped[key] = { trades: 0, pnl: 0 };
      }
      grouped[key].trades += 1;
      grouped[key].pnl += trade.pnl ?? 0;
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, data]) => ({
        month,
        pnl: parseFloat(data.pnl.toFixed(2)),
      }));
  }, [trades]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass-card"
    >
      <h3 className="text-h3 font-bold text-text-primary mb-4">Monthly Performance</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData}>
          <CartesianGrid stroke="#2D3561" strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            stroke="#A0AEC0"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#A0AEC0" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A1F3A',
              border: '1px solid #2D3561',
              borderRadius: '8px',
              color: '#FFFFFF',
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
          />
          <Bar
            dataKey="pnl"
            fill="#00FF88"
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
