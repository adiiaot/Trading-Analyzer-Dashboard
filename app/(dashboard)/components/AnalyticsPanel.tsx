"use client";

import { useState } from "react";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";

export function AnalyticsPanel() {
  const [metrics] = useState({
    volume: 120000,
    volumeAvg24h: 104000,
    atr: 12.45,
    volatilityStatus: "Moderate",
    resistance2: 2055.60,
    resistance1: 2048.20,
    pivot: 2042.10,
    support1: 2036.05,
    support2: 2028.45,
    mrpfxStatus: {
      rejection: "ACTIVE",
      buildUp: "FORMING",
      bos: "NOT YET",
      consolidation: "YES",
    },
  });

  return (
    <div className="space-y-4">
      <Card header="Volume Analytics">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-text-secondary">Current Volume</span>
            <span className="font-bold text-accent-green font-mono">{metrics.volume.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">vs 24H Avg</span>
            <Badge variant="success">+15%</Badge>
          </div>
          <div className="w-full bg-bg-tertiary rounded-full h-2 mt-2">
            <div className="bg-accent-gold h-2 rounded-full" style={{ width: "115%" }} />
          </div>
        </div>
      </Card>

      <Card header="Volatility">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-text-secondary">ATR (14)</span>
            <span className="font-bold font-mono">{metrics.atr} pips</span>
          </div>
          <Badge variant="info">{metrics.volatilityStatus}</Badge>
          <div className="w-full bg-bg-tertiary rounded-full h-2 mt-2">
            <div className="bg-accent-blue h-2 rounded-full" style={{ width: "45%" }} />
          </div>
        </div>
      </Card>

      <Card header="S/R Levels">
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-bg-tertiary p-2 rounded">
              <p className="text-text-secondary">R2</p>
              <p className="font-bold font-mono">${metrics.resistance2.toFixed(2)}</p>
            </div>
            <div className="bg-bg-tertiary p-2 rounded">
              <p className="text-text-secondary">R1</p>
              <p className="font-bold font-mono">${metrics.resistance1.toFixed(2)}</p>
            </div>
            <div className="bg-bg-tertiary p-2 rounded col-span-2">
              <p className="text-text-secondary">Pivot</p>
              <p className="font-bold font-mono">${metrics.pivot.toFixed(2)}</p>
            </div>
            <div className="bg-bg-tertiary p-2 rounded">
              <p className="text-text-secondary">S1</p>
              <p className="font-bold font-mono">${metrics.support1.toFixed(2)}</p>
            </div>
            <div className="bg-bg-tertiary p-2 rounded">
              <p className="text-text-secondary">S2</p>
              <p className="font-bold font-mono">${metrics.support2.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card header="Mr PFX Status">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between p-2 bg-bg-tertiary rounded">
            <span>Levels of Rejection</span>
            <Badge variant="gold">{metrics.mrpfxStatus.rejection}</Badge>
          </div>
          <div className="flex justify-between p-2 bg-bg-tertiary rounded">
            <span>Build-up Structure</span>
            <Badge variant="warning">{metrics.mrpfxStatus.buildUp}</Badge>
          </div>
          <div className="flex justify-between p-2 bg-bg-tertiary rounded">
            <span>Break of Structure</span>
            <Badge variant="info">{metrics.mrpfxStatus.bos}</Badge>
          </div>
          <div className="flex justify-between p-2 bg-bg-tertiary rounded">
            <span>Consolidation</span>
            <Badge variant="success">{metrics.mrpfxStatus.consolidation}</Badge>
          </div>
        </div>
      </Card>

      <Card header="Signal Window">
        <div className="text-center p-4 bg-bg-tertiary rounded">
          <p className="text-accent-gold font-bold font-mono text-lg">3:00 PM - 5:00 PM</p>
          <p className="text-text-secondary text-sm mt-2">Tue-Thu only • Max 2 signals/session</p>
          <p className="text-accent-gold text-xs mt-3">Next window: 3h 45m</p>
        </div>
      </Card>
    </div>
  );
}
