"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Edit3, Trash2, Plus } from "lucide-react";

type Supplier = {
  id: string;
  name: string;
  avatar?: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
};

type ApiSupplier = {
  id: string;
  name: string;
  avatar_url?: string | null;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

type ApiSupplierCreate = {
  name: string;
  avatar_url?: string | null;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

type ApiSupplierUpdate = Partial<ApiSupplierCreate>;

function toCreatePayload(s: Supplier, avatarUrl: string): ApiSupplierCreate {
  return {
    name: s.name.trim(),
    avatar_url: avatarUrl || s.avatar || null,
    contact_name: s.contact?.trim() || null,
    phone: s.phone?.trim() || null,
    email: s.email?.trim() || null,
    address: s.address?.trim() || null,
  };
}

function toUpdatePayload(s: Supplier, avatarUrl: string): ApiSupplierUpdate {
  // send only editable fields (name required by many backends, but keep it here)
  return {
    name: s.name.trim(),
    avatar_url: avatarUrl || s.avatar || null,
    contact_name: s.contact?.trim() || null,
    phone: s.phone?.trim() || null,
    email: s.email?.trim() || null,
    address: s.address?.trim() || null,
  };
}

async function apiCreateSupplier(payload: ApiSupplierCreate) {
  const res = await fetch("/api/suppliers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = `Create failed (${res.status})`;
    try {
      const j = await res.json();
      msg = j?.detail || j?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return (await res.json()) as ApiSupplier;
}

async function apiUpdateSupplier(id: string, payload: ApiSupplierUpdate) {
  const res = await fetch(`/api/suppliers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = `Update failed (${res.status})`;
    try {
      const j = await res.json();
      msg = j?.detail || j?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return (await res.json()) as ApiSupplier;
}

async function apiDeleteSupplier(id: string) {
  const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
  if (!res.ok) {
    let msg = `Delete failed (${res.status})`;
    try {
      const j = await res.json();
      msg = j?.detail || j?.message || msg;
    } catch {}
    throw new Error(msg);
  }
}

function mapSupplier(s: ApiSupplier): Supplier {
  return {
    id: s.id,
    name: s.name,
    avatar: s.avatar_url ?? undefined,
    contact: s.contact_name ?? undefined,
    phone: s.phone ?? undefined,
    email: s.email ?? undefined,
    address: s.address ?? undefined,
  };
}

export default function Page() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [page] = useState(1);
  const pageSize = 20;

  // loading + error state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // saving state
  const [saving, setSaving] = useState(false);

  // Fetch suppliers from Next.js API route
  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/suppliers?skip=0&limit=100", {
          cache: "no-store",
        });
        if (!res.ok)
          throw new Error(`Failed to load suppliers (${res.status})`);

        // If your backend returns {items,total}, handle that too:
        const raw = await res.json();
        const arr: ApiSupplier[] = Array.isArray(raw)
          ? raw
          : (raw?.items ?? []);
        const mapped = arr.map(mapSupplier);

        if (!alive) return;
        setSuppliers(mapped);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Failed to load suppliers");
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
    return suppliers.slice(start, start + pageSize);
  }, [suppliers, page]);

  // handle file selection to preview avatar
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    setEditing((cur) => (cur ? { ...cur, avatar: url } : cur));
  }

  function handleNew() {
    setEditing({
      id: "", // empty => create mode
      name: "",
      avatar: "",
      contact: "",
      phone: "",
      email: "",
      address: "",
    });
    setAvatarUrl("");
    setError(null);
  }

  // handle edit button
  function handleEdit(supplier: Supplier) {
    setEditing({ ...supplier });
    setAvatarUrl(supplier.avatar || "");
    setError(null);
  }

  // handle input change
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setEditing((cur) => (cur ? { ...cur, [name]: value } : cur));
  }

  async function handleCreateSupplier(payload: ApiSupplierCreate) {
    const res = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // try to read backend detail
      let msg = `Create failed (${res.status})`;
      try {
        const j = await res.json();
        msg = j?.detail || j?.message || msg;
      } catch {}
      throw new Error(msg);
    }

    const created = (await res.json()) as ApiSupplier;
    return mapSupplier(created);
  }

  // handle save (POST for new)
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;

    try {
      setSaving(true);
      setError(null);

      const isCreate = !editing.id; // empty id => create

      if (isCreate) {
        const createdApi = await apiCreateSupplier(
          toCreatePayload(editing, avatarUrl),
        );
        const created = mapSupplier(createdApi);

        setSuppliers((prev) => [created, ...prev]);
        setEditing(null);
        setAvatarUrl("");
        return;
      }

      // UPDATE
      const updatedApi = await apiUpdateSupplier(
        editing.id,
        toUpdatePayload(editing, avatarUrl),
      );
      const updated = mapSupplier(updatedApi);

      setSuppliers((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s)),
      );
      setEditing(null);
      setAvatarUrl("");
    } catch (err: any) {
      setError(err?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }
  async function handleDeleteSupplier(id: string) {
    const ok = window.confirm("Delete this supplier?");
    if (!ok) return;

    try {
      setError(null);
      setSaving(true);

      await apiDeleteSupplier(id);

      setSuppliers((prev) => prev.filter((s) => s.id !== id));
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
          <h1 className="text-2xl font-semibold">Suppliers</h1>
          <div className="text-sm text-gray-500">
            Manage suppliers and their details
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
          <Plus size={16} /> New Supplier
        </button>
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
                      {s.contact ?? "-"}
                    </td>
                    <td className="py-2 text-gray-600 truncate">
                      {s.phone ?? "-"}
                    </td>
                    <td className="py-2 text-gray-600 truncate">
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
                          onClick={() => handleDeleteSupplier(s.id)}
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
                      No suppliers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="bg-white rounded-lg shadow border border-gray-100 p-4 flex flex-col gap-3">
          <h2 className="text-lg font-medium mb-2">Add / Edit Supplier</h2>

          {!editing ? (
            <div className="text-sm text-gray-500">
              Click <b>New Supplier</b> or the <b>Edit</b> icon to start.
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
                  Supplier Name
                </label>
                <input
                  name="name"
                  className="w-full px-3 py-2 border rounded bg-gray-50"
                  placeholder="e.g. ACME Supplies"
                  value={editing?.name || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Contact Person
                </label>
                <input
                  name="contact"
                  className="w-full px-3 py-2 border rounded bg-gray-50"
                  placeholder="Name"
                  value={editing?.contact || ""}
                  onChange={handleChange}
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
                  placeholder="Supplier address"
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
