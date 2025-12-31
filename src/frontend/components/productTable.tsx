'use client'
import React, { useMemo, useState, useEffect } from 'react'
import type { StaticImageData } from 'next/image'
import { Eye, Edit3, Trash2 } from 'lucide-react'
import TestProduct from '@/public/meme.webp'
import { useRouter } from 'next/navigation'

type Product = {
   product_id: string
   name: string
   img?: string | StaticImageData
   category: string
   brand: string
   price: string
   unit: string
   qty: number
   orders: number
   expectedOutDays: number
   createdBy?: { name: string; avatar?: string }
   warehouse_id?: string // Add warehouse_id for filtering
}

interface Warehouse {
   warehouse_id: string;
   name: string;
   location: string;
}

const MOCK: Product[] = []

export default function ProductTable({
   products = MOCK,
   warehouses: warehousesProp
}: {
   products?: Product[],
   warehouses?: Warehouse[]
}) {
   const router = useRouter()
   const [page, setPage] = useState<number>(1)
   const pageSize = 10

   // --- Add state for search/filter ---
   const [query, setQuery] = useState('')
   const [category, setCategory] = useState<string | null>(null)
   // Use warehouses from props if provided (from Inventory), otherwise fetch
   const [warehouses, setWarehouses] = useState<Warehouse[]>(warehousesProp ?? [])
   const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null)
   // Import status state
   const [importStatus, setImportStatus] = useState<string>('')
   const [importProgress, setImportProgress] = useState<number>(0)
   const [importErrors, setImportErrors] = useState<string[]>([])

   // Only fetch warehouses if not provided by props
   useEffect(() => {
      if (warehousesProp && warehousesProp.length > 0) {
         setWarehouses(warehousesProp)
         setSelectedWarehouse(warehousesProp[0]?.warehouse_id ?? null)
         return
      }
      const fetchWarehouses = async () => {
         try {
            const res = await fetch('http://localhost:8000/api/warehouses/')
            const data = await res.json()
            const items = Array.isArray(data) ? data : (data.items ?? [])
            setWarehouses(items)
            if (items.length > 0) setSelectedWarehouse(items[0].warehouse_id)
         } catch (err) {
            // handle error if needed
         }
      }
      fetchWarehouses()
   }, [warehousesProp])

   const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products])

   // Now filter by warehouse_id if selectedWarehouse is set and product has warehouse_id
   const filteredProducts = useMemo(() => {
      return products.filter((p) => {
         return (!selectedWarehouse || p.warehouse_id === selectedWarehouse) &&
            (!category || p.category === category) &&
            (!query || p.name.toLowerCase().includes(query.toLowerCase()) || p.product_id.toLowerCase().includes(query.toLowerCase()))
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

   const showingFrom = (page - 1) * pageSize + 1
   const showingTo = Math.min(page * pageSize, total)

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
                  <tr className="text-left text-gray-500 border-b">
                     <th className="py-5 pl-3 w-12">#</th>
                     <th className="py-5">Product Name</th>
                     <th className="py-5">Category</th>
                     <th className="py-5">Price</th>
                     <th className="py-5">Quantity</th>
                     <th className="py-5">Ordered</th>
                     <th className="py-5">Expected Out of Stock</th>
                     <th className="py-5 pr-3 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {visible.map((p, i) => (
                     <tr key={p.product_id} className="border-b last:border-b-0 hover:bg-gray-50 align-middle">
                        <td className="py-5 pl-3 text-gray-600">{(page - 1) * pageSize + i + 1}</td>
                        <td className="py-5">
                           <div className="flex items-center gap-4">
                              <img
                                 src={
                                    typeof p.img === 'string'
                                       ? (p.img.startsWith('data:image') ? p.img : `data:image/png;base64,${p.img}`)
                                       : (p.img as StaticImageData)?.src
                                 }
                                 alt="Product"
                                 className="w-12 h-12 rounded-md object-cover"
                              />
                              <div>
                                 <div className="font-medium text-gray-800">{p.name}</div>
                                 <div className="text-xs text-gray-400">{p.product_id}</div>
                              </div>
                           </div>
                        </td>
                        <td className="py-5 text-gray-600">{p.category}</td>
                        <td className="py-5 text-gray-600">{p.price}</td>
                        <td className="py-5 text-gray-600">{p.qty}</td>
                        <td className="py-5 text-gray-700 font-medium">{p.orders}</td>
                        <td className="py-5">
                           <div className={`inline-block px-2 py-1 rounded text-sm ${p.expectedOutDays <= 7 ? 'bg-red-100 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                              {p.expectedOutDays} days
                           </div>
                        </td>
                        <td className="py-5 pr-3 text-right">
                           <div className="inline-flex items-center gap-3">
                              <button title="View" className="p-2 rounded hover:bg-gray-100"><Eye size={16} /></button>
                              <button
                                 title="Edit"
                                 className="p-2 rounded hover:bg-gray-100"
                                 onClick={() => {
                                    // If you have product_id in your real data, use it. For MOCK, fallback to sku.
                                    const id = (p as any).product_id || p.product_id;
                                    router.push(`/products/edit-product/${id}`)
                                 }}
                              >
                                 <Edit3 size={16} />
                              </button>
                              <button
                                 title="Delete"
                                 className="p-2 rounded hover:bg-gray-100 text-red-500"
                                 onClick={async () => {
                                    if (!window.confirm('Are you sure you want to delete this product?')) return;
                                    try {
                                       const id = (p as any).product_id || p.product_id;
                                       const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
                                       if (res.ok) {
                                          // Option 1: reload page
                                          window.location.reload();
                                          // Option 2: update state (uncomment below if you want to update without reload)
                                          // setProducts(products => products.filter(prod => prod.product_id !== id));
                                       } else {
                                          alert('Failed to delete product.');
                                       }
                                    } catch (err) {
                                       alert('Error deleting product.');
                                    }
                                 }}
                              >
                                 <Trash2 size={16} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
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