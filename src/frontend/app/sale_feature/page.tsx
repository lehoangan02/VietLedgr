'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, FileText, Download, Printer, Loader2, AlertCircle } from 'lucide-react';
import { fetchTransactionSummary, TransactionSummary } from '@/lib/fast-api/transactions';
import { fetchLedgerEntries, LedgerEntryListResponse, LedgerEntry } from '@/lib/fast-api/ledger';

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

interface ReportFilters {
  startDate: string;
  endDate: string;
}

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
  onGenerateReport: () => void;
  isLoading: boolean;
}

const ReportFiltersComponent: React.FC<FilterProps> = ({ filters, onFilterChange, onGenerateReport, isLoading }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Date Range</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={filters.startDate}
            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={filters.endDate}
            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
          />
        </div>

        <div>
          <button 
            onClick={onGenerateReport}
            disabled={isLoading}
            className="w-full px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Generate Report'
            )}
          </button>
        </div>
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

const LedgerEntriesTable: React.FC<{ data: LedgerEntryListResponse; onPageChange: (page: number) => void }> = ({ data, onPageChange }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">General Ledger</h2>
        <div className="flex gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition" title="Export as text">
            <FileText className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition" title="Download">
            <Download className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition" title="Print">
            <Printer className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {data.items.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <p>No ledger entries found for the selected date range.</p>
        </div>
      ) : (
        <>
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
                  const balance = Number(entry.debit_amount) - Number(entry.credit_amount);
                  return (
                    <tr key={entry.entry_id} className={`border-b border-gray-200 ${accountTypeStyles[entry.account_type] || ''}`}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {entry.transaction_id ? entry.transaction_id.slice(0, 8) + '...' : entry.expense_id ? entry.expense_id.slice(0, 8) + '...' : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">{entry.account_type}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        {Number(entry.debit_amount) > 0 ? `$${Number(entry.debit_amount).toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        {Number(entry.credit_amount) > 0 ? `$${Number(entry.credit_amount).toLocaleString()}` : '-'}
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
              Showing {(data.page - 1) * data.page_size + 1} to {Math.min(data.page * data.page_size, data.total)} of {data.total} entries
            </div>
            <div className="flex gap-2">
              <button
                disabled={data.page === 1}
                onClick={() => onPageChange(data.page - 1)}
                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(data.total_pages, 5) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => onPageChange(i + 1)}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${
                    data.page === i + 1
                      ? 'bg-orange-500 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={data.page === data.total_pages || data.total_pages === 0}
                onClick={() => onPageChange(data.page + 1)}
                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// MAIN REPORT PAGE
// ============================================================================

export default function ReportPage() {
  const router = useRouter();
  
  // State
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data
  const [summaryData, setSummaryData] = useState<TransactionSummary | null>(null);
  const [ledgerData, setLedgerData] = useState<LedgerEntryListResponse | null>(null);
  const [ledgerPage, setLedgerPage] = useState(1);
  
  // Filters - default to last 30 days
  const [filters, setFilters] = useState<ReportFilters>(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  });

  // ========================================================================
  // STEP 1: GET REAL STORE ID FROM PROXY
  // ========================================================================
  useEffect(() => {
    async function resolveStore() {
      try {
        const res = await fetch('/api/user/me/store');
        const data = await res.json();
        
        if (data.status === 200 && data.store_id) {
          setStoreId(data.store_id);
        } else if (data.status === 403 || data.status === 401) {
          setError("AUTH_REQUIRED");
        } else {
          setError("Could not find a store associated with your account.");
        }
      } catch (err) {
        setError("Failed to connect to the server.");
      }
    }
    resolveStore();
  }, []);

  // ========================================================================
  // STEP 2: FETCH DATA FUNCTIONS
  // ========================================================================
  
  // Default empty values for graceful fallback
  const getEmptySummary = useCallback((): TransactionSummary => ({
    total_transactions: 0,
    total_amount: 0,
    total_tax: 0,
    total_items: 0,
    average_transaction: 0,
    date_range_start: filters.startDate,
    date_range_end: filters.endDate,
  }), [filters.startDate, filters.endDate]);

  const getEmptyLedger = (): LedgerEntryListResponse => ({
    items: [],
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
  });

  const loadData = useCallback(async () => {
    if (!storeId) return;

    setIsLoading(true);
    setError(null);

    // Fetch summary with fallback
    let summary: TransactionSummary;
    try {
      summary = await fetchTransactionSummary(storeId, filters.startDate, filters.endDate);
    } catch (err: any) {
      if (err.message === "AUTH_REQUIRED") {
        setError("AUTH_REQUIRED");
        setIsLoading(false);
        return;
      }
      console.warn("Failed to fetch summary, using defaults:", err.message);
      summary = getEmptySummary();
    }

    // Fetch ledger with fallback
    let ledger: LedgerEntryListResponse;
    try {
      ledger = await fetchLedgerEntries(storeId, ledgerPage, 10, filters.startDate, filters.endDate);
    } catch (err: any) {
      if (err.message === "AUTH_REQUIRED") {
        setError("AUTH_REQUIRED");
        setIsLoading(false);
        return;
      }
      console.warn("Failed to fetch ledger, using defaults:", err.message);
      ledger = getEmptyLedger();
    }

    setSummaryData(summary);
    setLedgerData(ledger);
    setIsLoading(false);
  }, [storeId, filters.startDate, filters.endDate, ledgerPage, getEmptySummary]);

  // Auto-load on store ID resolution
  useEffect(() => {
    if (storeId) {
      loadData();
    }
  }, [storeId, loadData]);

  // Handle ledger page change
  const handleLedgerPageChange = useCallback(async (page: number) => {
    if (!storeId) return;
    
    setLedgerPage(page);
    setIsLoading(true);
    
    try {
      const ledger = await fetchLedgerEntries(storeId, page, 10, filters.startDate, filters.endDate);
      setLedgerData(ledger);
    } catch (err: any) {
      setError(err.message || "Failed to load ledger entries");
    } finally {
      setIsLoading(false);
    }
  }, [storeId, filters.startDate, filters.endDate]);

  // Handle generate report button click
  const handleGenerateReport = () => {
    setLedgerPage(1);
    loadData();
  };

  // ========================================================================
  // RENDER: Loading state while resolving store
  // ========================================================================
  if (!storeId && !error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-orange-500 w-8 h-8" />
      </div>
    );
  }

  // ========================================================================
  // RENDER: Error state
  // ========================================================================
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        {error === "AUTH_REQUIRED" ? (
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-4">Please log in to view sales reports.</p>
            <button 
              onClick={() => router.push('/login')} 
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  // ========================================================================
  // RENDER: Main content
  // ========================================================================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
          <p className="text-gray-600 mt-2">Dashboard → Sales Report</p>
        </div>

        {/* Dashboard Metrics */}
        {isLoading && !summaryData ? (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-6 border border-gray-200 animate-pulse h-32" />
              ))}
            </div>
          </div>
        ) : summaryData ? (
          <DashboardMetrics data={summaryData} />
        ) : null}

        {/* Report Filters */}
        <ReportFiltersComponent 
          filters={filters} 
          onFilterChange={setFilters} 
          onGenerateReport={handleGenerateReport}
          isLoading={isLoading}
        />

        {/* Ledger Entries Table */}
        {isLoading && !ledgerData ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Loader2 className="animate-spin text-orange-500 w-8 h-8 mx-auto" />
            <p className="text-gray-500 mt-2">Loading ledger entries...</p>
          </div>
        ) : ledgerData ? (
          <LedgerEntriesTable data={ledgerData} onPageChange={handleLedgerPageChange} />
        ) : null}
      </div>
    </div>
  );
}
