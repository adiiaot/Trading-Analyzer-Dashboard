"use client";

import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useDashboardData } from "@/lib/data-context";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const impactMap: Record<string, "win" | "loss" | "warn" | "info"> = {
  HIGH: "loss",
  MEDIUM: "warn",
  LOW: "info",
};

export default function EconomicCalendarPage() {
  const { econEvents } = useDashboardData();
  const events = econEvents;
  const highCount = events.filter((e) => e.impact === "HIGH").length;
  const mediumCount = events.filter((e) => e.impact === "MEDIUM").length;
  const lowCount = events.filter((e) => e.impact === "LOW").length;

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5">
      <motion.div variants={item}>
        <h1 className="text-lg md:text-xl font-bold text-text-primary">Economic Calendar</h1>
        <p className="text-sm text-text-muted">Key events & market impact</p>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <motion.div variants={container} initial="hidden" animate="visible" className="space-y-2">
            {events.length > 0 ? events.map((evt, i) => (
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
                  <p className="text-xs text-text-muted mt-0.5">F: {evt.forecast} &middot; P: {evt.prev}</p>
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
            )) : (
              <div className="text-center py-8 text-sm text-text-muted">No economic events loaded. Data will appear when the bot syncs the calendar.</div>
            )}
          </motion.div>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "High Impact", value: highCount.toString(), color: "text-status-loss" },
          { label: "Medium", value: mediumCount.toString(), color: "text-status-warn" },
          { label: "Low", value: lowCount.toString(), color: "text-status-info" },
          { label: "This Week", value: events.length.toString(), color: "text-text-primary" },
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
