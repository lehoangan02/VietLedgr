"use client"

import React, { useState, useEffect } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Sidebar from '@/components/SideBar'
import { Calendar, Download, FileText, ImageIcon, Loader2, X, Sparkles, Search } from "lucide-react"

export default function AIPage() {
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [reportData, setReportData] = useState<{ report: string | null; images: any[] } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [dateRange, setDateRange] = useState({ start: '2025-01-01', end: '2025-12-31' })

    async function handleGenerate() {
        setShowModal(false)
        setLoading(true)
        setError(null)
        
        try {
            const res = await fetch("/api/ai/generate-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ startDate: dateRange.start, endDate: dateRange.end }),
            })

            if (!res.ok) throw new Error("Backend error")
            const data = await res.json()

            const imgs = Array.isArray(data.images)
                ? data.images.map((i: any) => ({ 
                    fileName: i.fileName || "analysis.png", 
                    dataUrl: i.dataUrl || (i.base64 ? `data:image/png;base64,${i.base64}` : "") 
                  }))
                : []

            setReportData({ report: data.report ?? null, images: imgs })
        } catch (err: any) {
            setError(err?.message ?? "Failed to generate report")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex w-full max-w-screen-2xl mx-auto min-h-screen bg-[#F8FAFC] font-sans">
            <Sidebar />

            {/* Main Content: Relative to anchor the modal inside */}
            <main className="relative flex-1 p-8 overflow-y-auto h-screen">
                
                {/* --- SCOPED MODAL (Inside Main Only) --- */}
                {showModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-white/40 backdrop-blur-md transition-all">
                        <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-300">
                            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Calendar size={18} className="text-blue-500" />
                                    Select Range
                                </h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Start Date</label>
                                        <input 
                                            type="date" 
                                            value={dateRange.start}
                                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">End Date</label>
                                        <input 
                                            type="date" 
                                            value={dateRange.end}
                                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={handleGenerate}
                                    className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200 uppercase tracking-widest text-xs"
                                >
                                    Confirm & Generate
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">AI Report</h1>
                            <p className="text-slate-400 mt-1 font-medium">Generate intelligent insights for your business</p>
                        </div>
                        {reportData && (
                            <button 
                                onClick={() => setShowModal(true)}
                                className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
                            >
                                <Sparkles size={16} className="text-blue-500" />
                                New Scan
                            </button>
                        )}
                    </div>

                    {/* Content Area */}
                    {!reportData && !loading && (
                        <div className="bg-white rounded-[3rem] border border-slate-100 p-20 text-center flex flex-col items-center shadow-sm">
                            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8 relative">
                                <Search className="text-blue-500 w-10 h-10" />
                                <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping opacity-25" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Intelligence Ready</h2>
                            <p className="text-slate-400 max-w-sm mx-auto mb-10 leading-relaxed">
                                Our AI will analyze your sales data, inventory velocity, and market trends to generate a custom visual report.
                            </p>
                            <button 
                                onClick={() => setShowModal(true)}
                                className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-300 hover:scale-105 transition-all"
                            >
                                Get my report
                            </button>
                        </div>
                    )}

                    {/* SCANNING / LOADING ANIMATION */}
                    {loading && (
                        <div className="bg-white rounded-[3rem] border border-slate-100 p-20 text-center flex flex-col items-center shadow-sm min-h-[500px] justify-center overflow-hidden">
                            <div className="w-full max-w-xs bg-slate-100 h-1 rounded-full mb-8 relative overflow-hidden">
                                <div className="absolute inset-0 bg-blue-500 animate-loading-bar" />
                            </div>
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-6" />
                            <p className="text-slate-800 font-bold uppercase tracking-widest text-xs animate-pulse">
                                Scanning Inventory & Profit Margins...
                            </p>
                        </div>
                    )}

                    {/* RESULTS DASHBOARD */}
                    {reportData && !loading && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Visual Container */}
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                                <div className="p-6 border-b border-slate-50 flex items-center gap-2 text-slate-800 font-black text-xs uppercase tracking-widest">
                                    <ImageIcon className="text-blue-500" size={16}/>
                                    Visual Intelligence
                                </div>
                                <div className="p-8 space-y-8">
                                    {reportData.images.map((img, idx) => (
                                        <div key={idx} className="group relative rounded-3xl overflow-hidden border border-slate-100 shadow-inner">
                                            <img src={img.dataUrl} alt="chart" className="w-full object-cover" />
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => {/* Download function */}}
                                                    className="bg-white/90 backdrop-blur p-3 rounded-2xl text-slate-800 shadow-xl"
                                                >
                                                    <Download size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Markdown Container */}
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                                <div className="p-6 border-b border-slate-50 flex items-center gap-2 text-slate-800 font-black text-xs uppercase tracking-widest">
                                    <FileText className="text-emerald-500" size={16}/>
                                    Analysis Summary
                                </div>
                                <div className="p-10 prose prose-slate max-w-none prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-black">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {reportData.report || ""}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Custom Styles for Loading Bar */}
            <style jsx global>{`
                @keyframes loading-bar {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-loading-bar {
                    animation: loading-bar 2s infinite ease-in-out;
                }
            `}</style>
        </div>
    )
}