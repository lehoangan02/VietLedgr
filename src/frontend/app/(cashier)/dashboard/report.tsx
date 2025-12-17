"use client";
import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ComposedChart
} from 'recharts';

// --- Theme Colors ---
const REV_25 = "#3b82f6"; // Primary Blue
const REV_24 = "#94a3b8"; // Muted Gray
const PROFIT_25 = "#10b981"; // Emerald
const PROFIT_24 = "#6ee7b7"; // Light Emerald

// --- Data based on RetailCategory Enum ---
const CATEGORY_SALES = [
  { name: 'FOOD', sales: 80000000, tax: 8000000, profit: 25000000 },
  { name: 'HOUSEHOLD', sales: 45000000, tax: 4500000, profit: 12000000 },
  { name: 'STATIONERY', sales: 15000000, tax: 1500000, profit: 5000000 },
  { name: 'OTHERS', sales: 5000000, tax: 500000, profit: 1500000 },
];

// --- Comparative Data (Millions VND) ---
const MONTHLY_PERFORMANCE = [
  { month: 'Jan', rev24: 120, rev25: 150, prof24: 35, prof25: 45 },
  { month: 'Feb', rev24: 130, rev25: 145, prof24: 38, prof25: 40 },
  { month: 'Mar', rev24: 110, rev25: 160, prof24: 30, prof25: 55 },
  { month: 'Apr', rev24: 140, rev25: 170, prof24: 42, prof25: 50 },
  { month: 'May', rev24: 150, rev25: 190, prof24: 45, prof25: 65 },
  { month: 'Jun', rev24: 145, rev25: 210, prof24: 40, prof25: 75 },
  { month: 'Jul', rev24: 160, rev25: 220, prof24: 50, prof25: 80 },
  { month: 'Aug', rev24: 170, rev25: 240, prof24: 55, prof25: 95 },
  { month: 'Sep', rev24: 155, rev25: 200, prof24: 45, prof25: 70 },
  { month: 'Oct', rev24: 165, rev25: 230, prof24: 48, prof25: 85 },
  { month: 'Nov', rev24: 180, rev25: 260, prof24: 55, prof25: 100 },
  { month: 'Dec', rev24: 200, rev25: 310, prof24: 70, prof25: 130 },
];

const LOW_STOCK_ITEMS = [
  { name: 'Rice 5kg', stock: 5, min: 20, cat: 'FOOD' },
  { name: 'Notebook A5', stock: 2, min: 15, cat: 'STATIONERY' },
  { name: 'Cooking Oil', stock: 4, min: 12, cat: 'FOOD' },
];

const EXPIRING_ITEMS = [
  { name: 'Fresh Milk 1L', days: 2, batch: 'B-811' },
  { name: 'Greek Yogurt', days: 1, batch: 'B-902' },
];

export default function Report({ data }: { data: any }) {
  const totalTax = useMemo(() => CATEGORY_SALES.reduce((acc, curr) => acc + curr.tax, 0), []);
  const totalProfit = 84200000;

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase">Business Intelligence</h1>
            <p className="text-gray-400 font-bold text-xs tracking-widest mt-1">CORE 811 FINANCIAL REPORTING</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase">Tax Liability</p>
                <p className="text-xl font-mono font-bold text-gray-800">{totalTax.toLocaleString()} VND</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-emerald-500 uppercase">YoY Profit Growth</p>
                <p className="text-xl font-mono font-bold text-emerald-700">+38.2%</p>
            </div>
          </div>
        </div>

        {/* --- Top Row: Multi-Year Revenue & Profit Comparison --- */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Monthly Performance (2024 vs 2025)</h3>
                <div className="flex gap-4 text-[9px] font-black text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> REV '25</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> PROFIT '25</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 border border-emerald-300 rounded-full"></span> PROFIT '24</span>
                </div>
            </div>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={MONTHLY_PERFORMANCE}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val}M`} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)'}} />
                  <Legend />
                  <Bar dataKey="rev25" name="Revenue 2025" fill={REV_25} radius={[4, 4, 0, 0]} barSize={35} />
                  <Line type="monotone" dataKey="rev24" name="Revenue 2024" stroke={REV_24} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="prof25" name="Profit 2025" stroke={PROFIT_25} strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="prof24" name="Profit 2024" stroke={PROFIT_24} strokeWidth={2} dot={{ r: 4, fill: '#fff' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
        </div>

        {/* --- Second Row: Category Breakdown --- */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-tight">Category Sales & Profit Breakdown</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CATEGORY_SALES}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000000}M`} />
                  <Tooltip formatter={(val) => `${val.toLocaleString()} VND`} />
                  <Legend />
                  <Bar dataKey="sales" name="Gross Sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Net Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tax" name="VAT Collected" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* --- Third Row: Inventory & Expiry Alerts --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black text-red-600 uppercase tracking-widest">Low Stock Warning</h3>
                    <span className="bg-red-50 text-red-600 text-[9px] px-2 py-1 rounded-full font-black">CRITICAL</span>
                </div>
                <div className="space-y-4">
                    {LOW_STOCK_ITEMS.map(item => (
                        <div key={item.name} className="flex items-center justify-between border-b border-gray-50 pb-3">
                            <div>
                                <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">{item.cat}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-mono font-black text-red-500">{item.stock}</p>
                                <p className="text-[10px] text-gray-300 font-bold uppercase">Min: {item.min}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest">Expiry Alerts</h3>
                    <span className="bg-amber-50 text-amber-600 text-[9px] px-2 py-1 rounded-full font-black">BATCH CHECK</span>
                </div>
                <div className="space-y-4">
                    {EXPIRING_ITEMS.map(item => (
                        <div key={item.name} className="flex items-center justify-between p-4 bg-amber-50/30 rounded-xl border border-amber-100">
                            <div>
                                <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                <p className="text-[9px] text-amber-500 font-black uppercase">Batch: {item.batch}</p>
                            </div>
                            <div className="bg-white px-4 py-2 rounded-lg border border-amber-200">
                                <span className="text-xs font-black text-amber-600 italic">{item.days}D REMAINING</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* --- Bottom Row: White Themed Financial Card --- */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-200 shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
             <div className="flex-1 w-full text-center md:text-left">
                <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tighter">FINANCIAL PERFORMANCE</h3>
                <p className="text-gray-400 text-sm mb-8 font-medium italic">Consolidated data based on RetailCategory logic.</p>
                
                <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-800">180,500,000 <span className="text-xs text-gray-400">VND</span></p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Operational Cost</p>
                        <p className="text-2xl font-bold text-red-500">96,300,000 <span className="text-xs text-gray-400">VND</span></p>
                    </div>
                </div>
             </div>

             <div className="bg-gray-50 p-12 rounded-[2rem] border-8 border-white text-center md:text-right shadow-inner min-w-[340px]">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-4">Net Profit Balance</p>
                <p className="text-7xl font-mono font-black tracking-tighter text-emerald-600">
                    {totalProfit.toLocaleString()}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-full text-[10px] font-black text-white shadow-lg shadow-emerald-100">
                    VND THIS QUARTER
                </div>
             </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}