"use client";

import { useState, useEffect } from "react";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume: number;
  spread?: number;
}

export function PriceTickerWidget() {
  const [priceData, setPriceData] = useState<PriceData>({
    symbol: "XAU/USD",
    price: 2041.35,
    change24h: 9.25,
    changePercent24h: 0.45,
    high24h: 2052.80,
    low24h: 2031.20,
    volume: 120000,
    spread: 0.5,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPriceData((prev) => ({
        ...prev,
        price: prev.price + (Math.random() - 0.5) * 0.5,
        volume: prev.volume + Math.floor((Math.random() - 0.5) * 5000),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const isUp = priceData.change24h >= 0;

  return (
    <Card className="mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold gold-text">{priceData.symbol}</h3>
          <p className="text-text-secondary text-sm">Gold / US Dollar</p>
        </div>
        <Badge variant={isUp ? "success" : "danger"}>
          {isUp ? "↑" : "↓"} {Math.abs(priceData.changePercent24h).toFixed(2)}%
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-text-secondary text-sm mb-1">Price</p>
          <p className="text-4xl font-bold gold-text font-mono">${priceData.price.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-text-secondary text-sm mb-1">24H Change</p>
          <p className={`text-2xl font-bold font-mono ${isUp ? "success-text" : "danger-text"}`}>
            {isUp ? "+" : ""}{priceData.change24h.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-text-secondary text-sm mb-1">24H Range</p>
          <p className="text-text-primary font-mono text-sm">
            L: ${priceData.low24h.toFixed(2)} | H: ${priceData.high24h.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-text-secondary text-sm mb-1">Volume</p>
          <p className="text-text-primary font-mono">
            {(priceData.volume / 1000).toFixed(0)}K contracts
          </p>
        </div>
      </div>
    </Card>
  );
}
