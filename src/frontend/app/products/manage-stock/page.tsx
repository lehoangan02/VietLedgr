'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { StaticImageData } from 'next/image'
import { Loader2, Package, AlertCircle, Truck } from 'lucide-react'
import Sidebar from '@/components/SideBar'

// --- Types ---
type Product = {
   product_id: string 
   sku: string
   name: string
   img?: string | StaticImageData
   image_base64?: string
   retail_category?: string
   brand?: string
   price: number | string
   unit?: string
   qty: number
   orders?: number
   expected_out_days?: number
   warehouse_id?: string
}

export default function ManageStockPage() {
   const router = useRouter()
   
   // --- State ---
   const [products, setProducts] = useState<Product[]>([])
   const [isLoading, setIsLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)
   
   const [page, setPage] = useState<number>(1)
   const [query, setQuery] = useState('')
   const pageSize = 10

   // --- Fetch Data ---
   useEffect(() => {
      const fetchProducts = async () => {
         setIsLoading(true);
         try {
            const res = await fetch('http://localhost:8000/api/products/')
            if (!res.ok) throw new Error('Failed to fetch inventory.')
            
            let data = await res.json()

            // Randomize expected runout for demonstration purposes
            data = data.map((p: Product) => ({
               ...p,
               expected_out_days: Math.floor(Math.random() * 60) + 1
            }))

            setProducts(data)
         } catch (err: any) {
            setError(err.message || 'An unexpected error occurred')
         } finally {
            setIsLoading(false)
         }
      }
      fetchProducts()
   }, [])

   // --- Handlers ---
   const handleRequestRefill = (p: Product) => {
      if (confirm(`Request immediate refill for ${p.name}?`)) {
         alert(`Refill request sent for SKU: ${p.sku}`)
      }
   }

   // --- Filtering & Sorting (Lowest Stock First) ---
   const processedProducts = useMemo(() => {
      const filtered = products.filter((p) => 
         !query || 
         p.name.toLowerCase().includes(query.toLowerCase()) || 
         p.sku.toLowerCase().includes(query.toLowerCase())
      )
      return filtered.sort((a, b) => Number(a.qty) - Number(b.qty))
   }, [products, query])

   // --- Pagination Logic ---
   const totalPages = Math.max(1, Math.ceil(processedProducts.length / pageSize))
   const visible = useMemo(() => {
      const start = (page - 1) * pageSize
      return processedProducts.slice(start, start + pageSize)
   }, [processedProducts, page])

   // --- Content Component ---
   const Content = () => {
      if (isLoading) return (
         <div className="flex flex-col h-96 items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100">
            <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
            <p className="text-gray-400 text-sm font-medium">Analyzing stock health...</p>
         </div>
      )

      if (error) return (
         <div className="flex flex-col h-96 items-center justify-center bg-white rounded-2xl shadow-sm border border-red-100">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <p className="text-red-600 font-medium">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200">Retry</button>
         </div>
      )

      return (
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
               <div>
                  <h2 className="text-xl font-bold text-gray-900">Stock Management</h2>
                  <p className="text-sm text-gray-500">Prioritized by lowest availability</p>
               </div>
               <div className="relative">
                  <input 
                     type="text" 
                     placeholder="Search inventory..." 
                     className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-100 outline-none w-72 transition-all"
                     value={query}
                     onChange={(e) => {
                        setQuery(e.target.value)
                        setPage(1)
                     }}
                  />
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-sm">
                  <thead>
                     <tr className="text-left text-gray-400 bg-gray-50/50">
                        <th className="py-4 pl-6 font-semibold uppercase text-[10px] tracking-widest">Product</th>
                        <th className="py-4 font-semibold uppercase text-[10px] tracking-widest">Category</th>
                        <th className="py-4 font-semibold uppercase text-[10px] tracking-widest">Inventory Level</th>
                        <th className="py-4 font-semibold uppercase text-[10px] tracking-widest">Run-out Status</th>
                        <th className="py-4 pr-6 text-right font-semibold uppercase text-[10px] tracking-widest">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {visible.length > 0 ? visible.map((p, i) => {
                        const isCritical = Number(p.qty) <= 5
                        const days = p.expected_out_days || 0
                        return (
                           <tr key={p.product_id} className="hover:bg-gray-50/30 transition-colors">
                              <td className="py-5 pl-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-50">
                                       {p.image_base64 ? (
                                          <img src={`data:image/png;base64,${p.image_base64}`} alt="" className="w-full h-full object-cover" />
                                       ) : (
                                          <Package className="text-gray-300" size={18} />
                                       )}
                                    </div>
                                    <div>
                                       <div className="font-bold text-gray-900 flex items-center gap-2">
                                          {p.name}
                                          {isCritical && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                                       </div>
                                       <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">{p.sku}</div>
                                    </div>
                                 </div>
                              </td>
                              <td className="py-5">
                                 <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-[10px] font-bold uppercase tracking-tight">
                                    {p.retail_category || 'General'}
                                 </span>
                              </td>
                              
                              <td className="py-5">
                                 <div className="max-w-[140px]">
                                    <div className="flex justify-between mb-1.5">
                                       <span className={`text-xs font-bold ${isCritical ? 'text-red-500' : 'text-gray-700'}`}>
                                          {p.qty} {p.unit || 'Pcs'}
                                       </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                       <div 
                                          className={`h-full transition-all duration-500 ${isCritical ? 'bg-red-500' : 'bg-green-500'}`} 
                                          style={{ width: `${Math.min(100, (Number(p.qty) / 100) * 100)}%` }} 
                                       />
                                    </div>
                                 </div>
                              </td>

                              <td className="py-5">
                                 <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold 
                                    ${days <= 7 ? 'bg-red-50 text-red-600' : 
                                      days <= 14 ? 'bg-orange-50 text-orange-600' : 
                                      'bg-blue-50 text-blue-600'}`}
                                 >
                                    {days <= 14 && <AlertCircle size={12} />}
                                    {days} Days Left
                                 </div>
                              </td>

                              <td className="py-5 pr-6 text-right">
                                 <div className="flex justify-end gap-3 items-center">
                                    <button
                                       onClick={() => router.push(`/products/manage-stock/shrinkage?id=${p.product_id}`)}
                                       className="text-[11px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-wider transition-colors"
                                    >
                                       Shrinkage
                                    </button>
                                    <button
                                       onClick={() => handleRequestRefill(p)}
                                       className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-all shadow-md shadow-orange-100"
                                    >
                                       <Truck size={14} /> 
                                       Refill
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        )
                     }) : (
                        <tr>
                           <td colSpan={5} className="py-20 text-center text-gray-400 italic">No products found.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>

            {/* Pagination */}
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
               <p className="text-xs text-gray-400 font-medium">Page {page} of {totalPages}</p>
               <div className="flex gap-2">
                  <button 
                     onClick={() => setPage(p => Math.max(1, p - 1))} 
                     disabled={page === 1}
                     className="px-4 py-2 text-xs font-bold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                     Previous
                  </button>
                  <button 
                     onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                     disabled={page === totalPages}
                     className="px-4 py-2 text-xs font-bold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                     Next
                  </button>
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className="w-full max-w-screen-2xl mx-auto flex gap-6 p-6 min-h-screen bg-gray-50">
         <Sidebar />
         <div className="flex-1">
            <Content />
         </div>
      </div>
   )
}