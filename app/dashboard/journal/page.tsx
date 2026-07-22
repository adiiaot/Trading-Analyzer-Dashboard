"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { useDashboardData } from "@/lib/data-context";
import { TrendingUp, TrendingDown, ChevronDown, Send, BarChart3 } from "lucide-react";

function formatTimestamp(ts: unknown): string {
  if (!ts) return '';
  if (typeof ts === 'string') {
    try {
      return new Date(ts).toLocaleDateString("en-US", {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      });
    } catch { return ts; }
  }
  if (typeof ts === 'object' && ts !== null) {
    const obj = ts as Record<string, unknown>;
    if (typeof obj._seconds === 'number') {
      try {
        return new Date(obj._seconds * 1000).toLocaleDateString("en-US", {
          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
        });
      } catch { return String(ts); }
    }
    if (typeof obj.toDate === 'function') {
      try { return (obj as any).toDate().toLocaleString(); } catch { return String(ts); }
    }
  }
  return String(ts);
}

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function JournalPage() {
  const { trades, journalEntries } = useDashboardData();
  const closed = useMemo(() => (trades || []).filter((t) => t?.status === "closed"), [trades]);
  const [filter, setFilter] = useState<"all" | "win" | "loss">("all");
  const [sortNewest, setSortNewest] = useState(true);

  // Trade logger state
  const [showLogger, setShowLogger] = useState(false);
  const [tradeForm, setTradeForm] = useState({ entryPrice: '', exitPrice: '', direction: 'LONG', result: 'win', notes: '' });
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeResult, setTradeResult] = useState<string | null>(null);

  // Journal note state
  const [journalText, setJournalText] = useState('');
  const [journalLoading, setJournalLoading] = useState(false);
  const [journalResult, setJournalResult] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list = filter === "all" ? closed : closed.filter((t) => t?.result === filter);
    return sortNewest ? [...list].reverse() : list;
  }, [closed, filter, sortNewest]);

  const totalPnl = closed.reduce((s, t) => s + (t?.pnl ?? 0), 0);
  const wins = closed.filter((t) => t?.result === "win").length;
  const losses = closed.filter((t) => t?.result === "loss").length;

  const logTrade = async () => {
    const { entryPrice, exitPrice, direction, result, notes } = tradeForm;
    if (!entryPrice || !exitPrice) return;
    setTradeLoading(true);
    setTradeResult(null);
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryPrice: parseFloat(entryPrice),
          exitPrice: parseFloat(exitPrice),
          direction,
          result,
          notes,
          quantity: 0.01,
        }),
      });
      const data = await res.json();
      setTradeResult(data.message || 'Trade logged');
      setTradeForm({ entryPrice: '', exitPrice: '', direction: 'LONG', result: 'win', notes: '' });
    } catch {
      setTradeResult('Failed to log trade');
    }
    setTradeLoading(false);
  };

  const addJournalNote = async () => {
    if (!journalText.trim()) return;
    setJournalLoading(true);
    setJournalResult(null);
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: journalText }),
      });
      const data = await res.json();
      setJournalResult(data.message || 'Journal entry saved');
      setJournalText('');
    } catch {
      setJournalResult('Failed to save journal entry');
    }
    setJournalLoading(false);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-text-primary">Trade Journal</h1>
          <p className="text-sm text-text-muted">Every trade tells a story</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowLogger(!showLogger)}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-xs w-fit">
            <Send className="w-3.5 h-3.5" /> {showLogger ? 'Close' : 'Log Trade'}
          </button>
        </div>
      </motion.div>

      {showLogger && (
        <motion.div variants={item} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card header="Log a Trade" glow>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Entry Price</label>
                  <input placeholder="4062.50" type="number" step="0.01"
                    value={tradeForm.entryPrice}
                    onChange={e => setTradeForm(p => ({ ...p, entryPrice: e.target.value }))}
                    className="input w-full text-xs px-3 py-2 rounded-lg" />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Exit Price</label>
                  <input placeholder="4075.00" type="number" step="0.01"
                    value={tradeForm.exitPrice}
                    onChange={e => setTradeForm(p => ({ ...p, exitPrice: e.target.value }))}
                    className="input w-full text-xs px-3 py-2 rounded-lg" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setTradeForm(p => ({ ...p, direction: 'LONG' }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${tradeForm.direction === 'LONG' ? 'bg-[rgba(var(--status-win-rgb),0.15)] text-status-win' : 'glass'}`}>
                  LONG ↗
                </button>
                <button onClick={() => setTradeForm(p => ({ ...p, direction: 'SHORT' }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${tradeForm.direction === 'SHORT' ? 'bg-[rgba(var(--status-loss-rgb),0.15)] text-status-loss' : 'glass'}`}>
                  SHORT ↘
                </button>
                <button onClick={() => setTradeForm(p => ({ ...p, result: 'win' }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${tradeForm.result === 'win' ? 'bg-[rgba(var(--status-win-rgb),0.15)] text-status-win' : 'glass'}`}>
                  WIN
                </button>
                <button onClick={() => setTradeForm(p => ({ ...p, result: 'loss' }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${tradeForm.result === 'loss' ? 'bg-[rgba(var(--status-loss-rgb),0.15)] text-status-loss' : 'glass'}`}>
                  LOSS
                </button>
              </div>
              <input placeholder="Optional notes about this trade..."
                value={tradeForm.notes}
                onChange={e => setTradeForm(p => ({ ...p, notes: e.target.value }))}
                className="input w-full text-xs px-3 py-2 rounded-lg" />
              <button onClick={logTrade} disabled={tradeLoading || !tradeForm.entryPrice || !tradeForm.exitPrice}
                className="btn-primary w-full py-2.5 rounded-lg text-xs font-bold disabled:opacity-50">
                {tradeLoading ? 'Logging...' : 'Log Trade'}
              </button>
              {tradeResult && <p className="text-xs text-accent-gold">{tradeResult}</p>}
            </div>
          </Card>
        </motion.div>
      )}

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
                <div className="flex gap-1 rounded-lg p-0.5" style={{ background: "rgba(var(--surface-overlay-rgb), 0.85)", border: "1px solid rgba(var(--text-primary-rgb), 0.12)" }}>
                  {(["all", "win", "loss"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        filter === f
                          ? "text-accent-gold shadow-sm"
                          : "text-text-muted hover:text-text-primary"
                      }`}
                      style={filter === f ? { background: "rgba(var(--accent-gold-rgb), 0.2)", border: "1px solid rgba(var(--accent-gold-rgb), 0.3)" } : {}}
                    >
                      {f === "all" ? "All" : f === "win" ? "Wins" : "Losses"}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSortNewest(!sortNewest)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                  style={{ background: "rgba(var(--accent-gold-rgb), 0.2)", color: "var(--accent-gold)", border: "1px solid rgba(var(--accent-gold-rgb), 0.35)" }}
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
                          isWin ? "rgba(var(--status-win-rgb), 0.12)" : "rgba(var(--status-loss-rgb), 0.12)"
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
                              {formatTimestamp(t.timestamp)}
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

      <motion.div variants={item}>
        <Card header="Journal Notes">
          <div className="space-y-3 mb-4">
            <textarea placeholder="Write a journal note about your trading mindset, strategy thoughts, or market observations..."
              value={journalText}
              onChange={e => setJournalText(e.target.value)}
              className="input w-full text-xs px-3 py-2 rounded-lg resize-none"
              rows={3} />
            <button onClick={addJournalNote} disabled={journalLoading || !journalText.trim()}
              className="btn-primary px-4 py-2 rounded-lg text-xs font-medium disabled:opacity-50">
              {journalLoading ? 'Saving...' : 'Save Note'}
            </button>
            {journalResult && <p className="text-xs text-accent-gold">{journalResult}</p>}
          </div>

          {(journalEntries || []).length > 0 ? (
            <div className="space-y-2">
              {(journalEntries || []).slice(0, 10).map((entry: any, i: number) => (
                <motion.div key={entry?.id || i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-3 rounded-lg" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                  <p className="text-xs text-text-primary whitespace-pre-wrap">{entry?.notes || '(empty)'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-text-muted">
                      {formatTimestamp(entry?.timestamp)}
                    </span>
                    {entry?.sentiment && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
                        background: 'rgba(var(--accent-gold-rgb), 0.1)',
                        color: 'var(--accent-gold)',
                      }}>{entry.sentiment}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted text-center py-6">No journal notes yet. Start journaling to track your trading psychology.</p>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
