'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/SideBar';
import { getLedgerEntries } from '@/lib/fast-api/ledger';
import { getStoreCurrentUser } from '@/lib/fast-api/userStoreId';
import Header from '@/components/Header';

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

export default function LedgerPage() {
   const [entries, setEntries] = useState<LedgerEntry[]>([]);
   const [filterType, setFilterType] = useState<string>('');
   const [loading, setLoading] = useState<boolean>(false);
   const [error, setError] = useState<string>('');

   const fetchLedgerData = async () => {
      setLoading(true);
      setError('');
      try {
         const store_id = await getStoreCurrentUser();
         if (!store_id) {
            throw new Error("Cannot get store id");
         }

         const params = new URLSearchParams({
            store_id: store_id,
            page: "1",
            page_size: "100"
         });
         if (filterType) params.append('account_type', filterType);
         const filterParams = params.toString();
         const ledgerItems = await getLedgerEntries(filterParams);
         if(!ledgerItems) {
            throw new Error("Cannot get ledger items");
         }
         setEntries(ledgerItems);
      } catch (err: unknown) {
         const message = err instanceof Error ? err.message : String(err);
         setError(message);
         console.error("Ledger Fetch Error:", err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchLedgerData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [filterType]);

   const totals = useMemo(() => {
      return entries.reduce((acc, curr) => ({
         debit: acc.debit + (parseFloat(curr.debit_amount.toString()) || 0),
         credit: acc.credit + (parseFloat(curr.credit_amount.toString()) || 0)
      }), { debit: 0, credit: 0 });
   }, [entries]);

   return (
      <main className="flex-1 p-8">
         <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
               <Header pageName="Financial Ledger" description="Real-time double-entry bookkeeping"/>
               <button
                  onClick={fetchLedgerData}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition shadow-lg active:scale-95 font-semibold"
               >
                  <RefreshIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Sync Ledger
               </button>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Total Debits</span>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{totals.debit.toLocaleString()} <span className="text-lg font-medium text-gray-400">VND</span></div>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Total Credits</span>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{totals.credit.toLocaleString()} <span className="text-lg font-medium text-gray-400">VND</span></div>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Net Balance</span>
                  <div className={`text-3xl font-bold mt-2 ${totals.debit - totals.credit >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                     {(totals.debit - totals.credit).toLocaleString()} <span className="text-lg font-medium text-gray-400">VND</span>
                  </div>
               </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <FilterIcon className="h-5 w-5 text-gray-400" />
                  <select
                     value={filterType}
                     onChange={(e) => setFilterType(e.target.value)}
                     className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer"
                  >
                     <option value="">All Categories</option>
                     <option value="ASSET">Assets (Dr)</option>
                     <option value="LIABILITY">Liabilities (Cr)</option>
                     <option value="EQUITY">Equity</option>
                     <option value="REVENUE">Revenue (Cr)</option>
                     <option value="EXPENSE">Expenses (Dr)</option>
                  </select>
               </div>
               {error && <div className="text-red-500 text-sm font-semibold bg-red-50 px-3 py-1 rounded-full border border-red-100">⚠️ {error}</div>}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <table className="min-w-full font-sans">
                  <thead className="bg-gray-50 border-b border-gray-100">
                     <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">Account Type</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">Description</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-widest">Debit</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-widest">Credit</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {entries.length > 0 ? entries.map((entry) => (
                        <tr key={entry.entry_id} className="hover:bg-gray-50/50 transition-colors">
                           <td className="px-6 py-5 text-sm text-gray-500 whitespace-nowrap font-normal">{new Date(entry.entry_date).toLocaleDateString()}</td>
                           <td className="px-6 py-5">
                              <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-tighter border ${entry.account_type === 'ASSET' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                 entry.account_type === 'REVENUE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                    'bg-gray-50 text-gray-600 border-gray-100'
                                 }`}>
                                 {entry.account_type}
                              </span>
                           </td>
                           <td className="px-6 py-5 text-sm text-gray-800 font-medium">{entry.description}</td>
                           <td className="px-6 py-5 text-right text-sm text-blue-600 font-semibold">
                              {Number(entry.debit_amount) > 0 ? Number(entry.debit_amount).toLocaleString() : '—'}
                           </td>
                           <td className="px-6 py-5 text-right text-sm text-emerald-600 font-semibold">
                              {Number(entry.credit_amount) > 0 ? Number(entry.credit_amount).toLocaleString() : '—'}
                           </td>
                        </tr>
                     )) : (
                        <tr>
                           <td colSpan={5} className="px-6 py-24 text-center">
                              <div className="flex flex-col items-center gap-3">
                                 <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                    <RefreshIcon className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
                                 </div>
                                 <p className="text-gray-400 font-medium">{loading ? 'Loading financial records...' : 'No ledger data found for this store.'}</p>
                              </div>
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