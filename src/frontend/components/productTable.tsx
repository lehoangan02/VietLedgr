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
   products?: Product[]
   warehouses?: Warehouse[]
}

export default function ProductTable({
   products: productsProp = [],
   warehouses: warehousesProp = []
}: ProductTableProps) {
   const router = useRouter()
   
   const [products, setProducts] = useState<Product[]>(productsProp)
   const [warehouses, setWarehouses] = useState<Warehouse[]>(warehousesProp)
   const [isLoading, setIsLoading] = useState(productsProp.length === 0)
   const [error, setError] = useState<string | null>(null)
   
   const [page, setPage] = useState<number>(1)
   const pageSize = 10
   const [query, setQuery] = useState('')
   const [category, setCategory] = useState<string | null>(null)
   const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null)

   // Fetch products if not provided via props
   useEffect(() => {
      if (productsProp.length > 0) return
      const fetchProducts = async () => {
         setIsLoading(true)
         try {
            const res = await fetch('http://localhost:8000/api/products/')
            if (!res.ok) throw new Error('Failed to fetch product data from server.')
            const data = await res.json()
            setProducts(data)
         } catch (err: any) {
            setError(err.message || 'An unexpected error occurred')
         } finally {
            setIsLoading(false)
         }
      }
      fetchProducts()
   }, [productsProp])

   // Fetch warehouses if not provided via props
   useEffect(() => {
      if (warehousesProp.length > 0) return
      const fetchWarehouses = async () => {
         try {
            const res = await fetch('http://localhost:8000/api/warehouses/')
            const data = await res.json()
            const items = Array.isArray(data) ? data : (data.items ?? [])
            setWarehouses(items)
         } catch (err) {
            console.error("Could not fetch warehouses:", err)
         }
      }
      fetchWarehouses()
   }, [warehousesProp])

   // Delete product
   const handleDelete = async (id: string) => {
      if (!confirm('Are you sure you want to delete this product?')) return
      try {
         const res = await fetch(`http://localhost:8000/api/products/${id}`, { method: 'DELETE' })
         if (res.ok) setProducts(prev => prev.filter(p => p.product_id !== id))
         else {
            const errorData = await res.json()
            alert(`Error: ${errorData.detail || 'Could not delete product'}`)
         }
      } catch {
         alert("Network error: Failed to reach the server.")
      }
   }

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
         {/* Filter/Search Bar omitted for brevity */}
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
                  {visible.length > 0 ? visible.map((p, i) => (
                     <tr key={p.product_id} className="group hover:bg-orange-50/30 transition-colors">
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
                                 <div className="font-semibold text-gray-800">{p.name}</div>
                                 <div className="text-xs text-gray-400 font-mono uppercase tracking-wider">{p.sku}</div>
                              </div>
                           </div>
                        </td>
                        <td className="py-4">
                           <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-[11px] font-bold uppercase tracking-tight">
                              {p.retail_category || 'Uncategorized'}
                           </span>
                        </td>
                        <td className="py-4 font-semibold text-gray-900">${p.price}</td>
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
                                 onClick={() => router.push(`/products/edit-product?id=${p.product_id}`)}
                              >
                                 <Edit3 size={16} />
                              </button>
                              <button 
                                 title="Delete" 
                                 onClick={() => handleDelete(p.product_id)}
                                 className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                              >
                                 <Trash2 size={16} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  )) : (
                     <tr>
                        <td colSpan={7} className="py-20 text-center text-gray-400 italic">
                           No products found.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
         {/* Pagination Controls omitted for brevity */}
      </div>
   )
}
