"use client";

import { motion } from "framer-motion";
import { Send, BarChart3, Terminal, Radio, BookOpen, Activity, BarChart4 } from "lucide-react";
import Link from "next/link";
import { TradingAccountCard } from "./components/TradingAccountCard";
import { QuickStats } from "./components/QuickStats";
import { TradingChart } from "./components/TradingChart";
import { OpenPositionsTable } from "./components/OpenPositionsTable";
import { SignalFeed } from "./components/SignalFeed";
import BriefPanel from "./components/BriefPanel";

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

      {/* Hero: Full-width chart */}
      <motion.div variants={section}>
        <TradingChart />
      </motion.div>

      {/* Account + Positions side by side */}
      <motion.div variants={section} className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <TradingAccountCard />
        </div>
        <div className="lg:col-span-3">
          <OpenPositionsTable />
        </div>
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
