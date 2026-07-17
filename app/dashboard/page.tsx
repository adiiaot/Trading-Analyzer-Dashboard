"use client";

import { motion } from "framer-motion";
import { Send, BarChart3, Terminal, Radio, BookOpen, Activity, BarChart4, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import { QuickStats } from "./components/QuickStats";
import { TradingChart } from "./components/TradingChart";
import { OpenPositionsTable } from "./components/OpenPositionsTable";
import { SignalFeed } from "./components/SignalFeed";
import BriefPanel from "./components/BriefPanel";
import { useDashboardData } from "@/lib/data-context";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const section = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const quickLinks = [
  { href: "/dashboard/commands", label: "All Commands", icon: Terminal, desc: "Signal generator, trade logger, journal & more" },
  { href: "/dashboard/signals", label: "Generate Signal", icon: Radio, desc: "Run 4-timeframe XAU/USD analysis" },
  { href: "/dashboard/backtest", label: "Backtest", icon: BarChart4, desc: "Run historical signal engine backtest" },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, desc: "Win rate, P&L, strategy breakdown" },
];

function CompoundingSummary() {
  const { balance, compounding } = useDashboardData();
  if (balance <= 0) return null;
  const nextTarget = parseFloat((compounding.cycleStartBalance * (1 + compounding.targetReturn / 100)).toFixed(2));
  const progress = Math.min(100, Math.max(0, ((balance - compounding.cycleStartBalance) / (nextTarget - compounding.cycleStartBalance)) * 100));
  const riskAmount = parseFloat((balance * compounding.riskPercent / 100).toFixed(2));
  return (
    <Link href="/dashboard/compounding"
      className="block rounded-xl overflow-hidden transition-all hover:opacity-95"
      style={{ background: "var(--glass-bg)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid var(--glass-border)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="p-4 flex items-center gap-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(240, 180, 41, 0.12)" }}>
          <TrendingUp className="w-5 h-5 text-accent-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-primary">Cycle {compounding.cycleNumber}</span>
              <span className="text-[10px] font-mono font-bold" style={{ color: "var(--accent-gold)" }}>
                {formatUSD(balance)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-text-muted">Next: {formatUSD(nextTarget)}</span>
              <ChevronRight className="w-3 h-3 text-text-muted" />
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full transition-all" style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #f0b429, #ffd54f)",
            }} />
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px]">
            <span className="text-text-muted">Risk: {formatUSD(riskAmount)}/trade</span>
            <span className="font-mono font-semibold" style={{ color: "var(--accent-gold)" }}>{progress.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatUSD(v: number): string {
  return v < 0 ? `-$${Math.abs(v).toFixed(2)}` : `$${v.toFixed(2)}`;
}

export default function DashboardPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-4">
      {/* Header */}
      <motion.div variants={section} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg md:text-xl font-bold text-text-primary">Command Center</h1>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium text-status-win"
            style={{ background: "rgba(0,230,118,0.08)", border: "1px solid rgba(0,230,118,0.15)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-status-win animate-pulse-soft" />
            Live
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>Gold Spot / XAU/USD</span>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={section}>
        <QuickStats />
      </motion.div>

      {/* Brief Panel */}
      <motion.div variants={section}>
        <BriefPanel />
      </motion.div>

      {/* Compounding Summary */}
      <motion.div variants={section}>
        <CompoundingSummary />
      </motion.div>

      {/* Hero: Full-width chart */}
      <motion.div variants={section}>
        <TradingChart />
      </motion.div>

      {/* Open Positions */}
      <motion.div variants={section}>
        <OpenPositionsTable />
      </motion.div>

      {/* Bottom: Signal Feed + Quick Links */}
      <motion.div variants={section} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SignalFeed />
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accent-gold" />
              <h3 className="text-sm font-bold text-text-primary">Dashboard Commands</h3>
            </div>
            <Link href="/dashboard/commands"
              className="text-xs px-3 py-1.5 rounded-lg font-semibold"
              style={{ background: 'rgba(240, 180, 41, 0.1)', color: 'var(--accent-gold)' }}>
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {quickLinks.map((c) => (
              <Link key={c.href} href={c.href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(240,180,41,0.1)" }}>
                  <c.icon className="w-3.5 h-3.5 text-accent-gold" />
                </div>
                <div>
                  <p className="text-text-primary font-semibold">{c.label}</p>
                  <p className="text-text-muted">{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
