"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown } from "lucide-react";

const TIMEFRAMES = ["5m", "15m", "1H", "4H", "1D", "1W"];
const intervalMap: Record<string, string> = {
  "5m": "5", "15m": "15", "1H": "60", "4H": "240", "1D": "D", "1W": "W",
};

interface PriceSnapshot {
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  bid: number;
  ask: number;
}

function buildWidget(containerId: string, interval: string) {
  return new window.TradingView.widget({
    container_id: containerId,
    symbol: "OANDA:XAUUSD",
    interval,
    timezone: "Africa/Lagos",
    theme: "dark",
    style: "1",
    locale: "en",
    toolbar_bg: "#080c24",
    enable_publishing: false,
    hide_side_toolbar: true,
    allow_symbol_change: false,
    hideideas: true,
    show_popup_button: false,
    studies: ["RSI@tv-basicstudies", "MASimple@tv-basicstudies"],
    studies_overrides: { "MASimple.length": 20 },
    overrides: {
      "paneProperties.background": "#080c24",
      "paneProperties.backgroundType": "solid",
      "paneProperties.vertGridProperties.color": "rgba(255,255,255,0.04)",
      "paneProperties.horzGridProperties.color": "rgba(255,255,255,0.04)",
      "paneProperties.crossHairProperties.color": "rgba(240,180,41,0.5)",
      "scalesProperties.textColor": "rgba(255,255,255,0.6)",
      "scalesProperties.lineColor": "rgba(255,255,255,0.08)",
    },
    autosize: true,
    loading_screen: { backgroundColor: "#080c24" },
  });
}

export function TradingChart() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [tf, setTf] = useState("1H");
  const [ready, setReady] = useState(false);
  const [price, setPrice] = useState<PriceSnapshot | null>(null);
  const [pulse, setPulse] = useState(false);

  // Fetch live price
  useEffect(() => {
    const tick = async () => {
      try {
        const res = await fetch("/api/price");
        const data = await res.json();
        if (data?.success && data.price) {
          setPrice({
            price: data.price,
            change24h: data.change24h ?? 0,
            changePercent24h: data.changePercent24h ?? 0,
            high24h: data.high24h ?? data.price + 3,
            low24h: data.low24h ?? data.price - 3,
            bid: data.bid ?? data.price - 0.05,
            ask: data.ask ?? data.price + 0.05,
          });
          setPulse(true);
          setTimeout(() => setPulse(false), 200);
        }
      } catch {}
    };
    tick();
    const interval = setInterval(tick, 3000);
    return () => clearInterval(interval);
  }, []);

  // Init TradingView widget
  useEffect(() => {
    if (!containerRef.current || widgetRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (!containerRef.current || !window.TradingView) return;
      widgetRef.current = buildWidget(containerRef.current.id, intervalMap[tf]);
      widgetRef.current.onChartReady(() => setReady(true));
    };
    document.body.appendChild(script);

    return () => {
      if (widgetRef.current) {
        try { widgetRef.current.remove(); } catch {}
        widgetRef.current = null;
      }
    };
  }, []);

  const changeTimeframe = (newTf: string) => {
    setTf(newTf);
    setReady(false);
    if (widgetRef.current) {
      try { widgetRef.current.remove(); } catch {}
      widgetRef.current = null;
    }
    setTimeout(() => {
      if (!containerRef.current || !window.TradingView) return;
      widgetRef.current = buildWidget(containerRef.current.id, intervalMap[newTf]);
      widgetRef.current.onChartReady(() => setReady(true));
    }, 100);
  };

  const handleAnalyze = () => {
    const summary = {
      timeframe: tf,
      currentPrice: price?.price ?? 0,
      source: "TradingView OANDA:XAUUSD",
    };
    router.push(`/dashboard/learning?chart=${encodeURIComponent(JSON.stringify(summary))}`);
  };

  const showPrice = price !== null;
  const up = showPrice && price.change24h >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      {/* Header: Price + controls */}
      <div className="flex flex-col gap-2 px-4 sm:px-5 pt-4 pb-3">
        {/* Top row: Symbol + price + high/low */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm sm:text-base font-bold text-text-primary">XAU/USD</h3>
            <span className="badge-gold text-[10px]">Gold</span>
          </div>
          {showPrice && (
            <span className={`flex items-center gap-1 text-[10px] font-mono ${up ? "text-status-win" : "text-status-loss"}`}>
              {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {up ? "+" : ""}{price.change24h.toFixed(2)} ({up ? "+" : ""}{price.changePercent24h.toFixed(2)}%)
            </span>
          )}
          {showPrice && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted ml-auto sm:ml-0">
              <span>H: ${price.high24h.toFixed(2)}</span>
              <span>L: ${price.low24h.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Price row */}
        <div className="flex flex-wrap items-center gap-3">
          {showPrice ? (
            <>
              <motion.span
                key={price.price.toFixed(2)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-2xl sm:text-3xl font-bold font-mono ${up ? "text-status-win" : "text-status-loss"}`}
              >
                ${price.price.toFixed(2)}
              </motion.span>
              {pulse && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-ping" />
              )}
              <span className="text-[10px] sm:text-[11px] text-text-muted font-mono">
                B: ${price.bid.toFixed(2)} A: ${price.ask.toFixed(2)}
              </span>
            </>
          ) : (
            <div className="h-7 sm:h-8 w-32 sm:w-36 rounded bg-glass animate-pulse" />
          )}

          {/* Actions: pull right on desktop */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <button
              onClick={handleAnalyze}
              className="px-2.5 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-medium text-accent-gold transition-all whitespace-nowrap"
              style={{ background: "var(--glass-bg)", border: "1px solid rgba(240, 180, 41, 0.3)" }}
            >
              Analyze
            </button>
            <div className="flex gap-1 rounded-lg p-0.5" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
              {TIMEFRAMES.map((t) => (
                <button
                  key={t}
                  onClick={() => changeTimeframe(t)}
                  className={`px-1.5 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-medium transition-all ${
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
      </div>

      {/* Chart */}
      <div className="px-0">
        <div
          ref={containerRef}
          id="tv-chart-container"
          className="h-[320px] sm:h-[420px] md:h-[480px] lg:h-[520px] w-full"
          style={{ background: "#080c24" }}
        />
      </div>

      {/* Bottom bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 justify-between px-4 sm:px-5 py-2.5 text-[10px] sm:text-[11px]" style={{ borderTop: "1px solid var(--glass-border)" }}>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 ${ready ? "text-status-win" : "text-status-warn"}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${ready ? "bg-status-win" : "bg-status-warn"}`} />
            {ready ? "Live" : "Connecting..."}
          </span>
          <span className="text-text-muted hidden sm:inline">OANDA:XAUUSD</span>
        </div>
        <div className="flex items-center gap-3 text-text-muted">
          <span>RSI</span>
          <span className="w-px h-3" style={{ background: "var(--glass-border)" }} />
          <span>SMA(20)</span>
        </div>
      </div>
    </motion.div>
  );
}

declare global {
  interface Window {
    TradingView: any;
  }
}
