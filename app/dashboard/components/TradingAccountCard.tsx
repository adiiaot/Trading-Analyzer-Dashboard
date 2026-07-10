"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Pencil, X, Save, Wallet2, TrendingUp as TrendingUpIcon } from "lucide-react";
import { useDashboardData } from "@/lib/data-context";
import { formatCurrency } from "@/lib/utils";

export function TradingAccountCard() {
  const { balance, setBalance, stats } = useDashboardData();
  const [visible, setVisible] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newBalance, setNewBalance] = useState(balance.toString());

  const handleSave = () => {
    const val = parseFloat(newBalance);
    if (!isNaN(val) && val >= 0) {
      setBalance(val);
      setEditing(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        {/* Decorative top accent */}
        <div className="h-[2px] rounded-full mx-4" style={{ background: "linear-gradient(90deg, transparent, rgba(0,230,118,0.3), transparent)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,230,118,0.1)" }}>
              <Wallet2 className="w-4 h-4 text-status-win" />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-primary">Demo</p>
              <p className="text-[10px] text-text-muted">Account</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setVisible(!visible)} className="p-1.5 rounded-lg transition-colors hover:bg-glass" style={{ color: "var(--text-muted)" }}>
              {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg transition-colors hover:bg-glass" style={{ color: "var(--text-muted)" }}>
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Balance */}
        <div className="px-4 py-3">
          <p className="text-[11px] text-text-muted mb-1">Balance</p>
          <div className="flex items-baseline gap-3">
            <motion.p
              key={visible ? balance : 0}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold font-mono text-text-primary"
            >
              {visible ? formatCurrency(balance) : "****"}
            </motion.p>
            {stats && stats.total_trades > 0 && (() => {
              const pct = (stats.total_pnl / (balance - stats.total_pnl || 1)) * 100;
              const pos = pct >= 0;
              return (
                <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${pos ? "text-status-win" : "text-status-loss"}`}
                  style={{ background: pos ? "rgba(0,230,118,0.08)" : "rgba(255,82,82,0.08)", border: `1px solid ${pos ? "rgba(0,230,118,0.12)" : "rgba(255,82,82,0.12)"}` }}>
                  <TrendingUpIcon className={`w-2.5 h-2.5 ${pos ? "" : "rotate-180"}`} />
                  {pos ? "+" : ""}{pct.toFixed(1)}%
                </span>
              );
            })()}
          </div>
        </div>

        {/* Grid: Available + Margin */}
        <div className="grid grid-cols-2 gap-2 px-4 pb-3">
          <div className="rounded-xl p-3" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
            <p className="text-[10px] text-text-muted mb-1">Available</p>
            <p className="text-sm font-mono font-semibold text-text-primary tabular-nums">
              {visible ? formatCurrency(balance * 0.8) : "****"}
            </p>
          </div>
          <div className="rounded-xl p-3" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
            <p className="text-[10px] text-text-muted mb-1">Margin</p>
            <p className="text-sm font-mono font-semibold text-text-primary tabular-nums">
              {visible ? formatCurrency(balance * 0.2) : "****"}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderTop: "1px solid var(--glass-border)" }}>
          <span className="text-[11px] text-text-muted">Status</span>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-status-win px-2.5 py-0.5 rounded-full"
            style={{ background: "rgba(0,230,118,0.08)", border: "1px solid rgba(0,230,118,0.12)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-status-win animate-pulse-soft" />
            Active
          </span>
        </div>

        {/* Mini equity curve */}
        <div className="px-4 pb-3 pt-1 opacity-40">
          <svg width="100%" height="24" viewBox="0 0 200 24">
            <defs>
              <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path
              d="M0,20 Q15,18 30,21 T60,16 T90,13 T120,14 T150,10 T180,7 T200,5"
              stroke="var(--gold)"
              strokeWidth={1.2}
              fill="url(#eqGrad)"
            />
          </svg>
        </div>
      </motion.div>

      {/* Edit Balance Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card w-[90vw] sm:w-[380px] p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-text-primary">Edit Balance</h3>
                <button onClick={() => setEditing(false)} className="p-1 rounded-lg hover:bg-glass">
                  <X className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-text-muted mb-1">Current Balance</p>
                  <p className="text-xl font-mono font-bold text-text-primary">{formatCurrency(balance)}</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">New Balance</label>
                  <input
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="input"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Currency</label>
                  <select className="input" defaultValue="USD">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-5 pt-4" style={{ borderTop: "1px solid var(--glass-border)" }}>
                <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Save
                </button>
                <button onClick={() => setEditing(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
