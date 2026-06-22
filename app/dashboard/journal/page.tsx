'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trade } from '@/types';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Spinner } from '@/components/ui/Spinner';
import { Search, Download, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { formatTimeAgo } from '@/lib/formatters';

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/trades?limit=1000');
      const data = await res.json();
      setTrades(data.trades || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTrades = useMemo(() => {
    let filtered = [...trades];

    if (resultFilter !== 'all') {
      filtered = filtered.filter(t => t.result === resultFilter);
    }
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      filtered = filtered.filter(t => new Date(t.timestamp).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime();
      filtered = filtered.filter(t => new Date(t.timestamp).getTime() <= to);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.notes?.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [trades, searchQuery, resultFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage);
  const paginatedTrades = filteredTrades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    const csv = [
      ['Date', 'Entry', 'Exit', 'PnL', 'PnL%', 'Result', 'Duration', 'Notes'],
      ...filteredTrades.map(t => [
        new Date(t.timestamp).toLocaleString(),
        t.entry_price.toString(),
        t.exit_price.toString(),
        t.pnl.toFixed(2),
        t.pnl_percent.toFixed(2),
        t.result.toUpperCase(),
        t.hold_time_seconds ? `${Math.floor(t.hold_time_seconds / 60)}m ${t.hold_time_seconds % 60}s` : 'N/A',
        t.notes || '',
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 space-y-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h1 className="text-h1 text-text-primary">Trading Journal</h1>
            <p className="text-text-secondary text-body">Complete trade history with notes and analysis</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="glass-card"
          >
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-text-tertiary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Search notes or trade ID..."
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none"
                />
              </div>
              <div>
                <select
                  value={resultFilter}
                  onChange={(e) => { setResultFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-4 py-2.5 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none"
                >
                  <option value="all">All Results</option>
                  <option value="win">Wins Only</option>
                  <option value="loss">Losses Only</option>
                </select>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neon-green/10 text-neon-green border border-neon-green/20 rounded-btn hover:bg-neon-green/20 transition text-body font-semibold"
              >
                <Download size={16} /> Export CSV
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-label text-text-secondary uppercase block mb-1">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                  className="w-full px-4 py-2 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none"
                />
              </div>
              <div>
                <label className="text-label text-text-secondary uppercase block mb-1">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                  className="w-full px-4 py-2 bg-dark-sidebar border border-dark-border rounded-input text-text-primary text-body focus:border-neon-green focus:outline-none"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-body">
                <thead>
                  <tr className="border-b border-dark-border">
                    <th className="text-left py-3 px-4 text-text-secondary text-label uppercase">Date</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-label uppercase">Entry</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-label uppercase">Exit</th>
                    <th className="text-right py-3 px-4 text-text-secondary text-label uppercase">P&L</th>
                    <th className="text-right py-3 px-4 text-text-secondary text-label uppercase">P&L %</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-label uppercase">Result</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-label uppercase">Duration</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-label uppercase">Notes</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-label uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTrades.map((trade, idx) => (
                    <motion.tr
                      key={trade.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      whileHover={{ backgroundColor: 'rgba(26, 31, 58, 0.6)' }}
                      className="border-b border-dark-border"
                    >
                      <td className="py-3 px-4 text-text-secondary text-small">{formatTimeAgo(trade.timestamp)}</td>
                      <td className="py-3 px-4 text-text-primary font-mono-num">${trade.entry_price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-text-primary font-mono-num">${trade.exit_price.toFixed(2)}</td>
                      <td className={`py-3 px-4 text-right font-semibold font-mono-num ${trade.pnl >= 0 ? 'text-neon-green' : 'text-alert-loss'}`}>
                        <span className="flex items-center justify-end gap-1">
                          ${trade.pnl.toFixed(2)}
                          {trade.pnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-mono-num ${trade.pnl >= 0 ? 'text-neon-green' : 'text-alert-loss'}`}>
                        {trade.pnl_percent >= 0 ? '+' : ''}{trade.pnl_percent.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4">
                        <span className={trade.result === 'win' ? 'badge-win' : 'badge-loss'}>
                          {trade.result.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text-secondary text-small">
                        {trade.hold_time_seconds
                          ? `${Math.floor(trade.hold_time_seconds / 60)}m ${trade.hold_time_seconds % 60}s`
                          : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-text-secondary text-small max-w-[150px] truncate">
                        {trade.notes || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="text-neon-green hover:text-neon-green-hover text-small font-semibold transition">Edit</button>
                          <button className="text-alert-loss hover:text-alert-loss/80 text-small font-semibold transition">Delete</button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-text-secondary text-body">
                  Showing {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, filteredTrades.length)} of {filteredTrades.length} trades
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="bg-dark-sidebar border border-dark-border rounded-input px-3 py-1.5 text-text-primary text-body focus:border-neon-green focus:outline-none"
                >
                  {ITEMS_PER_PAGE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt} per page</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-dark-border rounded-btn hover:bg-dark-card transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5 text-text-secondary" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-btn text-body font-medium transition ${
                        currentPage === pageNum
                          ? 'bg-neon-green text-dark-bg'
                          : 'text-text-secondary hover:bg-dark-card'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-dark-border rounded-btn hover:bg-dark-card transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
