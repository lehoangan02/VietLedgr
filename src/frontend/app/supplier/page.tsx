// ...existing code...
'use client'
import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Edit3, Trash2 } from 'lucide-react'

type Supplier = {
   id: string
   name: string
   avatar?: string
   contact?: string
   phone?: string
   email?: string
   address?: string
}

const MOCK_SUPPLIERS: Supplier[] = [
   { id: 'S001', name: 'Alpha Supplies', avatar: 'https://i.pravatar.cc/40?img=1', contact: 'John Doe', phone: '+1 555-0100', email: 'john@alpha.com', address: '123 Market St' },
   { id: 'S002', name: 'Beta Wholesale', avatar: 'https://i.pravatar.cc/40?img=2', contact: 'Jane Roe', phone: '+1 555-0101', email: 'jane@beta.com', address: '456 Commerce Ave' },
   { id: 'S003', name: 'Gamma Traders', avatar: 'https://i.pravatar.cc/40?img=3', contact: 'Alan Smithee', phone: '+1 555-0102', email: 'alan@gamma.com', address: '789 Industrial Rd' },
]

export default function Page() {
   const router = useRouter()
   const [suppliers] = useState<Supplier[]>(MOCK_SUPPLIERS)
   const [page] = useState(1)
   const pageSize = 20

   // local state for add-form avatar preview (implementation later)
   const [avatarUrl, setAvatarUrl] = useState<string>('')

   const visible = useMemo(() => {
      const start = (page - 1) * pageSize
      return suppliers.slice(start, start + pageSize)
   }, [suppliers, page])

   // handle file selection to preview avatar
   function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0]
      if (!file) return
      const url = URL.createObjectURL(file)
      setAvatarUrl(url)
   }

   return (
      <div className="p-6">
         <div className="flex items-center justify-between mb-6">
            <div>
               <h1 className="text-2xl font-semibold">Suppliers</h1>
               <div className="text-sm text-gray-500">Manage suppliers and their details</div>
            </div>

            {/* removed Refresh and Add Supplier buttons as requested */}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* suppliers list */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-100 p-4">
               <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                     <thead>
                        <tr className="text-left text-gray-500 border-b">
                           <th className="py-3 pl-3 w-12">#</th>
                           <th className="py-3">Supplier</th>
                           <th className="py-3">Contact</th>
                           <th className="py-3">Phone</th>
                           <th className="py-3">Email</th>
                           <th className="py-3 pr-3 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {visible.map((s, i) => (
                           <tr key={s.id} className="border-b last:border-b-0 hover:bg-gray-50">
                              <td className="py-3 pl-3 text-gray-600">{i + 1}</td>

                              <td className="py-3">
                                 <div className="flex items-center gap-3">
                                    <img src={s.avatar} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                       <div className="font-medium text-gray-800">{s.name}</div>
                                       <div className="text-xs text-gray-400">{s.address}</div>
                                    </div>
                                 </div>
                              </td>

                              <td className="py-3 text-gray-600">{s.contact}</td>
                              <td className="py-3 text-gray-600">{s.phone}</td>
                              <td className="py-3 text-gray-600">{s.email}</td>
                              <td className="py-3 pr-3 text-right">
                                 <div className="inline-flex items-center gap-2">
                                    <button title="View" className="p-2 rounded hover:bg-gray-100"><Eye size={16} /></button>
                                    <button title="Edit" className="p-2 rounded hover:bg-gray-100"><Edit3 size={16} /></button>
                                    <button title="Delete" className="p-2 rounded hover:bg-gray-100 text-red-500"><Trash2 size={16} /></button>
                                 </div>
                              </td>
                           </tr>
                        ))}

                        {visible.length === 0 && (
                           <tr>
                              <td colSpan={6} className="py-6 text-center text-gray-500">No suppliers found</td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* add supplier section (placeholder) */}
            <aside className="bg-white rounded-lg shadow border border-gray-100 p-4">
               <h2 className="text-lg font-medium mb-2">Add / Edit Supplier</h2>
               <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                  <div className="flex items-start gap-3 mb-2">
                     <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                           {avatarUrl ? (
                              <img src={avatarUrl} alt="avatar preview" className="w-full h-full object-cover" />
                           ) : (
                              <div className="w-full h-full" />
                           )}
                        </div>

                        <div className="text-center">
                           <input
                              id="avatarFile"
                              type="file"
                              accept="image/*"
                              onChange={handleFile}
                              className="hidden" />
                           <label
                              htmlFor="avatarFile"
                              className="inline-flex items-center px-3 py-1.5 bg-white border rounded text-sm cursor-pointer hover:bg-gray-50">
                              Choose file
                           </label>
                        </div>
                     </div>

                     <div className="flex-1">
                        <div>
                           <label className="text-sm text-gray-600 block mb-1">Supplier Name</label>
                           <input className="w-full px-3 py-2 border rounded bg-gray-50" placeholder="e.g. ACME Supplies" disabled />
                        </div>
                     </div>
                  </div>

                  <div>
                     <label className="text-sm text-gray-600 block mb-1">Contact Person</label>
                     <input className="w-full px-3 py-2 border rounded bg-gray-50" placeholder="Name" disabled />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="text-sm text-gray-600 block mb-1">Phone</label>
                        <input className="w-full px-3 py-2 border rounded bg-gray-50" placeholder="+1 555-0000" disabled />
                     </div>
                     <div>
                        <label className="text-sm text-gray-600 block mb-1">Email</label>
                        <input className="w-full px-3 py-2 border rounded bg-gray-50" placeholder="email@example.com" disabled />
                     </div>
                  </div>

                  <div>
                     <label className="text-sm text-gray-600 block mb-1">Address</label>
                     <textarea className="w-full px-3 py-2 border rounded bg-gray-50" rows={3} placeholder="Supplier address" disabled />
                  </div>

                  <div className="flex items-center justify-end">
                     <button
                        type="button"
                        disabled
                        className="px-4 py-2 rounded bg-orange-400 text-white text-sm"
                        title="Not implemented yet"
                     >
                        Save
                     </button>
                  </div>
               </form>
            </aside>
         </div>
      </div>
   )
}