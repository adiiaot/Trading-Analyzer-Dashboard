"use client";

import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { PenSquare, TrendingUp, TrendingDown, Filter } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const ENTRIES = [
  { date: "2026-06-24", pair: "XAU/USD", dir: "BUY", entry: 2040.5, exit: 2047.8, pips: 7.3, pnl: 36.50, setup: "Rejection at S1 + bullish engulfing", emoji: "Focused", tag: "Trend Following" },
  { date: "2026-06-23", pair: "XAU/USD", dir: "SELL", entry: 2055.2, exit: 2048.0, pips: 7.2, pnl: 36.00, setup: "Double top at R2, bearish RSI div", emoji: "Calm", tag: "Reversal" },
  { date: "2026-06-23", pair: "XAU/USD", dir: "BUY", entry: 2038.1, exit: 2035.5, pips: -2.6, pnl: -13.00, setup: "Breakout fakeout, should have waited", emoji: "Impatient", tag: "Fakeout" },
];

export default function JournalPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-text-primary">Journal</h1>
          <p className="text-sm text-text-muted">Record, reflect, improve</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <button className="btn-primary"><PenSquare className="w-4 h-4" /> New Entry</button>
        </motion.div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Entries", value: "47" },
          { label: "Wins", value: "31" },
          { label: "Losses", value: "16" },
          { label: "Win Rate", value: "65.9%" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
            className="stat-card"
          >
            <p className="stat-label">{s.label}</p>
            <p className="stat-value text-text-primary">{s.value}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-text-muted" />
            {["All", "Trend Following", "Reversal", "Fakeout", "Breakout"].map((tag) => (
              <button key={tag} className="px-3 py-1 rounded-pill text-xs font-medium bg-surface-overlay text-text-secondary hover:text-text-primary transition-all">{tag}</button>
            ))}
          </div>

          <motion.div variants={container} initial="hidden" animate="visible" className="space-y-3">
            {ENTRIES.map((e, i) => (
              <motion.div
                key={i}
                variants={item}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="card p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${e.dir === "BUY" ? "bg-status-win/10" : "bg-status-loss/10"}`}>
                      {e.dir === "BUY" ? <TrendingUp className="w-4 h-4 text-status-win" /> : <TrendingDown className="w-4 h-4 text-status-loss" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-text-primary">{e.pair} {e.dir}</p>
                      <p className="text-xs text-text-muted">{e.date}</p>
                    </div>
                  </div>
                  <Badge variant={e.pnl >= 0 ? "win" : "loss"}>{e.pnl >= 0 ? "+" : ""}{e.pnl.toFixed(2)}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                  <div><p className="text-xs text-text-muted">Entry / Exit</p><p className="font-mono text-text-primary">{e.entry} → {e.exit}</p></div>
                  <div><p className="text-xs text-text-muted">Pips</p><p className={`font-mono font-semibold ${e.pips >= 0 ? "text-status-win" : "text-status-loss"}`}>{e.pips >= 0 ? "+" : ""}{e.pips}</p></div>
                  <div><p className="text-xs text-text-muted">Emotion</p><p className="text-text-primary">{e.emoji}</p></div>
                </div>

                <div className="bg-surface-overlay rounded-card p-3">
                  <p className="text-xs text-text-muted mb-0.5">Setup</p>
                  <p className="text-sm text-text-primary">{e.setup}</p>
                </div>

                <div className="flex gap-2 mt-3">
                  <Badge variant="gold">{e.tag}</Badge>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
