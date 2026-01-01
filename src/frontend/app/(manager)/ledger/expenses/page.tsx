'use client';
import Link from 'next/link';
import React, { useState, useMemo, useEffect } from 'react';
import Header from '@/components/Header';
import { getLedgerEntries } from '@/lib/fast-api/ledger';
import { getStoreCurrentUser } from '@/lib/fast-api/userStoreId';
import { Wallet, ArrowUpRight, AlertCircle, Landmark } from 'lucide-react';

interface ExpenseEntry {
  entry_id: string;
  description: string;
  debit_amount: string | number;
  entry_date: string;
}

export default function ExpensePage() {
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- HARDCODED BALANCE ---
  const hardcodedBusinessBalance = 500000000; 

  const fetchExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const store_id = await getStoreCurrentUser();
      if (!store_id) throw new Error('Cannot get store id');

      const params = new URLSearchParams({
        store_id,
        account_type: 'EXPENSE',
        page: '1',
        page_size: '100'
      });

      const data = await getLedgerEntries(params.toString());
      if (!data) throw new Error('Cannot fetch expenses');

      setExpenses(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const totalExpense = useMemo(() => {
    return expenses.reduce(
      (sum, e) => sum + (parseFloat(e.debit_amount.toString()) || 0),
      0
    );
  }, [expenses]);

  return (
    <main className="flex-1 p-8 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-10">
          <Header
            pageName="Expenses"
            description="Operational cost tracking & liquidity management"
          />
          <Link href="expenses/payment">
            <button
              className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-2xl hover:bg-red-500 transition shadow-xl shadow-red-100 active:scale-95 font-bold text-sm uppercase tracking-wider"
            >
              <Landmark className="h-5 w-5" />
              Pay with Business Account
            </button>
          </Link>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Current Business Money Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Wallet size={120} />
            </div>
            <div className="relative z-10">
                <span className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-[0.2em]">
                <Wallet className="h-3 w-3" /> Current Business Money
                </span>
                <div className="text-4xl font-black text-gray-900 mt-4 flex items-baseline gap-2">
                {hardcodedBusinessBalance.toLocaleString()}
                <span className="text-sm font-bold text-gray-400 font-mono">VND</span>
                </div>
                <p className="text-gray-400 text-xs mt-2 italic">Available funds for operational payments</p>
            </div>
          </div>

          {/* Total Expense Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <ArrowUpRight size={120} />
            </div>
            <div className="relative z-10">
                <span className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-[0.2em]">
                <ArrowUpRight className="h-3 w-3" /> Accumulated Expenses
                </span>
                <div className="text-4xl font-black text-gray-900 mt-4 flex items-baseline gap-2">
                {totalExpense.toLocaleString()}
                <span className="text-sm font-bold text-gray-400 font-mono">VND</span>
                </div>
                <p className="text-gray-400 text-xs mt-2 italic">Total costs logged in this period</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center gap-3 text-red-600 text-sm font-semibold bg-red-50 px-5 py-3 rounded-2xl border border-red-100">
            <AlertCircle className="h-5 w-5" /> {error}
          </div>
        )}

        {/* Expense Transactions Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 text-lg">Transaction History</h3>
            <span className="text-xs text-gray-400 font-medium px-3 py-1 bg-gray-50 rounded-full">
                {expenses.length} Records
            </span>
          </div>
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
                <th className="px-8 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.length > 0 ? (
                expenses.map((expense) => (
                  <tr
                    key={expense.entry_id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5 text-sm text-gray-500 font-mono">
                      {new Date(expense.entry_date).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-800 font-semibold group-hover:text-blue-600 transition-colors">
                      {expense.description}
                    </td>
                    <td className="px-8 py-5 text-right text-sm text-red-600 font-black font-mono">
                      -{Number(expense.debit_amount).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-8 py-24 text-center">
                    <p className="text-gray-300 font-medium">
                      {loading ? 'Analyzing ledger...' : 'No business expenses found.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}