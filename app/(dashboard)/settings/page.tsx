"use client";

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Tabs } from "../components/ui/Tabs";

export default function SettingsPage() {
  const accountTab = (
    <div className="space-y-4">
      <Card header="Exness Demo Account">
        <div className="space-y-3">
          <div className="flex justify-between p-3 bg-bg-tertiary rounded">
            <span className="text-text-secondary">Account Status</span>
            <Badge variant="success">Connected</Badge>
          </div>
          <div className="flex justify-between p-3 bg-bg-tertiary rounded">
            <span className="text-text-secondary">Balance</span>
            <span className="font-mono font-bold">$1,245.50</span>
          </div>
          <div className="flex justify-between p-3 bg-bg-tertiary rounded">
            <span className="text-text-secondary">Margin Level</span>
            <span className="font-mono font-bold success-text">978%</span>
          </div>
          <div className="flex justify-between p-3 bg-bg-tertiary rounded">
            <span className="text-text-secondary">Last Sync</span>
            <span className="text-xs text-text-secondary">2 minutes ago</span>
          </div>
        </div>
      </Card>

      <Card header="Telegram Bot">
        <div className="space-y-3">
          <div className="flex justify-between p-3 bg-bg-tertiary rounded">
            <span className="text-text-secondary">Bot Status</span>
            <Badge variant="success">Connected</Badge>
          </div>
          <div className="flex justify-between p-3 bg-bg-tertiary rounded">
            <span className="text-text-secondary">Messages Sent</span>
            <span className="font-mono">127 (last 30d)</span>
          </div>
          <Button variant="secondary" className="w-full text-sm">
            Test Alert
          </Button>
        </div>
      </Card>
    </div>
  );

  const riskTab = (
    <div className="space-y-4">
      <Card header="Position Sizing Calculator">
        <div className="space-y-3">
          <div>
            <label className="text-text-secondary text-sm mb-2 block">Account Balance</label>
            <input
              type="number"
              defaultValue={1245.50}
              className="w-full bg-bg-tertiary text-text-primary px-3 py-2 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-text-secondary text-sm mb-2 block">Risk Per Trade (%)</label>
            <input
              type="number"
              defaultValue={1}
              className="w-full bg-bg-tertiary text-text-primary px-3 py-2 rounded text-sm"
            />
          </div>
          <div className="p-3 bg-bg-tertiary rounded">
            <p className="text-text-secondary text-xs mb-1">Max Loss Per Trade</p>
            <p className="text-lg font-bold text-accent-gold">$12.46</p>
          </div>
        </div>
      </Card>

      <Card header="Current Risk Exposure">
        <div className="space-y-3">
          <div className="flex justify-between p-3 bg-bg-tertiary rounded">
            <span className="text-text-secondary">Open Risk</span>
            <Badge variant="warning">$35.60 (2.86%)</Badge>
          </div>
          <div className="flex justify-between p-3 bg-bg-tertiary rounded">
            <span className="text-text-secondary">Daily Loss Limit</span>
            <span className="font-mono">2% = $24.91</span>
          </div>
          <div className="flex justify-between p-3 bg-bg-tertiary rounded">
            <span className="text-text-secondary">Today&apos;s P&L</span>
            <Badge variant="success">+$67.30</Badge>
          </div>
          <Badge variant="danger" className="w-full text-center block">
            ⚠️ Daily limit reached - No new trades
          </Badge>
        </div>
      </Card>
    </div>
  );

  const preferencesTab = (
    <div className="space-y-4">
      <Card header="Display">
        <div className="space-y-3">
          <div>
            <label className="text-text-secondary text-sm mb-2 block">Theme</label>
            <select className="w-full bg-bg-tertiary text-text-primary px-3 py-2 rounded text-sm">
              <option>Dark Mode</option>
              <option>Light Mode</option>
            </select>
          </div>
          <div>
            <label className="text-text-secondary text-sm mb-2 block">Timezone</label>
            <input
              type="text"
              defaultValue="UTC+1 (Lagos)"
              className="w-full bg-bg-tertiary text-text-primary px-3 py-2 rounded text-sm"
            />
          </div>
        </div>
      </Card>

      <Card header="Notifications">
        <div className="space-y-2">
          {[
            "Sound Alerts",
            "Desktop Notifications",
            "Email Digests",
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-bg-tertiary rounded">
              <span className="text-text-primary">{item}</span>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const tabs = [
    { label: "Account Connections", content: accountTab },
    { label: "Risk Management", content: riskTab },
    { label: "Preferences", content: preferencesTab },
  ];

  return (
    <div>
      <Card>
        <Tabs tabs={tabs} />
      </Card>
    </div>
  );
}
