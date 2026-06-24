"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const TIMEFRAMES = ["5m", "15m", "1H", "4H", "D"];

const data = Array.from({ length: 24 }, (_, i) => {
  const price = 2035 + Math.sin(i * 0.3) * 15 + (Math.random() - 0.5) * 5;
  return {
    time: `${i}h`,
    price: parseFloat(price.toFixed(2)),
    volume: Math.floor(Math.random() * 4000 + 500),
  };
});

export function TradingChart() {
  const [tf, setTf] = useState("1H");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-text-primary">XAU/USD</h3>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="badge-win font-mono">RSI 68</span>
            <span className="badge-win font-mono">MACD Bullish</span>
          </div>
        </div>
        <div className="flex gap-1 bg-surface-overlay rounded-lg p-0.5">
          {TIMEFRAMES.map((t) => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                tf === t
                  ? "bg-surface-overlay text-accent-gold shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.12} />
                <stop offset="95%" stopColor="var(--gold)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis
              domain={["dataMin - 2", "dataMax + 2"]}
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                color: "var(--text-primary)",
                fontSize: "12px",
              }}
            />
            <Area type="monotone" dataKey="price" stroke="var(--gold)" strokeWidth={2} fill="url(#chartGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 h-[60px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <Bar dataKey="volume" fill="var(--border)" radius={[2, 2, 0, 0]} />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                color: "var(--text-primary)",
                fontSize: "12px",
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-surface-border text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-0.5 rounded bg-accent-gold/60" /> MA20: $2,038
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-0.5 rounded bg-status-win/60" /> MA50: $2,025
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-0.5 rounded bg-status-info/60" /> MA200: $1,998
        </span>
      </div>
    </motion.div>
  );
}
