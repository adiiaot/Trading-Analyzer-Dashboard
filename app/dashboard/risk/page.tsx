'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, Shield, Gauge } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';

export default function RiskManagementPage() {
  const [balance, setBalance] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1.5);
  const [stopLoss, setStopLoss] = useState(20);

  const dailyLoss = 230;
  const dailyLimit = 500;
  const percentage = (dailyLoss / dailyLimit) * 100;
  const drawdown = 340;
  const drawdownPercent = 3.4;

  const riskHistory = [
    { day: 'Mon', risk: 45 },
    { day: 'Tue', risk: 60 },
    { day: 'Wed', risk: 35 },
    { day: 'Thu', risk: 80 },
    { day: 'Fri', risk: 55 },
    { day: 'Sat', risk: 20 },
    { day: 'Sun', risk: 10 },
  ];

  const positionSizingData = [
    { risk: '0.5%', lots: '0.05', capital: '$50' },
    { risk: '1.0%', lots: '0.10', capital: '$100' },
    { risk: '1.5%', lots: '0.15', capital: '$150' },
    { risk: '2.0%', lots: '0.20', capital: '$200' },
    { risk: '2.5%', lots: '0.25', capital: '$250' },
    { risk: '3.0%', lots: '0.30', capital: '$300' },
  ];

  const recommendedLots = (balance * (riskPercent / 100) / (stopLoss * 0.1)).toFixed(3);

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 space-y-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h1 className="text-h1 text-text-primary">Risk Management</h1>
            <p className="text-text-secondary text-body">Monitor and control your trading risk</p>
          </motion.div>

          {/* Row 1: Risk Overview Cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
          >
            <div className="glass-card">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-neon-green" />
                <span className="text-label text-text-secondary uppercase">Account Balance</span>
              </div>
              <p className="text-h2 font-bold font-mono-num text-text-primary">$10,000.00</p>
              <p className="text-small text-text-secondary">Starting: $10,000.00</p>
            </div>

            <div className="glass-card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-neon-green" />
                <span className="text-label text-text-secondary uppercase">Daily P&L</span>
              </div>
              <p className="text-h2 font-bold font-mono-num text-neon-green">+$120.50</p>
              <p className="text-small text-neon-green">+1.21% today</p>
            </div>

            <div className="glass-card">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-alert-warning" />
                <span className="text-label text-text-secondary uppercase">Max Daily Loss</span>
              </div>
              <p className="text-h2 font-bold font-mono-num text-alert-warning">$500</p>
              <p className="text-small text-text-secondary">Remaining: ${dailyLimit - dailyLoss}</p>
            </div>

            <div className="glass-card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-alert-loss" />
                <span className="text-label text-text-secondary uppercase">Current Drawdown</span>
              </div>
              <p className="text-h2 font-bold font-mono-num text-alert-loss">-${drawdown}</p>
              <p className="text-small text-alert-loss">{drawdownPercent}% from peak</p>
            </div>

            <div className="glass-card">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-alert-info" />
                <span className="text-label text-text-secondary uppercase">Available Risk</span>
              </div>
              <p className="text-h2 font-bold font-mono-num text-alert-info">$270</p>
              <p className="text-small text-text-secondary">54% remaining</p>
            </div>
          </motion.div>

          {/* Row 2: Daily Loss Progress + Risk Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="glass-card"
            >
              <h3 className="text-h3 font-bold mb-4 text-text-primary">Daily Loss Limit</h3>
              <div className="space-y-4">
                <div className="flex justify-between mb-2">
                  <span className="text-body text-text-secondary">Daily Limit: ${dailyLimit}</span>
                  <span className="text-body text-text-secondary">Current: ${dailyLoss}</span>
                </div>
                <div className="relative h-3 bg-dark-sidebar rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      percentage > 80 ? 'bg-alert-loss' :
                      percentage > 50 ? 'bg-alert-warning' :
                      'bg-neon-green'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-body text-text-secondary text-right">{percentage.toFixed(0)}% used</p>

                {percentage > 80 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-alert-loss/10 border border-alert-loss/30 rounded-card text-alert-loss text-body"
                  >
                    ⚠ Daily loss limit 80% reached. Stop trading.
                  </motion.div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="glass-card"
            >
              <h3 className="text-h3 font-bold mb-4 text-text-primary">Risk Gauge</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#2D3561" strokeWidth="12" />
                    <motion.circle
                      cx="100" cy="100" r="80" fill="none" stroke="#00FF88" strokeWidth="12"
                      strokeDasharray={`${(percentage / 100) * 502} 502`}
                      strokeLinecap="round"
                      initial={{ strokeDasharray: '0 502' }}
                      animate={{ strokeDasharray: `${(percentage / 100) * 502} 502` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      transform="rotate(-90 100 100)"
                    />
                    <text x="100" y="95" textAnchor="middle" fill="#FFFFFF" fontSize="36" fontWeight="bold">
                      {percentage.toFixed(0)}%
                    </text>
                    <text x="100" y="120" textAnchor="middle" fill="#A0AEC0" fontSize="14">
                      Risk Used
                    </text>
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Row 3: Lot Size Calculator + Risk/Reward Analyzer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="glass-card"
            >
              <h3 className="text-h3 font-bold mb-4 text-text-primary">Lot Size Calculator</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-body text-text-secondary block mb-2">Account Balance ($)</label>
                  <input
                    type="number"
                    value={balance}
                    onChange={(e) => setBalance(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-body text-text-secondary block mb-2">Risk %</label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(Number(e.target.value))}
                    className="w-full mt-2 accent-neon-green"
                  />
                  <p className="text-center text-neon-green font-semibold mt-2 text-h3">{riskPercent}%</p>
                </div>
                <div>
                  <label className="text-body text-text-secondary block mb-2">Stop Loss (pips)</label>
                  <input
                    type="number"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none"
                  />
                </div>
                <motion.div
                  className="bg-gradient-to-r from-dark-card to-dark-sidebar border border-neon-green/20 rounded-card p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-text-secondary text-body mb-2">Recommended Lot Size</p>
                  <p className="text-h2 font-bold text-neon-green font-mono-num">
                    {recommendedLots} lots
                  </p>
                </motion.div>
                <button className="w-full py-2.5 bg-neon-green text-dark-bg font-semibold rounded-btn hover:bg-neon-green-hover transition text-body">
                  Apply Lot Size
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="glass-card"
            >
              <h3 className="text-h3 font-bold mb-4 text-text-primary">Risk/Reward Analyzer</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-body text-text-secondary block mb-2">Entry Price</label>
                  <input type="number" defaultValue="2650.00" className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none" />
                </div>
                <div>
                  <label className="text-body text-text-secondary block mb-2">Stop Loss</label>
                  <input type="number" defaultValue="2640.00" className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none" />
                </div>
                <div>
                  <label className="text-body text-text-secondary block mb-2">Take Profit</label>
                  <input type="number" defaultValue="2670.00" className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none" />
                </div>
                <motion.div className="bg-gradient-to-r from-dark-card to-dark-sidebar border border-neon-green/20 rounded-card p-4">
                  <div className="flex justify-between mb-3">
                    <span className="text-text-secondary text-body">Risk</span>
                    <span className="text-alert-loss font-semibold font-mono-num">10 pips ($10.00)</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-text-secondary text-body">Reward</span>
                    <span className="text-neon-green font-semibold font-mono-num">20 pips ($20.00)</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-dark-border">
                    <span className="text-text-secondary text-body font-semibold">R:R Ratio</span>
                    <span className="text-neon-green font-bold font-mono-num">1:2.0</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Row 4: Position Sizing Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="glass-card"
          >
            <h3 className="text-h3 font-bold mb-4 text-text-primary">Position Sizing Reference</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-body">
                <thead>
                  <tr className="border-b border-dark-border">
                    <th className="text-left py-3 px-4 text-text-secondary text-label uppercase">Risk %</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-label uppercase">Lot Size</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-label uppercase">Capital at Risk</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-label uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {positionSizingData.map((row, idx) => (
                    <tr key={idx} className="border-b border-dark-border hover:bg-dark-card/50 transition">
                      <td className="py-3 px-4 text-text-primary font-mono-num">{row.risk}</td>
                      <td className="py-3 px-4 text-text-primary font-mono-num">{row.lots}</td>
                      <td className="py-3 px-4 text-neon-green font-mono-num">{row.capital}</td>
                      <td className="py-3 px-4">
                        <button className="text-neon-green hover:text-neon-green-hover text-small font-semibold transition">
                          Apply
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Row 5: Risk History Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="glass-card"
          >
            <h3 className="text-h3 font-bold mb-4 text-text-primary">Risk Usage Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={riskHistory}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF88" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00FF88" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#2D3561" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#A0AEC0" style={{ fontSize: '12px' }} />
                <YAxis stroke="#A0AEC0" style={{ fontSize: '12px' }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1F3A',
                    border: '1px solid #2D3561',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                  }}
                />
                <Area type="monotone" dataKey="risk" stroke="#00FF88" strokeWidth={2} fill="url(#riskGradient)" animationDuration={800} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
