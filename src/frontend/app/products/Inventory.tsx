'use client'
import React, { useMemo, useState, useEffect } from 'react'
import ProductTable from '@/components/ProductTable'

interface BatchItem {
   batch_id: string;
   product_id: string;
   warehouse_id: string;
   stock: number;
   cost: number;
   sale_price: number;
   import_date: string;
   expire_date: string;
   supplier_name: string;
   created_at: string;
   updated_at: string;
}

interface ProductInfo {
   product_id: string; // <-- use product_id, not id
   name: string;
   retail_category: string;
   brand?: string;
   unit?: string;
   image_base64?: string;
}

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

export default function Inventory() {
   const [batches, setBatches] = useState<BatchItem[]>([]);
   const [productsInfo, setProductsInfo] = useState<ProductInfo[]>([]);
   const [error, setError] = useState<string>('');

   useEffect(() => {
      const fetchBatches = async () => {
         try {
            const res = await fetch('http://localhost:8000/api/batches/');
            const data = await res.json();
            setBatches(Array.isArray(data) ? data : (data.items ?? []));
         } catch (err) {
            setError('Could not connect to the server.');
         }
      };
      fetchBatches();
   }, []);

   useEffect(() => {
      const fetchProducts = async () => {
         try {
            const res = await fetch('http://localhost:8000/api/products/');
            const data = await res.json();
            setProductsInfo(Array.isArray(data) ? data : (data.items ?? []));
         } catch (err) {
            // Optionally handle error
         }
      };
      fetchProducts();
   }, []);

   // Build a lookup for product info by product_id
   const productMap = useMemo(() => {
      const map: Record<string, ProductInfo> = {};
      productsInfo.forEach(p => { map[p.product_id] = p; });
      return map;
   }, [productsInfo]);

   // Map batch data to ProductTable's Product[]
   const products: Product[] = useMemo(() => {
      return batches.map(batch => {
         const product = productMap[batch.product_id];
         const expiring_date = batch.expire_date ? new Date(batch.expire_date) : null;
         const today = new Date();
         // console.log('Expiring Date:', batch.import_date);
         let expectedOutDays = 0;
         if (expiring_date) {
            const diffTime = expiring_date.getTime() - today.getTime();
            expectedOutDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
            expectedOutDays: expectedOutDays,
            createdBy: batch.supplier_name ? { name: batch.supplier_name } : undefined
         }
      });
   }, [batches, productMap]);

   if (error) return <div className="text-red-500">{error}</div>;

   return (
      <div>
         <ProductTable products={products} />
      </div>
   );
}