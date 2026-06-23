"use client";

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/ui/Table";
import { SignalCard } from "../components/SignalCard";

export default function SignalsPage() {
  const signalStats = [
    { label: "Signals Today", value: "3", color: "text-text-primary" },
    { label: "Signals Filled", value: "2", color: "success-text" },
    { label: "Current P&L", value: "+$67.30", color: "success-text" },
    { label: "Win Rate", value: "66.7%", color: "success-text" },
  ];

  const activeSignals = [
    {
      signalId: 47,
      timestamp: "Today 3:15 PM",
      status: "pending" as const,
      confidence: 82,
      orders: [
        { level: 2040.5, tp: 2043.2, status: "filled" as const, pips: 27 },
        { level: 2038.1, tp: 2041.8, status: "pending" as const, pips: 36 },
        { level: 2035.7, tp: 2039.5, status: "pending" as const, pips: 37 },
        { level: 2033.3, tp: 2037.1, status: "pending" as const, pips: 37 },
      ],
      pnl: 28.8,
      expiresAt: "5:00 PM",
    },
  ];

  const historicalSignals = [
    ["#47", "Today 3:15 PM", "ACTIVE", "+$28.80", "1/4", "82%"],
    ["#46", "Yesterday 3:30 PM", "CLOSED", "+$45.20", "2/4", "100%"],
    ["#45", "2 days ago", "CLOSED", "-$12.50", "0/4", "0%"],
    ["#44", "3 days ago", "CLOSED", "+$67.30", "3/4", "75%"],
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {signalStats.map((stat, idx) => (
          <Card key={idx} className="text-center">
            <p className="text-text-secondary text-sm mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card header="Active Signals">
        <div>
          {activeSignals.map((signal) => (
            <SignalCard key={signal.signalId} {...signal} />
          ))}
        </div>
      </Card>

      <Card header="Signal Archive (Last 30 Days)">
        <div className="flex space-x-2 mb-4">
          <select className="bg-bg-tertiary text-text-primary px-3 py-1 rounded text-sm">
            <option>All Signals</option>
            <option>Filled Only</option>
            <option>Expired</option>
          </select>
          <select className="bg-bg-tertiary text-text-primary px-3 py-1 rounded text-sm">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>
        </div>

        <Table
          headers={["Signal", "Date/Time", "Status", "P&L", "Orders Filled", "Win %"]}
          rows={historicalSignals.map((row) => [
            <span className="font-bold gold-text">{row[0]}</span>,
            <span className="text-xs">{row[1]}</span>,
            <Badge variant={row[2] === "ACTIVE" ? "gold" : "success"}>{row[2]}</Badge>,
            <span className={row[3].startsWith("-") ? "danger-text font-bold" : "success-text font-bold"}>
              {row[3]}
            </span>,
            row[4],
            <span className="font-mono">{row[5]}</span>,
          ])}
        />

        <div className="mt-6 pt-6 border-t border-bg-tertiary grid grid-cols-2 gap-4">
          <div>
            <p className="text-text-secondary text-sm mb-1">Total Signals (30d)</p>
            <p className="text-2xl font-bold text-text-primary">45</p>
          </div>
          <div>
            <p className="text-text-secondary text-sm mb-1">Total P&L (30d)</p>
            <p className="text-2xl font-bold success-text">+$456.80</p>
          </div>
        </div>
      </Card>

      <Card header="Alert Settings">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-bg-tertiary rounded">
            <span className="text-text-primary">Telegram Alerts</span>
            <Badge variant="success">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-bg-tertiary rounded">
            <span className="text-text-primary">Desktop Notifications</span>
            <Badge variant="success">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-bg-tertiary rounded">
            <span className="text-text-primary">Email Digest</span>
            <Badge variant="success">Daily</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
