"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, TrendingUp, Zap, X } from "lucide-react";
import { l2Client, type L2Metrics, type L2Signal } from "@/lib/signal-engine";
import { evaluateMicrostructure } from "@/lib/signal-engine/microstructure";

export function L2MetricsWidget() {
  const [metrics, setMetrics] = useState<L2Metrics | null>(null);
  const [l2Signal, setL2Signal] = useState<L2Signal>({ signal: 'neutral', probability: 0, evidence: [] });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    l2Client.connect();
    const unsub = l2Client.subscribe((m) => {
      setMetrics(m);
      setL2Signal(evaluateMicrostructure(m));
    });
    return () => unsub();
  }, []);

  if (!metrics) {
    return (
      <div className="rounded-xl p-3"
        style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center gap-2 text-text-muted">
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="text-xs">Connecting to L2 order book...</span>
        </div>
      </div>
    );
  }

  const isReversal = l2Signal.signal === 'reversal';
  const isContinuation = l2Signal.signal === 'continuation';
  const imbalancePct = (metrics.imbalance * 100).toFixed(0);
  const spreadBps = metrics.midPrice > 0 ? ((metrics.spread / metrics.midPrice) * 10000).toFixed(2) : '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden transition-all cursor-pointer"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: isReversal
          ? '1px solid rgba(var(--status-loss-rgb), 0.3)'
          : isContinuation
          ? '1px solid rgba(var(--status-win-rgb), 0.3)'
          : '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-card)',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" style={{ color: isReversal ? 'var(--status-loss)' : isContinuation ? 'var(--status-win)' : 'var(--accent-gold)' }} />
            <span className="text-[11px] font-semibold text-text-primary">L2 Book</span>
          </div>
          <div className="flex items-center gap-2">
            {isReversal && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: 'rgba(var(--status-loss-rgb), 0.12)', color: 'var(--status-loss)' }}>
                <AlertTriangle className="w-3 h-3" /> Reversal {l2Signal.probability}%
              </span>
            )}
            {isContinuation && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: 'rgba(var(--status-win-rgb), 0.12)', color: 'var(--status-win)' }}>
                <TrendingUp className="w-3 h-3" /> Continuation {l2Signal.probability}%
              </span>
            )}
            {!isReversal && !isContinuation && (
              <span className="text-[9px] text-text-muted px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(var(--text-primary-rgb), 0.04)' }}>
                Neutral
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px]">
          <div>
            <span className="text-text-muted">Imbalance</span>
            <p className={`font-mono font-bold ${metrics.imbalance > 0.1 ? 'text-status-win' : metrics.imbalance < -0.1 ? 'text-status-loss' : 'text-text-primary'}`}>
              {imbalancePct}%
            </p>
          </div>
          <div>
            <span className="text-text-muted">Spread</span>
            <p className="font-mono font-bold text-text-primary">{spreadBps}bps</p>
          </div>
          <div>
            <span className="text-text-muted">Bid Depth</span>
            <p className="font-mono font-bold text-status-win">{metrics.bidDepth.toFixed(1)}</p>
          </div>
          <div>
            <span className="text-text-muted">Ask Depth</span>
            <p className="font-mono font-bold text-status-loss">{metrics.askDepth.toFixed(1)}</p>
          </div>
          <div>
            <span className="text-text-muted">Cancel B</span>
            <p className="font-mono font-bold text-text-primary">{metrics.cancelRateBid.toFixed(1)}/s</p>
          </div>
          <div>
            <span className="text-text-muted">Act.</span>
            <p className="font-mono font-bold text-text-primary">{metrics.totalActivity.toFixed(1)}/s</p>
          </div>
        </div>

        {expanded && l2Signal.evidence.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-1 text-[10px] text-text-muted space-y-0.5"
          >
            {l2Signal.evidence.map((e, i) => (
              <p key={i} className="flex items-start gap-1">• {e}</p>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
