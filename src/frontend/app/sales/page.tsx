'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Eye, Download, Loader2, AlertCircle, LogIn } from 'lucide-react';
import Sidebar from '@/components/SideBar';

// ============================================================================
// CONFIGURATION
// ============================================================================
const API_BASE_URL = '/api/transactions';

// ============================================================================
// INTERFACES
// ============================================================================
export interface TransactionItem {
  item_id: string;
  batch_id: string;
  quantity: number;
  price_at_sale: number;
  cost_at_sale?: number;
  created_at?: string;
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
  total_tax?: number;
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
const MetricCard: React.FC<{ label: string; value: number | string; icon: string }> = ({ label, value, icon }) => {
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
        store_id: filterStore // 🟢 Now matches your login session
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
      setError(err.message === "AUTH_REQUIRED" ? "AUTH_REQUIRED" : err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, filterStore]);

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
      setError(err.message === "AUTH_REQUIRED" ? "AUTH_REQUIRED" : err.message);
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

  // UI calculations
  const displayItems = useMemo(() => {
    return salesData.items.flatMap((transaction) =>
      transaction.items.map((item) => ({
        ...item,
        transaction_id: transaction.transaction_id,
        transaction_date: transaction.created_at,
        tax: item.tax || (item.price_at_sale * 0.1),
        discount: item.discount || 0
      }))
    );
  }, [salesData]);

  const startIndex = (salesData.page - 1) * salesData.page_size + 1;
  const endIndex = Math.min(salesData.page * salesData.page_size, salesData.total);

  // --- Render logic (Loading, Error, Tabs) ---
  if (!filterStore && !error) return (
     <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>
  );

  if (error) {
    return (
        <div className="w-full max-w-screen-2xl mx-auto flex gap-6">
            <Sidebar />
            <div className="flex-1 min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
                {error === "AUTH_REQUIRED" ? (
                  <button onClick={() => router.push('/login')} className="px-6 py-2 bg-orange-500 text-white rounded-lg">Login Required</button>
                ) : (
                  <div className="text-center"><AlertCircle className="text-red-500 mx-auto mb-2" /><p>{error}</p></div>
                )}
            </div>
        </div>
    );
  }

  return (
    <div className="w-full max-w-screen-2xl mx-auto flex gap-6">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-gray-50 p-6">
        <div className="mb-6"><h1 className="text-3xl font-bold text-gray-900">Sales Management</h1></div>
        
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
                     {displayItems.map((item, idx) => (
                       <tr key={idx} className="hover:bg-gray-50">
                         <td className="px-6 py-4">{new Date(item.transaction_date!).toLocaleDateString()}</td>
                         <td className="px-6 py-4 text-orange-500 font-mono">{item.transaction_id.slice(0,8)}</td>
                         <td className="px-6 py-4 text-right">{item.quantity}</td>
                         <td className="px-6 py-4 text-right font-bold">${(item.price_at_sale * item.quantity).toLocaleString()}</td>
                         <td className="px-6 py-4 text-center"><Eye size={16} className="mx-auto text-gray-400" /></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
             {/* Pagination */}
             <div className="p-4 border-t flex justify-between items-center text-sm">
                <span>Showing {startIndex} to {endIndex} of {salesData.total}</span>
                <div className="flex gap-2">
                   <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-30">Prev</button>
                   <button onClick={() => setPage(p => p + 1)} disabled={page >= salesData.total_pages} className="px-3 py-1 border rounded disabled:opacity-30">Next</button>
                </div>
             </div>
           </div>
        ) : (
          <div>
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : summaryData && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                <MetricCard label="Total Sales" value={summaryData.total_amount} icon="💰" />
                <MetricCard label="Orders" value={summaryData.total_transactions} icon="📊" />
                <MetricCard label="Items Sold" value={summaryData.total_items} icon="📦" />
                <MetricCard label="Average" value={summaryData.average_transaction} icon="💵" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}