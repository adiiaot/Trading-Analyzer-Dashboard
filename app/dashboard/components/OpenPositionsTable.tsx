"use client";

import { motion } from "framer-motion";
import { useDashboardData } from "@/lib/data-context";

export function OpenPositionsTable() {
  const { positions } = useDashboardData();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-text-primary">Open Positions</h3>
        <span className="badge-info">{positions.length} active</span>
      </div>

      <div className="overflow-x-auto -mx-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left text-xs text-text-muted font-medium pb-3 px-6 first:pl-6">Symbol</th>
              <th className="text-left text-xs text-text-muted font-medium pb-3 px-4">Dir</th>
              <th className="text-right text-xs text-text-muted font-medium pb-3 px-4">Entry</th>
              <th className="text-right text-xs text-text-muted font-medium pb-3 px-4">Current</th>
              <th className="text-right text-xs text-text-muted font-medium pb-3 px-4">Pips</th>
              <th className="text-right text-xs text-text-muted font-medium pb-3 px-4">P&L</th>
              <th className="text-right text-xs text-text-muted font-medium pb-3 px-4">TP</th>
              <th className="text-right text-xs text-text-muted font-medium pb-3 px-4">SL</th>
              <th className="text-right text-xs text-text-muted font-medium pb-3 px-6 last:pr-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.06 }}
                className="border-b border-surface-border/50 hover:bg-surface-overlay/50 transition-colors"
              >
                <td className="py-3 px-6 first:pl-6">
                  <span className="font-mono text-sm text-text-primary">XAU/USD</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    pos.direction === "BUY"
                      ? "bg-status-win/10 text-status-win"
                      : "bg-status-loss/10 text-loss"
                  }`}>
                    {pos.direction}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono text-text-primary">{pos.entry.toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-mono text-text-primary">{pos.current.toFixed(2)}</td>
                <td className={`py-3 px-4 text-right font-mono ${pos.pips >= 0 ? "text-status-win" : "text-status-loss"}`}>
                  {pos.pips >= 0 ? "+" : ""}{pos.pips.toFixed(1)}
                </td>
                <td className={`py-3 px-4 text-right font-mono font-semibold ${pos.pnl >= 0 ? "text-status-win" : "text-status-loss"}`}>
                  {pos.pnl >= 0 ? "+" : ""}${pos.pnl.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-text-primary">{pos.tp.toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-mono text-text-primary">{pos.sl.toFixed(2)}</td>
                <td className="py-3 px-6 last:pr-6 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button className="text-xs px-2.5 py-1 rounded-md bg-status-loss/10 text-loss hover:bg-status-loss/20 transition-all">
                      Close
                    </button>
                    <button className="text-xs px-2.5 py-1 rounded-md bg-surface-overlay text-text-muted hover:text-text-primary transition-all">
                      SL
                    </button>
                    <button className="text-xs px-2.5 py-1 rounded-md bg-surface-overlay text-text-muted hover:text-text-primary transition-all">
                      TP
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
