'use client';

import { useState } from 'react';
import { ChevronDown, Eye, Edit, Trash2, FileText, Download, Printer } from 'lucide-react';

// ============================================================================
// TYPESCRIPT INTERFACES - Aligned with Backend Schemas
// ============================================================================

interface TransactionSummary {
  total_transactions: number;
  total_amount: number;
  total_tax: number;
  total_items: number;
  average_transaction: number;
  date_range_start: string;
  date_range_end: string;
}

interface GeneralLedgerEntryResponse {
  entry_id: string;
  store_id: string;
  account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  transaction_id: string | null;
  expense_id: string | null;
  entry_date: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  created_at: string;
}

interface LedgerEntryListResponse {
  items: GeneralLedgerEntryResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface ReportFilters {
  startDate: string;
  endDate: string;
  store: string;
  product: string;
}

// ============================================================================
// PLACEHOLDER DATA
// ============================================================================

const placeholderDashboard: TransactionSummary = {
  total_transactions: 8690,
  total_amount: 40565000,
  total_tax: 0,
  total_items: 865,
  average_transaction: 4667.76,
  date_range_start: '2025-01-01',
  date_range_end: '2025-12-12',
};

const placeholderLedgerData: LedgerEntryListResponse = {
  items: [
    {
      entry_id: '550e8400-e29b-41d4-a716-446655440001',
      store_id: '550e8400-e29b-41d4-a716-446655440000',
      account_type: 'ASSET',
      transaction_id: '550e8400-e29b-41d4-a716-446655440010',
      expense_id: null,
      entry_date: '2025-12-01',
      description: 'Sale: Lenovo IdeaPad 3',
      debit_amount: 3000,
      credit_amount: 0,
      created_at: '2025-12-01T10:30:00Z',
    },
    {
      entry_id: '550e8400-e29b-41d4-a716-446655440002',
      store_id: '550e8400-e29b-41d4-a716-446655440000',
      account_type: 'REVENUE',
      transaction_id: '550e8400-e29b-41d4-a716-446655440010',
      expense_id: null,
      entry_date: '2025-12-01',
      description: 'Revenue: Lenovo IdeaPad 3',
      debit_amount: 0,
      credit_amount: 3000,
      created_at: '2025-12-01T10:30:00Z',
    },
    {
      entry_id: '550e8400-e29b-41d4-a716-446655440003',
      store_id: '550e8400-e29b-41d4-a716-446655440000',
      account_type: 'ASSET',
      transaction_id: '550e8400-e29b-41d4-a716-446655440011',
      expense_id: null,
      entry_date: '2025-12-02',
      description: 'Sale: Beats Pro',
      debit_amount: 1600,
      credit_amount: 0,
      created_at: '2025-12-02T14:15:00Z',
    },
    {
      entry_id: '550e8400-e29b-41d4-a716-446655440004',
      store_id: '550e8400-e29b-41d4-a716-446655440000',
      account_type: 'REVENUE',
      transaction_id: '550e8400-e29b-41d4-a716-446655440011',
      expense_id: null,
      entry_date: '2025-12-02',
      description: 'Revenue: Beats Pro',
      debit_amount: 0,
      credit_amount: 1600,
      created_at: '2025-12-02T14:15:00Z',
    },
    {
      entry_id: '550e8400-e29b-41d4-a716-446655440005',
      store_id: '550e8400-e29b-41d4-a716-446655440000',
      account_type: 'EXPENSE',
      transaction_id: null,
      expense_id: '550e8400-e29b-41d4-a716-446655440020',
      entry_date: '2025-12-03',
      description: 'Rent Expense',
      debit_amount: 2000,
      credit_amount: 0,
      created_at: '2025-12-03T09:00:00Z',
    },
    {
      entry_id: '550e8400-e29b-41d4-a716-446655440006',
      store_id: '550e8400-e29b-41d4-a716-446655440000',
      account_type: 'LIABILITY',
      transaction_id: null,
      expense_id: '550e8400-e29b-41d4-a716-446655440020',
      entry_date: '2025-12-03',
      description: 'Accounts Payable',
      debit_amount: 0,
      credit_amount: 2000,
      created_at: '2025-12-03T09:00:00Z',
    },
  ],
  total: 6,
  page: 1,
  page_size: 10,
  total_pages: 1,
};

// ============================================================================
// DASHBOARD METRICS COMPONENT
// ============================================================================

interface MetricCardProps {
  label: string;
  value: number | string;
  changePercent: number;
  changeType: 'positive' | 'negative';
  icon: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, changePercent, changeType, icon }) => {
  const bgColor = icon === '💰' ? 'bg-blue-50' : icon === '📊' ? 'bg-purple-50' : icon === '👥' ? 'bg-green-50' : 'bg-orange-50';
  const badgeColor = changeType === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';

  return (
    <div className={`${bgColor} rounded-lg p-6 border border-gray-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {typeof value === 'number' ? (label.includes('Sales') || label.includes('Total') ? `$${value.toLocaleString()}` : value.toLocaleString()) : value}
          </p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
      <div className={`${badgeColor} text-xs font-semibold px-2 py-1 rounded-full mt-4 inline-block`}>
        {changeType === 'positive' ? '+' : '-'}{Math.abs(changePercent)}%{' '}
        <span>From Last Month</span>
      </div>
    </div>
  );
};

const DashboardMetrics: React.FC<{ data: TransactionSummary }> = ({ data }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="New Sales" value={`$${data.total_amount.toLocaleString()}`} changePercent={18.2} changeType="positive" icon="💰" />
        <MetricCard label="Total Orders" value={data.total_transactions} changePercent={12.5} changeType="positive" icon="📊" />
        <MetricCard label="Total Customers" value={4558} changePercent={14.3} changeType="positive" icon="👥" />
        <MetricCard label="Units Sold" value={data.total_items} changePercent={22.3} changeType="negative" icon="📦" />
      </div>
    </div>
  );
};

// ============================================================================
// REPORT FILTER COMPONENT
// ============================================================================

interface FilterProps {
  filters: ReportFilters;
  onFilterChange: (filters: ReportFilters) => void;
}

const ReportFilters: React.FC<FilterProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Date</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <input
            type="text"
            placeholder="01-Jan-2025 - 12-Dec-2025"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={filters.startDate}
            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Store</label>
          <div className="relative">
            <select
              value={filters.store}
              onChange={(e) => onFilterChange({ ...filters, store: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none pr-8"
            >
              <option value="">All</option>
              <option value="store1">Store 1</option>
              <option value="store2">Store 2</option>
              <option value="store3">Store 3</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Products</label>
          <div className="relative">
            <select
              value={filters.product}
              onChange={(e) => onFilterChange({ ...filters, product: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none pr-8"
            >
              <option value="">All</option>
              <option value="electronics">Electronics</option>
              <option value="furniture">Furniture</option>
              <option value="bags">Bags</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition">
          Generate Report
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// LEDGER ENTRIES TABLE COMPONENT
// ============================================================================

const accountTypeStyles: Record<string, string> = {
  ASSET: 'bg-blue-50 text-blue-900 border-l-4 border-blue-500',
  LIABILITY: 'bg-red-50 text-red-900 border-l-4 border-red-500',
  EQUITY: 'bg-purple-50 text-purple-900 border-l-4 border-purple-500',
  REVENUE: 'bg-green-50 text-green-900 border-l-4 border-green-500',
  EXPENSE: 'bg-orange-50 text-orange-900 border-l-4 border-orange-500',
};

const LedgerEntriesTable: React.FC<{ data: LedgerEntryListResponse }> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">General Ledger</h2>
        <div className="flex gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <FileText className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Download className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Printer className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Reference</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Account Type</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Debit</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Credit</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Balance</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((entry) => {
              const balance = entry.debit_amount - entry.credit_amount;
              return (
                <tr key={entry.entry_id} className={`border-b border-gray-200 ${accountTypeStyles[entry.account_type]}`}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {entry.transaction_id ? entry.transaction_id.slice(0, 8) + '...' : entry.expense_id ? entry.expense_id.slice(0, 8) + '...' : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold">{entry.account_type}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    {entry.debit_amount > 0 ? `$${entry.debit_amount.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    {entry.credit_amount > 0 ? `$${entry.credit_amount.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold">
                    ${Math.abs(balance).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{entry.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(entry.entry_date).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {(currentPage - 1) * data.page_size + 1} to {Math.min(currentPage * data.page_size, data.total)} of {data.total} entries
        </div>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
          >
            Previous
          </button>
          {Array.from({ length: data.total_pages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                currentPage === i + 1
                  ? 'bg-orange-500 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === data.total_pages}
            onClick={() => setCurrentPage(Math.min(data.total_pages, currentPage + 1))}
            className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN REPORT PAGE
// ============================================================================

export default function ReportPage() {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: '01-Jan-2025',
    endDate: '12-Dec-2025',
    store: '',
    product: '',
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
          <p className="text-gray-600 mt-2">Dashboard → Sales Report</p>
        </div>

        {/* Dashboard Metrics */}
        <DashboardMetrics data={placeholderDashboard} />

        {/* Report Filters */}
        <ReportFilters filters={filters} onFilterChange={setFilters} />

        {/* Ledger Entries Table */}
        <LedgerEntriesTable data={placeholderLedgerData} />
      </div>
    </div>
  );
}
