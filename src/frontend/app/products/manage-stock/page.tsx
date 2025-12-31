'use client'

import React, { useMemo, useState, useEffect } from 'react'
import type { StaticImageData } from 'next/image'
import { Loader2, Package, AlertCircle, Truck } from 'lucide-react'

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
   // --- State ---
   const [products, setProducts] = useState<Product[]>([])
   const [isLoading, setIsLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)
   
   // Pagination & filters
   const [page, setPage] = useState<number>(1)
   const pageSize = 10
   const [query, setQuery] = useState('')

   // --- Fetch Data & Randomize ---
   useEffect(() => {
      const fetchProducts = async () => {
         setIsLoading(true)
         try {
            const res = await fetch('http://localhost:8000/api/products/')
            if (!res.ok) throw new Error('Failed to fetch inventory.')
            
            let data = await res.json()

            // --- RANDOMIZER LOGIC ---
            // We map over the data and assign a random number between 1 and 60
            // to 'expected_out_days' for demonstration purposes.
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
   const handleRequestRefill = (product: Product) => {
      const confirmRefill = confirm(`Request immediate refill for ${product.name}?`)
      if (confirmRefill) {
         alert(`Refill request sent for SKU: ${product.sku}`)
      }
   }

   // --- Filtering & Sorting ---
   const processedProducts = useMemo(() => {
      // 1. Filter by Search
      const filtered = products.filter((p) => {
         const matchesSearch = !query || 
            p.name.toLowerCase().includes(query.toLowerCase()) || 
            p.sku.toLowerCase().includes(query.toLowerCase())
         return matchesSearch
      })

      // 2. Sort: Lowest Quantity First (Critical items at top)
      return filtered.sort((a, b) => Number(a.qty) - Number(b.qty))
   }, [products, query])

   // --- Pagination Logic ---
   const total = processedProducts.length
   const totalPages = Math.max(1, Math.ceil(total / pageSize))
   const visible = useMemo(() => {
      const start = (page - 1) * pageSize
      return processedProducts.slice(start, start + pageSize)
   }, [processedProducts, page])

   function goto(p: number) {
      setPage(Math.min(Math.max(1, p), totalPages))
      window.scrollTo({ top: 0, behavior: 'smooth' })
   }

   if (isLoading) return (
      <div className="flex flex-col h-96 items-center justify-center bg-white rounded-lg shadow border border-gray-100">
         <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
         <p className="text-gray-500 font-medium">Analyzing stock levels...</p>
      </div>
   )

   if (error) return (
      <div className="flex flex-col h-96 items-center justify-center bg-white rounded-lg shadow border border-red-100">
         <AlertCircle className="text-red-500 mb-4" size={48} />
         <p className="text-red-600 font-medium">{error}</p>
         <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200">Retry</button>
      </div>
   )

   return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
         {/* Header */}
         <div className="flex justify-between items-center mb-6">
            <div>
               <h2 className="text-lg font-bold text-gray-800">Stock Management</h2>
               <p className="text-sm text-gray-400">Prioritized by lowest availability</p>
            </div>
            <input 
               type="text" 
               placeholder="Search SKU or Name..." 
               className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 w-64"
               value={query}
               onChange={(e) => setQuery(e.target.value)}
            />
         </div>

         <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
               <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100">
                     <th className="py-4 pl-3 w-12 font-medium">#</th>
                     <th className="py-4 font-medium">Product Name</th>
                     <th className="py-4 font-medium">Category</th>
                     <th className="py-4 font-medium">Current Stock</th>
                     <th className="py-4 font-medium">Est. Runout</th>
                     <th className="py-4 font-medium text-right pr-3">Refill Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {visible.length > 0 ? visible.map((p, i) => {
                     const isCritical = Number(p.qty) <= 5
                     // Determine visual state based on the random days
                     const days = p.expected_out_days || 0
                     const isUrgent = days <= 7
                     const isWarning = days > 7 && days <= 14

                     return (
                        <tr key={p.product_id} className={`group transition-colors ${isCritical ? 'bg-red-50/40' : 'hover:bg-orange-50/30'}`}>
                           <td className="py-4 pl-3 text-gray-400">{(page - 1) * pageSize + i + 1}</td>
                           <td className="py-4">
                              <div className="flex items-center gap-4">
                                 <div className="w-11 h-11 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                    {p.image_base64 ? (
                                       <img 
                                          src={`data:image/png;base64,${p.image_base64}`} 
                                          alt={p.name} 
                                          className="w-full h-full object-cover" 
                                       />
                                    ) : (
                                       <Package className="text-gray-300" size={20} />
                                    )}
                                 </div>
                                 <div>
                                    <div className="font-semibold text-gray-800 flex items-center gap-2">
                                       {p.name}
                                       {isCritical && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Critical Low Stock"></span>}
                                    </div>
                                    <div className="text-xs text-gray-400 font-mono uppercase tracking-wider">{p.sku}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="py-4">
                              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-[11px] font-bold uppercase tracking-tight">
                                 {p.retail_category || 'Uncategorized'}
                              </span>
                           </td>
                           
                           {/* Stock Level Bar */}
                           <td className="py-4">
                              <div className="flex flex-col gap-1 max-w-[120px]">
                                 <div className="flex justify-between items-end">
                                    <span className={`font-bold ${isCritical ? 'text-red-600' : 'text-gray-700'}`}>
                                       {p.qty} {p.unit || 'Pcs'}
                                    </span>
                                 </div>
                                 <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                       className={`h-full ${Number(p.qty) < 20 ? 'bg-red-500' : 'bg-green-500'}`} 
                                       style={{ width: `${Math.min(100, (Number(p.qty) / 100) * 100)}%` }} 
                                    />
                                 </div>
                              </div>
                           </td>

                           {/* Randomized Runout Days */}
                           <td className="py-4">
                              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium 
                                 ${isUrgent ? 'bg-red-50 text-red-600 border border-red-100' : 
                                   isWarning ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : 
                                   'bg-gray-50 text-gray-500 border border-gray-100'}`}
                              >
                                 {(isUrgent || isWarning) && <AlertCircle size={12} />}
                                 {days} days left
                              </div>
                           </td>

                           <td className="py-4 pr-3 text-right">
                              <button
                                 onClick={() => handleRequestRefill(p)}
                                 className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 hover:text-orange-700 active:bg-orange-200 transition-all"
                              >
                                 <Truck size={14} />
                                 Request Refill
                              </button>
                           </td>
                        </tr>
                     )
                  }) : (
                     <tr>
                        <td colSpan={6} className="py-20 text-center text-gray-400 italic">
                           No products found matching criteria.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>

         {/* Footer */}
         <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
            <div className="text-sm text-gray-500">
               Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
               <button 
                  onClick={() => goto(page - 1)} 
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  Previous
               </button>
               <button 
                  onClick={() => goto(page + 1)} 
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  Next
               </button>
            </div>
         </div>
      </div>
   )
}