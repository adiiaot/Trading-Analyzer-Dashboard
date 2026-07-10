"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const TIMEFRAMES = ["5m", "15m", "1H", "4H", "1D", "1W"];

export function TradingChart() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [tf, setTf] = useState("1H");
  const [ready, setReady] = useState(false);

  // Map our timeframe labels to TradingView intervals
  const intervalMap: Record<string, string> = {
    "5m": "5",
    "15m": "15",
    "1H": "60",
    "4H": "240",
    "1D": "D",
    "1W": "W",
  };

  useEffect(() => {
    if (!containerRef.current || widgetRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (!containerRef.current || !window.TradingView) return;

      widgetRef.current = new window.TradingView.widget({
        container_id: containerRef.current.id,
        symbol: "OANDA:XAUUSD",
        interval: intervalMap[tf] || "60",
        timezone: "Africa/Lagos",
        theme: "dark",
        style: "1", // Candles
        locale: "en",
        toolbar_bg: "#080c24",
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: false,
        hideideas: true,
        show_popup_button: false,
        studies: ["RSI@tv-basicstudies", "MASimple@tv-basicstudies"],
        studies_overrides: {
          "MASimple.length": 20,
        },
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

  // Change timeframe on the widget without reloading
  const changeTimeframe = (newTf: string) => {
    setTf(newTf);
    if (widgetRef.current?.chart) {
      widgetRef.current.chart.setChartType(1); // candles
    }
    // Reload widget with new timeframe (TV SDK limitation)
    if (widgetRef.current) {
      try { widgetRef.current.remove(); } catch {}
      widgetRef.current = null;
    }
    setReady(false);
    // Small delay to let DOM settle before re-init
    setTimeout(() => {
      if (!containerRef.current || !window.TradingView) return;
      widgetRef.current = new window.TradingView.widget({
        container_id: containerRef.current.id,
        symbol: "OANDA:XAUUSD",
        interval: intervalMap[newTf] || "60",
        timezone: "Africa/Lagos",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#080c24",
        enable_publishing: false,
        hide_side_toolbar: false,
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
      widgetRef.current.onChartReady(() => setReady(true));
    }, 100);
  };

  const handleAnalyze = async () => {
    // Fetch recent price data for the AI analysis payload
    let price = 4088;
    try {
      const res = await fetch("/api/price");
      const data = await res.json();
      if (data?.price) price = data.price;
    } catch {}
    const summary = {
      timeframe: tf,
      currentPrice: price,
      source: "TradingView OANDA:XAUUSD",
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
          <span className="text-[10px] badge-gold">TradingView</span>
          <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${ready ? "bg-status-win" : "bg-status-warn"}`} />
            {ready ? "Live" : "Loading..."}
          </span>
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
                onClick={() => changeTimeframe(t)}
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

      <div
        ref={containerRef}
        id="tv-chart-container"
        className="h-[400px] rounded-lg overflow-hidden"
        style={{ background: "#080c24" }}
      />
    </motion.div>
  );
}

// Type declaration for the TradingView global
declare global {
  interface Window {
    TradingView: any;
  }
}
