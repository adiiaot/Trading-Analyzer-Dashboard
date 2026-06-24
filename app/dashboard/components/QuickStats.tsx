"use client";

import { motion } from "framer-motion";
import { TrendingUp, Target, BarChart3, Briefcase } from "lucide-react";
import { useDashboardData } from "@/lib/data-context";

export function QuickStats() {
  const { quickStats, stats } = useDashboardData();
  const todayPnl = stats?.total_pnl ?? quickStats.todayPnl;
  const winRate = stats ? parseFloat((stats.win_rate * 100).toFixed(1)) : quickStats.winRate;
  const totalTrades = stats?.total_trades ?? quickStats.totalTrades;
  const openPositions = quickStats.openPositions;

  const STATS = [
    {
      label: "Today's P&L",
      value: `+$${todayPnl.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-status-win",
      bg: "bg-status-win/10",
    },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      icon: Target,
      color: "text-accent-gold",
      bg: "bg-accent-gold/10",
    },
    {
      label: "Total Trades",
      value: totalTrades.toString(),
      icon: BarChart3,
      color: "text-status-info",
      bg: "bg-status-info/10",
    },
    {
      label: "Open Positions",
      value: openPositions.toString(),
      icon: Briefcase,
      color: "text-status-info",
      bg: "bg-status-info/10",
    },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {STATS.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -2 }}
            className="card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-muted">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
