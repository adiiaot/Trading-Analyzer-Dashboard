"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

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

export function PricePanel() {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPrice = async () => {
    try {
      const res = await fetch("/api/price");
      const data = await res.json();
      if (data.success) {
        setPriceData(data);
        setError(false);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 text-text-muted">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading price...</span>
        </div>
      </div>
    );
  }

  const price = priceData?.price ?? 2335;
  const change = priceData?.change24h ?? 0;
  const pct = priceData?.changePercent24h ?? 0;
  const up = change >= 0;

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
            <div className="flex items-baseline gap-3">
              <motion.p
                key={price.toFixed(2)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-4xl font-bold font-mono ${up ? "text-status-win" : "text-status-loss"}`}
              >
                ${price.toFixed(2)}
              </motion.p>
              <div className={`flex items-center gap-1.5 ${up ? "text-status-win" : "text-status-loss"}`}>
                {up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-sm font-mono font-semibold">
                  {up ? "+" : ""}{change.toFixed(2)} ({up ? "+" : ""}{pct.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-5 text-sm">
          <div>
            <p className="text-xs text-text-muted">24H High</p>
            <p className="font-mono text-text-primary font-medium">${(priceData?.high24h ?? 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">24H Low</p>
            <p className="font-mono text-text-primary font-medium">${(priceData?.low24h ?? 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Volume</p>
            <p className="font-mono text-text-primary font-medium">{((priceData?.volume ?? 0) / 1000).toFixed(0)}K</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Spread</p>
            <p className="font-mono text-text-primary font-medium">${(priceData?.spread ?? 0).toFixed(1)}</p>
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
    </motion.div>
  );
}
