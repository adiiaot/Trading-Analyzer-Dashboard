"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { useDashboardData } from "@/lib/data-context";
import { TrendingUp, TrendingDown, ChevronDown, Filter, Send, BarChart3 } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function JournalPage() {
  const { trades, stats } = useDashboardData();
  const closed = useMemo(() => trades.filter((t) => t.status === "closed"), [trades]);
  const [filter, setFilter] = useState<"all" | "win" | "loss">("all");
  const [sortNewest, setSortNewest] = useState(true);

  const filtered = useMemo(() => {
    let list = filter === "all" ? closed : closed.filter((t) => t.result === filter);
    return sortNewest ? [...list].reverse() : list;
  }, [closed, filter, sortNewest]);

  const totalPnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const wins = closed.filter((t) => t.result === "win").length;
  const losses = closed.filter((t) => t.result === "loss").length;

  const telegramLink = `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT || "aot_analyzer_bot"}`;

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-text-primary">Trade Journal</h1>
          <p className="text-sm text-text-muted">Every trade tells a story</p>
        </div>
        <a
          href={telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex items-center gap-2 px-4 py-2 text-xs w-fit"
        >
          <Send className="w-3.5 h-3.5" /> Log via Telegram
        </a>
      </motion.div>

      {closed.length > 0 && (
        <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Trades", value: closed.length.toString(), color: "text-text-primary" },
            { label: "Wins", value: wins.toString(), color: "text-status-win" },
            { label: "Losses", value: losses.toString(), color: "text-status-loss" },
            { label: "Net P&L", value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? "text-status-win" : "text-status-loss" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
              className="stat-card"
            >
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div variants={item}>
        <Card header="Trade History">
          {closed.length > 0 ? (
            <>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="flex gap-1 rounded-lg p-0.5" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                  {(["all", "win", "loss"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        filter === f
                          ? "text-accent-gold shadow-sm"
                          : "text-text-muted hover:text-text-primary"
                      }`}
                      style={filter === f ? { background: "var(--glass-bg)", border: "1px solid var(--glass-border)" } : {}}
                    >
                      {f === "all" ? "All" : f === "win" ? "Wins" : "Losses"}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSortNewest(!sortNewest)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-text-muted hover:text-text-primary transition-all"
                  style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${sortNewest ? "" : "rotate-180"}`} />
                  {sortNewest ? "Newest" : "Oldest"}
                </button>
              </div>

              <div className="space-y-2.5">
                {filtered.map((t, i) => {
                  const isWin = t.result === "win";
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      className="relative rounded-xl p-3.5 sm:p-4 transition-all"
                      style={{
                        background: "var(--glass-bg)",
                        border: `1px solid ${
                          isWin ? "rgba(0,230,118,0.12)" : "rgba(255,82,82,0.12)"
                        }`,
                        borderLeft: `3px solid ${
                          isWin ? "rgb(var(--status-win-rgb))" : "rgb(var(--status-loss-rgb))"
                        }`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isWin ? "bg-status-win/10" : "bg-status-loss/10"
                          }`}>
                            {t.trend === "UP" ? (
                              <TrendingUp className={`w-3.5 h-3.5 ${isWin ? "text-status-win" : "text-status-loss"}`} />
                            ) : (
                              <TrendingDown className={`w-3.5 h-3.5 ${isWin ? "text-status-win" : "text-status-loss"}`} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary truncate">
                              {t.trend === "UP" ? "LONG" : "SHORT"} #{t.id?.slice(-4)}
                            </p>
                            <p className="text-[10px] text-text-muted">
                              {new Date(t.timestamp).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-sm font-bold font-mono ${isWin ? "text-status-win" : "text-status-loss"}`}>
                            {isWin ? "+" : ""}${(t.pnl ?? 0).toFixed(2)}
                          </p>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            isWin ? "bg-status-win/10 text-status-win" : "bg-status-loss/10 text-status-loss"
                          }`}>
                            {isWin ? "WIN" : "LOSS"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-[11px] text-text-muted">
                        <span>Entry: <span className="font-mono text-text-primary">${t.entryPrice?.toFixed(2)}</span></span>
                        <span>Exit: <span className="font-mono text-text-primary">${t.exitPrice?.toFixed(2)}</span></span>
                        {t.pnlPercent != null && (
                          <span className={isWin ? "text-status-win" : "text-status-loss"}>
                            {t.pnlPercent >= 0 ? "+" : ""}{t.pnlPercent.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="w-10 h-10 text-text-muted mb-3 opacity-30" />
              <p className="text-sm text-text-muted">No trades logged yet</p>
              <p className="text-xs text-text-muted mt-1 opacity-60">Use <span className="font-mono text-accent-gold">/log_trade</span> in Telegram to record your first trade</p>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
