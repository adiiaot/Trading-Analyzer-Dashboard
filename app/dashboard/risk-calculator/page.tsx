"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useDashboardData } from "@/lib/data-context";
import { Shield, DollarSign, Percent, RefreshCw, Sparkles, Bot, Target } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function RiskCalculatorPage() {
  const { balance } = useDashboardData();
  const [riskPct, setRiskPct] = useState(1.5);
  const [stopLoss, setStopLoss] = useState(20);
  const [entry, setEntry] = useState(4073);
  const [target, setTarget] = useState(4100);
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [mode, setMode] = useState<"manual" | "ai">("manual");

  const riskAmt = balance * (riskPct / 100);
  const pipVal = 0.10;
  const posSize = riskAmt / (stopLoss * pipVal);
  const rr = Math.abs((target - entry) / stopLoss);

  const calculateAI = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/risk-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          balance,
          riskPct,
          stopLoss,
          profitTarget: target,
          style: "day trade",
          pairs: "XAU/USD",
        }),
      });
      const data = await res.json();
      setAiResult(data.analysis || data.setup?.analysis || "");
    } catch {
      setAiResult("AI analysis unavailable. Using standard calculations below.");
    }
    setAiLoading(false);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5">
      <motion.div variants={item}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-text-primary">Risk Calculator</h1>
            <p className="text-sm text-text-muted">AI-powered position sizing & risk management</p>
          </div>
          <div className="flex gap-1 rounded-lg p-0.5" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
            <button
              onClick={() => setMode("manual")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === "manual" ? "text-accent-gold shadow-sm" : "text-text-muted hover:text-text-primary"
              }`}
              style={mode === "manual" ? { background: "var(--glass-bg)", border: "1px solid var(--glass-border)" } : {}}
            >
              Manual
            </button>
            <button
              onClick={() => setMode("ai")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                mode === "ai" ? "text-accent-gold shadow-sm" : "text-text-muted hover:text-text-primary"
              }`}
              style={mode === "ai" ? { background: "var(--glass-bg)", border: "1px solid var(--glass-border)" } : {}}
            >
              <Sparkles className="w-3 h-3" /> AI
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={item}>
          <Card header={mode === "ai" ? "AI Risk Setup" : "Parameters"}>
            {mode === "ai" ? (
              <div className="space-y-4">
                <div className="glass-card rounded-card p-4 text-center">
                  <p className="text-xs text-text-muted mb-1">Account Balance</p>
                  <p className="text-2xl font-bold font-mono text-text-primary">${balance.toFixed(2)}</p>
                </div>

                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Risk: {riskPct}%</label>
                  <input type="range" min="0.1" max="5" step="0.1" value={riskPct}
                    onChange={(e) => setRiskPct(Number(e.target.value))} className="w-full accent-accent-gold" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Stop Loss (pips)</label>
                  <input type="number" value={stopLoss} onChange={(e) => setStopLoss(Number(e.target.value))} className="input" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Profit Target ($)</label>
                  <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} className="input" />
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={calculateAI} disabled={aiLoading} className="w-full flex items-center justify-center gap-2">
                    {aiLoading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="w-4 h-4 rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                    {aiLoading ? "Analyzing..." : "Generate AI Setup"}
                  </Button>
                </motion.div>

                {aiResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-card p-4 text-sm text-text-primary whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto"
                  >
                    {aiResult}
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="glass-card rounded-card p-4 text-center">
                  <p className="text-xs text-text-muted mb-1">Account Balance</p>
                  <p className="text-2xl font-bold font-mono text-text-primary">${balance.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Risk: {riskPct}%</label>
                  <input type="range" min="0.1" max="5" step="0.1" value={riskPct}
                    onChange={(e) => setRiskPct(Number(e.target.value))} className="w-full accent-accent-gold" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Stop Loss (pips)</label>
                  <input type="number" value={stopLoss} onChange={(e) => setStopLoss(Number(e.target.value))} className="input" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-text-muted mb-1.5 block">Entry</label>
                    <input type="number" value={entry} onChange={(e) => setEntry(Number(e.target.value))} className="input" />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted mb-1.5 block">Target</label>
                    <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} className="input" />
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button className="w-full"><RefreshCw className="w-4 h-4" /> Calculate</Button>
                </motion.div>
              </div>
            )}
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
                <Target className="w-5 h-5 text-accent-gold mx-auto mb-2" />
                <p className="text-xs text-text-muted">Target Return</p>
                <p className="text-xl font-bold font-mono text-status-win mt-1">${Math.abs(target - entry).toFixed(2)}</p>
              </motion.div>
            </motion.div>
          </Card>

          <Card header="Position Size Reference">
            <div className="space-y-1.5">
              {[0.5, 1, 1.5, 2, 2.5].map((pct) => (
                <motion.div
                  key={pct}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: pct * 0.08, duration: 0.3 }}
                  className="flex items-center justify-between glass-card rounded-card px-4 py-2"
                >
                  <span className="text-sm text-text-primary">{pct}% Risk</span>
                  <span className="text-sm font-mono text-text-secondary">
                    ${(balance * (pct / 100)).toFixed(2)} | {(balance * (pct / 100) / (stopLoss * pipVal)).toFixed(3)} lots
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
