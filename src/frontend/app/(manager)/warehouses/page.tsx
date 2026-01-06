"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Edit3, Trash2, Plus } from "lucide-react";

type Warehouse = {
   warehouse_id: string;
   name: string;
   location?: string;
   store_id?: string;
   created_at?: string;
   total_items?: number;
};

type ApiWarehouse = {
   warehouse_id: string;
   name: string;
   location?: string | null;
   store_id?: string | null;
   created_at?: string | null;
   total_items?: number | null;
};

type ApiWarehouseCreate = {
   name: string;
   location?: string | null;
   store_id?: string | null;
};

type ApiWarehouseUpdate = Partial<ApiWarehouseCreate>;

function toCreatePayload(w: Warehouse): ApiWarehouseCreate {
   return {
      name: w.name.trim(),
      location: w.location?.trim() || null,
      store_id: w.store_id || null,
   };
}

function toUpdatePayload(w: Warehouse): ApiWarehouseUpdate {
   return {
      name: w.name.trim(),
      location: w.location?.trim() || null,
      store_id: w.store_id || null,
   };
}

async function apiCreateWarehouse(payload: ApiWarehouseCreate) {
   const res = await fetch("/api/warehouses", {
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
   return (await res.json()) as ApiWarehouse;
}

async function apiUpdateWarehouse(id: string, payload: ApiWarehouseUpdate) {
   const res = await fetch(`/api/warehouses/${id}`, {
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
   return (await res.json()) as ApiWarehouse;
}

async function apiDeleteWarehouse(id: string) {
   const res = await fetch(`/api/warehouses/${id}`, { method: "DELETE" });
   if (!res.ok) {
      let msg = `Delete failed (${res.status})`;
      try {
         const j = await res.json();
         msg = j?.detail || j?.message || msg;
      } catch { }
      throw new Error(msg);
   }
}

function mapWarehouse(w: ApiWarehouse): Warehouse {
   return {
      warehouse_id: w.warehouse_id,
      name: w.name,
      location: w.location ?? undefined,
      store_id: w.store_id ?? undefined,
      created_at: w.created_at ?? undefined,
      total_items: w.total_items ?? 0,
   };
}

export default function Page() {
   const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
   const [page] = useState(1);
   const pageSize = 20;

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const [editing, setEditing] = useState<Warehouse | null>(null);
   const [saving, setSaving] = useState(false);

   useEffect(() => {
      let alive = true;
      async function load() {
         try {
            setLoading(true);
            setError(null);
            const res = await fetch("/api/warehouses?skip=0&limit=100", {
               cache: "no-store",
            });
            if (!res.ok) throw new Error(`Failed to load warehouses (${res.status})`);
            const raw = await res.json();
            const arr: ApiWarehouse[] = Array.isArray(raw) ? raw : raw?.items ?? [];
            const mapped = arr.map(mapWarehouse);
            if (!alive) return;
            setWarehouses(mapped);
         } catch (e: any) {
            if (!alive) return;
            setError(e?.message ?? "Failed to load warehouses");
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
      return warehouses.slice(start, start + pageSize);
   }, [warehouses, page]);

   function handleNew() {
      setEditing({
         warehouse_id: "",
         name: "",
         location: "",
         store_id: "",
         created_at: "",
         total_items: 0,
      });
      setError(null);
   }

   function handleEdit(warehouse: Warehouse) {
      setEditing({ ...warehouse });
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
         const isCreate = !editing.warehouse_id;
         if (isCreate) {
            const createdApi = await apiCreateWarehouse(toCreatePayload(editing));
            const created = mapWarehouse(createdApi);
            setWarehouses((prev) => [created, ...prev]);
            setEditing(null);
            return;
         }
         const updatedApi = await apiUpdateWarehouse(
            editing.warehouse_id,
            toUpdatePayload(editing),
         );
         const updated = mapWarehouse(updatedApi);
         setWarehouses((prev) => prev.map((w) => (w.warehouse_id === updated.warehouse_id ? updated : w)));
         setEditing(null);
      } catch (err: any) {
         setError(err?.message ?? "Save failed");
      } finally {
         setSaving(false);
      }
   }

   async function handleDeleteWarehouse(id: string) {
      const ok = window.confirm("Delete this warehouse?");
      if (!ok) return;
      try {
         setError(null);
         setSaving(true);
         await apiDeleteWarehouse(id);
         setWarehouses((prev) => prev.filter((w) => w.warehouse_id !== id));
         setEditing((cur) => (cur?.warehouse_id === id ? null : cur));
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
               <h1 className="text-2xl font-semibold">Warehouses</h1>
               <div className="text-sm text-gray-500">
                  Manage warehouses and their details
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
               <Plus size={16} /> New Warehouse
            </button>
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-100 p-4">
               <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                     <thead>
                        <tr className="text-left text-gray-500 border-b">
                           <th className="py-2 pl-2 w-8 px-8">#</th>
                           <th className="py-2 w-44">Warehouse Name</th>
                           <th className="py-2 w-36">Location</th>
                           <th className="py-2 w-36">Store ID</th>
                           <th className="py-2 w-36">Created At</th>
                           <th className="py-2 w-20">Total Items</th>
                           <th className="py-2 pr-2 w-20 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {visible.map((w, i) => (
                           <tr
                              key={w.warehouse_id}
                              className="border-b last:border-b-0 hover:bg-gray-50"
                           >
                              <td className="py-2 pl-2 text-gray-600">{i + 1}</td>
                              <td className="py-2 pr-4">
                                 <span className="font-medium text-gray-800 truncate">
                                    {w.name}
                                 </span>
                              </td>
                              <td className="py-2 pr-4 text-gray-600 truncate">{w.location ?? "-"}</td>
                              <td className="py-2 pr-4 text-gray-600 truncate">{w.store_id ?? "-"}</td>
                              <td className="py-2 pr-4 text-gray-600 truncate">{w.created_at ? new Date(w.created_at).toLocaleString() : "-"}</td>
                              <td className="py-2 pr-4 text-gray-600 truncate">{w.total_items ?? 0}</td>
                              <td className="py-2 pr-2 text-right">
                                 <div className="inline-flex items-center gap-2">
                                    <button
                                       title="Edit"
                                       className="p-1 rounded hover:bg-gray-100"
                                       onClick={() => handleEdit(w)}
                                    >
                                       <Edit3 size={16} />
                                    </button>
                                    <button
                                       title="Delete"
                                       className="p-1 rounded hover:bg-gray-100 text-red-500"
                                       onClick={() => handleDeleteWarehouse(w.warehouse_id)}
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
                                 No warehouses found
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
            <aside className="bg-white rounded-lg shadow border border-gray-100 p-4 flex flex-col gap-3">
               <h2 className="text-lg font-medium mb-2">Add / Edit Warehouse</h2>
               {!editing ? (
                  <div className="text-sm text-gray-500">
                     Click <b>New Warehouse</b> or the <b>Edit</b> icon to start.
                  </div>
               ) : (
                  <form className="space-y-3" onSubmit={handleSave}>
                     <div>
                        <label className="text-sm text-gray-600 block mb-1">
                           Warehouse Name
                        </label>
                        <input
                           name="name"
                           className="w-full px-3 py-2 border rounded bg-gray-50"
                           placeholder="e.g. Main Warehouse"
                           value={editing?.name || ""}
                           onChange={handleChange}
                           required
                        />
                     </div>
                     <div>
                        <label className="text-sm text-gray-600 block mb-1">
                           Location
                        </label>
                        <input
                           name="location"
                           className="w-full px-3 py-2 border rounded bg-gray-50"
                           placeholder="e.g. City Center"
                           value={editing?.location || ""}
                           onChange={handleChange}
                        />
                     </div>
                     <div>
                        <label className="text-sm text-gray-600 block mb-1">
                           Store ID
                        </label>
                        <input
                           name="store_id"
                           className="w-full px-3 py-2 border rounded bg-gray-50"
                           placeholder="Store ID"
                           value={editing?.store_id || ""}
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
