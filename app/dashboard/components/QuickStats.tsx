"use client";

import { motion } from "framer-motion";
import { TrendingUp, Target, BarChart3, Briefcase, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useDashboardData } from "@/lib/data-context";

export function QuickStats() {
  const { quickStats, stats } = useDashboardData();
  const todayPnl = stats?.total_pnl ?? quickStats.todayPnl;
  const winRate = stats ? parseFloat((stats.win_rate * 100).toFixed(1)) : quickStats.winRate;
  const totalTrades = stats?.total_trades ?? quickStats.totalTrades;
  const openPositions = quickStats.openPositions;

  const items = [
    {
      label: "Today's P&L",
      value: `+$${todayPnl.toFixed(2)}`,
      icon: TrendingUp,
      accent: "text-status-win",
      bg: "bg-status-win/10",
      border: "rgba(var(--status-win-rgb), 0.15)",
      trend: "up" as const,
    },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      icon: Target,
      accent: "text-accent-gold",
      bg: "bg-accent-gold/10",
      border: "rgba(var(--accent-gold-rgb), 0.15)",
      trend: winRate >= 60 ? ("up" as const) : ("down" as const),
    },
    {
      label: "Total Trades",
      value: totalTrades.toString(),
      icon: BarChart3,
      accent: "text-status-info",
      bg: "bg-status-info/10",
      border: "rgba(var(--status-info-rgb), 0.15)",
      trend: null,
    },
    {
      label: "Open Positions",
      value: openPositions.toString(),
      icon: Briefcase,
      accent: openPositions > 0 ? "text-accent-gold" : "text-text-muted",
      bg: openPositions > 0 ? "bg-accent-gold/10" : "bg-[var(--glass-bg)]",
      border: openPositions > 0 ? "rgba(var(--accent-gold-rgb), 0.15)" : "var(--glass-border)",
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="relative overflow-hidden rounded-xl p-4"
            style={{
              background: "var(--glass-bg)",
              border: `1px solid ${stat.border}`,
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Gradient accent line */}
            <div
              className="absolute top-0 left-4 right-4 h-[2px] rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${stat.border.replace("0.15", "0.5")}, transparent)` }}
            />

            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <Icon className={`w-[15px] h-[15px] ${stat.accent}`} />
              </div>
            </div>

            <div className="flex items-end justify-between">
              <p className={`text-xl font-bold font-mono ${stat.accent}`}>{stat.value}</p>
              {stat.trend && (
                <span className={stat.trend === "up" ? "text-status-win" : "text-status-loss"}>
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
