"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useDashboardData } from "@/lib/data-context";
import { Save, Check, DollarSign, RefreshCw } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function SettingsPage() {
  const { balance, setBalance } = useDashboardData();
  const [newBalance, setNewBalance] = useState(balance.toString());
  const [riskPct, setRiskPct] = useState(1.5);
  const [stopLoss, setStopLoss] = useState(20);
  const [maxDailyLoss, setMaxDailyLoss] = useState(500);
  const [dailyTarget, setDailyTarget] = useState(1000);

  const pipVal = 0.10;
  const riskAmt = balance * (riskPct / 100);
  const posSize = riskAmt / (stopLoss * pipVal);

  const [saved, setSaved] = useState(false);
  const save = () => {
    const parsed = parseFloat(newBalance);
    if (!isNaN(parsed) && parsed >= 0) {
      setBalance(parsed);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-text-primary">Settings</h1>
          <p className="text-sm text-text-muted">Account balance & risk parameters</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button onClick={save}><Save className="w-4 h-4" /> Save</Button>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={item}>
          <Card header="Account Balance">
            <div className="space-y-4">
              <div className="glass-card rounded-card p-4 text-center">
                <p className="stat-label text-xs text-text-muted mb-1">Current Balance</p>
                <p className="text-3xl font-bold font-mono text-text-primary">
                  ${balance.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="text-xs text-text-muted mb-1.5 block">Set New Balance</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="input flex-1"
                    step="0.01"
                  />
                  <Button onClick={() => { setBalance(parseFloat(newBalance) || 0); save(); }}>
                    <DollarSign className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card header="Risk Parameters">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-1.5 block">Risk per Trade: {riskPct}%</label>
                <input
                  type="range" min="0.1" max="5" step="0.1"
                  value={riskPct}
                  onChange={(e) => setRiskPct(Number(e.target.value))}
                  className="w-full accent-accent-gold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Stop Loss (pips)</label>
                  <input type="number" value={stopLoss} onChange={(e) => setStopLoss(Number(e.target.value))} className="input" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Max Daily Loss ($)</label>
                  <input type="number" value={maxDailyLoss} onChange={(e) => setMaxDailyLoss(Number(e.target.value))} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Daily Target ($)</label>
                  <input type="number" value={dailyTarget} onChange={(e) => setDailyTarget(Number(e.target.value))} className="input" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Max Trades/Day</label>
                  <input type="number" defaultValue={10} className="input" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card header="Auto-Calculated Position Size">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-card p-4 text-center">
              <p className="text-xs text-text-muted mb-1">Risk Amount</p>
              <p className="text-xl font-bold font-mono text-status-loss">${riskAmt.toFixed(2)}</p>
            </div>
            <div className="glass-card rounded-card p-4 text-center">
              <p className="text-xs text-text-muted mb-1">Position Size</p>
              <p className="text-xl font-bold font-mono text-accent-gold">{posSize.toFixed(3)} lots</p>
            </div>
            <div className="glass-card rounded-card p-4 text-center">
              <p className="text-xs text-text-muted mb-1">Max Daily Risk</p>
              <p className="text-xl font-bold font-mono text-status-warn">${maxDailyLoss.toFixed(0)}</p>
            </div>
            <div className="glass-card rounded-card p-4 text-center">
              <p className="text-xs text-text-muted mb-1">Daily Target</p>
              <p className="text-xl font-bold font-mono text-status-win">${dailyTarget.toFixed(0)}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-surface-border">
            <p className="text-xs text-text-muted">
              Position size calculated using {riskPct}% risk on ${balance.toFixed(0)} balance with {stopLoss} pip stop loss.
            </p>
          </div>
        </Card>
      </motion.div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="fixed top-4 right-4 bg-status-win/90 text-white px-4 py-3 rounded-card shadow-lg flex items-center gap-2 text-sm font-semibold z-50"
        >
          <Check className="w-4 h-4" /> Saved
        </motion.div>
      )}
    </motion.div>
  );
}
