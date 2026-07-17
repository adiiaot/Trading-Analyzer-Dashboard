"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Radio, BookOpen, BarChart3, BarChart4, TrendingUp, LineChart, Brain, Activity } from "lucide-react";
import Link from "next/link";
import { useDashboardData } from "@/lib/data-context";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

interface CommandCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
  status?: 'active' | 'standalone';
}

function CommandCard({ icon, title, description, action, status = 'standalone' }: CommandCardProps) {
  return (
    <motion.div variants={item} className="glass-card rounded-xl p-5 flex flex-col gap-4"
      style={{ border: '1px solid var(--glass-border)' }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(var(--accent-gold-rgb), 0.1)' }}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-text-primary">{title}</h3>
            <p className="text-xs text-text-muted mt-0.5">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
          style={{
            background: status === 'active' ? 'rgba(var(--status-win-rgb), 0.12)' : 'rgba(var(--accent-gold-rgb), 0.1)',
            color: status === 'active' ? 'rgb(var(--status-win-rgb))' : 'rgb(var(--accent-gold-rgb))',
          }}>
          <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-[var(--status-win)]' : 'bg-[var(--accent-gold)]'}`} />
          {status === 'active' ? 'Live' : 'Ready'}
        </div>
      </div>
      {action}
    </motion.div>
  );
}

export default function CommandsPage() {
  const [signalLoading, setSignalLoading] = useState(false);
  const [signalResult, setSignalResult] = useState<{ success: boolean; message: string; signal?: any } | null>(null);
  const [tradeForm, setTradeForm] = useState({ entryPrice: '', exitPrice: '', direction: 'LONG', result: 'win', notes: '' });
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeResult, setTradeResult] = useState<string | null>(null);
  const [journalText, setJournalText] = useState('');
  const [journalLoading, setJournalLoading] = useState(false);
  const [journalResult, setJournalResult] = useState<string | null>(null);
  const { balance } = useDashboardData();

  const generateSignal = async () => {
    setSignalLoading(true);
    setSignalResult(null);
    try {
      const res = await fetch('/api/signal/generate', { method: 'POST' });
      const data = await res.json();
      setSignalResult(data);
    } catch {
      setSignalResult({ success: false, message: 'Network error' });
    }
    setSignalLoading(false);
  };

  const logTrade = async () => {
    const { entryPrice, exitPrice, direction, result, notes } = tradeForm;
    if (!entryPrice || !exitPrice) return;
    setTradeLoading(true);
    setTradeResult(null);
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryPrice: parseFloat(entryPrice),
          exitPrice: parseFloat(exitPrice),
          direction,
          result,
          notes,
          quantity: 0.01,
        }),
      });
      const data = await res.json();
      setTradeResult(data.message || 'Trade logged');
      setTradeForm({ entryPrice: '', exitPrice: '', direction: 'LONG', result: 'win', notes: '' });
    } catch {
      setTradeResult('Failed to log trade');
    }
    setTradeLoading(false);
  };

  const addJournalNote = async () => {
    if (!journalText.trim()) return;
    setJournalLoading(true);
    setJournalResult(null);
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: journalText }),
      });
      const data = await res.json();
      setJournalResult(data.message || 'Journal entry saved');
      setJournalText('');
    } catch {
      setJournalResult('Failed to save journal entry');
    }
    setJournalLoading(false);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Terminal className="w-6 h-6 text-accent-gold" />
          Command Center
        </h1>
        <p className="text-sm text-text-muted mt-1">All bot actions — now available directly in the dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <CommandCard
          icon={<Radio className="w-5 h-5 text-accent-gold" />}
          title="Generate Signal"
          description="Run the 4-timeframe signal engine (1D→4H→1H→15M) for XAU/USD"
          action={
            <div className="space-y-3">
              <button
                onClick={generateSignal}
                disabled={signalLoading}
                className="btn-primary w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
                style={{ background: signalLoading ? undefined : 'linear-gradient(135deg, var(--accent-gold), rgba(var(--accent-gold-rgb), 0.7))' }}>
                {signalLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing XAU/USD...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Run Analysis
                  </span>
                )}
              </button>
              {signalResult && (
                <div className={`p-3 rounded-lg text-xs ${signalResult.success ? 'text-status-win' : 'text-status-loss'}`}
                  style={{ background: signalResult.success ? 'rgba(var(--status-win-rgb), 0.08)' : 'rgba(var(--status-loss-rgb), 0.08)' }}>
                  <p className="font-medium mb-1">{signalResult.success ? '✅ Signal Generated' : '❌ ' + signalResult.message}</p>
                  {signalResult.signal && (
                    <div className="space-y-1 text-text-secondary mt-2">
                      <p>Trend: {signalResult.signal.trend} | Confidence: {Math.round(signalResult.signal.confidence * 100)}%</p>
                      <p>Entry: ${signalResult.signal.entries?.[0]?.price?.toFixed(2)} | SL: ${signalResult.signal.stop_loss?.toFixed(2)}</p>
                      <p>TP: ${signalResult.signal.tp1?.toFixed(2)} | R:R: {signalResult.signal.rr_ratio?.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          }
        />

        <CommandCard
          icon={<Activity className="w-5 h-5 text-accent-gold" />}
          title="Log Trade"
          description="Record a completed trade with P&L calculation"
          action={
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Entry Price" type="number" step="0.01"
                  value={tradeForm.entryPrice}
                  onChange={e => setTradeForm(p => ({ ...p, entryPrice: e.target.value }))}
                  className="input text-xs px-3 py-2 rounded-lg" />
                <input placeholder="Exit Price" type="number" step="0.01"
                  value={tradeForm.exitPrice}
                  onChange={e => setTradeForm(p => ({ ...p, exitPrice: e.target.value }))}
                  className="input text-xs px-3 py-2 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 sm:flex gap-2">
                <button onClick={() => setTradeForm(p => ({ ...p, direction: 'LONG' }))}
                  className={`py-1.5 rounded-lg text-xs font-medium transition ${tradeForm.direction === 'LONG' ? 'bg-[rgba(var(--status-win-rgb),0.15)] text-status-win' : 'glass'}`}>
                  LONG ↗
                </button>
                <button onClick={() => setTradeForm(p => ({ ...p, direction: 'SHORT' }))}
                  className={`py-1.5 rounded-lg text-xs font-medium transition ${tradeForm.direction === 'SHORT' ? 'bg-[rgba(var(--status-loss-rgb),0.15)] text-status-loss' : 'glass'}`}>
                  SHORT ↘
                </button>
                <button onClick={() => setTradeForm(p => ({ ...p, result: 'win' }))}
                  className={`py-1.5 rounded-lg text-xs font-medium transition ${tradeForm.result === 'win' ? 'bg-[rgba(var(--status-win-rgb),0.15)] text-status-win' : 'glass'}`}>
                  WIN
                </button>
                <button onClick={() => setTradeForm(p => ({ ...p, result: 'loss' }))}
                  className={`py-1.5 rounded-lg text-xs font-medium transition ${tradeForm.result === 'loss' ? 'bg-[rgba(var(--status-loss-rgb),0.15)] text-status-loss' : 'glass'}`}>
                  LOSS
                </button>
              </div>
              <button onClick={logTrade} disabled={tradeLoading || !tradeForm.entryPrice || !tradeForm.exitPrice}
                className="btn-primary w-full py-2 rounded-lg text-xs font-semibold disabled:opacity-50">
                {tradeLoading ? 'Logging...' : 'Log Trade'}
              </button>
              {tradeResult && <p className="text-xs text-[var(--accent-gold)]">{tradeResult}</p>}
            </div>
          }
        />

        <CommandCard
          icon={<BookOpen className="w-5 h-5 text-accent-gold" />}
          title="Journal Note"
          description="Add a free-form journal entry to your trading journal"
          action={
            <div className="space-y-3">
              <textarea placeholder="Write your journal note..."
                value={journalText}
                onChange={e => setJournalText(e.target.value)}
                className="input text-xs px-3 py-2 rounded-lg w-full resize-none"
                rows={3} />
              <button onClick={addJournalNote} disabled={journalLoading || !journalText.trim()}
                className="btn-primary w-full py-2 rounded-lg text-xs font-semibold disabled:opacity-50">
                {journalLoading ? 'Saving...' : 'Save Note'}
              </button>
              {journalResult && <p className="text-xs text-[var(--accent-gold)]">{journalResult}</p>}
            </div>
          }
        />

        <CommandCard
          icon={<LineChart className="w-5 h-5 text-accent-gold" />}
          title="Backtest"
          description="Run the signal engine against historical XAU/USD data"
          action={
            <Link href="/dashboard/backtest"
              className="btn-primary w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, var(--accent-gold), rgba(var(--accent-gold-rgb), 0.7))' }}>
              <BarChart4 className="w-4 h-4" />
              Open Backtest
            </Link>
          }
        />

        <CommandCard
          icon={<Brain className="w-5 h-5 text-accent-gold" />}
          title="AI Learning Hub"
          description="Chat with AI about forex strategies or analyze chart screenshots"
          action={
            <Link href="/dashboard/learning"
              className="btn-secondary w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
              <Brain className="w-4 h-4" />
              Open Learning Hub
            </Link>
          }
        />

        <CommandCard
          icon={<Activity className="w-5 h-5 text-accent-gold" />}
          title="View Analytics"
          description="Trading statistics, win rate breakdown, strategy performance"
          action={
            <Link href="/dashboard/analytics"
              className="btn-secondary w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Open Analytics
            </Link>
          }
        />
      </div>

      <div className="glass-card rounded-xl p-4 text-xs text-text-muted flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: "var(--status-win)" }} />
        <span>All commands are fully self-sufficient — no Telegram bot required. Signal generation fetches live XAU/USD data from Hyperliquid directly.</span>
      </div>
    </motion.div>
  );
}
