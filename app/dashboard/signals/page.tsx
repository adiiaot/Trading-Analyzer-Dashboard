"use client";

import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { SignalCard } from "../components/SignalCard";
import { Table } from "../components/ui/Table";
import { useDashboardData } from "@/lib/data-context";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function SignalsPage() {
  const { signals } = useDashboardData();
  const active = signals.filter((s) => s.status === "active");
  const expired = signals.filter((s) => s.status === "expired");
  const today = signals.filter((s) => new Date(s.timestamp).toDateString() === new Date().toDateString());

  const signalStats = [
    { label: "Signals Today", value: today.length.toString() },
    { label: "Active", value: active.length.toString() },
    { label: "Expired", value: expired.length.toString() },
    { label: "Total", value: signals.length.toString() },
  ];

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

      {active.length > 0 && (
        <motion.div variants={item}>
          <Card header="Active Signals">
            <div className="space-y-3">
              {active.slice(0, 1).map((signal) => (
                <SignalCard
                  key={signal.id}
                  signalId={parseInt(signal.id.replace(/\D/g, "")) || 1}
                  timestamp={new Date(signal.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                  status="pending"
                  confidence={Math.round(signal.confidence * 100)}
                  orders={(signal.entries || []).map((e) => ({
                    level: e.price,
                    tp: e.tp,
                    status: "pending" as const,
                    pips: e.tpPips,
                  }))}
                  expiresAt={signal.validUntil ? new Date(signal.validUntil).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : "N/A"}
                />
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div variants={item}>
        <Card header="Signal History">
          <div className="flex flex-wrap gap-2 mb-4">
            <select className="input w-full sm:w-auto sm:max-w-[160px]">
              <option>All Signals</option>
              <option>Active Only</option>
              <option>Expired</option>
            </select>
            <select className="input w-full sm:w-auto sm:max-w-[160px]">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>All Time</option>
            </select>
          </div>

          {signals.length > 0 ? (
            <div className="overflow-x-auto -mx-5 sm:-mx-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    {["Signal", "Date/Time", "Trend", "Confidence", "Status"].map((h) => (
                      <th key={h} className="text-left text-[10px] sm:text-xs text-text-muted font-medium pb-3 px-3 sm:px-5 first:pl-3 sm:first:pl-5 last:pr-3 sm:last:pr-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {signals.slice(0, 10).map((s, i) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                      className="border-b border-surface-border/50 hover:glass-card/30"
                      style={{ borderColor: "var(--glass-border)" }}
                    >
                      <td className="py-2.5 sm:py-3 px-3 sm:px-5 first:pl-3 sm:first:pl-5 font-bold text-[11px] sm:text-xs text-accent-gold">#{s.id.slice(-4)}</td>
                      <td className="py-2.5 sm:py-3 px-3 sm:px-5 text-[10px] sm:text-xs text-text-secondary">{new Date(s.timestamp).toLocaleString()}</td>
                      <td className="py-2.5 sm:py-3 px-3 sm:px-5"><span className={`text-[10px] sm:text-xs font-semibold ${s.trend === "UP" ? "text-status-win" : "text-status-loss"}`}>{s.trend}</span></td>
                      <td className="py-2.5 sm:py-3 px-3 sm:px-5 font-mono text-[11px] sm:text-xs text-text-secondary">{(s.confidence * 100).toFixed(0)}%</td>
                      <td className="py-2.5 sm:py-3 px-3 sm:px-5 last:pr-3 sm:last:pr-5">
                        <Badge variant={s.status === "active" ? "gold" : s.status === "expired" ? "loss" : "win"}>{s.status}</Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-text-muted">No signals generated yet. The bot will generate signals when market conditions align.</div>
          )}

          <div className="mt-5 pt-5 border-t border-surface-border grid grid-cols-2 gap-4">
            <div>
              <p className="text-text-muted text-xs mb-1">Total Signals</p>
              <p className="text-lg sm:text-xl font-bold text-text-primary">{signals.length}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs mb-1">Active Now</p>
              <p className="text-lg sm:text-xl font-bold text-status-win">{active.length}</p>
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
              <div key={a.label} className="flex items-center justify-between p-3 glass-card rounded-card">
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
