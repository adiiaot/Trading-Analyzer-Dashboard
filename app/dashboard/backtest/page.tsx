"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Play, RefreshCw, Clock, TrendingUp, TrendingDown, Activity, Target, BarChart4, Sigma } from "lucide-react";

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

interface MonteCarloStats {
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  p2_5: number;
  p97_5: number;
}

interface MonteCarloResult {
  num_simulations: number;
  confidence_level: number;
  sample_size: number;
  win_rate: MonteCarloStats;
  profit_factor: MonteCarloStats;
  avg_realized_r: MonteCarloStats;
  max_drawdown_pct: MonteCarloStats;
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
  avg_rr_planned: number;
  avg_realized_r: number;
  profit_factor: number;
  gross_win_r: number;
  gross_loss_r: number;
  trend_breakdown: Record<string, TrendBreakdown>;
  confidence_calibration: Record<string, any>;
  meets_target: boolean;
}

export default function BacktestPage() {
  const [months, setMonths] = useState(12);
  const [sessionFilter, setSessionFilter] = useState(false);
  const [enableMc, setEnableMc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<BacktestReport | null>(null);
  const [mcResult, setMcResult] = useState<MonteCarloResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const MAX_RETRIES = 5;
  const retryCountRef = useRef(0);
  const [autoRetrying, setAutoRetrying] = useState(false);
  const autoRetryRef = useRef<NodeJS.Timeout>();

  const runBacktest = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    setMcResult(null);
    const start = Date.now();

    try {
      const res = await fetch(`/api/backtest?months=${months}&sessionFilter=${sessionFilter}&mc=${enableMc}`);
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Backtest failed");
        return;
      }

      setReport(data.report);
      if (data.monte_carlo) setMcResult(data.monte_carlo);
      setElapsed(Date.now() - start);
      retryCountRef.current = 0;
      setAutoRetrying(false);
    } catch (err: any) {
      setError(err?.message || "Backend unreachable");
      scheduleRetry();
    } finally {
      setLoading(false);
    }
  };

  const scheduleRetry = () => {
    retryCountRef.current += 1;
    if (retryCountRef.current > MAX_RETRIES) {
      setAutoRetrying(false);
      return;
    }
    setAutoRetrying(true);
    if (autoRetryRef.current) clearTimeout(autoRetryRef.current);
    autoRetryRef.current = setTimeout(() => {
      runBacktest();
    }, 5000);
  };

  const cancelRetry = () => {
    if (autoRetryRef.current) clearTimeout(autoRetryRef.current);
    setAutoRetrying(false);
    retryCountRef.current = 0;
  };

  const wakeBot = async () => {
    try {
      await fetch("/api/backtest?months=1&sessionFilter=false&mc=false", { signal: AbortSignal.timeout(5000) });
    } catch {
      // ignore — wake call is fire-and-forget
    }
    scheduleRetry();
  };

  useEffect(() => {
    return () => {
      if (autoRetryRef.current) clearTimeout(autoRetryRef.current);
    };
  }, []);

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5">
      <motion.div variants={item}>
        <h1 className="text-lg md:text-xl font-bold text-text-primary">Backtest</h1>
        <p className="text-sm text-text-muted">Walk-forward swing strategy simulation</p>
      </motion.div>

      <motion.div variants={item} className="card p-4 sm:p-5">
        <div className="flex flex-wrap items-end gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] sm:text-xs text-text-muted mb-1.5 font-medium">Lookback</label>
            <div className="flex gap-1 rounded-lg p-0.5 w-fit" style={{ background: "rgb(var(--surface-overlay-rgb))", border: "1px solid rgb(var(--text-primary-rgb))" }}>
              {[3, 6, 12, 18, 24].map((m) => (
                <button
                  key={m}
                  onClick={() => setMonths(m)}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all"
                  style={{
                    background: months === m ? 'rgb(var(--accent-gold-rgb))' : 'transparent',
                    color: months === m ? '#ffffff' : 'rgb(var(--text-muted-rgb))',
                    border: months === m ? '1px solid rgb(var(--accent-gold-rgb))' : '1px solid transparent',
                  }}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pb-0.5">
            <button
              onClick={() => setSessionFilter(!sessionFilter)}
              className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all border"
              style={{
                background: sessionFilter ? 'rgb(var(--accent-gold-rgb))' : 'rgb(var(--surface-overlay-rgb))',
                color: sessionFilter ? '#ffffff' : 'rgb(var(--text-muted-rgb))',
                borderColor: sessionFilter ? 'rgb(var(--accent-gold-rgb))' : 'rgb(var(--text-primary-rgb))',
              }}
            >
              WAT Only
            </button>
            <button
              onClick={() => setEnableMc(!enableMc)}
              className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all border"
              style={{
                background: enableMc ? 'rgb(var(--status-info-rgb))' : 'rgb(var(--surface-overlay-rgb))',
                color: enableMc ? '#ffffff' : 'rgb(var(--text-muted-rgb))',
                borderColor: enableMc ? 'rgb(var(--status-info-rgb))' : 'rgb(var(--text-primary-rgb))',
              }}
            >
              <Sigma className="w-2.5 sm:w-3 h-2.5 sm:h-3 inline mr-0.5 sm:mr-1" />
              MC
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={runBacktest}
              disabled={loading}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, rgb(var(--accent-gold-rgb)), rgb(var(--accent-gold-hover-rgb)))",
                border: "1px solid rgb(var(--accent-gold-rgb))",
                color: "#ffffff",
              }}
            >
              {loading ? (
                <RefreshCw className="w-3 sm:w-4 h-3 sm:h-4 animate-spin" />
              ) : (
                <Play className="w-3 sm:w-4 h-3 sm:h-4" />
              )}
              {loading ? "Running..." : "Run"}
            </button>

            {elapsed !== null && (
              <span className="flex items-center gap-1 text-[10px] sm:text-xs text-text-muted">
                <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                {(elapsed / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={item} className="card p-4 sm:p-5 border-status-warn/30">
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${autoRetrying ? 'bg-status-warn animate-pulse' : 'bg-status-loss'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-status-loss font-medium">
                  {autoRetrying ? 'Bot is waking up...' : 'Bot offline'}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {autoRetrying
                    ? `The backend is on a free-tier host and may be sleeping. Retrying automatically...`
                    : `Backend unreachable — the bot server may be asleep.`}
                </p>
                <p className="text-xs text-text-muted mt-1 font-mono">{error}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {autoRetrying ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-status-warn"
                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Retry {retryCountRef.current}/{MAX_RETRIES}</span>
                  </div>
                  <button
                    onClick={cancelRetry}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ background: "rgb(var(--surface-overlay-rgb))", color: "var(--status-loss)", border: "1px solid rgb(var(--status-loss-rgb))" }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => runBacktest()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: "linear-gradient(135deg, rgb(var(--accent-gold-rgb)), rgb(var(--accent-gold-hover-rgb)))",
                      border: "1px solid rgb(var(--accent-gold-rgb))",
                      color: "#ffffff",
                    }}
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retry
                  </button>
                  <button
                    onClick={wakeBot}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ background: "rgb(var(--surface-overlay-rgb))", color: "var(--accent-gold)", border: "1px solid rgb(var(--accent-gold-rgb))" }}
                  >
                    Wake Bot + Auto-Retry
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {report && (
        <>
          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ["Total Signals", report.total_signals.toString(), "text-text-primary", Activity],
              ["Win Rate", `${(report.win_rate * 100).toFixed(1)}%`, report.win_rate >= 0.6 ? "text-status-win" : "text-status-loss", TrendingUp],
              ["Profit Factor", `${report.profit_factor.toFixed(2)}x`, report.profit_factor >= 1.3 ? "text-status-win" : "text-status-loss", TrendingDown],
              ["Avg Realized R", report.avg_realized_r ? report.avg_realized_r.toFixed(3) : "0.0", "text-accent-gold", Target],
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
                    ["Avg R:R (Planned)", report.avg_rr_planned?.toFixed(2) ?? "0.0", (report.avg_rr_planned ?? 0) >= 1.5],
                    ["Avg Realized R", report.avg_realized_r?.toFixed(4) ?? "0.0", (report.avg_realized_r ?? 0) >= 0.5],
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
                          <th key={h} className="text-left text-[10px] sm:text-xs text-text-muted font-medium pb-3 px-3 sm:px-5 first:pl-3 sm:first:pl-5 last:pr-3 sm:last:pr-5">{h}</th>
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
                          <td className="py-2.5 sm:py-3 px-3 sm:px-5 first:pl-3 sm:first:pl-5">
                            <span className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-pill ${
                              trend === "UP" ? "bg-status-win/10 text-status-win" :
                              trend === "DOWN" ? "bg-status-loss/10 text-status-loss" :
                              "bg-status-warn/10 text-status-warn"
                            }`}>{trend}</span>
                          </td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-5 font-mono text-[11px] sm:text-xs text-text-primary">{data.signals}</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-5 font-mono text-[11px] sm:text-xs text-status-win">{data.won}</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-5 font-mono text-[11px] sm:text-xs text-status-loss">{data.lost}</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-5 font-mono text-[11px] sm:text-xs text-text-muted">{data.expired}</td>
                          <td className={`py-2.5 sm:py-3 px-3 sm:px-5 last:pr-3 sm:last:pr-5 font-mono text-[11px] sm:text-xs font-semibold ${data.win_rate >= 0.6 ? "text-status-win" : "text-status-loss"}`}>{(data.win_rate * 100).toFixed(1)}%</td>
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

          {mcResult && (
            <motion.div variants={item}>
              <Card header={`Monte Carlo (${mcResult.num_simulations} simulations, ${(mcResult.confidence_level * 100).toFixed(0)}% CI)`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(["win_rate", "profit_factor", "avg_realized_r", "max_drawdown_pct"] as const).map((metric) => {
                    const s = mcResult[metric];
                    if (!s || !s.mean) return null;
                    const labels: Record<string, string> = {
                      win_rate: "Win Rate",
                      profit_factor: "Profit Factor",
                      avg_realized_r: "Avg Realized R",
                      max_drawdown_pct: "Max Drawdown %",
                    };
                    return (
                      <div key={metric} className="glass-card rounded-card p-3">
                        <p className="text-xs text-text-muted mb-2 font-medium">{labels[metric]}</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between"><span className="text-text-muted">Mean</span><span className="font-mono text-text-primary">{metric === "win_rate" ? `${(s.mean * 100).toFixed(1)}%` : s.mean.toFixed(metric === "max_drawdown_pct" ? 2 : 4)}</span></div>
                          <div className="flex justify-between"><span className="text-text-muted">Median</span><span className="font-mono text-text-primary">{metric === "win_rate" ? `${(s.median * 100).toFixed(1)}%` : s.median.toFixed(metric === "max_drawdown_pct" ? 2 : 4)}</span></div>
                          <div className="flex justify-between"><span className="text-text-muted">Std Dev</span><span className="font-mono text-text-primary">{s.std.toFixed(4)}</span></div>
                          <div className="flex justify-between"><span className="text-text-muted">97.5%ile</span><span className="font-mono text-status-win">{metric === "win_rate" ? `${(s.p97_5 * 100).toFixed(1)}%` : s.p97_5.toFixed(metric === "max_drawdown_pct" ? 2 : 4)}</span></div>
                          <div className="flex justify-between"><span className="text-text-muted">2.5%ile</span><span className="font-mono text-status-loss">{metric === "win_rate" ? `${(s.p2_5 * 100).toFixed(1)}%` : s.p2_5.toFixed(metric === "max_drawdown_pct" ? 2 : 4)}</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}
        </>
      )}

      {!report && !loading && !error && (
        <motion.div variants={item} className="card p-6 text-center space-y-3">
          <Activity className="w-8 h-8 text-text-muted mx-auto opacity-40" />
          <p className="text-sm text-text-muted max-w-lg mx-auto">
            This runs the <span className="text-accent-gold font-semibold">same signal engine</span> against historical XAU/USD data to estimate how it would have performed.
          </p>
          <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
            No setup needed — it fetches live Hyperliquid candle data and replays the ADX + pullback logic
            bar by bar. Click <span className="text-accent-gold font-medium">Run</span> to simulate <span className="text-accent-gold font-medium">6 months</span> of data (adjustable).
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
