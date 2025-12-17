import React from 'react'
import Sidebar from '@/app/components/sidebar'
import ProductTable from '@/app/components/productTable'

export default function ProductsPage() {
   return (
      <div className="w-full max-w-7xl mx-auto flex gap-6">
         <Sidebar />
         <div className="flex-1">
            <ProductTable />
         </div>
      </div>
   )
}