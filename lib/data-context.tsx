"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import {
  subscribeTrades, subscribeSignals, calculateStats,
} from "@/lib/firebase";
import type { Trade, Signal, TradingStats, JournalEntry } from "@/types";
import { PRICE } from "@/lib/constants";

interface Position {
  direction: "BUY" | "SELL";
  entry: number;
  current: number;
  pips: number;
  pnl: number | null;
  tp: number;
  sl: number;
}

interface DashboardData {
  trades: Trade[];
  signals: Signal[];
  stats: TradingStats | null;
  price: typeof PRICE & { high24h: number; low24h: number; volume: number; bid: number; ask: number; spread: number };
  balance: number;
  setBalance: (val: number) => void;
  positions: Position[];
  signalsFeed: {
    id: number;
    time: string;
    status: "PENDING" | "FILLING" | "CLOSED" | "EXPIRED";
    confidence: number;
    entries: string[];
    pnl: number | null;
  }[];
  quickStats: { todayPnl: number; winRate: number; totalTrades: number; openPositions: number };
  loading: boolean;
  journalEntries: JournalEntry[];
}

const defaultPrice = { ...PRICE, high24h: PRICE.price + 12, low24h: PRICE.price - 12, volume: 189200, bid: PRICE.price - 0.05, ask: PRICE.price + 0.05, spread: 0.5 };

const defaultData: DashboardData = {
  trades: [], signals: [], stats: null, price: defaultPrice,
  balance: 0, setBalance: () => {},
  positions: [],
  signalsFeed: [], quickStats: { todayPnl: 0, winRate: 0, totalTrades: 0, openPositions: 0 },
  loading: true,
  journalEntries: [],
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
  const [tradesLoading, setTradesLoading] = useState(true);
  const [signalsLoading, setSignalsLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [livePrice, setLivePrice] = useState(defaultPrice);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
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

  // Live price — poll every 10 seconds
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
    const interval = setInterval(fetchPrice, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let unsubTrades: (() => void) | undefined;
    let unsubSignals: (() => void) | undefined;

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

    return () => {
      unsubTrades?.();
      unsubSignals?.();
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

  // Journal entries — poll every 60s
  useEffect(() => {
    const fetchJournal = async () => {
      const data = await fetchFromApi("/api/journal");
      if (data?.entries) setJournalEntries(data.entries);
    };
    fetchJournal();
    const interval = setInterval(fetchJournal, 60000);
    return () => clearInterval(interval);
  }, []);

  const stats = trades.length > 0 ? calculateStats(trades) : null;

  const value: DashboardData = {
    trades, signals, stats, price: livePrice,
    balance, setBalance,
    positions: trades.filter(t => t.status === 'open').map(t => ({
      direction: t.trend === 'UP' ? 'BUY' as const : 'SELL' as const,
      entry: t.entryPrice,
      current: livePrice.price,
      pips: t.trend === 'UP' ? (livePrice.price - t.entryPrice) * 10 : (t.entryPrice - livePrice.price) * 10,
      pnl: t.pnl ?? null,
      tp: t.takeProfit,
      sl: t.stopLoss,
    })),
    signalsFeed: signals.length > 0 ? mapSignalsToFeed(signals) : [],
    quickStats: stats
      ? {
          todayPnl: stats.total_pnl,
          winRate: parseFloat((stats.win_rate * 100).toFixed(1)),
          totalTrades: stats.total_trades,
          openPositions: trades.filter((t) => t.status === "open").length,
        }
      : { todayPnl: 0, winRate: 0, totalTrades: 0, openPositions: 0 },
    loading: tradesLoading || signalsLoading,
    journalEntries,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
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
    entries: (s.entries || []).map((e) => e?.price?.toFixed(2) ?? '0'),
    pnl: null as number | null,
  }));
}
