'use client'
import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

export default function Sidebar() {
   const router = useRouter()
   const pathname = usePathname()

   const sections = [
      { title: 'Main', items: ['Dashboard Report', 'Manage Staffs'] },
      { title: 'Inventory', items: ['Products', 'Category & Brands'] },
      { title: 'Stock & Purchases', items: ['Manage Stock', 'Stock Transfer', 'Purchase Orders', 'Purchase Returns'] },
      { title: 'Sales', items: ['Manage Sales', 'Sales Orders'] },
      { title: 'Locations', items: ['Stores', 'Warehouses'] },
      { title: 'Partners', items: ['Customers', 'Suppliers'] },
      { title: 'Settings', items: [] },
   ]

   const routeMap: Record<string, string> = {
      'Dashboard Report': '/dashboard',
      'Manage Staffs': '/staff-manage',
      'Products': '/products',
      'Category & Brands': '/brands',
      'Manage Stock': '/stock-manage',
      'Stock Transfer': '/stock-transfer',
      'Purchase Orders': '/purchase-orders',
      'Purchase Returns': '/purchase-returns',
      'Manage Sales': '/sales-manage',
      'Sales Orders': '/sales-orders',
      'Stores': '/stores',
      'Warehouses': '/warehouses',
      'Customers': '/customers',
      'Suppliers': '/suppliers',
      'Settings': '/settings',
   }

   // Find the section that contains the current route
   function getSectionWithActiveRoute() {
      for (const s of sections) {
         for (const it of s.items) {
            const route = routeMap[it]
            if (route && pathname.startsWith(route)) {
               return s.title
            }
         }
      }
      // Default to Inventory if nothing matches
      return 'Inventory'
   }

   const [open, setOpen] = useState<Record<string, boolean>>(() =>
      Object.fromEntries(sections.map((s) => [s.title, false]))
   )

   // Open the section with the active route on mount or when pathname changes
   useEffect(() => {
      const activeSection = getSectionWithActiveRoute()
      setOpen(prev =>
         Object.fromEntries(sections.map((s) => [s.title, s.title === activeSection]))
      )
   }, [pathname])

   function toggle(title: string) {
      setOpen(prev => ({
         ...prev,
         [title]: !prev[title]
      }))
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
                        onClick={e => {
                           e.stopPropagation()
                           toggle(s.title)
                        }}
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
                           {s.items.map((it) => {
                              const route = routeMap[it]
                              const isActive = route && pathname.startsWith(route)
                              return (
                                 <li
                                    key={it}
                                    onClick={() => route && router.push(route)}
                                    onKeyDown={(e) => {
                                       if ((e.key === 'Enter' || e.key === ' ') && route) {
                                          router.push(route)
                                       }
                                    }}
                                    role={route ? 'button' : undefined}
                                    tabIndex={route ? 0 : undefined}
                                    className={`flex items-center text-sm px-3 py-2 rounded-md hover:bg-orange-50 ${isActive
                                       ? 'bg-orange-50 font-medium text-orange-600'
                                       : 'text-gray-700'
                                       } cursor-pointer`}
                                 >
                                    <span className="flex-1">{it}</span>
                                 </li>
                              )
                           })}
                        </ul>
                     </div>
                  </div>
               )
            })}
         </div>
      </aside>
   )
}