'use client'

import React, { useMemo, useState, useEffect } from 'react'
import type { StaticImageData } from 'next/image'
import { Eye, Edit3, Trash2, Loader2, Search, Package, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'


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

interface Warehouse {
   warehouse_id: string
   name: string
   location: string
}

interface ProductTableProps {
   products: Product[]
   warehouses: Warehouse[]
   isLoading?: boolean
   error?: string | null
   onDelete?: (id: string, sku: string) => void
}

export default function ProductTable({
   products,
   warehouses,
   isLoading = false,
   error = null,
   onDelete
}: ProductTableProps) {
   const router = useRouter()

   const [page, setPage] = useState<number>(1)
   const pageSize = 10
   const [query, setQuery] = useState('')
   const [category, setCategory] = useState<string | null>(null)
   const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null)
   // Import status state
   const [importStatus, setImportStatus] = useState<string>('')
   const [importProgress, setImportProgress] = useState<number>(0)
   const [importErrors, setImportErrors] = useState<string[]>([])




   // Call parent delete handler
   const handleDelete = (id: string, sku: string) => {
      if (onDelete) onDelete(id, sku)
   }

   // useEffect(() => {
   //    // Print all fetched retail categories for debugging
   //    const allCategories = products.map((p) => p.retail_category)
   //    console.log('Fetched retail categories:', allCategories)
   // }, [products])

   const categories = useMemo(() =>
      Array.from(new Set(products.map((p) => p.retail_category).filter(Boolean) as string[])),
      [products])

   const filteredProducts = useMemo(() => {
      return products.filter((p) => {
         const matchesWarehouse = !selectedWarehouse || p.warehouse_id === selectedWarehouse
         const matchesCategory = !category || p.retail_category === category
         const matchesSearch = !query ||
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.sku.toLowerCase().includes(query.toLowerCase())
         return matchesWarehouse && matchesCategory && matchesSearch
      })
   }, [products, selectedWarehouse, category, query])

   const total = filteredProducts.length
   const totalPages = Math.max(1, Math.ceil(total / pageSize))
   const visible = useMemo(() => {
      const start = (page - 1) * pageSize
      return filteredProducts.slice(start, start + pageSize)
   }, [filteredProducts, page])

   function goto(p: number) {
      const next = Math.min(Math.max(1, p), totalPages)
      setPage(next)
      window.scrollTo({ top: 0, behavior: 'smooth' })
   }


   if (isLoading) return (
      <div className="flex flex-col h-96 items-center justify-center bg-white rounded-lg shadow border border-gray-100">
         <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
         <p className="text-gray-500 font-medium">Loading inventory data...</p>
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
         {/* Top bar: Filters and Actions */}
         <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
               {/* Search */}
               <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-1.85z" />
                     </svg>
                  </span>
                  <input
                     value={query}
                     onChange={(e) => setQuery(e.target.value)}
                     placeholder="Search product code or name..."
                     className="border rounded px-4 py-2 pl-10 w-64"
                  />
               </div>
               {/* Warehouse Dropdown */}
               <div>
                  <select
                     className="border rounded px-3 py-2 w-48"
                     value={selectedWarehouse ?? ''}
                     onChange={e => setSelectedWarehouse(e.target.value)}
                  >
                     <option value="">All Warehouses</option>
                     {warehouses.map(wh => (
                        <option key={wh.warehouse_id} value={wh.warehouse_id}>{wh.name}</option>
                     ))}
                  </select>
               </div>
               {/* Category Filter */}
               <div className="flex items-center gap-1">
                  <button
                     onClick={() => setCategory(null)}
                     className={`px-3 py-2 rounded ${category === null ? 'bg-orange-500 text-white' : 'bg-white border'}`}
                  >
                     All Categories
                  </button>
                  {categories.map((c) => (
                     <button
                        key={c}
                        onClick={() => setCategory((prev) => (prev === c ? null : c))}
                        className={`px-3 py-2 rounded ${category === c ? 'bg-orange-500 text-white' : 'bg-white border'}`}
                     >
                        {c}
                     </button>
                  ))}
               </div>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-3">
               {/* Import Product Button and File Input */}
               <input
                  type="file"
                  accept=".csv"
                  id="import-product-csv"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                     const file = e.target.files?.[0]
                     if (!file) return
                     setImportStatus('Importing...')
                     setImportProgress(0)
                     try {
                        const { importProductsFromCsv } = await import('../utils/importProductsFromCsv')
                        const result = await importProductsFromCsv(file, (cur, total) => {
                           setImportProgress(Math.round((cur / total) * 100))
                        })
                        setImportStatus(`Imported: ${result.success}, Failed: ${result.failed}`)
                        if (result.errors.length > 0) {
                           setImportErrors(result.errors)
                        } else {
                           setImportErrors([])
                        }
                     } catch (err) {
                        setImportStatus('Import failed')
                        setImportErrors([(err as Error).message])
                     }
                  }}
               />
               <button
                  className="text-sm px-3 py-2 rounded border bg-white"
                  onClick={() => document.getElementById('import-product-csv')?.click()}
                  type="button">
                  Import Product
               </button>
               <button onClick={() => router.push('/products/add-product')} className="text-sm px-3 py-2 rounded bg-orange-500 text-white">Add Product</button>
            </div>
         </div>

         {/* Product Table */}
         <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
               <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100">
                     <th className="py-4 pl-3 w-12 font-medium">#</th>
                     <th className="py-4 font-medium">Product Name</th>
                     <th className="py-4 font-medium">Category</th>
                     <th className="py-4 font-medium">Price</th>
                     <th className="py-4 font-medium">Stock Level</th>
                     <th className="py-4 font-medium">Stockout</th>
                     <th className="py-4 pr-3 text-right font-medium">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {visible.length > 0 ? visible.map((p, i) => {
                     return (
                        <tr key={`prod-fix-${i}`} className="group hover:bg-orange-50/30 transition-colors">
                           <td className="py-4 pl-3 text-gray-400">{(page - 1) * pageSize + i + 1}</td>
                           <td className="py-4">
                              <div className="flex items-center gap-4">
                                 <div className="w-11 h-11 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                    {p.image_base64 ? (
                                       <img
                                          src={p.image_base64.startsWith('data:image') ? p.image_base64 : `data:image/png;base64,${p.image_base64}`}
                                          alt={p.name}
                                          className="w-full h-full object-cover" />
                                    ) : (
                                       <Package className="text-gray-300" size={20} />
                                    )}
                                 </div>
                                 <div>
                                    <div className="font-medium text-gray-800">{p.name}</div>
                                    <div className="text-xs text-gray-400">{p.product_id}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="py-4">
                              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-[11px] font-bold uppercase tracking-tight">
                                 {p.retail_category || 'Uncategorized'}
                              </span>
                           </td>
                           <td className="py-4 font-semibold text-gray-900">{p.price}</td>
                           <td className="py-4">
                              <div className="flex flex-col gap-1">
                                 <span className="text-gray-700 font-medium">{p.qty} {p.unit || 'Pcs'}</span>
                                 <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                       className={`h-full ${Number(p.qty) < 20 ? 'bg-red-500' : 'bg-green-500'}`}
                                       style={{ width: `${Math.min(100, (Number(p.qty) / 100) * 100)}%` }}
                                    />
                                 </div>
                              </div>
                           </td>
                           <td className="py-4">
                              {p.expected_out_days ? (
                                 <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${p.expected_out_days <= 7 ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-700'}`}>
                                    {p.expected_out_days} days
                                 </div>
                              ) : (
                                 <span className="text-gray-300">—</span>
                              )}
                           </td>
                           <td className="py-4 pr-3 text-right">
                              <div className="inline-flex items-center gap-1">
                                 <button title="View" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                                    <Eye size={16} />
                                 </button>
                                 <button
                                    title="Edit"
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                                    onClick={() => router.push(`/products/edit-product/${p.product_id}`)}
                                 >
                                    <Edit3 size={16} />
                                 </button>
                                 <button
                                    title="Delete"
                                    onClick={() => handleDelete(p.product_id, p.sku)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     )
                  }) : (
                     <tr>
                        <td colSpan={7} className="py-20 text-center text-gray-400 italic">
                           No products found.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>

         {/* Import status and errors */}
         {importStatus && (
            <div className="mt-4 text-sm">
               <div className="font-medium">{importStatus} {importProgress > 0 && importProgress < 100 ? `(${importProgress}%)` : ''}</div>
               {importErrors.length > 0 && (
                  <div className="mt-2 text-red-500">
                     <div>Errors:</div>
                     <ul className="list-disc ml-6">
                        {importErrors.map((err, idx) => <li key={idx}>{err}</li>)}
                     </ul>
                  </div>
               )}
            </div>
         )}

         {/* Pagination */}
         <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <div>
               Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredProducts.length)} of {filteredProducts.length} entries
            </div>
            <div className="flex items-center gap-2">
               <button
                  onClick={() => goto(1)}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border disabled:opacity-50"
               >
                  First
               </button>
               <button
                  onClick={() => goto(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border disabled:opacity-50"
               >
                  Prev
               </button>
               <div className="px-2">
                  {Array.from({ length: Math.max(1, Math.ceil(filteredProducts.length / pageSize)) }).map((_, idx) => {
                     const p = idx + 1
                     return (
                        <button
                           key={p}
                           onClick={() => goto(p)}
                           className={`mx-1 px-3 py-1 rounded ${p === page ? 'bg-orange-500 text-white' : 'border'}`}
                        >
                           {p}
                        </button>
                     )
                  })}
               </div>
               <button
                  onClick={() => goto(page + 1)}
                  disabled={page === Math.max(1, Math.ceil(filteredProducts.length / pageSize))}
                  className="px-3 py-1 rounded border disabled:opacity-50"
               >
                  Next
               </button>
               <button
                  onClick={() => goto(Math.max(1, Math.ceil(filteredProducts.length / pageSize)))}
                  disabled={page === Math.max(1, Math.ceil(filteredProducts.length / pageSize))}
                  className="px-3 py-1 rounded border disabled:opacity-50">
                  Last
               </button>
            </div>
         </div>
      </div>
   )
}
