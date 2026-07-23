"use client";

import { motion } from "framer-motion";
import { Target, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useDashboardData } from "@/lib/data-context";

export function QuickStats() {
  const { stats, quickStats } = useDashboardData();
  const winRate = stats ? parseFloat((stats.win_rate * 100).toFixed(1)) : quickStats.winRate;
  const totalTrades = stats?.total_trades ?? quickStats.totalTrades;
  const wins = stats?.wins ?? 0;
  const losses = stats?.losses ?? 0;

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        whileHover={{ y: -2, transition: { duration: 0.15 } }}
        className="relative overflow-hidden rounded-xl p-3 sm:p-4"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid rgba(var(--accent-gold-rgb), 0.15)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(var(--accent-gold-rgb), 0.5), transparent)" }}
        />
        <div className="flex items-center justify-between mb-2 sm:mb-2.5">
          <span className="text-[10px] sm:text-[11px] font-medium text-text-muted uppercase tracking-wider">Win Rate</span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(var(--accent-gold-rgb), 0.1)" }}>
            <Target className="w-3.5 h-3.5 sm:w-[15px] sm:h-[15px] text-accent-gold" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <p className={`text-lg sm:text-xl font-bold font-mono ${winRate >= 60 ? 'text-status-win' : 'text-status-loss'}`}>
            {winRate}%
          </p>
          {winRate >= 60 ? (
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-status-win" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-status-loss" />
          )}
        </div>
        {totalTrades > 0 && (
          <div className="mt-1.5 sm:mt-2 flex items-center gap-2 text-[9px] sm:text-[10px] text-text-muted">
            <span>{wins}W</span>
            <span className="opacity-30">/</span>
            <span>{losses}L</span>
            <span className="ml-auto font-mono">{(wins / Math.max(1, totalTrades) * 100).toFixed(0)}%</span>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.06 }}
        whileHover={{ y: -2, transition: { duration: 0.15 } }}
        className="relative overflow-hidden rounded-xl p-3 sm:p-4"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid rgba(var(--status-info-rgb), 0.15)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(var(--status-info-rgb), 0.5), transparent)" }}
        />
        <div className="flex items-center justify-between mb-2 sm:mb-2.5">
          <span className="text-[10px] sm:text-[11px] font-medium text-text-muted uppercase tracking-wider">Total Trades</span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(var(--status-info-rgb), 0.1)" }}>
            <BarChart3 className="w-3.5 h-3.5 sm:w-[15px] sm:h-[15px] text-status-info" />
          </div>
        </div>
        <p className="text-lg sm:text-xl font-bold font-mono text-text-primary">{totalTrades}</p>
        {totalTrades > 0 && (
          <div className="mt-1.5 sm:mt-2 flex items-center gap-2 text-[9px] sm:text-[10px] text-text-muted">
            <span>Win rate</span>
            <span className="font-mono font-semibold" style={{ color: winRate >= 60 ? 'var(--status-win)' : 'var(--status-loss)' }}>
              {winRate}%
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
