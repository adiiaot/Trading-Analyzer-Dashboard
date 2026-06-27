"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import {
  subscribeTrades, subscribeSignals, subscribeEconCalendar,
  subscribeJournalEntries, calculateStats,
} from "@/lib/firebase";
import type { Trade, Signal, TradingStats } from "@/types";
import { QUICK_STATS, PRICE, POSITIONS, SIGNALS, SENTIMENT, ACCOUNT } from "@/lib/constants";

interface DashboardData {
  trades: Trade[];
  signals: Signal[];
  stats: TradingStats | null;
  price: typeof PRICE & { high24h: number; low24h: number; volume: number; bid: number; ask: number; spread: number };
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
  balance: number;
  setBalance: (val: number) => void;
  signalsFeed: {
    id: number;
    time: string;
    status: "PENDING" | "FILLING" | "CLOSED" | "EXPIRED";
    confidence: number;
    entries: string[];
    pnl: number | null;
  }[];
  quickStats: { todayPnl: number; winRate: number; totalTrades: number; openPositions: number };
  econEvents: any[];
  journalEntries: any[];
  addJournalEntry: (entry: any) => Promise<void>;
  chartContext: any;
  setChartContext: (data: any) => void;
  loading: boolean;
}

const defaultPrice = { ...PRICE, high24h: PRICE.price + 12, low24h: PRICE.price - 12, volume: 189200, bid: PRICE.price - 0.05, ask: PRICE.price + 0.05, spread: 0.5 };

const defaultData: DashboardData = {
  trades: [],
  signals: [],
  stats: null,
  price: defaultPrice,
  positions: [],
  sentiment: SENTIMENT,
  account: ACCOUNT,
  balance: 5245.50,
  setBalance: () => {},
  signalsFeed: [],
  quickStats: { todayPnl: 0, winRate: 0, totalTrades: 0, openPositions: 0 },
  econEvents: [],
  journalEntries: [],
  addJournalEntry: async () => {},
  chartContext: null,
  setChartContext: () => {},
  loading: true,
};

const DataContext = createContext<DashboardData>(defaultData);

export function useDashboardData() {
  return useContext(DataContext);
}

async function fetchFromApi(url: string) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) return data;
  } catch {}
  return null;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [econEvents, setEconEvents] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [tradesLoading, setTradesLoading] = useState(true);
  const [signalsLoading, setSignalsLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [chartContext, setChartContext] = useState<any>(null);
  const [livePrice, setLivePrice] = useState(defaultPrice);
  const prevPriceRef = useRef(defaultPrice.price);
  const [balance, setBalanceState] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("account_balance");
      return saved ? parseFloat(saved) : 5245.50;
    }
    return 5245.50;
  });

  const setBalance = useCallback((val: number) => {
    setBalanceState(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("account_balance", val.toString());
    }
  }, []);

  const addJournalEntry = useCallback(async (entry: any) => {
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      const data = await res.json();
      if (data.success) {
        setJournalEntries((prev) => [{ ...entry, id: data.id }, ...prev]);
      }
    } catch {
      setJournalEntries((prev) => [{ ...entry, id: Date.now().toString() }, ...prev]);
    }
  }, []);

  // Live price streaming — polls every 3 seconds
  useEffect(() => {
    const fetchPrice = async () => {
      const data = await fetchFromApi("/api/price");
      if (data && data.price) {
        prevPriceRef.current = livePrice.price;
        setLivePrice({
          symbol: "XAU/USD",
          price: data.price,
          change24h: data.change24h ?? data.price - prevPriceRef.current,
          changePercent24h: data.changePercent24h ?? 0,
          high24h: data.high24h ?? data.price + 3,
          low24h: data.low24h ?? data.price - 3,
          volume: data.volume ?? 100000,
          bid: data.bid ?? data.price - 0.05,
          ask: data.ask ?? data.price + 0.05,
          spread: data.spread ?? 0.5,
        });
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let unsubTrades: (() => void) | undefined;
    let unsubSignals: (() => void) | undefined;
    let pollInterval: ReturnType<typeof setInterval> | undefined;

    const init = async () => {
      let tradesSubscribed = false;
      let signalsSubscribed = false;

      unsubTrades = subscribeTrades((data) => {
        setTrades(data);
        setTradesLoading(false);
        tradesSubscribed = true;
      }, () => {
        if (!tradesSubscribed) {
          setUsingFallback(true);
          fetchFromApi("/api/trades?limit=100").then((data) => {
            if (data?.trades?.length > 0) setTrades(data.trades);
            setTradesLoading(false);
          });
        }
      });

      unsubSignals = subscribeSignals((data) => {
        setSignals(data);
        setSignalsLoading(false);
        signalsSubscribed = true;
      }, () => {
        if (!signalsSubscribed) {
          setUsingFallback(true);
          fetchFromApi("/api/signals?limit=50").then((data) => {
            if (data?.signals?.length > 0) setSignals(data.signals);
            setSignalsLoading(false);
          });
        }
      });
    };

    init();

    const unsubEcon = subscribeEconCalendar((data) => {
      if (data.length > 0) setEconEvents(data);
    });
    const unsubJournal = subscribeJournalEntries((data) => {
      if (data.length > 0) setJournalEntries(data);
    });

    return () => {
      unsubTrades?.();
      unsubSignals?.();
      unsubEcon();
      unsubJournal();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  useEffect(() => {
    if (!usingFallback) return;
    const interval = setInterval(async () => {
      const [tradesData, signalsData] = await Promise.all([
        fetchFromApi("/api/trades?limit=100"),
        fetchFromApi("/api/signals?limit=50"),
      ]);
      if (tradesData?.trades) setTrades(tradesData.trades);
      if (signalsData?.signals) setSignals(signalsData.signals);
    }, 30000);
    return () => clearInterval(interval);
  }, [usingFallback]);

  const stats = trades.length > 0 ? calculateStats(trades) : null;

  const value: DashboardData = {
    trades,
    signals,
    stats,
    price: livePrice,
    positions: trades.length > 0 ? mapTradesToPositions(trades) : [],
    sentiment: SENTIMENT,
    account: { ...ACCOUNT, balance },
    balance,
    setBalance,
    signalsFeed: signals.length > 0 ? mapSignalsToFeed(signals) : [],
    quickStats: stats
      ? {
          todayPnl: stats.total_pnl,
          winRate: parseFloat((stats.win_rate * 100).toFixed(1)),
          totalTrades: stats.total_trades,
          openPositions: trades.filter((t) => t.status === "open").length,
        }
      : { todayPnl: 0, winRate: 0, totalTrades: 0, openPositions: 0 },
    econEvents,
    journalEntries,
    addJournalEntry,
    chartContext,
    setChartContext,
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
    time: new Date(s.timestamp).toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true,
    }),
    status: (s.status === "active" ? "PENDING"
      : s.status === "expired" ? "EXPIRED"
      : s.status === "closed" ? "CLOSED" : "FILLING") as "PENDING" | "FILLING" | "CLOSED" | "EXPIRED",
    confidence: Math.round(s.confidence * 100),
    entries: (s.entries || []).map((e) => e.price.toFixed(2)),
    pnl: null as number | null,
  }));
}
