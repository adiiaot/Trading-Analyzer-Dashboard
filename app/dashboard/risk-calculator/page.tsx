"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Shield, DollarSign, Percent, RefreshCw } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function RiskCalculatorPage() {
  const [balance, setBalance] = useState(5000);
  const [riskPct, setRiskPct] = useState(1.5);
  const [stopLoss, setStopLoss] = useState(20);
  const [entry, setEntry] = useState(2040);
  const [exit, setExit] = useState(2055);

  const riskAmt = balance * (riskPct / 100);
  const pipVal = 0.10;
  const posSize = riskAmt / (stopLoss * pipVal);
  const rr = Math.abs((exit - entry) / stopLoss);

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5">
      <motion.div variants={item}>
        <h1 className="text-lg md:text-xl font-bold text-text-primary">Risk Calculator</h1>
        <p className="text-sm text-text-muted">Position sizing & risk management</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={item}>
          <Card header="Parameters">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-1.5 block">Balance ($)</label>
                <input
                  type="number" value={balance}
                  onChange={(e) => setBalance(Number(e.target.value))}
                  className="input"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1.5 block">Risk: {riskPct}%</label>
                <input
                  type="range" min="0.1" max="5" step="0.1"
                  value={riskPct}
                  onChange={(e) => setRiskPct(Number(e.target.value))}
                  className="w-full accent-accent-gold"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1.5 block">Stop Loss (pips)</label>
                <input
                  type="number" value={stopLoss}
                  onChange={(e) => setStopLoss(Number(e.target.value))}
                  className="input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Entry</label>
                  <input
                    type="number" value={entry}
                    onChange={(e) => setEntry(Number(e.target.value))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Target</label>
                  <input
                    type="number" value={exit}
                    onChange={(e) => setExit(Number(e.target.value))}
                    className="input"
                  />
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button className="w-full"><RefreshCw className="w-4 h-4" /> Calculate</Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item} className="space-y-5">
          <Card header="Results">
            <motion.div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="card text-center"
              >
                <DollarSign className="w-5 h-5 text-accent-gold mx-auto mb-2" />
                <p className="text-xs text-text-muted">Risk Amount</p>
                <p className="text-xl font-bold font-mono text-status-loss mt-1">${riskAmt.toFixed(2)}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="card text-center"
              >
                <Percent className="w-5 h-5 text-accent-gold mx-auto mb-2" />
                <p className="text-xs text-text-muted">Position Size</p>
                <p className="text-xl font-bold font-mono text-accent-gold mt-1">{posSize.toFixed(3)} lots</p>
              </motion.div>
            </motion.div>
            <motion.div className="grid grid-cols-2 gap-4 mt-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="card text-center"
              >
                <Shield className="w-5 h-5 text-accent-gold mx-auto mb-2" />
                <p className="text-xs text-text-muted">R/R Ratio</p>
                <p className="text-xl font-bold font-mono text-status-win mt-1">1:{rr.toFixed(2)}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="card text-center"
              >
                <RefreshCw className="w-5 h-5 text-accent-gold mx-auto mb-2" />
                <p className="text-xs text-text-muted">Max Risk</p>
                <p className="text-xl font-bold font-mono text-status-warn mt-1">{riskPct}%</p>
              </motion.div>
            </motion.div>
          </Card>

          <Card header="Quick Reference">
            <div className="space-y-1.5">
              {[0.5, 1, 1.5, 2, 2.5].map((pct) => (
                <motion.div
                  key={pct}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: pct * 0.08, duration: 0.3 }}
                  className="flex items-center justify-between bg-surface-overlay rounded-card px-4 py-2"
                >
                  <span className="text-sm text-text-primary">{pct}% Risk</span>
                  <span className="text-sm font-mono text-text-secondary">${(balance * (pct / 100)).toFixed(2)} | {(balance * (pct / 100) / (stopLoss * pipVal)).toFixed(3)} lots</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
