"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useDashboardData } from "@/lib/data-context";
import { Check, DollarSign, Sparkles, ArrowRight, RefreshCw, Bot, Save } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const WIZARD_QUESTIONS = [
  { id: "style", label: "What's your trading style?", options: ["Scalp (minutes)", "Day Trade (hours)", "Swing (days)", "Position (weeks)"] },
  { id: "experience", label: "Your experience level?", options: ["Beginner", "Intermediate", "Advanced", "Professional"] },
  { id: "goal", label: "Weekly profit target?", options: ["1-3% of account", "3-5% of account", "5-10% of account", "10%+ of account"] },
  { id: "riskTolerance", label: "Your risk tolerance?", options: ["Conservative", "Moderate", "Aggressive", "Very Aggressive"] },
  { id: "hours", label: "Hours per day you can trade?", options: ["< 1 hour", "1-2 hours", "2-4 hours", "4+ hours"] },
];

function generatePlan(answers: Record<string, string>, balance: number) {
  const style = answers.style?.toLowerCase() || "";
  const experience = answers.experience?.toLowerCase() || "";
  const goal = answers.goal || "";
  const tolerance = answers.riskTolerance?.toLowerCase() || "";
  const hours = answers.hours || "";

  const isConservative = tolerance.includes("conservative") || experience.includes("beginner");
  const isAggressive = tolerance.includes("aggressive");
  const isScalp = style.includes("scalp");
  const isSwing = style.includes("swing") || style.includes("position");
  const lowHours = hours.startsWith("<") || hours.startsWith("1-2");
  const highGoal = goal.includes("10%") || goal.includes("5-10");

  const riskPct = isAggressive ? 2.5 : isConservative ? 0.5 : 1.5;
  const stopLoss = isScalp ? 10 : isSwing ? 30 : 20;
  const maxTrades = isScalp ? 8 : lowHours ? 3 : highGoal ? 5 : 4;
  const dailyLossCap = balance * (isAggressive ? 0.08 : isConservative ? 0.02 : 0.05);
  const rrTarget = isAggressive ? 1.5 : isConservative ? 2.5 : 2.0;
  const riskAmt = balance * (riskPct / 100);
  const posSize = riskAmt / (stopLoss * 0.10);

  const lines = [`📊 **Personalized Risk Plan**\n`];
  lines.push(`**Style:** ${answers.style || "Day Trade"} | **Experience:** ${answers.experience || "Intermediate"}`);
  lines.push(`**Account:** $${balance.toFixed(2)}`);
  lines.push(``);
  lines.push(`📌 **Recommendations**`);
  lines.push(`• Risk per trade: **${riskPct}%** ($${riskAmt.toFixed(2)})`);
  lines.push(`• Position size: **${posSize.toFixed(3)} lots** (~${stopLoss} pip SL)`);
  lines.push(`• Max trades/day: **${maxTrades}**`);
  lines.push(`• Daily loss cap: **$${dailyLossCap.toFixed(0)}** (${((dailyLossCap / balance) * 100).toFixed(1)}%)`);
  lines.push(`• Target R:R ratio: **1:${rrTarget}**`);
  lines.push(``);
  lines.push(`📈 **Strategy Notes**`);
  if (isScalp) lines.push("• Scalp-friendly: tight SL, higher trade count, focus on 1m-5m charts");
  if (isSwing) lines.push("• Swing-friendly: wider SL, fewer trades, focus on 1H-4H charts");
  if (isConservative) lines.push("• Conservative sizing: prioritize capital preservation over return");
  if (isAggressive) lines.push("• Aggressive sizing: higher risk per trade, strict loss cap enforced");
  if (lowHours) lines.push("• Limited screen time: use pending orders, set alerts on key levels");
  if (highGoal && isAggressive) lines.push("• High target + aggressive: consider scaling into positions");
  lines.push(`• Ideal session: ${isScalp ? "London/NY overlap" : isSwing ? "Daily close" : "London open"}`);
  lines.push(``);
  lines.push(`⚠️ **Risk Management**`);
  lines.push(`• Max ${isAggressive ? "2 consecutive losses → reduce size by 50%" : "3 consecutive losses → stop trading for the day"}`);
  lines.push(`• Review plan weekly; adjust risk % based on win rate`);

  return lines.join("\n");
}

