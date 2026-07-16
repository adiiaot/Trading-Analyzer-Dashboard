"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Copy, ExternalLink,
  CheckCircle, XCircle, Loader2, Check,
} from "lucide-react";

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

interface DxyStateData {
  trend: string;
  expectedGoldDirection: string;
  correlationConfirmed: boolean;
  summary: string;
}

interface SignalResultCardProps {
  signal: SignalResultData;
  dxyState?: DxyStateData | null;
  onWon?: (signalId: string) => void;
  onLost?: (signalId: string) => void;
  outcomeUpdating?: boolean;
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

function buildTweetText(signal: SignalResultData, dxyState?: DxyStateData | null): string {
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
  if (dxyState) {
    lines.push(`DXY: ${dxyState.correlationConfirmed ? '✅' : '❌'} ${dxyState.summary}`);
  }
  lines.push('');
  lines.push('#XAUUSD #GoldTrading #ForexSignals');
  return lines.join('\n');
}

function buildCopyText(signal: SignalResultData, dxyState?: DxyStateData | null): string {
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
  if (dxyState) {
    lines.push(`DXY: ${dxyState.correlationConfirmed ? '✅' : '❌'} ${dxyState.summary}`);
  }
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
  dxyState,
  onWon,
  onLost,
  outcomeUpdating,
}: SignalResultCardProps) {
  const [copied, setCopied] = useState(false);
  const isUp = signal.trend === 'UP';
  const confidencePct = Math.round((signal.confidence ?? 0) * 100);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildCopyText(signal, dxyState));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = buildCopyText(signal, dxyState);
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePostX = () => {
    const text = buildTweetText(signal, dxyState);
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
            {dxyState && (
              <div className="pl-3" style={{ borderLeft: '1px solid var(--glass-border)' }}>
                <span className="text-text-muted text-[10px]">DXY</span>
                <p className={`font-semibold text-[11px] flex items-center gap-1 ${dxyState.correlationConfirmed ? 'text-status-win' : 'text-status-loss'}`}>
                  {dxyState.correlationConfirmed ? '✅' : '❌'} {dxyState.correlationConfirmed ? 'Aligned' : 'Conflict'}
                </p>
              </div>
            )}
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
          {onWon && (
            <button
              onClick={() => onWon(signal.id)}
              disabled={outcomeUpdating}
              className="flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'rgba(0,230,118,0.1)', color: 'var(--status-win)', border: '1px solid rgba(0,230,118,0.15)' }}
            >
              {outcomeUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              Won
            </button>
          )}
          {onLost && (
            <button
              onClick={() => onLost(signal.id)}
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
