'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Eye, FileText, Download, Printer } from 'lucide-react';
import Sidebar from '@/components/SideBar';

// ============================================================================
// UNIFIED TYPESCRIPT INTERFACES
// Backend Integration: These interfaces mirror src/backend/app/schemas/transaction.py
// When connecting to FastAPI:
// - Replace generateMockTransactions() with API call to GET /transactions/?page=X&page_size=Y&store_id=Z
// - Replace generateMockTransactionSummary() with API call to GET /transactions/summary/report?start_date=X&end_date=Y
// ============================================================================

/**
 * Represents a single line item in a transaction
 * Maps to: backend TransactionItemResponse
 */
export interface TransactionItem {
  item_id: string; // UUID
  batch_id: string; // UUID
  quantity: number;
  price_at_sale: number; // Sale price per unit
  cost_at_sale: number; // Cost per unit
  created_at: string; // ISO datetime
  // UI-only fields (not from backend)
  product_name?: string;
  batch_number?: string;
  tax?: number; // Tax per unit
  discount?: number; // Discount per unit
}

/**
 * Represents a complete transaction/order
 * Maps to: backend TransactionResponse
 */
export interface Transaction {
  transaction_id: string; // UUID
  store_id: string; // UUID
  user_id: string; // UUID
  device_id?: string | null; // POS terminal ID
  total_amount: number; // Total sale amount
  total_tax: number; // Total tax collected
  created_at: string; // ISO datetime
  items: TransactionItem[];
}

/**
 * Paginated list response for transactions
 * Maps to: backend TransactionListResponse
 * Backend Endpoint: GET /transactions/?page=X&page_size=Y&store_id=Z
 */
