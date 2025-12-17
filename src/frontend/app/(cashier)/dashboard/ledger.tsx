"use client";
import React, { useState, useMemo, useEffect, ChangeEvent } from 'react';

// --- Icons ---
const FilterIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);
const RefreshIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
);

interface LedgerEntry {
  entry_id: string;
  account_type: string;
  description: string;
  debit_amount: string | number;
  credit_amount: string | number;
  entry_date: string;
}

export default function Ledger() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [filterType, setFilterType] = useState<string>(''); 
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchLedgerData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found.');
        return;
      }

      // 1. Get User info
      const userRes = await fetch('http://localhost:8000/api/user/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const userData = await userRes.json();
      console.log("DEBUG: User Data from API:", userData); // LOOK AT THIS IN CONSOLE (F12)

      // Try different common keys for the store ID
    //   const userStoreId = userData.store_id || (userData.store && userData.store.id) || userData.id;
      const userStoreId = "1cd61ba6-4943-4cf3-97de-d9e8716b3ebf";
      if (!userStoreId) {
        throw new Error('User has no assigned Store ID in the backend response.');
      }

      // 2. Fetch Ledger using the ID found
      const params = new URLSearchParams({
        store_id: userStoreId,
        page: "1",
        page_size: "100"
      });
      if (filterType) params.append('account_type', filterType);

      const ledgerRes = await fetch(`http://localhost:8000/api/ledger/entries?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await ledgerRes.json();
      
      if (!ledgerRes.ok) {
          throw new Error(data.detail || 'Failed to fetch ledger');
      }

      // Final check: some backends return a flat array, others return { items: [] }
      const items = Array.isArray(data) ? data : (data.items || []);
      setEntries(items);

    } catch (err: any) {
      setError(err.message);
      console.error("Ledger Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, [filterType]);

  const totals = useMemo(() => {
    return entries.reduce((acc, curr) => ({
      debit: acc.debit + (parseFloat(curr.debit_amount.toString()) || 0),
      credit: acc.credit + (parseFloat(curr.credit_amount.toString()) || 0)
    }), { debit: 0, credit: 0 });
  }, [entries]);

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">General Ledger</h1>
          <button onClick={fetchLedgerData} className="inline-flex items-center px-4 py-2 bg-white border rounded shadow-sm hover:bg-gray-50">
            <RefreshIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
            <p className="text-xs font-bold text-gray-400 uppercase">Total Debits (+)</p>
            <p className="text-2xl font-mono font-bold text-gray-900 mt-1">{totals.debit.toLocaleString()} VND</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-emerald-500">
            <p className="text-xs font-bold text-gray-400 uppercase">Total Credits (-)</p>
            <p className="text-2xl font-mono font-bold text-gray-900 mt-1">{totals.credit.toLocaleString()} VND</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-500">
            <p className="text-xs font-bold text-gray-400 uppercase">Net Balance</p>
            <p className={`text-2xl font-mono font-bold mt-1 ${totals.debit >= totals.credit ? 'text-gray-900' : 'text-red-600'}`}>
                {(totals.debit - totals.credit).toLocaleString()} VND
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex items-center justify-between">
            <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block px-3 py-2 border rounded-md bg-white text-sm"
            >
                <option value="">All Accounts</option>
                <option value="ASSET">Assets</option>
                <option value="LIABILITY">Liabilities</option>
                <option value="EQUITY">Equity</option>
                <option value="REVENUE">Revenue</option>
                <option value="EXPENSE">Expenses</option>
            </select>
            {error && <span className="text-red-500 text-sm font-medium">Error: {error}</span>}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Debit</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Credit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.length > 0 ? entries.map((entry) => (
                <tr key={entry.entry_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(entry.entry_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-[10px] font-bold rounded bg-gray-100 uppercase">{entry.account_type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{entry.description}</td>
                  <td className="px-6 py-4 text-right font-mono text-sm text-blue-600">
                    {Number(entry.debit_amount) > 0 ? Number(entry.debit_amount).toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm text-emerald-600">
                    {Number(entry.credit_amount) > 0 ? Number(entry.credit_amount).toLocaleString() : '—'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                    {loading ? 'Fetching data...' : 'No transactions found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}