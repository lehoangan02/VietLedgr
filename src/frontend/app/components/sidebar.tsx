'use client'
import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation' // added import

export default function Sidebar() {
   const router = useRouter() // added router

   const sections = [
      { title: 'Main', items: ['Dashboard Report', 'Super Admin'] },
      { title: 'Inventory', items: ['Products', 'Expired Products', 'Low Stocks', 'Category & Brands', 'Print Barcode / QR Code'] },
      { title: 'Stock', items: ['Manage Stock', 'Stock Transfer'] },
      { title: 'Purchases', items: ['Purchase Orders', 'Purchase Returns'] },
      { title: 'Finance & Accounts', items: ['Expense', 'Income', 'Account Statement'] },
      { title: 'Customers & Suppliers', items: ['Customers', 'Suppliers', 'Stores', 'Warehouses'] },
      { title: 'Settings', items: [] },
   ]

   const [open, setOpen] = useState<Record<string, boolean>>(() =>
      Object.fromEntries(sections.map((s) => [s.title, s.title === 'Inventory'])) // default open Inventory
   )

   // map specific item names to routes
   const routeMap: Record<string, string> = {
      Customers: '/customers',
      Suppliers: '/suppliers',
      Stores: '/stores',
      Warehouses: '/warehouses',
   }

   function toggle(title: string) {
      setOpen((prev) => ({ ...prev, [title]: !prev[title] }))
   }

   return (
      <aside className="w-64 pr-6">
         <div className="sticky top-6">
            <div className="text-2xl font-semibold mb-6">VietLedgr</div>

            {sections.map((s) => {
               const isOpen = !!open[s.title]
               return (
                  <div key={s.title} className="mb-4">
                     <button
                        type="button"
                        onClick={() => toggle(s.title)}
                        className="w-full flex items-center justify-between px-2 py-1 rounded-md hover:bg-orange-50 focus:outline-none"
                        aria-expanded={isOpen}
                        aria-controls={`section-${s.title}`}
                     >
                        <div className="flex items-center gap-2">
                           <div className="text-xs uppercase text-gray-400">{s.title}</div>
                        </div>
                        <div className="text-gray-400">
                           {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </div>
                     </button>

                     <div
                        id={`section-${s.title}`}
                        className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 mt-2' : 'max-h-0'}`}
                     >
                        <ul className="space-y-1 pl-2">
                           {s.items.length === 0 && (
                              <li className="text-sm text-gray-400 px-3 py-2">No items</li>
                           )}
                           {s.items.map((it) => (
                              <li
                                 key={it}
                                 // navigate when the item has a mapped route
                                 onClick={() => routeMap[it] && router.push(routeMap[it])}
                                 onKeyDown={(e) => {
                                    if ((e.key === 'Enter' || e.key === ' ') && routeMap[it]) {
                                       router.push(routeMap[it])
                                    }
                                 }}
                                 role={routeMap[it] ? 'button' : undefined}
                                 tabIndex={routeMap[it] ? 0 : undefined}
                                 className={`flex items-center text-sm px-3 py-2 rounded-md hover:bg-orange-50 ${it === 'Products' ? 'bg-orange-50 font-medium text-orange-600' : 'text-gray-700'} cursor-pointer`}
                              >
                                 <span className="flex-1">{it}</span>
                              </li>
                           ))}
                        </ul>
                     </div>
                  </div>
               )
            })}
         </div>
      </aside>
   )
}