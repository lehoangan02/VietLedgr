'use client'
import React, { useMemo, useState } from 'react'
import TestProduct from '@/public/meme.webp'
import type { StaticImageData } from 'next/image'
import { Trash2, CreditCard, Archive, Barcode, DollarSign, SearchIcon } from 'lucide-react'

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

type CartItem = {
   product: Product
   qty: number
}

export default function PosPage() {
   const [query, setQuery] = useState('')
   const [category, setCategory] = useState<string | null>(null)
   const [cart, setCart] = useState<Record<string, CartItem>>({})
   const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
   const [qrUrl, setQrUrl] = useState<string | null>(null)
   const [customerName, setCustomerName] = useState('Bùi Lê Hoàng')

   const categories = useMemo(() => Array.from(new Set(MOCK.map((p) => p.category))), [])

   const products = useMemo(() => {
      return MOCK.filter((p) => {
         if (category && p.category !== category) return false
         if (!query) return true
         return p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase())
      })
   }, [query, category])

   function addToCart(prod: Product) {
      setCart((prev) => {
         const existing = prev[prod.sku]
         const nextQty = existing ? existing.qty + 1 : 1
         return { ...prev, [prod.sku]: { product: prod, qty: nextQty } }
      })
   }

   function removeFromCart(sku: string) {
      setCart((prev) => {
         const copy = { ...prev }
         delete copy[sku]
         return copy
      })
   }

   function changeQty(sku: string, qty: number) {
      setCart((prev) => {
         const copy = { ...prev }
         if (!copy[sku]) return prev
         if (qty <= 0) {
            delete copy[sku]
         } else {
            copy[sku].qty = qty
         }
         return copy
      })
   }
   function generateQR(customerName: string, totalAmount: number) {
      const bankBin = "970422"
      const accountNumber = "0898925210"
      const description = encodeURIComponent(`${customerName} - Payment`)
      const qr_url = `https://img.vietqr.io/image/${bankBin}-${accountNumber}-qr_only.png?amount=${Math.round(totalAmount)}&addInfo=${description}`
      setQrUrl(qr_url)
      setPaymentMethod('qr')
   }

   const handleSetPayment = (method: string) => {
      setPaymentMethod(prev => (prev === method ? null : method));
      setQrUrl(null);
   };


   const cartItems = Object.values(cart)

   const subtotal = useMemo(() => {
      return cartItems.reduce((acc, it) => {
         const n = Number(String(it.product.price).replace(/[^0-9.-]+/g, '')) || 0
         return acc + n * it.qty
      }, 0)
   }, [cartItems])

   const formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })

   return (
      <div className="w-full max-w-7xl mx-auto flex gap-6">
         <div className="flex-1 grid grid-cols-12 gap-6">
            <section className="col-span-8">
               <div className="mb-4 mt-4 flex items-center gap-4">
                  <div className="relative flex-1">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {/* simple search icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-1.85z" />
                        </svg>
                     </span>

                     <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search product code or name..."
                        className="border rounded px-4 py-2 pl-10 w-full"
                     />
                  </div>

                  <div>
                     <select className="border rounded px-3 py-2 w-56">
                        <option>Main Warehouse</option>
                        <option>Downtown Store</option>
                        <option>Demo Location</option>
                        <option>Online Store</option>
                     </select>
                  </div>
               </div>

               <div className="mb-4 flex items-center gap-2">
                  <button onClick={() => setCategory(null)} className={`px-3 py-2 rounded ${category === null ? 'bg-orange-500 text-white' : 'bg-white border'}`}>All Categories</button>
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

               <div className="grid grid-cols-3 gap-4">
                  {products.map((p) => (
                     <div key={p.sku} className="bg-white border rounded-lg p-3 hover:shadow cursor-pointer" onClick={() => addToCart(p)}>
                        <div className="h-36 flex items-center justify-center">
                           <img src={typeof p.img === 'string' ? p.img : p.img?.src} alt={p.name} className="max-h-32 object-contain" />
                        </div>
                        <div className="mt-3">
                           <div className="text-sm font-medium text-gray-800">{p.name}</div>
                           <div className="text-xs text-gray-400">{p.sku}</div>
                           <div className="mt-2 flex items-center justify-between">
                              <div className="text-sm text-pink-600 font-semibold">{p.qty} Remaining Items</div>
                              <div className="text-sm text-green-600 font-semibold">{formatter.format(Number(String(p.price).replace(/[^0-9.-]+/g, '')))}</div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </section>

            <aside className="col-span-4">
               <div className="bg-white border rounded-lg shadow p-4 mt-4 flex flex-col h-screen">
                  {/* header */}
                  <div>
                     <h3 className="font-semibold text-lg">Order List</h3>
                     <div className="text-xs text-gray-400 mb-3">Id : #0</div>
                  </div>

                  {/* customer select */}
                  <div className="mb-3">
                     <label className="text-sm text-gray-600">Customer</label>
                     <select className="w-full mt-1 border rounded px-3 py-2" value={customerName} onChange={(e) => setCustomerName(e.target.value)}>
                        <option>Bùi Lê Hoàng</option>
                     </select>
                  </div>

                  {/* scrollable product list - fills remaining height */}
                  <div className="flex-1 min-h-0 mb-3">
                     <div className="space-y-2 overflow-auto pr-2 h-full">
                        {cartItems.length === 0 && (
                           <div className="h-full flex items-center justify-center text-sm text-gray-400">
                              No Products Selected
                           </div>
                        )}

                        {cartItems.map((it) => {
                           const priceNum = Number(String(it.product.price).replace(/[^0-9.-]+/g, '')) || 0
                           return (
                              <div key={it.product.sku} className="flex items-center gap-3 border-b pb-2">
                                 <img src={typeof it.product.img === 'string' ? it.product.img : it.product.img?.src} alt={it.product.name} className="w-12 h-12 object-cover rounded" />
                                 <div className="flex-1">
                                    <div className="text-sm font-medium">{it.product.name}</div>
                                    <div className="text-xs text-gray-400">{it.product.sku}</div>
                                    <div className="text-sm text-green-600">{formatter.format(priceNum)}</div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <input
                                       type="number"
                                       min={1}
                                       value={it.qty}
                                       onChange={(e) => changeQty(it.product.sku, Math.max(1, Number(e.target.value || 0)))}
                                       className="w-16 border rounded px-2 py-1 text-sm"
                                    />
                                    <button onClick={() => removeFromCart(it.product.sku)} className="text-red-500 p-1"><Trash2 size={16} /></button>
                                 </div>
                              </div>
                           )
                        })}
                     </div>
                  </div>

                  {/* totals and actions (stay at bottom) */}
                  <div className="mt-2 text-sm text-gray-700 border-t pt-4 space-y-4">

                     {/* subtotal section */}
                     <div className="space-y-1">
                        <div className="flex justify-between"><span>Subtotal</span><span>{formatter.format(subtotal)}</span></div>
                        <div className="flex justify-between"><span>Tax</span><span>{formatter.format(0)}</span></div>
                        <div className="flex justify-between font-semibold"><span>Grand Total</span><span>{formatter.format(subtotal)}</span></div>
                     </div>

                     {/* extra fee inputs */}
                     <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="flex flex-col">
                           <label className="mb-1 text-gray-600">Order Tax</label>
                           <select className="border rounded px-2 py-1 text-sm">
                              <option>Choose</option>
                              <option>5%</option>
                              <option>10%</option>
                              <option>15%</option>
                           </select>
                        </div>

                        <div className="flex flex-col">
                           <label className="mb-1 text-gray-600">Shipping</label>
                           <input
                              type="number"
                              defaultValue={0}
                              className="border rounded px-2 py-1 text-sm"
                           />
                        </div>

                        <div className="flex flex-col">
                           <label className="mb-1 text-gray-600">Discount</label>
                           <div className="flex items-center border rounded px-2 py-1">
                              <input
                                 type="number"
                                 defaultValue={0}
                                 className="w-full outline-none text-sm"
                              />
                              <span className="ml-1 text-gray-500">%</span>
                           </div>
                        </div>
                     </div>

                     {/* payment methods */}
                     <div>
                        <h4 className="text-sm font-semibold mb-2 text-gray-700">Payment Method</h4>
                        <div className="grid grid-cols-3 gap-2">
                           <button
                              onClick={() => handleSetPayment('cash')}
                              className={`px-3 py-2 border-2 border-gray-200 rounded-md text-sm font-medium ${paymentMethod === 'cash'
                                 ? 'bg-orange-500 text-white border-orange-500 cursor-pointer'
                                 : 'text-gray-700 hover:border-blue-400 hover:text-blue-600'}`}>
                              Cash
                           </button>

                           <button
                              onClick={() => handleSetPayment('debit')}
                              className={`px-3 py-2 border-2 border-gray-200 rounded-md text-sm font-medium ${paymentMethod === 'debit'
                                 ? 'bg-orange-500 text-white border-orange-500 cursor-pointer'
                                 : 'text-gray-700 hover:border-blue-400 hover:text-blue-600'}`}>
                              Debit Card
                           </button>

                           <button
                              onClick={() => {
                                 handleSetPayment('qr');
                                 generateQR(customerName, subtotal);
                              }}
                              className={`px-3 py-2 border-2 border-gray-200 rounded-md text-sm font-medium ${paymentMethod === 'qr'
                                 ? 'bg-orange-500 text-white border-orange-500 cursor-pointer'
                                 : 'text-gray-700 hover:border-blue-400 hover:text-blue-600'}`}>
                              Scan QR
                           </button>

                        </div>
                        {qrUrl && (
                           <div className="mt-2 flex justify-center">
                              <img src={qrUrl} alt="VietQR" className="w-32 h-32 object-contain" />
                           </div>)}
                     </div>

                     {/* grand total bar */}
                     <div className="bg-gray-800 text-white font-semibold text-center py-2 rounded">
                        Grand Total : {formatter.format(subtotal)}
                     </div>

                     {/* final action buttons */}
                     <div className="flex gap-2">
                        <button className="flex-1 px-3 py-2 bg-purple-600 text-white rounded text-sm font-medium">Hold</button>
                        <button className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm font-medium">Void</button>
                        <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm font-medium">Payment</button>
                     </div>
                  </div>
               </div>
            </aside>
         </div>
      </div>
   )
}