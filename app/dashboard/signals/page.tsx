"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { SignalCard } from "../components/SignalCard";
import { SignalResultCard } from "../components/SignalResultCard";
import { useDashboardData } from "@/lib/data-context";
import { TrendingUp, Loader2, Trophy, Target, X } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function SignalsPage() {
  const { signals, addSessionEntry } = useDashboardData();
  const [signalLoading, setSignalLoading] = useState(false);
  const [generatingNext, setGeneratingNext] = useState(false);
  const [signalResult, setSignalResult] = useState<{
    success: boolean; message: string; signal?: any;
  } | null>(null);
  const [outcomeUpdating, setOutcomeUpdating] = useState(false);
  const [outcomeMessage, setOutcomeMessage] = useState<string | null>(null);

  const active = (signals || []).filter((s) => s?.status === "active");
  const expired = (signals || []).filter((s) => s?.status === "expired");
  const today = (signals || []).filter(
    (s) => s?.timestamp && new Date(s.timestamp).toDateString() === new Date().toDateString()
  );
  const wonCount = (signals || []).filter((s) => s?.outcome === "won").length;
  const lostCount = (signals || []).filter((s) => s?.outcome === "lost").length;
  const totalOutcome = wonCount + lostCount;

  const generateSignal = async () => {
    setSignalLoading(true);
    setGeneratingNext(false);
    setSignalResult(null);
    try {
      const res = await fetch('/api/signal/generate', { method: 'POST' });
      const data = await res.json();
      setSignalResult(data);
    } catch {
      setSignalResult({ success: false, message: 'Network error — try again' });
    }
    setSignalLoading(false);
  };

  const handleWon = useCallback(async (signalId: string) => {
    setOutcomeUpdating(true);
    setOutcomeMessage(null);
    try {
      const res = await fetch('/api/signal/outcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId, outcome: 'won' }),
      });
      const data = await res.json();
      setOutcomeMessage(data.message || 'Marked as won');
      if (signalResult?.signal?.id === signalId) {
        const lotSize = parseFloat(localStorage.getItem("last_lot_size") || "0.05");
        const slDist = Math.abs(signalResult.signal.entries?.[0]?.price - signalResult.signal.stop_loss) || 0;
        const riskAmt = parseFloat((lotSize * 10 * slDist).toFixed(2));
        const entryPrice = signalResult.signal.entries?.[0]?.price || 0;
        const tpPrice = signalResult.signal.entries?.[0]?.tp || entryPrice;
        const profit = parseFloat((lotSize * 10 * Math.abs(tpPrice - entryPrice)).toFixed(2));
        addSessionEntry({ signalId, outcome: 'won', riskAmount: riskAmt, profit, lotSize, timestamp: new Date().toISOString() });
        setSignalResult(prev => prev ? { ...prev, signal: { ...prev.signal, outcome: 'won' } } : prev);
      }
    } catch {
      setOutcomeMessage('Failed to update outcome');
    }
    setOutcomeUpdating(false);
  }, [signalResult, addSessionEntry]);

  const handleConfirm = useCallback(async (signalId: string) => {
    setOutcomeUpdating(true);
    setOutcomeMessage(null);
    try {
      const res = await fetch('/api/signal/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId, confirm: true }),
      });
      const data = await res.json();
      setOutcomeMessage(data.message || 'Signal confirmed');
      if (signalResult?.signal?.id === signalId) {
        setSignalResult(prev => prev ? { ...prev, signal: { ...prev.signal, confirmed: true } } : prev);
      }
    } catch {
      setOutcomeMessage('Failed to confirm signal');
    }
    setOutcomeUpdating(false);
  }, [signalResult]);

  const handleLost = useCallback(async (signalId: string) => {
    setOutcomeUpdating(true);
    setOutcomeMessage(null);
    try {
      const res = await fetch('/api/signal/outcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId, outcome: 'lost' }),
      });
      const data = await res.json();
      setOutcomeMessage(data.message || 'Marked as lost');
      if (signalResult?.signal?.id === signalId) {
        const lotSize = parseFloat(localStorage.getItem("last_lot_size") || "0.05");
        const slDist = Math.abs(signalResult.signal.entries?.[0]?.price - signalResult.signal.stop_loss) || 0;
        const riskAmt = parseFloat((lotSize * 10 * slDist).toFixed(2));
        addSessionEntry({ signalId, outcome: 'lost', riskAmount: riskAmt, profit: -riskAmt, lotSize, timestamp: new Date().toISOString() });
        setSignalResult(prev => prev ? { ...prev, signal: { ...prev.signal, outcome: 'lost' } } : prev);
      }
    } catch {
      setOutcomeMessage('Failed to update outcome');
    }
    setOutcomeUpdating(false);
  }, [signalResult, addSessionEntry]);

  const signalStats = [
    { label: "Signals Today", value: today.length.toString(), color: "text-text-primary" },
    { label: "Active", value: active.length.toString(), color: "text-status-win" },
    { label: "Won", value: wonCount.toString(), color: "text-status-win" },
    { label: "Lost", value: lostCount.toString(), color: "text-status-loss" },
  ];

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteSignal = async (signalId: string) => {
    if (!confirm('Delete this signal?')) return;
    setDeletingId(signalId);
    try {
      await fetch('/api/signal/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId }),
      });
    } catch {}
    setDeletingId(null);
  };

  const handleExport = (format: string) => {
    window.open(`/api/export?format=${format}`, '_blank');
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-text-primary">Signals</h1>
          <p className="text-sm text-text-muted">Generate, track, and share XAU/USD signals</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')}
            className="btn-secondary px-3 py-1.5 text-xs font-bold rounded-lg">
            CSV
          </button>
          <button onClick={() => handleExport('html')}
            className="btn-secondary px-3 py-1.5 text-xs font-bold rounded-lg">
            HTML
          </button>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {signalStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
            className="stat-card"
          >
            <p className="stat-label">{s.label}</p>
            <p className={`stat-value ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {totalOutcome > 0 && (
        <motion.div variants={item} className="flex items-center gap-3 p-3 rounded-xl text-xs"
          style={{ background: 'rgba(var(--accent-gold-rgb), 0.06)', border: '1px solid rgba(var(--accent-gold-rgb), 0.12)' }}>
          <Trophy className="w-4 h-4 text-accent-gold shrink-0" />
          <span className="text-text-muted">
            Track record: <span className="text-status-win font-bold">{wonCount}W</span> / <span className="text-status-loss font-bold">{lostCount}L</span>
            {' '}({totalOutcome > 0 ? ((wonCount / totalOutcome) * 100).toFixed(0) : 0}% win rate)
          </span>
        </motion.div>
      )}

      <motion.div variants={item}>
        <Card header="Signal Generator" glow>
          <div className="space-y-3">
            <p className="text-xs text-text-muted">
              Three-tier XAU/USD signal engine on 15M: EMA bounce + consolidation breakout + trend continuation, ML directional bias pre-filter (64% WR), ADX regime filter, L2 microstructure from Hyperliquid, RSI+BB safety checks.
            </p>
            <button
              onClick={generateSignal}
              disabled={signalLoading}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{
                  background: signalLoading ? 'rgba(var(--accent-gold-rgb), 0.12)' : 'linear-gradient(135deg, var(--accent-gold), rgba(var(--accent-gold-hover-rgb), 0.95))',
                  color: signalLoading ? 'var(--accent-gold)' : 'rgb(var(--text-primary-rgb))',
                  boxShadow: signalLoading ? 'none' : '0 0 20px rgba(var(--accent-gold-rgb), 0.25)',
                  border: signalLoading ? 'none' : '1px solid rgba(var(--accent-gold-rgb), 0.3)',
                }}>
              {signalLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing XAU/USD...</>
              ) : (
                <><TrendingUp className="w-4 h-4" /> Generate New Signal</>
              )}
            </button>

            {outcomeMessage && (
              <p className="text-xs text-accent-gold text-center">{outcomeMessage}</p>
            )}

            {signalResult && signalResult.signal && (
              <SignalResultCard
                signal={signalResult.signal}
                confirmed={signalResult.signal.confirmed}
                onConfirm={signalResult.signal.confirmed ? undefined : handleConfirm}
                onWon={signalResult.signal.outcome || !signalResult.signal.confirmed ? undefined : handleWon}
                onLost={signalResult.signal.outcome || !signalResult.signal.confirmed ? undefined : handleLost}
                onGenerateNext={() => {
                  setGeneratingNext(true);
                  generateSignal();
                }}
                outcomeUpdating={outcomeUpdating}
                generatingNext={generatingNext}
              />
            )}

            {signalResult && !signalResult.signal && (
              <div className="p-4 rounded-xl" style={{ background: "rgba(var(--status-loss-rgb), 0.06)", border: "1px solid rgba(var(--status-loss-rgb), 0.15)" }}>
                <p className="text-sm font-medium text-status-loss">❌ {signalResult.message}</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {active.filter(s => s?.id !== signalResult?.signal?.id).length > 0 && (
        <motion.div variants={item}>
          <Card header="Active Signals">
            <div className="space-y-3">
              {active.filter(s => s?.id !== signalResult?.signal?.id).slice(0, 3).map((signal) => (
                <SignalCard
                  key={signal.id}
                  signalId={parseInt(signal.id.replace(/\D/g, "")) || 1}
                  timestamp={signal.timestamp ? new Date(signal.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : ''}
                  status={signal.outcome === 'won' ? 'won' : signal.outcome === 'lost' ? 'lost' : 'pending'}
                  confidence={Math.round((signal.confidence ?? 0) * 100)}
                  orders={(signal.entries || []).map((e) => ({
                    level: e.price,
                    tp: e.tp,
                    status: "pending" as const,
                    pips: e.tpPips || 0,
                  }))}
                  expiresAt={signal.orderType && signal.orderType !== 'market' ? '3h after fill' : signal.validUntil ? new Date(signal.validUntil).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : "N/A"}
                />
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div variants={item}>
        <Card header="Signal History">
          <div className="flex flex-wrap gap-2 mb-4">
            <select className="input w-full sm:w-auto sm:max-w-[160px]">
              <option>All Signals</option>
              <option>Active Only</option>
              <option>Expired</option>
            </select>
            <select className="input w-full sm:w-auto sm:max-w-[160px]">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>All Time</option>
            </select>
          </div>

          {(signals || []).length > 0 ? (
            <div className="overflow-x-auto -mx-5 sm:-mx-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    {["Signal", "Date/Time", "Trend", "Confidence", "Outcome", "Status", ""].map((h) => (
                      <th key={h} className={`text-left text-[10px] sm:text-xs text-text-muted font-medium pb-3 px-3 sm:px-5 first:pl-3 sm:first:pl-5 last:pr-3 sm:last:pr-5 ${h === '' ? 'w-10' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(signals || []).slice(0, 15).map((s, i) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      className="border-b border-surface-border/50 hover:glass-card/30"
                      style={{ borderColor: "var(--glass-border)" }}
                    >
                      <td className="py-2.5 sm:py-3 px-3 sm:px-5 first:pl-3 sm:first:pl-5 font-bold text-[11px] sm:text-xs text-accent-gold">#{s.id?.slice(-4) || i}</td>
                      <td className="py-2.5 sm:py-3 px-3 sm:px-5 text-[10px] sm:text-xs text-text-secondary">
                        {s.timestamp ? new Date(s.timestamp).toLocaleString() : ''}
                      </td>
                      <td className="py-2.5 sm:py-3 px-3 sm:px-5">
                        <span className={`text-[10px] sm:text-xs font-semibold ${s.trend === "UP" ? "text-status-win" : s.trend === "DOWN" ? "text-status-loss" : "text-text-muted"}`}>
                          {s.trend || '—'}
                        </span>
                      </td>
                      <td className="py-2.5 sm:py-3 px-3 sm:px-5 font-mono text-[11px] sm:text-xs text-text-secondary">
                        {s.confidence ? `${(s.confidence * 100).toFixed(0)}%` : '—'}
                      </td>
                      <td className="py-2.5 sm:py-3 px-3 sm:px-5">
                        {s.outcome ? (
                          <Badge variant={s.outcome === 'won' ? 'win' : 'loss'}>{s.outcome.toUpperCase()}</Badge>
                        ) : (
                          <span className="text-[10px] text-text-muted">—</span>
                        )}
                      </td>
                      <td className="py-2.5 sm:py-3 px-3 sm:px-5 last:pr-3 sm:last:pr-5">
                        <Badge variant={s.status === "active" ? "gold" : s.status === "expired" ? "loss" : s.outcome === 'won' ? 'win' : s.outcome === 'lost' ? 'loss' : "info"}>
                          {s.outcome || s.status || '—'}
                        </Badge>
                      </td>
                      <td className="py-2.5 sm:py-3 pr-3 sm:pr-5">
                        <button
                          onClick={() => handleDeleteSignal(s.id)}
                          disabled={deletingId === s.id}
                          className="p-1 rounded transition-colors hover:opacity-80"
                          style={{ background: "rgb(var(--surface-overlay-rgb))", color: "var(--status-loss)", border: "1px solid rgb(var(--status-loss-rgb))" } as React.CSSProperties}
                          title="Delete signal"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-text-muted">No signals generated yet. Click "Generate New Signal" above to create your first trade signal.</div>
          )}

          <div className="mt-5 pt-5 border-t border-surface-border grid grid-cols-3 gap-4">
            <div>
              <p className="text-text-muted text-xs mb-1">Total Signals</p>
              <p className="text-lg sm:text-xl font-bold text-text-primary">{(signals || []).length}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs mb-1">Won</p>
              <p className="text-lg sm:text-xl font-bold text-status-win">{wonCount}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs mb-1">Lost</p>
              <p className="text-lg sm:text-xl font-bold text-status-loss">{lostCount}</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
