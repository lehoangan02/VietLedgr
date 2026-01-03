'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/SideBar';
import { 
  Loader2, 
  Package, 
  AlertCircle, 
  Plus, 
  Search, 
  TrendingUp, 
  Calendar,
  User
} from 'lucide-react';

interface Batch {
  batch_id: string;
  product_id: string;
  warehouse_id: string;
  stock: number;
  cost: number;
  sale_price: number;
  supplier_name: string | null;
  import_date: string;
  profit_margin: number;
  profit_margin_percent: number;
}

export default function PurchaseOrdersPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/batches/');
      if (!res.ok) throw new Error('Failed to fetch purchase batches.');
      const data = await res.json();
      
      // Handle direct list response from FastAPI list[BatchResponse]
      setBatches(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const filteredBatches = useMemo(() => {
    return batches.filter(b => 
      !query || 
      b.supplier_name?.toLowerCase().includes(query.toLowerCase()) ||
      b.batch_id.toLowerCase().includes(query.toLowerCase())
    );
  }, [batches, query]);

  const totalInventoryValue = useMemo(() => {
    return batches.reduce((sum, b) => sum + (Number(b.cost) * b.stock), 0);
  }, [batches]);

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="w-full max-w-screen-2xl mx-auto flex gap-6 p-6 min-h-screen bg-gray-50/50">
      <Sidebar />

      <main className="flex-1">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Purchase Orders</h1>
            <p className="text-sm text-gray-500 font-medium">Tracking all inbound inventory batches & supplier costs</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-100">
            <Plus size={18} />
            New Purchase
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Batches</span>
            <div className="text-2xl font-black text-gray-900 mt-1">{batches.length}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Active Inventory Value</span>
            <div className="text-2xl font-black text-gray-900 mt-1">
              {totalInventoryValue.toLocaleString()} <span className="text-xs text-gray-400">VND</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Avg. Profit Margin</span>
            <div className="text-2xl font-black text-gray-900 mt-1">
               {batches.length > 0 ? (batches.reduce((a, b) => a + b.profit_margin_percent, 0) / batches.length).toFixed(1) : 0}%
            </div>
          </div>
        </div>

        {/* Search & Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <div className="relative w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by supplier or Batch ID..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 bg-gray-50/50">
                <th className="py-4 pl-8 font-bold text-[10px] uppercase tracking-widest">Import Details</th>
                <th className="py-4 font-bold text-[10px] uppercase tracking-widest">Supplier</th>
                <th className="py-4 font-bold text-[10px] uppercase tracking-widest">Stock & Cost</th>
                <th className="py-4 font-bold text-[10px] uppercase tracking-widest">Margin</th>
                <th className="py-4 pr-8 text-right font-bold text-[10px] uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBatches.map((batch) => (
                <tr key={batch.batch_id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-5 pl-8">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{new Date(batch.import_date).toLocaleDateString()}</p>
                        <p className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">ID: {batch.batch_id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <User size={12} className="text-gray-400" />
                      </div>
                      <span className="font-semibold text-gray-700">{batch.supplier_name || 'Generic Supplier'}</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <div>
                      <p className="font-bold text-gray-900">{batch.stock} Units</p>
                      <p className="text-xs text-gray-400">At {Number(batch.cost).toLocaleString()} VND/ea</p>
                    </div>
                  </td>
                  <td className="py-5">
                    <div>
                      <div className="flex items-center gap-1 text-green-600 font-bold">
                        <TrendingUp size={14} />
                        {batch.profit_margin_percent}%
                      </div>
                      <p className="text-[10px] text-gray-400 uppercase">Per Unit Margin</p>
                    </div>
                  </td>
                  <td className="py-5 pr-8 text-right">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      batch.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {batch.stock > 0 ? 'In Stock' : 'Depleted'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Package className="mx-auto text-gray-200 mb-4" size={48} />
                    <p className="text-gray-400 font-medium">No purchase batches found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}