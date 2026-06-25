"use client";

import { motion } from "framer-motion";
import { useDashboardData } from "@/lib/data-context";

const STATUS_STYLES: Record<string, { cls: string; dot: string }> = {
  PENDING: { cls: "badge-gold", dot: "bg-accent-gold" },
  FILLING: { cls: "badge-info", dot: "bg-status-info" },
  CLOSED: { cls: "badge-win", dot: "bg-status-win" },
  EXPIRED: { cls: "badge-loss", dot: "bg-status-loss" },
};

export function SignalFeed() {
  const { signalsFeed } = useDashboardData();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-text-primary">Signal Feed</h3>
        <span className="badge-win text-xs">Live</span>
      </div>

      <div className="space-y-3">
        {signalsFeed.map((signal, i) => {
          const style = STATUS_STYLES[signal.status];
          return (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl p-3.5"
              style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                  <span className="text-sm font-mono font-semibold text-text-primary">
                    Signal #{signal.id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={style.cls}>{signal.status}</span>
                  <span className="text-xs text-text-muted">{signal.time}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">Confidence:</span>
                  <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--glass-bg)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${signal.confidence}%`,
                        background:
                          signal.confidence >= 80
                            ? "var(--profit)"
                            : signal.confidence >= 70
                            ? "var(--gold)"
                            : "var(--loss)",
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono text-text-primary">{signal.confidence}%</span>
                </div>
                {signal.pnl !== null && (
                  <span className={`text-xs font-mono font-semibold ${signal.pnl >= 0 ? "text-status-win" : "text-status-loss"}`}>
                    {signal.pnl >= 0 ? "+" : ""}${signal.pnl.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs text-text-muted">Levels:</span>
                {signal.entries.map((entry, j) => (
                  <span key={j} className="text-xs font-mono text-text-primary px-1.5 py-0.5 rounded-md"
                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                    {entry}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
