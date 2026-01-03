'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from '@/components/SideBar'
import { ArrowLeft } from 'lucide-react'

export default function EditProductPage() {
   const router = useRouter()
   const params = useParams();
   const productId = params.product_id as string;
   console.log('Editing product:', productId)

   const [store, setStore] = useState('')
   const [storeName, setStoreName] = useState('')
   const [warehouse, setWarehouse] = useState('')
   const [name, setName] = useState('')
   const [category, setCategory] = useState('')
   const [sku, setSku] = useState('')
   const [description, setDescription] = useState('')
   const [images, setImages] = useState<File[]>([])
   const [imageBase64, setImageBase64] = useState<string>('')
   const [quantity, setQuantity] = useState<number | ''>('')
   const [price, setPrice] = useState<number | ''>('')
   const [taxType, setTaxType] = useState('')
   const [discountType, setDiscountType] = useState('')
   const [discountValue, setDiscountValue] = useState<number | ''>('')
   const [quantityAlert, setQuantityAlert] = useState<number | ''>('')
   const fileInputRef = React.useRef<HTMLInputElement>(null)
   const [warehousesList, setWarehousesList] = useState<{ warehouse_id: string, name: string }[]>([]);

   useEffect(() => {
      fetch('http://localhost:8000/api/warehouses/')
         .then(res => res.json())
         .then(data => setWarehousesList(Array.isArray(data) ? data : (data.items ?? [])))
   }, [])

   useEffect(() => {
      fetch(`http://localhost:8000/api/products/${productId}`)
         .then(res => res.json())
         .then(async data => {
            setName(data.name || '')
            setCategory(data.retail_category || '')
            setSku(data.sku || '')
            setDescription(data.description || '')
            setStore(data.store_id || '')
            setImageBase64(data.image_base64 || '')
            if (data.store_id) {
               const storeRes = await fetch(`http://localhost:8000/api/stores/${data.store_id}`)
               if (storeRes.ok) {
                  const storeData = await storeRes.json()
                  setStoreName(storeData.name || '')
               }
            }
            if (data.warehouse_id) {
               // setWarehouse(data.warehouse_id)
               const warehouseRes = await fetch(`http://localhost:8000/api/warehouses/${data.warehouse_id}`)
               if (warehouseRes.ok) {
                  const warehouseData = await warehouseRes.json()
                  setWarehouse(warehouseData.name || '')
               }
               // Optionally fetch warehouse info
            }
            // If you have batch info, set quantity, price, etc. here
         })
   }, [productId])

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

   function toBase64(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.readAsDataURL(file);
         reader.onload = () => resolve(reader.result as string);
         reader.onerror = error => reject(error);
      });
   }

   async function onUpdate(e: React.FormEvent) {
      e.preventDefault()
      const productPayload: any = {
         name,
         retail_category: category,
         sku,
         description,
         image_base64: images[0] ? await toBase64(images[0]) : imageBase64,
         warehouse_id: warehouse,
         // category_id and store_id may be needed depending on backend
      }
      try {
         const productRes = await fetch(`http://localhost:8000/api/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productPayload)
         })
         if (!productRes.ok) throw new Error('Failed to update product')
         alert('Product updated!')
         router.push('/products')
      } catch (err) {
         alert('Error: ' + (err as Error).message)
      }
   }

   return (
      <div className="w-full max-w-screen-2xl mx-auto flex gap-6">
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
                     <h1 className="text-xl font-semibold mt-3">Edit Product</h1>
                  </div>
               </div>
               <form onSubmit={onUpdate} className="space-y-6">
                  {/* Product Information */}
                  <section className="border rounded-md p-4">
                     <div className="flex items-center justify-between mb-3">
                        <h2 className="font-medium">Product Information</h2>
                        <span className="text-sm text-gray-400">Required fields marked *</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-sm text-gray-700">Store *</label>
                           <input value={storeName} disabled className="w-full mt-1 border rounded px-3 py-2 bg-gray-100" />
                        </div>
                        <div>
                           <label className="text-sm text-gray-700">Warehouse *</label>
                           <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)} className="w-full mt-1 border rounded px-3 py-2">
                              <option value="">Select</option>
                              {/* Default selected warehouse */}
                              {warehousesList.map(w => (
                                 <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>
                              ))}
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
                              {imageBase64 && !images.length && (
                                 <img src={imageBase64.startsWith('data:image') ? imageBase64 : `data:image/png;base64,${imageBase64}`} alt="" className="w-24 h-24 object-cover rounded-md" />
                              )}
                              {images.map((f, idx) => (
                                 <div key={idx} className="relative">
                                    <img src={URL.createObjectURL(f)} alt="" className="w-24 h-24 object-cover rounded-md" />
                                    <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs">×</button>
                                 </div>
                              ))}
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
                                 <input type="radio" checked={true} readOnly />
                                 <span className="text-sm">Single Product</span>
                              </label>
                              <label className="flex items-center gap-2">
                                 <input type="radio" checked={false} readOnly />
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
                     <button type="submit" className="px-4 py-2 rounded bg-orange-500 text-white">Update Product</button>
                  </div>
               </form>
            </div>
         </main>
      </div>
   )
}
