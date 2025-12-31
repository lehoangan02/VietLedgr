"use client";
import React from 'react';
import Sidebar from '@/components/SideBar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Line
} from 'recharts';

// --- Theme Colors ---
const REV_25 = "#3b82f6";
const REV_24 = "#94a3b8";
const PROFIT_25 = "#10b981";
const PROFIT_24 = "#6ee7b7";

// --- Mock Data ---
const CATEGORY_SALES = [
  { name: 'FOOD', sales: 80000000, tax: 8000000, profit: 25000000 },
  { name: 'HOUSEHOLD', sales: 45000000, tax: 4500000, profit: 12000000 },
  { name: 'STATIONERY', sales: 15000000, tax: 1500000, profit: 5000000 },
  { name: 'OTHERS', sales: 5000000, tax: 500000, profit: 1500000 },
];

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

const BEST_SELLERS = [
  { name: 'Instant Noodles (Spicy)', units: 1204, growth: '+12%' },
  { name: 'Organic Jasmine Rice', units: 850, growth: '+8%' },
  { name: 'Condensed Milk', units: 640, growth: '+15%' },
];

const WORST_SELLERS = [
  { name: 'Old Brand Detergent', units: 12, growth: '-40%' },
  { name: 'Plastic Rulers', units: 5, growth: '-60%' },
];

const LOW_STOCK_ITEMS = [
  { name: 'Rice 5kg', stock: 5, min: 20, cat: 'FOOD' },
  { name: 'Notebook A5', stock: 2, min: 15, cat: 'STATIONERY' },
];

const EXPIRING_ITEMS = [
  { name: 'Fresh Milk 1L', days: 2, batch: 'B-811' },
];

