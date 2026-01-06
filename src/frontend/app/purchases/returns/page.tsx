'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/SideBar';
import {
  Loader2,
  Search,
  Calendar,
  RotateCcw,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- Types based on your Pydantic Schema ---
interface BatchResponse {
  batch_id: string; // UUID
  product_id: string;
  warehouse_id: string;
  stock: number;
  cost: number | string; // Decimal
  sale_price: number | string;
  supplier_name: string | null;
  import_date: string;
  profit_margin: number | string;
  profit_margin_percent: number | string;
}

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export default function ReturnOrdersPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<BatchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const fetchBatches = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${FASTAPI_URL}/api/batches/`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      const data = await res.json();
      // Router returns: list[batch_schema.BatchResponse]
      setBatches(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError("Cannot connect to Batch API. Verify backend is running.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleReturnAction = async (batch: BatchResponse) => {
    const amount = prompt(`Units to return to ${batch.supplier_name || 'provider'}?\nStock Available: ${batch.stock}`, "1");

    if (amount === null) return;
    const qty = parseInt(amount);

    if (isNaN(qty) || qty <= 0 || qty > batch.stock) {
      alert("Invalid quantity entry.");
      return;
    }

    try {
      // Logic: Update stock via PUT /{batch_id} using BatchUpdate schema
      const res = await fetch(`${FASTAPI_URL}/api/batches/${batch.batch_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          stock: batch.stock - qty
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to update batch.");
      }

      alert(`Success: ${qty} units processed for return.`);
      fetchBatches(); // Refresh list to see updated stock
    } catch (err: any) {
      alert(`Network Error: ${err.message}`);
    }
  };

  const filteredBatches = useMemo(() => {
    return batches.filter(b =>
      !query ||
      b.supplier_name?.toLowerCase().includes(query.toLowerCase()) ||
      b.batch_id.toLowerCase().includes(query.toLowerCase())
    );
  }, [batches, query]);

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="w-full max-w-screen-2xl mx-auto flex gap-6 p-6 min-h-screen bg-gray-50/50">
      <Sidebar />

      <main className="flex-1">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition">
                <ArrowLeft size={20} className="text-gray-400" />
              </button>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Batch Reversal</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Return Orders</h1>
            <p className="text-sm text-gray-500 font-medium">Decrease stock levels for specific inbound batches</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="p-6">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Filter by Supplier or Batch UUID..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 bg-gray-50/50">
                <th className="py-4 pl-8 font-bold text-[10px] uppercase tracking-widest">Import Date</th>
                <th className="py-4 font-bold text-[10px] uppercase tracking-widest">Supplier</th>
                <th className="py-4 font-bold text-[10px] uppercase tracking-widest text-center">Current Stock</th>
                <th className="py-4 font-bold text-[10px] uppercase tracking-widest">Cost (VND)</th>
                <th className="py-4 pr-8 text-right font-bold text-[10px] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBatches.map((batch) => (
                <tr key={batch.batch_id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="py-5 pl-8">
                    <div className="flex items-center gap-4">
                      <Calendar size={18} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
                      <div>
                        <p className="font-bold text-gray-900">{new Date(batch.import_date).toLocaleDateString()}</p>
                        <p className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{batch.batch_id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 font-semibold text-gray-700">{batch.supplier_name || 'N/A'}</td>
                  <td className="py-5 text-center">
                    <div className="inline-flex items-center gap-2">
                      <span className={`font-black ${batch.stock <= 0 ? 'text-gray-300' : 'text-gray-900'}`}>{batch.stock}</span>
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Units</span>
                    </div>
                  </td>
                  <td className="py-5 font-mono text-xs font-bold text-gray-500">
                    {Number(batch.cost).toLocaleString()}
                  </td>
                  <td className="py-5 pr-8 text-right">
                    <button
                      onClick={() => handleReturnAction(batch)}
                      disabled={batch.stock <= 0}
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-20 shadow-lg shadow-indigo-100 flex items-center gap-2 ml-auto"
                    >
                      <RotateCcw size={12} />
                      Return
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No Batches Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}