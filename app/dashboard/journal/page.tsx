"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useDashboardData } from "@/lib/data-context";
import { PenSquare, TrendingUp, TrendingDown, Filter, X, Save } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function JournalPage() {
  const { journalEntries, addJournalEntry } = useDashboardData();
  const [showForm, setShowForm] = useState(false);
  const [tagFilter, setTagFilter] = useState("All");

  const [form, setForm] = useState({
    pair: "XAU/USD",
    dir: "BUY",
    entry: "",
    exit: "",
    pips: "",
    pnl: "",
    setup: "",
    emoji: "Focused",
    tag: "Trend Following",
  });

  const handleSubmit = async () => {
    await addJournalEntry({
      ...form,
      date: new Date().toISOString().split("T")[0],
      entry: parseFloat(form.entry),
      exit: parseFloat(form.exit),
      pips: parseFloat(form.pips),
      pnl: parseFloat(form.pnl),
    });
    setForm({ pair: "XAU/USD", dir: "BUY", entry: "", exit: "", pips: "", pnl: "", setup: "", emoji: "Focused", tag: "Trend Following" });
    setShowForm(false);
  };

  const entries = journalEntries;
  const wins = entries.filter((e: any) => e.pnl >= 0).length;
  const losses = entries.filter((e: any) => e.pnl < 0).length;
  const total = entries.length;

  const filtered = tagFilter === "All" ? entries : entries.filter((e: any) => e.tag === tagFilter);

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-text-primary">Journal</h1>
          <p className="text-sm text-text-muted">Record, reflect, improve</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <PenSquare className="w-4 h-4" /> New Entry
          </button>
        </motion.div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Entries", value: total.toString(), color: "text-text-primary" },
          { label: "Wins", value: wins.toString(), color: "text-status-win" },
          { label: "Losses", value: losses.toString(), color: "text-status-loss" },
          { label: "Win Rate", value: total > 0 ? `${((wins / total) * 100).toFixed(1)}%` : "0%", color: "text-accent-gold" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
            className="stat-card"
          >
            <p className="stat-label">{s.label}</p>
            <p className={`stat-value ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-text-muted" />
            {["All", "Trend Following", "Reversal", "Fakeout", "Breakout"].map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag)}
                className={`px-3 py-1 rounded-pill text-xs font-medium transition-all ${
                  tagFilter === tag
                    ? "text-accent-gold glass-card"
                    : "text-text-secondary hover:text-text-primary"
                }`}
                style={tagFilter === tag ? { border: "1px solid rgba(240, 180, 41, 0.3)" } : {}}
              >
                {tag}
              </button>
            ))}
          </div>

          <motion.div variants={container} initial="hidden" animate="visible" className="space-y-3">
            {filtered.length > 0 ? filtered.map((e: any, i: number) => (
              <motion.div
                key={e.id || i}
                variants={item}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="glass-card rounded-card p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${e.dir === "BUY" ? "bg-status-win/10" : "bg-status-loss/10"}`}>
                      {e.dir === "BUY" ? <TrendingUp className="w-4 h-4 text-status-win" /> : <TrendingDown className="w-4 h-4 text-status-loss" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-text-primary">{e.pair} {e.dir}</p>
                      <p className="text-xs text-text-muted">{e.date}</p>
                    </div>
                  </div>
                  <Badge variant={e.pnl >= 0 ? "win" : "loss"}>{e.pnl >= 0 ? "+" : ""}{e.pnl.toFixed(2)}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                  <div><p className="text-xs text-text-muted">Entry / Exit</p><p className="font-mono text-text-primary">{e.entry} &rarr; {e.exit}</p></div>
                  <div><p className="text-xs text-text-muted">Pips</p><p className={`font-mono font-semibold ${e.pips >= 0 ? "text-status-win" : "text-status-loss"}`}>{e.pips >= 0 ? "+" : ""}{e.pips}</p></div>
                  <div><p className="text-xs text-text-muted">Emotion</p><p className="text-text-primary">{e.emoji}</p></div>
                </div>

                <div className="glass-card rounded-card p-3">
                  <p className="text-xs text-text-muted mb-0.5">Setup</p>
                  <p className="text-sm text-text-primary">{e.setup}</p>
                </div>

                <div className="flex gap-2 mt-3">
                  <Badge variant="gold">{e.tag}</Badge>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-12 text-sm text-text-muted">
                No journal entries yet. Click &quot;New Entry&quot; to start logging your trades.
              </div>
            )}
          </motion.div>
        </Card>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card w-[440px] max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-text-primary">New Journal Entry</h3>
                <button onClick={() => setShowForm(false)} className="btn-ghost p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">Pair</label>
                    <select className="input" value={form.pair} onChange={(e) => setForm({ ...form, pair: e.target.value })}>
                      <option value="XAU/USD">XAU/USD</option>
                      <option value="EUR/USD">EUR/USD</option>
                      <option value="GBP/USD">GBP/USD</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">Direction</label>
                    <select className="input" value={form.dir} onChange={(e) => setForm({ ...form, dir: e.target.value })}>
                      <option value="BUY">BUY</option>
                      <option value="SELL">SELL</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">Entry Price</label>
                    <input type="number" step="0.01" className="input" value={form.entry} onChange={(e) => setForm({ ...form, entry: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">Exit Price</label>
                    <input type="number" step="0.01" className="input" value={form.exit} onChange={(e) => setForm({ ...form, exit: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">Pips</label>
                    <input type="number" step="0.1" className="input" value={form.pips} onChange={(e) => setForm({ ...form, pips: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">P&L ($)</label>
                    <input type="number" step="0.01" className="input" value={form.pnl} onChange={(e) => setForm({ ...form, pnl: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-text-muted mb-1 block">Setup Notes</label>
                  <textarea
                    className="input min-h-[80px] resize-none"
                    value={form.setup}
                    onChange={(e) => setForm({ ...form, setup: e.target.value })}
                    placeholder="Describe your trade setup..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">Emotion</label>
                    <select className="input" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })}>
                      {["Focused", "Calm", "Confident", "Impatient", "Greedy", "Fearful", "Neutral"].map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">Tag</label>
                    <select className="input" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}>
                      {["Trend Following", "Reversal", "Fakeout", "Breakout", "Scalp"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-5 pt-4" style={{ borderTop: "1px solid var(--glass-border)" }}>
                <button onClick={handleSubmit} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Save Entry
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
