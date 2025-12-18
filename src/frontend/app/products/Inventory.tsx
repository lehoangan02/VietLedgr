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
   // Optionally add more fields if your API returns them
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

   // Map batch data to ProductTable's Product[]
   const products: Product[] = useMemo(() => {
      return batches.map(batch => ({
         sku: batch.batch_id, // or batch.product_id if you want
         name: batch.supplier_name, // You may want to fetch product name via join or API
         img: undefined, // No image in batch, unless you fetch from product
         category: '', // Not available in batch, unless you fetch from product
         brand: '', // Not available in batch, unless you fetch from product
         price: batch.sale_price ? `$${batch.sale_price}` : '',
         unit: '', // Not available in batch, unless you fetch from product
         qty: batch.stock ?? 0,
         orders: 0, // Not available in batch
         expectedOutDays: 0, // Not available in batch
         createdBy: batch.supplier_name ? { name: batch.supplier_name } : undefined
      }));
   }, [batches]);

   if (error) return <div className="text-red-500">{error}</div>;

   return (
      <div>
         <ProductTable products={products} />
      </div>
   );
}