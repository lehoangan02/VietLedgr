import React from 'react'
import Sidebar from '@/components/SideBar'
import ProductTable from '@/components/productTable'

export default function ProductsPage() {
   return (
      <div className="w-full max-w-screen-2xl mx-auto flex gap-6">
         <Sidebar />
         <div className="flex-1">
            <ProductTable />
         </div>
      </div>
   )
}