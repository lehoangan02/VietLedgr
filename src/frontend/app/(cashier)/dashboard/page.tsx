"use client";
import { useState, useEffect } from "react";
import Inventory from "./inventory";
import Ledger from "./ledger";
import Report from "./report";
import Image from "next/image";

export default function DashboardPage() {
  const [activeView, setActiveView] = useState("inventory");
  
  // --- New State for Shared Data ---
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch Data at the Dashboard Level ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Get user to get store_id
        const userRes = await fetch('http://localhost:8000/api/user/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await userRes.json();
        const storeId = userData.store_id || userData.id;

        // Fetch ledger entries
        const ledgerRes = await fetch(`http://localhost:8000/api/ledger/entries?store_id=${storeId}&page_size=100`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await ledgerRes.json();
        
        // Match your backend response structure
        setLedgerData(data.items || data || []);
      } catch (error) {
        console.error("Dashboard data sync error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-white">
      
      {/* Sidebar - Style Unchanged */}
      <div className="fixed top-0 left-0 h-screen w-96 bg-gray-800 p-4 text-white overflow-y-auto">
        <div className="flex items-center gap-3 mb-4">
            <Image src="/corner_logo.webp" alt="Logo" className="w-16 h-16 rounded-xl object-cover" width={16} height={16}/>
            <h2 className="text-xl font-bold">VietLedgr</h2>
        </div>
        <ul className="space-y-2">
          <li>
            <button 
            onClick={() => setActiveView('inventory')}
            className={`w-full h-16 rounded p-2 text-left text-lg hover:bg-gray-600 ${activeView === 'inventory' ? 'bg-gray-600' : 'bg-gray-700'}`}>
              Inventory
            </button>
          </li>
          <li>
            <button onClick={() => setActiveView('ledger')} className={`w-full h-16 rounded p-2 text-left text-lg hover:bg-gray-600 ${activeView === 'ledger' ? 'bg-gray-600' : 'bg-gray-700'}`}>
              Ledger
            </button>
          </li>
          <li>
            <button onClick={() => setActiveView('report')} className={`w-full h-16 rounded p-2 text-left text-lg hover:bg-gray-600 ${activeView === 'report' ? 'bg-gray-600' : 'bg-gray-700'}`}>
              Report
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content - Style Unchanged */}
      <main className="ml-96 flex-1 overflow-y-auto">
        {activeView === 'inventory' && (
          <div>
            <Inventory />
          </div>
        )}
        {activeView === 'ledger' && (
          <div>
            {/* Pass the fetched data down to avoid double-fetching */}
            <Ledger initialData={ledgerData} isLoading={loading} />
          </div>
        )}
        {activeView === 'report' && (
          <div>
            {/* Pass data to report to fix the .filter() crash */}
            <Report data={ledgerData} />
          </div>
        )}
      </main>
    </div>
  );
}