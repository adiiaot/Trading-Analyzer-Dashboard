"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume: number;
  bid: number;
  ask: number;
  spread: number;
}

async function fetchPrice(): Promise<PriceData | null> {
  try {
    const res = await fetch("/api/price");
    const data = await res.json();
    if (data?.success && data.price) {
      return {
        symbol: data.symbol ?? "XAU/USD",
        price: data.price,
        change24h: data.change24h ?? 0,
        changePercent24h: data.changePercent24h ?? 0,
        high24h: data.high24h ?? data.price + 3,
        low24h: data.low24h ?? data.price - 3,
        volume: data.volume ?? 100000,
        bid: data.bid ?? data.price - 0.05,
        ask: data.ask ?? data.price + 0.05,
        spread: data.spread ?? 0.5,
      };
    }
  } catch {}
  return null;
}

export function PricePanel() {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const tick = async () => {
      const data = await fetchPrice();
      if (data) {
        setPriceData(data);
        setPulse(true);
        setTimeout(() => setPulse(false), 200);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!priceData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h2 className="text-lg font-bold text-text-primary">XAU/USD</h2>
                <span className="badge-gold text-[10px]">Gold</span>
              </div>
              <div className="h-10 w-48 rounded bg-[var(--glass-bg)] animate-pulse mt-1" />
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px] text-text-muted">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-status-warn" />
          Loading...
        </div>
      </motion.div>
    );
  }

  const up = priceData.change24h >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h2 className="text-lg font-bold text-text-primary">XAU/USD</h2>
              <span className="badge-gold text-[10px]">Gold</span>
              <span className="text-[10px] text-text-muted font-mono">
                B: ${priceData.bid.toFixed(2)} A: ${priceData.ask.toFixed(2)}
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="relative">
                <motion.p
                  key={priceData.price.toFixed(2)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-4xl font-bold font-mono ${up ? "text-status-win" : "text-status-loss"}`}
                >
                  ${priceData.price.toFixed(2)}
                </motion.p>
                {pulse && (
                  <span
                    className="absolute -right-3 top-0 w-2 h-2 rounded-full animate-ping"
                    style={{ background: "var(--accent-gold)" }}
                  />
                )}
              </div>
              <div className={`flex items-center gap-1.5 ${up ? "text-status-win" : "text-status-loss"}`}>
                {up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-sm font-mono font-semibold">
                  {up ? "+" : ""}{priceData.change24h.toFixed(2)} ({up ? "+" : ""}{priceData.changePercent24h.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-5 text-sm">
          <div>
            <p className="text-xs text-text-muted">24H High</p>
            <p className="font-mono text-text-primary font-medium">${priceData.high24h.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">24H Low</p>
            <p className="font-mono text-text-primary font-medium">${priceData.low24h.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Volume</p>
            <p className="font-mono text-text-primary font-medium">{(priceData.volume / 1000).toFixed(0)}K</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Spread</p>
            <p className="font-mono text-text-primary font-medium">${priceData.spread.toFixed(1)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 h-12 opacity-50">
        <svg width="100%" height="48" viewBox="0 0 400 48">
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={up ? "var(--profit)" : "var(--loss)"} stopOpacity={0.2} />
              <stop offset="100%" stopColor={up ? "var(--profit)" : "var(--loss)"} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path
            d="M0,38 Q25,34 50,36 T100,30 T150,26 T200,28 T250,22 T300,18 T350,15 T400,12"
            stroke={up ? "var(--profit)" : "var(--loss)"}
            strokeWidth={2}
            fill="url(#sparkGrad)"
          />
        </svg>
      </div>

      <div className="mt-2 flex items-center gap-2 text-[10px] text-text-muted">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            background: pulse ? "var(--status-win)" : "var(--text-muted)",
            transition: "background 0.15s",
          }}
        />
        {pulse ? "Updating..." : "Live"}
      </div>
    </motion.div>
  );
}
