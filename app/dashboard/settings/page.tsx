'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Check, X, Eye, EyeOff, Copy, Trash2, Plus, RefreshCw } from 'lucide-react';

const settingsSections = [
  { id: 'account', label: 'Account Settings' },
  { id: 'trading', label: 'Trading Accounts' },
  { id: 'risk', label: 'Risk Management' },
  { id: 'notifications', label: 'Notification Settings' },
  { id: 'api', label: 'API Keys & Integrations' },
  { id: 'preferences', label: 'Preferences & Display' },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account');
  const [isSaved, setIsSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'account':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-text-secondary text-body block mb-2">Username</label>
              <input
                type="text"
                defaultValue="trader_xau"
                className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none"
              />
            </div>
            <div>
              <label className="text-text-secondary text-body block mb-2">Email</label>
              <input
                type="email"
                defaultValue="trader@example.com"
                className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none"
              />
            </div>
            <div>
              <label className="text-text-secondary text-body block mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none"
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-text-tertiary hover:text-text-secondary">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-text-secondary text-body block mb-2">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={handleSave} className="px-6 py-2.5 bg-neon-green text-dark-bg font-semibold rounded-btn hover:bg-neon-green-hover transition text-body">
                Update Profile
              </button>
              <button className="px-6 py-2.5 border border-dark-border text-text-secondary rounded-btn hover:border-neon-green transition text-body">
                Cancel
              </button>
              <button className="px-6 py-2.5 bg-alert-loss/10 text-alert-loss font-semibold rounded-btn hover:bg-alert-loss/20 transition text-body ml-auto">
                Delete Account
              </button>
            </div>
          </div>
        );

      case 'trading':
        return (
          <div className="space-y-6">
            <div className="border-b border-dark-border pb-6">
              <h4 className="text-text-primary font-semibold mb-4">Demo Account</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-text-secondary text-body block mb-2">Account Balance ($)</label>
                    <input type="number" defaultValue="10000" className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-text-secondary text-body block mb-2">Broker</label>
                    <select className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none">
                      <option>Exness</option>
                      <option>IC Markets</option>
                      <option>FTMO</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-text-secondary text-body block mb-2">MetaTrader Username</label>
                  <input type="text" placeholder="MT5 username" className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-text-secondary text-body">Account Type:</span>
                  <span className="badge-win">Demo</span>
                  <button className="text-alert-loss text-small underline">Switch to Live</button>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} className="px-6 py-2.5 bg-neon-green text-dark-bg font-semibold rounded-btn hover:bg-neon-green-hover transition text-body">
                Update Balance
              </button>
              <button className="px-6 py-2.5 border border-dark-border text-text-secondary rounded-btn hover:border-neon-green transition text-body flex items-center gap-2">
                <RefreshCw size={16} /> Sync Account
              </button>
            </div>
          </div>
        );

      case 'risk':
        return (
          <div className="space-y-6">
            <div className="border-b border-dark-border pb-6">
              <h4 className="text-text-primary font-semibold mb-4">Position Sizing</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-text-secondary text-body block mb-2">Default Account Balance ($)</label>
                  <input type="number" defaultValue="10000" className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none" />
                </div>
                <div>
                  <label className="text-text-secondary text-body block mb-2">Default Risk %: 1.5%</label>
                  <input type="range" min="0" max="5" step="0.1" defaultValue="1.5" className="w-full mt-2 accent-neon-green" />
                </div>
                <div>
                  <label className="text-text-secondary text-body block mb-2">Max Position Size Limit</label>
                  <input type="number" placeholder="0.50 lots" className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="border-b border-dark-border pb-6">
              <h4 className="text-text-primary font-semibold mb-4">Daily Limits</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-text-secondary text-body block mb-2">Daily Loss Limit ($)</label>
                  <input type="number" defaultValue="500" className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none" />
                </div>
                <div>
                  <label className="text-text-secondary text-body block mb-2">Daily Profit Target ($)</label>
                  <input type="number" defaultValue="1000" className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none" />
                </div>
                <div>
                  <label className="text-text-secondary text-body block mb-2">Max Trades/Day</label>
                  <input type="number" defaultValue="10" className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-text-primary font-semibold mb-4">Stop Loss Rules</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-text-secondary text-body block mb-2">Default Stop Loss (pips)</label>
                  <input type="number" defaultValue="20" className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-body">Hard Stop Loss</span>
                  <div className="w-12 h-6 bg-neon-green rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-body">Trailing Stop Loss</span>
                  <div className="w-12 h-6 bg-dark-border rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-text-tertiary rounded-full absolute left-0.5 top-0.5 shadow" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={handleSave} className="px-6 py-2.5 bg-neon-green text-dark-bg font-semibold rounded-btn hover:bg-neon-green-hover transition text-body">
                Save Settings
              </button>
              <button className="px-6 py-2.5 border border-dark-border text-text-secondary rounded-btn hover:border-neon-green transition text-body">
                Reset to Default
              </button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="border-b border-dark-border pb-6">
              <h4 className="text-text-primary font-semibold mb-4">Email Notifications</h4>
              <div className="space-y-3">
                {['Trade Executed', 'Win/Loss Alerts', 'Daily Summary', 'Weekly Report'].map(item => (
                  <div key={item} className="flex items-center justify-between">
                    <span className="text-text-secondary text-body">{item}</span>
                    <div className="w-12 h-6 bg-neon-green rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-b border-dark-border pb-6">
              <h4 className="text-text-primary font-semibold mb-4">Telegram Alerts</h4>
              <div className="bg-dark-sidebar border border-dark-border rounded-card p-4 mb-4">
                <p className="text-text-secondary text-body">Connected: @trader_bot</p>
              </div>
              <div className="space-y-3">
                {['Trade Alerts', 'Risk Warnings', 'Daily Stats'].map(item => (
                  <div key={item} className="flex items-center justify-between">
                    <span className="text-text-secondary text-body">{item}</span>
                    <div className="w-12 h-6 bg-neon-green rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSave} className="px-6 py-2.5 bg-neon-green text-dark-bg font-semibold rounded-btn hover:bg-neon-green-hover transition text-body">
                Save
              </button>
              <button className="px-6 py-2.5 border border-dark-border text-text-secondary rounded-btn hover:border-neon-green transition text-body">
                Test Telegram Connection
              </button>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-text-primary font-semibold mb-4">Existing API Keys</h4>
              <div className="bg-dark-sidebar border border-dark-border rounded-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-text-primary text-body font-medium">Trading Bot Key</p>
                  <p className="text-text-tertiary text-small">Created: Jan 15, 2026 | Last used: Today</p>
                </div>
                <button className="text-alert-loss hover:text-alert-loss/80 transition">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-text-primary font-semibold mb-4">Generate New Key</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-text-secondary text-body block mb-2">Key Name</label>
                  <input type="text" placeholder="My API Key" className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none" />
                </div>
                <div>
                  <label className="text-text-secondary text-body block mb-2">Permissions</label>
                  <div className="space-y-2">
                    {['Read Trades', 'Read Signals', 'Execute Trades', 'Admin'].map(perm => (
                      <label key={perm} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-neon-green" />
                        <span className="text-text-secondary text-body">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="px-6 py-2.5 bg-neon-green text-dark-bg font-semibold rounded-btn hover:bg-neon-green-hover transition text-body flex items-center gap-2">
                    <Plus size={16} /> Generate Key
                  </button>
                  <button className="px-6 py-2.5 border border-dark-border text-text-secondary rounded-btn hover:border-neon-green transition text-body flex items-center gap-2">
                    <Copy size={16} /> Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="border-b border-dark-border pb-6">
              <h4 className="text-text-primary font-semibold mb-4">Display</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-body">Theme</span>
                  <span className="badge-win">Dark Mode</span>
                </div>
                <div>
                  <label className="text-text-secondary text-body block mb-2">Currency Display</label>
                  <select className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="text-text-secondary text-body block mb-2">Timezone</label>
                  <select className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none">
                    <option>Auto-detect (UTC+0)</option>
                    <option>UTC-5 (New York)</option>
                    <option>UTC+0 (London)</option>
                    <option>UTC+3 (Moscow)</option>
                    <option>UTC+8 (Hong Kong)</option>
                  </select>
                </div>
                <div>
                  <label className="text-text-secondary text-body block mb-2">Decimal Places</label>
                  <select className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none">
                    <option>2 decimals</option>
                    <option>3 decimals</option>
                    <option>4 decimals</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-body">Show grid lines on charts</span>
                  <div className="w-12 h-6 bg-neon-green rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-text-primary font-semibold mb-4">Trading Preferences</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-text-secondary text-body block mb-2">Default Trading Pair</label>
                  <input type="text" value="XAU/USD" disabled className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body opacity-60" />
                </div>
                <div>
                  <label className="text-text-secondary text-body block mb-2">Session Times</label>
                  <select className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none">
                    <option>All Sessions</option>
                    <option>Asian Session</option>
                    <option>London Session</option>
                    <option>New York Session</option>
                  </select>
                </div>
                <div>
                  <label className="text-text-secondary text-body block mb-2">Default Lot Size</label>
                  <input type="number" step="0.01" defaultValue="0.10" className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-body">Auto-log trades</span>
                  <div className="w-12 h-6 bg-neon-green rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={handleSave} className="px-6 py-2.5 bg-neon-green text-dark-bg font-semibold rounded-btn hover:bg-neon-green-hover transition text-body">
                Save Preferences
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-h1 text-text-primary">Settings</h1>
            <p className="text-text-secondary text-body">Manage your account, trading preferences, and integrations</p>
          </motion.div>

          <div className="flex gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="w-64 flex-shrink-0"
            >
              <div className="glass-card p-2">
                {settingsSections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-btn transition text-body ${
                      activeSection === section.id
                        ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-dark-card'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 glass-card"
            >
              <h3 className="text-h3 font-bold text-text-primary mb-6 capitalize">
                {settingsSections.find(s => s.id === activeSection)?.label}
              </h3>
              {renderSection()}
            </motion.div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {isSaved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 bg-neon-green text-dark-bg px-4 py-3 rounded-card shadow-lg flex items-center gap-2 text-body font-semibold"
          >
            <Check size={18} />
            Settings saved successfully
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
