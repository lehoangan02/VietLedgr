'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/app/components/sidebar'
import { ArrowLeft } from 'lucide-react'

export default function AddProductPage() {
   const router = useRouter()

   const [store, setStore] = useState('')
   const [warehouse, setWarehouse] = useState('')
   const [name, setName] = useState('')
   const [category, setCategory] = useState('')
   const [sku, setSku] = useState('')
   const [description, setDescription] = useState('')
   const [images, setImages] = useState<File[]>([])
   const [productType, setProductType] = useState<'single' | 'variable'>('single')
   const [quantity, setQuantity] = useState<number | ''>('')
   const [price, setPrice] = useState<number | ''>('')
   const [taxType, setTaxType] = useState('')
   const [discountType, setDiscountType] = useState('')
   const [discountValue, setDiscountValue] = useState<number | ''>('')
   const [quantityAlert, setQuantityAlert] = useState<number | ''>('')
   const fileInputRef = React.useRef<HTMLInputElement>(null)

   function generateSku() {
      const code = 'PT' + Math.floor(1000 + Math.random() * 9000)
      setSku(code)
   }

   function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
      const files = e.target.files
      if (!files) return
      setImages((prev) => [...prev, ...Array.from(files)])
   }

   function removeImage(idx: number) {
      setImages((prev) => prev.filter((_, i) => i !== idx))
   }

   function onCancel() {
      router.push('/products')
   }

   function onSubmit(e: React.FormEvent) {
      e.preventDefault()
      // TODO: call API to create product -> for now just navigate back
      console.log({
         store,
         warehouse,
         name,
         category,
         sku,
         description,
         images,
         productType,
         quantity,
         price,
         taxType,
         discountType,
         discountValue,
         quantityAlert,
      })
      router.push('/products')
   }

   return (
      <div className="w-full max-w-7xl mx-auto flex gap-6">
         <Sidebar />

         <main className="flex-1">
            <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
               <div className="flex items-center justify-between mb-4">
                  <div>
                     <button
                        onClick={() => router.push('/products')}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:underline"
                     >
                        <ArrowLeft size={14} /> Back to Products
                     </button>
                     <h1 className="text-xl font-semibold mt-3">Create Product</h1>
                     <div className="text-sm text-gray-500">Dashboard › Create Product</div>
                  </div>
               </div>

               <form onSubmit={onSubmit} className="space-y-6">
                  {/* Product Information */}
                  <section className="border rounded-md p-4">
                     <div className="flex items-center justify-between mb-3">
                        <h2 className="font-medium">Product Information</h2>
                        <span className="text-sm text-gray-400">Required fields marked *</span>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-sm text-gray-700">Store *</label>
                           <select value={store} onChange={(e) => setStore(e.target.value)} className="w-full mt-1 border rounded px-3 py-2">
                              <option value="">Select</option>
                              <option value="main">Main Store</option>
                              <option value="online">Online Store</option>
                           </select>
                        </div>

                        <div>
                           <label className="text-sm text-gray-700">Warehouse *</label>
                           <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)} className="w-full mt-1 border rounded px-3 py-2">
                              <option value="">Select</option>
                              <option value="wh1">Warehouse 1</option>
                              <option value="wh2">Warehouse 2</option>
                           </select>
                        </div>

                        <div className="col-span-2">
                           <label className="text-sm text-gray-700">Product Name *</label>
                           <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 border rounded px-3 py-2" />
                        </div>

                        <div>
                           <label className="text-sm text-gray-700">Category *</label>
                           <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full mt-1 border rounded px-3 py-2" />
                        </div>

                        <div className="flex items-center gap-2">
                           <div className="flex-1">
                              <label className="text-sm text-gray-700">SKU *</label>
                              <input value={sku} onChange={(e) => setSku(e.target.value)} className="w-full mt-1 border rounded px-3 py-2" />
                           </div>
                           <button type="button" onClick={generateSku} className="mt-6 px-3 py-2 bg-orange-500 text-white rounded text-sm">
                              Generate
                           </button>
                        </div>

                        <div className="col-span-2">
                           <label className="text-sm text-gray-700">Description</label>
                           <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full mt-1 border rounded px-3 py-2" />
                           <div className="text-xs text-gray-400 mt-1">Maximum 60 Words</div>
                        </div>

                        <div className="col-span-2">
                           <div className="flex items-center justify-between">
                              <label className="text-sm text-gray-700">Images</label>

                              <button
                                 type="button"
                                 onClick={() => fileInputRef.current?.click()}
                                 className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded text-sm hover:bg-gray-50"
                              >
                                 Choose files
                              </button>
                           </div>

                           <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={onFiles}
                              className="hidden"
                           />

                           <div className="mt-2 border rounded p-3">
                              <div className="mt-3 flex flex-wrap gap-3">
                                 {images.map((f, idx) => (
                                    <div key={idx} className="relative">
                                       <img src={URL.createObjectURL(f)} alt="" className="w-24 h-24 object-cover rounded-md" />
                                       <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs">×</button>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  </section>

                  {/* Pricing & Stocks */}
                  <section className="border rounded-md p-4">
                     <h2 className="font-medium mb-3">Pricing & Stocks</h2>

                     <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-3">
                           <label className="text-sm text-gray-700">Product Type *</label>
                           <div className="mt-2 flex items-center gap-4">
                              <label className="flex items-center gap-2">
                                 <input type="radio" checked={productType === 'single'} onChange={() => setProductType('single')} />
                                 <span className="text-sm">Single Product</span>
                              </label>
                              <label className="flex items-center gap-2">
                                 <input type="radio" checked={productType === 'variable'} onChange={() => setProductType('variable')} />
                                 <span className="text-sm">Variable Product</span>
                              </label>
                           </div>
                        </div>

                        <div>
                           <label className="text-sm text-gray-700">Quantity *</label>
                           <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))} className="w-full mt-1 border rounded px-3 py-2" />
                        </div>

                        <div>
                           <label className="text-sm text-gray-700">Price *</label>
                           <input type="number" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full mt-1 border rounded px-3 py-2" />
                        </div>

                        <div>
                           <label className="text-sm text-gray-700">Tax Type</label>
                           <select value={taxType} onChange={(e) => setTaxType(e.target.value)} className="w-full mt-1 border rounded px-3 py-2">
                              <option value="">Select</option>
                              <option value="vat">VAT</option>
                              <option value="gst">GST</option>
                           </select>
                        </div>

                        <div>
                           <label className="text-sm text-gray-700">Discount Type</label>
                           <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="w-full mt-1 border rounded px-3 py-2">
                              <option value="">Select</option>
                              <option value="percent">Percent</option>
                              <option value="fixed">Fixed</option>
                           </select>
                        </div>

                        <div>
                           <label className="text-sm text-gray-700">Discount Value</label>
                           <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value === '' ? '' : Number(e.target.value))} className="w-full mt-1 border rounded px-3 py-2" />
                        </div>

                        <div>
                           <label className="text-sm text-gray-700">Quantity Alert</label>
                           <input type="number" value={quantityAlert} onChange={(e) => setQuantityAlert(e.target.value === '' ? '' : Number(e.target.value))} className="w-full mt-1 border rounded px-3 py-2" />
                        </div>
                     </div>
                  </section>

                  <div className="flex items-center justify-end gap-3">
                     <button type="button" onClick={onCancel} className="px-4 py-2 rounded border">Cancel</button>
                     <button type="submit" className="px-4 py-2 rounded bg-orange-500 text-white">Add Product</button>
                  </div>
               </form>
            </div>
         </main>
      </div>
   )
}