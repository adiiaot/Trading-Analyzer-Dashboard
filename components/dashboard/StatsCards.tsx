'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TradingStats } from '@/types';
import {
  DollarSign, Target, TrendingUp, Wallet, Link, Clock,
} from 'lucide-react';
import { animations } from '@/lib/animations/variants';

interface StatsCardsProps {
  stats: TradingStats;
  currentCapital: number;
}

interface SparklineProps {
  color?: string;
  height?: number;
}

const Sparkline = ({ color = '#00FF88', height = 60 }: SparklineProps) => (
  <svg width="100%" height={height} className="mt-3">
    <defs>
      <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
    <motion.path
      d="M0,50 Q10,45 20,48 T40,40 T60,35 T80,30 T100,25 T120,28 T140,22 T160,18"
      stroke={color}
      strokeWidth={2}
      fill="url(#sparkGradient)"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, ease: 'easeInOut' }}
    />
  </svg>
);

const MiniTradeBlocks = ({ last10 }: { last10: ('win' | 'loss')[] }) => (
  <div className="flex gap-1 mt-3">
    {last10.map((result, i) => (
      <motion.div
        key={i}
        className={`w-4 h-4 rounded-sm ${result === 'win' ? 'bg-neon-green' : 'bg-alert-loss'}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: i * 0.05, duration: 0.2 }}
      />
    ))}
  </div>
);

export const StatsCards = ({ stats, currentCapital }: StatsCardsProps) => {
  const startCapital = currentCapital - stats.total_pnl;
  const changePercent = startCapital > 0
    ? ((stats.total_pnl / startCapital) * 100).toFixed(1)
    : '0';

  const streakType = stats.consecutive_wins > stats.consecutive_losses ? 'win' : 'loss';
  const streakCount = streakType === 'win' ? stats.consecutive_wins : stats.consecutive_losses;
  const bestStreak = Math.max(stats.consecutive_wins, stats.consecutive_losses);

  const avgDurationMinutes = 12;
  const avgDurationSeconds = 34;

  const last10Trades: ('win' | 'loss')[] = [];
  const tradeRatio = Math.round(stats.win_rate * 10);
  for (let i = 0; i < 10; i++) {
    last10Trades.push(i < tradeRatio ? 'win' : 'loss');
  }

  const cards = [
    {
      title: 'Total P&L',
      value: `$${stats.total_pnl.toFixed(2)}`,
      icon: DollarSign,
      className: stats.total_pnl >= 0 ? 'text-neon-green' : 'text-alert-loss',
      change: `${stats.total_pnl >= 0 ? '+' : ''}$${stats.total_pnl.toFixed(2)} (${stats.total_pnl >= 0 ? '+' : ''}${changePercent}%)`,
      changeClass: stats.total_pnl >= 0 ? 'text-neon-green' : 'text-alert-loss',
      sparkColor: stats.total_pnl >= 0 ? '#00FF88' : '#FF3D71',
      showSparkline: true,
    },
    {
      title: 'Win Rate',
      value: `${(stats.win_rate * 100).toFixed(1)}%`,
      icon: Target,
      className: 'text-neon-green',
      change: `${stats.wins}W / ${stats.losses}L`,
      changeClass: 'text-neon-green',
      sparkColor: '#00FF88',
      showSparkline: true,
    },
    {
      title: 'Profit Factor',
      value: `${stats.profit_factor.toFixed(2)}x`,
      icon: TrendingUp,
      className: stats.profit_factor >= 1.5
        ? 'text-neon-green'
        : stats.profit_factor >= 1
          ? 'text-alert-warning'
          : 'text-alert-loss',
      change: `${stats.profit_factor >= 1.5 ? '+' : ''}${(stats.profit_factor - 1).toFixed(2)}x vs baseline`,
      changeClass: stats.profit_factor >= 1.5 ? 'text-neon-green' : 'text-alert-loss',
      sparkColor: stats.profit_factor >= 1.5 ? '#00FF88' : '#FFD700',
      showSparkline: true,
    },
    {
      title: 'Current Capital',
      value: `$${currentCapital.toFixed(2)}`,
      icon: Wallet,
      className: 'text-alert-info',
      change: 'Active | Demo',
      changeClass: 'text-text-secondary',
      sparkColor: '#3B82F6',
      showSparkline: true,
    },
    {
      title: 'Streak Status',
      value: `${streakCount} ${streakType.toUpperCase()}${streakCount > 1 ? 'S' : ''}`,
      icon: Link,
      className: streakType === 'win' ? 'text-neon-green' : 'text-alert-loss',
      change: `Longest: ${bestStreak} ${streakType}s in row`,
      changeClass: 'text-text-secondary',
      sparkColor: streakType === 'win' ? '#00FF88' : '#FF3D71',
      showSparkline: false,
      children: <MiniTradeBlocks last10={last10Trades} />,
    },
    {
      title: 'Avg Trade Duration',
      value: `${avgDurationMinutes}m ${avgDurationSeconds}s`,
      icon: Clock,
      className: 'text-alert-info',
      change: 'Fastest: 2m 10s | Slowest: 45m',
      changeClass: 'text-text-secondary',
      sparkColor: '#3B82F6',
      showSparkline: true,
    },
  ];

  return (
    <motion.div
      variants={animations.container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={idx}
            variants={animations.item}
            whileHover={{
              y: -2,
              boxShadow: '0 0 20px rgba(0, 255, 136, 0.15)',
              transition: { duration: 0.2 },
            }}
            className="glass-card flex flex-col"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-label text-text-secondary uppercase tracking-wider">
                {card.title}
              </span>
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className={`w-9 h-9 ${card.className} opacity-80`} />
              </motion.div>
            </div>

            <motion.p
              className={`text-h2 font-bold font-mono-num mt-1 ${card.className}`}
              whileHover={{ color: '#00FF88' }}
              transition={{ duration: 0.2 }}
            >
              {card.value}
            </motion.p>

            <p className={`text-body mt-1 ${card.changeClass}`}>
              {card.change}
            </p>

            {card.children}

            {card.showSparkline && <Sparkline color={card.sparkColor} />}
          </motion.div>
        );
      })}
    </motion.div>
  );
};
