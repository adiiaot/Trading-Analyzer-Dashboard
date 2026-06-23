"use client";

import { Card } from "../components/ui/Card";
import { Tabs } from "../components/ui/Tabs";
import { Badge } from "../components/ui/Badge";

export default function AnalysisPage() {
  const technicalContent = (
    <div className="space-y-6">
      <Card header="Multi-Timeframe Chart Display">
        <div className="h-96 flex items-center justify-center bg-bg-tertiary rounded">
          <p className="text-text-secondary">[Interactive Chart with Timeframe Tabs]</p>
        </div>
      </Card>

      <Card header="Technical Summary">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-bg-tertiary rounded">
              <p className="text-text-secondary text-xs mb-1">Trend (1H)</p>
              <p className="font-bold success-text">UPTREND</p>
              <p className="text-xs text-text-secondary">Higher Highs, Higher Lows</p>
            </div>
            <div className="p-3 bg-bg-tertiary rounded">
              <p className="text-text-secondary text-xs mb-1">Momentum</p>
              <p className="font-bold text-accent-blue">STRONG</p>
              <p className="text-xs text-text-secondary">RSI: 68 (Overbought Zone)</p>
            </div>
            <div className="p-3 bg-bg-tertiary rounded">
              <p className="text-text-secondary text-xs mb-1">Volatility</p>
              <p className="font-bold">MODERATE</p>
              <p className="text-xs text-text-secondary">ATR: 12.45 pips</p>
            </div>
            <div className="p-3 bg-bg-tertiary rounded">
              <p className="text-text-secondary text-xs mb-1">Price Position</p>
              <p className="font-bold gold-text">NEAR R1</p>
              <p className="text-xs text-text-secondary">$2,048.20</p>
            </div>
          </div>
        </div>
      </Card>

      <Card header="Potential Setup (Mr PFX)">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between p-2 bg-bg-tertiary rounded">
            <span>Current Structure</span>
            <Badge variant="warning">Building</Badge>
          </div>
          <div className="flex justify-between p-2 bg-bg-tertiary rounded">
            <span>Rejection Levels</span>
            <span className="text-text-primary">$2,050 zone</span>
          </div>
          <div className="flex justify-between p-2 bg-bg-tertiary rounded">
            <span>Breakout Confirmation</span>
            <Badge variant="success">Ready</Badge>
          </div>
        </div>
      </Card>
    </div>
  );

  const volumeContent = (
    <div className="space-y-6">
      <Card header="Volume Chart">
        <div className="h-80 flex items-center justify-center bg-bg-tertiary rounded">
          <p className="text-text-secondary">[Volume Bars Chart + Profile]</p>
        </div>
      </Card>

      <Card header="Volume Metrics">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-bg-tertiary rounded">
              <p className="text-text-secondary text-xs mb-1">Current</p>
              <p className="font-bold font-mono">120K</p>
            </div>
            <div className="p-3 bg-bg-tertiary rounded">
              <p className="text-text-secondary text-xs mb-1">vs 24H Avg</p>
              <Badge variant="success">+15%</Badge>
            </div>
            <div className="p-3 bg-bg-tertiary rounded">
              <p className="text-text-secondary text-xs mb-1">vs 7D Avg</p>
              <Badge variant="success">+8%</Badge>
            </div>
            <div className="p-3 bg-bg-tertiary rounded">
              <p className="text-text-secondary text-xs mb-1">Trend</p>
              <p className="font-bold success-text">Strong Up</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const economicContent = (
    <div className="space-y-4">
      <div className="p-4 bg-accent-red/20 border border-accent-red/50 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-accent-red">HIGH IMPACT - Today 2:00 PM ET</p>
            <p className="text-sm text-text-primary mt-1">Core PCE Price Index (USA)</p>
            <p className="text-xs text-text-secondary mt-2">Expected: 0.2% | Previous: 0.3%</p>
          </div>
          <div className="text-right">
            <Badge variant="danger">⏰ 45m</Badge>
            <p className="text-xs text-text-secondary mt-2">Bullish if lower</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-accent-gold/20 border border-accent-gold/50 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-accent-gold">MEDIUM IMPACT - Today 8:30 AM ET (PASSED)</p>
            <p className="text-sm text-text-primary mt-1">Initial Jobless Claims</p>
            <p className="text-xs text-text-secondary mt-2">Actual: 415K | Expected: 410K</p>
          </div>
          <Badge variant="warning">WORSE</Badge>
        </div>
      </div>

      <div className="p-4 bg-accent-blue/20 border border-accent-blue/50 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-accent-blue">HIGH IMPACT - Tomorrow 10:00 AM ET</p>
            <p className="text-sm text-text-primary mt-1">Fed Chair Powell Speech</p>
            <p className="text-xs text-text-secondary mt-2">Expected volatility increase</p>
          </div>
          <Badge variant="info">Upcoming</Badge>
        </div>
      </div>
    </div>
  );

  const macroContent = (
    <div className="space-y-4">
      <Card header="USD Strength">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">USD Index</span>
            <span className="font-bold font-mono">103.45</span>
          </div>
          <Badge variant="danger">🔴 Strong Dollar = Headwind for Gold</Badge>
          <p className="text-xs text-text-secondary mt-2">7D Change: -0.12% | 30D Change: +1.2%</p>
        </div>
      </Card>

      <Card header="Real Interest Rates">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Rate Level</span>
            <span className="font-bold font-mono">1.85%</span>
          </div>
          <Badge variant="danger">⬆️ Higher = Less Appeal for Gold</Badge>
        </div>
      </Card>

      <Card header="Risk Sentiment">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Stock Market (SPY)</span>
            <Badge variant="success">+0.3%</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">VIX (Fear Index)</span>
            <span className="text-text-primary">16.2 (Low)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Crypto (BTC)</span>
            <Badge variant="success">+1.2%</Badge>
          </div>
        </div>
      </Card>
    </div>
  );

  const tabs = [
    { label: "Technical Analysis", content: technicalContent },
    { label: "Volume Analysis", content: volumeContent },
    { label: "Economic Calendar", content: economicContent },
    { label: "Macro Trends", content: macroContent },
  ];

  return (
    <div>
      <Card>
        <Tabs tabs={tabs} />
      </Card>
    </div>
  );
}
