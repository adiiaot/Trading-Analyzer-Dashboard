'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Trade } from '@/types';

interface PerformanceChartProps {
  trades: Trade[];
}

type Timeframe = 'day' | 'week' | 'month';

export const PerformanceChart = ({ trades }: PerformanceChartProps) => {
  const [activeTab, setActiveTab] = useState<Timeframe>('month');

  const chartData = useMemo(() => {
    const sorted = [...trades]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const now = Date.now();
    const dayMs = 86400000;
    let cutoff: number;

    switch (activeTab) {
      case 'day':
        cutoff = now - dayMs;
        break;
      case 'week':
        cutoff = now - 7 * dayMs;
        break;
      case 'month':
      default:
        cutoff = now - 30 * dayMs;
        break;
    }

    const filtered = sorted.filter(t => new Date(t.timestamp).getTime() >= cutoff);
    if (filtered.length === 0) return [];

    return filtered.reduce((acc, trade, idx) => {
      const prevPnL = idx > 0 ? acc[idx - 1].cumulative : 0;
      return [
        ...acc,
        {
          time: new Date(trade.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            ...(activeTab === 'day' ? { hour: '2-digit', minute: '2-digit' } : {}),
          }),
          pnl: trade.pnl,
          cumulative: parseFloat((prevPnL + trade.pnl).toFixed(2)),
        },
      ];
    }, [] as any[]);
  }, [trades, activeTab]);

  const tabs: { key: Timeframe; label: string }[] = [
    { key: 'day', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-h3 text-text-primary font-bold">Performance Over Time</h2>
        <div className="flex gap-1 bg-dark-sidebar rounded-btn p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-btn text-small font-medium transition ${
                activeTab === tab.key
                  ? 'bg-neon-green text-dark-bg'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00FF88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#2D3561" strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
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
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#00FF88"
                strokeWidth={2}
                fill="url(#pnlGradient)"
                isAnimationActive={true}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
