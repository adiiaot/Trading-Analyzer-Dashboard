"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, X, StopCircle, Target } from "lucide-react";
import { useDashboardData } from "@/lib/data-context";

export function OpenPositionsTable() {
  const { positions } = useDashboardData();
  const hasData = positions.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-text-primary">Open Positions</h3>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{
            background: hasData ? "rgba(68,138,255,0.1)" : "var(--glass-bg)",
            border: `1px solid ${hasData ? "rgba(68,138,255,0.15)" : "var(--glass-border)"}`,
            color: hasData ? "rgb(var(--status-info-rgb))" : "var(--text-muted)",
          }}>
            {positions.length} active
          </span>
        </div>
      </div>

      {hasData ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                {["Symbol", "Direction", "Entry", "Current", "Pips", "P&L", "TP", "SL", "Actions"].map((h) => (
                  <th key={h} className="text-left text-[11px] text-text-muted font-medium pb-3 px-4 first:pl-5 last:pr-5 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {positions.map((pos, i) => {
                const isWin = (pos.pips ?? 0) >= 0;
                return (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="group transition-colors"
                    style={{ borderBottom: "1px solid var(--glass-border)" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td className="py-3 px-4 first:pl-5">
                      <span className="font-mono text-sm font-semibold text-text-primary">XAU/USD</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md ${
                        pos.direction === "BUY"
                          ? "bg-status-win/10 text-status-win"
                          : "bg-status-loss/10 text-status-loss"
                      }`}>
                        {pos.direction === "BUY" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {pos.direction}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-text-primary">{pos.entry.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-text-primary">{pos.current.toFixed(2)}</td>
                    <td className={`py-3 px-4 text-right font-mono ${isWin ? "text-status-win" : "text-status-loss"}`}>
                      <span className="tabular-nums">{isWin ? "+" : ""}{(pos.pips ?? 0).toFixed(1)}</span>
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-semibold ${isWin ? "text-status-win" : "text-status-loss"}`}>
                      <span className="tabular-nums">{isWin ? "+" : ""}${(pos.pnl ?? 0).toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-text-primary tabular-nums">{pos.tp.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-text-primary tabular-nums">{pos.sl.toFixed(2)}</td>
                    <td className="py-3 px-4 last:pr-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-md transition-all text-xs"
                          style={{ background: "rgba(255,82,82,0.1)", color: "rgb(var(--status-loss-rgb))" }}
                          title="Close position">
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-md transition-all text-xs"
                          style={{ background: "var(--glass-bg)", color: "var(--text-muted)" }}
                          title="Set stop loss">
                          <StopCircle className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-md transition-all text-xs"
                          style={{ background: "var(--glass-bg)", color: "var(--text-muted)" }}
                          title="Set take profit">
                          <Target className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-5">
          <TrendingUp className="w-10 h-10 text-text-muted mb-3 opacity-30" />
          <p className="text-sm text-text-muted">No open positions</p>
          <p className="text-xs text-text-muted mt-1 opacity-60">Signals will appear here when generated</p>
        </div>
      )}

      {hasData && (
        <div className="flex items-center justify-between px-5 py-2.5 text-[11px] text-text-muted" style={{ borderTop: "1px solid var(--glass-border)" }}>
          <span>Total exposure: ${positions.reduce((s, p) => s + Math.abs(p.pnl ?? 0), 0).toFixed(2)}</span>
          <span>{positions.filter(p => (p.pips ?? 0) >= 0).length} winning, {positions.filter(p => (p.pips ?? 0) < 0).length} losing</span>
        </div>
      )}
    </motion.div>
  );
}
