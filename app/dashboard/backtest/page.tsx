"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Play, RefreshCw, Clock, TrendingUp, TrendingDown, Activity, Target } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

interface TrendBreakdown {
  signals: number;
  won: number;
  lost: number;
  expired: number;
  win_rate: number;
}

interface BacktestReport {
  backtest_date: string;
  session_filter_applied: boolean;
  total_signals: number;
  won: number;
  lost: number;
  expired: number;
  win_rate: number;
  loss_rate: number;
  expire_rate: number;
  avg_rr_win: number;
  avg_rr_all: number;
  profit_factor: number;
  trend_breakdown: Record<string, TrendBreakdown>;
  meets_target: boolean;
}

export default function BacktestPage() {
  const [months, setMonths] = useState(12);
  const [sessionFilter, setSessionFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<BacktestReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);

  const runBacktest = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    const start = Date.now();

    try {
      const res = await fetch(`/api/backtest?months=${months}&sessionFilter=${sessionFilter}`);
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Backtest failed");
        return;
      }

      setReport(data.report);
      setElapsed(Date.now() - start);
    } catch (err: any) {
      setError(err?.message || "Backend unreachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5">
      <motion.div variants={item}>
        <h1 className="text-lg md:text-xl font-bold text-text-primary">Backtest</h1>
        <p className="text-sm text-text-muted">Walk-forward swing strategy simulation</p>
      </motion.div>

      <motion.div variants={item} className="card p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-text-muted mb-1.5 font-medium">Lookback (months)</label>
            <div className="flex gap-1 rounded-lg p-0.5" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
              {[3, 6, 12, 18, 24].map((m) => (
                <button
                  key={m}
                  onClick={() => setMonths(m)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    months === m
                      ? "text-accent-gold shadow-sm"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                  style={months === m ? { background: "var(--glass-bg)", border: "1px solid var(--glass-border)" } : {}}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pb-0.5">
            <button
              onClick={() => setSessionFilter(!sessionFilter)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${
                sessionFilter
                  ? "bg-accent-gold/10 text-accent-gold border-accent-gold/30"
                  : "text-text-muted border-transparent"
              }`}
              style={!sessionFilter ? { background: "var(--glass-bg)", border: "1px solid var(--glass-border)" } : {}}
            >
              3-5pm WAT Only
            </button>
          </div>

          <button
            onClick={runBacktest}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, rgba(240,180,41,0.2), rgba(240,180,41,0.05))",
              border: "1px solid rgba(240,180,41,0.3)",
              color: "rgb(var(--accent-gold-rgb))",
            }}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {loading ? "Running..." : "Run Backtest"}
          </button>

          {elapsed !== null && (
            <span className="flex items-center gap-1.5 text-xs text-text-muted pb-0.5">
              <Clock className="w-3.5 h-3.5" />
              {(elapsed / 1000).toFixed(1)}s
            </span>
          )}
        </div>
      </motion.div>

      {error && (
        <motion.div variants={item} className="card p-4 border-status-loss/30">
          <p className="text-sm text-status-loss">{error}</p>
        </motion.div>
      )}

      {report && (
        <>
          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ["Total Signals", report.total_signals.toString(), "text-text-primary", Activity],
              ["Win Rate", `${(report.win_rate * 100).toFixed(1)}%`, report.win_rate >= 0.6 ? "text-status-win" : "text-status-loss", TrendingUp],
              ["Profit Factor", `${report.profit_factor.toFixed(2)}x`, report.profit_factor >= 1.3 ? "text-status-win" : "text-status-loss", TrendingDown],
              ["Avg R:R", report.avg_rr_all.toFixed(2), "text-accent-gold", Target],
            ].map(([l, v, c, Icon], i) => (
              <motion.div
                key={l as string}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="card p-4 text-center"
              >
                <div className="flex justify-center mb-2">
                  <Icon className="w-5 h-5" style={{ color: c === "text-accent-gold" ? "rgb(var(--accent-gold-rgb))" : undefined }} />
                </div>
                <p className="text-xs text-text-muted mb-1">{l as string}</p>
                <p className={`text-lg font-bold font-mono ${c as string}`}>{v as string}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div variants={item}>
              <Card header="Outcome Breakdown">
                <div className="space-y-3">
                  <div className="flex justify-between items-center glass-card rounded-card px-4 py-2.5">
                    <span className="text-sm text-text-primary">Won</span>
                    <span className="text-sm font-bold text-status-win">{report.won}</span>
                  </div>
                  <div className="flex justify-between items-center glass-card rounded-card px-4 py-2.5">
                    <span className="text-sm text-text-primary">Lost</span>
                    <span className="text-sm font-bold text-status-loss">{report.lost}</span>
                  </div>
                  <div className="flex justify-between items-center glass-card rounded-card px-4 py-2.5">
                    <span className="text-sm text-text-primary">Expired</span>
                    <span className="text-sm font-bold text-status-warn">{report.expired}</span>
                  </div>
                  <div className="flex justify-between items-center glass-card rounded-card px-4 py-2.5">
                    <span className="text-sm text-text-primary">Decided</span>
                    <span className="text-sm font-bold text-text-primary">{report.won + report.lost}</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card header="Performance">
                <div className="space-y-3">
                  {[
                    ["Win Rate", `${(report.win_rate * 100).toFixed(1)}%`, report.win_rate >= 0.6],
                    ["Loss Rate", `${(report.loss_rate * 100).toFixed(1)}%`, report.loss_rate < 0.4],
                    ["Expire Rate", `${(report.expire_rate * 100).toFixed(1)}%`, null],
                    ["Avg R:R (Wins)", report.avg_rr_win.toFixed(2), report.avg_rr_win >= 1.5],
                    ["Avg R:R (All)", report.avg_rr_all.toFixed(2), report.avg_rr_all >= 1.0],
                  ].map(([l, v, good]) => (
                    <div key={l as string} className="flex justify-between items-center glass-card rounded-card px-4 py-2.5">
                      <span className="text-sm text-text-primary">{l as string}</span>
                      <span className={`text-sm font-bold font-mono ${good === null ? "text-text-primary" : good ? "text-status-win" : "text-status-loss"}`}>{v as string}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div variants={item}>
            <Card header="Trend Breakdown">
              {Object.keys(report.trend_breakdown).length > 0 ? (
                <div className="overflow-x-auto -mx-5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-border">
                        {["Trend", "Signals", "Won", "Lost", "Expired", "Win Rate"].map((h) => (
                          <th key={h} className="text-left text-xs text-text-muted font-medium pb-3 px-5 first:pl-5 last:pr-5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(report.trend_breakdown).map(([trend, data], i) => (
                        <motion.tr
                          key={trend}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.2 }}
                          className="border-b border-surface-border/50 hover:glass-card/30"
                        >
                          <td className="py-3 px-5 first:pl-5">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-pill ${
                              trend === "UP" ? "bg-status-win/10 text-status-win" :
                              trend === "DOWN" ? "bg-status-loss/10 text-status-loss" :
                              "bg-status-warn/10 text-status-warn"
                            }`}>{trend}</span>
                          </td>
                          <td className="py-3 px-5 font-mono text-xs text-text-primary">{data.signals}</td>
                          <td className="py-3 px-5 font-mono text-xs text-status-win">{data.won}</td>
                          <td className="py-3 px-5 font-mono text-xs text-status-loss">{data.lost}</td>
                          <td className="py-3 px-5 font-mono text-xs text-text-muted">{data.expired}</td>
                          <td className={`py-3 px-5 last:pr-5 font-mono text-xs font-semibold ${data.win_rate >= 0.6 ? "text-status-win" : "text-status-loss"}`}>{(data.win_rate * 100).toFixed(1)}%</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-[100px] flex items-center justify-center glass-card rounded-card">
                  <span className="text-sm text-text-muted">No trend breakdown data</span>
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card header="Target Assessment">
              <div className={`p-4 rounded-lg text-sm ${
                report.meets_target
                  ? "bg-status-win/10 text-status-win border border-status-win/20"
                  : "bg-status-warn/10 text-status-warn border border-status-warn/20"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4" />
                  <span className="font-semibold">
                    {report.meets_target ? "Strategy Meets Target" : "Strategy Below Target"}
                  </span>
                </div>
                <ul className="space-y-1 text-xs opacity-80 ml-6 list-disc">
                  <li>Win Rate ≥ 65%: {(report.win_rate * 100).toFixed(1)}% {report.win_rate >= 0.65 ? "✓" : "✗"}</li>
                  <li>Profit Factor ≥ 1.3: {report.profit_factor.toFixed(2)}x {report.profit_factor >= 1.3 ? "✓" : "✗"}</li>
                  <li>Min 100 signals: {report.total_signals} {report.total_signals >= 100 ? "✓" : "✗"}</li>
                </ul>
              </div>
            </Card>
          </motion.div>
        </>
      )}

      {!report && !loading && !error && (
        <motion.div variants={item} className="card p-8 text-center">
          <Activity className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-40" />
          <p className="text-sm text-text-muted">Configure parameters above and click <span className="text-accent-gold font-semibold">Run Backtest</span> to simulate the swing strategy against historical XAU/USD data.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
