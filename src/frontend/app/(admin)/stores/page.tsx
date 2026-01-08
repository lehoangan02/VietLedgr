"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Edit3, Trash2, Plus } from "lucide-react";

type Store = {
   id: string;
   name: string;
   avatar?: string;
   phone?: string;
   email?: string;
   address?: string;
};

type ApiStore = {
   id: string;
   name: string;
   avatar_url?: string | null;
   phone?: string | null;
   email?: string | null;
   address?: string | null;
};

type ApiStoreCreate = {
   name: string;
   avatar_url?: string | null;
   phone?: string | null;
   email?: string | null;
   address?: string | null;
};

type ApiStoreUpdate = Partial<ApiStoreCreate>;

function toCreatePayload(s: Store, avatarUrl: string): ApiStoreCreate {
   return {
      name: s.name.trim(),
      // avatar_url: avatarUrl || s.avatar || null,
      phone: s.phone?.trim() || null,
      email: s.email?.trim() || null,
      address: s.address?.trim() || null,
   };
}

function toUpdatePayload(s: Store, avatarUrl: string): ApiStoreUpdate {
   return {
      name: s.name.trim(),
      avatar_url: avatarUrl || s.avatar || null,
      phone: s.phone?.trim() || null,
      email: s.email?.trim() || null,
      address: s.address?.trim() || null,
   };
}

async function apiCreateStore(payload: ApiStoreCreate) {
   const res = await fetch("http:/api/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
   });
   if (!res.ok) {
      let msg = `Create failed (${res.status})`;
      try {
         const j = await res.json();
         msg = j?.detail || j?.message || msg;
      } catch { }
      throw new Error(msg);
   }
   return (await res.json()) as ApiStore;
}

