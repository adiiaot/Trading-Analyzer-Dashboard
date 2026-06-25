"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { subscribeTrades, subscribeSignals, subscribeEconCalendar, calculateStats } from "@/lib/firebase";
import type { Trade, Signal, TradingStats } from "@/types";
import { QUICK_STATS, PRICE, POSITIONS, SIGNALS, SENTIMENT, ACCOUNT, ECON_EVENTS, JOURNAL_ENTRIES } from "@/lib/constants";

interface DashboardData {
  trades: Trade[];
  signals: Signal[];
  stats: TradingStats | null;
  price: typeof PRICE;
  positions: {
    direction: "BUY" | "SELL";
    entry: number;
    current: number;
    pips: number;
    pnl: number | null;
    tp: number;
    sl: number;
  }[];
  sentiment: typeof SENTIMENT;
  account: typeof ACCOUNT;
  signalsFeed: {
    id: number;
    time: string;
    status: "PENDING" | "FILLING" | "CLOSED" | "EXPIRED";
    confidence: number;
    entries: string[];
    pnl: number | null;
  }[];
  quickStats: { todayPnl: number; winRate: number; totalTrades: number; openPositions: number };
  econEvents: typeof ECON_EVENTS;
  journalEntries: typeof JOURNAL_ENTRIES;
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
  econEvents: ECON_EVENTS,
  journalEntries: JOURNAL_ENTRIES,
  loading: true,
};

const DataContext = createContext<DashboardData>(defaultData);

export function useDashboardData() {
  return useContext(DataContext);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [econEvents, setEconEvents] = useState<typeof ECON_EVENTS>([]);
  const [journalEntries, setJournalEntries] = useState<typeof JOURNAL_ENTRIES>([]);
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
    const unsubEcon = subscribeEconCalendar((data) => {
      if (data.length > 0) setEconEvents(data as any);
    });
    return () => {
      unsubTrades();
      unsubSignals();
      unsubEcon();
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
          openPositions: trades.filter((t) => t.status === "open").length,
        }
      : QUICK_STATS,
    econEvents,
    journalEntries: JOURNAL_ENTRIES,
    loading: tradesLoading || signalsLoading,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

function mapTradesToPositions(trades: Trade[]) {
  return trades.filter((t) => t.status === "open").slice(0, 5).map((t) => ({
    direction: (t.trend === "UP" ? "BUY" : "SELL") as "BUY" | "SELL",
    entry: t.entryPrice,
    current: t.entryPrice + (t.pnl ? t.pnl / t.entrySize : 0),
    pips: t.pnl ? parseFloat(((t.pnl / 0.01) * 0.1).toFixed(1)) : 0,
    pnl: t.pnl ?? null,
    tp: t.takeProfit,
    sl: t.stopLoss,
  }));
}

function mapSignalsToFeed(signals: Signal[]) {
  return signals.slice(0, 4).map((s, i) => ({
    id: i + 1,
    time: new Date(s.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
    status: (s.status === "active" ? "PENDING" : s.status === "expired" ? "EXPIRED" : s.status === "closed" ? "CLOSED" : "FILLING") as "PENDING" | "FILLING" | "CLOSED" | "EXPIRED",
    confidence: Math.round(s.confidence * 100),
    entries: (s.entries || []).map((e) => e.price.toFixed(2)),
    pnl: null as number | null,
  }));
}
