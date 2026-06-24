"use client";

import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const EVENTS = [
  { date: "2026-06-24", time: "2:00 PM", event: "US GDP Final", forecast: "2.8%", prev: "2.4%", impact: "HIGH", xau: "Bullish" },
  { date: "2026-06-24", time: "4:30 PM", event: "Fed Chair Speech", forecast: "-", prev: "-", impact: "HIGH", xau: "Volatile" },
  { date: "2026-06-25", time: "8:30 AM", event: "Jobless Claims", forecast: "235K", prev: "242K", impact: "MEDIUM", xau: "Neutral" },
  { date: "2026-06-25", time: "10:00 AM", event: "Home Sales", forecast: "4.15M", prev: "4.10M", impact: "LOW", xau: "Bearish" },
  { date: "2026-06-26", time: "8:30 AM", event: "Core PCE", forecast: "2.7%", prev: "2.8%", impact: "HIGH", xau: "Bullish" },
  { date: "2026-06-26", time: "9:45 AM", event: "Chicago PMI", forecast: "49.5", prev: "48.2", impact: "MEDIUM", xau: "Neutral" },
];

const impactMap: Record<string, "win" | "loss" | "warn" | "info"> = {
  HIGH: "loss",
  MEDIUM: "warn",
  LOW: "info",
};

export default function EconomicCalendarPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5">
      <motion.div variants={item}>
        <h1 className="text-lg md:text-xl font-bold text-text-primary">Economic Calendar</h1>
        <p className="text-sm text-text-muted">Key events & market impact</p>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <motion.div variants={container} initial="hidden" animate="visible" className="space-y-2">
            {EVENTS.map((evt, i) => (
              <motion.div
                key={i}
                variants={item}
                whileHover={{ y: -2, x: 2, transition: { duration: 0.2 } }}
                className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
              >
                <div className="shrink-0">
                  <p className="text-sm font-bold text-accent-gold">{evt.time}</p>
                  <p className="text-xs text-text-muted">{evt.date}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{evt.event}</p>
                  <p className="text-xs text-text-muted mt-0.5">F: {evt.forecast} · P: {evt.prev}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={impactMap[evt.impact] || "info"}>{evt.impact}</Badge>
                  <div className="flex items-center gap-1">
                    {evt.xau === "Bullish" ? <TrendingUp className="w-4 h-4 text-status-win" /> :
                     evt.xau === "Bearish" ? <TrendingDown className="w-4 h-4 text-status-loss" /> :
                     <AlertTriangle className="w-4 h-4 text-status-warn" />}
                    <span className={`text-xs font-semibold ${evt.xau === "Bullish" ? "text-status-win" : evt.xau === "Bearish" ? "text-status-loss" : "text-status-warn"}`}>{evt.xau}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "High Impact", value: EVENTS.filter(e => e.impact === "HIGH").length.toString(), color: "text-status-loss" },
          { label: "Medium", value: EVENTS.filter(e => e.impact === "MEDIUM").length.toString(), color: "text-status-warn" },
          { label: "Low", value: EVENTS.filter(e => e.impact === "LOW").length.toString(), color: "text-status-info" },
          { label: "This Week", value: EVENTS.length.toString(), color: "text-text-primary" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.35 }}
            className="stat-card"
          >
            <p className="stat-label">{s.label}</p>
            <p className={`stat-value ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
