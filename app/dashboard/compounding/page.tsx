"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Target, PieChart, History, RotateCcw, Sliders, ChevronRight, ChevronDown, Crosshair } from "lucide-react";
import { useDashboardData } from "@/lib/data-context";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const section = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function formatUSD(v: number): string {
  return v < 0 ? `-$${Math.abs(v).toFixed(2)}` : `$${v.toFixed(2)}`;
}

export default function CompoundingPage() {
  const { balance, setBalance, compounding, updateCompounding, recordWithdrawal, completeCycle } = useDashboardData();
  const [editMode, setEditMode] = useState(false);
  const [balanceInput, setBalanceInput] = useState(balance.toString());
  const [showCycleResult, setShowCycleResult] = useState<{ profit: number; suggestedWithdrawal: number } | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showTargetTab, setShowTargetTab] = useState(false);
  const [targetGoal, setTargetGoal] = useState("");
  const [lastLotSize, setLastLotSize] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("last_lot_size");
      if (saved) return parseFloat(saved);
    }
    return 0.05;
  });

  const nextTarget = parseFloat((compounding.cycleStartBalance * (1 + compounding.targetReturn / 100)).toFixed(2));
  const profitNeeded = parseFloat((nextTarget - balance).toFixed(2));
  const cycleProgress = Math.min(100, Math.max(0, ((balance - compounding.cycleStartBalance) / (nextTarget - compounding.cycleStartBalance)) * 100));
  const currentProfit = parseFloat((balance - compounding.cycleStartBalance).toFixed(2));

  // Position size calc with user lot size
  const pipValue = lastLotSize * 10;
  const slDistanceDollars = 10;
  const riskAmount = parseFloat((pipValue * slDistanceDollars).toFixed(2));
  const contractValue = lastLotSize * 100 * 2600;
  const marginRequired = parseFloat((contractValue / compounding.leverage).toFixed(2));
  const potential1R = riskAmount;
  const potential2R = riskAmount * 2;

  // Standard cycle projection (next 10 cycles)
  const projectedCycles = (() => {
    const netRate = 1 + compounding.targetReturn / 100 * (1 - compounding.withdrawPercent / 100);
    const projs: { cycle: number; start: number; end: number; profit: number; withdraw: number }[] = [];
    let cap = parseFloat((compounding.cycleStartBalance).toFixed(2));
    for (let c = compounding.cycleNumber; c < compounding.cycleNumber + 10; c++) {
      const end = parseFloat((cap * (1 + compounding.targetReturn / 100)).toFixed(2));
      const profit = parseFloat((end - cap).toFixed(2));
      const wd = parseFloat((profit * compounding.withdrawPercent / 100).toFixed(2));
      projs.push({ cycle: c, start: cap, end, profit, withdraw: wd });
      cap = parseFloat((cap * netRate).toFixed(2));
    }
    return projs;
  })();

  // Target goal projection
  const targetProjection = (() => {
    const goal = parseFloat(targetGoal);
    if (isNaN(goal) || goal <= balance) return null;
    const netRate = 1 + compounding.targetReturn / 100 * (1 - compounding.withdrawPercent / 100);
    const projs: { cycle: number; start: number; end: number; profit: number; withdraw: number }[] = [];
    let cap = parseFloat((compounding.cycleStartBalance).toFixed(2));
    let c = compounding.cycleNumber;
    const maxCycles = 500;
    while (cap < goal && c < compounding.cycleNumber + maxCycles) {
      const end = parseFloat((cap * (1 + compounding.targetReturn / 100)).toFixed(2));
      const profit = parseFloat((end - cap).toFixed(2));
      const wd = parseFloat((profit * compounding.withdrawPercent / 100).toFixed(2));
      projs.push({ cycle: c, start: cap, end, profit, withdraw: wd });
      cap = parseFloat((cap * netRate).toFixed(2));
      c++;
    }
    return projs;
  })();

  const handleSaveBalance = () => {
    const val = parseFloat(balanceInput);
    if (!isNaN(val) && val >= 0) {
      setBalance(val);
      setEditMode(false);
    }
  };

  const handleCompleteCycle = () => {
    const result = completeCycle();
    setShowCycleResult(result);
  };

  const cycleCompleted = balance >= nextTarget;

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-4">
      {/* Header */}
      <motion.div variants={section} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(var(--accent-gold-rgb), 0.12)" }}>
            <TrendingUp className="w-5 h-5 text-accent-gold" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">Compound Tracker</h1>
            <p className="text-[11px] text-text-muted">Discipline system — grow methodically, withdraw regularly</p>
          </div>
        </div>
        <button
          onClick={() => { setEditMode(!editMode); if (!editMode) setBalanceInput(balance.toString()); }}
          className="btn-secondary text-xs font-medium px-3 py-1.5 rounded-lg">
          {editMode ? "Cancel" : "Edit Balance"}
        </button>
      </motion.div>

      {/* Capital Overview */}
      <motion.div variants={section}
        className="rounded-xl overflow-hidden transition-all"
        style={{ background: "var(--glass-bg)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid var(--glass-border)", boxShadow: "var(--shadow-card)" }}
      >
          <div className="p-4 md:p-5 space-y-4">
          {editMode ? (
            <div className="flex gap-2">
              <input
                type="number"
                value={balanceInput}
                onChange={e => setBalanceInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-mono font-bold outline-none"
                style={{ background: "rgba(var(--text-primary-rgb), 0.06)", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
                autoFocus
                onKeyDown={e => e.key === "Enter" && handleSaveBalance()}
              />
              <button
                onClick={handleSaveBalance}
                className="btn-primary px-4 py-2 rounded-lg text-xs font-bold">
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">Current Balance</p>
                <p className="text-3xl font-bold font-mono" style={{ color: currentProfit >= 0 ? "var(--status-win)" : "var(--status-loss)" }}>
                  {formatUSD(balance)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-text-muted uppercase tracking-wider">Profit This Cycle</p>
                <p className="text-lg font-bold font-mono" style={{ color: currentProfit >= 0 ? "var(--status-win)" : "var(--status-loss)" }}>
                  {currentProfit >= 0 ? "+" : ""}{formatUSD(currentProfit)}
                </p>
              </div>
            </div>
          )}

          {/* Cycle progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-text-muted">Cycle {compounding.cycleNumber}</span>
              <div className="flex items-center gap-3">
                <span className="text-text-muted">{formatUSD(compounding.cycleStartBalance)}</span>
                <ChevronRight className="w-3 h-3 text-text-muted" />
                <span className="font-semibold text-accent-gold">{formatUSD(nextTarget)}</span>
              </div>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(var(--text-primary-rgb), 0.06)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cycleProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: cycleCompleted
                    ? "linear-gradient(90deg, var(--profit), rgba(var(--status-win-rgb), 0.6))"
                    : "linear-gradient(90deg, var(--accent-gold), rgba(var(--accent-gold-rgb), 0.5))",
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-text-muted">{formatUSD(profitNeeded > 0 ? profitNeeded : 0)} to target</span>
              <span className="font-mono font-semibold" style={{ color: cycleCompleted ? "var(--status-win)" : "var(--accent-gold)" }}>
                {cycleProgress.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Cycle complete action */}
          {cycleCompleted && !showCycleResult && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleCompleteCycle}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, rgba(var(--status-win-rgb),0.85), rgba(var(--accent-gold-rgb),0.8))", color: "#ffffff", border: "none" }}
            >
              <RotateCcw className="w-4 h-4" />
              Complete Cycle {compounding.cycleNumber} — Advance to Cycle {compounding.cycleNumber + 1}
            </motion.button>
          )}

          {showCycleResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 space-y-2"
              style={{ background: "rgba(var(--status-win-rgb),0.06)", border: "1px solid rgba(var(--status-win-rgb),0.15)" }}
            >
              <p className="text-sm font-bold text-status-win">Cycle {compounding.cycleNumber - 1} Complete!</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-text-muted">Profit</span>
                  <p className="font-bold font-mono text-status-win">+{formatUSD(showCycleResult.profit)}</p>
                </div>
                <div>
                  <span className="text-text-muted">Withdrawal (auto)</span>
                  <p className="font-bold font-mono text-accent-gold">{formatUSD(showCycleResult.suggestedWithdrawal)}</p>
                </div>
              </div>
              <p className="text-[10px] text-text-muted">Withdrawal auto-recorded. New balance: {formatUSD(balance)}</p>
              <button
                onClick={() => setShowCycleResult(null)}
                className="btn-primary w-full py-2 rounded-lg text-xs font-semibold">
                Continue
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Position Size Calculator */}
      <motion.div variants={section}
        className="rounded-xl overflow-hidden transition-all"
        style={{ background: "var(--glass-bg)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid var(--glass-border)", boxShadow: "var(--shadow-card)" }}
      >
        <div className="p-4 md:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-accent-gold" />
            <h2 className="text-sm font-bold text-text-primary">Position Size Calculator</h2>
          </div>

          {/* Lot size input */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-muted">Lot Size</span>
              <span className="font-mono font-bold text-accent-gold">{lastLotSize.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.01}
              max={0.5}
              step={0.01}
              value={lastLotSize}
              onChange={e => {
                const v = parseFloat(e.target.value);
                setLastLotSize(v);
                localStorage.setItem("last_lot_size", v.toString());
              }}
              className="w-full accent-[var(--accent-gold)]"
              style={{ height: "6px", borderRadius: "3px", background: "rgba(var(--text-primary-rgb), 0.08)" }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl p-3 text-center" style={{ background: "rgba(var(--accent-gold-rgb), 0.06)", border: "1px solid rgba(var(--accent-gold-rgb), 0.12)" }}>
              <p className="text-[10px] text-text-muted uppercase">Risk $</p>
              <p className="text-lg font-bold font-mono text-accent-gold">{formatUSD(riskAmount)}</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "rgba(var(--status-win-rgb),0.06)", border: "1px solid rgba(var(--status-win-rgb),0.15)" }}>
              <p className="text-[10px] text-text-muted uppercase">Margin</p>
              <p className="text-lg font-bold font-mono text-status-win">{formatUSD(marginRequired)}</p>
              <p className="text-[9px] text-text-muted mt-0.5">1:{compounding.leverage}</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "rgba(var(--accent-gold-rgb), 0.06)", border: "1px solid rgba(var(--accent-gold-rgb), 0.12)" }}>
              <p className="text-[10px] text-text-muted uppercase">1R → 2R</p>
              <p className="text-lg font-bold font-mono text-accent-gold">{formatUSD(potential1R)} → {formatUSD(potential2R)}</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "rgba(var(--accent-gold-rgb), 0.06)", border: "1px solid rgba(var(--accent-gold-rgb), 0.12)" }}>
              <p className="text-[10px] text-text-muted uppercase">Pip $</p>
              <p className="text-lg font-bold font-mono text-accent-gold">{formatUSD(pipValue)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cycle Roadmap */}
      <motion.div variants={section}
        className="rounded-xl overflow-hidden transition-all"
        style={{ background: "var(--glass-bg)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid var(--glass-border)", boxShadow: "var(--shadow-card)" }}
      >
        <div className="p-4 md:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-accent-gold" />
            <h2 className="text-sm font-bold text-text-primary">Cycle Roadmap</h2>
            <span className="text-[10px] font-mono text-text-muted ml-auto">{compounding.targetReturn}% growth, {compounding.withdrawPercent}% withdrawal</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-text-muted text-[10px] uppercase tracking-wider">
                  <th className="text-left py-1.5 pr-3">Cycle</th>
                  <th className="text-right py-1.5 px-3">Start</th>
                  <th className="text-right py-1.5 px-3">Target</th>
                  <th className="text-right py-1.5 px-3">Profit</th>
                  <th className="text-right py-1.5 pl-3">Withdraw</th>
                </tr>
              </thead>
              <tbody>
                {projectedCycles.map((c, i) => {
                  const isCurrent = c.cycle === compounding.cycleNumber;
                  return (
                    <tr key={i} className="border-t" style={{ borderColor: "var(--glass-border)", opacity: isCurrent ? 1 : 0.6 }}>
                      <td className="py-2 pr-3">
                        <span className="font-semibold" style={{ color: isCurrent ? "var(--accent-gold)" : "var(--text-secondary)" }}>
                          {isCurrent && "► "}Cycle {c.cycle}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-text-primary">{formatUSD(c.start)}</td>
                      <td className="py-2 px-3 text-right font-mono" style={{ color: "var(--accent-gold)" }}>{formatUSD(c.end)}</td>
                      <td className="py-2 px-3 text-right font-mono text-status-win">+{formatUSD(c.profit)}</td>
                      <td className="py-2 pl-3 text-right font-mono" style={{ color: "var(--status-loss)" }}>-{formatUSD(c.withdraw)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Target Projection Tab — Expandable */}
      <motion.div variants={section}
        className="rounded-xl overflow-hidden transition-all"
        style={{ background: "var(--glass-bg)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid var(--glass-border)", boxShadow: "var(--shadow-card)" }}
      >
        <button
          onClick={() => setShowTargetTab(!showTargetTab)}
          className="w-full p-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-accent-gold" />
            <h2 className="text-sm font-bold text-text-primary">Target Goal Projection</h2>
          </div>
          {showTargetTab ? (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronRight className="w-4 h-4 text-text-muted" />
          )}
        </button>

        {showTargetTab && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="px-5 pb-5 space-y-4"
          >
            <p className="text-[10px] text-text-muted">
              Set a financial target and see how many cycles it takes to reach it based on your current settings.
            </p>

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Target amount (e.g. 5000)"
                value={targetGoal}
                onChange={e => setTargetGoal(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-mono outline-none"
                style={{ background: "rgba(var(--text-primary-rgb), 0.06)", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
              />
              {targetProjection && (
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>Lot: <span className="font-mono text-accent-gold">{lastLotSize.toFixed(2)}</span></span>
                  <span>|</span>
                  <span>Leverage: <span className="font-mono text-accent-gold">1:{compounding.leverage}</span></span>
                </div>
              )}
            </div>

            {targetProjection === null && targetGoal && parseFloat(targetGoal) <= balance && (
              <p className="text-xs text-status-win">You've already reached this target! Set a higher goal.</p>
            )}

            {targetProjection === null && !isNaN(parseFloat(targetGoal)) && parseFloat(targetGoal) > balance && targetProjection === null && (
              <p className="text-xs text-status-loss">Something went wrong with the calculation. Try a different target.</p>
            )}

            {targetProjection && (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-text-muted text-[10px] uppercase tracking-wider sticky top-0" style={{ background: "var(--glass-bg)" }}>
                      <th className="text-left py-1.5 pr-3">Cycle</th>
                      <th className="text-right py-1.5 px-3">Start</th>
                      <th className="text-right py-1.5 px-3">Target</th>
                      <th className="text-right py-1.5 px-3">Profit</th>
                      <th className="text-right py-1.5 pl-3">Withdraw</th>
                    </tr>
                  </thead>
                  <tbody>
                    {targetProjection.map((c, i) => {
                      const isCurrent = c.cycle === compounding.cycleNumber;
                      const isLast = i === targetProjection.length - 1;
                      return (
                        <tr key={i} className="border-t" style={{
                          borderColor: "var(--glass-border)",
                          opacity: isCurrent ? 1 : isLast ? 1 : 0.55,
                          background: isLast ? "rgba(var(--status-win-rgb),0.04)" : "transparent",
                        }}>
                          <td className="py-2 pr-3">
                            <span className="font-semibold" style={{
                              color: isCurrent ? "var(--accent-gold)" : isLast ? "var(--status-win)" : "var(--text-secondary)",
                            }}>
                              {isCurrent && "► "}{isLast && "★ "}Cycle {c.cycle}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-text-primary">{formatUSD(c.start)}</td>
                          <td className="py-2 px-3 text-right font-mono" style={{ color: isLast ? "var(--status-win)" : "var(--accent-gold)" }}>{formatUSD(c.end)}</td>
                          <td className="py-2 px-3 text-right font-mono text-status-win">+{formatUSD(c.profit)}</td>
                          <td className="py-2 pl-3 text-right font-mono" style={{ color: "var(--status-loss)" }}>-{formatUSD(c.withdraw)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {targetProjection && (
              <div className="rounded-xl p-3 flex items-center justify-between text-xs" style={{ background: "rgba(var(--status-win-rgb),0.06)", border: "1px solid rgba(var(--status-win-rgb),0.15)" }}>
                <div>
                  <span className="text-text-muted">Target reached in</span>
                  <p className="font-bold font-mono text-status-win text-base">{targetProjection.length} cycle{targetProjection.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <span className="text-text-muted">Final balance</span>
                  <p className="font-bold font-mono" style={{ color: "var(--accent-gold)" }}>
                    {formatUSD(targetProjection[targetProjection.length - 1].end)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-text-muted">Total withdrawn</span>
                  <p className="font-bold font-mono" style={{ color: "var(--status-loss)" }}>
                    {formatUSD(targetProjection.reduce((s, c) => s + c.withdraw, 0))}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Settings + Withdrawals */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Settings */}
        <motion.div variants={section}
          className="rounded-xl overflow-hidden transition-all"
          style={{ background: "var(--glass-bg)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid var(--glass-border)", boxShadow: "var(--shadow-card)" }}
        >
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-accent-gold" />
              <h2 className="text-sm font-bold text-text-primary">Settings</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-text-muted block mb-1">Target Return per Cycle (%)</label>
                <input
                  type="number"
                  value={compounding.targetReturn}
                  onChange={e => updateCompounding({ targetReturn: parseFloat(e.target.value) || 14 })}
                  className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none"
                  style={{ background: "rgba(var(--text-primary-rgb), 0.06)", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="text-[11px] text-text-muted block mb-1">Withdraw % of Profit</label>
                <input
                  type="number"
                  value={compounding.withdrawPercent}
                  onChange={e => updateCompounding({ withdrawPercent: parseFloat(e.target.value) || 20 })}
                  className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none"
                  style={{ background: "rgba(var(--text-primary-rgb), 0.06)", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="text-[11px] text-text-muted block mb-1">Leverage (e.g. 2000 for 1:2000)</label>
                <input
                  type="number"
                  value={compounding.leverage}
                  onChange={e => updateCompounding({ leverage: parseFloat(e.target.value) || 2000 })}
                  className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none"
                  style={{ background: "rgba(var(--text-primary-rgb), 0.06)", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="text-[11px] text-text-muted block mb-1">Starting Capital</label>
                <input
                  type="number"
                  value={compounding.initialCapital}
                  onChange={e => updateCompounding({ initialCapital: parseFloat(e.target.value) || 100, cycleStartBalance: parseFloat(e.target.value) || 100 })}
                  className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none"
                  style={{ background: "rgba(var(--text-primary-rgb), 0.06)", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Withdrawals */}
        <motion.div variants={section}
          className="rounded-xl overflow-hidden transition-all"
          style={{ background: "var(--glass-bg)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid var(--glass-border)", boxShadow: "var(--shadow-card)" }}
        >
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-accent-gold" />
              <h2 className="text-sm font-bold text-text-primary">Withdrawals</h2>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Amount"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-mono outline-none"
                style={{ background: "rgba(var(--text-primary-rgb), 0.06)", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
              />
              <button
                onClick={() => {
                  const amt = parseFloat(withdrawAmount);
                  if (!isNaN(amt) && amt > 0) {
                    recordWithdrawal(amt);
                    setWithdrawAmount("");
                  }
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-90"
                style={{ background: "rgba(var(--status-loss-rgb),0.2)", color: "var(--status-loss)", border: "1px solid rgba(var(--status-loss-rgb),0.3)" }}
              >
                Withdraw
              </button>
            </div>

            {compounding.withdrawals.length === 0 ? (
              <p className="text-[11px] text-text-muted py-2">No withdrawals yet. They'll auto-record when you complete a cycle.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {compounding.withdrawals.slice().reverse().map((w, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 text-xs border-t" style={{ borderColor: "var(--glass-border)" }}>
                    <div>
                      <span className="font-mono font-semibold" style={{ color: "var(--status-loss)" }}>-{formatUSD(w.amount)}</span>
                      <span className="text-text-muted ml-2">Cycle {w.cycle}</span>
                    </div>
                    <span className="text-text-muted text-[10px]">{new Date(w.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t text-xs" style={{ borderColor: "var(--glass-border)" }}>
              <span className="text-text-muted">Total Withdrawn</span>
              <span className="font-bold font-mono" style={{ color: "var(--status-loss)" }}>
                -{formatUSD(compounding.withdrawals.reduce((s, w) => s + w.amount, 0))}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
