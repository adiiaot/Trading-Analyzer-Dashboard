"use client";

import { PriceTickerWidget } from "../components/PriceTickerWidget";
import { MajorPairsWidget } from "../components/MajorPairsWidget";
import { AnalyticsPanel } from "../components/AnalyticsPanel";
import { SignalCard } from "../components/SignalCard";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export default function MarketOverviewPage() {
  const recentSignals = [
    {
      signalId: 42,
      timestamp: "Today 2:45 PM",
      status: "pending" as const,
      confidence: 78,
      orders: [
        { level: 2040.5, tp: 2043.2, status: "pending" as const, pips: 32 },
        { level: 2038.1, tp: 2041.8, status: "pending" as const, pips: 36 },
        { level: 2035.7, tp: 2039.5, status: "pending" as const, pips: 37 },
        { level: 2033.3, tp: 2037.1, status: "pending" as const, pips: 37 },
      ],
      expiresAt: "5:00 PM",
    },
    {
      signalId: 41,
      timestamp: "Yesterday 4:30 PM",
      status: "closed" as const,
      confidence: 85,
      orders: [
        { level: 2038.5, tp: 2041.2, status: "filled" as const, pips: 27 },
        { level: 2036.1, tp: 2039.8, status: "filled" as const, pips: 37 },
        { level: 2033.8, tp: 2037.5, status: "expired" as const, pips: 0 },
        { level: 2031.5, tp: 2035.2, status: "expired" as const, pips: 0 },
      ],
      pnl: 45.2,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <PriceTickerWidget />

        <Card header="XAU/USD 1H Chart" className="mb-6 h-96 flex items-center justify-center">
          <div className="text-center text-text-secondary">
            <p className="mb-2">TradingView Lightweight Chart</p>
            <p className="text-sm">[Chart Integration Point]</p>
            <p className="text-xs mt-4">Embed TradingView Lightweight Charts or Recharts here</p>
          </div>
        </Card>

        <Card header="Recent Bot Signals" className="mb-6">
          <div>
            {recentSignals.map((signal) => (
              <SignalCard key={signal.signalId} {...signal} />
            ))}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-4">
        <MajorPairsWidget />
        <AnalyticsPanel />
      </div>
    </div>
  );
}
