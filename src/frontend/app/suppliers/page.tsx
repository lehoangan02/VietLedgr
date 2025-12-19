'use client'
import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit3, Trash2 } from 'lucide-react'

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
   const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS)
   const [page] = useState(1)
   const pageSize = 20

   // State for editing supplier
   const [editing, setEditing] = useState<Supplier | null>(null)
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
      setEditing(editing => editing ? { ...editing, avatar: url } : null)
   }

   // handle edit button
   function handleEdit(supplier: Supplier) {
      setEditing({ ...supplier })
      setAvatarUrl(supplier.avatar || '')
   }

   // handle input change
   function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      const { name, value } = e.target
      setEditing(editing => editing ? { ...editing, [name]: value } : null)
   }

   // handle save
   function handleSave(e: React.FormEvent) {
      e.preventDefault()
      if (!editing) return
      setSuppliers(suppliers =>
         suppliers.map(s => s.id === editing.id ? { ...editing, avatar: avatarUrl || editing.avatar } : s)
      )
      setEditing(null)
      setAvatarUrl('')
   }

   return (
      <div className="p-6">
         <div className="flex items-center justify-between mb-6">
            <div>
               <h1 className="text-2xl font-semibold">Suppliers</h1>
               <div className="text-sm text-gray-500">Manage suppliers and their details</div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* suppliers list */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-100 p-4">
               <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                     <thead>
                        <tr className="text-left text-gray-500 border-b">
                           <th className="py-2 pl-2 w-8">#</th>
                           <th className="py-2 w-44">Supplier</th>
                           <th className="py-2 w-28">Contact</th>
                           <th className="py-2 w-28">Phone</th>
                           <th className="py-2 w-36">Email</th>
                           <th className="py-2 w-40">Address</th>
                           <th className="py-2 pr-2 w-20 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {visible.map((s, i) => (
                           <tr key={s.id} className="border-b last:border-b-0 hover:bg-gray-50">
                              <td className="py-2 pl-2 text-gray-600">{i + 1}</td>
                              <td className="py-2">
                                 <div className="flex items-center gap-2">
                                    <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover" />
                                    <span className="font-medium text-gray-800 truncate">{s.name}</span>
                                 </div>
                              </td>
                              <td className="py-2 text-gray-600 truncate">{s.contact}</td>
                              <td className="py-2 text-gray-600 truncate">{s.phone}</td>
                              <td className="py-2 text-gray-600 truncate">{s.email}</td>
                              <td className="py-2 text-gray-600 truncate">{s.address}</td>
                              <td className="py-2 pr-2 text-right">
                                 <div className="inline-flex items-center gap-2">
                                    <button
                                       title="Edit"
                                       className="p-1 rounded hover:bg-gray-100"
                                       onClick={() => handleEdit(s)}
                                    >
                                       <Edit3 size={16} />
                                    </button>
                                    <button title="Delete" className="p-1 rounded hover:bg-gray-100 text-red-500"><Trash2 size={16} /></button>
                                 </div>
                              </td>
                           </tr>
                        ))}

                        {visible.length === 0 && (
                           <tr>
                              <td colSpan={7} className="py-6 text-center text-gray-500">No suppliers found</td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>

            <aside className="bg-white rounded-lg shadow border border-gray-100 p-4 flex flex-col gap-3">
               <h2 className="text-lg font-medium mb-2">Add / Edit Supplier</h2>
               <form className="space-y-3" onSubmit={handleSave}>
                  <div className="flex flex-col items-center gap-2 mb-2">
                     <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                        {avatarUrl || editing?.avatar ? (
                           <img src={avatarUrl || editing?.avatar} alt="avatar preview" className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full" />
                        )}
                     </div>
                     <input
                        id="avatarFile"
                        type="file"
                        accept="image/*"
                        onChange={handleFile}
                        className="hidden"
                     />
                     <label
                        htmlFor="avatarFile"
                        className="inline-flex items-center px-3 py-1.5 bg-white border rounded text-sm cursor-pointer hover:bg-gray-50"
                     >
                        Choose file
                     </label>
                  </div>

                  <div>
                     <label className="text-sm text-gray-600 block mb-1">Supplier Name</label>
                     <input
                        name="name"
                        className="w-full px-3 py-2 border rounded bg-gray-50"
                        placeholder="e.g. ACME Supplies"
                        value={editing?.name || ''}
                        onChange={handleChange}
                        required
                     />
                  </div>
                  <div>
                     <label className="text-sm text-gray-600 block mb-1">Contact Person</label>
                     <input
                        name="contact"
                        className="w-full px-3 py-2 border rounded bg-gray-50"
                        placeholder="Name"
                        value={editing?.contact || ''}
                        onChange={handleChange}
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="text-sm text-gray-600 block mb-1">Phone</label>
                        <input
                           name="phone"
                           className="w-full px-3 py-2 border rounded bg-gray-50"
                           placeholder="+1 555-0000"
                           value={editing?.phone || ''}
                           onChange={handleChange}
                        />
                     </div>
                     <div>
                        <label className="text-sm text-gray-600 block mb-1">Email</label>
                        <input
                           name="email"
                           className="w-full px-3 py-2 border rounded bg-gray-50"
                           placeholder="email@example.com"
                           value={editing?.email || ''}
                           onChange={handleChange}
                        />
                     </div>
                  </div>
                  <div>
                     <label className="text-sm text-gray-600 block mb-1">Address</label>
                     <textarea
                        name="address"
                        className="w-full px-3 py-2 border rounded bg-gray-50"
                        rows={2}
                        placeholder="Supplier address"
                        value={editing?.address || ''}
                        onChange={handleChange}
                     />
                  </div>
                  <button
                     type="submit"
                     className="w-full px-4 py-2 rounded bg-orange-400 text-white text-sm mt-2"
                     disabled={!editing}
                  >
                     Save
                  </button>
               </form>
            </aside>
         </div>
      </div>
   )
}