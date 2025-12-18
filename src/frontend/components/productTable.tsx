'use client'
import React, { useMemo, useState } from 'react'
import type { StaticImageData } from 'next/image'
import { Eye, Edit3, Trash2 } from 'lucide-react'
import TestProduct from '@/public/meme.webp'
import { useRouter } from 'next/navigation'

type Product = {
   sku: string
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
}

const MOCK: Product[] = [
   { sku: 'PT001', name: 'Lenovo IdeaPad 3', img: TestProduct, category: 'Computers', brand: 'Lenovo', price: '$600', unit: 'Pc', qty: 100, orders: 24, expectedOutDays: 30, createdBy: { name: 'James Kirwin', avatar: 'https://i.pravatar.cc/40?img=1' } },
   { sku: 'PT002', name: 'Beats Pro', img: TestProduct, category: 'Electronics', brand: 'Beats', price: '$160', unit: 'Pc', qty: 140, orders: 12, expectedOutDays: 60, createdBy: { name: 'Francis Chang', avatar: 'https://i.pravatar.cc/40?img=2' } },
   { sku: 'PT003', name: 'Nike Jordan', img: TestProduct, category: 'Shoe', brand: 'Nike', price: '$110', unit: 'Pc', qty: 300, orders: 45, expectedOutDays: 15, createdBy: { name: 'Antonio Engle', avatar: 'https://i.pravatar.cc/40?img=3' } },
   { sku: 'PT004', name: 'Apple Series 5 Watch', img: TestProduct, category: 'Electronics', brand: 'Apple', price: '$120', unit: 'Pc', qty: 450, orders: 5, expectedOutDays: 120, createdBy: { name: 'Leo Kelly', avatar: 'https://i.pravatar.cc/40?img=4' } },
   { sku: 'PT005', name: 'Amazon Echo Dot', img: TestProduct, category: 'Electronics', brand: 'Amazon', price: '$80', unit: 'Pc', qty: 320, orders: 30, expectedOutDays: 25, createdBy: { name: 'Annette Walker', avatar: 'https://i.pravatar.cc/40?img=5' } },
   { sku: 'PT006', name: 'Sanford Chair Sofa', img: TestProduct, category: 'Furniture', brand: 'Modern Wave', price: '$320', unit: 'Pc', qty: 650, orders: 8, expectedOutDays: 90, createdBy: { name: 'John Weaver', avatar: 'https://i.pravatar.cc/40?img=6' } },
   { sku: 'PT007', name: 'Red Premium Satchel', img: TestProduct, category: 'Bags', brand: 'Dior', price: '$60', unit: 'Pc', qty: 700, orders: 60, expectedOutDays: 7, createdBy: { name: 'Gary Hennessy', avatar: 'https://i.pravatar.cc/40?img=7' } },
   { sku: 'PT008', name: 'iPhone 14 Pro', img: TestProduct, category: 'Phone', brand: 'Apple', price: '$540', unit: 'Pc', qty: 630, orders: 95, expectedOutDays: 5, createdBy: { name: 'Eleanor Panek', avatar: 'https://i.pravatar.cc/40?img=8' } },
   { sku: 'PT009', name: 'Gaming Chair', img: TestProduct, category: 'Furniture', brand: 'Arlime', price: '$200', unit: 'Pc', qty: 410, orders: 18, expectedOutDays: 40, createdBy: { name: 'William Levy', avatar: 'https://i.pravatar.cc/40?img=9' } },
   { sku: 'PT010', name: 'Borealis Backpack', img: TestProduct, category: 'Bags', brand: 'The North Face', price: '$45', unit: 'Pc', qty: 550, orders: 22, expectedOutDays: 35, createdBy: { name: 'Charlotte Klotz', avatar: 'https://i.pravatar.cc/40?img=10' } },
   { sku: 'PT011', name: 'Samsung Galaxy S21', img: TestProduct, category: 'Phone', brand: 'Samsung', price: '$499', unit: 'Pc', qty: 210, orders: 28, expectedOutDays: 18, createdBy: { name: 'Michael Stone', avatar: 'https://i.pravatar.cc/40?img=11' } },
   { sku: 'PT012', name: 'Sony WH-1000XM4', img: TestProduct, category: 'Audio', brand: 'Sony', price: '$350', unit: 'Pc', qty: 170, orders: 14, expectedOutDays: 50, createdBy: { name: 'Olivia Park', avatar: 'https://i.pravatar.cc/40?img=12' } },
   { sku: 'PT013', name: 'Adidas Ultraboost', img: TestProduct, category: 'Shoe', brand: 'Adidas', price: '$180', unit: 'Pc', qty: 260, orders: 36, expectedOutDays: 20, createdBy: { name: 'Ryan Cole', avatar: 'https://i.pravatar.cc/40?img=13' } },
   { sku: 'PT014', name: 'Logitech MX Master 3', img: TestProduct, category: 'Accessories', brand: 'Logitech', price: '$99', unit: 'Pc', qty: 480, orders: 10, expectedOutDays: 75, createdBy: { name: 'Sofia Ramos', avatar: 'https://i.pravatar.cc/40?img=14' } },
]

