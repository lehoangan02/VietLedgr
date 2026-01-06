"use client";
import React, { useMemo, useState } from "react";
import { Edit3, Trash2, Plus, Search, Globe } from "lucide-react";
import Sidebar from "@/components/SideBar";

type Brand = {
  id: string;
  name: string;
  logo: string;
  industry: string;
  supportEmail: string;
  website: string;
  status: "Active" | "Inactive";
};

// Initial data based on your public folder assets
const INITIAL_BRANDS: Brand[] = [
  { id: "1", name: "Acecook", logo: "/acecook.jpeg", industry: "Food & Beverage", supportEmail: "support@acecook.vn", website: "acecookvietnam.vn", status: "Active" },
  { id: "2", name: "Colgate-Palmolive", logo: "/Colgate-Palmolive.svg", industry: "Personal Care", supportEmail: "contact@colgate.com", website: "colgatepalmolive.com", status: "Active" },
  { id: "3", name: "Nestlé", logo: "/nestle.png", industry: "Consumer Goods", supportEmail: "info@nestle.com", website: "nestle.com", status: "Active" },
  { id: "4", name: "Unilever", logo: "/Unilever.svg", industry: "Consumer Goods", supportEmail: "support@unilever.com", website: "unilever.com", status: "Active" },
  { id: "5", name: "Hong Ha", logo: "/hongha.png", industry: "Stationery", supportEmail: "sales@hongha.com.vn", website: "hongha.vn", status: "Active" },
  { id: "6", name: "Kinh Do", logo: "/kinhdo.jpg", industry: "Bakery", supportEmail: "feedback@kinhdo.vn", website: "kinhdo.vn", status: "Active" },
  { id: "7", name: "Nissin", logo: "/Nissin_Logo.svg", industry: "Food", supportEmail: "help@nissin.com", website: "nissinfoods.com", status: "Active" },
  { id: "8", name: "Deli", logo: "/deli.jpeg", industry: "Stationery", supportEmail: "support@deliworld.com", website: "deliworld.com", status: "Active" },
  { id: "9", name: "Lock&Lock", logo: "/LOCK&LOCK.jpg", industry: "Houseware", supportEmail: "cs@locknlock.com", website: "locknlock.com", status: "Active" },
  { id: "10", name: "Orion", logo: "/orion.svg", industry: "Food", supportEmail: "orion@orion.vn", website: "orion.vn", status: "Active" },
];

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>(INITIAL_BRANDS);
  const [search, setSearch] = useState("");
  
  // Form State
  const [editing, setEditing] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);

  const filteredBrands = useMemo(() => {
    return brands.filter(b => 
      b.name.toLowerCase().includes(search.toLowerCase()) || 
      b.industry.toLowerCase().includes(search.toLowerCase())
    );
  }, [brands, search]);

  const handleNew = () => {
    setEditing({
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      logo: "/next.svg", // Default placeholder
      industry: "",
      supportEmail: "",
      website: "",
      status: "Active",
    });
  };

  const handleEdit = (brand: Brand) => {
    setEditing({ ...brand });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Remove this brand from support list?")) {
      setBrands(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    setSaving(true);
    // Simulate API delay
    setTimeout(() => {
      setBrands(prev => {
        const exists = prev.find(b => b.id === editing.id);
        if (exists) {
          return prev.map(b => b.id === editing.id ? editing : b);
        }
        return [editing, ...prev];
      });
      setSaving(false);
      setEditing(null);
    }, 500);
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto flex gap-6 min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Brand Support Directory</h1>
              <div className="text-sm text-gray-500">
                Manage partner brands and their contact information
              </div>
            </div>

            <button
              onClick={handleNew}
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-orange-400 text-white text-sm font-medium hover:bg-orange-500 transition-colors"
            >
              <Plus size={18} /> Add Brand
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Brands List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  placeholder="Search brands or industry..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-200"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 border-b">
                    <tr>
                      <th className="py-3 px-4 font-medium">Brand</th>
                      <th className="py-3 px-4 font-medium">Industry</th>
                      <th className="py-3 px-4 font-medium">Support Contact</th>
                      <th className="py-3 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredBrands.map((brand) => (
                      <tr key={brand.id} className="hover:bg-orange-50/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded border bg-white p-1 flex items-center justify-center">
                              <img src={brand.logo} alt={brand.name} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{brand.name}</div>
                              <div className="text-xs text-blue-500 flex items-center gap-1">
                                <Globe size={10} /> {brand.website}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <span className="px-2 py-1 rounded-full bg-gray-100 text-[11px] uppercase tracking-wider font-bold">
                            {brand.industry}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {brand.supportEmail}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEdit(brand)}
                              className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-gray-400 hover:text-orange-500 transition-all"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(brand.id)}
                              className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-gray-400 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit Sidebar */}
            <aside className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 h-fit sticky top-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                {editing ? "Update Brand Details" : "Brand Management"}
              </h2>

              {!editing ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="text-gray-300" size={32} />
                  </div>
                  <p className="text-sm text-gray-500">Select a brand to edit or add a new partner to the directory.</p>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSave}>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Brand Name</label>
                    <input
                      required
                      className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                      value={editing.name}
                      onChange={e => setEditing({...editing, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Industry</label>
                    <input
                      required
                      className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-orange-100"
                      value={editing.industry}
                      onChange={e => setEditing({...editing, industry: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Support Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-orange-100"
                      value={editing.supportEmail}
                      onChange={e => setEditing({...editing, supportEmail: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Website URL</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-orange-100"
                      value={editing.website}
                      onChange={e => setEditing({...editing, website: e.target.value})}
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-orange-400 text-white py-2 rounded-md text-sm font-medium hover:bg-orange-500 disabled:opacity-50 transition-colors"
                    >
                      {saving ? "Processing..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}