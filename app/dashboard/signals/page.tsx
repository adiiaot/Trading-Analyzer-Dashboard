"use client";

import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { SignalCard } from "../components/SignalCard";
import { Table } from "../components/ui/Table";
import { Button } from "../components/ui/Button";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const signalStats = [
  { label: "Signals Today", value: "3" },
  { label: "Filled", value: "2" },
  { label: "Current P&L", value: "+$67.30" },
  { label: "Win Rate", value: "66.7%" },
];

const activeSignals = [
  {
    signalId: 47,
    timestamp: "Today 3:15 PM",
    status: "pending" as const,
    confidence: 82,
    orders: [
      { level: 2040.5, tp: 2043.2, status: "filled" as const, pips: 27 },
      { level: 2038.1, tp: 2041.8, status: "pending" as const, pips: 36 },
      { level: 2035.7, tp: 2039.5, status: "pending" as const, pips: 37 },
      { level: 2033.3, tp: 2037.1, status: "pending" as const, pips: 37 },
    ],
    pnl: 28.8,
    expiresAt: "5:00 PM",
  },
];

const HISTORICAL = [
  ["#47", "Today 3:15 PM", "ACTIVE", "+$28.80", "1/4", "82%"],
  ["#46", "Yesterday 3:30 PM", "CLOSED", "+$45.20", "2/4", "100%"],
  ["#45", "2 days ago", "CLOSED", "-$12.50", "0/4", "0%"],
  ["#44", "3 days ago", "CLOSED", "+$67.30", "3/4", "75%"],
];

export default function SignalsPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5">
      <motion.div variants={item}>
        <h1 className="text-lg md:text-xl font-bold text-text-primary">Signals</h1>
        <p className="text-sm text-text-muted">Active signals & performance archive</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {signalStats.map((s, i) => (
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
        <Card header="Active Signal">
          {activeSignals.map((signal) => (
            <SignalCard key={signal.signalId} {...signal} />
          ))}
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card header="Archive (Last 30 Days)">
          <div className="flex flex-wrap gap-2 mb-4">
            <select className="input max-w-[160px]">
              <option>All Signals</option>
              <option>Filled Only</option>
              <option>Expired</option>
            </select>
            <select className="input max-w-[160px]">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>

          <Table
            headers={["Signal", "Date/Time", "Status", "P&L", "Orders", "Win %"]}
            rows={HISTORICAL.map((r) => [
              <span key="id" className="font-bold text-accent-gold">{r[0]}</span>,
              <span key="dt" className="text-xs text-text-secondary">{r[1]}</span>,
              <Badge key="st" variant={r[2] === "ACTIVE" ? "gold" : "win"}>{r[2]}</Badge>,
              <span key="pnl" className={`font-bold font-mono ${r[3].startsWith("-") ? "text-status-loss" : "text-status-win"}`}>{r[3]}</span>,
              r[4],
              <span key="wp" className="font-mono text-text-secondary">{r[5]}</span>,
            ])}
          />

          <div className="mt-5 pt-5 border-t border-surface-border grid grid-cols-2 gap-4">
            <div>
              <p className="text-text-muted text-xs mb-1">Total (30d)</p>
              <p className="text-xl font-bold text-text-primary">45</p>
            </div>
            <div>
              <p className="text-text-muted text-xs mb-1">Total P&L</p>
              <p className="text-xl font-bold text-status-win">+$456.80</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card header="Alert Settings">
          <div className="space-y-2">
            {[
              { label: "Telegram Alerts", status: "Enabled" },
              { label: "Desktop Notifications", status: "Enabled" },
              { label: "Email Digest", status: "Daily" },
            ].map((a) => (
              <div key={a.label} className="flex items-center justify-between p-3 bg-surface-overlay rounded-card">
                <span className="text-sm text-text-primary">{a.label}</span>
                <Badge variant="win">{a.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
