"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Copy, ExternalLink,
  CheckCircle, XCircle, Loader2, Check, DollarSign, RefreshCw,
} from "lucide-react";
import { useDashboardData } from "@/lib/data-context";

interface SignalResultEntry {
  entry_number: number;
  price: number;
  tp: number;
  tp_pips: number;
  auto_close: boolean;
}

interface SignalResultData {
  id: string;
  trend: string;
  entries: SignalResultEntry[];
  stop_loss: number;
  confidence: number;
  rr_ratio: number;
  description: string | null;
  signal_type: string | null;
  tp1: number | null;
  tp2: number | null;
  macro_trend: string | null;
  timestamp: string;
  valid_until: string;
}

interface SignalResultCardProps {
  signal: SignalResultData;
  confirmed?: boolean;
  onConfirm?: (signalId: string) => void;
  onWon?: (signalId: string) => void;
  onLost?: (signalId: string) => void;
  onGenerateNext?: () => void;
  outcomeUpdating?: boolean;
  generatingNext?: boolean;
}

function formatEntryPrice(p: number): string {
  return p ? `$${p.toFixed(2)}` : '$—';
}

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } catch {
    return ts || '';
  }
}

function buildTweetText(signal: SignalResultData): string {
  const trendEmoji = signal.trend === 'UP' ? '📈' : '📉';
  const typeLabel = signal.signal_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Signal';
  const entry1 = signal.entries?.[0];
  const lines = [
    `🎯 XAU/USD SIGNAL`,
    `${trendEmoji} ${signal.trend} | ${typeLabel}`,
    '',
    `Entry: $${entry1?.price?.toFixed(2) || '—'}`,
    `Stop Loss: $${signal.stop_loss?.toFixed(2) || '—'}`,
    `Take Profit: $${signal.tp1?.toFixed(2) || '—'}`,
    '',
    `Confidence: ${Math.round(signal.confidence * 100)}% | R:R ${signal.rr_ratio?.toFixed(2) || '—'}`,
  ];
  lines.push('');
  lines.push('#XAUUSD #GoldTrading #ForexSignals');
  return lines.join('\n');
}

function buildCopyText(signal: SignalResultData): string {
  const trendEmoji = signal.trend === 'UP' ? '📈' : '📉';
  const typeLabel = signal.signal_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Signal';
  const lines = [
    `🎯 XAU/USD SIGNAL`,
    `${trendEmoji} ${signal.trend} | ${typeLabel}`,
    '',
  ];
  if (signal.entries && signal.entries.length > 0) {
    signal.entries.forEach((e, i) => {
      const r = Math.abs(e.tp - e.price) / Math.abs(e.price - signal.stop_loss);
      lines.push(`E${e.entry_number}: Entry $${e.price.toFixed(2)} → TP $${e.tp.toFixed(2)} (R:${r.toFixed(1)})`);
    });
  }
  if (signal.entries && signal.entries.length === 1) {
    lines.push(`Stop Loss: $${signal.stop_loss.toFixed(2)}`);
    lines.push(`Take Profit: $${signal.tp1?.toFixed(2) || '—'}`);
  }
  lines.push('');
  lines.push(`Confidence: ${Math.round(signal.confidence * 100)}% | R:R ${signal.rr_ratio?.toFixed(2)}`);
  if (signal.macro_trend) {
    lines.push(`Daily Trend: ${signal.macro_trend}`);
  }
  if (signal.description) {
    lines.push('');
    lines.push(signal.description);
  }
  lines.push('');
  lines.push(`Generated: ${formatTimestamp(signal.timestamp)}`);
  lines.push(`Valid until: ${formatTimestamp(signal.valid_until)}`);
  return lines.join('\n');
}