async function apiUpdateStore(id: string, payload: ApiStoreUpdate) {
   const res = await fetch(`/api/stores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
   });
   if (!res.ok) {
      let msg = `Update failed (${res.status})`;
      try {
         const j = await res.json();
         msg = j?.detail || j?.message || msg;
      } catch { }
      throw new Error(msg);
   }
   return (await res.json()) as ApiStore;
}

async function apiDeleteStore(id: string) {
   const res = await fetch(`/api/stores/${id}`, { method: "DELETE" });
   if (!res.ok) {
      let msg = `Delete failed (${res.status})`;
      try {
         const j = await res.json();
         msg = j?.detail || j?.message || msg;
      } catch { }
      throw new Error(msg);
   }
}

function mapStore(s: ApiStore): Store {
   return {
      id: s.id,
      name: s.name,
      avatar: s.avatar_url ?? undefined,
      phone: s.phone ?? undefined,
      email: s.email ?? undefined,
      address: s.address ?? undefined,
   };
}

export default function Page() {
   const [stores, setStores] = useState<Store[]>([]);
   const [page] = useState(1);
   const pageSize = 20;

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const [editing, setEditing] = useState<Store | null>(null);
   const [avatarUrl, setAvatarUrl] = useState<string>("");
   const [saving, setSaving] = useState(false);

   useEffect(() => {
      let alive = true;
      async function load() {
         try {
            setLoading(true);
            setError(null);
            const res = await fetch("/api/stores?skip=0&limit=100", {
               cache: "no-store",
            });
            if (!res.ok) throw new Error(`Failed to load stores (${res.status})`);
            const raw = await res.json();
            const arr: ApiStore[] = Array.isArray(raw) ? raw : raw?.items ?? [];
            const mapped = arr.map(mapStore);
            if (!alive) return;
            setStores(mapped);
         } catch (e: any) {
            if (!alive) return;
            setError(e?.message ?? "Failed to load stores");
         } finally {
            if (!alive) return;
            setLoading(false);
         }
      }
      load();
      return () => {
         alive = false;
      };
   }, []);

   const visible = useMemo(() => {
      const start = (page - 1) * pageSize;
      return stores.slice(start, start + pageSize);
   }, [stores, page]);

   function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      setEditing((cur) => (cur ? { ...cur, avatar: url } : cur));
   }

   function handleNew() {
      setEditing({
         id: "",
         name: "",
         avatar: "",
         phone: "",
         email: "",
         address: "",
      });
      setAvatarUrl("");
      setError(null);
   }

   function handleEdit(store: Store) {
      setEditing({ ...store });
      setAvatarUrl(store.avatar || "");
      setError(null);
   }

   function handleChange(
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
   ) {
      const { name, value } = e.target;
      setEditing((cur) => (cur ? { ...cur, [name]: value } : cur));
   }

   async function handleSave(e: React.FormEvent) {
      e.preventDefault();
      if (!editing) return;
      try {
         setSaving(true);
         setError(null);
         const isCreate = !editing.id;
         if (isCreate) {
            const createdApi = await apiCreateStore(
               toCreatePayload(editing, avatarUrl),
            );
            const created = mapStore(createdApi);
            setStores((prev) => [created, ...prev]);
            setEditing(null);
            setAvatarUrl("");
            return;
         }
         const updatedApi = await apiUpdateStore(
            editing.id,
            toUpdatePayload(editing, avatarUrl),
         );
         const updated = mapStore(updatedApi);
         setStores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
         setEditing(null);
         setAvatarUrl("");
      } catch (err: any) {
         setError(err?.message ?? "Save failed");
      } finally {
         setSaving(false);
      }
   }

   async function handleDeleteStore(id: string) {
      const ok = window.confirm("Delete this store?");
      if (!ok) return;
      try {
         setError(null);
         setSaving(true);
         await apiDeleteStore(id);
         setStores((prev) => prev.filter((s) => s.id !== id));
         setEditing((cur) => (cur?.id === id ? null : cur));
      } catch (err: any) {
         setError(err?.message ?? "Delete failed");
      } finally {
         setSaving(false);
      }
   }

   return (
      <div className="p-6">
         <div className="flex items-center justify-between mb-6">
            <div>
               <h1 className="text-2xl font-semibold">Stores</h1>
               <div className="text-sm text-gray-500">
                  Manage stores and their details
               </div>
               {loading && (
                  <div className="text-sm text-gray-400 mt-1">Loading…</div>
               )}
               {error && <div className="text-sm text-red-500 mt-1">{error}</div>}
            </div>
            <button
               onClick={handleNew}
               className="inline-flex items-center gap-2 px-3 py-2 rounded bg-orange-400 text-white text-sm hover:bg-orange-500"
            >
               <Plus size={16} /> New Store
            </button>
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-100 p-4">
               <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                     <thead>
                        <tr className="text-left text-gray-500 border-b">
                           <th className="py-2 pl-2 w-8">#</th>
                           <th className="py-2 w-44">Store Name</th>
                           <th className="py-2 w-28">Phone</th>
                           <th className="py-2 w-36">Email</th>
                           <th className="py-2 w-40">Address</th>
                           <th className="py-2 pr-2 w-20 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {visible.map((s, i) => (
                           <tr
                              key={s.id}
                              className="border-b last:border-b-0 hover:bg-gray-50"
                           >
                              <td className="py-2 pl-2 text-gray-600">{i + 1}</td>
                              <td className="py-2">
                                 <div className="flex items-center gap-2">
                                    {s.avatar ? (
                                       <img
                                          src={s.avatar}
                                          alt={s.name}
                                          className="w-8 h-8 rounded-full object-cover"
                                       />
                                    ) : (
                                       <div className="w-8 h-8 rounded-full bg-gray-200" />
                                    )}
                                    <span className="font-medium text-gray-800 truncate">
                                       {s.name}
                                    </span>
                                 </div>
                              </td>
                              <td className="py-2 text-gray-600 truncate">
                                 {s.phone ?? "-"}
                              </td>
                              <td className="py-2 pr-4 text-gray-600 truncate">
                                 {s.email ?? "-"}
                              </td>
                              <td className="py-2 text-gray-600 truncate">
                                 {s.address ?? "-"}
                              </td>
                              <td className="py-2 pr-2 text-right">
                                 <div className="inline-flex items-center gap-2">
                                    <button
                                       title="Edit"
                                       className="p-1 rounded hover:bg-gray-100"
                                       onClick={() => handleEdit(s)}
                                    >
                                       <Edit3 size={16} />
                                    </button>
                                    <button
                                       title="Delete"
                                       className="p-1 rounded hover:bg-gray-100 text-red-500"
                                       onClick={() => handleDeleteStore(s.id)}
                                       disabled={saving}
                                    >
                                       <Trash2 size={16} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                        {!loading && visible.length === 0 && (
                           <tr>
                              <td colSpan={7} className="py-6 text-center text-gray-500">
                                 No stores found
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
            <aside className="bg-white rounded-lg shadow border border-gray-100 p-4 flex flex-col gap-3">
               <h2 className="text-lg font-medium mb-2">Add / Edit Store</h2>
               {!editing ? (
                  <div className="text-sm text-gray-500">
                     Click <b>New Store</b> or the <b>Edit</b> icon to start.
                  </div>
               ) : (
                  <form className="space-y-3" onSubmit={handleSave}>
                     <div className="flex flex-col items-center gap-2 mb-2">
                        <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                           {avatarUrl || editing?.avatar ? (
                              <img
                                 src={avatarUrl || editing?.avatar}
                                 alt="avatar preview"
                                 className="w-full h-full object-cover"
                              />
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
                        <label className="text-sm text-gray-600 block mb-1">
                           Store Name
                        </label>
                        <input
                           name="name"
                           className="w-full px-3 py-2 border rounded bg-gray-50"
                           placeholder="e.g. Main Store"
                           value={editing?.name || ""}
                           onChange={handleChange}
                           required
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="text-sm text-gray-600 block mb-1">
                              Phone
                           </label>
                           <input
                              name="phone"
                              className="w-full px-3 py-2 border rounded bg-gray-50"
                              placeholder="+1 555-0000"
                              value={editing?.phone || ""}
                              onChange={handleChange}
                           />
                        </div>
                        <div>
                           <label className="text-sm text-gray-600 block mb-1">
                              Email
                           </label>
                           <input
                              name="email"
                              className="w-full px-3 py-2 border rounded bg-gray-50"
                              placeholder="email@example.com"
                              value={editing?.email || ""}
                              onChange={handleChange}
                           />
                        </div>
                     </div>
                     <div>
                        <label className="text-sm text-gray-600 block mb-1">
                           Address
                        </label>
                        <textarea
                           name="address"
                           className="w-full px-3 py-2 border rounded bg-gray-50"
                           rows={2}
                           placeholder="Store address"
                           value={editing?.address || ""}
                           onChange={handleChange}
                        />
                     </div>
                     <div className="flex gap-2">
                        <button
                           type="submit"
                           className="flex-1 px-4 py-2 rounded bg-orange-400 text-white text-sm"
                           disabled={saving}
                        >
                           {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                           type="button"
                           className="px-4 py-2 rounded border text-sm"
                           onClick={() => {
                              setEditing(null);
                              setAvatarUrl("");
                           }}
                           disabled={saving}
                        >
                           Cancel
                        </button>
                     </div>
                  </form>
               )}
            </aside>
         </div>
      </div>
   );
}
