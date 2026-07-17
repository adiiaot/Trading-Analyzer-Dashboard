"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, TrendingUp, TrendingDown, Activity, Clock, Target } from "lucide-react";

interface BriefData {
  price: number;
  activeSignals: number;
  activeSignalDetails: { trend: string; confidence: number; entry: number }[];
  todayTrades: { count: number; wins: number; losses: number; totalPnl: number };
  sessionWindow: string;
}

export default function BriefPanel() {
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBrief = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/brief');
      const data = await res.json();
      if (data?.brief) setBrief(data.brief);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchBrief();
    const interval = setInterval(fetchBrief, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--glass-border)' }}>
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent-gold" />
          <h2 className="text-sm font-bold text-text-primary">Pre-Session Brief</h2>
        </div>
        <button onClick={fetchBrief} disabled={loading}
          className="text-[10px] font-medium px-2 py-1 rounded flex items-center gap-1"
          style={{ background: 'rgba(var(--accent-gold-rgb), 0.1)', color: 'var(--accent-gold)' }}>
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {brief ? (
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Target className="w-3 h-3 text-accent-gold" />
              <span className="text-[10px] text-text-muted uppercase">Price</span>
            </div>
            <p className="text-lg font-bold font-mono text-text-primary">
              ${brief.price.toFixed(2)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-status-win" />
              <span className="text-[10px] text-text-muted uppercase">Active Signals</span>
            </div>
            <p className="text-lg font-bold text-text-primary">{brief.activeSignals}</p>
            {brief.activeSignalDetails.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {brief.activeSignalDetails.map((s, i) => (
                  <p key={i} className="text-[10px] text-text-muted">
                    {s.trend} @ ${s.entry?.toFixed(2)} ({(s.confidence * 100).toFixed(0)}%)
                  </p>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1">
              <Activity className="w-3 h-3 text-accent-gold" />
              <span className="text-[10px] text-text-muted uppercase">Today's Trades</span>
            </div>
            <p className="text-lg font-bold text-text-primary">{brief.todayTrades.count}</p>
            <div className="flex gap-2 mt-1 text-[10px]">
              <span className="text-status-win">{brief.todayTrades.wins}W</span>
              <span className="text-status-loss">{brief.todayTrades.losses}L</span>
              <span className={brief.todayTrades.totalPnl >= 0 ? 'text-status-win' : 'text-status-loss'}>
                ${brief.todayTrades.totalPnl.toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-accent-gold" />
              <span className="text-[10px] text-text-muted uppercase">Session</span>
            </div>
            <p className="text-sm font-medium text-text-primary">{brief.sessionWindow}</p>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-xs text-text-muted">
          {loading ? 'Loading brief...' : 'Unable to load brief data'}
        </div>
      )}
    </motion.div>
  );
}