export function SignalResultCard({
  signal,
  confirmed,
  onConfirm,
  onWon,
  onLost,
  onGenerateNext,
  outcomeUpdating,
  generatingNext,
}: SignalResultCardProps) {
  const [copied, setCopied] = useState(false);
  const { balance, compounding } = useDashboardData();
  const isUp = signal.trend === 'UP';
  const confidencePct = Math.round((signal.confidence ?? 0) * 100);
  const [outcomeSet, setOutcomeSet] = useState(false);

  const [lotSize, setLotSize] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("last_lot_size");
      if (saved) return parseFloat(saved);
    }
    return 0.05;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("last_lot_size", lotSize.toString());
    }
  }, [lotSize]);

  // Margin calculations
  const contractSize = 100;
  const price = signal.entries?.[0]?.price || 2600;
  const marginRequired = parseFloat(((lotSize * contractSize * price) / compounding.leverage).toFixed(2));
  const freeMargin = parseFloat((balance - marginRequired).toFixed(2));
  const pipValue = parseFloat((lotSize * 10).toFixed(2));
  const slDistance = signal.stop_loss && signal.entries?.[0]?.price
    ? Math.abs(signal.entries[0].price - signal.stop_loss)
    : 0;
  const riskInDollars = slDistance > 0 ? parseFloat((pipValue * slDistance).toFixed(2)) : 0;
  const marginPct = balance > 0 ? parseFloat(((marginRequired / balance) * 100).toFixed(1)) : 0;
  const marginOk = marginPct < 90;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildCopyText(signal));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = buildCopyText(signal);
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePostX = () => {
    const text = buildTweetText(signal);
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleWon = () => {
    onWon?.(signal.id);
    setOutcomeSet(true);
  };

  const handleLost = () => {
    onLost?.(signal.id);
    setOutcomeSet(true);
  };

  const showGenerateNext = outcomeSet || (confirmed && (onLost || onWon));

  const lotSizePresets = [0.02, 0.05, 0.09, 0.1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Accent bar */}
      <div style={{
        height: '4px',
        background: isUp
          ? 'linear-gradient(90deg, #00e676, #00c853)'
          : 'linear-gradient(90deg, #ff5252, #d32f2f)',
      }} />

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
              isUp ? 'text-status-win' : 'text-status-loss'
            }`} style={{ background: isUp ? 'rgba(0,230,118,0.1)' : 'rgba(255,82,82,0.1)' }}>
              XAU
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-text-primary">XAU/USD</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(240, 180, 41, 0.12)', color: 'var(--accent-gold)' }}>
                  GOLD
                </span>
              </div>
              <p className="text-[10px] text-text-muted">{formatTimestamp(signal.timestamp)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-semibold px-2 py-1 rounded-lg"
              style={{ background: 'rgba(240, 180, 41, 0.08)', color: 'var(--accent-gold)' }}>
              {signal.signal_type?.replace(/_/g, ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Signal'}
            </div>
          </div>
        </div>

        {/* Trend + Confidence */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isUp ? (
              <TrendingUp className="w-5 h-5 text-status-win" />
            ) : (
              <TrendingDown className="w-5 h-5 text-status-loss" />
            )}
            <span className={`text-lg font-bold ${isUp ? 'text-status-win' : 'text-status-loss'}`}>
              {signal.trend} TREND
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 w-20 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{
                width: `${confidencePct}%`,
                background: confidencePct >= 70
                  ? 'linear-gradient(90deg, #00e676, #69f0ae)'
                  : confidencePct >= 50
                  ? 'linear-gradient(90deg, #f0b429, #ffd54f)'
                  : 'linear-gradient(90deg, #ff5252, #ff8a80)',
              }} />
            </div>
            <span className="text-xs font-bold font-mono text-text-primary">{confidencePct}%</span>
          </div>
        </div>

        {/* Entry / SL / TP Columns */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(240, 180, 41, 0.06)', border: '1px solid rgba(240, 180, 41, 0.15)' }}>
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Entry</p>
            <p className="text-sm font-bold font-mono" style={{ color: 'var(--accent-gold)' }}>
              ${signal.entries?.[0]?.price?.toFixed(2) || '—'}
            </p>
            {signal.entries && signal.entries.length > 1 && (
              <p className="text-[9px] text-text-muted mt-0.5">+{signal.entries.length - 1} alt levels</p>
            )}
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,82,82,0.06)', border: '1px solid rgba(255,82,82,0.15)' }}>
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Stop Loss</p>
            <p className="text-sm font-bold font-mono text-status-loss">${signal.stop_loss?.toFixed(2) || '—'}</p>
            {signal.entries?.[0] && (
              <p className="text-[9px] text-text-muted mt-0.5">
                {((Math.abs(signal.entries[0].price - signal.stop_loss) / 0.1) * 10).toFixed(1)} pts
              </p>
            )}
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.15)' }}>
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Take Profit</p>
            <p className="text-sm font-bold font-mono text-status-win">${signal.tp1?.toFixed(2) || '—'}</p>
            {signal.tp2 && (
              <p className="text-[9px] text-text-muted mt-0.5">TP2: ${signal.tp2.toFixed(2)}</p>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3 text-xs">
            <div>
              <span className="text-text-muted text-[10px]">R:R</span>
              <p className="font-bold font-mono text-accent-gold">{signal.rr_ratio?.toFixed(2) || '—'}</p>
            </div>
            {signal.macro_trend && (
              <div className="pl-3" style={{ borderLeft: '1px solid var(--glass-border)' }}>
                <span className="text-text-muted text-[10px]">Daily</span>
                <p className={`font-semibold text-[11px] ${signal.macro_trend === 'UP' ? 'text-status-win' : signal.macro_trend === 'DOWN' ? 'text-status-loss' : 'text-text-muted'}`}>
                  {signal.macro_trend}
                </p>
              </div>
            )}
          </div>
          <div className="text-[10px] text-text-muted">
            {signal.entries?.length || 1} entry ladder
          </div>
        </div>

        {/* Lot Size & Margin */}
        <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(240, 180, 41, 0.04)', border: '1px solid rgba(240, 180, 41, 0.1)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-accent-gold" />
              <span className="text-[10px] font-semibold text-text-muted">Lot Size</span>
            </div>
            <div className="flex items-center gap-1.5">
              {lotSizePresets.map(p => (
                <button
                  key={p}
                  onClick={() => setLotSize(p)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                    Math.abs(lotSize - p) < 0.001
                      ? 'text-white'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                  style={{
                    background: Math.abs(lotSize - p) < 0.001
                      ? 'rgba(240, 180, 41, 0.25)'
                      : 'rgba(255,255,255,0.04)',
                    border: Math.abs(lotSize - p) < 0.001
                      ? '1px solid rgba(240, 180, 41, 0.3)'
                      : '1px solid transparent',
                  }}
                >
                  {p.toFixed(2)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0.01}
              max={1.0}
              step={0.01}
              value={lotSize}
              onChange={e => setLotSize(parseFloat(e.target.value) || 0.01)}
              className="w-20 px-2 py-1 rounded-lg text-xs font-mono font-bold outline-none text-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--accent-gold)' }}
            />
            <span className="text-[10px] text-text-muted">lots</span>
            <div className="ml-auto flex items-center gap-3 text-[10px]">
              <span className="text-text-muted">
                Margin: <span className={`font-mono font-bold ${marginOk ? 'text-accent-gold' : 'text-status-loss'}`}>
                  ${marginRequired.toFixed(2)}
                </span>
                <span className="text-text-muted ml-1">({marginPct}%)</span>
              </span>
              <span className="text-text-muted">
                Free: <span className="font-mono font-bold" style={{ color: freeMargin > 0 ? 'var(--status-win)' : 'var(--status-loss)' }}>
                  ${freeMargin.toFixed(2)}
                </span>
              </span>
              <span className="text-text-muted">
                Pip: <span className="font-mono font-bold text-text-primary">${pipValue.toFixed(2)}</span>
              </span>
            </div>
          </div>
          {!marginOk && (
            <p className="text-[10px] text-status-loss flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Margin exceeds 90% of balance — reduce lot size
            </p>
          )}
          {riskInDollars > 0 && (
            <p className="text-[10px] text-text-muted">
              Risk: <span className="font-mono font-semibold" style={{ color: 'var(--status-loss)' }}>
                ${riskInDollars.toFixed(2)}
              </span>
              {' | '}1R: <span className="font-mono font-semibold text-status-win">${riskInDollars.toFixed(2)}</span>
              {' | '}2R: <span className="font-mono font-semibold text-status-win">${(riskInDollars * 2).toFixed(2)}</span>
            </p>
          )}
        </div>

        {/* Multi-Entry Ladder */}
        {signal.entries && signal.entries.length > 1 && (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--glass-border)' }}>
            <div className="text-[10px] font-semibold text-text-muted px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
              Entry Ladder
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--glass-border)' }}>
              {signal.entries.map((e, i) => {
                const r = Math.abs(e.tp - e.price) / Math.abs(e.price - signal.stop_loss);
                return (
                  <div key={i} className="flex items-center justify-between px-3 py-2 text-xs" style={{ borderColor: 'var(--glass-border)' }}>
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        i === 0 ? 'text-accent-gold' : 'text-text-muted'
                      }`} style={{
                        background: i === 0 ? 'rgba(240, 180, 41, 0.12)' : 'rgba(255,255,255,0.05)',
                      }}>
                        E{e.entry_number}
                      </span>
                      <span className="font-mono font-medium text-text-primary">${e.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-text-muted">
                      <span>TP <span className="font-mono text-status-win">${e.tp.toFixed(2)}</span></span>
                      <span className="font-mono text-accent-gold">R:{r.toFixed(1)}</span>
                      <span className="font-mono">{e.tp_pips}p</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Description */}
        {signal.description && (
          <p className="text-[10px] text-text-muted leading-relaxed px-1">{signal.description}</p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
            style={{ background: 'rgba(240, 180, 41, 0.1)', color: 'var(--accent-gold)', border: '1px solid rgba(240, 180, 41, 0.15)' }}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handlePostX}
            className="flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
            style={{ background: 'rgba(29, 161, 242, 0.1)', color: '#1da1f2', border: '1px solid rgba(29, 161, 242, 0.15)' }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Post on X
          </button>
          {showGenerateNext && onGenerateNext && (
            <button
              onClick={onGenerateNext}
              disabled={generatingNext}
              className="flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'rgba(240, 180, 41, 0.15)', color: 'var(--accent-gold)', border: '1px solid rgba(240, 180, 41, 0.25)' }}
            >
              {generatingNext ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Generate Next
            </button>
          )}
          {!showGenerateNext && !confirmed && onConfirm && (
            <button
              onClick={() => onConfirm(signal.id)}
              disabled={outcomeUpdating}
              className="flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'rgba(240, 180, 41, 0.12)', color: 'var(--accent-gold)', border: '1px solid rgba(240, 180, 41, 0.2)' }}
            >
              {outcomeUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              Confirm
            </button>
          )}
          {!showGenerateNext && confirmed && onWon && (
            <button
              onClick={handleWon}
              disabled={outcomeUpdating}
              className="flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'rgba(0,230,118,0.1)', color: 'var(--status-win)', border: '1px solid rgba(0,230,118,0.15)' }}
            >
              {outcomeUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              Won
            </button>
          )}
          {!showGenerateNext && confirmed && onLost && (
            <button
              onClick={handleLost}
              disabled={outcomeUpdating}
              className="flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'rgba(255,82,82,0.1)', color: 'var(--status-loss)', border: '1px solid rgba(255,82,82,0.15)' }}
            >
              {outcomeUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              Lost
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
