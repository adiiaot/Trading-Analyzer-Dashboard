"use client";

import { motion } from "framer-motion";
import { Send, MessageCircle, BarChart3, HelpCircle } from "lucide-react";
import { TradingAccountCard } from "./components/TradingAccountCard";
import { PricePanel } from "./components/PricePanel";
import { QuickStats } from "./components/QuickStats";
import { TradingChart } from "./components/TradingChart";
import { OpenPositionsTable } from "./components/OpenPositionsTable";
import { SignalFeed } from "./components/SignalFeed";
import { MarketSentiment } from "./components/MarketSentiment";

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const section = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function DashboardPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-5">
      <motion.div variants={section} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-text-primary">Command Center</h1>
          <p className="text-sm text-text-muted">XAU/USD — Mr PFX Scalping Strategy</p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex items-center gap-2 text-sm"
        >
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-status-win"
          />
          <span className="text-text-muted">Live</span>
        </motion.div>
      </motion.div>

      <motion.div variants={section}><PricePanel /></motion.div>
      <motion.div variants={section}><QuickStats /></motion.div>

      <motion.div variants={section} className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-1"><TradingAccountCard /></div>
        <div className="lg:col-span-3"><TradingChart /></div>
      </motion.div>

      <motion.div variants={section} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5"><OpenPositionsTable /></div>
        <div className="lg:col-span-1 space-y-5">
          <SignalFeed />
          <MarketSentiment />
        </div>
      </motion.div>

      <motion.div variants={section}>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-accent-gold" />
              <h3 className="text-sm font-bold text-text-primary">Telegram Bot</h3>
            </div>
            <a
              href="https://t.me/aot_analyzer_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg bg-accent-gold/10 text-accent-gold hover:bg-accent-gold/20 transition-all font-semibold"
            >
              Open Bot
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { cmd: "/signal", desc: "Generate signal", icon: BarChart3 },
              { cmd: "/stats", desc: "Trading stats", icon: BarChart3 },
              { cmd: "/journal", desc: "Add journal entry", icon: MessageCircle },
              { cmd: "/help", desc: "All commands", icon: HelpCircle },
            ].map((c) => (
              <a
                key={c.cmd}
                href={`https://t.me/aot_analyzer_bot?start=${c.cmd.replace("/", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-overlay hover:bg-accent-gold/10 transition-all text-xs"
              >
                <c.icon className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                <div>
                  <p className="font-mono text-text-primary font-semibold">{c.cmd}</p>
                  <p className="text-text-muted">{c.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


