"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Pencil, X, Save } from "lucide-react";
import { useDashboardData } from "@/lib/data-context";
import { formatCurrency } from "@/lib/utils";

export function TradingAccountCard() {
  const { account } = useDashboardData();
  const [visible, setVisible] = useState(true);
  const [editing, setEditing] = useState(false);
  const [balance, setBalance] = useState(account.balance);
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
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-status-win animate-pulse-soft" />
            <span className="text-xs font-medium text-status-win">{account.demoLive}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setVisible(!visible)} className="btn-ghost p-1.5">
              {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button onClick={() => setEditing(true)} className="btn-ghost p-1.5">
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-text-muted mb-1.5">Account Balance</p>
        <div className="flex items-baseline gap-3 mb-5">
          <motion.p
            key={visible ? balance : 0}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold font-mono text-text-primary"
          >
            {visible ? formatCurrency(balance) : "****"}
          </motion.p>
          <span className="text-xs font-medium text-status-win px-2 py-0.5 rounded-full" style={{ background: "rgba(0, 230, 118, 0.1)", border: "1px solid rgba(0, 230, 118, 0.15)" }}>
            +2.3%
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="rounded-lg p-3" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
            <p className="text-xs text-text-muted mb-0.5">Available</p>
            <p className="text-sm font-mono font-medium text-text-primary">
              {visible ? formatCurrency(account.available) : "****"}
            </p>
          </div>
          <div className="rounded-lg p-3" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
            <p className="text-xs text-text-muted mb-0.5">Margin</p>
            <p className="text-sm font-mono font-medium text-text-primary">
              {visible ? formatCurrency(account.usedMargin) : "****"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between py-3" style={{ borderTop: "1px solid var(--glass-border)" }}>
          <span className="text-xs text-text-muted">Status</span>
          <span className="badge-win">{account.status}</span>
        </div>

        <div className="mt-3 opacity-40">
          <svg width="100%" height="32" viewBox="0 0 200 32">
            <defs>
              <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path
              d="M0,26 Q15,24 30,27 T60,22 T90,18 T120,19 T150,14 T180,11 T200,9"
              stroke="var(--gold)"
              strokeWidth={1.5}
              fill="url(#eqGrad)"
            />
          </svg>
        </div>
      </motion.div>

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
              className="card w-[380px] p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-text-primary">Edit Balance</h3>
                <button onClick={() => setEditing(false)} className="btn-ghost p-1">
                  <X className="w-5 h-5" />
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
