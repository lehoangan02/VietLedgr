'use client'
import React, { useMemo, useState, useEffect } from 'react'
import type { StaticImageData } from 'next/image'
import { Trash2 } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import InvoicePrint from '@/components/InvoicePrint'

type Product = {
   sku: string
   name: string
   img?: string
   category: string
   brand: string
   price: string
   unit: string
   qty: number
   orders: number
   expectedOutDays: number
   createdBy?: { name: string; avatar?: string }
}

interface ProductInfo {
   product_id: string
   name: string
   retail_category: string
   brand?: string
   unit?: string
   image_base64?: string
}

interface BatchItem {
   batch_id: string
   product_id: string
   warehouse_id: string
   stock: number
   cost: number
   sale_price: number
   import_date: string
   expire_date: string
   supplier_name: string
   created_at: string
   updated_at: string
}

interface Warehouse {
   warehouse_id: string;
   name: string;
   location: string;
}

interface Store {
   store_id: string;
   name: string;
}

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
   const [batches, setBatches] = useState<BatchItem[]>([])
   const [productsInfo, setProductsInfo] = useState<ProductInfo[]>([])
   const [error, setError] = useState<string>('')

   const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
   const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);

   const store_id = 'd955be01-fde5-4b26-bf99-fef4454627ac'
   const [stores, setStores] = useState<Store | null>(null);

   useEffect(() => {
      const fetchStores = async () => {
         try {
            const res = await fetch(`http://localhost:8000/api/stores/${store_id}`);
            const data = await res.json();
            setStores(data);
         } catch (err) {
            // handle error if needed
         }
      };
      fetchStores();
   }, []);

   useEffect(() => {
      const fetchWarehouses = async () => {
         try {
            const res = await fetch('http://localhost:8000/api/warehouses/');
            const data = await res.json();
            const items = Array.isArray(data) ? data : (data.items ?? []);
            setWarehouses(items);
            if (items.length > 0) setSelectedWarehouse(items[0].warehouse_id);
         } catch (err) {
            // handle error if needed
         }
      };
      fetchWarehouses();
   }, []);

   useEffect(() => {
      const fetchBatches = async () => {
         try {
            const res = await fetch('http://localhost:8000/api/batches/')
            const data = await res.json()
            setBatches(Array.isArray(data) ? data : (data.items ?? []))
         } catch (err) {
            setError('Could not connect to the server.')
         }
      }
      fetchBatches()
   }, [])

   useEffect(() => {
      const fetchProducts = async () => {
         try {
            const res = await fetch('http://localhost:8000/api/products/')
            const data = await res.json()
            setProductsInfo(Array.isArray(data) ? data : (data.items ?? []))
         } catch (err) {
            // Optionally handle error
         }
      }
      fetchProducts()
   }, [])

   // Build a lookup for product info by product_id
   const productMap = useMemo(() => {
      const map: Record<string, ProductInfo> = {}
      productsInfo.forEach(p => { map[p.product_id] = p })
      return map
   }, [productsInfo])

   // Map batch data to Product[]
   const products: Product[] = useMemo(() => {
      return batches.map(batch => {
         const product = productMap[batch.product_id]
         const expiring_date = batch.expire_date ? new Date(batch.expire_date) : null
         const today = new Date()
         let expectedOutDays = 0
         if (expiring_date) {
            const diffTime = expiring_date.getTime() - today.getTime()
            expectedOutDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
         }

         return {
            sku: batch.batch_id,
            name: product?.name || batch.supplier_name || '',
            img: product?.image_base64,
            category: product?.retail_category || '',
            brand: product?.brand || '',
            price: batch.sale_price ? `$${batch.sale_price}` : '',
            unit: product?.unit || '',
            qty: batch.stock ?? 0,
            orders: 0,
            expectedOutDays,
            createdBy: batch.supplier_name ? { name: batch.supplier_name } : undefined
         }
      })
   }, [batches, productMap])

   const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products])

   const filteredProducts = useMemo(() => {
      return products.filter((p, idx) => {
         const batch = batches[idx];
         return (!selectedWarehouse || batch.warehouse_id === selectedWarehouse) &&
            (!category || p.category === category) &&
            (!query || p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()));
      });
   }, [products, batches, selectedWarehouse, category, query]);

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

   function generateQR(customerName: string, totalAmount: number, print?: boolean) {
      const bankBin = "970422"
      const accountNumber = "0898925210"
      const description = encodeURIComponent(`${customerName} - Payment`)
      const qr_url = `https://img.vietqr.io/image/${bankBin}-${accountNumber}-qr_only.png?amount=${Math.round(totalAmount)}&addInfo=${description}`
      setQrUrl(qr_url)
      if (!print)
         setPaymentMethod('qr')
   }

   const handleSetPayment = (method: string) => {
      setPaymentMethod(prev => (prev === method ? null : method));
      setQrUrl(null);
   };

   // toast handlers
   const handleVoid = () => {
      setCart({});
      setPaymentMethod(null);
      setQrUrl(null);
      toast.error("Order has been removed!", { position: "top-right" });
   };

   const handlePayment = () => {
      if (cartItems.length === 0) {
         toast.warning("Cart is empty!", { position: "top-right" });
         return;
      }
      toast.success("Payment successful!", { position: "top-right" });
      setCart({});
      setPaymentMethod(null);
      setQrUrl(null);
   };

   const handlePrint = () => {
      window.print();
   };

   const cartItems = Object.values(cart)

   const subtotal = useMemo(() => {
      return cartItems.reduce((acc, it) => {
         const n = Number(String(it.product.price).replace(/[^0-9.-]+/g, '')) || 0
         return acc + n * it.qty
      }, 0)
   }, [cartItems])

   const formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })

   if (error) return <div className="text-red-500">{error}</div>;

   return (
      <>
         <ToastContainer position="top-right" autoClose={1500} />
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
                        <select
                           className="border rounded px-3 py-2 w-56"
                           value={selectedWarehouse ?? ''}
                           onChange={e => setSelectedWarehouse(e.target.value)}
                        >
                           {warehouses.map(wh => (
                              <option key={wh.warehouse_id} value={wh.warehouse_id}>{wh.name}</option>
                           ))}
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
                     {filteredProducts.map((p) => (
                        <div key={p.sku} className="bg-white border rounded-lg p-3 hover:shadow cursor-pointer" onClick={() => addToCart(p)}>
                           <div className="h-36 flex items-center justify-center">
                              {p.img && p.img.trim() !== '' && (
                                 <img
                                    src={p.img.startsWith('http') ? p.img : `data:image/png;base64,${p.img}`}
                                    alt={p.name}
                                    className="max-h-32 object-contain"
                                 />
                              )}
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
                        <h3 className="font-semibold text-lg">Order List - {stores ? stores.name : ''}</h3>
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
                                    <img
                                       src={it.product.img ? (it.product.img.startsWith('http') ? it.product.img : `data:image/png;base64,${it.product.img}`) : ''}
                                       alt={it.product.name}
                                       className="w-12 h-12 object-cover rounded"
                                    />
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
                                    generateQR(customerName, subtotal, false);
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
                           <button className="flex-1 px-3 py-2 bg-purple-600 text-white rounded text-sm font-medium" onClick={() => { handlePrint(); generateQR(customerName, subtotal, true); }}>Print</button>
                           <button onClick={handleVoid} className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm font-medium">Void</button>
                           <button onClick={handlePayment} className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm font-medium">Payment</button>
                        </div>
                     </div>
                  </div>
               </aside>

               <InvoicePrint
                  customerName={customerName}
                  cartItems={cartItems}
                  subtotal={subtotal}
                  formatter={formatter}
                  qrUrl={qrUrl} />
            </div>
         </div>
      </>
   )
}