export interface TransactionListResponse {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Transaction summary for reports/dashboard
 * Maps to: backend TransactionSummary
 * Backend Endpoint: GET /transactions/summary/report?start_date=X&end_date=Y&store_id=Z
 */
export interface TransactionSummary {
  total_transactions: number;
  total_amount: number;
  total_tax: number;
  total_items: number;
  average_transaction: number;
  date_range_start: string;
  date_range_end: string;
}

/**
 * Filter parameters for sales queries
 * Maps to: backend query parameters
 */
export interface SalesListFilters {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  store: string; // "All" or store_id UUID
  category: string; // "All" or category name
  brand: string; // "All" or brand name
}
// ============================================================================
// MOCK DATA CONFIGURATION
// ============================================================================

const PRODUCT_NAMES = [
  'Lenovo IdeaPad 3',
  'Beats Pro',
  'Nike Jordan',
  'Apple Series 5 Watch',
  'Amazon Echo Dot',
  'Sanford Chair Sofa',
  'Red Premium Satchel',
  'iPhone 14 Pro',
  'Gaming Chair',
  'Borcalis Backpack',
  'Sony WH-1000XM5',
  'iPad Air',
  'MacBook Pro M3',
  'Samsung QLED TV',
  'Dyson V15',
];

const BATCH_NUMBERS = [
  'BATCH-2024-001',
  'BATCH-2024-002',
  'BATCH-2024-003',
  'BATCH-2025-001',
  'BATCH-2025-002',
  'BATCH-2025-003',
  'BATCH-2025-004',
  'BATCH-2025-005',
];

// ============================================================================
// UTILITY: DETERMINISTIC RANDOM GENERATION
// Ensures server and client render identically (prevents hydration mismatch)
// ============================================================================

/**
 * Seeded pseudo-random number generator
 * Uses sine-based algorithm for deterministic values across renders
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ============================================================================
// MOCK DATA GENERATORS
// These functions create realistic mock data that mirrors backend response structure
// For backend integration, replace these with actual API calls
// ============================================================================

/**
 * Generate mock transaction items
 * @param count Number of items to generate
 * @param transactionIndex Unique identifier for seeded consistency
 * @returns Array of TransactionItem objects
 */
function generateMockTransactionItems(count: number, transactionIndex: number): TransactionItem[] {
  const items: TransactionItem[] = [];

  for (let i = 0; i < count; i++) {
    const seed = transactionIndex * 1000 + i;

    const cost = Math.floor(seededRandom(seed) * 300) + 50;
    const salePrice = cost + Math.floor(seededRandom(seed + 1) * 150) + 20;
    const quantity = Math.floor(seededRandom(seed + 2) * 10) + 1;
    const tax = salePrice * 0.1; // 10% tax
    const discount = seededRandom(seed + 3) > 0.7 ? salePrice * 0.05 : 0;
    const batchIndex = Math.floor(seededRandom(seed + 4) * 8);
    const productIndex = Math.floor(seededRandom(seed + 5) * PRODUCT_NAMES.length);
    const daysAgo = Math.floor(seededRandom(seed + 6) * 30);

    items.push({
      item_id: `item-${i + 1}`,
      batch_id: `batch-${batchIndex + 1}`,
      quantity,
      price_at_sale: salePrice,
      cost_at_sale: cost,
      created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      product_name: PRODUCT_NAMES[productIndex],
      batch_number: BATCH_NUMBERS[batchIndex],
      tax,
      discount,
    });
  }

  return items;
}

/**
 * Generate mock transaction list
 * @param page Page number (1-indexed)
 * @param pageSize Items per page
 * @returns TransactionListResponse object
 */
function generateMockTransactions(page: number, pageSize: number): TransactionListResponse {
  const total = 250;
  const items: Transaction[] = [];

  for (let i = (page - 1) * pageSize; i < page * pageSize && i < total; i++) {
    const seed = i;
    const itemCount = Math.floor(seededRandom(seed) * 5) + 1;
    const transactionItems = generateMockTransactionItems(itemCount, i);
    const totalAmount = transactionItems.reduce((sum, item) => sum + item.price_at_sale * item.quantity, 0);
    const totalTax = transactionItems.reduce((sum, item) => sum + (item.tax ?? 0) * item.quantity, 0);
    const userIndex = Math.floor(seededRandom(seed + 100) * 5);
    const deviceIndex = Math.floor(seededRandom(seed + 101) * 3);

    items.push({
      transaction_id: `txn-${i + 1}`,
      store_id: 'store-001',
      user_id: `user-${userIndex + 1}`,
      device_id: `POS-${deviceIndex + 1}`,
      total_amount: totalAmount,
      total_tax: totalTax,
      created_at: new Date(Date.now() - Math.floor(seededRandom(seed + 102) * 30) * 24 * 60 * 60 * 1000).toISOString(),
      items: transactionItems,
    });
  }

  return {
    items,
    total,
    page,
    page_size: pageSize,
    total_pages: Math.ceil(total / pageSize),
  };
}

/**
 * Generate mock transaction summary
 * @param transactions List of transactions to summarize
 * @param startDate Start date range
 * @param endDate End date range
 * @returns TransactionSummary object
 */
function generateMockTransactionSummary(
  transactions: Transaction[],
  startDate: string,
  endDate: string
): TransactionSummary {
  const totalTransactions = transactions.length;
  const totalAmount = transactions.reduce((sum, txn) => sum + txn.total_amount, 0);
  const totalTax = transactions.reduce((sum, txn) => sum + txn.total_tax, 0);
  const totalItems = transactions.reduce((sum, txn) => sum + txn.items.length, 0);

  return {
    total_transactions: totalTransactions,
    total_amount: totalAmount,
    total_tax: totalTax,
    total_items: totalItems,
    average_transaction: totalTransactions > 0 ? totalAmount / totalTransactions : 0,
    date_range_start: startDate,
    date_range_end: endDate,
  };
}

// ============================================================================
// METRIC CARD COMPONENT - For Sales Summary Tab
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
            {typeof value === 'number' ? (label.includes('Sales') || label.includes('Total') || label.includes('Average') ? `$${value.toLocaleString()}` : value.toLocaleString()) : value}
          </p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
      <div className={`${badgeColor} text-xs font-semibold px-2 py-1 rounded-full mt-4 inline-block`}>
        {changeType === 'positive' ? '+' : '-'}{Math.abs(changePercent)}% <span>From Last Month</span>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN SALES LIST PAGE COMPONENT
// ============================================================================

export default function SaleListPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'summary'>('list');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-12-13');
  const [filterStore, setFilterStore] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterBrand, setFilterBrand] = useState('All');

  // Generate mock data based on current filters and pagination
  const data = useMemo(() => {
    return generateMockTransactions(page, pageSize);
  }, [page, pageSize]);

  // Generate summary data from all available data
  const summaryData = useMemo(() => {
    // For real implementation, fetch all transactions in date range
    const allData = generateMockTransactions(1, 250);
    return generateMockTransactionSummary(allData.items, startDate, endDate);
  }, [startDate, endDate]);

  // Flatten all transaction items for table display
  const displayItems = useMemo(() => {
    return data.items.flatMap((transaction) =>
      transaction.items.map((item) => ({
        ...item,
        transaction_id: transaction.transaction_id,
        transaction_date: transaction.created_at,
      }))
    );
  }, [data]);

  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, data.total);

  // ========================================================================
  // RENDER: SALES LIST TAB
  // ========================================================================

  const renderSalesListTab = () => (
    <>
      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          {/* Date Range Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            />
          </div>

          {/* Store Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
            <select
              value={filterStore}
              onChange={(e) => {
                setFilterStore(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option>All</option>
              <option>Store 1</option>
              <option>Store 2</option>
              <option>Store 3</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option>All</option>
              <option>Electronics</option>
              <option>Furniture</option>
              <option>Clothing</option>
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <select
              value={filterBrand}
              onChange={(e) => {
                setFilterBrand(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option>All</option>
              <option>Apple</option>
              <option>Samsung</option>
              <option>Nike</option>
              <option>Lenovo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  Batch
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  Cost
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  Sale Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  Tax
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  Discount
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
                    key={`${item.transaction_id}-${index}`}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-orange-500 font-semibold">
                      {item.transaction_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.product_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.batch_number}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      ${item.cost_at_sale.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">
                      ${item.price_at_sale.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-green-600">
                      ${(item.tax ?? 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-red-600">
                      ${(item.discount ?? 0).toFixed(2)}
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
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No sales data available
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
              Showing {startIndex} to {endIndex} of {data.total} entries
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

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, data.total_pages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition ${page === pageNum
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {data.total_pages > 5 && (
                <>
                  <span className="px-2 py-1 text-gray-600">...</span>
                  <button
                    onClick={() => setPage(data.total_pages)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition ${page === data.total_pages
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {data.total_pages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setPage(Math.min(data.total_pages, page + 1))}
              disabled={page === data.total_pages}
              className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // ========================================================================
  // RENDER: SALES SUMMARY TAB
  // ========================================================================

  const renderSalesSummaryTab = () => (
    <>
      {/* Dashboard Metrics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Sales"
            value={`$${summaryData.total_amount.toLocaleString()}`}
            changePercent={18.2}
            changeType="positive"
            icon="💰"
          />
          <MetricCard
            label="Total Orders"
            value={summaryData.total_transactions}
            changePercent={12.5}
            changeType="positive"
            icon="📊"
          />
          <MetricCard
            label="Total Items Sold"
            value={summaryData.total_items}
            changePercent={22.3}
            changeType="positive"
            icon="📦"
          />
          <MetricCard
            label="Avg Transaction"
            value={`$${summaryData.average_transaction.toLocaleString()}`}
            changePercent={8.1}
            changeType="positive"
            icon="💵"
          />
        </div>
      </div>

      {/* Filter Section for Summary */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Filter Report</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
            <select
              value={filterStore}
              onChange={(e) => setFilterStore(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option>All</option>
              <option>Store 1</option>
              <option>Store 2</option>
              <option>Store 3</option>
            </select>
          </div>

          <div>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md transition">
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Sales Summary</h2>
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
                  ${summaryData.total_amount.toLocaleString()}
                </td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Total Tax Collected</td>
                <td className="px-6 py-4 text-sm text-right text-green-600">
                  ${summaryData.total_tax.toLocaleString()}
                </td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Total Items Sold</td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">
                  {summaryData.total_items}
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Average Transaction Value</td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-orange-600">
                  ${summaryData.average_transaction.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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
          <p className="text-gray-600">View sales orders and transaction summaries</p>
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
