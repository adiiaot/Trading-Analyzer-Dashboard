"use client";

import { motion } from "framer-motion";
import { Radio, Zap, Clock } from "lucide-react";
import { useDashboardData } from "@/lib/data-context";

const STATUS_STYLES: Record<string, { cls: string; dot: string; label: string }> = {
  PENDING: { cls: "text-accent-gold", dot: "bg-accent-gold", label: "Pending" },
  FILLING: { cls: "text-status-info", dot: "bg-status-info", label: "Filling" },
  CLOSED: { cls: "text-status-win", dot: "bg-status-win", label: "Closed" },
  EXPIRED: { cls: "text-status-loss", dot: "bg-status-loss", label: "Expired" },
};

export function SignalFeed() {
  const { signalsFeed } = useDashboardData();
  const hasData = signalsFeed.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Radio className="w-4 h-4 text-accent-gold" />
          <h3 className="text-sm font-bold text-text-primary">Signal Feed</h3>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full text-status-win"
          style={{ background: "rgba(var(--status-win-rgb), 0.08)", border: "1px solid rgba(var(--status-win-rgb), 0.15)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-status-win animate-pulse-soft" />
          Live
        </span>
      </div>

      {hasData ? (
        <div className="space-y-2.5">
          {signalsFeed.map((signal, i) => {
            const style = STATUS_STYLES[signal.status] ?? STATUS_STYLES.PENDING;

            return (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl p-3.5 transition-all"
              style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                  <span className="text-xs font-semibold text-text-primary">
                    Signal #{signal.id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium ${style.cls}`}>{style.label}</span>
                  {signal.time && (
                    <span className="flex items-center gap-1 text-[10px] text-text-muted">
                      <Clock className="w-2.5 h-2.5" />
                      {signal.time}
                    </span>
                  )}
                </div>
              </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-text-muted">Confidence:</span>
                    <div className="w-16 h-[5px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${signal.confidence}%`,
                          background: signal.confidence >= 80
                            ? "linear-gradient(90deg, var(--profit), var(--gold))"
                            : signal.confidence >= 70
                            ? "var(--gold)"
                            : "var(--loss)",
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-text-primary">{signal.confidence}%</span>
                  </div>
                  {signal.pnl !== null && (
                    <span className={`text-xs font-mono font-semibold ${signal.pnl >= 0 ? "text-status-win" : "text-status-loss"}`}>
                      {signal.pnl >= 0 ? "+" : ""}${signal.pnl.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-2.5">
                  <Zap className="w-2.5 h-2.5 text-text-muted" />
                  {signal.entries.map((entry, j) => (
                    <span key={j} className="text-[11px] font-mono text-text-primary px-2 py-0.5 rounded-md"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)" }}>
                      {entry}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10">
          <Radio className="w-8 h-8 text-text-muted mb-2 opacity-30" />
          <p className="text-sm text-text-muted">No signals yet</p>
          <p className="text-xs text-text-muted mt-1 opacity-60">Generate signals via Telegram bot</p>
        </div>
      )}
    </motion.div>
  );
}
