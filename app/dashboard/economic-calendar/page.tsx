"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useDashboardData } from "@/lib/data-context";
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign } from "lucide-react";

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

const XAU_KEYWORDS = ["gold", "xau", "gdp", "pce", "cpi", "fed", "fomc", "nfp", "employment",
  "jobless", "inflation", "nonfarm", "treasury", "dollar", "usd", "durable",
  "consumer", "retail", "manufacturing", "ism", "chicago", "philly fed",
  "housing", "home sales", "gdp", "central bank", "interest rate"];

const DEFAULT_XAU_EVENTS = [
  { date: "2026-06-26", time: "8:30 AM", event: "Core PCE Price Index m/m", forecast: "0.3%", prev: "0.2%", impact: "HIGH", xau: "Bullish", reason: "Key inflation gauge, directly affects gold" },
  { date: "2026-06-26", time: "9:45 AM", event: "Chicago PMI", forecast: "49.5", prev: "48.2", impact: "MEDIUM", xau: "Neutral", reason: "Manufacturing health indicator" },
  { date: "2026-06-25", time: "8:30 AM", event: "Unemployment Claims", forecast: "235K", prev: "242K", impact: "HIGH", xau: "Bearish", reason: "Labor market health affects USD" },
  { date: "2026-06-25", time: "10:00 AM", event: "Fed Chair Powell Speech", forecast: "-", prev: "-", impact: "HIGH", xau: "Bullish", reason: "Direct monetary policy guidance" },
  { date: "2026-06-27", time: "2:00 PM", event: "US Treasury Yield 10yr", forecast: "4.35%", prev: "4.28%", impact: "MEDIUM", xau: "Bearish", reason: "Rising yields pressure gold" },
];

export default function EconomicCalendarPage() {
  const { econEvents } = useDashboardData();

  const allEvents = useMemo(() => {
    const firestoreEvents = econEvents.filter((e: any) =>
      XAU_KEYWORDS.some((k) => e.event?.toLowerCase().includes(k))
    );
    if (firestoreEvents.length > 0) return firestoreEvents;
    return DEFAULT_XAU_EVENTS;
  }, [econEvents]);

  const highCount = allEvents.filter((e: any) => e.impact === "HIGH").length;
  const mediumCount = allEvents.filter((e: any) => e.impact === "MEDIUM").length;
  const lowCount = allEvents.filter((e: any) => e.impact === "LOW").length;

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5">
      <motion.div variants={item}>
        <h1 className="text-lg md:text-xl font-bold text-text-primary">Economic Calendar</h1>
        <p className="text-sm text-text-muted">XAU/USD-relevant events & market impact</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "High Impact", value: highCount.toString(), color: "text-status-loss" },
          { label: "Medium", value: mediumCount.toString(), color: "text-status-warn" },
          { label: "Low", value: lowCount.toString(), color: "text-status-info" },
          { label: "This Week", value: allEvents.length.toString(), color: "text-text-primary" },
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

      <motion.div variants={item}>
        <Card>
          <motion.div variants={container} initial="hidden" animate="visible" className="space-y-2">
            {allEvents.length > 0 ? allEvents.map((evt: any, i: number) => (
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
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                    <p className="text-sm font-semibold text-text-primary">{evt.event}</p>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">F: {evt.forecast} &middot; P: {evt.prev}</p>
                  {evt.reason && <p className="text-xs text-text-muted/60 mt-0.5">{evt.reason}</p>}
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
              <div className="text-center py-8 text-sm text-text-muted">No XAU-relevant events this week.</div>
            )}
          </motion.div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
