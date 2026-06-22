'use client';

import React, { useState } from 'react';

interface TradeFiltersProps {
  onFilterChange: (filters: { result?: string; dateFrom?: string; dateTo?: string }) => void;
}

export const TradeFilters = ({ onFilterChange }: TradeFiltersProps) => {
  const [result, setResult] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleFilter = () => {
    onFilterChange({
      result: result || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  };

  const handleClear = () => {
    setResult('');
    setDateFrom('');
    setDateTo('');
    onFilterChange({});
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-card p-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-text-secondary text-label block mb-1 uppercase tracking-wider">Result</label>
          <select
            value={result}
            onChange={(e) => setResult(e.target.value)}
            className="bg-dark-sidebar border border-dark-border rounded-input px-3 py-2 text-text-primary text-body focus:border-neon-green focus:outline-none"
          >
            <option value="">All</option>
            <option value="win">Win</option>
            <option value="loss">Loss</option>
          </select>
        </div>
        <div>
          <label className="text-text-secondary text-label block mb-1 uppercase tracking-wider">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-dark-sidebar border border-dark-border rounded-input px-3 py-2 text-text-primary text-body focus:border-neon-green focus:outline-none"
          />
        </div>
        <div>
          <label className="text-text-secondary text-label block mb-1 uppercase tracking-wider">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-dark-sidebar border border-dark-border rounded-input px-3 py-2 text-text-primary text-body focus:border-neon-green focus:outline-none"
          />
        </div>
        <button
          onClick={handleFilter}
          className="bg-neon-green hover:bg-neon-green-hover text-dark-bg px-4 py-2 rounded-btn text-body font-semibold transition"
        >
          Apply
        </button>
        <button
          onClick={handleClear}
          className="text-text-secondary hover:text-text-primary px-4 py-2 text-body transition"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
