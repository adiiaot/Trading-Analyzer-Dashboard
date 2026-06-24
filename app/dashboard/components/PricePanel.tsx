"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useDashboardData } from "@/lib/data-context";

export function PricePanel() {
  const { price: initialPrice } = useDashboardData();
  const [price, setPrice] = useState(initialPrice.price);
  const [change, setChange] = useState(initialPrice.change24h);
  const [pct, setPct] = useState(initialPrice.changePercent24h);

  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.5) * 0.3;
      setPrice((p) => {
        const next = p + delta;
        setChange((c) => c + delta);
        setPct((c) => c + (delta / p) * 100);
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
            <p className="font-mono text-text-primary font-medium">${initialPrice.high24h.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">24H Low</p>
            <p className="font-mono text-text-primary font-medium">${initialPrice.low24h.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Volume</p>
            <p className="font-mono text-text-primary font-medium">{(initialPrice.volume / 1000).toFixed(0)}K</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Spread</p>
            <p className="font-mono text-text-primary font-medium">${initialPrice.spread.toFixed(1)}</p>
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
