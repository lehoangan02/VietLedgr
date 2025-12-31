'use client';
import Link from 'next/link';
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/SideBar';
import Header from '@/components/Header';
import { getLedgerEntries } from '@/lib/fast-api/ledger';
import { getStoreCurrentUser } from '@/lib/fast-api/userStoreId';

// --- Icons ---
const PayIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

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
      console.error('Expense Fetch Error:', err);
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
    <main className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Header
            pageName="Expenses"
            description="Operational cost tracking & payment control"
          />
          <Link href="expenses/payment">
            <button
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 transition shadow-lg active:scale-95 font-semibold"
            >
              <PayIcon className="h-4 w-4" />
              Pay Expense
            </button>
          </Link>
        </div>

        {/* Total Expense Card */}
        <div className="mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
              Total Expenses
            </span>
            <div className="text-4xl font-bold text-gray-900 mt-3">
              {totalExpense.toLocaleString()}
              <span className="text-lg font-medium text-gray-400"> VND</span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 text-red-600 text-sm font-semibold bg-red-50 px-4 py-2 rounded-xl border border-red-100">
            ⚠️ {error}
          </div>
        )}

        {/* Expense Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full font-sans">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Description
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.length > 0 ? (
                expenses.map((expense) => (
                  <tr
                    key={expense.entry_id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-5 text-sm text-gray-500">
                      {new Date(expense.entry_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-800 font-medium">
                      {expense.description}
                    </td>
                    <td className="px-6 py-5 text-right text-sm text-red-600 font-bold">
                      {Number(expense.debit_amount).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-24 text-center">
                    <p className="text-gray-400 font-medium">
                      {loading
                        ? 'Loading expenses...'
                        : 'No expense records found.'}
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
