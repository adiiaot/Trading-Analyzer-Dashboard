"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const TIMEFRAMES = ["5m", "15m", "1H", "4H", "D"];

function generateChartData(count = 24, basePrice = 4073) {
  return Array.from({ length: count }, (_, i) => {
    const price = basePrice + Math.sin(i * 0.3) * 18 + (Math.random() - 0.5) * 6;
    return {
      time: `${i}h`,
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 4000 + 500),
    };
  });
}

export function TradingChart() {
  const [tf, setTf] = useState("1H");
  const [chartData, setChartData] = useState(() => generateChartData());

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(generateChartData());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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
        <div className="flex gap-1 rounded-lg p-0.5" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
          {TIMEFRAMES.map((t) => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                tf === t
                  ? "text-accent-gold shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
              style={tf === t ? { background: "var(--glass-bg)", border: "1px solid var(--glass-border)" } : {}}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--gold)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--text-muted)" strokeOpacity={0.12} strokeDasharray="4 4" />
            <XAxis dataKey="time" stroke="var(--text-muted)" strokeOpacity={0.5} fontSize={11} tickLine={false} axisLine={false} />
            <YAxis
              domain={["dataMin - 2", "dataMax + 2"]}
              stroke="var(--text-muted)"
              strokeOpacity={0.5}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--glass-bg)",
                backdropFilter: "blur(12px)",
                border: "1px solid var(--glass-border)",
                borderRadius: "12px",
                color: "var(--text-primary)",
                fontSize: "12px",
              }}
              labelStyle={{ color: "var(--text-muted)" }}
            />
            <Area type="monotone" dataKey="price" stroke="var(--gold)" strokeWidth={2} fill="url(#chartGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 h-[60px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid stroke="var(--text-muted)" strokeOpacity={0.08} strokeDasharray="4 4" />
            <Bar dataKey="volume" fill="var(--text-muted)" fillOpacity={0.15} radius={[2, 2, 0, 0]} />
            <Tooltip
              contentStyle={{
                background: "var(--glass-bg)",
                backdropFilter: "blur(12px)",
                border: "1px solid var(--glass-border)",
                borderRadius: "12px",
                color: "var(--text-primary)",
                fontSize: "12px",
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 text-xs" style={{ borderTop: "1px solid var(--glass-border)" }}>
        <span className="flex items-center gap-1.5 text-text-muted">
          <span className="w-5 h-0.5 rounded" style={{ background: "rgba(240, 180, 41, 0.6)" }} /> MA20: $4,068
        </span>
        <span className="flex items-center gap-1.5 text-text-muted">
          <span className="w-5 h-0.5 rounded" style={{ background: "rgba(0, 230, 118, 0.6)" }} /> MA50: $4,055
        </span>
        <span className="flex items-center gap-1.5 text-text-muted">
          <span className="w-5 h-0.5 rounded" style={{ background: "rgba(68, 138, 255, 0.6)" }} /> MA200: $4,010
        </span>
      </div>
    </motion.div>
  );
}
