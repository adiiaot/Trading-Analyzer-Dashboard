"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ComposedChart,
} from "recharts";

const TIMEFRAMES = ["5m", "15m", "1H", "4H", "D"];

function generateOHLC(count = 30, basePrice = 4073) {
  let prevClose = basePrice;
  return Array.from({ length: count }, (_, i) => {
    const open = prevClose + (Math.random() - 0.5) * 4;
    const close = open + (Math.random() - 0.5) * 6;
    const high = Math.max(open, close) + Math.random() * 3;
    const low = Math.min(open, close) - Math.random() * 3;
    const isUp = close >= open;
    prevClose = close;
    return {
      time: `${i}h`,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 4000 + 500),
      isUp,
    };
  });
}

function Candlestick({ x, y, width, height, payload }: any) {
  const { open, close, high, low } = payload;
  const isUp = close >= open;
  const color = isUp ? "var(--profit)" : "var(--loss)";
  const scaleMin = payload._chartMin;
  const scaleMax = payload._chartMax;
  const range = scaleMax - scaleMin || 1;

  const toY = (val: number) => {
    const ratio = (val - scaleMin) / range;
    return y + height - ratio * height;
  };

  const cx = x + width / 2;
  const wickTop = toY(high);
  const wickBottom = toY(low);
  const bodyTop = toY(Math.max(open, close));
  const bodyBottom = toY(Math.min(open, close));
  const bodyW = Math.max(width * 0.6, 2);

  return (
    <g>
      <line x1={cx} y1={wickTop} x2={cx} y2={wickBottom} stroke={color} strokeWidth={1.2} />
      <rect
        x={cx - bodyW / 2}
        y={bodyTop}
        width={bodyW}
        height={Math.max(bodyBottom - bodyTop, 1)}
        fill={color}
        stroke={color}
        strokeWidth={0.5}
        rx={1}
      />
    </g>
  );
}

export function TradingChart() {
  const router = useRouter();
  const [tf, setTf] = useState("1H");
  const [chartData, setChartData] = useState(() => generateOHLC());

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(generateOHLC());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const chartMin = useMemo(() => Math.min(...chartData.map(d => d.low)) - 2, [chartData]);
  const chartMax = useMemo(() => Math.max(...chartData.map(d => d.high)) + 2, [chartData]);

  const dataWithBounds = chartData.map(d => ({
    ...d,
    _chartMin: chartMin,
    _chartMax: chartMax,
  }));

  const lastCandle = chartData[chartData.length - 1];

  const handleAnalyze = () => {
    const summary = {
      timeframe: tf,
      candles: chartData.slice(-12),
      currentPrice: lastCandle?.close,
      high24h: Math.max(...chartData.map(d => d.high)),
      low24h: Math.min(...chartData.map(d => d.low)),
      volume24h: chartData.reduce((s, d) => s + d.volume, 0),
    };
    const encoded = encodeURIComponent(JSON.stringify(summary));
    router.push(`/dashboard/learning?chart=${encoded}`);
  };

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
        <div className="flex items-center gap-2">
          <button
            onClick={handleAnalyze}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-accent-gold transition-all"
            style={{ background: "var(--glass-bg)", border: "1px solid rgba(240, 180, 41, 0.3)" }}
          >
            Analyze with AI
          </button>
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
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dataWithBounds} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--text-muted)" strokeOpacity={0.12} strokeDasharray="4 4" />
            <XAxis
              dataKey="time"
              stroke="var(--text-primary)"
              strokeOpacity={0.6}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[chartMin, chartMax]}
              stroke="var(--text-primary)"
              strokeOpacity={0.6}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div style={{
                    background: "var(--glass-bg)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    color: "var(--text-primary)",
                    fontSize: "12px",
                  }}>
                    <p style={{ color: "var(--text-muted)", marginBottom: 4 }}>{d.time}</p>
                    <p>O: <span style={{ fontFamily: "monospace" }}>${d.open.toFixed(2)}</span></p>
                    <p>H: <span style={{ fontFamily: "monospace" }}>${d.high.toFixed(2)}</span></p>
                    <p>L: <span style={{ fontFamily: "monospace" }}>${d.low.toFixed(2)}</span></p>
                    <p>C: <span style={{ fontFamily: "monospace", color: d.isUp ? "var(--profit)" : "var(--loss)" }}>${d.close.toFixed(2)}</span></p>
                  </div>
                );
              }}
            />
            <Bar dataKey="high" shape={<Candlestick />}>
              {dataWithBounds.map((entry, idx) => (
                <Cell key={idx} fill={entry.isUp ? "var(--profit)" : "var(--loss)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 h-[60px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid stroke="var(--text-muted)" strokeOpacity={0.08} strokeDasharray="4 4" />
            <Bar dataKey="volume" stroke="none" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.isUp ? "rgba(0, 230, 118, 0.25)" : "rgba(255, 82, 82, 0.25)"} />
              ))}
            </Bar>
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
