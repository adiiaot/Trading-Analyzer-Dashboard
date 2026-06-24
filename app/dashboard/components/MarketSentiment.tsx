"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Gauge, TrendingUp, Globe } from "lucide-react";
import { useDashboardData } from "@/lib/data-context";

const IMPACT: Record<string, string> = {
  HIGH: "bg-status-loss/10 text-status-loss",
  MEDIUM: "bg-accent-gold/10 text-accent-gold",
  LOW: "bg-status-info/10 text-status-info",
};

export function MarketSentiment() {
  const { sentiment } = useDashboardData();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-text-primary">Market Sentiment</h3>
        <Globe className="w-4 h-4 text-text-muted" />
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-overlay rounded-xl p-3 border border-surface-border">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-3.5 h-3.5 text-status-info" />
              <span className="text-xs text-text-muted">USD Strength</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-surface-overlay rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-status-info transition-all"
                  style={{ width: `${sentiment.usdStrength}%` }}
                />
              </div>
              <span className="text-xs font-mono text-text-primary">{sentiment.usdStrength}%</span>
            </div>
          </div>

          <div className="bg-surface-overlay rounded-xl p-3 border border-surface-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-accent-gold" />
              <span className="text-xs text-text-muted">Volatility</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-surface-overlay rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent-gold transition-all"
                  style={{ width: `${sentiment.volatility}%` }}
                />
              </div>
              <span className="text-xs font-mono text-text-primary">{sentiment.volatility}%</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-overlay rounded-xl p-3 border border-surface-border flex items-center justify-between">
          <span className="text-xs text-text-muted">Risk Sentiment</span>
          <span className="text-xs font-mono text-accent-gold">{sentiment.riskSentiment}</span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-accent-gold" />
            <span className="text-xs text-text-muted">Events</span>
          </div>
          {sentiment.events.map((evt, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-surface-overlay rounded-xl p-3 border border-surface-border mb-2 last:mb-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-text-muted">{evt.time}</span>
                <span className="text-sm text-text-primary">{evt.event}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-md ${IMPACT[evt.impact]}`}>
                  {evt.impact}
                </span>
                <span className={`text-xs font-mono ${evt.xau === "Bullish" ? "text-status-win" : "text-text-muted"}`}>
                  XAU: {evt.xau}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
