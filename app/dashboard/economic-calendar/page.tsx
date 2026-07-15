"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, TrendingDown, Minus, Loader2, ChevronDown, ChevronUp, Brain } from "lucide-react";
import type { EconEvent } from "@/types";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const impacts: Record<string, { label: string; color: string }> = {
  high: { label: 'HIGH', color: 'rgb(var(--status-loss-rgb))' },
  medium: { label: 'MED', color: 'rgb(var(--accent-gold-rgb))' },
  low: { label: 'LOW', color: 'rgb(var(--text-muted))' },
};

function ImpactBadge({ impact }: { impact: string }) {
  const info = impacts[impact?.toLowerCase() || 'low'] || impacts.low;
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{
      background: `${info.color}15`,
      color: info.color,
    }}>{info.label}</span>
  );
}

function PredictionBadge({ direction, confidence }: { direction: string; confidence: number }) {
  if (!direction) return null;
  const isBullish = direction === 'bullish';
  const isBearish = direction === 'bearish';
  const color = isBullish ? 'rgb(var(--status-win-rgb))' : isBearish ? 'rgb(var(--status-loss-rgb))' : 'rgb(var(--text-muted))';
  const Icon = isBullish ? TrendingUp : isBearish ? TrendingDown : Minus;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: `${color}15`, color }}>
        <Icon className="w-3.5 h-3.5" />
        {isBullish ? 'BULLISH' : isBearish ? 'BEARISH' : 'NEUTRAL'}
      </div>
      <div className="flex-1 max-w-[80px] h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${confidence}%`, background: color }} />
      </div>
      <span className="text-[10px] text-text-muted w-8 text-right">{confidence}%</span>
    </div>
  );
}

export default function EconomicCalendarPage() {
  const [events, setEvents] = useState<EconEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [predictions, setPredictions] = useState<Record<string, { direction: string; confidence: number; explanation: string }>>({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/econ-calendar');
        const data = await res.json();
        if (data?.events) setEvents(data.events);
      } catch {}
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const predictEvent = useCallback(async (event: EconEvent) => {
    if (predictions[event.id]) return;
    setPredicting(p => new Set(p).add(event.id));
    try {
      const res = await fetch('/api/econ-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: event.title,
          impact: event.impact,
          forecast: event.forecast,
          previous: event.previous,
        }),
      });
      const data = await res.json();
      if (data?.prediction) {
        setPredictions(p => ({ ...p, [event.id]: data.prediction }));
      }
    } catch {}
    setPredicting(p => { const n = new Set(p); n.delete(event.id); return n; });
  }, [predictions]);

  useEffect(() => {
    if (events.length > 0 && Object.keys(predictions).length === 0) {
      events.slice(0, 5).forEach(e => predictEvent(e));
    }
  }, [events, predictEvent, predictions]);

  const toggleExpand = (id: string) => {
    setExpanded(p => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts * 1000);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (diffMins < 0) return `${timeStr} (passed)`;
    if (diffMins < 60) return `${timeStr} (in ${diffMins}m)`;
    const diffHours = Math.floor(diffMins / 60);
    return `${timeStr} (in ${diffHours}h ${diffMins % 60}m)`;
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Calendar className="w-6 h-6 text-accent-gold" />
          Economic Calendar
        </h1>
        <p className="text-sm text-text-muted mt-1">Upcoming high-impact events with AI-powered XAU/USD gold predictions</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-accent-gold" />
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card rounded-xl p-10 text-center text-text-muted text-sm">
          No upcoming events found.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const pred = predictions[event.id];
            const isExpanded = expanded.has(event.id);
            const predColor = pred?.direction === 'bullish' ? 'rgb(var(--status-win-rgb))'
              : pred?.direction === 'bearish' ? 'rgb(var(--status-loss-rgb))'
              : 'rgb(var(--text-muted))';

            return (
              <motion.div key={event.id} variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0 },
              }} className="glass-card rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  border: pred ? `1px solid ${predColor}25` : '1px solid var(--glass-border)',
                }}>
                <div className="p-4 cursor-pointer" onClick={() => toggleExpand(event.id)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <ImpactBadge impact={event.impact} />
                        {event.currency && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                            {event.currency}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm text-text-primary truncate">{event.title}</h3>
                      <p className="text-xs text-text-muted mt-0.5">{formatTime(event.timestamp)}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {pred ? (
                        <PredictionBadge direction={pred.direction} confidence={pred.confidence} />
                      ) : predicting.has(event.id) ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-gold" />
                          <span className="text-[10px] text-text-muted">Predicting...</span>
                        </div>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); predictEvent(event); }}
                          className="text-[10px] font-medium px-2 py-1 rounded"
                          style={{ background: 'rgba(240, 180, 41, 0.1)', color: 'var(--accent-gold)' }}>
                          Predict
                        </button>
                      )}
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    className="px-4 pb-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                    <div className="pt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      {event.forecast && (
                        <div>
                          <span className="text-text-muted">Forecast</span>
                          <p className="text-text-primary font-medium mt-0.5">{event.forecast}</p>
                        </div>
                      )}
                      {event.previous && (
                        <div>
                          <span className="text-text-muted">Previous</span>
                          <p className="text-text-primary font-medium mt-0.5">{event.previous}</p>
                        </div>
                      )}
                      {event.description && (
                        <div className="col-span-2">
                          <span className="text-text-muted">About</span>
                          <p className="text-text-primary mt-0.5">{event.description}</p>
                        </div>
                      )}
                    </div>

                    {pred && (
                      <div className="mt-3 p-3 rounded-lg" style={{
                        background: `${predColor}08`,
                        border: `1px solid ${predColor}15`,
                      }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-semibold uppercase" style={{ color: predColor }}>
                            AI Gold Prediction
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary">{pred.explanation}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="glass-card rounded-xl p-4 text-xs text-text-muted space-y-2">
        <p className="font-medium text-text-primary flex items-center gap-2">
          <Brain className="w-4 h-4 text-accent-gold" />
          How predictions work
        </p>
        <p>Each event is analyzed by NVIDIA AI to predict gold market impact. High-impact events (NFP, CPI, FOMC) get top priority. When AI is unavailable, keyword-based heuristics provide fallback predictions. Predictions refresh every hour.</p>
      </div>
    </motion.div>
  );
}
