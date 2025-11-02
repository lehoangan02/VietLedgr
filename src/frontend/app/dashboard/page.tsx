"use client";
import { useState } from "react";

export default function DashboardPage() {
  const [activeView, setActiveView] = useState("inventory");
  return (
    <div className="flex h-screen bg-white">
      
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen w-96 bg-gray-800 p-4 text-white overflow-y-auto">
        <div className="flex items-center gap-3 mb-4">
            <img src="corner_logo.webp" alt="Logo" className="w-16 h-16 rounded-xl object-cover"/>
            <h2 className="text-xl font-bold">VietLedgr</h2>
        </div>
        <ul className="space-y-2">
          <li>
            <button 
            onClick={() => setActiveView('inventory')}
            className={`w-full h-16 rounded p-2 text-left text-lg hover:bg-gray-600 ${activeView === 'inventory' ? 'bg-gray-600' : 'bg-gray-700'}`}>
              Button 1
            </button>
          </li>
          <li>
            <button onClick={() => setActiveView('ledger')} className={`w-full h-16 rounded p-2 text-left text-lg hover:bg-gray-600 ${activeView === 'ledger' ? 'bg-gray-600' : 'bg-gray-700'}`}>
              Button 2
            </button>
          </li>
          <li>
            <button onClick={() => setActiveView('report')} className={`w-full h-16 rounded p-2 text-left text-lg hover:bg-gray-600 ${activeView === 'report' ? 'bg-gray-600' : 'bg-gray-700'}`}>
              Button 3
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <main className="ml-96 flex-1 p-8 bg-white overflow-y-auto">
        {activeView === 'inventory' && (
        <div>
          <h1 className="text-3xl font-bold">Main Content</h1>
          <p className="mt-4">This is the inventory content area.</p>
        </div>
        )}
        {activeView === 'ledger' && (
        <div>
          <h1 className="text-3xl font-bold">Ledger Content</h1>
          <p className="mt-4">This is the ledger content area.</p>
        </div>
        )}
        {activeView === 'report' && (
        <div>
          <h1 className="text-3xl font-bold">Report Content</h1>
          <p className="mt-4">This is the report content area.</p>
        </div>
        )}

      
        
      </main>

    </div>
  );
}