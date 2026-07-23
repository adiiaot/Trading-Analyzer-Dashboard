"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, TrendingUp, BarChart3, Download } from "lucide-react";
import { Card } from "../components/ui/Card";
import { useDashboardData } from "@/lib/data-context";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

interface StrategyRow {
  strategy: string;
  label: string;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalProfit: number;
  profitFactor: number;
  avgProfit: number;
}

export default function AnalyticsPage() {
  const { stats, trades, balance } = useDashboardData();
  const [strategies, setStrategies] = useState<StrategyRow[]>([]);
  const [stratLoading, setStratLoading] = useState(true);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [stratOverall, setStratOverall] = useState({ totalTrades: 0, overallWinRate: 0, overallProfitFactor: 0, totalProfit: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImportClick = () => fileInputRef.current?.click();

  useEffect(() => {
    fetch('/api/analytics/strategy')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStrategies(data.strategies || []);
          setStratOverall({
            totalTrades: data.totalTrades || 0,
            overallWinRate: data.overallWinRate || 0,
            overallProfitFactor: data.overallProfitFactor || 0,
            totalProfit: data.totalProfit || 0,
          });
        }
      })
      .catch(console.error)
      .finally(() => setStratLoading(false));
  }, []);

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportLoading(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/trades/import', { method: 'POST', body: formData });
      const data = await res.json();
      setImportResult(data.success
        ? `Imported ${data.imported} trades (${data.winRate}% win rate)`
        : `Error: ${data.error}`);
    } catch {
      setImportResult('Network error during import');
    }
    setImportLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const winRate = stats ? parseFloat((stats.win_rate * 100).toFixed(1)) : 0;
  const profitFactor = stats?.profit_factor ?? 0;
  const totalPnl = stats?.total_pnl ?? 0;
  const totalTrades = stats?.total_trades ?? 0;

  const closed = trades.filter((t) => t.status === "closed");
  const wins = closed.filter((t) => t.result === "win");
  const losses = closed.filter((t) => t.result === "loss");
  const pnlValues = closed.map((t) => t.pnl ?? 0);
  const maxDrawdown = pnlValues.length > 0 ? Math.min(...pnlValues) : 0;
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length : 0;

  const drawdownPct = balance > 0 ? ((Math.abs(maxDrawdown) / balance) * 100).toFixed(1) : "0.0";

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5">
      <motion.div variants={item}>
        <h1 className="text-lg md:text-xl font-bold text-text-primary">Analytics</h1>
        <p className="text-sm text-text-muted">Performance & intelligence</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          ["Total P&L", `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`, totalPnl >= 0 ? "text-status-win" : "text-status-loss"],
          ["Win Rate", `${winRate}%`, "text-accent-gold"],
          ["Profit Factor", `${profitFactor.toFixed(2)}x`, profitFactor >= 1 ? "text-status-win" : "text-status-loss"],
          ["Max DD", `-$${Math.abs(maxDrawdown).toFixed(2)} (${drawdownPct}%)`, "text-status-loss"],
          ["Avg Win/Loss", `${avgWin.toFixed(0)}/${Math.abs(avgLoss).toFixed(0)}`, "text-status-info"],
        ].map(([l, v, c], i) => (
          <motion.div
            key={l as string}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="card p-4 text-center"
          >
            <p className="text-xs text-text-muted mb-1">{l as string}</p>
            <p className={`text-lg font-bold font-mono ${c as string}`}>{v as string}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={item}>
          <Card header="Trade Breakdown">
            <div className="space-y-3">
              {totalTrades > 0 ? (
                <>
                  <div className="flex justify-between items-center glass-card rounded-card px-4 py-2.5">
                    <span className="text-sm text-text-primary">Total Trades</span>
                    <span className="text-sm font-bold text-text-primary">{totalTrades}</span>
                  </div>
                  <div className="flex justify-between items-center glass-card rounded-card px-4 py-2.5">
                    <span className="text-sm text-text-primary">Wins</span>
                    <span className="text-sm font-bold text-status-win">{wins.length}</span>
                  </div>
                  <div className="flex justify-between items-center glass-card rounded-card px-4 py-2.5">
                    <span className="text-sm text-text-primary">Losses</span>
                    <span className="text-sm font-bold text-status-loss">{losses.length}</span>
                  </div>
                  <div className="flex justify-between items-center glass-card rounded-card px-4 py-2.5">
                    <span className="text-sm text-text-primary">Open Positions</span>
                    <span className="text-sm font-bold text-status-info">{trades.filter(t => t.status === "open").length}</span>
                  </div>
                </>
              ) : (
                <div className="h-[120px] flex items-center justify-center glass-card rounded-card">
                  <span className="text-sm text-text-muted">No trade data yet</span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card header="Strategy Performance (Imported Trades)">
            {stratLoading ? (
              <div className="h-[200px] flex items-center justify-center glass-card rounded-card">
                <span className="text-sm text-text-muted">Loading strategy data...</span>
              </div>
            ) : strategies.length === 0 ? (
              <div className="space-y-3">
                <div className="h-[120px] flex items-center justify-center glass-card rounded-card">
                  <span className="text-sm text-text-muted">No imported trades yet</span>
                </div>
                <button
                  onClick={handleImportClick}
                  disabled={importLoading}
                  className="w-full flex items-center justify-center gap-2 glass-card rounded-card px-4 py-2.5 text-sm text-accent-gold hover:brightness-110 transition-all disabled:opacity-50"
                >
                  <Upload size={14} /> {importLoading ? 'Importing...' : 'Import MT5 CSV'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.html,.json"
                  onChange={handleImportCSV}
                  className="hidden"
                />
                {importResult && <p className="text-xs text-status-info">{importResult}</p>}
              </div>
            ) : (
              <div className="space-y-2">
                {importLoading && <p className="text-xs text-text-muted">Importing...</p>}
                <div className="flex items-center justify-between glass-card rounded-card px-4 py-2.5">
                  <span className="text-xs text-text-muted">Overall (all strategies)</span>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-text-primary">{stratOverall.totalTrades} trades</span>
                    <span className="text-accent-gold">{stratOverall.overallWinRate}% WR</span>
                    <span className={stratOverall.overallProfitFactor >= 1 ? 'text-status-win' : 'text-status-loss'}>{stratOverall.overallProfitFactor}x PF</span>
                    <span className={stratOverall.totalProfit >= 0 ? 'text-status-win' : 'text-status-loss'}>${stratOverall.totalProfit.toFixed(0)}</span>
                  </div>
                </div>
                {strategies.map((s, i) => (
                  <motion.div
                    key={s.strategy}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    className="glass-card rounded-card px-4 py-2.5"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-text-primary">{s.label}</span>
                      <span className="text-xs text-text-muted">{s.totalTrades} trades</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className={s.winRate >= 50 ? 'text-status-win' : 'text-status-loss'}>{s.winRate}% WR</span>
                      <span className={s.profitFactor >= 1 ? 'text-status-win' : 'text-status-loss'}>{s.profitFactor}x PF</span>
                      <span className="text-accent-gold">{s.wins}W / {s.losses}L</span>
                      <span className={s.avgProfit >= 0 ? 'text-status-win' : 'text-status-loss'}>${s.avgProfit.toFixed(1)} avg</span>
                    </div>
                    {i < strategies.length - 1 && <div className="mt-2 border-b border-surface-border/30" />}
                  </motion.div>
                ))}
                <button
                  onClick={handleImportClick}
                  disabled={importLoading}
                  className="w-full flex items-center justify-center gap-2 glass-card rounded-card px-4 py-2 text-xs text-text-muted hover:text-accent-gold transition-colors disabled:opacity-50"
                >
                  <Upload size={12} /> {importLoading ? 'Importing...' : 'Import CSV'}
                </button>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={item}>
        <Card header="Trade History">
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {["ID", "Trend", "Entry", "Exit", "P&L", "Result"].map((h) => (
                    <th key={h} className="text-left text-[10px] sm:text-xs text-text-muted font-medium pb-3 px-3 sm:px-5 first:pl-3 sm:first:pl-5 last:pr-3 sm:last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {closed.length > 0 ? closed.slice(0, 10).map((t, i) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                    className="border-b border-surface-border/50 hover:glass-card/30"
                  >
                    <td className="py-2.5 sm:py-3 px-3 sm:px-5 first:pl-3 sm:first:pl-5 font-mono text-[11px] sm:text-xs text-text-primary">#{t.id?.slice(-4)}</td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-5"><span className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-pill ${t.trend === "UP" ? "bg-status-win/10 text-status-win" : "bg-status-loss/10 text-status-loss"}`}>{t.trend}</span></td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-5 font-mono text-[11px] sm:text-xs text-text-primary">{t.entryPrice?.toFixed(2)}</td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-5 font-mono text-[11px] sm:text-xs text-text-primary">{t.exitPrice?.toFixed(2) ?? "-"}</td>
                    <td className={`py-2.5 sm:py-3 px-3 sm:px-5 font-mono text-[11px] sm:text-xs font-semibold ${(t.pnl ?? 0) >= 0 ? "text-status-win" : "text-status-loss"}`}>{(t.pnl ?? 0) >= 0 ? "+" : ""}${(t.pnl ?? 0).toFixed(2)}</td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-5 last:pr-3 sm:last:pr-5"><span className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-pill ${t.result === "win" ? "bg-status-win/10 text-status-win" : t.result === "loss" ? "bg-status-loss/10 text-status-loss" : "bg-status-warn/10 text-status-warn"}`}>{t.result ?? "-"}</span></td>
                  </motion.tr>
                )) : (
                  <tr><td colSpan={6} className="py-8 text-center text-sm text-text-muted">No trades yet. Start trading to see your history.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
