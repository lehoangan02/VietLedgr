'use client';
import { useRef } from 'react';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Eye, Download, Loader2, AlertCircle, LogIn } from 'lucide-react';
import {
  Transaction,
  TransactionItem,
  TransactionListResponse,
  TransactionSummary
} from '@/lib/fast-api/transactions';

// ============================================================================
// CONFIGURATION
// ============================================================================
const API_BASE_URL = '/api/transactions';
const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

// ============================================================================
// METRIC CARD COMPONENT
// ============================================================================
const MetricCard: React.FC<{ label: string; value: number | string; icon: string }> = ({ label, value, icon }) => {
  const bgColor = icon === '💰' ? 'bg-blue-50' : icon === '📊' ? 'bg-purple-50' : icon === '👥' ? 'bg-green-50' : 'bg-orange-50';

  // Format value based on label type
  const formatValue = () => {
    if (typeof value !== 'number') return value;
    if (label.includes('Sales') || label.includes('Average')) {
      return `${Math.round(value).toLocaleString()}$`;
    }
    return value.toLocaleString();
  };

  return (
    <div className={`${bgColor} rounded-lg p-6 border border-gray-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatValue()}</p>
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
  const [detailModal, setDetailModal] = useState<{ open: boolean; item: any | null }>({ open: false, item: null });
  // Cache for batch_id -> product_id and product_id -> product_name
  const [batchProductMap, setBatchProductMap] = useState<Record<string, string>>({}); // batch_id -> product_id
  const [productNameMap, setProductNameMap] = useState<Record<string, string>>({}); // product_id -> product_name
  const [modalProductName, setModalProductName] = useState<string | null>(null);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'list' | 'summary'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🟢 Dynamic Store ID State
  const [filterStore, setFilterStore] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Data State
  const [salesData, setSalesData] = useState<TransactionListResponse>({
    items: [], total: 0, page: 1, page_size: 10, total_pages: 0
  });
  const [summaryData, setSummaryData] = useState<TransactionSummary | null>(null);
  // ========================================================================
  // STEP 1: GET REAL STORE ID FROM PROXY
  // ========================================================================
  useEffect(() => {
    async function resolveStore() {
      try {
        const res = await fetch('/api/user/me/store');
        const data = await res.json();

        if (data.status === 200 && data.store_id) {
          setFilterStore(data.store_id);
        } else if (data.status === 403) {
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
  // STEP 2: FETCH DATA USING RESOLVED STORE ID
  // ========================================================================
  const fetchTransactions = useCallback(async () => {
    if (!filterStore) return; // Wait for the ID

    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        store_id: filterStore,
        start_date: startDate,
        end_date: endDate
      });

      const res = await fetch(`${API_BASE_URL}?${params}`);

      if (!res.ok) {
        if (res.status === 401) throw new Error("AUTH_REQUIRED");
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Error ${res.status}: Failed to fetch transactions`);
      }

      const data = await res.json();
      setSalesData(data);
    } catch (err: any) {
      if (err.message === "AUTH_REQUIRED") {
        setError("AUTH_REQUIRED");
      } else {
        console.warn("Failed to fetch transactions:", err.message);
        // Show empty state instead of error
        setSalesData({ items: [], total: 0, page: 1, page_size: pageSize, total_pages: 0 });
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, filterStore, startDate, endDate]);

  const fetchSummary = useCallback(async () => {
    if (!filterStore) return;

    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        store_id: filterStore,
        start_date: startDate,
        end_date: endDate
      });

      const res = await fetch(`${API_BASE_URL}/summary/report?${params}`);

      if (!res.ok) {
        if (res.status === 401) throw new Error("AUTH_REQUIRED");
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Error ${res.status}: Failed to fetch summary`);
      }

      const data = await res.json();
      setSummaryData(data);
    } catch (err: any) {
      if (err.message === "AUTH_REQUIRED") {
        setError("AUTH_REQUIRED");
      } else {
        console.warn("Failed to fetch summary:", err.message);
        // Show zero values instead of error
        setSummaryData({
          total_transactions: 0,
          total_amount: 0,
          total_tax: 0,
          total_items: 0,
          average_transaction: 0,
          date_range_start: startDate,
          date_range_end: endDate,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [filterStore, startDate, endDate]);

  useEffect(() => {
    if (filterStore) {
      if (activeTab === 'list') fetchTransactions();
      else fetchSummary();
    }
  }, [activeTab, fetchTransactions, fetchSummary, filterStore]);

  // Fetch product name for modal when opened
  useEffect(() => {
    async function fetchProductNameForModal() {
      if (!detailModal.open || !detailModal.item) {
        setModalProductName(null);
        return;
      }
      const batchId = detailModal.item.batch_id;
      if (!batchId) {
        setModalProductName('-');
        console.log("No batch ID available");
        return;
      }
      let productId = batchProductMap[batchId];
      if (!productId) {
        // Fetch batch info
        try {
          const res = await fetch(`${FASTAPI_URL}/api/batches/${batchId}`);
          if (!res.ok) throw new Error('Failed to fetch batch');
          const batchData = await res.json();
          productId = batchData.product_id;
          console.log("Fetched product ID for batch:", productId);
          setBatchProductMap(prev => ({ ...prev, [batchId]: productId }));
        } catch {
          setModalProductName('-');
          return;
        }
      }
      let productName = productNameMap[productId];
      if (!productName) {
        // Fetch product info
        try {
          const res = await fetch(`${FASTAPI_URL}/api/products/${productId}`);
          if (!res.ok) throw new Error('Failed to fetch product');
          const productData = await res.json();
          productName = productData.product_name || productData.name || '-';
          console.log("Fetched product name:", productName);
          setProductNameMap(prev => ({ ...prev, [productId]: productName }));
        } catch {
          setModalProductName('-');
          return;
        }
      }
      setModalProductName(productName);
    }
    fetchProductNameForModal();
  }, [detailModal]);

  // UI calculations - filter by date range on frontend
  const displayItems = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return salesData.items
      .filter((transaction) => {
        const txDate = new Date(transaction.created_at);
        return txDate >= start && txDate <= end;
      })
      .flatMap((transaction) =>
        transaction.items.map((item) => ({
          ...item,
          transaction_id: transaction.transaction_id,
          transaction_date: transaction.created_at,
          tax: item.tax || (item.price_at_sale * 0.1),
          discount: item.discount || 0
        }))
      );
  }, [salesData, startDate, endDate]);

  // Use filtered count for display
  const filteredTotal = displayItems.length;
  const startIndex = filteredTotal === 0 ? 0 : 1;
  const endIndex = filteredTotal;

  // --- Render logic (Loading, Error, Tabs) ---
  if (!filterStore && !error) return (
    <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>
  );

  if (error) {
    return (
      <div className="flex-1 min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        {error === "AUTH_REQUIRED" ? (
          <button onClick={() => router.push('/login')} className="px-6 py-2 bg-orange-500 text-white rounded-lg">Login Required</button>
        ) : (
          <div className="text-center"><AlertCircle className="text-red-500 mx-auto mb-2" /><p>{error}</p></div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-6">
      <div className="mb-6"><h1 className="text-3xl font-bold text-gray-900">Sales Management</h1></div>

      {/* Date Filters - visible for both tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Date Range</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <button
              onClick={() => activeTab === 'list' ? fetchTransactions() : fetchSummary()}
              disabled={isLoading}
              className="w-full px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Apply Filter'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="mb-6 border-b border-gray-200">
        <button onClick={() => setActiveTab('list')} className={`px-4 py-2 border-b-2 ${activeTab === 'list' ? 'border-orange-500 text-orange-500' : 'border-transparent'}`}>Sales List</button>
        <button onClick={() => setActiveTab('summary')} className={`ml-4 px-4 py-2 border-b-2 ${activeTab === 'summary' ? 'border-orange-500 text-orange-500' : 'border-transparent'}`}>Summary</button>
      </div>

      {activeTab === 'list' ? (
        <div className="bg-white rounded-lg border min-h-[400px]">
          {isLoading ? <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">TX ID</th>
                    <th className="px-6 py-4 text-right">Qty</th>
                    <th className="px-6 py-4 text-right">Total</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {displayItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No sales recorded yet. Transactions will appear here once created.
                      </td>
                    </tr>
                  ) : displayItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{new Date(item.transaction_date!).toLocaleString()}</td>
                      <td className="px-6 py-4 text-orange-500 font-mono">{item.transaction_id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-right">{item.quantity}</td>
                      <td className="px-6 py-4 text-right font-bold">${(item.price_at_sale * item.quantity).toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => setDetailModal({ open: true, item })} title="View Details">
                          <Eye size={16} className="mx-auto text-gray-400 hover:text-orange-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Detail Modal (move outside table/tbody for valid HTML and proper overlay) */}
                  {detailModal.open && detailModal.item && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[320px] max-w-[90vw] relative">
                        <button
                          className="absolute top-2 right-2 text-gray-400 hover:text-orange-500 text-xl"
                          onClick={() => setDetailModal({ open: false, item: null })}
                          aria-label="Close"
                        >
                          &times;
                        </button>
                        <h3 className="text-xl font-bold mb-4 text-gray-900">Transaction Item Details</h3>
                        <table className="w-full text-sm mb-2">
                          <tbody>
                            <tr>
                              <td className="font-semibold pr-2 py-1 text-gray-700">Transaction ID:</td>
                              <td className="py-1">{detailModal.item.transaction_id}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold pr-2 py-1 text-gray-700">Date:</td>
                              <td className="py-1">{new Date(detailModal.item.transaction_date).toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold pr-2 py-1 text-gray-700">Product Name:</td>
                              <td className="py-1">{modalProductName ?? <span className="text-gray-400">Loading...</span>}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold pr-2 py-1 text-gray-700">Batch ID:</td>
                              <td className="py-1">{detailModal.item.batch_id}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold pr-2 py-1 text-gray-700">Quantity:</td>
                              <td className="py-1">{detailModal.item.quantity}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold pr-2 py-1 text-gray-700">Unit Price:</td>
                              <td className="py-1">${detailModal.item.price_at_sale?.toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold pr-2 py-1 text-gray-700">Total:</td>
                              <td className="py-1 font-bold">${(detailModal.item.price_at_sale * detailModal.item.quantity).toLocaleString()}</td>
                            </tr>
                            {detailModal.item.tax !== undefined && (
                              <tr>
                                <td className="font-semibold pr-2 py-1 text-gray-700">Tax:</td>
                                <td className="py-1">${detailModal.item.tax.toLocaleString()}</td>
                              </tr>
                            )}
                            {detailModal.item.discount !== undefined && (
                              <tr>
                                <td className="font-semibold pr-2 py-1 text-gray-700">Discount:</td>
                                <td className="py-1">${detailModal.item.discount.toLocaleString()}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {/* Pagination */}
          <div className="p-4 border-t flex justify-between items-center text-sm">
            <span>Showing {filteredTotal} entries </span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-30">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= salesData.total_pages} className="px-3 py-1 border rounded disabled:opacity-30">Next</button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {isLoading ? <Loader2 className="animate-spin mx-auto" /> : (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <MetricCard label="Total Sales" value={`${Math.round(summaryData?.total_amount ?? 0).toLocaleString()}$`} icon="💰" />
                <MetricCard label="Orders" value={summaryData?.total_transactions ?? 0} icon="📊" />
                <MetricCard label="Items Sold" value={summaryData?.total_items ?? 0} icon="📦" />
                <MetricCard label="Average" value={`${Math.round(summaryData?.average_transaction ?? 0).toLocaleString()}$`} icon="💵" />
              </div>

              {/* Summary Report Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Sales Summary Report</h2>
                  <div className="flex gap-3">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition" title="Download">
                      <Download size={20} className="text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Metric</th>
                        <th className="px-6 py-3 text-right font-semibold text-gray-700">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900">Date Range</td>
                        <td className="px-6 py-4 text-right text-gray-700">
                          {summaryData?.date_range_start ?? startDate} to {summaryData?.date_range_end ?? endDate}
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900">Total Transactions</td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">{summaryData?.total_transactions ?? 0}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900">Total Revenue</td>
                        <td className="px-6 py-4 text-right font-semibold text-green-600">{Math.round(summaryData?.total_amount ?? 0).toLocaleString()}$</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900">Total Tax Collected</td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">{Math.round(summaryData?.total_tax ?? 0).toLocaleString()}$</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900">Total Items Sold</td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">{summaryData?.total_items ?? 0}</td>
                      </tr>
                      <tr className="hover:bg-gray-50 bg-orange-50">
                        <td className="px-6 py-4 text-gray-900 font-semibold">Average Transaction Value</td>
                        <td className="px-6 py-4 text-right font-bold text-orange-600">{Math.round(summaryData?.average_transaction ?? 0).toLocaleString()}$</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

}

