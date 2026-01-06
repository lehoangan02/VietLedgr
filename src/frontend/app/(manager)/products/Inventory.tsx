'use client'
import React, { useMemo, useState, useEffect } from 'react'
import ProductTable from '@/components/productTable'

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

interface ProductInfo {
   product_id: string
   name: string
   retail_category: string
   brand?: string
   unit?: string
   image_base64?: string
}

interface Warehouse {
   warehouse_id: string
   name: string
   location: string
}

type Product = {
   sku: string
   product_id: string
   name: string
   img?: string
   image_base64?: string
   retail_category?: string
   brand: string
   price: string
   unit: string
   qty: number
   orders: number
   expected_out_days?: number
   createdBy?: { name: string; avatar?: string }
   warehouse_id?: string
}

export default function Inventory() {
   const [batches, setBatches] = useState<BatchItem[]>([])
   const [productsInfo, setProductsInfo] = useState<ProductInfo[]>([])
   const [warehouses, setWarehouses] = useState<Warehouse[]>([])
   const [error, setError] = useState<string | null>(null)
   const [isLoading, setIsLoading] = useState(true)

   const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

   useEffect(() => {
      setIsLoading(true)
      let loaded = 0
      let hasError = false
      const finish = () => {
         loaded++
         if (loaded === 3) setIsLoading(false)
      }
      const fetchBatches = async () => {
         try {
            const res = await fetch(`${FASTAPI_URL}/api/batches/`)
            const data = await res.json()
            setBatches(Array.isArray(data) ? data : (data.items ?? []))
         } catch (err) {
            setError('Could not connect to the server.')
            hasError = true
         } finally {
            finish()
         }
      }
      const fetchProducts = async () => {
         try {
            const res = await fetch(`${FASTAPI_URL}/api/products/`)
            const data = await res.json()
            setProductsInfo(Array.isArray(data) ? data : (data.items ?? []))
         } catch (err) {
            setError('Could not connect to the server.')
            hasError = true
         } finally {
            finish()
         }
      }
      const fetchWarehouses = async () => {
         try {
            const res = await fetch(`${FASTAPI_URL}/api/warehouses/`)
            const data = await res.json()
            setWarehouses(Array.isArray(data) ? data : (data.items ?? []))
         } catch (err) {
            setError('Could not connect to the server.')
            hasError = true
         } finally {
            finish()
         }
      }
      fetchBatches()
      fetchProducts()
      fetchWarehouses()
   }, [])

   const productMap = useMemo(() => {
      const map: Record<string, ProductInfo> = {}
      productsInfo.forEach(p => { map[p.product_id] = p })
      return map
   }, [productsInfo])

   const products: Product[] = useMemo(() => {
      return batches.map(batch => {
         const product = productMap[batch.product_id]
         const expiring_date = batch.expire_date ? new Date(batch.expire_date) : null
         const today = new Date()
         let expected_out_days = 0
         if (expiring_date) {
            const diffTime = expiring_date.getTime() - today.getTime()
            expected_out_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
         }
         return {
            sku: batch.batch_id,
            product_id: batch.product_id,
            name: product?.name || batch.supplier_name || '',
            img: undefined,
            image_base64: product?.image_base64,
            retail_category: product?.retail_category || '',
            brand: product?.brand || '',
            price: batch.sale_price ? `${batch.sale_price}` : '',
            unit: product?.unit || '',
            qty: batch.stock ?? 0,
            orders: 0,
            expected_out_days,
            createdBy: batch.supplier_name ? { name: batch.supplier_name } : undefined,
            warehouse_id: batch.warehouse_id
         }
      })
   }, [batches, productMap])

   // Handle product delete
   const handleDelete = async (id: string, sku: string) => {
      if (!window.confirm('Are you sure you want to delete this product?')) return;
      try {
         // First, delete the batch
         const batchRes = await fetch(`${FASTAPI_URL}/api/batches/${sku}`, { method: 'DELETE' });
         if (!batchRes.ok) {
            const errorData = await batchRes.json().catch(() => ({}));
            alert(`Error: ${errorData.detail || 'Could not delete batch'}`);
            return;
         }

         // Then, delete the product
         const prodRes = await fetch(`${FASTAPI_URL}/api/products/${id}`, { method: 'DELETE' });
         if (prodRes.ok) {
            setBatches(prev => prev.filter(b => b.product_id !== id));
            setProductsInfo(prev => prev.filter(p => p.product_id !== id));
         } else {
            const errorData = await prodRes.json().catch(() => ({}));
            alert(`Error: ${errorData.detail || 'Could not delete product'}`);
         }
      } catch {
         alert('Network error: Failed to reach the server.');
      }
   }

   return (
      <div>
         <ProductTable products={products} warehouses={warehouses} isLoading={isLoading} error={error} onDelete={handleDelete} />
      </div>
   )
}
