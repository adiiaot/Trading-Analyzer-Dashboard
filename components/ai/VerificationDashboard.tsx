'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, ShieldCheck } from 'lucide-react';

interface VerificationData {
  date: string;
  score: number;
  mode: 'api_only' | 'api_with_screenshot';
  confidence: number;
  successful: boolean;
}

export const VerificationDashboard = () => {
  const [data, setData] = useState<VerificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avgScore, setAvgScore] = useState(0);
  const [successRate, setSuccessRate] = useState(0);

  useEffect(() => {
    fetchVerificationData();
  }, []);

  const fetchVerificationData = async () => {
    try {
      const response = await fetch('/api/verification-history');
      const result = await response.json();

      setData(result.data || []);
      setAvgScore(result.avgScore || 0);
      setSuccessRate(result.successRate || 0);
    } catch (error) {
      console.error('Error fetching verification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-card border border-dark-border rounded-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-neon-green" />
            <p className="text-text-secondary text-small">Avg Verification Score</p>
          </div>
          <p className="text-h2 font-bold text-neon-green font-mono-num">{avgScore.toFixed(0)}/100</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-alert-info" />
            <p className="text-text-secondary text-small">Screenshot Usage</p>
          </div>
          <p className="text-h2 font-bold text-alert-info font-mono-num">
            {data.filter(d => d.mode === 'api_with_screenshot').length}/{data.length}
          </p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-alert-warning" />
            <p className="text-text-secondary text-small">Success Rate</p>
          </div>
          <p className="text-h2 font-bold text-alert-warning font-mono-num">{(successRate * 100).toFixed(0)}%</p>
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-card p-5">
        <h3 className="text-text-primary font-bold text-lg mb-4">Verification Score Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2D3561" />
            <XAxis dataKey="date" stroke="#A0AEC0" style={{ fontSize: '12px' }} />
            <YAxis stroke="#A0AEC0" domain={[0, 100]} style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A1F3A',
                border: '1px solid #2D3561',
                borderRadius: '8px',
                color: '#FFFFFF',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#A0AEC0' }} />
            <Bar dataKey="score" fill="#00FF88" name="Verification Score" animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-card p-5">
        <h3 className="text-text-primary font-bold text-lg mb-4">Signal Mode Distribution</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-dark-sidebar rounded-card p-4">
            <p className="text-text-secondary text-small">API-Only Mode</p>
            <p className="text-h2 font-bold text-alert-info font-mono-num">
              {data.filter(d => d.mode === 'api_only').length}
            </p>
          </div>
          <div className="bg-dark-sidebar rounded-card p-4">
            <p className="text-text-secondary text-small">API + Screenshot</p>
            <p className="text-h2 font-bold text-neon-green font-mono-num">
              {data.filter(d => d.mode === 'api_with_screenshot').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
