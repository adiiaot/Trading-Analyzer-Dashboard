"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Tabs } from "../components/ui/Tabs";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function LearningPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5">
      <motion.div variants={item}>
        <h1 className="text-lg md:text-xl font-bold text-text-primary">Learning Hub</h1>
        <p className="text-sm text-text-muted">Education, practice & backtesting</p>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <Tabs tabs={[
            { label: "Education", content: <EducationContent /> },
            { label: "Paper Trading", content: <PaperTrading /> },
          ]} />
        </Card>
      </motion.div>
    </motion.div>
  );
}

function EducationContent() {
  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="grid gap-3">
      {[
        { title: "Forex 101", articles: 3, time: "14 min" },
        { title: "Gold Trading Fundamentals", articles: 4, time: "31 min" },
        { title: "Technical Analysis", articles: 5, time: "43 min" },
        { title: "Psychology & Risk", articles: 4, time: "26 min" },
        { title: "Mr PFX Strategy Deep Dive", articles: 7, time: "49 min" },
      ].map((s, i) => (
        <motion.div
          key={i} variants={item}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="card p-4 flex items-center justify-between"
        >
          <div>
            <h4 className="font-semibold text-sm text-text-primary">{s.title}</h4>
            <p className="text-xs text-text-muted mt-0.5">{s.articles} articles · {s.time}</p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button variant="secondary">Start</Button>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function PaperTrading() {
  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-4">
      <motion.div variants={item}>
        <Card header="Virtual Account">
          <div className="grid grid-cols-2 gap-4">
            {[
              ["Balance", "$10,000", "text-text-primary"],
              ["P&L", "+$245.30", "text-status-win"],
              ["Win Rate", "62.5%", "text-status-win"],
              ["Open", "2", "text-status-info"],
            ].map(([l, v, c]) => (
              <div key={l as string} className="bg-surface-overlay rounded-card p-3">
                <p className="text-xs text-text-muted">{l as string}</p>
                <p className={`font-bold font-mono ${c as string}`}>{v as string}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card header="Open Positions">
          <div className="space-y-2">
            {[
              { side: "BUY", qty: "0.1", entry: 2040.5, price: 2042.8, pnl: "+$23" },
              { side: "SELL", qty: "0.05", entry: 2045.3, price: 2042.8, pnl: "+$12.50" },
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between bg-surface-overlay rounded-card p-3"
              >
                <div>
                  <p className="font-semibold text-sm text-text-primary">{p.side} {p.qty} @ {p.entry}</p>
                  <p className="text-xs text-text-muted">Price: {p.price}</p>
                </div>
                <Badge variant="win">{p.pnl}</Badge>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
