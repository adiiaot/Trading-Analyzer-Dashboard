"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Activity, Brain, BarChart4, TrendingUp, AlertTriangle,
  RefreshCw, Zap, ChevronRight, CheckCircle2, XCircle,
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const section = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

interface Metrics {
  totalSignals: number;
  won: number;
  lost: number;
  expired: number;
  active: number;
  closed: number;
  overallWinRate: number;
  rolling50WinRate: number;
  strategyBreakdown: Record<string, { total: number; won: number; lost: number; winRate: number; last30WinRate: number }>;
  directionBreakdown: Record<string, { won: number; lost: number; winRate: number }>;
  mlHealth: {
    loaded: boolean;
    metadata?: {
      trained_on?: string;
      accuracy?: number;
      precision?: number;
      recall?: number;
      win_rate_at_threshold?: number;
      decision_threshold?: number;
      n_samples?: number;
      class_balance?: number;
    };
    featureCount?: number;
    layerCount?: number;
  };
}

function MetricCard({ title, value, subtitle, icon: Icon, color, trend }: {
  title: string; value: string; subtitle?: string; icon: any; color: string; trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div
      className="rounded-xl p-4 transition-all hover:opacity-95"
      style={{ background: "var(--glass-bg)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid var(--glass-border)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend && (
          <span className={`text-xs font-mono font-bold ${trend === 'up' ? 'text-status-win' : trend === 'down' ? 'text-status-loss' : 'text-text-muted'}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-text-primary font-mono">{value}</p>
      <p className="text-xs text-text-muted mt-0.5">{title}</p>
      {subtitle && <p className="text-[10px] text-text-muted/60 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function ProgressBar({ value, color, label }: { value: number; color: string; label: string }) {
  const pct = Math.min(100, Math.max(0, value * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted">{label}</span>
        <span className="font-mono font-bold" style={{ color }}>{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(var(--text-primary-rgb), 0.06)" }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
      </div>
    </div>
  );
}

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [capSweeping, setCapSweeping] = useState(false);
  const [capSweepResults, setCapSweepResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/monitor');
      const data = await res.json();
      if (data.success) setMetrics(data);
    } catch (e) {
      setError('Failed to fetch monitoring data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  const handleRetrain = async () => {
    setRetraining(true);
    try {
      const res = await fetch('/api/monitor/retrain-ml', { method: 'POST' });
      const data = await res.json();
      alert(data.message || (data.success ? 'Retraining started' : 'Failed'));
    } catch { alert('Bot must be running to retrain ML'); }
    finally { setRetraining(false); fetchMetrics(); }
  };

  const handleCapSweep = async () => {
    setCapSweeping(true);
    setCapSweepResults(null);
    try {
      const res = await fetch('/api/monitor/cap-sweep', { method: 'POST' });
      const data = await res.json();
      setCapSweepResults(data);
    } catch { alert('Bot must be running to run cap sweep'); }
    finally { setCapSweeping(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 rounded-full border-2" style={{ borderColor: "var(--accent-gold)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const m = metrics;
  const alerts: { type: 'warning' | 'error' | 'info'; message: string }[] = [];

  if (m) {
    if (m.rolling50WinRate < 0.55) alerts.push({ type: 'error', message: `Rolling 50-signal WR (${(m.rolling50WinRate * 100).toFixed(1)}%) below 55% threshold — review filters` });
    else if (m.rolling50WinRate < 0.60) alerts.push({ type: 'warning', message: `Rolling 50-signal WR (${(m.rolling50WinRate * 100).toFixed(1)}%) approaching 55% threshold` });
    if (m.overallWinRate >= 0.70) alerts.push({ type: 'info', message: `Overall WR (${(m.overallWinRate * 100).toFixed(1)}%) is healthy at 200-cap` });

    for (const [st, stats] of Object.entries(m.strategyBreakdown)) {
      if (stats.last30WinRate < 0.50 && stats.total >= 10) {
        alerts.push({ type: 'warning', message: `${st} strategy last-30 WR (${(stats.last30WinRate * 100).toFixed(1)}%) below 50% — may need re-tuning` });
      }
    }

    if (m.mlHealth.loaded && m.mlHealth.metadata) {
      const lastTrain = m.mlHealth.metadata.trained_on;
      if (lastTrain) {
        const daysSince = Math.floor((Date.now() - new Date(lastTrain).getTime()) / 86400000);
        if (daysSince > 35) alerts.push({ type: 'warning', message: `ML model last trained ${daysSince} days ago — retrain recommended` });
      }
    }
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-4">
      <motion.div variants={section} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-accent-gold" />
          <h1 className="text-lg md:text-xl font-bold text-text-primary">System Monitoring</h1>
          {m && (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
              m.rolling50WinRate >= 0.60 ? 'text-status-win' : m.rolling50WinRate >= 0.55 ? 'text-[#f59e0b]' : 'text-status-loss'
            }`} style={{
              background: m.rolling50WinRate >= 0.60 ? 'rgba(var(--status-win-rgb), 0.08)' : m.rolling50WinRate >= 0.55 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(var(--status-loss-rgb), 0.08)',
              border: '1px solid currentColor',
            }}>
              {m.rolling50WinRate >= 0.60 ? 'Healthy' : m.rolling50WinRate >= 0.55 ? 'Caution' : 'Alert'}
            </span>
          )}
        </div>
        <button onClick={fetchMetrics} className="btn-secondary text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {error && (
        <motion.div variants={section} className="card p-4 text-sm" style={{ borderColor: 'rgb(var(--status-loss-rgb))' }}>
          <p className="text-status-loss">{error}</p>
        </motion.div>
      )}

      {alerts.length > 0 && (
        <motion.div variants={section} className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className="card p-3 flex items-center gap-3 text-xs" style={{
              borderColor: a.type === 'error' ? 'rgb(var(--status-loss-rgb))' : a.type === 'warning' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(var(--accent-gold-rgb), 0.3)',
            }}>
              <AlertTriangle className={`w-4 h-4 shrink-0 ${a.type === 'error' ? 'text-status-loss' : a.type === 'warning' ? 'text-[#f59e0b]' : 'text-accent-gold'}`} />
              <span className="text-text-primary">{a.message}</span>
            </div>
          ))}
        </motion.div>
      )}

      {m && (
        <>
          <motion.div variants={section} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard title="Rolling 50 WR" value={`${(m.rolling50WinRate * 100).toFixed(1)}%`} subtitle={`${Math.min(50, m.won + m.lost)} signals`} icon={TrendingUp} color="var(--accent-gold)" trend={m.rolling50WinRate >= 0.60 ? 'up' : m.rolling50WinRate >= 0.55 ? 'neutral' : 'down'} />
            <MetricCard title="Overall WR" value={`${(m.overallWinRate * 100).toFixed(1)}%`} subtitle={`${m.won + m.lost} resolved`} icon={Activity} color={m.overallWinRate >= 0.70 ? 'var(--status-win)' : 'var(--status-loss)'} />
            <MetricCard title="Total Signals" value={m.totalSignals.toString()} subtitle={`${m.active} active, ${m.expired} expired`} icon={BarChart4} color="var(--text-primary)" />
            <MetricCard title="Won / Lost" value={`${m.won}W / ${m.lost}L`} subtitle={m.won + m.lost > 0 ? `PF ${(m.won / (m.lost || 1)).toFixed(2)}` : 'No outcomes'} icon={Zap} color="var(--status-win)" />
          </motion.div>

          <motion.div variants={section} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart4 className="w-4 h-4 text-accent-gold" />
                <h3 className="text-sm font-bold text-text-primary">Strategy Breakdown</h3>
              </div>
            </div>
            <div className="space-y-3">
              {Object.entries(m.strategyBreakdown).map(([st, stats]) => (
                <div key={st} className="p-3 rounded-xl" style={{ background: "rgb(var(--surface-overlay-rgb))", border: "1px solid var(--glass-border)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wider">{st.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-text-muted">{stats.won + stats.lost} resolved / {stats.total} total</span>
                  </div>
                  <ProgressBar value={stats.last30WinRate} color={stats.last30WinRate >= 0.60 ? 'var(--status-win)' : stats.last30WinRate >= 0.50 ? 'var(--accent-gold)' : 'var(--status-loss)'} label={`Last 30 WR`} />
                  <div className="mt-1.5">
                    <ProgressBar value={stats.winRate} color={stats.winRate >= 0.60 ? 'var(--status-win)' : stats.winRate >= 0.50 ? 'var(--accent-gold)' : 'var(--status-loss)'} label={`Overall WR`} />
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-text-muted">
                    <span>{stats.won}W / {stats.lost}L</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={section} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-4 h-4 text-accent-gold" />
                <h3 className="text-sm font-bold text-text-primary">ML Model Health</h3>
              </div>
              {m.mlHealth.loaded && m.mlHealth.metadata ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg" style={{ background: "rgb(var(--surface-overlay-rgb))" }}>
                      <p className="text-text-muted">Accuracy</p>
                      <p className="font-mono font-bold text-text-primary">{((m.mlHealth.metadata.accuracy || 0) * 100).toFixed(1)}%</p>
                    </div>
                    <div className="p-2 rounded-lg" style={{ background: "rgb(var(--surface-overlay-rgb))" }}>
                      <p className="text-text-muted">Threshold</p>
                      <p className="font-mono font-bold text-text-primary">{(m.mlHealth.metadata.decision_threshold || 0).toFixed(2)}</p>
                    </div>
                    <div className="p-2 rounded-lg" style={{ background: "rgb(var(--surface-overlay-rgb))" }}>
                      <p className="text-text-muted">Precision</p>
                      <p className="font-mono font-bold text-text-primary">{((m.mlHealth.metadata.precision || 0) * 100).toFixed(1)}%</p>
                    </div>
                    <div className="p-2 rounded-lg" style={{ background: "rgb(var(--surface-overlay-rgb))" }}>
                      <p className="text-text-muted">Recall</p>
                      <p className="font-mono font-bold text-text-primary">{((m.mlHealth.metadata.recall || 0) * 100).toFixed(1)}%</p>
                    </div>
                    <div className="p-2 rounded-lg col-span-2" style={{ background: "rgb(var(--surface-overlay-rgb))" }}>
                      <p className="text-text-muted">Last Trained</p>
                      <p className="font-mono font-bold text-text-primary text-[11px]">{m.mlHealth.metadata.trained_on || 'Unknown'}</p>
                    </div>
                    {m.mlHealth.metadata.n_samples && (
                      <div className="p-2 rounded-lg col-span-2" style={{ background: "rgb(var(--surface-overlay-rgb))" }}>
                        <p className="text-text-muted">Training Samples</p>
                        <p className="font-mono font-bold text-text-primary">{m.mlHealth.metadata.n_samples}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleRetrain}
                    disabled={retraining}
                    className="w-full btn-secondary text-xs py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <Brain className={`w-3.5 h-3.5 ${retraining ? 'animate-pulse' : ''}`} />
                    {retraining ? 'Retraining...' : 'Retrain ML Model'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-text-muted mb-2">No ML model loaded</p>
                  <button onClick={handleRetrain} disabled={retraining} className="btn-secondary text-xs py-2 px-4 rounded-lg font-semibold">
                    {retraining ? 'Retraining...' : 'Train Initial Model'}
                  </button>
                </div>
              )}
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <BarChart4 className="w-4 h-4 text-accent-gold" />
                <h3 className="text-sm font-bold text-text-primary">Signal Cap Optimization</h3>
              </div>
              <p className="text-xs text-text-muted mb-3">
                Run a cap sweep to find which BACKTEST_MAX_SIGNALS value gives the best WR/PF in current market.
              </p>
              <button
                onClick={handleCapSweep}
                disabled={capSweeping}
                className="w-full btn-secondary text-xs py-2 rounded-lg font-semibold flex items-center justify-center gap-2 mb-3"
              >
                <BarChart4 className={`w-3.5 h-3.5 ${capSweeping ? 'animate-pulse' : ''}`} />
                {capSweeping ? 'Running Sweep...' : 'Run Cap Sweep'}
              </button>
              {capSweepResults && capSweepResults.results && (
                <div className="space-y-2">
                  <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Results</p>
                  {capSweepResults.results.map((r: any, i: number) => (
                    <div key={i} className="p-2 rounded-lg text-xs flex items-center justify-between" style={{
                      background: "rgb(var(--surface-overlay-rgb))",
                      border: r.cap === capSweepResults.recommended_cap ? '1px solid rgb(var(--accent-gold-rgb))' : '1px solid var(--glass-border)',
                    }}>
                      <span className="font-mono font-bold text-text-primary">Cap {r.cap}</span>
                      {r.error ? (
                        <span className="text-status-loss">{r.error}</span>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className={r.win_rate && r.win_rate >= 70 ? 'text-status-win' : 'text-text-muted'}>
                            WR: {r.win_rate?.toFixed(1) || '?'}%
                          </span>
                          <span className="text-text-muted">PF: {r.profit_factor?.toFixed(2) || '?'}</span>
                          {r.cap === capSweepResults.recommended_cap && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-status-win" />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {capSweepResults.recommended_cap && (
                    <p className="text-xs font-bold text-accent-gold text-center pt-1">
                      Recommended cap: {capSweepResults.recommended_cap}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={section} className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-accent-gold" />
              <h3 className="text-sm font-bold text-text-primary">Direction Breakdown</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(m.directionBreakdown).map(([dir, stats]) => (
                <div key={dir} className="p-3 rounded-xl" style={{ background: "rgb(var(--surface-overlay-rgb))", border: "1px solid var(--glass-border)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-text-primary">{dir}</span>
                    <span className={`text-xs font-mono font-bold ${stats.winRate >= 0.70 ? 'text-status-win' : stats.winRate >= 0.50 ? 'text-[#f59e0b]' : 'text-status-loss'}`}>
                      {(stats.winRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar value={stats.winRate} color={stats.winRate >= 0.70 ? 'var(--status-win)' : stats.winRate >= 0.50 ? 'var(--accent-gold)' : 'var(--status-loss)'} label="" />
                  <p className="text-[10px] text-text-muted mt-1">{stats.won}W / {stats.lost}L</p>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
