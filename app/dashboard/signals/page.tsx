"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { SignalCard } from "../components/SignalCard";
import { useDashboardData } from "@/lib/data-context";
import { TrendingUp, Loader2 } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function SignalsPage() {
  const { signals } = useDashboardData();
  const [signalLoading, setSignalLoading] = useState(false);
  const [signalResult, setSignalResult] = useState<{ success: boolean; message: string; signal?: any } | null>(null);
  const active = signals.filter((s) => s.status === "active");
  const expired = signals.filter((s) => s.status === "expired");
  const today = signals.filter((s) => new Date(s.timestamp).toDateString() === new Date().toDateString());

  const generateSignal = async () => {
    setSignalLoading(true);
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

  const signalStats = [
    { label: "Signals Today", value: today.length.toString() },
    { label: "Active", value: active.length.toString() },
    { label: "Expired", value: expired.length.toString() },
    { label: "Total", value: signals.length.toString() },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5">
      <motion.div variants={item}>
        <h1 className="text-lg md:text-xl font-bold text-text-primary">Signals</h1>
        <p className="text-sm text-text-muted">Active signals & performance archive</p>
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
            <p className="stat-value text-text-primary">{s.value}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={item}>
        <Card header="Signal Generator" glow>
          <div className="space-y-3">
            <p className="text-xs text-text-muted">Run the 4-timeframe signal engine (1D macro → 4H ADX → 1H EMA → 15M entry) to generate a new XAU/USD signal.</p>
            <button
              onClick={generateSignal}
              disabled={signalLoading}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{
                background: signalLoading ? 'rgba(240, 180, 41, 0.1)' : 'linear-gradient(135deg, var(--accent-gold), #d4a52a)',
                color: signalLoading ? 'var(--accent-gold)' : '#080c24',
              }}>
              {signalLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing XAU/USD...</>
              ) : (
                <><TrendingUp className="w-4 h-4" /> Generate New Signal</>
              )}
            </button>
            {signalResult && (
              <div className={`p-4 rounded-xl ${signalResult.success ? 'bg-[rgba(0,230,118,0.06)] border border-[rgba(0,230,118,0.15)]' : 'bg-[rgba(255,82,82,0.06)] border border-[rgba(255,82,82,0.15)]'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-bold ${signalResult.success ? 'text-status-win' : 'text-status-loss'}`}>
                    {signalResult.success ? '✅ Signal Generated' : '❌ ' + signalResult.message}
                  </span>
                </div>
                {signalResult.signal && (
                  <div className="space-y-2 text-xs">
                    <div className="flex gap-4">
                      <div className="flex-1 p-2 rounded-lg" style={{ background: 'var(--glass-bg)' }}>
                        <span className="text-text-muted">Trend</span>
                        <p className="font-bold mt-0.5" style={{ color: signalResult.signal.trend === 'UP' ? 'var(--status-win)' : 'var(--status-loss)' }}>
                          {signalResult.signal.trend}
                        </p>
                      </div>
                      <div className="flex-1 p-2 rounded-lg" style={{ background: 'var(--glass-bg)' }}>
                        <span className="text-text-muted">Confidence</span>
                        <p className="font-bold mt-0.5 text-text-primary">{Math.round(signalResult.signal.confidence * 100)}%</p>
                      </div>
                      <div className="flex-1 p-2 rounded-lg" style={{ background: 'var(--glass-bg)' }}>
                        <span className="text-text-muted">R:R</span>
                        <p className="font-bold mt-0.5 text-accent-gold">{signalResult.signal.rr_ratio?.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 p-2 rounded-lg" style={{ background: 'var(--glass-bg)' }}>
                        <span className="text-text-muted">Entry</span>
                        <p className="font-mono font-bold mt-0.5 text-text-primary">${signalResult.signal.entries?.[0]?.price?.toFixed(2)}</p>
                      </div>
                      <div className="flex-1 p-2 rounded-lg" style={{ background: 'var(--glass-bg)' }}>
                        <span className="text-text-muted">Stop Loss</span>
                        <p className="font-mono font-bold mt-0.5 text-status-loss">${signalResult.signal.stop_loss?.toFixed(2)}</p>
                      </div>
                      <div className="flex-1 p-2 rounded-lg" style={{ background: 'var(--glass-bg)' }}>
                        <span className="text-text-muted">Take Profit</span>
                        <p className="font-mono font-bold mt-0.5 text-status-win">${signalResult.signal.tp1?.toFixed(2)}</p>
                      </div>
                    </div>
                    {signalResult.signal.entries?.length > 1 && (
                      <div className="p-2 rounded-lg" style={{ background: 'var(--glass-bg)' }}>
                        <span className="text-text-muted">Alt Entries: </span>
                        {signalResult.signal.entries.slice(1).map((e: any, i: number) => (
                          <span key={i} className="text-text-primary font-mono ml-2">E{i+2} @ ${e.price.toFixed(2)} TP ${e.tp.toFixed(2)}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-text-muted text-[10px]">{signalResult.signal.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {active.length > 0 && (
        <motion.div variants={item}>
          <Card header="Active Signals">
            <div className="space-y-3">
              {active.slice(0, 1).map((signal) => (
                <SignalCard
                  key={signal.id}
                  signalId={parseInt(signal.id.replace(/\D/g, "")) || 1}
                  timestamp={new Date(signal.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                  status="pending"
                  confidence={Math.round(signal.confidence * 100)}
                  orders={(signal.entries || []).map((e) => ({
                    level: e.price,
                    tp: e.tp,
                    status: "pending" as const,
                    pips: e.tpPips,
                  }))}
                  expiresAt={signal.validUntil ? new Date(signal.validUntil).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : "N/A"}
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

          {signals.length > 0 ? (
            <div className="overflow-x-auto -mx-5 sm:-mx-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    {["Signal", "Date/Time", "Trend", "Confidence", "Status"].map((h) => (
                      <th key={h} className="text-left text-[10px] sm:text-xs text-text-muted font-medium pb-3 px-3 sm:px-5 first:pl-3 sm:first:pl-5 last:pr-3 sm:last:pr-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {signals.slice(0, 10).map((s, i) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                      className="border-b border-surface-border/50 hover:glass-card/30"
                      style={{ borderColor: "var(--glass-border)" }}
                    >
                      <td className="py-2.5 sm:py-3 px-3 sm:px-5 first:pl-3 sm:first:pl-5 font-bold text-[11px] sm:text-xs text-accent-gold">#{s.id.slice(-4)}</td>
                      <td className="py-2.5 sm:py-3 px-3 sm:px-5 text-[10px] sm:text-xs text-text-secondary">{new Date(s.timestamp).toLocaleString()}</td>
                      <td className="py-2.5 sm:py-3 px-3 sm:px-5"><span className={`text-[10px] sm:text-xs font-semibold ${s.trend === "UP" ? "text-status-win" : "text-status-loss"}`}>{s.trend}</span></td>
                      <td className="py-2.5 sm:py-3 px-3 sm:px-5 font-mono text-[11px] sm:text-xs text-text-secondary">{(s.confidence * 100).toFixed(0)}%</td>
                      <td className="py-2.5 sm:py-3 px-3 sm:px-5 last:pr-3 sm:last:pr-5">
                        <Badge variant={s.status === "active" ? "gold" : s.status === "expired" ? "loss" : "win"}>{s.status}</Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-text-muted">No signals generated yet. The bot will generate signals when market conditions align.</div>
          )}

          <div className="mt-5 pt-5 border-t border-surface-border grid grid-cols-2 gap-4">
            <div>
              <p className="text-text-muted text-xs mb-1">Total Signals</p>
              <p className="text-lg sm:text-xl font-bold text-text-primary">{signals.length}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs mb-1">Active Now</p>
              <p className="text-lg sm:text-xl font-bold text-status-win">{active.length}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card header="Alert Settings">
          <div className="space-y-2">
            {[
              { label: "Telegram Alerts", status: "Enabled" },
              { label: "Desktop Notifications", status: "Enabled" },
              { label: "Email Digest", status: "Daily" },
            ].map((a) => (
              <div key={a.label} className="flex items-center justify-between p-3 glass-card rounded-card">
                <span className="text-sm text-text-primary">{a.label}</span>
                <Badge variant="win">{a.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
