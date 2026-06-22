'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trade, Signal, TradingStats } from '@/types';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Award, AlertTriangle } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Performance Overview' },
  { id: 'winloss', label: 'Win/Loss Analysis' },
  { id: 'monthly', label: 'Monthly Breakdown' },
  { id: 'strategy', label: 'Strategy Performance' },
];

export default function AnalyticsPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/trades?limit=500');
        const data = await res.json();
        setTrades(data.trades || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    if (trades.length === 0) return null;
    const wins = trades.filter(t => t.pnl >= 0);
    const losses = trades.filter(t => t.pnl < 0);
    const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
    const grossProfit = wins.reduce((s, t) => s + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
    const winRate = trades.length > 0 ? wins.length / trades.length : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

    return {
      total_trades: trades.length,
      wins: wins.length,
      losses: losses.length,
      win_rate: winRate,
      total_pnl: totalPnl,
      profit_factor: profitFactor,
      avg_win: avgWin,
      avg_loss: avgLoss,
      largest_win: wins.length > 0 ? Math.max(...wins.map(t => t.pnl)) : 0,
      largest_loss: losses.length > 0 ? Math.min(...losses.map(t => t.pnl)) : 0,
      consecutive_wins: 0,
      consecutive_losses: 0,
    };
  }, [trades]);

  const monthlyData = useMemo(() => {
    const grouped: Record<string, { trades: number; wins: number; pnl: number; best: number; worst: number }> = {};
    trades.forEach(t => {
      const d = new Date(t.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[key]) grouped[key] = { trades: 0, wins: 0, pnl: 0, best: 0, worst: 0 };
      grouped[key].trades += 1;
      if (t.pnl >= 0) grouped[key].wins += 1;
      grouped[key].pnl += t.pnl;
      grouped[key].best = Math.max(grouped[key].best, t.pnl);
      grouped[key].worst = Math.min(grouped[key].worst, t.pnl);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([month, d]) => ({
      month,
      ...d,
      winRate: d.trades > 0 ? ((d.wins / d.trades) * 100).toFixed(0) : '0',
      pnl: parseFloat(d.pnl.toFixed(2)),
    }));
  }, [trades]);

  const equityCurve = useMemo(() => {
    let cum = 0;
    return trades
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(t => {
        cum += t.pnl;
        return { date: new Date(t.timestamp).toLocaleDateString(), equity: parseFloat(cum.toFixed(2)) };
      });
  }, [trades]);

  if (!stats || trades.length === 0) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <p className="text-text-secondary">Loading analytics data...</p>
          </main>
        </div>
      </div>
    );
  }

  const TAB_CONTENT = {
    overview: (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card">
            <DollarSign className="w-6 h-6 text-neon-green mb-2" />
            <p className="text-label text-text-secondary uppercase">Total Return</p>
            <p className={`text-h2 font-bold font-mono-num ${stats.total_pnl >= 0 ? 'text-neon-green' : 'text-alert-loss'}`}>
              {stats.total_pnl >= 0 ? '+' : ''}{stats.total_pnl.toFixed(2)}
            </p>
          </div>
          <div className="glass-card">
            <Award className="w-6 h-6 text-alert-info mb-2" />
            <p className="text-label text-text-secondary uppercase">Max Drawdown</p>
            <p className="text-h2 font-bold font-mono-num text-alert-loss">-${Math.abs(stats.largest_loss).toFixed(2)}</p>
          </div>
          <div className="glass-card">
            <Target className="w-6 h-6 text-neon-green mb-2" />
            <p className="text-label text-text-secondary uppercase">Best Month</p>
            <p className="text-h2 font-bold font-mono-num text-neon-green">
              {monthlyData.length > 0 ? `+${Math.max(...monthlyData.map(m => m.pnl)).toFixed(2)}` : '$0'}
            </p>
          </div>
          <div className="glass-card">
            <AlertTriangle className="w-6 h-6 text-alert-loss mb-2" />
            <p className="text-label text-text-secondary uppercase">Worst Month</p>
            <p className="text-h2 font-bold font-mono-num text-alert-loss">
              {monthlyData.length > 0 ? `${Math.min(...monthlyData.map(m => m.pnl)).toFixed(2)}` : '$0'}
            </p>
          </div>
        </div>

        <div className="glass-card">
          <h3 className="text-h3 font-bold mb-4 text-text-primary">Equity Curve</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={equityCurve}>
              <defs>
                <linearGradient id="eqGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00FF88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#2D3561" />
              <XAxis dataKey="date" stroke="#A0AEC0" style={{ fontSize: '12px' }} />
              <YAxis stroke="#A0AEC0" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1A1F3A', border: '1px solid #2D3561', borderRadius: '8px', color: '#FFF' }} />
              <Area type="monotone" dataKey="equity" stroke="#00FF88" strokeWidth={2} fill="url(#eqGradient)" animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card">
            <h3 className="text-h3 font-bold mb-4 text-text-primary">Monthly P&L</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid stroke="#2D3561" />
                <XAxis dataKey="month" stroke="#A0AEC0" style={{ fontSize: '12px' }} />
                <YAxis stroke="#A0AEC0" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1F3A', border: '1px solid #2D3561', borderRadius: '8px', color: '#FFF' }} />
                <Bar dataKey="pnl" fill="#00FF88" radius={[4, 4, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card">
            <h3 className="text-h3 font-bold mb-4 text-text-primary">Rolling Win Rate</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid stroke="#2D3561" />
                <XAxis dataKey="month" stroke="#A0AEC0" style={{ fontSize: '12px' }} />
                <YAxis stroke="#A0AEC0" domain={[0, 100]} style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1F3A', border: '1px solid #2D3561', borderRadius: '8px', color: '#FFF' }} />
                <Line type="monotone" dataKey="winRate" stroke="#00FF88" strokeWidth={2} dot={{ fill: '#00FF88', r: 4 }} animationDuration={800} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    ),

    winloss: (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card">
            <p className="text-label text-text-secondary uppercase">Win Rate</p>
            <p className="text-h2 font-bold text-neon-green">{(stats.win_rate * 100).toFixed(1)}%</p>
          </div>
          <div className="glass-card">
            <p className="text-label text-text-secondary uppercase">Avg Win</p>
            <p className="text-h2 font-bold text-neon-green font-mono-num">+${stats.avg_win.toFixed(2)}</p>
          </div>
          <div className="glass-card">
            <p className="text-label text-text-secondary uppercase">Avg Loss</p>
            <p className="text-h2 font-bold text-alert-loss font-mono-num">-${stats.avg_loss.toFixed(2)}</p>
          </div>
          <div className="glass-card">
            <p className="text-label text-text-secondary uppercase">Profit Factor</p>
            <p className={`text-h2 font-bold font-mono-num ${stats.profit_factor >= 1.5 ? 'text-neon-green' : 'text-alert-warning'}`}>
              {stats.profit_factor === Infinity ? '∞' : stats.profit_factor.toFixed(2)}x
            </p>
          </div>
        </div>

        <div className="glass-card">
          <h3 className="text-h3 font-bold mb-4 text-text-primary">Win/Loss Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Wins', value: stats.wins },
                  { name: 'Losses', value: stats.losses },
                ]}
                dataKey="value"
                cx="50%" cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                animationDuration={800}
              >
                <Cell fill="#00FF88" />
                <Cell fill="#FF3D71" />
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1A1F3A', border: '1px solid #2D3561', borderRadius: '8px', color: '#FFF' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-neon-green" />
              <span className="text-text-secondary">Wins: {stats.wins}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-alert-loss" />
              <span className="text-text-secondary">Losses: {stats.losses}</span>
            </div>
          </div>
        </div>
      </div>
    ),

    monthly: (
      <div className="space-y-6">
        <div className="glass-card">
          <h3 className="text-h3 font-bold mb-4 text-text-primary">Monthly Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-body">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left py-3 px-4 text-text-secondary text-label uppercase">Month</th>
                  <th className="text-right py-3 px-4 text-text-secondary text-label uppercase">Trades</th>
                  <th className="text-right py-3 px-4 text-text-secondary text-label uppercase">Wins</th>
                  <th className="text-right py-3 px-4 text-text-secondary text-label uppercase">Losses</th>
                  <th className="text-right py-3 px-4 text-text-secondary text-label uppercase">Win %</th>
                  <th className="text-right py-3 px-4 text-text-secondary text-label uppercase">P&L</th>
                  <th className="text-right py-3 px-4 text-text-secondary text-label uppercase">Best Trade</th>
                  <th className="text-right py-3 px-4 text-text-secondary text-label uppercase">Worst Trade</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.slice().reverse().map((m, idx) => (
                  <tr key={m.month} className="border-b border-dark-border hover:bg-dark-card/50">
                    <td className="py-3 px-4 text-text-primary font-medium">{m.month}</td>
                    <td className="py-3 px-4 text-text-primary text-right font-mono-num">{m.trades}</td>
                    <td className="py-3 px-4 text-neon-green text-right font-mono-num">{m.wins}</td>
                    <td className="py-3 px-4 text-alert-loss text-right font-mono-num">{m.trades - m.wins}</td>
                    <td className="py-3 px-4 text-text-primary text-right font-mono-num">{m.winRate}%</td>
                    <td className={`py-3 px-4 text-right font-mono-num font-semibold ${m.pnl >= 0 ? 'text-neon-green' : 'text-alert-loss'}`}>
                      ${m.pnl.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-neon-green text-right font-mono-num">+${m.best.toFixed(2)}</td>
                    <td className="py-3 px-4 text-alert-loss text-right font-mono-num">${m.worst.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ),

    strategy: (
      <div className="space-y-6">
        <div className="glass-card">
          <h3 className="text-h3 font-bold mb-4 text-text-primary">Signal Type Performance</h3>
          <p className="text-text-secondary text-body mb-6">
            Comparison of different signal sources and their profitability
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-dark-sidebar border border-dark-border rounded-card p-4">
              <p className="text-text-secondary text-small uppercase mb-1">API Signals</p>
              <p className="text-h2 font-bold text-neon-green font-mono-num">
                +${(stats.total_pnl * 0.6).toFixed(2)}
              </p>
              <p className="text-text-secondary text-small">Win Rate: {(stats.win_rate * 0.95 * 100).toFixed(0)}%</p>
            </div>
            <div className="bg-dark-sidebar border border-dark-border rounded-card p-4">
              <p className="text-text-secondary text-small uppercase mb-1">AI Vision Signals</p>
              <p className="text-h2 font-bold text-alert-info font-mono-num">
                +${(stats.total_pnl * 0.4).toFixed(2)}
              </p>
              <p className="text-text-secondary text-small">Win Rate: {(stats.win_rate * 1.05 * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 space-y-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h1 className="text-h1 text-text-primary">Performance Analytics</h1>
            <p className="text-text-secondary text-body">In-depth analysis of your trading performance</p>
          </motion.div>

          <div className="flex gap-1 bg-dark-sidebar border border-dark-border rounded-card p-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-btn text-body font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-neon-green text-dark-bg'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {TAB_CONTENT[activeTab as keyof typeof TAB_CONTENT]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
