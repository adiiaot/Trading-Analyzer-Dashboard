"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Gauge, TrendingUp, Globe, DollarSign, Activity } from "lucide-react";
import { useDashboardData } from "@/lib/data-context";

const IMPACT: Record<string, string> = {
  HIGH: "bg-status-loss/10 text-status-loss",
  MEDIUM: "bg-accent-gold/10 text-accent-gold",
  LOW: "bg-status-info/10 text-status-info",
};

export function MarketSentiment() {
  const { sentiment } = useDashboardData();
  const { events } = sentiment;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-accent-gold" />
          <h3 className="text-sm font-bold text-text-primary">Market Sentiment</h3>
        </div>
      </div>

      <div className="space-y-3">
        {/* USD Strength + Volatility */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3.5" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-status-info" />
                <span className="text-xs font-medium text-text-muted">USD Strength</span>
              </div>
              <span className="text-xs font-mono text-text-primary">{sentiment.usdStrength}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sentiment.usdStrength}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, rgba(68,138,255,0.5), rgb(var(--status-info-rgb)))" }}
              />
            </div>
          </div>

          <div className="rounded-xl p-3.5" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-accent-gold" />
                <span className="text-xs font-medium text-text-muted">Volatility</span>
              </div>
              <span className="text-xs font-mono text-text-primary">{sentiment.volatility}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sentiment.volatility}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, rgba(240,180,41,0.5), rgb(var(--accent-gold-rgb)))" }}
              />
            </div>
          </div>
        </div>

        {/* Risk Sentiment */}
        <div className="rounded-xl p-3.5 flex items-center justify-between" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
          <div className="flex items-center gap-2">
            <Gauge className="w-3.5 h-3.5 text-accent-gold" />
            <span className="text-xs text-text-muted">Risk Sentiment</span>
          </div>
          <span className="text-xs font-semibold font-mono text-accent-gold">{sentiment.riskSentiment}</span>
        </div>

        {/* Events */}
        {events.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <AlertTriangle className="w-3.5 h-3.5 text-accent-gold" />
              <span className="text-xs font-medium text-text-muted">Key Events</span>
            </div>
            {events.map((evt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-xl p-3 mb-2 last:mb-0"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[11px] font-mono text-text-muted shrink-0">{evt.time}</span>
                  <span className="text-xs text-text-primary truncate">{evt.event}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${IMPACT[evt.impact] ?? "text-text-muted"}`}
                    style={{ border: `1px solid ${evt.impact === "HIGH" ? "rgba(255,82,82,0.15)" : evt.impact === "MEDIUM" ? "rgba(240,180,41,0.15)" : "rgba(68,138,255,0.15)"}` }}>
                    {evt.impact}
                  </span>
                  <span className={`text-[10px] font-mono ${evt.xau === "Bullish" ? "text-status-win" : "text-status-loss"}`}>
                    {evt.xau}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6">
            <Globe className="w-6 h-6 text-text-muted mb-2 opacity-30" />
            <p className="text-xs text-text-muted">No upcoming events</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
