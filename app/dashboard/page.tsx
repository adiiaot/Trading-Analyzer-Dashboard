'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trade, TradingStats } from '@/types';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { WinLossDistribution } from '@/components/dashboard/WinLossDistribution';
import { MonthlyPerformance } from '@/components/dashboard/MonthlyPerformance';
import { RecentTrades } from '@/components/dashboard/RecentTrades';
import { KeyInsights } from '@/components/dashboard/KeyInsights';
import { Spinner } from '@/components/ui/Spinner';

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<TradingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tradesRes, statsRes] = await Promise.all([
          fetch('/api/trades?limit=200'),
          fetch('/api/stats'),
        ]);

        const tradesData = await tradesRes.json();
        const statsData = await statsRes.json();

        setTrades(tradesData.trades || []);
        setStats(statsData.stats);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return <Spinner />;

  const currentCapital = 10 + (stats?.total_pnl || 0);

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-h1 text-text-primary">Dashboard</h1>
            <p className="text-text-secondary text-body">Real-time trading metrics & performance</p>
          </motion.div>

          {/* Row 1: 6 KPI Cards */}
          {stats && <StatsCards stats={stats} currentCapital={currentCapital} />}

          {/* Row 2: Performance Chart */}
          {trades.length > 0 && <PerformanceChart trades={trades} />}

          {/* Row 3: Win/Loss Distribution + Monthly Performance */}
          {stats && trades.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WinLossDistribution stats={stats} />
              <MonthlyPerformance trades={trades} />
            </div>
          )}

          {/* Row 4: Recent Trades */}
          {trades.length > 0 && <RecentTrades trades={trades} />}

          {/* Row 5: Key Insights */}
          {stats && <KeyInsights stats={stats} />}
        </main>
      </div>
    </div>
  );
}
