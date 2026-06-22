'use client';

import React, { useEffect, useState } from 'react';
import { Trade } from '@/types';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { TradeTable } from '@/components/trades/TradeTable';
import { TradeFilters } from '@/components/trades/TradeFilters';
import { Spinner } from '@/components/ui/Spinner';

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/trades?limit=200');
        const data = await res.json();
        setTrades(data.trades || []);
        setFilteredTrades(data.trades || []);
      } catch (error) {
        console.error('Error fetching trades:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (filters: { result?: string; dateFrom?: string; dateTo?: string }) => {
    let filtered = [...trades];

    if (filters.result) {
      filtered = filtered.filter(t => t.result === filters.result);
    }
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      filtered = filtered.filter(t => new Date(t.timestamp).getTime() >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime();
      filtered = filtered.filter(t => new Date(t.timestamp).getTime() <= to);
    }

    setFilteredTrades(filtered);
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h1 className="text-h1 text-text-primary">Trade Logs</h1>
            <p className="text-text-secondary text-body">Complete history of all trades</p>
          </div>

          <TradeFilters onFilterChange={handleFilterChange} />
          <TradeTable trades={filteredTrades} />
        </main>
      </div>
    </div>
  );
}
