'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Eye, FileText, Download, Printer, Loader2, AlertCircle } from 'lucide-react';
import Sidebar from '@/components/SideBar';

// ============================================================================
// CONFIGURATION
// ============================================================================
const API_BASE_URL = 'http://localhost:8000/transactions';
// NOTE: The backend requires a UUID. Replace this with a real Store UUID from your database.
const TEST_STORE_ID = 'd955be01-fde5-4b26-bf99-fef4454627ac'; 

// ============================================================================
// INTERFACES (Matching Backend Pydantic Models)
// ============================================================================

export interface TransactionItem {
  item_id: string;
  batch_id: string;
  quantity: number;
  price_at_sale: number;
  cost_at_sale?: number; // Optional based on backend response
  created_at?: string;
  // These fields depend on if your backend schema joins product details
  // If backend doesn't return names, you might need to fetch product info separately
  product_name?: string; 
  batch_number?: string;
  tax?: number;
  discount?: number;
}

export interface Transaction {
  transaction_id: string;
  store_id: string;
  user_id: string;
  device_id?: string | null;
  total_amount: number;
  total_tax?: number; // Backend might compute this or store it
  created_at: string;
  items: TransactionItem[];
}

export interface TransactionListResponse {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TransactionSummary {
  total_transactions: number;
  total_amount: number;
  total_tax: number;
  total_items: number;
  average_transaction: number;
  date_range_start: string;
  date_range_end: string;
}

// ============================================================================
// METRIC CARD COMPONENT
// ============================================================================

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon }) => {
  const bgColor = icon === '💰' ? 'bg-blue-50' : icon === '📊' ? 'bg-purple-50' : icon === '👥' ? 'bg-green-50' : 'bg-orange-50';

  return (
    <div className={`${bgColor} rounded-lg p-6 border border-gray-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {typeof value === 'number' 
              ? (label.includes('Sales') || label.includes('Avg') ? `$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : value.toLocaleString()) 
              : value}
          </p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function SaleListPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'summary'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]); // Last 30 days
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]); // Today
  
  // In a real app, this store ID should come from the selected filter or User Context
  const [filterStore, setFilterStore] = useState(TEST_STORE_ID); 

  // Data State
  const [salesData, setSalesData] = useState<TransactionListResponse>({
    items: [],
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0
  });

  const [summaryData, setSummaryData] = useState<TransactionSummary | null>(null);

  // ========================================================================
  // API FETCH LOGIC
  // ========================================================================

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Get the token (Assuming you store it in localStorage)
      const token = localStorage.getItem('accessToken'); 

      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        store_id: filterStore
      });

      const res = await fetch(`${API_BASE_URL}/?${params}`, {
         // 2. Add the Authorization Header
         headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // <--- Critical for FastAPI Depends()
         }
      });
      
      if (!res.ok) {
         // Handle 401 specifically if needed
         if (res.status === 401) {
             throw new Error("Session expired. Please login again.");
         }
         const errData = await res.json().catch(() => ({}));
         throw new Error(errData.detail || 'Failed to fetch transactions');
      }

      const data: TransactionListResponse = await res.json();
      setSalesData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, filterStore]);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Backend expects datetime usually, but query params are string. 
      // Ensure backend handles 'YYYY-MM-DD' or add 'T00:00:00' if needed.
      const params = new URLSearchParams({
        store_id: filterStore,
        start_date: startDate,
        end_date: endDate
      });

      const res = await fetch(`${API_BASE_URL}/summary/report?${params}`);

      if (!res.ok) {
         const errData = await res.json().catch(() => ({}));
         throw new Error(errData.detail || 'Failed to fetch summary');
      }

      const data: TransactionSummary = await res.json();
      setSummaryData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [filterStore, startDate, endDate]);

  // Trigger fetch when tab or dependencies change
  useEffect(() => {
    if (activeTab === 'list') {
      fetchTransactions();
    } else {
      fetchSummary();
    }
  }, [activeTab, fetchTransactions, fetchSummary]);

  // Flatten items for table display
  const displayItems = useMemo(() => {
    if (!salesData.items) return [];
    return salesData.items.flatMap((transaction) =>
      transaction.items.map((item) => ({
        ...item,
        transaction_id: transaction.transaction_id,
        transaction_date: transaction.created_at,
        // Calculate missing fields if backend doesn't send them directly
        tax: item.tax || (item.price_at_sale * 0.1), // Fallback logic example
        discount: item.discount || 0
      }))
    );
  }, [salesData]);

  const startIndex = (salesData.page - 1) * salesData.page_size + 1;
  const endIndex = Math.min(salesData.page * salesData.page_size, salesData.total);

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  if (error) {
    return (
        <div className="w-full max-w-screen-2xl mx-auto flex gap-6">
            <Sidebar />
            <div className="flex-1 min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
                <AlertCircle className="text-red-500 w-12 h-12 mb-4"/>
                <h2 className="text-xl font-bold text-gray-800">Error Loading Data</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                    Retry
                </button>
            </div>
        </div>
    )
  }

  // ========================================================================
  // RENDER: SALES LIST TAB
  // ========================================================================

  const renderSalesListTab = () => (
    <>
      {/* Filters (Simplified for Backend integration) */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
         <p className="text-sm text-gray-500 mb-2">Filters currently apply to API request</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Store Filter - Updating this triggers a refetch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store ID</label>
            <input
              value={filterStore}
              onChange={(e) => {
                setFilterStore(e.target.value);
                setPage(1); // Reset to page 1 on filter change
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
              placeholder="UUID"
            />
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden min-h-[400px]">
        {isLoading ? (
             <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="animate-spin text-orange-500 w-10 h-10 mb-2" />
                <p className="text-gray-500">Loading transactions...</p>
             </div>
        ) : (
            <>
                <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
                        Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
                        Transaction ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
                        Product
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wide">
                        Qty
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wide">
                        Sale Price
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wide">
                        Total
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wide">
                        Action
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {displayItems.length > 0 ? (
                        displayItems.map((item, index) => (
                        <tr
                            key={`${item.transaction_id}-${item.item_id}-${index}`}
                            className="border-b border-gray-200 hover:bg-gray-50 transition"
                        >
                            <td className="px-6 py-4 text-sm text-gray-600">
                                {item.transaction_date ? new Date(item.transaction_date).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-orange-500 font-semibold" title={item.transaction_id}>
                                {item.transaction_id.substring(0, 8)}...
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                                {item.product_name || `Item ${item.item_id.substring(0,5)}`}
                            </td>
                            <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">
                                {item.quantity}
                            </td>
                            <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">
                                ${item.price_at_sale.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-right text-gray-900 font-bold">
                                ${(item.price_at_sale * item.quantity).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                            <button className="text-gray-400 hover:text-blue-500 transition">
                                <Eye size={18} />
                            </button>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                            No sales data found for this store.
                        </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>

                {/* Pagination */}
                <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                    Showing {startIndex} to {endIndex} of {salesData.total} entries
                    </span>
                    <select
                    value={pageSize}
                    onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white"
                    >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                    <ChevronLeft size={20} />
                    </button>

                    <span className="text-sm font-medium text-gray-700">
                        Page {page} of {salesData.total_pages}
                    </span>

                    <button
                    onClick={() => setPage(Math.min(salesData.total_pages, page + 1))}
                    disabled={page === salesData.total_pages}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                    <ChevronRight size={20} />
                    </button>
                </div>
                </div>
            </>
        )}
      </div>
    </>
  );

  // ========================================================================
  // RENDER: SALES SUMMARY TAB
  // ========================================================================

  const renderSalesSummaryTab = () => (
    <>
      {/* Filter Section for Summary */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Report Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Store ID</label>
             <input
              value={filterStore}
              onChange={(e) => setFilterStore(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            />
          </div>

          <div>
            <button 
                onClick={fetchSummary}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md transition"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Metrics */}
      {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
             <Loader2 className="animate-spin text-orange-500 w-10 h-10 mb-2" />
             <p className="text-gray-500">Calculating summary...</p>
          </div>
      ) : summaryData ? (
        <>
            <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    label="Total Sales"
                    value={summaryData.total_amount}
                    icon="💰"
                />
                <MetricCard
                    label="Total Orders"
                    value={summaryData.total_transactions}
                    icon="📊"
                />
                <MetricCard
                    label="Total Items Sold"
                    value={summaryData.total_items}
                    icon="📦"
                />
                <MetricCard
                    label="Avg Transaction"
                    value={summaryData.average_transaction}
                    icon="💵"
                />
                </div>
            </div>

            {/* Summary Statistics Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Summary Details</h2>
                <div className="flex gap-3">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition" title="Export">
                        <Download className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
                </div>

                <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Metric</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Value</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Total Transactions</td>
                        <td className="px-6 py-4 text-sm text-right text-gray-900">
                        {summaryData.total_transactions}
                        </td>
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Total Sales Amount</td>
                        <td className="px-6 py-4 text-sm text-right text-gray-900">
                        ${summaryData.total_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Total Tax Collected</td>
                        <td className="px-6 py-4 text-sm text-right text-green-600">
                        ${summaryData.total_tax.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                    </tr>
                    </tbody>
                </table>
                </div>
            </div>
        </>
      ) : (
        <div className="text-center p-10 text-gray-500 bg-white rounded border">
            No summary data loaded. Click "Generate Report".
        </div>
      )}
    </>
  );

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <div className="w-full max-w-screen-2xl mx-auto flex gap-6">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600">Real-time view of transactions and reports</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 font-semibold transition border-b-2 ${activeTab === 'list'
                ? 'text-orange-500 border-orange-500'
                : 'text-gray-600 hover:text-gray-900 border-transparent'
              }`}
          >
            Sales List
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`ml-4 px-4 py-2 font-semibold transition border-b-2 ${activeTab === 'summary'
                ? 'text-orange-500 border-orange-500'
                : 'text-gray-600 hover:text-gray-900 border-transparent'
              }`}
          >
            Sales Summary
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'list' ? renderSalesListTab() : renderSalesSummaryTab()}
      </div>
    </div>
  );
}