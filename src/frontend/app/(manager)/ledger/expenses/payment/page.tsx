'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Header from '@/components/Header';
import { getLedgerEntries } from '@/lib/fast-api/ledger';
import { getStoreCurrentUser } from '@/lib/fast-api/userStoreId';
import Image from 'next/image';

interface ExpenseEntry {
  entry_id: string;
  description: string;
  debit_amount: string | number;
  entry_date: string;
}

export default function ExpensePaymentPage() {
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch only unpaid/pending expenses (adjust account_type if needed)
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const store_id = await getStoreCurrentUser();
      const params = new URLSearchParams({
        store_id: store_id || '',
        account_type: 'EXPENSE',
        page: '1',
        page_size: '50'
      });
      const data = await getLedgerEntries(params.toString());
      if (data) setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  // Toggle selection
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Calculate total of selected items
  const totalToPay = useMemo(() => {
    return expenses
      .filter(e => selectedIds.has(e.entry_id))
      .reduce((sum, e) => sum + (parseFloat(e.debit_amount.toString()) || 0), 0);
  }, [expenses, selectedIds]);

  return (
    <main className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Header 
          pageName="Process Payment" 
          description="Select pending expenses and scan to pay" 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          
          {/* LEFT: Expense Selection List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">
              Select Expenses to Settle
            </h3>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto">
                {expenses.length > 0 ? (
                  <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left w-10"></th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Description</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {expenses.map((expense) => (
                        <tr 
                          key={expense.entry_id} 
                          onClick={() => toggleSelect(expense.entry_id)}
                          className={`cursor-pointer transition-colors ${selectedIds.has(expense.entry_id) ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(expense.entry_id)}
                              onChange={() => {}} // Handled by tr onClick
                              className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">
                            {expense.description}
                            <div className="text-xs text-gray-400 font-normal">
                              {new Date(expense.entry_date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                            {Number(expense.debit_amount).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-12 text-center text-gray-400">
                    {loading ? "Loading..." : "No expenses available for payment."}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: QR Code & Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-8 text-center">
              <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
                Payment Summary
              </span>
              
              <div className="my-6">
                <div className="text-gray-400 text-sm">Amount to Pay</div>
                <div className="text-4xl font-black text-gray-900">
                  {totalToPay.toLocaleString()}
                  <span className="text-lg font-medium text-gray-400 ml-1">VND</span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {selectedIds.size} items selected
                </div>
              </div>

              {/* QR Code Section */}
              <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 mb-6 inline-block w-full overflow-hidden">
                <div className="relative w-64 h-64 mx-auto mt-4 bg-white rounded-lg overflow-hidden">
                  <Image 
                    src="/qrcode.jpg" 
                    alt="Payment QR Code" 
                    fill 
                    className="object-cover"
                    priority
                  />
                </div>
                <p className="py-3 text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                  Scan with Banking App
                </p>
              </div>
              <button
                disabled={selectedIds.size === 0}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all disabled:bg-gray-200 disabled:cursor-not-allowed shadow-lg active:scale-95"
                onClick={() => alert('Confirming payment...')}
              >
                Confirm Payment Made
              </button>
              
              <button 
                onClick={() => window.history.back()}
                className="mt-4 text-sm text-gray-400 hover:text-gray-600 font-medium"
              >
                Cancel and Go Back
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}