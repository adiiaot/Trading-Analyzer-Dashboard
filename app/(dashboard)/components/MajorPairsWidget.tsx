"use client";

import { useState, useEffect } from "react";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";

interface PairData {
  symbol: string;
  price: number;
  change24h: number;
  volume: string;
}

export function MajorPairsWidget() {
  const [pairs, setPairs] = useState<PairData[]>([
    { symbol: "XAU/USD", price: 2041.35, change24h: 0.45, volume: "120K" },
    { symbol: "USD Index", price: 103.45, change24h: -0.12, volume: "—" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPairs((prevPairs) =>
        prevPairs.map((pair) => ({
          ...pair,
          price: pair.price + (Math.random() - 0.5) * 0.2,
          change24h: pair.change24h + (Math.random() - 0.5) * 0.05,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card header="Live Market Data">
      <div className="space-y-4">
        {pairs.map((pair) => (
          <div key={pair.symbol} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
            <div>
              <p className="font-bold text-text-primary">{pair.symbol}</p>
              <p className="text-sm text-text-secondary">Vol: {pair.volume}</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-text-primary">${pair.price.toFixed(2)}</p>
              <Badge variant={pair.change24h >= 0 ? "success" : "danger"} className="text-xs">
                {pair.change24h >= 0 ? "↑" : "↓"} {Math.abs(pair.change24h).toFixed(2)}%
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
