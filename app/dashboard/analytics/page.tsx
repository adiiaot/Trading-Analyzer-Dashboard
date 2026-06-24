"use client";

import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const TABS = ["Technical", "Volume", "Performance", "History"];

const MONTHLY = [
  { month: "Jan", pnl: 185.40, trades: 18, wins: 13 },
  { month: "Feb", pnl: 220.15, trades: 22, wins: 15 },
  { month: "Mar", pnl: 168.80, trades: 15, wins: 10 },
  { month: "Apr", pnl: 312.50, trades: 25, wins: 18 },
  { month: "May", pnl: 245.30, trades: 20, wins: 14 },
  { month: "Jun", pnl: 67.30, trades: 8, wins: 5 },
];

export default function AnalyticsPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5">
      <motion.div variants={item}>
        <h1 className="text-lg md:text-xl font-bold text-text-primary">Analytics</h1>
        <p className="text-sm text-text-muted">Performance & intelligence</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          ["Balance", "$5,245.50", "text-status-win"],
          ["Total P&L", "+$245.50", "text-status-win"],
          ["Win Rate", "66.7%", "text-accent-gold"],
          ["Profit Factor", "2.45x", "text-status-win"],
          ["Max DD", "-$62.50", "text-status-loss"],
          ["Sharpe", "1.82", "text-status-info"],
        ].map(([l, v, c], i) => (
          <motion.div
            key={l as string}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="card p-4 text-center"
          >
            <p className="text-xs text-text-muted mb-1">{l as string}</p>
            <p className={`text-lg font-bold font-mono ${c as string}`}>{v as string}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={item} className="flex gap-1 bg-surface-overlay rounded-lg p-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab} className="px-4 py-2 rounded-md text-xs font-medium bg-surface text-text-primary shadow-sm whitespace-nowrap">{tab}</button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={item}>
          <Card header="Equity Curve">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="h-[200px] flex items-center justify-center bg-surface-overlay rounded-card"
            >
              <span className="text-sm text-text-muted">[Chart — Equity Curve]</span>
            </motion.div>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card header="Strategy Status">
            <div className="space-y-2">
              {["Rejection Levels", "Structure Forming", "Consolidation", "Bullish Bias", "Breakout Confirmed"].map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                  className="flex items-center justify-between bg-surface-overlay rounded-card px-4 py-2.5"
                >
                  <span className="text-sm text-text-primary">{s}</span>
                  <span className="text-xs font-medium text-status-win">Active</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card header="Monthly P&L">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {MONTHLY.map((m, i) => (
              <motion.div
                key={m.month}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.04, duration: 0.3 }}
                className="bg-surface-overlay rounded-card p-3 text-center"
              >
                <p className="text-xs text-text-muted mb-1">{m.month}</p>
                <p className={`text-sm font-bold font-mono ${m.pnl >= 0 ? "text-status-win" : "text-status-loss"}`}>${m.pnl.toFixed(0)}</p>
                <p className="text-xs text-text-muted">{m.wins}/{m.trades} W</p>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card header="Trade History">
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {["ID", "Date", "Dir", "Entry", "Exit", "Pips", "P&L"].map((h) => (
                    <th key={h} className="text-left text-xs text-text-muted font-medium pb-3 px-5 first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "#T042", date: "Jun 23", dir: "BUY", entry: 2035.20, exit: 2041.35, pips: 61.5, pnl: 153.75 },
                  { id: "#T041", date: "Jun 23", dir: "SELL", entry: 2048.50, exit: 2043.80, pips: 47.0, pnl: 117.50 },
                  { id: "#T040", date: "Jun 22", dir: "BUY", entry: 2030.00, exit: 2042.10, pips: 121.0, pnl: 302.50 },
                  { id: "#T039", date: "Jun 22", dir: "SELL", entry: 2050.00, exit: 2048.20, pips: 18.0, pnl: 45.00 },
                  { id: "#T038", date: "Jun 21", dir: "BUY", entry: 2038.50, exit: 2036.00, pips: -25.0, pnl: -62.50 },
                ].map((t, i) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.25 }}
                    className="border-b border-surface-border/50 hover:bg-surface-overlay/30"
                  >
                    <td className="py-3 px-5 first:pl-5 font-mono text-text-primary text-xs">{t.id}</td>
                    <td className="py-3 px-5 text-text-secondary text-xs">{t.date}</td>
                    <td className="py-3 px-5"><span className={`text-xs font-semibold px-2 py-0.5 rounded-pill ${t.dir === "BUY" ? "bg-status-win/10 text-status-win" : "bg-status-loss/10 text-status-loss"}`}>{t.dir}</span></td>
                    <td className="py-3 px-5 font-mono text-xs text-text-primary">{t.entry.toFixed(2)}</td>
                    <td className="py-3 px-5 font-mono text-xs text-text-primary">{t.exit.toFixed(2)}</td>
                    <td className={`py-3 px-5 font-mono text-xs ${t.pips >= 0 ? "text-status-win" : "text-status-loss"}`}>{t.pips >= 0 ? "+" : ""}{t.pips.toFixed(1)}</td>
                    <td className={`py-3 px-5 last:pr-5 font-mono text-xs font-semibold ${t.pnl >= 0 ? "text-status-win" : "text-status-loss"}`}>{t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