export default function ProductTable({ products = MOCK }: { products?: Product[] }) {
   const router = useRouter()
   const [page, setPage] = useState<number>(1)
   const pageSize = 10

   const total = products.length
   const totalPages = Math.max(1, Math.ceil(total / pageSize))

   const visible = useMemo(() => {
      const start = (page - 1) * pageSize
      return products.slice(start, start + pageSize)
   }, [products, page])

   function goto(p: number) {
      const next = Math.min(Math.max(1, p), totalPages)
      setPage(next)
      // optionally scroll to top of table
      window.scrollTo({ top: 0, behavior: 'smooth' })
   }

   const showingFrom = (page - 1) * pageSize + 1
   const showingTo = Math.min(page * pageSize, total)

   return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
               <div className="text-sm text-gray-500">Dashboard › <span className="text-gray-800 font-medium">Products</span></div>
            </div>

            <div className="flex items-center gap-3">
               <button className="text-sm px-3 py-2 rounded border bg-white">Import Product</button>
               <button onClick={() => router.push('/products/add-product')} className="text-sm px-3 py-2 rounded bg-orange-500 text-white">Add Product</button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
               <thead>
                  <tr className="text-left text-gray-500 border-b">
                     <th className="py-5 pl-3 w-12">#</th>
                     <th className="py-5">Product Name</th>
                     <th className="py-5">Category</th>
                     {/* <th className="py-5">Brand</th> */}
                     <th className="py-5">Price</th>
                     {/* <th className="py-5">Unit</th> */}
                     <th className="py-5">Quantity</th>
                     <th className="py-5">Ordered</th>
                     <th className="py-5">Expected Out of Stock</th>
                     <th className="py-5 pr-3 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {visible.map((p, i) => (
                     <tr key={p.sku} className="border-b last:border-b-0 hover:bg-gray-50 align-middle">
                        <td className="py-5 pl-3 text-gray-600">{showingFrom + i}</td>

                        <td className="py-5">
                           <div className="flex items-center gap-4">
                              <img src={`data:image/png;base64,${p.img}`} alt="Product" className="w-12 h-12 rounded-md object-cover" />
                              <div>
                                 <div className="font-medium text-gray-800">{p.name}</div>
                                 <div className="text-xs text-gray-400">{p.sku}</div>
                              </div>
                           </div>
                        </td>

                        <td className="py-5 text-gray-600">{p.category}</td>
                        {/* <td className="py-5 text-gray-600">{p.brand}</td> */}
                        <td className="py-5 text-gray-600">{p.price}</td>
                        {/* <td className="py-5 text-gray-600">{p.unit}</td> */}
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
                              <button title="Edit" className="p-2 rounded hover:bg-gray-100"><Edit3 size={16} /></button>
                              <button title="Delete" className="p-2 rounded hover:bg-gray-100 text-red-500"><Trash2 size={16} /></button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <div>
               Showing {showingFrom} to {showingTo} of {total} entries
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

               {/* page numbers */}
               <div className="px-2">
                  {Array.from({ length: totalPages }).map((_, idx) => {
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
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded border disabled:opacity-50"
               >
                  Next
               </button>

               <button
                  onClick={() => goto(totalPages)}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded border disabled:opacity-50"
               >
                  Last
               </button>
            </div>
         </div>
      </div>
   )
}