"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { subscribeTrades, subscribeSignals, calculateStats } from "@/lib/firebase";
import type { Trade, Signal, TradingStats } from "@/types";
import { QUICK_STATS, PRICE, POSITIONS, SIGNALS, SENTIMENT, ACCOUNT } from "@/lib/constants";

interface DashboardData {
  trades: Trade[];
  signals: Signal[];
  stats: TradingStats | null;
  price: typeof PRICE;
  positions: typeof POSITIONS;
  sentiment: typeof SENTIMENT;
  account: typeof ACCOUNT;
  signalsFeed: typeof SIGNALS;
  quickStats: typeof QUICK_STATS;
  loading: boolean;
}

const defaultData: DashboardData = {
  trades: [],
  signals: [],
  stats: null,
  price: PRICE,
  positions: POSITIONS,
  sentiment: SENTIMENT,
  account: ACCOUNT,
  signalsFeed: SIGNALS,
  quickStats: QUICK_STATS,
  loading: true,
};

const DataContext = createContext<DashboardData>(defaultData);

export function useDashboardData() {
  return useContext(DataContext);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [tradesLoading, setTradesLoading] = useState(true);
  const [signalsLoading, setSignalsLoading] = useState(true);

  useEffect(() => {
    const unsubTrades = subscribeTrades((data) => {
      setTrades(data);
      setTradesLoading(false);
    });
    const unsubSignals = subscribeSignals((data) => {
      setSignals(data);
      setSignalsLoading(false);
    });
    return () => {
      unsubTrades();
      unsubSignals();
    };
  }, []);

  const stats = trades.length > 0 ? calculateStats(trades) : null;

  const value: DashboardData = {
    trades,
    signals,
    stats,
    price: PRICE,
    positions: trades.length > 0 ? mapTradesToPositions(trades) : POSITIONS,
    sentiment: SENTIMENT,
    account: ACCOUNT,
    signalsFeed: (signals.length > 0 ? mapSignalsToFeed(signals) : SIGNALS) as typeof SIGNALS,
    quickStats: stats
      ? {
          todayPnl: stats.total_pnl,
          winRate: parseFloat((stats.win_rate * 100).toFixed(1)),
          totalTrades: stats.total_trades,
          openPositions: trades.filter((t) => t.result === "loss").length,
        }
      : QUICK_STATS,
    loading: tradesLoading || signalsLoading,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

function mapTradesToPositions(trades: Trade[]) {
  return trades.slice(0, 5).map((t) => ({
    direction: t.pnl >= 0 ? ("BUY" as const) : ("SELL" as const),
    entry: t.entry_price,
    current: t.exit_price,
    pips: parseFloat((((t.exit_price - t.entry_price) / 0.01) * 0.1).toFixed(1)),
    pnl: t.pnl,
    tp: t.entry_price + (t.pnl >= 0 ? 5 : -5),
    sl: t.entry_price - (t.pnl >= 0 ? 5 : -5),
  }));
}

function mapSignalsToFeed(signals: Signal[]) {
  return signals.slice(0, 4).map((s, i) => ({
    id: parseInt(s.id.replace(/\D/g, "")) || i + 1,
    time: new Date(s.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
    status: (s.executed ? "CLOSED" : s.trend === "UP" ? "PENDING" : "FILLING") as "PENDING" | "FILLING" | "CLOSED" | "EXPIRED",
    confidence: Math.round(s.confidence * 100),
    entries: s.entries.map((e) => e.price.toFixed(2)),
    pnl: null as number | null,
  }));
}