export default function SettingsPage() {
  const { balance, setBalance } = useDashboardData();
  const [newBalance, setNewBalance] = useState(balance.toString());

  const [riskPct, setRiskPct] = useState(1.5);
  const [stopLoss, setStopLoss] = useState(20);
  const [maxDailyLoss, setMaxDailyLoss] = useState(500);
  const [dailyTarget, setDailyTarget] = useState(1000);
  const [maxTrades, setMaxTrades] = useState(5);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("settings_risk");
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setRiskPct(p.riskPct ?? 1.5);
        setStopLoss(p.stopLoss ?? 20);
        setMaxDailyLoss(p.maxDailyLoss ?? 500);
        setDailyTarget(p.dailyTarget ?? 1000);
        setMaxTrades(p.maxTrades ?? 5);
      } catch {}
    }
  }, []);

  const persistRisk = useCallback((updates: Record<string, number>) => {
    const current = { riskPct, stopLoss, maxDailyLoss, dailyTarget, maxTrades, ...updates };
    if (typeof window !== "undefined") {
      localStorage.setItem("settings_risk", JSON.stringify(current));
    }
  }, [riskPct, stopLoss, maxDailyLoss, dailyTarget, maxTrades]);

  const pipVal = 0.10;
  const riskAmt = balance * (riskPct / 100);
  const posSize = riskAmt / (stopLoss * pipVal);

  const [saved, setSaved] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardAnswers, setWizardAnswers] = useState<Record<string, string>>({});
  const [wizardResult, setWizardResult] = useState("");
  const [wizardLoading, setWizardLoading] = useState(false);

  const saveBalance = () => {
    const parsed = parseFloat(newBalance);
    if (!isNaN(parsed) && parsed >= 0) {
      setBalance(parsed);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleWizardAnswer = (answer: string) => {
    const q = WIZARD_QUESTIONS[wizardStep];
    const updated = { ...wizardAnswers, [q.id]: answer };
    setWizardAnswers(updated);

    if (wizardStep < WIZARD_QUESTIONS.length - 1) {
      setWizardStep(wizardStep + 1);
      return;
    }

    setWizardLoading(true);
    setTimeout(() => {
      const plan = generatePlan(updated, balance);
      setWizardResult(plan);
      setWizardLoading(false);
    }, 600);
  };

  const resetWizard = () => {
    setWizardStep(0);
    setWizardAnswers({});
    setWizardResult("");
    setShowWizard(false);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-text-primary">Settings</h1>
          <p className="text-sm text-text-muted">Account balance, risk parameters & AI setup wizard</p>
        </div>
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button onClick={() => setShowWizard(true)} className="btn-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Wizard
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button onClick={saveBalance}><Save className="w-4 h-4" /> Save</Button>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={item}>
          <Card header="Account Balance">
            <div className="space-y-4">
              <div className="stat-card">
                <p className="text-xs text-text-muted mb-1">Current Balance</p>
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
                  <Button onClick={() => { setBalance(parseFloat(newBalance) || 0); saveBalance(); }}>
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
                <label className="text-xs text-text-muted mb-1.5 block">
                  Risk per Trade: <span className="font-semibold text-accent-gold">{riskPct}%</span>
                </label>
                <input
                  type="range" min="0.1" max="5" step="0.1"
                  value={riskPct}
                  onChange={(e) => { const v = Number(e.target.value); setRiskPct(v); persistRisk({ riskPct: v }); }}
                  className="w-full accent-accent-gold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Stop Loss (pips)</label>
                  <input type="number" value={stopLoss}
                    onChange={(e) => { const v = Number(e.target.value); setStopLoss(v); persistRisk({ stopLoss: v }); }}
                    className="input" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Max Daily Loss ($)</label>
                  <input type="number" value={maxDailyLoss}
                    onChange={(e) => { const v = Number(e.target.value); setMaxDailyLoss(v); persistRisk({ maxDailyLoss: v }); }}
                    className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Daily Target ($)</label>
                  <input type="number" value={dailyTarget}
                    onChange={(e) => { const v = Number(e.target.value); setDailyTarget(v); persistRisk({ dailyTarget: v }); }}
                    className="input" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Max Trades/Day</label>
                  <input type="number" value={maxTrades}
                    onChange={(e) => { const v = Number(e.target.value); setMaxTrades(v); persistRisk({ maxTrades: v }); }}
                    className="input" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card header="Auto-Calculated Position Size">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card">
              <p className="text-xs text-text-muted mb-1">Risk Amount</p>
              <p className="text-xl font-bold font-mono text-status-loss">${riskAmt.toFixed(2)}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-text-muted mb-1">Position Size</p>
              <p className="text-xl font-bold font-mono text-accent-gold">{posSize.toFixed(3)} lots</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-text-muted mb-1">Max Daily Risk</p>
              <p className="text-xl font-bold font-mono text-status-warn">${maxDailyLoss.toFixed(0)}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-text-muted mb-1">Daily Target</p>
              <p className="text-xl font-bold font-mono text-status-win">${dailyTarget.toFixed(0)}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-glass-border">
            <p className="text-xs text-text-muted">
              Position size calculated using <span className="font-semibold text-text-primary">{riskPct}%</span> risk on
              <span className="font-semibold text-text-primary"> ${balance.toFixed(0)}</span> balance with
              <span className="font-semibold text-text-primary"> {stopLoss}</span> pip stop loss.
              Max <span className="font-semibold text-text-primary">{maxTrades}</span> trades/day.
            </p>
          </div>
        </Card>
      </motion.div>

      <AnimatePresence>
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
      </AnimatePresence>

      <AnimatePresence>
        {showWizard && (
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
              className="card w-[90vw] sm:w-[500px] max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <Bot className="w-6 h-6 text-accent-gold" />
                <div>
                  <h3 className="text-lg font-bold text-text-primary">AI Risk Setup Wizard</h3>
                  <p className="text-xs text-text-muted">Answer 5 questions for a personalized plan</p>
                </div>
              </div>

              {!wizardResult ? (
                <div className="space-y-4">
                  {wizardLoading ? (
                    <div className="text-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="w-8 h-8 rounded-full border-2 border-accent-gold border-t-transparent mx-auto mb-4"
                      />
                      <p className="text-sm text-text-muted">Generating your personalized risk plan...</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        {WIZARD_QUESTIONS.map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full ${i <= wizardStep ? "bg-accent-gold" : "bg-glass-border"}`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-text-muted">Question {wizardStep + 1} of {WIZARD_QUESTIONS.length}</p>
                      <p className="text-base font-semibold text-text-primary mb-3">{WIZARD_QUESTIONS[wizardStep].label}</p>

                      <div className="space-y-2">
                        {WIZARD_QUESTIONS[wizardStep].options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => handleWizardAnswer(opt)}
                            className="w-full text-left glass-card rounded-card px-4 py-3 text-sm text-text-primary hover:border-accent-gold/30 transition-all flex items-center justify-between group"
                          >
                            {opt}
                            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent-gold transition-all" />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="glass-card rounded-card p-3 sm:p-4 text-sm text-text-primary whitespace-pre-wrap leading-relaxed max-h-[300px] sm:max-h-[350px] overflow-y-auto">
                    {wizardResult}
                  </div>
                  <Button onClick={resetWizard} className="w-full">
                    <RefreshCw className="w-4 h-4" /> Start Over
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