export default function Dashboard() {
  const totalTax = 14500000;
  const totalProfit = 84200000;

  return (
    <div className="w-full max-w-screen-2xl mx-auto flex gap-6 font-sans min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight uppercase">Dashboard</h1>
              <p className="text-gray-500 mt-1 font-normal">Business Intelligence & Financial Overview</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Tax Liability</p>
                <p className="text-xl font-mono font-bold text-gray-800">{totalTax.toLocaleString()} VND</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-emerald-500 uppercase">YoY Profit Growth</p>
                <p className="text-xl font-mono font-bold text-emerald-700">+38.2%</p>
              </div>
            </div>
          </div>

          {/* Monthly Performance */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-tight">Performance 2024 vs 2025</h3>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={MONTHLY_PERFORMANCE}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val}M`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="rev25" name="Revenue 2025" fill={REV_25} radius={[4, 4, 0, 0]} barSize={35} />
                  <Line type="monotone" dataKey="rev24" name="Revenue 2024" stroke={REV_24} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="prof25" name="Profit 2025" stroke={PROFIT_25} strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="prof24" name="Profit 2024" stroke={PROFIT_24} strokeWidth={2} dot={{ r: 4, fill: '#fff' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Best & Worst Sellers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
              <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4">🏆 Top Sellers</h3>
              <div className="space-y-4">
                {BEST_SELLERS.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-emerald-50/20 rounded-xl border border-emerald-50">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">{item.growth} Velocity</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">{item.units} units</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">📉 Underperformers</h3>
              <div className="space-y-4">
                {WORST_SELLERS.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 opacity-60">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                      <p className="text-[10px] text-red-400 font-bold uppercase tracking-tighter">{item.growth} vs Last Month</p>
                    </div>
                    <span className="text-sm font-bold text-gray-400">{item.units} units</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Breakdown & Stock Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-tight">Category Contribution</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CATEGORY_SALES}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-red-50 shadow-sm">
                <h3 className="text-[10px] font-bold text-red-600 uppercase mb-4 tracking-widest">Inventory Shortage</h3>
                {LOW_STOCK_ITEMS.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm mb-2 font-bold text-gray-700 uppercase italic underline decoration-red-100">{item.name} <span>{item.stock} LEFT</span></div>
                ))}
              </div>
              <div className="bg-white p-6 rounded-2xl border border-amber-50 shadow-sm">
                <h3 className="text-[10px] font-bold text-amber-600 uppercase mb-4 tracking-widest">Expiry Threshold</h3>
                {EXPIRING_ITEMS.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm font-bold text-gray-700">{item.name} <span className="text-amber-600 italic underline">{item.days} DAYS REMAINING</span></div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Advanced Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg text-lg">✨</div>
                <h3 className="text-xl font-bold uppercase tracking-tight text-blue-900">AI Inventory Retrieval</h3>
              </div>
              <p className="text-gray-500 text-sm mb-6 font-medium">Opportunities identified via local demand patterns:</p>
              <div className="space-y-4">
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                  <p className="font-bold text-blue-900 text-sm">1. Thai Milk Tea (RTD)</p>
                  <p className="text-[10px] text-blue-500 font-bold uppercase mt-1 tracking-widest">Confidence: 94% • High Margin Category</p>
                </div>
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                  <p className="font-bold text-blue-900 text-sm">2. Low-Sugar Energy Bars</p>
                  <p className="text-[10px] text-blue-500 font-bold uppercase mt-1 tracking-widest">Demand spike: STATIONERY (Student Hubs)</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-100 text-gray-800 rounded-lg text-lg">🤖</div>
                <h3 className="text-xl font-bold uppercase tracking-tight text-gray-900">AI Stock Optimizer</h3>
              </div>
              <p className="text-gray-500 text-sm mb-6 font-medium">Critical efficiency actions for current inventory:</p>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-5 bg-red-50/50 border border-red-100 rounded-2xl">
                  <div className="text-xl">⚠️</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">Fresh Milk 1L (Batch B-811)</p>
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter mt-1">Stock: 42 • Days: 2</p>
                    <button className="mt-3 w-full py-2 bg-red-600 text-white text-[9px] font-bold rounded-full uppercase tracking-widest shadow-lg shadow-red-100">
                      Apply 40% Discount
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                  <div className="text-xl">🗑️</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">Remove: Plastic Rulers</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">Velocity: Zero (60 Days)</p>
                    <button className="mt-3 w-full py-2 bg-gray-800 text-white text-[9px] font-bold rounded-full uppercase tracking-widest">
                      Bundle with Best Sellers
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-2xl shadow-emerald-100/30 relative">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex-1 w-full text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight uppercase">Financial Summary</h3>
                <div className="grid grid-cols-2 gap-6 mt-6">
                  <div className="p-6 bg-gray-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Gross Revenue</p>
                    <p className="text-2xl font-bold text-gray-800">180,500,000 <span className="text-xs font-sans text-gray-400">VND</span></p>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-2xl text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Operating Cost</p>
                    <p className="text-2xl font-bold text-red-500">96,300,000 <span className="text-xs font-sans text-gray-400">VND</span></p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-12 rounded-3xl border-8 border-white text-center md:text-right shadow-inner min-w-[340px]">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.4em] mb-4">Estimated Net Profit</p>
                <p className="text-7xl font-mono font-bold tracking-tighter text-emerald-600 italic underline decoration-emerald-100">{totalProfit.toLocaleString()}</p>
                <span className="inline-block px-5 py-2 bg-emerald-600 text-white text-[10px] font-bold rounded-full mt-4 shadow-lg shadow-emerald-100">PROFITABLE GROWTH</span>
              </div>
            </div>
          </div>
          {/* This Month Summary */}
          <div className="mt-12 bg-white p-8 rounded-3xl border border-indigo-100 shadow-sm">
            <h3 className="text-xl font-bold text-indigo-900 uppercase tracking-tight mb-6">
              This Month Performance
            </h3>

            {(() => {
              const currentMonth = MONTHLY_PERFORMANCE[MONTHLY_PERFORMANCE.length - 1]
              const thisMonthProfit = currentMonth.prof25 * 1_000_000
              const thisMonthTax = thisMonthProfit * 0.123312

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-indigo-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase">
                      Month
                    </p>
                    <p className="text-xl font-bold text-indigo-800">
                      {currentMonth.month} 2025
                    </p>
                  </div>

                  <div className="p-6 bg-emerald-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase">
                      This Month Profit
                    </p>
                    <p className="text-2xl font-mono font-bold text-emerald-700">
                      {thisMonthProfit.toLocaleString()} VND
                    </p>
                  </div>

                  <div className="p-6 bg-red-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-red-400 uppercase">
                      Estimated Tax
                    </p>
                    <p className="text-2xl font-mono font-bold text-red-600">
                      {thisMonthTax.toLocaleString()} VND
                    </p>
                  </div>
                </div>
              )
            })()}
          </div>

        </div>
      </main>
    </div>
  );
}