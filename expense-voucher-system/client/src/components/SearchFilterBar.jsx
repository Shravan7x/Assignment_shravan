import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';

const STATUSES = ['', 'draft', 'pending_approval', 'approved', 'rejected'];
const STATUS_LABELS = { '': 'All Statuses', draft: 'Draft', pending_approval: 'Pending Approval', approved: 'Approved', rejected: 'Rejected' };

export default function SearchFilterBar({ vouchers, onFiltered }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');

  const fuse = useMemo(() => new Fuse(vouchers, {
    threshold: 0.35,
    keys: [
      'voucher_number',
      'expense_title',
      'expense_category',
      'department',
      'status',
      'creator.name',
    ]
  }), [vouchers]);

  useEffect(() => {
    let results = vouchers;

    // Fuse.js text search
    if (query.trim()) {
      results = fuse.search(query.trim()).map(r => r.item);
    }

    // Status filter
    if (statusFilter) {
      results = results.filter(v => v.status === statusFilter);
    }

    // Date range filter (expense_date)
    if (dateFrom) {
      results = results.filter(v => v.expense_date && v.expense_date >= dateFrom);
    }
    if (dateTo) {
      results = results.filter(v => v.expense_date && v.expense_date <= dateTo);
    }

    // Amount range filter
    if (amountMin !== '') {
      results = results.filter(v => parseFloat(v.amount) >= parseFloat(amountMin));
    }
    if (amountMax !== '') {
      results = results.filter(v => parseFloat(v.amount) <= parseFloat(amountMax));
    }

    onFiltered(results);
  }, [query, statusFilter, dateFrom, dateTo, amountMin, amountMax, vouchers]);

  const clearAll = () => {
    setQuery('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setAmountMin('');
    setAmountMax('');
  };

  const hasFilters = query || statusFilter || dateFrom || dateTo || amountMin || amountMax;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
      {/* Search input */}
      <div className="flex gap-3 mb-3">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by voucher number, title, employee, category..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
        {hasFilters && (
          <button
            onClick={clearAll}
            className="px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3">
        {/* Status */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Date from</span>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          <span className="text-xs text-gray-400">to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>

        {/* Amount range */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">₹ from</span>
          <input type="number" value={amountMin} onChange={e => setAmountMin(e.target.value)}
            placeholder="0" min="0"
            className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          <span className="text-xs text-gray-400">to</span>
          <input type="number" value={amountMax} onChange={e => setAmountMax(e.target.value)}
            placeholder="Any" min="0"
            className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
      </div>
    </div>
  );
}
