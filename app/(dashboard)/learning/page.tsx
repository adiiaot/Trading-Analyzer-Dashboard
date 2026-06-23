"use client";

import { Card } from "../components/ui/Card";
import { Tabs } from "../components/ui/Tabs";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export default function LearningPage() {
  const educationContent = (
    <div className="space-y-4">
      <div className="space-y-3">
        <p className="text-text-secondary font-semibold mb-4">📖 Educational Sections:</p>

        {[
          { title: "Forex 101", articles: 3, time: "14 min" },
          { title: "Gold Trading Fundamentals", articles: 4, time: "31 min" },
          { title: "Technical Analysis", articles: 5, time: "43 min" },
          { title: "Trading Psychology & Risk", articles: 4, time: "26 min" },
          { title: "Mr PFX Strategy Deep Dive", articles: 7, time: "49 min" },
        ].map((section, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-text-primary">{section.title}</h4>
                <p className="text-xs text-text-secondary mt-1">
                  {section.articles} articles • {section.time} read time
                </p>
              </div>
              <Button variant="secondary" className="text-xs">
                Start Learning
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const chartPracticeContent = (
    <div className="space-y-4">
      <Card header="Interactive Chart Practice Tool">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <select className="bg-bg-tertiary text-text-primary px-3 py-2 rounded text-sm">
              <option>XAU/USD</option>
            </select>
            <select className="bg-bg-tertiary text-text-primary px-3 py-2 rounded text-sm">
              <option>1H</option>
              <option>4H</option>
              <option>Daily</option>
            </select>
            <select className="bg-bg-tertiary text-text-primary px-3 py-2 rounded text-sm">
              <option>Last 30 days</option>
              <option>Last 60 days</option>
              <option>Last 90 days</option>
            </select>
          </div>

          <div className="h-96 bg-bg-tertiary rounded flex items-center justify-center">
            <p className="text-text-secondary">[Interactive Chart with Drawing Tools]</p>
          </div>

          <Card className="bg-bg-tertiary p-4">
            <p className="text-sm text-accent-gold font-semibold mb-3">📊 Learning Task:</p>
            <p className="text-text-primary text-sm mb-4">
              "Identify 2 support levels and 1 resistance level on this 1H chart"
            </p>
            <div className="flex space-x-2">
              <Button variant="primary" className="text-sm">
                Submit Answer
              </Button>
              <Button variant="secondary" className="text-sm">
                Show Solution
              </Button>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );

  const backtesterContent = (
    <div className="space-y-4">
      <Card header="Backtest Configuration">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-text-secondary text-sm mb-1 block">Symbol</label>
              <input
                type="text"
                value="XAU/USD"
                disabled
                className="w-full bg-bg-tertiary text-text-primary px-3 py-2 rounded text-sm"
              />
            </div>
            <div>
              <label className="text-text-secondary text-sm mb-1 block">Timeframe</label>
              <input
                type="text"
                value="5m Entry, 1H/4H Analysis"
                disabled
                className="w-full bg-bg-tertiary text-text-primary px-3 py-2 rounded text-sm"
              />
            </div>
            <div>
              <label className="text-text-secondary text-sm mb-1 block">From Date</label>
              <input
                type="date"
                className="w-full bg-bg-tertiary text-text-primary px-3 py-2 rounded text-sm"
              />
            </div>
            <div>
              <label className="text-text-secondary text-sm mb-1 block">To Date</label>
              <input
                type="date"
                className="w-full bg-bg-tertiary text-text-primary px-3 py-2 rounded text-sm"
              />
            </div>
          </div>
          <Button variant="primary" className="w-full">
            Run Backtest
          </Button>
        </div>
      </Card>

      <Card header="Sample Results">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Trades", value: "42", color: "text-text-primary" },
            { label: "Win Rate", value: "73.8%", color: "success-text" },
            { label: "P&L", value: "+$87.50", color: "success-text" },
          ].map((stat, idx) => (
            <div key={idx} className="p-3 bg-bg-tertiary rounded text-center">
              <p className="text-text-secondary text-xs">{stat.label}</p>
              <p className={`font-bold font-mono ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="h-64 bg-bg-tertiary rounded flex items-center justify-center mb-4">
          <p className="text-text-secondary">[Equity Curve Chart]</p>
        </div>

        <Button variant="secondary" className="w-full text-sm">
          Export Results (CSV/PDF)
        </Button>
      </Card>
    </div>
  );

  const paperTradingContent = (
    <div className="space-y-4">
      <Card header="Virtual Account Status">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[
            { label: "Balance", value: "$10,000", color: "text-text-primary" },
            { label: "Current P&L", value: "+$245.30", color: "success-text" },
            { label: "Win Rate", value: "62.5%", color: "success-text" },
            { label: "Open Positions", value: "2", color: "text-accent-blue" },
          ].map((stat, idx) => (
            <div key={idx} className="p-3 bg-bg-tertiary rounded">
              <p className="text-text-secondary text-xs">{stat.label}</p>
              <p className={`font-bold font-mono ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card header="Quick Trade Entry">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <select className="bg-bg-tertiary text-text-primary px-3 py-2 rounded text-sm col-span-2">
              <option>BUY</option>
              <option>SELL</option>
            </select>
            <input
              type="number"
              placeholder="Entry Price"
              className="bg-bg-tertiary text-text-primary px-3 py-2 rounded text-sm"
            />
            <input
              type="number"
              placeholder="Lots"
              className="bg-bg-tertiary text-text-primary px-3 py-2 rounded text-sm"
            />
            <input
              type="number"
              placeholder="TP Price"
              className="bg-bg-tertiary text-text-primary px-3 py-2 rounded text-sm"
            />
            <input
              type="number"
              placeholder="SL Price"
              className="bg-bg-tertiary text-text-primary px-3 py-2 rounded text-sm"
            />
          </div>
          <Badge variant="success">Risk/Reward: 1:1.33 ✓</Badge>
          <Button variant="primary" className="w-full">
            Place Trade
          </Button>
        </div>
      </Card>

      <Card header="Open Positions">
        <div className="space-y-3">
          {[
            { side: "BUY", qty: "0.1", entry: 2040.5, price: 2042.8, pnl: "+$23" },
            { side: "SELL", qty: "0.05", entry: 2045.3, price: 2042.8, pnl: "+$12.50" },
          ].map((pos, idx) => (
            <div key={idx} className="p-3 bg-bg-tertiary rounded flex justify-between items-start">
              <div>
                <p className="font-bold text-text-primary">
                  {pos.side} {pos.qty} XAU/USD @ {pos.entry}
                </p>
                <p className="text-xs text-text-secondary">Price: {pos.price}</p>
              </div>
              <Badge variant="success" className="font-bold">
                {pos.pnl}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const tabs = [
    { label: "Education", content: educationContent },
    { label: "Chart Practice", content: chartPracticeContent },
    { label: "Backtester", content: backtesterContent },
    { label: "Paper Trading", content: paperTradingContent },
  ];

  return (
    <div>
      <Card>
        <Tabs tabs={tabs} />
      </Card>
    </div>
  );
}
