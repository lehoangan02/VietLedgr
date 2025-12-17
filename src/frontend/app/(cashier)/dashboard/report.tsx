"use client";
import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// COLORS for the charts
const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444'];

// --- Hardcoded Fancy Data matching your request ---
const MOCK_LEDGER_DATA = [
  { account_type: 'REVENUE', credit_amount: 80000000, debit_amount: 0, date: '2025-12-10' },
  { account_type: 'EXPENSE', credit_amount: 0, debit_amount: 17000000, date: '2025-12-12' },
  { account_type: 'ASSET', credit_amount: 0, debit_amount: 50000000, date: '2025-12-01' },
  { account_type: 'LIABILITY', credit_amount: 15000000, debit_amount: 0, date: '2025-12-05' },
];

const TREND_DATA = [
  { day: 'Mon', revenue: 12000000, profit: 9000000 },
  { day: 'Tue', revenue: 15000000, profit: 11000000 },
  { day: 'Wed', revenue: 18000000, profit: 14000000 },
  { day: 'Thu', revenue: 14000000, profit: 10000000 },
  { day: 'Fri', revenue: 21000000, profit: 17000000 },
  { day: 'Sat', revenue: 25000000, profit: 20000000 },
  { day: 'Sun', revenue: 30000000, profit: 24000000 },
];

export default function Report({ data }: { data: any }) {
  
  // Use mock data if real data is empty
  const safeData = useMemo(() => {
    const apiItems = data?.items || (Array.isArray(data) ? data : []);
    return apiItems.length > 0 ? apiItems : MOCK_LEDGER_DATA;
  }, [data]);

  const financialSummary = useMemo(() => {
    const revenue = safeData
      .filter((e: any) => e.account_type === 'REVENUE')
      .reduce((sum: number, e: any) => sum + Number(e.credit_amount || 0), 0);
    
    const expenses = safeData
      .filter((e: any) => e.account_type === 'EXPENSE')
      .reduce((sum: number, e: any) => sum + Number(e.debit_amount || 0), 0);

    return [{ name: 'Total Cash Flow', Revenue: revenue, Expenses: expenses }];
  }, [safeData]);

  const distributionData = useMemo(() => {
    const types = ['ASSET', 'LIABILITY', 'REVENUE', 'EXPENSE'];
    return types.map(type => {
      const total = safeData
        .filter((e: any) => e.account_type === type)
        .reduce((sum: number, e: any) => sum + (Number(e.debit_amount || 0) + Number(e.credit_amount || 0)), 0);
      return { name: type, value: total };
    });
  }, [safeData]);

  const rev = financialSummary[0].Revenue;
  const exp = financialSummary[0].Expenses;
  const profitMargin = rev > 0 ? (rev / (rev + exp)) * 100 : 0;

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Business Analytics</h1>
          <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">Performance Insights</p>
        </div>

        {/* --- Top Row: Trend & Distribution --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Weekly Trend */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Weekly Sales Growth</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND_DATA}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Account Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Capital Structure</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {distributionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* --- Middle Row: Cash Flow Bar Chart --- */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue vs Operating Expenses</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialSummary} barGap={24}>
                  <XAxis dataKey="name" hide />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000000}M`} tick={{fill: '#9ca3af'}} />
                  <Tooltip cursor={{fill: '#f9fafb'}} />
                  <Bar dataKey="Revenue" fill="#10b981" radius={[8, 8, 8, 8]} barSize={80} />
                  <Bar dataKey="Expenses" fill="#ef4444" radius={[8, 8, 8, 8]} barSize={80} />
                </BarChart>
              </ResponsiveContainer>
            </div>
        </div>

        {/* --- Bottom Row: White Themed Profit Analysis --- */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm overflow-hidden relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
             <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-2">
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <h3 className="text-xl font-bold text-gray-900">Net Profit Margin</h3>
                </div>
                <p className="text-gray-500 text-sm mb-6 font-medium">Percentage of total turnover retained as profit.</p>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-1000 ease-out shadow-inner" 
                        style={{ width: `${profitMargin}%` }}
                    ></div>
                </div>
                <div className="flex justify-between mt-4 text-xs font-black uppercase tracking-widest">
                    <div className="flex flex-col">
                        <span className="text-gray-400 mb-1">Total Revenue</span>
                        <span className="text-emerald-600 text-lg">{rev.toLocaleString()} <span className="text-[10px] font-sans">VND</span></span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-gray-400 mb-1">Total Expenses</span>
                        <span className="text-red-500 text-lg">{exp.toLocaleString()} <span className="text-[10px] font-sans">VND</span></span>
                    </div>
                </div>
             </div>

             <div className="bg-gray-50 p-10 rounded-2xl border border-gray-100 text-center md:text-right min-w-[300px]">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Estimated Net Profit</p>
                <p className={`text-6xl font-mono font-black tracking-tighter ${rev - exp >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(rev - exp).toLocaleString()}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-500 uppercase">
                    VND Current Period
                </div>
             </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}