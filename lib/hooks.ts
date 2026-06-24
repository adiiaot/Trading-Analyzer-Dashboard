import { useState, useEffect } from 'react';
import { subscribeTrades, subscribeSignals, calculateStats } from './firebase';
import type { Trade, Signal, TradingStats } from '@/types';

export function useRealtimeTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeTrades((data) => {
      setTrades(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { trades, loading, error };
}

export function useRealtimeSignals() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeSignals((data) => {
      setSignals(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { signals, loading, error };
}

export function useRealtimeStats() {
  const { trades, loading } = useRealtimeTrades();
  const [stats, setStats] = useState<TradingStats | null>(null);

  useEffect(() => {
    if (trades.length > 0) {
      setStats(calculateStats(trades));
    }
  }, [trades]);

  return { stats, loading };
}
